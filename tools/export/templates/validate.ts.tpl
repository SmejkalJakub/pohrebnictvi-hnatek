/**
 * Kontrola obsahu a publikačních pravidel bez sestavení webu.
 * Content validation and the publication gate, without building the site.
 *
 *   npm run validate                        # režim podle SITE_MODE, výchozí prototype
 *   npm run validate -- --mode production   # pravidla pro ostrý web / production rules
 *   npm run validate -- --json              # strojově čitelný výstup / machine-readable output
 *
 * Návratový kód 1 = obsah má chyby, které by zastavily sestavení webu v daném režimu.
 * Exit code 1 = the content has errors that would stop a build in that mode.
 */
import { fileURLToPath } from "node:url";
import { runGateForSite } from "../src/core/gate/run.ts";
import { formatFindings, summarize } from "../src/core/gate/report.ts";
import { hasErrors } from "../src/core/gate/rules.ts";
import { resolveMode } from "../src/core/mode.ts";
import manifest from "../template.manifest.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const argv = process.argv.slice(2);

let requestedMode: string | undefined = process.env.SITE_MODE;
const modeIndex = argv.indexOf("--mode");
if (modeIndex !== -1) {
  requestedMode = argv[modeIndex + 1];
}
const inlineMode = argv.find((arg) => arg.startsWith("--mode="));
if (inlineMode !== undefined) {
  requestedMode = inlineMode.slice("--mode=".length);
}
const mode = resolveMode(requestedMode);

const { findings } = await runGateForSite(root, { mode, manifest });

if (argv.includes("--json")) {
  console.log(JSON.stringify({ mode, findings }, null, 2));
} else {
  const counts = summarize(findings);
  console.log(`Režim / mode: ${mode}\n`);
  console.log(formatFindings(findings));
  console.log(`\nchyby / errors ${counts.error} · varování / warnings ${counts.warning} · značky / markers ${counts.marker}`);
}
if (hasErrors(findings)) {
  process.exitCode = 1;
}
