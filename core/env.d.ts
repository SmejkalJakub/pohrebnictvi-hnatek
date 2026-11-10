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
  export const mode: "prototype" | "production";
  export const siteUrl: string | null;
  /** "Today" for notice windows (YYYY-MM-DD): SITE_BUILD_DATE, pinnedBuildDate or the Prague date. */
  export const buildDate: string;
  /** URL paths that get robots noindex and stay out of sitemap.xml (noindex notices). */
  export const noindexPaths: readonly string[];
  export const media: Record<string, ImageMetadata>;
  export const icons: { svg: boolean; ico: boolean; appleTouch: boolean; manifest: boolean };
}
