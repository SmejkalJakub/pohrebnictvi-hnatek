/**
 * Astro integration that every template (and the harness) installs:
 *  - runs schema validation + publication gate before a build (fails a build on errors),
 *  - exposes site data through the virtual module "virtual:site-core/data",
 *  - fixes route conventions (trailing slash in builds, directory format),
 *  - serves the site's public/ folder (favicon, touch icon, manifest) from the site root,
 *  - writes robots.txt and, in production, sitemap.xml (without noindex notices),
 *  - copies published PDFs (documents, notice parte) to dist as they are and writes a printable
 *    QR code (qr.svg) next to every live notice; the dev server serves the same files.
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { AstroIntegration } from "astro";
import { resolveBuildDate } from "./content/build-date.ts";
import type { TemplateManifest } from "./content/config.ts";
import { noticeHref, noticeQrHref } from "./content/optional-views.ts";
import { OPTIONAL_SINGLETON_NAMES, SINGLETON_NAMES } from "./content/schemas.ts";
import type { ValidatedContent } from "./content/snapshot.ts";
import { formatFindings, summarize } from "./gate/report.ts";
import { collectPublishedDocuments, collectReferencedMediaFiles, hasErrors } from "./gate/rules.ts";
import { isNoticeLive } from "./gate/visibility.ts";
import { qrSvg } from "./qr/qr-code.ts";
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

/** Files the static site serves outside Astro's pages: PDFs and notice QR codes, by URL path. */
interface StaticFiles {
  /** URL path → absolute source file (copied as is). */
  copies: Map<string, string>;
  /** URL path → generated SVG text. */
  generated: Map<string, string>;
}

/** Live notices with noindex: excluded from sitemap.xml and given robots noindex by SeoHead. */
function noindexPathsOf(content: ValidatedContent, buildDate: string): string[] {
  return content.notices
    .filter((notice) => notice.data.noindex && isNoticeLive(notice.data, content, buildDate))
    .map((notice) => noticeHref(notice.id))
    .sort();
}

function staticFilesOf(content: ValidatedContent, buildDate: string): StaticFiles {
  const copies = new Map<string, string>();
  for (const document of collectPublishedDocuments(content, buildDate)) {
    copies.set(document.href, path.join(content.paths.documentsDir, document.file));
  }
  const generated = new Map<string, string>();
  const base = content.config.siteUrl.replace(/\/$/, "");
  for (const notice of content.notices) {
    if (isNoticeLive(notice.data, content, buildDate)) {
      const target = `${base}${noticeHref(notice.id)}`;
      const title = `QR kód s odkazem na oznámení: ${notice.data.fullName}`;
      generated.set(noticeQrHref(notice.id), `${qrSvg(target, { title })}\n`);
    }
  }
  return { copies, generated };
}

function urlPathToFile(outDir: string, urlPath: string): string {
  const segments = urlPath
    .split("/")
    .filter((segment) => segment !== "")
    .map(decodeURIComponent);
  return path.join(outDir, ...segments);
}

async function buildDataModule(
  paths: SitePaths,
  mode: SiteMode,
  siteUrl: string | null,
  referencedMedia: string[] | null,
  buildDate: string,
  noindexPaths: string[],
): Promise<string> {
  const lines: string[] = [];
  lines.push(`export { default as config } from ${JSON.stringify(paths.configFile)};`);
  for (const name of SINGLETON_NAMES) {
    const file = path.join(paths.contentDir, "site", `${name}.json`);
    const exportName = name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
    lines.push(`export { default as ${exportName} } from ${JSON.stringify(file)};`);
  }
  for (const name of OPTIONAL_SINGLETON_NAMES) {
    const file = path.join(paths.contentDir, "site", `${name}.json`);
    if (existsSync(file)) {
      lines.push(`export { default as ${name} } from ${JSON.stringify(file)};`);
    } else {
      lines.push(`export const ${name} = null;`);
    }
  }
  lines.push(`export const mode = ${JSON.stringify(mode)};`);
  lines.push(`export const siteUrl = ${JSON.stringify(siteUrl)};`);
  lines.push(`export const buildDate = ${JSON.stringify(buildDate)};`);
  lines.push(`export const noindexPaths = ${JSON.stringify(noindexPaths)};`);
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
  let noindexPaths: string[] = [];
  let staticFiles: StaticFiles = { copies: new Map(), generated: new Map() };

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
        let buildDate = resolveBuildDate({ env: process.env.SITE_BUILD_DATE }).date;
        const run = await runGateForSite(root, { mode, manifest: options.manifest, configFile });
        siteUrl = run.content?.config.siteUrl ?? null;
        if (run.content !== null) {
          buildDate = resolveBuildDate({
            env: process.env.SITE_BUILD_DATE,
            pinned: run.content.config.pinnedBuildDate,
          }).date;
          noindexPaths = noindexPathsOf(run.content, buildDate);
          staticFiles = staticFilesOf(run.content, buildDate);
        }
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
        const dataModule = await buildDataModule(
          paths,
          mode,
          siteUrl,
          referencedMedia,
          buildDate,
          noindexPaths,
        );
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
      "astro:server:setup": ({ server }) => {
        // The dev server answers the same PDF and QR paths a build writes to dist.
        server.middlewares.use((request, response, next) => {
          const urlPath = decodeURI((request.url ?? "").split("?")[0] ?? "");
          const generated = staticFiles.generated.get(urlPath);
          if (generated !== undefined) {
            response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
            response.end(generated);
            return;
          }
          const source = staticFiles.copies.get(urlPath);
          if (source === undefined || !existsSync(source)) {
            next();
            return;
          }
          readFile(source).then(
            (body) => {
              response.setHeader("Content-Type", "application/pdf");
              response.end(body);
            },
            (error: unknown) => {
              next(error);
            },
          );
        });
      },
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        for (const [urlPath, source] of staticFiles.copies) {
          const target = urlPathToFile(outDir, urlPath);
          await mkdir(path.dirname(target), { recursive: true });
          await copyFile(source, target);
        }
        for (const [urlPath, svg] of staticFiles.generated) {
          const target = urlPathToFile(outDir, urlPath);
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, svg, "utf8");
        }
        const extraFiles = staticFiles.copies.size + staticFiles.generated.size;
        if (extraFiles > 0) {
          logger.info(
            `static files: ${staticFiles.copies.size} PDF(s), ${staticFiles.generated.size} QR code(s)`,
          );
        }
        if (mode === "prototype") {
          await writeFile(path.join(outDir, "robots.txt"), "User-agent: *\nDisallow: /\n", "utf8");
          logger.info("prototype: robots.txt disallows all; no sitemap");
          return;
        }
        if (siteUrl === null) {
          throw new Error("siteUrl missing in production build.");
        }
        const base = siteUrl.replace(/\/$/, "");
        const excluded = new Set(["/404/", ...noindexPaths]);
        const pages = (await listHtmlPages(outDir)).filter((page) => !excluded.has(page)).sort();
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
