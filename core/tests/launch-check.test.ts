import { beforeAll, describe, expect, it } from "vitest";
import {
  Approvals,
  checkLedger,
  collectTrackedFacts,
  getFactValue,
  findProvenanceDir,
  runLaunchCheck,
  type Ledger,
} from "../gate/launch-check.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { FIXTURE_ROOT, loadFixture, makeProductionReady } from "./helpers.ts";

let content: ValidatedContent;

beforeAll(async () => {
  content = makeProductionReady(await loadFixture());
});

/** A ledger in which every tracked fact is VERIFIED with its current content value. */
function verifiedLedger(source: ValidatedContent): Ledger {
  const facts: Ledger["facts"] = {};
  for (const fact of collectTrackedFacts(source)) {
    facts[fact.key] = {
      value: fact.value,
      status: "VERIFIED",
      source: "client meeting",
      retrievedAt: null,
      verifiedBy: "Operátor",
      verifiedAt: "2026-11-05",
      note: null,
    };
  }
  return { client: "test", createdAt: "2026-11-05", facts };
}

function fullApprovals(source: ValidatedContent) {
  const signOff = { approvedBy: "Klient", approvedAt: "2026-11-05" };
  const copy: Record<string, { status: "APPROVED"; approvedBy: string; approvedAt: string }> = {};
  for (const entry of [
    ...source.pages,
    ...source.services,
    ...source.guidance,
    ...source.coffins,
    ...source.flowers,
  ]) {
    copy[entry.file.replace("src/content/", "")] = { status: "APPROVED", ...signOff };
  }
  const guidance: Record<string, { reviewedBy: string; reviewedAt: string }> = {};
  for (const entry of source.guidance) {
    guidance[entry.file.replace("src/content/", "")] = { reviewedBy: "Odborník", reviewedAt: "2026-10-01" };
  }
  return Approvals.parse({
    copy,
    guidance,
    pricing: { status: "APPROVED", method: "e-mail", ...signOff },
  });
}

function launchRules(ledger: Ledger, approvals = fullApprovals(content), source = content): string[] {
  return [...new Set(checkLedger(source, ledger, approvals).map((finding) => finding.rule))].sort();
}

describe("fact addressing", () => {
  it("resolves array members by id", () => {
    expect(getFactValue(content, "contact.phones.kancelar.number")).toBe("+420000000101");
    expect(getFactValue(content, "office-hours.weekly.pracovni-dny.open")).toBe("07:00");
    expect(getFactValue(content, "contact.phones.missing.number")).toBeUndefined();
    expect(getFactValue(content, "pricing.visible")).toBeUndefined();
  });
});

describe("checkLedger", () => {
  it("passes with a fully verified ledger and all sign-offs", () => {
    expect(launchRules(verifiedLedger(content))).toEqual([]);
  });

  it("L-002 flags a displayed fact without provenance", () => {
    const ledger = verifiedLedger(content);
    delete ledger.facts["emergency.phone"];
    expect(launchRules(ledger)).toEqual(["L-002"]);
  });

  it("accepts an ancestor key as provenance for nested values", () => {
    const ledger = verifiedLedger(content);
    const group = ledger.facts["office-hours.weekly.pracovni-dny"]!;
    delete ledger.facts["office-hours.weekly.pracovni-dny"];
    ledger.facts["office-hours.weekly"] = { ...group, value: content.officeHours.weekly };
    expect(launchRules(ledger)).toEqual([]);
  });

  it("L-003 existing-website facts must be re-verified", () => {
    const ledger = verifiedLedger(content);
    ledger.facts["contact.phones.kancelar.number"]!.status = "EXISTING_WEBSITE";
    expect(launchRules(ledger)).toEqual(["L-003"]);
  });

  it("L-003 client-provided facts need an approval record", () => {
    const ledger = verifiedLedger(content);
    ledger.facts["company.tradition.publicWording"]!.status = "CLIENT_PROVIDED";
    expect(launchRules(ledger)).toEqual(["L-003"]);
    const approvals = fullApprovals(content);
    approvals.facts["company.tradition.publicWording"] = { approvedBy: "Klient", approvedAt: "2026-11-05" };
    expect(launchRules(ledger, approvals)).toEqual([]);
  });

  it("L-004 content that drifted from the ledger", () => {
    const ledger = verifiedLedger(content);
    ledger.facts["emergency.phone"]!.value = "+420000000198";
    expect(launchRules(ledger)).toEqual(["L-004"]);
  });

  it("L-005 content holds a value the ledger says is unknown (possible invention)", () => {
    const ledger = verifiedLedger(content);
    ledger.facts["company.tradition.foundedYear"] = {
      value: null,
      status: "UNKNOWN",
      source: null,
      retrievedAt: null,
      verifiedBy: null,
      verifiedAt: null,
      note: null,
    };
    const invented = structuredClone(content);
    invented.company.tradition.foundedYear = 1986;
    expect(launchRules(ledger, fullApprovals(invented), invented)).toContain("L-005");
  });

  it("L-006 / L-007 / L-008 missing copy, pricing, guidance and image sign-offs", () => {
    const withImage = structuredClone(content);
    withImage.flowers[0]!.data.image = {
      file: "placeholder-1x1.png",
      alt: "Věnec",
      decorative: false,
      caption: null,
      credit: null,
      source: "client",
      depicts: "actual-business",
      rightsConfirmed: true,
      focus: "center",
    };
    const approvals = fullApprovals(withImage);
    delete approvals.copy["pages/o-nas.md"];
    approvals.pricing.status = "NOT_APPROVED";
    expect(launchRules(verifiedLedger(withImage), approvals, withImage)).toEqual(["L-006", "L-007", "L-008"]);
  });
});

describe("runLaunchCheck on the fixture", () => {
  it("fails: production gate errors and EXISTING_WEBSITE facts", async () => {
    const result = await runLaunchCheck(FIXTURE_ROOT, { now: new Date("2026-11-05") });
    expect(result.passed).toBe(false);
    const found = new Set(result.findings.map((finding) => finding.rule));
    expect(found.has("L-001")).toBe(true);
    expect(found.has("L-003")).toBe(true);
  });
});

describe("provenance location", () => {
  it("uses provenance/ before handover and docs/provenance/ inside an export", async () => {
    const { mkdtemp, mkdir, rm } = await import("node:fs/promises");
    const os = await import("node:os");
    const path = await import("node:path");
    const root = await mkdtemp(path.join(os.tmpdir(), "prov-"));
    const paths = { root, provenanceDir: path.join(root, "provenance") };
    expect(findProvenanceDir(paths)).toBe(paths.provenanceDir);
    await mkdir(path.join(root, "docs", "provenance"), { recursive: true });
    expect(findProvenanceDir(paths)).toBe(path.join(root, "docs", "provenance"));
    await mkdir(paths.provenanceDir);
    expect(findProvenanceDir(paths)).toBe(paths.provenanceDir);
    await rm(root, { recursive: true, force: true });
  });
});
