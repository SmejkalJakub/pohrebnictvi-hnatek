// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/dustojna-jednoduchost/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "dustojna-jednoduchost",
  // The real domain is required in production (G-012). pohrebnictvihnatek.cz is planned but not switched yet (U17).
  siteUrl: "https://example.invalid",
  // Contact form for testing on Netlify (Netlify Forms). The privacy page is still a placeholder, so
  // production stays blocked (G-031) until its text covers the form and is approved.
  features: { articles: false, contactForm: true, map: "link" },
  contactFormHandler: "netlify",
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
  // Brand board pasted by the owner on 2026-11-13 (brand/preview/brand-overview.png): forest green,
  // gold, grey and warm cream; Playfair Display for headings, Source Serif 4 for text. Core keeps
  // text legible (the gold is darkened for text on cream, G-090); the template maps the roles.
  brand: {
    colors: { primary: "#0B3D2C", secondary: "#C9A24A", neutral: "#8A8A8A", ground: "#F9F6EF" },
    fonts: { display: "playfair-display", body: "source-serif-4" },
    mark: "brand-mark-hnatek.svg",
    source: "brand/preview/brand-overview.png (2026-11-13)",
  },
} satisfies SiteConfigInput;

export default config;
