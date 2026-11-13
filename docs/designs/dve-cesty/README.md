# D · Dvě cesty (`dve-cesty`)

**Status (2026-11-13):** direction D3 from the owner's canvas "Šablona D – nové směry" was approved and replaces the rejected D `plny-prehled`. The full page set below is drawn on its own canvas; the owner approved it and the plan (`docs/notes/s10-dve-cesty.md`), and the template is built in `templates/dve-cesty/`.

- Approved direction (home 1280, home 375, notice 375): https://claude.ai/artifact/AHgPD1zhPDDoGsdARqgyeQ, row "D3 Dvě cesty"
- Full page set: https://claude.ai/artifact/67Y2Yp9dsi5UdrSvax7qSj ("Šablona D Dvě cesty – stránky"; private, owner's account)

**For the building agent:** read **"Guardrails: do not drift"** first, take exact values from `html/*.dc.html` (plain HTML with every value inline; open them in a browser directly) and compare your pages with `comps/*.png` at the same width. Anything not drawn (rakve, květiny, o-nas, faq, dokumenty, právní informace, privacy, service detail pages) is built from the nearest drawn page **of the same path** (see "Paths"), never from another template.

## Concept

For a funeral home whose visitors arrive in two very different states. The first screen splits by the visitor's situation: on the left a dark half, "Někdo právě zemřel", with the nonstop number and three first steps; on the right a light stone half, "Chci se informovat nebo připravit", with prices, a funeral without ceremony, pre-planning and questions. A "Teď hned / S předstihem" switch in the header keeps the two paths apart across the whole site: every page belongs to one path and opens in that path's colour, so a person in shock never wades through price lists, and a person planning ahead is never rushed by the urgent number.

## Files

| Path | What |
| --- | --- |
| `html/cesty-home-1280.dc.html`, `cesty-home-375.dc.html`, `cesty-notice-375.dc.html` | the three approved boards, unchanged |
| `html/*.dc.html` (18 more) | the page set drawn on the new canvas; every colour and size inline |
| `comps/*.png` | every board at its native width, rendered from `html/` in Chromium with Manrope loaded (`home-1280`, `home-375`, `notice-375`, `jak-postupovat-375-bez-vyberu`, `-doma`, `-nemocnice`, `-domov`, `-zahranici`, `kontakt-375`, `lide-1280-s-fotkami`, `lide-1280-bez-fotek`, `cenik-1280`, `cenik-a4`, `sluzby-1280`, `pro-ucastniky-375`, `oznameni-1280`, `oznameni-375`, `paticka-1280`, `menu-375-otevrene`, `404-375`, `nouzovy-kontakt-375`) |
| `source/round2-canvas.json` | index of the direction canvas (D1–D3 boards and concept notes) |
| `source/pages-canvas.json` | index of the page-set canvas (board positions, path notes) |
| `tokens.json` | the tokens below as data |

## Paths

Every page belongs to exactly one path, or to the neutral notice group. The path decides the colour of the page opening, the selected switch option and the "V této cestě" row at 1280.

| Path | Pages | Opening |
| --- | --- | --- |
| **Teď hned** | Jak postupovat, Kontakt (with Lidé at `/kontakt/#lide`) | dark navy panel: path label, H1, nonstop number |
| **S předstihem** | Ceník (+ print), Služby (+ detail), Pohřeb předem, Rakve, Květiny, Časté otázky, Dokumenty, O nás, Pro účastníky, Právní informace, Ochrana osobních údajů | stone panel: path label, H1, lead, ruled nonstop line |
| **Neutral** (no path, §4a L1) | Oznámení a obřady (list), each notice | no switch, no panel: reduced header + grey publisher line |
| **Both** | Home (the split itself), 404 (two small halves, switch with nothing selected) | — |

At 1280 the opening panel starts with "V&nbsp;této cestě:" and the path's pages (Teď hned: Jak postupovat · Kontakt; S předstihem: Ceník · Služby · Pohřeb předem · Rakve · Květiny · Časté otázky · Dokumenty), current page underlined 3 px and bold. At 375 there is no such row: the Menu groups the same links by path (see `menu-375-otevrene`).

## Drawn screens

| Screen | Path | What to copy exactly |
| --- | --- | --- |
| Home 1280 / 375 | both | header grid `1fr auto 1fr` with the switch centred (1280); switch full width under the header (375); H1 question; two equal halves (1280) or stacked dark-first (375); office, notices and "O nás" in three plain columns below, never in the dark half |
| Notice 375 | neutral | reduced header, grey publisher line, name 34 px 800, ceremony sentence 21 px 700 under a 2 px rule, sections under 1 px rules, QR + "Ctrl + P" hint |
| Jak postupovat 375 (5 boards) | Teď hned | dark opening with the number; picker "Kde blízký člověk zemřel?" as four full-width ruled link rows (20 px 700); the picked row is filled navy with "(vybráno)" and a "Zrušit výběr a ukázat vše" link below; phases as 22 px headings on a 2 px navy rule; numbered steps (28 px number column, 20 px 800 title, 18 px text); checklists as native 24 px checkboxes in 44 px rows; long text in `<details>`; a stone office block closes the page |
| Kontakt 375 | Teď hned | dark opening = the emergency block (`data-emergency-block`, service area sentence inside); then Kancelář, Úřední hodiny (ruled table, `data-office-hours`), Telefony a e-mail; Lidé on a stone field at `#lide` |
| Lidé 1280, with photos | Teď hned (Kontakt) | Kontakt 1280 opening as a two-column dark panel (H1 left, number 50 px right); three columns Kancelář · Úřední hodiny · Telefony; `#lide` on stone: four people per row, 3:4 portrait, name 21 px 800, role, optional phone |
| Lidé 1280, without photos | Teď hned (Kontakt) | same page; `#lide` becomes a ruled three-column table (name · role · phone) beside a 4/12 heading column |
| Ceník 1280 | S předstihem | stone opening with "V této cestě", lead, **"Ceny jsou uvedeny včetně DPH."** in bold, UKÁZKA notice, validity, print hint, then the ruled nonstop line; each group = name left and "od … Kč" right (30 px 800) on a 2 px navy rule, one sentence, then "V ceně je zahrnuto" / "Není zahrnuto" in two columns; "Jednotlivé položky" as a ruled three-column table; the VAT note repeats under the table |
| Ceník A4 | S předstihem | black on white, no switch, no panels, no colour; same structure at 14–19 px; nonstop and Kancelář in two separate cells of the closing block; legal identification and VAT note at the bottom |
| Služby 1280 | S předstihem | stone opening; two sections "Podoba pohřbu" and "Co k pohřbu patří", heading column 4/12, ruled list 8/12; each row = service link 23 px 800, price or short fact right, one sentence; **Pohřeb bez obřadu is the first row** |
| Pro účastníky 375 | S předstihem | stone opening with the ruled nonstop line; sections under 1 px rules (Kdy a kde, Síň, Parkování, Oblečení, Květiny, Přenos, Kondolence); no prices, no service teasers |
| Oznámení a obřady 1280 / 375 | neutral | reduced nav (Oznámení a obřady · Kontakt · Úvodní stránka at 1280; Kontakt at 375), grey publisher line; "Nadcházející rozloučení" grouped by day (uppercase date on a 2 px rule, name as a 26/23 px link, ceremony sentence, dates) and "Nedávná oznámení" as a ruled name list (right column at 1280, below at 375); neutral footer |
| Footer 1280 | all non-notice pages | dark half: path label, number 34 px, availability, Jak postupovat · Kontakt; stone half: Kancelář (address, hours, phone) and the S předstihem links; legal row on `#F4F1EC` with identification, ADR, Právní informace · Dokumenty · Ochrana osobních údajů. The neutral variant (notices) is the legal row alone |
| Menu 375 open | all | opens in flow under the header, nothing overlaid; "Zavřít" button filled navy; dark group with the number + Teď hned links; stone group with S předstihem links (current page bold + "(tato stránka)"); plain group with Oznámení a obřady and Úvodní stránka; 20 px 700 links in ruled rows |
| 404 375 | both | switch with nothing selected; H1 + one sentence; a small dark half (number, Jak postupovat) and a small stone half (Ceník, Služby, Kontakt a úřední hodiny); a line to Oznámení a obřady |
| Nonstop: three forms 375 | — | the emergency CTA forms below, side by side |

Two screens drawn for earlier templates are not drawn here. Home without a photo needs no board, because the template has no hero photo at all. Jak postupovat at 1280 follows Kontakt 1280: the two-column dark opening (H1 left, number right), then the picker and the phases in an 8/12 column.

## Tokens

Colours (one palette; the design has no second palette by intent, see Proposals):

| Role | Hex |
| --- | --- |
| navy (ink, dark panel, switch, rules) | `#1C2940` |
| white (page ground, text on navy) | `#FFFFFF` |
| stone (S předstihem panels, office fields) | `#ECE7DF` |
| paper (footer legal row, publisher line) | `#F4F1EC` |
| mist (secondary text on navy) | `#C9D2E3` |
| navy rule (hairlines on navy) | `#4A5A78` |
| stone text (secondary text on stone) | `#4F4A42` |
| stone rule (hairlines on stone) | `#B9B1A5` |
| slate (secondary text on white and paper) | `#3E4757` |
| slate light (notes on white) | `#5B6478` |
| hairline (rules on white) | `#D6D0C6` |
| link hover | `#3A4B6B` |
| print ink / print rule | `#111111` / `#8A8A8A` |
| annotation only (UKÁZKA, ZÁSTUPNÉ JMÉNO) | `#FFF6D6` fill, `#8A6D00` dashed border, `#6B5400` text |

Contrast, computed (WCAG 2.2 relative luminance):

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| navy | white | 14.58 : 1 | 4.5 | pass | body, headings, links |
| navy | stone | 11.84 : 1 | 4.5 | pass | text and links in stone panels |
| navy | paper | 12.94 : 1 | 4.5 | pass | publisher line link, footer links |
| white | navy | 14.58 : 1 | 4.5 | pass | text, number, links in the dark panel |
| mist | navy | 9.59 : 1 | 4.5 | pass | path label, "Nonstop převoz zesnulých", availability |
| stone text | stone | 7.14 : 1 | 4.5 | pass | path label and notes on stone |
| slate | white | 9.36 : 1 | 4.5 | pass | secondary text |
| slate | paper | 8.31 : 1 | 4.5 | pass | footer legal text, publisher line |
| slate light | white | 5.93 : 1 | 4.5 | pass | office break note, annotations |
| link hover | white | 8.75 : 1 | 4.5 | pass | hover colour (underline stays) |
| print ink | white | 18.88 : 1 | 4.5 | pass | A4 sheet |
| annotation text | annotation fill | 6.71 : 1 | 4.5 | pass | UKÁZKA tag (design annotation) |
| navy | white | 14.58 : 1 | 3.0 | pass | switch border, focus ring on white and stone (3 px navy) |
| white | navy | 14.58 : 1 | 3.0 | pass | focus ring inside the dark panel (3 px white) |
| print rule | white | 3.45 : 1 | 3.0 | pass | A4 table rules |
| navy rule | navy | 2.10 : 1 | 3.0 | decorative | hairlines on navy; never the only edge of a control |
| stone rule | stone | 1.72 : 1 | 3.0 | decorative | hairlines on stone; never the only edge of a control |
| hairline | white | 1.53 : 1 | 3.0 | decorative | hairlines on white; never the only edge of a control |
| stone | white | 1.23 : 1 | 3.0 | decorative | the stone panel's edge; the path is also named by the label text and the switch |

Type: **Manrope** (SIL OFL 1.1, latin-ext, `@fontsource/manrope`), one family. The boards use 400, 500, 700 and 800; **build with 400, 700 and 800 only** (the rule is ≤ 3 weights): every 500 in the boards becomes 400. Alternative pairing for a later palette: none proposed; the one-family sans is part of the idea.

| Token | 1280 | 375 |
| --- | --- | --- |
| H1 (home question) | 40 / 1.15, 800 | 28 / 1.2, 800 |
| H1 (other pages) | 40 / 1.15, 800 | 30 / 1.2, 800 |
| Panel heading (home halves) | 36 / 1.2, 800 | 24 / 1.25, 800 |
| Section heading | 24–32, 800 | 22–24, 800 |
| Step title | 20, 800 | 20, 800 |
| List link (home halves, Služby) | 21–23, 700–800 | 19–20, 700 |
| Body | 18 / 1.6 | 18 / 1.6 |
| Lead | 19 / 1.55 | 18 / 1.55 |
| Nonstop number in a dark panel | 50, 800, underlined 3 px, offset 8 | 34, 800, underlined 3 px, offset 6 |
| Nonstop number in the footer | 32–34, 800 | 30, 800 (menu) |
| Nonstop line on stone | 26, 800, underlined 2 px | 22, 800, underlined 2 px |
| Path label | 17, 700, uppercase, tracking 0.06em | 15, 700, uppercase, tracking 0.06em |
| Small (footer legal, availability) | 16–18 | 15–17 |

**Build rule:** the boards show some running text at 15–17 px (footer legal text, availability lines, path labels at 375, dates). Build every text at **≥ 18 px**; the uppercase path label may wrap to two lines at 320 px. Only the A4 sheet (14–19 px, ≥ 12 pt body) and the UKÁZKA annotation are smaller.

Spacing (px): 4 · 8 · 12 · 16 · 22 · 28 · 32 · 44 · 56 · 64 · 72. Side gutter 16 (375) and 56 (1280). Panels: 22–26 px vertical padding at 375, 40–56 at 1280.

Layout: 1280 header is a three-column grid (`minmax(0,1fr) auto minmax(0,1fr)`), the switch centred; content uses a 12-column feel without a drawn grid (halves 6/6, Ceník opening 7/5, Služby and Lidé 4/8, Oznámení 7/5). Radius 0 everywhere **except** the switch and the Menu button (999 px). No shadows.

Separation device: **colour fields by path** (navy panel, stone panel) plus 1–2 px rules: 2 px navy above each group, phase and day, 1 px hairlines between rows.

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| **Default, dark** | home (left half / first block at 375), every Teď hned page opening, footer left half, Menu | inside the navy panel: label "Nonstop převoz zesnulých" (mist), the `tel:` number (white, 50 / 34 px 800, underlined 3 px), availability "Ve dne, v noci i o svátcích." (mist). On the Teď hned pages it sits under a navy-rule line right after the H1, so it is above 667 px at 375 (drawn at about 365 px). |
| **Default, stone** | every S předstihem page opening | the last element of the stone panel, under a 2 px navy rule: "Někdo právě zemřel?" then the link "Nonstop +420 …" (26 / 22 px 800, underlined 2 px). Drawn at about 389–445 px from the top, inside the first screen. |
| **High emphasis** (`emergencyEmphasis: "high"`) | additionally, on every page that opens with the stone panel (the S předstihem pages) | a full-width navy band directly under the switch, before the panel: one `tel:` link "Někdo právě zemřel? Nonstop +420 …" (label mist 18 px, number white 22 px 800 underlined). Home and Teď hned pages already open with the number, so they do not change. |
| **Neutral** ⚖ | notice list and every notice | no switch, no navy field, no path label: under the reduced header a paper-coloured line "Oznámení zveřejňuje <brand>. **Telefon nonstop +420 …**" (slate text, navy 700 link). Neutral footer (legal row only). Needs the lawyer (§4a L1). |

Label and number always form **one** `tel:` link or sit in plain inline flow; never a flex container around a label-plus-number link (QA test 9). The number never wraps (`white-space: nowrap`).

## Guardrails: do not drift

- **Keep the split.** Home opens with the H1 question and two equal halves, navy left and stone right at ≥ 64 rem, stacked navy-first on phones. Nothing goes above them except the header, the switch and the H1. No hero image, no photo anywhere in the first screen.
- **Keep the switch.** One segmented control with exactly two links, "Teď hned" and "S předstihem"; the current option filled navy with `aria-current="page"`. Centred in the header at 1280, full width under the header at 375. It is a pair of links to pages, not a JS tab widget.
- **Every page declares its path.** Its opening panel is navy (Teď hned) or stone (S předstihem), with the path label, H1 and the matching nonstop form. The office, its hours and prices never appear in a navy field; the navy field never holds anything but the nonstop number, first steps and Teď hned links.
- **Two paths, two colours, one font.** Navy, stone, white and paper only; no accent colour, no third path, no per-path font. Manrope 400 / 700 / 800.
- **Plain separation.** Colour fields and rules only. No cards, boxes around list items, shadows, gradients, icons, illustrations or decorative numbers. The 1-2-3 on home and the step numbers in Jak postupovat are real ordered lists, not decoration.
- **Rounded only twice.** The switch and the Menu button are the only rounded shapes (999 px). Every other control is a text link or a ruled row; no pill buttons anywhere else.
- **Notices are neutral.** No switch, no navy panel, no path label, no "V této cestě", no services, prices or "Objednat" on the notice list or a notice; reduced header, grey publisher line, neutral footer.
- **Pohřeb bez obřadu is first-class.** It is the second link in the stone half and the first row on Služby; keep that order.
- **`<details>` keeps a visible marker.** The boards set `display: flex` on `<summary>`, which hides the disclosure triangle; build it with a visible marker (the native one or a text "+" / "−"), never as a bare bold line.
- **No fixed bottom bar, no sticky header** (those belong to B and C).

## Proposals and decisions for the owner

1. **Pro účastníky belongs to S předstihem** (stone opening, switch on "S předstihem"), but carries no prices or service teasers because guests arrive from notices. Alternative: make it neutral like the notices.
2. **Home switch:** the approved board shows "Teď hned" filled on home. Build it filled as drawn but without `aria-current` (home is both paths); or show it unselected like on the 404.
3. **High emphasis** changes only pages with a stone opening (a navy band under the switch), because home and Teď hned pages already open with the number.
4. **Menu grouped by path** [review]: core fixes the nav order. The template keeps core's order inside each group but groups the items by path (Teď hned, S předstihem, then Oznámení a obřady and Úvodní stránka). If grouping counts as reordering, it needs a core change or the menu becomes one list with path labels beside items.
5. **Lidé stay on `/kontakt/#lide`** (approved for C and E), so they sit inside a Teď hned page, on a stone field.
6. **Právní informace and Ochrana osobních údajů** use the stone (S předstihem) opening.
7. **One palette only.** Earlier templates offer two palettes; here the two colours *are* the structure. A second palette (for example a darker green-grey instead of navy) can be added later if a client's logo clashes with navy.
8. **Weights:** the boards use 500 for some secondary lines; the build drops it to keep 3 weights.

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in the first screen at 375×667 on every drawn page | pass: home 431 px, Jak postupovat 365 px, Kontakt 329 px, Pro účastníky 389 px, 404 421 px, notice and list 131 px (bottom of the link) |
| Office hours never share a container with the nonstop | pass (separate blocks on every board; the A4 sheet uses two cells) |
| Body ≥ 18 px | pass on body text; secondary lines drawn at 15–17 px are to be built at 18 (Build rule) |
| Contrast ≥ 4.5 text / ≥ 3 UI and focus | pass (table above); hairlines and the stone edge are decorative only |
| Tap targets ≥ 44 px | pass (picker rows 50 px, checkbox rows 44 px, links with 8–10 px vertical padding on 18 px text) |
| ≤ 2 families, ≤ 3 weights | pass after the 500 → 400 change |
| Ban list | risk: pill-shaped switch and Menu button (the only rounded shapes, intentional segmented control); everything else pass |
| L1 notices without promotion | neutral form drawn; ⚖ legal review |
| L8 legal identification in every footer | drawn |
| L9 VAT note where prices show | drawn (home stone half, Ceník top and bottom, A4) |
| L10 Právní informace + ADR | drawn in every footer |
| L12 consent | people and notices use placeholder names (marked); photos only commissioned and with consent |
| L14 livestream as a plain link | drawn on the notice |
| Placeholder content only | pass: "Pohřební služba Vzor", `+420 000 000 1xx`, `kancelar@vzor.example`, prices marked UKÁZKA, names marked ZÁSTUPNÉ; no client data, no generated imagery |
