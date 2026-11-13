// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/nocni-linka/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// TRIAL CLIENT for template C (S6): a copy of clients/hnatek with placeholder notices, people,
// FAQ and documents from the neutral fixture (fictional, placeholder: true). Not a client deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "nocni-linka",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  // Placeholder notices, people, FAQ and documents for the trial only; real ones come from the client.
  features: { articles: false, contactForm: false, map: "link", notices: true, people: true, faq: true, documents: true },
  // Manifest default, plus catalogue-links because the client has a real coffin and flower catalogue.
  homepage: { sections: ["hero", "services", "next-steps", "family-story", "catalogue-links", "contact-summary"] },
  options: {
    // Green-black ground and amber number sit next to the green + gold logo (white variant).
    palette: "noc",
    fontPair: "schibsted-grotesk",
    heroVariant: "statement",
    // The nonstop transport line is the main call to action.
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
