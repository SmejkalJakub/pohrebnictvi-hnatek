# F · Noční linka (`nocni-linka`)

**Status (2026-11-10):** round-2 direction, liked by the owner. Home, a notice page and the full page set are drawn. **Build from the pictures and the HTML;** the text below explains them and lists what must not change.

**Concept.** For the person who opens the site at two in the morning. The site is dark, quiet and very large: on desktop a fixed side rail holds the name, the nonstop number and the navigation, and the content scrolls beside it as a sequence of single statements, one per screen. Nothing competes with the number, and nothing has to be read twice.

## Files

| Path | What |
| --- | --- |
| `comps/noc/*.png`, `comps/grafit/*.png` | every screen at native width, per palette (list below); `board.png` = home + notice with design notes; `pages.png` = all other pages with notes |
| `html/board-*.html`, `html/pages-*.html` | the same boards as plain HTML with every value resolved. **Read exact sizes, spacing and colours here.** |
| `source/R2-F-*.dc.html` | canvas sources |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, type scale, spacing, layout |

## Drawn screens

| Screen | File (`comps/noc/`) | What to copy exactly |
| --- | --- | --- |
| Home 1280 | `home-1280.png` | 440 px sticky rail; statements with a 20 px muted kicker, 76 px H1, one link |
| Home 375 | `home-375.png` | header row + nonstop panel on the rail colour, statements stacked 96 px apart |
| Notice 375 | `notice-375.png` | neutral line between 1 px rules; 26 px bold ceremony sentence; light QR box |
| Ceník 1280 | `cenik-1280.png` | each group is a statement: kicker = group, **56 px price heading in ink**, two lists; items table 22 px rows with 1 px rules; VAT note bold in the lead; demo notice in the only 1 px box on the site |
| Ceník A4 | `cenik-a4.png` | prints **light**: black on white, groups with the price right-aligned on a rule, lists side by side, contacts + legal footer |
| Kontakt 375 | `kontakt-375.png` | three statements: Úřední hodiny (rows), Telefony a e-mail, Převoz zesnulých; the number itself stays in the top panel |
| Oznámení 1280 / 375 | `oznameni-1280.png`, `oznameni-375.png` | **neutral rail** (no amber, no “převoz”, nav = Oznámení a obřady · Kontakt · Úvodní stránka); agenda: date as 30 px heading, “time · name” on one line, place and type muted; “Bez veřejného obřadu” group; recent notices |
| Jak postupovat 375 | `jak-postupovat-375-bez-vyberu.png`, `jak-postupovat-375-doma.png` | picker = four full-width 58 px bordered links; picked one inverted with the word “vybráno”; “Zobrazeno 5 ze 7 kroků” + reset link; step = kicker “Krok 1 z 5 · phase”, 30 px heading, text, 28 px native checkboxes, “Další krok”; steps with an emergency prompt repeat the panel |
| Lidé 1280 | `lide-1280-s-fotkami.png`, `lide-1280-bez-fotek.png` | with photos one person per row, 112 × 140 portrait; without photos two ruled columns of 30 px names. No initials |
| Pro účastníky 375 | `pro-ucastniky-375.png` | five short statements: síň, parkování, oblečení, květiny, přenos |
| Menu 375 | `menu-375-otevrene.png` | “Zavřít”; list in the flow under the panel, 24 px bold rows with rules |
| 404 375 | `404-375.png` | kicker “Chyba 404”, one sentence, four links |
| Služby 1280 | `sluzby-1280.png` | short index of statements per kind of funeral; “Další služby” as inline links; each detail page repeats the statement pattern |
| Footer 1280 | `paticka-1280.png` | on the rail colour: name/address · Kancelář · Nonstop převoz (amber number) · Dokumenty; legal row with ADR (adr.coi.cz) and Právní informace |

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | rail (1280), panel under the header (375) | label 20 px bold ink + number 38 px (rail) / 36 px (375) bold `signal`, 3 px underline, `nowrap` |
| High emphasis | same places | number 60 px in the rail; extra line only with `emergency.responseNote` (proposal) |
| Neutral | notice list and notice pages | “Oznámení zveřejňuje Pohřební služba Vzor.” + ink link “Telefon nonstop +420 …”; reduced nav. ⚖ L1 |

## Guardrails: do not drift

- **Keep:** dark ground on every page; the sticky rail on every desktop page; amber **only** for the nonstop number (never prices, links, headings, focus of other things); one statement per section with a muted kicker; 1 px rules only at the top of a statement and in tables.
- **Never add:** a horizontal top nav on desktop; cards, tiles or boxed sections (the demo-price notice is the single box); hero images or photos on home; icons; centred text; rounded corners; light sections; a second accent colour.
- **Sizes:** statements are as tall as their content; only the first home statement has `min-height` of one screen.
- **Print** is always light.

## Proposals

- `emergency.responseNote`: optional promise such as “Ozveme se do 5 minut”.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 on every drawn page | pass |
| Office hours separate from nonstop | pass (Kontakt, footer) |
| Body ≥ 18 px, contrast, focus | pass (TOKENS.md) |
| 44 px targets | pass (picker 58 px, buttons 48 px) |
| Ban list | pass; risk of equal-height statements handled by the sizing rule above |
| L1 notices without promotion | neutral rail and reduced nav drawn; ⚖ legal review |
| L8 footer identification | drawn (`paticka-1280`, notice) |
| L9 VAT note | drawn (Ceník screen and A4) |
| L10 ADR + Právní informace | drawn in the footer |
| L12 consent | names and staff photos are placeholders; consent is a core gate |
