/**
 * Where the landscape bands go and which photo each one shows (docs/notes/s8-ticha-krajina.md §4).
 * Pure functions; the photos come from core getLandscapes() (site/landscapes.json).
 *
 * - Bands sit only between passages: never after the stamp line, never before the footer.
 * - Home and Služby: after the 1st, 3rd, 5th … passage, never after the last one.
 * - Long text pages (O nás, Pro účastníky, Pohřeb předem): one band after the middle passage,
 *   when there are at least three.
 * - A page takes photos in list order from a fixed start (home starts with the first photo), never
 *   shows the same entry twice, and when the set runs out the remaining bands are space.
 */
import type { LandscapeImage } from "@core/content/schemas.ts";

/** Fixed start per page, so neighbouring pages open with different photos. */
const PAGE_START = {
  home: 0,
  sluzby: 1,
  "o-nas": 2,
  "pro-ucastniky": 3,
  "pohreb-predem": 4,
} as const;
export type BandPage = keyof typeof PAGE_START;

/** True when a band follows passage `index` (0-based) of `total` on home and Služby. */
export function bandAfterAlternate(index: number, total: number): boolean {
  if (index >= total - 1) {
    return false;
  }
  return index % 2 === 0;
}

/** True when a band follows passage `index` of `total` on a long text page (the middle one). */
export function bandAfterMiddle(index: number, total: number): boolean {
  if (total < 3) {
    return false;
  }
  return index === Math.ceil(total / 2) - 1;
}

/**
 * The photos for `count` bands on `page`, in order. An entry is null when the set has run out
 * (or is empty): that band renders as 96 px of space.
 */
export function photosForBands(
  images: readonly LandscapeImage[],
  page: BandPage,
  count: number,
): (LandscapeImage | null)[] {
  const result: (LandscapeImage | null)[] = [];
  const total = images.length;
  for (let index = 0; index < count; index += 1) {
    if (index >= total) {
      result.push(null);
      continue;
    }
    const pick = images[(PAGE_START[page] + index) % total];
    result.push(pick ?? null);
  }
  return result;
}

/** The line under a band: place, then the image's caption and credit when filled. */
export function bandCaption(entry: LandscapeImage, creditPrefix: string): string {
  const parts: string[] = [entry.place];
  if (entry.image.caption !== null) {
    parts.push(entry.image.caption);
  }
  if (entry.image.credit !== null) {
    parts.push(`${creditPrefix} ${entry.image.credit}`);
  }
  return parts.join(" · ");
}
