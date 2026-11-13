/** Template-local derivations over core view models. No content is read here directly. */
import type { ContactPhone, Location, PriceGroup } from "@core/content/schemas.ts";
import type { NavItem, PricingView, SiteContext } from "@core/content/view-models.ts";
import { ui } from "../i18n/cs.ts";

export function flowerPhones(site: SiteContext): ContactPhone[] {
  return site.contact.phones.filter((phone) => phone.department === "flowers");
}

/** The schema guarantees at least one office phone. */
export function primaryOfficePhone(site: SiteContext): ContactPhone {
  const first = site.contact.phones.find((phone) => phone.department === "office");
  if (first === undefined) {
    throw new Error("contact.json has no office phone (schema should have rejected it).");
  }
  return first;
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

/** The first office e-mail, or null. */
export function officeEmail(site: SiteContext): string | null {
  const first = site.contact.emails[0];
  if (first === undefined) {
    return null;
  }
  return first.address;
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

export interface EssayLink {
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

export interface NavExtras {
  guestInfo: NavItem | null;
  prePlanning: NavItem | null;
  hasPeople: boolean;
  hasFaq: boolean;
  hasDocuments: boolean;
}

/**
 * The full navigation: core nav without "home" (the wordmark links home) in core's locked order,
 * then the optional pages and anchors this template renders while they are on, then Kontakt.
 * People live on /o-nas/#lide (plan s11 §4.1).
 */
export function fullNav(site: SiteContext, path: string, extras: NavExtras): EssayLink[] {
  const links: EssayLink[] = [];
  let contact: NavItem | null = null;
  for (const item of site.nav) {
    if (item.id === "home") {
      continue;
    }
    if (item.id === "kontakt") {
      contact = item;
      continue;
    }
    links.push({ key: item.id, label: item.label, href: item.href, current: isCurrent(item.href, path) });
  }
  for (const item of [extras.guestInfo, extras.prePlanning]) {
    if (item !== null) {
      links.push({ key: item.id, label: item.label, href: item.href, current: isCurrent(item.href, path) });
    }
  }
  if (extras.hasPeople) {
    links.push({ key: "people", label: ui.peopleLink, href: "/o-nas/#lide", current: false });
  }
  if (extras.hasFaq) {
    links.push({ key: "faq", label: ui.faqLink, href: "/jak-postupovat/#caste-otazky", current: false });
  }
  if (extras.hasDocuments) {
    links.push({ key: "documents", label: ui.documentsLink, href: "/pravni-informace/#dokumenty", current: false });
  }
  if (contact !== null) {
    links.push({ key: contact.id, label: contact.label, href: contact.href, current: isCurrent(contact.href, path) });
  }
  return links;
}

/** Reduced list for notice pages (research L1): Oznámení a obřady · Kontakt · Úvodní stránka. */
export function neutralNav(site: SiteContext, path: string): EssayLink[] {
  const links: EssayLink[] = [];
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
