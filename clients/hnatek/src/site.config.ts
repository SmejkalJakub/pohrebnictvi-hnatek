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
  homepage: { sections: ["hero", "next-steps", "services", "family-story", "catalogue-links", "contact-summary"] },
  options: {
    palette: "ivory-forest",
    fontPair: "garamond-source",
    heroVariant: "typographic",
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
