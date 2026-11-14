// Template F "Rodinný rozhovor". SITE_ROOT / SITE_CONFIG are set by the npm scripts.
// Plain CSS only (no Tailwind), so template class names never collide with utilities.
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import siteCore from "../../core/integration.ts";
import manifest from "./template.manifest.ts";

export default defineConfig({
  output: "static",
  // TEMPLATE_OUT_DIR lets QA build option variants side by side without overwriting dist/.
  outDir: process.env.TEMPLATE_OUT_DIR ?? "./dist",
  // One small stylesheet (≈ 5 KB gzip): inlined, so the first paint waits for no extra request.
  build: { inlineStylesheets: "always" },
  integrations: [siteCore({ manifest })],
  vite: {
    resolve: {
      alias: { "@core": fileURLToPath(new URL("../../core", import.meta.url)) },
    },
  },
});
