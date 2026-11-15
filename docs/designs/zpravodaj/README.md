# F · Zpravodaj (`zpravodaj`)

**Status (2026-11-15):** direction F "Zpravodaj" from the owner's round 3 canvas (directions F–I) was chosen together with H "V kapse". Only the home page is drawn (1280 and 375); every other page is built from the home's system by the rules below. **Built 2026-11-15** as `templates/zpravodaj` (`docs/notes/s13-zpravodaj.md`).

**Brief (owner, 2026-11-15):** two more templates that are clearly different from A–E and G. Informative but designed, calm and simple for every visitor.

## Concept

A calm local newsletter from the firm. A masthead with the brand name, a dateline ("Vyškov · sobota 15. listopadu 2026") and the nonstop line, a double rule, the section names in letter-spaced capitals, then **columns separated by hairlines**:

- the lead article with an italic standfirst, a drop cap and two text columns;
- a side column with the green nonstop box, "Kancelář dnes" (the live status) and "V tomto přehledu";
- the first steps as the main story, with the office photo as a press photo beside "Sjednání pohřbu";
- "Jak se můžete rozloučit" as short notes between column rules;
- the flowers and coffins as picture columns;
- prices and the family note in the side column;
- a colophon ("Vydává …") under a double rule.

What makes it F, not A–E or G: the page reads as **a front page set in columns**. Rules in ink divide the columns and rows, the type does the hierarchy (masthead, kickers, headlines, standfirsts, drop caps), and there are no cards except the one nonstop box. It is never a price list or a menu: every block is a short article.

## Files

| Path | What |
| --- | --- |
| `html/home-1280.dc.html` | home at 1280, the canvas source (inline styles, every value resolved) |
| `html/home-375.dc.html` | home at 375 |

Open them in the canvas or read the inline styles for exact values. Fonts load from Google Fonts on the canvas only; the build self-hosts its own fonts and the brand profile's.

## The system (take these exactly)

- **Ground** warm paper (`--brand-ground`; #F7F4EC on the board); **ink** #1A1F1C for the type and every column and row rule (1 px); fine rules #CFC8B8 and #E2DCCD inside a column; the **primary** (#0B3D2C) for the masthead, the headlines and the one filled box (nonstop); the gold only as kicker text (#7D6220, `--brand-secondary-text`).
- **Type:** the display face (Playfair Display on the board) for the masthead (66 / 36 px, 700), H1 (46 / 30), section headlines (30–22); body Source Serif 4 at 18 / 17 px, line height 1.6; the standfirst italic 21 / 18 px; kickers and list labels in letter-spaced capitals (13 / 12 px, 0.16 em); the drop cap three lines deep in the display face.
- **Masthead:** the dateline row on a hairline (place · date on the left, "Nonstop převoz zesnulých +420 …" on the right), the centred mark and name, the tradition wording in italic, then the section names between a 3 px double rule and a 1 px rule.
- **Columns (1280):** a 2 : 1 split for the lead article and the side column, then three equal columns for the catalogue and price row; 36 / 32 px gutters with the rule in the gutter.
- **Phone (375):** the dateline and "Menu" on one hairline, the centred masthead (mark, name at 36 px, tradition), the double rule, then a **full-width green nonstop strip** (label in small capitals, the number at 28 px), then one column on hairlines: first steps, "Kancelář dnes", the office photo with "Sjednání pohřbu", "Jak se můžete rozloučit", flowers | coffins side by side, "Kolik to bude stát", the colophon.
- **Separators:** rules only (double under the masthead and over the colophon, 1 px in ink between columns and rows). No shadows, no radius, no tinted bands, no icons.

## Pages not drawn

Build each from the home's parts, never from another template:

- **Every inner page:** the compact masthead (the dateline row, the mark and name on one line, the section names), then a headline block (H1 in the display face, the page lead as the italic standfirst), then sections under a 1 px rule in ink, the text on a 44 rem measure with an optional side column behind a hairline.
- **Jak postupovat:** the place picker as a sentence of words and the reassurance standfirst; each phase as a headline under a double rule, its steps as short articles side by side in two columns ("Krok n" as the kicker, the guided list "Postupně", "Potom: …"); the closing line and the office phone.
- **Služby:** one page with anchors: "V tomto přehledu" as ruled contents columns, then one article per service (the summary as the standfirst, the inclusions in the side column).
- **Rakve, Květiny:** a picture page over the whole width, four per row between column rules, every photo whole at its own proportions (product photos on white multiplied onto the paper).
- **Kontakt:** Kancelář with the office photo as a press photo beside the address, Úřední hodiny (their own section), Telefony, Převoz zesnulých.
- **Notices** (`/oznameni/…`): no strip, no box, no promotional parts (template-contract §6): the neutral publisher sentence, the notice facts, a reduced colophon.

## Guardrails: do not drift

- Rules, not boxes: the only filled box is the nonstop box (and the phone strip).
- Columns must read as columns: keep the ink column rule between the main and side column, and the row rules between rows.
- Photos as press photos with a caption under a hairline; never full-bleed, never wider than the file (the office photo is 722 px).
- Never a menu of prices or items on the home: each block is a short article with a link.
- Motion (design-differentiation §1.1): the signature is **the live dateline**: today's date and the office status in the masthead, kept current; when the office opens or closes the status dot fills or empties in 200 ms (off under reduced motion). Nothing plays on load.
