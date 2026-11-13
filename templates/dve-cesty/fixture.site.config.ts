// Template-development config: renders the neutral fixture with this template's id, default
// options and default homepage order, with every optional content type switched on.
// Selected through SITE_CONFIG in package.json. Plain object + `import type` only.
import type { SiteConfigInput } from "../../core/content/config.ts";

const config = {
  template: "dve-cesty",
  siteUrl: "https://example.invalid",
  features: {
    articles: false,
    contactForm: false,
    map: "link",
    notices: true,
    people: true,
    faq: true,
    documents: true,
    guestInfo: true,
    prePlanning: true,
  },
  // Notice dates in the fixture are relative to this day (prototype only, G-073).
  pinnedBuildDate: "2026-11-10",
  homepage: {
    sections: ["hero", "contact-summary", "notices", "family-story"],
  },
  options: {
    palette: "noc-a-kamen",
    fontPair: "manrope",
    emergencyEmphasis: "standard",
  },
} satisfies SiteConfigInput;

export default config;
