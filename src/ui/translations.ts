import { zhCN } from "./locales/zh-CN.js";
import { ja } from "./locales/ja.js";
import { ko } from "./locales/ko.js";
import { de } from "./locales/de.js";
import { fr } from "./locales/fr.js";

/**
 * Maps locale codes to their translation dictionaries.
 *
 * To add a new language:
 * 1. Create `./locales/<code>.ts` exporting a `Record<string, string>`
 * 2. Import it here and add an entry below
 */
export const LOCALE_DICTS: Record<string, Record<string, string>> = {
  "zh-CN": zhCN,
  "ja": ja,
  "ko": ko,
  "de": de,
  "fr": fr,
};
