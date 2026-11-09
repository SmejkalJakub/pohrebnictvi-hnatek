/// <reference lib="dom" />
// Cross-template structural checks (design-differentiation §6). Source checks read the repository;
// DOM checks load each built homepage from its preview server. The collected evidence is written
// to docs/qa/structure.json for the Phase 2 report.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { baseUrlFor, discoverRoutes, repoRoot, templates, type TemplateUnderTest } from "./templates.ts";

const [templateA, templateB] = templates as [TemplateUnderTest, TemplateUnderTest];
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
    const sections = Array.from(main?.children ?? []).map((child) => {
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

test.describe("cross-template structure", () => {
  test.describe.configure({ mode: "default" });

  test("no shared component file names between the two src/components/", () => {
    const names = templates.map((t) =>
      listFiles(join(t.dir, "src/components"), () => true).map((f) => basename(f, extname(f))),
    );
    const [a = [], b = []] = names;
    const shared = a.filter((name) => b.includes(name));
    record("components", { [templateA.id]: a.sort(), [templateB.id]: b.sort(), shared });
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
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

  test("homepage section order differs in at least 3 positions; header, nav and hero outlines differ", async ({
    page,
  }) => {
    const a = await homeStructure(page, templateA);
    const b = await homeStructure(page, templateB);
    const length = Math.max(a.sections.length, b.sections.length);
    const differing: number[] = [];
    for (let i = 0; i < length; i += 1) {
      if (a.sections[i] !== b.sections[i]) {
        differing.push(i + 1);
      }
    }
    record("homepage", {
      [templateA.id]: a,
      [templateB.id]: b,
      sectionPositionsDiffering: differing,
    });
    expect(a.sections.length).toBeGreaterThan(2);
    expect(
      differing.length,
      `A ${a.sections.join(" → ")} / B ${b.sections.join(" → ")}`,
    ).toBeGreaterThanOrEqual(3);
    expect(a.header).not.toBe("(none)");
    expect(a.header).not.toBe(b.header);
    expect(a.nav).not.toBe(b.nav);
    expect(a.hero).not.toBe(b.hero);
  });

  test("route sets differ: B has /sluzby/<slug>/, A does not", () => {
    const routesA = discoverRoutes(templateA).map((r) => r.path);
    const routesB = discoverRoutes(templateB).map((r) => r.path);
    const detail = /^\/sluzby\/[^/]+\/$/;
    record("routes", { [templateA.id]: routesA, [templateB.id]: routesB });
    expect(
      routesA.filter((r) => detail.test(r)),
      "A must not emit service detail pages",
    ).toEqual([]);
    expect(routesB.filter((r) => detail.test(r)).length, "B must emit service detail pages").toBeGreaterThan(
      0,
    );
    expect(routesA).toContain("/sluzby/");
    expect(routesB).toContain("/sluzby/");
  });
});
