import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadValidatedContent, type ValidatedContent } from "../content/snapshot.ts";

export const FIXTURE_ROOT = path.resolve(fileURLToPath(new URL("../../fixtures/neutral", import.meta.url)));

export async function loadFixture(): Promise<ValidatedContent> {
  const { content, problems } = await loadValidatedContent(FIXTURE_ROOT);
  if (content === null) {
    throw new Error(`Fixture invalid: ${JSON.stringify(problems, null, 2)}`);
  }
  return content;
}

export function clone(content: ValidatedContent): ValidatedContent {
  return structuredClone(content);
}

/** Turn the fixture into content that should pass the production gate with zero errors. */
export function makeProductionReady(source: ValidatedContent): ValidatedContent {
  const content = clone(source);
  content.config.siteUrl = "https://www.pohrebni-sluzba-vzor.cz";
  content.company.legalIds.ico = "12345678";
  content.company.legalIds.registryEntry = "C 00000 vedená u Krajského soudu v Brně";
  content.company.legalIds.registeredOffice = content.contact.locations[0]?.address ?? null;
  content.pricing.validFrom = "2026-11-01";
  content.pricing.vatNote = "Ceny jsou uvedeny včetně DPH.";
  for (const group of content.pricing.groups) {
    for (const item of group.items) {
      item.status = "approved";
    }
  }
  for (const page of content.pages) {
    page.data.placeholder = false;
    page.data.heroImage = null;
    page.data.secondaryImage = null;
  }
  const entries = [...content.services, ...content.guidance, ...content.coffins, ...content.flowers];
  for (const entry of entries) {
    entry.data.placeholder = false;
  }
  for (const entry of [...content.services, ...content.coffins, ...content.flowers]) {
    entry.data.image = null;
  }
  for (const entry of content.guidance) {
    entry.data.review.reviewedAt = "2026-10-01";
    entry.data.review.reviewedBy = "Odborný recenzent";
  }
  // Optional content types: no pinned date (G-073), expired notices deleted (G-071), no
  // placeholders or placeholder images, and a recorded consent for every person (G-074).
  content.config.pinnedBuildDate = null;
  content.notices = content.notices.filter((entry) => entry.data.publishUntil >= PRODUCTION_BUILD_DATE);
  for (const entry of [...content.notices, ...content.people, ...content.faq, ...content.documents]) {
    entry.data.placeholder = false;
  }
  for (const entry of content.notices) {
    entry.data.photo = null;
    entry.data.parteImage = null;
  }
  for (const entry of content.people) {
    entry.data.photo = null;
    content.peopleConsents[`people/${entry.id}.md`] = {
      consentAt: "2026-10-01",
      recordedBy: "Operátor (test)",
      method: "písemný souhlas",
    };
  }
  return content;
}

/** The date production-ready test content is checked on (the fixture pins 2026-11-10 for prototype). */
export const PRODUCTION_BUILD_DATE = "2026-11-05";
