import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { CORE_DIR, REPO_ROOT } from "../../lib/repo.ts";
import { PINNED_ACTIONS, lockedVersion } from "../export.ts";
import { renderTemplate } from "../render.ts";
import { escapingSpecifiers, rewriteCoreReferences } from "../rewrite.ts";
import { externalResources, scanExport } from "../scan.ts";

const TEMPLATES = fileURLToPath(new URL("../templates", import.meta.url));
const temporary: string[] = [];

afterAll(async () => {
  for (const dir of temporary) {
    await rm(dir, { recursive: true, force: true });
  }
});

describe("core reference rewriting", () => {
  const out = "/tmp/out";
  const context = (originalFile: string, exportedFile: string) => ({
    originalFile: path.join(REPO_ROOT, originalFile),
    exportedFile: path.join(out, exportedFile),
    coreDir: CORE_DIR,
    exportedCoreDir: path.join(out, "src", "core"),
  });

  it("re-points astro.config, tsconfig, env.d.ts and site.config at src/core", () => {
    const astro = rewriteCoreReferences(
      'import siteCore from "../../core/integration.ts";\nnew URL("../../core", import.meta.url);\nimport m from "./template.manifest.ts";',
      context("templates/x/astro.config.mjs", "astro.config.mjs"),
    );
    expect(astro.text).toContain('from "./src/core/integration.ts"');
    expect(astro.text).toContain('new URL("./src/core", import.meta.url)');
    expect(astro.text).toContain('"./template.manifest.ts"');
    expect(astro.changes).toHaveLength(2);

    const tsconfig = rewriteCoreReferences(
      '{ "paths": { "@core/*": ["../../core/*"] }, "include": ["src", "../../core/**/*.ts"] }',
      context("templates/x/tsconfig.json", "tsconfig.json"),
    );
    expect(tsconfig.text).toContain('["./src/core/*"]');
    expect(tsconfig.text).toContain('"./src/core/**/*.ts"');

    const env = rewriteCoreReferences(
      '/// <reference path="../../../core/env.d.ts" />',
      context("templates/x/src/env.d.ts", "src/env.d.ts"),
    );
    expect(env.text).toBe('/// <reference path="./core/env.d.ts" />');

    const config = rewriteCoreReferences(
      'import type { SiteConfigInput } from "../../../core/content/config.ts";',
      context("fixtures/neutral/src/site.config.ts", "src/site.config.ts"),
    );
    expect(config.text).toContain('from "./core/content/config.ts"');
  });

  it("leaves references that do not point into core alone", () => {
    const result = rewriteCoreReferences(
      'import Site from "../../layouts/Site.astro"; const x = ".";',
      context("templates/x/src/pages/sluzby/index.astro", "src/pages/sluzby/index.astro"),
    );
    expect(result.changes).toEqual([]);
  });

  it("finds specifiers that escape the project root", () => {
    const root = "/tmp/site";
    expect(escapingSpecifiers('import a from "../../core/x.ts";', `${root}/astro.config.mjs`, root)).toEqual([
      "../../core/x.ts",
    ]);
    expect(escapingSpecifiers('import a from "../lib/x.ts";', `${root}/src/pages/a.astro`, root)).toEqual([]);
  });
});

describe("document templates", () => {
  it("fails on placeholders without a value and keeps GitHub expressions", () => {
    expect(renderTemplate("a {{x}} ${{ github.sha }}", { x: "1" })).toBe("a 1 ${{ github.sha }}");
    expect(() => renderTemplate("{{missing}}", {})).toThrow(/missing/);
  });

  it.each(["publish.yml.tpl", "discard.yml.tpl"])(
    "%s uses only official actions pinned to full SHAs and grants write only where needed",
    async (name) => {
      const text = renderTemplate(await readFile(path.join(TEMPLATES, name), "utf8"), PINNED_ACTIONS);
      const workflow = parse(text) as {
        on: { workflow_dispatch: { inputs: { payload: { required: boolean } } } };
        permissions: Record<string, string>;
        jobs: Record<
          string,
          {
            if?: string;
            permissions?: Record<string, string>;
            steps: { uses?: string; run?: string; env?: Record<string, string> }[];
          }
        >;
      };
      expect(workflow.on.workflow_dispatch.inputs.payload.required).toBe(false);
      expect(workflow.permissions).toEqual({ contents: "read" });
      for (const [jobName, job] of Object.entries(workflow.jobs)) {
        const pushes = job.steps.some((step) => (step.run ?? "").includes("git push"));
        const installs = job.steps.some((step) => (step.run ?? "").includes("npm ci"));
        if (pushes) {
          expect(job.permissions, jobName).toEqual({ contents: "write" });
          expect(installs, `${jobName} must not run npm with a write token`).toBe(false);
        } else {
          expect(job.permissions, jobName).toEqual({ contents: "read" });
        }
        for (const step of job.steps) {
          if (step.uses !== undefined) {
            expect(step.uses).toMatch(/^actions\/(checkout|setup-node)@[0-9a-f]{40}$/);
          }
        }
      }
      expect(
        Object.values(workflow.jobs).some((job) => job.if === "github.ref == 'refs/heads/content'"),
      ).toBe(true);
    },
  );

  it("publishes only after a production build and only by fast-forward", async () => {
    const text = renderTemplate(
      await readFile(path.join(TEMPLATES, "publish.yml.tpl"), "utf8"),
      PINNED_ACTIONS,
    );
    const workflow = parse(text) as {
      jobs: {
        build: { steps: { run?: string; env?: Record<string, string> }[] };
        promote: { needs: string; steps: { run?: string }[] };
      };
    };
    const build = workflow.jobs.build.steps.find((step) => step.run === "npm run build");
    expect(build?.env).toEqual({ SITE_MODE: "production" });
    expect(workflow.jobs.promote.needs).toBe("build");
    const push = workflow.jobs.promote.steps.map((step) => step.run ?? "").join("\n");
    expect(push).toContain("git merge-base --is-ancestor origin/main");
    expect(push).not.toMatch(/--force|\s-f\s/);
  });
});

describe("lockfile versions", () => {
  it("prefers a workspace-local install over the hoisted one", () => {
    const lock = {
      packages: {
        "node_modules/astro": { version: "7.4.2" },
        "templates/x/node_modules/astro": { version: "7.0.0" },
        "node_modules/@site/core": { link: true },
      },
    };
    expect(lockedVersion(lock, "templates/x", "astro")).toBe("7.0.0");
    expect(lockedVersion(lock, "core", "astro")).toBe("7.4.2");
    expect(() => lockedVersion(lock, "core", "@site/core")).toThrow();
  });
});

describe("independence scan", () => {
  async function site(files: Record<string, string>): Promise<string> {
    const root = await mkdtemp(path.join(os.tmpdir(), "scan-test-"));
    temporary.push(root);
    for (const [relative, text] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
      await writeFile(path.join(root, relative), text, "utf8");
    }
    return root;
  }

  const cleanPackage = JSON.stringify({ dependencies: { astro: "7.4.2" } });
  const cleanLock = JSON.stringify({
    packages: {
      "": {},
      "node_modules/astro": { resolved: "https://registry.npmjs.org/astro/-/astro-7.4.2.tgz" },
    },
  });

  it("passes a clean project", async () => {
    const root = await site({
      "package.json": cleanPackage,
      "package-lock.json": cleanLock,
      "src/core/x.ts": "export const x = 1;",
      "src/pages/index.astro": '---\nimport { x } from "@core/x.ts";\n---',
    });
    expect(await scanExport(root)).toEqual([]);
  });

  it("reports local specifiers, private registries, escaping imports, broken @core, agent files", async () => {
    const root = await site({
      "package.json": JSON.stringify({
        dependencies: { astro: "^7.4.2", "@site/core": "workspace:*", local: "file:../core" },
      }),
      "package-lock.json": JSON.stringify({
        packages: {
          "": {},
          "node_modules/astro": { resolved: "https://pkgs.dev.azure.com/org/_packaging/feed/npm/astro.tgz" },
          "node_modules/@site/core": { link: true },
          "../core": { version: "0.1.0" },
        },
      }),
      "astro.config.mjs": 'import siteCore from "../../core/integration.ts";',
      "src/pages/index.astro": '---\nimport { y } from "@core/missing.ts";\n---',
      "src/lib/a.ts": 'const root = "/Users/someone/repo/fixtures";',
      "CLAUDE.md": "agent notes",
      ".cursor/rules.md": "rules",
      "fixtures/neutral/x.json": "{}",
    });
    const checks = new Set((await scanExport(root)).map((finding) => finding.check));
    for (const check of [
      "dependencies",
      "registry",
      "escaping-imports",
      "core-alias",
      "absolute-paths",
      "agent-files",
      "leftovers",
    ]) {
      expect(checks, check).toContain(check);
    }
  });

  it("flags external runtime resources in built pages but not ordinary links", () => {
    expect(
      externalResources('<a href="https://mapy.cz/x">Mapa</a><link rel="canonical" href="https://x.cz/">'),
    ).toEqual([]);
    expect(
      externalResources(
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css"><script src="//cdn.example/x.js"></script>',
      ).length,
    ).toBeGreaterThan(1);
  });
});
