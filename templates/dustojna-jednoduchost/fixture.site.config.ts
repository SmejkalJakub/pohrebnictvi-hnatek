// Template-development config: renders the neutral fixture with this template's id,
// default options and default homepage order. Selected through SITE_CONFIG in package.json.
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../core/content/config.ts";

const config = {
  template: "dustojna-jednoduchost",
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  homepage: { sections: ["hero", "next-steps", "services", "contact-summary", "family-story"] },
  options: {
    palette: "slate-forest",
    fontPair: "public-sans",
    heroVariant: "text-only",
    emergencyEmphasis: "standard",
  },
} satisfies SiteConfigInput;

export default config;
