import { existsSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadValidatedContent } from "../../../core/content/snapshot.ts";
import { Approvals, Ledger, collectTrackedFacts } from "../../../core/gate/launch-check.ts";
import { FIXTURE_PRODUCTION_RULES } from "../../export/verify.ts";
import { loadManifest } from "../../lib/repo.ts";
import { planAstroRun } from "../astro.ts";
import { assertClientId, errorRules, gateClient, loadClient } from "../clients.ts";
import { verifyExpectation } from "../export.ts";
import { scaffoldClient } from "../new.ts";
import { validateClient } from "../validate.ts";

const TEMPLATES = ["rodinna-tradice", "dustojna-jednoduchost"] as const;

let clientsDir: string;

beforeAll(async () => {
  clientsDir = await mkdtemp(path.join(os.tmpdir(), "client-scaffold-"));
});

afterAll(async () => {
  await rm(clientsDir, { recursive: true, force: true });
});

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

describe.each(TEMPLATES)("client:new with %s", (templateId) => {
  const id = `test-${templateId}`;

  beforeAll(async () => {
    await scaffoldClient({ id, templateId, clientsDir, today: "2026-11-09" });
  });

  it("creates the exported-site layout", async () => {
    const dir = path.join(clientsDir, id);
    for (const relative of [
      "src/site.config.ts",
      "src/content/site/company.json",
      "src/content/pages/home.md",
      "provenance/facts.json",
      "provenance/approvals.json",
    ]) {
      expect(existsSync(path.join(dir, relative)), relative).toBe(true);
    }
    const media = await readdir(path.join(dir, "src", "assets", "media"));
    expect(media.every((file) => file.startsWith("placeholder-"))).toBe(true);
  });

  it("selects the template and the manifest defaults", async () => {
    const site = await loadClient(id, clientsDir);
    const manifest = await loadManifest(templateId);
    expect(site.config.template).toBe(templateId);
    expect(site.config.siteUrl).toBe("https://example.invalid");
    expect(site.config.homepage.sections).toEqual(manifest.homepageSections.default);
    const defaults = Object.fromEntries(
      Object.entries(manifest.options).map(([name, declaration]) => [name, declaration.default]),
    );
    expect(site.config.options).toEqual(defaults);
  });

  it("passes prototype validation and fails production like the neutral fixture", async () => {
    const site = await loadClient(id, clientsDir);
    expect(errorRules(await gateClient(site, "prototype"))).toEqual([]);
    const result = await validateClient(site);
    expect(result.prototypeOk).toBe(true);
    expect(result.productionRules).toEqual([...FIXTURE_PRODUCTION_RULES].sort());
  });

  it("writes a ledger with every tracked fact UNKNOWN", async () => {
    const dir = path.join(clientsDir, id);
    const ledger = Ledger.parse(await readJson(path.join(dir, "provenance", "facts.json")));
    expect(ledger.client).toBe(id);
    expect(ledger.createdAt).toBe("2026-11-09");
    const entries = Object.values(ledger.facts);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.status).toBe("UNKNOWN");
      expect(entry.value).toBeNull();
    }
    const { content } = await loadValidatedContent(dir);
    expect(content).not.toBeNull();
    for (const fact of collectTrackedFacts(content!)) {
      expect(Object.keys(ledger.facts), fact.key).toContain(fact.key);
    }
    expect(Object.keys(ledger.facts)).toContain("company.legalIds.ico");
  });

  it("writes approvals with all copy DRAFT and nothing signed off", async () => {
    const dir = path.join(clientsDir, id);
    const approvals = Approvals.parse(await readJson(path.join(dir, "provenance", "approvals.json")));
    expect(approvals.copy["pages/home.md"]?.status).toBe("DRAFT");
    expect(Object.values(approvals.copy).every((record) => record.approvedBy === null)).toBe(true);
    expect(approvals.pricing.status).toBe("NOT_APPROVED");
    expect(Object.keys(approvals.guidance).length).toBeGreaterThan(0);
    expect(approvals.images).toEqual({});
  });

  it("runs astro in the template with the client as SITE_ROOT", async () => {
    const dev = await planAstroRun("dev", id, ["--port", "4400"], clientsDir);
    expect(path.basename(dev.cwd)).toBe(templateId);
    expect(dev.args).toEqual(["dev", "--port", "4400"]);
    expect(dev.env.SITE_ROOT).toBe(path.join(clientsDir, id));
    expect(dev.env.SITE_CONFIG).toBe(path.join(clientsDir, id, "src", "site.config.ts"));
    expect(dev.env.SITE_MODE).toBe("prototype");
    const build = await planAstroRun("build", id, ["--production"], clientsDir);
    expect(build.args).toEqual(["build"]);
    expect(build.env.SITE_MODE).toBe("production");
  });

  it("refuses to overwrite an existing client", async () => {
    await expect(scaffoldClient({ id, templateId, clientsDir })).rejects.toThrow(/already exists/);
  });
});

describe("client ids and templates", () => {
  it("rejects ids that are not slugs", () => {
    for (const bad of ["Hnatek", "a_b", "../x", "-a", "a--b", ""]) {
      expect(() => assertClientId(bad), bad).toThrow(/Invalid client id/);
    }
    expect(() => assertClientId("novak-brno2")).not.toThrow();
  });

  it("rejects an unknown template without leaving a directory", async () => {
    await expect(scaffoldClient({ id: "no-template", templateId: "nope", clientsDir })).rejects.toThrow(
      /not found/,
    );
    expect(existsSync(path.join(clientsDir, "no-template"))).toBe(false);
  });

  it("names a missing client", async () => {
    await expect(loadClient("missing", clientsDir)).rejects.toThrow(/client:new/);
  });
});

describe("verifyExpectation", () => {
  it("expects a failing production build naming the blocking rules", () => {
    expect(verifyExpectation(["G-011", "G-012"])).toEqual({ production: "fail", rules: ["G-011", "G-012"] });
  });

  it("expects a passing production build when nothing blocks it", () => {
    expect(verifyExpectation([])).toEqual({ production: "pass", rules: [] });
  });
});
