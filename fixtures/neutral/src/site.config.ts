// Agent-only configuration for the neutral fixture (template-contract §8).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "harness",
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  homepage: { sections: ["hero", "next-steps", "services", "contact-summary", "family-story"] },
  options: {},
} satisfies SiteConfigInput;

export default config;
