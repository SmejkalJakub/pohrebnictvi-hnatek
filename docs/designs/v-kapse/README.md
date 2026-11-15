# H · V kapse (`v-kapse`)

**Status (2026-11-15):** the "V kapse" direction from the owner's canvas (round F–I, chosen together with "Zpravodaj"). Only the home page is drawn (1280 and 375); every other page is built from the home's system by the rules below. **Built 2026-11-15** as `templates/v-kapse` (`docs/notes/s14-v-kapse.md`), prototype client `clients/hnatek-h`.

## Concept

The site works like an app in your pocket. **The home page asks one question**, "S čím vám můžeme pomoct?", and offers six large rounded rows: Někdo právě zemřel · Chci sjednat pohřeb · Jak se můžeme rozloučit · Kolik to bude stát · Květiny a rakve · Kde vás najdeme. Each row has a one-line hint. The visitor taps a row and the short answer opens: beside the rows in a white rounded panel on desktop (master–detail), under the row on the phone (accordion). The first row is open on arrival, so the nonstop number and the first three steps are on the first screen.

What makes it H, not A–G: the page flow is a choice, not a read. Nothing is a long scroll of sections; every answer is one tap away and only one is open at a time.

## Files

| Path | What |
| --- | --- |
| `html/home-1280.dc.html` | home at 1280, the canvas source (inline styles, every value resolved; canvas name `Vkapse.dc.html`) |
| `html/home-375.dc.html` | home at 375 (canvas name `Vkapse-telefon.dc.html`) |

Open them in the canvas or read the inline styles for exact values. The canvas loads Playfair Display and Source Serif 4 (the Hnátek brand fonts) from Google Fonts; the build uses the brand profile's self-hosted fonts, and the template's own default is Figtree.

## The system (take these exactly)

- **Ground** cream (`--brand-ground`, #F4F1EA on the board); **ink** #14261E; muted text #3A4A42 / #4F5F57.
- **Rows**: min height 72 px desktop / 64 px phone, radius 16 px, padding 14 × 22 / 12 × 18 px; closed white with a 1 px #DDD6C6 hairline, ink text; open filled with the primary (#0B3D2C) and cream text (#F2EEE4). Title 20 / 18 px 600, hint 15 / 14 px at 85 %. Chevron "›" on desktop, "⌄ / ⌃" on the phone. Gap 10 / 8 px.
- **Answer panel**: white, radius 24 px desktop / 16 px phone, 1 px #E3DDCF hairline, padding 36 × 40 / 18 px. Small letter-spaced label ("TEĎ HNED", gold text role), heading in the display face 32–34 px, text 18 px.
- **Guided list**: three numbered sentences beside 32 px soft circles (#E6ECE6) with the numeral in the primary.
- **Nonstop number box**: the primary filled, radius 16 / 14 px, the label small (#C9D3CC), the number in the display face 36 / 26 px.
- **Desktop grid**: page max 1160 px; left column max 460 px (label, H1 44 px, intro, the six rows, the family line); the panel takes the rest.
- **Phone header**: the mark and the green pill "Nonstop +420 …" (44 px tall, radius 22 px). No menu button.
- **Photos inside the answers**: the office (16:9, radius 12–14 px) at "Chci sjednat pohřeb"; a flower arrangement (square, cropped) and a coffin (square, shown whole on #FBFAF6) at "Květiny a rakve".

## Pages not drawn

Build each from the home's parts, never from another template:

- **Jak postupovat**: the place picker as rounded chips with the reassurance lead in a panel; then one row per guidance step (numeral, title, phase), opening to its guided list (design-differentiation §1.3), the longer text behind "Podrobnosti", the contact prompt and "Potom: …" (`data-guide-next`); picking a place folds the steps that do not apply (core `:has(:target)` filter).
- **Služby, Časté otázky**: rows that open in place (one open at a time).
- **Ceník, Kontakt, Rakve, Květiny, O nás, Dokumenty, Lidé, Pro účastníky, Pohřeb předem, Právní informace**: the page title, then white rounded panels stacked in one column; photos sit inside panels.
- **Every page** ends with "Všechny stránky": every page as a large row. On the phone this is the whole navigation.
- **Notices** (`/oznameni/…`): no rows, no promotional parts (template-contract §6): the title, the notice facts in plain panels, the neutral nonstop line.

## Guardrails: do not drift

- One question, one open answer. Do not add sections, bands or a service grid under the rows on the home.
- The answer opens in place: never a modal, a drawer or a new page.
- Native `<details name="…">` only: works without JavaScript, every answer reachable, the first open on arrival.
- No shadows, no icons, no full-bleed photos; the primary fills only the open row, the pill and the number box.
- Motion (design-differentiation §1.1): the signature is **the answer opens in place** (the row fills, the chevron turns and the answer settles, 200 ms, off under reduced motion, never on page load). Nothing else moves.
