# Phase 2 sign-off report (S6: cross-template QA)

**Status:** all automated checks pass for both templates (2026-11-09). The §7 scorecard below is an **agent assessment pending the owner's review**.

**Scope:** `templates/rodinna-tradice/` (A) and `templates/dustojna-jednoduchost/` (B), each built against `fixtures/neutral/` in prototype mode.

Related documents: [template-contract §6](../template-contract.md) · [design-differentiation §6–§7](../design-differentiation.md) · [content-contract §6.4, §6.5, §6.11, §8](../content-contract.md) · S3/S4 notes in [`docs/notes/`](../notes/)

---

## 1. How to reproduce

```bash
export PATH=~/.nvm/versions/node/v24.21.0/bin:$PATH
npm ci
npm run qa:install          # Playwright's Chromium
npm run qa                  # builds both templates, serves them, runs every check, writes screenshots
```

- **Single project:** `npm run qa -- --project rodinna-tradice` (or `dustojna-jednoduchost`, or `structure`).
- **Skip screenshots:** `QA_SCREENSHOTS=0 npm run qa`.
- **HTML report:** `qa/playwright-report/`. Traces of failures go to `qa/test-results/`. Both folders are git-ignored.

**How the suite is wired** (`qa/playwright.config.ts`):

- Each template is built with its own `npm run build`, so it uses fixture content, `SITE_CONFIG=./fixture.site.config.ts` and prototype mode.
- Each build is served from `dist/` with `astro preview` through `webServer`: A on port 4411, B on port 4412.
- `astro preview` gets `--ignore-lock`. Astro 7 detects agent shells and silently moves the preview server into the background, which makes Playwright report "webServer exited early". `--ignore-lock` keeps it in the foreground.
- There are three projects:
  - `rodinna-tradice` and `dustojna-jednoduchost` run the same specs. Every test carries a template tag, and each project greps for its own tag.
  - `structure` runs the cross-template checks.
- Routes are discovered from each `dist/` (every `index.html` and `404.html`), never hard-coded. A has 10 routes and B has 17.
- Viewports are 375 × 667 and 1280 × 800. Reflow is also checked at 320 × 568 and at 640 × 400 (1280 px at 200 % zoom).
- Selectors use only core `data-*` hooks (`[data-emergency-link]`, `[data-price]`, `[data-demo-label]`, `[data-demo-pricing-notice]`, `[data-prototype-banner]`), the template hooks `[data-office-hours]`/`[data-emergency-block]`/`[data-section]` that both templates already had, roles and landmarks. Template class names are never used.

| File | Content |
| --- | --- |
| `qa/templates.ts` | Template list, ports, route discovery, fixture emergency data |
| `qa/lib/browser-checks.ts` | In-page functions: emergency links, hours separation, heading outline, focus state, overflow |
| `qa/pages.spec.ts` | Checks 1–8 per page and width |
| `qa/screens.spec.ts` | Screenshots into `docs/qa/screens/` |
| `qa/structure.spec.ts` | Structural checks; writes evidence to [`docs/qa/structure.json`](structure.json) |

**Last full run:** `npm run qa` → **412 passed, 0 failed, 0 skipped** (about 1.5 min).

The checks themselves were sanity-probed: focus-ring styles, covering detection and hours detection all report real values. For example, `/kontakt/` finds 4 hours text nodes in both templates, and every Tab stop reports a 3 px solid outline.

## 2. Results per template and check

Each test is one page at one width (or one page, for the width-independent checks).

| # | Check | A: Rodinná tradice | B: Důstojná jednoduchost | Notes |
| --- | --- | --- | --- | --- |
| 1 | Emergency `tel:` link visible in the first viewport or a fixed/sticky bar; accessible name has label + number; ≥ 44 × 44 | **Pass**, 20/20 | **Pass**, 34/34 | Every `[data-emergency-link]` on the page must have a `tel:` href and a name containing "Nonstop převoz zesnulých" and the digits. At least one must be visible, in the first viewport or inside a `fixed`/`sticky` ancestor, and at least 44 × 44. A: sticky dark utility strip. B: the fixed bottom bar at 375 px and the sticky header button at 1280 px. |
| 2 | Office hours and the emergency CTA share no container or heading | **Pass**, 10/10 | **Pass**, 17/17 (after fix F1) | Definition below the table. Also asserts that `/kontakt/` really shows hours, so the check cannot pass vacuously. |
| 3 | One `h1`, no skipped levels, landmarks, working skip link | **Pass**, 20/20 | **Pass**, 34/34 | All `<details>` are opened first, so collapsed headings are counted. Also checks `lang="cs"`, banner/navigation/main/contentinfo roles and `main#obsah`. The first Tab stop is the visible skip link, and Enter moves focus to `main#obsah`. |
| 4 | axe-core (wcag2a, wcag2aa, wcag21aa, wcag22aa): no serious or critical violations | **Pass**, 20/20 | **Pass**, 34/34 | Run at both widths, because contrast and layout differ. |
| 5 | No horizontal scroll at 320 px (and at 640 px, i.e. 200 % zoom) | **Pass**, 10/10 | **Pass**, 17/17 | `scrollWidth ≤ clientWidth` on the scrolling element. |
| 6 | Keyboard: every Tab stop has a visible focus indicator and is not covered (B: never under the bottom bar) | **Pass**, 20/20 | **Pass**, 34/34 | Tabs through the whole page, up to 250 stops, until focus wraps. An indicator is an outline of at least 1 px that is not transparent, or a box-shadow. "Covered": `elementFromPoint` at the centre of the element's first line box must be the element or inside it. This catches the sticky strip, the sticky header and B's fixed bar. |
| 7 | Mobile nav toggle: `aria-expanded` flips; menu reachable and closable by keyboard | **Pass**, 20/20 | **Pass**, 34/34 | The toggle is `button[aria-expanded][aria-controls]` in the banner. It is reached with Tab, opened with Enter, and Tab then lands inside the controlled menu. Escape closes it and returns focus to the toggle; Space opens and Enter closes. Where no toggle is visible (A at 1280, B at 1280), the nav links must be visible inline. |
| 8 | Prototype markers: robots `noindex`, banner; `/cenik/`: every price shows "UKÁZKA" and the demo notice comes first | **Pass**, 10/10 | **Pass**, 17/17 | On `/cenik/`, every `[data-price]` must contain a visible `[data-demo-label]` with the text "UKÁZKA". `[data-demo-pricing-notice]` must be visible, have `role="note"` and precede the first price in document order. |
| – | Build and route discovery | **Pass** | **Pass** | |
| – | Screenshots | 20 colour + 6 greyscale | 34 colour + 6 greyscale | See §5. |

**Check 2, defined:**

- **Hours text** is any text node with a time range (`\d{1,2}:\d{2}–\d{1,2}:\d{2}`).
- **Container rule.** The hours *container* is the nearest `[data-office-hours]`, `dl`, `table`, `ul`, `ol` or sectioning element (`section`, `aside`, `article`, `footer`, `header`, `main`). The container must not:
  - contain an emergency link;
  - sit inside an emergency link or `[data-emergency-block]`;
  - contain the words "nonstop" or "24 hodin".
- **Heading rule.** The nearest heading before the hours text, in document order, must not also be the nearest heading before any emergency link.

**Structural checks (`structure` project):**

| Check | Result | Evidence ([`structure.json`](structure.json)) |
| --- | --- | --- |
| No shared component file names between the two `src/components/` | **Pass** | A has 20 components and B has 22; the intersection is empty. |
| Templates import core only via `@core/` | **Pass** (after fix F2) | All relative imports are resolved; any that land in `core/` fail. Two documented bootstrap exceptions per template: `astro.config.mjs → ../../core/integration.ts` (Vite aliases do not exist while the config loads) and `fixture.site.config.ts → ../../core/content/config.ts` (Node-loaded dev wiring with an erased `import type`; not template source). |
| Core contains no `<style>`, stylesheets, literal `class="…"`/`class:list="…"` defaults or inline `style` | **Pass** | All 10 `core/components/*.astro` checked; there are no `.css` files in core. |
| Homepage section order differs in ≥ 3 positions | **Pass**, 3 of 5 | A: hero → family-story → services → next-steps → contact-summary. B: hero → next-steps → services → contact-summary → family-story. Positions 2, 4 and 5 differ. |
| Header, nav and hero DOM outlines differ (tags and roles only) | **Pass** | A header: `header(div(div(span,a,button),nav(ul(li…))))`. B header: `header(div(a,nav(button,ul(li…)),div(a…)),p)`. A hero: text column plus `figure` aside. B hero: text column plus a CTA tier with a nested office `section`. |
| Route sets differ (B has `/sluzby/<slug>/`, A does not) | **Pass** | A: 10 routes, no detail pages. B: 17 routes, 7 × `/sluzby/<slug>/`. |

## 3. Fixes made

| Id | Template | File | Failure | Fix |
| --- | --- | --- | --- | --- |
| F1 | B | `src/components/CtaTier.astro` | **Check 2 failed on `/`.** The hero's office tier (`div[data-office-hours]`) was labelled by a `<p>`, so the office hours and the large emergency button both fell under the page `h1`: a shared heading. | The office tier is now its own `<section aria-labelledby="cta-kancelar" data-office-hours>`, headed by `<h2 id="cta-kancelar">` with the officeHours label "Kancelář – úřední hodiny". It is styled to inherit the former label's size and weight, so the design is visually unchanged (compare `home-1280.jpg`). This also fulfils content-contract §6.4: "every hours block is headed by its label". |
| F2 | A | `template.manifest.ts` | **The structural `@core/` check failed:** a relative `import type … from "../../core/content/config.ts"`. | Changed to `@core/content/config.ts`, as B already does. It is a type-only import, erased when `astro.config.mjs` loads the manifest, so the build is unaffected. |

No other template changes were needed. After both fixes, both template builds, `astro check` (A: 75 files, B: 78 files, 0 errors / warnings / hints) and root `npm run check` (lint, typecheck, unit tests, harness) pass.

## 4. design-differentiation §6 checklist

- [x] **The two `src/components/` share no component files, and the only shared imports are `@core/*`.**
  - Evidence: `structure.json → components` (empty intersection) and `coreImports` (no violations).
  - The bootstrap exceptions are listed in §2.
- [x] **Homepage section order differs in at least 3 positions, and the hero DOM structure differs, verified from the HTML outline.**
  - Evidence: `structure.json → homepage` (positions 2, 4 and 5 differ; hero outlines differ).
- [x] **Header and navigation markup differ in structure.**
  - A: the wordmark and a button in a masthead row, then a separate `nav > ul`.
  - B: the logo link, then a `nav` containing the toggle and the `ul`, then the emergency button block.
  - Evidence: `structure.json → homepage.*.header` and `.nav`.
- [x] **The emergency CTA uses a different placement pattern, and both pass invariant 1 at 375 and 1280 px.**
  - A: a dark utility strip above the letterhead, sticky on mobile.
  - B: a sticky header button (from 768 px) plus a fixed bottom bar (below 768 px).
  - Check 1 passes on every page at both widths: A 20/20, B 34/34.
- [x] **Services IA differs (anchors vs detail pages), and the route sets differ accordingly.**
  - A links `/sluzby/#<slug>`. B emits 7 × `/sluzby/<slug>/`.
  - Evidence: `structure.json → routes`.
- [x] **Guidance, catalogue and pricing each use a different primary HTML structure.**
  - Guidance: A uses `article > section` with numbered `h2` and a margin TOC; B uses a phased `ol` with `<details>`.
  - Catalogues: A uses a `figure` gallery with one-wide-then-two-narrow rhythm; B uses a uniform `ul` grid with a `dl` of material and code.
  - Pricing: A uses `dl` with dot leaders; B uses `table` with `caption`.
  - Screenshots: `jak-postupovat-1280.jpg`, `rakve-1280.jpg` and `cenik-1280.jpg` in each template folder.
- [x] **With all colours replaced by greyscale, the screenshots are still recognisably different at 375 and 1280 px.**
  - Compare `home-*-grey.jpg`, `sluzby-*-grey.jpg` and `kontakt-*-grey.jpg` across the two folders.
  - A reads as a centred serif letterhead with margin small-caps labels, prose paragraphs and a three-column letter footer.
  - B reads as a left-logo sans header with a filled button, a hero with a CTA block, a numbered stepper, an indexed service list, a three-cell info row and a fixed two-button bar on mobile.
- [x] **With all images removed, both still look complete.**
  - Evidence comes from the S3 and S4 no-image fixture builds; see `docs/notes/s3-rodinna-tradice.md` ("with every image ref removed and zero coffins and flowers") and `docs/notes/screens/dustojna-jednoduchost/rakve-1280-empty-no-images.png`.
  - S6 did not repeat those builds (see §6).
  - In the S6 shots the image slots are labelled placeholders, and no layout depends on them: A falls back to the tradition panel, and B's catalogue entry without an image shows "Fotografie bude doplněna".
- [x] **Both pass the accessibility basics: axe-core with no serious or critical issues, keyboard pass, 200 % zoom and 320 px reflow.**
  - Checks 3–7 pass on every page.
  - 200 % zoom is checked as layout reflow at 640 px. A text-only zoom was not separately emulated (§6).
- [x] **Neither uses anything on the forbidden list (§1).**
  - A grep of both `src/` trees for gradients, box-shadows, keyframes, animation or transition, parallax, carousels and sliders, backdrop-filter and blur finds only B's `prefers-reduced-motion` guards (`transition: none` / `animation: none`).
  - The screenshots show no icon-card grids, stock portraits, generated imagery or invented social proof. B's icons are the 20 px line set, always next to text; A's only icon is the phone glyph in the strip.

## 5. §7 distinctiveness scorecard: agent assessment, pending the owner's review

Scale: 0 = same structure, 1 = cosmetic only, 2 = clearly different structure, 3 = different structure **and** a rationale visible to a user. Screenshot paths are relative to `docs/qa/screens/`.

| Dimension | Score | Evidence |
| --- | --- | --- |
| Composition (page layouts, section order) | **3** | Section order differs in 3/5 positions. A's homepage is an asymmetric editorial hero with an image or tradition panel, then story, prose services, first steps and a "Navštivte nás" letter. B's is a CTA-tier hero, a stepper, a two-column service index, an info row and the story last. The visible rationale: A invites reading, B is task-first. See `rodinna-tradice/home-1280.jpg` and `dustojna-jednoduchost/home-1280.jpg`, plus the `-grey` versions. |
| Navigation (header, mobile nav, CTA pattern) | **3** | A: centred letterhead with a hairline-ruled centred nav, an in-flow "Menu" list on mobile, and the dark utility strip. B: sticky left-logo header with a filled emergency button, a dropdown menu and a fixed two-button bottom bar on mobile. The visible rationale: A always has the strip above a calm letterhead; B always has a button and a bar within reach. See `*/home-375.jpg` and `*/kontakt-375.jpg`. |
| Typography (families, scale, hierarchy) | **2** | A: EB Garamond display and headings over a Source Sans 3 body, small-caps margin labels, serif italic captions. B: Public Sans throughout, compact 600-weight headings, field labels. The families and hierarchy devices are clearly different. Not a 3, because both use a humanist sans body, so running text reads similarly at a glance. See `*/o-nas-1280.jpg` and `*/rakve-1280.jpg`. |
| Image usage (size, frequency, crops, captions) | **2** | A: a large hero portrait slot, and a gallery with one wide item and then two narrow ones, with italic serif captions and entries without images set as text. B: no hero image by default, and a uniform 4:3 three-column grid with data captions (`dl` of material and code). The structure is clearly different, but with placeholder art only, the warm-photography vs functional-crop rationale cannot be seen yet. Rescore with approved photos in Phase 3/4. See `*/rakve-1280.jpg` and `*/kvetiny-1280.jpg`. |
| Content hierarchy (what comes first, depth of IA) | **3** | B puts urgent contact, then next steps, services and background, with service detail pages (17 routes, deeper IA), a phased guidance checklist and the contact page opening with the emergency panel. A puts story and tradition before services, keeps one long services page with anchors (10 routes) and treats guidance as a narrative article. See `dustojna-jednoduchost/kontakt-1280.jpg`, `rodinna-tradice/kontakt-1280.jpg` and `*/jak-postupovat-1280.jpg`. |
| **Total** | **13 / 15** | Pass mark ≥ 11 with no dimension below 2: **met, as an agent assessment.** The "conservative and credible" rating is the owner's. |

## 6. Deferred items

| Item | Reason |
| --- | --- |
| **Re-running the no-image builds in S6** | It needs a stripped copy of the fixture. S3 and S4 each did this with scratch copies (fixtures must not be edited), and the result is on record. A `qa:variants` script that builds such a copy into a temp dir (B already supports `TEMPLATE_OUT_DIR`) would make this repeatable. |
| **Option variants** (palettes, font pairs, hero variants, `emergencyEmphasis: high`) | The suite runs the fixture defaults only. S3 and S4 checked every option value manually. Running checks 1, 2, 4 and 6 against each variant build would need the variant-build script above. |
| **Text-only 200 % zoom** | It is covered as 640 px layout reflow, which is what 200 % page zoom produces. Chrome's text-only zoom setting cannot be emulated in Playwright. |
| **Focus-indicator contrast** | The suite asserts that an outline exists, is at least 1 px wide and is not transparent. Templates use a 3 px accent outline: on paper in A (7.9:1) and on the background in B (7.8:1); A's strip uses a paper outline on ink. The ratio itself is not measured. |
| **Print stylesheet (B)** | Not part of the S6 invariants. S4 checked it with emulated print media. |
| **Owner review of the scorecard and "conservative and credible"** | It needs a human reviewer. |
| **Production-mode gate** | Out of scope here (S1/S5). Both production builds fail on the expected gate ids, per the S3 and S4 notes. |

## 7. Recommended changes outside the templates (core, contracts, tooling)

No `core/` files were edited.

1. **Standardise the separation hooks in the contract.** Both templates independently use `[data-office-hours]` on hours blocks and `[data-emergency-block]` on separately headed emergency blocks, and the QA suite relies on them. template-contract §6 should name them as required hooks, next to the core ones, so future templates stay testable without class names.
2. **Add a headless `OfficeHoursBlock` (or `data-office-hours` helper) to core.** It would render the label as a heading at a caller-chosen level, plus the `data-office-hours` hook, leaving all markup choices to the template. F1 shows that a "label" rendered as a `<p>` silently breaks invariant 2's heading rule. Content-contract §6.4 already requires that every hours block is headed by its label.
3. **A type-only entry for template wiring files.** Templates' `astro.config.mjs` and `fixture.site.config.ts` must reach core relatively, because they load before Vite aliases exist. Either document that bootstrap exception in template-contract §2/§6, or expose core's config types through a package export (`"exports"` in `core/package.json`, e.g. `@site/core/config`) so no template file needs a `../../core/` path.
4. **Lockfile: dedupe `playwright-core`.** `@axe-core/playwright` resolves its peer `playwright-core` to 1.65.0, while `@playwright/test` 1.64.1 pins 1.64.1. Runtime works, but the `Page` types clash, and `qa/pages.spec.ts` casts once. An `overrides` entry pinning `playwright-core` to 1.64.1 (root `package.json` plus a lockfile pass) removes the cast.
5. **Document Astro 7's agent auto-backgrounding of `astro preview`.** It also affects S5's `tools/export/verify.ts` if that ever previews. Use `--ignore-lock` (as the QA config does) or `ASTRO_PREVIEW_BACKGROUND`. Otherwise a background server survives the run and occupies the port.
6. **S3/S4 items re-checked in S6.**
   - Resolved by `8788c15`: built heading ids are now ASCII, and unreferenced media files are no longer emitted.
   - Still open from S3 and S4: `features.map: "embed-on-click"` is unimplemented in both templates, with no manifest field to declare map support. Template A still lists the unused `@fontsource/cormorant-garamond`, and design-differentiation §2.3 still names the rejected `cormorant-literata` pair.

## 8. Screenshot index (`docs/qa/screens/<template>/`)

- **Colour:** every route at both widths, named `<page>-375.jpg` and `<page>-1280.jpg`. The page names are `home`, `jak-postupovat`, `sluzby`, `rakve`, `kvetiny`, `o-nas`, `kontakt`, `cenik`, `ochrana-osobnich-udaju` and `404`, plus B's `sluzby-<slug>`.
- **Greyscale ("recolour test"):** `home`, `sluzby` and `kontakt` at both widths, as `<page>-<width>-grey.jpg`.
- **Format:** full-page JPEG at quality 60, about 8 MB in total.
- **Capture method:** the viewport is grown to the page height before capture. Otherwise Chromium's full-page capture paints B's fixed bottom bar at its first-viewport position, over the content.
