/**
 * Resolves the declared template options from site.config.ts. Values were already checked
 * against the manifest by the gate (G-005); unknown or absent values fall back to the default.
 */
import type { SiteConfig } from "@core/content/config.ts";
import manifest, {
  type EmergencyEmphasisOption,
  type FontPairOption,
  type HeroVariantOption,
  type PaletteOption,
} from "../../template.manifest.ts";

export interface TemplateOptions {
  palette: PaletteOption;
  fontPair: FontPairOption;
  heroVariant: HeroVariantOption;
  emergencyEmphasis: EmergencyEmphasisOption;
}

function pick<T extends string>(declared: { values: readonly T[]; default: T }, value: string | undefined): T {
  const match = declared.values.find((candidate) => candidate === value);
  if (match === undefined) {
    return declared.default;
  }
  return match;
}

export function resolveOptions(config: SiteConfig): TemplateOptions {
  const chosen = config.options;
  return {
    palette: pick(manifest.options.palette, chosen.palette),
    fontPair: pick(manifest.options.fontPair, chosen.fontPair),
    heroVariant: pick(manifest.options.heroVariant, chosen.heroVariant),
    emergencyEmphasis: pick(manifest.options.emergencyEmphasis, chosen.emergencyEmphasis),
  };
}
