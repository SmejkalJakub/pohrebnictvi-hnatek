// Agent-only configuration for the neutral fixture (template-contract §8).
// Plain object + `import type` only, so Node can load it without a bundler.
import type { SiteConfigInput } from "../../../core/content/config.ts";

const config = {
  template: "harness",
  siteUrl: "https://example.invalid",
  // The fixture switches every optional content type on, so the harness exercises them.
  // Templates preview it with their own fixture.site.config.ts (SITE_CONFIG), where they stay off
  // until the template supports them (G-005).
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
  // Notice dates in the fixture are relative to this day, so builds never depend on the clock.
  // Prototype only (G-073); SITE_BUILD_DATE overrides it.
  pinnedBuildDate: "2026-11-10",
  homepage: { sections: ["hero", "next-steps", "services", "contact-summary", "family-story"] },
  options: {},
} satisfies SiteConfigInput;

export default config;
