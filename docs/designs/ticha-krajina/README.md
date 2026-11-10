# G · Tichá krajina (`ticha-krajina`)

**Status (2026-11-10):** round-2 direction, liked by the owner. Home, a notice page and the full page set are drawn. **Build from the pictures and the HTML;** the text below explains them and lists what must not change.

**Concept.** For a firm in a rural region that wants the site to feel like air and distance, not like a shop. The page is one long, slow scroll: short text sections alternate with full-bleed photographs of the local landscape, commissioned, without people and never in the first screen. The nonstop number is set as one long ruled line, a “stamp”, after the opening and again before the footer, so it is found at both ends of the read.

## Files

| Path | What |
| --- | --- |
| `comps/mlha/*.png`, `comps/len/*.png` | every screen at native width, per palette; `board.png` = home + notice with notes; `pages.png` = all other pages with notes |
| `html/board-*.html`, `html/pages-*.html` | plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-G-*.dc.html` | canvas sources |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, scales, layout |

## Drawn screens

| Screen | File (`comps/mlha/`) | What to copy exactly |
| --- | --- | --- |
| Home 1280 | `home-1280.png` | 12-col grid; H1 72 px light Spectral in cols 1–7, lead in 9–12; stamp line; first photo band below 800 px |
| Home 375 | `home-375.png` | H1 38 px, stamp line at about 380 px, then sections and a 240 px band |
| Notice 375 | `notice-375.png` | family photo full width (optional), name 42 px light, plain sentences; neutral line under the header |
| Ceník 1280 | `cenik-1280.png` | group name as a small Figtree label, **from-price as the 44 px H2** in cols 1–4; “V ceně / Není zahrnuto” lists in cols 6–8 and 9–11; items table with hairlines in cols 6–11; 96 px between groups; **no photo bands on this page**; stamp line closes it |
| Ceník A4 | `cenik-a4.png` | same logic at reduced size: label + price left, lists right; no photos, no accent |
| Kontakt 375 | `kontakt-375.png` | H1 + one sentence, then the stamp line, then Kancelář, Úřední hodiny (hairline table), Telefony; optional band of the building |
| Oznámení 1280 / 375 | `oznameni-1280.png`, `oznameni-375.png` | top nav reduced to Oznámení a obřady · Kontakt · Úvodní stránka; neutral line; each notice is a name (34 px link) + dates + ceremony sentence, optional 3:4 family photo beside it; **no bands, no stamp line** |
| Jak postupovat 375 | `jak-postupovat-375-bez-vyberu.png`, `jak-postupovat-375-doma.png` | picker is a **sentence of words**, each a 44 px target; picked word has a 3 px accent bar under it and “(vybráno)”; phases as small Figtree labels, steps as Spectral 600 headings: a narrative, not a grid |
| Lidé 1280 | `lide-1280-s-fotkami.png`, `lide-1280-bez-fotek.png` | with photos one per row, portrait cols 1–2, light 36 px name in cols 4–11; without photos the names sit two per row in the text column |
| Pro účastníky 375 | `pro-ucastniky-375.png` | sections separated by space, one landscape band in the middle |
| Menu 375 | `menu-375-otevrene.png` | large light Spectral words separated by space only, stamp line under the list |
| 404 375 | `404-375.png` | one sentence with two inline links, then the stamp line |
| Služby 1280 | `sluzby-1280.png` | one long page: hero, stamp line, sections (H2 cols 1–4, text 6–11), a band between every second section |
| Footer 1280 | `paticka-1280.png` | opens with the second stamp line; three columns Kancelář · Dokumenty · Právní informace; legal row with ADR |

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | after the opening of every page, and again at the top of the footer | one `tel:` link between 1 px ink rules: label · number (Spectral 600, 42 / 33 px, accent, underlined) · “ve dne, v noci i o svátcích” |
| High emphasis | also directly under the header, before the H1 | same component |
| Neutral | notice pages | one muted sentence with an ink link “Telefon nonstop +420 …”; no rules, no accent, no bands. ⚖ L1 |

## Guardrails: do not drift

- **Keep:** light, airy pages on the 12-column grid (heading cols 1–4, text cols 6–11); Spectral 400 for large headings (light, not bold); space as the separator; the stamp line twice per page.
- **Never add:** boxes, cards, tinted panels or borders around sections; icons; photos of people, sunsets, clouds or flowers; a photo in the first viewport; text on top of photos; bold display headings; centred layouts.
- **Photos:** only commissioned local landscapes or buildings; without photos, bands collapse to 96 px of space.
- **Captions and labels** in Figtree at 18 px minimum (the home comp shows a 16 px caption: build it at 18).

## Proposals

- `landscapeImages[]`: `{ image, caption, place }` per client for the bands.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 on every drawn page | pass (stamp line after the opening; neutral line on notices) |
| Office hours separate from nonstop | pass |
| Body ≥ 18 px | pass on the page comps; home caption to be built at 18 px |
| Contrast, focus | pass (TOKENS.md) |
| Hero works with text alone, LCP is text | pass by construction |
| Ban list | pass |
| L1 notices without promotion | reduced nav, no bands, neutral line drawn; ⚖ legal review |
| L8 footer identification | drawn |
| L9 VAT note | drawn (Ceník screen and A4) |
| L10 ADR + Právní informace | drawn in the footer |
| L12 consent | placeholders marked; family photos need the consent record |
