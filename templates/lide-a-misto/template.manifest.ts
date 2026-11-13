// Template G manifest (template-contract §3). Read by core (G-005), the CMS generator and QA.
// Design: docs/designs/lide-a-misto/ (approved D2 direction + page set); plan: docs/notes/s11-lide-a-misto.md.
import type { TemplateManifest } from "@core/content/view-models.ts";

const manifest = {
  id: "lide-a-misto",
  name: "Lidé a místo",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    // Služby is one long page with anchors (canvas).
    serviceDetailPages: false,
    mapEmbed: false,
    // Optional content types (research §8): all drawn on the canvas except pohreb-predem, which
    // follows the Pro účastníky page.
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
    priceInclusions: true,
    landscapes: false,
    // The template's idea: the firm's real places as numbered figures, or numbered rows without photos.
    places: true,
  },

  // The 1280 home board: people and the number, the places, the first steps, the people who
  // receive you, then price · office · notices side by side.
  homepageSections: {
    available: [
      "hero",
      "family-story",
      "next-steps",
      "people",
      "services",
      "price-summary",
      "contact-summary",
      "notices",
      "catalogue-links",
    ],
    default: ["hero", "family-story", "next-steps", "people", "price-summary", "contact-summary", "notices"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  // One look (one palette, one family): only the emphasis of the nonstop line is an option.
  options: {
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    // Light ground: the client's normal (dark) logo. Text wordmark while null.
    "company.logo": { aspect: "none", required: false },
    // The owners or the team on the home, bleeding to the right edge (8:7 at 1280, 9:10 at 375).
    "home.people": { aspect: "5:4", required: false, page: "home", field: "heroImage" },
    // The people photo on O nás, wide (2:1 at 1280, 5:4 on phones).
    "about.people": { aspect: "2:1", required: false, page: "o-nas", field: "heroImage" },
    "contact.office": { aspect: "3:2", required: false, page: "kontakt", field: "secondaryImage" },
    "guest.hall": { aspect: "3:2", required: false, page: "pro-ucastniky", field: "heroImage" },
    // site/places.json (content-contract §6.19).
    "place.photo": { aspect: "3:2", required: false },
    // services[].image, beside the service on Služby.
    "service.photo": { aspect: "3:2", required: false },
    "person.photo": { aspect: "3:4", required: false },
    "coffin.item": { aspect: "4:3", required: false },
    "flower.item": { aspect: "1:1", required: false },
    "notice.photo": { aspect: "4:5", required: false },
    "notice.parte": { aspect: "none", required: false },
  },

  pageFields: {
    home: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "heroImage"],
    "jak-postupovat": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    sluzby: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    rakve: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kvetiny: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "body", "heroImage"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "secondaryImage"],
    cenik: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    oznameni: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "pro-ucastniky": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "heroImage"],
    "pohreb-predem": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "pravni-informace": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "ochrana-osobnich-udaju": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
  },
} as const satisfies TemplateManifest;

export default manifest;

export type EmergencyEmphasisOption = (typeof manifest.options.emergencyEmphasis.values)[number];
