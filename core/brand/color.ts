/**
 * Colour arithmetic for the brand layer: sRGB hex ↔ OKLCH, WCAG 2 contrast, and lightness
 * adjustment that keeps hue and as much chroma as fits in sRGB.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string): boolean {
  return HEX.test(value);
}

export function parseHex(value: string): Rgb {
  const match = HEX.exec(value.trim());
  if (match === null || match[1] === undefined) {
    throw new Error(`Not a hex colour: "${value}"`);
  }
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((digit) => digit + digit)
      .join("");
  }
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function toHex(rgb: Rgb): string {
  const channel = (value: number): string =>
    Math.round(clamp01(value) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

function toLinear(value: number): number {
  if (value <= 0.04045) {
    return value / 12.92;
  }
  return ((value + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  if (value <= 0.0031308) {
    return value * 12.92;
  }
  return 1.055 * value ** (1 / 2.4) - 0.055;
}

/** WCAG 2 relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2 contrast ratio (1–21). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

export function toOklch(hex: string): Oklch {
  const { r, g, b } = parseHex(hex);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.sqrt(A * A + B * B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) {
    h += 360;
  }
  return { l: L, c, h };
}

function oklchToRgbUnclamped(color: Oklch): Rgb {
  const rad = (color.h * Math.PI) / 180;
  const A = color.c * Math.cos(rad);
  const B = color.c * Math.sin(rad);
  const l = (color.l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (color.l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (color.l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function inGamut(rgb: Rgb): boolean {
  const epsilon = 0.0001;
  return [rgb.r, rgb.g, rgb.b].every((value) => value >= -epsilon && value <= 1 + epsilon);
}

/** OKLCH → hex, reducing chroma until the colour fits sRGB. */
export function fromOklch(color: Oklch): string {
  let chroma = color.c;
  let rgb = oklchToRgbUnclamped({ ...color, c: chroma });
  while (!inGamut(rgb) && chroma > 0) {
    chroma = Math.max(0, chroma - 0.002);
    rgb = oklchToRgbUnclamped({ ...color, c: chroma });
  }
  return toHex(rgb);
}

/** Same hue, given lightness and (optionally capped) chroma. */
export function withLightness(hex: string, lightness: number, maxChroma?: number): string {
  const color = toOklch(hex);
  let c = color.c;
  if (maxChroma !== undefined) {
    c = Math.min(c, maxChroma);
  }
  return fromOklch({ l: clamp01(lightness), c, h: color.h });
}

/** Mix two colours in OKLab; `amount` 0 = a, 1 = b. */
export function mix(a: string, b: string, amount: number): string {
  const ca = toOklch(a);
  const cb = toOklch(b);
  const radA = (ca.h * Math.PI) / 180;
  const radB = (cb.h * Math.PI) / 180;
  const A = ca.c * Math.cos(radA) * (1 - amount) + cb.c * Math.cos(radB) * amount;
  const B = ca.c * Math.sin(radA) * (1 - amount) + cb.c * Math.sin(radB) * amount;
  const L = ca.l * (1 - amount) + cb.l * amount;
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) {
    h += 360;
  }
  return fromOklch({ l: L, c: Math.sqrt(A * A + B * B), h });
}

/**
 * Move a colour's lightness (keeping hue) until it reaches `ratio` against every background.
 * Direction: darker on light backgrounds, lighter on dark ones. Returns the original colour when
 * it already passes.
 */
export function ensureContrast(hex: string, backgrounds: readonly string[], ratio: number): string {
  const passes = (candidate: string): boolean => backgrounds.every((bg) => contrast(candidate, bg) >= ratio);
  if (passes(hex)) {
    return hex;
  }
  const bgLight = backgrounds.reduce((sum, bg) => sum + luminance(bg), 0) / backgrounds.length > 0.18;
  const start = toOklch(hex);
  let lightness = start.l;
  for (let step = 0; step < 100; step++) {
    if (bgLight) {
      lightness -= 0.01;
    } else {
      lightness += 0.01;
    }
    const candidate = fromOklch({ l: clamp01(lightness), c: start.c, h: start.h });
    if (passes(candidate)) {
      return candidate;
    }
    if (lightness <= 0 || lightness >= 1) {
      break;
    }
  }
  if (bgLight) {
    return "#000000";
  }
  return "#ffffff";
}
