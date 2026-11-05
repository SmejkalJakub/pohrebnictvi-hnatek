// Harness: a minimal Astro project that exercises core against the neutral fixture.
// It is NOT a template; it has no design. SITE_ROOT is set by the npm scripts.
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import siteCore from "../core/integration.ts";

export default defineConfig({
  // HARNESS_OUT_DIR lets tests build production variants without overwriting dist/.
  outDir: process.env.HARNESS_OUT_DIR ?? "./dist",
  integrations: [siteCore()],
  vite: {
    resolve: {
      alias: { "@core": fileURLToPath(new URL("../core", import.meta.url)) },
    },
  },
});
