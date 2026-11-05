/**
 * schema.org JSON-LD for the business. Office hours go into openingHoursSpecification;
 * the nonstop transport line is a separate ContactPoint (never merged into opening hours).
 * Null facts are omitted. Prices are never emitted.
 */
import type { Day } from "../content/primitives.ts";
import type { Address } from "../content/schemas.ts";
import type { SiteContext } from "../content/view-models.ts";

const SCHEMA_DAYS: Record<Day, string> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
};

type JsonObject = Record<string, unknown>;

function postalAddress(address: Address): JsonObject {
  return {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.city,
    postalCode: address.postalCode,
    addressCountry: address.country,
  };
}

function openingHours(site: SiteContext): JsonObject[] {
  const specs: JsonObject[] = [];
  for (const group of site.officeHours.weekly) {
    const dayOfWeek = group.days.map((day) => SCHEMA_DAYS[day]);
    let start = group.open;
    const sortedBreaks = [...group.breaks].sort((a, b) => a.from.localeCompare(b.from));
    for (const pause of sortedBreaks) {
      specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek, opens: start, closes: pause.from });
      start = pause.to;
    }
    specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek, opens: start, closes: group.close });
  }
  return specs;
}

export function buildLocalBusinessJsonLd(site: SiteContext): JsonObject {
  const location = site.contact.locations[0];
  const officePhone = site.contact.phones.find((phone) => phone.department === "office");
  const email = site.contact.emails[0];
  const data: JsonObject = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.company.brandName,
    legalName: site.company.legalName,
    url: site.config.siteUrl,
  };
  if (location !== undefined) {
    data.address = postalAddress(location.address);
    if (location.geo !== null) {
      data.geo = { "@type": "GeoCoordinates", latitude: location.geo.lat, longitude: location.geo.lng };
    }
    if (location.mapUrl !== null) {
      data.hasMap = location.mapUrl;
    }
  }
  if (officePhone !== undefined) {
    data.telephone = officePhone.number;
  }
  if (email !== undefined) {
    data.email = email.address;
  }
  if (site.company.legalIds.ico !== null) {
    data.taxID = site.company.legalIds.ico;
  }
  if (site.company.legalIds.dic !== null) {
    data.vatID = site.company.legalIds.dic;
  }
  const hours = openingHours(site);
  if (hours.length > 0) {
    data.openingHoursSpecification = hours;
  }
  if (site.emergency.enabled) {
    data.contactPoint = [
      {
        "@type": "ContactPoint",
        contactType: site.emergency.label,
        telephone: site.emergency.phone,
        availableLanguage: "cs",
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: Object.values(SCHEMA_DAYS),
          opens: "00:00",
          closes: "23:59",
        },
      },
    ];
  }
  return data;
}
