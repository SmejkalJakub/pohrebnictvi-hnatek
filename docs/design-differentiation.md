# Design differentiation: `rodinna-tradice` vs `dustojna-jednoduchost`

**Status:** Phase 1 contract, draft 1 (2026-11-05).

This document defines the two pilot templates **structurally**: page compositions, navigation, information architecture and component inventories. It also states the shared brand constraints and the checklist and scorecard used in Phase 2 QA and in the Phase 4 comparison.

Related: [template-contract.md](template-contract.md) · [content-contract.md](content-contract.md)

---

## 1. Shared design constraints (both templates)

- Conservative and trustworthy, suitable for a Czech funeral home. Calm, not sombre. Generous spacing, but never at the cost of finding the phone number.
- **Forbidden:** decorative gradients, glows, glassmorphism, carousels or sliders, parallax, scroll animations, animated counters, icon-card grids as the primary structure, drop-shadow-heavy cards, stock portraits, realistic AI imagery, melodramatic grief imagery (wilting flowers, crying people, dark skies), invented testimonials or social proof, emotionally manipulative copy.
- **Allowed restraint devices:** hairline rules, small caps labels, quiet typographic hierarchy, neutral tinted bands, real photographs once approved.
- Both templates must look **complete with zero photographs** (U5), so no layout may depend on an image to make sense.
- Accessibility and technical invariants: template-contract §6.
- All fonts are self-hosted, OFL or similar licence, with **latin-ext** coverage verified using the pangram "Příliš žluťoučký kůň úpěl ďábelské ódy" in every weight used.

## 2. Template A: Rodinná tradice (warm heritage)

**Concept:** a well-made family letterhead. Editorial, personal and composed. The reader is invited to slow down slightly, but urgent help is always one tap away.

**Information hierarchy on the homepage:** who we are and how we help → family tradition → services described in prose → what to do first → visit us.

### 2.1 Chrome

- **Utility strip (all pages, top):** a full-width dark band (ink on paper, inverted) with one line: "Nonstop převoz zesnulých · +420 720 283 499" as a `tel:` link. On mobile it is a compact single line with a "Volat" affordance. It is sticky on mobile only, about 44 px high.
- **Header:** a centred wordmark or logo above a centred horizontal text navigation, separated by a hairline rule, in the style of a classic letterhead. On mobile, the centred wordmark sits beside a "Menu" text button, and the menu opens as a full-height list in the normal flow, not as an overlay drawer.
- **Footer:** "rich letter" footer in three columns on desktop: address and map link | office hours (own heading) | a **separately headed** nonstop transport block. Below that sit the legal identifiers (IČO, register entry) in small type.
- **Options:** `heroVariant` is `photo-right` (uses the hero image when one is approved, otherwise falls back to the typographic panel) or `typographic`. With `emergencyEmphasis: "high"`, the utility strip becomes sticky on desktop too, uses a larger number, and the hero gains an inline emergency line under the lead.

### 2.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | (1) **Editorial hero**: an asymmetric two-column layout with a large serif H1 and lead on the left, and on the right either a photograph (portrait 4:5) or, with no image, a typographic panel showing the `tradition.publicWording` in small caps between rules. (2) **Family story excerpt**, a long-measure paragraph and a "Více o nás" link. (3) **"Jak vám pomůžeme"**: services in 2–3 descriptive prose groupings by category, each a heading and paragraph with an inline link, *not* cards. (4) **"Když zemře blízký člověk"**, a short intro with the emergency CTA repeated inline, then the letter-style "Kde blízký člověk zemřel?" panel linking into the filtered guide (or the first-hours steps when guidance names no situations). (5) **"Navštivte nás"**, a letter-style address block and office hours next to each other, with the emergency block below. |
| **Jak postupovat** | Guided article. A letter-style "Kde blízký člověk zemřel?" panel (large serif answer links) filters the steps (template-contract §6, guided guidance). Guidance entries are numbered `<h2>` sections in reading order with a circled numeral; each leads with "Co udělat" (the summary), a tickable checklist and a framed phone link; the body text sits in a `<details>` "Přečíst podrobnosti", and a "Další krok" link moves on. On desktop there is a sticky in-page table of contents in the left margin, filtered and renumbered with the steps. A boxed aside "Potřebujete převoz hned?" appears after the first section. Updated 2026-11-09 for older readers. |
| **Služby** | **One long page, no detail pages** (`serviceDetailPages: false`). It opens with "S čím potřebujete pomoci?", a list of large links to every service. Sections are grouped by category with `id` anchors and a left-margin contents list on desktop. Each service is a heading and summary, with the prose body in a `<details>` "Co služba zahrnuje" and an optional half-width image alternating left and right. A "Nevíte si rady?" panel with the office and emergency numbers closes the page. |
| **Rakve** | Editorial gallery of `<figure>` elements with captions, in a masonry-free two-column grid with alternating large and small rhythm (one wide item, then two narrow), and descriptive captions in a serif italic. |
| **Květiny** | The intro prose, then a gallery like Rakve but at 1:1, then a centred ordering block with the flowers phone. |
| **O nás** | Long-form story, a measure of about 65 characters, with a drop cap on the first paragraph. If `foundedYear` is VERIFIED, a single "od roku YYYY" line. No timeline unless dates are verified. A placeholder image slot is used only if the image is approved. |
| **Kontakt** | Two columns: left an "address card" in the letterhead style (address, phones, e-mail, map link, access note); right the office hours. Below, full width, a separately framed **Nonstop převoz zesnulých** panel. |
| **Ceník** | Grouped definition lists (`<dl>`): item label and description on the left, `<PriceValue>` right-aligned with dot leaders on desktop. The demo notice is shown as a bordered note above. |

### 2.3 Visual system

- **Palette `ivory-umber` (default):** paper `#F7F2E8`, surface `#EFE7D8`, ink `#2B2722`, muted `#5C544A`, accent (umber) `#6B3F2A`, rule `#8C7B64` (non-text, 3.67:1 on paper). Contrast is verified: ink on paper 13.3:1, muted 6.7:1, accent 7.9:1 (7.2:1 on surface).
- **Palette `ivory-olive`:** same neutrals, accent `#4F5A3A` (6.6:1 on paper).
- **Palette `ivory-forest`:** same neutrals, accent `#1F3D2E` (10.7:1 on paper). Added in S3 to harmonise with green client logos (§8).
- **Type, `garamond-source` (default):** EB Garamond for display and headings (H1 clamp 2.25–3.5 rem), Source Sans 3 for body text at 1.125 rem/1.65.
- **Type, `literata`:** Literata for headings and body. It replaced the planned `cormorant-literata` pair: in S3, Cormorant Garamond placed Czech accents visibly off the letter in Chrome (í, ř, ž), so it was dropped. See `docs/notes/s3-rodinna-tradice.md`.
- **Layout grid:** 12 columns with a narrow text column (max 38 rem) offset from the margin. Asymmetry is intentional.
- **Imagery:** fewer but larger images with warm natural light; captions always visible.
- **Ornament:** hairline rules, small caps section labels ("SLUŽBY"), a drop cap on O nás only. No icons except the phone glyph in the utility strip.

### 2.4 Unique components (A only)

`UtilityStrip`, `LetterheadHeader`, `EditorialHero`, `TraditionPanel`, `ProseServiceGroups`, `MarginToc`, `FigureGallery`, `AddressCard`, `DotLeaderPriceList`, `RichFooter`.

## 3. Template B: Důstojná jednoduchost (clarity and structure)

**Concept:** a calm, well-signed public building. Information is where you expect it, in compact, scannable blocks. Hierarchy: **urgent contact > next steps > services > company background** (brief §4B).

### 3.1 Chrome

- **Header:** sticky on all widths. The logo sits left. On the right is the navigation on desktop, followed by a **persistent emergency button** "Nonstop převoz · 720 283 499" (filled accent, white text). In `high` emphasis the button shows the full number on every width and gets a second line, "24 hodin denně".
- **Mobile action bar:** a fixed **bottom bar** with two equal buttons: "Nonstop převoz" (`tel:` emergency, filled) and "Kancelář" (`tel:` main office, outlined). The page reserves bottom padding for the bar. The header shows only the logo and a "Menu" button, and the menu drops down below the header.
- **Footer:** compact, in two rows: contact facts in a single line group, and the legal identifiers. The emergency CTA is not repeated in the footer because the bar or header is always present, but it is repeated on the contact page.

### 3.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | (1) **Practical hero**: H1 and a one-sentence lead, then a **two-tier CTA block**: primary emergency call (large) and a secondary line "Kancelář: Po–Pá 7:00–15:30 · +420 517 352 020". The default `heroVariant` is `text-only`; `text-with-image` places a modest 3:2 image *below* the CTA block, never before it. (2) **"Co dělat jako první"**: the "Kde blízký člověk zemřel?" button grid linking into the filtered guide when guidance names situations; otherwise 3–4 numbered steps from guidance with `phase: first-hours`, as a horizontal stepper on desktop and a vertical list on mobile. Both end with a link to the full guide. (3) **Services index**: a two-column list (`<ul>` of title, summary and link to the detail page), grouped by category headings, with no images. (4) **Contact summary**: a compact three-cell info row (address, office hours, phones) separated by vertical rules, not cards. (5) **Family background**: a short excerpt and a link, placed last by default. |
| **Jak postupovat** | **Phased checklist**, opened by a grid of large signage buttons "Kde blízký člověk zemřel?" that filter the steps (template-contract §6, guided guidance). Guidance is grouped under phase headings ("V prvních hodinách", "V následujících dnech", "Příprava pohřbu", "Po pohřbu"), numbered by visible phase. Each entry is a compact block with its summary, an expandable `<details>` body, a checklist of real checkboxes, the `contactPrompt` button and a "Další krok" link. A "Vytisknout" print stylesheet is included. Updated 2026-11-09 for older readers. |
| **Služby** | **Index plus detail pages** (`serviceDetailPages: true`). The index is the same list as on home, with full grouping; every item is one large tappable row (title, summary, chevron), and the page ends with "Nevíte, kterou službu potřebujete?" and the call tier. Every detail page uses the same structure: H1, summary, "Co zahrnuje" (body), a "Související ceny" link if a `priceGroupId` exists, and a side box with office contacts. |
| **Rakve** | A uniform catalogue grid (3/2/1 columns) of 4:3 thumbnails with name, material and code underneath. Equal heights; no captions over images. |
| **Květiny** | A uniform 1:1 grid like Rakve, then an ordering info row with the flowers phone. |
| **O nás** | Short and factual. First a "fact sheet" `<dl>` (legal name, family-owned, tradition wording, location), then the story body at reduced prominence. |
| **Kontakt** | A structured page. The emergency panel comes first (full width, accent border), then a grid: address and map link | office hours table | phones and e-mail list, then the legal identifiers. |
| **Ceník** | A **table** per group (`<table>` with `<caption>`, columns Položka / Popis / Cena). On mobile it reflows into stacked rows with visible labels. The demo notice appears above the first table and a "UKÁZKA" marker in every price cell. |

### 3.3 Visual system

- **Palette `slate-forest` (default):** background `#F5F5F2`, surface white, ink `#1F2326`, muted `#4A5258`, line `#7D868C` (3.4:1, used for UI boundaries), accent (forest) `#2F5446`. Contrast is verified: ink 14.5:1, muted 7.3:1, accent 7.8:1, white on accent 8.5:1.
- **Palette `slate-blue`:** accent `#34495E` (8.5:1; white on it 9.3:1).
- **Type, `public-sans` (default):** Public Sans throughout, with weights 400/600 and an H1 clamp of 1.875–2.75 rem. **`plex-sans-serif`:** IBM Plex Sans body with an IBM Plex Serif H1 only. Candidates; verify in S4.
- **Layout grid:** 12 columns, full-width content blocks separated by 1 px lines and background bands, not cards. Consistent 8 px spacing scale.
- **Imagery:** minimal and functional. Images appear in catalogues and optionally one hero-adjacent image. No decorative imagery.
- **Iconography:** a single restrained line-icon set (phone, map pin, clock) at 20 px, always paired with text.

### 3.4 Unique components (B only)

`StickyHeaderWithEmergency`, `MobileActionBar`, `PracticalHero`, `CtaTier`, `FirstStepsStepper`, `ServiceIndexList`, `ServiceDetailLayout`, `PhasedChecklist`, `UniformCatalogueGrid`, `InfoRow`, `FactSheet`, `PriceTable`, `PrintStyles`.

## 4. Mobile homepage sketches (375 px, first ~2 screens)

```
A · Rodinná tradice                     B · Důstojná jednoduchost
┌───────────────────────────────┐       ┌───────────────────────────────┐
│▓ Nonstop převoz zesnulých  ☎ ▓│ sticky│ [Logo]                 Menu ☰ │ sticky
├───────────────────────────────┤       ├───────────────────────────────┤
│      POHŘEBNICTVÍ HNÁTEK      │       │ Pohřební služba ve Vyškově    │
│ ─────────────────── Menu ──── │       │ Pomůžeme vám zařídit vše…     │
│                               │       │ ┌───────────────────────────┐ │
│ Důstojné rozloučení           │       │ │ ☎ Nonstop převoz zesnulých│ │
│ v rodinném duchu              │       │ │   +420 720 283 499        │ │
│ (serif H1, lead paragraph)    │       │ └───────────────────────────┘ │
│                               │       │ Kancelář Po–Pá 7:00–15:30     │
│ ── RODINNÁ TRADICE ──         │       │ +420 517 352 020              │
│ přibližně 40 let …            │       │ ───────────────────────────── │
│ ───────────────────────────── │       │ Co dělat jako první           │
│ Náš příběh (long paragraph)   │       │ 1  …                          │
│ Více o nás →                  │       │ 2  …                          │
│ ───────────────────────────── │       │ 3  …                          │
│ JAK VÁM POMŮŽEME              │       │ Celý postup →                 │
│ Pohřební obřady (prose…)      │       │ ───────────────────────────── │
│                               │       ├───────────────────────────────┤
│                               │       │[☎ Nonstop převoz][☎ Kancelář] │ fixed
└───────────────────────────────┘       └───────────────────────────────┘
```

## 5. Structural differentiation matrix

| Dimension | A: Rodinná tradice | B: Důstojná jednoduchost |
| --- | --- | --- |
| Header | centred letterhead, nav under the wordmark | left logo, right nav, sticky |
| Emergency CTA pattern | dark utility strip above the header (sticky on mobile) | header button + fixed mobile bottom action bar |
| Mobile navigation | in-flow full-height list | dropdown under the sticky header |
| Homepage order | hero → family story → services (prose) → first steps → visit us | hero with CTA tier → first steps → services index → contact info row → background |
| Hero | editorial, asymmetric, image or typographic panel | practical, text-first, CTA block, optional image after the CTAs |
| Services IA | one long page with anchors, no detail pages | index plus detail pages |
| Guidance format | narrative article, numbered sections, margin TOC | phased checklist, `<details>`, print styles |
| Catalogues | editorial figure gallery, varied rhythm | uniform equal-height grid |
| Pricing | definition lists with dot leaders | tables with captions, reflowing on mobile |
| About | long-form, prominent, drop cap | fact sheet first, story secondary |
| Footer | three-column "rich letter" with emergency block | compact two-row footer |
| Typography | classic serif display + humanist body | sans throughout (optional serif H1) |
| Image use | larger, fewer, captioned, warm | minimal, functional, uniform crops |
| Separation device | hairline rules, small caps labels | 1 px lines, tinted bands, 8 px rhythm |

## 6. Differentiation checklist (Phase 2 exit and Phase 4)

A template pair passes only if **every** item is true:

- [ ] The two `src/components/` directories share **no** component files, and the only shared imports are `@core/*`.
- [ ] For the same content, homepage section order differs in at least 3 positions, and the hero DOM structure differs (verified from the HTML outline, not from CSS).
- [ ] Header and navigation markup differ in structure (not only in classes).
- [ ] The emergency CTA uses a different placement pattern, and both pass invariant 1 at 375 px and 1280 px.
- [ ] Services information architecture differs (anchors vs detail pages) and the route sets differ accordingly.
- [ ] Guidance, catalogue and pricing presentations each use a different primary HTML structure (article/sections vs details/list; figure gallery vs uniform grid; dl vs table).
- [ ] With all colours replaced by greyscale, the screenshots are still recognisably different at 375 px and 1280 px (the "recolour test").
- [ ] With all images removed, both still look complete.
- [ ] Both pass the accessibility basics: axe-core with no serious or critical issues, keyboard pass, 200 % zoom and 320 px reflow.
- [ ] Neither uses anything on the forbidden list (§1).

## 7. Distinctiveness scorecard (Phase 4)

Score each dimension 0–3. 0 = same structure; 1 = cosmetic difference only; 2 = clearly different structure; 3 = different structure *and* a distinct rationale that is visible to a user.

| Dimension | Score | Evidence (screenshot or outline reference) |
| --- | --- | --- |
| Composition (page layouts, section order) | | |
| Navigation (header, mobile nav, CTA pattern) | | |
| Typography (families, scale, hierarchy) | | |
| Image usage (size, frequency, crops, captions) | | |
| Content hierarchy (what comes first, depth of IA) | | |

**Pass:** total ≥ 11/15, no dimension below 2, and both templates rated "conservative and credible" by the reviewer. A single dimension at 1 means a fix is required before Phase 4 is signed off.

## 8. Client brand assets vs template palettes

A client logo arrives with its own colours. For Hnátek (U22) these are dark forest green `#1F3D2E` and `#2E5A42` with gold `#C9A44A`. Template options must be able to harmonise with them, without per-client CSS overrides:

- **B** already fits: `slate-forest` (accent `#2F5446`) is close to the logo green.
- **A**'s default umber accent would clash with a green logo. Phase 3 should therefore choose `ivory-olive`, or S3 should add a declared `ivory-forest` palette (accent `#1F3D2E`, 10.7:1 on paper). This is a template-level option, available to every client, not a Hnátek exception.
- The gold `#C9A44A` (2.1:1) and grey `#9EA3A1` (2.3:1) are fine *inside the logo*, because logotypes are exempt from contrast requirements. They must not be reused for text or UI controls on light backgrounds.
- The mockup loads Bodoni Moda and Jost from Google Fonts. Websites built from it must not: the logo ships as an outlined SVG, so the site needs neither font. If a template wants either font for headings, it must be added as a declared, self-hosted font pair, with latin-ext coverage verified (Á, Ř, Í).
- The mockup's "POHŘEBNICTVÍ · VYŠKOV" line names a place. That is the client's call, and multi-location wording is out of scope.

## 9. Within-template variation (for the later second synthetic business)

Declared options (palette, font pair, hero variant, emergency emphasis, homepage section order) are the only per-client levers. Within-template differentiation for a second business is tested later (test plan scope). It is expected to be modest by design, and is not a goal of this pilot.
