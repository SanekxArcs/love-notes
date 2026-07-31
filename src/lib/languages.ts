export const SCAN_LANGUAGES = [
  { code: "uk", label: "Українська", englishName: "Ukrainian", tesseract: "ukr" },
  { code: "en", label: "English", englishName: "English", tesseract: "eng" },
  { code: "ru", label: "Русский", englishName: "Russian", tesseract: "rus" },
  { code: "pl", label: "Polski", englishName: "Polish", tesseract: "pol" },
  { code: "de", label: "Deutsch", englishName: "German", tesseract: "deu" },
  { code: "es", label: "Español", englishName: "Spanish", tesseract: "spa" },
  { code: "fr", label: "Français", englishName: "French", tesseract: "fra" },
] as const;

export type ScanLanguageCode = (typeof SCAN_LANGUAGES)[number]["code"];

export function getLanguage(code: string | null | undefined) {
  return SCAN_LANGUAGES.find((lang) => lang.code === code) ?? SCAN_LANGUAGES[0];
}
