/**
 * Generate the Decap CMS config (public/admin/config.yml) for one template and one site.
 *   npm run cms:config -- --template <id> [--client <dir>] [--config <site.config.ts>] [--out <file>]
 * --client defaults to fixtures/neutral. Publishing settings come from <client>/publishing.json;
 * without it every repository and DecapBridge value is a placeholder. Without --out the YAML is printed.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadValidatedContent } from "../../core/content/snapshot.ts";
import { parseArgs, requiredFlag, stringFlag } from "../lib/args.ts";
import { REPO_ROOT, loadManifest } from "../lib/repo.ts";
import { generateDecapConfig, renderDecapYaml, type DecapConfig } from "./decap-config.ts";
import {
  defaultPublishing,
  readPublishing,
  resolvePublishing,
  type PublishingSettings,
  type ResolvedPublishingSettings,
} from "./settings.ts";

export interface SiteCmsInput {
  templateId: string;
  /** Site root in the exported layout (src/content, src/site.config.ts). */
  siteRoot: string;
  configFile: string | null;
  publishing: PublishingSettings;
}

export interface SiteCmsOutput {
  config: DecapConfig;
  yaml: string;
  publishing: ResolvedPublishingSettings;
}

/** Reads manifest, features and page files, and returns the config and the rendered config.yml. */
export async function generateDecapConfigForSite(input: SiteCmsInput): Promise<SiteCmsOutput> {
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
  const publishing = resolvePublishing(input.publishing);
  const config = generateDecapConfig({
    manifest,
    features: content.config.features,
    pageIds: content.pages.map((page) => page.id),
    legal: content.legal !== null,
    siteUrl: content.config.siteUrl,
    publishing,
  });
  const yaml = renderDecapYaml(config, { templateId: manifest.id, templateVersion: manifest.version });
  return { config, yaml, publishing };
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
  const publishing = (await readPublishing(siteRoot)) ?? defaultPublishing(`${templateId}-web`);
  const { yaml } = await generateDecapConfigForSite({ templateId, siteRoot, configFile, publishing });
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
