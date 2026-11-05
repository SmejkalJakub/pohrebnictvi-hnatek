/**
 * Restricted Markdown for CMS-edited bodies (content-contract §7.3).
 *
 * Implemented as a line-based checker rather than a remark plugin: it runs in the Node
 * validator, the build gate and unit tests with no extra dependencies, and reports line numbers.
 * Fenced code blocks and inline code spans are ignored.
 */
export type BodyIssueKind = "phone" | "html" | "h1" | "heading-skip" | "image" | "unsafe-link";

export interface BodyIssue {
  kind: BodyIssueKind;
  /** 1-based line within the body. */
  line: number;
  message: string;
}

const PHONE_PATTERN = /(\+\d{3}[\s ]?\d{3}[\s ]?\d{3}[\s ]?\d{3})|(\b\d{3}[\s ]?\d{3}[\s ]?\d{3}\b)/;
const HTML_PATTERN = /<!--|<\/?[a-zA-Z][\w-]*(\s[^<>]*)?\/?>/;
const AUTOLINK_PATTERN = /<(https?:|mailto:)[^>]*>/g;
/** Inline tags the Pages CMS editor may emit for formatting Markdown lacks (underline, hard break). */
const ALLOWED_HTML_PATTERN = /<\/?u>|<br\s*\/?>/gi;
const HEADING_PATTERN = /^(#{1,6})\s/;
const IMAGE_PATTERN = /!\[[^\]]*\]\(/;
const UNSAFE_LINK_PATTERN = /\]\(\s*javascript:|javascript:|http:\/\//i;

function stripInlineCode(line: string): string {
  return line.replace(/`[^`]*`/g, "");
}

export function checkMarkdownBody(body: string): BodyIssue[] {
  const issues: BodyIssue[] = [];
  const lines = body.split(/\r?\n/);
  let inFence = false;
  // The page H1 comes from the title field, so the first body heading must be H2.
  let previousLevel = 1;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    if (/^\s*(```|~~~)/.test(rawLine)) {
      inFence = !inFence;
      return;
    }
    if (inFence) {
      return;
    }
    const line = stripInlineCode(rawLine);

    const heading = HEADING_PATTERN.exec(line);
    if (heading !== null) {
      const level = (heading[1] as string).length;
      if (level === 1) {
        issues.push({
          kind: "h1",
          line: lineNumber,
          message: "Nadpis 1. úrovně (#) nepoužívejte; text začíná nadpisem ##.",
        });
      } else if (level > previousLevel + 1) {
        issues.push({
          kind: "heading-skip",
          line: lineNumber,
          message: `Nadpis úrovně ${level} následuje po úrovni ${previousLevel}; úrovně nepřeskakujte.`,
        });
      }
      previousLevel = level;
    }

    if (HTML_PATTERN.test(line.replace(AUTOLINK_PATTERN, "").replace(ALLOWED_HTML_PATTERN, ""))) {
      issues.push({ kind: "html", line: lineNumber, message: "HTML kód v textu není povolen." });
    }
    if (IMAGE_PATTERN.test(line)) {
      issues.push({
        kind: "image",
        line: lineNumber,
        message: "Obrázky vkládejte přes pole obrázku, ne do textu.",
      });
    }
    if (UNSAFE_LINK_PATTERN.test(line)) {
      issues.push({ kind: "unsafe-link", line: lineNumber, message: "Odkazy musí vést na https:// adresy." });
    }
    if (PHONE_PATTERN.test(line)) {
      issues.push({
        kind: "phone",
        line: lineNumber,
        message: "Telefonní čísla do textu nepište; zobrazují se z kontaktních údajů.",
      });
    }
  });
  return issues;
}
