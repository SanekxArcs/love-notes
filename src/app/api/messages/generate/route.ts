import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sanityClient } from "@/lib/sanity";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";

const MAX_EXAMPLES_IN_PROMPT = 15;
const MAX_USER_PROMPT_LENGTH = 500;

function buildPrompt(
  partnerInfo: string | undefined,
  existing: string[],
  userPrompt: string | undefined
): string {
  const lines = [
    "Напиши коротке, щире повідомлення кохання українською мовою (1-3 речення, до 500 символів).",
    "Це повідомлення для мого партнера/партнерки.",
  ];

  if (partnerInfo?.trim()) {
    lines.push(`Інформація про партнера: ${partnerInfo.trim()}`);
  }

  if (userPrompt?.trim()) {
    lines.push(
      `Ось що я хочу передати партнеру своїми словами: "${userPrompt.trim()}". Розкрий цю думку у повідомленні.`
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

export async function POST(request: NextRequest) {
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
        "existingTexts": messages[].text
      }`,
      { userId: session.user.id }
    );

    const existingTexts: string[] = (user?.existingTexts ?? []).filter(Boolean);
    const promptExamples = existingTexts.slice(-MAX_EXAMPLES_IN_PROMPT);
    const prompt = buildPrompt(user?.partnerInfo, promptExamples, userPrompt);

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

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("Error generating AI message:", error);
    return NextResponse.json(
      { error: "Не вдалося згенерувати повідомлення" },
      { status: 500 }
    );
  }
}
