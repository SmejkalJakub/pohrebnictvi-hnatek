/**
 * Static independence scan of an exported site (template-contract §9, requirements 2 and 4).
 * Pure file inspection: no install, no build, no network.
 */
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isInside } from "../lib/repo.ts";
import { escapingSpecifiers } from "./rewrite.ts";

export interface ScanFinding {
  check: string;
  file: string;
  detail: string;
}

export const PUBLIC_REGISTRY = "https://registry.npmjs.org/";

const SKIPPED_DIRS = new Set(["node_modules", "dist", ".astro", ".git"]);
const CODE_EXTENSIONS = new Set([".ts", ".mts", ".cts", ".mjs", ".js", ".cjs", ".astro", ".css"]);
const TEXT_EXTENSIONS = new Set([
  ...CODE_EXTENSIONS,
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".txt",
  ".html",
  ".svg",
  ".npmrc",
]);

/** Agent prompts and instruction files that must never ship to a client. */
const AGENT_FILES = new Set([
  "CLAUDE.md",
  "CLAUDE.local.md",
  "AGENTS.md",
  "GEMINI.md",
  ".claude",
  ".cursor",
  ".cursorrules",
  ".windsurfrules",
  ".aider.conf.yml",
  "copilot-instructions.md",
]);

/** Parts of the template system that must not be in an export. */
const SYSTEM_LEFTOVERS = [
  "fixtures",
  "templates",
  "tools",
  "harness",
  "clients",
  "exports",
  "qa",
  "src/core/tests",
  "fixture.site.config.ts",
];

const PRIVATE_REGISTRY_HINTS = [
  /pkgs\.dev\.azure\.com/i,
  /artifactory/i,
  /jfrog\.io/i,
  /npm\.pkg\.github\.com/i,
  /\/api\/v4\/(?:projects\/\d+\/)?packages\/npm/i,
  /verdaccio/i,
  /nexus[^\s"']*\/repository\//i,
  /localhost:4873/i,
];

const ABSOLUTE_PATH =
  /(?:^|[\s"'`(=:])(\/Users\/[^\s"'`)]+|\/home\/[^\s"'`)]+|\/private\/var\/[^\s"'`)]+|\/var\/folders\/[^\s"'`)]+|[A-Za-z]:\\\\(?:Users|Documents and Settings)\\\\[^\s"'`)]+)/;

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const LOCAL_SPECIFIER = /^(?:workspace:|file:|link:|portal:|git\+|git:|github:|https?:|\.{0,2}\/)/;

export async function listFiles(root: string, relative = ""): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    if (SKIPPED_DIRS.has(entry.name)) {
      continue;
    }
    const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(`${child}/`);
      files.push(...(await listFiles(root, child)));
    } else {
      files.push(child);
    }
  }
  return files;
}

function isText(relative: string): boolean {
  const base = path.posix.basename(relative);
  if (base === ".npmrc" || base === ".nvmrc" || base === ".gitignore") {
    return true;
  }
  return TEXT_EXTENSIONS.has(path.posix.extname(relative));
}

interface PackageJson {
  scripts?: Record<string, string>;
  workspaces?: unknown;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  overrides?: unknown;
  publishConfig?: { registry?: string };
}

function checkPackageJson(pkg: PackageJson, findings: ScanFinding[]): void {
  const file = "package.json";
  if (pkg.workspaces !== undefined) {
    findings.push({ check: "dependencies", file, detail: "declares workspaces" });
  }
  const groups = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] as const;
  for (const group of groups) {
    for (const [name, spec] of Object.entries(pkg[group] ?? {})) {
      if (LOCAL_SPECIFIER.test(spec)) {
        findings.push({
          check: "dependencies",
          file,
          detail: `${group}.${name} uses a non-registry specifier "${spec}"`,
        });
      } else if (group !== "peerDependencies" && !EXACT_VERSION.test(spec)) {
        findings.push({
          check: "dependencies",
          file,
          detail: `${group}.${name} is not pinned exactly ("${spec}")`,
        });
      }
    }
  }
  const overrides = JSON.stringify(pkg.overrides ?? {});
  if (/workspace:|file:|link:/.test(overrides)) {
    findings.push({ check: "dependencies", file, detail: "overrides use a local specifier" });
  }
  if (pkg.publishConfig?.registry !== undefined) {
    findings.push({
      check: "registry",
      file,
      detail: `publishConfig.registry ${pkg.publishConfig.registry}`,
    });
  }
  for (const [name, script] of Object.entries(pkg.scripts ?? {})) {
    if (/SITE_ROOT|SITE_CONFIG/.test(script)) {
      findings.push({ check: "scripts", file, detail: `script "${name}" sets SITE_ROOT/SITE_CONFIG` });
    }
  }
}

interface Lockfile {
  packages?: Record<string, { resolved?: string; link?: boolean; version?: string }>;
}

function checkLockfile(lock: Lockfile, findings: ScanFinding[]): void {
  const file = "package-lock.json";
  for (const [key, entry] of Object.entries(lock.packages ?? {})) {
    if (key === "") {
      continue;
    }
    if (!key.startsWith("node_modules/") && !key.includes("/node_modules/")) {
      findings.push({ check: "dependencies", file, detail: `non-registry package entry "${key}"` });
    }
    if (entry.link === true) {
      findings.push({ check: "dependencies", file, detail: `"${key}" is a link` });
    }
    if (entry.resolved !== undefined && !entry.resolved.startsWith(PUBLIC_REGISTRY)) {
      findings.push({ check: "registry", file, detail: `"${key}" resolves to ${entry.resolved}` });
    }
    if (entry.version !== undefined && LOCAL_SPECIFIER.test(entry.version)) {
      findings.push({ check: "dependencies", file, detail: `"${key}" has version "${entry.version}"` });
    }
  }
}

/** Every `@core/...` import must name an existing file under src/core/. */
function checkCoreImports(text: string, relative: string, root: string, findings: ScanFinding[]): void {
  for (const match of text.matchAll(/["']@core\/([^"'\s]+)["']/g)) {
    const rest = match[1] as string;
    if (rest.includes("*")) {
      continue;
    }
    if (!existsSync(path.join(root, "src", "core", rest))) {
      findings.push({
        check: "core-alias",
        file: relative,
        detail: `@core/${rest} does not resolve inside src/core`,
      });
    }
  }
}

async function checkAliasConfig(root: string, findings: ScanFinding[]): Promise<void> {
  const tsconfigFile = path.join(root, "tsconfig.json");
  if (existsSync(tsconfigFile)) {
    const tsconfig = JSON.parse(await readFile(tsconfigFile, "utf8")) as {
      compilerOptions?: { paths?: Record<string, string[]> };
    };
    const targets = tsconfig.compilerOptions?.paths?.["@core/*"] ?? [];
    const ok =
      targets.length > 0 &&
      targets.every(
        (target) => path.resolve(root, target.replace(/\*$/, "")) === path.join(root, "src", "core"),
      );
    if (!ok) {
      findings.push({
        check: "core-alias",
        file: "tsconfig.json",
        detail: `paths["@core/*"] is ${JSON.stringify(targets)}, expected ["./src/core/*"]`,
      });
    }
  }
  const astroConfig = path.join(root, "astro.config.mjs");
  if (existsSync(astroConfig)) {
    const text = await readFile(astroConfig, "utf8");
    if (
      text.includes("@core") &&
      !/["']@core["']\s*:\s*fileURLToPath\(new URL\(["']\.\/src\/core\/?["']/.test(text)
    ) {
      findings.push({
        check: "core-alias",
        file: "astro.config.mjs",
        detail: "the @core alias does not point at ./src/core",
      });
    }
  }
}

export interface ScanOptions {
  /** Absolute paths that must not appear in any file (e.g. the template-system checkout). */
  forbiddenStrings?: string[];
}

export async function scanExport(root: string, options: ScanOptions = {}): Promise<ScanFinding[]> {
  const findings: ScanFinding[] = [];
  const files = await listFiles(root);
  const forbidden = [...(options.forbiddenStrings ?? []), os.homedir()].filter((value) => value.length > 1);

  for (const relative of files) {
    const name = path.posix.basename(relative.replace(/\/$/, ""));
    if (AGENT_FILES.has(name)) {
      findings.push({ check: "agent-files", file: relative, detail: "agent instruction file or folder" });
    }
  }
  for (const leftover of SYSTEM_LEFTOVERS) {
    if (existsSync(path.join(root, leftover))) {
      findings.push({
        check: "leftovers",
        file: leftover,
        detail: "belongs to the template system, not to the export",
      });
    }
  }

  const pkgFile = path.join(root, "package.json");
  let pkg: PackageJson = {};
  if (existsSync(pkgFile)) {
    pkg = JSON.parse(await readFile(pkgFile, "utf8")) as PackageJson;
    checkPackageJson(pkg, findings);
  } else {
    findings.push({ check: "dependencies", file: "package.json", detail: "missing" });
  }
  const lockFile = path.join(root, "package-lock.json");
  if (existsSync(lockFile)) {
    checkLockfile(JSON.parse(await readFile(lockFile, "utf8")) as Lockfile, findings);
  } else {
    findings.push({ check: "dependencies", file: "package-lock.json", detail: "missing" });
  }
  await checkAliasConfig(root, findings);

  const declared = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  for (const relative of files) {
    if (relative.endsWith("/") || !isText(relative)) {
      continue;
    }
    const absolute = path.join(root, relative);
    const text = await readFile(absolute, "utf8");
    if (relative !== "package-lock.json") {
      const absoluteMatch = ABSOLUTE_PATH.exec(text);
      if (absoluteMatch !== null) {
        findings.push({ check: "absolute-paths", file: relative, detail: absoluteMatch[1] as string });
      }
      for (const value of forbidden) {
        if (text.includes(value)) {
          findings.push({ check: "absolute-paths", file: relative, detail: `contains ${value}` });
        }
      }
    }
    for (const hint of PRIVATE_REGISTRY_HINTS) {
      if (hint.test(text)) {
        findings.push({
          check: "registry",
          file: relative,
          detail: `private registry reference (${hint.source})`,
        });
      }
    }
    if (path.posix.basename(relative) === ".npmrc") {
      for (const line of text.split("\n")) {
        const registry = /^\s*(?:@[^:]+:)?registry\s*=\s*(\S+)/.exec(line);
        if (registry !== null && registry[1] !== PUBLIC_REGISTRY) {
          findings.push({ check: "registry", file: relative, detail: `registry ${registry[1] as string}` });
        }
        if (/_auth|_password|authToken/i.test(line)) {
          findings.push({ check: "registry", file: relative, detail: "credentials in .npmrc" });
        }
      }
    }
    const isCode =
      CODE_EXTENSIONS.has(path.posix.extname(relative)) || path.posix.basename(relative) === "tsconfig.json";
    if (!isCode) {
      continue;
    }
    for (const specifier of escapingSpecifiers(text, absolute, root)) {
      findings.push({
        check: "escaping-imports",
        file: relative,
        detail: `"${specifier}" resolves outside the project`,
      });
    }
    checkCoreImports(text, relative, root, findings);
    if (!isInside(path.join(root, "src", "core"), absolute)) {
      for (const match of text.matchAll(/@fontsource\/([a-z0-9-]+)/g)) {
        const font = `@fontsource/${match[1] as string}`;
        if (declared[font] === undefined) {
          findings.push({ check: "fonts", file: relative, detail: `${font} is used but not a dependency` });
        }
      }
    }
  }
  return dedupe(findings);
}

function dedupe(findings: ScanFinding[]): ScanFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.check}|${finding.file}|${finding.detail}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/** External resources a built page would load at runtime (fonts, scripts, styles, images, frames). */
export function externalResources(text: string): string[] {
  const found: string[] = [];
  const patterns = [
    /<script[^>]+src=["'](https?:)?\/\/[^"']+/gi,
    /<link(?![^>]*rel=["'](?:canonical|alternate)["'])[^>]+href=["'](https?:)?\/\/[^"']+/gi,
    /<img[^>]+src=["'](https?:)?\/\/[^"']+/gi,
    /<iframe[^>]+src=["'][^"']+/gi,
    /url\(\s*["']?(https?:)?\/\/[^)"']+/gi,
    /@import\s+["'](https?:)?\/\/[^"']+/gi,
    /fonts\.(googleapis|gstatic)\.com/gi,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      found.push(match[0]);
    }
  }
  return found;
}
