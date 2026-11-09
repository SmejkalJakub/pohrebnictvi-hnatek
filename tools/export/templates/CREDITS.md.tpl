# Credits / Autorská práva a licence

Seznam písem a obrázků použitých na webu {{brandName}}. Generated at export ({{exportedDate}}).

## Písma / Fonts

Všechna písma jsou hostována s webem (balíčky `@fontsource`), web nevolá Google Fonts ani jiné CDN.
All fonts are self-hosted from `@fontsource` npm packages; the site makes no calls to font CDNs.

{{fontTable}}

Plné znění licencí je v balíčcích po instalaci: `node_modules/@fontsource/<písmo>/LICENSE`.
Full licence texts ship in each package: `node_modules/@fontsource/<font>/LICENSE`.

## Obrázky / Images

Tabulka vychází ze soupisu médií (`src/core/media/inventory.ts`) v době exportu. Při výměně obrázku v CMS ji aktualizujte, nebo ji vygenerujte znovu (`node src/core/cli/media-inventory.ts`).
Generated from the media inventory at export time; regenerate after replacing images.

{{imageNote}}

{{imageTable}}

## Software

Web je postaven na [Astro](https://astro.build) (MIT) a [Tailwind CSS](https://tailwindcss.com) (MIT). Úplný seznam balíčků a jejich verzí je v `package-lock.json`.
