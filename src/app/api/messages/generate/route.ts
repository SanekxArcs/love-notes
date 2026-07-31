import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { mostSimilar } from "@/lib/text-similarity";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const MAX_EXAMPLES_IN_PROMPT = 15;

function buildPrompt(partnerInfo: string | undefined, existing: string[]): string {
  const lines = [
    "Напиши коротке, щире повідомлення кохання українською мовою (1-3 речення, до 500 символів).",
    "Це повідомлення для мого партнера/партнерки.",
  ];

  if (partnerInfo?.trim()) {
    lines.push(`Інформація про партнера: ${partnerInfo.trim()}`);
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

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        geminiApiKey,
        partnerInfo,
        "existingTexts": messages[].text
      }`,
      { userId: session.user.id }
    );

    const geminiApiKey: string | undefined = user?.geminiApiKey?.trim();

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Спочатку додайте Gemini API ключ у налаштуваннях профілю" },
        { status: 400 }
      );
    }

    // HTTP header values must be Latin1/ASCII — catches a corrupted/pasted-wrong key early
    // with a clear message instead of a raw fetch() crash.
    if (!/^[\x21-\x7e]+$/.test(geminiApiKey)) {
      return NextResponse.json(
        {
          error:
            "Gemini API ключ у профілі містить неприпустимі символи. Перевірте, чи скопійовано правильний ключ, і збережіть його знову.",
        },
        { status: 400 }
      );
    }

    const existingTexts: string[] = (user.existingTexts ?? []).filter(Boolean);
    const promptExamples = existingTexts.slice(-MAX_EXAMPLES_IN_PROMPT);
    const prompt = buildPrompt(user.partnerInfo, promptExamples);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1 },
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

    const { score, match } = mostSimilar(generatedText, existingTexts);
    const uniquenessScore = Math.round((1 - score) * 100);

    return NextResponse.json({
      text: generatedText,
      uniquenessScore,
      mostSimilarText: match,
    });
  } catch (error) {
    console.error("Error generating AI message:", error);
    return NextResponse.json(
      { error: "Не вдалося згенерувати повідомлення" },
      { status: 500 }
    );
  }
}
