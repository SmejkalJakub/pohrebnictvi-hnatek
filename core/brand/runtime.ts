/**
 * Brand helpers for template layouts (Astro runtime only). Spread `brandAttributes()` on <html>
 * and render <BrandStyle /> in <head>; the template's global.css maps --brand-* roles onto its own
 * tokens under [data-brand] (colours) and [data-brand-display] / [data-brand-body] (fonts).
 */
import type { ImageMetadata } from "astro";
import { brand, media } from "virtual:site-core/data";
import { normalizeMediaFile } from "../media/normalize.ts";

export function hasBrand(): boolean {
  return brand !== null;
}

export function brandAttributes(): Record<string, string> {
  const attributes: Record<string, string> = {};
  if (brand === null) {
    return attributes;
  }
  attributes["data-brand"] = "";
  if (brand.fonts.displayCategory !== null) {
    attributes["data-brand-display"] = brand.fonts.displayCategory;
  }
  if (brand.fonts.bodyCategory !== null) {
    attributes["data-brand-body"] = brand.fonts.bodyCategory;
  }
  return attributes;
}

/** The brand mark (logo symbol) as image metadata, or null. Decorative: render with alt="". */
export function brandMark(): ImageMetadata | null {
  if (brand === null || brand.mark === null) {
    return null;
  }
  return media[normalizeMediaFile(brand.mark)] ?? null;
}
