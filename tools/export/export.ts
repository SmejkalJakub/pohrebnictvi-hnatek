/**
 * Standalone client export (template-contract §9).
 *
 *   npm run export -- --client <dir> --template <id> --out <dir> [--config <site.config.ts>]
 *                     [--name <package-name>] [--force]
 *
 * Assembles a self-contained Astro project: the template at the root, core/ in src/core/, the
 * client's content, media and site.config.ts in src/, its public/ (favicon, touch icon, web
 * manifest) in public/, provenance in docs/provenance/, plus a
 * generated package.json (exact versions from this repo's lockfile), package-lock.json, .nvmrc,
 * .pages.yml, the publish/discard workflows and the handover documents.
 * --force replaces an existing earlier export (a directory that contains TEMPLATE.json).
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { TemplateManifest } from "../../core/content/config.ts";
import { loadValidatedContent } from "../../core/content/snapshot.ts";
import { buildMediaInventory, inventoryToMarkdown } from "../../core/media/inventory.ts";
import { generatePagesConfigForSite } from "../cms/generate.ts";
import type { CmsContentEntry, PagesConfig } from "../cms/pages-config.ts";
import { parseArgs, requiredFlag, stringFlag } from "../lib/args.ts";
import { CORE_DIR, REPO_ROOT, isInside, loadManifest, templateDir } from "../lib/repo.ts";
import { rewriteCoreReferences } from "./rewrite.ts";
import { renderTemplate } from "./render.ts";

const run = promisify(execFile);
const TEMPLATES = fileURLToPath(new URL("./templates", import.meta.url));

/** Official actions, pinned to full commit SHAs (verify against the tags before Phase 6, see notes). */
export const PINNED_ACTIONS = {
  checkoutSha: "11bd71901bbe5b1630ceea73d27597364c9af683",
  checkoutVersion: "v4.2.2",
  setupNodeSha: "49933ea5288caeca8642d1e84afbd3f7d6820020",
  setupNodeVersion: "v4.4.0",
};

/** Build-time tools the exported `check` script needs, taken from the root devDependencies. */
const EXPORT_DEV_DEPENDENCIES = ["@astrojs/check", "typescript", "@types/node"];

// Build output and local tool caches (e.g. the impeccable design hook) never go into a client repository.
const ALWAYS_SKIPPED = new Set(["node_modules", "dist", ".astro", ".DS_Store", ".impeccable"]);
const REWRITABLE = new Set([".ts", ".mts", ".mjs", ".js", ".cjs", ".astro", ".json", ".css"]);

export interface ExportOptions {
  clientDir: string;
  templateId: string;
  outDir: string;
  configFile: string | null;
  packageName: string | null;
  force: boolean;
  log: (line: string) => void;
}

export interface ExportResult {
  outDir: string;
  rewrites: string[];
  notes: string[];
}

// ---------------------------------------------------------------------------
// File copying
// ---------------------------------------------------------------------------

type Filter = (relative: string, isDirectory: boolean) => boolean;

async function copyTree(source: string, target: string, filter: Filter, relative = ""): Promise<string[]> {
  const copied: string[] = [];
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const childRelative = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (ALWAYS_SKIPPED.has(entry.name)) {
      continue;
    }
    if (!filter(childRelative, entry.isDirectory())) {
      continue;
    }
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copied.push(...(await copyTree(from, to, filter, childRelative)));
    } else if (entry.isFile()) {
      await copyFile(from, to);
      copied.push(childRelative);
    } else {
      throw new Error(`Refusing to export ${from}: links and special files are not allowed.`);
    }
  }
  return copied;
}

function isTestPath(relative: string, isDirectory: boolean): boolean {
  const name = path.posix.basename(relative);
  if (isDirectory) {
    return name === "tests" || name === "__tests__";
  }
  return /\.(test|spec)\.[cm]?[jt]s$/.test(name);
}

/** Template files that do not belong in a client repository. */
function templateFilter(relative: string, isDirectory: boolean): boolean {
  if (isTestPath(relative, isDirectory)) {
    return false;
  }
  const excluded = ["fixture.site.config.ts", "package.json", "package-lock.json", "src/site.config.ts"];
  return !excluded.includes(relative);
}

/** core/ is copied verbatim, without its tests. */
function coreFilter(relative: string): boolean {
  return relative !== "tests";
}

async function rewriteFile(originalFile: string, exportedFile: string, outDir: string): Promise<string[]> {
  if (!REWRITABLE.has(path.extname(exportedFile))) {
    return [];
  }
  const text = await readFile(exportedFile, "utf8");
  const { text: rewritten, changes } = rewriteCoreReferences(text, {
    originalFile,
    exportedFile,
    coreDir: CORE_DIR,
    exportedCoreDir: path.join(outDir, "src", "core"),
  });
  if (changes.length === 0) {
    return [];
  }
  await writeFile(exportedFile, rewritten, "utf8");
  const relative = path.relative(outDir, exportedFile);
  return changes.map((change) => `${relative}: ${change.from} → ${change.to}`);
}

// ---------------------------------------------------------------------------
// package.json from the lockfile
// ---------------------------------------------------------------------------

interface LockPackage {
  version?: string;
  link?: boolean;
}

interface Lockfile {
  packages: Record<string, LockPackage>;
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

/** The installed version of `name` as seen from a workspace (`templates/x`, `core`) or the root. */
export function lockedVersion(lock: Lockfile, workspace: string, name: string): string {
  const candidates = [`${workspace}/node_modules/${name}`, `node_modules/${name}`];
  for (const key of candidates) {
    const entry = lock.packages[key];
    if (entry !== undefined && entry.link !== true && entry.version !== undefined) {
      return entry.version;
    }
  }
  throw new Error(`${name} is not in package-lock.json (looked for ${candidates.join(", ")}).`);
}

function sortRecord(record: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  packageManager?: string;
}

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function pinnedDependencies(
  lock: Lockfile,
  workspace: string,
  declared: Record<string, string>,
  notes: string[],
): Record<string, string> {
  const pinned: Record<string, string> = {};
  for (const [name, spec] of Object.entries(declared)) {
    const version = lockedVersion(lock, workspace, name);
    if (EXACT_VERSION.test(spec) && spec !== version) {
      throw new Error(
        `${workspace}/package.json pins ${name}@${spec} but the lockfile has ${version}; run npm install.`,
      );
    }
    if (!EXACT_VERSION.test(spec)) {
      notes.push(`${name}: "${spec}" in ${workspace} pinned to the locked ${version}`);
    }
    pinned[name] = version;
  }
  return pinned;
}

export async function buildPackageJson(
  templateId: string,
  packageName: string,
  notes: string[],
): Promise<Record<string, unknown>> {
  const lock = await readJson<Lockfile>(path.join(REPO_ROOT, "package-lock.json"));
  const root = await readJson<PackageJson>(path.join(REPO_ROOT, "package.json"));
  const template = await readJson<PackageJson>(path.join(templateDir(templateId), "package.json"));
  const core = await readJson<PackageJson>(path.join(CORE_DIR, "package.json"));
  const templateWorkspace = `templates/${templateId}`;
  const dependencies = {
    ...pinnedDependencies(lock, "core", core.dependencies ?? {}, notes),
    ...pinnedDependencies(lock, templateWorkspace, template.dependencies ?? {}, notes),
  };
  const devDependencies: Record<string, string> = {};
  for (const name of EXPORT_DEV_DEPENDENCIES) {
    const spec = root.devDependencies?.[name];
    if (spec === undefined) {
      throw new Error(`Root package.json has no devDependency ${name}.`);
    }
    devDependencies[name] = pinnedDependencies(lock, ".", { [name]: spec }, notes)[name] as string;
  }
  const nodeEngine = root.engines?.node;
  if (nodeEngine === undefined || root.packageManager === undefined) {
    throw new Error("Root package.json must declare engines.node and packageManager.");
  }
  return {
    name: packageName,
    version: "1.0.0",
    private: true,
    type: "module",
    description: "Statický web postavený na Astro; obsah se upravuje v Pages CMS.",
    engines: { node: nodeEngine },
    packageManager: root.packageManager,
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
      check: "astro check",
      validate: "node scripts/validate.ts",
    },
    dependencies: sortRecord(dependencies),
    devDependencies: sortRecord(devDependencies),
  };
}

/**
 * Creates package-lock.json by resolving package.json in a scratch directory outside this repo,
 * with an empty npm user config so private registries or settings of this machine cannot leak in.
 */
async function generateLockfile(outDir: string, log: (line: string) => void): Promise<void> {
  const scratch = await mkdtemp(path.join(os.tmpdir(), "site-export-lock-"));
  try {
    await copyFile(path.join(outDir, "package.json"), path.join(scratch, "package.json"));
    const userConfig = path.join(scratch, "empty.npmrc");
    await writeFile(userConfig, "", "utf8");
    log("Resolving package-lock.json from the public npm registry …");
    await run("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], {
      cwd: scratch,
      env: {
        ...process.env,
        NPM_CONFIG_USERCONFIG: userConfig,
        npm_config_registry: "https://registry.npmjs.org/",
      },
      maxBuffer: 20 * 1024 * 1024,
    });
    await copyFile(path.join(scratch, "package-lock.json"), path.join(outDir, "package-lock.json"));
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Content adjustments for the CMS
// ---------------------------------------------------------------------------

/**
 * Pages CMS edits familyOwned as a yes / no / unknown select and rejects values outside the list
 * (S2 A4, B5). The schema accepts both forms, so booleans are written in the CMS form.
 */
async function normaliseForCms(outDir: string, notes: string[]): Promise<void> {
  const file = path.join(outDir, "src", "content", "site", "company.json");
  const company = await readJson<Record<string, unknown>>(file);
  const value = company.familyOwned;
  let next: string | null = null;
  if (value === true) {
    next = "yes";
  } else if (value === false) {
    next = "no";
  } else if (value === null || value === undefined) {
    next = "unknown";
  }
  if (next === null) {
    return;
  }
  company.familyOwned = next;
  await writeFile(file, `${JSON.stringify(company, null, 2)}\n`, "utf8");
  notes.push(`company.json familyOwned ${JSON.stringify(value ?? null)} → "${next}" (CMS select form)`);
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

async function renderDocument(name: string, values: Record<string, string>): Promise<string> {
  const template = await readFile(path.join(TEMPLATES, name), "utf8");
  return renderTemplate(template, values);
}

function cmsMenu(config: PagesConfig): string {
  const describe = (entry: CmsContentEntry, indent: string): string[] => {
    if (entry.type === "group") {
      return [
        `${indent}- **${entry.label}**`,
        ...entry.items.flatMap((item) => describe(item, `${indent}  `)),
      ];
    }
    if (entry.type === "collection") {
      return [`${indent}- **${entry.label}** – položky lze přidávat a mazat (\`${entry.path}/\`)`];
    }
    return [`${indent}- **${entry.label}** (\`${entry.path}\`)`];
  };
  const lines = config.content.flatMap((entry) => describe(entry, ""));
  lines.push(`- **${config.media.label}** – nahrané obrázky (\`${config.media.input}/\`)`);
  lines.push(
    ...config.actions.map(
      (action) => `- Akce **${action.label}** (\`.github/workflows/${action.workflow}\`)`,
    ),
  );
  return lines.join("\n");
}

interface FontCredit {
  family: string;
  packageName: string;
  version: string;
  license: string;
  attribution: string;
}

function packageDir(workspaceDir: string, name: string): string {
  const candidates = [
    path.join(workspaceDir, "node_modules", name),
    path.join(REPO_ROOT, "node_modules", name),
  ];
  const found = candidates.find((candidate) => existsSync(path.join(candidate, "package.json")));
  if (found === undefined) {
    throw new Error(`${name} is not installed; run npm ci at the repo root.`);
  }
  return found;
}

async function filesUnder(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

/** Fonts referenced by the exported template source, with licences read from the installed packages. */
async function fontCredits(
  outDir: string,
  templateId: string,
  dependencies: Record<string, string>,
): Promise<FontCredit[]> {
  const used = new Set<string>();
  for (const file of await filesUnder(path.join(outDir, "src"))) {
    if (!/\.(css|astro|ts)$/.test(file) || isInside(path.join(outDir, "src", "core"), file)) {
      continue;
    }
    for (const match of (await readFile(file, "utf8")).matchAll(/@fontsource\/([a-z0-9-]+)/g)) {
      used.add(`@fontsource/${match[1] as string}`);
    }
  }
  const credits: FontCredit[] = [];
  for (const name of [...used].sort()) {
    if (dependencies[name] === undefined) {
      throw new Error(`Template source uses ${name}, which is not a dependency of the template.`);
    }
    const dir = packageDir(templateDir(templateId), name);
    const pkg = await readJson<{ version: string; license?: string }>(path.join(dir, "package.json"));
    const metadata = await readJson<{ family?: string; license?: { type?: string; attribution?: string } }>(
      path.join(dir, "metadata.json"),
    );
    let attribution = metadata.license?.attribution ?? "";
    if (attribution === "") {
      attribution = (await readFile(path.join(dir, "LICENSE"), "utf8")).split("\n")[0] ?? "";
    }
    credits.push({
      family: metadata.family ?? name,
      packageName: name,
      version: pkg.version,
      license: metadata.license?.type ?? pkg.license ?? "see LICENSE",
      attribution: cleanAttribution(attribution),
    });
  }
  return credits;
}

/** Fontsource attributions repeat the notice per font file ("… Foo-Italic[wght].ttf: Copyright …"). */
function cleanAttribution(value: string): string {
  const first = value.split(/\s\S+\.(?:ttf|otf|woff2?)\S*:\s/)[0] ?? value;
  return first.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function fontTable(credits: FontCredit[]): string {
  if (credits.length === 0) {
    return "Šablona nepoužívá žádná písma z balíčků. / The template uses no packaged fonts.";
  }
  const lines = [
    "| Písmo / Font | Balíček / Package | Verze | Licence | Autoři / Copyright |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const credit of credits) {
    lines.push(
      `| ${credit.family} | \`${credit.packageName}\` | ${credit.version} | ${credit.license} | ${credit.attribution} |`,
    );
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

async function prepareOutDir(outDir: string, force: boolean): Promise<void> {
  if (
    isInside(outDir, REPO_ROOT) ||
    isInside(CORE_DIR, outDir) ||
    isInside(path.join(REPO_ROOT, "templates"), outDir)
  ) {
    throw new Error(`--out ${outDir} would overwrite parts of the template system.`);
  }
  if (!existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
    return;
  }
  const entries = await readdir(outDir);
  if (entries.length === 0) {
    return;
  }
  if (!force) {
    throw new Error(`${outDir} is not empty. Use --force to replace an earlier export.`);
  }
  if (!entries.includes("TEMPLATE.json")) {
    throw new Error(`${outDir} is not an earlier export (no TEMPLATE.json); refusing to delete it.`);
  }
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
}

function defaultPackageName(clientDir: string, templateId: string): string {
  const base = path
    .basename(clientDir)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "site"}-${templateId}-web`;
}

export async function exportSite(options: ExportOptions): Promise<ExportResult> {
  const { clientDir, templateId, outDir, log } = options;
  const notes: string[] = [];
  const rewrites: string[] = [];
  const manifest: TemplateManifest = await loadManifest(templateId);
  const source = templateDir(templateId);
  const clientContent = path.join(clientDir, "src", "content");
  if (!existsSync(clientContent)) {
    throw new Error(`${clientDir} has no src/content (expected the exported-site layout).`);
  }
  const configSource = options.configFile ?? path.join(clientDir, "src", "site.config.ts");
  if (!existsSync(configSource)) {
    throw new Error(`Site config ${configSource} not found.`);
  }
  await prepareOutDir(outDir, options.force);

  log(`Template ${templateId} → ${outDir}`);
  const templateFiles = await copyTree(source, outDir, templateFilter);
  for (const relative of templateFiles) {
    rewrites.push(...(await rewriteFile(path.join(source, relative), path.join(outDir, relative), outDir)));
  }
  await cleanTsconfig(path.join(outDir, "tsconfig.json"));

  log("core/ → src/core/");
  await copyTree(CORE_DIR, path.join(outDir, "src", "core"), coreFilter);

  log(`Client ${clientDir} → src/content, src/assets/media, src/site.config.ts, docs/provenance`);
  await copyTree(clientContent, path.join(outDir, "src", "content"), () => true);
  const clientMedia = path.join(clientDir, "src", "assets", "media");
  if (existsSync(clientMedia)) {
    await copyTree(clientMedia, path.join(outDir, "src", "assets", "media"), () => true);
  }
  const clientPublic = path.join(clientDir, "public");
  if (existsSync(clientPublic)) {
    log(`Client ${clientPublic} → public/`);
    await copyTree(clientPublic, path.join(outDir, "public"), () => true);
  }
  const exportedConfig = path.join(outDir, "src", "site.config.ts");
  await copyFile(configSource, exportedConfig);
  rewrites.push(...(await rewriteFile(configSource, exportedConfig, outDir)));
  const provenance = path.join(clientDir, "provenance");
  if (existsSync(provenance)) {
    await copyTree(provenance, path.join(outDir, "docs", "provenance"), () => true);
  } else {
    notes.push("client has no provenance/ directory; docs/provenance/ not created");
  }
  await normaliseForCms(outDir, notes);

  const { content, problems } = await loadValidatedContent(outDir);
  if (content === null) {
    const list = problems
      .map((problem) => `  ${problem.file} ${problem.path}: ${problem.message}`)
      .join("\n");
    throw new Error(`Exported content does not validate:\n${list}`);
  }
  if (content.config.template !== templateId) {
    throw new Error(`site.config.ts names template "${content.config.template}", not "${templateId}".`);
  }

  const packageName = options.packageName ?? defaultPackageName(clientDir, templateId);
  const packageJson = await buildPackageJson(templateId, packageName, notes);
  await writeFile(path.join(outDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
  const nodeVersion = (await readFile(path.join(REPO_ROOT, ".nvmrc"), "utf8")).trim();
  await writeFile(path.join(outDir, ".nvmrc"), `${nodeVersion}\n`, "utf8");
  await writeFile(
    path.join(outDir, ".gitignore"),
    "node_modules/\ndist/\n.astro/\n.env\n.env.*\n.DS_Store\n*.log\n",
    "utf8",
  );
  await mkdir(path.join(outDir, "scripts"), { recursive: true });
  await copyFile(path.join(TEMPLATES, "validate.ts.tpl"), path.join(outDir, "scripts", "validate.ts"));

  log("Generating .pages.yml and workflows");
  const cms = await generatePagesConfigForSite({ templateId, siteRoot: outDir, configFile: null });
  await writeFile(path.join(outDir, ".pages.yml"), cms.yaml, "utf8");
  const workflows = path.join(outDir, ".github", "workflows");
  await mkdir(workflows, { recursive: true });
  await writeFile(
    path.join(workflows, "publish.yml"),
    await renderDocument("publish.yml.tpl", PINNED_ACTIONS),
    "utf8",
  );
  await writeFile(
    path.join(workflows, "discard.yml"),
    await renderDocument("discard.yml.tpl", PINNED_ACTIONS),
    "utf8",
  );

  log("Writing README.md, HANDOVER.md, CREDITS.md, TEMPLATE.json");
  const exportedAt = new Date();
  const exportedDate = exportedAt.toISOString().slice(0, 10);
  const core = await readJson<PackageJson>(path.join(CORE_DIR, "package.json"));
  const npmVersion = String(packageJson.packageManager).replace(/^npm@/, "");
  const common = {
    brandName: content.company.brandName,
    templateName: manifest.name,
    templateVersion: manifest.version,
    exportedDate,
    nodeVersion,
    npmVersion,
  };
  await writeFile(path.join(outDir, "README.md"), await renderDocument("README.md.tpl", common), "utf8");
  await writeFile(
    path.join(outDir, "HANDOVER.md"),
    await renderDocument("HANDOVER.md.tpl", { ...common, cmsMenu: cmsMenu(cms.config) }),
    "utf8",
  );
  const dependencies = packageJson.dependencies as Record<string, string>;
  const inventory = buildMediaInventory(content);
  let imageNote = "";
  if (inventory.some((row) => row.source === "placeholder")) {
    imageNote =
      "**Pozor:** web obsahuje zástupné obrázky (`source: placeholder`). Ostrý web je odmítne (pravidlo G-032). / The site still contains placeholder images, which production builds reject.";
  }
  await writeFile(
    path.join(outDir, "CREDITS.md"),
    await renderDocument("CREDITS.md.tpl", {
      ...common,
      fontTable: fontTable(await fontCredits(outDir, templateId, dependencies)),
      imageNote,
      imageTable: inventoryToMarkdown(inventory),
    }),
    "utf8",
  );
  const templateJson = {
    template: manifest.id,
    templateName: manifest.name,
    templateVersion: manifest.version,
    coreVersion: core.version ?? "0.0.0",
    exportedAt: exportedAt.toISOString(),
    note: "Informational only. The site does not read this file.",
  };
  await writeFile(path.join(outDir, "TEMPLATE.json"), `${JSON.stringify(templateJson, null, 2)}\n`, "utf8");

  await generateLockfile(outDir, log);
  return { outDir, rewrites, notes };
}

/** Drops tsconfig entries that point at files the export does not contain (fixture configs). */
async function cleanTsconfig(file: string): Promise<void> {
  if (!existsSync(file)) {
    return;
  }
  const tsconfig = await readJson<{ include?: string[] }>(file);
  if (tsconfig.include === undefined) {
    return;
  }
  const kept = tsconfig.include.filter((entry) => !entry.includes("fixture.site.config"));
  if (kept.length === tsconfig.include.length) {
    return;
  }
  tsconfig.include = kept;
  await writeFile(file, `${JSON.stringify(tsconfig, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const configFlag = stringFlag(args, "config");
  let configFile: string | null = null;
  if (configFlag !== null) {
    configFile = path.resolve(cwd, configFlag);
  }
  const result = await exportSite({
    clientDir: path.resolve(cwd, requiredFlag(args, "client")),
    templateId: requiredFlag(args, "template"),
    outDir: path.resolve(cwd, requiredFlag(args, "out")),
    configFile,
    packageName: stringFlag(args, "name"),
    force: args.flags.has("force"),
    log: (line) => console.log(line),
  });
  console.log("\nRewritten core references:");
  for (const line of result.rewrites) {
    console.log(`  ${line}`);
  }
  if (result.notes.length > 0) {
    console.log("\nNotes:");
    for (const line of result.notes) {
      console.log(`  ${line}`);
    }
  }
  console.log(
    `\nExport ready: ${result.outDir}\nNext: npm run export:verify -- ${path.relative(cwd, result.outDir)}`,
  );
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`Export failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
