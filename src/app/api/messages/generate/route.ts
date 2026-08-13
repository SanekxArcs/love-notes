import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { guardRequest } from "@/lib/request-guard";
import { sanityClient } from "@/lib/sanity";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";

const MAX_EXAMPLES_IN_PROMPT = 15;
const MAX_USER_PROMPT_LENGTH = 500;

type MessageLength = "short" | "medium" | "long";

interface PartnerNoteForPrompt {
  title?: string;
  description?: string;
  tags?: string[];
}

const lengthInstructions: Record<MessageLength, string> = {
  short:
    "Довжина: рівно одне лаконічне, природне речення. Не додавай друге речення.",
  medium:
    "Довжина: 2–3 змістовні речення, які читаються як одне цілісне повідомлення.",
  long:
    "Довжина і форма вільні: самостійно обери природний обсяг і структуру. Можеш несподівано варіювати стиль, ритм та детальність, але не додавай зайвих загальних фраз.",
};

function formatPartnerNotes(notes: PartnerNoteForPrompt[]): string[] {
  return notes.map((note) => {
    const title = note.title?.trim() || "Без назви";
    const tags = note.tags?.length ? ` [${note.tags.join(", ")}]` : "";
    return `- ${title}${tags}: ${note.description?.trim() || "—"}`;
  });
}

function buildPrompt(
  partnerInfo: string | undefined,
  partnerNotes: PartnerNoteForPrompt[],
  existing: string[],
  userPrompt: string | undefined,
  includePartnerNotes: boolean,
  length: MessageLength,
): string {
  const lines = [
    "Напиши щире особисте повідомлення кохання українською мовою.",
    "Це повідомлення для мого партнера/партнерки.",
    lengthInstructions[length],
  ];

  if (partnerInfo?.trim()) {
    lines.push(`Інформація про партнера: ${partnerInfo.trim()}`);
  }

  if (userPrompt?.trim()) {
    lines.push(
      `Ось що я хочу передати партнеру своїми словами: "${userPrompt.trim()}". Розкрий цю думку у повідомленні.`
    );
  }

  if (includePartnerNotes && partnerNotes.length > 0) {
    lines.push(
      "Нижче наведені всі мої нотатки про партнера. Обери одну або дві доречні, бажано неочевидні деталі та природно вплети їх у повідомлення. Не перераховуй усі факти й не згадуй, що бачиш нотатки:",
      ...formatPartnerNotes(partnerNotes),
    );
  } else if (includePartnerNotes) {
    lines.push(
      "Нотаток про партнера ще немає, тому створи особисте повідомлення з доступного контексту.",
    );
  } else {
    lines.push(
      "Не використовуй структуровані нотатки про партнера для цього варіанта. Зроби повідомлення свіжим завдяки формулюванню та емоції.",
    );
  }

  if (existing.length > 0) {
    lines.push(
      "Не повторюй ці вже надіслані повідомлення, зроби нове максимально відмінним за змістом та формулюванням:",
      ...existing.map((text) => `- ${text}`)
    );
  }

  lines.push("Поверни лише текст повідомлення, без лапок і пояснень.");
  return lines.join("\n");
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const rejected = await guardRequest(request, {
    scope: "ai",
    limit: 20,
    windowMs: 10 * 60 * 1000,
    checkBot: true,
  });
  if (rejected) return rejected;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userPrompt: string | undefined =
      typeof body?.prompt === "string"
        ? body.prompt.trim().slice(0, MAX_USER_PROMPT_LENGTH)
        : undefined;
    const includePartnerNotes = body?.includePartnerNotes === true;
    const length: MessageLength = ["short", "medium", "long"].includes(
      body?.length,
    )
      ? body.length
      : "medium";

    const keyResult = await getValidatedGeminiApiKey(session.user.id);
    if (!keyResult.ok) {
      return NextResponse.json(
        { error: keyResult.error },
        { status: keyResult.status }
      );
    }
    const { apiKey } = keyResult;

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        partnerInfo,
        "partnerNotes": partnerNotes[]{ title, description, tags },
        "existingTexts": messages[].text
      }`,
      { userId: session.user.id }
    );

    const existingTexts: string[] = (user?.existingTexts ?? []).filter(Boolean);
    const promptExamples = existingTexts.slice(-MAX_EXAMPLES_IN_PROMPT);
    const partnerNotes: PartnerNoteForPrompt[] = user?.partnerNotes ?? [];
    const prompt = buildPrompt(
      user?.partnerInfo,
      partnerNotes,
      promptExamples,
      userPrompt,
      includePartnerNotes,
      length,
    );

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        signal: AbortSignal.timeout(25_000),
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: length === "long" ? 1.15 : 1 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json().catch(() => null);
      const message =
        errorBody?.error?.message || "Не вдалося згенерувати повідомлення";
      return NextResponse.json(
        { error: message },
        { status: geminiResponse.status === 429 ? 429 : 502 }
      );
    }

    const data = await geminiResponse.json();
    const generatedText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedText) {
      return NextResponse.json(
        { error: "Gemini не повернув текст повідомлення" },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("Error generating AI message:", error);
    return NextResponse.json(
      { error: "Не вдалося згенерувати повідомлення" },
      { status: 500 }
    );
  }
}
