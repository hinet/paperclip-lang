export interface LocaleEntry {
  /** BCP 47 language tag, e.g. "zh-CN" */
  code: string;
  /** Native display name, e.g. "中文（简体）" */
  nativeName: string;
  /** English display name, e.g. "Chinese (Simplified)" */
  englishName: string;
  /** Emoji flag for visual identification */
  flag: string;
}

/**
 * Registry of all supported languages.
 *
 * To add a new language:
 * 1. Add an entry here
 * 2. Create a matching locale file at `./locales/<code>.ts`
 * 3. Import and register it in `../translations.ts`
 */
export const LOCALES: LocaleEntry[] = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    flag: "🇺🇸",
  },
  {
    code: "zh-CN",
    nativeName: "中文(简体)",
    englishName: "Chinese (Simplified)",
    flag: "🇨🇳",
  },
  // Future languages — uncomment and add a matching locale file:
  // { code: "ja", nativeName: "日本語", englishName: "Japanese", flag: "🇯🇵" },
  // { code: "ko", nativeName: "한국어", englishName: "Korean", flag: "🇰🇷" },
  // { code: "de", nativeName: "Deutsch", englishName: "German", flag: "🇩🇪" },
  // { code: "fr", nativeName: "Français", englishName: "French", flag: "🇫🇷" },
];

export const DEFAULT_LOCALE = "en";
export const STORAGE_KEY = "paperclip.lang.locale";

export function getCurrentLocale(): string {
  if (typeof localStorage === "undefined") return DEFAULT_LOCALE;
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE;
}

export function setCurrentLocale(code: string): void {
  localStorage.setItem(STORAGE_KEY, code);
}
