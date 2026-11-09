/** `{{name}}` substitution for the document templates in tools/export/templates. */

// `(?<!\$)` leaves GitHub Actions expressions such as `${{ github.sha }}` alone.
const PLACEHOLDER = /(?<!\$)\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g;

/** Replaces every placeholder; throws on a placeholder without a value, so nothing ships half-filled. */
export function renderTemplate(template: string, values: Record<string, string>): string {
  const missing = new Set<string>();
  const rendered = template.replace(PLACEHOLDER, (_match: string, name: string) => {
    const value = values[name];
    if (value === undefined) {
      missing.add(name);
      return "";
    }
    return value;
  });
  if (missing.size > 0) {
    throw new Error(`Template placeholders without a value: ${[...missing].join(", ")}`);
  }
  return rendered;
}
