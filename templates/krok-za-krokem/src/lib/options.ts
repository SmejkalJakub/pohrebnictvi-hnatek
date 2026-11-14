/**
 * The declared template options from site.config.ts with this template's manifest defaults.
 * Resolution and validation live in core (resolveTemplateOptions, gate G-005).
 */
import { resolveTemplateOptions, type ResolvedOptions } from "@core/content/config.ts";
import type { SiteConfig } from "@core/content/config.ts";
import manifest from "../../template.manifest.ts";

export type TemplateOptions = ResolvedOptions<typeof manifest.options>;

export function resolveOptions(config: SiteConfig): TemplateOptions {
  return resolveTemplateOptions(config, manifest);
}
