/**
 * Launch check (content-contract §3.3): run once before the first public launch.
 * Cross-checks every rendered fact against the provenance ledger and requires human sign-offs.
 * Not run by CMS-triggered builds after handover.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "astro/zod";
import { normalizeMediaFile } from "../media/normalize.ts";
import { PeopleConsents, findProvenanceDir } from "../content/provenance.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { runGateForSite } from "./run.ts";
import { collectPublishedImages, type Finding } from "./rules.ts";
import { isEntryPublished, isFeatureEntryPublished, isPageEnabled } from "./visibility.ts";

export { findProvenanceDir };

// ---------------------------------------------------------------------------
// Ledger and approvals schemas (provenance/facts.json, provenance/approvals.json)
// ---------------------------------------------------------------------------

export const FactStatus = z.enum(["VERIFIED", "CLIENT_PROVIDED", "EXISTING_WEBSITE", "UNKNOWN"]);
export type FactStatus = z.infer<typeof FactStatus>;

export const LedgerFact = z.object({
  value: z.unknown(),
  status: FactStatus,
  source: z.string().nullable().default(null),
  retrievedAt: z.string().nullable().default(null),
  verifiedBy: z.string().nullable().default(null),
  verifiedAt: z.string().nullable().default(null),
  note: z.string().nullable().default(null),
});
export type LedgerFact = z.infer<typeof LedgerFact>;

export const Ledger = z.object({
  client: z.string(),
  createdAt: z.string(),
  facts: z.record(z.string(), LedgerFact),
});
export type Ledger = z.infer<typeof Ledger>;

const SignOff = z.object({
  approvedBy: z.string().nullable().default(null),
  approvedAt: z.string().nullable().default(null),
});

export const Approvals = z.object({
  facts: z.record(z.string(), SignOff).default({}),
  copy: z.record(z.string(), SignOff.extend({ status: z.enum(["DRAFT", "APPROVED"]) })).default({}),
  pricing: SignOff.extend({
    status: z.enum(["NOT_APPROVED", "APPROVED"]),
    method: z.string().nullable().default(null),
  }).default({ status: "NOT_APPROVED", approvedBy: null, approvedAt: null, method: null }),
  guidance: z
    .record(
      z.string(),
      z.object({
        reviewedBy: z.string().nullable().default(null),
        reviewedAt: z.string().nullable().default(null),
      }),
    )
    .default({}),
  images: z.record(z.string(), z.object({ rightsEvidence: z.string().nullable().default(null) })).default({}),
  // Staff consent to appear on the site, keyed "people/<id>.md" (G-074, research L12).
  people: PeopleConsents.default({}),
});
export type Approvals = z.infer<typeof Approvals>;

// ---------------------------------------------------------------------------
// Fact addressing: "<file>.<path>", array members by id (content-contract §3.2)
// ---------------------------------------------------------------------------

const FACT_FILES = ["company", "contact", "office-hours", "emergency", "legal", "people"] as const;
type FactFile = (typeof FACT_FILES)[number];

function factRoot(content: ValidatedContent, file: FactFile): unknown {
  if (file === "company") {
    return content.company;
  }
  if (file === "legal") {
    return content.legal ?? undefined;
  }
  if (file === "people") {
    // Addressed by entry id like any array member: people.<id>.phone
    return content.people.map((entry) => ({ id: entry.id, ...entry.data }));
  }
  if (file === "contact") {
    return content.contact;
  }
  if (file === "office-hours") {
    return content.officeHours;
  }
  return content.emergency;
}

/** Resolve a ledger key against content. `undefined` = path does not exist in content. */
export function getFactValue(content: ValidatedContent, key: string): unknown {
  const [file, ...segments] = key.split(".");
  if (!(FACT_FILES as readonly string[]).includes(file ?? "")) {
    return undefined;
  }
  let current: unknown = factRoot(content, file as FactFile);
  for (const segment of segments) {
    if (Array.isArray(current)) {
      current = current.find((item: unknown) => {
        return typeof item === "object" && item !== null && (item as { id?: unknown }).id === segment;
      });
    } else if (typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
    if (current === undefined) {
      return undefined;
    }
  }
  return current;
}

/** Facts the launch check requires provenance for, at the granularity listed in content-contract §10. */
export function collectTrackedFacts(content: ValidatedContent): { key: string; value: unknown }[] {
  const facts: { key: string; value: unknown }[] = [];
  const add = (key: string, value: unknown): void => {
    if (value !== null && value !== undefined) {
      facts.push({ key, value });
    }
  };
  const company = content.company;
  add("company.brandName", company.brandName);
  add("company.legalName", company.legalName);
  add("company.legalIds.ico", company.legalIds.ico);
  add("company.legalIds.dic", company.legalIds.dic);
  add("company.legalIds.registryEntry", company.legalIds.registryEntry);
  add("company.legalIds.registeredOffice", company.legalIds.registeredOffice);
  add("company.tradition.publicWording", company.tradition.publicWording);
  add("company.tradition.foundedYear", company.tradition.foundedYear);
  add("company.familyOwned", company.familyOwned);
  for (const location of content.contact.locations) {
    add(`contact.locations.${location.id}.address`, location.address);
    add(`contact.locations.${location.id}.geo`, location.geo);
  }
  for (const phone of content.contact.phones) {
    add(`contact.phones.${phone.id}.number`, phone.number);
  }
  for (const email of content.contact.emails) {
    add(`contact.emails.${email.id}.address`, email.address);
  }
  for (const group of content.officeHours.weekly) {
    add(`office-hours.weekly.${group.id}`, group);
  }
  add("office-hours.holidayNote", content.officeHours.holidayNote);
  if (content.emergency.enabled) {
    add("emergency.phone", content.emergency.phone);
    add("emergency.availability", content.emergency.availability);
    add("emergency.serviceArea", content.emergency.serviceArea);
  }
  if (content.legal !== null && isLegalPageShown(content)) {
    add("legal.adr.name", content.legal.adr.name);
    add("legal.adr.url", content.legal.adr.url);
    add("legal.complaintsContact", content.legal.complaintsContact);
  }
  for (const person of content.people) {
    if (!isFeatureEntryPublished("people", person, content)) {
      continue;
    }
    add(`people.${person.id}.name`, person.data.name);
    add(`people.${person.id}.role`, person.data.role);
    add(`people.${person.id}.phone`, person.data.phone);
  }
  return facts;
}

function isLegalPageShown(content: ValidatedContent): boolean {
  return content.pages.some((page) => page.id === "pravni-informace");
}

/** Stable comparison: object keys sorted, `id` keys ignored (ids are addressing, not facts). */
function canonical(value: unknown): string {
  return JSON.stringify(value, (key, inner: unknown) => {
    if (key === "id") {
      return undefined;
    }
    if (typeof inner === "object" && inner !== null && !Array.isArray(inner)) {
      const sorted: Record<string, unknown> = {};
      for (const name of Object.keys(inner).sort()) {
        sorted[name] = (inner as Record<string, unknown>)[name];
      }
      return sorted;
    }
    return inner;
  });
}

function findCoveringKey(ledger: Ledger, key: string): string | null {
  if (ledger.facts[key] !== undefined) {
    return key;
  }
  const parts = key.split(".");
  for (let length = parts.length - 1; length > 0; length -= 1) {
    const ancestor = parts.slice(0, length).join(".");
    if (ledger.facts[ancestor] !== undefined) {
      return ancestor;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Launch rules
// ---------------------------------------------------------------------------

export type LaunchRuleId = "L-001" | "L-002" | "L-003" | "L-004" | "L-005" | "L-006" | "L-007" | "L-008";

export const LAUNCH_RULES: Record<LaunchRuleId, string> = {
  "L-001": "Production gate passes",
  "L-002": "Every rendered fact has provenance in the ledger",
  "L-003": "Rendered facts are VERIFIED or approved CLIENT_PROVIDED",
  "L-004": "Content value equals the ledger value",
  "L-005": "Content has no value for a fact the ledger marks UNKNOWN",
  "L-006": "Copy approved",
  "L-007": "Pricing and guidance signed off",
  "L-008": "Image rights evidence recorded",
};

export interface LaunchFinding {
  rule: LaunchRuleId;
  subject: string;
  message: string;
}

export function checkLedger(
  content: ValidatedContent,
  ledger: Ledger,
  approvals: Approvals,
): LaunchFinding[] {
  const findings: LaunchFinding[] = [];

  for (const fact of collectTrackedFacts(content)) {
    const coveringKey = findCoveringKey(ledger, fact.key);
    if (coveringKey === null) {
      findings.push({
        rule: "L-002",
        subject: fact.key,
        message: "Fact shown on the site has no ledger entry.",
      });
      continue;
    }
    const entry = ledger.facts[coveringKey] as LedgerFact;
    if (entry.status === "EXISTING_WEBSITE") {
      findings.push({
        rule: "L-003",
        subject: coveringKey,
        message: "Copied from the old website; must be re-confirmed (VERIFIED) before launch.",
      });
    } else if (entry.status === "CLIENT_PROVIDED") {
      const signOff = approvals.facts[coveringKey];
      const approved = signOff !== undefined && signOff.approvedBy !== null && signOff.approvedAt !== null;
      if (!approved) {
        findings.push({
          rule: "L-003",
          subject: coveringKey,
          message: "Client-provided fact needs a recorded approval of its public wording.",
        });
      }
    } else if (entry.status === "VERIFIED") {
      if (entry.verifiedBy === null || entry.verifiedAt === null) {
        findings.push({
          rule: "L-003",
          subject: coveringKey,
          message: "VERIFIED without verifiedBy/verifiedAt.",
        });
      }
    }
    if (
      coveringKey === fact.key &&
      entry.status !== "UNKNOWN" &&
      canonical(entry.value) !== canonical(fact.value)
    ) {
      findings.push({
        rule: "L-004",
        subject: fact.key,
        message: `Content value ${canonical(fact.value)} differs from ledger value ${canonical(entry.value)}.`,
      });
    }
  }

  for (const [key, entry] of Object.entries(ledger.facts)) {
    if (entry.status !== "UNKNOWN") {
      continue;
    }
    const value = getFactValue(content, key);
    if (value !== null && value !== undefined) {
      findings.push({
        rule: "L-005",
        subject: key,
        message: "Ledger marks this fact UNKNOWN but content contains a value: possible invented data.",
      });
    }
  }

  const copyFiles = [
    ...content.pages.filter((page) => isPageEnabled(page.id, content)),
    ...[
      ...content.services,
      ...content.guidance,
      ...content.coffins,
      ...content.flowers,
      ...content.articles,
    ].filter((entry) => isEntryPublished(entry, content)),
    // FAQ answers and document entries are copy the client approves; notices are ordered per case
    // and carry their own consent record (G-070), so they are not part of the launch sign-off.
    ...content.faq.filter((entry) => isFeatureEntryPublished("faq", entry, content)),
    ...content.documents.filter((entry) => isFeatureEntryPublished("documents", entry, content)),
  ];
  for (const entry of copyFiles) {
    const key = entry.file.replace(/^src\/content\//, "");
    const record = approvals.copy[key];
    const approved = record !== undefined && record.status === "APPROVED" && record.approvedBy !== null;
    if (!approved) {
      findings.push({ rule: "L-006", subject: key, message: "Copy not approved by the client." });
    }
  }

  if (content.pricing.visible) {
    const pricing = approvals.pricing;
    const approved =
      pricing.status === "APPROVED" && pricing.approvedBy !== null && pricing.approvedAt !== null;
    if (!approved) {
      findings.push({
        rule: "L-007",
        subject: "pricing",
        message: "Price list has no recorded client sign-off.",
      });
    }
  }
  for (const entry of content.guidance) {
    if (!isEntryPublished(entry, content)) {
      continue;
    }
    const key = entry.file.replace(/^src\/content\//, "");
    const review = approvals.guidance[key];
    const reviewed = review !== undefined && review.reviewedBy !== null && review.reviewedAt !== null;
    if (!reviewed) {
      findings.push({
        rule: "L-007",
        subject: key,
        message: "Guidance has no recorded subject-matter review.",
      });
    }
  }

  const seenImages = new Set<string>();
  for (const use of collectPublishedImages(content)) {
    const key = `src/assets/media/${normalizeMediaFile(use.image.file)}`;
    if (seenImages.has(key)) {
      continue;
    }
    seenImages.add(key);
    const evidence = approvals.images[key];
    if (evidence === undefined || evidence.rightsEvidence === null) {
      findings.push({ rule: "L-008", subject: key, message: "No rights evidence recorded for this image." });
    }
  }

  return findings;
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

export interface LaunchResult {
  gateFindings: Finding[];
  findings: LaunchFinding[];
  passed: boolean;
}

export async function runLaunchCheck(root: string, options: { now?: Date } = {}): Promise<LaunchResult> {
  const gate = await runGateForSite(root, { mode: "production", now: options.now });
  const findings: LaunchFinding[] = [];
  const gateErrors = gate.findings.filter((finding) => finding.level === "error");
  if (gateErrors.length > 0) {
    findings.push({
      rule: "L-001",
      subject: "gate",
      message: `Production gate reports ${gateErrors.length} error(s).`,
    });
  }
  if (gate.content !== null) {
    const provenanceDir = findProvenanceDir(gate.content.paths);
    const ledgerFile = path.join(provenanceDir, "facts.json");
    const approvalsFile = path.join(provenanceDir, "approvals.json");
    if (!existsSync(ledgerFile) || !existsSync(approvalsFile)) {
      findings.push({
        rule: "L-002",
        subject: "provenance/",
        message: "provenance/facts.json and provenance/approvals.json are required for the launch check.",
      });
    } else {
      const ledger = Ledger.parse(await readJson(ledgerFile));
      const approvals = Approvals.parse(await readJson(approvalsFile));
      findings.push(...checkLedger(gate.content, ledger, approvals));
    }
  }
  return { gateFindings: gate.findings, findings, passed: findings.length === 0 };
}
