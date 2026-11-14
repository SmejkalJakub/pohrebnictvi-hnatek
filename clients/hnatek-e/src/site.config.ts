// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/krok-za-krokem/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// Hnátek prototype on template E (krok-za-krokem): the content of clients/hnatek, optional content
// types off until the client supplies real notices, people, FAQ or documents.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "krok-za-krokem",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  features: { articles: false, contactForm: false, map: "link" },
  // Manifest default: the opening, the thread, then prices and the family on the sage band.
  homepage: { sections: ["hero", "next-steps", "price-summary", "family-story"] },
  options: {
    // The brand below overrides the palette and fonts; these are the defaults without a brand.
    palette: "salvej",
    fontPair: "lora-source",
    // E1 as drawn: the nonstop strip on phones, the number in the header and the card on desktop.
    emergencyEmphasis: "standard",
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
