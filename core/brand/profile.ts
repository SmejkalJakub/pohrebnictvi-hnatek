/**
 * Client brand profile (template-contract §8a): the colours, fonts and mark taken from the
 * client's brand board, turned into a validated set of CSS custom properties ("brand roles").
 *
 * Core guarantees legibility, templates decide interpretation:
 *  - every role meant for text meets WCAG AA against the background it is meant for (core darkens
 *    or lightens the brand colour along its own hue when needed, and reports it, gate G-090);
 *  - each template maps the roles onto its own tokens in its global.css under [data-brand], so the
 *    same brand reads as a letterhead in A, a night line in C, two colour fields in D, and so on.
 *
 * Roles (all as --brand-<role>):
 *   light side   ground, surface, surface-2, ink, muted, rule, primary-text, secondary-text
 *   fills        primary, on-primary, muted-on-primary, rule-on-primary, primary-hover
 *   dark side    deep, deep-2, on-deep, muted-on-deep, rule-on-deep, primary-on-deep, signal-on-deep
 *   decoration   secondary, neutral (non-text only: rules, ornaments, the mark)
 *   type         font-display, font-body (only when the brand names a font)
 */
import { z } from "astro/zod";
import { contrast, ensureContrast, isHex, mix, parseHex, toHex, toOklch, withLightness } from "./color.ts";
import { BRAND_FONT_IDS, fontStack } from "./fonts.ts";

const Hex = z
  .string()
  .refine(isHex, { message: "Barva musí být hex, např. #0B3D2C." })
  .transform((value) => toHex(parseHex(value)));

export const BrandProfile = z.object({
  colors: z.object({
    /** The main brand colour (logo colour). Used for fills, links, the emergency line. */
    primary: Hex,
    /** A second brand colour (often gold or a warm accent). Decoration; text only after adjustment. */
    secondary: Hex.nullable().default(null),
    /** A neutral from the board (often grey). Decoration only. */
    neutral: Hex.nullable().default(null),
    /** The board's background ("krémová", "slonová kost"). Must be light. */
    ground: Hex.nullable().default(null),
  }),
  fonts: z
    .object({
      /** Headings. One of core/brand/fonts.ts. */
      display: z.enum(BRAND_FONT_IDS).nullable().default(null),
      /** Body text. One of core/brand/fonts.ts. */
      body: z.enum(BRAND_FONT_IDS).nullable().default(null),
    })
    .default({ display: null, body: null }),
  /**
   * The logo's symbol or monogram on its own (SVG or PNG in src/assets/media), shown by templates
   * as a quiet signature in one place (template-contract §8a). Decorative: no alt text.
   */
  mark: z.string().min(1).nullable().default(null),
  /** Where the profile comes from, e.g. "brand/preview/brand-overview.png (2026-11-13)". */
  source: z.string().max(200).nullable().default(null),
});
export type BrandProfile = z.infer<typeof BrandProfile>;
export type BrandProfileInput = z.input<typeof BrandProfile>;

export interface BrandAdjustment {
  role: string;
  from: string;
  to: string;
  reason: string;
}

export interface BrandTokens {
  /** CSS custom property name (without --brand-) → value. */
  vars: Record<string, string>;
  /** Colours core moved to keep text legible, for the gate report (G-090). */
  adjustments: BrandAdjustment[];
  /** The ground is too dark to be a page background, so core used its own. */
  groundReplaced: boolean;
}

const AA = 4.5;
const LARGE = 3;

function lightOrDark(hex: string): "light" | "dark" {
  if (toOklch(hex).l >= 0.6) {
    return "light";
  }
  return "dark";
}

/** Derive every brand role from a profile. Deterministic: the same profile gives the same CSS. */
export function deriveBrandTokens(profile: BrandProfile): BrandTokens {
  const adjustments: BrandAdjustment[] = [];
  const primary = profile.colors.primary;
  const hue = toOklch(primary);

  // Ground: the board's background when it is light enough to read on, else a warm-neutral
  // white tinted towards the primary.
  let ground = withLightness(primary, 0.975, 0.008);
  let groundReplaced = false;
  if (profile.colors.ground !== null) {
    if (toOklch(profile.colors.ground).l >= 0.9) {
      ground = profile.colors.ground;
    } else {
      groundReplaced = true;
    }
  }
  const surface = mix(ground, withLightness(primary, 0.85, 0.03), 0.12);
  const surface2 = mix(ground, withLightness(primary, 0.8, 0.035), 0.24);

  const ink = ensureContrast(withLightness(primary, 0.24, Math.min(hue.c, 0.03)), [ground, surface2], 12);
  const muted = ensureContrast(
    withLightness(primary, 0.47, Math.min(hue.c, 0.025)),
    [ground, surface, surface2],
    AA,
  );
  const rule = ensureContrast(withLightness(primary, 0.66, Math.min(hue.c, 0.03)), [ground], LARGE);

  const record = (role: string, from: string, to: string, reason: string): void => {
    if (from !== to) {
      adjustments.push({ role, from, to, reason });
    }
  };

  const primaryText = ensureContrast(primary, [ground, surface, surface2], AA);
  record("primary-text", primary, primaryText, `kontrast textu ${AA}:1 na podkladu`);

  // Text on a primary fill: the ground colour when it reads, otherwise ink.
  let onPrimary = ground;
  if (contrast(ground, primary) < AA) {
    onPrimary = ensureContrast(ink, [primary], AA);
  }
  const mutedOnPrimary = ensureContrast(mix(onPrimary, primary, 0.28), [primary], AA);
  const ruleOnPrimary = ensureContrast(mix(onPrimary, primary, 0.55), [primary], LARGE);
  let primaryHover = withLightness(primary, hue.l - 0.06);
  if (hue.l < 0.4) {
    primaryHover = withLightness(primary, hue.l + 0.07);
  }

  const secondary = profile.colors.secondary ?? primary;
  const secondaryText = ensureContrast(secondary, [ground, surface], AA);
  if (profile.colors.secondary !== null) {
    record("secondary-text", secondary, secondaryText, `kontrast textu ${AA}:1 na podkladu`);
  }
  const neutral = profile.colors.neutral ?? rule;

  // Dark side: a deep version of the primary, for night grounds, footers and bands.
  let deep = withLightness(primary, 0.2, Math.min(hue.c, 0.045));
  if (lightOrDark(primary) === "dark" && hue.l < 0.2) {
    deep = primary;
  }
  const deep2 = withLightness(deep, toOklch(deep).l + 0.05);
  const onDeep = ensureContrast(withLightness(ground, 0.95, 0.015), [deep, deep2], 12);
  const mutedOnDeep = ensureContrast(withLightness(ground, 0.8, 0.015), [deep, deep2], AA);
  const ruleOnDeep = ensureContrast(withLightness(primary, 0.5, 0.03), [deep, deep2], LARGE);
  const primaryOnDeep = ensureContrast(primary, [deep, deep2], AA);
  record("primary-on-deep", primary, primaryOnDeep, `kontrast textu ${AA}:1 na tmavém podkladu`);
  const signalOnDeep = ensureContrast(secondary, [deep, deep2], AA);
  if (profile.colors.secondary !== null) {
    record("signal-on-deep", secondary, signalOnDeep, `kontrast textu ${AA}:1 na tmavém podkladu`);
  }

  const vars: Record<string, string> = {
    ground,
    surface,
    "surface-2": surface2,
    ink,
    muted,
    rule,
    "primary-text": primaryText,
    "secondary-text": secondaryText,
    primary,
    "on-primary": onPrimary,
    "muted-on-primary": mutedOnPrimary,
    "rule-on-primary": ruleOnPrimary,
    "primary-hover": primaryHover,
    deep,
    "deep-2": deep2,
    "on-deep": onDeep,
    "muted-on-deep": mutedOnDeep,
    "rule-on-deep": ruleOnDeep,
    "primary-on-deep": primaryOnDeep,
    "signal-on-deep": signalOnDeep,
    secondary,
    neutral,
  };
  if (profile.fonts.display !== null) {
    vars["font-display"] = fontStack(profile.fonts.display);
  }
  if (profile.fonts.body !== null) {
    vars["font-body"] = fontStack(profile.fonts.body);
  }
  return { vars, adjustments, groundReplaced };
}

/** The :root block every template receives when the site has a brand profile. */
export function brandRootCss(tokens: BrandTokens): string {
  const lines = Object.entries(tokens.vars).map(([name, value]) => `  --brand-${name}: ${value};`);
  return `:root {\n${lines.join("\n")}\n}`;
}
