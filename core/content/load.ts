/**
 * Astro-runtime loaders: the ONLY way templates obtain content (template-contract §5).
 * Singletons and config come from the integration's virtual module; collections from astro:content.
 */
import { getCollection, render, type CollectionEntry } from "astro:content";
import * as data from "virtual:site-core/data";
import { SiteConfig } from "./config.ts";
import {
  Company,
  Contact,
  EmergencyTransport,
  LegalInfo,
  OfficeHours,
  Pricing,
  type PageId,
} from "./schemas.ts";
import { isCollectionEnabled, isNoticeLive } from "../gate/visibility.ts";
import {
  buildDocumentView,
  buildNoticeIndex,
  buildNoticeView,
  buildPersonView,
  buildPricingView,
  buildSiteContext,
  groupFaq,
  sortCatalogue,
  sortDocuments,
  sortGuidance,
  sortPeople,
  sortServices,
  type DocumentView,
  type FaqGroup,
  type NoticeIndex,
  type NoticeView,
  type PersonView,
  type PricingView,
  type SiteContext,
} from "./view-models.ts";

export * from "./view-models.ts";

function parseOrThrow<T>(
  name: string,
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: unknown } },
  value: unknown,
): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`${name} failed validation; run npm run validate for details.`);
  }
  return result.data;
}

let cachedContext: SiteContext | null = null;

export async function getSiteContext(): Promise<SiteContext> {
  if (cachedContext !== null && data.mode === "production") {
    return cachedContext;
  }
  const pages = await getCollection("pages");
  cachedContext = buildSiteContext({
    mode: data.mode,
    config: parseOrThrow("site.config.ts", SiteConfig, data.config),
    company: parseOrThrow("company.json", Company, data.company),
    contact: parseOrThrow("contact.json", Contact, data.contact),
    officeHours: parseOrThrow("office-hours.json", OfficeHours, data.officeHours),
    emergency: parseOrThrow("emergency.json", EmergencyTransport, data.emergency),
    pricing: parseOrThrow("pricing.json", Pricing, data.pricing),
    pages,
    legal: loadLegal(),
  });
  return cachedContext;
}

function loadLegal(): LegalInfo | null {
  if (data.legal === null) {
    return null;
  }
  return parseOrThrow("legal.json", LegalInfo, data.legal);
}

/** "Today" of this build (YYYY-MM-DD): SITE_BUILD_DATE, pinnedBuildDate or the Prague date. */
export const buildDate: string = data.buildDate;

async function findPage(id: PageId) {
  const pages = await getCollection("pages");
  return pages.find((page) => page.id === id);
}

async function loadPage(entry: CollectionEntry<"pages">, id: PageId) {
  const { Content } = await render(entry);
  const body = entry.body ?? "";
  return { id, data: entry.data, Content, hasBody: body.trim() !== "" };
}

export type LoadedPage = Awaited<ReturnType<typeof loadPage>>;

/** A required page (gate G-002 guarantees it exists). `hasBody` is false for an empty Markdown body. */
export async function getPage(id: PageId): Promise<LoadedPage> {
  const entry = await findPage(id);
  if (entry === undefined) {
    throw new Error(`Page "${id}" is missing (gate G-002).`);
  }
  return loadPage(entry, id);
}

/** An optional page such as `ochrana-osobnich-udaju`: null when its file does not exist. */
export async function getOptionalPage(id: PageId): Promise<LoadedPage | null> {
  const entry = await findPage(id);
  if (entry === undefined) {
    return null;
  }
  return loadPage(entry, id);
}

export async function hasPage(id: PageId): Promise<boolean> {
  return (await findPage(id)) !== undefined;
}

export async function getServices(): Promise<CollectionEntry<"services">[]> {
  return sortServices(await getCollection("services"));
}

export async function getGuidance(): Promise<CollectionEntry<"guidance">[]> {
  return sortGuidance(await getCollection("guidance"));
}

export async function getCoffins(): Promise<CollectionEntry<"coffins">[]> {
  return sortCatalogue(await getCollection("coffins"));
}

export async function getFlowers(): Promise<CollectionEntry<"flowers">[]> {
  return sortCatalogue(await getCollection("flowers"));
}

// ---------------------------------------------------------------------------
// Optional content types (content-contract §6.13–§6.17). Each returns nothing while its feature
// is off, so a template can call them unconditionally.
// ---------------------------------------------------------------------------

export interface LoadedNotice {
  view: NoticeView;
  /** Rendered Markdown body (the notice text); check `hasBody` first. */
  Content: Awaited<ReturnType<typeof render>>["Content"];
  hasBody: boolean;
}

/** Live notices (published, inside publishFrom–publishUntil on the build date), with their bodies. */
export async function getNotices(): Promise<LoadedNotice[]> {
  const site = await getSiteContext();
  const visibility = { config: site.config, pricing: parseOrThrow("pricing.json", Pricing, data.pricing) };
  if (!site.config.features.notices) {
    return [];
  }
  const entries = (await getCollection("notices")).filter((entry) =>
    isNoticeLive(entry.data, visibility, data.buildDate),
  );
  const officeEmail = site.contact.emails[0]?.address ?? null;
  const loaded: LoadedNotice[] = [];
  for (const entry of entries) {
    const { Content } = await render(entry);
    const view = buildNoticeView(entry, {
      siteUrl: site.config.siteUrl,
      buildDate: data.buildDate,
      officeEmail,
    });
    loaded.push({ view, Content, hasBody: (entry.body ?? "").trim() !== "" });
  }
  return loaded.sort((a, b) => a.view.id.localeCompare(b.view.id));
}

/** The /oznameni/ list: upcoming ceremonies first, then recent notices; unlisted notices omitted. */
export async function getNoticeIndex(): Promise<NoticeIndex> {
  const notices = await getNotices();
  return buildNoticeIndex(notices.map((notice) => notice.view));
}

/** Published people, by order then name (empty while features.people is off). */
export async function getPeople(): Promise<PersonView[]> {
  const site = await getSiteContext();
  if (!isCollectionEnabled("people", site)) {
    return [];
  }
  return sortPeople(await getCollection("people")).map(buildPersonView);
}

/** Published questions grouped by topic; render each entry's answer with `render(entry)`. */
export async function getFaq(): Promise<FaqGroup<CollectionEntry<"faq">>[]> {
  const site = await getSiteContext();
  if (!isCollectionEnabled("faq", site)) {
    return [];
  }
  return groupFaq(await getCollection("faq"));
}

/** Published documents (PDF links under /dokumenty/), empty while features.documents is off. */
export async function getDocuments(): Promise<DocumentView[]> {
  const site = await getSiteContext();
  if (!isCollectionEnabled("documents", site)) {
    return [];
  }
  return sortDocuments(await getCollection("documents")).map(buildDocumentView);
}

export async function getPricing(): Promise<PricingView | null> {
  return buildPricingView(parseOrThrow("pricing.json", Pricing, data.pricing));
}

export { render };
