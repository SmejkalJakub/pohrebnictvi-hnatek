/**
 * Astro-runtime loaders: the ONLY way templates obtain content (template-contract §5).
 * Singletons and config come from the integration's virtual module; collections from astro:content.
 */
import { getCollection, render, type CollectionEntry } from "astro:content";
import * as data from "virtual:site-core/data";
import { SiteConfig } from "./config.ts";
import { Company, Contact, EmergencyTransport, OfficeHours, Pricing, type PageId } from "./schemas.ts";
import {
  buildPricingView,
  buildSiteContext,
  sortCatalogue,
  sortGuidance,
  sortServices,
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
  });
  return cachedContext;
}

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

export async function getPricing(): Promise<PricingView | null> {
  return buildPricingView(parseOrThrow("pricing.json", Pricing, data.pricing));
}

export { render };
