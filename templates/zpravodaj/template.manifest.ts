// Template F manifest (Zpravodaj, 2026-11-15) (template-contract §3).
// Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/zpravodaj/ (direction F); plan and results: docs/notes/s13-zpravodaj.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const fullPage = ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"] as const;

const manifest = {
  id: "zpravodaj",
  name: "Zpravodaj",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // Služby is one newsletter page: an index of the services, then one article per service.
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

  // The home is a front page: the lead article (hero) and the office column beside it, the first
  // steps as the main story, then the services, the catalogues, the prices and the family in
  // columns. Wide sections take two of the three newspaper columns, side sections the third.
  homepageSections: {
    available: [
      "hero",
      "contact-summary",
      "next-steps",
      "services",
      "catalogue-links",
      "price-summary",
      "family-story",
      "people",
      "notices",
      "faq",
    ],
    default: ["hero", "contact-summary", "next-steps", "services", "catalogue-links", "price-summary", "family-story"],
    constraints: { first: "hero", required: ["hero", "next-steps"] },
  },

  options: {
    palette: { values: ["papir", "grafit"], default: "papir" },
    fontPair: { values: ["spectral-source", "playfair-source"], default: "spectral-source" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Light masthead: the client's normal (dark) logo, used only when there is no brand mark.
    "company.logo": { aspect: "none", required: false },
    // The firm's own place: the photo feature of the home's first-steps story and /o-nas/.
    "about.story": { aspect: "3:2", required: false, page: "o-nas", field: "heroImage" },
    // The office on /kontakt/, as a press photo with a caption.
    "contact.office": { aspect: "3:2", required: false, page: "kontakt", field: "secondaryImage" },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "person.photo": { aspect: "4:5", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    // The lead article: title, the italic standfirst (lead) and the body in two columns.
    home: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "jak-postupovat": fullPage,
    sluzby: fullPage,
    rakve: fullPage,
    kvetiny: fullPage,
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "heroImage", "body"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "secondaryImage"],
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
