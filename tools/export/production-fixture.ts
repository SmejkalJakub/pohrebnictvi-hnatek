/**
 * Writes a production-ready copy of the neutral fixture, for proving that an export builds in
 * production mode (mirrors productionReadyFixture() in harness/tests/harness.test.ts).
 *
 *   node tools/export/production-fixture.ts --template <id> --out <dir>
 *
 * Every blocker is resolved with obviously fictional values: legal ids, approved prices with
 * validity and VAT note, a real-looking domain, no placeholder flags or images, reviewed guidance.
 * The result is test data only and must never be deployed.
 */
import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, requiredFlag } from "../lib/args.ts";
import { CORE_DIR, REPO_ROOT, templateDir } from "../lib/repo.ts";

export const PRODUCTION_TEST_DOMAIN = "https://www.pohrebni-sluzba-vzor.cz";

export async function writeProductionFixture(templateId: string, outDir: string): Promise<void> {
  const fixture = path.join(REPO_ROOT, "fixtures", "neutral");
  await rm(outDir, { recursive: true, force: true });
  await cp(fixture, outDir, { recursive: true });

  const site = path.join(outDir, "src", "content", "site");
  const company = JSON.parse(await readFile(path.join(site, "company.json"), "utf8"));
  company.legalIds = {
    ico: "12345678",
    dic: null,
    registryEntry: "C 00000 vedená u Krajského soudu v Brně",
    registeredOffice: { street: "Ukázková 123/4", city: "Vzorov", postalCode: "000 00", country: "CZ" },
  };
  await writeFile(path.join(site, "company.json"), `${JSON.stringify(company, null, 2)}\n`, "utf8");

  const pricing = JSON.parse(await readFile(path.join(site, "pricing.json"), "utf8"));
  pricing.validFrom = "2026-11-01";
  pricing.vatNote = "Ceny jsou uvedeny včetně DPH.";
  for (const group of pricing.groups) {
    for (const item of group.items) {
      item.status = "approved";
    }
  }
  await writeFile(path.join(site, "pricing.json"), `${JSON.stringify(pricing, null, 2)}\n`, "utf8");

  const templateConfig = await readFile(path.join(templateDir(templateId), "fixture.site.config.ts"), "utf8");
  // Point the type import at core from the new location; the exporter then rewrites it to src/core.
  const configFile = path.join(outDir, "src", "site.config.ts");
  const typesPath = path.relative(path.dirname(configFile), path.join(CORE_DIR, "content", "config.ts"));
  const config = templateConfig
    .replace("https://example.invalid", PRODUCTION_TEST_DOMAIN)
    .replace(
      /^import type .*$/m,
      `import type { SiteConfigInput } from "${typesPath.split(path.sep).join("/")}";`,
    );
  await writeFile(configFile, config, "utf8");

  for (const collection of ["pages", "services", "guidance", "coffins", "flowers"]) {
    const dir = path.join(outDir, "src", "content", collection);
    for (const name of await readdir(dir)) {
      const file = path.join(dir, name);
      let source = await readFile(file, "utf8");
      source = source.replace("placeholder: true", "placeholder: false");
      // Drop placeholder images (an image block is the indented lines after "image:"/"heroImage:").
      source = source.replace(/^(image|heroImage|secondaryImage):\n(  .*\n)+/gm, "");
      source = source
        .replace("reviewedBy: null", 'reviewedBy: "Odborník"')
        .replace("reviewedAt: null", "reviewedAt: 2026-10-01");
      await writeFile(file, source, "utf8");
    }
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const templateId = requiredFlag(args, "template");
  const outDir = path.resolve(process.cwd(), requiredFlag(args, "out"));
  await writeProductionFixture(templateId, outDir);
  console.log(`Production-ready fixture for ${templateId}: ${outDir}`);
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
