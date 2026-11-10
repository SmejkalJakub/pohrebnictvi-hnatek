/**
 * Optional content types of research funeral-ux.md §8: notices, people, FAQ, documents, legal
 * information, the feature switches and their gate rules (G-070 … G-076, G-002, G-005).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { resolveBuildDate, pragueDate } from "../content/build-date.ts";
import { SiteConfig, checkConfigAgainstManifest, type TemplateManifest } from "../content/config.ts";
import {
  buildDocumentView,
  buildLegalLink,
  buildNoticeIndex,
  buildNoticeView,
  buildPersonView,
  groupFaq,
  personInitials,
  sortDocuments,
} from "../content/optional-views.ts";
import {
  DEFAULT_ADR_NAME,
  DEFAULT_ADR_URL,
  LegalInfo,
  Notice,
  Person,
  PriceGroup,
} from "../content/schemas.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { czechWeekday, formatCzechDate, formatYearOrDate } from "../format/date.ts";
import {
  collectPublishedDocuments,
  markdownLinkTargets,
  runGate,
  type Finding,
  type RuleId,
} from "../gate/rules.ts";
import { isPageEnabled, noticeState } from "../gate/visibility.ts";
import { encodeQr, qrSvg } from "../qr/qr-code.ts";
import { clone, loadFixture, makeProductionReady, PRODUCTION_BUILD_DATE } from "./helpers.ts";

let fixture: ValidatedContent;

beforeAll(async () => {
  fixture = await loadFixture();
});

const NOW = new Date("2026-11-05T12:00:00Z");

/** Czech dates use non-breaking spaces so they never wrap. */
function nb(text: string): string {
  return text.replace(/ /g, "\u00a0");
}

function rules(findings: Finding[], level?: Finding["level"]): RuleId[] {
  const filtered = findings.filter((finding) => level === undefined || finding.level === level);
  return [...new Set(filtered.map((finding) => finding.rule))].sort();
}

function production(
  mutate: (content: ValidatedContent) => void,
  mode: "prototype" | "production" = "production",
) {
  const content = makeProductionReady(fixture);
  mutate(content);
  return runGate(content, { mode, now: NOW, buildDate: PRODUCTION_BUILD_DATE });
}

const BASE_NOTICE = {
  fullName: "Jan Vzorový",
  died: "2026-11-02",
  publishUntil: "2026-12-31",
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

describe("Notice schema", () => {
  it("accepts a year or a date, and defaults to noindex, listed and no consent", () => {
    const notice = Notice.parse({ ...BASE_NOTICE, born: 1941 });
    expect(notice.born).toBe("1941");
    expect(notice.noindex).toBe(true);
    expect(notice.listed).toBe(true);
    expect(notice.consent).toBeNull();
    expect(notice.ceremony).toBeNull();
  });

  it("has no promotional fields: unknown keys such as prices or services fail with a Czech message", () => {
    const result = Notice.safeParse({ ...BASE_NOTICE, priceGroupId: "pohreb", featured: true });
    expect(result.success).toBe(false);
    const message = result.error?.issues[0]?.message ?? "";
    expect(message).toContain("priceGroupId");
    expect(message).toContain("žádné ceny, služby ani propagaci");
  });

  it("requires date, time and place for a civil or church ceremony, not for one without ceremony", () => {
    const civil = Notice.safeParse({ ...BASE_NOTICE, ceremony: { type: "civil" } });
    expect(civil.success).toBe(false);
    expect(civil.error?.issues.map((issue) => issue.path.join("."))).toEqual(
      expect.arrayContaining(["ceremony.date", "ceremony.time", "ceremony.placeName"]),
    );
    expect(Notice.safeParse({ ...BASE_NOTICE, ceremony: { type: "without-ceremony" } }).success).toBe(true);
    // A CMS-emptied ceremony object counts as no ceremony.
    expect(Notice.parse({ ...BASE_NOTICE, ceremony: {} }).ceremony).toBeNull();
  });

  it("allows only an https livestream link", () => {
    expect(Notice.safeParse({ ...BASE_NOTICE, livestreamUrl: "http://prenos.example/x" }).success).toBe(
      false,
    );
    expect(Notice.safeParse({ ...BASE_NOTICE, livestreamUrl: "https://prenos.example/x" }).success).toBe(
      true,
    );
  });

  it("checks the order of dates and the consent basis", () => {
    expect(Notice.safeParse({ ...BASE_NOTICE, born: "2027" }).success).toBe(false);
    expect(Notice.safeParse({ ...BASE_NOTICE, publishFrom: "2027-01-01" }).success).toBe(false);
    const consent = { orderedBy: "Marie Vzorová", date: "2026-11-03", basis: "jinak" };
    expect(Notice.safeParse({ ...BASE_NOTICE, consent }).success).toBe(false);
    const valid = Notice.parse({ ...BASE_NOTICE, consent: { ...consent, basis: "objednavka" } });
    expect(valid.consent?.basis).toBe("objednavka");
  });

  it("accepts a parte PDF only", () => {
    expect(Notice.safeParse({ ...BASE_NOTICE, partePdf: "parte.jpg" }).success).toBe(false);
    expect(Notice.parse({ ...BASE_NOTICE, partePdf: "src/assets/documents/parte.pdf" }).partePdf).toBe(
      "src/assets/documents/parte.pdf",
    );
  });
});

describe("other optional schemas", () => {
  it("Person: phone in E.164 or none", () => {
    expect(Person.safeParse({ name: "Eva", role: "Kancelář", phone: "777 123 456" }).success).toBe(false);
    expect(Person.parse({ name: "Eva", role: "Kancelář", phone: "" }).phone).toBeNull();
  });

  it("LegalInfo defaults the ADR body to ČOI, also when the CMS empties the fields", () => {
    expect(LegalInfo.parse({}).adr).toEqual({ name: DEFAULT_ADR_NAME, url: DEFAULT_ADR_URL });
    expect(LegalInfo.parse({ adr: { name: "", url: "" } }).adr.url).toBe("https://adr.coi.cz");
  });

  it("PriceGroup includes / excludes default to empty lists", () => {
    const group = PriceGroup.parse({
      id: "pohreb",
      title: "Pohřeb",
      items: [{ id: "a", label: "A", kind: "on-request", amount: null, amountMax: null, status: "demo" }],
    });
    expect(group.includes).toEqual([]);
    expect(group.excludes).toEqual([]);
  });

  it("site config: optional features default to off, and a pinned date must be YYYY-MM-DD", () => {
    const base = {
      template: "x",
      siteUrl: "https://example.invalid",
      features: {},
      homepage: { sections: ["hero"] },
    };
    const config = SiteConfig.parse(base);
    expect(config.features.notices).toBe(false);
    expect(config.pinnedBuildDate).toBeNull();
    expect(SiteConfig.safeParse({ ...base, pinnedBuildDate: "10. 11. 2026" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Manifest (G-005) and visibility
// ---------------------------------------------------------------------------

describe("feature switches", () => {
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
      people: true,
      faq: false,
      documents: false,
      guestInfo: false,
      prePlanning: false,
      priceInclusions: false,
    },
    homepageSections: {
      available: ["hero", "next-steps", "services", "contact-summary", "family-story"],
      default: ["hero", "contact-summary"],
      constraints: { required: [] },
    },
    options: {},
    imageSlots: {},
    pageFields: {},
  };

  it("G-005 rejects every feature the template does not support", () => {
    const paths = checkConfigAgainstManifest(fixture.config, manifest).map((issue) => issue.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        "features.notices",
        "features.faq",
        "features.documents",
        "features.guestInfo",
        "features.prePlanning",
      ]),
    );
    expect(paths).not.toContain("features.people");
  });

  it("feature pages exist only while their feature is on; legal information always", () => {
    const off = clone(fixture);
    off.config.features.notices = false;
    expect(isPageEnabled("oznameni", fixture)).toBe(true);
    expect(isPageEnabled("oznameni", off)).toBe(false);
    expect(isPageEnabled("pravni-informace", off)).toBe(true);
  });

  it("G-002: a switched-on feature needs its page file", () => {
    const findings = production((content) => {
      content.pages = content.pages.filter((page) => page.id !== "pro-ucastniky");
    });
    expect(findings.filter((finding) => finding.rule === "G-002").map((finding) => finding.file)).toEqual([
      "src/content/pages/pro-ucastniky.md",
    ]);
  });

  it("content of a switched-off feature is never checked for placeholders or consent", () => {
    const content = clone(fixture);
    for (const feature of ["notices", "people", "faq", "documents", "guestInfo", "prePlanning"] as const) {
      content.config.features[feature] = false;
    }
    const findings = runGate(content, { mode: "prototype", now: NOW });
    const files = findings.map((finding) => finding.file);
    const optional =
      /content\/(notices|people|faq|documents)\/|pages\/(oznameni|pro-ucastniky|pohreb-predem)\.md/;
    expect(files.filter((file) => optional.test(file))).toEqual([]);
    expect(rules(findings)).not.toContain("G-074");
  });
});

describe("notice publication window", () => {
  const visibility = () => ({ config: fixture.config, pricing: fixture.pricing });

  it("is live from publishFrom to publishUntil inclusive", () => {
    const notice = { published: true, publishFrom: "2026-11-03", publishUntil: "2026-11-30" };
    expect(noticeState(notice, visibility(), "2026-11-02")).toBe("scheduled");
    expect(noticeState(notice, visibility(), "2026-11-03")).toBe("live");
    expect(noticeState(notice, visibility(), "2026-11-30")).toBe("live");
    expect(noticeState(notice, visibility(), "2026-12-01")).toBe("expired");
    expect(noticeState({ ...notice, published: false }, visibility(), "2026-11-10")).toBe("draft");
  });

  it("uses SITE_BUILD_DATE, then the pinned config date, then today in Prague", () => {
    expect(resolveBuildDate({ env: "2026-01-02", pinned: "2026-11-10" })).toEqual({
      date: "2026-01-02",
      source: "env",
    });
    expect(resolveBuildDate({ env: "", pinned: "2026-11-10" }).date).toBe("2026-11-10");
    expect(resolveBuildDate({ now: new Date("2026-11-09T23:30:00Z") }).date).toBe("2026-11-10");
    expect(pragueDate(new Date("2026-07-01T21:59:00Z"))).toBe("2026-07-01");
    expect(() => resolveBuildDate({ env: "10.11.2026" })).toThrow(/SITE_BUILD_DATE/);
  });
});

// ---------------------------------------------------------------------------
// Gate rules G-070 … G-076
// ---------------------------------------------------------------------------

describe("gate rules for optional content", () => {
  it("G-070 a published notice without consent fails in every mode; a draft does not", () => {
    for (const mode of ["prototype", "production"] as const) {
      const findings = production((content) => {
        content.notices[0]!.data.consent = null;
      }, mode);
      expect(rules(findings, "error")).toEqual(["G-070"]);
    }
    const draft = production((content) => {
      content.notices[0]!.data.consent = null;
      content.notices[0]!.data.published = false;
    });
    expect(rules(draft)).not.toContain("G-070");
  });

  it("G-071 an expired notice is reported and not built (no PDF, no images)", () => {
    const content = clone(fixture);
    const findings = runGate(content, { mode: "prototype", now: NOW, buildDate: "2026-11-10" });
    const expired = findings.filter((finding) => finding.rule === "G-071");
    expect(expired.map((finding) => finding.file)).toEqual(["src/content/notices/anna-drivejsi.md"]);
    expect(expired[0]?.level).toBe("warning");
    const later = collectPublishedDocuments(content, "2026-12-01").map((document) => document.href);
    expect(later).not.toContain("/oznameni/marie-ukazkova/parte-marie-ukazkova.pdf");
    const now = collectPublishedDocuments(content, "2026-11-10").map((document) => document.href);
    expect(now).toContain("/oznameni/marie-ukazkova/parte-marie-ukazkova.pdf");
    expect(now).toContain("/dokumenty/reklamacni-rad.pdf");
  });

  it("G-072 a notice body must not link to services, prices or other sites", () => {
    const findings = production((content) => {
      content.notices[0]!.body =
        "Rozloučení zajistí [naše služby](/sluzby/kremace/). Více na <https://jinde.example>.";
    });
    expect(findings.filter((finding) => finding.rule === "G-072")).toHaveLength(2);
    expect(rules(findings, "error")).toEqual(["G-072"]);
    const allowed = production((content) => {
      content.notices[0]!.body = "Informace pro hosty najdete na stránce [Pro účastníky](/pro-ucastniky/).";
    });
    expect(rules(allowed)).not.toContain("G-072");
    expect(markdownLinkTargets("[a](/cenik/) a https://x.example/y")).toEqual([
      "/cenik/",
      "https://x.example/y",
    ]);
  });

  it("G-073 a pinned build date is fine in prototype and an error in production", () => {
    const pinned = (mode: "prototype" | "production") =>
      production((content) => {
        content.config.pinnedBuildDate = "2026-11-05";
      }, mode);
    expect(rules(pinned("production"), "error")).toEqual(["G-073"]);
    expect(rules(pinned("prototype"))).not.toContain("G-073");
  });

  it("G-074 a published person needs a recorded consent: warning in prototype, error in production", () => {
    const missing = (mode: "prototype" | "production") =>
      production((content) => {
        delete content.peopleConsents["people/eva-vzorova.md"];
      }, mode);
    expect(rules(missing("production"), "error")).toEqual(["G-074"]);
    expect(rules(missing("prototype"), "warning")).toEqual(["G-074"]);
    const unpublished = production((content) => {
      delete content.peopleConsents["people/eva-vzorova.md"];
      content.people.find((person) => person.id === "eva-vzorova")!.data.published = false;
    });
    expect(rules(unpublished)).not.toContain("G-074");
  });

  it("G-075 a referenced PDF must exist, even on a draft", () => {
    const findings = production((content) => {
      content.documents[0]!.data.file = "src/assets/documents/neexistuje.pdf";
      content.documents[0]!.data.published = false;
    }, "prototype");
    expect(rules(findings, "error")).toEqual(["G-075"]);
  });

  it("G-076 legal information without its page warns", () => {
    const findings = production((content) => {
      content.pages = content.pages.filter((page) => page.id !== "pravni-informace");
    });
    expect(rules(findings, "warning")).toEqual(["G-076"]);
  });

  it("G-031 / G-032 apply to live notices and published people", () => {
    const findings = production((content) => {
      content.notices[0]!.data.placeholder = true;
      content.people[0]!.data.photo = fixture.people.find((person) => person.data.photo !== null)!.data.photo;
    });
    expect(rules(findings, "error")).toEqual(["G-031", "G-032"]);
  });
});

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

describe("notice view model", () => {
  const context = {
    siteUrl: "https://www.vzor.example/",
    buildDate: "2026-11-10",
    officeEmail: "kancelar@example.invalid",
  };

  function views() {
    return fixture.notices.map((entry) => buildNoticeView(entry, context));
  }

  it("exposes only the practical facts of the notice: no consent, window, price or service", () => {
    const view = views().find((item) => item.id === "jan-vzorovy")!;
    expect(Object.keys(view).sort()).toEqual(
      [
        "bornText",
        "born",
        "ceremony",
        "condolencesEmail",
        "died",
        "diedText",
        "familyNote",
        "fullName",
        "href",
        "id",
        "listed",
        "livestreamUrl",
        "noindex",
        "parteImage",
        "partePdfHref",
        "photo",
        "placeholder",
        "qr",
        "upcoming",
      ].sort(),
    );
    const serialised = JSON.stringify(view);
    for (const forbidden of [
      "consent",
      "orderedBy",
      "publishUntil",
      "publishFrom",
      "price",
      "/sluzby/",
      "/cenik/",
    ]) {
      expect(serialised).not.toContain(forbidden);
    }
  });

  it("formats life dates and the ceremony in Czech", () => {
    const view = views().find((item) => item.id === "jan-vzorovy")!;
    expect(view.bornText).toBe(nb("3. 4. 1941"));
    expect(view.diedText).toBe(nb("2. 11. 2026"));
    expect(view.ceremony).toMatchObject({
      typeLabel: "Občanský obřad",
      dateText: nb("14. 11. 2026"),
      weekday: "sobota",
      timeText: "10:00",
      placeName: "Smuteční síň Vzorov",
    });
    expect(view.upcoming).toBe(true);
    expect(view.href).toBe("/oznameni/jan-vzorovy/");
    expect(view.condolencesEmail).toBe("kancelar@example.invalid");
    expect(view.qr.target).toBe("https://www.vzor.example/oznameni/jan-vzorovy/");
    expect(view.qr.href).toBe("/oznameni/jan-vzorovy/qr.svg");
    expect(view.qr.svg).toMatch(/^<svg [^>]*viewBox="0 0 \d+ \d+"[^>]*role="img"><title>QR kód/);
    expect(view.qr.svg).not.toMatch(/class=|style=/);
  });

  it("offers condolences only when the family agreed", () => {
    const view = views().find((item) => item.id === "marie-ukazkova")!;
    expect(view.condolencesEmail).toBeNull();
    expect(view.partePdfHref).toBe("/oznameni/marie-ukazkova/parte-marie-ukazkova.pdf");
  });

  it("lists upcoming ceremonies first (soonest first), then recent notices, and hides unlisted ones", () => {
    const all = views();
    const index = buildNoticeIndex(all);
    expect(index.upcoming.map((view) => view.id)).toEqual(["jan-vzorovy"]);
    expect(index.recent.map((view) => view.id)).toEqual([
      "karel-rozpracovany",
      "josef-prikladny",
      "marie-ukazkova",
      "anna-drivejsi",
    ]);
    const unlisted = all.map((view) => ({ ...view, listed: view.id !== "josef-prikladny" }));
    expect(buildNoticeIndex(unlisted).recent.map((view) => view.id)).not.toContain("josef-prikladny");
  });
});

describe("people, FAQ, documents and legal view models", () => {
  it("people: initials without academic titles, formatted phone", () => {
    expect(personInitials("Mgr. Hana Příkladná")).toBe("HP");
    expect(personInitials("Ing. arch. Eva Vzorová Nováková")).toBe("EN");
    expect(personInitials("Šimon")).toBe("Š");
    const view = buildPersonView(fixture.people.find((person) => person.id === "eva-vzorova")!);
    expect(view.phone?.href).toBe("tel:+420000000201");
    expect(view.initials).toBe("EV");
  });

  it("FAQ: grouped by topic in a fixed order, unpublished left out", () => {
    const entries = clone(fixture).faq;
    entries.find((entry) => entry.id === "jak-se-plati")!.data.published = false;
    const groups = groupFaq(entries);
    expect(groups.map((group) => group.topic)).toEqual([
      "arrangements",
      "ceremony",
      "cremation-urn",
      "documents",
    ]);
    expect(groups[0]?.label).toBe("Sjednání pohřbu");
    expect(groups[0]?.entries.map((entry) => entry.id)).toEqual([
      "kdo-muze-vypravit-pohreb",
      "co-kdyz-se-nikdo-neprihlasi",
    ]);
  });

  it("documents: by kind, with /dokumenty/ links and Czech validity dates", () => {
    const views = sortDocuments(fixture.documents).map(buildDocumentView);
    expect(views.map((view) => view.kind)).toEqual([
      "rad-pohrebni-sluzby",
      "obchodni-podminky",
      "reklamacni-rad",
    ]);
    expect(views[0]).toMatchObject({
      href: "/dokumenty/rad-pohrebni-sluzby.pdf",
      kindLabel: "Řád pohřební služby",
      validFromText: nb("1. 1. 2026"),
    });
  });

  it("legal footer link: only with both legal.json and the pravni-informace page", () => {
    expect(buildLegalLink(fixture.legal, fixture.pages)).toEqual({
      label: "Právní informace",
      href: "/pravni-informace/",
    });
    expect(buildLegalLink(null, fixture.pages)).toBeNull();
    const withoutPage = fixture.pages.filter((page) => page.id !== "pravni-informace");
    expect(buildLegalLink(fixture.legal, withoutPage)).toBeNull();
  });

  it("Czech date helpers", () => {
    expect(formatCzechDate("2026-01-05")).toBe(nb("5. 1. 2026"));
    expect(czechWeekday("2026-11-14")).toBe("sobota");
    expect(formatYearOrDate("1941")).toBe("1941");
  });
});

// ---------------------------------------------------------------------------
// QR code
// ---------------------------------------------------------------------------

describe("QR code", () => {
  function moduleCount(text: string): number {
    return encodeQr(text).modules.flat().filter(Boolean).length;
  }

  it("picks the smallest version and draws the three finder patterns", () => {
    const short = encodeQr("https://example.invalid/oznameni/jan-vzorovy/");
    expect(short.version).toBe(4);
    expect(short.size).toBe(33);
    for (const [x, y] of [
      [0, 0],
      [short.size - 7, 0],
      [0, short.size - 7],
    ] as const) {
      expect(short.modules[y]![x]).toBe(true);
      expect(short.modules[y + 1]![x + 1]).toBe(false);
      expect(short.modules[y + 3]![x + 3]).toBe(true);
    }
    expect(encodeQr("A").version).toBe(1);
    expect(encodeQr("x".repeat(400)).version).toBeGreaterThan(10);
  });

  it("is deterministic (regression: verified to decode with a QR reader)", () => {
    // Decoded with macOS CoreImage (CIDetector) for versions 1, 4, 5, 9 and 14 when the encoder was written.
    expect(moduleCount("https://example.invalid/oznameni/jan-vzorovy/")).toBeGreaterThan(300);
    expect(qrSvg("https://example.invalid/oznameni/jan-vzorovy/")).toMatchSnapshot();
  });

  it("renders a standalone SVG with a quiet zone and an optional accessible title", () => {
    const svg = qrSvg("https://x.example/", { title: "Odkaz <a & b>" });
    const size = encodeQr("https://x.example/").size + 8;
    expect(svg).toContain(`viewBox="0 0 ${size} ${size}"`);
    expect(svg).toContain("<title>Odkaz &lt;a &amp; b&gt;</title>");
    expect(svg).toContain('fill="#fff"');
    expect(qrSvg("https://x.example/")).not.toContain("role=");
  });
});
