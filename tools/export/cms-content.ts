/**
 * Content adjustments the export makes so the exported files match what Decap CMS writes and expects.
 * Every change is one the schema already accepts in both forms; nothing changes meaning.
 *
 *   - familyOwned true / false / null → "yes" / "no" / "unknown" (the CMS select cannot hold booleans).
 *   - Every image whose rights are confirmed records the file the confirmation belongs to
 *     (`rightsConfirmedFor`), so a photo replaced later in the CMS never inherits it (G-033).
 */
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isMap, isSeq, parseDocument, type Document } from "yaml";
import { splitFrontmatter } from "../../core/content/snapshot.ts";
import { normalizeMediaFile } from "../../core/media/normalize.ts";

async function readJson(file: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** familyOwned in the select form. Returns a note when the file changed. */
export async function normaliseFamilyOwned(contentDir: string): Promise<string | null> {
  const file = path.join(contentDir, "site", "company.json");
  const company = await readJson(file);
  const value = company.familyOwned;
  let next: string | null = null;
  if (value === true) {
    next = "yes";
  } else if (value === false) {
    next = "no";
  } else if (value === null || value === undefined) {
    next = "unknown";
  }
  if (next === null) {
    return null;
  }
  company.familyOwned = next;
  await writeJson(file, company);
  return `company.json familyOwned ${JSON.stringify(value ?? null)} → "${next}" (CMS select form)`;
}

function isImageObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as { file?: unknown }).file === "string" &&
    "rightsConfirmed" in value
  );
}

/** Adds rightsConfirmedFor to confirmed images in plain data; returns how many were added. */
export function recordRightsInData(value: unknown): number {
  let added = 0;
  if (Array.isArray(value)) {
    for (const item of value) {
      added += recordRightsInData(item);
    }
    return added;
  }
  if (typeof value !== "object" || value === null) {
    return 0;
  }
  const record = value as Record<string, unknown>;
  if (isImageObject(record) && record.rightsConfirmed === true && record.rightsConfirmedFor == null) {
    const file = (record.file as string).trim();
    if (file !== "") {
      record.rightsConfirmedFor = normalizeMediaFile(file);
      added += 1;
    }
  }
  for (const inner of Object.values(record)) {
    added += recordRightsInData(inner);
  }
  return added;
}

/** The same for a YAML document, editing it in place so quoting and order stay as written. */
function recordRightsInYaml(document: Document, node: unknown): number {
  let added = 0;
  if (isSeq(node)) {
    for (const item of node.items) {
      added += recordRightsInYaml(document, item);
    }
    return added;
  }
  if (!isMap(node)) {
    return 0;
  }
  const file = node.get("file");
  if (typeof file === "string" && node.has("rightsConfirmed")) {
    const confirmedFor = node.get("rightsConfirmedFor");
    if (node.get("rightsConfirmed") === true && (confirmedFor === undefined || confirmedFor === null)) {
      if (file.trim() !== "") {
        node.set("rightsConfirmedFor", normalizeMediaFile(file));
        added += 1;
      }
    }
  }
  for (const pair of node.items) {
    added += recordRightsInYaml(document, pair.value);
  }
  return added;
}

/** Records rightsConfirmedFor in every content file. Returns one note per changed file. */
export async function recordImageRights(contentDir: string): Promise<string[]> {
  const notes: string[] = [];
  for (const group of (await readdir(contentDir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!group.isDirectory()) {
      continue;
    }
    const dir = path.join(contentDir, group.name);
    for (const name of (await readdir(dir)).sort()) {
      const file = path.join(dir, name);
      const relative = `${group.name}/${name}`;
      if (name.endsWith(".json")) {
        const data = await readJson(file);
        const added = recordRightsInData(data);
        if (added > 0) {
          await writeJson(file, data);
          notes.push(`${relative}: rightsConfirmedFor recorded for ${added} image(s)`);
        }
        continue;
      }
      if (!name.endsWith(".md")) {
        continue;
      }
      const source = await readFile(file, "utf8");
      const parts = splitFrontmatter(source);
      if (parts === null) {
        continue;
      }
      const document = parseDocument(parts.frontmatter);
      const added = recordRightsInYaml(document, document.contents);
      if (added > 0) {
        const frontmatter = document.toString({ lineWidth: 0 }).replace(/\n$/, "");
        await writeFile(file, `---\n${frontmatter}\n---\n${parts.body}`, "utf8");
        notes.push(`${relative}: rightsConfirmedFor recorded for ${added} image(s)`);
      }
    }
  }
  return notes;
}

/** Both adjustments; returns notes for the export log. */
export async function prepareContentForCms(siteRoot: string): Promise<string[]> {
  const contentDir = path.join(siteRoot, "src", "content");
  const notes: string[] = [];
  if (existsSync(path.join(contentDir, "site", "company.json"))) {
    const note = await normaliseFamilyOwned(contentDir);
    if (note !== null) {
      notes.push(note);
    }
  }
  const rights = await recordImageRights(contentDir);
  if (rights.length > 0) {
    notes.push(`rightsConfirmedFor recorded on the confirmed images of ${rights.length} content file(s)`);
  }
  return notes;
}
