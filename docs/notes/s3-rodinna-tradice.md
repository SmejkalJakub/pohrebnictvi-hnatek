# S3: Template A `rodinna-tradice` (session notes)

**Status:** done, 2026-11-05. Built and checked against the neutral fixture only (prototype mode).

## What was built (`templates/rodinna-tradice/`)

**Wiring.**
- `package.json` scripts set `SITE_ROOT=../../fixtures/neutral` and `SITE_CONFIG=./fixture.site.config.ts`.
- `fixture.site.config.ts` holds A's default order: hero → family-story → services → next-steps → contact-summary.
- The project also has `astro.config.mjs` (`siteCore({ manifest })`, Tailwind Vite plugin, `@core` alias), `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts` and `template.manifest.ts`.
- The manifest declares `serviceDetailPages: false` and `articles: false`. It is `as const satisfies TemplateManifest`, so option values stay literal types.

**Routes.** These pages are emitted:
- `/`, `/jak-postupovat/`, `/sluzby/` (one long page with anchors, no `/sluzby/<slug>/`), `/rakve/`, `/kvetiny/`, `/o-nas/` and `/kontakt/`.
- `/cenik/` uses the `cenik/[...path].astro` pattern and is not emitted when pricing is hidden.
- `/ochrana-osobnich-udaju/` uses `[...path].astro` and is not emitted when the page file is missing.
- `/404.html` is emitted. There are no `/clanky/` routes.

**Components (A only, `src/components/`):**
- From the design-differentiation §2.4 list: `UtilityStrip`, `LetterheadHeader`, `EditorialHero`, `TraditionPanel`, `ProseServiceGroups`, `MarginToc`, `FigureGallery`, `AddressCard`, `DotLeaderPriceList`, `RichFooter`.
- Helpers: `MarginSection` (home section shell with a margin label), `HomeFamilyStory`, `HomeFirstSteps`, `HomeVisitUs`, `HomeCatalogueLinks`, `HoursLetter` (office hours block), `NonstopPanel` (separately headed emergency block), `PageIntro`, `CatalogueEmpty`, `ShiftedBody` (nested Markdown body).
- Layout: `src/layouts/LetterLayout.astro`. Strings: `src/i18n/cs.ts`. Helpers: `src/lib/options.ts`, `src/lib/content.ts`. Styles: `src/styles/global.css`, `src/styles/fonts.css`.

**Core usage.**
- Data comes only through `@core/content/load.ts`, `@core/media/resolve.ts` and the `@core/format/*` helpers.
- Core components used: `PriceValue`, `DemoPricingNotice`, `EmergencyPhoneLink`, `PhoneLink`, `PlaceholderMark`, `MissingFact`, `PrototypeBanner`, `SeoHead`, `StructuredData`.

**JS.** One small inline module for the menu disclosure (`aria-expanded`, Escape closes it). Without JS the menu list is simply shown.

## Options implemented (every value built and looked at)

| Option | Values | What changes |
| --- | --- | --- |
| `palette` | `ivory-umber` (default), `ivory-olive`, `ivory-forest` | Accent colour. `ivory-forest` (#1F3D2E) also turns the utility strip and emergency rules forest green. |
| `fontPair` | `garamond-source` (default), **`literata`** | EB Garamond headings with Source Sans 3 body, or Literata throughout. See "Deviation" below. |
| `heroVariant` | `photo-right` (default), `typographic` | 4:5 portrait photo on the right, or the `TraditionPanel`. `photo-right` falls back to the panel when there is no hero image. |
| `emergencyEmphasis` | `standard` (default), `high` | `high` makes the strip sticky on desktop too and shows a larger number, also on mobile (label over number). The hero also gains an inline emergency line. |

`catalogue-links` is offered as an optional homepage section but is not in the default order. All section orders are honoured.

Variant builds checked:
- umber, garamond, photo-right, standard (the default)
- olive, literata, typographic, high, with the reordered sections hero → next-steps → contact-summary → family-story → services → catalogue-links
- forest, garamond, photo-right, high
- umber, literata, typographic, standard
- a **copy of the fixture with every image ref removed and zero coffins and flowers**. It was made in the scratchpad; `fixtures/` was not edited.

## Deviation: font pair `cormorant-literata` replaced by `literata`

Design-differentiation §2.3 lists Cormorant Garamond with Literata as a *candidate*, to be verified in S3. It failed the check:
- In Chrome (both the user's real Chrome and headless) the `@fontsource/cormorant-garamond@5.3.0` faces place Czech accents visibly off the letter. The acute on í and the carons on ř and ž sit to the right.
- This happens at every weight from 300 to 700, also with correct `unicode-range` subsetting.
- EB Garamond, Source Sans 3 and Literata render the pangram "Příliš žluťoučký kůň úpěl ďábelské ódy" correctly in every weight used: EB Garamond 400/500/400i, Source Sans 3 400/600/400i, Literata 400/500/600/400i.

The second pair is therefore `literata`: Literata 500 for display, 600 for subheads, 400 body. **Follow-ups:**
- design-differentiation §2.3 should be updated.
- `@fontsource/cormorant-garamond` is now unused but still listed in this template's `package.json`. Dropping it needs a lockfile pass, so it was left in place.

## Verification

- `npm run build -w templates/rodinna-tradice`: passes, 10 pages.
- `npm run check -w templates/rodinna-tradice`: 0 errors, 0 warnings, 0 hints.
- `npm run build:production -w templates/rodinna-tradice`: fails as expected, with 54 errors on G-011 (3), G-012, G-020, G-021, G-031 (31), G-032 (10) and G-040 (7). There are no other rules and no G-005.
- Root `npm run check` (lint, typecheck, unit tests, harness): passes.
- `npm ci` was not run, because the worktree already had a root `node_modules` linked to it.

**DOM audit (all 10 pages, from the built HTML):**
- One `h1` per page and no skipped heading levels.
- Landmarks: `header`, `nav`, `main#obsah`, `footer`, plus a skip link.
- No duplicate ids (nested Markdown heading ids are namespaced per entry) and no `img` without `alt`.
- No `[data-office-hours]` container holds the emergency link or the words "nonstop" or "24 hodin".
- Robots is `noindex,nofollow` in prototype.

**Reflow and invariant 1:**
- At 375 px and 320 px no page scrolls horizontally.
- The emergency link sits in the sticky strip at y = 56–100 px (below the prototype banner) and is 44 px tall.
- No link or button is smaller than 24 × 24 px. The primary targets (strip, menu button, phone links) are at least 44 px.

**Contrast, computed:**

| Pair | Ratio |
| --- | --- |
| Ink on paper | 13.3 |
| Muted on paper / on surface | 6.7 / 6.1 |
| Umber on paper / on surface | 7.9 / 7.2 |
| Olive on paper / on surface | 6.6 / 6.0 |
| Forest on paper / on surface | 10.7 / 9.7 |
| Paper on strip (ink / forest) | 13.3 / 10.7 |
| Ink on review-flag background | 11.5 |
| Rule as a UI border, on paper / on surface | 3.67 / 3.33 |

**Performance:** HTML is about 5 KB gzipped per page and CSS about 7 KB gzipped, with no external JS file. There are no CDN or Google Fonts requests.

**Screenshots** are in `docs/notes/screens/rodinna-tradice/`: desktop full pages at 1280 for each variant, the no-images build, and mobile at 375. Mobile shots were taken through a 375 px iframe, because headless Chrome will not size a window below about 500 px.

**Not done here (S6 scope):** axe-core, a manual keyboard pass, the 200 % zoom pass and the greyscale "recolour test". No `templates/rodinna-tradice/tests/` were written.

## Self-check against design-differentiation §6 (A's side)

- [x] **Components.** A's components are all A-specific names from §2.4 plus local helpers, and the only shared imports are `@core/*`. `templates/dustojna-jednoduchost/` was deliberately not opened, so the overlap check itself is for S6.
- [x] **Homepage order and hero.** The order is hero → family-story → services → next-steps → contact-summary. The hero DOM is `section[data-hero] > .hero-text (h1, lead, [emergency line], body) + .hero-aside (figure | TraditionPanel)`.
- [x] **Header.** Centred letterhead: wordmark, then a hairline rule, then the centred text nav. On mobile the wordmark sits beside a "Menu" button and the menu is an in-flow list, not an overlay.
- [x] **Emergency CTA.** A dark utility strip above the header, sticky on mobile. At 1280 it sits at the top of the first viewport, and with emphasis `high` it is sticky there too. Invariant 1 was measured at 375 (see above).
- [x] **Services IA.** Anchors (`/sluzby/#<slug>`, category anchors `#obrady` and so on). No detail routes are emitted.
- [x] **Primary HTML structures.** Guidance is `article > section` with numbered `h2`s and a margin TOC. Catalogues are `ul > li > figure` with one-wide-then-two-narrow rhythm. Pricing is `dl` with dot leaders.
- [ ] **Recolour test.** Not run (S6).
- [x] **With all images removed** the build still looks complete: the tradition panel, captioned text entries in the galleries, and "Katalog připravujeme" with an office phone.
- [~] **Accessibility basics.** Partly checked (see Verification). axe-core and the keyboard and zoom passes are left for S6.
- [x] **Forbidden list.** No gradients, carousels, animation, icon-card grids, shadows or stock imagery. The only icon is the phone glyph in the strip.

## Core and contract gaps (worked around inside the template)

1. **Option defaults.** `SiteConfig.options` is a free record, and core does not fill in manifest defaults. `src/lib/options.ts` resolves them and rejects undeclared values.
2. **No optional-page loader.** `getPage()` throws when a page is missing, so `src/lib/content.ts#getOptionalPage` wraps it in try/catch. This drives `/ochrana-osobnich-udaju/` and the footer privacy link.
3. **No heading offset or id namespacing for nested Markdown bodies.** Bodies start at `##`, but here they sit under an `h2` (guidance) or `h3` (services). `ShiftedBody` rewrites heading levels and prefixes ids with the entry id. A remark/rehype option in core would be cleaner.
4. **Markdown heading ids keep diacritics** (for example `co-služba-zahrnuje`). Content-contract §5 asks for ASCII in-page anchors. Core's Markdown config should slugify to ASCII.
5. **The media virtual module imports every file in `src/assets/media`**, so unreferenced images (for example `placeholder-4x5.png`) are still emitted to `dist/_astro/`.
6. **The map feature is incomplete.** `features.map: "embed-on-click"` is not implemented; the template always renders the "Zobrazit na mapě" link and no iframe. Either the manifest needs a way to declare map support, or G-005 should reject the setting for this template.
7. **Fonts tooling.** `@fontsource/*/latin-<w>.css` and `latin-ext-<w>.css` ship **without `unicode-range`**. Importing them makes the subsets compete for every character. `src/styles/fonts.css` therefore declares the latin and latin-ext faces itself, with ranges taken from the packages' combined CSS. This is worth applying to template B too.
8. **Tailwind name clash (for both templates).** Tailwind v4 scans templates, so a scoped class named like a utility also gets the global utility. `float-right` caused a mobile overflow bug here, and the class is now `figure-right`.

## Left undone

- The S6 items listed above, and template tests.
- Updating design-differentiation §2.3 for the `literata` pair. That is another doc, so it is outside this session's boundaries.
- Removing `@fontsource/cormorant-garamond` from `package.json`, which needs a lockfile pass.
