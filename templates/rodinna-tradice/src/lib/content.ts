/**
 * Small template-side helpers on top of @core loaders. No content is read directly.
 */
import type { ImageMetadata } from "astro";
import type { Location } from "@core/content/schemas.ts";

/** Optional pages (e.g. ochrana-osobnich-udaju) come from core; re-exported for existing imports. */
export { getOptionalPage } from "@core/content/load.ts";

/** Responsive widths that never upscale the source image. */
export function widthsFor(src: ImageMetadata, candidates: readonly number[]): number[] {
  const usable = candidates.filter((width) => width <= src.width);
  if (usable.length === 0) {
    return [src.width];
  }
  return usable;
}

/** Map link for a location: the stored mapUrl, else a Mapy.com link built from geo, else null. */
export function mapHref(location: Location): string | null {
  if (location.mapUrl !== null) {
    return location.mapUrl;
  }
  if (location.geo !== null) {
    const { lat, lng } = location.geo;
    return `https://mapy.com/zakladni?source=coor&id=${lng}%2C${lat}&x=${lng}&y=${lat}&z=17`;
  }
  return null;
}

/** "2026-11-05" → "5. 11. 2026" (non-breaking spaces). */
export function formatCzechDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (year === undefined || month === undefined || day === undefined) {
    return iso;
  }
  return `${Number(day)}. ${Number(month)}. ${year}`;
}

/** Content-contract bodies start at ##. Shift heading levels when a body sits deeper in the outline. */
export function shiftHeadings(html: string, by: number): string {
  if (by <= 0) {
    return html;
  }
  return html.replace(/<(\/?)h([1-6])(?=[\s>])/g, (_match, slash: string, level: string) => {
    const shifted = Math.min(6, Number(level) + by);
    return `<${slash}h${shifted}`;
  });
}

/** Markdown heading ids repeat across entries rendered on one page; namespace them per entry. */
export function prefixIds(html: string, prefix: string | null): string {
  if (prefix === null) {
    return html;
  }
  return html.replace(/(<h[1-6][^>]*\sid=")([^"]+)"/g, (_match, start: string, id: string) => {
    return `${start}${prefix}-${id}"`;
  });
}
