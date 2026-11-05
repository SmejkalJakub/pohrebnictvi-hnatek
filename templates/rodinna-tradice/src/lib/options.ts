/**
 * Resolve the agent-selected options (site.config.ts `options`) against this template's manifest.
 * Core validates declared values (G-005) but does not fill in defaults, so the template does.
 */
import manifest from "../../template.manifest.ts";

type Options = typeof manifest.options;
type ValueOf<K extends keyof Options> = Options[K]["values"][number];

export interface TemplateOptions {
  palette: ValueOf<"palette">;
  fontPair: ValueOf<"fontPair">;
  heroVariant: ValueOf<"heroVariant">;
  emergencyEmphasis: ValueOf<"emergencyEmphasis">;
}

function pick<K extends keyof Options>(name: K, selected: Record<string, string>): ValueOf<K> {
  const declaration = manifest.options[name];
  const value = selected[name];
  if (value === undefined) {
    return declaration.default as ValueOf<K>;
  }
  if (!(declaration.values as readonly string[]).includes(value)) {
    throw new Error(`Option ${name}="${value}" is not declared by rodinna-tradice (gate G-005).`);
  }
  return value as ValueOf<K>;
}

export function resolveOptions(selected: Record<string, string>): TemplateOptions {
  return {
    palette: pick("palette", selected),
    fontPair: pick("fontPair", selected),
    heroVariant: pick("heroVariant", selected),
    emergencyEmphasis: pick("emergencyEmphasis", selected),
  };
}
