# E · Krok za krokem (`krok-za-krokem`)

**Status (2026-11-14):** direction E1 from the owner's canvas "Šablona E – nové směry" (https://claude.ai/artifact/VJYiee9aetpkbigX355zYF, private, owner's account) was chosen to replace E `ticha-krajina`. The owner's one change, "the line must run behind the points", is in the boards here (`z-index`, line centred on the rings). Only the home page is drawn (1280 and 375); every other page is built from the home's system by the rules below. **Built 2026-11-14** as `templates/krok-za-krokem` (`docs/notes/s12-krok-za-krokem.md`).

**Brief (owner, 2026-11-14):** informative, but designed: not plain, sterile or uninviting. The experience should be calming and simple for every visitor.

## Concept

The visitor never has to look for what comes next. **The home page is the guide itself**: one calm vertical thread from "V prvních hodinách" to "Po pohřbu", with a gold ring at every stop (the circle from the client's brand board) and the content of each stop beside it: what happens, what to do (a short numbered list), what to bring, and what the firm does. Photographs stand at the stop they belong to: the office at "Sjednání pohřbu v kanceláři", the firm's own flower arrangements at "Příprava pohřbu". The thread ends with a closing sentence ("Tím máte to nejdůležitější za sebou."). Prices and the family story follow on a soft sage band; a deep-green footer carries the nonstop line again.

What makes it E, not A, B, C, D or G: the page flow is one chronological journey (no sections of services, no directory, no rail, no question fields, no photo essay); photos are placed by time, not by topic.

## Files

| Path | What |
| --- | --- |
| `html/home-1280.dc.html` | home at 1280, the canvas source (inline styles, every value resolved) |
| `html/home-375.dc.html` | home at 375 |

Open them in the canvas or read the inline styles for exact values. Fonts load from Google Fonts on the canvas only; the build uses the brand profile's self-hosted fonts.

## The system (take these exactly)

- **Ground** cream (`--brand-ground`, #F9F6EF for Hnátek); **ink** (`--brand-ink`); **thread** a pale tint of the primary (#BFCDC4 on Hnátek: `color-mix` of primary into ground, ~25 %); **rings** 24 px, 2 px `--brand-secondary` (gold) border on ground; the first stop's ring is filled with the primary ("you are here"). Gold is ornament only; gold text uses `--brand-secondary-text`.
- **Type**: display font for H1 (58 / 36 px), H2 (40 / 28), stop headings (30 / 24); body 19 / 18 px, line height 1.6. Phase labels in small letter-spaced caps (14 / 12 px, `--brand-secondary-text`).
- **Desktop stop grid**: label column 230 px · ring column 60 px · content (max 820 px). The thread is centred on the ring column and sits **behind** the rings (rings `position: relative; z-index: 1`). Phone: ring column 24 px at the left edge, label above the heading.
- **Hero**: H1 and lead left; a white "Spojení" card right (nonstop number large, office status, address and office phone). On the phone a full-width green nonstop strip sits above the header and the card shrinks to the office status.
- **Separators**: one hairline before the guide intro; the sage band (`--brand-surface-2` or a primary tint) for "Kolik to bude stát" + "Rodinná firma"; the deep-green footer (`--brand-deep`). No cards except the hero card, no shadows, no icons.

## Pages not drawn

Build each from the home's parts, never from another template:

- **Jak postupovat**: the full thread (all published guidance in phase order), each stop with its `checklist` as a guided list (design-differentiation §1.3), the situation picker above the thread as plain links in a sentence ("Kde blízký člověk zemřel? doma · v nemocnici · v domově pro seniory"); picking a situation folds the stops that do not apply (core `:has(:target)` filter, `data-guide-next` on "Potom" links).
- **Služby, Rakve, Květiny, Ceník, O nás, Kontakt, FAQ, Dokumenty, Oznámení, Lidé**: the hero pattern (H1 + lead left, the Spojení card right on desktop), then the content in the stop grid's content column with the label column used for section labels, so every page lines up on the same axis as the thread. Catalogues: photos shown whole on the ground, two or three per row.
- **Notices** (`/oznameni/…`): no thread, no sage band, no promotional parts (template-contract §6): ground, H1, the notice facts in the content column, the neutral nonstop line.

## Guardrails: do not drift

- One thread, one axis. Do not add a second column of cards, a sidebar or a service grid to the home.
- Photos only at the stops (and catalogue pages); never a hero photo, never full-bleed (the office photo is 722 px: never wider than that).
- No grey placeholders on the home: a stop without a real photo shows text only.
- Motion (design-differentiation §1.1): the signature is **the thread follows your reading**: the ring of the stop being read fills with the primary (scroll-spy via core `data-spy-nav` on the thread, `aria-current="location"`), 200 ms, off under reduced motion. Nothing else moves.
