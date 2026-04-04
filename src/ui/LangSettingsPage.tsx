import React, { useState } from "react";
import type { PluginSettingsPageProps } from "@paperclipai/plugin-sdk/ui";
import { getCurrentLocale, setCurrentLocale, LOCALES } from "./locales/registry.js";

/**
 * LangSettingsPage — mounted via the `settingsPage` plugin slot.
 *
 * Provides a richer language selection UI within the plugin settings.
 */
export function LangSettingsPage(_props: PluginSettingsPageProps) {
  const [selected, setSelected] = useState(getCurrentLocale);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setCurrentLocale(selected);
    setSaved(true);
    setTimeout(() => window.location.reload(), 500);
  };

  const isDirty = selected !== getCurrentLocale();

  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        Language Pack
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 24, fontSize: 14 }}>
        Select the display language for the Paperclip interface. The page will
        reload to apply the change.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {LOCALES.map((locale) => (
          <label
            key={locale.code}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 6,
              border: `1px solid ${selected === locale.code ? "var(--foreground)" : "var(--border)"}`,
              cursor: "pointer",
              background: selected === locale.code ? "var(--accent)" : "transparent",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <input
              type="radio"
              name="locale"
              value={locale.code}
              checked={selected === locale.code}
              onChange={() => setSelected(locale.code)}
              style={{ accentColor: "var(--foreground)" }}
            />
            <span style={{ fontSize: 20 }}>{locale.flag}</span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{locale.nativeName}</span>
              {locale.nativeName !== locale.englishName && (
                <span style={{ color: "var(--muted-foreground)", marginLeft: 8, fontSize: 13 }}>
                  {locale.englishName}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!isDirty || saved}
        style={{
          padding: "8px 20px",
          background: isDirty && !saved ? "var(--foreground)" : "var(--muted)",
          color: isDirty && !saved ? "var(--background)" : "var(--muted-foreground)",
          border: "none",
          borderRadius: 6,
          cursor: isDirty && !saved ? "pointer" : "not-allowed",
          fontSize: 14,
          fontWeight: 500,
          transition: "background 0.15s",
        }}
      >
        {saved ? "Saved — reloading..." : "Save & Reload"}
      </button>
    </div>
  );
}
