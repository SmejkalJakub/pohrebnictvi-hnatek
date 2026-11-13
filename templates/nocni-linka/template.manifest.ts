// Template C manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/nocni-linka/ (round-2 board F); plan: docs/notes/s6-nocni-linka.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const manifest = {
  id: "nocni-linka",
  name: "Noční linka",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // A short index of statements, and one statement page per service.
    serviceDetailPages: true,
    mapEmbed: false,
    // Optional content types (research §8); all drawn in the comps except pohreb-predem,
    // which reuses the Pro účastníky pattern.
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

  homepageSections: {
    available: ["hero", "services", "next-steps", "family-story", "contact-summary", "catalogue-links"],
    default: ["hero", "services", "next-steps", "family-story", "contact-summary"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  options: {
    palette: { values: ["noc", "grafit"], default: "noc" },
    fontPair: { values: ["schibsted-grotesk", "hanken-grotesk"], default: "schibsted-grotesk" },
    // Home never shows a photo (design guardrail), so the hero has a single, text-only form.
    heroVariant: { values: ["statement"], default: "statement" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // The site is dark: the logo must be the light (white) variant. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    "about.story": { aspect: "4:3", required: false, page: "o-nas", field: "heroImage" },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "person.photo": { aspect: "4:5", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    home: ["title", "navLabel", "metaTitle", "metaDescription", "lead"],
    "jak-postupovat": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    sluzby: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    rakve: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kvetiny: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "heroImage", "body"],
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
