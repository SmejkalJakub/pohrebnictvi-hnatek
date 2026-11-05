/** Resolve ImageRef objects to astro:assets ImageMetadata (Astro runtime only). */
import type { ImageMetadata } from "astro";
import { media } from "virtual:site-core/data";
import type { ImageRef } from "../content/schemas.ts";
import { normalizeMediaFile } from "./normalize.ts";

export interface ResolvedImage {
  src: ImageMetadata;
  /** "" when decorative. */
  alt: string;
  decorative: boolean;
  caption: string | null;
  credit: string | null;
  isPlaceholder: boolean;
  /** CSS object-position value for cropping. */
  objectPosition: string;
}

const FOCUS_TO_POSITION: Record<ImageRef["focus"], string> = {
  center: "50% 50%",
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
};

export function resolveImage(ref: ImageRef): ResolvedImage {
  const name = normalizeMediaFile(ref.file);
  const src = media[name];
  if (src === undefined) {
    throw new Error(`Image "${name}" not found in src/assets/media (gate G-003).`);
  }
  let alt = ref.alt;
  if (ref.decorative) {
    alt = "";
  }
  return {
    src,
    alt,
    decorative: ref.decorative,
    caption: ref.caption,
    credit: ref.credit,
    isPlaceholder: ref.source === "placeholder",
    objectPosition: FOCUS_TO_POSITION[ref.focus],
  };
}

export function resolveOptionalImage(ref: ImageRef | null): ResolvedImage | null {
  if (ref === null) {
    return null;
  }
  return resolveImage(ref);
}
