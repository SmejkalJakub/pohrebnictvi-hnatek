/**
 * Build mode (content-contract §8). Unset → "prototype", so a misconfigured build is a
 * no-index test site rather than a public one. Unknown values fail loudly (e.g. "prod").
 */
export type SiteMode = "prototype" | "production";

export function resolveMode(value: string | undefined): SiteMode {
  if (value === undefined || value.trim() === "") {
    return "prototype";
  }
  const normalised = value.trim();
  if (normalised === "prototype" || normalised === "production") {
    return normalised;
  }
  throw new Error(`SITE_MODE must be "prototype" or "production", got "${value}".`);
}

export function currentMode(): SiteMode {
  return resolveMode(process.env.SITE_MODE);
}
