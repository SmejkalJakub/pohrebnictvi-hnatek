/**
 * Where a site's content lives. In an exported client site this is the project root.
 * In the template system, SITE_ROOT points templates and the harness at a fixture or client
 * directory (e.g. SITE_ROOT=../fixtures/neutral). Node-only.
 */
import path from "node:path";

export interface SitePaths {
  root: string;
  contentDir: string;
  mediaDir: string;
  configFile: string;
  provenanceDir: string;
}

export function resolveSiteRoot(cwd: string = process.cwd(), env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.SITE_ROOT;
  if (configured === undefined || configured.trim() === "") {
    return path.resolve(cwd);
  }
  return path.resolve(cwd, configured);
}

/**
 * Optional SITE_CONFIG override: lets a template preview fixture content with its own
 * site.config.ts (its template id, default options and section order). Null when unset.
 */
export function resolveConfigOverride(
  cwd: string = process.cwd(),
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const configured = env.SITE_CONFIG;
  if (configured === undefined || configured.trim() === "") {
    return null;
  }
  return path.resolve(cwd, configured);
}

export function sitePaths(root: string, configFile: string | null = null): SitePaths {
  let resolvedConfig = path.join(root, "src", "site.config.ts");
  if (configFile !== null) {
    resolvedConfig = configFile;
  }
  return {
    root,
    contentDir: path.join(root, "src", "content"),
    mediaDir: path.join(root, "src", "assets", "media"),
    configFile: resolvedConfig,
    provenanceDir: path.join(root, "provenance"),
  };
}
