// Template D manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/dve-cesty/ (direction D3, approved 2026-11-13); plan: docs/notes/s10-dve-cesty.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const manifest = {
  id: "dve-cesty",
  name: "Dvě cesty",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // Služby is an index of ruled rows; each row links to its own page.
    serviceDetailPages: true,
    mapEmbed: false,
    // Optional content types (research §8): all drawn in the page set except pohreb-predem, which
    // follows the Pro účastníky page.
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
    priceInclusions: true,
    landscapes: false,
    places: false,
  },

  // The hero is the split itself (the question and both halves), so the halves always follow the
  // H1. Below it the drawn row: Kancelář · Oznámení a obřady · O nás.
  homepageSections: {
    available: [
      "hero",
      "contact-summary",
      "notices",
      "family-story",
      "next-steps",
      "services",
      "price-summary",
      "people",
      "catalogue-links",
      "documents",
      "faq",
    ],
    default: ["hero", "contact-summary", "notices", "family-story"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  options: {
    // The two colours are the structure (navy for "Teď hned", stone for "S předstihem"), so there
    // is one palette and one font family.
    palette: { values: ["noc-a-kamen"], default: "noc-a-kamen" },
    fontPair: { values: ["manrope"], default: "manrope" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // White header: the client's normal (dark) logo. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    "person.photo": { aspect: "3:4", required: false },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "notice.photo": { aspect: "3:4", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    // The home H1 is the question "S čím vám můžeme pomoct?" (a UI string), so home has no title on screen.
    home: ["navLabel", "metaTitle", "metaDescription"],
    "jak-postupovat": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    sluzby: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    rakve: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kvetiny: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "body"],
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
