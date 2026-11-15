import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { TemplateManifest } from "../../../core/content/config.ts";
import { splitFrontmatter } from "../../../core/content/snapshot.ts";
import { REPO_ROOT, loadManifest } from "../../lib/repo.ts";
import { MAX_LANDSCAPE_IMAGES, MAX_PLACES as CORE_MAX_PLACES } from "../../../core/content/schemas.ts";
import {
  CONTENT_BRANCH,
  LANDSCAPES_HELP,
  MAX_LANDSCAPES,
  MAX_PLACES,
  PLACES_HELP,
  PLACEHOLDER_IMAGE_LABEL,
  PUBLISH_COLLECTION,
  PUBLISH_REQUEST_FILE,
  generateDecapConfig,
  renderDecapYaml,
  type DecapCollection,
  type DecapField,
} from "../decap-config.ts";
import { generateDecapConfigForSite } from "../generate.ts";
import {
  PLACEHOLDER_VALUE,
  defaultPublishing,
  PublishingSettings,
  publishingConflicts,
  readPublishing,
  resolvePublishing,
} from "../settings.ts";

/** Optional collections a site turns on in its site.config features, in menu order. */
const OPTIONAL_TYPES = ["notices", "faq", "people", "documents"];
/**
 * The Hnátek prototypes and the optional collections and singletons each turns on. None of them
 * has optional collections since 2026-11-14 (hnatek-c and hnatek-e dropped their fictional trial
 * content); the neutral fixture covers those below.
 */
const CLIENTS: { id: string; template: string; optional: string[]; singletons: string[] }[] = [
  { id: "hnatek", template: "rodinna-tradice", optional: [], singletons: [] },
  { id: "hnatek-b", template: "dustojna-jednoduchost", optional: [], singletons: [] },
  { id: "hnatek-c", template: "nocni-linka", optional: [], singletons: [] },
  { id: "hnatek-d", template: "rodinny-rozhovor", optional: [], singletons: [] },
  { id: "hnatek-e", template: "krok-za-krokem", optional: [], singletons: [] },
  { id: "hnatek-f", template: "zpravodaj", optional: [], singletons: [] },
  { id: "hnatek-g", template: "lide-a-misto", optional: [], singletons: ["places"] },
];

const SITE_ID = "7b0c6a52-1f39-4c55-9a7e-2d1f0b8f4e11";

function settings(overrides: Partial<PublishingSettings> = {}): PublishingSettings {
  return { ...defaultPublishing("test-web"), ...overrides };
}

async function clientConfig(id: string, template: string, publishing = settings()) {
  return generateDecapConfigForSite({
    templateId: template,
    siteRoot: path.join(REPO_ROOT, "clients", id),
    configFile: null,
    publishing,
  });
}

function collection(collections: DecapCollection[], name: string): DecapCollection {
  const found = collections.find((candidate) => candidate.name === name);
  if (found === undefined) {
    throw new Error(`no collection ${name}`);
  }
  return found;
}

/** Every field of a collection or file, with its dotted path. */
function walk(fields: DecapField[], prefix = ""): { path: string; field: DecapField }[] {
  return fields.flatMap((field) => {
    const here = `${prefix}${field.name}`;
    const nested = [...(field.fields ?? [])];
    return [{ path: here, field }, ...walk(nested, `${here}.`)];
  });
}

function allFields(collections: DecapCollection[]): { path: string; field: DecapField }[] {
  return collections.flatMap((entry) => {
    if ("files" in entry) {
      return entry.files.flatMap((file) => walk(file.fields, `${entry.name}/${file.name}:`));
    }
    return walk(entry.fields, `${entry.name}:`);
  });
}

describe.each(CLIENTS)("Decap config for $id ($template)", ({ id, template, optional, singletons }) => {
  it("targets the content branch through DecapBridge, with placeholders until configured", async () => {
    const { config, yaml } = await clientConfig(id, template);
    expect(config.backend.name).toBe("git-gateway");
    expect(config.backend.branch).toBe(CONTENT_BRANCH);
    expect(config.backend.repo).toBe(`${PLACEHOLDER_VALUE}/${PLACEHOLDER_VALUE}`);
    expect(config.backend.identity_url).toBe(`https://auth.decapbridge.com/sites/${PLACEHOLDER_VALUE}`);
    expect(config.backend.gateway_url).toBe("https://gateway.decapbridge.com");
    expect(config.publish_mode).toBe("simple");
    expect(config.locale).toBe("cs");
    expect(config.media_folder).toBe("src/assets/media");
    expect(config.public_folder).toBe("src/assets/media");
    // site.config siteUrl is still the example.invalid placeholder for both variants.
    expect(config.site_url).toBeUndefined();
    expect(yaml).toContain(PLACEHOLDER_VALUE);
  });

  it("uses the client's own repository and DecapBridge site when they are set", async () => {
    const { config } = await clientConfig(
      id,
      template,
      settings({
        repository: `agency/${id}-web`,
        decapbridge: { ...settings().decapbridge, siteId: SITE_ID },
      }),
    );
    expect(config.backend.repo).toBe(`agency/${id}-web`);
    expect(config.backend.identity_url).toBe(`https://auth.decapbridge.com/sites/${SITE_ID}`);
  });

  it("offers exactly the editable areas, with the nonstop line as its own menu entry", async () => {
    const { config } = await clientConfig(id, template);
    expect(config.collections.map((entry) => entry.name)).toEqual([
      "zakladni-informace",
      "nonstop",
      "stranky",
      "services",
      "cenik",
      "guidance",
      "coffins",
      "flowers",
      ...optional,
      "zverejneni",
    ]);
    const basic = collection(config.collections, "zakladni-informace");
    expect("files" in basic && basic.files.map((file) => file.name)).toEqual([
      "company",
      "contact",
      "office-hours",
      ...singletons,
    ]);
  });

  it("shows one entry per existing page the template renders, never creatable or deletable", async () => {
    const manifest = await loadManifest(template);
    const { config } = await clientConfig(id, template);
    const pages = collection(config.collections, "stranky");
    if (!("files" in pages)) {
      throw new Error("pages must be a files collection");
    }
    const existing = (await readdir(path.join(REPO_ROOT, "clients", id, "src", "content", "pages"))).map(
      (name) => name.replace(/\.md$/, ""),
    );
    const expected = existing.filter((pageId) => manifest.pageFields[pageId] !== undefined);
    expect(pages.files.map((file) => file.name).sort()).toEqual(expected.sort());
    for (const file of pages.files) {
      const visible = file.fields.filter((field) => field.widget !== "hidden").map((field) => field.name);
      for (const name of visible) {
        expect(manifest.pageFields[file.name], `${file.name}.${name}`).toContain(name);
      }
    }
  });

  it("never exposes locked or agent-only fields", async () => {
    const { config } = await clientConfig(id, template);
    const fields = allFields(config.collections);
    const widgetOf = (suffix: string): string[] =>
      fields.filter((entry) => entry.path.endsWith(suffix)).map((entry) => entry.field.widget);
    for (const locked of [
      "nonstop/emergency:enabled",
      "nonstop/emergency:label",
      "nonstop/emergency:availability",
      "zakladni-informace/contact:locations.geo",
      "zakladni-informace/contact:phones.department",
      "cenik/pricing:currency",
      "services:priceGroupId",
    ]) {
      expect(widgetOf(locked), locked).toEqual(["hidden"]);
    }
    for (const entry of fields) {
      if (
        entry.field.name === "placeholder" ||
        entry.field.name === "id" ||
        entry.field.name === "rightsConfirmedFor"
      ) {
        expect(entry.field.widget, entry.path).toBe("hidden");
      }
    }
    // Design, configuration and code are never fields.
    const names = new Set(fields.map((entry) => entry.field.name));
    for (const forbidden of [
      "template",
      "options",
      "features",
      "palette",
      "homepage",
      "siteUrl",
      "css",
      "layout",
    ]) {
      expect(names.has(forbidden), forbidden).toBe(false);
    }
  });

  it("states `required` on every field, never pre-fills dates and never pre-approves", async () => {
    const { config } = await clientConfig(id, template);
    for (const { path: fieldPath, field } of allFields(config.collections)) {
      expect(typeof field.required, fieldPath).toBe("boolean");
      if (field.widget === "datetime") {
        expect(field.default, fieldPath).toBe("");
      }
      if (field.name === "rightsConfirmed") {
        expect(field.default, fieldPath).toBeUndefined();
      }
      if (field.name === "status" && field.widget === "select") {
        expect(field.default, fieldPath).toBe("demo");
      }
      if (field.widget === "markdown") {
        expect(field.editor_components, fieldPath).toEqual([]);
        expect(field.modes, fieldPath).toEqual(["rich_text"]);
        expect(field.buttons, fieldPath).not.toContain("code-block");
      }
      if (field.widget === "image") {
        expect(field.required, fieldPath).toBe(false);
        expect(field.choose_url, fieldPath).toBe(false);
      }
    }
    expect(JSON.stringify(config)).toContain(PLACEHOLDER_IMAGE_LABEL);
  });

  it("keeps fixed page files fixed and lets the editor add services, guidance and catalogue items", async () => {
    const { config } = await clientConfig(id, template);
    for (const entry of config.collections) {
      if ("folder" in entry) {
        expect(entry.create, entry.name).toBe(true);
        expect(entry.delete, entry.name).toBe(true);
        expect(entry.folder).toBe(`src/content/${entry.name}`);
      }
    }
  });

  it("declares every key the client's content holds, so a save keeps it", async () => {
    const { config } = await clientConfig(id, template);
    const contentDir = path.join(REPO_ROOT, "clients", id, "src", "content");
    const missing: string[] = [];
    const check = (data: unknown, fields: DecapField[], where: string): void => {
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return;
      }
      for (const [key, value] of Object.entries(data)) {
        const field = fields.find((candidate) => candidate.name === key);
        if (field === undefined) {
          missing.push(`${where}.${key}`);
          continue;
        }
        if (field.widget === "hidden" || field.fields === undefined) {
          continue;
        }
        const items = Array.isArray(value) ? value : [value];
        for (const item of items) {
          check(item, field.fields, `${where}.${key}`);
        }
      }
    };
    for (const entry of config.collections) {
      // The publish request is created by the editor's first save; the client has none.
      if (entry.name === PUBLISH_COLLECTION) {
        continue;
      }
      if ("files" in entry) {
        for (const file of entry.files) {
          const source = await readFile(path.join(REPO_ROOT, "clients", id, file.file), "utf8");
          let data: unknown;
          if (file.file.endsWith(".json")) {
            data = JSON.parse(source);
          } else {
            data = parse(splitFrontmatter(source)?.frontmatter ?? "");
          }
          check(data, file.fields, file.file);
        }
        continue;
      }
      for (const name of await readdir(path.join(contentDir, entry.name))) {
        const source = await readFile(path.join(contentDir, entry.name, name), "utf8");
        check(parse(splitFrontmatter(source)?.frontmatter ?? ""), entry.fields, `${entry.name}/${name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("renders YAML that parses back to the same config", async () => {
    const { config, yaml } = await clientConfig(id, template);
    expect(parse(yaml)).toEqual(JSON.parse(JSON.stringify(config)));
  });
});

describe.each(["nocni-linka", "krok-za-krokem"])("Decap config for the neutral fixture on %s", (template) => {
  it("offers notices, FAQ, people and documents when the site turns them on", async () => {
    const { config } = await generateDecapConfigForSite({
      templateId: template,
      siteRoot: path.join(REPO_ROOT, "fixtures", "neutral"),
      configFile: path.join(REPO_ROOT, "templates", template, "fixture.site.config.ts"),
      publishing: settings(),
    });
    const names = config.collections.map((entry) => entry.name);
    const optional = names.filter((name) => OPTIONAL_TYPES.includes(name));
    expect(optional).toEqual(OPTIONAL_TYPES);
    expect(names.indexOf("flowers")).toBeLessThan(names.indexOf("notices"));
    expect(names.indexOf("documents")).toBeLessThan(names.indexOf("zverejneni"));
  });
});

describe("the two Hnátek variants", () => {
  it("get template-specific configs from one generator", async () => {
    const a = await clientConfig("hnatek", "rodinna-tradice");
    const b = await clientConfig("hnatek-b", "dustojna-jednoduchost");
    expect(a.yaml).toContain("generated for template rodinna-tradice");
    expect(b.yaml).toContain("generated for template dustojna-jednoduchost");
  });

  it("have separate publishing settings on Netlify, nothing shared", async () => {
    const a = await readPublishing(path.join(REPO_ROOT, "clients", "hnatek"));
    const b = await readPublishing(path.join(REPO_ROOT, "clients", "hnatek-b"));
    expect(a?.hosting.provider).toBe("netlify");
    expect(b?.hosting.provider).toBe("netlify");
    expect(
      publishingConflicts(
        [
          { id: "hnatek", settings: a as PublishingSettings },
          { id: "hnatek-b", settings: b as PublishingSettings },
        ],
        "SmejkalJakub/pohrebnictvi-hnatek",
      ),
    ).toEqual([]);
  });
});

describe("publishing settings", () => {
  const base = settings({
    repository: "agency/a-web",
    decapbridge: { ...settings().decapbridge, siteId: SITE_ID },
  });

  it("reports two sites sharing a repository, a DecapBridge site or a Worker", () => {
    const problems = publishingConflicts(
      [
        { id: "a", settings: base },
        { id: "b", settings: { ...base, hosting: { provider: "cloudflare", workerName: "b-web" } } },
      ],
      null,
    );
    expect(problems.join("\n")).toContain('same repository "agency/a-web"');
    expect(problems.join("\n")).toContain("same DecapBridge site");
    const workers = publishingConflicts(
      [
        { id: "a", settings: settings() },
        { id: "b", settings: settings() },
      ],
      null,
    );
    expect(workers.join("\n")).toContain('same Cloudflare Worker "test-web"');
  });

  it("reports two sites sharing a Netlify project and lists a missing project id", () => {
    const netlify = (siteId: string | null): PublishingSettings => ({
      ...settings(),
      hosting: { provider: "netlify", siteId },
    });
    const problems = publishingConflicts(
      [
        { id: "a", settings: netlify(SITE_ID) },
        { id: "b", settings: netlify(SITE_ID) },
      ],
      null,
    );
    expect(problems.join("\n")).toContain("same Netlify project");
    const resolved = resolvePublishing(netlify(null));
    expect(resolved.missing).toContain("hosting.siteId");
    expect(resolved.hosting).toEqual({ provider: "netlify", siteId: PLACEHOLDER_VALUE });
  });

  it("accepts a Netlify Project ID or project name, nothing else", () => {
    const parse = (siteId: string) =>
      PublishingSettings.safeParse({ ...settings(), hosting: { provider: "netlify", siteId } }).success;
    expect(parse(SITE_ID)).toBe(true);
    expect(parse("hnatek")).toBe(true);
    expect(parse("Hnatek Web")).toBe(false);
    expect(parse("hnatek; rm -rf /")).toBe(false);
  });

  it("refuses the agency source repository as a CMS target", () => {
    const problems = publishingConflicts(
      [{ id: "a", settings: { ...base, repository: "SmejkalJakub/pohrebnictvi-hnatek" } }],
      "smejkaljakub/pohrebnictvi-hnatek",
    );
    expect(problems[0]).toContain("agency source repository");
  });

  it("lists unknown values and fills them with the placeholder", () => {
    const resolved = resolvePublishing(settings());
    expect(resolved.missing).toEqual(["repository", "decapbridge.siteId"]);
    expect(resolved.repository).toBe(`${PLACEHOLDER_VALUE}/${PLACEHOLDER_VALUE}`);
  });

  it("generates the PKCE backend block in the DecapBridge dashboard's shape", async () => {
    const manifest = await loadManifest("rodinna-tradice");
    const config = generateDecapConfig({
      manifest,
      features: { articles: false },
      pageIds: ["home"],
      publishing: resolvePublishing({ ...base, decapbridge: { ...base.decapbridge, authType: "pkce" } }),
    });
    expect(config.backend).toMatchObject({
      name: "git-gateway",
      repo: "agency/a-web",
      branch: "content",
      auth_type: "pkce",
      base_url: "https://auth.decapbridge.com",
      auth_endpoint: `/sites/${SITE_ID}/pkce`,
      auth_token_endpoint: `/sites/${SITE_ID}/token`,
      gateway_url: "https://gateway.decapbridge.com",
    });
    expect(config.backend.identity_url).toBeUndefined();
  });
});

describe("optional collections", () => {
  async function generated(manifest: TemplateManifest, features: { articles: boolean; notices?: boolean }) {
    return generateDecapConfig({
      manifest,
      features,
      pageIds: ["home", "clanky", "oznameni"],
      publishing: resolvePublishing(settings()),
    });
  }

  it("adds articles only when the feature is on and the template supports them", async () => {
    const manifest = await loadManifest("rodinna-tradice");
    const supporting: TemplateManifest = {
      ...manifest,
      supports: { ...manifest.supports, articles: true },
      pageFields: { ...manifest.pageFields, clanky: ["title", "navLabel", "metaDescription", "body"] },
    };
    const names = async (m: TemplateManifest, articles: boolean) =>
      (await generated(m, { articles })).collections.map((entry) => entry.name);
    expect(await names(manifest, true)).not.toContain("articles");
    expect(await names(supporting, false)).not.toContain("articles");
    const withArticles = await generated(supporting, { articles: true });
    const articles = collection(withArticles.collections, "articles");
    expect("folder" in articles && articles.create).toBe(true);
    if ("folder" in articles) {
      const draft = articles.fields.find((field) => field.name === "draft");
      expect(draft?.default).toBe(true);
      expect(articles.fields.map((field) => field.name)).toEqual(
        expect.arrayContaining(["title", "summary", "publishedAt", "image", "body"]),
      );
    }
    const pages = collection(withArticles.collections, "stranky");
    expect("files" in pages && pages.files.map((file) => file.name)).toContain("clanky");
  });

  it("adds notices only when the feature is on and supported", async () => {
    const manifest = await loadManifest("rodinna-tradice");
    const names = (await generated(manifest, { articles: false, notices: true })).collections.map(
      (entry) => entry.name,
    );
    expect(names).not.toContain("notices");
    const supporting: TemplateManifest = { ...manifest, supports: { ...manifest.supports, notices: true } };
    const withNotices = await generated(supporting, { articles: false, notices: true });
    expect(withNotices.collections.map((entry) => entry.name)).toContain("notices");
  });
});

describe.each([
  {
    feature: "landscapes",
    // No shipped template supports landscapes since 2026-11-14; the test switches support on.
    template: "krok-za-krokem",
    file: "landscapes.json",
    label: "Krajiny",
    list: "images",
    max: MAX_LANDSCAPES,
    coreMax: MAX_LANDSCAPE_IMAGES,
    help: LANDSCAPES_HELP,
    rules: ["lidé", "západ slunce", "mraky", "květiny", "fotobanky", "počítačem"],
    required: "place",
  },
  {
    feature: "places",
    template: "lide-a-misto",
    file: "places.json",
    label: "Naše místa",
    list: "places",
    max: MAX_PLACES,
    coreMax: CORE_MAX_PLACES,
    help: PLACES_HELP,
    rules: ["vlastní nebo zakázkové", "fotobanky", "počítačem"],
    required: "name",
  },
] as const)("optional singleton $file ($label)", (spec) => {
  async function generated(supported: boolean, on: boolean) {
    const manifest = await loadManifest(spec.template);
    const config = generateDecapConfig({
      manifest: { ...manifest, supports: { ...manifest.supports, [spec.feature]: supported } },
      features: { articles: false, [spec.feature]: on },
      pageIds: ["home"],
      publishing: resolvePublishing(settings()),
    });
    const basics = collection(config.collections, "zakladni-informace");
    if (!("files" in basics)) {
      throw new Error("zakladni-informace is not a files collection");
    }
    return basics.files.find((file) => file.name === spec.feature);
  }

  it("appears under Základní informace only while the feature is on and supported", async () => {
    expect(await generated(true, false)).toBeUndefined();
    expect(await generated(false, true)).toBeUndefined();
    const file = await generated(true, true);
    expect(file?.label).toBe(spec.label);
    expect(file?.file).toBe(`src/content/site/${spec.file}`);
  });

  it("states the guardrail and the core limit on the list", async () => {
    const list = (await generated(true, true))?.fields.find((field) => field.name === spec.list);
    expect(spec.max).toBe(spec.coreMax);
    expect(list?.max).toBe(spec.max);
    expect(list?.hint).toBe(spec.help);
    for (const rule of spec.rules) {
      expect(spec.help).toContain(rule);
    }
    expect(list?.fields?.find((field) => field.name === spec.required)?.required).toBe(true);
  });

  it("declares every key of the neutral fixture's file", async () => {
    const file = await generated(true, true);
    const data = JSON.parse(
      await readFile(
        path.join(REPO_ROOT, "fixtures", "neutral", "src", "content", "site", spec.file),
        "utf8",
      ),
    ) as unknown;
    const missing: string[] = [];
    const check = (value: unknown, fields: DecapField[], where: string): void => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        const field = fields.find((candidate) => candidate.name === key);
        if (field === undefined) {
          missing.push(`${where}.${key}`);
          continue;
        }
        if (field.fields === undefined) {
          continue;
        }
        const items = Array.isArray(child) ? child : [child];
        for (const item of items) {
          check(item, field.fields, `${where}.${key}`);
        }
      }
    };
    check(data, file?.fields ?? [], spec.file);
    expect(missing).toEqual([]);
  });
});

describe("publishing from the editor", () => {
  it("ends the menu with one publish request entry outside every content collection", async () => {
    const manifest = await loadManifest("rodinna-tradice");
    const config = generateDecapConfig({
      manifest,
      features: { articles: false },
      pageIds: ["home"],
      publishing: resolvePublishing(settings()),
    });
    const last = config.collections.at(-1);
    expect(last?.name).toBe(PUBLISH_COLLECTION);
    expect(last !== undefined && "files" in last && last.files).toEqual([
      expect.objectContaining({ name: "request", file: PUBLISH_REQUEST_FILE }),
    ]);
    if (last !== undefined && "files" in last) {
      const fields = last.files[0]!.fields;
      expect(fields.map((field) => [field.name, field.widget, field.required])).toEqual([
        ["note", "text", true],
        ["requestedAt", "hidden", false],
      ]);
    }
    // No Astro collection, gate rule or other menu entry reads or writes that folder.
    const otherPaths = config.collections
      .filter((entry) => entry.name !== PUBLISH_COLLECTION)
      .flatMap((entry) => {
        if ("files" in entry) {
          return entry.files.map((file) => file.file);
        }
        return [entry.folder];
      });
    expect(otherPaths.filter((file) => file.startsWith("src/content/publish"))).toEqual([]);
    const collections = await readFile(path.join(REPO_ROOT, "core", "content", "collections.ts"), "utf8");
    expect(collections).not.toMatch(/["']publish["']/);
  });
});

describe("rendered file", () => {
  it("carries the do-not-edit header", async () => {
    const manifest = await loadManifest("rodinna-tradice");
    const config = generateDecapConfig({
      manifest,
      features: { articles: false },
      pageIds: ["home"],
      publishing: resolvePublishing(settings()),
    });
    const yaml = renderDecapYaml(config, { templateId: manifest.id, templateVersion: manifest.version });
    expect(yaml.startsWith("# Decap CMS configuration, generated for template rodinna-tradice")).toBe(true);
    expect(yaml).toContain("Neupravujte ručně");
  });
});
