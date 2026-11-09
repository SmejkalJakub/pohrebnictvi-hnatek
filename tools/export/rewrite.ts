/**
 * Path rewriting for the standalone export (template-contract §9): every relative reference that
 * pointed into the system repo's core/ is re-pointed at the exported copy in src/core/.
 */
import path from "node:path";
import { isInside } from "../lib/repo.ts";

/** Quoted relative specifiers: imports, `/// <reference path>`, `new URL("..")`, tsconfig paths and globs. */
const RELATIVE_LITERAL = /(["'])(\.{1,2}(?:\/[^"'\n]*)?)\1/g;

export interface RewriteContext {
  /** Where the file lived in the system repo. */
  originalFile: string;
  /** Where the file is written in the export. */
  exportedFile: string;
  /** The system repo's core/ directory. */
  coreDir: string;
  /** The export's src/core/ directory. */
  exportedCoreDir: string;
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

/** Rewrites one specifier, or returns it unchanged when it does not point into core/. */
export function rewriteSpecifier(specifier: string, context: RewriteContext): string {
  const resolved = path.resolve(path.dirname(context.originalFile), specifier);
  if (!isInside(context.coreDir, resolved)) {
    return specifier;
  }
  const target = path.join(context.exportedCoreDir, path.relative(context.coreDir, resolved));
  let relative = toPosix(path.relative(path.dirname(context.exportedFile), target));
  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }
  if (specifier.endsWith("/") && !relative.endsWith("/")) {
    relative = `${relative}/`;
  }
  return relative;
}

export interface RewriteResult {
  text: string;
  changes: { from: string; to: string }[];
}

export function rewriteCoreReferences(text: string, context: RewriteContext): RewriteResult {
  const changes: { from: string; to: string }[] = [];
  const rewritten = text.replace(RELATIVE_LITERAL, (match: string, quote: string, specifier: string) => {
    const next = rewriteSpecifier(specifier, context);
    if (next === specifier) {
      return match;
    }
    changes.push({ from: specifier, to: next });
    return `${quote}${next}${quote}`;
  });
  return { text: rewritten, changes };
}

/** Relative specifiers in a text that resolve outside `root` (used by the export and the verify scan). */
export function escapingSpecifiers(text: string, file: string, root: string): string[] {
  const escaping: string[] = [];
  for (const match of text.matchAll(RELATIVE_LITERAL)) {
    const specifier = match[2] as string;
    const resolved = path.resolve(path.dirname(file), specifier);
    if (!isInside(root, resolved)) {
      escaping.push(specifier);
    }
  }
  return escaping;
}
