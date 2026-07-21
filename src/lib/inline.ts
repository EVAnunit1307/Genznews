/**
 * Minimal, safe inline formatting for editor-provided prose (About page).
 *
 * The content comes from the site owner via the CMS, but we still escape HTML
 * first so a stray `<` can never inject markup, then re-enable a tiny, known
 * set of emphasis marks:
 *   **bold**  -> <strong>
 *   *italic*  -> <em>
 */
export function inlineFormat(input: string): string {
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Split a text block into trimmed, non-empty paragraphs on blank lines. */
export function toParagraphs(input: string): string[] {
  return input
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
