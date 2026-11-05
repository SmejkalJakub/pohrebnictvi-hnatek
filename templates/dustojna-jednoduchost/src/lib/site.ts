/** Small, template-local derivations over core view models. No content is read here directly. */
import type { CollectionEntry } from "astro:content";
import { getPage } from "@core/content/load.ts";
import type { ContactPhone, Location, PageId, Service } from "@core/content/schemas.ts";
import type { SiteContext } from "@core/content/view-models.ts";
import { serviceCategoryLabels } from "../i18n/cs.ts";

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

export function otherPhones(site: SiteContext): ContactPhone[] {
  return site.contact.phones.filter((phone) => phone.department === "other");
}

/** Template B supports a single location (supports.multipleLocations: false). */
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

/** Map link: the configured mapUrl, otherwise an OpenStreetMap link from geo; null when neither exists (G-010). */
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

/** True when the optional page file exists (e.g. ochrana-osobnich-udaju). */
export async function pageExists(id: PageId): Promise<boolean> {
  try {
    await getPage(id);
    return true;
  } catch {
    return false;
  }
}

export interface ServiceGroup {
  category: Service["category"];
  label: string;
  services: CollectionEntry<"services">[];
}

/** Groups services (already sorted by category, then order) without changing their order. */
export function groupServices(services: readonly CollectionEntry<"services">[]): ServiceGroup[] {
  const groups: ServiceGroup[] = [];
  for (const service of services) {
    const last = groups[groups.length - 1];
    if (last !== undefined && last.category === service.data.category) {
      last.services.push(service);
    } else {
      groups.push({
        category: service.data.category,
        label: serviceCategoryLabels[service.data.category],
        services: [service],
      });
    }
  }
  return groups;
}

/** Page title for <title>: metaTitle when set, otherwise the page title. */
export function seoTitle(data: { title: string; metaTitle: string | null }): string {
  if (data.metaTitle !== null) {
    return data.metaTitle;
  }
  return data.title;
}

/** True when a raw Markdown body contains its own section headings. */
export function bodyHasHeadings(body: string | undefined): boolean {
  if (body === undefined) {
    return false;
  }
  return /^#{2,6}\s/m.test(body);
}

export function bodyIsEmpty(body: string | undefined): boolean {
  if (body === undefined) {
    return true;
  }
  return body.trim() === "";
}

/** "2026-12-24" → "24. 12. 2026" (non-breaking spaces). */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (year === undefined || month === undefined || day === undefined) {
    return iso;
  }
  return `${Number(day)}. ${Number(month)}. ${year}`;
}
