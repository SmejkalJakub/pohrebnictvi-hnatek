/** Template-local derivations over core view models. No content is read here directly. */
import type { ContactPhone, Location, PageId, PriceGroup, PriceItem } from "@core/content/schemas.ts";
import type { NavItem, PricingView, SiteContext } from "@core/content/view-models.ts";
import { pathOf } from "./paths.ts";
import { ui } from "../i18n/cs.ts";

export function officePhones(site: SiteContext): ContactPhone[] {
  return site.contact.phones.filter((phone) => phone.department === "office");
}

/** The schema guarantees at least one office phone. */
export function primaryOfficePhone(site: SiteContext): ContactPhone {
  const first = officePhones(site)[0];
  if (first === undefined) {
    throw new Error("contact.json has no office phone (schema should have rejected it).");
  }
  return first;
}

export function flowerPhones(site: SiteContext): ContactPhone[] {
  return site.contact.phones.filter((phone) => phone.department === "flowers");
}

/** This template supports one location (supports.multipleLocations: false). */
export function mainLocation(site: SiteContext): Location {
  const byHours = site.contact.locations.find((location) => location.id === site.officeHours.locationId);
  if (byHours !== undefined) {
    return byHours;
  }
  const first = site.contact.locations[0];
  if (first === undefined) {
    throw new Error("contact.json has no location (schema should have rejected it).");
  }
  return first;
}

/** Map link: the configured mapUrl, otherwise an OpenStreetMap link from geo; null when neither exists. */
export function mapHref(location: Location): string | null {
  if (location.mapUrl !== null) {
    return location.mapUrl;
  }
  if (location.geo !== null) {
    const { lat, lng } = location.geo;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  }
  return null;
}

/** <title> text: metaTitle when set, otherwise the page title. */
export function seoTitle(data: { title: string; metaTitle: string | null }): string {
  if (data.metaTitle !== null) {
    return data.metaTitle;
  }
  return data.title;
}

/** meta description: metaDescription when set, otherwise the page title. */
export function seoDescription(data: { title: string; metaDescription: string | null }): string {
  if (data.metaDescription !== null) {
    return data.metaDescription;
  }
  return data.title;
}

/** Keeps Czech one-letter words (v, s, k, z, u, o, i, a) off line ends. */
export function nbsp(text: string): string {
  return text.replace(/(^|[\s(])([vskzuoiaVSKZUOIA])\s+/g, "$1$2 ");
}

export interface PathLink {
  key: string;
  label: string;
  href: string;
  /** Matches the current path for aria-current. */
  current: boolean;
}

function isCurrent(href: string, path: string): boolean {
  if (href.includes("#")) {
    return false;
  }
  if (href === "/") {
    return path === "/";
  }
  return path.startsWith(href);
}

function link(key: string, label: string, href: string, path: string): PathLink {
  return { key, label, href, current: isCurrent(href, path) };
}

export interface NavExtras {
  guestInfo: NavItem | null;
  prePlanning: NavItem | null;
  hasPeople: boolean;
  hasFaq: boolean;
  hasDocuments: boolean;
}

export interface PathNav {
  /** Teď hned: Jak postupovat, Kontakt, then Lidé (core order inside the group). */
  now: PathLink[];
  /** S předstihem: core's order (Služby, Rakve, Květiny, O nás, Ceník), then the optional pages and anchors. */
  ahead: PathLink[];
  /** Oznámení a obřady, when on (neutral, outside both paths). */
  notices: PathLink | null;
  /** The three links on the right of the wide header: Oznámení a obřady, O nás, Kontakt. */
  general: PathLink[];
}

/**
 * Core's navigation split into the two paths. Core fixes the order (NAV_ORDER); the template only
 * groups the ordered list by path and never reorders items inside a group.
 */
export function pathNav(site: SiteContext, path: string, extras: NavExtras): PathNav {
  const now: PathLink[] = [];
  const ahead: PathLink[] = [];
  let notices: PathLink | null = null;
  for (const item of site.nav) {
    const id = item.id as PageId;
    const group = pathOf(id);
    // "both" (home) is left out: the wordmark links home.
    if (group === "now") {
      now.push(link(item.id, item.label, item.href, path));
    }
    if (group === "ahead") {
      ahead.push(link(item.id, item.label, item.href, path));
    }
    if (group === "neutral") {
      notices = link(item.id, item.label, item.href, path);
    }
  }
  if (extras.hasPeople) {
    now.push(link("people", ui.peopleLink, "/kontakt/#lide", path));
  }
  for (const item of [extras.guestInfo, extras.prePlanning]) {
    if (item !== null) {
      ahead.push(link(item.id, item.label, item.href, path));
    }
  }
  if (extras.hasFaq) {
    ahead.push(link("faq", ui.faqLink, "/sluzby/#caste-otazky", path));
  }
  if (extras.hasDocuments) {
    ahead.push(link("documents", ui.documentsLink, "/pravni-informace/#dokumenty", path));
  }
  const general: PathLink[] = [];
  for (const id of ["oznameni", "o-nas", "kontakt"] as const) {
    const item = site.nav.find((entry) => entry.id === id);
    if (item !== undefined) {
      general.push(link(item.id, item.label, item.href, path));
    }
  }
  return { now, ahead, notices, general };
}

/** Reduced list for notice pages (research L1): Oznámení a obřady · Kontakt · Úvodní stránka. */
export function neutralLinks(site: SiteContext, path: string): PathLink[] {
  const links: PathLink[] = [];
  for (const id of ["oznameni", "kontakt"] as const) {
    const item = site.nav.find((entry) => entry.id === id);
    if (item !== undefined) {
      links.push(link(item.id, item.label, item.href, path));
    }
  }
  links.push(link("home", ui.homeLink, "/", path));
  return links;
}

/** The price group a service links to, or null. */
export function priceGroupFor(pricing: PricingView | null, groupId: string | null): PriceGroup | null {
  if (pricing === null || groupId === null) {
    return null;
  }
  return pricing.groups.find((group) => group.id === groupId) ?? null;
}

/** The item that stands for a group's price (core has no group price; the first item, as for C and E). */
export function headlineItem(group: PriceGroup | null): PriceItem | null {
  if (group === null) {
    return null;
  }
  return group.items[0] ?? null;
}
