# S12 · Template E `krok-za-krokem` (Krok za krokem)

**Status (2026-11-14):** built, not committed. This template replaces E `ticha-krajina` (Tichá krajina, S8).

- **Owner's decision:**
  - "I dont like D and E that much, lets replace them … informative but still somewhat designed … calming and simple."
  - From the three E directions on the canvas, the owner chose E1: "E1 is good".
  - The one change the owner asked for: the thread runs behind the rings, not over them.
- **Design input:** [docs/designs/krok-za-krokem/](../designs/krok-za-krokem/README.md), which holds the home at 1280 and 375. Every other page is built from the home's system.
- **Trial client:** `clients/hnatek-e`.
- **QA port:** 4417.

## 1. Concept

**The home page is the guide.** One vertical thread runs with a gold ring at every stop, and one stop stands for each guidance phase:

- V prvních hodinách
- V následujících dnech
- Příprava pohřbu
- Po pohřbu

**What each stop shows:**

- The phase's first published step stands for the phase: its title, its summary, and its `checklist` as a guided list ("Co je potřeba", design-differentiation §1.3).
- The first stop adds:
  - the nonstop link, when the step's `contactPrompt` is `emergency`;
  - "Zemřel jinde? v nemocnici · v domově pro seniory", which leads into the filtered guide.
- Other steps of a phase are listed as "Také: …" links into `/jak-postupovat/#<id>`.

**Photos stand at the stops, by time:**

- the `o-nas` `heroImage` beside "Sjednání pohřbu";
- the featured ceremonies, plus the first real flower and coffin photos as links, at "Příprava pohřbu".

**After the thread:**

1. The closing line, "Tím máte to nejdůležitější za sebou.", and the full guide link.
2. The sage band: prices on one side, the family story on the other.
3. The deep footer.

**Every page uses the same axis:**

- columns of 230 · 60 · ≤ 820 px from 64 rem;
- the section heading in the label column, with a small gold ring beside it.

## 2. Signature interaction (design-differentiation §1.1)

The ring of the stop being read fills with the primary.

**How it works:**

- The thread `<ol>` carries core's `data-spy-nav`.
- Each ring is an `aria-hidden` link to its own stop, with `tabindex="-1"`, so it is never a tab stop.
- Core sets `aria-current="location"` on the ring of the stop under the reading line.
- Without JavaScript, the first ring is filled.
- The fill takes 200 ms and is off under reduced motion.

**Keeping the spy correct.** The spy reads only `a[href^="#"]`, so the guide's "Potom" links use the full path `/jak-postupovat/#<id>`. That keeps them out of the spy. Core's `data-guide-next` still handles them, because the pathname matches.

## 3. Brand mapping (template-contract §8a)

| E token | Brand role |
| --- | --- |
| ground | `--brand-ground` |
| ink / muted | `--brand-ink` / `--brand-muted` |
| primary (text, links, headings) | `--brand-primary-text` |
| primary fill (ring being read, phone strip, nav ring) | `--brand-primary`, text on it `--brand-on-primary` |
| ornament (rings, hairline accents) | `--brand-secondary` (gold, decoration only) |
| ornament text (phase labels, gold capitals) | `--brand-secondary-text` (core darkens it to 4.5:1, G-090) |
| thread | `color-mix(primary 24 %, ground)` |
| sage band | `--brand-surface-2` |
| footer | `--brand-deep` / `--brand-on-deep` / `--brand-muted-on-deep` |
| hairlines | `--brand-rule` (strong), a 40 % mix with the ground (light) |
| card | 75 % white into the ground; its rule a mix of `--brand-rule` |
| display / body font | `--brand-font-display` / `--brand-font-body` |

For Hnátek, this gives:

- a cream ground (`#F9F6EF`);
- forest-green headings, phone strip and filled ring (`#0B3D2C`);
- gold rings (`#C9A24A`), with phase labels in core's darkened gold `#8C6905`;
- Playfair Display headings and Source Serif 4 text.

## 4. Palettes without a brand (contrast, WCAG 2.x)

| Pair | `salvej` | `modrava` |
| --- | --- | --- |
| ink / ground | 14.3 | 14.6 |
| muted / ground | 6.5 | 6.7 |
| muted / band | 5.8 | 5.9 |
| primary / ground | 7.8 | 8.6 |
| primary / band | 7.0 | 7.5 |
| ornament text / ground | 6.0 | 6.4 |
| on-primary / primary | 7.8 | 8.6 |
| on-deep / deep | 10.6 | 11.8 |
| muted-on-deep / deep | 7.8 | 8.3 |
| strong rule / ground (non-text) | 3.3 | 3.4 |
| ornament (rings) / ground | 2.8 | 3.0 |

The rings are decorative and `aria-hidden`. The state they show (the stop being read) is also given by `aria-current` on a hidden link, so it is not information conveyed by colour alone.

## 5. Decisions taken in the build (for the owner)

1. **One stop per phase on the home.** E1 drew four stops. The home shows the first step of each phase; the rest are "Také" links. The guide shows every step as its own stop.
2. **Phase labels on every guide stop.** A phase label appears on each stop, not only on the first stop of a phase. This keeps the label visible when the place filter hides the first stop.
3. **The Spojení card** appears beside the H1 of every inner page on desktop, but not on Kontakt, which already has the contact, or on notices. On phones it shows only on the home, reduced to the office status. The phone strip carries the number.
4. **Prices and family share one band.** It is a single block in the homepage order, which also keeps the pairwise order check at 3 or more positions against every template.
5. **Catalogues show photos whole**, three per row, with white product grounds multiplied onto the cream. This replaces the old one-per-row thumbnails.
6. **The landscape set is unused.** `features.landscapes` and the content type stay in core, and `hnatek-e` no longer has `site/landscapes.json`.
7. **Notice pages carry no ornament.** There is no thread, no band and no card, and the section rings are hidden. The footer lists only the office phones, with no flower orders (QA L1 "nothing promotional").
8. **No sans face.** E1 uses only serifs. Small labels are the body serif in letter-spaced capitals.

## 6. Verification

The counts are in the report for this session. The checks run were:

- `npm run check`;
- `npm run client:validate -- hnatek-e` (PROTOTYPE: PASS);
- the full `npm run qa`;
- Playwright screenshots at 1280 and 390 of `/`, `/jak-postupovat/`, `/kontakt/`, `/sluzby/` and `/kvetiny/` on the `hnatek-e` prototype (port 4805).
