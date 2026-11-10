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
      // The fixture's notice dates are relative to 2026-11-10; production builds cannot pin it in config.
      env: {
        ...process.env,
        SITE_ROOT: siteRoot,
        SITE_MODE: mode,
        HARNESS_OUT_DIR: outDir,
        SITE_BUILD_DATE: "2026-11-10",
      },
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
    .replace(/^import type .*$/m, "")
    .replace(/^\s*pinnedBuildDate: .*$/m, "");
  await writeFile(config, configSource.replace(" satisfies SiteConfigInput", ""), "utf8");
  const collections = [
    "pages",
    "services",
    "guidance",
    "coffins",
    "flowers",
    "notices",
    "people",
    "faq",
    "documents",
  ];
  for (const collection of collections) {
    const dir = path.join(root, "src", "content", collection);
    for (const name of await readdir(dir)) {
      const file = path.join(dir, name);
      let source = await readFile(file, "utf8");
      source = source.replace("placeholder: true", "placeholder: false");
      // Drop placeholder images entirely (an image block is the indented lines after its key).
      source = source.replace(/^(image|heroImage|photo|parteImage):\n(  .*\n)+/m, "");
      source = source
        .replace("reviewedBy: null", 'reviewedBy: "Odborník"')
        .replace("reviewedAt: null", "reviewedAt: 2026-10-01");
      await writeFile(file, source, "utf8");
    }
  }
  // Staff consent recorded for every person (G-074).
  const approvalsFile = path.join(root, "provenance", "approvals.json");
  const approvals = JSON.parse(await readFile(approvalsFile, "utf8"));
  approvals.people = {};
  for (const name of await readdir(path.join(root, "src", "content", "people"))) {
    approvals.people[`people/${name}`] = {
      consentAt: "2026-10-01",
      recordedBy: "Operátor",
      method: "písemně",
    };
  }
  await writeFile(approvalsFile, JSON.stringify(approvals), "utf8");
  // A CMS editor may type an H1 in a body; core demotes it at render (G-035 warns only).
  const home = path.join(root, "src", "content", "pages", "home.md");
  const homeSource = await readFile(home, "utf8");
  await writeFile(home, `${homeSource}\n# Nadpis z editoru\n\nText.\n`, "utf8");
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

  it("gives Markdown headings ASCII ids and emits only referenced images", async () => {
    expect(await html("index.html")).toContain('<h2 id="jsme-tu-pro-vas"');
    // Every fixture graphic is referenced (placeholder-4x5 by notices and people), so check the rule
    // the other way round: nothing outside the referenced set is emitted.
    const assets = await readdir(path.join(DIST, "_astro"));
    const images = assets.filter((file) => /\.(png|jpe?g|webp|avif)$/.test(file));
    for (const file of images) {
      expect(file).toMatch(/^placeholder-(1x1|3x2|4x3|4x5)\./);
    }
  });

  it("emits structured data without prices", async () => {
    const page = await html("index.html");
    const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(page);
    const json = JSON.parse(match?.[1] ?? "{}");
    expect(json["@type"]).toBe("LocalBusiness");
    expect(JSON.stringify(json)).not.toMatch(/price|offers/i);
  });
});

describe("notices and other optional content (prototype)", () => {
  it("builds live notices only: no expired or draft notice, an index, a QR code next to each", () => {
    for (const id of ["jan-vzorovy", "marie-ukazkova", "josef-prikladny"]) {
      expect(existsSync(path.join(DIST, "oznameni", id, "index.html")), id).toBe(true);
      expect(existsSync(path.join(DIST, "oznameni", id, "qr.svg")), id).toBe(true);
    }
    expect(existsSync(path.join(DIST, "oznameni", "anna-drivejsi"))).toBe(false);
    expect(existsSync(path.join(DIST, "oznameni", "karel-rozpracovany"))).toBe(false);
    expect(existsSync(path.join(DIST, "oznameni", "index.html"))).toBe(true);
  });

  it("renders the notice with its QR code and without anything promotional", async () => {
    const page = await html("oznameni/jan-vzorovy/index.html");
    expect(page).toContain("data-notice-qr");
    expect(page).toMatch(/<svg [^>]*role="img"><title>QR kód s odkazem na oznámení: Jan Vzorový<\/title>/);
    expect(page).toContain("Sledovat přenos obřadu");
    const article = page.slice(page.indexOf("<article"), page.indexOf("</article>"));
    expect(article).not.toMatch(/\/sluzby\/|\/cenik\/|data-price|Objednejte/);
    const qr = await html("oznameni/jan-vzorovy/qr.svg");
    expect(qr).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(qr).toContain("<title>QR kód s odkazem na oznámení: Jan Vzorový</title>");
  });

  it("copies published PDFs as they are and links the legal page from every page", async () => {
    const source = await readFile(path.join(FIXTURE, "src", "assets", "documents", "reklamacni-rad.pdf"));
    expect(await readFile(path.join(DIST, "dokumenty", "reklamacni-rad.pdf"))).toEqual(source);
    expect(existsSync(path.join(DIST, "oznameni", "marie-ukazkova", "parte-marie-ukazkova.pdf"))).toBe(true);
    expect(await html("index.html")).toContain(
      '<a href="/pravni-informace/" data-legal-link>Právní informace</a>',
    );
    const legal = await html("pravni-informace/index.html");
    expect(legal).toContain('href="https://adr.coi.cz"');
    expect(legal).toContain('href="/dokumenty/rad-pohrebni-sluzby.pdf"');
    expect(legal).toContain("Kdy si mohu vyzvednout urnu?");
  });
});

describe("production builds", () => {
  it("refuse the fixture as it is", async () => {
    const result = await build(FIXTURE, "production");
    expect(result.ok).toBe(false);
    expect(result.output).toContain("Publication gate failed in production mode");
    for (const rule of ["G-011", "G-012", "G-020", "G-021", "G-031", "G-032", "G-040", "G-073", "G-074"]) {
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
    expect(page.match(/<h1[\s>]/g)?.length).toBe(1);
    expect(page).toContain('<h2 id="nadpis-z-editoru"');
    const pricePage = await html("cenik/index.html", result.outDir);
    expect(pricePage).not.toContain("data-demo");
    const sitemap = await html("sitemap.xml", result.outDir);
    expect(sitemap).toContain("<loc>https://www.pohrebni-sluzba-vzor.cz/</loc>");
    expect(sitemap).toContain("<loc>https://www.pohrebni-sluzba-vzor.cz/cenik/</loc>");
    expect(sitemap).not.toContain("404");
    expect(await html("robots.txt", result.outDir)).toContain(
      "Sitemap: https://www.pohrebni-sluzba-vzor.cz/sitemap.xml",
    );
    // Notices: noindex ones get robots noindex and stay out of the sitemap; others are indexable.
    const hidden = await html("oznameni/jan-vzorovy/index.html", result.outDir);
    expect(hidden).toContain('<meta name="robots" content="noindex,nofollow">');
    expect(sitemap).not.toContain("/oznameni/jan-vzorovy/");
    expect(sitemap).not.toContain("/oznameni/josef-prikladny/");
    const indexed = await html("oznameni/marie-ukazkova/index.html", result.outDir);
    expect(indexed).toContain('<meta name="robots" content="index,follow">');
    expect(sitemap).toContain("<loc>https://www.pohrebni-sluzba-vzor.cz/oznameni/marie-ukazkova/</loc>");
    expect(sitemap).toContain("<loc>https://www.pohrebni-sluzba-vzor.cz/oznameni/</loc>");
    const qr = await html("oznameni/marie-ukazkova/qr.svg", result.outDir);
    expect(qr).toContain("<svg");
  }, 120_000);
});
