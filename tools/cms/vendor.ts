/**
 * The Decap CMS browser bundle, self-hosted in each exported site under public/admin/.
 *
 * Why not a CDN <script>: Decap loads ~90 code-split chunks at runtime from the same base URL, and
 * those chunk requests carry no integrity check. Copying the pinned release into the site keeps the
 * whole editor under the site's own origin and the export's integrity manifest.
 *
 * The tarball comes from the public npm registry (npm verifies its registry checksum) and the main
 * bundle is checked again against DECAP_BUNDLE_SHA384, so a different file can never be copied in.
 * Downloads are cached in node_modules/.cache/ (ignored by Git).
 */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { REPO_ROOT } from "../lib/repo.ts";

const run = promisify(execFile);

/** Pinned Decap CMS release (2026-10-26). Update both constants together. */
export const DECAP_VERSION = "3.17.3";
/** SHA-384 of dist/decap-cms.js in decap-cms@3.17.3 (equal to the unpkg copy). */
export const DECAP_BUNDLE_SHA384 = "RWRzuHfiZSWCt3nEvG7B0v3cMgM1C2UuJmgBSL92GQh4uXmNSkbcthql/mNBqvjr";
/** Folder under public/admin/ that holds the bundle; versioned so caches never mix releases. */
export const DECAP_DIR_NAME = `decap-cms-${DECAP_VERSION}`;

const CACHE_DIR = path.join(REPO_ROOT, "node_modules", ".cache", DECAP_DIR_NAME);

/** The files of the browser build that the page loads: the entry, its chunks, WebAssembly, and the
 * bundled third-party licence notices. (Decap CMS itself is MIT; CREDITS.md names it.) */
export function isBundleFile(name: string): boolean {
  if (name === "decap-cms.js" || name === "decap-cms.js.LICENSE.txt") {
    return true;
  }
  return /^\d+\.decap-cms\.js$/.test(name) || /^[0-9a-f]{20}\.wasm$/.test(name);
}

export function sha384(data: Buffer): string {
  return createHash("sha384").update(data).digest("base64");
}

export function integrityAttribute(): string {
  return `sha384-${DECAP_BUNDLE_SHA384}`;
}

async function verifiedEntry(dir: string): Promise<boolean> {
  const entry = path.join(dir, "decap-cms.js");
  if (!existsSync(entry)) {
    return false;
  }
  return sha384(await readFile(entry)) === DECAP_BUNDLE_SHA384;
}

/** Downloads the pinned release into the cache once, and checks the bundle hash. */
async function ensureCache(log: (line: string) => void): Promise<string> {
  if (await verifiedEntry(CACHE_DIR)) {
    return CACHE_DIR;
  }
  const scratch = await mkdtemp(path.join(os.tmpdir(), "decap-cms-"));
  try {
    const userConfig = path.join(scratch, "empty.npmrc");
    await writeFile(userConfig, "", "utf8");
    log(`Downloading decap-cms@${DECAP_VERSION} from the public npm registry …`);
    const { stdout } = await run("npm", ["pack", `decap-cms@${DECAP_VERSION}`, "--silent"], {
      cwd: scratch,
      env: {
        ...process.env,
        NPM_CONFIG_USERCONFIG: userConfig,
        npm_config_registry: "https://registry.npmjs.org/",
      },
      maxBuffer: 20 * 1024 * 1024,
    });
    const tarball = path.join(scratch, stdout.trim().split("\n").pop() as string);
    await run("tar", ["-xzf", tarball, "-C", scratch]);
    const dist = path.join(scratch, "package", "dist");
    if (!(await verifiedEntry(dist))) {
      throw new Error(
        `decap-cms@${DECAP_VERSION} dist/decap-cms.js does not match the pinned SHA-384; refusing to use it.`,
      );
    }
    const staging = path.join(scratch, "bundle");
    await mkdir(staging, { recursive: true });
    for (const name of await readdir(dist)) {
      if (isBundleFile(name)) {
        await copyFile(path.join(dist, name), path.join(staging, name));
      }
    }
    await rm(CACHE_DIR, { recursive: true, force: true });
    await mkdir(path.dirname(CACHE_DIR), { recursive: true });
    await rename(staging, CACHE_DIR);
    return CACHE_DIR;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

/** Copies the verified bundle into <targetDir> (normally <site>/public/admin/decap-cms-<version>/). */
export async function copyDecapBundle(targetDir: string, log: (line: string) => void): Promise<string[]> {
  const cache = await ensureCache(log);
  await mkdir(targetDir, { recursive: true });
  const copied: string[] = [];
  for (const name of (await readdir(cache)).sort()) {
    await copyFile(path.join(cache, name), path.join(targetDir, name));
    copied.push(name);
  }
  if (!(await verifiedEntry(targetDir))) {
    throw new Error(`Copied Decap bundle in ${targetDir} does not match the pinned SHA-384.`);
  }
  return copied;
}
