/** Load a site from disk, validate it and run the gate: the single entry point for CLIs and the build. */
import { checkConfigAgainstManifest, type TemplateManifest } from "../content/config.ts";
import { loadValidatedContent, type ValidatedContent } from "../content/snapshot.ts";
import type { SiteMode } from "../mode.ts";
import { RULES, runGate, schemaFindings, type Finding, type Level } from "./rules.ts";

export interface GateRun {
  content: ValidatedContent | null;
  findings: Finding[];
}

export interface GateRunOptions {
  mode: SiteMode;
  now?: Date;
  manifest?: TemplateManifest;
  /** Absolute path of a site.config.ts overriding <root>/src/site.config.ts (SITE_CONFIG). */
  configFile?: string | null;
}

/** G-005: site.config.ts must only use what the template manifest declares. */
function manifestFindings(content: ValidatedContent, manifest: TemplateManifest, mode: SiteMode): Finding[] {
  const level = RULES["G-005"][mode] as Level;
  if (level === "off") {
    return [];
  }
  return checkConfigAgainstManifest(content.config, manifest)
    .filter((issue) => issue.path !== "features.articles")
    .map((issue) => ({
      rule: "G-005",
      level,
      file: "site.config.ts",
      path: issue.path,
      cs: `Konfigurace neodpovídá šabloně: ${issue.message}`,
      en: issue.message,
    }));
}

export async function runGateForSite(root: string, options: GateRunOptions): Promise<GateRun> {
  const { content, problems } = await loadValidatedContent(root, { configFile: options.configFile ?? null });
  if (content === null) {
    return { content: null, findings: schemaFindings(problems, options.mode) };
  }
  const findings = runGate(content, options);
  if (options.manifest !== undefined) {
    findings.push(...manifestFindings(content, options.manifest, options.mode));
  }
  return { content, findings };
}
