// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/rodinna-tradice/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "rodinna-tradice",
  // The real domain is required in production (G-012). pohrebnictvihnatek.cz is planned but not switched yet (U17).
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  homepage: { sections: ["hero", "next-steps", "services", "family-story", "catalogue-links", "contact-summary"] },
  options: {
    palette: "ivory-forest",
    fontPair: "garamond-source",
    heroVariant: "typographic",
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
