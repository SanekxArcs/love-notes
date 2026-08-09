import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";
import { sanityClient } from "@/lib/sanity";

interface TopicSourceNote {
  title?: string;
  tags?: string[];
}

interface AiTopic {
  title: string;
  question: string;
  tags: string[];
}

function topicSnapshot(notes: TopicSourceNote[]) {
  return notes.map((note) => ({
    title: note.title?.trim() || "Без назви",
    tags: (note.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
  }));
}

function parseTopic(raw: string): AiTopic | null {
  const json = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const value = JSON.parse(json);
    const title = typeof value?.title === "string" ? value.title.trim() : "";
    const question =
      typeof value?.question === "string" ? value.question.trim() : "";
    const tags = Array.isArray(value?.tags)
      ? value.tags
          .filter((tag: unknown): tag is string => typeof tag === "string")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];

    if (!title || !question) return null;
    return {
      title: title.slice(0, 80),
      question: question.slice(0, 240),
      tags: tags.map((tag: string) => tag.slice(0, 30)),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const keyResult = await getValidatedGeminiApiKey(session.user.id);
    if (!keyResult.ok) {
      return NextResponse.json(
        { error: keyResult.error },
        { status: keyResult.status },
      );
    }

    const body = await request.json().catch(() => ({}));
    const excluded = Array.isArray(body?.excluded)
      ? body.excluded
          .filter((item: unknown): item is string => typeof item === "string")
          .map((item: string) => item.trim().slice(0, 120))
          .filter(Boolean)
          .slice(-12)
      : [];

    const me = await sanityClient.fetch<{
      partnerIdToReceiveFrom?: string;
      notes?: TopicSourceNote[];
    } | null>(
      `*[_type == "user" && _id == $userId][0]{
        partnerIdToReceiveFrom,
        "notes": partnerNotes[]{ title, tags }
      }`,
      { userId: session.user.id },
    );

    const partnerId = me?.partnerIdToReceiveFrom?.trim();
    const partner = partnerId
      ? await sanityClient.fetch<{ notes?: TopicSourceNote[] } | null>(
          `*[_type == "user" && partnerIdToSend == $partnerId][0]{
            "notes": partnerNotes[isShared == true]{ title, tags }
          }`,
          { partnerId },
        )
      : null;

    const topics = [
      ...topicSnapshot(me?.notes ?? []),
      ...topicSnapshot(partner?.notes ?? []),
    ];
    if (topics.length === 0) {
      return NextResponse.json(
        { error: "Додайте хоча б одну нотатку, щоб AI міг запропонувати нову тему" },
        { status: 400 },
      );
    }

    const prompt = [
      "Ти допомагаєш парі доповнювати нотатки про одне одного.",
      "На основі ЛИШЕ назв і тегів нижче запропонуй одну нову, конкретну й не дубльовану тему для нотатки.",
      "Не вигадуй фактів і не проси текст відповіді. Поверни лише JSON без markdown:",
      '{"title":"коротка тема","question":"одне тепле конкретне питання українською?","tags":["до 3 коротких тегів"]}',
      "Не повторюй назви чи питання зі списку виключень.",
      "Наявні теми (це метадані, не відповіді):",
      JSON.stringify(topics),
      "Виключення:",
      JSON.stringify(excluded),
    ].join("\n");

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": keyResult.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json().catch(() => null);
      return NextResponse.json(
        { error: errorBody?.error?.message || "Не вдалося отримати тему від AI" },
        { status: geminiResponse.status === 429 ? 429 : 502 },
      );
    }

    const data = await geminiResponse.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const topic = text ? parseTopic(text) : null;
    if (!topic) {
      return NextResponse.json(
        { error: "AI повернув тему в неочікуваному форматі. Спробуйте ще раз." },
        { status: 502 },
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Error suggesting note topic:", error);
    return NextResponse.json(
      { error: "Не вдалося запропонувати нову тему" },
      { status: 500 },
    );
  }
}
