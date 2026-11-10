/**
 * Agent-only site configuration (template-contract §8) and template manifest types (§3).
 *
 * site.config.ts files contain a plain `export default { … }` object and use only
 * `import type`, so Node can load them directly (type stripping) without a bundler.
 */
import { z } from "astro/zod";
import { Id, IsoDate, Url, nullable } from "./primitives.ts";

export const HOMEPAGE_SECTIONS = [
  "hero",
  "family-story",
  "services",
  "next-steps",
  "contact-summary",
  "catalogue-links",
] as const;
export type HomepageSection = (typeof HOMEPAGE_SECTIONS)[number];

/** Placeholder domain that is valid in prototype builds only (gate G-012). */
export const PLACEHOLDER_SITE_URL = "https://example.invalid";

export const SiteConfig = z
  .object({
    template: Id,
    siteUrl: Url,
    locale: z.literal("cs-CZ").default("cs-CZ"),
    features: z.object({
      articles: z.boolean().default(false),
      contactForm: z.boolean().default(false),
      map: z.enum(["link", "embed-on-click"]).default("link"),
      // Optional content types (content-contract §6.13–§6.17); each needs template support (G-005).
      notices: z.boolean().default(false),
      people: z.boolean().default(false),
      faq: z.boolean().default(false),
      documents: z.boolean().default(false),
      guestInfo: z.boolean().default(false),
      prePlanning: z.boolean().default(false),
    }),
    contactFormEndpoint: nullable(Url).default(null),
    /**
     * Fixed "today" for deterministic fixture and template-development builds (notice publication
     * windows, upcoming ceremonies). Prototype only: the production gate rejects it (G-073).
     * SITE_BUILD_DATE in the environment takes precedence.
     */
    pinnedBuildDate: nullable(IsoDate).default(null),
    homepage: z.object({
      sections: z.array(z.enum(HOMEPAGE_SECTIONS)).min(1),
    }),
    options: z.record(z.string(), z.string()).default({}),
  })
  .superRefine((config, ctx) => {
    const seen = new Set<string>();
    config.homepage.sections.forEach((section, index) => {
      if (seen.has(section)) {
        ctx.addIssue({
          code: "custom",
          path: ["homepage", "sections", index],
          message: `Sekce "${section}" je uvedena vícekrát.`,
        });
      }
      seen.add(section);
    });
  });
export type SiteConfig = z.infer<typeof SiteConfig>;
export type SiteConfigInput = z.input<typeof SiteConfig>;

export interface OptionDeclaration {
  values: readonly string[];
  default: string;
}

export interface ImageSlotDeclaration {
  aspect: string;
  required: boolean;
  page?: string;
  field?: string;
}

/** Optional content types: a site.config feature switch and a manifest `supports` flag of the same name. */
export const CONTENT_FEATURES = [
  "notices",
  "people",
  "faq",
  "documents",
  "guestInfo",
  "prePlanning",
] as const;
export type ContentFeature = (typeof CONTENT_FEATURES)[number];

export interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  coreVersion: string;
  supports: {
    articles: boolean;
    multipleLocations: boolean;
    contactForm: boolean;
    serviceDetailPages: boolean;
    /** Click-to-load map embed (features.map = "embed-on-click"). */
    mapEmbed: boolean;
    /** Smuteční oznámení: /oznameni/ and /oznameni/<slug>/ (features.notices). */
    notices: boolean;
    /** Lidé: the people collection (features.people). */
    people: boolean;
    /** Časté otázky: the faq collection (features.faq). */
    faq: boolean;
    /** Dokumenty ke stažení: the documents collection (features.documents). */
    documents: boolean;
    /** Pro účastníky pohřbu: the page pro-ucastniky (features.guestInfo). */
    guestInfo: boolean;
    /** Pohřeb předem: the page pohreb-predem (features.prePlanning). */
    prePlanning: boolean;
    /** Renders pricing groups' includes[] / excludes[]; the CMS hides those lists otherwise. */
    priceInclusions: boolean;
  };
  homepageSections: {
    available: readonly HomepageSection[];
    default: readonly HomepageSection[];
    constraints: { first?: HomepageSection; required: readonly HomepageSection[] };
  };
  options: Record<string, OptionDeclaration>;
  imageSlots: Record<string, ImageSlotDeclaration>;
  pageFields: Record<string, readonly string[]>;
}

export interface ConfigIssue {
  path: string;
  message: string;
}

/** Validate a site config against a template manifest (declared options and section constraints). */
export function checkConfigAgainstManifest(config: SiteConfig, manifest: TemplateManifest): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (config.template !== manifest.id) {
    issues.push({
      path: "template",
      message: `Config names template "${config.template}" but manifest is "${manifest.id}".`,
    });
  }
  for (const [name, value] of Object.entries(config.options)) {
    const declaration = manifest.options[name];
    if (declaration === undefined) {
      issues.push({ path: `options.${name}`, message: `Template does not declare option "${name}".` });
      continue;
    }
    if (!declaration.values.includes(value)) {
      issues.push({
        path: `options.${name}`,
        message: `"${value}" is not one of: ${declaration.values.join(", ")}.`,
      });
    }
  }
  const sections = config.homepage.sections;
  for (const section of sections) {
    if (!manifest.homepageSections.available.includes(section)) {
      issues.push({ path: "homepage.sections", message: `Template does not offer section "${section}".` });
    }
  }
  const constraints = manifest.homepageSections.constraints;
  if (constraints.first !== undefined && sections[0] !== constraints.first) {
    issues.push({ path: "homepage.sections", message: `First section must be "${constraints.first}".` });
  }
  for (const required of constraints.required) {
    if (!sections.includes(required)) {
      issues.push({ path: "homepage.sections", message: `Section "${required}" is required.` });
    }
  }
  if (config.features.articles && !manifest.supports.articles) {
    issues.push({ path: "features.articles", message: "Template does not support articles (gate G-051)." });
  }
  if (config.features.contactForm && !manifest.supports.contactForm) {
    issues.push({ path: "features.contactForm", message: "Template does not support a contact form." });
  }
  if (config.features.map === "embed-on-click" && !manifest.supports.mapEmbed) {
    issues.push({ path: "features.map", message: 'Template does not support an embedded map; use "link".' });
  }
  for (const feature of CONTENT_FEATURES) {
    if (config.features[feature] && !manifest.supports[feature]) {
      issues.push({
        path: `features.${feature}`,
        message: `Template does not support "${feature}"; switch the feature off or choose another template.`,
      });
    }
  }
  return issues;
}

type DeclaredOptions = Record<string, { values: readonly string[]; default: string }>;

export type ResolvedOptions<O extends DeclaredOptions> = {
  [K in keyof O]: O[K]["values"][number];
};

/**
 * The template's options with manifest defaults filled in. Throws on an undeclared value; the
 * build gate (G-005) reports the same problem earlier with a readable message.
 */
export function resolveTemplateOptions<O extends DeclaredOptions>(
  config: Pick<SiteConfig, "options">,
  manifest: { id: string; options: O },
): ResolvedOptions<O> {
  const resolved: Record<string, string> = {};
  for (const [name, declaration] of Object.entries(manifest.options)) {
    const chosen = config.options[name];
    if (chosen === undefined) {
      resolved[name] = declaration.default;
      continue;
    }
    if (!declaration.values.includes(chosen)) {
      throw new Error(
        `Option ${name}="${chosen}" is not declared by template "${manifest.id}" (gate G-005).`,
      );
    }
    resolved[name] = chosen;
  }
  return resolved as ResolvedOptions<O>;
}
