/**
 * DOM-based text translation engine.
 *
 * Walks text nodes and replaces exact-match English strings with their
 * translated equivalents using a MutationObserver to handle dynamically
 * rendered content.
 *
 * Element attributes (placeholder / title / aria-label / aria-description)
 * are translated with the same exact-match dictionary so input hints,
 * tooltips, and screen-reader labels get covered too.
 */

/** Attributes translated with the same dictionary as text nodes. */
const TRANSLATED_ATTRS = [
  "placeholder",
  "title",
  "aria-label",
  "aria-description",
] as const;

/**
 * Keys prefixed with "~" are number patterns for dynamically composed text
 * (e.g. "~{n} run costs unavailable"), where "{n}" matches a number run.
 * They let template-literal strings like "162 run costs unavailable" — a
 * single text node that no exact key can match — still get translated.
 */
const PATTERN_PREFIX = "~";
const PATTERN_NUMBER = "{n}";
const NUMBER_SOURCE = "\\d[\\d.,]*";

interface CompiledPattern {
  re: RegExp;
  template: string;
}

function compilePatterns(dict: Record<string, string>): CompiledPattern[] {
  const patterns: CompiledPattern[] = [];
  for (const key of Object.keys(dict)) {
    if (!key.startsWith(PATTERN_PREFIX)) continue;
    const escaped = key
      .slice(PATTERN_PREFIX.length)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .split("\\{n\\}")
      .join("(" + NUMBER_SOURCE + ")");
    try {
      patterns.push({ re: new RegExp(`^${escaped}$`), template: dict[key] });
    } catch {
      // Invalid pattern — skip it rather than break the whole engine.
    }
  }
  return patterns;
}

function lookupTranslation(
  text: string,
  dict: Record<string, string>,
  patterns: CompiledPattern[]
): string | undefined {
  const exact = dict[text];
  if (exact !== undefined) return exact;
  // Patterns are only tried on short strings containing a number, so the
  // common exact-match path stays cheap.
  if (patterns.length > 0 && text.length <= 80 && /\d/.test(text)) {
    for (const { re, template } of patterns) {
      const match = text.match(re);
      if (match) {
        // Each {n} in the template consumes the next captured number group
        let g = 1;
        return template.replace(/\{n\}/g, () => match[g++] ?? match[0]);
      }
    }
  }
  return undefined;
}

function translateNode(
  node: Node,
  dict: Record<string, string>,
  patterns: CompiledPattern[]
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const original = node.textContent?.trim();
    if (original && node.textContent) {
      const translated = lookupTranslation(original, dict, patterns);
      if (translated !== undefined && translated !== original) {
        // Preserve surrounding whitespace while replacing the trimmed content
        node.textContent = node.textContent.replace(original, translated);
      }
    }
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    for (const attr of TRANSLATED_ATTRS) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const trimmed = value.trim();
      const translated = lookupTranslation(trimmed, dict, patterns);
      // Idempotent: once translated, the lookup misses and nothing is written
      if (translated === undefined || translated === trimmed) continue;
      el.setAttribute(attr, value.replace(trimmed, translated));
    }
  }
  Array.from(node.childNodes).forEach((child) => translateNode(child, dict, patterns));
}

/**
 * Starts the translation engine. Translates the current DOM immediately, then
 * watches for new nodes via MutationObserver.
 *
 * @returns A cleanup function that disconnects the observer.
 */
export function startTranslation(
  dict: Record<string, string>
): () => void {
  const patterns = compilePatterns(dict);

  // Translate existing DOM
  translateNode(document.body, dict, patterns);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        Array.from(mutation.addedNodes).forEach((node) => translateNode(node, dict, patterns));
      } else if (mutation.type === "attributes") {
        translateNode(mutation.target, dict, patterns);
      }
      // Note: characterData observation is intentionally omitted. React updates
      // text by replacing nodes (childList), not via direct characterData writes.
      // Watching characterData causes an infinite loop: our replacement fires a
      // new characterData mutation, React reconciles back to English, we fire
      // again — freezing the page on any live-updating view (e.g. Routines).
      //
      // Attribute observation is safe by the same reasoning: our own writes are
      // idempotent (the translated value misses the dictionary), so each React
      // re-render back to English triggers exactly one re-translation.
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [...TRANSLATED_ATTRS],
  });

  return () => observer.disconnect();
}
