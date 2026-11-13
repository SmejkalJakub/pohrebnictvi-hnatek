/** Template-local derivations over core view models. No content is read here directly. */
import type { ContactPhone, Location, PriceGroup } from "@core/content/schemas.ts";
import type { NavItem, PricingView, SiteContext } from "@core/content/view-models.ts";
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

/** Keeps Czech one-letter words (v, s, k, z, u, o, i, a) off line ends. */
export function nbsp(text: string): string {
  return text.replace(/(^|[\s(])([vskzuoiaVSKZUOIA])\s+/g, "$1$2 ");
}

export interface RailLink {
  key: string;
  label: string;
  href: string;
  /** Matches the current path for aria-current. */
  current: boolean;
}

function isCurrent(href: string, path: string): boolean {
  if (href === "/") {
    return path === "/";
  }
  return path.startsWith(href.split("#")[0] ?? href);
}

/**
 * The full rail list: core nav without "home" (the name links home), then the optional pages
 * this template renders when they are on, then the FAQ anchor on the guide.
 */
export function fullNav(
  site: SiteContext,
  path: string,
  extras: { guestInfo: NavItem | null; prePlanning: NavItem | null; hasFaq: boolean },
): RailLink[] {
  const links: RailLink[] = [];
  for (const item of site.nav) {
    if (item.id === "home") {
      continue;
    }
    links.push({ key: item.id, label: item.label, href: item.href, current: isCurrent(item.href, path) });
  }
  for (const item of [extras.guestInfo, extras.prePlanning]) {
    if (item !== null) {
      links.push({ key: item.id, label: item.label, href: item.href, current: isCurrent(item.href, path) });
    }
  }
  if (extras.hasFaq) {
    links.push({ key: "faq", label: ui.faqLink, href: "/jak-postupovat/#caste-otazky", current: false });
  }
  return links;
}

/** Reduced list for notice pages (research L1): Oznámení a obřady · Kontakt · Úvodní stránka. */
export function neutralNav(site: SiteContext, path: string): RailLink[] {
  const links: RailLink[] = [];
  for (const id of ["oznameni", "kontakt"] as const) {
    const item = site.nav.find((entry) => entry.id === id);
    if (item !== undefined) {
      links.push({ key: item.id, label: item.label, href: item.href, current: isCurrent(item.href, path) });
    }
  }
  links.push({ key: "home", label: ui.homeLink, href: "/", current: path === "/" });
  return links;
}

/** The price group a service links to, or null. */
export function priceGroupFor(pricing: PricingView | null, groupId: string | null): PriceGroup | null {
  if (pricing === null || groupId === null) {
    return null;
  }
  return pricing.groups.find((group) => group.id === groupId) ?? null;
}
