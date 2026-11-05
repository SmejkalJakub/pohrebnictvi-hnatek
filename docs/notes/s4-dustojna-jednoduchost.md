# S4 · Template B `dustojna-jednoduchost`: session notes

**Status:** done 2026-11-05. All routes build. `astro check` reports 0 errors, warnings and hints. Root `npm run check` passes (lint, tsc, unit tests and harness). The production build fails only on the expected gate rules.

## What was built (`templates/dustojna-jednoduchost/`)

| Area | Files |
| --- | --- |
| Wiring | `package.json` (scripts set `SITE_ROOT` and `SITE_CONFIG=./fixture.site.config.ts`), `fixture.site.config.ts`, `astro.config.mjs` (`siteCore({ manifest })`, Tailwind Vite plugin, `@core` alias, optional `TEMPLATE_OUT_DIR`), `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`, `template.manifest.ts` |
| Shell | `src/layouts/Site.astro` (options become `data-*` on `<html>`; SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`) |
| B components (design-differentiation §3.4) | `StickyHeaderWithEmergency`, `MobileActionBar`, `PracticalHero`, `CtaTier`, `FirstStepsStepper`, `ServiceIndexList`, `ServiceDetailLayout`, `PhasedChecklist`, `UniformCatalogueGrid`, `InfoRow`, `FactSheet`, `PriceTable`, PrintStyles (`src/styles/print.css`) |
| Supporting components | `CompactFooter`, `EmergencyPanel`, `HoursTable`, `PageHeading`, `ReviewFlag`, `HeroFigure`, `StoryFigure`, `CatalogueImage`, `LineIcon`, `When` |
| Other | `src/i18n/cs.ts` (UI strings only), `src/lib/options.ts`, `src/lib/site.ts`, `src/styles/global.css` |

**Routes (17 pages with the fixture):**
- `/`, `/jak-postupovat/`, `/sluzby/`, plus 7 × `/sluzby/<slug>/`
- `/rakve/`, `/kvetiny/`, `/o-nas/`, `/kontakt/`
- `/cenik/` (conditional, as `cenik/[...path].astro`)
- `/ochrana-osobnich-udaju/` (emitted only when the page file exists)
- `/404.html`

There are no article routes (`supports.articles: false`).

## Options (every value implemented and checked in the browser)

| Option | Values | What changes |
| --- | --- | --- |
| `palette` | `slate-forest` (default), `slate-blue` | `html[data-palette]` swaps `--c-accent` and `--c-accent-strong` |
| `fontPair` | `public-sans` (default), `plex-sans-serif` | Public Sans throughout, or IBM Plex Sans body with an IBM Plex Serif H1 |
| `heroVariant` | `text-only` (default), `text-with-image` | Adds a 3:2 `home.heroImage` **after** the CTA tier. Falls back to text-only when there is no image. |
| `emergencyEmphasis` | `standard` (default), `high` | The header button gets a second line "24 hodin denně". The mobile bar buttons show both numbers. The hero CTA and emergency panels get a larger number and "24 hodin denně". `--bar-h`/`--header-h` grow to match. |

Option values are read through `resolveOptions()`, which falls back to the manifest defaults. G-005 already rejects undeclared values.

## Key decisions

- **Emergency placement:** below 768 px the fixed bottom bar carries it ("Nonstop převoz" filled, "Kancelář" outlined). From 768 px the sticky header button does. The inline nav appears from 1280 px (`--breakpoint-nav: 80rem`); 768–1279 px uses the Menu dropdown plus the header button. The footer deliberately does not repeat the emergency CTA (§3.1). The contact page and 404 have a separately headed `EmergencyPanel`.
- **Bar clearance:** `<body>` reserves `padding-bottom: var(--bar-h) + safe-area`, and `html` sets `scroll-padding-top`/`-bottom` for the sticky header and the bar. Verified by script: focus moved to every link and summary on 4 pages at 375 px, and none was obscured (WCAG 2.4.11).
- **Menu:** `<nav>` contains the toggle and the list, so the focus order matches the visual order. The inline script (≈0.6 KB, the only JS) toggles `aria-expanded` and `data-open` and closes on Escape. With no JS the list is shown in flow and the toggle is hidden.
- **Guidance print:** closed `<details>` do not print, so each body is rendered a second time in a `.print-only` block. The `<details>` is hidden in print. Checklists are CSS-drawn boxes (printable, not falsely interactive). There is no print button, because JS is limited to the nav, so the page shows a Ctrl/Cmd + P hint. The print header adds a line with the emergency and office numbers.
- **Service detail:** an `h2 "Co zahrnuje"` is added only when the Markdown body has no `##` headings of its own, to avoid a duplicate outline. "Související ceny" links to `/cenik/#<groupId>`; no prices appear on detail pages. Transport-category services also show the emergency panel.
- **Catalogues:** if no entry has an image the grid is text-only. If some do, entries without one get a quiet same-size frame ("Fotografie bude doplněna"). Zero entries shows "Katalog připravujeme." in prototype mode only, plus the office contact prompt.
- **Price tables** use explicit ARIA table roles so semantics survive `display: block`. Below 640 px rows stack with visible "Popis:"/"Cena:" labels, and empty descriptions are hidden.
- **House style in markup:** no nested ternaries. `When.astro` (renders its slot when `if` is true) and small components replace them. Option values are computed in frontmatter.
- **Core components render their own elements,** so template-scoped CSS cannot reach them. Styles for classes passed to `EmergencyPhoneLink`/`PhoneLink`/`PriceValue` are written as `.wrapper :global(.class)`.
- **Icons:** one Feather-derived line set (MIT), 20 px, `aria-hidden`, always next to text. Add it to CREDITS.md on export.

## Verification

- **Prototype build:** `npm run build -w templates/dustojna-jednoduchost` builds 17 pages.
- **Checks:** `npm run check -w templates/dustojna-jednoduchost` reports 0 errors, 0 warnings and 0 hints. Root `npm run check` exits 0.
- **Production build:** `npm run build:production -w templates/dustojna-jednoduchost` fails as expected with 54 errors. They fall only under G-011 (3), G-012 (1), G-020 (1), G-021 (1), G-031 (31), G-032 (10) and G-040 (7). That is the same rule set S1 recorded for the fixture, with no G-005.
- **Browser audit (scripted, iframes):** covered 13 routes at 320/375/1024/1280 px for defaults and 12 routes for the variant build.
  - No horizontal scroll at 320 px.
  - An emergency `tel:` link is in the first viewport on every page, with an accessible name of "Nonstop převoz zesnulých, volat +420 …" and a size of at least 44 × 44.
  - Body padding is at least the bar height.
  - Every page has exactly one `h1`, no skipped heading levels, and header, nav, main and footer landmarks.
  - No `[data-office-hours]` contains or sits inside an emergency block.
  - No visible link or button is smaller than 24 px.
  - Every page has `noindex,nofollow` in prototype.
- **Zero images and zero coffins/flowers:** checked with a temporary copy of the fixture (image fields stripped, coffins and flowers removed) built with `SITE_ROOT=<copy>`. There are 0 `<img>` in `main`, no empty sections or lists, and every page still looks complete (see `rakve-1280-empty-no-images.png`). `fixtures/` was not edited.
- **Fonts:** every face loaded from `/_astro/*.woff2` (self-hosted, latin plus latin-ext subsets). There were zero third-party requests. `document.fonts.check` passes for "Příliš žluťoučký kůň úpěl ďábelské ódy" in Public Sans 400/400i/600, IBM Plex Sans 400/400i/600 and IBM Plex Serif 600.
- **Budget:** CSS is 37 KB raw / 7.5 KB gzip (one file, every font face declared but only used faces download). Homepage HTML is 5.7 KB gzip. JS is the inline nav script only.

### Contrast (computed, WCAG 2.x)

| Token | on bg `#F5F5F2` | on surface `#FFF` | on band `#EBECE7` |
| --- | --- | --- | --- |
| ink `#1F2326` | 14.5 | 15.8 | 13.3 |
| muted `#4A5258` | 7.3 | 8.0 | 6.7 |
| line `#7D868C` (UI boundaries only) | 3.4 | 3.7 | 3.1 |
| forest `#2F5446` | 7.8 | 8.5 | 7.1 |
| blue `#34495E` | 8.5 | 9.3 | 7.8 |

- White on forest is 8.5 (11.8 on hover `#213D32`). White on blue is 9.3 (12.9 on hover `#233344`).
- Review flags: ink `#4D3A00` on `#FBEFCF` is 9.6; the dashed border is 4.3.
- `--c-hair` `#D3D6D4` is used only for decorative separators, never for control boundaries.

## Screenshots (`docs/notes/screens/dustojna-jednoduchost/`)

- **Default options:** `home-375-default.jpg`, `home-1280-default.png`
- **Alternate options:** `home-375-blue-plex-high-image.jpg`, `home-1280-blue-plex-high-image.png`, `menu-open-375-blue-plex-high.jpg`. These use slate-blue, plex-sans-serif, text-with-image and high, so every non-default value appears.
- **Guide:** `jak-postupovat-1280.png`, plus `jak-postupovat-print-emulated.jpg` (print media rules forced on)
- **Other pages:** `sluzba-detail-1280.png`, `kontakt-375-emergency-first.jpg`, `cenik-375-table-reflow.jpg`, `rakve-1280-empty-no-images.png` (no images and an empty catalogue)

The 375 px shots come from the in-app browser (2× JPEG). Headless Chrome cannot render narrower than about 500 px, so the 1280 px shots are headless PNGs.

## design-differentiation §6: B's side

| Check | B status |
| --- | --- |
| Own `src/components/`, only `@core/*` shared | Yes. Template A was not opened. All shared imports are `@core/*`. |
| Homepage order and hero DOM | Order is hero → next-steps → services → contact-summary → family-story. The hero is a `section` with H1, lead, CTA tier and an optional image after the CTA, with no image-panel slot. |
| Header/nav markup | Left logo, `<nav>` containing the toggle and list, then the emergency button. The menu is a dropdown under the sticky header. |
| Emergency pattern | Header button plus a fixed bottom bar. Invariant 1 verified at 375 and 1280 px (and 320 and 1024 px). |
| Services IA | Index plus detail pages; route set includes `/sluzby/<slug>/`. |
| Primary structures | Guidance uses `<details>` in a phased `<ol>`. Catalogues use a uniform `<ul>` grid. Pricing uses `<table>` with `<caption>`. |
| Greyscale recolour test | Structural (bands, bottom bar, tables, stepper), so it should hold. Not run here; that is S6's job. |
| Zero images | Complete (see above). |
| Accessibility basics | Scripted checks above pass. axe-core, a keyboard pass and 200 % zoom are left for S6's Playwright suite. |
| Forbidden list | No gradients, shadows, cards-as-structure, carousels, animation (reduced-motion guard as well) or stock imagery. |

## Core and contract gaps (worked around inside the template)

1. **`getPage()` returns no raw body or emptiness flag.** Templates cannot tell an empty page body from a real one. Workaround: render `<Content/>` inside `.prose-b` with no whitespace and hide it with `:empty`. Suggestion: add `body` or `hasBody` to the `getPage()` result.
2. **There is no headless component for the G-040 "Neověřený text" marker.** The gate defines the marker but core ships no component for it, so B renders its own `ReviewFlag` (prototype only). Suggestion: add a core `UnreviewedMark` so both templates show identical text.
3. **There is no way to ask whether an optional page exists.** `getPage()` throws, so `pageExists()` wraps it in try/catch, both for the privacy route's `getStaticPaths` and for the footer link. Suggestion: add `hasPage(id)` or put the privacy page in `site.nav`/`SiteContext`.
4. **Core components do not forward template scope.** Classes passed into core components cannot be styled by Astro-scoped CSS (see the decision above). This is not a bug, but worth noting in template-contract §6.
5. **`EmergencyPhoneLink` has no short-label variant.** The bar and header need the short UI text "Nonstop převoz". B uses `variant="label"` with a visually hidden label (or `variant="number"`) plus slot text. The accessible name still comes from core.
6. **`features.map: "embed-on-click"` is not implemented in B.** The map is always a link. An embed needs the privacy page (G-061) and is out of scope for the pilot.

No new dependencies were added, so the lockfile is unchanged.

## Left undone / follow-ups

- axe-core, a full keyboard walkthrough, 200 % zoom and the greyscale recolour comparison belong to S6.
- There is no favicon in `public/`. Add one when the client logo arrives (or have export generate it).
- The `catalogue-links` homepage section is implemented but not part of the default order. I built a reordered config (`hero, family-story, contact-summary, catalogue-links, next-steps, services`): the order was honoured and the bands still alternate. I checked the built HTML only, not the rendered page.
