import { sanityClient } from "@/lib/sanity";

export const GEMINI_MODEL = "gemini-3.5-flash-lite";

type GeminiKeyResult =
  | { ok: true; apiKey: string }
  | { ok: false; error: string; status: number };

// HTTP header values must be Latin1/ASCII — validating here catches a
// corrupted/mis-pasted key early with a clear message instead of a
// raw fetch() ByteString crash later.
const HEADER_SAFE = /^[\x21-\x7e]+$/;

export async function getValidatedGeminiApiKey(
  userId: string
): Promise<GeminiKeyResult> {
  const user = await sanityClient.fetch(
    `*[_type == "user" && _id == $userId][0]{ geminiApiKey }`,
    { userId }
  );

  const apiKey: string | undefined = user?.geminiApiKey?.trim();

  if (!apiKey) {
    return {
      ok: false,
      error: "Спочатку додайте Gemini API ключ у налаштуваннях профілю",
      status: 400,
    };
  }

  if (!HEADER_SAFE.test(apiKey)) {
    return {
      ok: false,
      error:
        "Gemini API ключ у профілі містить неприпустимі символи. Перевірте, чи скопійовано правильний ключ, і збережіть його знову.",
      status: 400,
    };
  }

  return { ok: true, apiKey };
}
