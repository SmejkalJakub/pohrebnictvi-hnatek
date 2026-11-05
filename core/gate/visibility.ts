/** Which pages and entries end up on the built site. Shared by the gate and the Astro loaders. */
import type { PageId } from "../content/schemas.ts";
import type { SiteConfig } from "../content/config.ts";
import type { Pricing } from "../content/schemas.ts";

export interface VisibilityContext {
  config: SiteConfig;
  pricing: Pricing;
}

/** Entries are either `published` (services, guidance, catalogue) or `draft` (articles). */
export interface Publishable {
  published?: boolean;
  draft?: boolean;
}

export function isPageEnabled(id: PageId | string, context: VisibilityContext): boolean {
  if (id === "cenik") {
    return context.pricing.visible;
  }
  if (id === "clanky") {
    return context.config.features.articles;
  }
  return true;
}

export function isEntryPublished(entry: { data: Publishable }, context: VisibilityContext): boolean {
  if (entry.data.draft !== undefined) {
    return context.config.features.articles && !entry.data.draft;
  }
  return entry.data.published !== false;
}
