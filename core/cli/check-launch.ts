/**
 * Pre-launch check against the provenance ledger (content-contract §3.3).
 *   node core/cli/check-launch.ts [siteRoot] [--json]
 */
import { LAUNCH_RULES, runLaunchCheck } from "../gate/launch-check.ts";
import { formatFindings } from "../gate/report.ts";
import { parseArgs } from "./args.ts";

const { root, flags } = parseArgs(process.argv.slice(2));
const result = await runLaunchCheck(root);

if (flags.has("json")) {
  console.log(JSON.stringify({ root, ...result }, null, 2));
} else {
  console.log(`Launch check: ${root}\n`);
  if (result.gateFindings.length > 0) {
    console.log("Production gate:");
    console.log(formatFindings(result.gateFindings));
    console.log("");
  }
  for (const finding of result.findings) {
    console.log(
      `${finding.rule} ${finding.subject}\n      ${finding.message} [${LAUNCH_RULES[finding.rule]}]`,
    );
  }
  if (result.passed) {
    console.log("PASSED: ready for public launch.");
  } else {
    console.log(`\nFAILED: ${result.findings.length} launch finding(s).`);
  }
}
if (!result.passed) {
  process.exitCode = 1;
}
