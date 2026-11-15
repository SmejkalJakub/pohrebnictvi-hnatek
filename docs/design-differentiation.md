# Design differentiation: templates A–H (`rodinna-tradice`, `dustojna-jednoduchost`, `nocni-linka`, `rodinny-rozhovor`, `krok-za-krokem`, `zpravodaj`, `lide-a-misto`, `v-kapse`)

**Status:** Phase 1 contract, draft 1 (2026-11-05).

This document defines the templates **structurally**: page compositions, navigation, information architecture and component inventories. It also states the shared brand constraints and the checklist and scorecard used in Phase 2 QA and in the Phase 4 comparison.

Related: [template-contract.md](template-contract.md) · [content-contract.md](content-contract.md)

---

## 1. Shared design constraints (all templates)

- Conservative and trustworthy, suitable for a Czech funeral home. Calm, not sombre. Generous spacing, but never at the cost of finding the phone number.
- **Forbidden:** decorative gradients, glows, glassmorphism, carousels or sliders, parallax, motion that plays on load, loops or is triggered by scrolling to reveal content, animated counters, pulsing or glowing call buttons, icon-card grids as the primary structure, drop-shadow-heavy cards, stock portraits, realistic AI imagery, melodramatic grief imagery (wilting flowers, crying people, dark skies), invented testimonials or social proof, emotionally manipulative copy.
- **Allowed restraint devices:** hairline rules, small caps labels, quiet typographic hierarchy, neutral tinted bands, real photographs once approved.
- Both templates must look **complete with zero photographs** (U5), so no layout may depend on an image to make sense.
- Accessibility and technical invariants: template-contract §6.
- All fonts are self-hosted, OFL or similar licence, with **latin-ext** coverage verified using the pangram "Příliš žluťoučký kůň úpěl ďábelské ódy" in every weight used.

### 1.1 Motion and interaction policy (2026-11-13, design review §5)

The templates felt flat because nothing responded, not because nothing moved. Motion here is **feedback and state**, never decoration:

- **Allowed:** feedback motion (hover, press, focus, open/close, a state change such as a picked situation) of at most 200 ms; view transitions between pages and for the guide filter of at most 250 ms; smooth scrolling after an in-page link click (never for keyboard focus, which always jumps straight to the element).
- **Forbidden:** anything that plays on page load, loops, or is triggered by scrolling to reveal content; parallax; carousels; animated numbers; pulsing or glowing phone buttons (urgency styling is manipulative here); cursor effects; background video.
- **Always:** everything is off under `prefers-reduced-motion: reduce`; no information is conveyed by motion alone; hover is never the only cue; the page is complete with JavaScript off.
- **Shared baseline** (core `<SiteInteractions />`, template-contract §6): `tel:` links copy the number on desktop; the live office status ("Kancelář je teď otevřená, do 15:30."); smooth `<details>`; smooth scrolling for in-page link clicks; cross-document view transitions.
- **One signature interaction per template**, so behaviour is a further axis of difference:

| Template | Signature |
| --- | --- |
| A Rodinná tradice | the margin contents list follows your reading (scroll-spy) |
| B Důstojná jednoduchost | the office status as a sign (Otevřeno / Zavřeno) in the call tier |
| C Noční linka | the rail tracks you: "Krok n z N" and the current step in the rail |
| D Rodinný rozhovor | the question stays beside its answer while you read (sticky question column on desktop), and "Povězte mi víc" unfolds a longer answer in place; a field reached through "Potom" marks its question |
| E Krok za krokem | the thread follows your reading: the ring of the stop being read fills with the primary (scroll-spy on the thread, 200 ms, off under reduced motion); on the guide the picker also rewrites itself and the steps that do not apply fold away |
| F Zpravodaj | the live dateline: today's date (Europe/Prague, written in the browser and kept current) and the office status in the masthead; when the office opens or closes the status dot fills or empties in 200 ms (off under reduced motion); without JavaScript the dateline shows the place only |
| G Lidé a místo | numbers are links: a figure number and every reference to it light up together |
| H V kapse | the answer opens in place: the tapped row fills with the primary, its chevron turns and the answer settles beside the rows (desktop) or under the row (phone), 200 ms, never on page load, off under reduced motion; one answer open at a time (native `<details name>`) |

### 1.2 Templates as a guideline, the brand as the personalisation (2026-11-13)

A template fixes structure and behaviour; the client's brand board fixes colour, type and the mark (template-contract §8a). Each template interprets the same brand roles in its own way, so a brand never collapses two templates into one:

| Template | How it reads a brand |
| --- | --- |
| A | ground as the paper, primary in the utility strip and as the accent, the second colour only in ornaments (panel rules, numeral rings), brand display font for headings and captions |
| B | ground as the background, primary for the filled emergency buttons and the active nav, signage stays sans unless the brand insists |
| C | the night ground built from a deep version of the primary, the brand's second colour as the only signal (the number), light emblem as the mark |
| D | the primary becomes the deep answer field (the nonstop), the ground the cream fields and a soft tint of the primary the sand fields; the second colour stays an ornament; brand fonts replace the serif and the label sans |
| E | the ground as the cream page, a pale tint of the primary as the thread, the second colour (gold) as the rings and phase labels (text role only), the primary filling the ring being read, the nonstop strip and the Spojení number; the second surface as the sage band, the deep colour as the footer; brand display font for headings, body font for everything else |
| F | the ground as the newsprint paper, the ink for the type and every column and row rule, the primary for the masthead, the headlines and the one filled box (the nonstop box and the phone strip), the second colour only at its text role in the kickers; brand display font for the masthead and headlines, body font for the text |
| G | ground and ink as the documentary page, primary for the numbers and the nonstop line |
| H | ground as the page, the primary filling the open row, the nonstop pill and the number box, the second colour (text role) only for the small capital labels, the second surface tinting the step numerals and the blocks inside a panel, panels near-white, the deep colour as the footer; brand display font for the H1, panel headings and the big number, body font for the rest |

Without a brand profile, every template uses its own declared palettes and font pairs.

### 1.3 The guide is a calm guided list, not a checklist (2026-11-14)

The owner's verdict on the tickable checklists: tasteless for something done for a person who has just died. Ticking off, strike-through, "Hotovo 2 z 3" and a reset button turn grief into a to-do list. The guide (`/jak-postupovat/` and any first-steps block) instead **leads and reassures**: one step at a time, in plain sentences, with a calm word at the start and the end.

**Each step**
- number and title, then the summary;
- the step's short list (content field `checklist`, kept for data compatibility; the CMS calls it "Postup v krocích") as an `<ol>` of plain sentences via `guideSentence()` (`core/content/guidance-flow.ts`), headed by one of "Postupně", "Krok za krokem" or "Jak na to";
- the contact prompt, as today;
- a link to what follows: "Potom: {title}" or "Další krok: {title}" (`nextGuidanceStep()`); the last step ends with a closing line instead of "poslední krok".

**The page**
- one reassurance lead near the top, under the picker or the intro (template copy, the template's voice), on this line: "Nemusíte všechno vyřešit najednou ani si nic pamatovat. Stačí jít krok za krokem. Když si nebudete jistí, zavolejte nám a poradíme vám.";
- one closing line after the last step, for example "Tím máte to nejdůležitější za sebou. Se vším ostatním vám pomůžeme při sjednání pohřbu.", followed by the template's own contact block.

**Forbidden in the guide:** checkboxes or anything that looks like one; strike-through; completion counts ("Hotovo", "n z m bodů"), progress bars or reset buttons; task words ("úkol", "splněno", "odškrtnout", "zaškrtnout", "Co mít hotové"); urgency ("ihned", "nezapomeňte", red); promises the client has not made (callbacks, "vše vyřídíme za vás"). Orientation is fine: "Krok 3 z 6" says where you are, not what you have not done yet.

**"Potom" links** carry `data-guide-next`: with JavaScript, core moves to the next step without changing the URL fragment, so the situation filter stays applied, and marks the step `data-guide-arrived`.

**Allowed liveliness:** the step a "Potom" link leads to may show a quiet arrival mark through `:target, [data-guide-arrived]` (a background or rule that fades in, at most 200 ms, off under reduced motion); smooth scrolling to it; scroll-spy in a contents list; the situation filter's view transition. Templates keep their own form of the list (numerals, a thread line, a margin, a sentence), so the guide still differs between templates.

### 1.4 Homepage photography: real photos, not a menu (2026-11-14)

The owner's verdict: some homepages "feel like a restaurant menu": long columns of text items and no picture, or grey placeholder boxes. The client's real photos (the office, arrangements from its own flower workshop, its coffins) lived only on inner pages. Rules for every homepage:

- **Use the real photos.** `getHomeImagery()` (`@core/content/load.ts`) returns `place` (the /o-nas/ photo of the firm's own place), `flower` and `coffin` (the first real catalogue photos), each `{ image, title }` or null. It never returns placeholders, stock or generic images.
- **At least two real photos on the homepage** when the content has them, the first within the first two screens on desktop and phone. Each template places them in its own way (table below), so photography stays an axis of difference.
- **The catalogue section is pictures, not a list.** "Rakve a květiny" shows the flower and coffin photos as picture links with their names; the flower leads, the coffin is the quieter one.
- **The about section carries the place photo**, unless the hero already shows it. The same photo never appears twice on one page.
- **No grey placeholder where a real photo can stand in.** A hero image slot falls back to `place` when the page has no `heroImage`; with nothing real, the layout closes up rather than show a large grey box. A template keeps at most one prototype placeholder on the homepage, as a hint of what to photograph.
- **Respect the files.** Do not upscale: a photo shows at most at its pixel width (the office photo is 722 px, so at most about 560 CSS px at 1x and `widths` capped at the file width). Product shots on a flat ground are shown whole (`object-fit: contain` on a matching ground) or cropped with care: never cut off flowers or a coffin's end.
- **Break long text lists.** A homepage shows the featured services (at most four) with a link to all, not the whole service list.

| Template | Where the photos go |
| --- | --- |
| A Rodinná tradice | "O nás" with the office as a framed print and a serif caption, like a page from a family album; "Rakve a smuteční květiny" as two captioned prints |
| B Důstojná jednoduchost | hero keeps the office; "Rakve a květiny" as two uniform 4:3 picture cards |
| C Noční linka | photos as quiet moments in the dark column: the office in "O nás" at column width, flower and coffin side by side |
| D Rodinný rozhovor | the office beside "Kdo jste?"; "Jakou rakev a jaké květiny?" as two pictures at their own proportions, the flowers larger; drawing places close up unless a real drawing exists (the hero may keep its one placeholder) |
| E Krok za krokem | photos placed by time, at the thread's stops: the office beside "V následujících dnech" (sjednání), the first real flower and coffin photos as picture links at "Příprava pohřbu"; no hero photo, never full-bleed, no grey placeholders on the homepage |
| F Zpravodaj | press photos with a caption under a hairline: the office beside "Sjednání pohřbu" in the first-steps story (the first two screens on desktop and phone); the first real flower and coffin photos as the catalogue picture columns, whole on the paper ground; never a hero photo, never full-bleed |
| G Lidé a místo | no grey hero placeholder: the hero takes a real photo not already shown in the places index, or closes up |
| H V kapse | photos open with their answer: the office (16:9, rounded) at the top of "Chci sjednat pohřeb", the first real flower and coffin photos as two square picture links in "Květiny a rakve" (the coffin shown whole); the first answer on arrival has no photo, the nonstop number leads; no hero photo, no grey placeholders |

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
| **Jak postupovat** | Guided article. A letter-style "Kde blízký člověk zemřel?" panel (large serif answer links) filters the steps (template-contract §6, guided guidance). Guidance entries are numbered `<h2>` sections in reading order with a circled numeral; each leads with "Co udělat" (the summary), a short guided list (§1.3) and a framed phone link; the body text sits in a `<details>` "Přečíst podrobnosti", and a "Další krok" link moves on. On desktop there is a sticky in-page table of contents in the left margin, filtered and renumbered with the steps. A boxed aside "Potřebujete převoz hned?" appears after the first section. Updated 2026-11-09 for older readers. |
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
| **Jak postupovat** | **Phased guide**, opened by a grid of large signage buttons "Kde blízký člověk zemřel?" that filter the steps (template-contract §6, guided guidance). Guidance is grouped under phase headings ("V prvních hodinách", "V následujících dnech", "Příprava pohřbu", "Po pohřbu"), numbered by visible phase. Each entry is a compact block with its summary, an expandable `<details>` body, a ruled "Krok za krokem" list (§1.3), the `contactPrompt` button and a "Další krok" link. A "Vytisknout" print stylesheet is included. Updated 2026-11-09 for older readers. |
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

`StickyHeaderWithEmergency`, `MobileActionBar`, `PracticalHero`, `CtaTier`, `FirstStepsStepper`, `ServiceIndexList`, `ServiceDetailLayout`, `PhasedGuide`, `UniformCatalogueGrid`, `InfoRow`, `FactSheet`, `PriceTable`, `PrintStyles`.

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
| **Jak postupovat** | Inverted picker with the word "vybráno", "Zobrazeno N z M kroků", one step per statement ("Krok n z N · phase", a "Postupně" list with signal numerals (§1.3), body in `<details>`, emergency steps repeat the panel, "Další krok"), then Časté otázky by topic. |
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

## 3b. Template D: Rodinný rozhovor (the family conversation)

**Status:** built 2026-11-13 as template F (S9, `docs/notes/s9-rodinny-rozhovor.md`) from the approved round-2 design I in `docs/designs/rodinny-rozhovor/`; ported to main on 2026-11-14 as template **D**, replacing `dve-cesty` (owner's decision), and brought up to §1.1–§1.4: brand profile, the signature below, a guided list instead of checklists, the live office status and the homepage photos.

**Concept:** for a small family firm that wants the site to sound like the first phone call with them. Every heading is a question the family asks, answered in two or three plain sentences; the answer to the first question is the nonstop number. Full-bleed warm colour fields (cream and sand, deep clay only for the nonstop) do all the separating; commissioned pen drawings replace photographs, and the only photograph is the people.

### 3b.1 Chrome

- **Header on cream:** wordmark (or the dark logo) left, **at most five words** of navigation right (Jak postupovat · Oznámení · O nás · Ceník · Kontakt from core's nav); on phones the words wrap under the wordmark into rows of 44 px targets. **No menu button.** The only script is core's `<SiteInteractions />`; every page is complete without it. The other pages are reached from "Kdo jste?" (`/o-nas/`), page links and the footer line "Co tu ještě najdete?".
- **Nonstop:** home: the clay field "Kdo nám pomůže hned?" → "My." + `emergency.shortNote` → label + number 54 / 36 px; inner pages: a compact clay strip under the header ("Potřebujete nás hned? …" + 30 px number); every page ends with "Kdykoli potřebujete, volejte …". `emergencyEmphasis: high` puts the full clay field on top of every page.
- **Neutral form on notice pages:** sand strip "Oznámení zveřejňuje <brand>. Telefon nonstop <number>", two nav words (Oznámení · Kontakt), plain cream, no fields, drawings, clay or closing sentence. ⚖ L1 review.
- **Footer:** sand, question headings: Kde nás najdete · Kdy jsme v kanceláři (hours, office phone) · Kdykoli, i v noci (nonstop) · Dokumenty; "Co tu ještě najdete?"; legal row with ADR, Právní informace, privacy.

### 3b.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | Fields in `homepage.sections` order, alternating sand / cream after the clay hero: Kdo nám pomůže hned? → Co nás teď čeká? (guide lead, picker words) → Kolik to bude stát? (prices inside one sentence, VAT note) → Kdo jste? (O nás excerpt, the firm's own place photo, `getHomeImagery()`) → Jakou rakev a jaké květiny? (flower and coffin photos) → Co pro vás můžeme zařídit? → Kde vás najdeme? (address, hours under their own question). |
| **Jak postupovat** | "Co teď?" with the picker as a sentence of words; not picked: each first-hours step is a question ("Zemřel doma?"); picked: "Zemřel doma. Co udělat teď?" with calm guided lists ("Postupně", §1.3; picked word = small clay tag "(vybráno)"); then "Co v dalších dnech?", "Co po pohřbu?", and the FAQ as questions with open answers. A reassurance in italic opens the guide; each field ends with "Potom: <next question>" and the last with a closing line and the office number. |
| **Služby** | One question per service category ("Musí být pohřeb s obřadem?", "Kdo vyřídí úřady?", "Přijedete i v noci?", "Co bude s urnou?"); services are the answers with anchors; no detail pages. |
| **Ceník** | "Kolik to bude stát?" with the VAT note as the first answer; each package a question ("Kolik stojí pohřeb bez obřadu?") with the price inside the answer sentence and two lists; the other items in a borderless table "Co stojí jednotlivé věci?"; on A4 the fields become thin warm rules. |
| **Kontakt** | Kde vás najdeme? · Kdy můžeme přijít do kanceláře? (own field) · Jak se s vámi spojím? · Co když je to v noci? (own field). |
| **O nás** | "Kdo jste?" with the one people photo, the body as question fields, "Kdo vás přijme?" (`#lide`: 160 × 200 photos 2 × 2, or names in a row of four), "Co ještě u nás najdete?". |
| **Oznámení** | Plain cream: names in Alegreya 700, each followed by the ceremony sentence; notice page answers Kdy a kde · Na dálku · Od rodiny · Kondolence, QR. |
| **Rakve, Květiny, Pro účastníky, Pohřeb předem, Právní informace, privacy, 404** | Built from Lidé (catalogue rows on sand) and Pro účastníky (body `##` → question fields); 404 "Tuhle stránku jsme nenašli." / "Co hledáte?" with four links. |

### 3b.3 Visual system

- **`hlina` (default):** ground `#F6EFE4`, band `#E9D9C2`, deep `#5A2E22`, ink `#2B211C`, muted `#5E5047`, rule `#9A8670`. **`med`:** `#F7F1E3`, `#EBDDB8`, `#3F3A2A`, `#2A2619`, `#5C5543`, `#968A6C`. Contrast in `docs/notes/s9-rodinny-rozhovor.md`.
- **Type:** Alegreya 400/700 for all text (or Gelasio), Alegreya Sans 500 only for nav and labels; body 21 / 1.55, answer lead 30, H1 64 / 36, H2 44 / 30.
- **Separation:** full-bleed colour fields only. No lines between sections, no cards, boxes, shadows, rounded corners or icons; tables are borderless.
- **With a brand** (§1.2): the deep field takes the brand's primary, cream the ground, sand a tint of the primary; the brand's display font sets the questions at weight 600, its body font the answers and labels.
- **Signature** (§1.1): sticky questions beside long answers on desktop; "Povězte mi víc" disclosures; the arrival mark on the question a "Potom" link leads to.

### 3b.4 Unique components (D only)

`FamilyHeader`, `WordNav`, `ClayStrip`, `ClayAnswer`, `PublisherStrip`, `ClosingSentence`, `FamilyFooter`, `QuestionField`, `Drawing`, `FieldProse`, `StoryPhoto`, `PlaceWords`, `WhatNextField`, `CostField`, `WhoAreYouField`, `ArrangeField`, `FindUsField`, `HoursAnswer`, `WhoReceivesField`, `NoticeAskField`, `AskAgainField`, `ChooseField`, `GuidedStep`, `FaqAnswers`, `PackageQuestion`, `PlainItemTable`, `PeopleField`, `CatalogueField`, `NoticeNameList`, `NoticeAnswers`; layout `ConversationLayout`.

## 3c. Template E: Krok za krokem (step by step)

**Status:** built 2026-11-14 (S12, `docs/notes/s12-krok-za-krokem.md`) from direction E1 of the owner's canvas (`docs/designs/krok-za-krokem/`). It replaces `ticha-krajina` (Tichá krajina, built 2026-11-13). The owner retired Tichá krajina on 2026-11-14, together with D Dvě cesty.

**Concept:** the visitor never has to look for what comes next. **The home page is the guide itself.** One calm vertical thread runs from "V prvních hodinách" to "Po pohřbu", with a gold ring at every stop. Beside each ring is the content of that stop: what happens, a short numbered list, and the firm's part. Photographs stand at the stop they belong to. Prices and the family follow on a soft sage band, and a deep footer carries the nonstop line again. The aim is informative but designed, calm and simple.

### 3c.1 Chrome

- **Header, not sticky:**
  - the wordmark or logo on the left;
  - from 64 rem, the underlined text navigation in the middle, with the current page marked by a small filled ring (never a pill);
  - from 64 rem, the nonstop line on the right: the label small, the number large, one link of at least 44 px;
  - below 64 rem, an outlined **"Menu"** word button that opens the list in the flow, the words in the display face on hairlines.
- **Nonstop:**
  - Phones: a full-width primary **strip above the header** (label + number, one link).
  - Desktop: the header line, plus the white **Spojení card** beside the H1 on every page except Kontakt and notices. The card holds the nonstop label, the number at 36 px, the short note, a hairline, the live office status, and the address · office phone.
  - On phones, the home card shrinks to the office status and "Nonstop linka je k dispozici vždy."; inner pages drop the card.
  - `emergencyEmphasis: high` keeps the strip at every width.
- **Neutral form on notice pages:** ⚖ L1 review.
  - No strip and no card.
  - A muted sentence "Oznámení zveřejňuje <brand>." with an ink "Telefon nonstop <number>" link.
  - Navigation: Oznámení · Kontakt · Úvodní stránka.
  - No thread and no band.
  - The footer keeps hours, contact and legal.
- **Footer:**
  - the deep colour;
  - columns:
    - Nonstop, in its own section: label, number in the display face, short note;
    - Úřední hodiny kanceláře, in its own section with `[data-office-hours]`;
    - Kontakt: address, map, office and flower phones, e-mail;
    - Dokumenty;
    - Právní informace;
  - a hairline, then the brand mark and the legal row with ADR.
- **Options:**
  - `palette`: `salvej` (default) or `modrava`;
  - `fontPair`: `lora-source` (default) or `literata`;
  - `emergencyEmphasis`: `standard` or `high`;
  - no `heroVariant`: the opening is never a photo.

### 3c.2 Page compositions

**Home**, in order:

1. **The opening:** H1 and lead on the left, the Spojení card on the right.
2. **The guide intro:** a hairline, then "Co vás čeká, krok za krokem" with the reassurance lead beside it.
3. **The thread:** one stop per guidance phase, with the phase's first step standing for it.
   - Every stop shows the step's guided list, headed "Co je potřeba" (§1.3).
   - The first stop carries the nonstop line when the step asks for it, and "Zemřel jinde? v nemocnici · v domově pro seniory", which links into the filtered guide.
   - The "Sjednání" stop carries the office photo.
   - The "Příprava pohřbu" stop carries the featured ceremonies as three short notes, and the flower and coffin photos as links.
   - Further steps of a phase appear as "Také: …".
4. **The closing:** "Tím máte to nejdůležitější za sebou." and the link "Celý postup krok za krokem".
5. **The sage band:** "Kolik to bude stát" (the first item of up to three groups, the VAT note, the Ceník link) beside the family story (brand mark, O nás title, tradition, excerpt). The band counts once in the homepage order.
6. **Further sections** (services, people, contact-summary, catalogue-links, notices) follow on the axis.

**Jak postupovat**, in order:

1. The opening.
2. On the content column:
   - The picker as a sentence of words. The picked word gets a thick gold underline and "(vybráno)".
   - When a place is picked, the picker is rewritten into a sentence: "Blízký člověk zemřel doma. Ukazujeme 6 kroků ze 7. Zobrazit vše".
   - The reassurance lead.
3. **Every step as a stop on the thread:**
   - the phase in the label column;
   - "když člověk zemřel …" for steps tied to a place;
   - the summary and the guided list;
   - `<details>`;
   - the contact prompt;
   - "Potom: …" with `data-guide-next`.
4. The closing line and the office phone.
5. The FAQ as an axis section.

**Služby:** one long page with anchors, no detail pages.

- Each service is an axis section: the title in the label column beside its ring, the text and inclusion lists in the content column.
- "Další služby" holds the rest.

**Ceník:**

- An axis section per group: the group label and from-price in the label column, the inclusion lists and hairline table in the content column.
- The VAT note.
- A4 print with a letterhead.

**Kontakt:** no card. Axis sections, in order:

1. Kancelář.
2. Úřední hodiny: its own heading, the status and a hairline table.
3. Telefony.
4. Převoz zesnulých: its own emergency block.
5. Kdo vás přijme (`#lide`): 120 px portraits beside the names.
6. The body.

**Rakve, Květiny:**

1. The body first.
2. The catalogue on the content column:
   - photos shown whole on the ground, with white product grounds multiplied away;
   - three per row (two on phones);
   - the name in the display face, the type or code in gold capitals.
3. "Kam zavolat".

**O nás, Pro účastníky, Pohřeb předem, Právní informace, privacy, 404:**

- Axis sections from the body's `##`.
- O nás opens with the firm's own photo (`heroImage`) on the content column.

**Oznámení:**

- Neutral chrome, no thread, no band.
- Calm sentences with the name, dates and the ceremony sentence.
- The notice page in plain sentences, with the QR code.

### 3c.3 Visual system

**Palettes.** Contrast is in `docs/notes/s12-krok-za-krokem.md`; all text is at least 5.8:1.

| Role | `salvej` (sage) | `modrava` |
| --- | --- | --- |
| ground | `#F7F5EF` | `#F5F6F3` |
| ink | `#1B2620` | `#1C232A` |
| muted | `#4E5C55` | `#4D5862` |
| primary | `#2F5446` | `#2E4A5E` |
| ornament (rings) | `#B08D4E` | `#A98A5A` |
| ornament text | `#75592A` | `#6F562A` |
| thread | `#C3CEC7` | `#C2CCD3` |
| band | `#E5EAE4` | `#E3E8EC` |
| deep | `#213A31` | `#1F3140` |
| card | `#FFFFFF` | `#FFFFFF` |

**Type:**

- Headings in Lora 500, or Literata.
- The closing line in Lora italic.
- Everything else in Source Serif 4 at 400 and 600; there is no sans.
- Body at 19 px (18 px on phones), line height 1.6.
- Phase labels in small letter-spaced gold capitals.

**Axis:**

- From 64 rem, every page uses a label column of 230 px, a ring column of 60 px, and a content column of up to 820 px.
- Rings are 24 px with a 2 px gold border.
- The thread is 2 px wide and runs **behind** the rings (owner, 2026-11-14).

**Separation:**

- The thread, one hairline before the guide intro, the sage band, and the deep footer.
- One card (Spojení).
- No shadows, no icons, no full-bleed photos.

### 3c.4 Unique components (E only)

`ThreadLayout`, `ThreadHeader`, `ThreadNav`, `ThreadFooter`, `NoticePublisherLine`, `ThreadOpening`, `AxisSection`, `HomeThread`, `HomeBand`, `StopPhoto`, `PlaceSentence`, `GuideThread`, `ThreadStop`, `ProsePassages`, `ServicesPassage`, `ServicePassages`, `PeoplePassage`, `OfficePassage`, `CatalogueWords`, `CatalogueRows`, `NoticesCountLine`, `QuestionsPassage`, `InclusionLists`, `PriceGroupPassage`, `HairlineItems`, `OfficeHoursHairlines`, `TransportPassage`, `PeoplePortraitRows`, `NoticeSentences`, `NoticeDetailText`, `NoticeQrPassage`, `AdrPassage`, `DocumentLines`.

## 3e. Template F: Zpravodaj (the local newsletter)

**Status:** built 2026-11-15 (S13, `docs/notes/s13-zpravodaj.md`) from direction F of the owner's round 3 canvas (`docs/designs/zpravodaj/`), chosen together with H "V kapse".

**Concept:** a calm local newsletter from the firm. **The home is a front page set in columns:** a masthead with a live dateline, a double rule and the section names in letter-spaced capitals; a lead article with an italic standfirst and a drop cap; a side column with the one green nonstop box, "Kancelář dnes" and the page's own index; the first steps as the main story with the office as a press photo; short notes, picture columns and briefs between rules in ink; a colophon "Vydává …". Never a price list or a menu: every block is a short article.

### 3e.1 Chrome

- **Masthead, not sticky:**
  - a dateline row on a hairline: the place (the office's city) · today's date (live), the office status (core, short form), and from 64 rem the nonstop line on the right;
  - the title: the brand mark and the brand name in the display face (66 px centred on the home; one line, left, 34 px on inner pages), the tradition wording in italic on the home;
  - from 64 rem the section names in letter-spaced capitals, centred, between a 3 px double rule and a 1 px rule; the current page in the primary with a 2 px rule under it;
  - below 64 rem a "Menu" word button at the dateline's right opens the names in the flow, in the display face on hairlines, then the in-page items (Lidé, Časté otázky, Dokumenty).
- **Nonstop:**
  - Phones: a full-width primary **strip under the masthead's double rule** (the label in small capitals above the number).
  - Desktop: the dateline line on every page, and the **nonstop box** (primary fill) at the top of the home's side column.
  - The colophon repeats it as one line in its own block.
  - `emergencyEmphasis: high` keeps the strip at every width (one line on desktop).
- **Neutral form on notice pages:** ⚖ L1 review. No strip, no box, no office status; a muted sentence "Oznámení zveřejňuje <brand>." with an ink "Telefon nonstop <number>" link; navigation Oznámení · Kontakt · Úvodní stránka; the colophon without the nonstop line, documents or mark.
- **Colophon:** on the ground under a double rule (never a dark footer): Kancelář · Úřední hodiny kanceláře (their own section with `[data-office-hours]`) · Na webu, between column rules; then "Vydává <legal name>, sídlo, IČO, register entry, ADR" with the brand mark; then the nonstop line. The home and Kontakt leave out the Kancelář and hours columns (`officeOnPage`).
- **Options:** `palette` `papir` (default; newsprint paper, ink-blue primary, rust kickers) or `grafit` (grey paper, black-green); `fontPair` `spectral-source` (default) or `playfair-source`; `emergencyEmphasis` `standard` / `high`; no `heroVariant`.

### 3e.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | Every section is a direct child of `<main>`; from 64 rem `<main>` is a three-column grid (dense flow): **wide** sections (hero, next-steps, services, catalogue-links, people) take two columns, **side** sections (contact-summary, price-summary, family-story, notices) the third behind a column rule in ink; contact-summary runs down beside the first two wide sections; rows on 1 px rules in ink. Phones: one column in the client's order. Default order: `hero` (the lead article: H1, the home lead as the italic standfirst, the home body in two columns with a drop cap) · `contact-summary` (nonstop box, "Kancelář dnes" with the live status, hours, address and phone, "V tomto přehledu") · `next-steps` ("První kroky": "Když zemře blízký člověk: co udělat v prvních hodinách", the reassurance standfirst, the first-hours steps as run-in paragraphs in two columns with their guided lists and the nonstop line, then the office photo beside the first "V následujících dnech" step, then "Dál v průvodci" briefs, then the closing line) · `services` ("Jak se můžete rozloučit": up to three ceremonies as notes between column rules) · `catalogue-links` (Květiny and Rakve as picture columns with the page leads) · `price-summary` (the first item of up to three groups on hairlines, VAT note, Ceník) · `family-story` (tradition as the kicker, O nás title, excerpt). |
| **Jak postupovat** | Headline; the picker sentence and the reassurance standfirst; each phase as a headline under a double rule, its steps as short articles side by side in two columns behind a column rule ("Krok n" as a CSS counter, so it stays right under the filter; "Postupně"; `<details>`; "Potom: …" with `data-guide-next`, the arrived step marked by a primary rule along its top); a phase with no step for the picked place folds away; closing line and office phone; then Časté otázky. |
| **Služby** | **One page with anchors** (no detail pages): "V tomto přehledu" as contents in ruled columns, one section per featured service (summary as the standfirst, body, inclusions and "Co je v ceně" in the side column), "Další služby". |
| **Ceník** | Headline with the VAT note, demo notice, print hint; per group a section with hairline tables and inclusions; VAT note again. A4 print in ink. |
| **Kontakt** | Kancelář with the office photo (`secondaryImage`) as a press photo in the side column; Úřední hodiny (status, hairline table); Telefony; Převoz zesnulých (its own emergency block); Kdo vás přijme when people are on. |
| **Rakve, Květiny** | A picture page over the whole width: four per row (three from 48 rem, two on phones) between column rules and row hairlines, every photo whole at its own proportions (product photos on white multiplied onto the paper); names in the display face, the detail as a kicker. Květiny ends with the flowers phone. |
| **O nás, Pro účastníky, Pohřeb předem, Právní informace, privacy, 404** | Headline + sections under rules in ink on the article measure; Právní informace adds Mimosoudní řešení sporů, Reklamace and Dokumenty. **404**: "Chyba 404" kicker, one sentence. |
| **Oznámení** | Neutral chrome; calm sentences with the name, dates and ceremony sentence; the notice page with the QR code. No columns, no box. |

### 3e.3 Visual system

| Role | `papir` | `grafit` |
| --- | --- | --- |
| ground | `#F6F3EC` | `#F4F4F1` |
| ink (type and column rules) | `#1B1D1F` | `#18191A` |
| muted | `#45494D` | `#44474A` |
| primary (headlines, box) | `#22405C` | `#2C3A31` |
| kicker text | `#84461F` | `#6A5424` |
| fine rule | `#CBC4B5` | `#C9C9C2` |

- **Type:** Spectral 600 (700 for the masthead) or Playfair Display; Source Serif 4 400/600 and 400 italic for text; body 18 px (17 px on phones), line height 1.6; standfirsts italic 21 / 19 px; kickers 13 px letter-spaced capitals; drop caps in the display face.
- **Separation:** double rules (masthead, colophon, guide phases), 1 px ink rules between columns and rows, fine rules inside a column. One filled box (nonstop). No shadows, radius, tints or icons.

### 3e.4 Unique components (F only)

`GazetteLayout`, `Masthead`, `SectionNav`, `Colophon`, `NoticeImprint`, `PageHeadline`, `ColumnSection`, `FrontLead`, `DeskAside`, `FirstStepsStory`, `FarewellNotes`, `CatalogueTeasers`, `PriceBrief`, `PublisherNote`, `PressPhoto`, `WherePicker`, `GuideArticle`, `GuideEntry`, `ProseColumns`, `ServiceArticles`, `PeopleBrief`, `PeopleColumns`, `NoticesBrief`, `CataloguePlates`, `ReadersQuestions`, `InclusionBriefs`, `PriceGroupColumn`, `ColumnItems`, `OfficeHoursColumn`, `TransportColumn`, `NoticeListing`, `NoticeDetailColumn`, `NoticeQrBox`, `AdrImprint`, `DocumentIndex`.

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
| **Jak postupovat** | "Kde blízký člověk zemřel?" as full-width 52 px rows between 1 px rules; the picked row fills green with "(vybráno)" (`:has(:target)`, no JS); phases as small caps in the 360 px label column, steps with green numerals under 3 px rules, a "Krok za krokem" list (§1.3), `<details>`. Then Časté otázky by topic. |
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

## 3e. Template H: V kapse (in your pocket)

**Status:** built 2026-11-15 (S14, `docs/notes/s14-v-kapse.md`) from the owner's canvas direction "V kapse" (`docs/designs/v-kapse/`).

**Concept:** the site as an app in your pocket. The home asks one question, "S čím vám můžeme pomoct?", and offers large rounded rows with one-line hints; the visitor taps a row and the short answer opens in place. On desktop the open answer stands in a white rounded panel beside the rows (master–detail); on the phone it opens under its row (accordion). One answer is open at a time, the first ("Někdo právě zemřel") on arrival. Every inner page speaks the same language: rows that open (guide steps, services, questions) and white rounded panels (contact, prices, catalogues).

### 3e.1 Chrome

- **Header, not sticky:** the brand mark and wordmark (or the logo); from 48 rem a short row of words (Jak postupovat, Služby, Ceník, Oznámení, Kontakt); the nonstop pill on the right on every width ("Nonstop +420 …", filled with the primary, 44 px tall). Below 30 rem the mark stands alone for the name so the mark and the pill share one line. `emergencyEmphasis: high` pins the header.
- **No menu button:** every page ends with "Všechny stránky", every page as a large rounded row (one column on phones, two or three from 48 rem); the current page is the filled row.
- **Neutral form on notice pages:** no pill; a muted publisher sentence with the "Telefon nonstop" link; the reduced words (Oznámení · Kontakt · Úvodní stránka) in the header on every width and as the rows at the end; a footer without the nonstop column.
- **Footer:** the deep colour; nonstop column, Úřední hodiny, Kontakt, Dokumenty, Právní informace; mark + legal row with ADR.

### 3e.2 Page compositions

| Page | Composition |
| --- | --- |
| **Home** | `<main>` is the grid. `hero`: small label (the home title), H1 "S čím vám můžeme pomoct?", one line. Then one `<details name="kapsa">` row per section in the client's order: `next-steps` gives "Někdo právě zemřel" (open on arrival: "Teď hned", the first first-hours step as three numbered sentences, the nonstop number box, the place chips, the full guide link) and "Chci sjednat pohřeb" (the office photo, the first first-days step with its guided list, live office status, address, office phone); `services` "Jak se můžeme rozloučit" (up to four featured services as tinted blocks); `price-summary` "Kolik to bude stát" (the first price large, two more rows, VAT note); `catalogue-links` "Květiny a rakve" (flower and coffin photos as picture links); `contact-summary` "Kde vás najdeme" (the hint is the street and the live status; the answer has the status, address and map, the hours block, phones, e-mail); `people` and `notices` as rows when on. `family-story` closes the left column as one line with "O nás". A row with no content for the client is left out. |
| **Jak postupovat** | Title; a panel with "Kde blízký člověk zemřel?" as rounded chips (`:has(:target)` filter, picked chip filled with "(vybráno)", the panel rewrites into "Blízký člověk zemřel doma. Ukazujeme…"), and the reassurance lead; one row per step (numeral in a soft circle, title, phase) opening to: when it applies, the summary, "Postupně" guided list (§1.3), "Podrobnosti", the contact prompt (the number box for emergency steps), "Potom: …" (`data-guide-next`, core opens the next row); the first open; then the closing panel and Časté otázky as rows. |
| **Služby** | One page of rows (no detail pages), featured first, one open at a time; `/sluzby/#<id>` targets an anchor inside the answer, so the browser opens that row by itself. |
| **Ceník** | Title with the VAT note; panels: intro, each group with inclusions, "Jednotlivé položky" as a hairline table. A4 print stays ink only. |
| **Kontakt** | Panels: Kancelář, Úřední hodiny (`data-office-hours`, live status), Telefony, Převoz zesnulých (its own emergency block with the number box), Kdo vás přijme. |
| **Rakve, Květiny** | The catalogue in one panel, two photos per row on phones, more on desktop; Květiny ends with the flowers phone. |
| **O nás, Pro účastníky, Pohřeb předem, Právní informace, privacy, 404** | Title, the photo when set, the body as one panel per `##`. |
| **Oznámení** | Neutral: plain panels with the ceremony sentences; the notice page in plain panels. No rows, no promotional parts. |

### 3e.3 Visual system

- **Colour:** default `mech`: ground `#F4F2EC`, ink `#18231E`, muted `#475550`, primary `#23463A` (open row, pill, number box), labels `#6F5826`, soft `#E3E9E3` (numerals, picked chips), panels white with a `#E3DDD2` hairline, deep footer `#1D3329`. `bridlice`: the same roles in slate blue. All text pairs at least 4.5:1.
- **Type:** Figtree 400/500/600 throughout (or Spectral 500 headings with `spectral-figtree`); H1 32 / 44 px, panel headings 26 / 32 px, row titles 18 / 20 px at 600, hints 14 / 15 px.
- **Shape:** rows radius 16 px, min height 64 / 72 px; panels radius 16 / 24 px; chips and the pill fully rounded. No shadows, no icons (the chevrons are drawn borders), no gradients.

### 3e.4 Unique components (H only)

`PocketHeader`, `PocketNav`, `PocketFooter`, `PocketPublisher`, `PocketTitle`, `PocketPanel`, `PocketRow`, `PocketNow`, `PocketVisit`, `PocketFarewell`, `PocketPrice`, `PocketGoods`, `PocketWhere`, `PocketPhoto`, `PocketPlacePicker`, `PocketGuide`, `PocketStep`, `PocketQuestions`, `PocketProse`, `PocketServices`, `PocketInclusions`, `PocketPriceGroup`, `PocketPriceRows`, `PocketHours`, `PocketTransport`, `PocketPeople`, `PocketCatalogue`, `PocketNoticeList`, `PocketNoticeDetail`, `PocketNoticeQr`, `PocketAdr`, `PocketDocuments`; layout `PocketLayout`.

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

| Dimension | A: Rodinná tradice | B: Důstojná jednoduchost | C: Noční linka | D: Rodinný rozhovor | E: Krok za krokem | F: Zpravodaj | G: Lidé a místo | H: V kapse |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Header | centred letterhead, nav under the wordmark | left logo, right nav, sticky | the header is a sticky side rail (desktop); name row + "Obsah" (mobile) | wordmark + at most five nav words, wrapping, no button | wordmark, underlined nav, nonstop line right (desktop); outlined "Menu" below 64 rem; not sticky | dateline row (place · live date · office status · nonstop), centred masthead with mark, section names between a double rule and a hairline; compact masthead on inner pages; "Menu" in the dateline below 64 rem; not sticky | wordmark + tradition subtitle, Archivo nav row, 1 px rule, not sticky; outlined "Menu" below 64 rem | mark (alone on narrow phones) + wordmark, a short row of five words from 48 rem, the nonstop pill right on every width; no menu button; not sticky (sticky when high) |
| Emergency CTA pattern | dark utility strip above the header (sticky on mobile) | header button + fixed mobile bottom action bar | the rail itself (desktop); panel under the name row (mobile); neutral ink line on notice pages | the answer to the H1 on a clay field (home), a compact clay strip (inner pages), the closing sentence of every page; sand publisher strip on notices | primary strip above the header (phones); header line + white Spojení card beside the H1 (desktop); deep footer column; muted sentence on notice pages | nonstop line in the dateline (desktop); the green nonstop box at the top of the home's side column; full-width green strip under the masthead (phones); one colophon line; muted sentence on notice pages | large green number under a 3 px rule in the hero column and the opening of every page; green strip under the header when high; footer column; muted sentence on notice pages | a filled pill in the header on every page and width; the first answer's primary number box on home; the number box on Kontakt and in emergency guide steps; deep footer column; muted sentence on notice pages |
| Mobile navigation | in-flow full-height list | dropdown under the sticky header | in-flow ruled list under the nonstop panel | none: the same words wrap into rows of 44 px targets | in-flow list of display-face words on hairlines | in-flow list of display-face names on hairlines, then the in-page items as a quieter row | 24 px bold links between 1 px rules, then the nonstop block and Kancelář | none in the header: every page ends with "Všechny stránky", all pages as large rounded rows |
| Homepage order | hero → family story → services (prose) → first steps → visit us | hero with CTA tier → first steps → services index → contact info row → background | hero → (notices) → featured services → situation picker → family → office | hero (clay) → next steps → price sentence → who you are → services → where to find you; each a question | hero with card → the thread (next-steps, the guide itself) → sage band (price + family) | lead article → office column → first-steps story → ceremonies → catalogue pictures → prices · family note, set in three newspaper columns | hero → places → steps → people → price · office · notices side by side | the question (hero) → one row per section in the client's order (next-steps gives two rows) → the family line; the answers open in place |
| Hero | editorial, asymmetric, image or typographic panel | practical, text-first, CTA block, optional image after the CTAs | one text statement, one screen tall, never an image | clay field: question H1, the nonstop number as its answer, optional pen drawing | H1 + lead left, white Spojení card right (nonstop, office status, address); never an image | lead article: H1, italic standfirst, the home body in two columns with a drop cap; the office column beside it; never an image | text left + people photo bleeding right as figure 01; without it a 64 px H1 beside the nonstop block | a label, the H1 question "S čím vám můžeme pomoct?" and one line; the open answer panel stands beside it (desktop) |
| Services IA | one long page with anchors, no detail pages | index plus detail pages | statement index + statement detail pages, other services as inline links | one page of questions by category; services as answers with anchors | one long page of axis sections with anchors | one page with anchors: ruled contents columns, then one article per service with a side column | one long page, 360 px label column, numbered service photos beside the text | one page of rows; each service opens in place under its anchor |
| Guidance format | narrative article, numbered sections, margin TOC | phased guide, `<details>`, print styles | one step per statement, inverted picker with "vybráno", step tally | "Co teď?": picker sentence; Co udělat teď / Co v dalších dnech / Co po pohřbu as calm guided lists, "Potom" links, a reassurance and a closing line | the whole guide on one vertical thread with gold rings, the phase in the label column; picker sentence; "Potom" links | picker sentence; phases as headlines under double rules, steps as short articles two per row ("Krok n" counter); "Potom" links | full-width ruled picker rows, picked row green; phases in the label column, green step numerals | place chips in a panel; one row per step (numeral, title, phase) opening to its guided list; "Potom" opens the next row |
| Catalogues | editorial figure gallery, varied rhythm | uniform equal-height grid | ruled rows with small thumbnails, or ruled name columns | rows on a sand field, names first, images optional | whole photos three per row on the content column, names in the display face | full-width picture page, four per row between column rules, whole photos at their own proportions | numbered figures in four columns; numbered text cells or table without images | photos inside a white panel, two per row on phones |
| Pricing | definition lists with dot leaders | tables with captions, reflowing on mobile | one statement per group, price as a 56 px heading, inclusion lists | price inside the answer sentence, two lists, borderless table | axis sections: group + from-price in the label column, lists and hairline table in the content column | sections with hairline tables; home brief in the side column | label column with the from-price, 1 px-ruled table, inclusions side by side | white panels per group; on home the first price large in the answer panel |
| About | long-form, prominent, drop cap | fact sheet first, story secondary | statements, one optional 4:3 photo | "Kdo jste?": one people photo, people by what they do for you | the firm's own photo on the content column, then axis sections | headline and sections on the article measure; home note in the side column | photo essay of places with numbered captions and addresses, then people | the firm's photo and the body as stacked panels |
| Footer | three-column "rich letter" with emergency block | compact two-row footer | four columns on the rail colour + legal row with ADR | closing sentence, then a sand footer with question headings | deep colour: nonstop column, hours, contact, documents, legal; mark + legal row | colophon on the ground under a double rule: Kancelář · hours · Na webu between column rules, "Vydává …" imprint, nonstop line | four 3 px-ruled columns (Nonstop, Kancelář, Na webu, Právní informace), legal row | "Všechny stránky" rows, then the deep footer (nonstop, hours, contact, legal) |
| Typography | classic serif display + humanist body | sans throughout (optional serif H1) | one newspaper grotesque, 400/700, 76 px H1 | calligraphic book serif for all text, its sans only for nav and labels | Lora 500 (or Literata) headings, Source Serif 4 for everything else; gold letter-spaced phase labels | Spectral (or Playfair Display) masthead and headlines, Source Serif 4 text, italic standfirsts, drop caps, letter-spaced kickers | one grotesque (Archivo), bold 700 headings and names, tabular figure numerals | one friendly sans (Figtree) or Spectral headings; 600 row titles; letter-spaced small labels |
| Image use | larger, fewer, captioned, warm | minimal, functional, uniform crops | none on home; people, catalogues, notices only | the firm's own place photo and catalogue photos on home; commissioned pen drawings in margins when they exist; one photo of the people | photos placed by time at the thread's stops (office, flowers, coffin); catalogues; never a hero or full-bleed photo | press photos with ruled captions: office in the first-steps story, flowers and coffins as picture columns; never a hero or full-bleed photo | documentary people and places with numbered captions; people photo in the first screen; numbered text when a photo is missing | inside the answers only: office, one flower and one coffin photo on home; catalogues in panels |
| Separation device | hairline rules, small caps labels | 1 px lines, tinted bands, 8 px rhythm | darkness and space; one rule on top of each statement | full-bleed colour fields only; no lines | the thread and its rings; one hairline; the sage band; the deep footer | double rules, 1 px ink column and row rules, fine rules inside columns; one filled box | 3 px ink rules over blocks, 1 px rules between rows; no tints or boxes | rounded rows and white rounded panels with a hairline; the primary fill marks the open row |
| Colour mood | warm paper, umber | cool slate, forest | dark ground, warm off-white, amber for the number only | cream, sand and deep clay (or honey and olive) | cream, sage and forest green with gold rings (or blue-grey) | newsprint paper, ink, one deep ink-blue (or black-green), rust kickers | off-white, near-black ink, one deep green | cream ground, white panels, moss green (or slate blue) for the open row and the pill |
| Notices listing | – (not supported) | – (not supported) | large-type agenda by date; neutral chrome | names with the ceremony sentence; neutral chrome | calm sentences, optional 3:4 family photo beside the name; neutral chrome | calm sentences; neutral chrome, no columns or box | ruled rows: date · optional photo · name · place; neutral chrome, no figures | plain panels with the ceremony sentence; neutral chrome, no rows |

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
