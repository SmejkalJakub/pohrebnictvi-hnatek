# S14 · Template H `v-kapse` (V kapse)

**Status (2026-11-15):** built on branch `worktree-agent-a1fff5d6b609cfd98`, not merged. Built in parallel with template F `zpravodaj` (Zpravodaj).

- **Owner's decision:** from the round F–I canvas the owner chose "Zpravodaj + V kapse" as the two new templates.
- **Design input:** [docs/designs/v-kapse/](../designs/v-kapse/README.md), the home at 1280 and 375. Every other page is built from the home's system.
- **Trial client:** `clients/hnatek-h` (a copy of `clients/hnatek`, `template: "v-kapse"`, the same Hnátek brand block).
- **QA port:** 4419 (4418 is G's; F needs its own port).

## 1. Concept

The site works like an app in your pocket. The home asks one question, **"S čím vám můžeme pomoct?"**, and offers large rounded rows with a one-line hint each:

- Někdo právě zemřel (open on arrival)
- Chci sjednat pohřeb
- Jak se můžeme rozloučit
- Kolik to bude stát
- Květiny a rakve
- Kde vás najdeme

Tapping a row opens its short answer: beside the rows in a white rounded panel on desktop (master–detail), under the row on the phone (accordion). One answer is open at a time. Inner pages speak the same language: rows that open (guide steps, services, questions) and white rounded panels.

## 2. How the rows work

- **Markup:** each row is a native `<details name="kapsa">` with a `<summary>` row and an answer `<div>` (`PocketRow`). Rows sharing a `name` are an exclusive accordion in the browser itself: no JavaScript, keyboard (Tab, Enter, Space) and screen readers work natively, and every answer stays reachable by opening its row.
- **Desktop master–detail (≥ 64 rem):** `<main>` is a CSS grid (`.home-grid`, two columns, `grid-template-rows: repeat(var(--rows), auto) 1fr`). The rows and their `::details-content` box are `display: contents`, so each summary is a grid item in the left column and each answer a grid item spanning every row of the right column (`grid-row: 1 / -1`). Closed answers are `display: none`; the spare `1fr` row takes the answer's height so the rows never stretch. Tab order stays the DOM order (summary → its answer's links → next summary).
- **Fallback:** the grid sits inside `@supports selector(::details-content)`. Browsers without it (older Safari and Firefox) get the phone accordion at every width.
- **Without JavaScript:** identical, since nothing above uses JavaScript. The live office status (core) stays hidden without JS, as everywhere.
- **Nothing open:** if the reader closes the open row on desktop, a dashed panel says "Vyberte vlevo, co právě řešíte…" (`data-interlude`, so it is not a homepage section).
- **Rows left out:** a row whose section has no content for the client is not rendered (no guidance, no featured services, no prices, no catalogue pages, people or notices off).
- **The guide:** each step is a row inside its `<li id data-guide-step>`; "Potom" (`data-guide-next`) asks core to move to the next step. Core now also **opens** a step drawn as a row (`core/client/interactions.ts`: the step, or its first child, is a `<details>`). No other template's steps start with a `<details>`, so nothing else changes. Without JavaScript "Potom" scrolls to the next row and marks it (`:target`); the reader opens it.
- **Služby:** `/sluzby/#<id>` targets an anchor inside the service's answer, so the browser opens that row on fragment navigation (verified in Chromium with and without JavaScript).

## 3. Signature interaction (design-differentiation §1.1)

**The answer opens in place.** The tapped row fills with the primary, its chevron turns and the answer settles (opacity and a 6 px rise) in 200 ms. The row that is open on page load carries `data-start` and never animates, so nothing plays on load. Everything is off under `prefers-reduced-motion`.

## 4. Brand mapping (template-contract §8a)

| Brand role | V kapse |
| --- | --- |
| `--brand-ground` | the page |
| `--brand-primary` | the open row, the nonstop pill, the number box, the current page row |
| `--brand-primary-text` | headings, links, numerals |
| `--brand-secondary-text` | small capital labels only ("TEĎ HNED", "SJEDNÁNÍ", the tradition line) |
| `--brand-surface-2` | the step numerals' circles, picked chips |
| `--brand-rule` | row and panel hairlines (mixed into the ground) |
| `--brand-deep` | the footer |
| display font | H1, panel headings, the big number, the wordmark |
| body font | everything else |
| `brand.mark` | the header mark (alone on phones under 30 rem) and the footer signature |

## 5. Palettes without a brand (contrast, WCAG 2.x)

| Pair | `mech` | `bridlice` |
| --- | --- | --- |
| ink on ground | 14.5 | 14.7 |
| muted on ground / white | 7.0 / 7.8 | 6.9 / 7.6 |
| primary on white / ground | 10.5 / 9.3 | 10.0 / 9.1 |
| on-primary on primary | 9.3 | 9.1 |
| hint on the open row | 7.0 | 6.6 |
| label on ground / white | 6.1 / 6.8 | 6.4 / 7.0 |
| primary on soft | 8.5 | 8.0 |
| footer text / muted on deep | 11.7 / 8.3 | 12.3 / 8.6 |

Fonts: Figtree 400/500/600 (`figtree`), or Spectral 500 headings with Figtree (`spectral-figtree`); `@fontsource` 5.3.0, latin + latin-ext.

## 6. Decisions taken in the build (for the owner)

1. **The nonstop pill is in the header at 1280 too.** The desktop comp has no number in the header (only inside the first answer). Invariant 1 needs it on every page, so the pill stays on every width.
2. **No menu on phones.** As drawn, the phone header is the mark and the pill. Every page ends with "Všechny stránky", all pages as large rows; that is the whole phone navigation. From 48 rem the header adds five words.
3. **The mark alone on narrow phones.** The comp shows "HNÁTEK"; the content has only the full brand name, which does not fit beside the pill at 390 px. Under 30 rem the mark stands for the name (the name stays for screen readers). A short brand name field would let the word return.
4. **Hints are template copy, not facts.** "Od 18 900 Kč", "Z naší vazárny · MOSER LEGNO" and "Dědická 38/22 · teď zavřeno" from the comp would be business facts in i18n. The price hint is generic ("Ceny a co je v ceně"), the catalogue hint "Fotografie z nabídky"; only "Kde vás najdeme" carries data (the street from content and the live short status from core).
5. **The guided list label is "Postupně"** (design-differentiation §1.3), also above the arranging step's list, where the comp says "S SEBOU".
6. **"Potom" without JavaScript** reaches the next step's row but leaves it closed (see §2).

## 7. Verification

Node 24.21.0, 2026-11-15:

- `npm run check`: lint, typecheck, 427 unit and tools tests, 16 harness tests, all green (the export integrity test needs `/opt/homebrew/bin` on `PATH` for its shell tools).
- `npm run client:validate -- hnatek-h`: **PROTOTYPE: PASS** (errors 0; production blocked by G-012, G-020, G-021, G-031, G-040, as for every Hnátek prototype).
- `npm run qa` (all seven templates): 2039 passed, 1 failed: a 60 s timeout in A's keyboard test at 375 px on `/`, while another worktree was building templates on the same machine. All 54 keyboard tests of A and D pass when rerun. Every V kapse test passed (290, including keyboard focus and axe-core on every route at 375 and 1280, with the home's rows and the guide's steps). The first run found "D/H: same nav outline"; the header words now carry an inner span, and the check passes.
- Rows with and without JavaScript (Chromium): the home opens one row at a time with the keyboard (Enter on a summary); the desktop answer stands in the right column; `/sluzby/#<id>` opens that service's row; "Potom" opens the next guide step with JavaScript and reaches it without.
- `npm run client:dev -- hnatek-h --port 4808 --force` and full-page screenshots (scrolled through first) of `/` (with "Chci sjednat pohřeb", "Květiny a rakve" and "Kde vás najdeme" opened), `/jak-postupovat/`, `/kontakt/`, `/kvetiny/`, `/sluzby/` and `/cenik/` at 1280 and 390, compared with the two comps.
