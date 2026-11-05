# S4 · Template B `dustojna-jednoduchost`: hand-over (WORK IN PROGRESS)

The session stopped partway through because it hit its usage limit. Nothing has been built or checked yet.

## Done (committed as WIP)
- `package.json` scripts set `SITE_CONFIG=./fixture.site.config.ts`. Added `fixture.site.config.ts` (B defaults), `astro.config.mjs` (siteCore({ manifest }), Tailwind, `@core` alias, `TEMPLATE_OUT_DIR`), `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`.
- `template.manifest.ts`: as in template-contract §3, plus `company.logo` slot and full `pageFields`. Uses `as const satisfies` so option types are literal.
- `src/lib/options.ts` (resolves options against manifest defaults), `src/lib/site.ts` (office/flower phones, main location, map href with an OSM fallback from geo, `pageExists`, `groupServices`, `seoTitle`, `bodyHasHeadings`).
- `src/i18n/cs.ts`: UI strings and category/phase/situation/flower-type labels (no business facts).
- `src/styles/global.css`: palette tokens via `html[data-palette]`, font pairs via `html[data-font]`, `--header-h`/`--bar-h` via `html[data-emphasis]`, and body padding plus scroll-padding reserved for the fixed bar. Also buttons, bands, prose, review flags, emergency panel, hours table and checklist boxes. `src/styles/print.css` holds the print styles.
- `src/components/LineIcon.astro` (Feather paths, MIT) and `StickyHeaderWithEmergency.astro`. In the header, DOM order is brand → nav (toggle + list) → emergency, so the focus order is right. The inline nav appears from 80rem. JS is limited to an inline disclosure script (aria-expanded, Escape). With no JS the list is shown in flow.

## Decisions to keep
- Emergency placement: the header button from 768 px; below that, the MobileActionBar (fixed bottom). In `high` emphasis the header button gets a second line "24 hodin denně", and the bar buttons show their numbers.
- The MobileActionBar goes right after the header in the DOM, as `<aside aria-label="Rychlé volání">`, hidden from md up and in print.
- Guidance print: closed `<details>` do not print, so each body is rendered a second time in a `.print-only` div.
- No print button (JS is limited to the nav), so the page shows a Ctrl+P hint instead.
- Empty page bodies are hidden with `.prose-b:empty`. Render `<Content/>` on one line with no whitespace.
- Service detail: add h2 "Co zahrnuje" only when the body has no `##` headings. "Související ceny" is a link to `/cenik/#<groupId>` (no prices on the detail page).
- Privacy route is `ochrana-osobnich-udaju/[...path].astro`; its getStaticPaths uses `pageExists`.

## Left to do
Layout `src/layouts/Site.astro` (html data-attrs, SeoHead, StructuredData, `js` class script, PrototypeBanner, skip link, `main#obsah`). Then MobileActionBar, CompactFooter, PracticalHero + CtaTier, FirstStepsStepper, ServiceIndexList, ServiceDetailLayout, PhasedChecklist, UniformCatalogueGrid, InfoRow, FactSheet, PriceTable (role attrs + reflow), EmergencyPanel, ReviewFlag ("Neověřený text", G-040), and the catalogue-links home section. Then every page in template-contract §4, build/check/production-gate verification, browser review at 375 and 1280 in every option, screenshots, and the §6 self-check.

## Core gaps noticed so far
- `getPage()` does not expose the raw body, so templates cannot tell whether a page body is empty (worked around in CSS).
- There is no headless core component for the G-040 "Neověřený text" marker, so the template must render it itself.
- There is no way to check that an optional page exists without catching the error `getPage()` throws.
