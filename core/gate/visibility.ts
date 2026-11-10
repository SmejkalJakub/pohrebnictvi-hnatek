/** Which pages and entries end up on the built site. Shared by the gate and the Astro loaders. */
import type { ContentFeature, SiteConfig } from "../content/config.ts";
import type { Notice, PageId, Pricing } from "../content/schemas.ts";

export interface VisibilityContext {
  config: SiteConfig;
  pricing: Pricing;
}

/** Entries are either `published` (services, guidance, catalogue) or `draft` (articles). */
export interface Publishable {
  published?: boolean;
  draft?: boolean;
}

/** Optional pages that exist on the site only while their feature is on. */
export const FEATURE_PAGES: Partial<Record<PageId, ContentFeature>> = {
  oznameni: "notices",
  "pro-ucastniky": "guestInfo",
  "pohreb-predem": "prePlanning",
};

/** Optional collections that are built only while their feature is on. */
export const FEATURE_COLLECTIONS = {
  notices: "notices",
  people: "people",
  faq: "faq",
  documents: "documents",
} as const satisfies Record<string, ContentFeature>;
export type FeatureCollection = keyof typeof FEATURE_COLLECTIONS;

export function isPageEnabled(id: PageId | string, context: VisibilityContext): boolean {
  if (id === "cenik") {
    return context.pricing.visible;
  }
  if (id === "clanky") {
    return context.config.features.articles;
  }
  const feature = FEATURE_PAGES[id as PageId];
  if (feature !== undefined) {
    return context.config.features[feature];
  }
  return true;
}

export function isCollectionEnabled(name: FeatureCollection, context: { config: SiteConfig }): boolean {
  return context.config.features[FEATURE_COLLECTIONS[name]];
}

export function isEntryPublished(entry: { data: Publishable }, context: VisibilityContext): boolean {
  if (entry.data.draft !== undefined) {
    return context.config.features.articles && !entry.data.draft;
  }
  return entry.data.published !== false;
}

/** A published entry of an optional collection whose feature is on. */
export function isFeatureEntryPublished(
  name: FeatureCollection,
  entry: { data: Publishable },
  context: VisibilityContext,
): boolean {
  return isCollectionEnabled(name, context) && isEntryPublished(entry, context);
}

export type NoticeState = "off" | "draft" | "scheduled" | "live" | "expired";

/**
 * Where a notice stands on `buildDate` (YYYY-MM-DD). Only "live" notices are built: expired ones
 * (publishUntil < build date) and scheduled ones (publishFrom > build date) produce no files.
 */
export function noticeState(
  notice: Pick<Notice, "published" | "publishFrom" | "publishUntil">,
  context: VisibilityContext,
  buildDate: string,
): NoticeState {
  if (!context.config.features.notices) {
    return "off";
  }
  if (!notice.published) {
    return "draft";
  }
  if (notice.publishUntil < buildDate) {
    return "expired";
  }
  if (notice.publishFrom !== null && notice.publishFrom > buildDate) {
    return "scheduled";
  }
  return "live";
}

export function isNoticeLive(
  notice: Pick<Notice, "published" | "publishFrom" | "publishUntil">,
  context: VisibilityContext,
  buildDate: string,
): boolean {
  return noticeState(notice, context, buildDate) === "live";
}
