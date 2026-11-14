// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/nocni-linka/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// Hnátek prototype on template C (nocni-linka): the content of clients/hnatek, optional content
// types off until the client supplies real notices, people, FAQ or documents.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "nocni-linka",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  // Manifest default, plus catalogue-links because the client has a real coffin and flower catalogue.
  homepage: { sections: ["hero", "next-steps", "family-story", "services", "catalogue-links", "contact-summary"] },
  options: {
    // Green-black ground and amber number sit next to the green + gold logo (white variant).
    palette: "noc",
    fontPair: "schibsted-grotesk",
    heroVariant: "statement",
    // The nonstop transport line is the main call to action.
    emergencyEmphasis: "high",
  },
  // Brand board pasted by the owner on 2026-11-13 (brand/preview/brand-overview.png): forest green,
  // gold, grey and warm cream; Playfair Display for headings, Source Serif 4 for text. Core keeps
  // text legible (the gold is darkened for text on cream, G-090); the template maps the roles.
  brand: {
    colors: { primary: "#0B3D2C", secondary: "#C9A24A", neutral: "#8A8A8A", ground: "#F9F6EF" },
    fonts: { display: "playfair-display", body: "source-serif-4" },
    mark: "brand-mark-hnatek-light.svg",
    source: "brand/preview/brand-overview.png (2026-11-13)",
  },
} satisfies SiteConfigInput;

export default config;
