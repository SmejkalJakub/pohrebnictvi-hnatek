/**
 * Pure view-model builders shared by the Astro loaders (load.ts) and unit tests.
 * Templates receive these shapes; they never read content files directly.
 */
import type { SiteMode } from "../mode.ts";
import type { SiteConfig } from "./config.ts";
import {
  GUIDANCE_PHASES,
  SERVICE_CATEGORIES,
  type Company,
  type Contact,
  type EmergencyTransport,
  type Guidance,
  type ImageRef,
  type LegalInfo,
  type OfficeHours,
  type Page,
  type PageId,
  type PriceGroup,
  type Pricing,
  type Service,
} from "./schemas.ts";
import { formatOfficeHours, type HoursRow } from "../format/hours.ts";
import { isPageEnabled } from "../gate/visibility.ts";
import { buildLegalLink, type LegalLink } from "./optional-views.ts";

export type { TemplateManifest } from "./config.ts";
export * from "./optional-views.ts";

export interface NavItem {
  id: PageId;
  label: string;
  href: string;
}

export interface MissingFact {
  key: string;
  label: string;
}

export interface SiteContext {
  mode: SiteMode;
  config: SiteConfig;
  company: Company;
  contact: Contact;
  officeHours: OfficeHours;
  officeHoursRows: HoursRow[];
  emergency: EmergencyTransport;
  nav: NavItem[];
  pricingVisible: boolean;
  missing: MissingFact[];
  /** site/legal.json (ADR, complaints contact), or null. */
  legal: LegalInfo | null;
  /** Footer link to /pravni-informace/ when legal info and its page exist (research L10). */
  legalLink: LegalLink | null;
}

export interface PricingView extends Pricing {
  hasDemo: boolean;
}

/** Fixed navigation order (locked; labels come from pages/*.md navLabel). */
export const NAV_ORDER: readonly PageId[] = [
  "home",
  "jak-postupovat",
  // Only while features.notices is on (and the template supports it).
  "oznameni",
  "sluzby",
  "rakve",
  "kvetiny",
  "o-nas",
  "cenik",
  "clanky",
  "kontakt",
];

export function pageHref(id: PageId): string {
  if (id === "home") {
    return "/";
  }
  return `/${id}/`;
}

export function serviceHref(serviceId: string, detailPages: boolean): string {
  if (detailPages) {
    return `/sluzby/${serviceId}/`;
  }
  return `/sluzby/#${serviceId}`;
}

export function buildNav(
  pages: readonly { id: string; data: Page }[],
  context: { config: SiteConfig; pricing: Pricing },
): NavItem[] {
  const byId = new Map(pages.map((page) => [page.id, page.data]));
  const nav: NavItem[] = [];
  for (const id of NAV_ORDER) {
    const page = byId.get(id);
    if (page === undefined || !isPageEnabled(id, context)) {
      continue;
    }
    nav.push({ id, label: page.navLabel, href: pageHref(id) });
  }
  return nav;
}

export function buildMissingFacts(company: Company): MissingFact[] {
  const missing: MissingFact[] = [];
  if (company.legalIds.ico === null) {
    missing.push({ key: "company.legalIds.ico", label: "IČO" });
  }
  if (company.legalIds.registryEntry === null) {
    missing.push({ key: "company.legalIds.registryEntry", label: "zápis v obchodním rejstříku" });
  }
  if (company.legalIds.registeredOffice === null) {
    missing.push({ key: "company.legalIds.registeredOffice", label: "sídlo společnosti" });
  }
  return missing;
}

export function buildSiteContext(input: {
  mode: SiteMode;
  config: SiteConfig;
  company: Company;
  contact: Contact;
  officeHours: OfficeHours;
  emergency: EmergencyTransport;
  pricing: Pricing;
  pages: readonly { id: string; data: Page }[];
  legal?: LegalInfo | null;
}): SiteContext {
  const legal = input.legal ?? null;
  return {
    mode: input.mode,
    config: input.config,
    company: input.company,
    contact: input.contact,
    officeHours: input.officeHours,
    officeHoursRows: formatOfficeHours(input.officeHours),
    emergency: input.emergency,
    nav: buildNav(input.pages, input),
    pricingVisible: input.pricing.visible,
    missing: buildMissingFacts(input.company),
    legal,
    legalLink: buildLegalLink(legal, input.pages),
  };
}

function byOrderThenTitle(a: { order: number; title: string }, b: { order: number; title: string }): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.title.localeCompare(b.title, "cs");
}

export function sortServices<T extends { data: Service }>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => entry.data.published)
    .sort((a, b) => {
      const category =
        SERVICE_CATEGORIES.indexOf(a.data.category) - SERVICE_CATEGORIES.indexOf(b.data.category);
      if (category !== 0) {
        return category;
      }
      return byOrderThenTitle(a.data, b.data);
    });
}

export function sortGuidance<T extends { data: Guidance }>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => entry.data.published)
    .sort((a, b) => {
      const phase = GUIDANCE_PHASES.indexOf(a.data.phase) - GUIDANCE_PHASES.indexOf(b.data.phase);
      if (phase !== 0) {
        return phase;
      }
      return byOrderThenTitle(a.data, b.data);
    });
}

export function sortCatalogue<
  T extends { data: { published: boolean; order: number; name?: string; title?: string } },
>(entries: readonly T[]): T[] {
  const titleOf = (entry: T): string => entry.data.name ?? entry.data.title ?? "";
  return entries
    .filter((entry) => entry.data.published)
    .sort((a, b) =>
      byOrderThenTitle(
        { order: a.data.order, title: titleOf(a) },
        { order: b.data.order, title: titleOf(b) },
      ),
    );
}

export function buildPricingView(pricing: Pricing): PricingView | null {
  if (!pricing.visible) {
    return null;
  }
  const hasDemo = pricing.groups.some((group: PriceGroup) =>
    group.items.some((item) => item.status === "demo"),
  );
  return { ...pricing, hasDemo };
}

// ---------------------------------------------------------------------------
// Homepage imagery (2026-11-14). The owner found the homepages sterile, "like a restaurant menu":
// the real photos (the office, the firm's own flower arrangements and coffins) lived only on
// inner pages. Templates place these on the homepage, each in its own way. Only photos that show
// the real business: placeholders and generic or stock images are never pulled onto the homepage.
// ---------------------------------------------------------------------------

export interface HomePhoto {
  image: ImageRef;
  /** What the photo shows, for a caption or link text, e.g. "Kytice na rakev v bílých tónech". */
  title: string;
}

export interface HomeImagery {
  /** The firm's own place: /o-nas/ heroImage, else its secondaryImage. */
  place: HomePhoto | null;
  /** The first published flower arrangement with a real photo (catalogue order). */
  flower: HomePhoto | null;
  /** The first published coffin with a real photo (catalogue order). */
  coffin: HomePhoto | null;
}

/** True for a photo of the business itself (not a placeholder, stock or generic image). */
export function isRealBusinessPhoto(image: ImageRef | null): image is ImageRef {
  if (image === null) {
    return false;
  }
  return image.depicts === "actual-business";
}

interface CatalogueLike {
  data: { published: boolean; image: ImageRef | null; placeholder?: boolean; name?: string; title?: string };
}

function firstRealPhoto(entries: readonly CatalogueLike[]): HomePhoto | null {
  for (const entry of entries) {
    if (!entry.data.published || entry.data.placeholder === true) {
      continue;
    }
    if (isRealBusinessPhoto(entry.data.image)) {
      return { image: entry.data.image, title: entry.data.name ?? entry.data.title ?? "" };
    }
  }
  return null;
}

/** Pick the homepage photos from content already sorted in catalogue order. */
export function buildHomeImagery(input: {
  about: Pick<Page, "title" | "heroImage" | "secondaryImage"> | null;
  flowers: readonly CatalogueLike[];
  coffins: readonly CatalogueLike[];
}): HomeImagery {
  let place: HomePhoto | null = null;
  if (input.about !== null) {
    for (const image of [input.about.heroImage, input.about.secondaryImage]) {
      if (place === null && isRealBusinessPhoto(image)) {
        place = { image, title: input.about.title };
      }
    }
  }
  return { place, flower: firstRealPhoto(input.flowers), coffin: firstRealPhoto(input.coffins) };
}
