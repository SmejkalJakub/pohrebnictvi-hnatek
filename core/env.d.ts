/// <reference types="astro/client" />

declare module "virtual:site-core/data" {
  import type { ImageMetadata } from "astro";
  export const config: unknown;
  export const company: unknown;
  export const contact: unknown;
  export const officeHours: unknown;
  export const emergency: unknown;
  export const pricing: unknown;
  export const mode: "prototype" | "production";
  export const siteUrl: string | null;
  export const media: Record<string, ImageMetadata>;
}
