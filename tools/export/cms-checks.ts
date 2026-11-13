/**
 * Checks of the CMS parts of an exported site, used by export:verify and the tests:
 *   - the Decap admin (index.html, config.yml, pinned bundle) is present and points at `content`,
 *   - no credential-like string appears anywhere in the export,
 *   - the integrity step of the workflows, run exactly as GitHub Actions runs it,
 *   - one hosting config, and a contact form only where its handler can receive it.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { CONTENT_BRANCH, MEDIA_DIR, MEDIA_PUBLIC_FOLDER } from "../cms/decap-config.ts";
import { DECAP_BUNDLE_SHA384, DECAP_DIR_NAME, sha384 } from "../cms/vendor.ts";

export interface CheckResult {
  ok: boolean;
  details: string[];
}

/** Credential formats that must never be in a client repository or the built site. */
const SECRET_PATTERNS: [string, RegExp][] = [
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
  ["GitLab token", /\bglpat-[A-Za-z0-9_-]{20,}\b/],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["Cloudflare API token assignment", /CLOUDFLARE_API_TOKEN\s*[:=]\s*["']?[A-Za-z0-9_-]{30,}/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
];

const TEXT_EXTENSIONS = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yml",
  ".yaml",
]);

async function textFiles(root: string, relative = ""): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".astro") {
        continue;
      }
      files.push(...(await textFiles(root, child)));
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name)) || entry.name.startsWith(".")) {
      files.push(child);
    }
  }
  return files;
}

/** "<file>: <kind>" for every credential-like string. */
export async function findSecrets(root: string): Promise<string[]> {
  const findings: string[] = [];
  for (const file of await textFiles(root)) {
    const text = await readFile(path.join(root, file), "utf8");
    for (const [kind, pattern] of SECRET_PATTERNS) {
      if (pattern.test(text)) {
        findings.push(`${file}: ${kind}`);
      }
    }
  }
  return findings;
}

interface ParsedAdminConfig {
  backend?: { name?: string; branch?: string; repo?: string };
  media_folder?: string;
  public_folder?: string;
  publish_mode?: string;
  collections?: { name: string }[];
}

/** The admin as exported (`public/admin`) or as built (`dist/admin`). */
export async function checkAdmin(adminDir: string): Promise<CheckResult> {
  const details: string[] = [];
  let ok = true;
  const require = (label: string, passed: boolean): void => {
    details.push(`${passed ? "ok" : "MISSING"}: ${label}`);
    ok = ok && passed;
  };
  const index = path.join(adminDir, "index.html");
  const configFile = path.join(adminDir, "config.yml");
  const bundle = path.join(adminDir, DECAP_DIR_NAME, "decap-cms.js");
  require("admin/index.html", existsSync(index));
  require("admin/config.yml", existsSync(configFile));
  require(`admin/${DECAP_DIR_NAME}/decap-cms.js`, existsSync(bundle));
  if (!ok) {
    return { ok, details };
  }
  const html = await readFile(index, "utf8");
  require("index.html is noindex", html.includes('content="noindex, nofollow"'));
  require("index.html pins the bundle with integrity", html.includes(`sha384-${DECAP_BUNDLE_SHA384}`));
  require("index.html loads no external script", !/<script[^>]+src="https?:/i.test(html));
  require("bundle matches the pinned SHA-384", sha384(await readFile(bundle)) === DECAP_BUNDLE_SHA384);
  const config = parse(await readFile(configFile, "utf8")) as ParsedAdminConfig;
  require("backend git-gateway (DecapBridge)", config.backend?.name === "git-gateway");
  require(`backend branch "${CONTENT_BRANCH}"`, config.backend?.branch === CONTENT_BRANCH);
  require("simple publish mode (no editorial workflow)", config.publish_mode === "simple");
  require(`media in ${MEDIA_DIR}`, config.media_folder === MEDIA_DIR &&
    config.public_folder === MEDIA_PUBLIC_FOLDER);
  const collections = (config.collections ?? []).map((collection) => collection.name);
  details.push(`collections: ${collections.join(", ")}`);
  details.push(`repository: ${config.backend?.repo ?? "(none)"}`);
  return { ok, details };
}

/**
 * The export has exactly one hosting config; with Netlify, Git-triggered builds are cancelled.
 * A contact form in the built /kontakt/ must be a Netlify form (with honeypot) on a Netlify site,
 * and its success page must exist and be noindex.
 */
export async function checkHostingAndForm(siteRoot: string, distDir: string): Promise<CheckResult> {
  const details: string[] = [];
  let ok = true;
  const require = (label: string, passed: boolean): void => {
    details.push(`${passed ? "ok" : "MISSING"}: ${label}`);
    ok = ok && passed;
  };
  const netlifyToml = path.join(siteRoot, "netlify.toml");
  const netlify = existsSync(netlifyToml);
  const cloudflare = existsSync(path.join(siteRoot, "wrangler.jsonc"));
  require("exactly one hosting config (wrangler.jsonc or netlify.toml)", netlify !== cloudflare);
  if (netlify) {
    require("netlify.toml cancels Git-triggered builds", (await readFile(netlifyToml, "utf8")).includes(
      'ignore = "exit 0"',
    ));
  }
  const contactPage = path.join(distDir, "kontakt", "index.html");
  let html = "";
  if (existsSync(contactPage)) {
    html = await readFile(contactPage, "utf8");
  }
  const hasForm = html.includes("data-contact-form");
  details.push(`contact form: ${hasForm ? "on" : "off"}`);
  if (!hasForm) {
    return { ok, details };
  }
  require("contact form is a Netlify form on a Netlify site", netlify &&
    /<form[^>]+data-netlify="true"/.test(html));
  require("contact form has the honeypot", html.includes('netlify-honeypot="bot-field"'));
  const successPage = path.join(distDir, "kontakt", "odeslano", "index.html");
  let successHtml = "";
  if (existsSync(successPage)) {
    successHtml = await readFile(successPage, "utf8");
  }
  require("success page /kontakt/odeslano/ exists and is noindex", successHtml.includes(
    '<meta name="robots" content="noindex,nofollow">',
  ));
  return { ok, details };
}

export interface ScriptResult {
  code: number;
  output: string;
}

/** The `run` script of the integrity step in a workflow file. */
export async function integrityScript(workflowFile: string): Promise<string> {
  const workflow = parse(await readFile(workflowFile, "utf8")) as {
    jobs: Record<string, { steps: { name?: string; run?: string }[] }>;
  };
  for (const job of Object.values(workflow.jobs)) {
    for (const step of job.steps) {
      if (step.name === "Check that only content changed since the export" && step.run !== undefined) {
        return step.run;
      }
    }
  }
  throw new Error(`${workflowFile} has no integrity step.`);
}

/** Runs a workflow script with bash -eo pipefail in `cwd`, like GitHub's `shell: bash`. */
export function runScript(script: string, cwd: string, runnerTemp: string): Promise<ScriptResult> {
  return new Promise((resolve) => {
    const child = spawn("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", script], {
      cwd,
      env: { ...process.env, RUNNER_TEMP: runnerTemp, LC_ALL: "C" },
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

export function runGit(args: string[], cwd: string): Promise<ScriptResult> {
  return new Promise((resolve) => {
    const child = spawn("git", args, {
      cwd,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "export-verify",
        GIT_AUTHOR_EMAIL: "export-verify@example.invalid",
        GIT_COMMITTER_NAME: "export-verify",
        GIT_COMMITTER_EMAIL: "export-verify@example.invalid",
        GIT_CONFIG_NOSYSTEM: "1",
        HOME: cwd,
      },
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}
