// Template A manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
// `import type` only (erased at load time), so astro.config.mjs can load this file before the @core
// alias exists. Templates reach core only through `@core/` (design-differentiation §6).
import type { TemplateManifest } from "@core/content/config.ts";

const manifest = {
  id: "rodinna-tradice",
  name: "Rodinná tradice",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // One long /sluzby/ page with anchors (/sluzby/#<slug>); no /sluzby/<slug>/ paths are emitted.
    serviceDetailPages: false,
    mapEmbed: false,
    // Optional content types (research §8): not implemented by this template yet.
    notices: false,
    people: false,
    faq: false,
    documents: false,
    guestInfo: false,
    prePlanning: false,
    priceInclusions: false,
  },

  homepageSections: {
    available: ["hero", "family-story", "services", "next-steps", "contact-summary", "catalogue-links"],
    default: ["hero", "family-story", "services", "next-steps", "contact-summary"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  options: {
    palette: { values: ["ivory-umber", "ivory-olive", "ivory-forest"], default: "ivory-umber" },
    fontPair: { values: ["garamond-source", "literata"], default: "garamond-source" },
    heroVariant: { values: ["photo-right", "typographic"], default: "photo-right" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    "home.hero": { aspect: "4:5", required: false, page: "home", field: "heroImage" },
    "about.story": { aspect: "3:2", required: false, page: "o-nas", field: "heroImage" },
    "service.inline": { aspect: "4:3", required: false },
    "coffin.item": { aspect: "3:2", required: false },
    "flower.item": { aspect: "1:1", required: false },
    // Rendered by LetterheadHeader; the text wordmark is used while company.logo is null.
    "company.logo": { aspect: "none", required: false },
  },

  pageFields: {
    home: ["title", "lead", "heroImage", "metaTitle", "metaDescription", "body"],
    "jak-postupovat": ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"],
    sluzby: ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"],
    rakve: ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"],
    kvetiny: ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"],
    "o-nas": ["title", "navLabel", "lead", "excerpt", "heroImage", "metaTitle", "metaDescription", "body"],
    kontakt: ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"],
    cenik: ["title", "navLabel", "lead", "metaTitle", "metaDescription", "body"],
    "ochrana-osobnich-udaju": ["title", "lead", "metaTitle", "metaDescription", "body"],
  },
} as const satisfies TemplateManifest;

export default manifest;
