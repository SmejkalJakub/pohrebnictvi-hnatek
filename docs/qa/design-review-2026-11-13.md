# Design review: templates A, B, C, D, E, G (2026-11-13)

**Scope.** All six built templates, judged through their Hnátek prototypes (`clients/hnatek`, `-b`, `-c`, `-d`, `-e`, `-g`), built in prototype mode at commit `e73289b`. 45 pages were captured at 1280 × 800 and 375 × 667, as a first screen and as a full page. The guide picker, checkboxes, hover states and keyboard focus were tested in Playwright. Computed styles were read from every page to measure motion and hover.

**Questions asked:** Do the templates look finished and presentable? Do they read as AI-generated? Are they different enough from each other? Why do they feel flat, and what should change?

Screenshots referenced below are in [screens/design-review-2026-11-13/](screens/design-review-2026-11-13/).

---

## 1. Verdict in brief

1. **Two templates are not presentable today because of one shared bug.** E's coffin and flower catalogue breaks names letter by letter ("Rak / ev / PA / 2097"), and B's home "O nás" block runs one word per line. Both come from `PlaceholderMark` dropping its wrapper element once content is no longer a placeholder (§2.1). The same trap sits in **12 more places**, mostly in G. They look fine now only because their content is still a placeholder, and they will break **when the client approves the text**, which is the worst moment for it.
2. **C (Noční linka) and D (Dvě cesty) are clearly distinct and look designed.** A, B, E and G converge, especially on phones: at 375 px they all show the same stack of logo, boxed "Menu", four-line H1, lead and number block ([all-home-375-fold.png](screens/design-review-2026-11-13/all-home-375-fold.png)). Four of the six (A, D, E, G) also share the same inner-page skeleton: a heading in a left label column with the text on the right, under hairline rules.
3. **"Flat" is measurable, not a matter of taste.** Across 45 pages there are **0 CSS transitions, 0 animations and 0 view transitions**. Each site has only 2–8 `:hover` rules. A's main navigation has **no hover state at all**, and in C and E a hover only thickens the underline from 1 px to 2 px. The design contract (design-differentiation §1) forbids "scroll animations" and the templates went further: they author *no* motion at all. The only motion CSS in the repo is the reduced-motion reset, which switches off motion that doesn't exist.
4. **The AI-generated feel comes from sameness, not from any one element.** Every section has the same shape (small eyebrow label, heading, two lines, underlined link), every template uses the same "rules, not boxes" vocabulary, all six prototypes have the same H1, logo and the one office photo, and nothing on the page responds to the visitor. The shared ban list (no cards, shadows, gradients, icons or motion) leaves type, colour and hairlines as the only levers, so the templates drift towards the same editorial-minimal corner.
5. **Recommendation:** fix the P0 bugs, then make the templates feel alive through **feedback and useful live state**, not decoration. The first is motion that answers what the visitor does. The second is things like "the office is open now", a guide checklist that remembers ticks, copy-number on desktop, and an animated path switch. Give each template **one signature interaction** that the others don't have, so behaviour becomes a new axis of difference. Amend the contract's motion rule rather than ignore it (§5.4).

### Scorecard (1–5)

| | A Rodinná tradice | B Důstojná jednoduchost | C Noční linka | D Dvě cesty | E Tichá krajina | G Lidé a místo |
| --- | --- | --- | --- | --- | --- | --- |
| Presentable today | 3.5 | 2.5 (bug) | 4 | 3.5 | 2 (bug, no photos) | 3 |
| Distinct from the others | 3 | 2 | 5 | 5 | 2.5 | 2.5 |
| Feels alive / responsive | 1 | 1.5 | 1 | 1.5 | 1 | 1 |
| Reads as hand-designed | 3.5 | 2 | 4 | 4 | 3 | 3 |

---

## 2. P0: fix before anyone sees the prototypes

### 2.1 `PlaceholderMark` drops its wrapper and class when inactive

`core/components/PlaceholderMark.astro` renders `<Tag class={className}>…</Tag>` only while `active`. Otherwise it renders a bare `<slot />`, so the `class` goes with it. Any template that styles that wrapper as a layout element loses the layout once the content is approved. The children then become separate grid items.

- **Visible now:**
  - E `CatalogueQuietRows.astro:71` (`item-text`): name, label and summary each take one of the 12 grid columns, so every coffin and flower name breaks mid-word. ([E-rakve-1280-fold.png](screens/design-review-2026-11-13/E-rakve-1280-fold.png))
  - B `pages/index.astro:97` (`md:col-span-9`): the "O nás" excerpt splits into 3 narrow columns, one word per line. ([B-home-1280-full.png](screens/design-review-2026-11-13/B-home-1280-full.png), bottom)
- **Latent: they will break when the placeholder is cleared:**
  - B `UniformCatalogueGrid.astro:48`.
  - G `ReceptionSection:42`, `ServiceSection:31`, `NoticeDetailBlock:44`, `PageOpening:46`, `StepBlock:41`, `FaqTopics:37`, `PlacesSection:47`, `NoticeRowList:75` and `CatalogueNumberTable:18`.
  - A `FigureGallery:40`.
  - E `NoticeSentences:45` and `PeoplePortraitRows:39`.
- **Fix in core, once:** when `class` (or `as`) is passed, always render the wrapper. Only the label and `data-placeholder` depend on `active`. Add a template test that renders each of these components with `placeholder: false` and checks that the wrapper class is still there. QA never caught this because every fixture keeps its content as a placeholder.

### 2.2 Other visible defects

| Template | Defect | Where |
| --- | --- | --- |
| E | The nav wraps at 1280 with **"Kontakt" alone on a second line**. There are 10 items, and "Lidé" and "Časté otázky" are only anchors. | header, every page |
| E | With no commissioned landscapes, the home page has two 380 px grey "Zástupný obrázek" bands. E is the one template whose concept *is* the photographs, so it should not be shown to a client until at least two real landscapes exist. | home, Služby, Kontakt, O nás |
| D | In the stone half, the service descriptions are **right-aligned**, which gives them a ragged left edge and makes them hard to read. Set them left, under the link. | home split |
| D | The "Nonstop převoz zesnulých" label sits flush under the half's H2, with no space between them. | home navy half |
| G | **Grids with holes:** the places grid shows 2 photos plus a text cell ("04", with "01" being the hero), the first steps fill 2 of 3 columns, and Ceník · Kancelář fill 2 of 3. Numbering that starts at "02" reads as a bug to a visitor. | home ([G-home-1280-full.png](screens/design-review-2026-11-13/G-home-1280-full.png)) |
| B | The services index has empty grid slots ("Převoz" and "Kremace" sit alone in a two-column grid), and the hero photo sits bottom-left with an empty right column. | home |
| D | Below the split the page goes flat: Kancelář and O nás stack in one left column with 60 % of the width empty, then the footer repeats the split. | home ([D-home-1280-full.png](screens/design-review-2026-11-13/D-home-1280-full.png)) |
| A, B, E, G | **One-letter words at line ends** ("rozloučením s / vaším") in the H1 at 375, and in E and G at 1280. Only C and D glue them (each in its own `lib/site.ts`). Move that into core and apply it to every heading and lead. | home H1 |
| all | The office photo `budova-kancelare.jpg` is **722 × 455** but is shown up to about 1,100 px wide (G O nás, A O nás), so it looks soft with visible JPEG blocking. `media:inventory` should flag any image smaller than its slot's largest rendered width. | O nás, G home |
| A, G, D | Product photos on white backgrounds sit as **white boxes on tinted grounds** (cream, off-white, stone). Use `mix-blend-mode: multiply` on catalogue images on light grounds, or a consistent plate colour. | Rakve, Květiny |
| content | "40 letou tradicí" should be "40letou tradicí". | A hero panel, G header subtitle |

---

## 3. Sameness and the "AI-generated" feel

### 3.1 What makes them read as generated

1. **Every section has the same shape.** C's home is 9 identical statements: kicker, big heading, two lines, underlined link. E's home is 5 identical passages, A's is 6 "label left, heading, paragraph" sections, and G's inner pages are all "label column + ruled block". A page built from one repeated module has no climax and no rhythm. This, more than any colour or font, is what signals "generated".
2. **Uppercase tracked eyebrow labels** ("PRVNÍ KROKY", "NĚKDO PRÁVĚ ZEMŘEL", "CHCI SE INFORMOVAT NEBO PŘIPRAVIT", "SLUŽBY") above most headings. This is the single most common pattern on generated landing pages.
3. **The same repeated link per item:** "Co služba zahrnuje" ×4 (C), "Co je v ceně a kolik to stojí" ×4 (E), "Více o nás", "Všechny kontakty". Identical link text in a row reads as a template being filled in.
4. **The same content everywhere.** All six prototypes use the same H1 ("S úctou a klidem vás provedeme…"), the same lead, the same logo and the one building photo. A client comparing them sees six skins of one website. The templates can't be judged apart while their content is identical (see §6, step 4).
5. **Contact data is repeated just above the footer.** A ("Navštivte nás"), C ("Kancelář Vyškov") and E ("Kancelář") end the home page with an address and hours block, and then the footer shows the same block again. The bottom third of each page is redundant, which feels assembled rather than edited.
6. **Nothing reacts.** A real, crafted site has small signs that someone cared: a hover that moves, a menu that opens smoothly, a number that copies, an open/closed state. These templates have none, so they read as static mockups.

### 3.2 Where the templates converge

| Pair | How close | Why |
| --- | --- | --- |
| **E ↔ G** | very close | light neutral ground, top nav on the right, label-left inner pages, hairline rules, big number under a rule in the hero; they differ mainly in serif vs grotesque. At 375 they are almost the same screen. |
| **A ↔ E** | close | quiet serif, light ground, narrow text column, label-left sections, number in a ruled line or box. |
| **B ↔ G** | close on mobile | logo + "Menu" box, green number block under the H1. |
| **A, D, E, G inner pages** | same skeleton | heading in a left column (A label col, D 4/12, E cols 1–4, G 360 px) and text on the right, under 1–3 px rules ([all-sluzby-1280.png](screens/design-review-2026-11-13/all-sluzby-1280.png)). |
| C, D | distinct | dark rail vs split colour fields; both pass the greyscale test at 1280 and at 375. |

The memory rule for this project ("variety must come from structure: density, page flow, colour, photo placement") holds at the **home-page** level. It is being lost on **inner pages and on mobile**, where the templates fall back to the same label-left column and the same mobile stack.

### 3.3 How to pull them apart

- **Give each template one "permitted extravagance"** that is banned for the others, so that the shared ban list stops pulling them together:
  - **A:** real letter details, such as a handwritten owner's signature, a dated letterhead block and a postscript.
  - **B:** icons and signage tiles, its own "public building" wayfinding system.
  - **C:** darkness and scale.
  - **D:** colour fields.
  - **E:** photography.
  - **G:** numbers and cross-references.
- **Inner-page skeletons should differ as much as the home pages do.** Keep G's label column, since it's the essay format. Move **E** to a centred single reading column with full-bleed bands, like a slow magazine read, rather than a 12-column split. Give **A** a true letter layout, one centred measure with marginalia in the *right* margin instead of a left label column. D can keep its 4/12 split, because its colour openings already set it apart.
- **Make the mobile first screens differ on purpose.** Today only C and D do. Some options:
  - **A:** the utility strip is its signature, so give the mobile hero a centred letterhead composition instead of the left-aligned stack.
  - **B:** lead with the CTA tier (two big buttons) *above* the H1, a deliberately practical first screen.
  - **E:** open with the stamp line and a 2-line H1 in light serif, with lots of air.
  - **G:** open with the owners' photo as figure 01 at the top of the page (the documentary concept), and the text after it.
- **Break the one-module cadence inside a page:** one wide moment per page (a pull quote, a large figure, a full-bleed field, a dense table) between the regular blocks.

---

## 4. Per-template review

### A · Rodinná tradice: warm letterhead
**Works:** the letterhead header, the cream paper and the serif read as a family firm. The guide is the best of the six: margin TOC, circled numerals, "Co udělat", framed phone. The dot-leader price list is lovely.
**Problems:**
- The hero's right panel repeats "Pohřebnictví Hnátek / RODINNÁ FIRMA… / VYŠKOV", which the logo already says, so it reads as filler. Replace it with the office photo, a real fact with a signature, or the live office status (§5.3).
- At 1280 the content sits in a narrow column and the right 40 % stays empty for the whole home page. A letter can do that, but the left label column is almost empty too, so the page looks under-filled rather than composed.
- Services as prose with 2–3 inline links per paragraph is elegant but slow to scan for a stressed reader. Give each service name its own line.
- The nonstop number appears 4 times on the home page (strip, hero, steps, Navštivte nás) plus once in the footer.
- The main navigation has no hover state.
- The drop cap on O nás hangs on a paragraph only two lines long. A drop cap needs at least 3–4 lines to sit.

### B · Důstojná jednoduchost: public building
**Works:** the clearest hierarchy of all; the bottom action bar on mobile is excellent; the price table is solid.
**Problems:**
- The P0 "O nás" bug.
- This is the most "default UI" template: rounded bordered cards with chevrons, green filled buttons, icon + label rows. It is close to a stock Tailwind look, and the contract asked for blocks "separated by 1 px lines and bands, not cards". Lean into the *signage* concept: large numbered wayfinding tiles, a strong typographic sign system and pictograms. Don't drift towards app UI.
- The number shows 3 times in the first mobile screen (header button, hero card, bottom bar). Keep the bar and the hero card, and drop the header button below 64 rem.
- The hero image placement leaves a dead quadrant.
- Empty slots in the services grid.

### C · Noční linka: night line
**Works:** the strongest identity; amber used only for the number is a great rule; the rail is a real structural idea; the agenda-style notices list is good.
**Problems:**
- The home page is about 6,000 px of identical statements. The 4 service statements could be one statement with 4 rows.
- The column has unused width at 1280 (the statements are about 560 px with about 250 px empty on the right). Either set the type larger or use the space for the step tally.
- The rail goes empty below the nav. That space can hold the live office status and a "Krok 2 z 7" progress counter (§5.3).
- Hover only thickens a 1 px underline to 2 px, which is hard to see on dark.

### D · Dvě cesty: two paths
**Works:** the split hero is the best first screen in the set: it gives two states of mind two different colours. The path switch is a real idea, and the colour openings carry it across the site.
**Problems:**
- The switch is a static pill that doesn't animate. It is the obvious place for this template's signature motion (§5.3).
- Right-aligned descriptions in the stone half.
- The flat page below the split.
- The cramped label under the navy H2.
- The footer repeats the split, so the colour device is used twice on one short page.
- "[Doplnit: poznámka k DPH]" is visible in the hero. The content is missing, but it is the most prominent place it could show.

### E · Tichá krajina: quiet landscape
**Works:** the light Spectral type is beautiful; the stamp line is a good emergency device; the guide's "sentence picker" is the most original picker in the set.
**Problems:**
- The P0 catalogue bug.
- The nav wraps at 1280.
- The concept depends on photographs that don't exist yet. Without them it is a very light typographic page with grey boxes.
- At 1280 the guide leaves the left 40 % holding only a small phase label per step ([E-guide-picked.png](screens/design-review-2026-11-13/E-guide-picked.png)).
- Every passage has the same rhythm.
- It is the closest to G on mobile.

### G · Lidé a místo: people and places
**Works:** the numbered-figure system is a strong, honest idea that survives without photos; Archivo with tabular numerals looks crisp; the 3 px rules give it a documentary feel.
**Problems:**
- Grids with holes (see §2.2).
- 10 latent `PlaceholderMark` breaks, the most of any template.
- The numbering starts at 02 on home.
- The "01" caption floats under a placeholder.
- Numbered figures are begging for cross-reference interaction (hover a number in the text and its figure lights up), which is not built yet.
- Too close to E, as described in §3.2.

---

## 5. Making them feel alive: argument and proposal

### 5.1 The argument

The templates are flat because **nothing responds**, not because nothing moves. For this audience (older adults under stress, research §3: lower task success, less willingness to explore), decorative motion is a real cost. Fade-up-on-scroll, parallax, counters and carousels slow reading, hide content until it animates in, and are themselves a strong "AI landing page" tell. **The contract is right to ban them, and I would keep that ban.**

What the templates lack is **feedback and state**. Feedback is a row that reacts under the finger, a menu that opens rather than snaps, a checkbox that confirms, a scroll that glides to the step you chose rather than teleporting 1,100 px. State is "the office is open, until 15:30", "2 of 3 done", "number copied". This is what makes a site feel looked after, and it *helps* older users, because every action gets visible confirmation. It also gives the templates a new axis of difference: behaviour.

### 5.2 Baseline for every template (core plus per-template styling)

| Item | Why | Notes |
| --- | --- | --- |
| **Hover and press states with 120–180 ms easing** on links, rows, buttons and picker options. A row tints, its arrow moves 4 px, and press scales to 0.98. | A has no nav hover; C, E and G only thicken an underline. | Must never be the only cue (research: no hover-only affordances). |
| **Smooth, offset scrolling to anchors** (`scroll-behavior: smooth` plus `scroll-margin-top` clear of sticky strips). | The picker currently jumps 456–1,117 px instantly and the reader loses their place. | Turn it off under `prefers-reduced-motion`; the CSS reset is already there. |
| **Animated `<details>`** (`interpolate-size: allow-keywords` with a `::details-content` transition; it falls back to an instant open). | Steps, FAQ and service bodies are all `<details>` and snap open. | Progressive enhancement only. |
| **Guide checklist that remembers** (localStorage) and shows "2 ze 3 hotovo" per step, plus a page-level "Hotovo 4 z 12" with a reset. | It turns the guide into a tool a family returns to over several days. This is the most useful "live" feature. | A few lines of JS per page; the page still works without it. Say clearly that ticks stay only in this browser. |
| **Click-to-copy the phone number on desktop** (`tel:` does nothing useful on most desktops), with a quiet "Číslo zkopírováno" status. | Desktop visitors at 2 am read the number off the screen today. | Keep the `tel:` link on touch devices. |
| **Live office status** from `officeHours`: "Kancelář je teď otevřená, do 15:30" or "Kancelář je zavřená. Nonstop linka: …". | Real, correct, live information. It is the opposite of decoration. | Compute at runtime in `Europe/Prague`; render nothing when JS is off; respect "státní svátky" (holidays) once there is data for them. |
| **Cross-document view transitions** (`@view-transition { navigation: auto }`), a 150–200 ms crossfade and the header kept in place. | Page changes stop flashing, so the site feels like one place. | Supported in Chromium and Safari 18+; other browsers simply navigate. Respect reduced motion. |

### 5.3 One signature interaction per template

| Template | Signature | What it does |
| --- | --- | --- |
| **A** Rodinná tradice | **Scroll-spy margin TOC** | The left TOC marks the step being read with a sliding umber bar, and ticked steps get a quiet check. It stays a letter that you read through, with a bookmark that follows you. |
| **B** Důstojná jednoduchost | **Office status as signage** | The CTA tier shows a large "OTEVŘENO / ZAVŘENO" sign that swaps which number is primary: the office during hours, nonstop otherwise. |
| **C** Noční linka | **The rail tracks you** | The rail shows "Krok 2 z 7" and highlights the current statement in the rail nav while you scroll. Below the nav it shows the office status. In C the amber number stays the only thing in amber and never pulses. |
| **D** Dvě cesty | **The path switch moves** | The navy pill slides between "Teď hned" and "S předstihem", and the page opening crossfades navy ↔ stone through a view transition. This is the most visible "alive" moment in the set and the concept is built for it. |
| **E** Tichá krajina | **The sentence rewrites itself** | Picking a word in "Kde blízký člověk zemřel?" re-composes the sentence ("Zemřel doma. Ukazujeme 6 kroků.") with a soft crossfade, and the steps that don't apply fold away instead of jumping. |
| **G** Lidé a místo | **Numbers are links** | Hovering or focusing a number in the text ("v obřadní síni 03") highlights figure 03 and the reverse, and on mobile tapping the number scrolls to the figure. Optionally add a static map with numbered pins that match the figures. |

For **notice pages**, a "Zapálit svíčku" (light a candle) counter or a condolence form is common on Czech parte sites and is not advertising. But it needs a backend, moderation and a lawyer's view under L1. Treat it as a separate decision, not part of this pass.

### 5.4 Things I'd still refuse

- Scroll-triggered reveals and fade-ups.
- Parallax.
- Auto-playing carousels.
- Animated counters ("40 let").
- A pulsing or glowing phone button: urgency styling is manipulative here.
- Cursor effects.
- Lottie candles.
- Background video.
- Anything that animates on page load.

### 5.5 Proposed contract amendment (design-differentiation §1)

Replace "scroll animations" in the forbidden list with a **motion policy**:

> **Allowed:** feedback motion (hover, press, focus, open/close, state change) ≤ 200 ms; view transitions between pages ≤ 250 ms; smooth anchor scrolling. **Forbidden:** motion that plays on load, loops, or is triggered by scrolling to reveal content; parallax; carousels; animated numbers. **Always:** every motion is disabled under `prefers-reduced-motion: reduce`; no information is conveyed by motion alone; the page is complete with JS off.

---

## 6. Suggested order of work

1. **P0 core fix:** `PlaceholderMark` always renders its wrapper when it is given a class, with a regression test that sets `placeholder: false` on every affected component. Then fix E's nav wrap.
2. **Layout cleanups:**
   - G: grid holes and numbering.
   - D: below-the-split layout, right-aligned text and label spacing.
   - B: services grid and hero image.
   - A, C, E: drop the duplicate contact block above the footer.
   - Core: one-letter-word glue for all headings and leads.
   - `media:inventory`: flag images that are too small for their slot.
3. **Amend the motion contract** (§5.5), then add the baseline layer (§5.2) to core and to each template's styles.
4. **Give each prototype its own content voice** for the comparison: at least a different H1, lead and photo selection per template. Otherwise the client is comparing skins of one site.
5. **Signature interactions** (§5.3), D and G first: they have the clearest concept to express and the most to gain.
6. **Pull apart the converging pairs** (§3.3): E's inner pages and mobile first screen first, then A's inner pages.
7. Re-run the greyscale test at 375 for every pair and update the scorecard in design-differentiation §7.

---

## 7. Status after the fixes (2026-11-13, same day)

Everything below is uncommitted work in this checkout. Screenshots are in [screens/design-review-2026-11-13/after/](screens/design-review-2026-11-13/after/).

**Core**
- `PlaceholderMark` keeps its wrapper whenever it is given a class (§2.1). E's catalogue and B's "O nás" block lay out again, and the 12 latent spots are safe. A harness test covers it.
- `core/typography/czech.ts` adds middleware that glues one-letter words on every page of every template (§2.2).
- The motion policy (design-differentiation §1.1) is now in the contract. The shared `<SiteInteractions />` script is 8.3 KB minified, 3.4 KB gzipped. It provides:
  - checklist memory and "Hotovo n z m";
  - copy-number on desktop;
  - the live office status (Czech public holidays included);
  - scroll-spy;
  - cross-references;
  - view transitions for the guide filter;
  - smooth `<details>`, smooth anchor scrolling and page transitions, all off under reduced motion.
- **Brand personalisation** (template-contract §8a, design-differentiation §1.2):
  - A `brand` block in `site.config.ts` (colours, fonts, mark) feeds `--brand-*` roles with guaranteed contrast. G-090 reports adjusted colours and G-091 fails a missing mark.
  - Fonts come from a self-hosted font registry (`core/brand/fonts.ts`), and exports credit the brand fonts.
  - The Hnátek brand board is applied to all six prototypes.

**Measured after:** 36–90 elements with transitions per page, up from 0, and 4–14 hover rules per template. Every page has a reduced-motion block.

**Per template:** see the commit or PR description. In short:
- **A:** brand mark and office status replace the duplicate brand panel; one service per line; a compact footer on home; a 2-line drop cap; scroll-spy TOC.
- **B:** ruled service rows instead of cards; hero image under the lead; office sign "Otevřeno / Zavřeno".
- **C:** one services statement with ruled rows; office status in the rail; the rail tracks the steps ("Krok n z N").
- **D:** left-aligned stone half; two columns below the split; sliding path switch with a navy ↔ stone morph.
- **E:** nav fits on one line; single reading column in the guide; the sentence rewrites itself; compact footer on home.
- **G:** column counts follow the content (no holes); captions for 01; figure index; numbers linked to their figures.

**Still open**
- The office photo is 722 px wide and looks soft when large (content).
- "40 letou" should be "40letou" (content).
- E needs real landscape photos.
- On phones C has no step counter.
- C's Služby index still uses one statement per service.
- The same brand on six templates makes them closer in type (all Playfair): structure, colour use and behaviour now carry the difference. Compare them in greyscale before showing a client.

## 8. Owner feedback: the guide is not a checklist (2026-11-14)

The owner found the tickable checklists tasteless for something done for a deceased loved one. §5.2's "guide checklist that remembers" is withdrawn: core no longer stores ticks or counts them, and every template shows each step's short list as a calm numbered sequence of sentences, with a reassurance lead at the top of the guide and a closing line after the last step. The rule, its copy and what is forbidden are in design-differentiation §1.3. The content field keeps its name `checklist` for data compatibility; the CMS now labels it "Postup v krocích". A's margin contents list keeps its scroll-spy but no longer marks steps as done.

## 9. Owner feedback: sterile homepages (2026-11-14)

The owner found some homepages sterile, "like a restaurant menu". Cause: C and D showed no image at all, A only the small mark, E and G large grey placeholders; the client's real photos (office, its own flower arrangements, coffins) were used only on inner pages. Fix: core `getHomeImagery()` and design-differentiation §1.4; each template now places the real photos in its own way, shows featured services only, and keeps at most one placeholder on the homepage. Office status signs were also made legible in every state (template-contract §6).

The real limit is the material: one atmospheric photo (the office, 722 px wide) and catalogue product shots. What would lift every template most is a short commissioned shoot of the firm's own places, for example: the office and its entrance in soft daylight, the ceremony hall or the space where families arrange the funeral, the flower workshop at work (hands and flowers, no faces needed), the Cadillac hearse, and a few calm landscape frames of the Vyškov area for template E. No stock portraits and no generated images (template-contract §7).
