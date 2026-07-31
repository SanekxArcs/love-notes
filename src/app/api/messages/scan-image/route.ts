import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GEMINI_MODEL, getValidatedGeminiApiKey } from "@/lib/gemini";
import { sanityClient } from "@/lib/sanity";
import { getLanguage } from "@/lib/languages";

interface ScanImageRequestBody {
  imageBase64: string;
  mimeType: string;
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

    const { imageBase64, mimeType } =
      (await request.json()) as ScanImageRequestBody;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Зображення є обов'язковим" },
        { status: 400 }
      );
    }

    const user = await sanityClient.fetch(
      `*[_type == "user" && _id == $userId][0]{ aiScanLanguage }`,
      { userId: session.user.id }
    );
    const targetLanguage = getLanguage(user?.aiScanLanguage);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Read all text visible in this image, regardless of what language it's written in. Then translate it into ${targetLanguage.englishName}. Return only the translated text — no commentary, no markdown formatting, no original-language text.`,
                },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json().catch(() => null);
      const message =
        errorBody?.error?.message || "Не вдалося розпізнати текст на зображенні";
      return NextResponse.json(
        { error: message },
        { status: geminiResponse.status === 429 ? 429 : 502 }
      );
    }

    const data = await geminiResponse.json();
    const extractedText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: "Не вдалося розпізнати текст на зображенні" },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error("Error scanning image:", error);
    return NextResponse.json(
      { error: "Не вдалося розпізнати текст на зображенні" },
      { status: 500 }
    );
  }
}
