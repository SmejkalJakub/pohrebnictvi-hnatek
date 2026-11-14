# S9 · Template F `rodinny-rozhovor` (Rodinný rozhovor): plan

**Status:** approved 2026-11-13 ("Approve, build it": every **[review]** item as proposed) and built; results in §11. Nothing is committed. Built from Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md), with the approved round-2 design I in [docs/designs/rodinny-rozhovor/](../designs/rodinny-rozhovor/README.md) as the design input (comps per palette `hlina` and `med`, `html/*.html` for exact values, `tokens.json` / `TOKENS.md`). Templates C `nocni-linka` and D `plny-prehled` exist on this branch and are peers: no imports, no shared component file names, and every pairwise check covers F against A, B, C and D.

**Parallel build.** Template E `ticha-krajina` is being built at the same time from the same base (plan note s8, port 4415, rule G-077, singleton `site/landscapes.json`). F reserves port **4416**, rule **G-078**, plan note **s9** and trial client **`clients/hnatek-f`**. Where both register in the same list, F's entry is a separate line after D's, so the merge conflicts are line-level. The core addition in §2 copies E's landscape pattern name for name (singleton next to `legal`, a `CONTENT_FEATURES` entry, a `supports` flag, a slot prefix, the gate collecting the images only while the feature is on), so the two diffs have the same shape.

Decisions that need the owner's yes are marked **[review]**. Everything else follows the comps, the contract or an approved pattern from C and D.

## 1. Concept (from the comps)

For a small family firm that wants the site to sound like the first phone call with them: warm, direct, human. **The site is a conversation.** Every heading is a question the family is asking ("Kdo nám pomůže hned?", "Co nás teď čeká?", "Kolik to bude stát?"), answered in two or three plain sentences, and **the answer to the first question is the nonstop number**. Full-bleed warm colour fields (cream and sand, the first one deep clay) do all the separating; commissioned pen drawings replace photographs, and the only photograph is the people under "Kdo jste?".

Structural ideas that make it F, not A, B, C or D:

- **Question-and-answer sections on alternating full-bleed fields.** Each section is a field (`<section>`, edge to edge): the question as the heading in cols 1–4, the answer in cols 6–10/11, an optional drawing in the last columns. Fields alternate sand and cream; deep clay is used only for the nonstop number. No rules between sections, no cards, boxes, shadows, rounded corners or icons; tables are borderless.
- **The nonstop number is the answer to the H1.** Home: the clay field "Kdo nám pomůže hned?" → "My." + the short note → the 54 / 36 px underlined number. Inner pages: a **compact clay strip** under the header ("Potřebujete nás hned? Nonstop převoz zesnulých" + 30 px number). Every page except notices **ends with the same closing sentence** "Kdykoli potřebujete, volejte +420 …".
- **Always-visible word navigation, no menu button, no JavaScript at all.** At most six words; at 320 px they wrap into three rows of 44 px targets.
- **Alegreya for text, Alegreya Sans only for nav and labels.** 21 px body, 30 px answer lead, 64 / 36 px H1, 44 / 30 px H2.
- **Notice pages** drop the clay, the fields and the drawings: plain cream, nav reduced to "Oznámení a obřady · Kontakt", a sand strip "Oznámení zveřejňuje <brand>. Telefon nonstop <number>", no closing sentence.

## 2. Core addition: the illustration set **[review]**

The drawings are part of the design (hero margin, guidance margin, services margin, office door, contact), and no core field can hold a client's set of drawings per slot: page `heroImage` / `secondaryImage` give one or two images per page and none for home sections. The design proposes `illustrations[]` with `{ slot, image, alt }`. Every layout is complete without them. The minimal addition, leaving A–D unchanged in behaviour and mirroring E's landscape set:

### 2.1 Where it lives and its schema

- **An optional site singleton `src/content/site/illustrations.json`**, registered in `OPTIONAL_SINGLETON_SCHEMAS` next to `legal` (and, after the merge, `landscapes`). A singleton, not a collection, for the same reasons as E: one short list, no slugs or Markdown, and no "missing optional collection folder" `astro check` failure (S6).
- Schema (`core/content/schemas.ts`, new §6.19 after E's §6.18):

  ```ts
  export const ILLUSTRATION_SLOTS = ["hero", "guidance", "contact", "office", "services"] as const;
  export const IllustrationImage = z.object({
    slot: z.enum(ILLUSTRATION_SLOTS),
    image: ImageRef,        // file, alt / decorative, caption, credit, source, depicts,
                            // rightsConfirmed, focus: the design's `alt` is ImageRef.alt
  }).superRefine(/* source "licensed-stock" rejected, see below */);
  export const IllustrationSet = z.object({
    images: z.array(IllustrationImage).max(ILLUSTRATION_SLOTS.length).default([]),
  }).superRefine(/* each slot at most once: "Kresba pro místo "hero" je uvedena vícekrát." */);
  ```

  The wrapper key is `images`, as in E's `landscapes.json`. The design's `alt` is the existing `ImageRef.alt` (or `decorative: true`, which the drawings usually are), so nothing is duplicated.
- **Stock rejected [review]:** `source: "licensed-stock"` fails schema validation (G-001): *"Kresby musí být zakázkové, nakreslené pro vás. Obrázky z fotobanky nelze použít."* Same rule and same alternative as E (allow stock, rely on the CMS text only). `placeholder` stays allowed (fixture, prototypes) and G-032 catches it in production as today.

### 2.2 Feature switch and `supports` flag

- `illustrations` joins `CONTENT_FEATURES` in `core/content/config.ts` (a separate line after E's `landscapes`; until the merge, after `prePlanning`): `features.illustrations` (default `false`, agent-only in `site.config.ts`) and `supports.illustrations` on `TemplateManifest`. A, B, C and D get `illustrations: false` (one line each, after E's `landscapes: false` at merge time). The existing G-005 loop rejects the feature on a template without support, with no new code.
- Through the content-feature mechanism: the CMS shows the file only while the feature is on and supported, `client:new` copies the fixture's file only for a supporting template (feature off, like every optional type), and the images count for the gate and the media inventory only while the feature is on.

### 2.3 Image slots, and light vs dark line

Manifest slots with the prefix `illustration.` (the CMS reads the prefix, like `notice.` and `person.`):

| Slot | Aspect | Where F draws it | Field it sits on |
| --- | --- | --- | --- |
| `illustration.hero` | 1:1 | home clay field, cols 9–12, ≤ 340 px tall (comp: "lípa na náměstí") | **deep** (light line) |
| `illustration.guidance` | 4:5 | home "Co nás teď čeká?" col 12, 96 × 120; top of `/jak-postupovat/` beside the picker at ≥ 64 rem (comp: "klíč") | sand |
| `illustration.services` | 4:5 | `/sluzby/` first question, last column, 96 × 120 | sand |
| `illustration.office` | 3:2 | home "Kdo jste?" when there is no people photo (cols 7–12), and the end of the people row on `/o-nas/#lide` without photos (comp: "dveře kanceláře") | sand |
| `illustration.contact` | 1:1 | `/kontakt/` beside "Kde vás najdeme?", cols 9–12, at ≥ 64 rem (not drawn; built from the home hero field) | cream |

Below 64 rem drawings are not shown (the 375 comps have none); they are `loading="lazy"` and `display: none`, so phones never download them.

**Light vs dark: one file per slot [review].** The client (or the illustrator) uploads **one drawing per slot as dark line on white or on a transparent ground**: a scan of ink on paper or an SVG, which is what an illustrator delivers anyway. The template sets the line colour per field in CSS, so the same file works in both palettes and on every field:

- on cream and sand: `mix-blend-mode: multiply` (the white paper disappears into the field, the line stays dark);
- on the deep clay field (`hero`, and any slot shown inside a clay field under `emergencyEmphasis: "high"`): `filter: invert(1)` + `mix-blend-mode: screen` (the paper becomes the clay, the line becomes light).

Placeholders are drawn plain inside the comp's dashed frame (`rule` colour), never blended. Rejected alternative: two files per slot (`imageLight` / `imageDark`): twice the illustrator's work, two rights records per drawing, and the CMS cannot check that the two match. A slot whose line must not be inverted (a coloured drawing) is out of scope: the guardrail asks for pen line drawings.

### 2.4 Image rights, gate and launch check

- `collectPublishedImages()` and `collectReferencedMediaFiles()` in `core/gate/rules.ts` include `illustrations.json` images **while `features.illustrations` is on** (an `illustrationImageUses()` beside E's `landscapeImageUses()`). That alone applies every existing image rule: **G-003** (file exists), **G-032** (no placeholder in production), **G-033** (rights confirmed), the `ImageRef` refinements (alt or decorative, placeholder source ⇔ placeholder subject, `actual-business` only from the client's own sources), and the launch check's per-image `approvals.images[<file>].rightsEvidence` (L-008). With the feature off the file is ignored and its media are not emitted.
- **New rule G-078 "Illustration set present while the feature is on"** (error in prototype and production): `features.illustrations` is on but `site/illustrations.json` is missing; the CMS cannot create files (S2 finding B8), so the client could never add drawings. Mirrors E's G-077; the same alternative applies (a warning only).
- No fact-ledger keys (drawings are not facts).

### 2.5 CMS (`tools/cms/pages-config.ts`)

A file entry **"Kresby"** (`src/content/site/illustrations.json`) in the "Firma a kontakt" group, shown while `features.illustrations` is on and the template supports it. Fields: a list `images` (0–5 items, summary `{slot}`), each item `slot` (select; options only the slots the template declares under `illustration.`, with Czech labels: Úvodní pole, Postup, Kontakt, Kancelář, Služby) and `image` (the existing inline `imageRef`, visible).

**How the guardrail reaches the client** (Pages CMS shows field `description`s under the field):

- list `images`: *"Kresby perem, které pro vás nakreslil ilustrátor: strom na náměstí, vchod do kanceláře, cesta ke hřbitovu. Žádné holubice, svíčky, ruce ani vadnoucí květiny. Nepoužívejte fotobanky ani obrázky vytvořené počítačem. Bez kreseb zůstane místo prázdné, stránka je úplná i tak."*
- `image.file`: *"Jedna kresba pro každé místo: tmavá linka na bílém pozadí (sken), PNG nebo JPEG. Na tmavém poli ji web sám zesvětlí."*
- `image.rightsConfirmed` **in this entry only**: *"Kresbu nakreslil ilustrátor na zakázku pro nás a smíme ji použít. Není z fotobanky ani vytvořená počítačem."* This reuses G-033, so production cannot pass until the client has ticked that statement for every drawing; no new field.

The schema enforces what it can (no stock, rights, placeholders, one drawing per slot); "no doves, candles, hands or wilting flowers" and "no AI-generated drawings" cannot be detected, so they stay a written rule, the rights statement above, and the owner's review before launch (site-build skill and the launch sign-off list). If the main checkout's uncommitted Decap switch lands first, the entry moves to the Decap generator with the same fields and texts.

### 2.6 Loader, fixture, client tools

- `core/content/load.ts`: `getIllustrations(): Promise<Partial<Record<IllustrationSlot, ImageRef>>>`, empty unless the feature is on and the file exists. `virtual:site-core/data` exports `illustrations` like `legal` (the integration already loops over `OPTIONAL_SINGLETON_NAMES`); `core/env.d.ts` declares it; `core/content/snapshot.ts` validates it like `legal`.
- **Fixture:** `fixtures/neutral/src/content/site/illustrations.json` with all five slots pointing at **three new flat placeholders** (`placeholder-kresba-1x1.png`, `-4x5.png`, `-3x2.png`), drawn in exactly the existing placeholder style (flat warm grey, dashed border, sans text "Zástupný rámec · kresba · poměr 1:1 · nahradit zakázkovou kresbou"), generated once with `sharp` from an SVG of text and rectangles (no drawing, no generated imagery), `source` and `depicts` `placeholder`, `decorative: true`. New files rather than reusing `placeholder-1x1.png` etc., because those say "nahradit schválenou fotografií". The fixture's own `site.config.ts` keeps `illustrations` off (A–D builds and the export production fixture stay byte-identical); F's `fixture.site.config.ts` switches it on.
- `tools/client/new.ts`: `"site/illustrations.json": "illustrations"` in `OPTIONAL_CONTENT` (a line after E's), usage text gains `rodinny-rozhovor`.

### 2.7 Tests and docs

- **Tests** (`core/tests/`): `IllustrationSet` parses an empty and a full set, rejects stock, an unknown slot, a duplicate slot and an invalid `ImageRef`; G-005 rejects `features.illustrations` on a template without support; G-078 fires with the feature on and no file, not otherwise; G-003 / G-032 / G-033 report illustration images only while the feature is on; `collectReferencedMediaFiles` includes them only then; the launch check asks for rights evidence of a published drawing. `tools/cms/tests`: the "Kresby" entry appears only with feature and support, with the slot options filtered by the manifest and the three descriptions; `tools/client/tests`: `illustrations.json` copied for F only. A–D manifests still validate.
- **Docs:** `docs/content-contract.md` (§6.19 "Kresby", G-078 row, G-003/G-032/G-033 scope), `docs/template-contract.md` §3 (`supports.illustrations`, the `illustration.` prefix and the one-file rule), `docs/editable-fields.md` (the Kresby entry and its help texts), `.claude/skills/site-build/SKILL.md` (when to switch it on, the brief for the illustrator, the guardrail), `fixtures/neutral/README.md` (the new file and placeholders).

## 3. Intended manifest

```ts
{
  id: "rodinny-rozhovor",
  name: "Rodinný rozhovor",
  version: "0.1.0",
  coreVersion: "^0.1.0",
  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: false,     // one question-led page; services are answers with anchors
    mapEmbed: false,               // map is always a link
    notices: true,                 // /oznameni/ + /oznameni/<slug>/ (drawn)
    people: true,                  // /o-nas/#lide (drawn as "Kdo vás přijme?") [review §4]
    faq: true,                     // /jak-postupovat/#caste-otazky: questions are the native form here
    documents: true,               // footer "Dokumenty" column (drawn) + /pravni-informace/#dokumenty
    guestInfo: true,               // /pro-ucastniky/ (drawn)
    prePlanning: true,             // /pohreb-predem/, built from Pro účastníky
    priceInclusions: true,         // "V ceně je zahrnuto" / "Není zahrnuto" (drawn on Ceník)
    illustrations: true,           // §2
  },
  homepageSections: {
    available: ["hero", "next-steps", "price-summary", "family-story", "services",
                "contact-summary", "people", "notices", "faq", "catalogue-links"],
    default:   ["hero", "next-steps", "price-summary", "family-story", "services", "contact-summary"],
    constraints: { first: "hero", required: ["hero"] },
  },
  options: {
    palette:           { values: ["hlina", "med"], default: "hlina" },
    fontPair:          { values: ["alegreya", "gelasio"], default: "alegreya" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },
  imageSlots: {
    "company.logo":          { aspect: "none", required: false },  // dark logo on the cream header, never on clay
    "about.story":           { aspect: "3:2", required: false, page: "o-nas", field: "heroImage" }, // the one people photo
    "coffin.item":           { aspect: "4:3", required: false },
    "flower.item":           { aspect: "1:1", required: false },
    "person.photo":          { aspect: "4:5", required: false },   // 160 × 200
    "notice.photo":          { aspect: "4:5", required: false },   // notice detail only, never on the list
    "notice.parte":          { aspect: "none", required: false },
    "illustration.hero":     { aspect: "1:1", required: false },
    "illustration.guidance": { aspect: "4:5", required: false },
    "illustration.services": { aspect: "4:5", required: false },
    "illustration.office":   { aspect: "3:2", required: false },
    "illustration.contact":  { aspect: "1:1", required: false },
  },
  pageFields: {
    home: ["navLabel", "metaTitle", "metaDescription"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "heroImage", "body"],
    "jak-postupovat", sluzby, rakve, kvetiny, kontakt, cenik, oznameni, "pro-ucastniky",
    "pohreb-predem", "pravni-informace", "ochrana-osobnich-udaju":
           ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
  },
}
```

### 3.1 Notes on the manifest

- **Headings are the template's questions, not content titles [review].** The guardrail is "every H1 and H2 phrased as the family's question", and the content titles (fixture and real clients: "Ceník", "Kontakt", "Naše služby") are not questions. So each page's H1 is a fixed question in `src/i18n/cs.ts` (Kolik to bude stát? · Kde vás najdeme? · Co teď? · Co pro vás můžeme zařídit? · Kdo jste? · Jdete na pohřeb? · Jak se připravit předem? · Jakou rakev vybrat? · Jaké květiny? · Jak chráníme vaše údaje? · Kam se obrátit, když nejste spokojeni? · Tuhle stránku jsme nenašli.), and the content `title` is the document `<title>` (unless `metaTitle` is set). The content `lead` is the answer under the H1. **Exception: `/oznameni/` and notice pages** use the content title and the deceased's name (neutral, as drawn). Home has no title or lead on screen (H1 "Kdo nám pomůže hned?", answer from `emergency.shortNote`), so the CMS hides them, as approved for D. Alternative: render the content title as the H1 and ask clients (site-build skill) to write titles as questions; the fixture would then show non-questions.
- **Default order** hero → next-steps → price-summary → family-story → services → contact-summary. The first four are drawn (Kdo nám pomůže hned? · Co nás teď čeká? · Kolik to bude stát? · Kdo jste?); "Co pro vás můžeme zařídit?" and "Kde vás najdeme?" continue the conversation from the Služby and Kontakt comps. Positions differing (fixture orders): A 5, B 4, C 4, D 8 (QA needs ≥ 3). `hero` is fixed first (it carries the H1 and the nonstop answer) and is the only required section. `people`, `notices` (a link with a count, never names, L1), `faq` (at most three questions as links; the ban list forbids an FAQ wall on home) and `catalogue-links` are available, not default.
- **Field alternation is computed by CSS, not by order.** The hero is deep; every following home field alternates sand / cream with `:nth-child(even of [data-field])`, so a client who reorders or drops sections, or a `price-summary` that renders nothing while pricing is hidden, never yields two fields of the same colour in a row.
- **No `heroVariant`** (with or without the drawing is content, not an option), as in D.
- **Palettes** are exactly `tokens.json` (`hlina` "Hlína", default; `med` "Med"), switched by `html[data-palette]` custom properties. **Font pairs:** Alegreya 400/700 + Alegreya Sans 500 (default) or Gelasio 400/700 + Alegreya Sans 500 (the design's alternative); two families, three weights, OFL, `@fontsource/*` 5.3.0 (new dependencies; the lockfile changes); faces declared with latin / latin-ext `unicode-range` (S3 lesson); the serif 700 latin face is preloaded (H1, number). Every weight is checked against "Příliš žluťoučký kůň úpěl ďábelské ódy".
- **`emergencyEmphasis: "high"`:** the full clay field (same component as home, with the page's question as H1) replaces the compact strip at the top of every inner page, as the design note says. Notice pages are never affected.
- **`about.story`** is the comp's "one real photo of the people" (home "Kdo jste?", cols 7–12, and the top of `/o-nas/`); its CMS help asks for staff consent (L12). Without it, `illustration.office` takes the place; without either, the field keeps its text column and the right side stays empty, as the design says.
- **`serviceDetailPages: false`:** the comp's Služby is one question-led page. Each service gets an anchor (`/sluzby/#<slug>`) that home, Ceník and the price groups link to. This also makes F's route set unique (C and D emit detail pages; A and B support none of the optional types).

## 4. Pages and composition

Exact values from `html/*.html`: body 21 / 1.55, answer lead 30 / 1.35 (23 at 375), H1 64 / 36 (line-height 1.04–1.08), H2 44 / 30, labels Alegreya Sans 500 18–20; spacing 8 · 16 · 28 · 56 · 80; field padding 72 px 56 px at 1280 and 28–32 px 16 px at 375; 12-column grid, 24 px gap, 56 px side margin; radius 0; links ink, underlined with a 5 px offset, the current nav word with a 3 px underline. Numbers `nowrap`. **One-letter words:** a template helper `keepShortWords()` puts U+00A0 after `v s k z u o i a` (and their capitals) in every plain-text string it renders (cs.ts strings, titles, leads, summaries, notes) **using a lookbehind**, so a run like "i o svátcích" binds both words; the home comp's "i o" at a line end (375), "list o", "s obřadem" and "v zahraničí" at 1280 are fixed by it. Markdown bodies get the same treatment on the rendered HTML's text nodes (tags untouched), unit-tested.

| Route | Composition | Drawn? |
| --- | --- | --- |
| `/` | header + word nav; **hero** clay field (H1 "Kdo nám pomůže hned?", answer "My." + `emergency.shortNote`, label `emergency.label` in Alegreya Sans on `on_deep_muted`, number 54 / 36 px underlined; `illustration.hero` in cols 9–12) → **next-steps** "Co nás teď čeká?" (first-hours summaries as two or three sentences, the picker words "Kde zemřel? doma · v nemocnici · …" linking to `/jak-postupovat/#situace-…`, "Krok za krokem" at 375; `illustration.guidance` col 12) → **price-summary** "Kolik to bude stát?" (one sentence with the first item of each package group through `<PriceValue>`, `<VatNote>`, "Ceník a co je v ceně"; nothing while pricing is hidden) → **family-story** "Kdo jste?" (`o-nas` excerpt, `about.story` photo or `illustration.office`) → **services** "Co pro vás můžeme zařídit?" (featured services as a sentence of anchor links) → **contact-summary** "Kde vás najdeme?" (address, map link, "Kdy můžeme přijít do kanceláře?" with the hours in its own `data-office-hours` block); closing sentence; footer. Optional: **people** "Kdo vás přijme?" (names + roles in a row), **notices** "Kde najdeme oznámení?" (link + count), **faq** "Na co se ještě ptáte?" (three question links), **catalogue-links** "Jakou rakev a květiny?" (two links with counts). | 1280, 375 |
| `/jak-postupovat/` | strip; H1 "Co teď?", lead; picker as a sentence of 44 px words (core `chooserSituations`, `#situace-…`), the picked one a small clay tag "doma (vybráno)" + "Ukázat všechno" (`:has(:target)`, core `guidance-flow.ts`, no JS). **Not picked:** each first-hours step is its own question built from its situations ("Zemřel doma?", "Zemřel v nemocnici nebo v domově pro seniory?") with the summary as the answer. **Picked:** one field "Zemřel doma. Co udělat teď?" with the applicable first-hours steps as native-checkbox checklists (26 px boxes, `accent-color` deep; title + checklist items; body in `<details>`; the nonstop number inline where `contactPrompt` is emergency). Then in both states "Co v dalších dnech?" (first-days + arrangements) and "Co po pohřbu?" (after-funeral) as checklists. Then **Časté otázky** (`#caste-otazky`): H2 "Na co se ještě ptáte?", each FAQ question an H3 with its answer open (they are already questions), grouped by topic. `illustration.guidance` beside the picker at ≥ 64 rem. | 375 × 2 |
| `/sluzby/` | strip; H1 "Co pro vás můžeme zařídit?", lead; **one field per service category with a question** (ceremony → "Musí být pohřeb s obřadem?", arrangements → "Kdo vyřídí úřady?", transport → "Přijedete i v noci?", cremation → "Co bude s urnou?", memorial → "Jak dáme lidem vědět?", other → "Co dalšího zařídíte?"); inside, each service is an H3 with its anchor id, summary as the answer, body in `<details>`, and "Co je v ceně" → `/cenik/#<group>`; `illustration.services` in the first field's last column. Categories with no published service are left out. | 1280 |
| `/cenik/` | strip; H1 "Kolik to bude stát?" with the answer "**Ceny jsou uvedeny včetně DPH.**" (`<VatNote>`) + "Konečnou cenu spočítáme spolu v kanceláři…" (lead), `<DemoPricingNotice>`; **each package group** (a group with inclusion lists) is a question field: H2 = the group title as a question ("Kolik stojí <title lower-cased>?" for the first, "A <title>?" after it) **[review]**, the answer sentence "Od 14 900 Kč včetně DPH." through `<PriceValue>`, then two columns "V ceně je zahrnuto" / "Není zahrnuto"; the other groups' items as one **borderless** table "Co stojí jednotlivé věci?" (spacing, not rules; price bold, right, `nowrap`); `<VatNote>` again under the table; print hint (Ctrl/Cmd + P); closing sentence. | 1280 |
| `/cenik/` print | `print.css`: fields become thin warm rules (`rule` colour), questions stay as headings with the price joined ("… Od 14 900 Kč."), letterhead line (name + address), footer lines (nonstop + office numbers, legal identification, URL). | A4 |
| `/kontakt/` | strip; H1 "Kde vás najdeme?" + address answer + "Mapa a příjezd" (`illustration.contact` cols 9–12 at ≥ 64 rem); sand "Kdy můžeme přijít do kanceláře?" (`data-office-hours`, borderless hours table, holiday note); cream "Jak se s vámi spojím?" (office and department phones, e-mail); sand "Co když je to v noci?" (`data-emergency-block`, `emergency.serviceArea` sentence + the number). | 375 |
| people (`/o-nas/#lide`) | H2 "Kdo vás přijme?"; with photos: 2 × 2 on a sand field, 160 × 200 photo, 32 px name, role as written, direct line `nowrap`; without photos: names in one row of four, `illustration.office` may end the row; mixed: rows, a person without a photo gets no empty frame. | 1280 × 2 |
| `/o-nas/` | strip; H1 "Kdo jste?", lead; `about.story` photo; body: each `##` opens a field (headings should be questions; the skill tells the writer); then **people** (above) when on; links to Služby, Rakve, Květiny, Pro účastníky, Pohřeb předem, Dokumenty under "Co ještě u nás najdete?" (the guardrail's "reached from Kdo jsme"). | Lidé, Služby |
| `/oznameni/` | **Neutral chrome** (§5); H1 = content title, muted consent sentence; "Nadcházející rozloučení" label in cols 1–4, names in Alegreya 700 32 / 28 px as links, dates muted, the ceremony sentence ("Rozloučení se koná v pátek 14. 11. 2026 v 10:00 ve smuteční síni ve Vyškově." from `NoticeView` facts; "Pohřeb bez obřadu. Rodina se rozloučí v soukromí." for `without-ceremony` / `private`); "Nedávná oznámení" with name + "zemřel … · rozloučení proběhlo …". Empty state: one sentence. Plain cream, no fields, no drawings, no closing sentence. | 1280, 375 |
| `/oznameni/<slug>/` | **Neutral chrome**; name as H1 (40 px), dates; optional 4:5 photo; H2s "Kdy a kde" (ceremony sentence, type, map link), "Na dálku" (livestream as a plain link + note, L14), "Od rodiny", "Kondolence" (instruction with the e-mail, never a form), parte link; QR (`<NoticeQrCode>` in a 1 px ink frame) + print hint. | 375 |
| `/pro-ucastniky/`, `/pohreb-predem/` | strip; H1 question ("Jdete na pohřeb?" / "Jak se připravit předem?"), lead; the Markdown body split at `##` into alternating fields (each `##` is a guest question in the fixture already). | pro-ucastniky 375 |
| `/rakve/`, `/kvetiny/` | built from Lidé: H1 question, lead; on a sand field items in rows (4:3 or 1:1 image 160 px wide when present, 32 px name, muted material / type, summary); without images, names in rows of four; zero items: one sentence + office phone. Květiny ends with "Jak květiny objednám?" + the flowers phone. | from Lidé |
| `/pravni-informace/` | built from Kontakt: H1 "Kam se obrátit, když nejste spokojeni?"; fields "Kdo řeší spory?" (ADR + adr.coi.cz), "Komu poslat reklamaci?" (complaints contact), "Jaké dokumenty si můžete stáhnout?" (`#dokumenty`: title link, PDF, valid from); body. | from Kontakt |
| `/ochrana-osobnich-udaju/` | H1 "Jak chráníme vaše údaje?"; body split into fields. | from Pro účastníky |
| `/404.html` | strip; H1 "Tuhle stránku jsme nenašli."; "Co hledáte?" (30 px) with four answer links: Co dělat, když někdo zemřel · Oznámení a obřady (when on) · Kolik to bude stát · Kde nás najdete. | 375 |

**Navigation [review].** At most six words, always visible, no menu (the guardrail; QA test 7 accepts inline nav without a toggle). Core fixes nav order and labels (approved for C and D), so F shows **a subset of `site.nav`**: Jak postupovat · Oznámení (when on) · O nás · Ceník (when pricing is visible) · Kontakt, in core order; the wordmark links home. That is five words at most. The comp's third word "Bez obřadu" is a service, not a page, so it cannot be a nav item; Služby, Rakve, Květiny, Lidé, Pro účastníky, Pohřeb předem, FAQ and Dokumenty are reached from "Kdo jste?" (`/o-nas/`), page links and the footer, exactly as the guardrail lists. A client who wants the comp's wording sets the `navLabel`s ("Někdo zemřel", "Kdo jsme"). Alternative: add Služby as the sixth word.

**People location [review].** C and D put people on `/kontakt/#lide`. In F's comps people belong to "Kdo jsme" (the Lidé comp marks "Kdo jsme" as current, and home "Kdo jste?" names them), so F puts them on **`/o-nas/#lide`**. Alternative: `/kontakt/#lide` as in C and D.

**Footer (every page except notices):** the closing sentence on cream (26 px, number bold `nowrap`), then a sand footer with question headings in four columns: **Kde nás najdete** (address, map link) · **Kdy jsme v kanceláři** (`data-office-hours`, hours, office phone) · **Kdykoli, i v noci** (`data-emergency-block`, label + number) · **Dokumenty** (when on); a line **"Co tu ještě najdete?"** with the pages that are not in the nav (Služby, Rakve, Květiny, Lidé, Pro účastníky, Pohřeb předem, Časté otázky), needed because the nav has five words; then the legal row (legal name, sídlo, IČO, register entry, "Spory: Česká obchodní inspekce, adr.coi.cz", Právní informace, Ochrana osobních údajů). Alegreya Sans 18 muted for the legal row.

**Neutral footer (notices):** no closing sentence, no Dokumenty, no "Co tu ještě najdete?"; Kde nás najdete · Kdy jsme v kanceláři (office hours and phone stay: invariant 3) · **"Telefon nonstop"** in ink; the legal row. The notice comp shows only the legal row; invariant 3 needs the address, office phone and hours in every footer, so they stay.

## 5. Emergency CTA forms

| Form | Where | Build |
| --- | --- | --- |
| Default, home | the hero clay field: the answer to "Kdo nám pomůže hned?" | `<EmergencyPhoneLink variant="custom">` as one `inline-block` link: label span (`display: block`, Alegreya Sans 500 20 / 18 px, `on_deep_muted`) then number span (Alegreya 700 54 / 36 px, `on_deep`, 2 px underline, 9 / 7 px offset, `nowrap`), with an explicit `{" "}` between them (never flex: S6 lesson, QA test 9) |
| Default, inner pages | compact clay strip directly under the header | one link: "Potřebujete nás hned? <label>" (Alegreya Sans 18, `on_deep_muted`) + number 30 px (28 at 320); desktop on one baseline (the link is `display: block` with inline-block spans and a word space, not flex), phones two lines; ≥ 44 px tall |
| Closing | last sentence of every non-notice page | "Kdykoli potřebujete, volejte <number>." The number is a second `<EmergencyPhoneLink>` (bold, `nowrap`) |
| High emphasis | the full clay field at the top of every inner page | same component as home, with the page's question as H1 inside the field |
| Neutral | `/oznameni/` and notice pages | sand strip, Alegreya Sans 19 / 18 muted: "Oznámení zveřejňuje <brand>." + an ink link "Telefon nonstop <number>"; no clay, no "převoz" in the visible text. ⚖ L1 |

The number never wraps: "+420 000 000 199" at 54 px Alegreya 700 is about 430 px (fits cols 1–7), 36 px is about 290 px (fits 343 px), 28 px at 320 px fits 288 px; both font pairs are measured at 320, 375 and 1280 and sized with `min()` where needed.

## 6. Component inventory (all new names; none matches a file in A, B, C or D, nor any name in E's plan)

| Area | Components |
| --- | --- |
| Layout | `layouts/ConversationLayout.astro` (options → `data-palette`, `data-font`, `data-emphasis` on `<html>`; SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`; `neutral` prop; no `<script>`) |
| Chrome | `FamilyHeader` (wordmark / logo + word nav), `WordNav` (full / reduced), `ClayStrip` (inner-page nonstop), `ClayAnswer` (home and high-emphasis field), `PublisherStrip` (neutral notice form), `ClosingSentence`, `FamilyFooter` (full / neutral) |
| Fields | `QuestionField` (full-bleed section: `data-field`, optional `data-section`, heading level, question / answer / margin slots), `Drawing` (slot lookup, `<Image>`, blend class by field, placeholder frame; renders nothing without a drawing), `FieldProse` (Markdown body split at `##` into fields) |
| Home | `HelpNowField` (hero), `WhatNextField` (next-steps), `CostField` (price-summary), `WhoAreYouField` (family-story), `ArrangeField` (services), `FindUsField` (contact-summary), `WhoReceivesField` (people), `NoticeAskField` (notices), `AskAgainField` (faq), `ChooseField` (catalogue-links) |
| Guidance + FAQ | `PlaceWords` (picker sentence + tag; home and guide), `SituationQuestions` (unpicked), `StepChecklist`, `FaqAnswers` |
| Pricing | `PackageQuestion` (price sentence + two lists), `PlainItemTable` (borderless), `print.css` |
| Notices | `NoticeNameList`, `NoticeAnswers` (Kdy a kde / Na dálku / Od rodiny / Kondolence), `NoticeQrFrame` |
| Contact, people, catalogue, legal | `HoursAnswer` (`data-office-hours`), `ReachUsAnswer`, `NightAnswer` (`data-emergency-block`), `PeopleField`, `CatalogueField`, `NoCatalogueAnswer`, `DisputesField`, `DocumentLinks` |

Plus `src/i18n/cs.ts` (all questions and UI strings, plain Czech, no business facts), `src/lib/options.ts`, `src/lib/czech.ts` (`keepShortWords`, question builders for situations, categories and price groups), `src/lib/fields.ts` (nav subset, footer page list), `src/styles/global.css`, `fonts.css`, `print.css`. Plain CSS, no Tailwind (as C, D and E). Core safety components are styled only through `class` + global CSS or their `data-*` hooks. **No JavaScript at all**, not even inline.

## 7. Differentiation row (design-differentiation §5)

| Dimension | A Rodinná tradice | B Důstojná jednoduchost | C Noční linka | D Plný přehled | **F Rodinný rozhovor** |
| --- | --- | --- | --- | --- | --- |
| Header | centred letterhead | left logo, right nav, sticky | sticky side rail | name + nonstop box + Kancelář box + nav row | **wordmark + always-visible words, wrapping, not sticky, no button** |
| Emergency CTA | dark utility strip | header button + bottom bar | the rail itself | highlighted header box | **the answer to the H1 in a clay field (home), a compact clay strip (inner pages), and the closing sentence of every page** |
| Mobile navigation | in-flow full-height list | dropdown under sticky header | in-flow list under the panel | "Rejstřík" rows with counts | **none: the same ≤ 5 words wrap into rows of 44 px targets** |
| Homepage order | hero → story → services → steps → visit | hero → steps → services → contact → story | hero → [notices] → services → steps → story → office | steps → prices → services → catalogues → people → notices → documents → FAQ | **hero → steps → prices → story → services → contact, each a question** |
| Hero | editorial, image or panel | practical, CTA tier | one statement, one screen | none | **clay field: question H1, the nonstop number as its answer, optional pen drawing** |
| Services IA | one long page | index + detail | statement index + detail | index table + reference sheets | **one page of questions by category, services as answers with anchors** |
| Guidance | article + margin TOC | phased checklist | one step per statement | situation × step matrix | **"Co teď?": picker sentence; Co udělat teď / Co v dalších dnech / Co po pohřbu** |
| Catalogues | figure gallery | uniform grid | ruled rows | tables with thumbnails | **rows on a sand field, names first, images optional** |
| Pricing | `dl` + dot leaders | `table` per group | statement per group | package pair + "Typ ceny" table | **price inside the answer sentence, two lists, borderless table** |
| Notices | – | – | large-type agenda | timetable | **names in Alegreya 700, each followed by the ceremony sentence** |
| About | long-form, drop cap | fact sheet first | statements, one photo | reference sheet | **"Kdo jste?": one people photo, people with roles as what they do for you** |
| Footer | rich letter | compact two rows | four columns on the rail colour | 3 px rule, four ruled columns | **closing sentence, then a sand field with question headings** |
| Typography | serif display + humanist sans | neutral grotesque | one grotesque, 76 px H1 | sans + mono | **calligraphic book serif (Alegreya) for everything, its sans only for nav and labels; 21 px body** |
| Colour | warm paper, umber | cool slate, forest | dark, amber | white / grey, one highlight | **cream, sand and deep clay (or honey and olive) as full-bleed fields** |
| Image use | larger, fewer, captioned | minimal, uniform | none on home | thumbnails only | **commissioned pen drawings in margins; one people photo** |
| Separation | hairlines, small caps | 1 px lines, tinted bands | darkness and space | column and table rules | **full-bleed colour fields only; no lines at all** |

**Closest pair: F / A** (both warm paper, a serif with its humanist sans, a family tone). The structure still differs: A's centred letterhead, dark utility strip, editorial photo hero, dot leaders and hairlines against F's word nav, clay answer field, question fields, borderless tables and no photos but one. I expect typography at 2 for F/A and B/F, and will score from greyscale screenshots before claiming more. The QA route-set check passes every pair through routes (F: no service detail pages but every optional type).

## 8. Law (research §4a) and things I will not build

- **L1, notices:** neutral chrome (sand publisher strip, reduced nav "Oznámení a obřady · Kontakt", neutral footer), no clay, no fields, no drawings, no closing sentence, no `PriceValue`, no service or price links, no "Objednat", no homepage sections. The home `notices` section is a link with a count, never names. ⚖ The neutral strip, the two-word nav and the home link need the lawyer; as for C and D, core's fixed accessible name of the nonstop link still says "převoz" and does not contain the visible "Telefon nonstop …" (WCAG 2.5.3).
- **L8** legal identification in every footer, neutral included; **L9** `<VatNote>` with the home price sentence, under the Ceník H1 and under the items table, on the A4 sheet; Služby links to Ceník and shows no prices; **L10** ADR + Právní informace in every footer; **L11** no cookies, no third-party requests, fonts self-hosted, no JS; **L12** people photo and `about.story` with staff consent (G-074 for people; the skill asks for it for the story photo), notice photos with the notice's consent record (G-070); **L14** livestream as a plain link. No newsletter or e-mail capture.
- **Print links** ("Vytisknout oznámení", the Ceník A4 version) become a short Ctrl/Cmd + P instruction, as approved for C and D (there is no JavaScript at all here).
- **"Bez obřadu" as a nav word**, a separate **Lidé page** (`/lide/` is not a core route) and the comp's **hand-written price sentence** ("Pohřeb bez obřadu stojí od …, pohřeb s obřadem v síni od …") are built from data: the home sentence lists the first item of each package group (at most two, in group order), joined by the template ("<group title> od <PriceValue>").
- **Price-group questions [review].** Core has no question field on a price group. F builds "Kolik stojí <title>?" for the first package group and "A <title>?" for the next ones, lower-casing the first letter of the title; the items table is "Co stojí jednotlivé věci?". This reads well with the fixture ("Kolik stojí pohřeb bez obřadu?", "A pohřeb s obřadem?") but depends on clients' titles being noun phrases. Alternative: a fixed question per position from cs.ts ("Kolik stojí tahle možnost?") with the title as a label, or a core field `PriceGroup.question` (CMS "Otázka", optional) with that rule as the fallback.
- **The home answer "My."** is a template string; the rest of the answer is the client's `emergency.shortNote` ("Volejte kdykoli, ve dne i v noci."), never a hard-coded claim such as "i o svátcích".

## 9. Registration and verification plan

- `qa/templates.ts`: add `rodinny-rozhovor` (letter F, port **4416**) on its own line after D. `qa/structure.spec.ts` already runs pair checks over `templatePairs()`; confirm every check covers the ten pairs with F and add F-specific nothing. The home sections carry `data-section`, so the order check reads them unchanged.
- `tools/client/new.ts` usage text; `tools/client/tests` and `tools/cms/tests` template lists (F after D); `.claude/skills/site-build/SKILL.md` (when to choose F: a small family firm with a warm, personal voice that can commission drawings or is fine without; image slots; supported types; questions as headings; the illustrator brief); `docs/design-differentiation.md` section + matrix column (after D's).
- Verify in order: `npm test`, `npm run lint`, `npm run typecheck`; `npm run build -w templates/rodinny-rozhovor` (prototype) and `build:production` (expect exactly the fixture's gate rules, plus G-032 for the five placeholder drawings); `npm run qa` for A, B, C, D and F (`--workers=4 --timeout=240000`, outside the sandbox; axe serious/critical = 0); Lighthouse mobile via `npx lighthouse` with `CHROME_PATH` on Playwright's Chromium 1248 for home, jak-postupovat, cenik, oznameni; trial client `clients/hnatek-f` (copy of `clients/hnatek`, template switched per /site-build step 2, placeholder notices / people / FAQ / documents, all four optional folders present, `illustrations.json` with placeholder drawings) → `client:validate`, `client:build`, `client:export -- hnatek-f` (RESULT: PASS 10/10); greyscale screenshots at 375 and 1280 beside A, B, C and D; the §7 scorecard against A, B, C and D (≥ 11/15, no dimension < 2); contrast per palette computed and recorded (including the blended drawing line on each field); budgets (HTML + CSS ≤ 100 KB gzip, JS 0, LCP image ≤ 200 KB; the hero drawing is never the LCP element, it is `loading="lazy"` beside the H1).
- `clients/hnatek`, `-b`, `-c`, `-d`, the main checkout and other worktrees are not touched. Nothing is committed until asked.

## 10. Summary of what needs your answer

1. **Core addition (§2):** optional singleton `site/illustrations.json` (`images[]` of `{ slot, image }`), feature + `supports.illustrations` (false for A–D), five `illustration.*` slots, stock rejected, one drawing per slot, the gate's image rules while the feature is on, **G-078** for a missing file, the CMS "Kresby" entry with the guardrail texts and the rights statement on `rightsConfirmed`, loader, fixture placeholders, client tools, tests, docs.
2. **Light vs dark (§2.3):** one dark-line file per slot, recoloured per field by CSS blend modes; no second file.
3. **Questions from `cs.ts` as H1s, content `title` as the document title (§3.1).**
4. **Navigation (§4):** a ≤ 5-word subset of `site.nav` (Jak postupovat, Oznámení, O nás, Ceník, Kontakt), no Služby word; the footer's "Co tu ještě najdete?" line.
5. **People on `/o-nas/#lide`** instead of `/kontakt/#lide` (§4).
6. **Price-group questions built from group titles (§8).**
7. Default palette `hlina`, font pair `alegreya` (as the design marks them default).

## 11. Build results (2026-11-13)

### What was built

| Area | Files |
| --- | --- |
| Core (approved §2) | `core/content/schemas.ts` §6.19: `ILLUSTRATION_SLOTS` (hero, guidance, contact, office, services), `IllustrationImage` (`{ slot, image }`, `licensed-stock` rejected), `IllustrationSet` (`images`, at most 5, one per slot), in `OPTIONAL_SINGLETON_SCHEMAS` after `legal`. `core/content/config.ts`: `features.illustrations` (default off), `"illustrations"` in `CONTENT_FEATURES` after `prePlanning`, `supports.illustrations` (false for A–D). `core/content/snapshot.ts`, `core/env.d.ts`, `core/content/load.ts` `getIllustrations()` (slot → image, `{}` while the feature is off or the file is missing). `core/gate/rules.ts`: **G-078** (feature on, file missing: error in both modes); the drawings join the published and referenced images only while the feature is on, so G-003 / G-032 / G-033 / L-008 apply to them then. Tests: `core/tests/illustrations.test.ts` (new) and the features defaults; `illustrations: false` in every test manifest. CMS: the "Kresby" entry in "Firma a kontakt" with the guardrail texts (`tools/cms/pages-config.ts`, three tests). `client:new` copies `site/illustrations.json` only for a template that supports it, feature off (one test). Fixture: three flat placeholder drawings and `illustrations.json` with all five slots. Docs: content-contract §6.19 + G-078 + G-005 list, template-contract §3 and the `illustration.` prefix, editable-fields §4.16, site-build skill, design-differentiation §3c and the F column of §5. |
| Wiring | `templates/rodinny-rozhovor/`: `package.json` (`@site/template-rodinny-rozhovor`, `@fontsource/alegreya`, `alegreya-sans`, `gelasio` 5.3.0, `astro` 7.4.2), `astro.config.mjs` (plain CSS, stylesheets inlined), `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`, `fixture.site.config.ts` (every optional type and the drawings on, default options), `template.manifest.ts` (as §3) |
| Shell | `src/layouts/ConversationLayout.astro`: options → `data-palette`, `data-font`, `data-emphasis` on `<html>`; preloads the serif 700 and 400 latin faces; SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`; `neutral` and `home` props. **No JavaScript**: the only `<script>` on any page is core's JSON-LD data block. |
| Components (30, all new names) | `QuestionField`, `Drawing`, `StoryPhoto`, `FieldProse`, `ClayAnswer`, `ClayStrip`, `PublisherStrip`, `ClosingSentence`, `FamilyHeader`, `WordNav`, `FamilyFooter`, `PlaceWords`, `WhatNextField`, `CostField`, `WhoAreYouField`, `ArrangeField`, `FindUsField`, `HoursAnswer`, `WhoReceivesField`, `NoticeAskField`, `AskAgainField`, `ChooseField`, `StepChecklist`, `FaqAnswers`, `PackageQuestion`, `PlainItemTable`, `PeopleField`, `CatalogueField`, `NoticeNameList`, `NoticeAnswers` |
| Lib, strings, styles | `src/lib/conversation.ts` (`keepShortWords`, nav words, footer pages, field tones, price mentions, contact helpers), `src/lib/notices.ts`, `src/lib/options.ts`; `src/i18n/cs.ts` (every question and UI string); `src/styles/fonts.css` (latin + latin-ext faces with `unicode-range`, both pairs, metric-matched fallback faces), `global.css`, `print.css` |

**Routes (fixture, every optional type on): 17 pages.** `/`, `/jak-postupovat/`, `/sluzby/`, `/rakve/`, `/kvetiny/`, `/o-nas/`, `/kontakt/`, `/cenik/`, `/oznameni/` + 3 notices, `/pro-ucastniky/`, `/pohreb-predem/`, `/pravni-informace/`, `/ochrana-osobnich-udaju/`, `/404.html`. No service detail pages (services are answers with anchors on `/sluzby/`).

**Inventory changes against §6:** `HelpNowField` is `ClayAnswer` (the same field is the home hero and the high-emphasis form on inner pages); `SituationQuestions`, `ReachUsAnswer`, `NightAnswer`, `NoCatalogueAnswer`, `DisputesField` and `DocumentLinks` are a few lines each and stayed inline in their pages; `NoticeQrFrame` is part of `NoticeAnswers`; `StoryPhoto` was added (the one photograph under "Kdo jste?"); `lib/czech.ts` and `lib/fields.ts` became one `lib/conversation.ts`.

### Decisions taken while building

- **Field tones are computed, not left to CSS.** Every page computes each field's tone from its index (`toneAt`: even = cream, odd = sand; the deep clay field is index 0 on home). Home counts only the sections that render, so two fields of one colour never meet when the client drops or reorders a section. Two cases cannot be counted at build time: fields after a Markdown body of unknown length (`/o-nas/`) use `tone="auto"`, continued by an `:nth-child(even of .field)` rule; and the guide's picked state, where the hidden unpicked questions shift the order, carries a second tone per field (`data-tone-picked`) switched by the same `:has(:target)` rule that filters the steps.
- **The guide works without JavaScript** through the picker words as links to anchors and `:has(:target)`, like C and D's anchors but with no script at all; "Ukázat všechno" returns to the unfiltered state.
- **The closing sentence is its own section** (`<section data-emergency-block>` with a visually hidden h2 from `emergency.label`). Inside the footer it shared a heading with the office hours, which QA test 2 rejects (the office block and the emergency block must be separately labelled).
- **Contact hooks through `QuestionField`.** `data-office-hours` / `data-emergency-block` go on the field itself (a `hook` prop), so the question is the hook's heading; `HoursAnswer` renders without its own heading there.
- **Stylesheets are inlined** (`build.inlineStylesheets: "always"`; about 4 KB gzip per page) and only the serif 700 and 400 latin faces are preloaded. A separate CSS file or a third preload measured slower on Lighthouse's simulated mobile. **Metric-matched fallback faces** (`size-adjust` on Times New Roman and Arial) keep the serif swap from moving the layout (Lighthouse table below).
- **The nonstop number never wraps.** On phones it is `min(36 px, 10.8vw)` with Alegreya and `min(36 px, 9.4vw)` with Gelasio (54 px from 64 rem), whose figures are about 12 % wider (found with the option variant at 320 px, where `+420 000 000 199` overflowed by 22 px). In the price table the amount never wraps, but the "UKÁZKA" mark may drop under it on a narrow phone instead of widening the table past the screen.
- **F's CSS never names core's price attributes.** The stylesheet is inlined into every page, notice pages included, and the L1 structure check reads notice HTML for `data-price`, so a selector such as `[data-price-amount]` failed it on `/oznameni/` although no price is shown there. Every `<PriceValue>` gets `class="price"` and the amount is styled as `.price > :first-child`.
- **The logo has a definite height** (56 px, the size it is generated at; width from its attributes, `object-fit: contain`). With the global `img { height: auto }` and `width: auto` the `<img>` had no box until the SVG arrived, and the page moved (CLS 0.034 on hnatek-f).
- **One-letter words** are bound to the next word at render time (`keepShortWords`, a look-behind so "i o" binds both), for every string from `cs.ts` and every content string the template renders itself. Core components' own text (the demo pricing notice, the prototype banner) is not touched.
- **Touch targets:** the publisher strip's link has 0.5625 rem block padding (it measured 43 px); nav words are inline links with 44 px rows when they wrap.
- **CMS file types:** the CMS accepts JPEG, PNG and WebP only, so the "Kresby" text asks for "PNG nebo JPEG" (§2.5 said "SVG", now corrected).
- **People live on `/o-nas/#lide`** (approved §10.5); the footer's "Co tu ještě najdete?" line links there as "Lidé".

### Contrast (computed, WCAG 2.x)

| Pair | Hlína | Med | Use |
| --- | --- | --- | --- |
| ink on ground (cream) | 13.75 | 13.42 | body text, questions, links, focus ring |
| ink on band (sand) | 11.35 | 11.20 | the same on sand fields |
| muted on ground | 6.77 | 6.58 | labels, roles, notes |
| muted on band | 5.59 | 5.49 | the same on sand |
| on-deep on deep (clay) | 9.95 | 10.08 | the clay field: H1, answer, number |
| on-deep-muted on deep | 8.21 | 8.02 | "Nonstop převoz zesnulých" label |
| rule on ground | 3.06 | 3.03 | placeholder frames (UI ≥ 3 : 1); no rules elsewhere |
| rule on band | 2.52 | 2.53 | placeholder frames only (prototype marker, never in production) |
| drawing line (black, `multiply`) on ground | 18.39 | 18.65 | drawings on cream |
| drawing line on band | 15.17 | 15.57 | drawings on sand |
| drawing line inverted (`screen`) on deep | 11.36 | 11.35 | the hero drawing on clay |

Print: ink on white 15.71 / 15.11; fields print as white with rules.

### Budgets

`dist/`, gzip: HTML with the inlined CSS at most 8.8 KB per page (`/jak-postupovat/`; home 7.9 KB), so HTML + CSS ≤ 9 KB per page (limit 100 KB); **JS 0**; the largest paint is text (the H1 question or the number), and the hero drawing is `loading="lazy"` beside it. Fonts: two preloaded faces (Alegreya 700 latin 24 KB, 400 latin 23 KB; Gelasio 20 KB each), the sans and latin-ext faces on demand; no third-party requests.

### Distinctiveness scorecard (design-differentiation §7)

Scored 0–3 per dimension from the built pages, the DOM outlines recorded by QA and the greyscale screenshots (`docs/notes/screens/rodinny-rozhovor/greyscale/`, home at 375 and 1280 for A, B, C, D and F, and the two contact sheets).

| Dimension | F vs A (Rodinná tradice) | F vs B (Důstojná jednoduchost) | F vs C (Noční linka) | F vs D (Plný přehled) | Evidence |
| --- | --- | --- | --- | --- | --- |
| Composition (page layouts, section order) | 3 | 3 | 2 | 3 | F: full-bleed alternating fields, each a question with a two- or three-sentence answer and an optional drawing margin; no rules, no cards. A: editorial hero and prose under hairlines; B: CTA tier and tinted bands; D: a four-column ruled directory. C also opens with the number on a dark field, but then runs one dark statement per screen, where F turns to light question fields after the first. |
| Navigation (header, mobile nav, CTA pattern) | 3 | 3 | 3 | 3 | F: wordmark and at most five words, always visible, wrapping on phones, no button, not sticky; the nonstop number is the answer to the H1 (home), a clay strip (inner pages) and the closing sentence. A: centred letterhead, Menu button, dark strip; B: sticky header, Menu dropdown, fixed bottom bar; C: dark panel with "Obsah"; D: boxes and "Rejstřík". |
| Typography (families, scale, hierarchy) | 2 | 3 | 3 | 3 | F: one calligraphic book serif (Alegreya) for questions, answers and the number, its sans only for nav and labels, 21 px body. A is serif-led with a humanist sans as well (EB Garamond or Literata with Source Sans 3, smaller body), so the difference is the single family and the scale, not the kind: 2. B, C and D are sans (C 76 px grotesque, D sans + mono). |
| Image usage (size, frequency, crops, captions) | 3 | 2 | 3 | 3 | F: commissioned pen drawings in field margins, recoloured per field, and one people photograph. A: large warm photographs; C: none on home; D: thumbnails only. B uses few, uniform images too, but photographs in a grid against F's line drawings: 2. |
| Content hierarchy (what comes first, depth of IA) | 3 | 2 | 2 | 3 | F: the nonstop number is the answer to the first question, then "Co nás teď čeká?", the price sentence, "Kdo jste?"; services are answers on one page. A leads with the story; D shows everything at once. B (CTA, then steps) and C (number, then one decision per screen) also put the call first, so the order is close; the depth differs (B and C have service detail pages, F has none): 2. |
| **Total** | **14 / 15** | **13 / 15** | **13 / 15** | **15 / 15** | all pass (≥ 11, no dimension < 2) |

All four pairs stay "conservative and credible" to the reviewer's judgement: no ornament, no motion, no stock imagery; the only strong colour is the clay field behind the first answer.

### Speed

**Lighthouse 12, mobile (default emulation), Playwright's Chromium 1248, fixture build in prototype mode**, three runs per page, load average 11–17 (other sessions on the machine; it was 100–230 during QA):

| Page | Performance (3 runs) | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 99 · 99 · 100 | 100 | 96 | 69 | 1.4 s | 1.7–1.8 s | 0 | 0 ms | 160 KiB |
| `/jak-postupovat/` | 99 · 99 · 100 | 100 | 96 | 66 | 1.4 s | 1.7–1.8 s | 0 | 0 ms | 148 KiB |
| `/cenik/` | 100 · 99 · 99 | 100 | 96 | 66 | 1.4 s | 1.7–1.8 s | 0.017 | 0 ms | 147 KiB |
| `/oznameni/` | 100 · 99 · 99 | 100 | 96 | 66 | 1.4 s | 1.7–1.8 s | 0 | 0 ms | 146 KiB |

The trial client `hnatek-f` (logo, 14 pages) measured 99 / 99 / 99 / 100 with Best practices 100 and CLS 0 on all four.

- **Performance is 99 or 100, not a steady 100.** The largest paint is text and there is no script, so the score is set by Lantern's simulated FCP / LCP (1.4 s / 1.7–1.8 s), which moves between 99 and 100 with the machine's load. What was tried: a separate CSS file (99 every run), inlined CSS (now), three preloads and no preloads (both slower), and subsetting the fonts (rejected: the contract asks for `@fontsource` files and there is no subsetting tool in the repo). D measured 100 on all four at load 10–15 with smaller sans fonts; F's body face (Alegreya, 23–24 KB per weight) is the difference.
- **CLS.** 0 everywhere except Ceník (0.017, "good" is < 0.1): the Alegreya Sans faces swap in on its many small labels (the "UKÁZKA" and placeholder marks), and Arial at 85.6 % cannot match every string. On the trial client the logo moved the page (CLS 0.034) until it got a definite height (see the decisions).
- Best practices 96 on the fixture: no `public/favicon.ico` (100 on hnatek-f, which has one). SEO 66–69: prototype builds are `noindex` and `robots.txt` disallows all. Both by design, as for C and D.

### Verification

| Step | Result |
| --- | --- |
| `npm test` | 15 files, 291 tests passed (illustration schema, gate and launch-check tests, the CMS "Kresby" entry, `client:new` for F) |
| `npm run test:harness` | 14 passed |
| `npm run lint` | clean |
| `npm run typecheck` (tsc + harness check) | 0 errors |
| `npm run check -w templates/rodinny-rozhovor` | 0 errors, 0 warnings, 0 hints |
| `npm run build -w templates/rodinny-rozhovor` | 17 pages (fixture, prototype) |
| `npm run build:production -w templates/rodinny-rozhovor` | fails with exactly the fixture's rules, as D: G-011 (3), G-012, G-020, G-021, G-031 (50), G-032 (17 = D's 12 + the 5 placeholder drawings), G-040 (7), G-073, G-074 (3); G-071 the expected warning. No G-078 (the file exists). |
| `npm run qa` (A, B, C, D, F; `--workers=4 --timeout=240000`, outside the sandbox) | first F run: failures in test 7 (no toggle on phones: the shared change below), a 43 px notice-strip link, and home test 2 (office hours and the nonstop link under one heading); fixed. **Full run (A, B, C, D, F + structure): 1484 / 1485**; the one failure was the L1 structure check reading the inlined `[data-price-amount]` selector on F's notice pages (fixed, see the decisions). **F + structure after the fixes: 281 / 281**, run again after the last change (the logo height): 281 / 281 again. A–D are unchanged since the full run. axe serious/critical: 0 on every page of every template. |
| option variant (`med`, `gelasio`, `high`, sections `hero, people, faq, notices, catalogue-links, next-steps, contact-summary`), and the same with `standard` | 17 pages each; at 320 and 375 the number and the price table overflowed with Gelasio (fixed); after the fix no `tel:` link wraps or passes the screen edge and no page scrolls sideways on 12 routes at 320 and 375; screenshots at 320, 375 and 1280 |
| no JavaScript | the only `<script>` on any of the 17 pages is core's `application/ld+json`; no inline event handlers |

**QA change (shared, flagged for the owner):** test 7 ("navigation toggle") assumed that a template without a toggle is at least 768 px wide (`expect(vp.width).toBeGreaterThanOrEqual(768)`): every earlier template hides its nav behind a button on phones. F has no button at any width. The test now asserts, when there is no toggle, that the first nav link is visible and, below 768 px, that every nav link is visible, which is what a toggle-less phone nav must guarantee. A, B, C and D are unchanged by it (they all have a toggle on phones).

### Trial client and export

`clients/hnatek-f`: a copy of `clients/hnatek` (which, with `clients/hnatek-b`, `-c` and `-d`, was not touched) switched per /site-build step 2 to `rodinny-rozhovor` (`hlina`, `alegreya`, `standard`; sections: the default six + `people`), with the neutral fixture's placeholder notices, people, FAQ and documents copied in (fictional, `placeholder: true`; all four optional folders present) and `illustrations.json` with the five placeholder drawings, feature on. Not a client deliverable.

- `client:validate -- hnatek-f`: **PROTOTYPE: PASS** (production blocked by G-012, G-020, G-021, G-031, G-032, G-040, G-074; G-071 warns).
- `client:build -- hnatek-f`: 14 pages.
- `client:export -- hnatek-f --force`: **RESULT: PASS (10/10 steps)** (`exports/hnatek-f/`, ignored by Git), run again after the last change.

### What from the comps is not implemented, and why

| Comp detail | Built instead | Why |
| --- | --- | --- |
| "Bez obřadu" as a nav word | the five core nav items Jak postupovat, Oznámení, O nás, Ceník, Kontakt; the rest in the footer line "Co tu ještě najdete?" | core fixes nav ids, order and labels; "Pohřeb bez obřadu" is a service |
| A separate "Lidé" page | people as a field on `/o-nas/#lide`, linked from the footer as "Lidé" | `/lide/` is not a core route (approved §10.5) |
| Hand-written home price sentence ("Pohřeb bez obřadu stojí od …, pohřeb s obřadem v síni od …") | "<group title> stojí <PriceValue>" for the first priced item of each package group, at most two, with `<VatNote>` | prices only through `<PriceValue>`; no "show on home" flag (approved §8) |
| Price-group questions as drawn | "Kolik stojí <title>?" then "A <title>?" built from group titles | core has no question field on a group (approved §8) |
| "Vytisknout" links on Ceník and notices | a Ctrl/Cmd + P sentence | no JavaScript at all (approved) |
| Notice footer without the office address and hours | the neutral footer keeps the legal row, address and office hours | contract invariant 3 (identification on every page); only service and price links are removed |
| Hard-coded "i o svátcích" in the home answer | "My." plus the client's `emergency.shortNote` | the claim is a business fact |

### Open legal questions (⚖, research §4a)

1. **L1, neutral form:** is the sand strip "Oznámení zveřejňuje <brand>. Telefon nonstop <number>", with the two nav words "Oznámení a obřady · Kontakt" (the wordmark links home), no clay, no drawings, no closing sentence, and the neutral footer, acceptable on `/oznameni/` and notice pages?
2. **L1 + accessibility:** as for C and D, core's fixed accessible name of the nonstop link still says "převoz" on notice pages, and the visible "Telefon nonstop …" is not contained in it (WCAG 2.5.3).
3. **L1, home:** the `notices` section is a question with a count ("Zveřejněná jsou 3 nadcházející rozloučení.") and a link, never names, among the price and service fields. Confirm that a count is not advertising "v souvislosti s informováním o smrti".
4. **L9:** `<VatNote>` sits with the home price sentence, under the Ceník H1 and under the items table, and on the A4 print. Confirm that this is "near the prices".
5. **Drawings:** the rights statement on `rightsConfirmed` (G-033) is the only enforceable check that a drawing is commissioned and not computer-generated; the guardrail (no doves, candles, hands, wilting flowers) stays a written rule and a launch review item.

### Screenshots (`docs/notes/screens/rodinny-rozhovor/`, local only: the folder is gitignored)

`greyscale/` with A, B, C, D and F home at 375 and 1280 and the two contact sheets; the option variant (`med`, `gelasio`, `high`, sections reordered with people, FAQ, notices and catalogues before the steps) at 320, 375 and 1280 is in `variant/` (`cenik2-320.png`: the price table after the fix).

## 12. Ported to main as template D (2026-11-14)

The owner asked for D `dve-cesty` and E `ticha-krajina` to be replaced, with pages that are informative but not plain or sterile, calming and simple. `rodinny-rozhovor` had been built here on 2026-11-13 but never merged; it replaces `dve-cesty` as **template D**. E is replaced separately.

- **Port:** the template, the drawings singleton (core §6.20, `getIllustrations()`, gate **G-078**, kept: main had no G-078), the Decap CMS entry "Kresby" (the old Pages CMS entry is gone with that CMS), `client:new`, the QA registration (port 4416) and the QA nav check for templates without a menu button. `supports.illustrations` is optional in `TemplateManifest`, so the other manifests stay as they are. The fixture keeps its placeholder drawings.
- **Retired:** `templates/dve-cesty/` and its registrations. Its core additions stay (they are shared). `docs/designs/dve-cesty/` stays as a superseded record. `clients/hnatek-d` keeps its Hnátek content and brand and now names `rodinny-rozhovor`; the trial client `hnatek-f` was not brought over.
- **Brought up to the current rules:** brand profile (template-contract §8a: the deep field takes the primary, cream the ground, sand a tint of the primary; brand fonts replace Alegreya); `<SiteInteractions />` (so the template now has one core script; every page stays complete without it); the guided list instead of checkboxes (design-differentiation §1.3: "Postupně", a reassurance, "Potom: <next question>" with `data-guide-next`, a closing line); the live office status under "Kdy můžeme přijít do kanceláře?" in ink, never muted; homepage photos (§1.4: the firm's place beside "Kdo jste?", flowers and coffin under "Jakou rakev a jaké květiny?", at most four services, drawing places close up unless real, the hero alone may keep its placeholder).
- **Signature** (§1.1): on desktop the question stays beside a long answer while it is read (sticky question column, no motion); longer answers unfold in place under "Povězte mi víc"; a field reached through "Potom" marks its question in the accent.
