// Template B manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
import type { TemplateManifest } from "@core/content/view-models.ts";

const manifest = {
  id: "dustojna-jednoduchost",
  name: "Důstojná jednoduchost",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: true,
    mapEmbed: false,
  },

  homepageSections: {
    available: ["hero", "next-steps", "services", "contact-summary", "family-story", "catalogue-links"],
    default: ["hero", "next-steps", "services", "contact-summary", "family-story"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  options: {
    palette: { values: ["slate-forest", "slate-blue"], default: "slate-forest" },
    fontPair: { values: ["public-sans", "plex-sans-serif"], default: "public-sans" },
    heroVariant: { values: ["text-only", "text-with-image"], default: "text-only" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    "home.hero": { aspect: "3:2", required: false, page: "home", field: "heroImage" },
    "about.story": { aspect: "4:3", required: false, page: "o-nas", field: "heroImage" },
    "service.card": { aspect: "none", required: false },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "company.logo": { aspect: "none", required: false },
  },

  pageFields: {
    home: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "heroImage"],
    "jak-postupovat": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    sluzby: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    rakve: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kvetiny: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "heroImage", "body"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    cenik: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "ochrana-osobnich-udaju": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
  },
} as const satisfies TemplateManifest;

export default manifest;

export type PaletteOption = (typeof manifest.options.palette.values)[number];
export type FontPairOption = (typeof manifest.options.fontPair.values)[number];
export type HeroVariantOption = (typeof manifest.options.heroVariant.values)[number];
export type EmergencyEmphasisOption = (typeof manifest.options.emergencyEmphasis.values)[number];
