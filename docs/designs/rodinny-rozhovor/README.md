# I · Rodinný rozhovor (`rodinny-rozhovor`)

**Status (2026-11-10):** round-2 direction, liked by the owner. Home, a notice page and the full page set are drawn. **Build from the pictures and the HTML;** the text below explains them and lists what must not change.

**Concept.** For a small family firm that wants the site to sound like the first phone call with them: warm, direct, human. The page is a conversation: every section is a question the family is asking (“Kdo nám pomůže hned?”, “Co nás teď čeká?”, “Kolik to bude stát?”) with a short plain answer, and the answer to the first question is the phone number. Warm colour fields and hand-drawn line illustrations replace photographs, so it is gentle without being sombre.

## Files

| Path | What |
| --- | --- |
| `comps/hlina/*.png`, `comps/med/*.png` | every screen at native width, per palette; `board.png` = home + notice with notes; `pages.png` = all other pages with notes |
| `html/board-*.html`, `html/pages-*.html` | plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-I-*.dc.html` | canvas sources |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, scales, layout |

## Drawn screens

| Screen | File (`comps/hlina/`) | What to copy exactly |
| --- | --- | --- |
| Home 1280 | `home-1280.png` | big clay field: H1 “Kdo nám pomůže hned?”, answer line, number 54 px; then question sections alternating sand and cream |
| Home 375 | `home-375.png` | wrapping word nav, clay field with the number at about 400 px |
| Notice 375 | `notice-375.png` | nav reduced to two words; sand strip with publisher + phone; questions “Kdy a kde / Na dálku / Od rodiny / Kondolence” |
| Ceník 1280 | `cenik-1280.png` | **compact clay strip** under the header (inner-page nonstop); H1 “Kolik to bude stát?”; each group is a question with the **price inside the answer sentence**, then two lists; items as a **borderless** table on sand; closing sentence |
| Ceník A4 | `cenik-a4.png` | fields become thin warm rules; questions stay as headings with the price joined (“… Od 14 900 Kč.”) |
| Kontakt 375 | `kontakt-375.png` | questions: “Kde vás najdeme?”, “Kdy můžeme přijít do kanceláře?” (hours), “Jak se s vámi spojím?”, and separately “Co když je to v noci?” |
| Oznámení 1280 / 375 | `oznameni-1280.png`, `oznameni-375.png` | plain cream, no clay, no drawings, no closing sentence; nav = Oznámení a obřady · Kontakt; names in Alegreya 700 followed by the ceremony sentence |
| Jak postupovat 375 | `jak-postupovat-375-bez-vyberu.png`, `jak-postupovat-375-doma.png` | H1 “Co teď?”; picker is a sentence of words (44 px each); picked word becomes a small clay tag “doma (vybráno)”; steps become checklists under “Zemřel doma. Co udělat teď?”, “Co v dalších dnech?”, “Co po pohřbu?” |
| Lidé 1280 | `lide-1280-s-fotkami.png`, `lide-1280-bez-fotek.png` | H1 “Kdo vás přijme?”; 2 × 2 on a sand field, 160 × 200 photo; roles written as what the person does for you (“Sjedná s vámi pohřeb.”); without photos four names in one row, optional drawing |
| Pro účastníky 375 | `pro-ucastniky-375.png` | “Jdete na pohřeb?” then five guest questions on alternating fields |
| Header 320 | `hlavicka-320.png` | **I has no menu**: six words wrap into three rows of 44 px targets |
| 404 375 | `404-375.png` | “Tuhle stránku jsme nenašli.” / “Co hledáte?” with four answer links |
| Služby 1280 | `sluzby-1280.png` | “Co pro vás můžeme zařídit?” then one question per kind of help (“Musí být pohřeb s obřadem?”, “Kdo vyřídí úřady?”, “Přijedete i v noci?”, “Co bude s urnou?”) |
| Footer 1280 | `paticka-1280.png` | closing sentence on cream, then a sand footer with question headings: Kde nás najdete · Kdy jsme v kanceláři · Kdykoli, i v noci · Dokumenty; legal row with ADR |

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default, home | the clay field: answer to “Kdo nám pomůže hned?” | label Alegreya Sans 500 on `on_deep_muted`, number Alegreya 700 54 / 36 px in `on_deep`, underlined |
| Default, inner pages | **compact clay strip under the header** | “Potřebujete nás hned? Nonstop převoz zesnulých” + number 30 px, `on_deep` on `deep`. Keeps the number in the first screen on every page |
| Closing | last sentence of every page | “Kdykoli potřebujete, volejte +420 …” |
| High emphasis | the full clay field at the top of every page | same component as home |
| Neutral | notice list and notice pages | sand strip with “Oznámení zveřejňuje … Telefon nonstop …”; no clay, nav reduced to two words. ⚖ L1 |

## Guardrails: do not drift

- **Keep:** every H1 and H2 phrased as the family’s question, answered in two or three plain sentences; full-bleed fields alternating sand and cream (clay only for the nonstop); Alegreya for text, Alegreya Sans only for nav and labels; nav always visible as words, **no menu button and no JavaScript**.
- **Never add:** lines or rules between sections (fields do the separating; tables are borderless); cards, boxes, shadows, rounded corners; icons; stock or AI photos; drawings of doves, candles, hands or wilting flowers; marketing headings that are not questions.
- **Navigation:** at most six words. Služby, Lidé, Pro účastníky, FAQ and Dokumenty are reached from “Kdo jsme”, page links and the footer.
- **Drawings** are optional, commissioned pen drawings; every layout works without them.

## Proposals

- `illustrations[]`: `{ slot, image, alt }` per client, slots `hero`, `guidance`, `contact`, `office`, `services`.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 on every drawn page | pass (clay field on home, clay strip on inner pages, neutral strip on notices) |
| Office hours separate from nonstop | pass (separate questions and footer columns) |
| Body ≥ 18 px, contrast | pass (TOKENS.md); the strip number is `on_deep` on `deep` (10 : 1) |
| 44 px targets | pass (nav words and picker words are 44 px tall) |
| JS only for the menu | pass: no JS at all |
| Ban list | pass |
| L1 notices without promotion | reduced nav, no clay, no drawings drawn; ⚖ legal review |
| L8 footer identification | drawn |
| L9 VAT note | drawn (home, Ceník, A4) |
| L10 ADR + Právní informace | drawn in the footer |
| L12 consent | placeholders marked; the people photo needs staff consent |
