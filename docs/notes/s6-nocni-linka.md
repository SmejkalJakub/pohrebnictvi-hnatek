# S6 · Template C `nocni-linka` (Noční linka): plan

**Status:** plan approved by the owner 2026-11-10 ("Approve, build it", including the four [review] choices as proposed); built the same day. Build results are in §9. Built from Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md), with the approved round-2 design F in [docs/designs/nocni-linka/](../designs/nocni-linka/README.md) as the design input (comps, `html/*.html` for exact values, `tokens.json`).

Decisions that need the owner's yes are marked **[review]**. Everything else follows the comps, the contract or an existing pattern.

## 1. Concept (from the comps)

For the person who opens the site at two in the morning. The site is dark, quiet and very large. On desktop a sticky side rail holds the name, the nonstop number and the navigation; the content scrolls beside it as a sequence of single **statements** (muted kicker, very large heading, one or two sentences, one link). On mobile the same header becomes a name row with an "Obsah" button and, directly under it, the nonstop panel on the rail colour. Nothing competes with the number: amber (`signal`) is used for the nonstop number only.

Structural ideas that make it C, not A or B:

- **The rail is the header.** One `<header>` element: on ≥ 1024 px it is a fixed-width sticky column (name, nonstop number, vertical nav); below that it is a name row + toggle + nonstop panel + in-flow menu. No horizontal top nav at any width.
- **Statements as the only separation device.** Each section is a `<section>` with a 1 px rule on top, a kicker and one heading. No cards, boxes, tiles, bands, images on home, icons, rounded corners or light sections. The only box on the site is the demo-price notice.
- **Notice pages switch the chrome to its neutral form**: no amber, no "převoz", reduced nav (Oznámení a obřady · Kontakt · Úvodní stránka), and "Oznámení zveřejňuje <brand>." + an ink "Telefon nonstop …" link.

## 2. Intended manifest

```ts
{
  id: "nocni-linka",
  name: "Noční linka",
  version: "0.1.0",
  coreVersion: "^0.1.0",
  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: true,      // short index of statements + one statement page per service
    mapEmbed: false,               // map is always a link
    notices: true,                 // /oznameni/ agenda + /oznameni/<slug>/
    people: true,                  // on /kontakt/ ("Lidé a kancelář")
    faq: true,                     // on /jak-postupovat/#caste-otazky
    documents: true,               // footer "Dokumenty" column + /pravni-informace/
    guestInfo: true,               // /pro-ucastniky/
    prePlanning: true,             // /pohreb-predem/, same pattern as /pro-ucastniky/ (not drawn) [review]
    priceInclusions: true,         // "V ceně je zahrnuto" / "Není zahrnuto" on /cenik/ and service pages
  },
  homepageSections: {
    available: ["hero", "services", "next-steps", "family-story", "contact-summary", "catalogue-links"],
    default:   ["hero", "services", "next-steps", "family-story", "contact-summary"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },
  options: {
    palette:           { values: ["noc", "grafit"], default: "noc" },
    fontPair:          { values: ["schibsted-grotesk", "hanken-grotesk"], default: "schibsted-grotesk" },
    heroVariant:       { values: ["statement"], default: "statement" },        // [review] one value only
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },
  imageSlots: {
    "company.logo":  { aspect: "none", required: false },   // light (white) logo variant only; text wordmark while null
    "about.story":   { aspect: "4:3", required: false, page: "o-nas", field: "heroImage" },
    "coffin.item":   { aspect: "4:3", required: false },
    "flower.item":   { aspect: "1:1", required: false },
    "person.photo":  { aspect: "4:5", required: false },    // 112 × 140 in the comp
    "notice.photo":  { aspect: "4:5", required: false },
    "notice.parte":  { aspect: "none", required: false },   // printed parte image, natural aspect
  },
  pageFields: {
    home:  ["title", "navLabel", "metaTitle", "metaDescription", "lead"],          // no heroImage: home never has a photo
    "jak-postupovat", sluzby, rakve, kvetiny, kontakt, cenik, oznameni,
    "pro-ucastniky", "pohreb-predem", "pravni-informace", "ochrana-osobnich-udaju":
           ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "heroImage", "body"],
  },
}
```

Notes on the manifest:

- **Default section order** hero → services → next-steps → family-story → contact-summary differs from A (hero → family-story → services → next-steps → contact-summary) in 3 positions and from B (hero → next-steps → services → contact-summary → family-story) in 4. It follows the comp: the first statement answers "who do I call", the second puts "Pohřeb bez obřadu" (a featured service) up front, then the situation picker, then the family, then the office.
- **`heroVariant` [review].** The guardrails forbid a photo on home, so there is no honest second hero variant. I declare a single value `statement` so `site.config` stays explicit and the CMS hides `home.heroImage`. Alternative: drop `heroVariant` from this manifest entirely.
- **`emergencyEmphasis: "high"`.** Desktop: the rail number grows from 38 px toward 60 px. **Risk:** "+420 000 000 199" at 60 px bold is about 500 px wide, wider than the rail's 360 px content box, and the number must not wrap. I will measure and use the largest size that fits with `nowrap` (expect about 44–46 px) and record it. Mobile: the nonstop panel becomes **sticky** at the top while scrolling (with `scroll-padding-top` reserved), since a bigger number does not fit 343 px. The `responseNote` line from the comp is left out (see §7).
- **Palettes** are exactly `tokens.json` (`noc`, `grafit`), switched by `html[data-palette]` custom properties. **Font pairs**: Schibsted Grotesk 400/700 (default) and Hanken Grotesk 400/700, one family each, self-hosted from `@fontsource/*` 5.3.0 (new dependencies; the lockfile changes). The H1 face (700) is preloaded.

## 3. Pages and composition

All pages: dark ground, the rail/header, statements. Exact sizes from `html/*.html`: body 20/1.5, lead 22–24, kicker 20 muted, H1 76/40 (1280/375), statement H2 56–60/30–34, spacing 8 · 16 · 32 · 64 · 96 · 160, rail 440 px with 40 px padding, content padding 0 96 px, gutter 16 px, radius 0.

| Route | Composition | Drawn? |
| --- | --- | --- |
| `/` | **hero** statement (kicker "Když někdo zemřel", H1 = page title, lead, link "Co udělat v prvních hodinách"; `min-height` one screen on desktop only) → **notices teaser** statement when notices are on (kicker = notices nav label, H2 "Kdy a kde je rozloučení", one sentence, link "Najít oznámení"; no names on home, see L1 in §6) → **services**: one statement per featured service (kicker "Služby", H2 = service title, summary, link) → **next-steps**: H2 "Kde blízký člověk zemřel?" + the 58 px picker linking into `/jak-postupovat/#situace-…` (first-hours steps as a list when guidance names no situations) → **family-story**: kicker "O nás", excerpt, link → **contact-summary**: "Kancelář" statement (address, office phone, own-headed office hours) → **catalogue-links** (optional): inline links "Rakve · Květiny". Statements are as tall as their content; 96 px apart on mobile. | yes |
| `/jak-postupovat/` | Kicker, H1, lead; "Kde blízký člověk zemřel?" picker = four full-width 58 px bordered links, the picked one inverted with the word "vybráno" (CSS `:target`, no JS); "Zobrazeno N z M kroků" + "Zobrazit všechny kroky" (one precomputed sentence per situation, shown by `:has(:target)`); **one step per statement**: kicker "Krok n z N · phase" (n from a CSS counter, N per situation), 30/48 px heading, summary, 28 px native checkboxes, body in `<details>`, "Další krok" via `nextGuidanceStep()`; steps with `contactPrompt: emergency` repeat the nonstop panel. Then **FAQ** (`#caste-otazky`): one statement per topic, each question a `<details>`. | yes (375) |
| `/sluzby/` | Kicker, H1, lead; featured services as statements (kicker = category label, H2 = title, summary, "Co je v ceně" → detail page); the others as one "Další služby" statement of inline links separated by `·`. | yes (1280) |
| `/sluzby/<slug>/` | Kicker = category, H1 = title, summary as lead, body; "V ceně je zahrnuto / Není zahrnuto" from the linked price group (no price on the page, so no VAT note needed) and a link "Ceník" → `/cenik/#<group>`; transport services repeat the nonstop panel. | built from Služby |
| `/cenik/` | Kicker, H1 "Kolik pohřeb stojí"-style title from content, lead with `<VatNote>` in bold, `<DemoPricingNotice>` in the site's only 1 px box, print hint; **one statement per price group**: kicker = group name, H2 = the group's headline price via `<PriceValue>` (56 px, ink, never amber), two columns "V ceně je zahrnuto" / "Není zahrnuto"; group items as a ruled two-column table (22 px rows, price right-aligned, `nowrap`). | yes (1280) |
| `/cenik/` print | `print.css`: always light (black on white), no rail, letterhead line (name + address), H1, VAT note as the second line, groups with the price right-aligned on a rule and the two lists side by side, footer with office + nonstop numbers, e-mail, legal identification, source URL. | yes (A4) |
| `/kontakt/` | Kicker, H1 = page title, address + "Mapa a příjezd" link; statements: **Úřední hodiny** (`data-office-hours`, ruled rows), **Telefony a e-mail**, **Převoz zesnulých** (`data-emergency-block`, service text; the number itself stays in the panel/rail), **Lidé** ("Kdo vás přijme") when people are on. | yes (375) |
| people (on `/kontakt/`) | With photos: one person per row, 112 × 140 portrait, 30 px name, muted role, "Přímá linka …". Without photos: two ruled columns of 30 px names, no initials. Mixed: rows, and a person without a photo gets no empty frame. | yes (1280) |
| `/oznameni/` | **Neutral chrome.** H1, muted consent sentence; "Nadcházející rozloučení": one statement per date (30 px date heading; "time · name" on one 30 px line, name as the link; place · type · "přenos" muted); a **"Bez veřejného obřadu"** statement for upcoming notices without a public ceremony; "Nedávná oznámení": name link + "zemřel … · rozloučení proběhlo …". Empty state: one sentence. | yes |
| `/oznameni/<slug>/` | **Neutral chrome.** "Všechna oznámení" link; optional 4:5 photo; H1 name; dates; 26 px bold ceremony sentence; type; map link; "Sledovat přenos obřadu" link + note; parte image or PDF link; "Od rodiny"; "Kondolence" instruction with the e-mail; QR (`<NoticeQrCode>`) on a white square + print hint. No services, prices or homepage sections. | yes (375) |
| `/pro-ucastniky/`, `/pohreb-predem/` | Kicker, H1, lead; the Markdown body rendered so each `##` opens a statement (rule, 26/30 px heading, short text). | pro-ucastniky yes; pohreb-predem from it |
| `/rakve/`, `/kvetiny/` | Built from Lidé: one item per ruled row (thumbnail 4:3 or 1:1 at 140 px wide left when an image exists, 30 px name, muted code/material); without images, two ruled columns of names. Květiny ends with a "Květiny" phone statement. Zero items: one sentence + office phone. | from Lidé |
| `/o-nas/` | Kicker, H1, lead, optional 4:3 photo (the only content photo outside catalogues and people), body as statements. | from Služby/Kontakt |
| `/pravni-informace/` | Built from Kontakt: statements "Mimosoudní řešení sporů" (ADR body + link), "Reklamace" (complaints contact), "Dokumenty ke stažení" (ruled rows: title link, "PDF", valid from), page body. | from Kontakt |
| `/ochrana-osobnich-udaju/` | Kicker, H1, body as statements. | from pro-ucastniky |
| `/404.html` | Kicker "Chyba 404", one sentence, four ruled links (Jak postupovat, Oznámení if on, Kontakt, Úvodní stránka). | yes (375) |

**Footer (every page, on the rail colour):** four columns at 1280 (name + address + map · **Kancelář** with hours (`data-office-hours`) and office phone · **Nonstop převoz zesnulých** with the amber number (`data-emergency-block`) · **Dokumenty** when documents are on), then the legal row: legal name, sídlo, IČO, register entry, "Spory řeší Česká obchodní inspekce, adr.coi.cz" from `site.legal`, and the links Právní informace · Ochrana osobních údajů. Notice pages use the neutral footer: no Dokumenty column, the third column reads "Telefon nonstop" in ink.

**Navigation [review].** Core fixes the nav order and takes labels from each page's `navLabel`, so the rail cannot show the comp's curated six items ("Pohřeb bez obřadu" is a service, not a page; "Lidé a kancelář" is the client's label for Kontakt). The rail shows `site.nav` without "home" (the name links home), plus Pro účastníky, Pohřeb předem and Časté otázky (`/jak-postupovat/#caste-otazky`) when on. A client who wants the comp's wording sets the `navLabel`s ("Když někdo zemřel" for jak-postupovat, "Lidé a kancelář" for kontakt). With 10+ items the rail is taller than 800 px, so the nav part of the rail scrolls inside the sticky column while name and number stay put. The mobile menu ("Obsah" → "Zavřít") opens in the flow under the panel, 24 px bold ruled rows, as drawn.

## 4. Component inventory (all new names; none exists in A or B)

| Area | Components |
| --- | --- |
| Layout | `layouts/NightLayout.astro` (options → `data-*` on `<html>`, SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`, `neutral` prop for notice pages) |
| Chrome | `NightRail` (the header: wordmark/logo, toggle, number, nav), `RailNumber` (default/high emergency form), `NeutralLine` (neutral notice form), `RailNav` (full / reduced list), `NightFooter` (full / neutral) |
| Statement system | `Statement` (section shell: rule, kicker, heading level, size), `Kicker`, `StatementProse` (Markdown body where each `##` opens a statement), `Shown` (renders its slot when `if` is true; replaces `cond && <x/>` in markup) |
| Home | `OpeningStatement` (hero), `NoticesTeaser`, `FeaturedStatements` (services), `PlaceLinks` (situation picker, used on home and the guide), `OfficeStatement` (contact-summary), `StoryStatement` (family-story), `CatalogueLinksLine` (catalogue-links) |
| Guidance + FAQ | `StepStatement`, `StepTally` ("Zobrazeno N z M"), `TopicQuestions` |
| Pricing | `GroupPriceStatement`, `InclusionColumns` (also used on service pages), `RuledItemTable`, `A4Letterhead` + `styles/print.css` |
| Notices | `CeremonyAgenda`, `RecentNotices`, `NoticeFacts`, `QrSquare` (wraps core `NoticeQrCode`) |
| Contact, people | `HourRows` (`data-office-hours`), `PhoneLines`, `TransportStatement` (`data-emergency-block`), `PeopleRows` (photo rows / ruled columns) |
| Catalogue, legal | `CatalogueRowList`, `DocumentRows`, `AdrStatement` |

Plus `src/i18n/cs.ts` (UI strings only, plain Czech, `&nbsp;` after one-letter words), `src/lib/options.ts` (`resolveTemplateOptions`), `src/styles/global.css`, `src/styles/fonts.css` (faces with `unicode-range`, per the S3 lesson), `src/styles/print.css`. Core safety components are styled only through `class` + global CSS or their `data-*` hooks.

Mobile menu script: inline, ≈ 0.6 KB, toggles `aria-expanded`/label "Obsah" ↔ "Zavřít", Escape closes; without JS the list is shown in flow and the toggle is hidden.

## 5. Differentiation row (design-differentiation §5)

| Dimension | A Rodinná tradice | B Důstojná jednoduchost | **C Noční linka** |
| --- | --- | --- | --- |
| Header | centred letterhead | left logo, right nav, sticky | **sticky side rail (desktop); name row + toggle (mobile)** |
| Emergency CTA | dark utility strip | header button + bottom bar | **the rail itself / panel under the name; neutral ink line on notices** |
| Mobile navigation | in-flow full-height list | dropdown under sticky header | in-flow list under the nonstop panel, 24 px ruled rows |
| Homepage order | hero → story → services → steps → visit | hero → steps → services → contact → story | **hero → [notices] → services → steps → story → office** |
| Hero | editorial, asymmetric, image or panel | practical, CTA tier | **one text statement, one screen tall, no image ever** |
| Services IA | one long page | index + detail | **short statement index + statement detail pages; "Další služby" inline** |
| Guidance | article + margin TOC | phased checklist | **one step per statement, inverted picker with "vybráno", tally** |
| Catalogues | figure gallery | uniform grid | **ruled rows (thumbnail + name) or ruled name columns** |
| Pricing | `dl` + dot leaders | `table` per group | **one statement per group, price as 56 px heading, inclusion lists, ruled item table** |
| Notices | – | – | **large-type agenda by date; "Bez veřejného obřadu" group** |
| About | long-form, drop cap | fact sheet first | statements, optional single 4:3 photo |
| Footer | three-column rich letter | compact two rows | four columns on the rail colour + legal row with ADR |
| Typography | serif display + humanist sans | neutral grotesque | **one newspaper grotesque, 400/700, 76 px H1, 20 px body** |
| Colour | warm paper, umber | cool slate, forest | **dark ground, warm off-white, amber for the number only** |
| Image use | larger, fewer, captioned | minimal, uniform | **none on home; people, catalogue, notices only** |
| Separation | hairlines, small caps | 1 px lines, tinted bands | **darkness and space; one rule at the top of each statement** |

No other new template exists yet (G, H, I are designs only).

## 6. Law (research §4a)

- **L1, notice pages:** neutral chrome (rail/panel, nav, footer as above), no `PriceValue`, no service links, no "Objednat", no homepage sections. **Home teaser** links to `/oznameni/` but shows no names, so the promotional home page never "informs about a death". ⚖ The neutral form, the reduced nav and the teaser need the lawyer. **Accessibility tension:** core fixes the emergency link's accessible name ("<label>, volat <number>"), so the neutral link's visible text "Telefon nonstop …" is not contained in its name (WCAG 2.5.3, label in name), and the name still says "převoz" to screen readers. Worth a later core option for a neutral accessible name.
- **L8:** legal identification in the footer of every page, neutral footer included. **L9:** `<VatNote>` in the Ceník lead and on the print sheet; service pages show no prices. **L10:** ADR sentence and "Právní informace" link in every footer. **L11:** no cookies, no third-party requests, fonts self-hosted. **L14:** livestream is a plain link.
- No newsletter or e-mail capture anywhere.

## 7. Proposals and things I will not build

- **`emergency.responseNote`** ("Ozveme se do 5 minut") is not added to core in this build (instruction). Possible later core addition; the high-emphasis rail is built without it.
- **Homepage section `notices`** (later core addition): the home notices teaser is rendered by the template right after the hero, outside the `data-section` list, because core has no section id for it, so clients cannot reorder it. [review]
- **Print buttons.** "Vytisknout ceník (A4)" and "Vytisknout oznámení" need `window.print()`, which exceeds "JS only for the nav". I render them as a short instruction ("Vytisknete klávesami Ctrl + P, na Macu Cmd + P.") like B. [review: or allow a one-line print button]
- **`/lide/` route:** not in the core route contract, so people live on `/kontakt/`.
- **Rail nav wording** comes from `navLabel`s (see §3).

## 8. Registration and verification plan

- `qa/templates.ts`: add `nocni-linka` (letter C, port 4413). `qa/structure.spec.ts`: component-name, import, homepage-order/outline and route-set checks for **every pair**; new checks for notice pages (no `[data-price]`/PriceValue, no `/sluzby/` links, no "Objednat", neutral emergency form), footer legal identification on every page, `[data-vat-note]` on `/cenik/`.
- `tools/client/new.ts` usage text; `tools/client/tests` and `tools/cms/tests` template lists; `.claude/skills/site-build/SKILL.md` (when to choose C: dark, sparse, notices-first clients; white logo needed; image slots; supported types); `docs/design-differentiation.md` section + matrix column.
- Verify: `npm test`, `npm run lint`, `npm run typecheck`; `npm run build -w templates/nocni-linka` (prototype) and `build:production` (expect only the fixture's gate rules); `npm run qa` (all three templates, axe serious/critical = 0); Lighthouse mobile (via `npx lighthouse` and Playwright's Chromium) on home, jak-postupovat, cenik, oznameni; trial client `clients/hnatek-c` (copy of `clients/hnatek`, template switched, white logo, placeholder notices/people/FAQ) → `client:validate`, `client:build`, `client:export -- hnatek-c` (RESULT: PASS 10/10); greyscale screenshots at 375 and 1280 beside A and B; the §7 scorecard against A and B.
- Contrast per palette (computed, recorded here after the build); budgets (HTML + CSS ≤ 100 KB gzip, JS ≤ 10 KB).

## 9. Build results (2026-11-10)

### What was built (`templates/nocni-linka/`)

| Area | Files |
| --- | --- |
| Wiring | `package.json` (`@site/template-nocni-linka`, scripts like B's), `astro.config.mjs` (no Tailwind: plain CSS, so no utility-name collisions), `fixture.site.config.ts` (every optional type on, `pinnedBuildDate` like the fixture), `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`, `template.manifest.ts` (as in §2) |
| Shell | `src/layouts/NightLayout.astro` (options → `data-*` on `<html>`, preload of the 700 face, SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`, `neutral` prop), the ≈ 0.6 KB inline menu script |
| Components | the inventory in §4, plus `EmptyCatalogue` (zero coffins/flowers) and `src/lib/notices.ts` (agenda grouping) |
| Styles | `src/styles/global.css` (tokens per palette and font pair, statements, frame), `fonts.css` (latin + latin-ext faces with `unicode-range`), `print.css` (always light; A4 price list, notices with QR) |
| Strings | `src/i18n/cs.ts` (UI only; one-letter words carry ` `; weekday after a preposition: "v sobotu", "ve středu") |

**Routes (fixture, every optional type on): 24 pages.** `/`, `/jak-postupovat/`, `/sluzby/` + 7 detail pages, `/rakve/`, `/kvetiny/`, `/o-nas/`, `/kontakt/`, `/cenik/`, `/oznameni/` + 3 notices, `/pro-ucastniky/`, `/pohreb-predem/`, `/pravni-informace/`, `/ochrana-osobnich-udaju/`, `/404.html`. Conditional routes use `[...path].astro` with empty `getStaticPaths` when off.

### Decisions taken while building

- **Rail number size follows the room.** "+420 000 000 199" in bold measures 8.9 em in Schibsted Grotesk and 8.1 em in Hanken Grotesk. The size is `min(<max>, room / 9)`: 38 px in the 440 px rail (as drawn), 36 px in the mobile panel from 375 px (as drawn), smaller at 1024–1279 px and at 320 px, so the number never wraps and never overflows (measured at 320, 375, 1024 and 1280 px in both font pairs).
- **High emphasis** (`emergencyEmphasis: "high"`): the comp's 60 px would be ~535 px wide, more than any rail. The rail widens to 512 px from 1280 px and the number is 48 px; on mobile the panel can grow only to the width it has, so the home hero additionally repeats the full nonstop link. `responseNote` is not built (instruction).
- **Focus ring:** ink (3 px, 3 px offset) everywhere; amber only on the nonstop link itself. The token sheet lists "focus ring amber", the guardrails forbid amber for anything but the number; ink on ground is 15.7 : 1, so the guardrail wins.
- **Footer outside the grid.** The rail is sticky within `.frame`; the footer comes after the frame, so the rail lets go before it (QA found the sticky rail covering footer links when the footer was inside the grid).
- **Rail scrolls inside itself** when the nav is longer than the window (with every optional page on there are 11 items, ~870 px at 800 px): name and number stay at the top, the nav scrolls; keyboard focus scrolls it into view.
- **Price headline.** Core has no group price, so a group with inclusion lists uses its **first item** as the 56 px headline (label + `<PriceValue>`), and its other items go into the ruled table; a group without lists is a table only.
- **Agenda grouping** (`lib/notices.ts`): public ceremonies (civil, church) on or after the build date grouped by day; "Bez veřejného obřadu" = listed notices without a public ceremony whose ceremony is not past; the rest are "Nedávná oznámení".
- **Kontakt's Převoz statement** shows the service text and the full nonstop link in ink (contract §4 asks for a separate emergency block on /kontakt/); the amber number stays in the rail/panel.
- **People and catalogue rows**: a photo column only when at least one entry has a photo; an entry without one gets no empty frame. No initials anywhere.
- **Print buttons** became instructions (Ctrl/Cmd + P), as approved.
- **Phone links are never flex containers.** A label text run and a number `<span>` inside an `inline-flex` link become two flex items, and the space between them is dropped on screen ("Telefon nonstop+420 …", reported after the first build). Every label-plus-number link (neutral line, Kontakt phones and Převoz link, people, footer, documents, notice facts, QR file link, and the global `[data-phone-link]` rule) is now `inline-block` with `padding-block: 0.6rem` for the 44 px target, and the label is followed by an explicit `{" "}`. The Kontakt Převoz link uses core's `custom` variant so the label and number have a real space between them (core's `full` variant renders the two spans with nothing between, which only reads right when they are stacked, as in the rail). QA test 9 guards this.
- **A and B** got one shared-QA change each: `/cenik/` now renders the VAT note through core `<VatNote>` (they rendered `pricing.vatNote` in a plain `<p>`, so the `data-vat-note` hook the new L9 check reads was missing). With the fixture's empty `vatNote` they now show the "[Doplnit]" marker in prototype, as contract §6 intends.

### Contrast (computed, WCAG 2.x)

| Pair | Noc | Grafit | Use |
| --- | --- | --- | --- |
| ink on ground | 15.74 | 14.92 | body text, headings, links, focus ring (3 px) |
| ink on rail | 14.12 | 13.24 | rail / panel / footer text |
| muted on ground | 9.57 | 9.08 | kickers, secondary text, prototype markers |
| muted on rail | 8.58 | 8.06 | secondary text in rail and footer |
| signal on ground | 9.92 | 8.25 | nonstop number, its focus ring |
| signal on rail | 8.90 | 7.32 | nonstop number in rail / panel / footer |
| rule on ground | 3.96 | 3.76 | rules, button and picker borders (UI ≥ 3 : 1) |
| rule on rail | 3.55 | 3.34 | rules in rail and footer (UI ≥ 3 : 1) |
| ground on ink | 15.74 | 14.92 | picked situation (inverted) |

Print: `#111` on white 18.9, `#333` 12.6, rules `#8A8A8A` 3.45.

### Distinctiveness scorecard (design-differentiation §7)

Scored 0–3 per dimension from the built pages, the DOM outlines recorded by QA (`docs/qa/structure.json`) and the greyscale screenshots.

| Dimension | C vs A (Rodinná tradice) | C vs B (Důstojná jednoduchost) | Evidence |
| --- | --- | --- | --- |
| Composition (page layouts, section order) | 3 | 3 | C: fixed rail beside single statements, a one-screen text hero, a notices statement, statement pages everywhere; A: asymmetric editorial hero, prose groups; B: CTA tier, bands, grids. Order differs in 3 (A) and 4 (B) positions. |
| Navigation (header, mobile nav, CTA pattern) | 3 | 3 | C's header *is* a sticky vertical side rail holding the number; no top nav at any width; neutral rail on notices. A: centred letterhead + utility strip; B: top bar + header button + bottom bar. |
| Typography (families, scale, hierarchy) | 3 | 2 | One newspaper grotesque at 76/60/20 px against A's serif display + humanist body; against B both are sans, but C's scale (76 px H1, 56 px price headings, 20 px body) and single-family 400/700 hierarchy differ clearly. |
| Image usage (size, frequency, crops, captions) | 3 | 2 | C: no image on home ever, small 4:5 portraits and catalogue thumbnails in ruled rows; A: large warm photos beside the hero; B: one optional hero image after the CTAs and uniform catalogue grids. |
| Content hierarchy (what comes first, depth of IA) | 3 | 2 | C: the number first, then one decision per screen; notices, guests, FAQ, people and documents all present; services as a short statement index. B shares index + detail pages for services. |
| **Total** | **15 / 15** | **12 / 15** | both pass (≥ 11, no dimension < 2) |

Both pairs keep "conservative and credible" to the reviewer's judgement: no ornament, no motion, no imagery on home, plain Czech.

### Speed

**Lighthouse 12, mobile (default emulation), Playwright's Chromium 1248, fixture build in prototype mode:**

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 96 | 66 | 1.4 s | 0 | 0 ms | 84 KiB |
| `/jak-postupovat/` | 100 | 100 | 96 | 66 | 1.4 s | 0 | 0 ms | 85 KiB |
| `/cenik/` | 100 | 100 | 96 | 66 | 1.4 s | 0 | 0 ms | 84 KiB |
| `/oznameni/` | 100 | 100 | 96 | 66 | 1.4 s | 0 | 0 ms | 83 KiB |

- Best practices 96: the fixture has no `public/favicon.ico` (404 in the console); client sites ship one. SEO 66: prototype builds are `noindex` and `robots.txt` disallows all, by design.
- The machine ran at a load average of ~120 (other applications). One home run scored 91 on a 10 s Speed Index while LCP was 1.4 s and every resource had loaded by 0.7 s; two later runs on the same build scored 100. One guide run had 330 ms TBT under the same load; two reruns: 0 ms, 100.
- **Budgets** (`dist/`, gzip): HTML + CSS at most 9.4 KB per page (`/jak-postupovat/`; limit 100 KB); one CSS file, 3.8 KB; inline JS 2.4 KB (menu script, `no-js` swap; limit 10 KB); no images on home. Fonts: two preloaded 700 faces (Schibsted latin 25 KB + latin-ext 12 KB), 400 faces on demand; no third-party requests.

### Verification

| Step | Result |
| --- | --- |
| `npm test` | 14 files, 229 tests passed (C added to the client and CMS template lists) |
| `npm run lint` | clean |
| `npm run typecheck` (tsc + harness check) | 0 errors |
| `npm run check -w templates/{nocni-linka,rodinna-tradice,dustojna-jednoduchost}` | 0 errors, 0 warnings, 0 hints each |
| `npm run build -w templates/nocni-linka` | 24 pages (fixture, prototype) |
| `npm run build:production -w templates/nocni-linka` | fails with exactly the fixture's expected rules (below) |
| `npm run qa` (A, B, C; `--workers=4 --timeout=240000`) | **775 / 776 passed**; the one failure was a timeout inside `keyboard.press` after every assertion of that test had passed (C, 375 px, `/`, skip link), at a machine load average of ~120; rerun of that test for every C route: 48 / 48 passed. axe serious/critical: 0 on every page of every template. |
| Glued-label fix (after the first build): `npm run build`, `lint`, `tsc`, `check -w templates/nocni-linka` | 24 pages; clean; 0 errors; 0 / 0 / 0 |
| `npm run qa -- --grep "1 emergency\|3 headings\|5 reflow\|6 keyboard\|9 phone links"` (A, B, C; same settings), rerun after the fix | **408 / 408 passed**: tests 1, 3 and 6 per route and width (A 20, B 34, C 48 each), 5 and 9 per route (A 10, B 17, C 24 each) |
| new test 9 "phone links keep a space between label and number" | measures, for every `tel:` and nonstop link at 375 and 1280 px, the rendered gap between a letter and the following "+" or digit on the same line; fails under 0.15 em. Checked against the pre-fix build: it flagged "Telefon nonstop +420 000 000 199" (gap 0.0 px) on `/oznameni/jan-vzorovy/` at both widths and nothing else. A text-based check (`innerText`) does not catch this, because flex items come back separated by a newline. |
| new structure checks | every pair: no shared component names, homepage order differs in ≥ 3 positions (A/B, A/C, B/C: 3 each), header, nav and hero outlines differ, route sets differ and follow `serviceDetailPages`; L1 notice pages clean; L8 identification in every footer; L9 VAT note wherever a price shows |

The machine's load (other applications) made the default QA settings (all cores, 60 s per test) time out in the first run; that run is not counted. `npm run qa` needs local ports, so it ran outside the sandbox.

### Trial client and export

`clients/hnatek-c`: a copy of `clients/hnatek` (which, with `clients/hnatek-b`, was not touched) switched per /site-build step 2 to `nocni-linka` (`noc`, `schibsted-grotesk`, `statement`, `high`; sections hero → services → next-steps → family-story → catalogue-links → contact-summary), with the **white** horizontal logo, and the neutral fixture's placeholder notices, people, FAQ and documents (fictional, `placeholder: true`; people consent entries `null`, so G-074 warns). Not a client deliverable.

- `client:validate -- hnatek-c`: **PROTOTYPE: PASS** (production blocked by G-012, G-020, G-021, G-031, G-032, G-040, G-074, as expected).
- `client:build -- hnatek-c`: 22 pages.
- `client:export -- hnatek-c --force`: **RESULT: PASS (10/10 steps)** (`exports/hnatek-c/`, ignored by Git).
- **Core finding (not fixed here):** the first export failed 9/10 at `astro check`, because `core/content/collections.ts` defines a collection only when its folder exists, so Astro generates no type for a missing `documents/` while `core/content/load.ts` calls `getCollection("documents")` unconditionally. Every client export without one of the optional folders (`notices`, `people`, `faq`, `documents`) fails this step, which includes `hnatek` and `hnatek-b` if they were re-exported today. The trial passes because it has all four folders. Proposed core fix in the report.

### Production build of the fixture

`npm run build:production -w templates/nocni-linka` fails as expected with exactly the fixture's documented rules: G-011 (3), G-012, G-020, G-021, G-031 (50), G-032 (12), G-040 (7), G-073, G-074 (3); G-071 is the expected warning for the expired notice.

### What from the comps is not implemented, and why

| Comp detail | Built instead | Why |
| --- | --- | --- |
| Rail nav of six curated items ("Když někdo zemřel", "Pohřeb bez obřadu", "Lidé a kancelář", …) | core `site.nav` in its locked order with `navLabel`s, plus Pro účastníky, Pohřeb předem, Časté otázky | core fixes nav order and labels; "Pohřeb bez obřadu" is a service, not a page (approved) |
| Lidé as its own page | a "Lidé" statement on `/kontakt/` | `/lide/` is not in the core route contract (approved) |
| High emphasis: 60 px number + `responseNote` line | 48 px number in a 512 px rail; hero repeats the number | 60 px does not fit any rail without wrapping; `responseNote` stays a proposal (instruction) |
| "Vytisknout ceník (A4)" / "Vytisknout oznámení" links | Ctrl/Cmd + P instruction | `window.print()` would exceed "JS only for the nav" (approved) |
| Notices statement placed by the client | rendered after the hero whenever notices are on | core has no `notices` homepage section id (proposal) |
| Amber focus ring (token sheet) | ink focus ring; amber only on the nonstop link | the guardrails reserve amber for the number |
| Price headline per group ("od 14 900 Kč") | first item of a group with inclusion lists | core has no group-level price |
| "Voláte přímo nám." in the rail | `emergency.shortNote` or "Ve dne, v noci i o svátcích." | "directly us, no call centre" is a business fact, not a UI string |

### Open legal questions (⚖, research §4a)

1. **L1, neutral form on notice pages:** is "Oznámení zveřejňuje <brand>." + "Telefon nonstop <number>" (no amber, no "převoz"), the reduced nav (Oznámení · Kontakt · Úvodní stránka) and the footer with office hours and the nonstop number acceptable on `/oznameni/` and notice pages?
2. **L1, home teaser:** the home page links to `/oznameni/` with a neutral sentence and no names. Confirm that this does not count as advertising "v souvislosti s informováním o smrti".
3. **L1 + accessibility:** core fixes the nonstop link's accessible name ("Nonstop převoz zesnulých, volat …"), so screen readers still hear "převoz" on notice pages, and the visible "Telefon nonstop …" is not contained in the name (WCAG 2.5.3). A neutral accessible-name option in core would solve both, if the lawyer wants the word gone.
4. **L9:** prices are shown as `<PriceValue>` with `<VatNote>` in the Ceník lead and on the A4 sheet; service pages show inclusions but no prices. Confirm that the VAT note in the lead (not beside each price) is "near the prices".
5. **L12/L14:** unchanged from core (consent records, livestream as a plain link).

### Screenshots (`docs/notes/screens/nocni-linka/`, local only: the folder is gitignored, as for A and B)

Fixture, default options (`noc`, Schibsted Grotesk, standard): `home-1280`, `cenik-1280`, `oznameni-1280`, `oznameni-jan-vzorovy-1280`, `kontakt-1280`, `jak-postupovat-1280`, `sluzby-1280` (full pages); `home-375` (full) and `home-375-fold`, `oznameni-jan-vzorovy-375-fold`, `jak-postupovat-situace-doma-375-fold`, `kontakt-375-fold`, `404-375-fold`, `pro-ucastniky-375`. Alternate options (`grafit`, Hanken Grotesk, high, reordered sections): `home-1280-grafit-hanken-high-fold`, `home-375-grafit-hanken-high-fold`. Print: `cenik-print-a4.png`. Greyscale recolour test, home at 375 and 1280 for A, B and C: `greyscale/`. Taken with Playwright's Chromium serving `dist/` through request interception (the sandbox blocks local ports). `oznameni-jan-vzorovy-1280`, `oznameni-jan-vzorovy-375-fold`, `kontakt-1280` and `kontakt-375-fold` were retaken after the glued-label fix.
