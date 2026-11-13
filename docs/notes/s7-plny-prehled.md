# S7 · Template D `plny-prehled` (Plný přehled): plan

**Status:** plan approved by the owner 2026-11-11 ("Approve, build it": every [review] item as proposed, default palette `seda-a-terakota`, the S6 collections fix left out); built the same day. Build results are in §10. Built from Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md), with the approved round-2 design H in [docs/designs/plny-prehled/](../designs/plny-prehled/README.md) as the design input (comps per palette, `html/*.html` for exact values, `tokens.json` / `TOKENS.md`). Template C `nocni-linka` exists on this branch and is treated as a peer: no imports, no shared component names, and every pairwise check covers D against A, B and C.

Decisions that need the owner's yes are marked **[review]**. Everything else follows the comps, the contract or an existing pattern. **This template needs core changes (§2): they are proposed here and nothing is edited until they are approved.**

## 1. Concept (from the comps)

For families who want facts, not atmosphere: the practical son or daughter who arranges everything and compares. Every page is a reference sheet, and the home page is a **directory**, like a timetable or a municipal noticeboard: the routes, the key prices, the services and catalogues with counts, the people, the notices count, the documents and the common questions fit on one desktop screen in four ruled columns. On a phone the same index folds into `<details>` rows.

Structural ideas that make it D, not A, B or C:

- **Header with two boxes.** Name and address on the left; on the right a **highlighted nonstop box** (highlight fill, 2 px ink border, label 17–18 px bold, number in mono 30 / 28 px, underlined, `nowrap`) and, beside it, a separate 1 px **Kancelář** box (office hours in mono, office phone). Two boxes, two headings: office hours never share a container with the emergency block.
- **The whole nav in one row** under a 3 px ink rule on desktop (wraps to two lines, never hidden). On a phone the button says **"Rejstřík"** (never a hamburger) and opens every page as a table row with a count or a from-price in mono.
- **Tables and column rules are the only structure.** Key–value tables for contact, notice facts, guest info; a situation × step matrix for the guide; an item table with a "Typ ceny" column for prices; a timetable for notices; a people table with thumbnails or square initials boxes. No hero, no headline over 40 px, no cards, no shadows, no icons, no rounded corners, no section backgrounds.
- **Overpass for words, Overpass Mono for every number** (phones, times, dates, prices, counts).
- **One highlight colour, used only behind the nonstop number.** Never for links, prices or the active nav item.
- **Notice pages** swap the highlight for a plain 1 px box ("Oznámení zveřejňuje <brand>. Telefon nonstop <number>") and reduce the nav row to Oznámení a obřady · Kontakt · Úvodní stránka.

## 2. Core additions **[review]**

H's home is a directory, and core's `HOMEPAGE_SECTIONS` has only `hero`, `family-story`, `services`, `next-steps`, `contact-summary`, `catalogue-links`. Five of the comp's eight home blocks have no section id. The minimal change, keeping A, B and C unchanged (their manifests do not list the new ids, and nothing about the existing ids changes):

### 2.1 Five new homepage section ids

| New id | What it shows (in D) | Valid only when | Data (all loaders exist already) |
| --- | --- | --- | --- |
| `price-summary` | a short price excerpt, the VAT note (`<VatNote>`), links to the full price list | `pricing.visible` (content, see 2.2) | `getPricing()` |
| `people` | the people (thumbnail or initials, name, role, direct line) | `features.people` | `getPeople()` |
| `notices` | **a link with a count only** ("Oznámení a obřady 3 nadcházející"); never names on home (L1) | `features.notices` | `getNoticeIndex().upcoming.length` |
| `documents` | the document links with "PDF" | `features.documents` | `getDocuments()` |
| `faq` | a few questions as links to the FAQ, plus "Všechny otázky" | `features.faq` | `getFaq()` |

Existing ids keep their meaning: `next-steps` (situation links + first-hours steps), `services` (featured services), `catalogue-links` (Rakve / Květiny with counts and up to four thumbnails).

### 2.2 Validation (gate G-005, no new rule number)

- `core/content/config.ts`: add the five ids to `HOMEPAGE_SECTIONS`, and a map `SECTION_FEATURE = { people: "people", notices: "notices", documents: "documents", faq: "faq" }`. `checkConfigAgainstManifest()` reports a section listed in `homepage.sections` whose feature is off: *"Sekce "notices" potřebuje features.notices."* This surfaces as **G-005** (error in prototype and production), like every other config-vs-manifest mismatch. A feature that is on while the template does not support it is already caught by the existing check, so a manifest can only usefully offer a feature-bound section when it supports that feature.
- `price-summary` depends on **content** (`pricing.visible`), which the client can switch in the CMS, so it must never fail a build: a template **renders nothing** for `price-summary` while pricing is hidden, the same way `/cenik/` is not emitted then. Documented in the contract; no gate rule.
- Rejected alternative: silently skipping feature-bound sections when their feature is off. Features are agent-only (`site.config.ts`), so an explicit error is cheap to fix and keeps the config honest.

### 2.3 Tests, CMS, docs

- **Tests** (`core/tests/`): every new id parses in `SiteConfig`; `checkConfigAgainstManifest` reports each feature-bound section while its feature is off and accepts it while on; the gate surfaces it as G-005; the existing A/B/C manifests and their defaults still validate unchanged. `tools/client/tests` and `tools/cms/tests` add D to their template lists.
- **CMS: no change.** Homepage order lives in `site.config.ts`, which is agent-only; `tools/cms/pages-config.ts` reads features and `pageFields`, not sections (checked).
- **Docs:** `docs/template-contract.md` §3 (section id list, which ones need a feature, the `price-summary` rule) and §4 (`/` row: the extra data); `docs/content-contract.md` G-005 row (feature-bound sections); `.claude/skills/site-build/SKILL.md` (the "`hero` first, `contact-summary` required" line becomes "follow the manifest's `constraints`", because D has neither; see 3.1) and the D entry; `.claude/skills/site-revise/SKILL.md` if it names section ids.

### 2.4 Optional, separate from D **[review]**

The S6 export finding is still open on this branch: `core/content/collections.ts` defines an optional collection only when its folder exists, while `core/content/load.ts` names all four in `getCollection()`, so `astro check` fails in `client:export` for any client without `notices/`, `people/`, `faq/` or `documents/` (this includes `hnatek` and `hnatek-b` if re-exported). D's trial avoids it the way C's did (all four folders present). I can fix it in the same core change (always define the four collections, with an empty glob when the folder is missing, plus a test), or leave it for its own task. **Proposed: leave it out of this change** so the D diff stays about D; I'd propose it as a separate session.

## 3. Intended manifest

```ts
{
  id: "plny-prehled",
  name: "Plný přehled",
  version: "0.1.0",
  coreVersion: "^0.1.0",
  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: true,      // index table + one reference sheet per service
    mapEmbed: false,               // map is always a link
    notices: true,                 // /oznameni/ timetable + /oznameni/<slug>/
    people: true,                  // table on /kontakt/#lide and on home
    faq: true,                     // /jak-postupovat/#caste-otazky and the home FAQ row
    documents: true,               // home, footer column, /pravni-informace/#dokumenty
    guestInfo: true,               // /pro-ucastniky/ (drawn)
    prePlanning: true,             // /pohreb-predem/, from the Pro účastníky sheet
    priceInclusions: true,         // "V ceně je zahrnuto" / "Není zahrnuto" on /cenik/ and service sheets
  },
  homepageSections: {
    available: ["next-steps", "price-summary", "services", "catalogue-links",
                "people", "notices", "documents", "faq"],
    default:   ["next-steps", "price-summary", "services", "catalogue-links",
                "people", "notices", "documents", "faq"],
    constraints: { first: "next-steps", required: ["next-steps"] },
  },
  options: {
    palette:           { values: ["bila-a-zluta", "seda-a-terakota"], default: <[review] 3.2> },
    fontPair:          { values: ["overpass", "red-hat"], default: "overpass" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },
  imageSlots: {
    "company.logo":  { aspect: "none", required: false },   // dark logo on light ground; text wordmark while null
    "coffin.item":   { aspect: "4:3",  required: false },   // 64 × 48 on home, larger row thumb on /rakve/
    "flower.item":   { aspect: "1:1",  required: false },   // 48 × 48 on home
    "person.photo":  { aspect: "4:5",  required: false },   // 48 × 60 on home, 64 × 80 in the people table
    "notice.photo":  { aspect: "4:5",  required: false },   // "foto od rodiny" thumbnail beside the name
    "notice.parte":  { aspect: "none", required: false },
  },
  pageFields: {
    home:  ["navLabel", "metaTitle", "metaDescription"],   // see 3.1
    "jak-postupovat", sluzby, rakve, kvetiny, kontakt, cenik, oznameni, "o-nas",
    "pro-ucastniky", "pohreb-predem", "pravni-informace", "ochrana-osobnich-udaju":
           ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
  },
}
```

### 3.1 Notes on the manifest

- **No `hero`, no `contact-summary`, no `family-story`** (guardrail: "never add hero sections"; the design has "no story"). The Kancelář box in the header is on every page, so a home contact block would repeat it. The **first section is fixed to `next-steps`**, because its heading is the page's `<h1>` ("Když někdo zemřel", 22 px, as drawn in `board-*.html`); the other column headings are `<h2>`. The h1 text is a UI string in `cs.ts`, so `pages.home.title` and `lead` are not rendered on home and the CMS hides them (`pageFields.home`); `metaTitle` still sets the `<title>`. **[review]** Alternative: keep `title` editable and use it as the h1 text.
- **Default order** next-steps → price-summary → services → catalogue-links → people → notices → documents → faq follows the comp's columns (1: situations + first hours; 2: prices; 3: services + catalogues; 4: people + notices + documents; then the full-width FAQ row). It differs from A, B and C in at least 5 positions each.
- **Clients can reorder or drop sections** (except the first), and the layout must survive it, so the desktop directory is **CSS multi-column** (`columns: 4`, 20 px padding, 1 px `column-rule` in the rule colour), every section `break-inside: avoid`, and `faq` is `column-span: all` (a full-width row under a 3 px rule wherever it sits). Columns balance by content height, so the client's order is kept and no fixed slot can be left empty. Sections whose data is empty (no featured services, no people, zero upcoming notices still shows the link with "0") render a one-line fallback or nothing, never an empty box.
- **`heroVariant` is not declared** (nothing to vary). Nothing in core, the CMS or the client tools requires it (checked: only C's manifest and the skill text mention it).
- **`fontPair`:** Overpass 400/700 + Overpass Mono 500 (default), or the design's alternative Red Hat Text 400/700 + Red Hat Mono 500. Both are two families, three weights, OFL, `@fontsource/*` 5.3.0 (new dependencies; the lockfile changes); faces split latin / latin-ext with `unicode-range` (S3 lesson); the mono 500 latin face is preloaded (it carries the LCP number). Every weight is checked against "Příliš žluťoučký kůň úpěl ďábelské ódy".
- **`emergencyEmphasis: "high"`:** the header box doubles in height (bigger number, measured so it never wraps), and at 375 px it also repeats as the first row of the page content, as the design note says.

### 3.2 Default palette **[review]**

Both palettes are exactly `tokens.json`, switched by `html[data-palette]` custom properties:

| Palette | ground | ink | muted | highlight | rule |
| --- | --- | --- | --- | --- | --- |
| `bila-a-zluta` (Bílá a žlutá) | `#FFFFFF` | `#111111` | `#4A4A4A` | `#F2C230` | `#8A8A8A` |
| `seda-a-terakota` (Šedá a terakota) | `#F2F2F0` | `#141414` | `#4A4A4A` | `#E8B98C` | `#868684` |

The design's self-check flags **yellow on the urgent line** as a ban-list risk (sector rule against cheerful colour on the emergency CTA) and leaves the default to the owner. **Proposed default: `seda-a-terakota`**: it keeps the same structure and contrast (ink on highlight 10.31 : 1) without the warning-sign reading, and `bila-a-zluta` stays available for a client who wants the stronger timetable look. If you prefer yellow as the default, nothing else changes.

Both highlights fail 3 : 1 against the ground on their own (1.68 and 1.59), so the box **always** keeps its 2 px ink border; in print the fill becomes a 2 px black box.

## 4. Pages and composition

Exact values from `html/*.html`: body 18 / 1.45; section heading 22 bold with a 1 px ink underline; H1 40 / 32 px (1280 / 375) on inner pages; mono 18–30 for numbers (never below 18: the home comp's 17 px mono hours are built at 18); spacing 4 · 8 · 12 · 16 · 24 · 32; side margin 32 px at 1280, gutter 16 px at 375; radius 0; links ink, underlined with a 4 px offset. Middle dots are separator elements with their own margin, or plain lists (the Overpass `·` quirk), never a literal "·" between words.

| Route | Composition | Drawn? |
| --- | --- | --- |
| `/` | Header + nav row; the **directory** (§3.1) with the sections in config order. At ≥ 64 rem every section is open; below it each is a `<details>` row (summary = heading + a mono hint: from-price, count), the first open. | 1280, 375 |
| `/jak-postupovat/` | H1 + the four **situation buttons** (the only filled controls; picked = inverted with "vybráno"); the **situation matrix**: rows = published steps (number + title, "Co udělat" = summary, with the nonstop link where `contactPrompt` is emergency), columns Doma · Nemocnice · Domov · Zahraničí with "ano" / "—" from `situations` (`any` = ano everywhere). Picking (`:target` + `:has()`, no JS, core `guidance-flow.ts`) hides the other columns and the rows that do not apply. At 375: unpicked = table of all steps with "Platí pro"; picked = one compact checklist with real checkboxes; long text in `<details>`. Then **Časté otázky** (`#caste-otazky`): grouped by topic, each question a `<details>`. "Vytisknout postup" → print instruction (see §7). | 1280, 375 ×2 |
| `/sluzby/` | H1, lead; **index table**: služba · co zahrnuje (summary) · cena (mono, from the linked price group's first item) · Detail; VAT note under the table. | 1280 |
| `/sluzby/<slug>/` | Reference sheet built from Služby + Ceník: H1, summary as lead, key–value table (kategorie, cena + VAT note when a price shows), "V ceně je zahrnuto / Není zahrnuto" lists from the linked group, body, link "Celý ceník". | from Služby |
| `/cenik/` | H1, VAT note under the title, "Verze k tisku (A4)" instruction, `<DemoPricingNotice>`; **package groups** (groups with inclusion lists) two side by side under 3 px rules, group headline price in mono at the right of the title, two lists; **Jednotlivé položky** table: Položka · Popis · **Typ ceny** (pevná / za jednotku / rozpětí / od / na dotaz, derived from `kind` + `unit`) · Cena (mono, right, `nowrap`); VAT note again under the table. | 1280 |
| `/cenik/` print | `print.css`: the same tables; packages become one table with included / excluded columns; the highlight becomes a 2 px black box; letterhead, legal identification, URL. | A4 |
| `/kontakt/` | H1; key–value tables: **Kontakty** (address + map link, office phones, e-mail), **Úřední hodiny** (`data-office-hours`), **Převoz** (`data-emergency-block`: availability, area, the nonstop link); **Lidé** (`#lide`) table when people are on. | 375 |
| people | Table: 64 × 80 thumbnail **or a square initials box** (core `personInitials`), name, "Na starosti", direct line in mono or "—". Without any photo the thumbnail column still shows initials boxes, as drawn. | 1280 ×2 |
| `/oznameni/` | **Neutral chrome**; H1, consent sentence; **timetable** (1280): datum · čas · jméno (link) · místo · obřad · přenos, em dash for missing values; "Nedávná oznámení" as a second table; at 375 each notice = name + a 3-row mini table. Empty state: one sentence. | 1280, 375 |
| `/oznameni/<slug>/` | **Neutral chrome**; back link; H1 name + optional 4:5 photo thumbnail; ceremony sentence; **fact table** (Narozena, Zemřela, Rozloučení, Místo + map, Obřad, Přenos as a plain link, Kondolence, Od rodiny); QR (`<NoticeQrCode>`) + print hint. Nothing promotional. | 375 |
| `/pro-ucastniky/`, `/pohreb-predem/` | Reference sheet: H1, lead; the Markdown body with each `##` as a ruled block; lists render as ruled rows (key–value where the item is "Label: value"). | pro-ucastniky 375 |
| `/rakve/`, `/kvetiny/` | Built from Lidé: a table (thumbnail or nothing, name, code / material or type, summary); zero items: one sentence + office phone; Květiny ends with the flowers phone row. | from Lidé |
| `/o-nas/` | Built from Pro účastníky: H1, lead, body as ruled blocks; no photo (guardrail: nothing larger than a thumbnail). | from Pro účastníky |
| `/pravni-informace/` | Built from Kontakt: key–value tables "Mimosoudní řešení sporů" (ADR + adr.coi.cz), "Reklamace", **Dokumenty** (`#dokumenty`: title link, PDF, valid from), body. | from Kontakt |
| `/ochrana-osobnich-udaju/` | H1 + body as ruled blocks. | from Pro účastníky |
| `/404.html` | "Stránka nenalezena" + the whole index as `<details>` rows (the Rejstřík list). | 375 |

**Navigation.** Core fixes the nav order and takes labels from `navLabel`, so the comp's "Pohřeb bez obřadu" (a service, not a page) cannot be a nav item; this was approved for C. The row shows `site.nav` without "home" (the name links home), plus Lidé (`/kontakt/#lide`), Pro účastníky, Pohřeb předem, Časté otázky (`/jak-postupovat/#caste-otazky`) and Dokumenty (`/pravni-informace/#dokumenty`) when on, before Kontakt. The current page is bold (never the highlight). Rejstřík (375): the same list as table rows with counts (`7 kroků`, `3`, `od 14 900 Kč`, `3 PDF`) in mono.

**Footer (every page):** 3 px rule; columns Kancelář · Nonstop převoz · Dokumenty (PDF) · Právní (Právní informace, Ochrana osobních údajů, adr.coi.cz); legal row with legal name, sídlo, IČO, register entry. Notice pages: no Dokumenty column, "Telefon nonstop" in ink, same legal row.

## 5. Component inventory (all new; none matches a name in A, B or C)

| Area | Components |
| --- | --- |
| Layout | `layouts/IndexLayout.astro` (options → `data-*` on `<html>`, SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`, `neutral` prop) |
| Chrome | `IndexHeader`, `NonstopBox` (standard / high), `OfficeBox` (`data-office-hours`), `PublisherBox` (neutral notice form), `NavRow` (full / reduced), `RegisterPanel` (Rejstřík rows with counts), `IndexFooter` (full / neutral), `Sep` (separator element) |
| Home | `DirectorySection` (shell: `data-section`, `<details>` below 64 rem), `FirstHoursCell`, `PriceExcerptCell`, `ServiceListCell`, `CatalogueCountCell`, `PeopleCell`, `NoticeCountCell`, `DocumentListCell`, `QuestionRow` |
| Guidance + FAQ | `SituationButtons`, `SituationMatrix`, `PickedChecklist`, `QuestionDetails` |
| Pricing | `PackagePair`, `ItemPriceTable` (Typ ceny), `PrintPackageTable`, `PrintLetterhead` + `styles/print.css` |
| Notices | `CeremonyTimetable` (table at 1280, mini tables at 375), `NoticeFactTable`, `NoticeQrBlock` |
| Contact, people | `ContactTable`, `TransportTable` (`data-emergency-block`), `PeopleTable`, `InitialsBox` |
| Services, catalogue, legal | `ServiceIndexTable`, `ServiceSheet`, `CatalogueTable`, `NoCatalogueItems`, `AdrTable`, `DocumentTable`, `ReferenceBody` (Markdown body as ruled blocks) |

Plus `src/i18n/cs.ts`, `src/lib/options.ts`, `src/lib/price-kind.ts` (Typ ceny labels), `src/styles/global.css`, `fonts.css`, `print.css`. No Tailwind (plain CSS like C, so no utility-name collisions). Core safety components are styled only through `class` + global CSS or their `data-*` hooks.

**Phone links never use flex.** Every label-plus-number link is `inline-block` with an explicit `{" "}` between label and number (S6 lesson; QA test 9).

**JavaScript [review].** One inline script, target ≤ 1 KB: the Rejstřík toggle (`aria-expanded`, "Rejstřík" ↔ "Zavřít", Escape closes; without JS the list is shown in flow), **and** on screens below 64 rem it closes the home directory's `<details>` except the first. The HTML ships every directory section `open`, so without JS (and on desktop) the directory is complete and the disclosure state is true for assistive tech. This keeps the guardrail "`<details>` sections on phones" without a CSS hack that would show content while the summary reports "collapsed". It is the home index, the same list as the nav menu, so I treat it as part of the nav disclosure budget; the alternative is all rows closed on phones by default with no script, which leaves desktop rendering every section as a closed row.

## 6. Differentiation row (design-differentiation §5)

| Dimension | A Rodinná tradice | B Důstojná jednoduchost | C Noční linka | **D Plný přehled** |
| --- | --- | --- | --- | --- |
| Header | centred letterhead | left logo, right nav, sticky | sticky side rail | **name + two boxes (nonstop highlight, Kancelář) + full nav row under a 3 px rule** |
| Emergency CTA | dark utility strip | header button + bottom bar | the rail itself | **highlighted header box; plain 1 px box on notices** |
| Mobile navigation | in-flow full-height list | dropdown under sticky header | in-flow list under the panel | **"Rejstřík": every page as a table row with counts** |
| Homepage order | hero → story → services → steps → visit | hero → steps → services → contact → story | hero → [notices] → services → steps → story → office | **steps → prices → services → catalogues → people → notices → documents → FAQ, no hero** |
| Hero | editorial, image or panel | practical, CTA tier | one text statement, one screen | **none: the directory starts at once** |
| Services IA | one long page | index + detail | statement index + detail | **index table + reference sheets** |
| Guidance | article + margin TOC | phased checklist | one step per statement | **situation × step matrix; picked = one checklist** |
| Catalogues | figure gallery | uniform grid | ruled rows | **table with small thumbnails; counts on home** |
| Pricing | `dl` + dot leaders | `table` per group | statement per group | **package pair + one item table with "Typ ceny", identical on A4** |
| Notices | – | – | large-type agenda | **timetable: datum · čas · jméno · místo · obřad · přenos** |
| About | long-form, drop cap | fact sheet first | statements, one photo | **reference sheet, no photo** |
| Footer | rich letter | compact two rows | four columns on the rail colour | **3 px rule, four ruled columns, legal row** |
| Typography | serif + humanist sans | neutral grotesque | one grotesque, 76 px H1 | **highway-sign sans + mono for every number; H1 ≤ 40 px** |
| Colour | warm paper, umber | cool slate, forest | dark ground, amber | **white or light grey, black ink, one highlight** |
| Image use | larger, fewer, captioned | minimal, uniform | none on home | **thumbnails only (≤ 64 × 80)** |
| Separation | hairlines, small caps | 1 px lines, tinted bands | darkness and space | **column rules and table rules; 3 px ink rules** |

## 7. Law (research §4a) and things I will not build

- **L1, notices:** neutral chrome (plain box, reduced nav, no Dokumenty column), no `PriceValue`, no service links, no "Objednat", no homepage sections on `/oznameni/` and notice pages. Home shows notices only as a link with a count, never names. ⚖ The plain box, the reduced nav and the home link need the lawyer. The S6 accessibility note applies here too: core fixes the emergency link's accessible name ("…převoz…, volat …"), so the neutral visible text is not contained in it.
- **L8** legal identification in every footer (neutral included); **L9** `<VatNote>` under the Ceník title and under the table, on home with the price excerpt, under the Služby index, on the A4 sheet and on any service sheet that shows a price; **L10** ADR + Právní informace in every footer; **L11** no cookies, no third-party requests, fonts self-hosted; **L14** livestream as a plain link. No newsletter or e-mail capture.
- **Print links** ("k tisku (A4)", "Vytisknout postup", "Vytisknout oznámení") become a short Ctrl/Cmd + P instruction, as approved for C. **[review]**: same answer as for C unless you say otherwise.
- **"PDF" next to "Verze k tisku"** on Ceník: core has no price-list document kind, so the link is left out; the print stylesheet is the A4 version.
- **Comp nav items "Pohřeb bez obřadu"** (a service) and a separate **Lidé page** (`/lide/` is not a core route): people live on `/kontakt/#lide`, as in C.
- **Home price excerpt rows [review].** The comp shows five hand-picked rows. Core has no "show on home" flag, so I take **the first item of each visible price group, up to five rows** (the hint on the 375 summary is the lowest of their amounts). No core change. Alternative: a core field `PriceItem.summary` (CMS checkbox "Zobrazit na úvodní stránce") with that rule as the fallback.

## 8. Registration and verification plan

- `qa/templates.ts`: add `plny-prehled` (letter D, port 4414). `qa/structure.spec.ts` already runs the pair checks over `templatePairs()`; confirm every check (component names, imports, order ≥ 3 positions, header / nav / hero outlines, route sets, L1 notice pages, L8 footers, L9 VAT note) covers the six pairs, and generalise anything still hard-coded to three templates. D's `main` children carry `data-section`, so the order check reads it without change.
- `tools/client/new.ts` usage text; `tools/client/tests` and `tools/cms/tests` template lists; `.claude/skills/site-build/SKILL.md` (when to choose D: clients who want a factual, complete overview and have real prices and documents; image slots; supported types; the palette question); `docs/design-differentiation.md` section + matrix column.
- Verify in order: `npm test`, `npm run lint`, `npm run typecheck`; `npm run build -w templates/plny-prehled` (prototype) and `build:production` (expect exactly the fixture's gate rules); `npm run qa` for A, B, C and D (`--workers=4 --timeout=240000`, outside the sandbox; axe serious/critical = 0); Lighthouse mobile via `npx lighthouse` with `CHROME_PATH` on Playwright's Chromium 1248 for home, jak-postupovat, cenik, oznameni; trial client `clients/hnatek-d` (copy of `clients/hnatek`, template switched, placeholder notices / people / FAQ / documents, all four folders present) → `client:validate`, `client:build`, `client:export -- hnatek-d` (RESULT: PASS 10/10); greyscale screenshots at 375 and 1280 beside A, B and C; the §7 scorecard against A, B and C (≥ 11/15, no dimension < 2); contrast per palette computed and recorded; budgets (HTML + CSS ≤ 100 KB gzip, JS ≤ 10 KB, LCP image ≤ 200 KB).
- `clients/hnatek`, `clients/hnatek-b` and `clients/hnatek-c` are not touched. Nothing is committed until asked.

## 9. Summary of what needs your answer

1. **Core additions (§2.1–2.3):** five section ids (`price-summary`, `people`, `notices`, `documents`, `faq`), feature-bound ones checked under G-005, `price-summary` rendering nothing while pricing is hidden, tests and docs, no CMS change.
2. **The S6 collections fix (§2.4):** proposed to stay out of this change.
3. **Default palette (§3.2):** proposed `seda-a-terakota`; `bila-a-zluta` stays an option.
4. **Home h1 and manifest shape (§3.1):** no hero / contact-summary / family-story, `next-steps` fixed first, h1 "Když někdo zemřel" from `cs.ts`, no `heroVariant`.
5. **The ≤ 1 KB script that also folds the home directory on phones (§5).**
6. **Print instructions instead of print links (§7)** and **the price excerpt rule (§7)**.

## 10. Build results (2026-11-11)

### What was built

| Area | Files |
| --- | --- |
| Core (approved §2) | `core/content/config.ts`: five section ids (`price-summary`, `people`, `notices`, `documents`, `faq`), `SECTION_FEATURE`, the G-005 check for feature-bound sections, and `defaultSectionsFor()` (default order without sections whose feature is off; used by `client:new`, which starts every optional feature off). Tests in `core/tests/optional-types.test.ts` (parsing, accepted / rejected per feature, `price-summary` without a feature, `defaultSectionsFor`) and `core/tests/gate.test.ts` (G-005 as an error in prototype and production, through `runGateForSite` with a temporary config). Docs: template-contract §3 and §4, content-contract G-005, site-build skill. No CMS change (checked: the CMS reads features and `pageFields`, not sections). |
| Wiring | `templates/plny-prehled/`: `package.json` (`@site/template-plny-prehled`, scripts like B's, `@fontsource/overpass`, `overpass-mono`, `red-hat-text`, `red-hat-mono` 5.3.0, `astro` 7.4.2), `astro.config.mjs` (plain CSS, no Tailwind), `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`, `fixture.site.config.ts` (every optional type on, default options, all eight sections), `template.manifest.ts` (as §3, default palette `seda-a-terakota`) |
| Shell | `src/layouts/IndexLayout.astro`: options → `data-palette`, `data-font`, `data-emphasis` on `<html>`; preloads the mono 500 and the sans 700 latin faces; SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`; `neutral` and `foldDirectory` props; one inline script (Rejstřík toggle + folding the home directory on phones), 1.5 KB raw / 0.7 KB gzip with the `no-js` swap |
| Components (37, all new names) | `IndexHeader`, `NonstopBox`, `OfficeBox`, `PublisherBox`, `NavRow`, `IndexFooter`, `Sep`, `SheetHead`, `ReferenceBody`, `DirectorySection`, `FirstHoursCell`, `PriceExcerptCell`, `ServiceListCell`, `CatalogueCountCell`, `PeopleCell`, `NoticeCountCell`, `DocumentListCell`, `QuestionRow`, `SituationButtons`, `SituationMatrix`, `PickedChecklist`, `QuestionDetails`, `PackagePair`, `ItemPriceTable`, `ServiceIndexTable`, `ContactTable`, `TransportTable`, `PeopleTable`, `InitialsBox`, `CatalogueTable`, `NoCatalogueItems`, `AdrTable`, `DocumentTable`, `CeremonyTimetable`, `NoticeFactTable`, `NoticeQrBlock`, `RegisterList` |
| Lib, strings, styles | `src/lib/directory.ts` (index entries, price-kind labels, excerpt rule, location helpers), `src/lib/index-entries.ts` (counts through core loaders), `src/lib/options.ts`; `src/i18n/cs.ts`; `src/styles/fonts.css` (latin + latin-ext faces with `unicode-range`, both pairs), `global.css`, `print.css` |

**Routes (fixture, every optional type on): 24 pages.** `/`, `/jak-postupovat/`, `/sluzby/` + 7 reference sheets, `/rakve/`, `/kvetiny/`, `/o-nas/`, `/kontakt/`, `/cenik/`, `/oznameni/` + 3 notices, `/pro-ucastniky/`, `/pohreb-predem/`, `/pravni-informace/`, `/ochrana-osobnich-udaju/`, `/404.html`.

**Inventory changes against §5:** `RegisterPanel` became `NavRow` (one `<nav>` that is the desktop row and the phone Rejstřík panel) plus `RegisterList` (the 404 index); `PrintPackageTable` and `PrintLetterhead` were dropped: a hidden print-only copy of the prices would carry `<PriceValue>` labels that are not visible on screen (QA test 8), so `print.css` re-lays the same packages as rows instead, and the header itself prints as the letterhead.

### Decisions taken while building

- **Directory layout.** `main` itself is the CSS multi-column container (4 columns ≥ 64 rem, 2 ≥ 48 rem, 1 px rule-colour column rules), so every section stays a direct child of `main` with its `data-section` and the client's order is kept; `faq` is `column-span: all` under a 3 px rule, its heading floated into the first quarter (a grid on `<details>` does not reach its content box). Columns balance by content height, so the drawn column split is reproduced with the fixture but not fixed.
- **Sections that have nothing to show are left out** (no people, no documents, no questions, pricing hidden), so no empty cell is drawn; the first rendered section's heading is the h1 (`next-steps` is fixed first, so in practice "Když někdo zemřel").
- **`<details>` everywhere on home.** Each cell is `<details open>`; on wide screens the summary is styled as the column heading (marker hidden). On phones the inline script closes every row but the first before first paint, and the summaries get a ▶ / ▼ drawn in text (a flex summary drops the native marker).
- **The nav comes right after the Rejstřík button in the DOM** (grid areas still draw it under the boxes), so Tab after opening enters the menu (QA test 7). The `<nav>` landmark is always present; only the panel inside it hides.
- **Wide tables stack on phones** (Ceník items, Služby, Rakve / Květiny, recent notices, Lidé): one block per row, each value prefixed with its column name. A horizontally scrolling table would need its own tab stop (axe `scrollable-region-focusable`) and is harder to read on a phone.
- **The Ceník row in the Rejstřík** shows the first group's first price through `<PriceValue>`, so the panel carries `<VatNote>` too (L9). It is left out on `/cenik/` itself, where the demo notice must come before the first price (QA test 8).
- **Price headline per package.** A package (group with inclusion lists) with one item shows that item's price at the right of the title, as drawn; with several items it lists them under the title. Core has no group price, and showing one item's price as the group's would misattribute it.
- **The highlight is never the focus colour.** Focus is a 3 px ink ring everywhere, the current nav item is bold, the situation buttons invert to ink.
- **Phone links are never flex containers** (S6 lesson); every `tel:` link is `inline-block` with 0.625 rem block padding (≥ 44 px), and labels are followed by `{" "}`.
- **High emphasis**: the box doubles its padding and the number grows to 44 px on desktop; on phones the box (with the Kancelář box) moves above the name row. The comp's "repeats as the first row of the page" is read as that move: a second copy of the number would add a second identical CTA to every page.
- **Office phone in the Kancelář box on every page** (the comps show it on home only).

### Contrast (computed, WCAG 2.x)

| Pair | Šedá a terakota | Bílá a žlutá | Use |
| --- | --- | --- | --- |
| ink on ground | 16.44 | 18.88 | body text, headings, links, focus ring (3 px) |
| muted on ground | 7.91 | 8.86 | addresses, counts, notes, markers |
| ink on highlight | 10.31 | 11.27 | nonstop label and number in the box |
| highlight on ground | 1.59 | 1.68 | box edge: fails alone, so the box always has a 2 px ink border |
| rule on ground | 3.25 | 3.45 | column and table rules (UI ≥ 3 : 1) |
| ground on ink | 16.44 | 18.88 | picked situation button (inverted) |
| ink on thumbnail placeholder | 12.64 | 13.47 | thumbnail placeholder fill |

Print: `#111` on white 18.88, `#333` 12.63, rules `#8A8A8A` 3.45; the highlight prints as a 2 px black box.

### Budgets

`dist/`, gzip: HTML at most 5.6 KB per page (`/jak-postupovat/`), one CSS file 4.9 KB, so HTML + CSS ≤ 10.5 KB per page (limit 100 KB); inline JS 1.5 KB raw (limit 10 KB); no images on the first screen except small thumbnails. Fonts: two preloaded faces (Overpass Mono 500 latin 13 KB, Overpass 700 latin 17 KB), the rest on demand; no third-party requests.

### Distinctiveness scorecard (design-differentiation §7)

Scored 0–3 per dimension from the built pages, the DOM outlines recorded by QA (`docs/qa/structure.json`) and the greyscale screenshots (`docs/notes/screens/plny-prehled/greyscale/`, home at 375 and 1280 for A, B, C and D).

| Dimension | D vs A (Rodinná tradice) | D vs B (Důstojná jednoduchost) | D vs C (Noční linka) | Evidence |
| --- | --- | --- | --- | --- |
| Composition (page layouts, section order) | 3 | 3 | 3 | D has no hero: a four-column ruled directory with every route, prices, catalogues, people, notices count, documents and an FAQ row in the first desktop screen; every inner page is tables. A: editorial hero + prose; B: practical hero, CTA tier, bands; C: one statement per screen. Order differs in 5+ positions from each. |
| Navigation (header, mobile nav, CTA pattern) | 3 | 2 | 3 | D: name + highlighted nonstop box + separate Kancelář box, the whole nav in one row under a 3 px rule, "Rejstřík" with counts on phones. A: centred letterhead + dark strip; C: sticky side rail. B also has a top header with an inline nav, but a single CTA button, a dropdown menu and a fixed bottom bar. |
| Typography (families, scale, hierarchy) | 3 | 2 | 2 | D: Overpass + Overpass Mono for every number, 18 px body, 22 px section heads, H1 ≤ 40 px. A is serif-led. B and C are sans too, but B has no mono and C's scale (76 px H1, 56 px price headings) is the opposite of D's. |
| Image usage (size, frequency, crops, captions) | 3 | 2 | 2 | D: thumbnails only (48–96 px), on home too (catalogue and people). A: large warm photos beside the hero; B: one optional hero image after the CTAs, uniform grids; C: no images on home, larger 4:5 portraits. |
| Content hierarchy (what comes first, depth of IA) | 3 | 3 | 3 | D shows everything at once with counts (the index *is* the content); A leads with the family story, B with the CTA and first steps, C with one decision per screen. C and D share the services IA (index + detail pages); their structure differs (statements vs index table and reference sheets, checked by QA). |
| **Total** | **15 / 15** | **12 / 15** | **13 / 15** | all pass (≥ 11, no dimension < 2) |

All three pairs stay "conservative and credible" to the reviewer's judgement: no ornament, no motion, no hero, plain Czech; D's only colour is behind the nonstop number.

### Speed

**Lighthouse 12, mobile (default emulation), Playwright's Chromium 1248, fixture build in prototype mode**, load average ~10–15:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 96 | 66 | 1.5 s | 0 | 0 ms | 121 KiB |
| `/jak-postupovat/` | 100 | 100 | 96 | 66 | 1.5 s | 0 | 0 ms | 122 KiB |
| `/cenik/` | 100 | 100 | 96 | 66 | 1.5 s | 0 | 0 ms | 121 KiB |
| `/oznameni/` | 100 | 100 | 96 | 66 | 1.5 s | 0 | 0 ms | 120 KiB |

Best practices 96: the fixture has no `public/favicon.ico`; SEO 66: prototype builds are `noindex` and `robots.txt` disallows all. Both by design, as for C. CLS 0 on home confirms the folding script runs before first paint.

### Verification

| Step | Result |
| --- | --- |
| `npm test` | 14 files, 255 tests passed (core section tests, `defaultSectionsFor`, D in the client and CMS template lists) |
| `npm run lint` | clean |
| `npm run typecheck` (tsc + harness check) | 0 errors |
| `npm run check -w templates/plny-prehled` | 0 errors, 0 warnings, 0 hints |
| `npm run build -w templates/plny-prehled` | 24 pages (fixture, prototype) |
| `npm run build:production -w templates/plny-prehled` | fails with exactly the fixture's rules, identical to C: G-011 (3), G-012, G-020, G-021, G-031 (50), G-032 (12), G-040 (7), G-073, G-074 (3); G-071 the expected warning |
| `npm run qa` (A, B, C, D; `--workers=4 --timeout=240000`, outside the sandbox) | first run: A, B and C 819 / 819; D failed 65 (nav landmark hidden with the closed Rejstřík, Tab after opening not entering the menu, a 43.7 px notice link, scrollable tables, `pointer-events: none` summaries, long e-mails at 320 px) and one structure check (below). After the fixes, D + structure: **393 / 393**. **Final full run (A, B, C, D + structure): 1212 / 1212 passed** (2.5 min). axe serious/critical: 0 on every page of every template. |
| option variant (`bila-a-zluta`, `red-hat`, `high`, sections reordered with `faq` second) | 24 pages; screenshots at 320, 375 and 1280 and print: the number never wraps, the FAQ row spans the columns wherever it sits |

**QA change (shared, flagged for the owner):** "route sets differ for every pair" failed for C/D: both support every optional type and both use service detail pages, so they emit the same 24 routes. With only two services IAs (anchors or detail pages), any four templates must have a pair that shares one. The check now passes such a pair only if the DOM outlines of `/sluzby/` and of a service detail page differ (tags and roles, no classes); pairs with different route sets are unchanged. C/D pass on structure. The alternative was to drop a supported content type from D just to change its routes, which would have made D worse to satisfy the check.

### Trial client and export

`clients/hnatek-d`: a copy of `clients/hnatek` (which, with `clients/hnatek-b` and `clients/hnatek-c`, was not touched) switched per /site-build step 2 to `plny-prehled` (`seda-a-terakota`, `overpass`, `high`; all eight sections), with the normal dark logo, and the neutral fixture's placeholder notices, people, FAQ and documents (fictional, `placeholder: true`; people consent entries `null`, so G-074 warns; all four optional folders present, see §2.4). Not a client deliverable.

- `client:validate -- hnatek-d`: **PROTOTYPE: PASS** (production blocked by G-012, G-020, G-021, G-031, G-032, G-040, G-074, as for hnatek-c).
- `client:build -- hnatek-d`: 22 pages.
- `client:export -- hnatek-d --force`: **RESULT: PASS (10/10 steps)** (`exports/hnatek-d/`, ignored by Git).

### What from the comps is not implemented, and why

| Comp detail | Built instead | Why |
| --- | --- | --- |
| Nav items "Pohřeb bez obřadu", "Otázky", a "Lidé" page | core `site.nav` in its locked order with `navLabel`s, plus Lidé (`/kontakt/#lide`), Pro účastníky, Pohřeb předem, Časté otázky (`/jak-postupovat/#caste-otazky`), Dokumenty (`/pravni-informace/#dokumenty`) | core fixes nav order and labels; "Pohřeb bez obřadu" is a service; `/lide/` is not a core route (as approved for C) |
| Five hand-picked price rows on home | first item of each group, at most five | approved §7; core has no "show on home" flag |
| "k tisku (A4)", "Vytisknout postup", "Vytisknout oznámení" links; "PDF" beside Verze k tisku | Ctrl/Cmd + P instructions; no PDF link | approved §7 (no JS beyond the nav); no price-list document kind |
| Mobile 375 summary hint "od 14 900 Kč" as the lowest price | the first excerpt row's price through `<PriceValue>` (with UKÁZKA while demo) | `<PriceValue>` is the only way to show a price; a computed minimum would be a new number |
| Fixed column split (situations · prices · services + catalogues · people + notices + documents) | CSS columns balanced by content | the client may reorder or drop sections; fixed slots would leave holes |
| Kancelář box with the phone on home only | the office phone in the box on every page | consistency; the box is the office contact |
| High emphasis "repeats as the first row of the page" at 375 | the boxes move above the name row | a second copy of the number on every page would be a duplicate CTA |
| Notice list: "bez obřadu" notices among the upcoming rows | core's split: upcoming = ceremony on or after the build date; the rest under "Nedávná oznámení" | `getNoticeIndex()` decides; a template-side regrouping would diverge from core |

### Open legal questions (⚖, research §4a)

1. **L1, neutral form:** is the plain box "Oznámení zveřejňuje <brand>. Telefon nonstop <number>", without the Kancelář box, with the reduced nav (Oznámení · Kontakt · Úvodní stránka) and the footer (office hours, "Telefon nonstop", legal row), acceptable on `/oznameni/` and notice pages?
2. **L1, home:** the home directory shows notices only as "Oznámení a obřady N nadcházející", in the same screen as prices and services. Confirm that a count without names is not advertising "v souvislosti s informováním o smrti".
3. **L1 + accessibility:** as for C, core's fixed accessible name of the nonstop link still says "převoz" on notice pages, and the visible "Telefon nonstop …" is not contained in it (WCAG 2.5.3).
4. **L9:** the VAT note sits under the price title and the items table on Ceník, under the home excerpt, under the Služby index, on service sheets and in the Rejstřík panel. Confirm that this is "near the prices".
5. **L12 / L14:** unchanged from core (consent records for people and notices; livestream as a plain link).

### Screenshots (`docs/notes/screens/plny-prehled/`, local only: the folder is gitignored)

Fixture, default options: home 1280 and 375 (full), jak-postupovat 1280 and 375 with Doma picked, Ceník 1280 and its print layout, Kontakt 375, Oznámení 1280 and 375, a notice at 375, Služby 1280, Pro účastníky 375, 404 375, the open Rejstřík at 375; the option variant at 1280 and 375 (fold); `greyscale/` with A, B, C and D at 375 and 1280 and two contact sheets.
