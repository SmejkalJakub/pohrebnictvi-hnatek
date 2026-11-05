/** Load a site from disk, validate it and run the gate: the single entry point for CLIs and the build. */
import type { TemplateManifest } from "../content/config.ts";
import { loadValidatedContent, type ValidatedContent } from "../content/snapshot.ts";
import type { SiteMode } from "../mode.ts";
import { runGate, schemaFindings, type Finding } from "./rules.ts";

export interface GateRun {
  content: ValidatedContent | null;
  findings: Finding[];
}

export async function runGateForSite(
  root: string,
  options: { mode: SiteMode; now?: Date; manifest?: TemplateManifest },
): Promise<GateRun> {
  const { content, problems } = await loadValidatedContent(root);
  if (content === null) {
    return { content: null, findings: schemaFindings(problems, options.mode) };
  }
  return { content, findings: runGate(content, options) };
}
