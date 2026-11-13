// Template E manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/ticha-krajina/ (round-2 board G); plan: docs/notes/s8-ticha-krajina.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const manifest = {
  id: "ticha-krajina",
  name: "Tichá krajina",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // "One long page with anchors, no detail pages" (Služby comp).
    serviceDetailPages: false,
    mapEmbed: false,
    // Optional content types (research §8): all drawn in the comps except pohreb-predem, which
    // follows the Pro účastníky page.
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
    priceInclusions: true,
    // The template's main idea: full-bleed photos of the client's region between sections.
    landscapes: true,
  },

  // A long, slow read: the text-only opening, the place picker, services, the family, the people
  // and the office, with landscape bands between them.
  homepageSections: {
    available: [
      "hero",
      "next-steps",
      "services",
      "family-story",
      "people",
      "contact-summary",
      "catalogue-links",
      "notices",
    ],
    default: ["hero", "next-steps", "services", "family-story", "people", "contact-summary"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  options: {
    palette: { values: ["mlha", "len"], default: "mlha" },
    fontPair: { values: ["spectral-figtree", "gelasio-figtree"], default: "spectral-figtree" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Light ground: the client's normal (dark) logo. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    // site/landscapes.json: 1280 × 440 bands on desktop; phones crop the same file to 25:16.
    "landscape.band": { aspect: "32:11", required: false },
    // The office building on Kontakt, as a band (the page's secondaryImage field).
    "contact.building": { aspect: "32:11", required: false, page: "kontakt", field: "secondaryImage" },
    "person.photo": { aspect: "3:4", required: false },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "notice.photo": { aspect: "3:4", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    // Nothing above the fold is an image, so home has no image field.
    home: ["title", "navLabel", "metaTitle", "metaDescription", "lead"],
    "jak-postupovat": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    sluzby: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    rakve: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kvetiny: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "body"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "secondaryImage"],
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
