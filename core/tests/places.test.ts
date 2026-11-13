/**
 * Naše místa (content-contract §6.19): site/places.json, features.places, supports.places, the
 * image rules that apply to place photos (G-003, G-032, G-033, L-008) and G-080.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { SiteConfig, checkConfigAgainstManifest, type TemplateManifest } from "../content/config.ts";
import { MAX_PLACES, PlaceSet, type ImageRef } from "../content/schemas.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { checkLedger, collectTrackedFacts, Approvals, type Ledger } from "../gate/launch-check.ts";
import {
  collectPublishedImages,
  collectReferencedMediaFiles,
  runGate,
  type Finding,
  type RuleId,
} from "../gate/rules.ts";
import { clone, loadFixture, makeProductionReady, PRODUCTION_BUILD_DATE } from "./helpers.ts";

let fixture: ValidatedContent;

beforeAll(async () => {
  fixture = await loadFixture();
});

const NOW = new Date("2026-11-05T12:00:00Z");
const PLACES = "src/content/site/places.json";

const REAL_PHOTO: ImageRef = {
  file: "placeholder-3x2.png",
  alt: "Kancelář pohřební služby s vchodem z náměstí",
  decorative: false,
  caption: null,
  credit: "Fotograf (test)",
  source: "client",
  depicts: "actual-business",
  rightsConfirmed: true,
  focus: "center",
};

function rules(findings: Finding[], level?: Finding["level"]): RuleId[] {
  const filtered = findings.filter((finding) => level === undefined || finding.level === level);
  return [...new Set(filtered.map((finding) => finding.rule))].sort();
}

function placeFindings(findings: Finding[]): Finding[] {
  return findings.filter((finding) => finding.file === PLACES);
}

/** Production-ready fixture with the places feature switched on or off. */
function withPlaces(on: boolean, mutate: (content: ValidatedContent) => void = () => {}): ValidatedContent {
  const content = makeProductionReady(fixture);
  content.config.features.places = on;
  mutate(content);
  return content;
}

function gate(content: ValidatedContent, mode: "prototype" | "production" = "production"): Finding[] {
  return runGate(content, { mode, now: NOW, buildDate: PRODUCTION_BUILD_DATE });
}

describe("PlaceSet schema", () => {
  it("defaults to an empty list", () => {
    expect(PlaceSet.parse({})).toEqual({ places: [] });
  });

  it("parses the fixture's six placeholder places, two of them without a photo", () => {
    expect(fixture.places).not.toBeNull();
    expect(fixture.places?.places.map((place) => place.name)).toEqual([
      "Zástupné místo 1",
      "Zástupné místo 2",
      "Zástupné místo 3",
      "Zástupné místo 4",
      "Zástupné místo 5",
      "Zástupné místo 6",
    ]);
    expect(fixture.places?.places.map((place) => place.image === null)).toEqual([
      false,
      false,
      false,
      true,
      false,
      true,
    ]);
  });

  it("needs only a name: address, note and image are optional", () => {
    expect(PlaceSet.parse({ places: [{ name: "Kancelář" }] }).places[0]).toEqual({
      name: "Kancelář",
      address: null,
      note: null,
      image: null,
    });
    expect(PlaceSet.safeParse({ places: [{ address: "Náměstí 12" }] }).success).toBe(false);
  });

  it("rejects stock and generic photos with a Czech message", () => {
    const cases = [
      { image: { ...REAL_PHOTO, source: "licensed-stock" as const }, key: "source" },
      { image: { ...REAL_PHOTO, depicts: "generic" as const }, key: "depicts" },
    ];
    for (const { image, key } of cases) {
      const result = PlaceSet.safeParse({ places: [{ name: "Síň", image }] });
      expect(result.success).toBe(false);
      const issue = result.error?.issues.find((candidate) => candidate.message.includes("fotobanky"));
      expect(issue?.path).toEqual(["places", 0, "image", key]);
    }
  });

  it(`allows at most ${MAX_PLACES} places`, () => {
    const place = { name: "Místo" };
    expect(PlaceSet.safeParse({ places: Array(MAX_PLACES).fill(place) }).success).toBe(true);
    expect(PlaceSet.safeParse({ places: Array(MAX_PLACES + 1).fill(place) }).success).toBe(false);
  });
});

describe("feature switch and supports flag", () => {
  const manifest: TemplateManifest = {
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
    },
    homepageSections: {
      available: ["hero", "contact-summary"],
      default: ["hero", "contact-summary"],
      constraints: { required: [] },
    },
    options: {},
    imageSlots: {},
    pageFields: {},
  };

  function config(places: boolean) {
    return SiteConfig.parse({
      template: "harness",
      siteUrl: "https://example.invalid",
      features: { places },
      homepage: { sections: ["hero", "contact-summary"] },
    });
  }

  it("is off by default", () => {
    expect(SiteConfig.parse({ ...config(false), features: {} }).features.places).toBe(false);
  });

  it("G-005 rejects places on a template that does not support them", () => {
    expect(checkConfigAgainstManifest(config(true), manifest).map((issue) => issue.path)).toEqual([
      "features.places",
    ]);
    expect(checkConfigAgainstManifest(config(false), manifest)).toEqual([]);
  });

  it("is accepted by a supporting template", () => {
    const supporting = { ...manifest, supports: { ...manifest.supports, places: true } };
    expect(checkConfigAgainstManifest(config(true), supporting)).toEqual([]);
  });
});

describe("gate", () => {
  it("G-080: the feature on without site/places.json is an error in every mode", () => {
    for (const mode of ["prototype", "production"] as const) {
      const findings = gate(
        withPlaces(true, (content) => {
          content.places = null;
        }),
        mode,
      );
      expect(rules(findings, "error")).toEqual(["G-080"]);
    }
  });

  it("G-080 is silent with the file present (even without photos), or with the feature off", () => {
    const real = (content: ValidatedContent): void => {
      content.places = { places: [{ name: "Kancelář", address: null, note: null, image: REAL_PHOTO }] };
    };
    expect(gate(withPlaces(true, real))).toEqual([]);
    const textOnly = (content: ValidatedContent): void => {
      content.places = { places: [{ name: "Vůz", address: null, note: null, image: null }] };
    };
    expect(gate(withPlaces(true, textOnly))).toEqual([]);
    expect(
      gate(
        withPlaces(false, (content) => {
          content.places = null;
        }),
      ),
    ).toEqual([]);
  });

  it("placeholder place photos: marker in prototype, G-032 error in production, only while on", () => {
    const production = placeFindings(gate(withPlaces(true)));
    expect(production.map((finding) => [finding.rule, finding.level, finding.path])).toEqual([
      ["G-032", "error", "places.0.image"],
      ["G-032", "error", "places.1.image"],
      ["G-032", "error", "places.2.image"],
      ["G-032", "error", "places.4.image"],
    ]);
    const prototype = placeFindings(gate(withPlaces(true), "prototype"));
    expect(rules(prototype)).toEqual(["G-032"]);
    expect(prototype.every((finding) => finding.level === "marker")).toBe(true);
    expect(placeFindings(gate(withPlaces(false)))).toEqual([]);
  });

  it("G-033: a client photo without confirmed rights", () => {
    const findings = gate(
      withPlaces(true, (content) => {
        content.places = {
          places: [{ name: "Síň", address: null, note: null, image: { ...REAL_PHOTO, rightsConfirmed: false } }],
        };
      }),
    );
    expect(placeFindings(findings).map((finding) => [finding.rule, finding.path])).toEqual([
      ["G-033", "places.0.image.rightsConfirmed"],
    ]);
  });

  it("G-003: a missing file is reported even while the feature is off", () => {
    const findings = gate(
      withPlaces(false, (content) => {
        content.places = {
          places: [{ name: "Síň", address: null, note: null, image: { ...REAL_PHOTO, file: "neexistuje.jpg" } }],
        };
      }),
    );
    expect(placeFindings(findings).map((finding) => finding.rule)).toEqual(["G-003"]);
  });

  it("published images and imported media include place photos only while the feature is on", () => {
    const on = withPlaces(true);
    const off = withPlaces(false);
    expect(collectPublishedImages(on).filter((use) => use.file === PLACES)).toHaveLength(4);
    expect(collectPublishedImages(off).filter((use) => use.file === PLACES)).toHaveLength(0);
    expect(collectReferencedMediaFiles(on)).toContain("placeholder-3x2.png");
  });
});

describe("launch check", () => {
  function ledger(content: ValidatedContent): Ledger {
    const facts: Ledger["facts"] = {};
    for (const fact of collectTrackedFacts(content)) {
      facts[fact.key] = {
        value: fact.value,
        status: "VERIFIED",
        source: "test",
        retrievedAt: null,
        verifiedBy: "Operátor",
        verifiedAt: "2026-11-05",
        note: null,
      };
    }
    return { client: "test", createdAt: "2026-11-05", facts };
  }

  it("L-008 asks for rights evidence of a published place photo, not of a switched-off one", () => {
    const photo = { ...REAL_PHOTO, file: "kancelar-na-namesti.jpg" };
    const on = withPlaces(true, (content) => {
      content.places = { places: [{ name: "Kancelář", address: null, note: null, image: photo }] };
    });
    const off = clone(on);
    off.config.features.places = false;
    const subjects = (content: ValidatedContent): string[] =>
      checkLedger(content, ledger(content), Approvals.parse({}))
        .filter((finding) => finding.rule === "L-008")
        .map((finding) => finding.subject);
    expect(subjects(on)).toEqual(["src/assets/media/kancelar-na-namesti.jpg"]);
    expect(subjects(off)).toEqual([]);
  });
});
