/**
 * Landscape photo set (content-contract §6.18): site/landscapes.json, features.landscapes,
 * supports.landscapes, the image rules that apply to it (G-003, G-032, G-033, L-008) and G-077.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { SiteConfig, checkConfigAgainstManifest, type TemplateManifest } from "../content/config.ts";
import { LandscapeSet, MAX_LANDSCAPE_IMAGES, type ImageRef } from "../content/schemas.ts";
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
const LANDSCAPES = "src/content/site/landscapes.json";

const REAL_PHOTO: ImageRef = {
  file: "placeholder-32x11.png",
  alt: "Pole a les nad obcí za ranního světla",
  decorative: false,
  caption: null,
  credit: "Fotograf (test)",
  source: "client",
  depicts: "generic",
  rightsConfirmed: true,
  focus: "center",
};

function rules(findings: Finding[], level?: Finding["level"]): RuleId[] {
  const filtered = findings.filter((finding) => level === undefined || finding.level === level);
  return [...new Set(filtered.map((finding) => finding.rule))].sort();
}

function landscapeFindings(findings: Finding[]): Finding[] {
  return findings.filter((finding) => finding.file === LANDSCAPES);
}

/** Production-ready fixture with the landscape feature switched on or off. */
function withLandscapes(on: boolean, mutate: (content: ValidatedContent) => void = () => {}): ValidatedContent {
  const content = makeProductionReady(fixture);
  content.config.features.landscapes = on;
  mutate(content);
  return content;
}

function gate(content: ValidatedContent, mode: "prototype" | "production" = "production"): Finding[] {
  return runGate(content, { mode, now: NOW, buildDate: PRODUCTION_BUILD_DATE });
}

describe("LandscapeSet schema", () => {
  it("defaults to an empty list", () => {
    expect(LandscapeSet.parse({})).toEqual({ images: [] });
  });

  it("parses the fixture's three placeholder entries", () => {
    expect(fixture.landscapes).not.toBeNull();
    expect(fixture.landscapes?.images.map((entry) => entry.place)).toEqual([
      "Zástupné místo 1",
      "Zástupné místo 2",
      "Zástupné místo 3",
    ]);
    expect(fixture.landscapes?.images[1]?.image.caption).toBe("Zástupný popisek");
  });

  it("rejects stock photos with a Czech message", () => {
    const result = LandscapeSet.safeParse({
      images: [{ image: { ...REAL_PHOTO, source: "licensed-stock" }, place: "Někde" }],
    });
    expect(result.success).toBe(false);
    const issue = result.error?.issues[0];
    expect(issue?.path).toEqual(["images", 0, "image", "source"]);
    expect(issue?.message).toContain("ne z fotobanky");
  });

  it("needs a place and a valid image (alt or decorative)", () => {
    expect(LandscapeSet.safeParse({ images: [{ image: REAL_PHOTO }] }).success).toBe(false);
    const noAlt = LandscapeSet.safeParse({ images: [{ image: { ...REAL_PHOTO, alt: "" }, place: "Někde" }] });
    expect(noAlt.success).toBe(false);
    const decorative = LandscapeSet.safeParse({
      images: [{ image: { ...REAL_PHOTO, alt: "", decorative: true }, place: "Někde" }],
    });
    expect(decorative.success).toBe(true);
  });

  it(`allows at most ${MAX_LANDSCAPE_IMAGES} photos`, () => {
    const entry = { image: REAL_PHOTO, place: "Někde" };
    expect(LandscapeSet.safeParse({ images: Array(MAX_LANDSCAPE_IMAGES).fill(entry) }).success).toBe(true);
    expect(LandscapeSet.safeParse({ images: Array(MAX_LANDSCAPE_IMAGES + 1).fill(entry) }).success).toBe(false);
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

  function config(landscapes: boolean) {
    return SiteConfig.parse({
      template: "harness",
      siteUrl: "https://example.invalid",
      features: { landscapes },
      homepage: { sections: ["hero", "contact-summary"] },
    });
  }

  it("is off by default", () => {
    expect(SiteConfig.parse({ ...config(false), features: {} }).features.landscapes).toBe(false);
  });

  it("G-005 rejects landscapes on a template that does not support them", () => {
    expect(checkConfigAgainstManifest(config(true), manifest).map((issue) => issue.path)).toEqual([
      "features.landscapes",
    ]);
    expect(checkConfigAgainstManifest(config(false), manifest)).toEqual([]);
  });

  it("is accepted by a supporting template", () => {
    const supporting = { ...manifest, supports: { ...manifest.supports, landscapes: true } };
    expect(checkConfigAgainstManifest(config(true), supporting)).toEqual([]);
  });
});

describe("gate", () => {
  it("G-077: the feature on without site/landscapes.json is an error in every mode", () => {
    for (const mode of ["prototype", "production"] as const) {
      const findings = gate(
        withLandscapes(true, (content) => {
          content.landscapes = null;
        }),
        mode,
      );
      expect(rules(findings, "error")).toEqual(["G-077"]);
    }
  });

  it("G-077 is silent with the file present, or with the feature off", () => {
    const real = (content: ValidatedContent): void => {
      content.landscapes = { images: [{ image: REAL_PHOTO, place: "Nad obcí" }] };
    };
    expect(gate(withLandscapes(true, real))).toEqual([]);
    expect(
      gate(
        withLandscapes(false, (content) => {
          content.landscapes = null;
        }),
      ),
    ).toEqual([]);
  });

  it("placeholder landscapes: marker in prototype, G-032 error in production, only while on", () => {
    const production = landscapeFindings(gate(withLandscapes(true)));
    expect(production.map((finding) => [finding.rule, finding.level, finding.path])).toEqual([
      ["G-032", "error", "images.0.image"],
      ["G-032", "error", "images.1.image"],
      ["G-032", "error", "images.2.image"],
    ]);
    const prototype = landscapeFindings(gate(withLandscapes(true), "prototype"));
    expect(rules(prototype)).toEqual(["G-032"]);
    expect(prototype.every((finding) => finding.level === "marker")).toBe(true);
    expect(landscapeFindings(gate(withLandscapes(false)))).toEqual([]);
  });

  it("G-033: a client photo without confirmed rights", () => {
    const findings = gate(
      withLandscapes(true, (content) => {
        content.landscapes = { images: [{ image: { ...REAL_PHOTO, rightsConfirmed: false }, place: "Nad obcí" }] };
      }),
    );
    expect(landscapeFindings(findings).map((finding) => [finding.rule, finding.path])).toEqual([
      ["G-033", "images.0.image.rightsConfirmed"],
    ]);
  });

  it("G-003: a missing file is reported even while the feature is off", () => {
    const findings = gate(
      withLandscapes(false, (content) => {
        content.landscapes = { images: [{ image: { ...REAL_PHOTO, file: "neexistuje.jpg" }, place: "Nad obcí" }] };
      }),
    );
    expect(landscapeFindings(findings).map((finding) => finding.rule)).toEqual(["G-003"]);
  });

  it("published images and imported media include landscapes only while the feature is on", () => {
    const on = withLandscapes(true);
    const off = withLandscapes(false);
    expect(collectPublishedImages(on).filter((use) => use.file === LANDSCAPES)).toHaveLength(3);
    expect(collectPublishedImages(off).filter((use) => use.file === LANDSCAPES)).toHaveLength(0);
    expect(collectReferencedMediaFiles(on)).toContain("placeholder-32x11.png");
    expect(collectReferencedMediaFiles(off)).not.toContain("placeholder-32x11.png");
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

  it("L-008 asks for rights evidence of a published landscape photo, not of a switched-off one", () => {
    const photo = { ...REAL_PHOTO, file: "krajina-nad-obci.jpg" };
    const on = withLandscapes(true, (content) => {
      content.landscapes = { images: [{ image: photo, place: "Nad obcí" }] };
    });
    const off = clone(on);
    off.config.features.landscapes = false;
    const subjects = (content: ValidatedContent): string[] =>
      checkLedger(content, ledger(content), Approvals.parse({}))
        .filter((finding) => finding.rule === "L-008")
        .map((finding) => finding.subject);
    expect(subjects(on)).toEqual(["src/assets/media/krajina-nad-obci.jpg"]);
    expect(subjects(off)).toEqual([]);
  });
});
