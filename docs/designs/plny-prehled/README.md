# H · Plný přehled (`plny-prehled`)

**Status (2026-11-10):** round-2 direction, liked by the owner; **moodboard stage**. Only the screens listed under *Drawn* exist. Everything under *Not drawn yet* is specified as rules, not pictures.

**Concept.** For families who want facts, not atmosphere: the practical son or daughter who arranges everything and compares. The home page is a directory, like a timetable or a municipal noticeboard: every route, the key prices, the people and the documents fit on one desktop screen, in four ruled columns. Nobody has to scroll or guess what is behind a menu; on a phone the same index folds into a list of sections.

## Files

| Path | What |
| --- | --- |
| `comps/bila-a-zluta/*.png`, `comps/seda-a-terakota/*.png` | rendered comps per palette: `home-1280`, `home-375`, `notice-375`, `board` |
| `html/board-bila-a-zluta.html`, `html/board-seda-a-terakota.html` | plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-H-Plny-prehled.dc.html` | canvas source |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, scales, layout |

## Drawn

| Screen | File | Notes |
| --- | --- | --- |
| Home 1280 | `comps/bila-a-zluta/home-1280.png` | whole directory above 800 px; FAQ row and footer below |
| Home 375 | `comps/bila-a-zluta/home-375.png` | `<details>` sections, the first open |
| Notice 375 | `comps/bila-a-zluta/notice-375.png` | with photo thumbnail, with livestream link, neutral form, data table |

## Structure (build these exactly)

- **Header (1280):** name 30 px bold + address line left; right: the **nonstop box** (highlight fill, 2 px ink border) and, separately, the **Kancelář box** (1 px ink border, hours and office phone in mono). Two boxes, two headings, never one container.
- **Nav row:** 3 px ink rule above, 1 px below; every page as a text link, wrapping.
- **Directory:** 4 equal columns with 1 px `rule` column lines: (1) Když někdo zemřel: situation links + “První hodiny” ordered list; (2) Ceník, výběr: 5-row table, mono prices right-aligned, VAT note bold; (3) Služby list + Rakve / Květiny with counts and small thumbnails; (4) Lidé (48×60 photo or initials box), Oznámení (link + count only), Dokumenty (PDF list).
- **Then:** “Časté otázky” row under a 3 px rule, then the footer.
- **375:** header with “Rejstřík” button; nonstop box; Kancelář box (hours on two lines); then every directory column as a `<details>` row (summary 20 px bold, count or from-price in mono beside it); first one open. No JS needed for the sections.
- **Numbers:** every phone, time, date and price in Overpass Mono 500.
- **Photos:** thumbnails only (people 48×60, coffins 64×48, flowers 48×48). Initials box when a person has no photo.

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | header box | highlight fill, 2 px ink border, label 17–18 px bold + number mono 30 px (28 at 375), underlined |
| High emphasis | header box doubles in height; at 375 it repeats as the first row of every page | same component |
| Neutral (notice pages) | under the header | plain 1 px ink box: “Oznámení zveřejňuje Pohřební služba Vzor. Telefon nonstop +420 …”, no highlight, number `nowrap`. ⚖ L1 |

## Not drawn yet: rules for the remaining screens

| Screen | Rule |
| --- | --- |
| Jak postupovat | checklist table: rows = steps, a column per situation (doma, nemocnice, domov pro seniory, zahraničí) marking which apply; picking a situation (`:target`) hides the other columns and rows; 375: one list per situation |
| Ceník + A4 | full table per group: položka · popis · cena (mono, right), then “V ceně je zahrnuto / Není zahrnuto” as two lists; VAT note above the first table and under each group. **A4 print = the same table**, nothing else changes |
| Kontakt | two boxes (nonstop, kancelář) as in the header, then address, map link, phones table |
| Oznámení list | table: datum · čas · jméno · místo · obřad; upcoming first; 375: each row stacks into a 2-column mini table |
| Pro účastníky | reference sheet: headings + short tables (parkování, oblečení, květiny, přenos) |
| Lidé | table-like rows with thumbnail or initials box, role, direct phone in mono |
| Footer, 404, menu | footer under a 3 px rule; 404 = the directory itself with “Stránka nenalezena” as H1; “Rejstřík” opens the nav list in the flow |

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 | pass (~150 px) |
| Office hours separate from nonstop | pass (two boxes, two headings) |
| Body ≥ 18 px | **fix in build:** the mono hours and nonstop label are 17 px in the comp; use 18 px |
| Contrast | pass; the highlight against white is 1.7 : 1, so the box **always** keeps its 2 px ink border |
| Sector rule “no cheerful colour on the urgent line” | **risk:** yellow may read as a warning. It carries ink text and an ink border; palette “Šedá a terakota” is the calmer option. Owner to decide |
| Ban list | pass (thumbnails are content, not decoration; no icon cards) |
| Prices on home | allowed (not a notice page); demo prices marked UKÁZKA |
| L1 | home lists notices only as a link and count, never a deceased person next to prices; notice page neutral. ⚖ legal review |
| L8 footer identification | drawn on home 1280 and notice |
| L9 prices with VAT | drawn: “Ceny jsou uvedeny včetně DPH.” beside the price table |
| L10 Právní informace link | drawn in footers |
| L12 consent | placeholder names marked; staff photos need consent |

## Known font quirk

Overpass sets the middle dot `·` close to the following word (“Doma ·V nemocnici”). Use a separator element with its own margin, or a plain list.
