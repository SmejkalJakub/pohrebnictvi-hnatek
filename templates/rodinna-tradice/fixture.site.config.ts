// Template-development config for previewing the neutral fixture with rodinna-tradice
// (template-contract "How it is wired": SITE_CONFIG overrides <SITE_ROOT>/src/site.config.ts).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../core/content/config.ts";

const config = {
  template: "rodinna-tradice",
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  homepage: { sections: ["hero", "family-story", "services", "next-steps", "contact-summary"] },
  options: {
    palette: "ivory-umber",
    fontPair: "garamond-source",
    heroVariant: "photo-right",
    emergencyEmphasis: "standard",
  },
} satisfies SiteConfigInput;

export default config;
