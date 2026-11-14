// Template E manifest (Krok za krokem; replaces Tichá krajina 2026-11-14) (template-contract §3).
// Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/krok-za-krokem/ (direction E1); plan and results: docs/notes/s12-krok-za-krokem.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const fullPage = ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"] as const;

const manifest = {
  id: "krok-za-krokem",
  name: "Krok za krokem",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // Služby is one page on the thread's axis, every service under its own anchor.
    serviceDetailPages: false,
    mapEmbed: false,
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
    priceInclusions: true,
    // Landscape bands belonged to Tichá krajina; numbered places and drawings to G and D.
    landscapes: false,
    places: false,
  },

  // The home is the guide: the opening with the Spojení card, then the thread (next-steps), then
  // the sage band (prices and the family side by side when they follow each other).
  homepageSections: {
    available: [
      "hero",
      "next-steps",
      "price-summary",
      "family-story",
      "services",
      "catalogue-links",
      "contact-summary",
      "people",
      "notices",
      "faq",
    ],
    default: ["hero", "next-steps", "price-summary", "family-story"],
    constraints: { first: "hero", required: ["hero", "next-steps"] },
  },

  options: {
    palette: { values: ["salvej", "modrava"], default: "salvej" },
    fontPair: { values: ["lora-source", "literata"], default: "lora-source" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Light header: the client's normal (dark) logo. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    // The firm's own place: the home thread's "Sjednání" stop and the top of /o-nas/.
    "about.story": { aspect: "3:2", required: false, page: "o-nas", field: "heroImage" },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "person.photo": { aspect: "4:5", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    // Never a hero photo: the photos stand at the thread's stops.
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
