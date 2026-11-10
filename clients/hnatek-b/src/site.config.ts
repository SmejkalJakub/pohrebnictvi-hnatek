// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/dustojna-jednoduchost/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "dustojna-jednoduchost",
  // The real domain is required in production (G-012). pohrebnictvihnatek.cz is planned but not switched yet (U17).
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  // Manifest default, plus catalogue-links because the client has a real coffin and flower catalogue.
  homepage: { sections: ["hero", "next-steps", "services", "catalogue-links", "contact-summary", "family-story"] },
  options: {
    // Green accent closest to the logo's forest green (#113C2A).
    palette: "slate-forest",
    // Serif headings (IBM Plex Serif) to echo the serif logo; sans body text.
    fontPair: "plex-sans-serif",
    // A real photo of the office building exists (3:2, home.hero).
    heroVariant: "text-with-image",
    // The nonstop transport line is the main call to action.
    emergencyEmphasis: "high",
  },
} satisfies SiteConfigInput;

export default config;
