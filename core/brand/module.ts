/**
 * Source of the brand part of "virtual:site-core/data": the brand CSS (font faces + :root roles)
 * and what the layout needs to switch the template's [data-brand] mapping on.
 * Font files are imported with `?url`, so Vite emits only the chosen brand fonts.
 */
import { BRAND_FONTS, fontFiles, unicodeRange, type BrandFontId } from "./fonts.ts";
import { brandRootCss, deriveBrandTokens, type BrandProfile } from "./profile.ts";

export function brandModuleSource(profile: BrandProfile | null): string {
  if (profile === null) {
    return ['export const brandCss = "";', "export const brand = null;"].join("\n");
  }
  const tokens = deriveBrandTokens(profile);
  const imports: string[] = [];
  const faces: string[] = [];
  const chosen = new Set<BrandFontId>();
  if (profile.fonts.display !== null) {
    chosen.add(profile.fonts.display);
  }
  if (profile.fonts.body !== null) {
    chosen.add(profile.fonts.body);
  }
  let index = 0;
  for (const id of chosen) {
    for (const file of fontFiles(id)) {
      const name = `brandFont${index}`;
      index++;
      imports.push(`import ${name} from ${JSON.stringify(`${file.specifier}?url`)};`);
      faces.push(
        [
          "@font-face {",
          `  font-family: '${file.family}';`,
          `  font-style: ${file.style};`,
          `  font-weight: ${file.weight};`,
          "  font-display: swap;",
          `  src: url(\${${name}}) format('woff2');`,
          `  unicode-range: ${unicodeRange(file.subset)};`,
          "}",
        ].join("\n"),
      );
    }
  }
  const css = [...faces, brandRootCss(tokens)].join("\n");
  const brand = {
    fonts: {
      display: profile.fonts.display,
      body: profile.fonts.body,
      displayCategory: profile.fonts.display === null ? null : BRAND_FONTS[profile.fonts.display].category,
      bodyCategory: profile.fonts.body === null ? null : BRAND_FONTS[profile.fonts.body].category,
    },
    mark: profile.mark,
    adjustments: tokens.adjustments,
  };
  return [
    ...imports,
    `export const brandCss = \`${css.replace(/\\/g, "\\\\")}\`;`,
    `export const brand = ${JSON.stringify(brand)};`,
  ].join("\n");
}
