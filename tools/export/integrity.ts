/**
 * Integrity manifest for an exported site (docs/cms/security.md §3).
 *
 * The CMS reaches GitHub through DecapBridge with a token that can write every path of the client
 * repository (GitHub Free has no path or branch protection for private repositories). So before any
 * build, the workflows check that only content changed since the export: every file outside the
 * content allowlist must be exactly the file the agency exported.
 *
 * The list of SHA-256 hashes is embedded in the workflow files themselves. The DecapBridge token is
 * created without the "Workflows" permission, so GitHub refuses any change to .github/workflows/
 * made with it; the list cannot be edited together with the code it protects.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Paths the CMS may change (matched case-insensitively against `git ls-files` paths):
 *   - content files one level below src/content/ (.md, .json only: Astro would execute a
 *     src/content/config.ts, so no other extension is accepted),
 *   - raster images in the media folder (no SVG: an SVG can carry script, and /admin/ on the same
 *     origin holds the editor's session),
 *   - PDFs in the documents folder,
 *   - the workflow files (GitHub itself protects them from the CMS token).
 * Written as a POSIX ERE so the workflow can use it with `grep -E` unchanged.
 */
export const CMS_WRITABLE_PATTERN =
  "^(\\.github/workflows/[^/]+|src/content/[a-z0-9-]+/[^/]+\\.(md|json)|src/assets/media/[^/]+\\.(jpg|jpeg|png|webp|avif)|src/assets/documents/[^/]+\\.pdf)$";

const WRITABLE = new RegExp(CMS_WRITABLE_PATTERN, "i");

export function isCmsWritable(relativePath: string): boolean {
  return WRITABLE.test(relativePath);
}

export interface ManifestEntry {
  path: string;
  sha256: string;
}

async function listFiles(root: string, relative = ""): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      files.push(...(await listFiles(root, child)));
    } else if (entry.isFile()) {
      files.push(child);
    } else {
      throw new Error(`${child}: links and special files cannot be part of an export.`);
    }
  }
  return files;
}

/** Hashes of every exported file the CMS must not change, sorted by path. */
export async function buildIntegrityManifest(siteRoot: string): Promise<ManifestEntry[]> {
  const entries: ManifestEntry[] = [];
  for (const file of await listFiles(siteRoot)) {
    if (isCmsWritable(file)) {
      continue;
    }
    if (/[\n\r\\]/.test(file) || file.startsWith("-")) {
      throw new Error(`${file}: file names with line breaks, backslashes or a leading "-" are not allowed.`);
    }
    const sha256 = createHash("sha256")
      .update(await readFile(path.join(siteRoot, file)))
      .digest("hex");
    entries.push({ path: file, sha256 });
  }
  return entries.sort(byPath);
}

function byPath(a: ManifestEntry, b: ManifestEntry): number {
  if (a.path < b.path) {
    return -1;
  }
  if (a.path > b.path) {
    return 1;
  }
  return 0;
}

/** `sha256sum` check-file lines: "<64 hex>  <path>". */
export function manifestLines(entries: readonly ManifestEntry[]): string[] {
  return entries.map((entry) => `${entry.sha256}  ${entry.path}`);
}

/** The manifest indented for a YAML block scalar (the heredoc inside a `run: |` step). */
export function indentManifest(entries: readonly ManifestEntry[], indent: number): string {
  const pad = " ".repeat(indent);
  return manifestLines(entries)
    .map((line, index) => (index === 0 ? line : `${pad}${line}`))
    .join("\n");
}
