# G · Tichá krajina (`ticha-krajina`)

**Status (2026-11-10):** round-2 direction, liked by the owner; **moodboard stage**. Only the screens listed under *Drawn* exist. Everything under *Not drawn yet* is specified as rules, not pictures.

**Concept.** For a firm in a rural region that wants the site to feel like air and distance, not like a shop. The page is one long, slow scroll: short text sections alternate with full-bleed photographs of the local landscape, commissioned, without people and never in the first screen. The nonstop number is set as one long ruled line, a “stamp”, after the opening and again before the footer, so it is found at both ends of the read.

## Files

| Path | What |
| --- | --- |
| `comps/mlha/*.png`, `comps/len/*.png` | rendered comps per palette: `home-1280`, `home-375`, `notice-375`, `board` |
| `html/board-mlha.html`, `html/board-len.html` | plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-G-Ticha-krajina.dc.html` | canvas source |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, scales, layout |

## Drawn

| Screen | File | Notes |
| --- | --- | --- |
| Home 1280 | `comps/mlha/home-1280.png` | the first photo band starts below 800 px |
| Home 375 | `comps/mlha/home-375.png` | stamp line at ~380 px |
| Notice 375 | `comps/mlha/notice-375.png` | with family photo, with livestream link, neutral form |

## Structure (build these exactly)

- **Grid:** 12 columns, 24 px gap, 64 px side margin at 1280. Section = H2 in columns 1–4, text in 6–11. Hero: H1 72 px in columns 1–7, lead in 9–12, bottom-aligned.
- **Flow:** header → hero → stamp line → first text section (“Když někdo zemřel”) → **full-bleed photo band** (1280 × 440) with a caption under it → section → band → … → stamp line again → footer.
- **Photo bands** are never in the first viewport (keeps LCP on text, funeral-ux §4b). Without photos a band becomes 96 px of empty space; the page must still read as complete.
- **Navigation:** plain top bar, text links (Figtree 500, 18 px, underlined). 375: “Menu” button opens a list in the flow.
- **Separation:** photographs and the two ink rules of the stamp line. No other lines, no fills.

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | after the hero, and again before the footer | one `tel:` link between 1 px ink rules: label (Figtree 19) · number (Spectral 600, 42 px at 1280 / 33 at 375, `accent`, underlined) · “ve dne, v noci i o svátcích” (muted). One row at 1280, stacked at 375 |
| High emphasis | also directly under the header on every page, before the H1 | same component |
| Neutral (notice pages) | under the header | one plain sentence in muted text with an ink link “Telefon nonstop +420 …”; no rules, no accent, no photo bands. ⚖ L1 |

## Not drawn yet: rules for the remaining screens

| Screen | Rule |
| --- | --- |
| Jak postupovat | narrative timeline: phase headings (V prvních hodinách → V dalších dnech → Příprava pohřbu → Po pohřbu) in the H2 column, steps in the text column; situation picker as an inline sentence of links (as on home) |
| Ceník + A4 | per group: the from-price as the H2, then two columns “V ceně je zahrnuto / Není zahrnuto”; VAT note under each price. Print: no photos, same columns |
| Kontakt | address and hours section; separate stamp line for nonstop; optional photo of the building as a band |
| Oznámení list | calm list: name (Spectral 30), dates, ceremony sentence, optional small family photo left; upcoming first |
| Pro účastníky | sections with one landscape band at most |
| Lidé | name, role, phone in the text column; photo optional, 3:4 in the H2 column |
| Footer, 404, menu | footer between ink rules; 404 is a hero with one link home and the stamp line |

## Proposals

- `landscapeImages[]`: `{ image, caption, place }`, a per-client set of commissioned landscape photos for the bands.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 | pass (~380 px) |
| Office hours separate from nonstop | pass |
| Body ≥ 18 px | **fix in build:** the photo caption is 16 px and the Menu label 17 px in the comp; use 18 px |
| Contrast, focus ring | pass (TOKENS.md) |
| Hero works with text alone, LCP is text | pass by construction (photo bands below the fold) |
| Ban list | pass; photos must never show people, sunsets, clouds or flowers |
| L1 notices without promotion | pass in comp; neutral form needs legal review |
| L8 footer identification | drawn on the notice page; required on every page |
| L9 prices with VAT | not drawn yet (rule above) |
| L10 Právní informace link | drawn in the notice footer |
| L12 consent | placeholder names marked; family photo needs the same consent record |
