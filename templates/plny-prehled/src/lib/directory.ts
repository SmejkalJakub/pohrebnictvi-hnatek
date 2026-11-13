/** Template-local derivations over core view models. No content is read here directly. */
import type { ContactPhone, Location, PriceGroup, PriceItem } from "@core/content/schemas.ts";
import type { NavItem, PricingView, SiteContext } from "@core/content/view-models.ts";
import { ui } from "../i18n/cs.ts";

export function officePhones(site: SiteContext): ContactPhone[] {
  return site.contact.phones.filter((phone) => phone.department === "office");
}

/** The schema guarantees at least one office phone. */
export function firstOfficePhone(site: SiteContext): ContactPhone {
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
export function officeLocation(site: SiteContext): Location {
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
export function mapLink(location: Location): string | null {
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
export function titleFor(data: { title: string; metaTitle: string | null }): string {
  if (data.metaTitle !== null) {
    return data.metaTitle;
  }
  return data.title;
}

/** Description for <meta>: the page's metaDescription (required by the schema). */
export function descriptionFor(data: { metaDescription: string }): string {
  return data.metaDescription;
}

/** Keeps Czech one-letter words (v, s, k, z, u, o, i, a) off line ends. */
export function keepShortWords(text: string): string {
  return text.replace(/(^|[\s(])([vskzuoiaVSKZUOIA])\s+/g, "$1$2 ");
}

/** One row of the navigation / Rejstřík: a link and an optional count or price hint in mono. */
export interface IndexEntry {
  key: string;
  label: string;
  href: string;
  current: boolean;
  /** Short mono hint shown in the Rejstřík ("7 kroků", "3", "3 PDF"); null for none. */
  count: string | null;
  /** The Ceník row shows its first price through <PriceValue> instead of a count. */
  priceItem: PriceItem | null;
}

function isCurrent(href: string, path: string): boolean {
  if (href === "/") {
    return path === "/";
  }
  const base = href.split("#")[0] ?? href;
  if (href.includes("#")) {
    return false;
  }
  return path.startsWith(base);
}

export interface IndexCounts {
  steps: number;
  upcoming: number;
  services: number;
  coffins: number;
  flowers: number;
  people: number;
  questions: number;
  documents: number;
  firstPrice: PriceItem | null;
}

export interface IndexExtras {
  guestInfo: NavItem | null;
  prePlanning: NavItem | null;
  hasPeople: boolean;
  hasFaq: boolean;
  hasDocuments: boolean;
  /** /pravni-informace/ exists, so the documents anchor has a target. */
  hasLegalPage: boolean;
}

function countText(count: number): string | null {
  if (count <= 0) {
    return null;
  }
  return String(count);
}

/**
 * The full index: core nav without "home" (the name links home) and without "kontakt", then
 * Lidé, the optional pages, Časté otázky and Dokumenty when on, and Kontakt last (as drawn).
 */
export function fullIndex(site: SiteContext, path: string, extras: IndexExtras, counts: IndexCounts): IndexEntry[] {
  const entries: IndexEntry[] = [];
  const add = (key: string, label: string, href: string, count: string | null, priceItem: PriceItem | null = null) => {
    entries.push({ key, label, href, current: isCurrent(href, path), count, priceItem });
  };
  let contact: NavItem | null = null;
  for (const item of site.nav) {
    if (item.id === "home") {
      continue;
    }
    if (item.id === "kontakt") {
      contact = item;
      continue;
    }
    if (item.id === "jak-postupovat") {
      add(item.id, item.label, item.href, ui.steps(counts.steps));
    } else if (item.id === "oznameni") {
      add(item.id, item.label, item.href, countText(counts.upcoming));
    } else if (item.id === "sluzby") {
      add(item.id, item.label, item.href, countText(counts.services));
    } else if (item.id === "rakve") {
      add(item.id, item.label, item.href, countText(counts.coffins));
    } else if (item.id === "kvetiny") {
      add(item.id, item.label, item.href, countText(counts.flowers));
    } else if (item.id === "cenik") {
      // Not on /cenik/ itself: there the demo notice must come before the first price.
      let price = counts.firstPrice;
      if (isCurrent(item.href, path)) {
        price = null;
      }
      add(item.id, item.label, item.href, null, price);
    } else {
      add(item.id, item.label, item.href, null);
    }
  }
  if (extras.hasPeople) {
    add("lide", ui.peopleLink, "/kontakt/#lide", countText(counts.people));
  }
  for (const item of [extras.guestInfo, extras.prePlanning]) {
    if (item !== null) {
      add(item.id, item.label, item.href, null);
    }
  }
  if (extras.hasFaq) {
    add("faq", ui.faqLink, "/jak-postupovat/#caste-otazky", countText(counts.questions));
  }
  if (extras.hasDocuments && extras.hasLegalPage) {
    add("dokumenty", ui.documentsLink, "/pravni-informace/#dokumenty", ui.pdfCount(counts.documents));
  }
  if (contact !== null) {
    add(contact.id, contact.label, contact.href, null);
  }
  return entries;
}

/** Reduced index for notice pages (research L1): Oznámení a obřady · Kontakt · Úvodní stránka. */
export function neutralIndex(site: SiteContext, path: string): IndexEntry[] {
  const entries: IndexEntry[] = [];
  for (const id of ["oznameni", "kontakt"] as const) {
    const item = site.nav.find((entry) => entry.id === id);
    if (item !== undefined) {
      entries.push({
        key: item.id,
        label: item.label,
        href: item.href,
        current: isCurrent(item.href, path),
        count: null,
        priceItem: null,
      });
    }
  }
  entries.push({ key: "home", label: ui.homeLink, href: "/", current: false, count: null, priceItem: null });
  return entries;
}

/** The price group a service links to, or null. */
export function groupFor(pricing: PricingView | null, groupId: string | null): PriceGroup | null {
  if (pricing === null || groupId === null) {
    return null;
  }
  return pricing.groups.find((group) => group.id === groupId) ?? null;
}

/** A package: a group with inclusion lists (shown as a column pair on /cenik/). */
export function isPackage(group: PriceGroup): boolean {
  return group.includes.length > 0 || group.excludes.length > 0;
}

/** The home price excerpt: the first item of each group, at most `limit` rows. */
export function excerptItems(pricing: PricingView, limit = 5): PriceItem[] {
  const items: PriceItem[] = [];
  for (const group of pricing.groups) {
    const first = group.items[0];
    if (first !== undefined && items.length < limit) {
      items.push(first);
    }
  }
  return items;
}

/** "Typ ceny" column: pevná, za jednotku, rozpětí, od, na dotaz (from kind + unit). */
export function priceKindLabel(item: PriceItem): string {
  if (item.kind === "on-request") {
    return "na dotaz";
  }
  if (item.kind === "range") {
    return "rozpětí";
  }
  if (item.kind === "from") {
    return "od";
  }
  if (item.unit !== null) {
    return "za jednotku";
  }
  return "pevná";
}
