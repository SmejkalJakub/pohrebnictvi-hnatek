/**
 * Export a client site and verify the export (docs/client-workflow.md).
 *
 *   npm run client:export -- <id> [--out <dir>] [--force] [--name <package-name>] [--keep]
 *
 * 1. Validates the client (prototype must pass) and records which rules block production.
 * 2. Runs tools/export for the template in clients/<id>/src/site.config.ts. --out defaults to
 *    exports/<id>/ (ignored by Git); use a directory outside this repo for the repository you push.
 * 3. Runs export:verify. While the production gate has errors, verify expects the production build
 *    to fail and to name exactly those rules; once it has none, verify expects it to pass.
 * --force replaces an earlier export in --out; --keep keeps verify's temp copy.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportSite } from "../export/export.ts";
import { formatReport, verifyExport } from "../export/verify.ts";
import { parseArgs, stringFlag } from "../lib/args.ts";
import { REPO_ROOT } from "../lib/repo.ts";
import { loadClient } from "./clients.ts";
import { formatValidation, validateClient } from "./validate.ts";

export function defaultExportDir(id: string): string {
  return path.join(REPO_ROOT, "exports", id);
}

/** export:verify flags for a client: what the production build must do, and which rules it must name. */
export function verifyExpectation(productionRules: string[]): {
  production: "fail" | "pass";
  rules: string[];
} {
  if (productionRules.length === 0) {
    return { production: "pass", rules: [] };
  }
  return { production: "fail", rules: productionRules };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const id = args.positional[0];
  if (id === undefined) {
    throw new Error("Usage: npm run client:export -- <id> [--out <dir>] [--force] [--name <pkg>] [--keep]");
  }
  const site = await loadClient(id);
  const validation = await validateClient(site);
  console.log(formatValidation(site, validation));
  if (!validation.prototypeOk) {
    throw new Error("prototype validation fails; fix the errors above before exporting.");
  }

  const outFlag = stringFlag(args, "out");
  let outDir = defaultExportDir(id);
  if (outFlag !== null) {
    outDir = path.resolve(process.cwd(), outFlag);
  }
  console.log("");
  const exported = await exportSite({
    clientDir: site.dir,
    templateId: site.config.template,
    outDir,
    configFile: null,
    packageName: stringFlag(args, "name"),
    force: args.flags.has("force"),
    log: (line) => console.log(line),
  });
  for (const note of exported.notes) {
    console.log(`  note: ${note}`);
  }

  const expectation = verifyExpectation(validation.productionRules);
  let expected = "production build must pass";
  if (expectation.production === "fail") {
    expected = `production build must fail naming ${expectation.rules.join(", ")}`;
  }
  console.log(`\nVerifying ${outDir} (${expected}) …`);
  const keep = args.flags.has("keep");
  const verified = await verifyExport({
    exportDir: outDir,
    production: expectation.production,
    rules: expectation.rules,
    keep,
    log: (line) => console.log(line),
  });
  console.log(formatReport(outDir, verified.ok, verified.steps, verified.workDir, keep));
  if (!verified.ok) {
    process.exitCode = 1;
    return;
  }
  console.log(`\nExport ready: ${outDir}\nShip checklist: /site-ship ${id}`);
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`client:export failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
