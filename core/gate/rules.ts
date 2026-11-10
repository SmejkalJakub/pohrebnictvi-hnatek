/**
 * Publication gate (content-contract §8). Each rule has an id and a level per build mode.
 * "marker" = allowed in prototype because the page shows a visible marker for it.
 */
import { formatPhone } from "../format/phone.ts";
import { checkMarkdownBody } from "../markdown/restrict-body.ts";
import { normalizeDocumentFile } from "../media/documents.ts";
import { normalizeMediaFile } from "../media/normalize.ts";
import type { SiteMode } from "../mode.ts";
import type { TemplateManifest } from "../content/config.ts";
import { PLACEHOLDER_SITE_URL } from "../content/config.ts";
import { resolveBuildDate } from "../content/build-date.ts";
import { hasRecordedConsent, personConsentKey } from "../content/provenance.ts";
import { REQUIRED_PAGE_IDS, type ImageRef, type PageId } from "../content/schemas.ts";
import type { ContentEntry, SchemaProblem, ValidatedContent } from "../content/snapshot.ts";
import {
  FEATURE_PAGES,
  isCollectionEnabled,
  isEntryPublished,
  isFeatureEntryPublished,
  isNoticeLive,
  isPageEnabled,
  noticeState,
  type Publishable,
} from "./visibility.ts";

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
  // Optional content types (research funeral-ux.md §4a, §8; content-contract §8).
  "G-070": { title: "Published notice has a consent record", prototype: "error", production: "error" },
  "G-071": { title: "Expired notice is not built", prototype: "warning", production: "warning" },
  "G-072": {
    title: "Notice body has no promotional or external links",
    prototype: "error",
    production: "error",
  },
  "G-073": { title: "No pinned build date in production", prototype: "off", production: "error" },
  "G-074": { title: "Published person has recorded consent", prototype: "warning", production: "error" },
  "G-075": { title: "Referenced document file exists", prototype: "error", production: "error" },
  "G-076": {
    title: "Legal information has its page",
    prototype: "warning",
    production: "warning",
  },
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
  /**
   * "Today" for notice publication windows (YYYY-MM-DD). Defaults to the config's pinnedBuildDate,
   * then to `now` in Europe/Prague; runGateForSite also honours SITE_BUILD_DATE.
   */
  buildDate?: string;
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
export function collectPublishedImages(content: ValidatedContent, buildDate?: string): ImageUse[] {
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
  uses.push(...collectFeatureImages(content, buildDate ?? buildDateOf(content)));
  return uses;
}

/** Notice and person images of the given entries (photo, printed parte). */
function featureImageUses(
  notices: readonly ContentEntry<{ photo: ImageRef | null; parteImage: ImageRef | null }>[],
  people: readonly ContentEntry<{ photo: ImageRef | null }>[],
): ImageUse[] {
  const uses: ImageUse[] = [];
  for (const notice of notices) {
    if (notice.data.photo !== null) {
      uses.push({ file: notice.file, path: "photo", image: notice.data.photo });
    }
    if (notice.data.parteImage !== null) {
      uses.push({ file: notice.file, path: "parteImage", image: notice.data.parteImage });
    }
  }
  for (const person of people) {
    if (person.data.photo !== null) {
      uses.push({ file: person.file, path: "photo", image: person.data.photo });
    }
  }
  return uses;
}

/** Images of live notices and published people (only while their features are on). */
function collectFeatureImages(content: ValidatedContent, buildDate: string): ImageUse[] {
  const notices = content.notices.filter((entry) => isNoticeLive(entry.data, content, buildDate));
  const people = content.people.filter((entry) => isFeatureEntryPublished("people", entry, content));
  return featureImageUses(notices, people);
}

/** The build date the gate uses when the caller did not pass one (pinned config date or today). */
function buildDateOf(
  content: ValidatedContent,
  options: Pick<GateOptions, "buildDate" | "now"> = {},
): string {
  if (options.buildDate !== undefined) {
    return options.buildDate;
  }
  return resolveBuildDate({ pinned: content.config.pinnedBuildDate, now: options.now }).date;
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

/** Entries of every collection, including the optional ones (for Markdown body checks). */
function everyEntry(content: ValidatedContent): ContentEntry<unknown>[] {
  return [
    ...allEntries(content),
    ...content.notices,
    ...content.people,
    ...content.faq,
    ...content.documents,
  ];
}

/** Entries of optional collections that will be built (feature on, published, notice live). */
function builtFeatureEntries(
  content: ValidatedContent,
  buildDate: string,
): ContentEntry<{ placeholder: boolean }>[] {
  return [
    ...content.notices.filter((entry) => isNoticeLive(entry.data, content, buildDate)),
    ...content.people.filter((entry) => isFeatureEntryPublished("people", entry, content)),
    ...content.faq.filter((entry) => isFeatureEntryPublished("faq", entry, content)),
    ...content.documents.filter((entry) => isFeatureEntryPublished("documents", entry, content)),
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
  for (const [pageId, feature] of Object.entries(FEATURE_PAGES) as [PageId, string][]) {
    if (isPageEnabled(pageId, content) && !present.has(pageId)) {
      out.push({
        rule: "G-002",
        file: `src/content/pages/${pageId}.md`,
        path: "",
        cs: `Stránka je povinná, když je zapnutá funkce ${feature}.`,
        en: `Page file is required while features.${feature} is on.`,
      });
    }
  }
  const privacyPresent = present.has("ochrana-osobnich-udaju");
  if (content.legal !== null && !present.has("pravni-informace")) {
    out.push({
      rule: "G-076",
      file: "src/content/site/legal.json",
      path: "",
      cs: "Právní informace jsou vyplněné, ale chybí stránka pravni-informace, takže se na webu nezobrazí.",
      en: "legal.json exists but pages/pravni-informace.md does not, so it is never shown.",
    });
  }

  const documentFiles = new Set(content.documentFiles);
  for (const use of collectDocumentUses(content)) {
    const name = normalizeDocumentFile(use.document);
    if (!documentFiles.has(name)) {
      out.push({
        rule: "G-075",
        file: use.file,
        path: use.path,
        cs: `Dokument "${name}" není ve složce src/assets/documents.`,
        en: `Document "${name}" not found in src/assets/documents.`,
      });
    }
  }

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

/**
 * Media file names referenced by any content (published or not): the only files the site imports.
 * Notice and people images count only while their features are on, so a template that does not
 * render them emits nothing extra.
 */
export function collectReferencedMediaFiles(content: ValidatedContent): string[] {
  const files = new Set<string>();
  for (const use of collectAllImages(content)) {
    const disabledNotice = !isCollectionEnabled("notices", content) && use.file.startsWith(NOTICES_DIR);
    const disabledPerson = !isCollectionEnabled("people", content) && use.file.startsWith(PEOPLE_DIR);
    if (disabledNotice || disabledPerson) {
      continue;
    }
    files.add(normalizeMediaFile(use.image.file));
  }
  return [...files].sort();
}

const NOTICES_DIR = "src/content/notices/";
const PEOPLE_DIR = "src/content/people/";

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
  uses.push(...featureImageUses(content.notices, content.people));
  return uses;
}

interface DocumentUse {
  file: string;
  path: string;
  document: string;
}

/** Every PDF referenced by content, published or not (a missing file is an error even for drafts). */
function collectDocumentUses(content: ValidatedContent): DocumentUse[] {
  const uses: DocumentUse[] = [];
  for (const entry of content.documents) {
    uses.push({ file: entry.file, path: "file", document: entry.data.file });
  }
  for (const notice of content.notices) {
    if (notice.data.partePdf !== null) {
      uses.push({ file: notice.file, path: "partePdf", document: notice.data.partePdf });
    }
  }
  return uses;
}

/**
 * PDFs the built site serves: published documents (feature on) at /dokumenty/<file> and the
 * printed parte of live notices at /oznameni/<slug>/<file>. The integration copies exactly these.
 */
export function collectPublishedDocuments(
  content: ValidatedContent,
  buildDate: string,
): { file: string; href: string }[] {
  const published: { file: string; href: string }[] = [];
  for (const entry of content.documents) {
    if (isFeatureEntryPublished("documents", entry, content)) {
      const file = normalizeDocumentFile(entry.data.file);
      published.push({ file, href: `/dokumenty/${file}` });
    }
  }
  for (const notice of content.notices) {
    if (notice.data.partePdf !== null && isNoticeLive(notice.data, content, buildDate)) {
      const file = normalizeDocumentFile(notice.data.partePdf);
      published.push({ file, href: `/oznameni/${notice.id}/${file}` });
    }
  }
  return published;
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
  const entries: ContentEntry<unknown>[] = [...content.pages, ...everyEntry(content)];
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

function checkPlaceholdersAndImages(content: ValidatedContent, buildDate: string, out: Candidate[]): void {
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
  const built = [
    ...allEntries(content).filter((entry) => isEntryPublished(entry, content)),
    ...builtFeatureEntries(content, buildDate),
  ];
  for (const entry of built) {
    if (entry.data.placeholder) {
      out.push({
        rule: "G-031",
        file: entry.file,
        path: "placeholder",
        cs: "Položka obsahuje zástupný text.",
        en: "Entry is placeholder content.",
      });
    }
  }
  for (const use of collectPublishedImages(content, buildDate)) {
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

/** Internal routes that promote the business; a death notice must not link to them (research L1). */
const PROMOTIONAL_ROUTES = ["/sluzby", "/cenik", "/rakve", "/kvetiny", "/pohreb-predem", "/clanky"];

/** Link targets in a Markdown body: [text](target), <https://…> and bare URLs. */
export function markdownLinkTargets(body: string): string[] {
  const targets: string[] = [];
  const patterns = [/\]\(\s*<?([^)\s>]+)/g, /<((?:https?:)?\/\/[^>\s]+)>/g, /(?:^|\s)(https?:\/\/[^\s)]+)/g];
  for (const pattern of patterns) {
    for (const match of body.matchAll(pattern)) {
      const target = match[1];
      if (target !== undefined) {
        targets.push(target);
      }
    }
  }
  return [...new Set(targets)];
}

function isPromotionalTarget(target: string): boolean {
  if (/^(https?:)?\/\//i.test(target)) {
    return true;
  }
  const route = target.toLowerCase();
  return PROMOTIONAL_ROUTES.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`) || route.startsWith(`${prefix}#`),
  );
}

function checkNotices(content: ValidatedContent, buildDate: string, out: Candidate[]): void {
  for (const notice of content.notices) {
    const state = noticeState(notice.data, content, buildDate);
    if (state === "off" || state === "draft") {
      continue;
    }
    if (state === "expired") {
      out.push({
        rule: "G-071",
        file: notice.file,
        path: "publishUntil",
        cs: `Zveřejnění skončilo ${notice.data.publishUntil}; oznámení se nesestaví. Soubor můžete smazat.`,
        en: `Notice expired on ${notice.data.publishUntil} (build date ${buildDate}); it is not built.`,
      });
      continue;
    }
    if (notice.data.consent === null) {
      out.push({
        rule: "G-070",
        file: notice.file,
        path: "consent",
        cs: "Chybí souhlas objednatele (kdo oznámení objednal, kdy a na jakém základě). Bez něj nelze oznámení zveřejnit.",
        en: "Published notice has no consent record (orderedBy, date, basis).",
      });
    }
    for (const target of markdownLinkTargets(notice.body)) {
      if (isPromotionalTarget(target)) {
        out.push({
          rule: "G-072",
          file: notice.file,
          path: "body",
          cs: `Oznámení nesmí odkazovat na služby, ceník ani jiné weby (${target}). Přenos obřadu patří do pole „Odkaz na přenos“.`,
          en: `Notice body links to a promotional route or another site: ${target}.`,
        });
      }
    }
  }
}

function checkPeople(content: ValidatedContent, out: Candidate[]): void {
  if (!isCollectionEnabled("people", content)) {
    return;
  }
  for (const person of content.people) {
    if (!isEntryPublished(person, content)) {
      continue;
    }
    if (!hasRecordedConsent(content.peopleConsents, person.id)) {
      out.push({
        rule: "G-074",
        file: person.file,
        path: "",
        cs: `Chybí záznam o souhlasu se zveřejněním (approvals.json → people["${personConsentKey(person.id)}"]).`,
        en: "Published person has no consent record in provenance/approvals.json.",
      });
    }
  }
}

function checkBuildDate(content: ValidatedContent, out: Candidate[]): void {
  if (content.config.pinnedBuildDate !== null) {
    out.push({
      rule: "G-073",
      file: "src/site.config.ts",
      path: "pinnedBuildDate",
      cs: "Datum sestavení je v konfiguraci pevně nastavené; v produkci jej odeberte, jinak oznámení nikdy neskončí.",
      en: "pinnedBuildDate is set; remove it for production builds.",
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
  const buildDate = buildDateOf(content, options);
  checkStructure(content, candidates);
  checkFacts(content, candidates);
  checkPricing(content, candidates);
  checkBodies(content, candidates);
  checkPlaceholdersAndImages(content, buildDate, candidates);
  checkGuidance(content, options.now ?? new Date(), candidates);
  checkArticles(content, options.manifest, candidates);
  checkNotices(content, buildDate, candidates);
  checkPeople(content, candidates);
  checkBuildDate(content, candidates);

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
