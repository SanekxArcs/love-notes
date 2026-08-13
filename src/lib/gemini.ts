import { sanityClient } from "@/lib/sanity";
import { getConnectedPartner } from "@/lib/user-access";

export const GEMINI_MODEL = "gemini-3.5-flash-lite";

type GeminiKeyResult =
  | { ok: true; apiKey: string; source: "own" | "partner" }
  | { ok: false; error: string; status: number };

// HTTP header values must be Latin1/ASCII — validating here catches a
// corrupted/mis-pasted key early with a clear message instead of a
// raw fetch() ByteString crash later.
const HEADER_SAFE = /^[\x21-\x7e]+$/;

export async function getValidatedGeminiApiKey(
  userId: string
): Promise<GeminiKeyResult> {
  const user = await sanityClient.fetch(
    `*[_type == "user" && _id == $userId][0]{
      geminiApiKey
    }`,
    { userId }
  );

  const ownApiKey: string | undefined = user?.geminiApiKey?.trim();
  const ownKeyIsValid = Boolean(ownApiKey && HEADER_SAFE.test(ownApiKey));
  const { partner: connectedPartner } = ownKeyIsValid
    ? { partner: null }
    : await getConnectedPartner(userId);
  const partner = !ownKeyIsValid && connectedPartner
    ? await sanityClient.fetch(
        `*[_type == "user" && _id == $partnerId][0]{ geminiApiKey }`,
        { partnerId: connectedPartner._id }
      )
    : null;
  const partnerApiKey: string | undefined = partner?.geminiApiKey?.trim();
  const partnerKeyIsValid = Boolean(
    partnerApiKey && HEADER_SAFE.test(partnerApiKey),
  );
  const apiKey = ownKeyIsValid
    ? ownApiKey
    : partnerKeyIsValid
      ? partnerApiKey
      : undefined;
  const source = ownKeyIsValid ? "own" : "partner";

  if (!apiKey) {
    return {
      ok: false,
      error:
        "Додайте Gemini API ключ у своєму профілі або попросіть підключеного партнера додати його",
      status: 400,
    };
  }

  if ((ownApiKey || partnerApiKey) && !apiKey) {
    return {
      ok: false,
      error:
        "Gemini API ключ містить неприпустимі символи. Перевірте, чи скопійовано правильний ключ, і збережіть його знову.",
      status: 400,
    };
  }

  return { ok: true, apiKey, source };
}
