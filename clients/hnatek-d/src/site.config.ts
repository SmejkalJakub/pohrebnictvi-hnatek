// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/dve-cesty/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// PROTOTYPE for template D "Dvě cesty" (S10): a copy of clients/hnatek with its content exactly
// as is and every optional content type off. Not a client deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "dve-cesty",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  // As clients/hnatek: no notices, people, FAQ or documents until the client provides them.
  features: { articles: false, contactForm: false, map: "link" },
  // Manifest default without notices (the feature is off): the split hero, Kancelář, O nás.
  homepage: { sections: ["hero", "contact-summary", "family-story"] },
  options: {
    // The only palette: navy and stone fields leave the logo's green and gold on their own.
    palette: "noc-a-kamen",
    fontPair: "manrope",
    // The nonstop transport line is the main call to action: a navy band with the number under
    // the path switch on every S předstihem page.
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
