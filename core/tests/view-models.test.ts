import { beforeAll, describe, expect, it } from "vitest";
import {
  buildPricingView,
  buildSiteContext,
  serviceHref,
  sortCatalogue,
  sortGuidance,
  sortServices,
} from "../content/view-models.ts";
import { buildLocalBusinessJsonLd } from "../seo/structured-data.ts";
import { buildMediaInventory } from "../media/inventory.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { clone, loadFixture } from "./helpers.ts";

let fixture: ValidatedContent;

beforeAll(async () => {
  fixture = await loadFixture();
});

function context(content: ValidatedContent) {
  return buildSiteContext({ ...content, mode: "prototype" });
}

describe("navigation", () => {
  it("lists required pages in the locked order, with cenik only when visible", () => {
    expect(context(fixture).nav.map((item) => item.href)).toEqual([
      "/",
      "/jak-postupovat/",
      // The fixture switches features.notices on; templates without notices never see it.
      "/oznameni/",
      "/sluzby/",
      "/rakve/",
      "/kvetiny/",
      "/o-nas/",
      "/cenik/",
      "/kontakt/",
    ]);
    const hidden = clone(fixture);
    hidden.pricing.visible = false;
    expect(context(hidden).nav.map((item) => item.id)).not.toContain("cenik");
  });

  it("never lists articles when the feature is off", () => {
    expect(context(fixture).nav.map((item) => item.id)).not.toContain("clanky");
  });

  it("reports missing legal facts for prototype markers", () => {
    expect(context(fixture).missing.map((fact) => fact.label)).toEqual([
      "IČO",
      "zápis v obchodním rejstříku",
      "sídlo společnosti",
    ]);
  });
});

describe("collections", () => {
  it("sorts services by category order then order, excluding unpublished", () => {
    const content = clone(fixture);
    content.services.find((entry) => entry.id === "exhumace")!.data.published = false;
    expect(sortServices(content.services).map((entry) => entry.id)).toEqual([
      "pohreb-s-obradem",
      "pohreb-bez-obradu",
      "prevoz-zesnulych",
      "vyrizeni-formalit",
      "kremace",
      "smutecni-oznameni",
    ]);
  });

  it("sorts guidance by phase", () => {
    expect(sortGuidance(fixture.guidance).map((entry) => entry.data.phase)).toEqual([
      "first-hours",
      "first-hours",
      "first-days",
      "first-days",
      "arrangements",
      "after-funeral",
      "after-funeral",
    ]);
  });

  it("handles an empty catalogue", () => {
    expect(sortCatalogue([])).toEqual([]);
  });

  it("builds service links for both IA styles", () => {
    expect(serviceHref("kremace", true)).toBe("/sluzby/kremace/");
    expect(serviceHref("kremace", false)).toBe("/sluzby/#kremace");
  });
});

describe("pricing view", () => {
  it("is null when hidden and flags demo prices", () => {
    expect(buildPricingView({ ...fixture.pricing, visible: false })).toBeNull();
    expect(buildPricingView(fixture.pricing)?.hasDemo).toBe(true);
  });
});

describe("structured data", () => {
  it("keeps office hours and the nonstop line apart, and omits prices and unknown facts", () => {
    const json = buildLocalBusinessJsonLd(context(fixture));
    expect(json.openingHoursSpecification).toEqual([
      expect.objectContaining({ opens: "07:00", closes: "12:00" }),
      expect.objectContaining({ opens: "12:30", closes: "15:30" }),
    ]);
    expect(json.contactPoint).toEqual([
      expect.objectContaining({ contactType: "Nonstop převoz zesnulých", telephone: "+420000000199" }),
    ]);
    const text = JSON.stringify(json);
    expect(text).not.toMatch(/offers|price/i);
    expect(json).not.toHaveProperty("taxID");
    expect(json).not.toHaveProperty("geo");
  });

  it("omits the emergency contact point when the service is disabled", () => {
    const content = clone(fixture);
    content.emergency.enabled = false;
    expect(buildLocalBusinessJsonLd(context(content))).not.toHaveProperty("contactPoint");
  });
});

describe("media inventory", () => {
  it("lists every used image with its uses and flags", () => {
    const rows = buildMediaInventory(fixture);
    const fourByThree = rows.find((row) => row.file === "placeholder-4x3.png");
    expect(fourByThree?.source).toBe("placeholder");
    expect(fourByThree?.usedBy.length).toBe(5);
    expect(rows.find((row) => row.file === "placeholder-4x5.png")?.usedBy).toEqual([]);
  });
});
