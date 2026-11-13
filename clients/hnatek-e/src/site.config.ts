// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/ticha-krajina/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// TRIAL CLIENT for template E (S8): a copy of clients/hnatek with placeholder notices, people,
// FAQ and documents from the neutral fixture (fictional, placeholder: true) and the fixture's
// three neutral landscape placeholders. Not a client deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "ticha-krajina",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  // Placeholder notices, people, FAQ, documents and landscapes for the trial only; real ones come
  // from the client (landscapes: a short commissioned shoot of the Vyškov region, no people).
  features: {
    articles: false,
    contactForm: false,
    map: "link",
    notices: true,
    people: true,
    faq: true,
    documents: true,
    landscapes: true,
  },
  // Manifest default.
  homepage: { sections: ["hero", "next-steps", "services", "family-story", "people", "contact-summary"] },
  options: {
    // Mist and spruce-blue leave the logo's green and gold on their own.
    palette: "mlha",
    fontPair: "spectral-figtree",
    // The nonstop transport line is the main call to action: the stamp line moves above the H1.
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
