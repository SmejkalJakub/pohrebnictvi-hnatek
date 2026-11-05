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

export function sitePaths(root: string): SitePaths {
  return {
    root,
    contentDir: path.join(root, "src", "content"),
    mediaDir: path.join(root, "src", "assets", "media"),
    configFile: path.join(root, "src", "site.config.ts"),
    provenanceDir: path.join(root, "provenance"),
  };
}
