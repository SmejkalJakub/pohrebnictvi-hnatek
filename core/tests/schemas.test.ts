import { describe, expect, it } from "vitest";
import { Contact, Guidance, ImageRef, OfficeHours, Page, PriceItem, Pricing } from "../content/schemas.ts";
import {
  SiteConfig,
  checkConfigAgainstManifest,
  resolveTemplateOptions,
  type TemplateManifest,
} from "../content/config.ts";
import { optionalText } from "../content/primitives.ts";

const baseImage = {
  file: "a.jpg",
  alt: "Popis obrázku",
  source: "client",
  depicts: "generic",
  rightsConfirmed: true,
};

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }): string[] {
  if (result.success || result.error === undefined) {
    return [];
  }
  return result.error.issues.map((issue) => issue.message);
}

describe("ImageRef", () => {
  it("accepts a client photo", () => {
    expect(ImageRef.safeParse(baseImage).success).toBe(true);
  });

  it("requires alt unless decorative", () => {
    expect(ImageRef.safeParse({ ...baseImage, alt: "" }).success).toBe(false);
    expect(ImageRef.safeParse({ ...baseImage, alt: "", decorative: true }).success).toBe(true);
  });

  it("rejects a placeholder image that claims to show the real business", () => {
    const result = ImageRef.safeParse({ ...baseImage, source: "placeholder", depicts: "actual-business" });
    expect(result.success).toBe(false);
  });

  it("rejects stock photos presented as the real business", () => {
    const result = ImageRef.safeParse({ ...baseImage, source: "licensed-stock", depicts: "actual-business" });
    expect(messages(result).join(" ")).toContain("Skutečné prostory");
  });

  it("requires placeholder source and subject to match", () => {
    expect(ImageRef.safeParse({ ...baseImage, source: "placeholder", depicts: "generic" }).success).toBe(
      false,
    );
    expect(ImageRef.safeParse({ ...baseImage, source: "placeholder", depicts: "placeholder" }).success).toBe(
      true,
    );
  });
});

describe("OfficeHours", () => {
  const base = {
    locationId: "a",
    weekly: [
      {
        id: "wd",
        days: ["mon", "fri"],
        open: "07:00",
        close: "15:30",
        breaks: [{ from: "12:00", to: "12:30" }],
      },
    ],
  };

  it("accepts ordinary hours with a break", () => {
    expect(OfficeHours.safeParse(base).success).toBe(true);
  });

  it("rejects round-the-clock office hours and points to the emergency section", () => {
    const result = OfficeHours.safeParse({
      ...base,
      weekly: [{ id: "all", days: ["mon"], open: "00:00", close: "23:59", breaks: [] }],
    });
    expect(messages(result).join(" ")).toContain("Nonstop převoz");
  });

  it("rejects a break outside opening time", () => {
    const result = OfficeHours.safeParse({
      ...base,
      weekly: [
        { id: "wd", days: ["mon"], open: "07:00", close: "15:30", breaks: [{ from: "16:00", to: "16:30" }] },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a day listed twice and close before open", () => {
    const result = OfficeHours.safeParse({
      ...base,
      weekly: [
        { id: "a", days: ["mon"], open: "07:00", close: "15:00", breaks: [] },
        { id: "b", days: ["mon"], open: "16:00", close: "15:00", breaks: [] },
      ],
    });
    const all = messages(result).join(" ");
    expect(all).toContain("vícekrát");
    expect(all).toContain("později");
  });

  it("rejects malformed times", () => {
    const result = OfficeHours.safeParse({
      ...base,
      weekly: [{ id: "a", days: ["mon"], open: "7:00", close: "15:00", breaks: [] }],
    });
    expect(result.success).toBe(false);
  });
});

describe("Contact", () => {
  const location = {
    id: "a",
    name: "Kancelář",
    address: { street: "Ulice 1", city: "Město", postalCode: "682 01" },
    geo: null,
    mapUrl: null,
  };

  it("cannot hold an emergency phone (no such department)", () => {
    const result = Contact.safeParse({
      locations: [location],
      phones: [
        { id: "x", label: "Nonstop", number: "+420000000199", department: "emergency", locationId: null },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("requires an office phone and E.164 numbers", () => {
    const noOffice = Contact.safeParse({
      locations: [location],
      phones: [
        { id: "x", label: "Květiny", number: "+420000000103", department: "flowers", locationId: null },
      ],
    });
    expect(messages(noOffice).join(" ")).toContain("kanceláře");
    const badNumber = Contact.safeParse({
      locations: [location],
      phones: [{ id: "x", label: "Kancelář", number: "517 352 020", department: "office", locationId: null }],
    });
    expect(badNumber.success).toBe(false);
  });
});

describe("Pricing", () => {
  const item = { id: "a", label: "Položka", kind: "fixed", amount: 1000, amountMax: null, status: "demo" };

  it("accepts each price kind when consistent", () => {
    expect(PriceItem.safeParse(item).success).toBe(true);
    const range = { ...item, kind: "range", amount: 1000, amountMax: 2000 };
    const onRequest = { ...item, kind: "on-request", amount: null };
    const pricing = {
      visible: true,
      currency: "CZK",
      validFrom: null,
      groups: [{ id: "g", title: "Skupina", items: [range, { ...onRequest, id: "b" }] }],
    };
    expect(Pricing.safeParse(pricing).success).toBe(true);
  });

  function pricingWith(items: object[]) {
    return Pricing.safeParse({
      visible: true,
      currency: "CZK",
      validFrom: null,
      groups: [{ id: "g", title: "Skupina", items }],
    });
  }

  it("rejects a range whose maximum is not above the minimum", () => {
    expect(pricingWith([{ ...item, kind: "range", amount: 2000, amountMax: 2000 }]).success).toBe(false);
  });

  it("rejects an on-request item with an amount", () => {
    expect(pricingWith([{ ...item, kind: "on-request", amount: 500 }]).success).toBe(false);
  });

  it("rejects a fixed price without amount, or with amountMax", () => {
    expect(pricingWith([{ ...item, amount: null }]).success).toBe(false);
    expect(pricingWith([{ ...item, amountMax: 5 }]).success).toBe(false);
  });

  it("rejects fractional and absurd amounts and duplicate ids", () => {
    expect(pricingWith([{ ...item, amount: 10.5 }]).success).toBe(false);
    expect(pricingWith([{ ...item, amount: 5_000_000 }]).success).toBe(false);
    expect(pricingWith([item, item]).success).toBe(false);
  });

  it("only knows the statuses demo and approved", () => {
    expect(PriceItem.safeParse({ ...item, status: "real" }).success).toBe(false);
  });
});

describe("CMS-friendly primitives", () => {
  it("treats empty strings as null for optional text", () => {
    expect(optionalText(10).parse("")).toBeNull();
    expect(optionalText(10).parse(undefined)).toBeNull();
    expect(optionalText(10).parse(" text ")).toBe("text");
  });

  it("accepts YAML dates parsed as Date objects", () => {
    const result = Guidance.parse({
      title: "T",
      summary: "S",
      phase: "first-hours",
      order: 1,
      review: { reviewedBy: "X", reviewedAt: new Date("2026-05-01T00:00:00Z"), sources: [] },
    });
    expect(result.review.reviewedAt).toBe("2026-05-01");
  });

  it("applies page defaults", () => {
    const page = Page.parse({ title: "T", navLabel: "N", metaDescription: "D" });
    expect(page.placeholder).toBe(false);
    expect(page.heroImage).toBeNull();
    expect(page.lead).toBeNull();
  });
});

describe("SiteConfig and manifest", () => {
  const config = SiteConfig.parse({
    template: "demo",
    siteUrl: "https://example.invalid",
    features: {},
    homepage: { sections: ["hero", "services", "contact-summary"] },
    options: { palette: "a" },
  });
  const manifest: TemplateManifest = {
    id: "demo",
    name: "Demo",
    version: "0.1.0",
    coreVersion: "^0.1.0",
    supports: {
      articles: false,
      multipleLocations: false,
      contactForm: false,
      serviceDetailPages: false,
      mapEmbed: false,
    },
    homepageSections: {
      available: ["hero", "services", "contact-summary", "family-story"],
      default: ["hero", "services", "contact-summary"],
      constraints: { first: "hero", required: ["hero", "contact-summary"] },
    },
    options: { palette: { values: ["a", "b"], default: "a" } },
    imageSlots: {},
    pageFields: {},
  };

  it("defaults features to articles off and map as link", () => {
    expect(config.features).toEqual({ articles: false, contactForm: false, map: "link" });
  });

  it("accepts declared options", () => {
    expect(checkConfigAgainstManifest(config, manifest)).toEqual([]);
  });

  it("rejects undeclared options, bad order and articles on an unsupporting template", () => {
    const bad = {
      ...config,
      options: { palette: "neon", glow: "yes" },
      homepage: { sections: ["services", "hero"] as typeof config.homepage.sections },
      features: { ...config.features, articles: true },
    };
    const issues = checkConfigAgainstManifest(bad, manifest).map((issue) => issue.path);
    expect(issues).toEqual(
      expect.arrayContaining(["options.palette", "options.glow", "homepage.sections", "features.articles"]),
    );
  });

  it("rejects an embedded map on a template without map support", () => {
    const embed = { ...config, features: { ...config.features, map: "embed-on-click" as const } };
    expect(checkConfigAgainstManifest(embed, manifest).map((issue) => issue.path)).toEqual(["features.map"]);
  });

  it("resolves options with manifest defaults and rejects undeclared values", () => {
    const options = {
      palette: { values: ["a", "b"], default: "a" },
      size: { values: ["s", "m"], default: "m" },
    } as const;
    const resolved = resolveTemplateOptions({ options: { palette: "b" } }, { id: "demo", options });
    expect(resolved).toEqual({ palette: "b", size: "m" });
    expect(() => resolveTemplateOptions({ options: { size: "xl" } }, { id: "demo", options })).toThrow(
      /G-005/,
    );
  });

  it("rejects duplicate homepage sections", () => {
    const result = SiteConfig.safeParse({
      template: "demo",
      siteUrl: "https://example.invalid",
      features: {},
      homepage: { sections: ["hero", "hero"] },
    });
    expect(result.success).toBe(false);
  });
});
