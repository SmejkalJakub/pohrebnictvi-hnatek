/**
 * Validate a site's content and run the publication gate without building.
 *   node core/cli/validate.ts [siteRoot] [--mode prototype|production] [--json]
 * Exit code 1 when the gate reports errors for the chosen mode.
 */
import { runGateForSite } from "../gate/run.ts";
import { formatFindings, summarize } from "../gate/report.ts";
import { hasErrors } from "../gate/rules.ts";
import { resolveMode } from "../mode.ts";
import { parseArgs } from "./args.ts";

const { root, flags } = parseArgs(process.argv.slice(2));
const modeFlag = flags.get("mode");
const mode = resolveMode(typeof modeFlag === "string" ? modeFlag : process.env.SITE_MODE);
const { findings } = await runGateForSite(root, { mode });

if (flags.has("json")) {
  console.log(JSON.stringify({ root, mode, findings }, null, 2));
} else {
  const counts = summarize(findings);
  console.log(`Site: ${root}\nMode: ${mode}\n`);
  console.log(formatFindings(findings));
  console.log(`\nerrors ${counts.error} · warnings ${counts.warning} · markers ${counts.marker}`);
}
if (hasErrors(findings)) {
  process.exitCode = 1;
}
