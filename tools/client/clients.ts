/**
 * Shared helpers for the client scripts (docs/client-workflow.md).
 * A client lives in clients/<id>/ in the exported-site layout: src/content, src/assets/media,
 * src/site.config.ts, and provenance/ beside src/ (content-contract §2).
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { SiteConfig } from "../../core/content/config.ts";
import type { TemplateManifest } from "../../core/content/config.ts";
import { runGateForSite } from "../../core/gate/run.ts";
import type { Finding } from "../../core/gate/rules.ts";
import type { SiteMode } from "../../core/mode.ts";
import { REPO_ROOT, loadManifest } from "../lib/repo.ts";

export const CLIENTS_DIR = path.join(REPO_ROOT, "clients");
export const NEUTRAL_FIXTURE = path.join(REPO_ROOT, "fixtures", "neutral");

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Client ids name a folder and an npm package, so they are ASCII slugs ("hnatek", "novak-brno"). */
export function assertClientId(id: string): void {
  if (!ID_PATTERN.test(id)) {
    throw new Error(`Invalid client id "${id}": use lowercase letters, digits and single hyphens.`);
  }
}

export function clientPath(id: string, clientsDir: string = CLIENTS_DIR): string {
  assertClientId(id);
  return path.join(clientsDir, id);
}

/** The directory of an existing client; throws with a hint when it has not been created. */
export function existingClient(id: string, clientsDir: string = CLIENTS_DIR): string {
  const dir = clientPath(id, clientsDir);
  if (!existsSync(path.join(dir, "src", "site.config.ts"))) {
    throw new Error(
      `Client "${id}" not found (expected ${dir}/src/site.config.ts). Create it with npm run client:new -- ${id} --template <id>.`,
    );
  }
  return dir;
}

export function clientConfigFile(dir: string): string {
  return path.join(dir, "src", "site.config.ts");
}

/** Loads <client>/src/site.config.ts the way core does (Node strips its `import type`). */
export async function readClientConfig(dir: string): Promise<SiteConfig> {
  const file = clientConfigFile(dir);
  const module = (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)) as { default: unknown };
  const parsed = SiteConfig.safeParse(module.default);
  if (!parsed.success) {
    throw new Error(`${file} is not a valid site config: ${parsed.error.message}`);
  }
  return parsed.data;
}

export interface ClientSite {
  id: string;
  dir: string;
  config: SiteConfig;
  manifest: TemplateManifest;
}

export async function loadClient(id: string, clientsDir: string = CLIENTS_DIR): Promise<ClientSite> {
  const dir = existingClient(id, clientsDir);
  const config = await readClientConfig(dir);
  const manifest = await loadManifest(config.template);
  return { id, dir, config, manifest };
}

/** Schema check + publication gate + G-005 against the template manifest, like a template build. */
export async function gateClient(site: ClientSite, mode: SiteMode): Promise<Finding[]> {
  const { findings } = await runGateForSite(site.dir, {
    mode,
    manifest: site.manifest,
    configFile: clientConfigFile(site.dir),
  });
  return findings;
}

/** Distinct rule ids of the error-level findings, sorted (what a failing build names). */
export function errorRules(findings: readonly Finding[]): string[] {
  const rules = new Set<string>();
  for (const finding of findings) {
    if (finding.level === "error") {
      rules.add(finding.rule);
    }
  }
  return [...rules].sort();
}
