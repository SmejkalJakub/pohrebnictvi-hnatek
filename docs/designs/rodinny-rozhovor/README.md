# I · Rodinný rozhovor (`rodinny-rozhovor`)

**Status (2026-11-10):** round-2 direction, liked by the owner; **moodboard stage**. Only the screens listed under *Drawn* exist. Everything under *Not drawn yet* is specified as rules, not pictures.

**Concept.** For a small family firm that wants the site to sound like the first phone call with them: warm, direct, human. The page is a conversation: every section is a question the family is asking (“Kdo nám pomůže hned?”, “Co nás teď čeká?”, “Kolik to bude stát?”) with a short plain answer, and the answer to the first question is the phone number. Warm colour fields and hand-drawn line illustrations replace photographs, so it is gentle without being sombre.

## Files

| Path | What |
| --- | --- |
| `comps/hlina/*.png`, `comps/med/*.png` | rendered comps per palette: `home-1280`, `home-375`, `notice-375`, `board` |
| `html/board-hlina.html`, `html/board-med.html` | plain HTML with every value resolved. **Read exact sizes and colours here.** |
| `source/R2-I-Rodinny-rozhovor.dc.html` | canvas source |
| `tokens.json`, `TOKENS.md` | palettes with computed contrast, fonts, scales, layout |

## Drawn

| Screen | File | Notes |
| --- | --- | --- |
| Home 1280 | `comps/hlina/home-1280.png` | four question sections; illustration and people-photo placeholders |
| Home 375 | `comps/hlina/home-375.png` | nav always visible, wrapping |
| Notice 375 | `comps/hlina/notice-375.png` | no photo, with livestream link, reduced nav, neutral form |

## Structure (build these exactly)

- **Sections are questions.** Each section: H2 phrased as the family’s question (columns 1–4 at 1280), a 2–3 sentence answer (columns 6–10/11), at most one link. Fields alternate full-bleed: **deep** (first section only) → **band** (sand) → **ground** (cream) → band …
- **First section:** deep field. H1 “Kdo nám pomůže hned?” (64 px / 36 px), answer line 30 px, then the nonstop link. Illustration placeholder in columns 9–12 (hidden when no drawing; the text column stays).
- **Navigation:** always visible words (Alegreya Sans 500, 18–19 px, underlined), wrapping into two rows at 375; each link `min-height: 44px`. **No menu button and no JavaScript at all.**
- **Illustrations:** commissioned pen drawings only (local tree, the square, the office door, a key), light line on the deep field and dark line elsewhere. Placeholders until drawn; layout is complete without them.
- **One real photo:** the people under “Kdo jsme”, with consent; or a drawing of the office entrance.
- **Separation:** colour fields only. No rules, no boxes, no radius.
- **Closing sentence on every page** (on cream): “Kdykoli potřebujete, volejte +420 000 000 199.” as a `tel:` link.

## Emergency CTA

| Form | Where | Spec |
| --- | --- | --- |
| Default | home: inside the deep field as the answer to the first question; every page: the closing sentence | label Alegreya Sans 500 on `on_deep_muted`, number Alegreya 700, 54 px (1280) / 36 px (375), `on_deep`, underlined |
| High emphasis | the deep field (question + number) at the top of every page, not only home | same component |
| Neutral (notice pages) | under the header on a sand strip | “Oznámení zveřejňuje Pohřební služba Vzor. Telefon nonstop +420 …”; no deep field, no drawings; **nav reduced to “Oznámení a obřady · Kontakt”**. ⚖ L1: confirm a reduced nav is enough |

## Not drawn yet: rules for the remaining screens

| Screen | Rule |
| --- | --- |
| Jak postupovat | three questions as sections: “Co teď?” (first hours), “Co v dalších dnech?”, “Co po pohřbu?”; situation picker as the first answer (“Kde zemřel? doma · v nemocnici …”, `:target`); checklists as native checkboxes in the answer column |
| Ceník + A4 | per group a question (“Kolik stojí pohřeb bez obřadu?”), the price in the answer sentence, then “V ceně je zahrnuto / Není zahrnuto” lists; VAT note in every answer. Print: cream removed, fields become 1 px rules, same order |
| Kontakt | questions “Kde vás najdeme?”, “Kdy můžeme přijít do kanceláře?” (hours), and separately “Co když je to v noci?” (nonstop) |
| Oznámení list | names (Alegreya 700, 28 px) each followed by the ceremony sentence; upcoming first; no fields, no drawings |
| Pro účastníky | questions: “Kde je smuteční síň?”, “Kde zaparkuji?”, “Co si vzít na sebe?”, “Můžu poslat květiny?”, “Jak sledovat přenos?” |
| Lidé | “Kdo vás přijme”: name, role, direct phone; photos optional; complete as text |
| Footer, 404 | footer on a sand field; 404 is a question “Tuhle stránku jsme nenašli. Co hledáte?” with the nav links as the answer |

## Proposals

- `illustrations[]`: `{ slot, image, alt }`, commissioned drawings per client, with a slot name (`hero`, `guidance`, `contact`, `office`).

## Self-check

| Rule | Result |
| --- | --- |
| Nonstop in first screen at 375×667 | pass (~400 px) |
| Office hours separate from nonstop | pass (own question on Kontakt) |
| Body ≥ 18 px, contrast | pass (TOKENS.md) |
| 44 px targets | pass (nav links have `min-height: 44px`) |
| JS only for the menu | pass: no JS at all |
| Ban list | pass; drawings must never be doves, candles, hands, wilting flowers |
| Copy | questions are plain and direct; no euphemisms in UI text |
| L1 | notice pages have no fields, drawings or service links; reduced nav ⚖ legal review |
| L8 footer identification | drawn on the notice page; required on every page |
| L9 prices with VAT | drawn on home (“Ceny jsou uvedeny včetně DPH.”) |
| L10 Právní informace link | drawn in the notice footer |
| L12 consent | placeholder names marked; the people photo needs staff consent |
