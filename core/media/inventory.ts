/** Generated media inventory (content-contract §6.3): every ImageRef and every file in the media folder. */
import { normalizeMediaFile } from "./normalize.ts";
import type { ImageRef } from "../content/schemas.ts";
import type { ValidatedContent } from "../content/snapshot.ts";

export interface InventoryRow {
  file: string;
  usedBy: string[];
  source: ImageRef["source"] | "";
  depicts: ImageRef["depicts"] | "";
  rightsConfirmed: boolean | null;
  alt: string;
  credit: string;
}

export function buildMediaInventory(content: ValidatedContent): InventoryRow[] {
  const rows = new Map<string, InventoryRow>();
  const record = (where: string, image: ImageRef | null): void => {
    if (image === null) {
      return;
    }
    const file = normalizeMediaFile(image.file);
    const existing = rows.get(file);
    if (existing !== undefined) {
      existing.usedBy.push(where);
      return;
    }
    rows.set(file, {
      file,
      usedBy: [where],
      source: image.source,
      depicts: image.depicts,
      rightsConfirmed: image.rightsConfirmed,
      alt: image.alt,
      credit: image.credit ?? "",
    });
  };
  record(`${content.files.company}#logo`, content.company.logo);
  for (const page of content.pages) {
    record(`${page.file}#heroImage`, page.data.heroImage);
    record(`${page.file}#secondaryImage`, page.data.secondaryImage);
  }
  for (const entry of [...content.services, ...content.coffins, ...content.flowers, ...content.articles]) {
    record(`${entry.file}#image`, entry.data.image);
  }
  for (const file of content.mediaFiles) {
    if (!rows.has(file)) {
      rows.set(file, {
        file,
        usedBy: [],
        source: "",
        depicts: "",
        rightsConfirmed: null,
        alt: "",
        credit: "",
      });
    }
  }
  return [...rows.values()].sort((a, b) => a.file.localeCompare(b.file));
}

export function inventoryToMarkdown(rows: InventoryRow[]): string {
  const lines = [
    "| File | Used by | Source | Depicts | Rights confirmed | Credit |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    let rights = "unused";
    if (row.rightsConfirmed === true) {
      rights = "yes";
    } else if (row.rightsConfirmed === false) {
      rights = "**no**";
    }
    const usedBy = row.usedBy.length === 0 ? "(unused file)" : row.usedBy.join("<br>");
    lines.push(`| ${row.file} | ${usedBy} | ${row.source} | ${row.depicts} | ${rights} | ${row.credit} |`);
  }
  return lines.join("\n");
}
