// Template D manifest (Rodinný rozhovor; built as F, replaces Dvě cesty 2026-11-14) (template-contract §3). Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/rodinny-rozhovor/ (round-2 board I); plan: docs/notes/s9-rodinny-rozhovor.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const fullPage = ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"] as const;

const manifest = {
  id: "rodinny-rozhovor",
  name: "Rodinný rozhovor",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // Služby is one question-led page; every service is an answer with an anchor.
    serviceDetailPages: false,
    mapEmbed: false,
    // Optional content types (research §8): all drawn in the comps except pohreb-predem, which
    // reuses the Pro účastníky page.
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
    priceInclusions: true,
    // Landscape bands and numbered places belong to templates E and G.
    landscapes: false,
    places: false,
    // Commissioned pen drawings per slot (site/illustrations.json, content-contract §6.20).
    illustrations: true,
  },

  // A conversation: every section is a question. The hero carries the h1 and the nonstop answer.
  homepageSections: {
    available: [
      "hero",
      "next-steps",
      "price-summary",
      "family-story",
      "services",
      "contact-summary",
      "people",
      "notices",
      "faq",
      "catalogue-links",
    ],
    default: ["hero", "next-steps", "family-story", "price-summary", "services", "contact-summary"],
    constraints: { first: "hero", required: ["hero"] },
  },

  options: {
    palette: { values: ["hlina", "med"], default: "hlina" },
    fontPair: { values: ["alegreya", "gelasio"], default: "alegreya" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Cream header: the client's normal (dark) logo, never on the clay field. Wordmark while null.
    "company.logo": { aspect: "none", required: false },
    // The one photograph of the people ("Kdo jste?" on home and the top of /o-nas/).
    "about.story": { aspect: "4:3", required: false, page: "o-nas", field: "heroImage" },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "person.photo": { aspect: "4:5", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
    // Commissioned pen drawings: one dark-line file per slot; lightened on the clay field.
    "illustration.hero": { aspect: "1:1", required: false },
    "illustration.guidance": { aspect: "4:5", required: false },
    "illustration.services": { aspect: "4:5", required: false },
    "illustration.office": { aspect: "3:2", required: false },
    "illustration.contact": { aspect: "1:1", required: false },
  },

  pageFields: {
    // Home: the h1 is the template's question and the answer is the nonstop note.
    home: ["navLabel", "metaTitle", "metaDescription"],
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
