/**
 * The agent-selected options (site.config.ts `options`) with this template's manifest defaults.
 * Resolution and validation live in core (resolveTemplateOptions, gate G-005).
 */
import { resolveTemplateOptions, type ResolvedOptions } from "@core/content/config.ts";
import manifest from "../../template.manifest.ts";

export type TemplateOptions = ResolvedOptions<typeof manifest.options>;

export function resolveOptions(selected: Record<string, string>): TemplateOptions {
  return resolveTemplateOptions({ options: selected }, manifest);
}
