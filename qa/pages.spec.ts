/// <reference lib="dom" />
// Per-page invariants (template-contract §6, content-contract §6.5/§6.11/§8), run against both
// templates. Selectors use core data-* hooks, roles and landmarks only, never template classes.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  checkHoursSeparation,
  describeEmergencyLinks,
  describeFocus,
  headingOutline,
  horizontalOverflow,
  openAllDetails,
} from "./lib/browser-checks.ts";
import {
  digitsOnly,
  discoverRoutes,
  emergency,
  reflowViewport,
  templates,
  viewports,
  zoom200Viewport,
  type Route,
} from "./templates.ts";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const MAX_TAB_STOPS = 250;

async function open(page: Page, route: Route): Promise<void> {
  const response = await page.goto(route.path, { waitUntil: "load" });
  expect(response, `no response for ${route.path}`).not.toBeNull();
  await page.evaluate(() => document.fonts.ready);
}

for (const t of templates) {
  const routes = discoverRoutes(t);

  test.describe(`${t.letter} ${t.id}`, { tag: t.tag }, () => {
    test("dist/ was built and routes were discovered", () => {
      expect(routes.length, `no routes in ${t.dist}`).toBeGreaterThan(0);
      expect(routes.map((r) => r.path)).toContain("/");
      expect(routes.map((r) => r.path)).toContain("/404.html");
    });

    for (const vp of viewports) {
      test.describe(`@${vp.name}px`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        for (const route of routes) {
          test(`1 emergency tel: link in first viewport or fixed bar ${route.path}`, async ({ page }) => {
            await open(page, route);
            const links = await page.evaluate(describeEmergencyLinks);
            expect(links.length, "no [data-emergency-link] on the page").toBeGreaterThan(0);
            for (const link of links) {
              expect(link.href, "emergency link is not tel:").toMatch(/^tel:\+?\d+$/);
              expect(link.name, "accessible name lacks the service label").toContain(emergency.label);
              expect(digitsOnly(link.name), "accessible name lacks the number").toContain(
                digitsOnly(emergency.phone),
              );
            }
            const reachable = links.filter((l) => l.visible && (l.inFirstViewport || l.inFixedBar));
            expect(
              reachable.length,
              `none visible in the first viewport: ${JSON.stringify(links)}`,
            ).toBeGreaterThan(0);
            const big = reachable.filter((l) => l.width >= 44 && l.height >= 44);
            expect(
              big.length,
              `reachable emergency link smaller than 44×44: ${JSON.stringify(reachable)}`,
            ).toBeGreaterThan(0);
            // The accessible name as computed by the browser, for the reachable link.
            const first = reachable[0];
            if (first !== undefined) {
              const locator = page.locator("[data-emergency-link]").nth(first.index);
              await expect(locator).toHaveAccessibleName(new RegExp(emergency.label));
            }
          });

          test(`3 headings, landmarks and skip link ${route.path}`, async ({ page }) => {
            await open(page, route);
            await expect(page.locator("html")).toHaveAttribute("lang", "cs");
            await expect(page.getByRole("banner")).not.toHaveCount(0);
            await expect(page.getByRole("navigation")).not.toHaveCount(0);
            await expect(page.getByRole("main")).toHaveCount(1);
            await expect(page.getByRole("contentinfo")).not.toHaveCount(0);
            await expect(page.locator("main#obsah")).toHaveCount(1);

            await page.evaluate(openAllDetails);
            const report = await page.evaluate(headingOutline);
            expect(report.h1Count, `h1 count; outline:\n${report.outline.join("\n")}`).toBe(1);
            expect(report.skips, `skipped heading levels; outline:\n${report.outline.join("\n")}`).toEqual(
              [],
            );

            // Skip link: the first Tab stop, visible when focused, and it moves focus to main#obsah.
            await page.reload();
            await page.keyboard.press("Tab");
            const skip = page.locator(":focus");
            await expect(skip).toHaveAttribute("href", "#obsah");
            await expect(skip).toBeVisible();
            await expect(skip).toBeInViewport();
            await page.keyboard.press("Enter");
            await expect(page).toHaveURL(/#obsah$/);
            const focusedId = await page.evaluate(() => document.activeElement?.id ?? "");
            expect(focusedId, "focus did not move to main#obsah").toBe("obsah");
          });

          test(`4 axe-core: no serious or critical violations ${route.path}`, async ({ page }) => {
            await open(page, route);
            const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
            const severe = results.violations.filter(
              (v) => v.impact === "serious" || v.impact === "critical",
            );
            const summary = severe.map((v) => ({
              id: v.id,
              impact: v.impact,
              help: v.help,
              targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
              detail: v.nodes[0]?.failureSummary,
            }));
            expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
          });

          test(`6 keyboard: visible focus, never covered ${route.path}`, async ({ page }) => {
            await open(page, route);
            const seen = new Set<string>();
            const problems: string[] = [];
            let stops = 0;
            for (let i = 0; i < MAX_TAB_STOPS; i += 1) {
              await page.keyboard.press("Tab");
              const state = await page.evaluate(describeFocus);
              if (state.isBody) {
                if (stops > 0) {
                  break;
                }
                continue;
              }
              if (seen.has(state.key)) {
                break;
              }
              seen.add(state.key);
              stops += 1;
              if (!state.hasIndicator) {
                problems.push(`no focus indicator: ${state.description} (${state.indicator})`);
              }
              if (!state.inViewport) {
                problems.push(`focused element not scrolled into view: ${state.description}`);
              }
              if (state.obscuredBy !== null) {
                problems.push(`focused element covered by ${state.obscuredBy}: ${state.description}`);
              }
            }
            expect(stops, "no focusable elements reached").toBeGreaterThan(0);
            expect(problems, problems.join("\n")).toEqual([]);
          });

          test(`7 navigation toggle (aria-expanded, keyboard open/close) ${route.path}`, async ({ page }) => {
            await open(page, route);
            const toggle = page.getByRole("banner").locator("button[aria-expanded][aria-controls]").first();
            const toggleCount = await page
              .getByRole("banner")
              .locator("button[aria-expanded][aria-controls]")
              .count();
            const toggleVisible = toggleCount > 0 && (await toggle.isVisible());
            if (!toggleVisible) {
              // Wide layout without a toggle: the navigation links are shown inline.
              expect(vp.width, "no visible menu toggle at mobile width").toBeGreaterThanOrEqual(768);
              const navLinks = page.getByRole("navigation").first().getByRole("link");
              await expect(navLinks.first()).toBeVisible();
              return;
            }
            const controls = await toggle.getAttribute("aria-controls");
            const menu = page.locator(`[id="${controls}"]`);
            await expect(menu).toHaveCount(1);
            await expect(toggle).toHaveAttribute("aria-expanded", "false");
            await expect(menu.getByRole("link").first()).toBeHidden();

            // Reach the toggle with the keyboard.
            let reached = false;
            for (let i = 0; i < 40; i += 1) {
              await page.keyboard.press("Tab");
              if (await toggle.evaluate((el) => el === document.activeElement)) {
                reached = true;
                break;
              }
            }
            expect(reached, "menu toggle not reachable with Tab").toBe(true);

            await page.keyboard.press("Enter");
            await expect(toggle).toHaveAttribute("aria-expanded", "true");
            const firstLink = menu.getByRole("link").first();
            await expect(firstLink).toBeVisible();
            await page.keyboard.press("Tab");
            const insideMenu = await menu.evaluate((el) => el.contains(document.activeElement));
            expect(insideMenu, "Tab after opening does not enter the menu").toBe(true);

            await page.keyboard.press("Escape");
            await expect(toggle).toHaveAttribute("aria-expanded", "false");
            await expect(firstLink).toBeHidden();
            await expect(toggle).toBeFocused();

            // Space toggles too, and Enter closes again.
            await page.keyboard.press("Space");
            await expect(toggle).toHaveAttribute("aria-expanded", "true");
            await page.keyboard.press("Enter");
            await expect(toggle).toHaveAttribute("aria-expanded", "false");
          });
        }
      });
    }

    test.describe("@width-independent", () => {
      for (const route of routes) {
        test(`2 office hours never share a container or heading with the emergency CTA ${route.path}`, async ({
          page,
        }) => {
          await open(page, route);
          await page.evaluate(openAllDetails);
          const report = await page.evaluate(checkHoursSeparation);
          expect(report.findings, JSON.stringify(report.findings, null, 2)).toEqual([]);
          if (route.path === "/kontakt/") {
            expect(report.hoursFound, "the contact page shows no office hours").toBeGreaterThan(0);
          }
        });

        test(`5 reflow at 320 px (and 640 px = 200 % zoom) without horizontal scroll ${route.path}`, async ({
          page,
        }) => {
          for (const size of [reflowViewport, zoom200Viewport]) {
            await page.setViewportSize(size);
            await open(page, route);
            const result = await page.evaluate(horizontalOverflow);
            expect(
              result.scrollWidth,
              `${size.width} px overflow: ${result.offenders.join(", ")}`,
            ).toBeLessThanOrEqual(result.clientWidth);
          }
        });

        test(`8 prototype markers ${route.path}`, async ({ page }) => {
          await open(page, route);
          await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
          await expect(page.locator("[data-prototype-banner]")).toHaveCount(1);
          await expect(page.locator("[data-prototype-banner]")).toBeVisible();
          if (route.path === "/cenik/") {
            const prices = page.locator("[data-price]");
            const count = await prices.count();
            expect(count, "no prices on /cenik/").toBeGreaterThan(0);
            for (let i = 0; i < count; i += 1) {
              const label = prices.nth(i).locator("[data-demo-label]");
              await expect(label, `price ${i} lacks UKÁZKA`).toHaveText("UKÁZKA");
              await expect(label, `price ${i}: UKÁZKA not visible`).toBeVisible();
            }
            const notice = page.locator("[data-demo-pricing-notice]");
            await expect(notice).toHaveCount(1);
            await expect(notice).toBeVisible();
            await expect(notice).toHaveAttribute("role", "note");
            const noticeFirst = await page.evaluate(() => {
              const n = document.querySelector("[data-demo-pricing-notice]");
              const p = document.querySelector("[data-price]");
              if (n === null || p === null) {
                return false;
              }
              return (n.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
            });
            expect(noticeFirst, "the demo notice must come before the first price").toBe(true);
          }
        });
      }
    });
  });
}
