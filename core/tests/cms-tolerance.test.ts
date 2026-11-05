/**
 * Content must survive what Pages CMS does on save (docs/spikes/pages-cms.md B3, B6, B7, A1–A4).
 */
import { describe, expect, it } from "vitest";
import { Company, Contact, OfficeHours, Page, Pricing } from "../content/schemas.ts";
import { asciiSlug } from "../content/primitives.ts";
import { readSiteSnapshot, validateSnapshot } from "../content/snapshot.ts";
import { FIXTURE_ROOT } from "./helpers.ts";

/** Re-implementation of Pages CMS `sanitizeObject`: drop null, "", [] and {} recursively (false and 0 stay). */
function sanitizeLikeCms(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(sanitizeLikeCms).filter((item) => !isEmpty(item));
    return items;
  }
  if (typeof value === "object" && value !== null && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) {
      const cleaned = sanitizeLikeCms(inner);
      if (!isEmpty(cleaned)) {
        result[key] = cleaned;
      }
    }
    return result;
  }
  return value;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === "") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object" && !(value instanceof Date)) {
    return Object.keys(value).length === 0;
  }
  return false;
}

describe("Pages CMS empty-value stripping (A1)", () => {
  it("every fixture file still validates after a CMS save", async () => {
    const raw = await readSiteSnapshot(FIXTURE_ROOT);
    const saved = structuredClone(raw);
    for (const file of Object.values(saved.singletons)) {
      file.data = sanitizeLikeCms(file.data);
    }
    for (const entry of saved.entries) {
      entry.data = sanitizeLikeCms(entry.data);
    }
    const result = validateSnapshot(saved);
    expect(result.problems).toEqual([]);
    expect(result.content?.company.legalIds.ico).toBeNull();
    expect(result.content?.company.tradition.foundedYear).toBeNull();
  });

  it("a company file with only names still parses", () => {
    const company = Company.parse({ brandName: "Firma", legalName: "Firma s.r.o." });
    expect(company.legalIds).toEqual({ ico: null, dic: null, registryEntry: null, registeredOffice: null });
    expect(company.familyOwned).toBeNull();
    expect(company.logo).toBeNull();
  });
});

describe("familyOwned as a CMS select (A4)", () => {
  const base = { brandName: "Firma", legalName: "Firma s.r.o." };
  it("maps yes / no / unknown", () => {
    expect(Company.parse({ ...base, familyOwned: "yes" }).familyOwned).toBe(true);
    expect(Company.parse({ ...base, familyOwned: "no" }).familyOwned).toBe(false);
    expect(Company.parse({ ...base, familyOwned: "unknown" }).familyOwned).toBeNull();
    expect(Company.parse({ ...base, familyOwned: true }).familyOwned).toBe(true);
  });
});

describe("optional images (B6)", () => {
  const page = { title: "T", navLabel: "N", metaDescription: "D" };
  it("treats an image object without a file as no image", () => {
    expect(
      Page.parse({ ...page, heroImage: { rightsConfirmed: false, focus: "center" } }).heroImage,
    ).toBeNull();
    expect(Page.parse({ ...page, heroImage: { file: "" } }).heroImage).toBeNull();
  });

  it("defaults null booleans and an empty focus", () => {
    const parsed = Page.parse({
      ...page,
      heroImage: {
        file: "a.jpg",
        alt: "Popis obrázku",
        source: "client",
        depicts: "generic",
        rightsConfirmed: null,
        decorative: null,
        focus: "",
      },
    });
    expect(parsed.heroImage?.rightsConfirmed).toBe(false);
    expect(parsed.heroImage?.decorative).toBe(false);
    expect(parsed.heroImage?.focus).toBe("center");
  });
});

describe("rows added in the CMS without ids (B7)", () => {
  const location = {
    id: "a",
    name: "Kancelář",
    address: { street: "Ulice 1", city: "Město", postalCode: "682 01" },
    mapUrl: "https://example.invalid",
  };

  it("derives ASCII ids from labels and keeps explicit ones", () => {
    const contact = Contact.parse({
      locations: [location],
      phones: [
        { id: "kancelar", label: "Kancelář", number: "+420000000101", department: "office" },
        { label: "Kancelář", number: "+420000000102", department: "office" },
        { label: "Objednávky květin", number: "+420000000103", department: "flowers" },
      ],
      emails: [{ label: "Kancelář", address: "a@example.invalid" }],
    });
    expect(contact.phones.map((phone) => phone.id)).toEqual(["kancelar", "kancelar-2", "objednavky-kvetin"]);
    expect(contact.emails[0]?.id).toBe("kancelar");
  });

  it("still reports duplicate explicit ids", () => {
    const result = Contact.safeParse({
      locations: [location],
      phones: [
        { id: "x", label: "A", number: "+420000000101", department: "office" },
        { id: "x", label: "B", number: "+420000000102", department: "office" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("derives office-hours group ids from the days", () => {
    const hours = OfficeHours.parse({
      locationId: "a",
      weekly: [{ days: ["sat"], open: "08:00", close: "10:00" }],
    });
    expect(hours.weekly[0]?.id).toBe("sat");
  });

  it("derives price ids unique across the whole list", () => {
    const item = { label: "Převoz", kind: "fixed", amount: 100, amountMax: null, status: "demo" };
    const pricing = Pricing.parse({
      visible: true,
      currency: "CZK",
      validFrom: null,
      groups: [
        { title: "Pohřeb", items: [item, { ...item, amount: 200 }] },
        { title: "Pohřeb", items: [item] },
      ],
    });
    expect(pricing.groups.map((group) => group.id)).toEqual(["pohreb", "pohreb-2"]);
    expect(pricing.groups.flatMap((group) => group.items.map((entry) => entry.id))).toEqual([
      "pohreb-prevoz",
      "pohreb-prevoz-2",
      "pohreb-2-prevoz",
    ]);
  });

  it("slugifies Czech text to ASCII", () => {
    expect(asciiSlug("Příliš žluťoučký kůň")).toBe("prilis-zlutoucky-kun");
    expect(asciiSlug("!!!")).toBe("polozka");
  });
});
