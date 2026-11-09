/**
 * Generate a Pages CMS config (.pages.yml) for one template and one site.
 *   npm run cms:config -- --template <id> [--client <dir>] [--config <site.config.ts>] [--out <file>]
 * --client defaults to fixtures/neutral. Without --out the YAML is printed.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadValidatedContent } from "../../core/content/snapshot.ts";
import { parseArgs, requiredFlag, stringFlag } from "../lib/args.ts";
import { REPO_ROOT, loadManifest } from "../lib/repo.ts";
import { generatePagesConfig, renderPagesYaml, type PagesConfig } from "./pages-config.ts";

export interface SiteCmsInput {
  templateId: string;
  /** Site root in the exported layout (src/content, src/site.config.ts). */
  siteRoot: string;
  configFile: string | null;
}

export interface SiteCmsOutput {
  config: PagesConfig;
  yaml: string;
}

/** Reads manifest, features and page files, and returns the config and the rendered .pages.yml. */
export async function generatePagesConfigForSite(input: SiteCmsInput): Promise<SiteCmsOutput> {
  const manifest = await loadManifest(input.templateId);
  const { content, problems } = await loadValidatedContent(input.siteRoot, { configFile: input.configFile });
  if (content === null) {
    const list = problems
      .map((problem) => `  ${problem.file} ${problem.path}: ${problem.message}`)
      .join("\n");
    throw new Error(
      `Content of ${input.siteRoot} is invalid; fix it before generating the CMS config:\n${list}`,
    );
  }
  const config = generatePagesConfig({
    manifest,
    features: { articles: content.config.features.articles },
    pageIds: content.pages.map((page) => page.id),
  });
  const yaml = renderPagesYaml(config, { templateId: manifest.id, templateVersion: manifest.version });
  return { config, yaml };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const templateId = requiredFlag(args, "template");
  const siteRoot = path.resolve(
    process.cwd(),
    stringFlag(args, "client") ?? path.join(REPO_ROOT, "fixtures", "neutral"),
  );
  const configFlag = stringFlag(args, "config");
  let configFile: string | null = null;
  if (configFlag !== null) {
    configFile = path.resolve(process.cwd(), configFlag);
  }
  const { yaml } = await generatePagesConfigForSite({ templateId, siteRoot, configFile });
  const out = stringFlag(args, "out");
  if (out === null) {
    process.stdout.write(yaml);
    return;
  }
  await writeFile(path.resolve(process.cwd(), out), yaml, "utf8");
  console.log(`Written ${out}`);
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
