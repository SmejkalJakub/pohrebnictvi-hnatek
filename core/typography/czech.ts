/**
 * Czech typesetting rule: a one-letter preposition or conjunction (k, s, v, z, o, u, i, a) never
 * ends a line. Applied to every rendered HTML page by core's middleware, so headings, leads and
 * Markdown bodies follow it in every template without per-template helpers.
 */

const NBSP = " ";

/** One-letter word after start, whitespace, an opening bracket or quote, or a dash. */
const ONE_LETTER_WORD = /(?<=^|[\s („"'«–—/])([ksvzouiaKSVZOUIA])[ \t\r\n]+(?=\S|$)/g;

/** Glue one-letter words to the following word with a non-breaking space. Plain text only. */
export function glueOneLetterWords(text: string): string {
  return text.replace(ONE_LETTER_WORD, `$1${NBSP}`);
}

/** Elements whose text is code or data, never typeset. */
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "pre", "code", "textarea", "kbd", "samp"]);

const TOKEN = /(<!--[\s\S]*?-->|<[^>]*>)/g;
const TAG_NAME = /^<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)/;

/**
 * Apply {@link glueOneLetterWords} to the text nodes of an HTML document: tags, attributes,
 * comments and the content of script, style, pre, code and textarea stay untouched.
 */
export function glueOneLetterWordsInHtml(html: string): string {
  const parts = html.split(TOKEN);
  let rawDepth = 0;
  let rawName: string | null = null;
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part === undefined || part === "") {
      continue;
    }
    const isMarkup = index % 2 === 1;
    if (isMarkup) {
      if (part.startsWith("<!--")) {
        continue;
      }
      const name = TAG_NAME.exec(part)?.[1]?.toLowerCase() ?? null;
      if (name === null) {
        continue;
      }
      const closing = /^<\s*\//.test(part);
      const selfClosing = part.endsWith("/>");
      if (rawName === null) {
        if (!closing && !selfClosing && RAW_TEXT_ELEMENTS.has(name)) {
          rawName = name;
          rawDepth = 1;
        }
      } else if (name === rawName) {
        if (closing) {
          rawDepth -= 1;
        } else if (!selfClosing) {
          rawDepth += 1;
        }
        if (rawDepth === 0) {
          rawName = null;
        }
      }
      continue;
    }
    if (rawName === null) {
      parts[index] = glueOneLetterWords(part);
    }
  }
  return parts.join("");
}
