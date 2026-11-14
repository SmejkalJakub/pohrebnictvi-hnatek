/**
 * Kresby (content-contract §6.20): the optional site/illustrations.json, its feature switch and
 * the gate rules that apply to it (G-005, G-078, G-003, G-032, G-033, L-008).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { SiteConfig, checkConfigAgainstManifest, type TemplateManifest } from "../content/config.ts";
import { IllustrationSet, ILLUSTRATION_SLOTS } from "../content/schemas.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { Approvals, checkLedger } from "../gate/launch-check.ts";
import { collectPublishedImages, collectReferencedMediaFiles, runGate, type Finding } from "../gate/rules.ts";
import { clone, loadFixture, makeProductionReady, PRODUCTION_BUILD_DATE } from "./helpers.ts";

let fixture: ValidatedContent;

beforeAll(async () => {
  fixture = await loadFixture();
});

const NOW = new Date("2026-11-05T12:00:00Z");

const DRAWING = {
  file: "kresba-lipa.png",
  alt: "Kresba lípy na náměstí",
  source: "client",
  depicts: "generic",
  rightsConfirmed: true,
};

function findingsFor(rule: string, findings: Finding[]): Finding[] {
  return findings.filter((finding) => finding.rule === rule);
}

/** Production-ready fixture with the drawings feature on and one real, confirmed drawing. */
function withDrawings(mutate: (content: ValidatedContent) => void = () => {}): ValidatedContent {
  const content = makeProductionReady(fixture);
  content.config.features.illustrations = true;
  content.illustrations = IllustrationSet.parse({ images: [{ slot: "hero", image: DRAWING }] });
  content.mediaFiles = [...content.mediaFiles, "kresba-lipa.png"];
  mutate(content);
  return content;
}

function gate(content: ValidatedContent, mode: "prototype" | "production" = "production"): Finding[] {
  return runGate(content, { mode, now: NOW, buildDate: PRODUCTION_BUILD_DATE });
}

describe("IllustrationSet schema", () => {
  it("accepts an empty set and one drawing per slot", () => {
    expect(IllustrationSet.parse({}).images).toEqual([]);
    const full = IllustrationSet.parse({
      images: ILLUSTRATION_SLOTS.map((slot) => ({ slot, image: { ...DRAWING, decorative: true, alt: "" } })),
    });
    expect(full.images.map((entry) => entry.slot)).toEqual([...ILLUSTRATION_SLOTS]);
  });

  it("rejects stock images, unknown and repeated slots, and an image without alt", () => {
    const stock = IllustrationSet.safeParse({
      images: [{ slot: "hero", image: { ...DRAWING, source: "licensed-stock" } }],
    });
    expect(stock.success).toBe(false);
    expect(JSON.stringify(stock.error?.issues)).toContain("fotobanky");
    expect(IllustrationSet.safeParse({ images: [{ slot: "header", image: DRAWING }] }).success).toBe(false);
    const repeated = IllustrationSet.safeParse({
      images: [
        { slot: "office", image: DRAWING },
        { slot: "office", image: DRAWING },
      ],
    });
    expect(repeated.success).toBe(false);
    expect(JSON.stringify(repeated.error?.issues)).toContain("vícekrát");
    expect(
      IllustrationSet.safeParse({ images: [{ slot: "hero", image: { ...DRAWING, alt: "" } }] }).success,
    ).toBe(false);
  });

  it("the neutral fixture has a placeholder for every slot; its own config keeps the feature off", () => {
    expect(fixture.illustrations?.images.map((entry) => entry.slot).sort()).toEqual(
      [...ILLUSTRATION_SLOTS].sort(),
    );
    for (const entry of fixture.illustrations?.images ?? []) {
      expect(entry.image.source).toBe("placeholder");
    }
    expect(fixture.config.features.illustrations).toBe(false);
    expect(SiteConfig.parse({ ...fixture.config, features: {} }).features.illustrations).toBe(false);
  });
});

describe("feature switch", () => {
  const manifest = (illustrations: boolean): TemplateManifest => ({
    id: "harness",
    name: "Harness",
    version: "0.1.0",
    coreVersion: "^0.1.0",
    supports: {
      articles: false,
      multipleLocations: false,
      contactForm: false,
      serviceDetailPages: false,
      mapEmbed: false,
      notices: false,
      people: false,
      faq: false,
      documents: false,
      guestInfo: false,
      prePlanning: false,
      priceInclusions: false,
      landscapes: false,
      places: false,
      illustrations,
    },
    homepageSections: { available: ["hero"], default: ["hero"], constraints: { required: [] } },
    options: {},
    imageSlots: {},
    pageFields: {},
  });

  it("G-005: the feature needs template support", () => {
    const config = SiteConfig.parse({
      template: "harness",
      siteUrl: "https://example.invalid",
      features: { illustrations: true },
      homepage: { sections: ["hero"] },
    });
    expect(checkConfigAgainstManifest(config, manifest(false)).map((issue) => issue.path)).toEqual([
      "features.illustrations",
    ]);
    expect(checkConfigAgainstManifest(config, manifest(true))).toEqual([]);
  });
});

describe("gate rules for drawings", () => {
  it("passes production with a real, confirmed drawing", () => {
    expect(gate(withDrawings()).filter((finding) => finding.level === "error")).toEqual([]);
  });

  it("G-078: the feature is on but the file is missing, in every mode", () => {
    for (const mode of ["prototype", "production"] as const) {
      const findings = gate(
        withDrawings((content) => {
          content.illustrations = null;
        }),
        mode,
      );
      expect(findingsFor("G-078", findings)).toHaveLength(1);
      expect(findingsFor("G-078", findings)[0]?.level).toBe("error");
    }
    const off = gate(
      withDrawings((content) => {
        content.illustrations = null;
        content.config.features.illustrations = false;
      }),
    );
    expect(findingsFor("G-078", off)).toEqual([]);
  });

  it("G-003 / G-032 / G-033 apply to drawings only while the feature is on", () => {
    const broken = (content: ValidatedContent) => {
      content.illustrations = {
        images: [
          { slot: "hero", image: { ...content.illustrations!.images[0]!.image, file: "chybi.png" } },
          { slot: "office", image: fixture.illustrations!.images[0]!.image },
          { slot: "guidance", image: { ...content.illustrations!.images[0]!.image, rightsConfirmed: false } },
        ],
      };
    };
    const on = gate(withDrawings(broken));
    expect(findingsFor("G-003", on).map((finding) => finding.path)).toEqual(["images.0.image"]);
    expect(findingsFor("G-032", on).map((finding) => finding.path)).toEqual(["images.1.image"]);
    expect(findingsFor("G-033", on).map((finding) => finding.path)).toEqual([
      "images.2.image.rightsConfirmed",
    ]);
    const off = gate(
      withDrawings((content) => {
        broken(content);
        content.config.features.illustrations = false;
      }),
    );
    expect(findingsFor("G-032", off)).toEqual([]);
    expect(findingsFor("G-033", off)).toEqual([]);
    // A referenced file must exist even while the feature is off (like every other image).
    expect(findingsFor("G-003", off)).toHaveLength(1);
  });

  it("drawings are published and emitted only while the feature is on", () => {
    const on = withDrawings();
    expect(collectPublishedImages(on).map((use) => use.image.file)).toContain("kresba-lipa.png");
    expect(collectReferencedMediaFiles(on)).toContain("kresba-lipa.png");
    const off = clone(on);
    off.config.features.illustrations = false;
    expect(collectPublishedImages(off).map((use) => use.image.file)).not.toContain("kresba-lipa.png");
    expect(collectReferencedMediaFiles(off)).not.toContain("kresba-lipa.png");
  });

  it("L-008: the launch check asks for rights evidence of a published drawing", () => {
    const content = withDrawings();
    const findings = checkLedger(
      content,
      { client: "test", createdAt: "2026-11-05", facts: {} },
      Approvals.parse({}),
    );
    expect(
      findings.filter((finding) => finding.rule === "L-008").map((finding) => finding.subject),
    ).toContain("src/assets/media/kresba-lipa.png");
  });
});
