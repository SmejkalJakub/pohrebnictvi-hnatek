import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { TemplateManifest } from "../../../core/content/config.ts";
import { splitFrontmatter } from "../../../core/content/snapshot.ts";
import { REPO_ROOT, loadManifest } from "../../lib/repo.ts";
import { PLACEHOLDER_IMAGE_LABEL, generatePagesConfig, renderPagesYaml } from "../pages-config.ts";

const FIXTURE = path.join(REPO_ROOT, "fixtures", "neutral");
const TEMPLATES = ["rodinna-tradice", "dustojna-jednoduchost"] as const;

interface Field {
  name: string;
  type: string;
  label?: string;
  hidden?: boolean;
  required?: boolean;
  default?: unknown;
  list?: boolean | { collapsible?: unknown };
  options?: { values?: (string | { value: string; label: string })[]; multiple?: boolean };
  fields?: Field[];
}

interface Entry {
  name: string;
  label: string;
  type: string;
  path?: string;
  operations?: { create: boolean; delete: boolean; rename: boolean };
  fields?: Field[];
  items?: Entry[];
}

interface ParsedConfig {
  settings: { content: { merge: boolean } };
  media: { input: string; output: string };
  content: Entry[];
  actions: { name: string; label: string; workflow: string; ref: string }[];
}

async function pageIds(): Promise<string[]> {
  return (await readdir(path.join(FIXTURE, "src", "content", "pages"))).map((file) =>
    file.replace(/\.md$/, ""),
  );
}

/** Fixture pages the template renders (A and B declare no pageFields for the optional pages). */
async function templatePageIds(manifest: TemplateManifest): Promise<string[]> {
  return (await pageIds()).filter((pageId) => manifest.pageFields[pageId] !== undefined);
}

async function generated(manifest: TemplateManifest, articles = false): Promise<ParsedConfig> {
  const config = generatePagesConfig({ manifest, features: { articles }, pageIds: await pageIds() });
  const yaml = renderPagesYaml(config, { templateId: manifest.id, templateVersion: manifest.version });
  return parse(yaml) as ParsedConfig;
}

function allEntries(content: Entry[]): Entry[] {
  return content.flatMap((entry) => {
    if (entry.type === "group") {
      return entry.items ?? [];
    }
    return [entry];
  });
}

function entry(config: ParsedConfig, name: string): Entry {
  const found = allEntries(config.content).find((candidate) => candidate.name === name);
  if (found === undefined) {
    throw new Error(`No entry ${name}`);
  }
  return found;
}

function field(fields: Field[] | undefined, name: string): Field {
  const found = (fields ?? []).find((candidate) => candidate.name === name);
  if (found === undefined) {
    throw new Error(`No field ${name}`);
  }
  return found;
}

function walk(fields: Field[] | undefined, visit: (field: Field, trail: string) => void, trail = ""): void {
  for (const item of fields ?? []) {
    const here = `${trail}${item.name}`;
    visit(item, here);
    walk(item.fields, visit, `${here}.`);
  }
}

function selectValues(item: Field): string[] {
  return (item.options?.values ?? []).map((value) => {
    if (typeof value === "string") {
      return value;
    }
    return value.value;
  });
}

/** Every key present in the data must be a declared field (A7), at every depth, list items included. */
function undeclaredKeys(data: unknown, fields: Field[] | undefined, trail: string): string[] {
  if (data === null || typeof data !== "object") {
    return [];
  }
  if (Array.isArray(data)) {
    return data.flatMap((item, index) => undeclaredKeys(item, fields, `${trail}[${index}]`));
  }
  const problems: string[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const declared = (fields ?? []).find((candidate) => candidate.name === key);
    if (declared === undefined) {
      problems.push(`${trail}.${key}`);
      continue;
    }
    if (declared.type === "object") {
      problems.push(...undeclaredKeys(value, declared.fields, `${trail}.${key}`));
    }
  }
  return problems;
}

async function fixtureFile(relative: string): Promise<unknown> {
  const source = await readFile(path.join(FIXTURE, relative), "utf8");
  if (relative.endsWith(".json")) {
    return JSON.parse(source);
  }
  const split = splitFrontmatter(source);
  return parse(split?.frontmatter ?? "");
}

describe.each(TEMPLATES)("generated .pages.yml for %s", (templateId) => {
  it("keeps undeclared keys and uses the media folder as stored path", async () => {
    const config = await generated(await loadManifest(templateId));
    expect(config.settings.content.merge).toBe(true);
    expect(config.media.input).toBe("src/assets/media");
    expect(config.media.output).toBe("src/assets/media");
  });

  it("has no articles collection while the feature is off", async () => {
    const config = await generated(await loadManifest(templateId));
    const names = allEntries(config.content).map((item) => item.name);
    expect(names).not.toContain("articles");
    expect(names).not.toContain("page-clanky");
    expect(JSON.stringify(config)).not.toContain("src/content/articles");
  });

  it("makes the emergency transport its own top-level entry, apart from contact and hours", async () => {
    const config = await generated(await loadManifest(templateId));
    const topLevel = config.content.map((item) => item.name);
    expect(topLevel[0]).toBe("emergency");
    const emergency = entry(config, "emergency");
    expect(emergency.label).toBe("Nonstop převoz zesnulých");
    expect(emergency.path).toBe("src/content/site/emergency.json");
    for (const name of ["label", "availability", "enabled"]) {
      expect(field(emergency.fields, name).hidden).toBe(true);
    }
    const hours = entry(config, "office-hours");
    expect(hours.path).toBe("src/content/site/office-hours.json");
    expect(JSON.stringify(hours.fields)).not.toMatch(/emergency\.json|"name":"phone"/);
    const contact = entry(config, "contact");
    expect(JSON.stringify(contact.fields)).not.toContain("emergency");
  });

  it("locks the page set and slugs", async () => {
    const config = await generated(await loadManifest(templateId));
    const pages = config.content.find((item) => item.name === "pages");
    expect(pages?.type).toBe("group");
    expect(pages?.items?.length).toBe((await templatePageIds(await loadManifest(templateId))).length);
    for (const page of pages?.items ?? []) {
      expect(page.type).toBe("file");
      expect(page.operations).toEqual({ create: false, delete: false, rename: false });
    }
    for (const name of ["services", "guidance", "coffins", "flowers"]) {
      expect(entry(config, name).operations).toEqual({ create: true, delete: true, rename: false });
    }
    for (const name of ["emergency", "company", "contact", "office-hours", "pricing"]) {
      expect(entry(config, name).operations).toEqual({ create: false, delete: false, rename: false });
    }
  });

  it("shows only the page fields the template renders; the rest stay declared but hidden", async () => {
    const manifest = await loadManifest(templateId);
    const config = await generated(manifest);
    for (const pageId of await templatePageIds(manifest)) {
      const page = entry(config, `page-${pageId}`);
      const visible = (page.fields ?? []).filter((item) => item.hidden !== true).map((item) => item.name);
      const expected = (manifest.pageFields[pageId] ?? []).filter((name) => {
        if (name === "heroImage" || name === "secondaryImage") {
          return Object.values(manifest.imageSlots).some(
            (slot) => slot.page === pageId && slot.field === name,
          );
        }
        return true;
      });
      expect([...visible].sort()).toEqual([...expected].sort());
      expect(field(page.fields, "placeholder").hidden).toBe(true);
      expect(field(page.fields, "body").type).toBe("rich-text");
    }
  });

  it("declares every key of the fixture content, list items included", async () => {
    const manifest = await loadManifest(templateId);
    const config = await generated(manifest);
    const problems: string[] = [];
    for (const name of ["company", "contact", "office-hours", "emergency", "pricing"]) {
      const data = await fixtureFile(`src/content/site/${name}.json`);
      problems.push(...undeclaredKeys(data, entry(config, name).fields, name));
    }
    for (const pageId of await templatePageIds(manifest)) {
      const data = await fixtureFile(`src/content/pages/${pageId}.md`);
      problems.push(...undeclaredKeys(data, entry(config, `page-${pageId}`).fields, `pages/${pageId}`));
    }
    for (const collection of ["services", "guidance", "coffins", "flowers"]) {
      for (const file of await readdir(path.join(FIXTURE, "src", "content", collection))) {
        const data = await fixtureFile(`src/content/${collection}/${file}`);
        problems.push(...undeclaredKeys(data, entry(config, collection).fields, `${collection}/${file}`));
      }
    }
    expect(problems).toEqual([]);
  });

  it("hides fields the policy keeps away from the editor, and never makes a hidden field required", async () => {
    const config = await generated(await loadManifest(templateId));
    const contact = entry(config, "contact");
    expect(field(field(contact.fields, "phones").fields, "department").hidden).toBe(true);
    expect(field(field(contact.fields, "phones").fields, "id").hidden).toBe(true);
    expect(field(field(contact.fields, "locations").fields, "geo").hidden).toBe(true);
    expect(field(entry(config, "pricing").fields, "currency").hidden).toBe(true);
    expect(field(entry(config, "services").fields, "priceGroupId").hidden).toBe(true);
    for (const name of ["services", "guidance", "coffins", "flowers"]) {
      expect(field(entry(config, name).fields, "placeholder").hidden).toBe(true);
    }
    for (const item of allEntries(config.content)) {
      walk(item.fields, (candidate, trail) => {
        if (candidate.hidden === true) {
          expect(candidate.required, `${item.name}.${trail}`).not.toBe(true);
        }
      });
    }
  });

  it("gives every date field an empty default (B4)", async () => {
    const config = await generated(await loadManifest(templateId));
    const dates: string[] = [];
    for (const item of allEntries(config.content)) {
      walk(item.fields, (candidate, trail) => {
        if (candidate.type === "date") {
          dates.push(`${item.name}.${trail}`);
          expect(candidate.default, trail).toBe("");
        }
      });
    }
    expect(dates).toEqual(
      expect.arrayContaining([
        "pricing.validFrom",
        "guidance.review.reviewedAt",
        "office-hours.exceptions.from",
      ]),
    );
  });

  it("offers the demo/approved price status and the placeholder image source", async () => {
    const config = await generated(await loadManifest(templateId));
    const items = field(field(entry(config, "pricing").fields, "groups").fields, "items");
    const status = field(items.fields, "status");
    expect(status.type).toBe("select");
    expect(status.required).toBe(true);
    expect(status.default).toBe("demo");
    expect(selectValues(status)).toEqual(["demo", "approved"]);
    let imageCount = 0;
    for (const item of allEntries(config.content)) {
      walk(item.fields, (candidate) => {
        if (candidate.name === "source" && candidate.type === "select") {
          imageCount += 1;
          expect(candidate.options?.values).toContainEqual({
            value: "placeholder",
            label: PLACEHOLDER_IMAGE_LABEL,
          });
        }
        if (
          candidate.type === "object" &&
          (candidate.fields ?? []).some((child) => child.name === "rightsConfirmed")
        ) {
          // B6: booleans of optional images start empty, selects have no default.
          expect(field(candidate.fields, "rightsConfirmed").default).toBeNull();
          expect(field(candidate.fields, "decorative").default).toBeNull();
          expect(field(candidate.fields, "source").default).toBeUndefined();
          expect(field(candidate.fields, "focus").default).toBeUndefined();
        }
      });
    }
    expect(imageCount).toBeGreaterThan(5);
  });

  it("models familyOwned as yes / no / unknown (A4)", async () => {
    const config = await generated(await loadManifest(templateId));
    const familyOwned = field(entry(config, "company").fields, "familyOwned");
    expect(familyOwned.type).toBe("select");
    expect(selectValues(familyOwned)).toEqual(["yes", "no", "unknown"]);
  });

  it("uses only well-formed lists and selects", async () => {
    const config = await generated(await loadManifest(templateId));
    for (const item of allEntries(config.content)) {
      walk(item.fields, (candidate, trail) => {
        if (typeof candidate.list === "object") {
          expect(candidate.list.collapsible, trail).toBeDefined();
        }
        if (candidate.type === "select") {
          expect(selectValues(candidate).length, trail).toBeGreaterThan(0);
        }
        if (candidate.type === "object") {
          expect((candidate.fields ?? []).length, trail).toBeGreaterThan(0);
        }
      });
    }
  });

  it("adds the publish and discard Actions (A5)", async () => {
    const config = await generated(await loadManifest(templateId));
    expect(config.actions).toEqual([
      expect.objectContaining({ label: "Zveřejnit změny", workflow: "publish.yml", ref: "current" }),
      expect.objectContaining({
        label: "Zahodit nepublikované změny",
        workflow: "discard.yml",
        ref: "current",
      }),
    ]);
  });
});

describe("feature-dependent output", () => {
  it("adds the articles collection only when the feature is on and the template supports it", async () => {
    const base = await loadManifest("rodinna-tradice");
    const supporting: TemplateManifest = { ...base, supports: { ...base.supports, articles: true } };
    const withArticles = await generated(supporting, true);
    const articles = entry(withArticles, "articles");
    expect(articles.path).toBe("src/content/articles");
    expect(field(articles.fields, "publishedAt").default).toBe("");
    const unsupported = await generated(base, true);
    expect(allEntries(unsupported.content).map((item) => item.name)).not.toContain("articles");
  });

  it("follows the manifest's image slots for collection images", async () => {
    const base = await loadManifest("dustojna-jednoduchost");
    const withoutCoffinImages: TemplateManifest = {
      ...base,
      imageSlots: Object.fromEntries(
        Object.entries(base.imageSlots).filter(([slot]) => !slot.startsWith("coffin.")),
      ),
    };
    const config = await generated(withoutCoffinImages);
    expect(field(entry(config, "coffins").fields, "image").hidden).toBe(true);
    expect(field(entry(config, "flowers").fields, "image").hidden).not.toBe(true);
  });
});

/** A template that supports every optional content type and renders their pages and images. */
async function fullManifest(): Promise<TemplateManifest> {
  const base = await loadManifest("dustojna-jednoduchost");
  const pageFields: Record<string, readonly string[]> = { ...base.pageFields };
  for (const pageId of ["oznameni", "pro-ucastniky", "pohreb-predem", "pravni-informace"]) {
    pageFields[pageId] = ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"];
  }
  return {
    ...base,
    supports: {
      ...base.supports,
      notices: true,
      people: true,
      faq: true,
      documents: true,
      guestInfo: true,
      prePlanning: true,
      priceInclusions: true,
    },
    imageSlots: {
      ...base.imageSlots,
      "notice.photo": { aspect: "4:5", required: false },
      "person.photo": { aspect: "1:1", required: false },
    },
    pageFields,
  };
}

const ALL_FEATURES = {
  articles: false,
  notices: true,
  people: true,
  faq: true,
  documents: true,
  guestInfo: true,
  prePlanning: true,
};

async function generatedFull(): Promise<ParsedConfig & { media: unknown }> {
  const config = generatePagesConfig({
    manifest: await fullManifest(),
    features: ALL_FEATURES,
    pageIds: await pageIds(),
    legal: true,
  });
  return parse(renderPagesYaml(config, { templateId: "full", templateVersion: "0.0.0" })) as ParsedConfig;
}

describe("optional content types in the CMS", () => {
  it("adds no optional collection, page, legal entry or PDF folder for A and B", async () => {
    for (const templateId of TEMPLATES) {
      const yaml = JSON.stringify(await generated(await loadManifest(templateId)));
      for (const forbidden of [
        "notices",
        "people",
        "faq",
        "src/content/documents",
        "legal.json",
        "assets/documents",
      ]) {
        expect(yaml).not.toContain(forbidden);
      }
      const pricing = await generated(await loadManifest(templateId));
      const groups = field(entry(pricing, "pricing").fields, "groups");
      expect(field(groups.fields, "includes").hidden).toBe(true);
      expect(field(groups.fields, "excludes").hidden).toBe(true);
    }
  });

  it("generates notices with a required consent group, and a PDF media folder", async () => {
    const config = await generatedFull();
    const notices = entry(config, "notices");
    expect(notices.label).toBe("Oznámení a obřady");
    const consent = field(notices.fields, "consent");
    expect(consent.label).toBe("Souhlas objednatele");
    expect(field(consent.fields, "orderedBy").required).toBe(true);
    expect(field(consent.fields, "date").default).toBe("");
    const names = (notices.fields ?? []).map((item) => item.name);
    for (const promotional of ["price", "priceGroupId", "service", "services", "featured"]) {
      expect(names).not.toContain(promotional);
    }
    expect(field(notices.fields, "partePdf").type).toBe("file");
    expect(field(notices.fields, "noindex").default).toBe(true);
    expect(Array.isArray(config.media)).toBe(true);
    expect(config.media).toContainEqual(
      expect.objectContaining({ name: "documents", input: "src/assets/documents", extensions: ["pdf"] }),
    );
    expect(field(entry(config, "documents").fields, "file").options).toMatchObject({ media: "documents" });
  });

  it("shows the optional pages, legal information and price inclusions when supported", async () => {
    const config = await generatedFull();
    for (const pageId of ["oznameni", "pro-ucastniky", "pohreb-predem", "pravni-informace"]) {
      expect(entry(config, `page-${pageId}`).path).toBe(`src/content/pages/${pageId}.md`);
    }
    expect(entry(config, "legal").path).toBe("src/content/site/legal.json");
    const groups = field(entry(config, "pricing").fields, "groups");
    expect(field(groups.fields, "includes").hidden).toBeUndefined();
    for (const name of ["notices", "people", "faq", "documents"]) {
      expect(entry(config, name).operations).toEqual({ create: true, delete: true, rename: false });
    }
  });

  it("declares every key of the fixture's optional content", async () => {
    const config = await generatedFull();
    const problems: string[] = [];
    for (const name of ["pricing", "legal"]) {
      const data = await fixtureFile(`src/content/site/${name}.json`);
      problems.push(...undeclaredKeys(data, entry(config, name).fields, name));
    }
    for (const pageId of ["oznameni", "pro-ucastniky", "pohreb-predem", "pravni-informace"]) {
      const data = await fixtureFile(`src/content/pages/${pageId}.md`);
      problems.push(...undeclaredKeys(data, entry(config, `page-${pageId}`).fields, `pages/${pageId}`));
    }
    for (const collection of ["notices", "people", "faq", "documents"]) {
      for (const file of await readdir(path.join(FIXTURE, "src", "content", collection))) {
        const data = await fixtureFile(`src/content/${collection}/${file}`);
        problems.push(...undeclaredKeys(data, entry(config, collection).fields, `${collection}/${file}`));
      }
    }
    expect(problems).toEqual([]);
  });
});
