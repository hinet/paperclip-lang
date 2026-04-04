/**
 * DOM-based text translation engine.
 *
 * Walks text nodes and replaces exact-match English strings with their
 * translated equivalents using a MutationObserver to handle dynamically
 * rendered content.
 */

function translateNode(node: Node, dict: Record<string, string>): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const original = node.textContent?.trim();
    if (original && dict[original] !== undefined && node.textContent) {
      // Preserve surrounding whitespace while replacing the trimmed content
      node.textContent = node.textContent.replace(original, dict[original]);
    }
  } else {
    Array.from(node.childNodes).forEach((child) => translateNode(child, dict));
  }
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
      }
      // Note: characterData observation is intentionally omitted. React updates
      // text by replacing nodes (childList), not via direct characterData writes.
      // Watching characterData causes an infinite loop: our replacement fires a
      // new characterData mutation, React reconciles back to English, we fire
      // again — freezing the page on any live-updating view (e.g. Routines).
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
