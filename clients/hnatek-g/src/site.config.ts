// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/lide-a-misto/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// TRIAL CLIENT for template G (S11): a copy of clients/hnatek with every optional content type
// off, except the places set (site/places.json: Hnátek's own building and flower photos, and the
// Cadillac hearse without a photo). The home people photo is the fixture's neutral placeholder.
// Not a client deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "lide-a-misto",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  features: {
    articles: false,
    contactForm: false,
    map: "link",
    places: true,
  },
  // Manifest default without people and notices (both off).
  homepage: { sections: ["hero", "family-story", "next-steps", "price-summary", "contact-summary"] },
  options: {
    // The nonstop transport line is the main call to action: a green strip under the header.
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
