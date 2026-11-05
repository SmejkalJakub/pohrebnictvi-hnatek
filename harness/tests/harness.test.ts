/**
 * End-to-end checks of core inside a real Astro build.
 * `npm run test:harness` builds the prototype first; production builds run here into temp dirs.
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, describe, expect, it } from "vitest";

const run = promisify(execFile);
const HARNESS = fileURLToPath(new URL("..", import.meta.url));
const DIST = path.join(HARNESS, "dist");
const FIXTURE = fileURLToPath(new URL("../../fixtures/neutral", import.meta.url));
const ASTRO = path.join(HARNESS, "..", "node_modules", ".bin", "astro");
const temporary: string[] = [];

afterAll(async () => {
  for (const dir of temporary) {
    await rm(dir, { recursive: true, force: true });
  }
});

async function html(file: string, dist = DIST): Promise<string> {
  return readFile(path.join(dist, file), "utf8");
}

async function build(
  siteRoot: string,
  mode: string,
): Promise<{ ok: boolean; output: string; outDir: string }> {
  const outDir = await mkdtemp(path.join(os.tmpdir(), "harness-out-"));
  temporary.push(outDir);
  try {
    const result = await run(ASTRO, ["build"], {
      cwd: HARNESS,
      env: { ...process.env, SITE_ROOT: siteRoot, SITE_MODE: mode, HARNESS_OUT_DIR: outDir },
      maxBuffer: 20 * 1024 * 1024,
    });
    return { ok: true, output: result.stdout + result.stderr, outDir };
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string };
    return { ok: false, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}`, outDir };
  }
}

/** Copy the fixture and resolve every production blocker (mirrors core/tests/helpers.ts). */
async function productionReadyFixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "fixture-prod-"));
  temporary.push(root);
  await cp(FIXTURE, root, { recursive: true });
  const site = path.join(root, "src", "content", "site");
  const company = JSON.parse(await readFile(path.join(site, "company.json"), "utf8"));
  company.legalIds = {
    ico: "12345678",
    dic: null,
    registryEntry: "C 00000 vedená u Krajského soudu v Brně",
    registeredOffice: { street: "Ukázková 123/4", city: "Vzorov", postalCode: "000 00", country: "CZ" },
  };
  await writeFile(path.join(site, "company.json"), JSON.stringify(company), "utf8");
  const pricing = JSON.parse(await readFile(path.join(site, "pricing.json"), "utf8"));
  pricing.validFrom = "2026-11-01";
  pricing.vatNote = "Ceny jsou uvedeny včetně DPH.";
  for (const group of pricing.groups) {
    for (const item of group.items) {
      item.status = "approved";
    }
  }
  await writeFile(path.join(site, "pricing.json"), JSON.stringify(pricing), "utf8");
  const config = path.join(root, "src", "site.config.ts");
  const configSource = (await readFile(config, "utf8"))
    .replace("https://example.invalid", "https://www.pohrebni-sluzba-vzor.cz")
    .replace(/^import type .*$/m, "");
  await writeFile(config, configSource.replace(" satisfies SiteConfigInput", ""), "utf8");
  for (const collection of ["pages", "services", "guidance", "coffins", "flowers"]) {
    const dir = path.join(root, "src", "content", collection);
    for (const name of await readdir(dir)) {
      const file = path.join(dir, name);
      let source = await readFile(file, "utf8");
      source = source.replace("placeholder: true", "placeholder: false");
      // Drop placeholder images entirely (image blocks are the 5 indented lines after "image:"/"heroImage:").
      source = source.replace(/^(image|heroImage):\n(  .*\n)+/m, "");
      source = source
        .replace("reviewedBy: null", 'reviewedBy: "Odborník"')
        .replace("reviewedAt: null", "reviewedAt: 2026-10-01");
      await writeFile(file, source, "utf8");
    }
  }
  return root;
}

describe("prototype build of the neutral fixture", () => {
  it("emits only enabled routes", () => {
    expect(existsSync(path.join(DIST, "index.html"))).toBe(true);
    expect(existsSync(path.join(DIST, "cenik", "index.html"))).toBe(true);
    expect(existsSync(path.join(DIST, "clanky"))).toBe(false);
    expect(existsSync(path.join(DIST, "sitemap.xml"))).toBe(false);
  });

  it("is not indexable", async () => {
    expect(await html("index.html")).toContain('<meta name="robots" content="noindex,nofollow">');
    expect(await html("robots.txt")).toBe("User-agent: *\nDisallow: /\n");
    expect(await html("index.html")).toContain("data-prototype-banner");
  });

  it("renders the emergency link with purpose and number in its accessible name", async () => {
    const page = await html("index.html");
    expect(page).toContain(
      'href="tel:+420000000199" aria-label="Nonstop převoz zesnulých, volat +420 000 000 199"',
    );
    expect(page.match(/data-emergency-link/g)?.length).toBe(2);
  });

  it("keeps office hours and the emergency block in separate containers", async () => {
    const page = await html("index.html");
    const hoursStart = page.indexOf("data-office-hours");
    const hoursEnd = page.indexOf("</section>", hoursStart);
    const hoursBlock = page.slice(hoursStart, hoursEnd);
    expect(hoursBlock).toContain("Po–Pá");
    expect(hoursBlock).toContain("zavřeno");
    expect(hoursBlock).not.toMatch(/nonstop|tel:\+420000000199/i);
  });

  it("marks placeholders and missing facts", async () => {
    const page = await html("index.html");
    expect(page).toContain("Zástupný obsah");
    expect(page).toContain("Zástupný obrázek");
    expect(page).toContain("[Doplnit: IČO]");
  });

  it("labels every demo price and shows the notice, noindex on the price page", async () => {
    const page = await html("cenik/index.html");
    expect(page).toContain("data-demo-pricing-notice");
    expect(page.match(/data-price-item=/g)?.length).toBe(5);
    expect(page.match(/data-demo-label>UKÁZKA</g)?.length).toBe(5);
    expect(page).toContain('<meta name="robots" content="noindex,nofollow">');
  });

  it("renders optimised images with alt text and dimensions", async () => {
    expect(await html("index.html")).toMatch(
      /<img[^>]+alt="Neutrální zástupný obrázek úvodní stránky"[^>]+width="1500" height="1000"/,
    );
  });

  it("emits structured data without prices", async () => {
    const page = await html("index.html");
    const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(page);
    const json = JSON.parse(match?.[1] ?? "{}");
    expect(json["@type"]).toBe("LocalBusiness");
    expect(JSON.stringify(json)).not.toMatch(/price|offers/i);
  });
});

describe("production builds", () => {
  it("refuse the fixture as it is", async () => {
    const result = await build(FIXTURE, "production");
    expect(result.ok).toBe(false);
    expect(result.output).toContain("Publication gate failed in production mode");
    for (const rule of ["G-011", "G-012", "G-020", "G-021", "G-031", "G-032", "G-040"]) {
      expect(result.output).toContain(rule);
    }
  }, 120_000);

  it("succeed once blockers are resolved: indexable, sitemap, no markers", async () => {
    const root = await productionReadyFixture();
    const result = await build(root, "production");
    expect(result.output).not.toContain("Publication gate failed");
    expect(result.ok).toBe(true);
    const page = await html("index.html", result.outDir);
    expect(page).toContain('<meta name="robots" content="index,follow">');
    expect(page).not.toMatch(/data-prototype-banner|data-placeholder|data-missing-fact|UKÁZKA/);
    const pricePage = await html("cenik/index.html", result.outDir);
    expect(pricePage).not.toContain("data-demo");
    const sitemap = await html("sitemap.xml", result.outDir);
    expect(sitemap).toContain("<loc>https://www.pohrebni-sluzba-vzor.cz/</loc>");
    expect(sitemap).toContain("<loc>https://www.pohrebni-sluzba-vzor.cz/cenik/</loc>");
    expect(sitemap).not.toContain("404");
    expect(await html("robots.txt", result.outDir)).toContain(
      "Sitemap: https://www.pohrebni-sluzba-vzor.cz/sitemap.xml",
    );
  }, 120_000);
});
