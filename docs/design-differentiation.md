# Design differentiation: templates A–E and G (`rodinna-tradice`, `dustojna-jednoduchost`, `nocni-linka`, `plny-prehled`, `ticha-krajina`, `lide-a-misto`)

**Status:** Phase 1 contract, draft 1 (2026-11-05).

This document defines the templates **structurally**: page compositions, navigation, information architecture and component inventories. It also states the shared brand constraints and the checklist and scorecard used in Phase 2 QA and in the Phase 4 comparison.

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

## 3a. Template C: Noční linka (the night line)

**Status:** built 2026-11-10 (S6, `docs/notes/s6-nocni-linka.md`) from the approved round-2 design F in `docs/designs/nocni-linka/`.

**Concept:** for the person who opens the site at two in the morning. Dark, quiet and very large. On desktop a sticky side rail holds the name, the nonstop number and the navigation; the content scrolls beside it as single statements (muted kicker, one large heading, a sentence or two, one link). Nothing competes with the number: amber is used for it and for nothing else.

### 3a.1 Chrome

- **The rail is the header.** One `<header>`: from 64 rem a sticky 440 px column on the rail colour (name, place, "Nonstop převoz zesnulých" + the number in 38 px amber with a 3 px underline, the vertical ruled nav). Below 64 rem a name row with an "Obsah" button and, directly under it, the nonstop panel on the rail colour; the menu opens in the flow under the panel (24 px bold ruled rows), so the number never leaves the screen.
- **Neutral form on notice pages** (`/oznameni/…`): the rail and panel are replaced by "Oznámení zveřejňuje <brand>." and an ink "Telefon nonstop <number>" link; the nav is reduced to Oznámení · Kontakt · Úvodní stránka; the footer drops the Dokumenty column and the amber. ⚖ L1 review.
- **Footer** on the rail colour: name and address · office hours (own heading) · nonstop line (own heading) · Dokumenty, then the legal row (identification, ADR, Právní informace, privacy).
- **Options:** `palette` `noc` (default) / `grafit`; `fontPair` `schibsted-grotesk` (default) / `hanken-grotesk`; `heroVariant` only `statement` (home never has a photo); `emergencyEmphasis` `high` widens the rail to 512 px and sets the number at 48 px, and repeats the number inside the home hero.

### 3a.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | Statements in `homepage.sections` order; default hero → services → next-steps → family-story → contact-summary. The hero is one screen tall on desktop (kicker "Když někdo zemřel", H1, lead, one link). A notices statement (no names) follows the hero while notices are on. Featured services are one statement each; next-steps is the 58 px "Kde blízký člověk zemřel?" picker. |
| **Jak postupovat** | Inverted picker with the word "vybráno", "Zobrazeno N z M kroků", one step per statement ("Krok n z N · phase", 28 px native checkboxes, body in `<details>`, emergency steps repeat the panel, "Další krok"), then Časté otázky by topic. |
| **Služby** | Featured services as statements, the rest as "Další služby" inline links; **index + detail pages** built the same way, with "V ceně je zahrnuto / Není zahrnuto" from the linked price group. |
| **Ceník** | VAT note bold in the lead, the demo notice in the site's only 1 px box, one statement per group with the headline price as a 56 px heading in ink and the two inclusion lists, other items in a ruled table. Prints light on A4. |
| **Kontakt** | Address, then separate statements: Úřední hodiny, Telefony a e-mail, Převoz zesnulých, Lidé (photo rows or ruled name columns, no initials). |
| **Oznámení** | Large-type agenda: the date as heading, "time · name" on one line, place and type muted; "Bez veřejného obřadu"; "Nedávná oznámení". Notice page: name, dates, 26 px ceremony sentence, map, livestream link, family note, condolences instruction, parte, QR on white. |
| **Rakve, Květiny** | Built from Lidé: ruled rows with a small thumbnail, or ruled name columns without images. |
| **O nás, Pro účastníky, Pohřeb předem, Právní informace, privacy, 404** | Title statement, then the Markdown body where each `##` opens a statement; Právní informace adds ADR, Reklamace and the documents as ruled rows. |

### 3a.3 Visual system

- **Palette `noc`:** ground `#121614`, rail `#1B211E`, ink `#F1EEE6`, muted `#B9BDB5`, signal (amber, nonstop number only) `#F0B54A`, rule `#6F7771`. **`grafit`:** `#1C1D20`, `#25272B`, `#F2F1EE`, `#BDBEC2`, `#E9A77A`, `#75777C`. Contrast in `docs/notes/s6-nocni-linka.md`.
- **Type:** one grotesque, 400/700; body 20 px, lead 24, H1 76/40 (1280/375), statement H2 56–60/30–34.
- **Separation:** darkness and space; one 1 px rule at the top of each statement. No cards, boxes, icons, radius, photos on home, light sections or a second accent. Print is always light.

### 3a.4 Unique components (C only)

`NightRail`, `RailNumber`, `NeutralLine`, `RailNav`, `NightFooter`, `Statement`, `TitleStatement`, `StatementProse`, `Shown`, `OpeningStatement`, `NoticesTeaser`, `FeaturedStatements`, `PlaceLinks`, `OfficeStatement`, `StoryStatement`, `CatalogueLinksLine`, `StepStatement`, `TopicQuestions`, `GroupPriceStatement`, `InclusionColumns`, `RuledItemTable`, `A4Letterhead`, `CeremonyAgenda`, `RecentNotices`, `NoticeFacts`, `QrSquare`, `HourRows`, `PeopleRows`, `CatalogueRowList`, `EmptyCatalogue`, `DocumentRows`, `AdrStatement`.

## 3b. Template D: Plný přehled (the full overview)

**Status:** built 2026-11-11 (S7, `docs/notes/s7-plny-prehled.md`) from the approved round-2 design H in `docs/designs/plny-prehled/`.

**Concept:** for families who want facts, not atmosphere: the practical son or daughter who arranges everything and compares. Every page is a reference sheet; the home page is a **directory**, like a timetable or a municipal noticeboard: routes, key prices, services and catalogues with counts, people, the notices count, documents and common questions on one desktop screen in four ruled columns. On a phone the index folds into `<details>` rows.

### 3b.1 Chrome

- **Header with two boxes.** Name and address left; right the **highlighted nonstop box** (highlight fill, 2 px ink border, bold label, number in Overpass Mono 30 / 28 px, underlined, never wrapping) and, separately, the 1 px **Kancelář** box (hours in mono, office phone). Under them **the whole navigation in one row** under a 3 px ink rule (≥ 48 rem); the current page is bold, never highlighted.
- **Phones:** name row with a **"Rejstřík"** button (never a hamburger), then the nonstop box, then the Kancelář box. The Rejstřík lists every page as a ruled row with its count or from-price in mono (`7 kroků`, `3`, `od … Kč`, `3 PDF`); the VAT note follows when a price shows.
- **Neutral form on notice pages:** a plain 1 px box "Oznámení zveřejňuje <brand>. Telefon nonstop <number>", no Kancelář box, nav reduced to Oznámení · Kontakt · Úvodní stránka, footer without Dokumenty and with "Telefon nonstop". ⚖ L1 review.
- **Footer:** 3 px rule; Kancelář (address, hours, phone) · Nonstop převoz · Dokumenty (PDF) · Právní (Právní informace, privacy, adr.coi.cz); legal row with legal name, sídlo, IČO, register entry.
- **Options:** `palette` `seda-a-terakota` (default, owner 2026-11-11) / `bila-a-zluta`; `fontPair` `overpass` (Overpass + Overpass Mono, default) / `red-hat` (Red Hat Text + Red Hat Mono); `emergencyEmphasis` `high` doubles the box's height (44 px number on desktop) and, on phones, moves the boxes above the name row. No `heroVariant`: there is no hero.

### 3b.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | The directory: every homepage section is a ruled cell, in `homepage.sections` order, laid out with CSS columns (4 at ≥ 64 rem, 2 at ≥ 48 rem) so any order and subset works; `faq` spans all columns under a 3 px rule. Default next-steps (h1 "Když někdo zemřel": situation links + first hours) → price-summary (first item of each group, VAT note) → services → catalogue-links (counts + small thumbnails) → people → notices (a link with a count, never names) → documents → faq. Phones: `<details>` rows, the first open. |
| **Jak postupovat** | H1 beside four situation buttons (the only filled controls); the **situation matrix** (rows = steps, columns = situations, "ano" / "—"); picking hides the other columns and rows (`:target`, no JS). Phones: "Krok / Platí pro" table unpicked; picked = "Doma: N kroků" and one compact checklist with native checkboxes, full text in `<details>`. Then Časté otázky by topic. |
| **Služby** | **Index table** (služba · co zahrnuje · cena in mono · Detail) + VAT note; **reference sheet** per service (key–value table with the linked group's prices, VAT note, inclusion lists). |
| **Ceník** | VAT note under the title and under the table; packages (groups with inclusion lists) side by side under 3 px rules with the price at the right of the title; **"Jednotlivé položky"** with a **"Typ ceny"** column (pevná, za jednotku, rozpětí, od, na dotaz). The same tables on A4; the highlight prints as a 2 px black box. |
| **Kontakt** | Key–value tables: Kontakty, Úřední hodiny (own heading), Převoz zesnulých (own heading: dostupnost, oblast, number), Lidé (`#lide`) as a table with 64 × 80 thumbnails or **square initials boxes**. |
| **Oznámení** | **Timetable**: datum · čas · jméno · místo · obřad · přenos, em dash for missing values; "Nedávná oznámení" as a second table; phones: a name and a 3-row mini table each. Notice page: h1 name + photo thumbnail, ceremony sentence, fact table, text, parte, QR. |
| **Rakve, Květiny** | Built from Lidé: a table (thumbnail column only when some item has an image, name, code / kind, description). |
| **O nás, Pro účastníky, Pohřeb předem, privacy** | Reference sheets: H1, lead, the body with each `##` as a ruled block and lists as ruled rows. **Právní informace**: ADR and Reklamace tables, Dokumenty (`#dokumenty`). **404**: the whole index as `<details>` rows. |

### 3b.3 Visual system

- **`seda-a-terakota`:** ground `#F2F2F0`, ink `#141414`, muted `#4A4A4A`, highlight (nonstop box only) `#E8B98C`, rule `#868684`. **`bila-a-zluta`:** `#FFFFFF`, `#111111`, `#4A4A4A`, `#F2C230`, `#8A8A8A`. The highlight fails 3 : 1 against the ground, so the box always has its 2 px ink border. Contrast in `docs/notes/s7-plny-prehled.md`.
- **Type:** Overpass 400/700 for words, Overpass Mono 500 for every number; body 18 / 1.45; section headings 22; H1 40 / 32, never larger.
- **Separation:** column rules and table rules; 3 px ink rules above the nav, the FAQ row and the footer. No hero, cards, shadows, icons, radius, section backgrounds or photos larger than a thumbnail. Overpass sets "·" tight to the next word, so middle dots are separate elements with their own margin.

### 3b.4 Unique components (D only)

`IndexHeader`, `NonstopBox`, `OfficeBox`, `PublisherBox`, `NavRow`, `IndexFooter`, `Sep`, `SheetHead`, `ReferenceBody`, `DirectorySection`, `FirstHoursCell`, `PriceExcerptCell`, `ServiceListCell`, `CatalogueCountCell`, `PeopleCell`, `NoticeCountCell`, `DocumentListCell`, `QuestionRow`, `SituationButtons`, `SituationMatrix`, `PickedChecklist`, `QuestionDetails`, `PackagePair`, `ItemPriceTable`, `ServiceIndexTable`, `ContactTable`, `TransportTable`, `PeopleTable`, `InitialsBox`, `CatalogueTable`, `NoCatalogueItems`, `AdrTable`, `DocumentTable`, `CeremonyTimetable`, `NoticeFactTable`, `NoticeQrBlock`, `RegisterList`; layout `IndexLayout`.

## 3c. Template E: Tichá krajina (the quiet landscape)

**Status:** built 2026-11-13 (S8, `docs/notes/s8-ticha-krajina.md`) from the approved round-2 design G in `docs/designs/ticha-krajina/`.

**Concept:** for a firm in a rural region that wants the site to feel like air and distance, not like a shop. Every page is one long, slow read on a 12-column grid: short passages (heading in columns 1–4, text in 6–11) alternate with **full-bleed photographs of the local landscape**, commissioned, without people, never in the first screen. The nonstop number is a ruled **stamp line** after the opening and again at the top of the footer.

### 3c.1 Chrome

- **Plain top bar, not sticky:** wordmark or logo left; ≥ 64 rem the text navigation in Figtree 18 px on the right, wrapping to a second line when long; the current page carries a 3 px accent bar instead of an underline. Phones: a **"Menu"** button (never a hamburger) opens the list in the flow as large light Spectral words separated by space only, closed by a stamp line.
- **Stamp line:** one `tel:` link between two 1 px ink rules: Figtree label · Spectral 600 number in the accent, underlined, 42 / 33 px, never wrapping · "ve dne, v noci i o svátcích". After every page's opening (at about 380 px on a phone) and as the first thing in the footer. `emergencyEmphasis: high` moves the first one directly under the header, before the H1.
- **Neutral form on notice pages:** a muted sentence "Oznámení zveřejňuje <brand>." with an ink "Telefon nonstop <number>" link under the header; nav reduced to Oznámení · Kontakt · Úvodní stránka; no stamp lines, no bands; the footer keeps Kancelář, Právní informace and the legal row. ⚖ L1 review.
- **Footer:** the second stamp line; three columns Kancelář (address, hours, office phone) · Dokumenty (PDF) · Právní informace; legal row with legal name, sídlo, IČO, register entry and "Spory: Česká obchodní inspekce, adr.coi.cz".
- **Options:** `palette` `mlha` (default) / `len`; `fontPair` `spectral-figtree` (default) / `gelasio-figtree`; `emergencyEmphasis` `standard` / `high`. No `heroVariant`: the opening is text only.

### 3c.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | Text-only opening (light 72 px H1 in cols 1–7, lead in 9–12), stamp line, then passages in `homepage.sections` order: next-steps ("Když někdo zemřel", the place picker as a running sentence) → services (featured services) → family-story → people (names in light serif, two per row) → contact-summary (Kancelář with its own Úřední hodiny). Landscape bands after the 1st, 3rd, 5th … passage, never after the last, never beside `notices`. |
| **Jak postupovat** | Picker as a **sentence of words** (each ≥ 44 px; the picked word loses its underline, gains a 3 px accent bar and "(vybráno)"); "N kroků pro úmrtí …. Zobrazit vše"; the steps as a **narrative timeline**: one passage per phase (small Figtree label in cols 1–4, Spectral 600 step headings in 6–11 with "when it applies", checkboxes, `<details>`). Then Časté otázky. No bands. |
| **Služby** | **One long page with anchors** (no detail pages): one passage per featured service with its inclusion lists and "Co je v ceně", then "Další služby" with the others under their own anchors; a band after every second passage. |
| **Ceník** | VAT note in bold beside the H1; per group with lists: the group name as a small label and **the from-price as the 44 px heading** in cols 1–4, "V ceně je zahrnuto" / "Není zahrnuto" in 6–11; "Jednotlivé položky" as a hairline table, VAT note again. No bands. A4: letterhead, the same two-column logic at reduced size, legal row. |
| **Kontakt** | Passages Kancelář, Úřední hodiny (hairline table), Telefony, Převoz zesnulých (own heading and emergency block); the office building as a band (`secondaryImage`); Kdo vás přijme (`#lide`): with photos one person per row (3:4 portrait cols 1–2, light 36 px name cols 4–11), without photos names two per row. |
| **Oznámení** | A calm list: each notice a sentence (34 px name link, dates, ceremony sentence), optional 3:4 family photo beside it; "Nedávná oznámení". Notice page: the family photo uncropped, light 42 px name, plain sentences, Od rodiny, Kondolence, QR. |
| **Rakve, Květiny** | Built from Lidé: one item per row, image in cols 1–2, light 36 px name; names two per row without images. No bands. |
| **O nás, Pro účastníky, Pohřeb předem** | The body split at each `##` into passages; one band after the middle passage. **Právní informace**, privacy: passages, no bands. **404**: one sentence with two inline links, then the stamp line. |

### 3c.3 Visual system

- **`mlha`:** ground `#EEF1F0`, ink `#1B2422`, muted `#4C5856`, accent `#2F5160`, rule `#7E8A88`, photo placeholder `#C9D2CF`. **`len`:** `#F3EFE7`, `#24211C`, `#59534A`, `#6B5A3A`, `#8F8676`, `#D8CFBF`. Contrast in `docs/notes/s8-ticha-krajina.md`.
- **Type:** Spectral 400 for headings (light, never bold) and body 20 / 1.65; Spectral 600 only for the number, small headings and prices; Figtree 500 for navigation, labels and captions, never under 18 px.
- **Separation:** the photographs and space (48 / 96 px between passages); the only lines are the stamp rules and table hairlines. No boxes, cards, tinted panels, icons, centred layouts or text on photos.

### 3c.4 Unique components (E only)

`QuietTopBar`, `QuietNav`, `StampLine`, `NoticePublisherLine`, `QuietFooter`, `GridPassage`, `LandscapeBand`, `ProsePassages`, `OpeningText`, `PickerSentence`, `FirstHoursPassage`, `ServicesPassage`, `FamilyPassage`, `PeoplePassage`, `OfficePassage`, `CatalogueWords`, `NoticesCountLine`, `GuideNarrative`, `StepPassage`, `QuestionsPassage`, `ServicePassages`, `InclusionLists`, `PriceGroupPassage`, `HairlineItems`, `OfficeHoursHairlines`, `TransportPassage`, `PeoplePortraitRows`, `CatalogueQuietRows`, `NoticeSentences`, `NoticeDetailText`, `NoticeQrPassage`, `AdrPassage`, `DocumentLines`; layout `QuietLayout`.

## 3d. Template G: Lidé a místo (people and places)

**Status:** built 2026-11-13 (S11, `docs/notes/s11-lide-a-misto.md`) from the approved direction D2 in `docs/designs/lide-a-misto/`.

**Concept:** the firm introduced through its real people and places, as a documentary photo essay with **numbered captions**. Every photo is a figure "01 Name. One sentence." with an optional muted address line, numbered per page in reading order; the same numbers survive without photos as a numbered list of places or a numbered table of people, so a page reads complete with no photo at all. Two-digit numerals mean a figure or a place, nothing else; steps use green single digits. Rules, not boxes: a 3 px ink rule above every block, 1 px rules between rows.

### 3d.1 Chrome

- **Header, not sticky:** wordmark (or logo) with `company.tradition.publicWording` as a muted subtitle; ≥ 64 rem an Archivo 18 text nav row on the right, wrapping to a second line; the current page bold with a 3 px underline. 1 px rule under. Below 64 rem an outlined **"Menu"** button opens an in-flow list of 24 px bold links between 1 px rules, then the nonstop block and Kancelář. "Lidé" links to `/o-nas/#lide`.
- **Nonstop block:** a 3 px ink rule, then one `tel:` link with the label and the green number as block spans (46 px in the home hero, 40 px on inner pages, 34 px on phones, 28 px in the footer), `emergency.shortNote` muted under it. On inner pages it sits right of the H1 at 1280 and under the lead at 375. `emergencyEmphasis: high` adds a full-width green strip under the header on every non-notice page.
- **Neutral form on notice pages:** a muted sentence "Oznámení zveřejňuje <brand>." with an ink "Telefon nonstop <number>" link; nav reduced to Oznámení · Kontakt · Úvodní stránka; no figures, no green, no strip; a reduced footer.
- **Footer:** four 3 px-ruled columns Nonstop · Kancelář (address, hours, phone, e-mail) · Na webu · Právní informace (with the document PDFs), stacked at 375; legal row with legal name, sídlo, IČO, register entry and "Spory: Česká obchodní inspekce, adr.coi.cz".
- **Options:** `emergencyEmphasis` `standard` / `high` only. One palette, one font.

### 3d.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | `hero`: H1, lead and the 46 px nonstop block on the left, the owners' photo (`heroImage`) bleeding right as figure 01; without it a 64 px H1 with the nonstop block beside it. `family-story`: "Kde se o vašeho blízkého postaráme", the places (`site/places.json`) as a 3-column grid of numbered figures, places without a photo as numbered text cells; no photo at all → a numbered 2-column list; places off → the O nás excerpt. `next-steps`: label column + three first-hours steps with green numerals. `people`: "Kdo vás přijme", 120 × 150 portraits or names only. `price-summary` · `contact-summary` · `notices` as three ruled columns side by side. |
| **Jak postupovat** | "Kde blízký člověk zemřel?" as full-width 52 px rows between 1 px rules; the picked row fills green with "(vybráno)" (`:has(:target)`, no JS); phases as small caps in the 360 px label column, steps with green numerals under 3 px rules, native checkboxes, `<details>`. Then Časté otázky by topic. |
| **Služby** | **One long page with anchors** (no detail pages): an anchor row, one block per service (H2 in the label column, summary and body right, the service photo as a numbered figure beside the text when set, "Co je v ceně"), a closing office line. |
| **Ceník** | VAT note as the bold lead, demo notice, print hint; anchor row; per group the label column (H2, 34 px from-price, "včetně DPH", summary), a 1 px-ruled item table, included / excluded side by side; VAT note again. No photos. A4 print: ink only, groups as heading + table. |
| **Kontakt** | Office photo as figure 01 (`secondaryImage`); ruled split blocks Kancelář (address, map link, Úřední hodiny under their own heading), Telefony a e-mail (label over number), Převoz zesnulých (its own emergency block), Kdo vás přijme (names, link to `/o-nas/#lide`), billing details. |
| **O nás** | The people photo bleeding right as figure 01; Kdo jsme (body); **Naše místa** (`#mista`) as numbered figures with address lines, or the numbered list; **Lidé** (`#lide`) as 3:4 portraits with numbered captions and direct phones, or the numbered table; closing columns Kancelář · Pro účastníky. |
| **Oznámení** | Ruled rows: ceremony date and time · optional 4:5 family photo · name link + dates · place and ceremony type; "Starší oznámení". Notice page: photo beside the 32 px name, the ceremony `dl`, Od rodiny, Kondolence, QR. No numbers, no figures. |
| **Rakve, Květiny** | Built from Lidé: numbered figures (4:3 / 1:1) in four columns; items without a photo as numbered text cells; no photos at all → a numbered table. Květiny ends with the flowers phone. |
| **Pro účastníky, Pohřeb předem, Právní informace, privacy, 404** | Opening + nonstop block; Pro účastníky adds the hall photo as figure 01; the body with each `##` under a 3 px rule; Právní informace adds Mimosoudní řešení sporů, Reklamace and Dokumenty (`#dokumenty`) as ruled split blocks. **404**: "Chyba 404", one sentence linking the home page and Kontakt. |

### 3d.3 Visual system

- **Colour:** ground `#F7F7F4`, ink `#161616`, muted `#3F3F3F`, green `#1F4D45` (number, step numerals, picked row, high strip). Contrast in `docs/designs/lide-a-misto/README.md`.
- **Type:** Archivo (variable weight; the width axis is not shipped, s11 §10 point 8), 700 for headings, numbers and names, 400 for body 18 / 1.55; figure numerals bold and tabular.
- **Separation:** 3 px ink rules over blocks, 1 px rules between rows and under section heads; a 360 px label column on inner pages. No cards, tints, shadows or radius.

### 3d.4 Unique components (G only)

`EssayHeader`, `EssayFooter`, `NonstopRuleBlock`, `HighLineStrip`, `PublisherSentence`, `PageOpening`, `PeopleHero`, `NumberedFigure`, `PageFigure`, `PlaceGrid`, `PlaceList`, `PlacesSection`, `FirstStepsRow`, `ReceptionSection`, `PriceColumn`, `OfficeColumn`, `NoticesColumn`, `ServiceLinksSection`, `CatalogueLinkRow`, `DeathPlacePicker`, `PhaseSteps`, `StepBlock`, `FaqTopics`, `RuledProse`, `AnchorRow`, `ServiceSection`, `PriceGroupBlock`, `PriceItemRows`, `IncludedExcluded`, `NoticeRowList`, `NoticeDetailBlock`, `NoticeQrNote`, `OfficeHoursRuled`, `PhoneRows`, `TransportBlock`, `BillingDetails`, `PortraitGrid`, `PeopleNumberTable`, `CatalogueFigures`, `CatalogueNumberTable`, `AdrBlock`, `DocumentList`; layout `EssayLayout`.

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

| Dimension | A: Rodinná tradice | B: Důstojná jednoduchost | C: Noční linka | D: Plný přehled | E: Tichá krajina | G: Lidé a místo |
| --- | --- | --- | --- | --- | --- | --- |
| Header | centred letterhead, nav under the wordmark | left logo, right nav, sticky | the header is a sticky side rail (desktop); name row + "Obsah" (mobile) | name + highlighted nonstop box + separate Kancelář box; every page in one nav row under a 3 px rule | plain top bar, wordmark + text nav (Figtree 18), not sticky; "Menu" below 64 rem | wordmark + tradition subtitle, Archivo nav row, 1 px rule, not sticky; outlined "Menu" below 64 rem |
| Emergency CTA pattern | dark utility strip above the header (sticky on mobile) | header button + fixed mobile bottom action bar | the rail itself (desktop); panel under the name row (mobile); neutral ink line on notice pages | highlighted header box (2 px ink border); plain 1 px box on notice pages | ruled stamp line after the opening and at the top of the footer; muted sentence on notice pages | large green number under a 3 px rule in the hero column and the opening of every page; green strip under the header when high; footer column; muted sentence on notice pages |
| Mobile navigation | in-flow full-height list | dropdown under the sticky header | in-flow ruled list under the nonstop panel | "Rejstřík": every page as a ruled row with a count or from-price in mono | in-flow list of large light serif words, space only, stamp line under it | 24 px bold links between 1 px rules, then the nonstop block and Kancelář |
| Homepage order | hero → family story → services (prose) → first steps → visit us | hero with CTA tier → first steps → services index → contact info row → background | hero → (notices) → featured services → situation picker → family → office | no hero: next-steps → price summary → services → catalogues → people → notices → documents → FAQ row | text hero → stamp → steps → band → services → story → band → people → office | hero → places → steps → people → price · office · notices side by side |
| Hero | editorial, asymmetric, image or typographic panel | practical, text-first, CTA block, optional image after the CTAs | one text statement, one screen tall, never an image | none: the directory starts at once; the first cell's heading is the h1 | text only on the 12-col grid: light 72 px H1 cols 1–7, lead cols 9–12; never an image | text left + people photo bleeding right as figure 01; without it a 64 px H1 beside the nonstop block |
| Services IA | one long page with anchors, no detail pages | index plus detail pages | statement index + statement detail pages, other services as inline links | index table with prices + reference sheets | one long page of passages with anchors, broken by bands | one long page, 360 px label column, numbered service photos beside the text |
| Guidance format | narrative article, numbered sections, margin TOC | phased checklist, `<details>`, print styles | one step per statement, inverted picker with "vybráno", step tally | situation × step matrix; picked = one compact checklist | picker as a sentence of words; narrative timeline by phase | full-width ruled picker rows, picked row green; phases in the label column, green step numerals |
| Catalogues | editorial figure gallery, varied rhythm | uniform equal-height grid | ruled rows with small thumbnails, or ruled name columns | tables with small thumbnails; counts and thumbnails on home | one item per row, image cols 1–2, light 36 px name; names two per row without images | numbered figures in four columns; numbered text cells or table without images |
| Pricing | definition lists with dot leaders | tables with captions, reflowing on mobile | one statement per group, price as a 56 px heading, inclusion lists | package pair + one item table with a "Typ ceny" column, same on A4 | from-price as the H2 in cols 1–4, included / excluded lists, hairline table | label column with the from-price, 1 px-ruled table, inclusions side by side |
| About | long-form, prominent, drop cap | fact sheet first, story secondary | statements, one optional 4:3 photo | reference sheet, no photo | passages with one landscape band | photo essay of places with numbered captions and addresses, then people |
| Footer | three-column "rich letter" with emergency block | compact two-row footer | four columns on the rail colour + legal row with ADR | 3 px rule, four ruled columns, legal row | second stamp line, three columns, legal row | four 3 px-ruled columns (Nonstop, Kancelář, Na webu, Právní informace), legal row |
| Typography | classic serif display + humanist body | sans throughout (optional serif H1) | one newspaper grotesque, 400/700, 76 px H1 | highway-sign sans + mono for every number; H1 ≤ 40 px | light screen serif (Spectral 400) for headings and body; Figtree only for labels | one grotesque (Archivo), bold 700 headings and names, tabular figure numerals |
| Image use | larger, fewer, captioned, warm | minimal, functional, uniform crops | none on home; people, catalogues, notices only | thumbnails only (≤ 96 × 120) | full-bleed commissioned landscapes between sections, never in the first screen | documentary people and places with numbered captions; people photo in the first screen; numbered text when a photo is missing |
| Separation device | hairline rules, small caps labels | 1 px lines, tinted bands, 8 px rhythm | darkness and space; one rule on top of each statement | column rules and table rules; 3 px ink rules | photographs and space; two 1 px rules around the stamp line | 3 px ink rules over blocks, 1 px rules between rows; no tints or boxes |
| Colour mood | warm paper, umber | cool slate, forest | dark ground, warm off-white, amber for the number only | light grey or white ground, black ink, one highlight behind the number | mist + spruce-blue, or linen + olive-brown | off-white, near-black ink, one deep green |
| Notices listing | – (not supported) | – (not supported) | large-type agenda by date; neutral chrome | timetable: datum · čas · jméno · místo · obřad · přenos; neutral chrome | calm sentences, optional 3:4 family photo beside the name; neutral chrome | ruled rows: date · optional photo · name · place; neutral chrome, no figures |

## 6. Differentiation checklist (Phase 2 exit and Phase 4)

Every pair of templates passes only if **every** item is true (QA checks the structural items for each pair):

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
