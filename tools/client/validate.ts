/**
 * Validate a client site in both modes (docs/client-workflow.md).
 *
 *   npm run client:validate -- <id> [--json]
 *
 * Runs the schema check, the publication gate and G-005 against the template manifest (what a
 * template build runs). Prints the prototype findings in full and the rules that still block a
 * production build. Exit 1 when prototype mode has errors; production errors are expected until
 * launch and do not change the exit code.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatFindings, summarize } from "../../core/gate/report.ts";
import type { Finding } from "../../core/gate/rules.ts";
import { parseArgs } from "../lib/args.ts";
import { REPO_ROOT } from "../lib/repo.ts";
import { type ClientSite, errorRules, gateClient, loadClient } from "./clients.ts";

export interface ClientValidation {
  prototype: Finding[];
  production: Finding[];
  prototypeOk: boolean;
  productionRules: string[];
}

export async function validateClient(site: ClientSite): Promise<ClientValidation> {
  const prototype = await gateClient(site, "prototype");
  const production = await gateClient(site, "production");
  return {
    prototype,
    production,
    prototypeOk: errorRules(prototype).length === 0,
    productionRules: errorRules(production),
  };
}

function counts(findings: readonly Finding[]): string {
  const summary = summarize(findings);
  return `errors ${summary.error} · warnings ${summary.warning} · markers ${summary.marker}`;
}

export function formatValidation(site: ClientSite, result: ClientValidation): string {
  const lines = [
    `Client: ${path.relative(REPO_ROOT, site.dir)} (template ${site.config.template})`,
    "",
    "Prototype mode:",
    formatFindings(result.prototype),
    counts(result.prototype),
    "",
  ];
  const blocking = result.production.filter((finding) => finding.level === "error");
  if (blocking.length === 0) {
    lines.push(
      "Production mode: no gate errors. Next: npm run check:launch -- " + path.relative(REPO_ROOT, site.dir),
    );
  } else {
    lines.push(
      `Production mode: blocked by ${result.productionRules.join(", ")} (${blocking.length} findings)`,
    );
    for (const rule of result.productionRules) {
      const first = blocking.find((finding) => finding.rule === rule) as Finding;
      const total = blocking.filter((finding) => finding.rule === rule).length;
      lines.push(`  ${rule} ×${total}  e.g. ${first.file} ${first.path}: ${first.en}`);
    }
  }
  lines.push("");
  if (result.prototypeOk) {
    lines.push("PROTOTYPE: PASS");
  } else {
    lines.push(`PROTOTYPE: FAIL (${errorRules(result.prototype).join(", ")})`);
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const id = args.positional[0];
  if (id === undefined) {
    throw new Error("Usage: npm run client:validate -- <id> [--json]");
  }
  const site = await loadClient(id);
  const result = await validateClient(site);
  if (args.flags.has("json")) {
    console.log(JSON.stringify({ client: id, template: site.config.template, ...result }, null, 2));
  } else {
    console.log(formatValidation(site, result));
  }
  if (!result.prototypeOk) {
    process.exitCode = 1;
  }
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`client:validate failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
