# S13 · Template F `zpravodaj` (Zpravodaj)

**Date:** 2026-11-15.

- **Owner's decision:** after approving A–E and G ("I love all those templates"), the owner asked for two more that differ from all of them and chose "Zpravodaj + V kapse" from the round 3 canvas. This note covers F; H "V kapse" was built in parallel.
- **Design input:** [docs/designs/zpravodaj/](../designs/zpravodaj/README.md), which holds the home at 1280 and 375. Every other page is built from the home's system.
- **Trial client:** `clients/hnatek-f` (the content of `clients/hnatek`, copied from `clients/hnatek-e`, with the Hnátek brand block).
- **QA port:** 4414. The brief proposed 4418, which template G already uses; 4414 was free. H uses 4419.

## 1. Concept

A calm local newsletter from the firm. The home is **a front page set in columns**:

- the masthead: a dateline row (place, live date, office status, nonstop line), the mark and the brand name, the tradition wording, the section names between a double rule and a hairline;
- the lead article (`hero`): H1, the home lead as the italic standfirst, the home body in two columns with a drop cap;
- the office column (`contact-summary`), beside the lead article and the first-steps story behind a column rule in ink: the green nonstop box, "Kancelář dnes" with the live status, the hours, address and phone, then "V tomto přehledu" (the page's own index);
- the first-steps story (`next-steps`): "Když zemře blízký člověk: co udělat v prvních hodinách", the reassurance standfirst, the first-hours steps as paragraphs with their guided lists in two columns, the office as a press photo beside the first "V následujících dnech" step, briefs of the later phases, the closing line;
- "Jak se můžete rozloučit" (`services`): up to three ceremonies as notes between column rules;
- the flower and coffin pictures (`catalogue-links`) with the Květiny and Rakve page leads;
- prices (`price-summary`) and the family note (`family-story`) in the side column;
- the colophon: Kancelář · hours · Na webu, "Vydává …" with the legal identification, the nonstop line.

Every section is a direct child of `<main>` (QA reads the order there). From 64 rem `<main>` is a three-column grid with dense flow: wide sections take two columns, side sections the third, and `contact-summary` spans two rows. Phones show one column in the client's order, the sections on hairlines, with a full-width green nonstop strip under the masthead.

Inner pages use the compact masthead, a headline block (H1 and an italic standfirst) and sections under a rule in ink on a 44 rem measure, with an optional side column. Jak postupovat sets each phase as a headline under a double rule with its steps side by side; Služby opens with ruled contents columns; Rakve and Květiny are a full-width picture page between column rules.

## 2. Signature interaction (design-differentiation §1.1)

**The live dateline.** The masthead shows today's date for Europe/Prague. A small inline script in `GazetteLayout` writes it: long from 64 rem ("neděle 15. listopadu 2026"), short on phones ("15. 11. 2026"). The script checks every minute, so the date turns over at midnight. Beside the date, core's office status (short form) changes with the hours; when the office opens or closes, its dot fills or empties in 200 ms. Nothing plays on load, and everything is off under `prefers-reduced-motion`. Without JavaScript the dateline shows the place only and the status stays hidden (core), so no page ever shows a stale date.

Other feedback motion is the shared baseline: link underlines thicken on hover; the section names get a rule under them; the guide's "Potom" target gets a primary rule along its top (≤ 200 ms); the place filter slides the steps that stay (view transition, ≤ 220 ms).

## 3. Brand mapping (template-contract §8a)

| Template token | Brand role | Used for |
| --- | --- | --- |
| `--ground` | `--brand-ground` | the paper |
| `--ink`, `--rule-strong` | `--brand-ink` | type, every column and row rule, the double rules |
| `--muted` | `--brand-muted` | datelines, captions, notes |
| `--primary` | `--brand-primary-text` | the masthead name, headlines, links |
| `--primary-fill`, `--on-primary`, `--muted-on-primary` | `--brand-primary`, `--brand-on-primary`, `--brand-muted-on-primary` | the nonstop box, the phone strip |
| `--kicker` | `--brand-secondary-text` | kickers and the colophon headings (text role only) |
| `--rule`, `--rule-soft` | `--brand-rule` mixed into the ground (60 %, 32 %) | fine rules inside a column |
| `--paper` | white mixed into the ground | photo grounds |
| `--display` | `--brand-font-display` | masthead, headlines, drop caps, numbers |
| `--serif` | `--brand-font-body` | text |

For Hnátek that gives the forest-green masthead and box, gold-brown kickers, Playfair Display and Source Serif 4: the comp as drawn. The brand mark stands in the masthead and the colophon; the logo is used only when there is no mark.

## 4. Palettes without a brand (contrast, WCAG 2.x)

| Pair | `papir` | `grafit` |
| --- | --- | --- |
| ink on ground | 15.3 : 1 | 16.0 : 1 |
| muted on ground | 8.2 : 1 | 8.5 : 1 |
| primary on ground | 9.7 : 1 | 10.8 : 1 |
| kicker on ground | 6.6 : 1 | 6.6 : 1 |
| on-primary on primary | 9.7 : 1 | 10.8 : 1 |
| muted-on-primary on primary | 7.8 : 1 | 8.5 : 1 |

The fine rules (about 1.5 : 1) are decoration; every rule that structures the page is ink. Fonts: Spectral 600/700 (`spectral-source`, default) or Playfair Display 600/700 (`playfair-source`), with Source Serif 4 400, 400 italic and 600; latin and latin-ext only.

## 5. Decisions taken in the build (for the owner)

1. **The H1 is the home title, not the comp's headline.** The comp put "Když zemře blízký člověk: co udělat v prvních hodinách" as the H1. The build keeps the client's own home title as the H1 (the lead article) and makes the first-steps story's headline that template sentence, as an H2 right under it. The lead article's body is the home page body (Hnátek: "Co pro vás zajistíme"), which the manifest now allows for the home.
2. **The comp's row 3 is rearranged.** The comp has flowers | coffins | price + O nás. The grid places services | price and catalogue | family note, so the column rule runs down the whole page and no side column is left empty; the order still differs from every template in at least three positions.
3. **No invented copy.** The comp's captions and texts ("Z naší vazárny", "Kancelář a vazárna květin sídlí ve stejné budově…") were not copied. Headings come from content (nav labels, O nás title, tradition wording) or neutral template copy; captions are the office address.
4. **The nonstop box is desktop only.** On phones the strip under the masthead carries the number, so the box would repeat it on the same screen.
5. **Step numbers are a CSS counter** ("Krok 3"), so they stay in order when the place filter hides steps. The word "Krok" is in the template strings; only the digit comes from CSS.
6. **Kontakt shows the office photo** (`secondaryImage`, image slot `contact.office`) beside the address, and the colophon leaves out its own office and hours columns there, as on the home.
7. **Catalogue photos at their own proportions,** four per row between column rules; product photos on white are multiplied onto the paper (§1.4: never cropped).
8. **QA port 4414,** not 4418 (taken by G).

## 6. Verification

The counts are in the session report. The checks run were:

- `npm run check`;
- `npm run client:validate -- hnatek-f` (PROTOTYPE: PASS);
- the full `npm run qa`;
- Playwright full-page screenshots at 1280 and 390 of `/`, `/jak-postupovat/`, `/kontakt/` and `/kvetiny/` (plus `/sluzby/`, `/cenik/`, `/o-nas/` at 1280) on the `hnatek-f` prototype (port 4807), compared with the comps.
