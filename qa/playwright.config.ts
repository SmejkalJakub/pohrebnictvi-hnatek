// Cross-template QA (phase-2-plan S6). Run with `npm run qa` from the repo root.
// Each template is built with its own npm script (fixture content, prototype mode) and served
// from dist/ with `astro preview` on its own port. The same specs run against both templates:
// tests carry a template tag and each project greps for its own.
import { defineConfig, devices } from "@playwright/test";
import { baseUrlFor, templates } from "./templates.ts";

const fixtureEnv = {
  SITE_ROOT: "../../fixtures/neutral",
  SITE_CONFIG: "./fixture.site.config.ts",
};

export default defineConfig({
  testDir: ".",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "./playwright-report", open: "never" }]],
  timeout: 60_000,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    locale: "cs-CZ",
    trace: "retain-on-failure",
  },
  projects: [
    ...templates.map((t) => ({
      name: t.id,
      grep: new RegExp(t.tag),
      testIgnore: /structure\.spec\.ts/,
      use: { baseURL: baseUrlFor(t) },
      metadata: { templateId: t.id },
    })),
    {
      // Cross-template structural checks (needs both builds; no per-template tag).
      name: "structure",
      testMatch: /structure\.spec\.ts/,
    },
  ],
  webServer: templates.map((t) => ({
    command: `npm run build && npx astro preview --ignore-lock --host 127.0.0.1 --port ${t.port}`,
    cwd: t.dir,
    env: fixtureEnv,
    url: `${baseUrlFor(t)}/`,
    reuseExistingServer: false,
    timeout: 240_000,
    stdout: "ignore" as const,
    stderr: "pipe" as const,
  })),
});
