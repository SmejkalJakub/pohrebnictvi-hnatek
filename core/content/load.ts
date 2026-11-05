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

export async function getPage(id: PageId) {
  const pages = await getCollection("pages");
  const entry = pages.find((page) => page.id === id);
  if (entry === undefined) {
    throw new Error(`Page "${id}" is missing (gate G-002).`);
  }
  const { Content } = await render(entry);
  return { id, data: entry.data, Content };
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
