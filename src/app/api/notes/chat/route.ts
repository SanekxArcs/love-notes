import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";

const MAX_HISTORY_TURNS = 20;

interface ChatTurn {
  role: "user" | "model";
  text: string;
}

interface PartnerNote {
  title: string;
  description: string;
  tags?: string[];
}

function buildSystemInstruction(notes: PartnerNote[]): string {
  const lines = [
    "Ти — дружній помічник, який допомагає людині краще дбати про свого партнера.",
    "Нижче наведені приватні нотатки користувача про партнера (уподобання, деталі, важливі речі).",
    "Використовуй їх, щоб швидко та конкретно підказувати ідеї (подарунки, побачення, сюрпризи) або відповідати на питання про партнера.",
    "Відповідай українською, коротко і по суті.",
  ];

  if (notes.length === 0) {
    lines.push("Нотаток поки немає — попроси користувача спершу додати кілька нотаток про партнера.");
  } else {
    lines.push("Нотатки:");
    for (const note of notes) {
      const tags = note.tags?.length ? ` (теги: ${note.tags.join(", ")})` : "";
      lines.push(`### ${note.title}${tags}\n${note.description}`);
    }
  }

  return lines.join("\n\n");
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const keyResult = await getValidatedGeminiApiKey(session.user.id);
    if (!keyResult.ok) {
      return NextResponse.json(
        { error: keyResult.error },
        { status: keyResult.status }
      );
    }
    const { apiKey } = keyResult;

    const { history }: { history: ChatTurn[] } = await request.json();

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "Chat history is required" },
        { status: 400 }
      );
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        "notes": partnerNotes[]{ title, description, tags }
      }`,
      { userId: session.user.id }
    );

    const notes: PartnerNote[] = user?.notes ?? [];
    const systemInstruction = buildSystemInstruction(notes);

    const contents = history
      .slice(-MAX_HISTORY_TURNS)
      .map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      }));

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.8 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json().catch(() => null);
      const message =
        errorBody?.error?.message || "Не вдалося отримати відповідь від AI";
      return NextResponse.json(
        { error: message },
        { status: geminiResponse.status === 429 ? 429 : 502 }
      );
    }

    const data = await geminiResponse.json();
    const replyText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!replyText) {
      return NextResponse.json(
        { error: "AI не повернув відповідь" },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: replyText });
  } catch (error) {
    console.error("Error in AI notes chat:", error);
    return NextResponse.json(
      { error: "Не вдалося отримати відповідь від AI" },
      { status: 500 }
    );
  }
}
