// Template H manifest (V kapse, 2026-11-15) (template-contract §3).
// Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/v-kapse/; plan and results: docs/notes/s14-v-kapse.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const fullPage = ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"] as const;

const manifest = {
  id: "v-kapse",
  name: "V kapse",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // Služby is one page of rows; each service opens in place under its anchor.
    serviceDetailPages: false,
    mapEmbed: false,
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

  // The home is one question with large rows. Each section after the hero is a row whose answer
  // opens beside it (desktop) or under it (phone); next-steps gives two rows (now, arranging);
  // family-story is the closing line under the rows.
  homepageSections: {
    available: [
      "hero",
      "next-steps",
      "services",
      "price-summary",
      "catalogue-links",
      "contact-summary",
      "people",
      "notices",
      "family-story",
    ],
    default: ["hero", "next-steps", "services", "price-summary", "catalogue-links", "contact-summary", "family-story"],
    constraints: { first: "hero", required: ["hero", "next-steps"] },
  },

  options: {
    palette: { values: ["mech", "bridlice"], default: "mech" },
    fontPair: { values: ["figtree", "spectral-figtree"], default: "figtree" },
    // high: the header (with the nonstop pill) stays pinned to the top while scrolling.
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Light header: the client's normal (dark) logo or brand mark. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    // The firm's own place: the home answer "Chci sjednat pohřeb" and the top of /o-nas/.
    "about.story": { aspect: "16:9", required: false, page: "o-nas", field: "heroImage" },
    "coffin.item": { aspect: "1:1", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "person.photo": { aspect: "4:5", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    // Never a hero photo: the photos open inside the answers.
    home: ["title", "navLabel", "metaTitle", "metaDescription", "lead"],
    "jak-postupovat": fullPage,
    sluzby: fullPage,
    rakve: fullPage,
    kvetiny: fullPage,
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "heroImage", "body"],
    kontakt: fullPage,
    cenik: fullPage,
    oznameni: fullPage,
    "pro-ucastniky": fullPage,
    "pohreb-predem": fullPage,
    "pravni-informace": fullPage,
    "ochrana-osobnich-udaju": fullPage,
  },
} as const satisfies TemplateManifest;

export default manifest;

export type PaletteOption = (typeof manifest.options.palette.values)[number];
export type FontPairOption = (typeof manifest.options.fontPair.values)[number];
export type EmergencyEmphasisOption = (typeof manifest.options.emergencyEmphasis.values)[number];
