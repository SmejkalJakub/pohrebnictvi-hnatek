import { beforeAll, describe, expect, it } from "vitest";
import { hasErrors, runGate, type Finding, type RuleId } from "../gate/rules.ts";
import { runGateForSite } from "../gate/run.ts";
import type { TemplateManifest } from "../content/config.ts";
import { readSiteSnapshot, validateSnapshot, type ValidatedContent } from "../content/snapshot.ts";
import { clone, FIXTURE_ROOT, loadFixture, makeProductionReady } from "./helpers.ts";

let fixture: ValidatedContent;

beforeAll(async () => {
  fixture = await loadFixture();
});

const NOW = new Date("2026-11-05T12:00:00Z");

function rules(findings: Finding[], level?: Finding["level"]): RuleId[] {
  const filtered = findings.filter((finding) => level === undefined || finding.level === level);
  return [...new Set(filtered.map((finding) => finding.rule))].sort();
}

describe("neutral fixture", () => {
  it("passes in prototype mode with markers only", () => {
    const findings = runGate(fixture, { mode: "prototype", now: NOW });
    expect(hasErrors(findings)).toBe(false);
    expect(rules(findings, "marker")).toEqual(["G-011", "G-020", "G-031", "G-032", "G-040"]);
    expect(rules(findings, "warning")).toEqual(["G-021"]);
  });

  it("fails in production mode with exactly the expected rules", () => {
    const findings = runGate(fixture, { mode: "production", now: NOW });
    expect(rules(findings, "error")).toEqual(["G-011", "G-012", "G-020", "G-021", "G-031", "G-032", "G-040"]);
  });

  it("passes production once every flagged item is resolved", () => {
    const findings = runGate(makeProductionReady(fixture), { mode: "production", now: NOW });
    expect(findings.filter((finding) => finding.level === "error")).toEqual([]);
  });
});

describe("individual rules", () => {
  function productionErrors(
    mutate: (content: ValidatedContent) => void,
    mode: "prototype" | "production" = "production",
  ) {
    const content = makeProductionReady(fixture);
    mutate(content);
    return runGate(content, { mode, now: NOW });
  }

  it("G-002 missing required page", () => {
    const findings = productionErrors((content) => {
      content.pages = content.pages.filter((page) => page.id !== "kontakt");
    });
    expect(rules(findings, "error")).toEqual(["G-002"]);
  });

  it("G-003 image file missing (even in prototype)", () => {
    const findings = productionErrors((content) => {
      content.coffins[0]!.data.image = {
        file: "/src/assets/media/neexistuje.jpg",
        alt: "Popis rakve",
        decorative: false,
        caption: null,
        credit: null,
        source: "client",
        depicts: "actual-business",
        rightsConfirmed: true,
        focus: "center",
      };
    }, "prototype");
    expect(rules(findings, "error")).toEqual(["G-003"]);
  });

  it("G-004 broken references", () => {
    const findings = productionErrors((content) => {
      content.services[0]!.data.priceGroupId = "neexistuje";
      content.officeHours.locationId = "jinde";
    });
    expect(findings.filter((finding) => finding.rule === "G-004")).toHaveLength(2);
  });

  it("G-010 map link and office hours required", () => {
    const findings = productionErrors((content) => {
      content.contact.locations[0]!.mapUrl = null;
      content.officeHours.weekly = [];
    });
    expect(findings.filter((finding) => finding.rule === "G-010")).toHaveLength(2);
  });

  it("G-012 rejects placeholder and test domains", () => {
    for (const siteUrl of ["https://example.invalid", "http://localhost:4321", "https://web.test"]) {
      const findings = productionErrors((content) => {
        content.config.siteUrl = siteUrl;
      });
      expect(rules(findings, "error")).toEqual(["G-012"]);
    }
  });

  it("G-020 a single remaining demo price blocks production; hidden pricing does not", () => {
    const blocked = productionErrors((content) => {
      content.pricing.groups[1]!.items[0]!.status = "demo";
    });
    expect(rules(blocked, "error")).toEqual(["G-020"]);
    const hidden = productionErrors((content) => {
      content.pricing.groups[1]!.items[0]!.status = "demo";
      content.pricing.visible = false;
      content.pricing.validFrom = null;
    });
    expect(hasErrors(hidden)).toBe(false);
  });

  it("G-030 phone in a body is an error in every mode", () => {
    const findings = productionErrors((content) => {
      content.services[0]!.body = "## Kontakt\n\nVolejte 720 283 499.";
    }, "prototype");
    expect(rules(findings, "error")).toEqual(["G-030"]);
  });

  it("G-034 H1 in a body is an error in every mode", () => {
    const findings = productionErrors((content) => {
      content.pages[0]!.body = "# Nadpis";
    }, "prototype");
    expect(rules(findings, "error")).toEqual(["G-034"]);
  });

  it("G-031 ignores unpublished placeholder entries", () => {
    const findings = productionErrors((content) => {
      content.coffins[0]!.data.placeholder = true;
      content.coffins[0]!.data.published = false;
    });
    expect(hasErrors(findings)).toBe(false);
  });

  it("G-033 unconfirmed rights block production but only warn in prototype", () => {
    const mutate = (content: ValidatedContent) => {
      content.flowers[0]!.data.image = {
        file: "placeholder-1x1.png",
        alt: "Věnec z bílých růží",
        decorative: false,
        caption: null,
        credit: null,
        source: "client",
        depicts: "actual-business",
        rightsConfirmed: false,
        focus: "center",
      };
    };
    expect(rules(productionErrors(mutate), "error")).toEqual(["G-033"]);
    expect(rules(productionErrors(mutate, "prototype"), "warning")).toEqual(["G-033"]);
  });

  it("G-041 stale guidance review warns in production only", () => {
    const mutate = (content: ValidatedContent) => {
      content.guidance[0]!.data.review.reviewedAt = "2024-01-01";
    };
    expect(rules(productionErrors(mutate), "warning")).toEqual(["G-041"]);
    expect(rules(productionErrors(mutate, "prototype"))).not.toContain("G-041");
  });

  it("G-042 emergency phone equal to an office phone warns", () => {
    const findings = productionErrors((content) => {
      content.emergency.phone = content.contact.phones[0]!.number;
    });
    expect(rules(findings)).toEqual(["G-042"]);
    expect(hasErrors(findings)).toBe(false);
  });

  it("G-050 / G-051 articles", () => {
    const leftover = productionErrors((content) => {
      content.articlesDirExists = true;
    });
    expect(rules(leftover, "warning")).toEqual(["G-050"]);
    const enabled = productionErrors((content) => {
      content.config.features.articles = true;
    });
    expect(rules(enabled, "error")).toEqual(["G-051"]);
  });

  it("G-060 / G-061 contact form and map embed need the privacy page", () => {
    const findings = productionErrors((content) => {
      content.pages = content.pages.filter((page) => page.id !== "ochrana-osobnich-udaju");
      content.config.features.contactForm = true;
      content.config.features.map = "embed-on-click";
    });
    expect(rules(findings, "error")).toEqual(["G-060", "G-061"]);
  });
});

describe("schema problems surface as G-001", () => {
  it("reports file and field path for invalid JSON content", async () => {
    const raw = await readSiteSnapshot(FIXTURE_ROOT);
    const broken = structuredClone(raw);
    const officeHours = broken.singletons["office-hours"]!;
    (officeHours.data as { weekly: { open: string }[] }).weekly[0]!.open = "7:00";
    const result = validateSnapshot(broken);
    expect(result.content).toBeNull();
    expect(result.problems).toEqual([
      expect.objectContaining({ file: "src/content/site/office-hours.json", path: "weekly.0.open" }),
    ]);
  });

  it("rejects unknown page ids and file names with diacritics", async () => {
    const raw = await readSiteSnapshot(FIXTURE_ROOT);
    const broken = structuredClone(raw);
    const page = broken.entries.find((entry) => entry.collection === "pages")!;
    broken.entries.push({ ...page, id: "galerie", file: "src/content/pages/galerie.md" });
    broken.entries.push({ ...page, id: "Služby", file: "src/content/pages/Služby.md" });
    const problems = validateSnapshot(broken).problems.map((problem) => problem.file);
    expect(problems).toEqual(["src/content/pages/galerie.md", "src/content/pages/Služby.md"]);
  });

  it("keeps the fixture clone independent", () => {
    const copy = clone(fixture);
    copy.company.brandName = "Jiná";
    expect(fixture.company.brandName).toBe("Pohřební služba Vzor");
  });
});

describe("G-005 config against the template manifest", () => {
  const manifest: TemplateManifest = {
    id: "harness",
    name: "Harness",
    version: "0.1.0",
    coreVersion: "^0.1.0",
    supports: { articles: false, multipleLocations: false, contactForm: false, serviceDetailPages: true },
    homepageSections: {
      available: ["hero", "next-steps", "services", "contact-summary", "family-story"],
      default: ["hero", "next-steps", "services", "contact-summary", "family-story"],
      constraints: { first: "hero", required: ["hero", "contact-summary"] },
    },
    options: {},
    imageSlots: {},
    pageFields: {},
  };

  it("passes when the fixture config fits the manifest", async () => {
    const run = await runGateForSite(FIXTURE_ROOT, { mode: "prototype", now: NOW, manifest });
    expect(rules(run.findings)).not.toContain("G-005");
  });

  it("fails when the config uses an undeclared section or names another template", async () => {
    const narrow = {
      ...manifest,
      id: "other",
      homepageSections: { ...manifest.homepageSections, available: ["hero", "contact-summary"] as const },
    };
    const run = await runGateForSite(FIXTURE_ROOT, { mode: "prototype", now: NOW, manifest: narrow });
    expect(run.findings.filter((finding) => finding.rule === "G-005").map((finding) => finding.path)).toEqual(
      expect.arrayContaining(["template", "homepage.sections"]),
    );
  });
});
