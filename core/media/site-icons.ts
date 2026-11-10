/**
 * Browser icons (favicon, touch icon, web manifest). A site keeps them in `public/` at its root
 * (`clients/<id>/public/` in the template system, `public/` in an exported site); Astro copies
 * that folder to the site root unchanged. SeoHead links only the files that exist. Node-only.
 */
import { existsSync } from "node:fs";
import path from "node:path";

/** Fixed file names in `public/`, served from the site root. */
export const SITE_ICON_FILES = {
  svg: "favicon.svg",
  ico: "favicon.ico",
  appleTouch: "apple-touch-icon.png",
  manifest: "site.webmanifest",
} as const;

export type SiteIcons = Record<keyof typeof SITE_ICON_FILES, boolean>;

export function sitePublicDir(root: string): string {
  return path.join(root, "public");
}

export function detectSiteIcons(root: string): SiteIcons {
  const publicDir = sitePublicDir(root);
  return {
    svg: existsSync(path.join(publicDir, SITE_ICON_FILES.svg)),
    ico: existsSync(path.join(publicDir, SITE_ICON_FILES.ico)),
    appleTouch: existsSync(path.join(publicDir, SITE_ICON_FILES.appleTouch)),
    manifest: existsSync(path.join(publicDir, SITE_ICON_FILES.manifest)),
  };
}
