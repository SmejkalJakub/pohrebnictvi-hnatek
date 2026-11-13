// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/plny-prehled/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// TRIAL CLIENT for template D (S7): a copy of clients/hnatek with placeholder notices, people,
// FAQ and documents from the neutral fixture (fictional, placeholder: true). Not a client deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "plny-prehled",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  // Placeholder notices, people, FAQ and documents for the trial only; real ones come from the client.
  features: { articles: false, contactForm: false, map: "link", notices: true, people: true, faq: true, documents: true },
  // Manifest default (every directory section; the feature-bound ones are switched on above).
  homepage: {
    sections: ["next-steps", "price-summary", "services", "catalogue-links", "people", "notices", "documents", "faq"],
  },
  options: {
    // Terracotta box on light grey (default); sits calmly next to the green + gold logo.
    palette: "seda-a-terakota",
    fontPair: "overpass",
    // The nonstop transport line is the main call to action.
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
