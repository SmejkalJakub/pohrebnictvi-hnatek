# H · Plný přehled (`plny-prehled`)

**Status (2026-11-10):** round-2 direction, liked by the owner. Home, a notice page and the full page set are drawn. **Build from the pictures and the HTML;** the text below explains them and lists what must not change.

**Concept.** For families who want facts, not atmosphere: the practical son or daughter who arranges everything and compares. The home page is a directory, like a timetable or a municipal noticeboard: every route, the key prices, the people and the documents fit on one desktop screen, in four ruled columns. Nobody has to scroll or guess what is behind a menu; on a phone the same index folds into a list of sections.

## Files

| Path | What |
| --- | --- |
| `comps/bila-a-zluta/*.png`, `comps/seda-a-terakota/*.png` | every screen at native width, per palette; `board.png` = home + notice with notes; `pages.png` = all other pages with notes |
| `html/board-*.html`, `html/pages-*.html` | plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-H-*.dc.html` | canvas sources |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, scales, layout |

## Drawn screens

| Screen | File (`comps/bila-a-zluta/`) | What to copy exactly |
| --- | --- | --- |
| Home 1280 | `home-1280.png` | header with the highlighted nonstop box and the separate Kancelář box; full nav row under a 3 px rule; 4-column directory with column rules |
| Home 375 | `home-375.png` | “Rejstřík” button; both boxes; directory as `<details>` rows, first open |
| Notice 375 | `notice-375.png` | plain 1 px box instead of the highlight; data table of the facts |
| Ceník 1280 | `cenik-1280.png` | two package groups side by side under 3 px rules, price in mono at the right of the group title, two lists each; items table with a **“Typ ceny” column** (pevná, za jednotku, rozpětí, od, na dotaz); VAT note under the title and under the table |
| Ceník A4 | `cenik-a4.png` | the same tables; packages as one table with included / excluded columns; the highlight becomes a 2 px black box |
| Kontakt 375 | `kontakt-375.png` | everything as key–value tables: contacts, úřední hodiny, převoz (availability, area) |
| Oznámení 1280 / 375 | `oznameni-1280.png`, `oznameni-375.png` | plain box with publisher + phone; nav row reduced to Oznámení a obřady · Kontakt · Úvodní stránka; **timetable**: datum · čas · jméno · místo · obřad · přenos, em dash for missing values; on 375 each notice is a name + a 3-row mini table |
| Jak postupovat 1280 | `jak-postupovat-1280.png` | **the situation matrix**: rows = steps, columns = doma / nemocnice / domov / zahraničí with “ano” or “—”; picking a situation hides the other columns and rows |
| Jak postupovat 375 | `jak-postupovat-375-bez-vyberu.png`, `jak-postupovat-375-doma.png` | 2 × 2 situation buttons (the only filled controls); unpicked: table of all steps with “Platí pro”; picked: inverted button with “vybráno” and one compact checklist with real checkboxes |
| Lidé 1280 | `lide-1280-s-fotkami.png`, `lide-1280-bez-fotek.png` | a table: 64 × 80 thumbnail or **square initials box**, name, “Na starosti”, direct line in mono or “—” |
| Pro účastníky 375 | `pro-ucastniky-375.png` | reference sheet: two key–value tables (Smuteční síň, Na obřad) |
| Menu 375 | `menu-375-otevrene.png` | “Rejstřík”: every page as a table row with a count or from-price in mono |
| 404 375 | `404-375.png` | “Stránka nenalezena” + the whole index as `<details>` rows |
| Služby 1280 | `sluzby-1280.png` | index table: služba · co zahrnuje · cena (mono) · Detail; VAT note under it |
| Footer 1280 | `paticka-1280.png` | 3 px rule; Kancelář · Nonstop převoz · Dokumenty (PDF) · Právní (incl. adr.coi.cz); legal row |

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | header box on every page | highlight fill + 2 px ink border; label 18 px bold, number mono 30 / 28 px, underlined, `nowrap` |
| High emphasis | header box doubles in height; at 375 it repeats as the first row of the page | same component |
| Neutral | notice list and notice pages | plain 1 px ink box: publisher + “Telefon nonstop …” in mono; reduced nav. ⚖ L1 |

## Guardrails: do not drift

- **Keep:** white (or light grey) ground, black ink, one highlight colour behind the nonstop number only; Overpass for words, **Overpass Mono for every number**; tables and column rules as the structure; the full nav row on desktop; `<details>` sections on phones.
- **Never add:** hero sections, big headlines over 40 px, marketing copy, illustrations, photos larger than a thumbnail, cards with shadows, icons, coloured backgrounds for sections, a hamburger icon (the button says “Rejstřík”), rounded corners.
- **Colour:** the highlight is never used for anything else (not for links, prices or the active nav item).
- **The yellow is a risk** (sector rule against cheerful colour on the urgent line): the owner may choose “Šedá a terakota” as default.
- **Middle dot:** Overpass sets `·` tight to the next word; use separator elements with their own margin or plain lists.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 on every drawn page | pass |
| Office hours separate from nonstop | pass (two boxes, two headings) |
| Body ≥ 18 px | pass on the page comps (the home comp’s 17 px mono hours: build at 18) |
| Contrast | pass; the highlight box always keeps its 2 px ink border |
| Ban list | pass; yellow on the urgent line flagged above |
| L1 notices without promotion | plain box and reduced nav drawn; home shows notices only as a link with a count; ⚖ legal review |
| L8 footer identification | drawn |
| L9 VAT note | drawn (home, Ceník, Služby, A4) |
| L10 ADR + Právní informace | drawn in the footer |
| L12 consent | placeholders marked; staff photos need consent |
