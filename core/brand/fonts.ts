/**
 * Fonts a client brand may use (template-contract §8a). Every font is self-hosted from an
 * @fontsource package that core depends on, is SIL OFL 1.1, and has latin-ext files; every weight
 * listed renders "Příliš žluťoučký kůň úpěl ďábelské ódy". Fonts whose Czech accents sit badly
 * (Cormorant Garamond, docs/notes/s3-rodinna-tradice.md) are not offered.
 *
 * A brand board often names a font that is not here: pick the closest one and say so.
 */

export interface BrandFont {
  /** CSS font-family name. */
  family: string;
  /** @fontsource package name (in core/package.json). */
  package: string;
  /** File-name stem inside the package's files/ folder. */
  stem: string;
  category: "serif" | "sans-serif";
  /** Weights with latin and latin-ext files. */
  weights: readonly number[];
  /** Weights that also have an italic file. */
  italics: readonly number[];
  fallback: string;
}

const SERIF_FALLBACK = '"Iowan Old Style", Georgia, "Times New Roman", serif';
const SANS_FALLBACK = '"Segoe UI", system-ui, -apple-system, sans-serif';

export const BRAND_FONTS = {
  "playfair-display": {
    family: "Playfair Display",
    package: "@fontsource/playfair-display",
    stem: "playfair-display",
    category: "serif",
    weights: [400, 500, 600, 700],
    italics: [400],
    fallback: SERIF_FALLBACK,
  },
  "source-serif-4": {
    family: "Source Serif 4",
    package: "@fontsource/source-serif-4",
    stem: "source-serif-4",
    category: "serif",
    weights: [400, 600, 700],
    italics: [400],
    fallback: SERIF_FALLBACK,
  },
  lora: {
    family: "Lora",
    package: "@fontsource/lora",
    stem: "lora",
    category: "serif",
    weights: [400, 500, 600, 700],
    italics: [400],
    fallback: SERIF_FALLBACK,
  },
  "eb-garamond": {
    family: "EB Garamond",
    package: "@fontsource/eb-garamond",
    stem: "eb-garamond",
    category: "serif",
    weights: [400, 500, 600, 700],
    italics: [400],
    fallback: SERIF_FALLBACK,
  },
  literata: {
    family: "Literata",
    package: "@fontsource/literata",
    stem: "literata",
    category: "serif",
    weights: [400, 500, 600, 700],
    italics: [400],
    fallback: SERIF_FALLBACK,
  },
  spectral: {
    family: "Spectral",
    package: "@fontsource/spectral",
    stem: "spectral",
    category: "serif",
    weights: [300, 400, 600, 700],
    italics: [400],
    fallback: SERIF_FALLBACK,
  },
  inter: {
    family: "Inter",
    package: "@fontsource/inter",
    stem: "inter",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    italics: [],
    fallback: SANS_FALLBACK,
  },
  manrope: {
    family: "Manrope",
    package: "@fontsource/manrope",
    stem: "manrope",
    category: "sans-serif",
    weights: [400, 500, 600, 700, 800],
    italics: [],
    fallback: SANS_FALLBACK,
  },
  "source-sans-3": {
    family: "Source Sans 3",
    package: "@fontsource/source-sans-3",
    stem: "source-sans-3",
    category: "sans-serif",
    weights: [400, 600, 700],
    italics: [400],
    fallback: SANS_FALLBACK,
  },
  "public-sans": {
    family: "Public Sans",
    package: "@fontsource/public-sans",
    stem: "public-sans",
    category: "sans-serif",
    weights: [400, 600, 700],
    italics: [],
    fallback: SANS_FALLBACK,
  },
  figtree: {
    family: "Figtree",
    package: "@fontsource/figtree",
    stem: "figtree",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    italics: [],
    fallback: SANS_FALLBACK,
  },
} as const satisfies Record<string, BrandFont>;

export type BrandFontId = keyof typeof BRAND_FONTS;
export const BRAND_FONT_IDS = Object.keys(BRAND_FONTS) as [BrandFontId, ...BrandFontId[]];

/** CSS font-family value with the font's fallback stack. */
export function fontStack(id: BrandFontId): string {
  const font: BrandFont = BRAND_FONTS[id];
  return `"${font.family}", ${font.fallback}`;
}

export interface FontFile {
  /** Module specifier for a `?url` import, e.g. "@fontsource/lora/files/lora-latin-400-normal.woff2". */
  specifier: string;
  family: string;
  weight: number;
  style: "normal" | "italic";
  subset: "latin" | "latin-ext";
}

const UNICODE_RANGE = {
  latin:
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext":
    "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
} as const;

export function unicodeRange(subset: FontFile["subset"]): string {
  return UNICODE_RANGE[subset];
}

/** Every file needed for one brand font (both subsets, every listed weight and italic). */
export function fontFiles(id: BrandFontId): FontFile[] {
  const font: BrandFont = BRAND_FONTS[id];
  const files: FontFile[] = [];
  const subsets = ["latin-ext", "latin"] as const;
  for (const subset of subsets) {
    for (const weight of font.weights) {
      files.push({
        specifier: `${font.package}/files/${font.stem}-${subset}-${weight}-normal.woff2`,
        family: font.family,
        weight,
        style: "normal",
        subset,
      });
    }
    for (const weight of font.italics) {
      files.push({
        specifier: `${font.package}/files/${font.stem}-${subset}-${weight}-italic.woff2`,
        family: font.family,
        weight,
        style: "italic",
        subset,
      });
    }
  }
  return files;
}
