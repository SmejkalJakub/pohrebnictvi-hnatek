# G · Lidé a místo (`lide-a-misto`)

**Status (2026-11-13):** direction D2 approved by the owner as the new template G. The three original D2 boards are kept unchanged in `html/`; the full page set is drawn on the Claude Design canvas **“Šablona G Lidé a místo – stránky”** (https://claude.ai/artifact/Xirib42N5NQpZd5YVyX6EL) and **awaits the owner's review**. Build from the board HTML; the text below explains it and lists what must not change.

**Concept.** The firm is introduced through its real people and places, as a documentary photo essay with numbered captions: “01 Jana a Petr Vzorovi, kancelář na náměstí”, “02 Kancelář na náměstí”, “03 Smuteční síň” … The home opens with text on the left (H1 and the nonstop number, green, underlined, 46 px) and a large photo of the people on the right, bleeding to the edge. Below come a 3 × 2 grid of captioned place photos, the first steps with big green numerals, “Kdo vás přijme” portraits, and three columns under 3 px rules (price, office, notices). **Without photos** the grid becomes a numbered list of places with addresses and the people become names with phones; the page still reads as complete. **Notice pages** carry no business photos; at most a family photo with consent.

## Files

| Path | What |
| --- | --- |
| `html/lide-home-1280.dc.html`, `lide-home-375.dc.html`, `lide-notice-375.dc.html` | the three original D2 boards from the owner's “Šablona D – nové směry” canvas, byte-identical |
| `source/*.dc.html` | every board on the G canvas (20: the three originals, `Main.dc.html` = home 1280, plus 17 new). **Read exact sizes and colours here.** Static markup only, no script logic |
| `source/canvas.json` | canvas layout and the notes beside each row |

The `.dc.html` files need the canvas runtime (`./support.js`) to render; open them on the canvas. Their markup is plain inline-styled HTML, so values can be read directly.

## Drawn screens

| Screen | Board (`source/`) | What to copy exactly |
| --- | --- | --- |
| Home 1280 | `Main.dc.html` | 520 px text column + photo bleeding right (620 px tall); 3 × 2 place grid (260 px photos); steps in a 360 px label column + 3 columns; portraits 120 × 150; three 3 px-ruled columns |
| Home 375 | `lide-home-375.dc.html` | H1 34, nonstop number 34 directly under it, people photo 420 px full width, three places stacked, link “Všechna místa” |
| Notice 375 | `lide-notice-375.dc.html` | reduced header, neutral line, optional family photo 128 × 160 beside name 32 px, ceremony `dl`, QR + print hint; no green |
| Home 1280 without photos | `home-1280-bez-fotek.dc.html` | H1 64 left, nonstop block right (bottom-aligned); places as a 2-column numbered list (01–06) with name, address, one sentence; people as names with phones |
| Menu 375 | `menu-375-otevrene.dc.html` | 24 px bold links between 1 px rules, two small links, nonstop block, then Kancelář under its own heading |
| 404 375 | `404-375.dc.html` | one sentence with two inline links, then the nonstop block |
| Jak postupovat 375 | `jak-postupovat-375-bez-vyberu.dc.html`, `-doma.dc.html` | **high-emphasis strip** under the header; picker = four full-width rows, 52 px tall, 1 px rules; picked row filled green with “(vybráno)”; phases as small condensed caps; steps with green numerals 28 under 3 px rules; situation notes in bold-led muted lines |
| Kontakt 375 | `kontakt-375.dc.html` | nonstop block, one place photo “01 Kancelář na náměstí”, Kancelář + Úřední hodiny `dl` with rules, phones as label-over-number rows, short people list + link, billing details |
| Pro účastníky 375 | `pro-ucastniky-375.dc.html` | one place photo “01 Smuteční síň”, then sections under 3 px rules |
| Ceník 1280 | `cenik-1280.dc.html` | VAT sentence as a 22 px bold lead; demo notice; print hint; anchor row; per group: 360 px label column (H2 + from-price 34 px bold ink + “včetně DPH”), items table with 1 px rules, “V ceně je zahrnuto / Není zahrnuto” side by side; VAT note again at the end; **no photos** |
| Ceník A4 | `cenik-a4.dc.html` | white paper, ink only, 16 px body (12 pt), nonstop and office on separate lines, one-line included / excluded sentences, legal line at the foot |
| Oznámení 1280 / 375 | `oznameni-1280.dc.html`, `oznameni-375.dc.html` | reduced nav, neutral line; rows: ceremony date and time · optional family photo · name (link) + dates · place and ceremony type; “Starší oznámení” below; reduced footer (legal only) |
| Lidé 1280 | `lide-1280-s-fotkami.dc.html`, `-bez-fotek.dc.html` | with photos: four 3 : 4 portraits (365 px) with numbered captions and direct phone; without: numbered table, name 30 px bold, role, phone right-aligned |
| O nás / Naše místa 1280 | `o-nas-1280-s-fotkami.dc.html`, `-bez-fotek.dc.html` | with photos: people photo bleeding right (500 px), “Kdo jsme”, places 2 large (360 px) + 4 small (210 px), each caption + address line; without: the same places as a full-width numbered list |
| Služby 1280 | `sluzby-1280.dc.html` | one long page, anchor row, H2 in the 360 px column, text right; a 340 px place photo beside the text only where it belongs (vůz, síň, květinářství); closing office line |
| Footer 1280 | `paticka-1280.dc.html` | four 3 px-ruled columns: Nonstop · Kancelář · Na webu · Právní informace; legal identification + ADR row under a 1 px rule |

All 1280 pages except notices use the full footer drawn on `paticka-1280`. The original home 1280 board shows an earlier short footer; build the full one there too. 375 pages use the short legal footer of the original 375 boards.

## Tokens

### Colours (contrast computed, WCAG 2.2)

| Role | Hex |
| --- | --- |
| ground | `#F7F7F4` |
| ink | `#161616` |
| muted | `#3F3F3F` |
| muted-2 (subtitles, nonstop sentence) | `#4D4D4D` |
| accent (green) | `#1F4D45` |
| on-accent | `#FFFFFF` |
| paper (print) | `#FFFFFF` |
| placeholder fill / border (comps only) | `#DCDCD6` / `#8C8C86` |
| demo marker (comps and UKÁZKA) | text `#6B5400` on `#FFF6D6`, dashed `#8A6D00` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 16.86 : 1 | 4.5 | pass | body, headings, 1 px and 3 px rules |
| muted | ground | 9.81 : 1 | 4.5 | pass | captions, roles, secondary lines |
| muted-2 | ground | 7.88 : 1 | 4.5 | pass | subtitle, nonstop sentence |
| accent | ground | 8.87 : 1 | 4.5 | pass | nonstop number, step numerals, link hover |
| on-accent | accent | 9.52 : 1 | 4.5 | pass | high-emphasis strip, picked picker row |
| ink | paper | 18.10 : 1 | 4.5 | pass | A4 print |
| demo text | demo fill | 6.71 : 1 | 4.5 | pass | UKÁZKA / Zástupná jména markers |
| ink (focus ring, 3 px) | ground | 16.86 : 1 | 3.0 | pass | default focus ring, outline offset 3 px |
| on-accent (focus ring, inset) | accent | 9.52 : 1 | 3.0 | pass | focus on green: 3 px white ring inset 6 px (ink on green is only 1.90 : 1) |
| print hairline `#B5B5B0` | paper | 2.06 : 1 | n/a | decorative | A4 table row separators only, never the only cue |

No other colours. Green is never used on notice pages.

### Type

**Archivo** (SIL OFL 1.1, latin-ext), variable: weights **400 and 700** only, widths **100 %** (text) and **85 %** (captions, numerals in place lists, small caps labels). One family, two weights, one width axis. Package to check at build: `@fontsource-variable/archivo` with the `wdth` axis; Czech diacritics to be checked with the pangram in both weights and widths.

| Token | 375 | 1280 |
| --- | --- | --- |
| body | 18 | 18 (lead 20, long text 19) |
| caption (85 % width) | 17 | 17 (original home board draws 16: build 17) |
| small label caps (85 %, +0.04 em) | 17 | 17 |
| H1 | 34 (notice 32) | 54 (home without photos 64) |
| H2 section | 26 | 32 (Služby 30) |
| H2 column / footer | 22–24 / – | 24 / 18 |
| nonstop number | 34 | 46 home, 40 inner pages, 28 footer |
| step numeral (green) | 28 | 40 |
| place numeral (ink, 85 %) | 20–28 | 24–28 |
| line-height | body 1.55–1.6, display 1.05–1.08 | same |

Footer legal text on 375 is 15 px in the original boards; build it at 16 px minimum.

### Spacing and layout

| Token | Value |
| --- | --- |
| spacing scale | 4 · 8 · 12 · 16 · 24 · 32 · 56 · 72 · 88–96 |
| page side margin 1280 | 56 px; content width 1168 |
| gutter 375 | 16 px |
| hero 1280 | text column 520 px, gap 56, photo to the right edge |
| label column 1280 | 360 px + 56 px gap (steps, Ceník, Služby, O nás) |
| section gap | 88 px 1280 (72–96), 40–48 px 375 |
| rules | 3 px ink above a block (separation device), 1 px ink between rows and under section heads |
| radius | 0 |
| shadows, tints, cards | none |

## Figure numbering (the signature device)

- Two-digit bold numerals at 85 % width (“01”, “02” …) mean **a figure or a place**, nothing else. They number the figures of one page in reading order, starting at 01. With the people photo on the home, places start at 02; without it, at 01.
- When photos are missing, the same sequence survives as a numbered list (places) or a numbered table (people), so the device stays.
- Green single-digit numerals (1, 2, 3) are **steps**. Do not use two-digit numerals for price groups, menus, pickers or anchors.

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | home: left column under the lead; inner pages: right column of the opening at 1280, under H1 + lead at 375; footer column 1 at 1280 | 3 px ink rule, then **one `tel:` link** containing the label (“Nonstop převoz zesnulých”, 17–18 px bold ink) and the number (46 / 40 / 34 px bold green, underlined 3 px, offset 6–7 px, `nowrap`), then a muted sentence outside the link. Label and number are block spans, never flex (QA test 9) |
| High emphasis (`emergencyEmphasis: "high"`) | additionally, a full-width strip directly under the header on every non-notice page | green `#1F4D45` strip, 12 px × gutter padding, white 17 px bold “Nonstop převoz zesnulých” + underlined `nowrap` number, one `tel:` link; wraps to two lines at 375. Drawn on both Jak postupovat boards |
| Neutral | notice list and notice pages | one muted sentence under the reduced header: “Oznámení zveřejňuje Pohřební služba Vzor. Telefon nonstop +420 …” with an ink link; no rule, no green, no strip even when emphasis is high. ⚖ L1, awaiting legal review |

Office hours never sit in the nonstop block: they have their own “Kancelář” heading everywhere (home column, menu, Kontakt, footer).

## Guardrails: do not drift

- **Keep:** the photo essay with numbered captions; the people photo bleeding to the right edge on the home and O nás; 3 px ink rules above blocks and 1 px rules between rows; the 360 px label column; green only for the nonstop number, step numerals, the high strip and the picked row; Archivo at two weights.
- **Keep the fallback:** every photo slot has a text equivalent (numbered place list with addresses, people table with phones). A page without photos must not show empty boxes, grey placeholders or “photo coming soon”.
- **Never add:** cards, tinted panels, shadows, rounded corners; icons; text over photos; carousels; a second accent colour; centred layouts; full-bleed photo bands between sections (that is template E); stock or generated images; photos on Ceník; business photos, green or numbered captions on notice pages.
- **Captions:** always number + caption text, optionally a place/address line in muted 85 %. Credits (“Foto [FOTOGRAF], 2026”) in the caption or once per group.
- **Notices:** reduced nav (Oznámení a obřady · Kontakt · Úvodní stránka), neutral line, reduced footer (legal identification, Právní informace, Ochrana osobních údajů, ADR). No “Na webu” links, no prices, no services.

## Photo brief

- **Commissioned** from a local photographer, one session, credited in the captions. No stock, no AI-generated or AI-edited images, no photos from other firms.
- **Documentary:** the real owners and staff at work and in their real places: the office on the square, the ceremony hall, the vehicle, the flower shop, the coffin and urn display, the cemetery.
- **Natural light**, no flash look, no heavy grading, no filters; colour, shot as it is.
- **No staged grief:** no crying people, no hands on coffins, no candles, doves, sunsets or wilting flowers, no clients or mourners. Never a deceased person.
- People photographed only with their written consent (people approvals); portraits 3 : 4, people photo on the home landscape (about 3 : 2), place photos about 3 : 2.
- The first-viewport people photo must be delivered small enough for LCP: ≤ 200 KB at 1280 via `astro:assets`, and the page must still pass with text as the LCP when it is absent.

## Proposals for the build [review]

- **Places content:** a per-client ordered list “Naše místa” of `{ image?, caption, place }` (place = name + address line), following template E's optional `site/landscapes.json` pattern. Without images it renders as the numbered list.
- **Lidé page:** core has no `lide` page id. Either add it, or render the drawn page as the `#lide` section of O nás / Kontakt. The nav label “Lidé” is drawn on the boards.
- **Home hero photo:** the people photo maps to the home page's `heroImage`; O nás uses its own `heroImage`.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in the first screen at 375 × 667 on every drawn page | pass (block under H1 + lead; strip when high; neutral line on notices) |
| Label and number in one `tel:` link | drawn so on all new boards; the original boards show them as siblings, build them as one link |
| Office hours separate from nonstop | pass |
| Body ≥ 18 px | pass; captions and muted lines 17, legal footer 375 to be built at 16 |
| Contrast, focus | pass (table above) |
| Tap targets ≥ 44 px | links carry 8–14 px vertical padding; picker rows 52 px; menu button 44 px |
| Hero works with text alone | pass (home without photos board) |
| L1 notices without promotion | reduced nav, neutral line, reduced footer, no green or business photos; ⚖ legal review |
| L8 footer identification | drawn on every page |
| L9 VAT note | drawn on Ceník (lead and end), A4, home price column, Služby prices |
| L10 ADR + Právní informace | drawn in every footer |
| Placeholders | only “Pohřební služba Vzor”, `+420 000 000 1xx`, prices marked UKÁZKA, names marked “Zástupná jména”; photos are labelled boxes |
