/// <reference lib="dom" />
// Cross-template structural checks (design-differentiation §6), for every pair of templates.
// Source checks read the repository; DOM checks load each built homepage from its preview server;
// legal checks (research §4a) read the built HTML in dist/. The collected evidence is written
// to docs/qa/structure.json for the Phase 2 report.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { baseUrlFor, discoverRoutes, repoRoot, templatePairs, templates, type TemplateUnderTest } from "./templates.ts";

const coreDir = join(repoRoot, "core");
const evidenceFile = join(repoRoot, "docs/qa/structure.json");

/** Merges one key into docs/qa/structure.json (tests may run in different workers). */
function record(key: string, value: unknown): void {
  mkdirSync(dirname(evidenceFile), { recursive: true });
  let current: Record<string, unknown> = {};
  if (existsSync(evidenceFile)) {
    current = JSON.parse(readFileSync(evidenceFile, "utf8")) as Record<string, unknown>;
  }
  current[key] = value;
  const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(evidenceFile, `${JSON.stringify(sorted, null, 2)}\n`);
}

function listFiles(dir: string, filter: (file: string) => boolean): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) {
    return out;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".astro"].includes(entry.name)) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full, filter));
    } else if (filter(full)) {
      out.push(full);
    }
  }
  return out;
}

const SOURCE_EXT = new Set([".astro", ".ts", ".mts", ".js", ".mjs", ".css"]);

/** Import specifiers in a source file: ES imports/exports, dynamic imports and CSS @import. */
function importSpecifiers(source: string): string[] {
  const patterns = [
    /\bimport\s+(?:type\s+)?[^"'`;]*?\bfrom\s*["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?[^"'`;]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    /@import\s+(?:url\()?\s*["']([^"']+)["']/g,
  ];
  const found: string[] = [];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier !== undefined) {
        found.push(specifier);
      }
    }
  }
  return found;
}

/**
 * Files loaded by Node before Vite (and its @core alias) exists. astro.config.mjs must reach the
 * integration relatively; fixture.site.config.ts is template-development wiring (selected by
 * SITE_CONFIG) with an erased `import type`, mirroring a client's src/site.config.ts. Neither is
 * template source under src/.
 */
const BOOTSTRAP_EXCEPTIONS = new Set([
  "astro.config.mjs → ../../core/integration.ts",
  "fixture.site.config.ts → ../../core/content/config.ts",
]);

async function homeStructure(
  page: Page,
  t: TemplateUnderTest,
): Promise<{
  sections: string[];
  header: string;
  hero: string;
  nav: string;
}> {
  await page.goto(`${baseUrlFor(t)}/`);
  return page.evaluate(() => {
    // Outline = tag names and roles only (no classes, ids or data-astro attributes), so it reflects
    // DOM structure rather than styling.
    const outline = (el: Element | null, depth = 0): string => {
      if (el === null) {
        return "(none)";
      }
      const role = el.getAttribute("role");
      const tag = role === null ? el.tagName.toLowerCase() : `${el.tagName.toLowerCase()}[role=${role}]`;
      if (tag === "svg" || depth >= 7) {
        return tag;
      }
      const children = Array.from(el.children)
        .filter((c) => c.tagName !== "SCRIPT" && c.tagName !== "STYLE")
        .map((c) => outline(c, depth + 1));
      if (children.length === 0) {
        return tag;
      }
      return `${tag}(${children.join(",")})`;
    };
    const main = document.querySelector("main");
    // Interludes between sections (E's landscape bands and stamp lines, marked data-interlude) are
    // decoration, not sections: they are left out so no template passes the order check by them.
    const children = Array.from(main?.children ?? []).filter((child) => !child.hasAttribute("data-interlude"));
    const sections = children.map((child) => {
      const section = child.getAttribute("data-section");
      if (section !== null) {
        return section;
      }
      if (child.hasAttribute("data-hero")) {
        return "hero";
      }
      return child.tagName.toLowerCase();
    });
    const header = document.querySelector("body > header, body > * > header");
    const hero = main?.firstElementChild ?? null;
    const nav = document.querySelector("nav");
    return { sections, header: outline(header), hero: outline(hero), nav: outline(nav) };
  });
}

/** Outline of <main> (tag names and roles only), as in homeStructure. Runs in the page. */
function mainOutline(): string {
  const outline = (el: Element | null, depth = 0): string => {
    if (el === null) {
      return "(none)";
    }
    const role = el.getAttribute("role");
    const tag = role === null ? el.tagName.toLowerCase() : `${el.tagName.toLowerCase()}[role=${role}]`;
    if (tag === "svg" || depth >= 7) {
      return tag;
    }
    const children = Array.from(el.children)
      .filter((c) => c.tagName !== "SCRIPT" && c.tagName !== "STYLE")
      .map((c) => outline(c, depth + 1));
    if (children.length === 0) {
      return tag;
    }
    return `${tag}(${children.join(",")})`;
  };
  return outline(document.querySelector("main"));
}

test.describe("cross-template structure", () => {
  test.describe.configure({ mode: "default" });

  test("no shared component file names between any two templates' src/components/", () => {
    const names = new Map(
      templates.map((t) => [
        t.id,
        listFiles(join(t.dir, "src/components"), () => true)
          .map((f) => basename(f, extname(f)))
          .sort(),
      ]),
    );
    const shared: string[] = [];
    for (const [first, second] of templatePairs()) {
      const a = names.get(first.id) ?? [];
      const b = names.get(second.id) ?? [];
      for (const name of a.filter((candidate) => b.includes(candidate))) {
        shared.push(`${first.letter}/${second.letter}: ${name}`);
      }
    }
    record("components", { ...Object.fromEntries(names), shared });
    for (const t of templates) {
      expect((names.get(t.id) ?? []).length, `${t.id} has no components`).toBeGreaterThan(0);
    }
    expect(shared, `shared component names: ${shared.join(", ")}`).toEqual([]);
  });

  test("templates import core only via @core/", () => {
    const violations: string[] = [];
    const exceptions: string[] = [];
    for (const t of templates) {
      const files = listFiles(t.dir, (f) => SOURCE_EXT.has(extname(f)));
      for (const file of files) {
        const source = readFileSync(file, "utf8");
        for (const specifier of importSpecifiers(source)) {
          if (!specifier.startsWith(".")) {
            continue;
          }
          const target = resolve(dirname(file), specifier);
          if (!(target === coreDir || target.startsWith(`${coreDir}${sep}`))) {
            continue;
          }
          const entry = `${relative(t.dir, file)} → ${specifier}`;
          if (BOOTSTRAP_EXCEPTIONS.has(entry)) {
            exceptions.push(`${t.id}: ${entry}`);
          } else {
            violations.push(`${t.id}: ${entry}`);
          }
        }
      }
    }
    record("coreImports", { violations, allowedBootstrapExceptions: exceptions });
    expect(violations, violations.join("\n")).toEqual([]);
  });

  test("core contains no <style> blocks, stylesheets or default class names", () => {
    const files = listFiles(coreDir, (f) => [".astro", ".css", ".scss"].includes(extname(f)));
    const problems: string[] = [];
    for (const file of files) {
      const rel = relative(repoRoot, file);
      if (extname(file) !== ".astro") {
        problems.push(`${rel}: stylesheet in core`);
        continue;
      }
      const source = readFileSync(file, "utf8");
      if (/<style[\s>]/.test(source)) {
        problems.push(`${rel}: <style> block`);
      }
      // A literal class attribute (class="…" or class='…') is a default class name; class={prop} is fine.
      for (const match of source.matchAll(/\bclass(?::list)?\s*=\s*(["'])([^"']*)\1/g)) {
        problems.push(`${rel}: default class "${match[2]}"`);
      }
      if (/\bstyle\s*=\s*["']/.test(source)) {
        problems.push(`${rel}: inline style attribute`);
      }
    }
    record("coreHeadless", { filesChecked: files.map((f) => relative(repoRoot, f)), problems });
    expect(files.length).toBeGreaterThan(0);
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("homepage section order differs in at least 3 positions; header, nav and hero outlines differ (every pair)", async ({
    page,
  }) => {
    const structures = new Map<string, Awaited<ReturnType<typeof homeStructure>>>();
    for (const t of templates) {
      structures.set(t.id, await homeStructure(page, t));
    }
    const problems: string[] = [];
    const differingByPair: Record<string, number[]> = {};
    for (const [first, second] of templatePairs()) {
      const a = structures.get(first.id);
      const b = structures.get(second.id);
      if (a === undefined || b === undefined) {
        continue;
      }
      const pair = `${first.letter}/${second.letter}`;
      const length = Math.max(a.sections.length, b.sections.length);
      const differing: number[] = [];
      for (let i = 0; i < length; i += 1) {
        if (a.sections[i] !== b.sections[i]) {
          differing.push(i + 1);
        }
      }
      differingByPair[pair] = differing;
      if (differing.length < 3) {
        problems.push(`${pair}: order differs in ${differing.length} positions (${a.sections.join(" → ")} / ${b.sections.join(" → ")})`);
      }
      if (a.header === b.header) {
        problems.push(`${pair}: same header outline`);
      }
      if (a.nav === b.nav) {
        problems.push(`${pair}: same nav outline`);
      }
      if (a.hero === b.hero) {
        problems.push(`${pair}: same hero outline`);
      }
    }
    record("homepage", { ...Object.fromEntries(structures), sectionPositionsDiffering: differingByPair });
    for (const t of templates) {
      const structure = structures.get(t.id);
      expect(structure?.sections.length ?? 0, `${t.id}: too few homepage sections`).toBeGreaterThan(2);
      expect(structure?.header, `${t.id}: no page header`).not.toBe("(none)");
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("route sets follow supports.serviceDetailPages and differ for every pair", async ({ page }) => {
    const detail = /^\/sluzby\/[^/]+\/$/;
    const routes = new Map(templates.map((t) => [t.id, discoverRoutes(t).map((r) => r.path)]));
    record("routes", Object.fromEntries(routes));
    for (const t of templates) {
      const manifest = await loadManifest(t);
      const paths = routes.get(t.id) ?? [];
      expect(paths, `${t.id} must emit /sluzby/`).toContain("/sluzby/");
      const detailPaths = paths.filter((r) => detail.test(r));
      if (manifest.supports.serviceDetailPages) {
        expect(detailPaths.length, `${t.id} must emit service detail pages`).toBeGreaterThan(0);
      } else {
        expect(detailPaths, `${t.id} must not emit service detail pages`).toEqual([]);
      }
    }
    // There are only two services IAs (anchors or detail pages), so from three templates on some
    // pair shares one, and two templates that support the same content types then emit the same
    // routes. Such a pair passes only if its services pages differ in structure: the DOM outline
    // of /sluzby/ and of the first detail page (tags and roles, no classes) must differ.
    const sameRoutes: string[] = [];
    for (const [first, second] of templatePairs()) {
      const a = [...(routes.get(first.id) ?? [])].sort().join("\n");
      const b = [...(routes.get(second.id) ?? [])].sort().join("\n");
      if (a !== b) {
        continue;
      }
      sameRoutes.push(`${first.letter}/${second.letter}`);
      const firstDetail = (routes.get(first.id) ?? []).find((r) => detail.test(r)) ?? "/sluzby/";
      for (const path of ["/sluzby/", firstDetail]) {
        const outlines: string[] = [];
        for (const t of [first, second]) {
          await page.goto(`${baseUrlFor(t)}${path}`);
          outlines.push(await page.evaluate(mainOutline));
        }
        expect(outlines[0], `${first.letter}/${second.letter}: identical routes and identical ${path} structure`).not.toBe(
          outlines[1],
        );
      }
    }
    record("sameRouteSetPairs", sameRoutes);
  });
});

// ---------------------------------------------------------------------------
// Law (research §4a), read from the built HTML of every template
// ---------------------------------------------------------------------------

interface ManifestLike {
  supports: { serviceDetailPages: boolean; notices: boolean };
}

async function loadManifest(t: TemplateUnderTest): Promise<ManifestLike> {
  const module = (await import(join(t.dir, "template.manifest.ts"))) as { default: ManifestLike };
  return module.default;
}

function builtHtml(t: TemplateUnderTest, path: string): string {
  let file = join(t.dist, path, "index.html");
  if (path.endsWith(".html")) {
    file = join(t.dist, path);
  }
  return readFileSync(file, "utf8");
}

const company = JSON.parse(
  readFileSync(join(repoRoot, "fixtures/neutral/src/content/site/company.json"), "utf8"),
) as { legalName: string };

test.describe("law: notices, footer identification, VAT note", () => {
  test("notice pages carry nothing promotional (L1)", async () => {
    const report: Record<string, string[]> = {};
    const problems: string[] = [];
    for (const t of templates) {
      const manifest = await loadManifest(t);
      const noticePaths = discoverRoutes(t)
        .map((r) => r.path)
        .filter((path) => path.startsWith("/oznameni/"));
      report[t.id] = noticePaths;
      if (!manifest.supports.notices) {
        expect(noticePaths, `${t.id} does not support notices but emits /oznameni/`).toEqual([]);
        continue;
      }
      expect(noticePaths.length, `${t.id} supports notices but emits none`).toBeGreaterThan(1);
      for (const path of noticePaths) {
        const html = builtHtml(t, path);
        if (/\bdata-price\b/.test(html)) {
          problems.push(`${t.id} ${path}: a <PriceValue> price`);
        }
        if (/href="\/(sluzby|cenik)\//.test(html)) {
          problems.push(`${t.id} ${path}: a link to services or prices`);
        }
        if (/objedn/i.test(html)) {
          problems.push(`${t.id} ${path}: "Objednat"-style wording`);
        }
        if (/\bdata-section=/.test(html)) {
          problems.push(`${t.id} ${path}: a homepage section`);
        }
        if (!/\bdata-emergency-link\b/.test(html)) {
          problems.push(`${t.id} ${path}: no nonstop link (invariant 1 applies here too)`);
        }
      }
    }
    record("noticePages", report);
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("every page's footer shows the legal identification (L8)", () => {
    const problems: string[] = [];
    for (const t of templates) {
      for (const route of discoverRoutes(t)) {
        const html = builtHtml(t, route.path);
        const footer = html.slice(html.lastIndexOf("<footer"));
        if (!footer.includes(company.legalName)) {
          problems.push(`${t.id} ${route.path}: footer lacks the legal name`);
        }
        if (!footer.includes("IČO")) {
          problems.push(`${t.id} ${route.path}: footer lacks IČO`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("landscape bands: never on notice pages, never in the first viewport (E)", async ({ page }) => {
    const problems: string[] = [];
    const report: Record<string, Record<string, number>> = {};
    for (const t of templates) {
      for (const route of discoverRoutes(t)) {
        const html = builtHtml(t, route.path);
        const bands = (html.match(/\bdata-band\b/g) ?? []).length;
        if (route.path.startsWith("/oznameni/")) {
          if (/\bdata-interlude\b/.test(html)) {
            problems.push(`${t.id} ${route.path}: a landscape band or stamp line on a notice page (L1)`);
          }
          continue;
        }
        if (bands === 0) {
          continue;
        }
        report[t.id] = { ...(report[t.id] ?? {}), [route.path]: bands };
        for (const size of [
          { width: 375, height: 667 },
          { width: 1280, height: 800 },
        ]) {
          await page.setViewportSize(size);
          await page.goto(`${baseUrlFor(t)}${route.path}`);
          const tops = await page.evaluate(() =>
            Array.from(document.querySelectorAll("[data-band]")).map((band) => band.getBoundingClientRect().top),
          );
          for (const top of tops) {
            if (top < size.height) {
              problems.push(`${t.id} ${route.path} @${size.width}: a band starts at ${Math.round(top)} px, inside the first viewport`);
            }
          }
        }
      }
    }
    record("landscapeBands", report);
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("path switch: never on notice pages; exactly one current path elsewhere (D)", () => {
    // Runs only on templates that mark two paths (a [data-path-switch] on the homepage). Notice
    // pages get the neutral chrome: no switch and no path panel (L1). Every other page except the
    // homepage and the 404 belongs to one path, so its switch has exactly one aria-current option.
    const problems: string[] = [];
    const report: Record<string, number> = {};
    for (const t of templates) {
      if (!/\bdata-path-switch\b/.test(builtHtml(t, "/"))) {
        continue;
      }
      let checked = 0;
      for (const route of discoverRoutes(t)) {
        const html = builtHtml(t, route.path);
        checked += 1;
        if (route.path.startsWith("/oznameni/")) {
          if (/\bdata-path-switch\b/.test(html)) {
            problems.push(`${t.id} ${route.path}: a path switch on a notice page`);
          }
          if (/\bdata-panel=/.test(html)) {
            problems.push(`${t.id} ${route.path}: a path panel on a notice page`);
          }
          continue;
        }
        if (route.path === "/" || route.path === "/404.html") {
          continue;
        }
        const start = html.search(/<nav\b[^>]*\bdata-path-switch\b/);
        if (start === -1) {
          problems.push(`${t.id} ${route.path}: no path switch`);
          continue;
        }
        const end = html.indexOf("</nav>", start);
        const current = (html.slice(start, end).match(/aria-current="page"/g) ?? []).length;
        if (current !== 1) {
          problems.push(`${t.id} ${route.path}: ${current} current options in the path switch`);
        }
      }
      report[t.id] = checked;
    }
    record("pathSwitch", report);
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("/cenik/ and every other page with a price render the VAT note (L9)", () => {
    const problems: string[] = [];
    for (const t of templates) {
      expect(builtHtml(t, "/cenik/"), `${t.id}: /cenik/ has no prices`).toMatch(/\bdata-price\b/);
      for (const route of discoverRoutes(t)) {
        const html = builtHtml(t, route.path);
        if (/\bdata-price\b/.test(html) && !/\bdata-vat-note\b/.test(html)) {
          problems.push(`${t.id} ${route.path}: prices without <VatNote> (data-vat-note)`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
