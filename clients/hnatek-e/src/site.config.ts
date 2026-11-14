// Agent-only configuration (template-contract §8). Never edited in the CMS.
// Allowed values: templates/krok-za-krokem/template.manifest.ts (options, homepageSections).
// Plain object + `import type` only, so Node can load it without a bundler.
//
// TRIAL CLIENT for template E (S12, Krok za krokem): a copy of clients/hnatek with placeholder
// notices, people, FAQ and documents from the neutral fixture (fictional, placeholder: true).
// Not a client deliverable.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "krok-za-krokem",
  // The real domain is required in production (G-012).
  siteUrl: "https://example.invalid",
  // Placeholder notices, people, FAQ and documents for the trial only; real ones come from the client.
  features: {
    articles: false,
    contactForm: false,
    map: "link",
    notices: true,
    people: true,
    faq: true,
    documents: true,
  },
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
