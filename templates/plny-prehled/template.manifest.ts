// Template D manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/plny-prehled/ (round-2 board H); plan: docs/notes/s7-plny-prehled.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const manifest = {
  id: "plny-prehled",
  name: "Plný přehled",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // An index table, and one reference sheet per service.
    serviceDetailPages: true,
    mapEmbed: false,
    // Optional content types (research §8): all drawn in the comps except pohreb-predem, which
    // reuses the Pro účastníky reference sheet.
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
    priceInclusions: true,
  },

  // The home page is a directory, not a story: no hero, no family story, and no contact block
  // (the Kancelář box is in the header of every page). The first section's heading is the h1.
  homepageSections: {
    available: ["next-steps", "price-summary", "services", "catalogue-links", "people", "notices", "documents", "faq"],
    default: ["next-steps", "price-summary", "services", "catalogue-links", "people", "notices", "documents", "faq"],
    constraints: { first: "next-steps", required: ["next-steps"] },
  },

  options: {
    // Šedá a terakota is the default (owner, 2026-11-11): yellow on the urgent line may read as a warning.
    palette: { values: ["seda-a-terakota", "bila-a-zluta"], default: "seda-a-terakota" },
    fontPair: { values: ["overpass", "red-hat"], default: "overpass" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Light ground: the client's normal (dark) logo. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "person.photo": { aspect: "4:5", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    // Home has no title or lead on screen: the directory starts at once.
    home: ["navLabel", "metaTitle", "metaDescription"],
    "jak-postupovat": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    sluzby: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    rakve: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kvetiny: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    cenik: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    oznameni: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "pro-ucastniky": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "pohreb-predem": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "pravni-informace": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "ochrana-osobnich-udaju": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
  },
} as const satisfies TemplateManifest;

export default manifest;

export type PaletteOption = (typeof manifest.options.palette.values)[number];
export type FontPairOption = (typeof manifest.options.fontPair.values)[number];
export type EmergencyEmphasisOption = (typeof manifest.options.emergencyEmphasis.values)[number];
