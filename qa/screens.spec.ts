/// <reference lib="dom" />
// Full-page screenshots for the Phase 2 report: every page at both widths in colour, plus a
// greyscale "recolour test" set (design-differentiation §6) for home, services and contact.
// Output: docs/qa/screens/<template>/<page>-<width>[-grey].jpg. Skip with QA_SCREENSHOTS=0.
import { join } from "node:path";
import { test } from "@playwright/test";
import { discoverRoutes, repoRoot, templates, viewports } from "./templates.ts";

const GREYSCALE_PAGES = new Set(["/", "/sluzby/", "/kontakt/"]);
const enabled = process.env.QA_SCREENSHOTS !== "0";

for (const t of templates) {
  const routes = discoverRoutes(t);
  const outDir = join(repoRoot, "docs/qa/screens", t.id);

  test.describe(`${t.letter} ${t.id} screenshots`, { tag: t.tag }, () => {
    test.skip(!enabled, "QA_SCREENSHOTS=0");

    for (const vp of viewports) {
      test.describe(`@${vp.name}px`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        for (const route of routes) {
          test(`screenshot ${route.path}`, async ({ page }) => {
            await page.goto(route.path);
            await page.evaluate(() => document.fonts.ready);
            // Full-page capture paints fixed elements (B's bottom bar) at their first-viewport position,
            // over the content. Growing the viewport to the page height puts them where a reader
            // sees them at the end of the page.
            const height = await page.evaluate(() => document.documentElement.scrollHeight);
            await page.setViewportSize({ width: vp.width, height: Math.max(height, vp.height) });
            await page.screenshot({
              path: join(outDir, `${route.slug}-${vp.name}.jpg`),
              fullPage: true,
              type: "jpeg",
              quality: 60,
              animations: "disabled",
            });
            if (GREYSCALE_PAGES.has(route.path)) {
              await page.addStyleTag({ content: "html { filter: grayscale(1) !important; }" });
              await page.screenshot({
                path: join(outDir, `${route.slug}-${vp.name}-grey.jpg`),
                fullPage: true,
                type: "jpeg",
                quality: 60,
                animations: "disabled",
              });
            }
          });
        }
      });
    }
  });
}
