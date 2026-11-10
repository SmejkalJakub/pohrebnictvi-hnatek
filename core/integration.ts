/**
 * Astro integration that every template (and the harness) installs:
 *  - runs schema validation + publication gate before a build (fails a build on errors),
 *  - exposes site data through the virtual module "virtual:site-core/data",
 *  - fixes route conventions (trailing slash in builds, directory format),
 *  - serves the site's public/ folder (favicon, touch icon, manifest) from the site root,
 *  - writes robots.txt and, in production, sitemap.xml.
 */
import { existsSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { AstroIntegration } from "astro";
import type { TemplateManifest } from "./content/config.ts";
import { SINGLETON_NAMES } from "./content/schemas.ts";
import { formatFindings, summarize } from "./gate/report.ts";
import { collectReferencedMediaFiles, hasErrors } from "./gate/rules.ts";
import { installContractMarkdownPlugins } from "./markdown/satteri-plugins.ts";
import { runGateForSite } from "./gate/run.ts";
import { isSupportedMediaFile } from "./media/normalize.ts";
import { detectSiteIcons, sitePublicDir } from "./media/site-icons.ts";
import { resolveMode, type SiteMode } from "./mode.ts";
import { resolveConfigOverride, resolveSiteRoot, sitePaths, type SitePaths } from "./paths.ts";

const VIRTUAL_ID = "virtual:site-core/data";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export interface SiteCoreOptions {
  manifest?: TemplateManifest;
}

async function buildDataModule(
  paths: SitePaths,
  mode: SiteMode,
  siteUrl: string | null,
  referencedMedia: string[] | null,
): Promise<string> {
  const lines: string[] = [];
  lines.push(`export { default as config } from ${JSON.stringify(paths.configFile)};`);
  for (const name of SINGLETON_NAMES) {
    const file = path.join(paths.contentDir, "site", `${name}.json`);
    const exportName = name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
    lines.push(`export { default as ${exportName} } from ${JSON.stringify(file)};`);
  }
  lines.push(`export const mode = ${JSON.stringify(mode)};`);
  lines.push(`export const siteUrl = ${JSON.stringify(siteUrl)};`);
  lines.push(`export const icons = ${JSON.stringify(detectSiteIcons(paths.root))};`);
  const mediaEntries: string[] = [];
  if (existsSync(paths.mediaDir)) {
    // Import only referenced images so unused files in the media folder are not emitted to dist/.
    // Without validated content (schema errors in dev) every file is imported.
    let files = (await readdir(paths.mediaDir)).filter(isSupportedMediaFile).sort();
    if (referencedMedia !== null) {
      const wanted = new Set(referencedMedia);
      files = files.filter((file) => wanted.has(file));
    }
    files.forEach((file, index) => {
      lines.push(`import media${index} from ${JSON.stringify(path.join(paths.mediaDir, file))};`);
      mediaEntries.push(`${JSON.stringify(file)}: media${index}`);
    });
  }
  lines.push(`export const media = { ${mediaEntries.join(", ")} };`);
  return lines.join("\n");
}

async function listHtmlPages(directory: string, prefix = ""): Promise<string[]> {
  const pages: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      pages.push(...(await listHtmlPages(path.join(directory, entry.name), `${prefix}${entry.name}/`)));
    } else if (entry.name === "index.html") {
      pages.push(`/${prefix}`);
    }
  }
  return pages;
}

export default function siteCore(options: SiteCoreOptions = {}): AstroIntegration {
  const root = resolveSiteRoot();
  const configFile = resolveConfigOverride();
  const paths = sitePaths(root, configFile);
  const mode = resolveMode(process.env.SITE_MODE);
  let siteUrl: string | null = null;

  return {
    name: "site-core",
    hooks: {
      "astro:config:setup": async ({ command, config, updateConfig, logger }) => {
        const installed = installContractMarkdownPlugins(config.markdown.processor);
        if (!installed) {
          logger.warn(
            "Markdown processor is not Sätteri: H1 demotion and ASCII heading ids are not applied.",
          );
        }
        const run = await runGateForSite(root, { mode, manifest: options.manifest, configFile });
        siteUrl = run.content?.config.siteUrl ?? null;
        const counts = summarize(run.findings);
        logger.info(
          `site root ${root} · mode ${mode} · errors ${counts.error}, warnings ${counts.warning}, markers ${counts.marker}`,
        );
        if (run.findings.length > 0) {
          logger.info(`\n${formatFindings(run.findings)}`);
        }
        if (command === "build" && hasErrors(run.findings)) {
          throw new Error(
            `Publication gate failed in ${mode} mode (${counts.error} error(s)). See findings above.`,
          );
        }

        let referencedMedia: string[] | null = null;
        if (run.content !== null) {
          referencedMedia = collectReferencedMediaFiles(run.content);
        }
        const dataModule = await buildDataModule(paths, mode, siteUrl, referencedMedia);
        // Builds keep "always". The dev server answers Astro's image endpoint at "/_image?…"
        // (no slash), which "always" turns into a 404, so dev uses "ignore".
        let trailingSlash: "always" | "ignore" = "always";
        if (command === "dev") {
          trailingSlash = "ignore";
        }
        // The site's own public/ (clients/<id>/public in this repo); templates ship none.
        const publicDir = sitePublicDir(root);
        if (existsSync(publicDir)) {
          updateConfig({ publicDir: pathToFileURL(`${publicDir}${path.sep}`) });
        }
        updateConfig({
          trailingSlash,
          build: { format: "directory" },
          vite: {
            plugins: [
              {
                name: "site-core-data",
                resolveId(id: string) {
                  if (id === VIRTUAL_ID) {
                    return RESOLVED_VIRTUAL_ID;
                  }
                  return undefined;
                },
                load(id: string) {
                  if (id === RESOLVED_VIRTUAL_ID) {
                    return dataModule;
                  }
                  return undefined;
                },
              },
            ],
          },
        });
      },
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        if (mode === "prototype") {
          await writeFile(path.join(outDir, "robots.txt"), "User-agent: *\nDisallow: /\n", "utf8");
          logger.info("prototype: robots.txt disallows all; no sitemap");
          return;
        }
        if (siteUrl === null) {
          throw new Error("siteUrl missing in production build.");
        }
        const base = siteUrl.replace(/\/$/, "");
        const pages = (await listHtmlPages(outDir)).filter((page) => page !== "/404/").sort();
        const urls = pages.map((page) => `  <url><loc>${base}${page}</loc></url>`).join("\n");
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        await writeFile(path.join(outDir, "sitemap.xml"), sitemap, "utf8");
        await writeFile(
          path.join(outDir, "robots.txt"),
          `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
          "utf8",
        );
        logger.info(`production: sitemap.xml with ${pages.length} page(s)`);
      },
    },
  };
}
