import React, { useEffect, useRef } from "react";
import { getCurrentLocale, setCurrentLocale, LOCALES } from "./locales/registry.js";
import { LOCALE_DICTS } from "./translations.js";
import { startTranslation } from "./domTranslator.js";

/**
 * LangSwitcher — mounted via the `globalToolbarButton` plugin slot.
 *
 * Renders a language selector in the global toolbar and simultaneously
 * activates DOM-based text translation for the selected locale.
 * Returning to "en" reloads the page to restore original English text.
 */
export function LangSwitcher() {
  const currentLocale = getCurrentLocale();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const dict = LOCALE_DICTS[currentLocale];
    if (!dict) return; // "en" or unknown locale — no translation needed

    cleanupRef.current = startTranslation(dict);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [currentLocale]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCurrentLocale(next);
    // Reload to cleanly apply or remove translations
    window.location.reload();
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      title="Select display language"
      aria-label="Display language"
      style={{
        fontSize: 13,
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "2px 8px",
        cursor: "pointer",
        color: "var(--foreground)",
        outline: "none",
      }}
    >
      {LOCALES.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.flag} {locale.nativeName}
        </option>
      ))}
    </select>
  );
}
