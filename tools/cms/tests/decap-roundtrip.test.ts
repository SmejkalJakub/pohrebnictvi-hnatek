/**
 * What a Decap CMS save does to the client's content (docs/cms/architecture.md §4).
 *
 * 1. Real output: files saved by Decap CMS 3.17.3 in a browser (fixtures/decap-3.17.3/README.md)
 *    must equal the original content with only the edit applied, after core's own parsing.
 * 2. Every content file of both clients, serialised the way Decap serialises it (JSON with
 *    2-space indent; YAML front matter rewritten in plain block style), must validate to exactly the
 *    same content as before.
 * 3. The export's rightsConfirmedFor step only adds keys and changes no gate result.
 */
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { Company, Contact, Guidance, Page, Pricing } from "../../../core/content/schemas.ts";
import {
  readSiteSnapshot,
  splitFrontmatter,
  validateSnapshot,
  type RawSnapshot,
} from "../../../core/content/snapshot.ts";
import { runGate } from "../../../core/gate/rules.ts";
import { REPO_ROOT, loadManifest } from "../../lib/repo.ts";
import { prepareContentForCms } from "../../export/cms-content.ts";

const FIXTURES = path.join(import.meta.dirname, "fixtures", "decap-3.17.3");
const HNATEK = path.join(REPO_ROOT, "clients", "hnatek");
const CLIENTS = [
  { id: "hnatek", template: "rodinna-tradice" },
  { id: "hnatek-b", template: "dustojna-jednoduchost" },
] as const;
const NOW = new Date("2026-11-12T12:00:00Z");
const temporary: string[] = [];

afterAll(async () => {
  for (const dir of temporary) {
    await rm(dir, { recursive: true, force: true });
  }
});

async function json(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

async function markdown(file: string): Promise<{ data: unknown; body: string }> {
  const parts = splitFrontmatter(await readFile(file, "utf8"));
  if (parts === null) {
    throw new Error(`${file} has no front matter`);
  }
  return { data: parse(parts.frontmatter), body: parts.body };
}

describe("files saved by Decap CMS 3.17.3 keep everything but the edit", () => {
  it("company.json: only brandName changed; nulls and the logo object kept", async () => {
    const original = Company.parse(await json(path.join(HNATEK, "src/content/site/company.json")));
    const saved = Company.parse(await json(path.join(FIXTURES, "site/company.json")));
    expect(saved).toEqual({ ...original, brandName: "Pohřebnictví Hnátek TEST" });
    expect(original.tradition.foundedYear).toBeNull();
  });

  it("contact.json: one phone changed; hidden ids, department, locationId and geo kept", async () => {
    const original = Contact.parse(await json(path.join(HNATEK, "src/content/site/contact.json")));
    const saved = Contact.parse(await json(path.join(FIXTURES, "site/contact.json")));
    const expected = structuredClone(original);
    expected.phones[1]!.number = "+420739404910";
    expect(saved).toEqual(expected);
  });

  it("pricing.json: amount changed, price still demo (never approved by editing)", async () => {
    const original = Pricing.parse(await json(path.join(HNATEK, "src/content/site/pricing.json")));
    const saved = Pricing.parse(await json(path.join(FIXTURES, "site/pricing.json")));
    const expected = structuredClone(original);
    expected.groups[0]!.items[0]!.amount = 19500;
    expect(saved).toEqual(expected);
    expect(saved.groups[0]!.items[0]!.status).toBe("demo");
  });

  it("guidance: front matter rewritten in another YAML style but equal; null review date stays null", async () => {
    const original = await markdown(path.join(HNATEK, "src/content/guidance/umrti-doma.md"));
    const saved = await markdown(path.join(FIXTURES, "guidance/umrti-doma.md"));
    const before = Guidance.parse(original.data);
    const after = Guidance.parse(saved.data);
    expect(after).toEqual({ ...before, summary: `${before.summary} Upraveno.` });
    expect(after.review.reviewedAt).toBeNull();
    expect(saved.body.trim()).toBe(original.body.trim());
  });

  it("page: body edit kept Markdown structure; replaced photo carries its own rights record", async () => {
    const original = await markdown(path.join(HNATEK, "src/content/pages/o-nas.md"));
    const saved = await markdown(path.join(FIXTURES, "pages/o-nas.md"));
    const before = Page.parse(original.data);
    const after = Page.parse(saved.data);
    expect(after).toEqual({
      ...before,
      heroImage: {
        ...before.heroImage,
        file: "src/assets/media/kvetiny-na-rakev-bila.jpg",
        rightsConfirmed: true,
        rightsConfirmedFor: "kvetiny-na-rakev-bila.jpg",
      },
    });
    expect(saved.body.trim()).toBe(
      original.body
        .trim()
        .replace("v rodinné tradici pokračuje.", "v rodinné tradici pokračuje. Testovací věta."),
    );
    for (const heading of ["## Rodinná firma", "## Co děláme", "## Kde nás najdete"]) {
      expect(saved.body).toContain(heading);
    }
  });
});

/** Rewrites every file of a snapshot the way Decap writes it, then re-reads it. */
function decapLike(raw: RawSnapshot): RawSnapshot {
  const saved = structuredClone(raw);
  for (const file of Object.values(saved.singletons)) {
    if (file !== undefined) {
      file.data = JSON.parse(`${JSON.stringify(file.data, null, 2)}\n`);
    }
  }
  for (const file of Object.values(saved.optionalSingletons)) {
    if (file !== undefined) {
      file.data = JSON.parse(`${JSON.stringify(file.data, null, 2)}\n`);
    }
  }
  for (const entry of saved.entries) {
    entry.data = parse(stringify(entry.data));
  }
  return saved;
}

describe.each(CLIENTS)("all $id content after a Decap-style save", ({ id, template }) => {
  it("validates to exactly the same content and the same gate result", async () => {
    const dir = path.join(REPO_ROOT, "clients", id);
    const manifest = await loadManifest(template);
    const raw = await readSiteSnapshot(dir);
    const before = validateSnapshot(raw);
    const after = validateSnapshot(decapLike(raw));
    expect(before.problems).toEqual([]);
    expect(after.problems).toEqual([]);
    expect(after.content).toEqual(before.content);
    const rules = (content: NonNullable<typeof before.content>) =>
      runGate(content, { mode: "production", now: NOW, manifest })
        .filter((finding) => finding.level === "error")
        .map((finding) => `${finding.rule} ${finding.file} ${finding.path}`)
        .sort();
    expect(rules(after.content!)).toEqual(rules(before.content!));
  });
});

describe.each(CLIENTS)("export step for $id: rightsConfirmedFor", ({ id, template }) => {
  it("only adds the file names of confirmed images and changes no gate result", async () => {
    const source = path.join(REPO_ROOT, "clients", id);
    const copy = await mkdtemp(path.join(os.tmpdir(), "cms-content-"));
    temporary.push(copy);
    await cp(path.join(source, "src"), path.join(copy, "src"), { recursive: true });
    await cp(path.join(source, "provenance"), path.join(copy, "provenance"), { recursive: true });
    const notes = await prepareContentForCms(copy);
    expect(notes.join("\n")).toContain("rightsConfirmedFor recorded");

    const manifest = await loadManifest(template);
    const before = validateSnapshot(await readSiteSnapshot(source));
    const after = validateSnapshot(await readSiteSnapshot(copy));
    expect(after.problems).toEqual([]);
    const gate = (content: NonNullable<typeof before.content>) =>
      runGate(content, { mode: "production", now: NOW, manifest })
        .map((finding) => `${finding.level} ${finding.rule} ${finding.file} ${finding.path}`)
        .sort();
    expect(gate(after.content!)).toEqual(gate(before.content!));

    // The original text of a page is still there line for line; only the new key was added.
    const page = "src/content/pages/o-nas.md";
    const originalLines = (await readFile(path.join(source, page), "utf8")).split("\n");
    const exportedLines = (await readFile(path.join(copy, page), "utf8")).split("\n");
    const added = exportedLines.filter((line) => !originalLines.includes(line));
    expect(added).toHaveLength(1);
    expect(added[0]).toMatch(/^ {2}rightsConfirmedFor: budova-kancelare[\w-]*\.jpg$/);
    for (const image of after.content!.pages.flatMap((entry) => [
      entry.data.heroImage,
      entry.data.secondaryImage,
    ])) {
      if (image !== null && image.rightsConfirmed) {
        expect(image.rightsConfirmedFor).not.toBeNull();
      }
    }
  });
});
