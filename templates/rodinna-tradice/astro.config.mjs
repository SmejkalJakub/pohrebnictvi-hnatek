// Template A: Rodinná tradice. SITE_ROOT / SITE_CONFIG are set by the npm scripts.
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import siteCore from "../../core/integration.ts";
import manifest from "./template.manifest.ts";

export default defineConfig({
  output: "static",
  integrations: [siteCore({ manifest })],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@core": fileURLToPath(new URL("../../core", import.meta.url)) },
    },
  },
});
