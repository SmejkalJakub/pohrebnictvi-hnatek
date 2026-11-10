/**
 * Consent records that the publication gate needs (G-074): staff shown on the site must have a
 * recorded consent in provenance/approvals.json → `people["people/<id>.md"]` (research L12).
 * The full approvals schema lives in core/gate/launch-check.ts; this module only reads the part
 * the gate uses, so a build does not depend on the rest of the launch-check records.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "astro/zod";

export const PersonConsent = z.object({
  /** Date the person gave consent (YYYY-MM-DD). */
  consentAt: z.string().nullable().default(null),
  /** Operator who recorded it, from the client's confirmation. */
  recordedBy: z.string().nullable().default(null),
  /** How it was given, e.g. "písemný souhlas", "e-mail". */
  method: z.string().nullable().default(null),
});
export type PersonConsent = z.infer<typeof PersonConsent>;

export const PeopleConsents = z.record(z.string(), PersonConsent);
export type PeopleConsents = z.infer<typeof PeopleConsents>;

/**
 * Pre-handover the ledger lives in <root>/provenance; an exported site archives it in
 * <root>/docs/provenance (template-contract §9).
 */
export function findProvenanceDir(paths: { root: string; provenanceDir: string }): string {
  if (existsSync(paths.provenanceDir)) {
    return paths.provenanceDir;
  }
  const archived = path.join(paths.root, "docs", "provenance");
  if (existsSync(archived)) {
    return archived;
  }
  return paths.provenanceDir;
}

/** Key of a person's consent record: the entry path relative to src/content. */
export function personConsentKey(personId: string): string {
  return `people/${personId}.md`;
}

export function hasRecordedConsent(consents: PeopleConsents, personId: string): boolean {
  const record = consents[personConsentKey(personId)];
  if (record === undefined) {
    return false;
  }
  return record.consentAt !== null && record.recordedBy !== null;
}

/** `people` from approvals.json; {} when the file or the section is missing or unreadable. */
export function readPeopleConsents(paths: { root: string; provenanceDir: string }): PeopleConsents {
  const file = path.join(findProvenanceDir(paths), "approvals.json");
  if (!existsSync(file)) {
    return {};
  }
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { people?: unknown };
    const parsed = PeopleConsents.safeParse(raw.people ?? {});
    if (!parsed.success) {
      return {};
    }
    return parsed.data;
  } catch {
    return {};
  }
}
