import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";

const MIN_NOTES_PER_SIDE = 3;

interface NoteForPrompt {
  title: string;
  description: string;
  tags?: string[];
}

interface CompatibilityAnalysis {
  text: string;
  generatedAt: string;
  ownNotesCount: number;
  partnerNotesCount: number;
}

function formatNotes(notes: NoteForPrompt[]): string {
  return notes
    .map((note) => {
      const tags = note.tags?.length ? ` (теги: ${note.tags.join(", ")})` : "";
      return `### ${note.title}${tags}\n${note.description}`;
    })
    .join("\n\n");
}

function buildPrompt(
  userName: string,
  partnerName: string,
  ownNotes: NoteForPrompt[],
  partnerNotesAboutUser: NoteForPrompt[]
): string {
  return [
    "Ти — уважний і чуйний аналітик стосунків. Проаналізуй сумісність пари на основі нотаток нижче.",
    `Перший набір — нотатки, які ${userName} веде про свого партнера ${partnerName} (уподобання, звички, важливі деталі про ${partnerName}).`,
    `Другий набір — нотатки, які ${partnerName} веде про ${userName} (це погляд ${partnerName} на ${userName}, а не опис самого(-єї) ${partnerName}), і які ${partnerName} вирішив(-ла) показати ${userName}.`,
    "Розглянь обидва набори як опис двох реальних людей — перший описує партнера, другий описує самого користувача — і дай глибокий, конкретний, доброзичливий розбір сумісності.",
    "Обов'язково включи розділи (кожен з нового рядка, без markdown-розмітки на кшталт ** чи #):",
    "1) Спільні інтереси та цінності — що вже добре поєднує пару.",
    "2) Що доповнює одне одного — відмінності, які можуть бути сильною стороною пари.",
    "3) На що варто звернути увагу — потенційні розбіжності, нестикування чи теми для обговорення (без драматизації, конструктивно).",
    "4) Практичні поради — 3-5 конкретних кроків, які допоможуть зміцнити стосунки, спираючись саме на ці нотатки.",
    "Починай кожен розділ саме з його номера та назви. Практичні кроки позначай маркером •, а не додатковою нумерацією.",
    "Пиши українською, тепло, конкретно, спираючись на факти з нотаток, а не загальними фразами.",
    "",
    `Нотатки ${userName} про ${partnerName}:`,
    formatNotes(ownNotes),
    "",
    `Нотатки ${partnerName} про ${userName} (показані ${userName}):`,
    formatNotes(partnerNotesAboutUser),
  ].join("\n");
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const analysis = await sanityClient.fetch<CompatibilityAnalysis | null>(
      `*[_type == "user" && _id == $userId][0].compatibilityAnalysis{
        text,
        generatedAt,
        ownNotesCount,
        partnerNotesCount
      }`,
      { userId: session.user.id },
    );

    return NextResponse.json(
      { analysis: analysis ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error fetching compatibility analysis:", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити аналіз сумісності" },
      { status: 500 },
    );
  }
}

export async function POST() {
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

    const partnerId = session.user.partnerIdToReceiveFrom;
    if (!partnerId) {
      return NextResponse.json(
        { error: "Спочатку зв'яжіться з партнером у профілі" },
        { status: 400 }
      );
    }

    const [me, partner] = await Promise.all([
      sanityClient.fetch(
        `*[_type == "user" && _id == $userId][0]{
          name,
          "notes": partnerNotes[]{ title, description, tags }
        }`,
        { userId: session.user.id }
      ),
      sanityClient.fetch(
        `*[_type == "user" && partnerIdToSend == $partnerId][0]{
          name,
          "notes": partnerNotes[isShared == true]{ title, description, tags }
        }`,
        { partnerId }
      ),
    ]);

    const ownNotes: NoteForPrompt[] = me?.notes ?? [];
    const partnerNotesAboutUser: NoteForPrompt[] = partner?.notes ?? [];

    if (!partner) {
      return NextResponse.json(
        { error: "Партнер ще не приєднався у відповідь. Попросіть партнера додати ваш код у профілі" },
        { status: 400 }
      );
    }

    if (
      ownNotes.length < MIN_NOTES_PER_SIDE ||
      partnerNotesAboutUser.length < MIN_NOTES_PER_SIDE
    ) {
      return NextResponse.json(
        {
          error: `Для аналізу потрібно щонайменше ${MIN_NOTES_PER_SIDE} нотатки з кожного боку: у вас ${ownNotes.length}, партнер поділився ${partnerNotesAboutUser.length}`,
        },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(
      me?.name || "Я",
      partner.name || "партнер",
      ownNotes,
      partnerNotesAboutUser
    );

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json().catch(() => null);
      const message =
        errorBody?.error?.message || "Не вдалося виконати аналіз сумісності";
      return NextResponse.json(
        { error: message },
        { status: geminiResponse.status === 429 ? 429 : 502 }
      );
    }

    const data = await geminiResponse.json();
    const analysisText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!analysisText) {
      return NextResponse.json(
        { error: "AI не повернув результат аналізу" },
        { status: 502 }
      );
    }

    const analysis: CompatibilityAnalysis = {
      text: analysisText,
      generatedAt: new Date().toISOString(),
      ownNotesCount: ownNotes.length,
      partnerNotesCount: partnerNotesAboutUser.length,
    };

    await sanityClient
      .patch(session.user.id)
      .set({ compatibilityAnalysis: analysis })
      .commit();

    return NextResponse.json({ analysis, ...analysis });
  } catch (error) {
    console.error("Error running compatibility match analysis:", error);
    return NextResponse.json(
      { error: "Не вдалося виконати аналіз сумісності" },
      { status: 500 }
    );
  }
}
