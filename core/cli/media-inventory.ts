/**
 * Print the media inventory as a Markdown table.
 *   node core/cli/media-inventory.ts [siteRoot] [--out file.md]
 */
import { writeFile } from "node:fs/promises";
import { loadValidatedContent } from "../content/snapshot.ts";
import { buildMediaInventory, inventoryToMarkdown } from "../media/inventory.ts";
import { parseArgs } from "./args.ts";

const { root, flags } = parseArgs(process.argv.slice(2));
const { content, problems } = await loadValidatedContent(root);
if (content === null) {
  console.error(`Content is invalid (${problems.length} problem(s)); run npm run validate first.`);
  process.exit(1);
}
const markdown = `# Media inventory\n\nGenerated from ${root}\n\n${inventoryToMarkdown(buildMediaInventory(content))}\n`;
const out = flags.get("out");
if (typeof out === "string") {
  await writeFile(out, markdown, "utf8");
  console.log(`Written ${out}`);
} else {
  console.log(markdown);
}
