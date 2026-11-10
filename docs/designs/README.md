# New template designs (round 2)

Design handoff for the templates that follow A `rodinna-tradice` and B `dustojna-jednoduchost`. Input for Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md).

**Status (2026-11-10).** Four directions, liked by the owner after round 1 was rejected as too similar to A, B and each other. They are at **moodboard stage**: each has home at 1280 and 375 and one notice page at 375, a token sheet and written rules. The full comp set from Prompt 1 (Jak postupovat, Ceník + A4, Kontakt, Oznámení list, Pro účastníky, Lidé, footer, menu, 404) is **not drawn**; each template README gives rules for those screens instead. Which directions get built, and in what order, is still the owner’s call.

Source canvas (private, owner’s account): https://claude.ai/artifact/SAzhHqwcHdpLpd33ujxaWH

| Board | Folder | One idea |
| --- | --- | --- |
| F | [nocni-linka/](nocni-linka/README.md) · Noční linka | dark; sticky side rail with the number; one statement per screen |
| G | [ticha-krajina/](ticha-krajina/README.md) · Tichá krajina | airy long scroll; full-bleed local landscapes between sections |
| H | [plny-prehled/](plny-prehled/README.md) · Plný přehled | dense one-screen directory; tables; highlighted nonstop box |
| I | [rodinny-rozhovor/](rodinny-rozhovor/README.md) · Rodinný rozhovor | questions and answers on warm colour fields; pen drawings |

Board letters F–I are canvas labels only. Assign the template letter when a direction is built.

## What each folder holds

- `comps/<palette>/home-1280.png`, `home-375.png`, `notice-375.png`: each screen at its native width; `board.png`: everything including the design notes.
- `html/board-<palette>.html`: the same boards as plain HTML with every colour and size resolved. **Prefer these over the PNGs for exact values.** They load fonts from Google Fonts for preview only; the build self-hosts via `@fontsource`.
- `source/*.dc.html`: the canvas source as published.
- `tokens.json` / `TOKENS.md`: palettes (hex), computed WCAG contrast, fonts, type scale, spacing, layout, separation device.
- `README.md`: structure, emergency CTA forms, rules for undrawn screens, proposals, self-check.

[comparison.png](comparison.png) is the overview board: greyscale silhouettes of A, B, F–I at 1280 and 375, and the table below.

## Comparison (funeral-ux.md §6 axes + page flow + notices)

| Axis | A Rodinná tradice | B Důstojná jednoduchost | F Noční linka | G Tichá krajina | H Plný přehled | I Rodinný rozhovor |
| --- | --- | --- | --- | --- | --- | --- |
| Page flow | editorial: hero, story, services | practical blocks | fixed rail + one statement per screen | long slow scroll, text ↔ landscape | directory; no story | questions and answers |
| Density | long-form | compact blocks | very sparse | airy | dense, 4 columns | medium |
| Colour | warm paper, umber | cool slate, forest | dark, amber signal | mist + spruce-blue | white, black, yellow highlight | cream, sand, deep clay field |
| Photos | few large, beside hero | minimal, below CTA | none | full-bleed landscapes between sections | small catalogue thumbnails | pen drawings; one people photo |
| Emergency | dark utility strip | header button + bottom bar | the sticky rail itself | ruled “stamp” line, twice per page | highlighted header box | answer to the first question |
| Navigation | centred letterhead | left logo, right nav | vertical list in the rail | plain top bar | every page in one row | always-visible words, no menu |
| Typography | EB Garamond + Source Sans 3 | Public Sans / IBM Plex | Schibsted Grotesk | Spectral + Figtree | Overpass + Overpass Mono | Alegreya + Alegreya Sans |
| Separation | hairlines, small caps | 1 px lines, tinted bands | darkness and space | photographs + stamp rules | column and table rules | full-bleed colour fields |
| Services IA | one long page | index + detail | one statement page per kind of funeral | long page broken by photo bands | index + reference sheets | question-led page |
| Pricing | dot leaders | table | one big price per statement, lists below | included / excluded, price as heading | full table, identical on A4 | price in a sentence, then lists |
| Guidance | article + margin TOC | phased checklist | one step per screen | narrative timeline | checklist table by situation | “Co teď / Co v dalších dnech / Co po pohřbu” |
| Notices list | not yet | not yet | large-type agenda by date | calm list, optional family photo | table: date · time · name · place | names with the ceremony sentence |

## Rules shared by all four

- **Placeholder content.** “Pohřební služba Vzor”, all names, the address, IČO, register entry, phones (`+420 000 000 1xx`), `kancelar@vzor.example` and every price are placeholders. Yellow dashed tags (`ZÁSTUPNÉ JMÉNO`, `UKÁZKA`) are design annotations, not UI.
- **First screen.** Dashed lines in `board.png` mark 667 px (375) and 800 px (1280). The nonstop `tel:` link sits above them on every drawn screen.
- **Notice pages (L1).** No service links, prices, promo fields, drawings or photo bands. Each template has a neutral nonstop form, which needs a lawyer’s view before go-live.
- **Czech typography.** Keep one-letter words (`v, s, k, z, u, o, i, a`) off line ends with a non-breaking space (“i&nbsp;v&nbsp;noci”). Never let a phone number wrap (`white-space: nowrap`).
- **Fonts.** All are SIL OFL 1.1 with latin-ext and available as `@fontsource/*` 5.3.0. Every weight used renders “Příliš žluťoučký kůň úpěl ďábelské ódy” (checked in Chromium on 2026-11-10).
- **Logo check.** Each board shows the Hnátek logo (dark green + gold) next to both palettes; F needs the white logo variant.

## Self-check summary

| | F | G | H | I |
| --- | --- | --- | --- | --- |
| Nonstop in first screen 375×667 | pass | pass | pass | pass |
| Office hours separate | pass | pass | pass | pass |
| Contrast ≥ 4.5 / 3 | pass | pass | pass (box border required) | pass |
| Body ≥ 18 px | pass | fix: caption 16, Menu 17 | fix: mono hours 17 | pass |
| Ban list | risk: equal-height statements | pass | risk: yellow on the urgent line | pass |
| L1 notices neutral | ⚖ review | ⚖ review | ⚖ review | ⚖ review (reduced nav) |
| L8 footer identification | notice page only | notice page only | drawn | notice page only |
| L9 VAT note | not drawn | not drawn | drawn | drawn |
| L10 Právní informace | drawn | drawn | drawn | drawn |
| L12 consent | core gate | core gate | core gate | core gate |

Round 1 (C Klidné rozcestí, D Tiché parte, E Místní kancelář) stays on the canvas for reference only and is not exported: it was rejected because it kept B’s skeleton and differed mainly in fonts and accents.
