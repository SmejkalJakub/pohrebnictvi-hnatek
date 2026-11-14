/// <reference types="astro/client" />

declare module "virtual:site-core/data" {
  import type { ImageMetadata } from "astro";
  export const config: unknown;
  export const company: unknown;
  export const contact: unknown;
  export const officeHours: unknown;
  export const emergency: unknown;
  export const pricing: unknown;
  /** site/legal.json, or null when the site has none. */
  export const legal: unknown;
  /** site/landscapes.json, or null when the site has none. */
  export const landscapes: unknown;
  /** site/places.json, or null when the site has none. */
  export const places: unknown;
  export const mode: "prototype" | "production";
  export const siteUrl: string | null;
  /** "Today" for notice windows (YYYY-MM-DD): SITE_BUILD_DATE, pinnedBuildDate or the Prague date. */
  export const buildDate: string;
  /** URL paths that get robots noindex and stay out of sitemap.xml (noindex notices). */
  export const noindexPaths: readonly string[];
  export const media: Record<string, ImageMetadata>;
  export const icons: { svg: boolean; ico: boolean; appleTouch: boolean; manifest: boolean };
  /** Brand font faces and the :root --brand-* roles; "" without a brand profile. */
  export const brandCss: string;
  /** What the layout needs from the brand profile; null without one. */
  export const brand: {
    fonts: {
      display: string | null;
      body: string | null;
      displayCategory: "serif" | "sans-serif" | null;
      bodyCategory: "serif" | "sans-serif" | null;
    };
    mark: string | null;
    adjustments: { role: string; from: string; to: string; reason: string }[];
  } | null;
}
