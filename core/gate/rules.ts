/**
 * Publication gate (content-contract §8). Each rule has an id and a level per build mode.
 * "marker" = allowed in prototype because the page shows a visible marker for it.
 */
import { formatPhone } from "../format/phone.ts";
import { checkMarkdownBody } from "../markdown/restrict-body.ts";
import { normalizeMediaFile } from "../media/normalize.ts";
import type { SiteMode } from "../mode.ts";
import type { TemplateManifest } from "../content/config.ts";
import { PLACEHOLDER_SITE_URL } from "../content/config.ts";
import { REQUIRED_PAGE_IDS, type ImageRef } from "../content/schemas.ts";
import type { ContentEntry, SchemaProblem, ValidatedContent } from "../content/snapshot.ts";
import { isPageEnabled, isEntryPublished, type Publishable } from "./visibility.ts";

export type Level = "error" | "warning" | "marker" | "off";

export const RULES = {
  "G-001": { title: "Schema-valid content", prototype: "error", production: "error" },
  "G-002": { title: "Required page file present", prototype: "error", production: "error" },
  "G-003": { title: "Referenced image file exists", prototype: "error", production: "error" },
  "G-004": { title: "References between content resolve", prototype: "error", production: "error" },
  "G-005": { title: "Site config matches the template manifest", prototype: "error", production: "error" },
  "G-010": { title: "Required fact present", prototype: "marker", production: "error" },
  "G-011": { title: "Company legal identifiers present", prototype: "marker", production: "error" },
  "G-012": { title: "siteUrl is a real domain", prototype: "off", production: "error" },
  "G-020": { title: "No demo prices in visible pricing", prototype: "marker", production: "error" },
  "G-021": { title: "Visible pricing has validFrom and vatNote", prototype: "warning", production: "error" },
  "G-030": { title: "No phone numbers in Markdown bodies", prototype: "error", production: "error" },
  "G-031": { title: "No published placeholder content", prototype: "marker", production: "error" },
  "G-032": { title: "No placeholder images", prototype: "marker", production: "error" },
  "G-033": { title: "Image rights confirmed", prototype: "warning", production: "error" },
  "G-034": { title: "Markdown bodies follow the restricted format", prototype: "error", production: "error" },
  // Heading issues come from the CMS editor (it offers H1); core demotes H1 at render, so only warn.
  "G-035": { title: "Markdown body heading levels", prototype: "warning", production: "warning" },
  "G-040": { title: "Published guidance has a review date", prototype: "marker", production: "error" },
  "G-041": { title: "Guidance review not older than 12 months", prototype: "off", production: "warning" },
  "G-042": {
    title: "Emergency phone differs from office phones",
    prototype: "warning",
    production: "warning",
  },
  "G-050": {
    title: "No articles content while the feature is off",
    prototype: "warning",
    production: "warning",
  },
  "G-051": { title: "Articles only with a supporting template", prototype: "error", production: "error" },
  "G-060": { title: "Contact form needs endpoint and privacy page", prototype: "error", production: "error" },
  "G-061": { title: "Map embed needs privacy page", prototype: "error", production: "error" },
} as const satisfies Record<string, { title: string; prototype: Level; production: Level }>;

export type RuleId = keyof typeof RULES;

export interface Finding {
  rule: RuleId;
  level: Exclude<Level, "off">;
  file: string;
  path: string;
  cs: string;
  en: string;
}

type Candidate = Omit<Finding, "level">;

export interface GateOptions {
  mode: SiteMode;
  /** Injected clock for G-041 (tests). */
  now?: Date;
  /** When present, G-051 uses its `supports.articles`; without a manifest articles are unsupported. */
  manifest?: TemplateManifest;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ImageUse {
  file: string;
  path: string;
  image: ImageRef;
}

function collectEntryImages<T extends Publishable & { image: ImageRef | null }>(
  entries: ContentEntry<T>[],
  content: ValidatedContent,
): ImageUse[] {
  const uses: ImageUse[] = [];
  for (const entry of entries) {
    if (!isEntryPublished(entry, content)) {
      continue;
    }
    if (entry.data.image !== null) {
      uses.push({ file: entry.file, path: "image", image: entry.data.image });
    }
  }
  return uses;
}

/** Every image that can appear on the published site. */
export function collectPublishedImages(content: ValidatedContent): ImageUse[] {
  const uses: ImageUse[] = [];
  if (content.company.logo !== null) {
    uses.push({ file: content.files.company, path: "logo", image: content.company.logo });
  }
  for (const page of content.pages) {
    if (!isPageEnabled(page.id, content)) {
      continue;
    }
    if (page.data.heroImage !== null) {
      uses.push({ file: page.file, path: "heroImage", image: page.data.heroImage });
    }
    if (page.data.secondaryImage !== null) {
      uses.push({ file: page.file, path: "secondaryImage", image: page.data.secondaryImage });
    }
  }
  uses.push(...collectEntryImages(content.services, content));
  uses.push(...collectEntryImages(content.coffins, content));
  uses.push(...collectEntryImages(content.flowers, content));
  uses.push(...collectEntryImages(content.articles, content));
  return uses;
}

function allEntries(content: ValidatedContent): ContentEntry<Publishable & { placeholder: boolean }>[] {
  return [
    ...content.services,
    ...content.guidance,
    ...content.coffins,
    ...content.flowers,
    ...content.articles,
  ];
}

function isPlaceholderDomain(siteUrl: string): boolean {
  if (siteUrl === PLACEHOLDER_SITE_URL) {
    return true;
  }
  const host = new URL(siteUrl).hostname;
  return (
    host === "localhost" || host.endsWith(".invalid") || host.endsWith(".example") || host.endsWith(".test")
  );
}

// ---------------------------------------------------------------------------
// Rule checks
// ---------------------------------------------------------------------------

function checkStructure(content: ValidatedContent, out: Candidate[]): void {
  const present = new Set(content.pages.map((page) => page.id));
  for (const id of REQUIRED_PAGE_IDS) {
    if (!present.has(id)) {
      out.push({
        rule: "G-002",
        file: `src/content/pages/${id}.md`,
        path: "",
        cs: "Povinná stránka chybí.",
        en: "Required page file is missing.",
      });
    }
  }
  const privacyPresent = present.has("ochrana-osobnich-udaju");

  const mediaFiles = new Set(content.mediaFiles);
  for (const use of collectAllImages(content)) {
    const name = normalizeMediaFile(use.image.file);
    if (!mediaFiles.has(name)) {
      out.push({
        rule: "G-003",
        file: use.file,
        path: use.path,
        cs: `Obrázek "${name}" není ve složce src/assets/media.`,
        en: `Image "${name}" not found in src/assets/media.`,
      });
    }
  }

  const locationIds = new Set(content.contact.locations.map((location) => location.id));
  content.contact.phones.forEach((phone, index) => {
    if (phone.locationId !== null && !locationIds.has(phone.locationId)) {
      out.push({
        rule: "G-004",
        file: content.files.contact,
        path: `phones.${index}.locationId`,
        cs: `Místo "${phone.locationId}" neexistuje.`,
        en: `Location "${phone.locationId}" does not exist.`,
      });
    }
  });
  if (!locationIds.has(content.officeHours.locationId)) {
    out.push({
      rule: "G-004",
      file: content.files["office-hours"],
      path: "locationId",
      cs: `Místo "${content.officeHours.locationId}" neexistuje.`,
      en: `Location "${content.officeHours.locationId}" does not exist.`,
    });
  }
  const priceGroupIds = new Set(content.pricing.groups.map((group) => group.id));
  for (const service of content.services) {
    const groupId = service.data.priceGroupId;
    if (groupId !== null && !priceGroupIds.has(groupId)) {
      out.push({
        rule: "G-004",
        file: service.file,
        path: "priceGroupId",
        cs: `Skupina ceníku "${groupId}" neexistuje.`,
        en: `Price group "${groupId}" does not exist.`,
      });
    }
  }

  const features = content.config.features;
  if (features.contactForm) {
    const ready = content.config.contactFormEndpoint !== null && privacyPresent;
    if (!ready) {
      out.push({
        rule: "G-060",
        file: "src/site.config.ts",
        path: "features.contactForm",
        cs: "Kontaktní formulář vyžaduje adresu pro odeslání a stránku ochrany osobních údajů.",
        en: "Contact form requires contactFormEndpoint and the privacy page.",
      });
    }
  }
  if (features.map === "embed-on-click" && !privacyPresent) {
    out.push({
      rule: "G-061",
      file: "src/site.config.ts",
      path: "features.map",
      cs: "Vložená mapa vyžaduje stránku ochrany osobních údajů.",
      en: "Embedded map requires the privacy page.",
    });
  }
}

/** Images on every entry, published or not: a missing file is an error even for drafts. */
function bodyRule(kind: string): RuleId {
  if (kind === "phone") {
    return "G-030";
  }
  if (kind === "h1" || kind === "heading-skip") {
    return "G-035";
  }
  return "G-034";
}

/** Media file names referenced by any content (published or not): the only files the site imports. */
export function collectReferencedMediaFiles(content: ValidatedContent): string[] {
  const files = new Set<string>();
  for (const use of collectAllImages(content)) {
    files.add(normalizeMediaFile(use.image.file));
  }
  return [...files].sort();
}

function collectAllImages(content: ValidatedContent): ImageUse[] {
  const uses: ImageUse[] = [];
  if (content.company.logo !== null) {
    uses.push({ file: content.files.company, path: "logo", image: content.company.logo });
  }
  for (const page of content.pages) {
    if (page.data.heroImage !== null) {
      uses.push({ file: page.file, path: "heroImage", image: page.data.heroImage });
    }
    if (page.data.secondaryImage !== null) {
      uses.push({ file: page.file, path: "secondaryImage", image: page.data.secondaryImage });
    }
  }
  const withImages = [...content.services, ...content.coffins, ...content.flowers, ...content.articles];
  for (const entry of withImages) {
    if (entry.data.image !== null) {
      uses.push({ file: entry.file, path: "image", image: entry.data.image });
    }
  }
  return uses;
}

function checkFacts(content: ValidatedContent, out: Candidate[]): void {
  if (content.officeHours.weekly.length === 0) {
    out.push({
      rule: "G-010",
      file: content.files["office-hours"],
      path: "weekly",
      cs: "Chybí úřední hodiny kanceláře.",
      en: "Office hours are missing.",
    });
  }
  content.contact.locations.forEach((location, index) => {
    if (location.mapUrl === null && location.geo === null) {
      out.push({
        rule: "G-010",
        file: content.files.contact,
        path: `locations.${index}.mapUrl`,
        cs: `Místo "${location.name}" nemá odkaz na mapu.`,
        en: `Location "${location.name}" has no map link or coordinates.`,
      });
    }
  });

  const legal = content.company.legalIds;
  const legalFields: [keyof typeof legal, string][] = [
    ["ico", "IČO"],
    ["registryEntry", "zápis v obchodním rejstříku"],
    ["registeredOffice", "sídlo"],
  ];
  for (const [field, label] of legalFields) {
    if (legal[field] === null) {
      out.push({
        rule: "G-011",
        file: content.files.company,
        path: `legalIds.${field}`,
        cs: `Chybí ${label} (povinný údaj na webu firmy).`,
        en: `Missing ${field} (legally required on the company website).`,
      });
    }
  }

  if (isPlaceholderDomain(content.config.siteUrl)) {
    out.push({
      rule: "G-012",
      file: "src/site.config.ts",
      path: "siteUrl",
      cs: "Adresa webu je zástupná; nastavte skutečnou doménu.",
      en: "siteUrl is a placeholder domain.",
    });
  }

  const emergencyPhone = content.emergency.phone;
  for (const phone of content.contact.phones) {
    if (content.emergency.enabled && phone.department === "office" && phone.number === emergencyPhone) {
      out.push({
        rule: "G-042",
        file: content.files.emergency,
        path: "phone",
        cs: `Nonstop číslo je stejné jako telefon kanceláře (${formatPhone(emergencyPhone).spoken}).`,
        en: "Emergency phone equals an office phone; confirm this is intended.",
      });
    }
  }
}

function checkPricing(content: ValidatedContent, out: Candidate[]): void {
  const pricing = content.pricing;
  if (!pricing.visible) {
    return;
  }
  const demoIds = pricing.groups.flatMap((group) =>
    group.items.filter((item) => item.status === "demo").map((item) => item.id),
  );
  if (demoIds.length > 0) {
    out.push({
      rule: "G-020",
      file: content.files.pricing,
      path: "groups.*.items.*.status",
      cs: `Ceník obsahuje ${demoIds.length} ukázkových cen (${demoIds.slice(0, 3).join(", ")}…).`,
      en: `Visible pricing contains ${demoIds.length} demo price(s).`,
    });
  }
  if (pricing.validFrom === null || pricing.vatNote === null) {
    out.push({
      rule: "G-021",
      file: content.files.pricing,
      path: "validFrom/vatNote",
      cs: "U zveřejněného ceníku vyplňte platnost od a poznámku k DPH.",
      en: "Visible pricing needs validFrom and vatNote.",
    });
  }
}

function checkBodies(content: ValidatedContent, out: Candidate[]): void {
  const entries: ContentEntry<unknown>[] = [...content.pages, ...allEntries(content)];
  for (const entry of entries) {
    for (const issue of checkMarkdownBody(entry.body)) {
      const rule = bodyRule(issue.kind);
      out.push({
        rule,
        file: entry.file,
        path: `body:${issue.line}`,
        cs: issue.message,
        en: `Restricted Markdown violation (${issue.kind}) on body line ${issue.line}.`,
      });
    }
  }
}

function checkPlaceholdersAndImages(content: ValidatedContent, out: Candidate[]): void {
  for (const page of content.pages) {
    if (isPageEnabled(page.id, content) && page.data.placeholder) {
      out.push({
        rule: "G-031",
        file: page.file,
        path: "placeholder",
        cs: "Stránka obsahuje zástupný text.",
        en: "Page is placeholder content.",
      });
    }
  }
  for (const entry of allEntries(content)) {
    if (isEntryPublished(entry, content) && entry.data.placeholder) {
      out.push({
        rule: "G-031",
        file: entry.file,
        path: "placeholder",
        cs: "Položka obsahuje zástupný text.",
        en: "Entry is placeholder content.",
      });
    }
  }
  for (const use of collectPublishedImages(content)) {
    if (use.image.source === "placeholder") {
      out.push({
        rule: "G-032",
        file: use.file,
        path: use.path,
        cs: "Zástupný obrázek je třeba nahradit skutečnou fotografií nebo odebrat.",
        en: "Placeholder image must be replaced or removed.",
      });
      continue;
    }
    if (!use.image.rightsConfirmed) {
      out.push({
        rule: "G-033",
        file: use.file,
        path: `${use.path}.rightsConfirmed`,
        cs: "Není potvrzeno právo obrázek použít.",
        en: "Image rights are not confirmed.",
      });
    }
  }
}

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

function checkGuidance(content: ValidatedContent, now: Date, out: Candidate[]): void {
  for (const entry of content.guidance) {
    if (!isEntryPublished(entry, content)) {
      continue;
    }
    const reviewedAt = entry.data.review.reviewedAt;
    if (reviewedAt === null) {
      out.push({
        rule: "G-040",
        file: entry.file,
        path: "review.reviewedAt",
        cs: "Odborný text nebyl zkontrolován (chybí datum kontroly).",
        en: "Guidance has no review date.",
      });
      continue;
    }
    if (now.getTime() - new Date(`${reviewedAt}T00:00:00Z`).getTime() > TWELVE_MONTHS_MS) {
      out.push({
        rule: "G-041",
        file: entry.file,
        path: "review.reviewedAt",
        cs: "Odborný text byl naposledy zkontrolován před více než 12 měsíci.",
        en: "Guidance review is older than 12 months.",
      });
    }
  }
}

function checkArticles(
  content: ValidatedContent,
  manifest: TemplateManifest | undefined,
  out: Candidate[],
): void {
  const enabled = content.config.features.articles;
  if (!enabled && content.articlesDirExists) {
    out.push({
      rule: "G-050",
      file: "src/content/articles",
      path: "",
      cs: "Složka s články existuje, ale články jsou vypnuté.",
      en: "articles/ exists while the articles feature is off.",
    });
  }
  const supported = manifest !== undefined && manifest.supports.articles;
  if (enabled && !supported) {
    out.push({
      rule: "G-051",
      file: "src/site.config.ts",
      path: "features.articles",
      cs: "Zvolená šablona články nepodporuje.",
      en: "Articles are enabled but the template does not support them.",
    });
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export function schemaFindings(problems: SchemaProblem[], mode: SiteMode): Finding[] {
  const level = RULES["G-001"][mode];
  return problems.map((problem) => ({
    rule: "G-001",
    level: level as Finding["level"],
    file: problem.file,
    path: problem.path,
    cs: problem.message,
    en: "Schema validation failed.",
  }));
}

export function runGate(content: ValidatedContent, options: GateOptions): Finding[] {
  const candidates: Candidate[] = [];
  checkStructure(content, candidates);
  checkFacts(content, candidates);
  checkPricing(content, candidates);
  checkBodies(content, candidates);
  checkPlaceholdersAndImages(content, candidates);
  checkGuidance(content, options.now ?? new Date(), candidates);
  checkArticles(content, options.manifest, candidates);

  const findings: Finding[] = [];
  for (const candidate of candidates) {
    const level: Level = RULES[candidate.rule][options.mode];
    if (level === "off") {
      continue;
    }
    findings.push({ ...candidate, level });
  }
  return findings;
}

export function hasErrors(findings: readonly Finding[]): boolean {
  return findings.some((finding) => finding.level === "error");
}
