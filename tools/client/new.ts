/**
 * Scaffold a new client site (docs/client-workflow.md).
 *
 *   npm run client:new -- <id> --template <rodinna-tradice|dustojna-jednoduchost>
 *
 * Creates clients/<id>/ from the neutral fixture: content in src/content (every entry still
 * placeholder, every price demo), the placeholder graphics in src/assets/media, a site.config.ts
 * with the template's default options and homepage order, and a provenance ledger in which every
 * fact the launch check tracks is UNKNOWN. The result passes validate in prototype mode.
 * Refuses to touch an existing client.
 */
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TemplateManifest } from "../../core/content/config.ts";
import { loadValidatedContent, type ValidatedContent } from "../../core/content/snapshot.ts";
import { parseArgs, requiredFlag } from "../lib/args.ts";
import { CORE_DIR, REPO_ROOT, loadManifest } from "../lib/repo.ts";
import { CLIENTS_DIR, NEUTRAL_FIXTURE, clientPath } from "./clients.ts";

export interface ScaffoldOptions {
  id: string;
  templateId: string;
  clientsDir?: string;
  /** ISO date written to the ledger (defaults to today). */
  today?: string;
}

export interface ScaffoldResult {
  dir: string;
  factKeys: string[];
  copyKeys: string[];
}

/**
 * Every ledger key the launch check can ask about (core/gate/launch-check.ts collectTrackedFacts),
 * including the ones that are null in content, so research starts from a complete list.
 */
export function trackedFactKeys(content: ValidatedContent): string[] {
  const keys = [
    "company.brandName",
    "company.legalName",
    "company.legalIds.ico",
    "company.legalIds.dic",
    "company.legalIds.registryEntry",
    "company.legalIds.registeredOffice",
    "company.tradition.publicWording",
    "company.tradition.foundedYear",
    "company.familyOwned",
  ];
  for (const location of content.contact.locations) {
    keys.push(`contact.locations.${location.id}.address`, `contact.locations.${location.id}.geo`);
  }
  for (const phone of content.contact.phones) {
    keys.push(`contact.phones.${phone.id}.number`);
  }
  for (const email of content.contact.emails) {
    keys.push(`contact.emails.${email.id}.address`);
  }
  for (const group of content.officeHours.weekly) {
    keys.push(`office-hours.weekly.${group.id}`);
  }
  keys.push("office-hours.holidayNote", "emergency.phone", "emergency.availability", "emergency.serviceArea");
  return keys;
}

function siteConfigSource(manifest: TemplateManifest, configFile: string): string {
  let typesImport = path.relative(path.dirname(configFile), path.join(CORE_DIR, "content", "config.ts"));
  typesImport = typesImport.split(path.sep).join("/");
  if (!typesImport.startsWith(".")) {
    typesImport = `./${typesImport}`;
  }
  const options = Object.entries(manifest.options)
    .map(([name, declaration]) => `    ${name}: ${JSON.stringify(declaration.default)},`)
    .join("\n");
  const sections = manifest.homepageSections.default.map((section) => JSON.stringify(section)).join(", ");
  return `// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/${manifest.id}/template.manifest.ts (options, homepageSections).
// Plain object + \`import type\` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "${typesImport}";

const config = {
  template: ${JSON.stringify(manifest.id)},
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  homepage: { sections: [${sections}] },
  options: {
${options}
  },
} satisfies SiteConfigInput;

export default config;
`;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function factsLedger(id: string, today: string, keys: string[]): unknown {
  const facts: Record<string, unknown> = {};
  for (const key of keys) {
    facts[key] = {
      value: null,
      status: "UNKNOWN",
      source: null,
      retrievedAt: null,
      verifiedBy: null,
      verifiedAt: null,
      note: null,
    };
  }
  return { client: id, createdAt: today, facts };
}

function contentKey(file: string): string {
  return file.replace(/^src\/content\//, "");
}

function approvalsSkeleton(content: ValidatedContent): { approvals: unknown; copyKeys: string[] } {
  const entries = [
    ...content.pages,
    ...content.services,
    ...content.guidance,
    ...content.coffins,
    ...content.flowers,
  ];
  const copy: Record<string, unknown> = {};
  for (const entry of entries) {
    copy[contentKey(entry.file)] = { status: "DRAFT", approvedBy: null, approvedAt: null };
  }
  const guidance: Record<string, unknown> = {};
  for (const entry of content.guidance) {
    guidance[contentKey(entry.file)] = { reviewedBy: null, reviewedAt: null };
  }
  const approvals = {
    facts: {},
    copy,
    pricing: { status: "NOT_APPROVED", approvedBy: null, approvedAt: null, method: null },
    guidance,
    images: {},
  };
  return { approvals, copyKeys: Object.keys(copy) };
}

export async function scaffoldClient(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const clientsDir = options.clientsDir ?? CLIENTS_DIR;
  const dir = clientPath(options.id, clientsDir);
  const manifest = await loadManifest(options.templateId);
  if (existsSync(dir)) {
    throw new Error(`${dir} already exists; refusing to overwrite a client. Pick another id or remove it.`);
  }
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  await mkdir(clientsDir, { recursive: true });
  await mkdir(dir);
  try {
    await cp(path.join(NEUTRAL_FIXTURE, "src", "content"), path.join(dir, "src", "content"), {
      recursive: true,
    });
    // Only the neutral placeholder graphics the skeleton content references; client media replaces them.
    await cp(path.join(NEUTRAL_FIXTURE, "src", "assets", "media"), path.join(dir, "src", "assets", "media"), {
      recursive: true,
    });
    const configFile = path.join(dir, "src", "site.config.ts");
    await writeFile(configFile, siteConfigSource(manifest, configFile), "utf8");

    const { content, problems } = await loadValidatedContent(dir, { configFile });
    if (content === null) {
      const list = problems.map((problem) => `  ${problem.file} ${problem.path}: ${problem.message}`);
      throw new Error(`The neutral fixture does not validate:\n${list.join("\n")}`);
    }
    const factKeys = trackedFactKeys(content);
    const { approvals, copyKeys } = approvalsSkeleton(content);
    await mkdir(path.join(dir, "provenance"));
    await writeFile(
      path.join(dir, "provenance", "facts.json"),
      json(factsLedger(options.id, today, factKeys)),
    );
    await writeFile(path.join(dir, "provenance", "approvals.json"), json(approvals));
    return { dir, factKeys, copyKeys };
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const id = args.positional[0];
  if (id === undefined) {
    throw new Error("Usage: npm run client:new -- <id> --template <rodinna-tradice|dustojna-jednoduchost>");
  }
  const result = await scaffoldClient({ id, templateId: requiredFlag(args, "template") });
  const relative = path.relative(REPO_ROOT, result.dir);
  const media = await readdir(path.join(result.dir, "src", "assets", "media"));
  console.log(`Created ${relative}/`);
  console.log(`  src/content/          neutral skeleton: every entry placeholder, every price demo`);
  console.log(`  src/assets/media/     ${media.length} placeholder graphics (replace with client media)`);
  console.log(`  src/site.config.ts    template defaults`);
  console.log(`  provenance/facts.json ${result.factKeys.length} tracked facts, all UNKNOWN`);
  console.log(`  provenance/approvals.json ${result.copyKeys.length} copy entries, all DRAFT`);
  console.log(`\nNext: /site-research ${id} <url>, or npm run client:validate -- ${id}`);
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`client:new failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
