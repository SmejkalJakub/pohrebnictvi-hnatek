# F · Noční linka (`nocni-linka`)

**Status (2026-11-10):** round-2 direction, liked by the owner; **moodboard stage**. Only the screens listed under *Drawn* exist. Everything under *Not drawn yet* is specified as rules, not pictures.

**Concept.** For the person who opens the site at two in the morning. The site is dark, quiet and very large: on desktop a fixed side rail holds the name, the nonstop number and the navigation, and the content scrolls beside it as a sequence of single statements, one per screen. Nothing competes with the number, and nothing has to be read twice.

## Files

| Path | What |
| --- | --- |
| `comps/noc/*.png`, `comps/grafit/*.png` | rendered comps per palette: `home-1280`, `home-375`, `notice-375`, and `board` (everything incl. notes) |
| `html/board-noc.html`, `html/board-grafit.html` | the same boards as plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-F-Nocni-linka.dc.html` | the canvas source (Claude Design format, palette values in the script at the bottom) |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, type scale, spacing, layout |

## Drawn

| Screen | File | Notes |
| --- | --- | --- |
| Home 1280 | `comps/noc/home-1280.png` | rail 440 px (sticky in the build), statements each about one screen tall |
| Home 375 | `comps/noc/home-375.png` | nonstop panel directly under the header row |
| Notice 375 | `comps/noc/notice-375.png` | no photo, with livestream link, neutral nonstop form |

## Structure (build these exactly)

- **Desktop:** two columns. Left: a `position: sticky; top: 0; height: 100vh` rail, 440 px, on `rail` colour: name, place line, nonstop block, vertical nav (1 px `rule` lines between items). Right: content with 96 px side padding.
- **Statements:** each home section is a label (muted, 20 px), one large heading (H1 76 px / H2 60 px at 1280; 40 / 34 at 375), at most two sentences, one link. `min-height` about one screen for the first statement only; the rest size to content (see self-check, ban "every section the same height").
- **Mobile:** header row (name + "Obsah" button, 2 px border, 48 px tall), then the nonstop panel on `rail` colour full width, then the statements stacked with 96 px between them.
- **Navigation:** desktop = the rail list (no top nav). Mobile = "Obsah" opens a full-page list in the flow (the only JS).
- **Photos:** none on home. At most one photo on O nás.
- **Office hours:** never in the rail; own heading on “Lidé a kancelář” and in the footer.

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | rail (1280), panel under header (375) | label 20 px bold ink + number 38 px (rail) / 36 px (375) bold `signal`, 3 px underline, `white-space: nowrap`; note “Voláte přímo nám. Ve dne, v noci i o svátcích.” |
| High emphasis | same places | number 60 px in the rail; extra line only if the client can promise a response time (proposal `emergency.responseNote`) |
| Neutral (notice pages) | under the header, full width between 1 px rules | “Oznámení zveřejňuje Pohřební služba Vzor.” + link “Telefon nonstop +420 …” in ink; no `signal` colour, no “převoz”. ⚖ legal review (L1) |

## Not drawn yet: rules for the remaining screens

| Screen | Rule |
| --- | --- |
| Jak postupovat | one step per screen-tall section: step title as H2, “Co udělat” summary, checklist, “Další krok” link; situation picker “Kde blízký člověk zemřel?” as four large links at the top (`:target`) |
| Ceník + A4 | one statement per group with the from-price as the heading (“Pohřeb bez obřadu od 14 900 Kč”), then “V ceně je zahrnuto / Není zahrnuto” lists; the VAT note under every price heading. **Print: light (black on white), single column** |
| Kontakt | statement “Kancelář” with hours and address; separate statement “Nonstop převoz” (never the same block) |
| Oznámení list | large-type agenda: date as heading (“Pátek 14. listopadu”), one ceremony per row (time · name · place), then recent notices |
| Pro účastníky | statements: “Jak najít síň”, “Parkování”, “Oblečení”, “Květiny”, “Přenos” |
| Lidé | name 34 px, role, direct phone; no photos by default, so it is complete without them |
| Footer, 404, menu open | footer on `rail` colour; 404 is one statement “Tato stránka tu není” + the rail nav; the open menu is a full-page list of the rail links |

## Proposals (need fields that do not exist)

- `emergency.responseNote`: optional promise such as “Ozveme se do 5 minut”.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 | pass (panel at ~110 px) |
| Office hours never share a container with nonstop | pass |
| Body ≥ 18 px, contrast, focus ring ≥ 3:1 | pass (see TOKENS.md) |
| 44 px targets | pass on drawn screens; nav rows 44 px in build |
| Ban: every section the same height | **risk:** statements are screen-tall by design. Build only the first as `min-height`, the rest to content |
| Ban: gradients, shadows, cards, pills, badges above H1, centred hero, stats, icons, doves etc. | pass |
| L1 notices without promotion | pass in comp; neutral form needs legal review |
| L8 footer identification | drawn on the notice page; required on every page |
| L9 prices with VAT | not drawn yet (rule above) |
| L10 Právní informace link | drawn in the notice footer |
| L12 consent for names on notices | placeholder names marked; consent is a core gate |
