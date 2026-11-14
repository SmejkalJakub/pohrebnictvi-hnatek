// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/rodinny-rozhovor/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// PROTOTYPE for template D "Rodinný rozhovor" (replaces "Dvě cesty", 2026-11-14): a copy of
// clients/hnatek with its content exactly as is and every optional content type off. Not a client
// deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "rodinny-rozhovor",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  // As clients/hnatek: no notices, people, FAQ or documents until the client provides them. No
  // drawings either: the client has not commissioned any, so the drawing places stay closed.
  features: { articles: false, contactForm: false, map: "link" },
  // The conversation in the order a family asks: who helps now, what comes next, who you are (the
  // office photo), what you arrange, what it costs, flowers and coffins (their photos), where you are.
  homepage: {
    sections: ["hero", "next-steps", "family-story", "services", "price-summary", "catalogue-links", "contact-summary"],
  },
  options: {
    palette: "hlina",
    fontPair: "alegreya",
    // The nonstop transport line is the main call to action: the full answer field at the top of
    // every page.
    emergencyEmphasis: "high",
  },
  // Brand board pasted by the owner on 2026-11-13 (brand/preview/brand-overview.png): forest green,
  // gold, grey and warm cream; Playfair Display for headings, Source Serif 4 for text. Core keeps
  // text legible (the gold is darkened for text on cream, G-090); the template maps the roles.
  brand: {
    colors: { primary: "#0B3D2C", secondary: "#C9A24A", neutral: "#8A8A8A", ground: "#F9F6EF" },
    fonts: { display: "playfair-display", body: "source-serif-4" },
    mark: "brand-mark-hnatek.svg",
    source: "brand/preview/brand-overview.png (2026-11-13)",
  },
} satisfies SiteConfigInput;

export default config;
