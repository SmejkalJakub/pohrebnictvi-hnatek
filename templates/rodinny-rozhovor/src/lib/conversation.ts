/** Template-local derivations over core view models. No content is read here directly. */
import type { ContactPhone, Location, PriceGroup, PriceItem } from "@core/content/schemas.ts";
import type { HomePhoto, NavItem, PricingView, SiteContext } from "@core/content/view-models.ts";
import { ui } from "../i18n/cs.ts";

/**
 * Keeps Czech one-letter words (v, s, k, z, u, o, i, a) off line ends with a non-breaking space.
 * The lookbehind reads the original text, so a run such as "i o svátcích" binds both words.
 */
export function keepShortWords(text: string): string {
  return text.replace(/(?<=^|[\s („"])([vskzuoiaVSKZUOIA])\s+/g, "$1 ");
}

/** keepShortWords() for rendered HTML: text between tags only, tags and attributes untouched. */
export function keepShortWordsHtml(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        return part;
      }
      return keepShortWords(part);
    })
    .join("");
}

/** "Pohřeb bez obřadu" → "pohřeb bez obřadu" (for a title inside a question). */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLocaleLowerCase("cs") + text.slice(1);
}

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

/** <title> text: metaTitle when set, otherwise the content title. */
export function seoTitle(data: { title: string; metaTitle: string | null }): string {
  if (data.metaTitle !== null) {
    return data.metaTitle;
  }
  return data.title;
}

export interface WordLink {
  key: string;
  label: string;
  href: string;
  current: boolean;
}

function isCurrent(href: string, path: string): boolean {
  if (href === "/") {
    return path === "/";
  }
  return path.startsWith(href.split("#")[0] ?? href);
}

/** The pages that are words in the nav: at most five, in core's locked order (guardrail: ≤ 6). */
const NAV_WORDS = ["jak-postupovat", "oznameni", "o-nas", "cenik", "kontakt"] as const;

function toWord(item: NavItem, path: string): WordLink {
  return { key: item.id, label: item.label, href: item.href, current: isCurrent(item.href, path) };
}

export function navWords(site: SiteContext, path: string): WordLink[] {
  return site.nav
    .filter((item) => (NAV_WORDS as readonly string[]).includes(item.id))
    .map((item) => toWord(item, path));
}

/** Notice pages (research L1): Oznámení a obřady · Kontakt. The wordmark links home. */
export function neutralWords(site: SiteContext, path: string): WordLink[] {
  return site.nav
    .filter((item) => item.id === "oznameni" || item.id === "kontakt")
    .map((item) => toWord(item, path));
}

/** Pages reached from the footer line "Co tu ještě najdete?": everything that is not a nav word. */
export function footerPages(
  site: SiteContext,
  extras: { guestInfo: NavItem | null; prePlanning: NavItem | null; hasPeople: boolean; hasFaq: boolean },
): WordLink[] {
  const links: WordLink[] = [];
  for (const item of site.nav) {
    if (item.id === "home" || (NAV_WORDS as readonly string[]).includes(item.id)) {
      continue;
    }
    links.push(toWord(item, ""));
  }
  if (extras.hasPeople) {
    links.push({ key: "lide", label: ui.peopleLink, href: "/o-nas/#lide", current: false });
  }
  for (const item of [extras.guestInfo, extras.prePlanning]) {
    if (item !== null) {
      links.push(toWord(item, ""));
    }
  }
  if (extras.hasFaq) {
    links.push({ key: "faq", label: ui.faqLink, href: "/jak-postupovat/#caste-otazky", current: false });
  }
  return links;
}

/**
 * Fields alternate sand and cream; the first field of a page is cream (or the deep clay field).
 * "auto" continues the alternation in CSS (fields after a Markdown body of unknown length).
 */
export type Tone = "ground" | "band" | "deep" | "auto";

export function toneAt(index: number): Tone {
  if (index % 2 === 0) {
    return "ground";
  }
  return "band";
}

/** A package: a price group with "what is included" lists (drawn as a question with the price). */
export function isPackage(group: PriceGroup): boolean {
  return group.includes.length > 0 || group.excludes.length > 0;
}

export interface PriceMention {
  title: string;
  item: PriceItem;
}

/**
 * The home price sentence: the first priced item of each package (at most two), or of the first
 * groups when there are no packages. Items "on request" have no amount to name, so they are skipped.
 */
export function priceMentions(pricing: PricingView): PriceMention[] {
  let groups = pricing.groups.filter(isPackage);
  if (groups.length === 0) {
    groups = pricing.groups;
  }
  const mentions: PriceMention[] = [];
  for (const group of groups) {
    const item = group.items.find((candidate) => candidate.kind !== "on-request");
    if (item !== undefined) {
      mentions.push({ title: group.title, item });
    }
    if (mentions.length === 2) {
      break;
    }
  }
  return mentions;
}

/** The price group a service links to, or null. */
export function priceGroupFor(pricing: PricingView | null, groupId: string | null): PriceGroup | null {
  if (pricing === null || groupId === null) {
    return null;
  }
  return pricing.groups.find((group) => group.id === groupId) ?? null;
}

/** One catalogue page on the home page ("Jakou rakev a jaké květiny?"), with its real photo. */
export interface CatalogueLine {
  key: string;
  label: string;
  href: string;
  count: number;
  photo: HomePhoto | null;
}
