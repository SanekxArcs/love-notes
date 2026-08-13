import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";
import { sanityClient } from "@/lib/sanity";
import { getConnectedPartner } from "@/lib/user-access";

interface TopicSourceNote {
  title?: string;
  tags?: string[];
}

interface AiTopicGap {
  area: string;
  reason: string;
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

function parseGaps(raw: string): AiTopicGap[] | null {
  const json = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const value = JSON.parse(json);
    if (!Array.isArray(value?.gaps)) return null;

    const gaps = value.gaps.flatMap((gap: unknown) => {
      if (!gap || typeof gap !== "object") return [];
      const candidate = gap as Record<string, unknown>;
      const area = typeof candidate.area === "string" ? candidate.area.trim() : "";
      const reason =
        typeof candidate.reason === "string" ? candidate.reason.trim() : "";
      const title =
        typeof candidate.title === "string" ? candidate.title.trim() : "";
      const question =
        typeof candidate.question === "string" ? candidate.question.trim() : "";
      const tags = Array.isArray(candidate.tags)
        ? candidate.tags
            .filter((tag): tag is string => typeof tag === "string")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [];

      if (!area || !reason || !title || !question) return [];
      return [{
        area: area.slice(0, 50),
        reason: reason.slice(0, 160),
        title: title.slice(0, 80),
        question: question.slice(0, 240),
        tags: tags.map((tag) => tag.slice(0, 30)),
      }];
    });

    return gaps.length >= 3 ? gaps.slice(0, 3) : null;
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

    const me = await sanityClient.fetch<{ notes?: TopicSourceNote[] } | null>(
      `*[_type == "user" && _id == $userId][0]{
        "notes": partnerNotes[!defined(perspective) || perspective == "partner"]{ title, tags }
      }`,
      { userId: session.user.id },
    );

    const { partner: connectedPartner } = await getConnectedPartner(session.user.id);
    const partner = connectedPartner
      ? await sanityClient.fetch<{ notes?: TopicSourceNote[] } | null>(
          `*[_type == "user" && _id == $partnerId][0]{
            "notes": partnerNotes[isShared == true && (!defined(perspective) || perspective == "partner")]{ title, tags }
          }`,
          { partnerId: connectedPartner._id },
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
      "Ти допомагаєш людині доповнювати її нотатки ПРО ПАРТНЕРА.",
      "На основі ЛИШЕ назв і тегів нижче знайди 3 різні прогалини у знаннях про партнера та запропонуй для кожної нову, конкретну й не дубльовану тему нотатки.",
      "Питання завжди адресуй користувачу про його партнера: наприклад «Що допомагає твоєму партнеру відновитися після важкого дня?». Не питай користувача про нього самого.",
      "Не вигадуй фактів, не проси текст відповіді й не роби висновків про зміст існуючих нотаток.",
      "Поверни лише JSON без markdown:",
      '{"gaps":[{"area":"напрямок, наприклад Побут","reason":"чому ця тема доповнить наявні назви й теги","title":"коротка тема","question":"одне тепле конкретне питання українською?","tags":["до 3 коротких тегів"]}]}',
      "У масиві має бути рівно 3 обʼєкти з різними напрямками. Не повторюй назви чи питання зі списку виключень.",
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
    const gaps = text ? parseGaps(text) : null;
    if (!gaps) {
      return NextResponse.json(
        { error: "AI повернув прогалини в неочікуваному форматі. Спробуйте ще раз." },
        { status: 502 },
      );
    }

    return NextResponse.json({ gaps });
  } catch (error) {
    console.error("Error suggesting note topic:", error);
    return NextResponse.json(
      { error: "Не вдалося запропонувати нову тему" },
      { status: 500 },
    );
  }
}
