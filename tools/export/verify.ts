/**
 * Independence verification of an exported site (template-contract §9).
 *
 *   npm run export:verify -- <exported dir> [--production fail|pass] [--rules G-011,G-012,…] [--keep]
 *
 * Copies the export to a fresh temp directory outside this repository and runs, with a clean
 * environment (no SITE_ROOT/SITE_CONFIG/SITE_MODE, no npm settings of this machine):
 *   static scan · npm ci · prototype build · production build · validate · astro check ·
 *   build with the network blocked after install · scan of the built pages for external resources.
 * --production fail (default): the production build must fail and name every rule in --rules
 *   (default: the rules the neutral fixture violates). --production pass: it must succeed and
 *   emit sitemap.xml.
 * Exits 1 on any failure and keeps the temp copy for inspection (also kept with --keep).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, stringFlag } from "../lib/args.ts";
import { REPO_ROOT, isInside } from "../lib/repo.ts";
import { externalResources, scanExport } from "./scan.ts";

export const FIXTURE_PRODUCTION_RULES = ["G-011", "G-012", "G-020", "G-021", "G-031", "G-032", "G-040"];
const GATE_FAILED = "Publication gate failed in production mode";
const OFFLINE_SANDBOX = "(version 1)(allow default)(deny network-outbound (remote ip))";

interface StepResult {
  name: string;
  ok: boolean;
  seconds: number;
  details: string[];
  output?: string;
}

interface CommandResult {
  code: number;
  output: string;
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      resolve({ code: 127, output: `${output}\n${error.message}` });
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

/** The environment of a fresh machine: no template-system variables, no npm settings of this one. */
function cleanEnv(userConfig: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    const lower = key.toLowerCase();
    const dropped =
      lower.startsWith("npm_") ||
      ["site_root", "site_config", "site_mode", "node_path", "node_options", "init_cwd"].includes(lower);
    if (!dropped) {
      env[key] = value;
    }
  }
  env.NPM_CONFIG_USERCONFIG = userConfig;
  env.ASTRO_TELEMETRY_DISABLED = "1";
  return env;
}

function offlineEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const blackhole = "http://127.0.0.1:9";
  return {
    ...env,
    HTTP_PROXY: blackhole,
    HTTPS_PROXY: blackhole,
    http_proxy: blackhole,
    https_proxy: blackhole,
    NO_PROXY: "",
    no_proxy: "",
    NODE_USE_ENV_PROXY: "1",
    npm_config_offline: "true",
  };
}

async function sandboxWorks(): Promise<boolean> {
  if (process.platform !== "darwin" || !existsSync("/usr/bin/sandbox-exec")) {
    return false;
  }
  const result = await runCommand(
    "/usr/bin/sandbox-exec",
    ["-p", OFFLINE_SANDBOX, "/usr/bin/true"],
    os.tmpdir(),
    process.env,
  );
  return result.code === 0;
}

function tail(output: string, lines = 40): string {
  return output.trimEnd().split("\n").slice(-lines).join("\n");
}

async function htmlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(full)));
    } else if (/\.(html|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** Directories above `dir` that contain node_modules (would leak packages into resolution). */
function parentNodeModules(dir: string): string[] {
  const found: string[] = [];
  let current = path.dirname(dir);
  while (true) {
    if (existsSync(path.join(current, "node_modules"))) {
      found.push(path.join(current, "node_modules"));
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return found;
}

export interface VerifyOptions {
  exportDir: string;
  production: "fail" | "pass";
  rules: string[];
  keep: boolean;
  log: (line: string) => void;
}

export async function verifyExport(
  options: VerifyOptions,
): Promise<{ ok: boolean; steps: StepResult[]; workDir: string }> {
  const { exportDir, log } = options;
  const steps: StepResult[] = [];
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "export-verify-"));
  const workDir = path.join(tempRoot, "site");
  const userConfig = path.join(tempRoot, "empty.npmrc");
  await writeFile(userConfig, "", "utf8");
  const env = cleanEnv(userConfig);

  const step = async (
    name: string,
    body: () => Promise<Omit<StepResult, "name" | "seconds">>,
  ): Promise<StepResult> => {
    log(`… ${name}`);
    const started = Date.now();
    let result: StepResult;
    try {
      result = { name, seconds: 0, ...(await body()) };
    } catch (error) {
      result = { name, seconds: 0, ok: false, details: [(error as Error).message] };
    }
    result.seconds = Math.round((Date.now() - started) / 100) / 10;
    steps.push(result);
    log(`${result.ok ? "PASS" : "FAIL"} ${name} (${result.seconds}s)`);
    return result;
  };
  const npm = (args: string[], extraEnv: NodeJS.ProcessEnv = {}): Promise<CommandResult> =>
    runCommand("npm", args, workDir, { ...env, ...extraEnv });

  await step("copy to a fresh directory outside the repository", async () => {
    if (isInside(REPO_ROOT, tempRoot)) {
      return { ok: false, details: [`temp dir ${tempRoot} is inside the repository`] };
    }
    await cp(exportDir, workDir, {
      recursive: true,
      filter: (source) => !["node_modules", "dist", ".astro"].includes(path.basename(source)),
    });
    const leaks = parentNodeModules(workDir);
    const details = [`work dir ${workDir}`];
    if (leaks.length > 0) {
      details.push(`parent node_modules found: ${leaks.join(", ")}`);
    }
    return { ok: leaks.length === 0, details };
  });

  await step("node version matches .nvmrc", async () => {
    const wanted = (await readFile(path.join(workDir, ".nvmrc"), "utf8")).trim();
    const actual = process.versions.node;
    return { ok: actual === wanted, details: [`.nvmrc ${wanted}, running ${actual}`] };
  });

  await step("static scan (specifiers, paths, @core, registries, agent files)", async () => {
    const findings = await scanExport(workDir, { forbiddenStrings: [REPO_ROOT, tempRoot] });
    const details = findings.map((finding) => `[${finding.check}] ${finding.file}: ${finding.detail}`);
    if (details.length === 0) {
      details.push("no findings");
    }
    return { ok: findings.length === 0, details };
  });

  const install = await step("npm ci", async () => {
    const result = await npm(["ci", "--no-audit", "--no-fund"]);
    return { ok: result.code === 0, details: [`exit ${result.code}`], output: result.output };
  });
  if (!install.ok) {
    return finish(options, steps, tempRoot, workDir);
  }

  await step("npm run build (prototype) must pass", async () => {
    const result = await npm(["run", "build"]);
    const details = [`exit ${result.code}`];
    let ok = result.code === 0;
    const dist = path.join(workDir, "dist");
    if (ok) {
      const index = await readFile(path.join(dist, "index.html"), "utf8");
      const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
      const checks: [string, boolean][] = [
        ["noindex meta on /", index.includes('<meta name="robots" content="noindex,nofollow">')],
        ["robots.txt disallows all", robots.includes("Disallow: /")],
        ["no sitemap.xml", !existsSync(path.join(dist, "sitemap.xml"))],
        ["prototype banner", index.includes("data-prototype-banner")],
      ];
      for (const [label, passed] of checks) {
        details.push(`${passed ? "ok" : "MISSING"}: ${label}`);
        ok = ok && passed;
      }
      const external: string[] = [];
      for (const file of await htmlFiles(dist)) {
        for (const resource of externalResources(await readFile(file, "utf8"))) {
          external.push(`${path.relative(dist, file)}: ${resource}`);
        }
      }
      details.push(`external runtime resources: ${external.length === 0 ? "none" : external.join("; ")}`);
      ok = ok && external.length === 0;
      details.push(
        `pages: ${(await htmlFiles(dist)).filter((file) => file.endsWith(".html")).length} html files`,
      );
    }
    return { ok, details, output: result.output };
  });

  await step(`SITE_MODE=production npm run build must ${options.production}`, async () => {
    const result = await npm(["run", "build"], { SITE_MODE: "production" });
    const details = [`exit ${result.code}`];
    if (options.production === "pass") {
      const dist = path.join(workDir, "dist");
      const sitemap = path.join(dist, "sitemap.xml");
      let ok = result.code === 0 && existsSync(sitemap);
      if (ok) {
        const xml = await readFile(sitemap, "utf8");
        const count = (xml.match(/<loc>/g) ?? []).length;
        const index = await readFile(path.join(dist, "index.html"), "utf8");
        const indexable = index.includes('<meta name="robots" content="index,follow">');
        const clean = !/data-prototype-banner|data-placeholder|data-missing-fact|UKÁZKA/.test(index);
        details.push(
          `sitemap.xml with ${count} URL(s)`,
          `indexable: ${indexable}`,
          `no prototype markers: ${clean}`,
        );
        ok = count > 0 && indexable && clean;
      } else {
        details.push("no sitemap.xml");
      }
      return { ok, details, output: result.output };
    }
    const gateFailed = result.output.includes(GATE_FAILED);
    const missing = options.rules.filter((rule) => !result.output.includes(rule));
    details.push(`gate failure reported: ${gateFailed}`);
    details.push(`rules named: ${options.rules.filter((rule) => !missing.includes(rule)).join(", ")}`);
    if (missing.length > 0) {
      details.push(`rules NOT named: ${missing.join(", ")}`);
    }
    const ok = result.code !== 0 && gateFailed && missing.length === 0;
    return { ok, details, output: result.output };
  });

  await step("npm run validate (prototype) must pass", async () => {
    const result = await npm(["run", "validate"]);
    return {
      ok: result.code === 0,
      details: [`exit ${result.code}`, tail(result.output, 1)],
      output: result.output,
    };
  });

  await step(`npm run validate -- --mode production must ${options.production}`, async () => {
    const result = await npm(["run", "validate", "--", "--mode", "production"]);
    const details = [`exit ${result.code}`];
    if (options.production === "pass") {
      return { ok: result.code === 0, details, output: result.output };
    }
    const missing = options.rules.filter((rule) => !result.output.includes(rule));
    if (missing.length > 0) {
      details.push(`rules NOT named: ${missing.join(", ")}`);
    }
    return { ok: result.code !== 0 && missing.length === 0, details, output: result.output };
  });

  await step("npm run check (astro check)", async () => {
    const result = await npm(["run", "check"]);
    const summary = /(\d+) errors?[^\n]*/.exec(result.output.split("Result").pop() ?? "");
    return {
      ok: result.code === 0,
      details: [`exit ${result.code}`, summary?.[0] ?? tail(result.output, 3)],
      output: result.output,
    };
  });

  await step("build with the network blocked after install", async () => {
    await rm(path.join(workDir, "dist"), { recursive: true, force: true });
    await rm(path.join(workDir, "node_modules", ".astro"), { recursive: true, force: true });
    const mode = options.production === "pass" ? "production" : "prototype";
    const blocked = offlineEnv({ ...env, SITE_MODE: mode });
    const details: string[] = [];
    let result: CommandResult;
    if (await sandboxWorks()) {
      details.push(
        "method: macOS sandbox-exec denying outbound IP traffic, plus proxy variables pointing nowhere",
      );
      result = await runCommand(
        "/usr/bin/sandbox-exec",
        ["-p", OFFLINE_SANDBOX, "npm", "run", "build"],
        workDir,
        blocked,
      );
    } else {
      details.push(
        "method: HTTP(S)_PROXY to 127.0.0.1:9 with NODE_USE_ENV_PROXY=1 and npm offline (no OS sandbox available)",
      );
      result = await npm(["run", "build"], blocked);
    }
    details.push(`mode ${mode}, exit ${result.code}`);
    const ok = result.code === 0 && existsSync(path.join(workDir, "dist", "index.html"));
    return { ok, details, output: result.output };
  });

  return finish(options, steps, tempRoot, workDir);
}

async function finish(
  options: VerifyOptions,
  steps: StepResult[],
  tempRoot: string,
  workDir: string,
): Promise<{ ok: boolean; steps: StepResult[]; workDir: string }> {
  const ok = steps.every((result) => result.ok);
  if (ok && !options.keep) {
    await rm(tempRoot, { recursive: true, force: true });
  }
  return { ok, steps, workDir };
}

export function formatReport(
  exportDir: string,
  ok: boolean,
  steps: StepResult[],
  workDir: string,
  kept: boolean,
): string {
  const lines = [``, `Export verification: ${exportDir}`, ``];
  for (const result of steps) {
    lines.push(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${result.seconds}s)`);
    for (const detail of result.details) {
      lines.push(`        ${detail}`);
    }
    if (!result.ok && result.output !== undefined) {
      lines.push("        --- last lines of output ---");
      for (const line of tail(result.output).split("\n")) {
        lines.push(`        | ${line}`);
      }
    }
  }
  lines.push("");
  lines.push(
    `${ok ? "RESULT: PASS" : "RESULT: FAIL"} (${steps.filter((result) => result.ok).length}/${steps.length} steps)`,
  );
  if (!ok || kept) {
    lines.push(`Work directory kept: ${workDir}`);
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const target = args.positional[0];
  if (target === undefined) {
    throw new Error(
      "Usage: npm run export:verify -- <exported dir> [--production fail|pass] [--rules G-011,…] [--keep]",
    );
  }
  const exportDir = path.resolve(process.cwd(), target);
  if (!existsSync(path.join(exportDir, "package.json"))) {
    throw new Error(`${exportDir} is not an exported site (no package.json).`);
  }
  const production = stringFlag(args, "production") ?? "fail";
  if (production !== "fail" && production !== "pass") {
    throw new Error("--production must be fail or pass.");
  }
  const rulesFlag = stringFlag(args, "rules");
  let rules = FIXTURE_PRODUCTION_RULES;
  if (rulesFlag !== null) {
    rules = rulesFlag
      .split(",")
      .map((rule) => rule.trim())
      .filter((rule) => rule !== "");
  }
  const keep = args.flags.has("keep");
  const { ok, steps, workDir } = await verifyExport({
    exportDir,
    production,
    rules,
    keep,
    log: (line) => console.log(line),
  });
  console.log(formatReport(exportDir, ok, steps, workDir, keep));
  if (!ok) {
    process.exitCode = 1;
  }
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`Verification failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
