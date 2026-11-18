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

function translateNode(node: Node, dict: Record<string, string>): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const original = node.textContent?.trim();
    if (original && dict[original] !== undefined && node.textContent) {
      // Preserve surrounding whitespace while replacing the trimmed content
      node.textContent = node.textContent.replace(original, dict[original]);
    }
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    for (const attr of TRANSLATED_ATTRS) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const trimmed = value.trim();
      const translated = dict[trimmed];
      // Idempotent: once translated, the lookup misses and nothing is written
      if (translated === undefined || translated === trimmed) continue;
      el.setAttribute(attr, value.replace(trimmed, translated));
    }
  }
  Array.from(node.childNodes).forEach((child) => translateNode(child, dict));
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
  // Translate existing DOM
  translateNode(document.body, dict);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        Array.from(mutation.addedNodes).forEach((node) => translateNode(node, dict));
      } else if (mutation.type === "attributes") {
        translateNode(mutation.target, dict);
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
