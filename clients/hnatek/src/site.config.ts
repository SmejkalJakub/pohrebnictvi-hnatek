// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/rodinna-tradice/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "rodinna-tradice",
  // The real domain is required in production (G-012). pohrebnictvihnatek.cz is planned but not switched yet (U17).
  siteUrl: "https://example.invalid",
  // Contact form for testing on Netlify (Netlify Forms). The privacy page is still a placeholder, so
  // production stays blocked (G-031) until its text covers the form and is approved.
  features: { articles: false, contactForm: true, map: "link" },
  contactFormHandler: "netlify",
  homepage: { sections: ["hero", "next-steps", "family-story", "services", "catalogue-links", "contact-summary"] },
  options: {
    palette: "ivory-forest",
    fontPair: "garamond-source",
    heroVariant: "typographic",
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
