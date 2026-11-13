# S11 · Template G `lide-a-misto` (Lidé a místo): plan

**Status:** plan, awaiting review (2026-11-13). Nothing is built or committed. Built from Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md), with the approved D2 direction and page set in [docs/designs/lide-a-misto/](../designs/lide-a-misto/README.md) as the design input (`html/` = the three original D2 boards, `source/*.dc.html` = all 20 boards of the approved canvas, README = tokens, contrast, CTA forms, guardrails, photo brief).

**Peers on this branch:** A `rodinna-tradice`, B `dustojna-jednoduchost`, C `nocni-linka`, E `ticha-krajina`, and D `plny-prehled`, which the parallel build `dve-cesty` removes. No imports, no shared component names. Pairwise checks and the §7 scorecard cover G against **A, B, C and E**; D is not scored. F `rodinny-rozhovor` (separate branch) and D `dve-cesty` join at merge time.

**Reserved for G:** QA port **4418**, gate rule **G-080**, this note s11, trial client `clients/hnatek-g`.

Decisions that need the owner's yes are marked **[review]**. Everything else follows the canvas, the contract, an approved answer from S6–S8, or an existing pattern. **G needs one core addition (§2, "Naše místa"). Nothing in core is edited until it is approved.**

## 1. Concept (from the canvas)

The firm is introduced through its real people and places, as a documentary photo essay with numbered captions. Archivo, near-black ink on an off-white ground, one deep green.

Structural ideas that make it G, not A, B, C or E:

- **Numbered figures are the signature.** Every photo carries a caption "01 · name. one sentence" with an optional muted address line, numbered in reading order per page. The same numbers survive without photos, as a numbered list of places with addresses or a numbered table of people, so the page reads complete with no photo at all. Two-digit numerals mean a figure or a place, nothing else; steps use green single digits.
- **People in the first screen.** The home opens with text on the left (H1, the lead, then the nonstop number 46 px green, underlined) and a large photo of the owners on the right, bleeding to the edge. Without the photo the H1 widens and the nonstop block moves beside it.
- **Rules, not boxes.** A 3 px ink rule above every block, 1 px rules between rows and under section heads; no cards, tints, shadows or radius.
- **A 360 px label column** carries headings on inner pages (steps, Ceník groups, Služby, O nás), text on the right.
- **Notice pages lose the photos, the green and most of the navigation**: a muted publisher sentence with the number, reduced nav and footer.

## 2. Core addition: "Naše místa" **[review]**

### 2.1 What exists, and why it does not fit

- **People photos** (`people[].photo`, `person.photo` slot, consent G-074) already cover the portraits. Nothing to add for people.
- **Page images** (`heroImage`, `secondaryImage`) give at most two per page. They are used for the home people photo, the O nás photo, the Kontakt office photo and the Pro účastníky hall photo (§3), with no core change.
- **Service images** (`services[].image`) cover the photos on Služby (vůz, síň, květinářství).
- **E's `site/landscapes.json`** is the right pattern but the wrong content: its image is required (G's places must exist without photos), it has no address or description, and its guardrail and CMS help text say "landscapes or buildings, no people". Reusing it would bend E's rules or G's. A sibling singleton is cleaner.

So one thing is missing: an ordered list of the firm's places, each with text that stands on its own and an optional photo.

### 2.2 Schema (`core/content/schemas.ts`, new §6.19 "Naše místa")

An **optional site singleton `src/content/site/places.json`**, registered in `OPTIONAL_SINGLETON_SCHEMAS` after `landscapes` (one ordered list, no ids or slugs; the client reorders by dragging; the same reasons as E's singleton).

```ts
export const MAX_PLACES = 12;

export const Place = z
  .object({
    name: text(80),             // "Kancelář na náměstí"
    address: optionalText(120), // "Náměstí 12, Vzorov" – free text, shown as the muted line
    note: optionalText(160),    // "Tady spolu vše domluvíme, bez spěchu."
    image: OptionalImage,       // existing ImageRef | null: alt, credit, source, depicts, rights, focus
  })
  .superRefine(/* image rules below */);

export const PlaceSet = z.object({
  places: z.array(Place).max(MAX_PLACES, `Nejvýše ${MAX_PLACES} míst.`).default([]),
});
```

- The visible caption is built from the place, not the image: "**NN**  name. note" + muted `address` + "Foto: credit" when filled. `image.caption` is not shown (the CMS help says so), so the text works with and without a photo.
- **Image rules [review]:** an image with `source: "licensed-stock"` or `depicts: "generic"` fails validation (G-001): *"Naše místa musí být skutečná místa vaší firmy na vlastních nebo zakázkových fotografiích, ne z fotobanky."* The concept only works as the firm's own places; `placeholder` stays allowed and is caught by G-032 in production. Alternative: help text only.
- **`address` is free text, not a ledger fact [review]**, like a person's `role` or E's `place`. The main address stays the tracked `contact` fact; the launch check's sign-off covers visible text. Alternative: a fact key per place (heavier, and most places share the office address).

### 2.3 Feature switch, `supports` flag, homepage

- `places` joins `CONTENT_FEATURES` after `landscapes`: `features.places` (default `false`, agent-only in `site.config.ts`) and `supports.places` on `TemplateManifest`, `false` for A–E. The existing G-005 loop rejects the feature on a template without support, with no new code.
- **No new homepage section [review].** G renders the places on the home inside its `family-story` section (the firm introduced through its places, with the link "O nás a naše místa"); with places off or empty, the same section shows the O nás `excerpt` instead. That keeps `HOMEPAGE_SECTIONS` unchanged. Alternative: a new section id `places` in `HOMEPAGE_SECTIONS` + `SECTION_FEATURE`, clearer for agents but one more core list to merge.

### 2.4 Image slot

`imageSlots["place.photo"] = { aspect: "3:2", required: false }`. The grid crops around `ImageRef.focus` (373 × 260 on the home, 572 × 360 and 274 × 210 on O nás, full width × 210 at 375). Rendered with `astro:assets` `<Picture>` (AVIF + WebP, width and height set, `loading="lazy"`).

### 2.5 Image rights, gate, launch check

- `collectPublishedImages()` and `collectReferencedMediaFiles()` include `places.json` images **while `features.places` is on**, next to E's landscapes. That applies every existing rule: **G-003** (file exists), **G-032** (no placeholder in production), **G-033** (rights confirmed), the `ImageRef` refinements, and the launch check's per-image `approvals.images[<file>].rightsEvidence`. With the feature off the file is ignored and its media are not emitted.
- **New rule G-080 "Places set present while the feature is on"** (error in prototype and production): `features.places` is on but `site/places.json` is missing, so the CMS could never add places (S2 finding B8). Same shape as G-077.
- No new fact-ledger keys (§2.2).

### 2.6 CMS, loader, fixture, client tools

- **CMS** (`tools/cms/pages-config.ts`): a file entry **"Naše místa"** (`src/content/site/places.json`) in "Firma a kontakt", after E's "Krajiny" (and F's "Kresby" at merge), shown while `features.places` is on and the template supports it. List `places` (0–12, summary `{name}`); fields `name` ("Název místa", required), `address` ("Adresa nebo upřesnění"), `note` ("Jedna věta o místě"), `image` (the existing inline `imageRef`). Help texts in plain Czech:
  - list: *"Místa, kde se staráte o zesnulé a o rodiny: kancelář, obřadní síň, vůz, vazárna, hřbitov. Fotografie jen vlastní nebo zakázkové, bez smutečních hostů a bez zesnulých. Místo bez fotografie se na webu ukáže jako řádek s adresou."*
  - `name`: *"Příklad: Kancelář na náměstí."* · `address`: *"Příklad: Náměstí 12, Vyškov."* · `note`: *"Příklad: Tady spolu vše domluvíme, bez spěchu."* · `image`: *"Na šířku, alespoň 1600 px. Popisek obrázku se nezobrazuje; text pod fotografií je název a věta výše."*
- **Loader:** `getPlaces(): Promise<Place[]>` in `core/content/load.ts` (empty unless the feature is on); `places` export in `virtual:site-core/data` / `env.d.ts`; a `places` field in `core/content/snapshot.ts`, parsed like `landscapes`.
- **Fixture:** `fixtures/neutral/src/content/site/places.json` with six placeholder places ("Zástupné místo 1–6", addresses "Zástupná adresa"), four with the existing `placeholder-3x2.png`, two without an image (to exercise the mixed case). The fixture's own `site.config.ts` keeps `places` off, so A–E builds and the export fixture stay byte-identical; G's `fixture.site.config.ts` switches it on.
- `tools/client/new.ts`: `"site/places.json": "places"` in `OPTIONAL_CONTENT`, after E's line.

### 2.7 Tests and docs

- `core/tests`: `PlaceSet` parses empty, full and image-less sets, rejects stock and generic images and more than 12 places; G-005 rejects `features.places` without support; G-080 fires only with the feature on and no file; G-003 / G-032 / G-033 and `collectReferencedMediaFiles` count place images only while the feature is on; the launch check asks for rights evidence of a published place photo. `tools/cms/tests`: the entry appears only with feature and support, with its fields and help texts. `tools/client/tests`: `places.json` copied for G only. A–E manifests still validate.
- Docs: `docs/content-contract.md` (§6.19 "Naše místa", G-080 row, scope of G-003/G-032/G-033), `docs/template-contract.md` §3 (`supports.places`, `place.photo`), `docs/editable-fields.md` (the entry and its help texts), `.claude/skills/site-build/SKILL.md`, `fixtures/neutral/README.md`.

### 2.8 Merge with D and F

Every addition sits on its own line after E's (`landscapes`) and F's (`illustrations`, on its branch): `CONTENT_FEATURES`, `SiteConfig.features`, `supports`, `OPTIONAL_SINGLETON_SCHEMAS`, `OPTIONAL_CONTENT`, the CMS entry, the snapshot field, and G-080 after G-078 / G-079. Expected conflicts are adjacent added lines; keep all, in the order E, F, D, G. **Dependency:** G's home uses the core section `price-summary`, added for the old D. If `dve-cesty` removes it from core, G needs it back (or the price column moves into `contact-summary`); this is recorded in the shared session notes so that build keeps it.

## 3. Intended manifest

```ts
{
  id: "lide-a-misto",
  name: "Lidé a místo",
  version: "0.1.0",
  coreVersion: "^0.1.0",
  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: false,   // Služby is one long page with anchors (canvas)
    mapEmbed: false,             // map is always a link
    notices: true,               // /oznameni/ list + detail (drawn)
    people: true,                // home "Kdo vás přijme", the Lidé section on /o-nas/#lide, Kontakt
    faq: true,                   // /jak-postupovat/#caste-otazky
    documents: true,             // footer link + /pravni-informace/#dokumenty
    guestInfo: true,             // /pro-ucastniky/ (drawn)
    prePlanning: true,           // /pohreb-predem/, built from Pro účastníky
    priceInclusions: true,       // "V ceně je zahrnuto / Není zahrnuto" (drawn)
    landscapes: false,
    places: true,                // §2
  },
  homepageSections: {
    available: ["hero", "family-story", "next-steps", "people", "services",
                "price-summary", "contact-summary", "notices", "catalogue-links"],
    default:   ["hero", "family-story", "next-steps", "people",
                "price-summary", "contact-summary", "notices"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },
  options: {
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },
  imageSlots: {
    "company.logo":   { aspect: "none", required: false },  // dark logo on the light ground; wordmark while null
    "home.people":    { aspect: "5:4", required: false, page: "home", field: "heroImage" },
    "about.people":   { aspect: "2:1", required: false, page: "o-nas", field: "heroImage" },
    "contact.office": { aspect: "3:2", required: false, page: "kontakt", field: "secondaryImage" },
    "guest.hall":     { aspect: "3:2", required: false, page: "pro-ucastniky", field: "heroImage" },
    "place.photo":    { aspect: "3:2", required: false },   // §2.4
    "service.photo":  { aspect: "3:2", required: false },   // services[].image, Služby only
    "person.photo":   { aspect: "3:4", required: false },
    "coffin.item":    { aspect: "4:3", required: false },
    "flower.item":    { aspect: "1:1", required: false },
    "notice.photo":   { aspect: "4:5", required: false },   // family photo, with consent
    "notice.parte":   { aspect: "none", required: false },
  },
  pageFields: {
    home:   ["title", "navLabel", "metaTitle", "metaDescription", "lead", "heroImage"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "body", "heroImage"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "secondaryImage"],
    "pro-ucastniky": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "heroImage"],
    "jak-postupovat", sluzby, rakve, kvetiny, cenik, oznameni, "pohreb-predem",
    "pravni-informace", "ochrana-osobnich-udaju":
            ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
  },
}
```

### 3.1 Notes on the manifest

- **Default homepage order** follows the 1280 home board: hero → places (`family-story`) → steps → people → price · office · notices. Counted on `data-section`, it differs from A in 5 positions, B in 6, C in 5 and E in 5 (fixture, people and notices on). For a client with people and notices off it is hero → family-story → next-steps → price-summary → contact-summary: still 3 positions from A (the closest).
- **The three-column row.** `price-summary`, `contact-summary` and `notices` stay separate `main` children (each with its own `data-section`), so the order check and section moves still work. `main` is a CSS grid: full-width sections span all columns, and these three take one column each when they are adjacent; alone or at 375 they are full width.
- **`notices` on the home** is a link with the count only, never names (L1), as approved for D and E.
- **One look, no palette or font option.** The canvas has one palette and one family (as approved for `dve-cesty`). Only `emergencyEmphasis` is an option, so the agent's choices are the order of sections and the emphasis.
- **Hero without an image field option.** The hero switches by content: with `pages.home.heroImage` the people photo sits right; without it the hero is text with the nonstop block beside it (the "home without photos" board). No `heroVariant`.
- **`emergencyEmphasis: "high"`** adds the green strip under the header on every non-notice page **and keeps** the opening block, as drawn on both Jak postupovat boards. **[review]** E instead moved its block to avoid a third copy; here the strip is one line and the block is the large number, so I keep both as drawn.
- **Font:** Archivo variable from `@fontsource-variable/archivo` 5.3.0 (OFL-1.1, checked on npm), its `wdth.css` (weight and width axes), faces declared with `unicode-range` for latin and latin-ext only (S3 lesson), weights 400 and 700, widths 100 % and 85 %. One family, two weights. Preload the latin-ext and latin face used by the H1. New dependency, so the lockfile changes. Pangram check in both weights and widths before the build goes further. If the variable file pushes the page over the CSS + font budget, fallback **[review]**: static `@fontsource/archivo` 400/700 and captions at 100 % width.

## 4. Pages and composition

Exact values from `source/*.dc.html` and the README tokens: body 18 / 1.55–1.6, lead 20, captions 17 (the original home board's 16 is built at 17), legal footer ≥ 16 at 375; H1 54 (home without photo 64) / 34; H2 32 / 26; spacing 4 · 8 · 12 · 16 · 24 · 32 · 56 · 72 · 88–96; side margin 56 px at 1280, gutter 16 px at 375; label column 360 px + 56 px gap; radius 0. One-letter words carry `&nbsp;`, phone numbers `nowrap`. Below 48 rem every two-column layout becomes one column.

| Route | Composition | Drawn? |
| --- | --- | --- |
| `/` | **hero** (`data-hero`): text column (H1 = home title, lead, nonstop block) + people photo bleeding right with caption "01 …" (`heroImage.alt` as alt, caption = `heroImage.caption` + credit); without photo: H1 64 px left, nonstop block right. **family-story**: "Kde se o vašeho blízkého postaráme" + places as a 3-column figure grid numbered from 02 (01 when there is no hero photo), image-less places as text cells (number, name, address, note under a 1 px rule, no empty frame); no image at all → the numbered 2-column list; places off or empty → the O nás excerpt + link. 375 shows the first three places + "Všechna místa (n)". **next-steps**: label column + three first-hours steps with green numerals + link to the guide. **people**: "Kdo vás přijme", portraits 120 × 150 or names only; mixed: a person without a photo gets no frame. **price-summary · contact-summary · notices**: the three ruled columns. | 1280 ×2, 375 |
| `/jak-postupovat/` | H1, lead, nonstop block; picker "Kde blízký člověk zemřel?" as full-width 52 px rows between 1 px rules, links to `#situace-…` (core `guidance-flow.ts`, `:has(:target)` + `[data-guide]`, no JS); picked row filled green with "(vybráno)" and the sentence "Ukazujeme kroky, když … Zobrazit kroky pro všechna místa"; phases as condensed caps; steps with green numerals under 3 px rules, situation notes, native checkboxes for checklists, long text in `<details>`; emergency contact prompts carry the nonstop link inline. **Časté otázky** (`#caste-otazky`) per topic as `<details>`. | 375 ×2 |
| `/sluzby/` | H1 + lead + nonstop block; anchor row; one block per service (`id=<service id>`): H2 in the label column, summary + body right, the service image as a numbered figure beside the text when set, "Co je v ceně" → `/cenik/#<group>`; closing office line. No detail pages. | 1280 |
| `/cenik/` | H1 + UKÁZKA mark when demo, `<VatNote>` as the 22 px bold lead, validity + `<DemoPricingNotice>`, the Ctrl/Cmd + P hint; nonstop block right; anchor row of groups; per group: label column (H2, from-price 34 px bold = the first item's `<PriceValue>`, "včetně DPH", summary), items table with 1 px rules (price right, `nowrap` on the amount only: E lesson), included / excluded side by side; groups without lists show only the table; `<VatNote>` again at the end. **No photos.** | 1280 |
| `/cenik/` print | `print.css`: white paper, ink only, 16 px body; name and title, VAT sentence, nonstop and office on separate lines, groups as heading + price + table, one-line included / excluded, legal line + source URL. | A4 |
| `/kontakt/` | H1, lead, nonstop block; office photo "01 …" (`secondaryImage`) when set; **Kancelář** (address, map link, Úřední hodiny `dl` with rules, holiday note, `data-office-hours`); **Telefony a e-mail** as label-over-number links (block spans, never flex); **Převoz zesnulých** (`data-emergency-block`: service area, availability, the nonstop link); **Kdo vás přijme** (names + roles, link to `/o-nas/#lide`) when people are on; billing details. | 375 |
| `/o-nas/` | H1, lead, nonstop block; the people photo bleeding right "01 …" (`heroImage`); **Kdo jsme** (body); **Naše místa** (`#mista`): 2 large + 4 small figures with address lines, or the full-width numbered list; **Lidé** (`#lide`, when people are on): 3:4 portraits with numbered captions and direct phones, or the numbered table; closing columns Kancelář (address, hours, map link) · Pro účastníky (link, when on) · Lidé (link, when on). The board's "Smuteční síň" column is not built: core has no field saying which place is the hall. See §4.1. | 1280 ×2 (+ Lidé 1280 ×2) |
| `/oznameni/` | **Neutral chrome** (§5). H1 + consent sentence; "Nadcházející rozloučení" and "Starší oznámení" as ruled rows: ceremony date and time · optional 4:5 family photo · name link + dates · place and ceremony type; empty state one sentence. | 1280, 375 |
| `/oznameni/<slug>/` | **Neutral chrome.** As drawn: "Všechna oznámení", family photo 128 × 160 beside the name 32 px, dates, the ceremony `dl` (Kde + map link, Obřad, Přenos as a plain link, L14), **Od rodiny**, **Kondolence** (instruction with the e-mail), QR (`<NoticeQrCode>`) + the Ctrl/Cmd + P hint, parte image or PDF link. Nothing promotional. | 375 |
| `/pro-ucastniky/`, `/pohreb-predem/` | H1, lead, nonstop block; the hall photo "01 …" (`heroImage`, Pro účastníky only); body split at each `##` into 3 px-ruled blocks. | Pro účastníky 375 |
| `/rakve/`, `/kvetiny/` | Built from Lidé: items as numbered figures (4:3 / 1:1) in a 4-column grid with name, code / material / type, summary; without images a numbered table; zero items one sentence + office phone; Květiny ends with the flowers phone. | from Lidé |
| `/pravni-informace/` | Built from Kontakt: ruled blocks **Mimosoudní řešení sporů** (ADR + link), **Reklamace**, **Dokumenty** (`#dokumenty`: title link, "PDF", valid from), body. | from Kontakt |
| `/ochrana-osobnich-udaju/` | H1, body as ruled blocks. | from Pro účastníky |
| `/404.html` | "Chyba 404" caps, H1 "Tuto stránku jsme nenašli.", one sentence with two links (úvodní stránka, kontakt), nonstop block. | 375 |

### 4.1 Where "Lidé" lives **[review]**

The canvas draws Lidé as its own page with "Lidé" in the nav. Core has no `lide` page id, and core owns the URLs. I propose the drawn page as the **`#lide` section of `/o-nas/`** ("O nás a naše místa" becomes the page of people and places, which is the template's name), with a nav item **"Lidé" → `/o-nas/#lide`** while people are on, added template-side like E's `/kontakt/#lide`. The home and Kontakt link there. Alternative: a core page id `lide` (optional, required while `features.people` is on), a second core change.

### 4.2 Figure numbering (`src/lib/figures.ts`)

A tiny per-page counter: figures and places get "01", "02" … in render order, starting at 01 on each page. The home hero photo, when present, is 01 and the places continue from 02. The image-less list and table keep the numbers. QA (§8) checks that two-digit numerals appear only inside `figcaption` or the place / people lists.

### 4.3 Navigation, header, footer

- **Navigation:** core fixes the order and takes labels from `navLabel` (approved for C, D, E). One `<nav>`: `site.nav` without "home" (the wordmark links home), plus Pro účastníky, Pohřeb předem, Lidé (`/o-nas/#lide`), Časté otázky and Dokumenty when on, before Kontakt. ≥ 64 rem: a text row in Archivo 18 beside the wordmark block, wrapping to a second line when long. < 64 rem: the outlined "Menu" button (`aria-expanded`, "Menu" ↔ "Zavřít", Escape closes) opens the in-flow list of 24 px bold links between 1 px rules, then the nonstop block, then Kancelář under its own heading. Without JS the list shows in flow and the button is hidden. Current page: `aria-current`, bold with a 3 px underline.
- **Header:** wordmark (logo when set) with `company.tradition.publicWording` as the muted subtitle when set; 1 px rule under. Not sticky.
- **Footer (every non-notice page):** four 3 px-ruled columns: **Nonstop** (`data-emergency-block`, the link at 28 px, `emergency.shortNote`), **Kancelář** (address, hours with `data-office-hours`, office phone, e-mail), **Na webu** (Pro účastníky, Časté otázky, Dokumenty, O nás, each when on), **Právní informace** (Právní informace a reklamace, Ochrana osobních údajů, document PDFs); then the legal row (legal name, sídlo, IČO, DIČ, register entry) and "Spory: Česká obchodní inspekce, adr.coi.cz". At 375 the columns stack. **[review]** The 375 boards show only the legal row; I build the same footer stacked, so office hours and documents are reachable on phones too.
- **Neutral footer (notices):** legal row, Právní informace, Ochrana osobních údajů, ADR. No Nonstop, Kancelář or Na webu columns (the publisher sentence carries the number).

## 5. Emergency CTA forms

| Form | Where | Build |
| --- | --- | --- |
| Default | home hero (left column, under the lead), inner pages (right column of the opening at 1280, under H1 + lead at 375), footer column 1 | 3 px ink rule, then `<EmergencyPhoneLink variant="custom">` as one block link: label (17–18 px bold ink) and number (46 home / 40 inner / 34 at 375 / 28 footer, bold green, 3 px underline, `nowrap`) as **block spans, never flex** (QA test 9); `emergency.shortNote` muted under the link |
| High emphasis | additionally, a full-width green strip directly under the header on every non-notice page | the same component, white 17 px bold label + underlined `nowrap` number; wraps to two lines at 375; focus ring white, inset 6 px (ink on green is 1.90 : 1) |
| Neutral | `/oznameni/` and notice pages | muted sentence "Oznámení zveřejňuje <brand>." + ink link "Telefon nonstop +420 …"; no rule, no green, no strip even when emphasis is high. ⚖ L1 |

The number never wraps: "+420 000 000 199" at 46 px bold Archivo is about 390 px in the 520 px column, and 34 px fits 343 px at 375. At 320 px I will measure and clamp with `min(…)`, as C did. Office hours never appear in an emergency block (separate headings everywhere).

## 6. Component inventory (all new names; none matches a file in A–E)

| Area | Components |
| --- | --- |
| Layout | `layouts/EssayLayout.astro` (`data-emphasis` on `<html>`, SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah` as the section grid, `neutral` prop) |
| Chrome | `EssayHeader` (wordmark, subtitle, nav row / Menu button), `EssayMenu`, `HighLineStrip`, `NonstopRuleBlock`, `PublisherSentence`, `EssayFooter` (full / neutral) |
| Figures and places | `NumberedFigure` (figure + `<Picture>` + numbered caption + address + credit), `PlaceGrid` (photo and text cells), `PlaceList` (numbered list fallback), `src/lib/figures.ts` |
| Home | `PeopleHero` (photo / text-only), `PlacesSection` (family-story), `FirstStepsRow`, `ReceptionSection` (people), `ServiceLinksSection`, `PriceColumn`, `OfficeColumn`, `NoticesColumn`, `CatalogueLinkRow` |
| Guidance + FAQ | `DeathPlacePicker`, `PhaseSteps`, `StepBlock`, `FaqTopics` |
| Pricing | `PriceGroupBlock`, `PriceItemRows`, `IncludedExcluded`, `styles/print.css` |
| Notices | `NoticeRowList`, `NoticeDetailBlock`, `NoticeQrNote` |
| People, contact, catalogue, legal | `PortraitGrid`, `PeopleNumberTable`, `OfficeHoursRuled`, `PhoneRows`, `TransportBlock`, `BillingDetails`, `CatalogueFigures`, `CatalogueNumberTable`, `AdrBlock`, `DocumentList`, `RuledProse` (Markdown body split at `##`), `AnchorRow`, `ServiceSection` |

Plus `src/i18n/cs.ts` (UI strings only, plain Czech, `&nbsp;` after one-letter words), `src/styles/global.css`, `fonts.css`, `print.css`. Plain CSS, no Tailwind (as C–E). Core safety components styled only through `class` + global CSS or their `data-*` hooks. One inline script for the Menu toggle (≤ 1 KB). Wiring copied from B for scripts only: `package.json` "@site/template-lide-a-misto", `astro.config.mjs`, `content.config.ts`, `env.d.ts`, `fixture.site.config.ts` with every optional type and `places` on.

## 7. Differentiation row (design-differentiation §5)

| Dimension | A Rodinná tradice | B Důstojná jednoduchost | C Noční linka | E Tichá krajina | **G Lidé a místo** |
| --- | --- | --- | --- | --- | --- |
| Header | centred letterhead | left logo, right nav, sticky | sticky side rail | plain top bar, Figtree nav | **wordmark + tradition subtitle, Archivo nav row, 1 px rule; outlined Menu button** |
| Emergency CTA | dark utility strip | header button + bottom bar | the rail itself | ruled stamp line after the opening and in the footer | **large green number under a 3 px rule in the hero column; green strip when high; footer column** |
| Mobile navigation | in-flow full-height list | dropdown under sticky header | ruled list under the panel | light serif words, space only | **24 px bold links between 1 px rules, nonstop block, Kancelář** |
| Homepage order | hero → story → services → steps → visit | hero → steps → services → contact → story | hero → services → steps → story → office | hero → steps → services → story → people → office | **hero → places → steps → people → price · office · notices** |
| Hero | editorial, image or panel | practical, CTA tier | one statement, one screen | text only, 12-col grid | **text left + people photo bleeding right; text + nonstop side by side without it** |
| Services IA | one long page | index + detail | statement index + detail | long page, bands | **long page, 360 px label column, numbered place photos beside three services** |
| Guidance | article + margin TOC | phased checklist | one step per statement | picker as a sentence | **full-width ruled picker rows, picked row green; phases + green numerals** |
| Catalogues | figure gallery | uniform grid | ruled rows | one item per row | **numbered figures in four columns; numbered table without images** |
| Pricing | `dl` + dot leaders | `table` per group | statement per group | from-price as H2, hairlines | **label column with from-price, ruled table, inclusions side by side** |
| Notices | – | – | large-type agenda | calm sentences | **ruled rows: date · photo · name · place** |
| About | long-form, drop cap | fact sheet first | statements, one photo | passages, one band | **photo essay of places with numbered captions and addresses, then people** |
| Footer | rich letter | compact two rows | four columns on the rail | stamp line, three columns | **four 3 px-ruled columns, legal row** |
| Typography | serif display + humanist sans | neutral grotesque | one grotesque, 76 px H1 | light serif, Figtree labels | **one grotesque (Archivo) in two widths, bold 700 headings, condensed caption numerals** |
| Colour | warm paper, umber | cool slate, forest | dark, amber | mist + spruce-blue | **off-white, near-black, one deep green** |
| Image use | larger, fewer, captioned | minimal, uniform | none on home | full-bleed landscapes, never first screen | **documentary people and places, numbered captions, people photo in the first screen** |
| Separation | hairlines, small caps | 1 px lines, tinted bands | darkness and space | photographs and space | **3 px ink rules over blocks, 1 px rules between rows** |

**Closest pairs.** **G / B** (both sans on a light ground, rules, a green accent): B's sticky header with an emergency button, bottom call bar, tinted bands, uniform card-like grids and index + detail services against G's non-sticky header, number in the hero column, no tints, the photo essay with numbered captions and one long Služby page. **G / E** (light ground, captioned photos, long services page, a left label column like E's cols 1–4): E's light serif, stamp line, text-only hero and full-bleed bands against G's bold grotesque, rules over blocks and the people photo in the first screen. I expect colour mood and separation at 2 for G / B and check both pairs on greyscale screenshots before claiming more. The header outline QA check is the risk for G / E (both "wordmark left, nav right"); G's wordmark block (wordmark + subtitle) and the Menu button differ in DOM, and I will confirm it in QA rather than assume it.

## 8. Law (research §4a) and things I will not build

- **L1, notices:** neutral chrome (publisher sentence, reduced nav "Oznámení a obřady · Kontakt · Úvodní stránka", neutral footer), no photos of the firm, no numbered captions, no green, no `PriceValue`, no service links, no "Objednat". The home `notices` section is a link with a count. ⚖ The publisher sentence and the reduced nav need the lawyer; as for C–E, core's fixed accessible name of the nonstop link says "převoz" and does not contain the visible "Telefon nonstop …" (WCAG 2.5.3).
- **L8** legal identification in every footer, neutral included; **L9** `<VatNote>` as the Ceník lead and again at the end, on the A4 sheet and with the home price column; **L10** ADR + Právní informace in every footer; **L11** no cookies, no third-party requests, the font self-hosted; **L12** family photos only with the notice's consent record (G-070), people photos with recorded consent (G-074), place photos with rights (§2.5); **L14** livestream as a plain link. No newsletter or e-mail capture.
- **Print links** become the Ctrl/Cmd + P hint (approved for C–E).
- **Not built:** a `/lide/` route (§4.1); text on photos; photos on Ceník or notice pages; a second accent colour.

## 9. Registration and verification plan

- `qa/templates.ts`: `lide-a-misto`, letter **G**, port **4418**, on its own line. Every pairwise check already runs over `templatePairs()`. New checks for G's idea, on every template that renders them: **two-digit figure numerals only in captions and place / people lists** (`[data-figure-number]`); **no `[data-figure]` and no green strip on notice pages**; **no empty image frame** when a place, person or hero has no image. QA runs with `--workers=4 --timeout=240000` outside the sandbox. D `plny-prehled` stays in the run while it exists on this branch; a failing D / G pair is recorded, not fixed, since D is removed.
- `tools/client/new.ts` usage text; `tools/client/tests` and `tools/cms/tests` template lists (+ the Naše místa entry); `.claude/skills/site-build/SKILL.md` (when to choose G: a family firm whose owners want to be seen and can commission one documentary photo session; image slots; the photo brief; the places list); `docs/design-differentiation.md` section for G + the G column in §5.
- **Verify, in order:**
  - `npm test`, `npm run lint`, `npm run typecheck`, `npm run check` (Node from `.nvmrc`, 24.21.0);
  - `npm run build -w templates/lide-a-misto` (prototype) and `build:production` (exactly the fixture's expected rules, G-032 counting the placeholder places and hero);
  - `npm run qa` for A, B, C, E and G (axe serious / critical 0);
  - Lighthouse mobile via `npx lighthouse` with `CHROME_PATH` on Playwright's Chromium under `~/Library/Caches/ms-playwright/chromium-1248/` for home, jak-postupovat, cenik, oznameni; the home people photo is the LCP at 1280 and probably at 375, so it is `loading="eager"`, `fetchpriority="high"`, AVIF ≤ 200 KB, and must keep Performance 100;
  - budgets: HTML + CSS ≤ 100 KB gzip per page, JS ≤ 10 KB;
  - greyscale screenshots at 375 and 1280 next to A, B, C and E; the §7 scorecard against each (≥ 11 / 15, no dimension < 2); contrast recomputed from the built CSS.

### 9.1 Trial client `clients/hnatek-g`

- A copy of `clients/hnatek` (same content), switched per /site-build step 2 to `lide-a-misto` with the manifest defaults and `emergencyEmphasis: "high"`; optional content types off (notices, people, FAQ, documents, guest info, pre-planning).
- **Places on [review]**, as the one exception, because they are the template's idea and Hnátek has real photos for them. Built only from facts in `provenance/facts.json` and the client's own wording on O nás: **01 "Kancelář a vazárna květin"**, address "Dědická 38/22, Vyškov" (the tracked contact address), image `budova-kancelare.jpg` with the metadata it already has; **02 "Vazárna květin"**, same building, image `kvetiny-vazba-bila.jpg` (rights already in `approvals.json`); **03 "Pohřební vůz Cadillac"** (named on O nás), no image, so the mixed case shows. Notes are taken from O nás sentences or left empty; nothing invented. Alternative: places off as the brief says, and the home shows the O nás excerpt.
- Hnátek photos in the page slots: O nás `heroImage` stays `budova-kancelare.jpg` (as in `clients/hnatek`); Kontakt `secondaryImage` = `budova-kancelare.jpg` with the same metadata. Home `heroImage` (people) has no Hnátek photo: the fixture's placeholder **[review]**, so the team sees the drawn layout; alternative: none, and the home shows the text-only hero.
- `notes/feedback.md`: a dated entry (2026-11-13) saying hnatek-g is a G prototype for internal comparison.
- Then `client:validate`, `client:build`, `client:export -- hnatek-g --out ~/Documents/hnatek-g-web` → **RESULT: PASS 10/10**.
- Not touched: the main checkout, other worktrees, `clients/hnatek`, `-b`, `-c`, `-e`, `-f`, `~/Documents/hnatek-web` and `hnatek-b-web` … `hnatek-f-web`. Nothing is committed until asked.

### 9.2 Contrast (computed, WCAG 2.2; rechecked after the build)

| Pair | Ratio | Use |
| --- | --- | --- |
| ink `#161616` on ground `#F7F7F4` | 16.86 | body, headings, links, rules, focus ring (3 px, offset 3) |
| muted `#3F3F3F` on ground | 9.81 | captions, roles, secondary lines |
| muted-2 `#4D4D4D` on ground | 7.88 | subtitle, nonstop sentence |
| green `#1F4D45` on ground | 8.87 | nonstop number, step numerals |
| white on green | 9.52 | high strip, picked picker row, inset focus ring on green |
| ink on white (print) | 18.10 | A4 |

## 10. What needs your answer

1. **The core addition (§2):** optional singleton `site/places.json` (`places[]` of `{ name, address?, note?, image? }`, max 12), the `places` feature and `supports` flag (false for A–E), the `place.photo` slot (3:2), existing image rules while the feature is on, **G-080** for a missing file, the CMS entry "Naše místa" with the help texts, tests and docs.
2. **Schema rejects stock and generic place photos (§2.2)**, and **`address` stays free text, not a fact (§2.2)**.
3. **No new homepage section (§2.3):** places render inside G's `family-story`, which falls back to the O nás excerpt.
4. **Lidé as `/o-nas/#lide` with a nav item "Lidé" (§4.1)**, not a new core page.
5. **High emphasis adds the strip and keeps the opening block (§3.1)**, as drawn.
6. **Footer stacked at 375 (§4.3)** instead of the boards' legal-only footer.
7. **hnatek-g (§9.1):** places on with Hnátek's own building and flower photos plus the Cadillac as a text place; a placeholder people photo on the home.
8. **Font fallback (§3.1)** to static Archivo only if the variable font breaks the budget.

## 11. Build results (2026-11-13)

All eight §10 points were approved ("Approve all, build"); the font fallback (point 8) was taken: Archivo ships as the weight-only variable files (latin 34.9 KB, latin-ext 32.6 KB), because the width-axis files are about 90 KB each. Captions use bold tabular numerals instead of the condensed width.

### 11.1 What was built

- **Core (places):** `site/places.json` → `PlaceSet` (§6.19 in content-contract), `features.places` / `supports.places` (false for A–E), `getPlaces()`, snapshot field, `virtual:site-core/data` export, gate rule **G-080**, place images in G-003 / G-032 / G-033 and the published-image set while the feature is on, client:new copies the file for supporting templates, CMS entry "Naše místa" (help text with the photo guardrail), fixture `places.json` (six places, four with placeholder photos, two without), `core/tests/places.test.ts`.
- **Template `templates/lide-a-misto/`:** manifest as §3; `EssayLayout`; 42 components (inventory in design-differentiation §3d.4); 17 fixture routes: home, jak-postupovat, sluzby (one long page), cenik (+ `print.css`), kontakt, o-nas (`#mista`, `#lide`), oznameni (list + 3 notices, neutral chrome), rakve, kvetiny, pro-ucastniky, pohreb-predem, pravni-informace (`#dokumenty`), ochrana-osobnich-udaju, 404.
- **Figure numbering:** `src/lib/figures.ts`; per page from 01 (home: hero 01, places from 02; O nás: hero 01, places, then people). Numbers appear only in `figcaption`, list items or table rows (QA test 10).
- **Registration:** `qa/templates.ts` (G, port 4418), new QA test 10 in `qa/pages.spec.ts` (figure numbers two digits, inside captions or lists, 01 upwards without gaps; no empty `[data-figure]` frame; no figures, numbers or high strip on `/oznameni/…`), tool tests, `client:new` usage, site-build skill, design-differentiation §3d + §5 column, content-contract, template-contract, editable-fields.
- **Fixes found while checking screenshots and QA:** the layout's scoped `main { display: block }` overrode the home grid (removed); a doubled rule over the O nás body; the Kontakt transport block drew a second 3 px rule (`NonstopRuleBlock rule={false}`); Právní informace blocks sat outside the frame (now label/content splits); block placeholder labels ran into names (`div[data-placeholder] > label` now takes its own line); at 375 the closed menu hid the only `<nav>` (the `<nav>` now wraps the panel, as in E); on Ceník at 375 the VAT note, demo notice and print hint pushed the number out of the first screen (`PageOpening numberFirst`: on phones the nonstop block comes straight under the H1).

### 11.2 Verification

| Step | Result |
| --- | --- |
| `npm test` | 17 files, 340 tests passed (places schema, gate G-080, CMS "Naše místa", client:new places; 7 of them from the collections fix below) |
| `npm run lint` | clean |
| `npm run typecheck` (tsc + harness check) | 0 errors |
| `npm run check -w templates/lide-a-misto` | 0 errors, 0 warnings, 0 hints |
| `npm run build -w templates/lide-a-misto` | 17 pages (fixture, prototype) |
| `build:production` (fixture) | fails, with the same rule set as E: G-011, G-012, G-020, G-021, G-031, G-032 (16: E has 15; the four placeholder place photos replace E's three landscapes), G-040, plus G-071, G-073, G-074 |
| `npm run qa -- --workers=4 --timeout=240000` (A, B, C, D, E, G + structure) | **1868 passed**, 0 failed, axe serious/critical 0. The first run had 16 G failures (the two 375 issues above), fixed and re-run. D `plny-prehled` still on this branch passes too. |
| Budgets (fixture) | HTML + CSS ≤ 10.3 KB gzip per page (limit 100); JS: one inline menu script, 1.0 KB; fonts: one family, two woff2 files (34.9 + 32.6 KB), both preloaded |

**Lighthouse 13.6, mobile (default emulation), Playwright's Chromium 1248, fixture build in prototype mode** (`astro preview`; load average about 100 from other sessions during the run):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 96 | 69 | 1.4 s | 0 | 0 ms | 96 KiB |
| `/jak-postupovat/` | 100 | 100 | 96 | 66 | 0.8 s | 0 | 0 ms | 80 KiB |
| `/cenik/` | 100 | 100 | 96 | 66 | 0.8 s | 0 | 0 ms | 79 KiB |
| `/oznameni/` | 100 | 100 | 96 | 69 | 0.8 s | 0 | 0 ms | 80 KiB |

Best practices 96: the fixture has no favicon (console 404). SEO 66–69: `is-crawlable` only (prototype `noindex`). Both by design, as for C–E. The home LCP is the hero figure; with a real photo the 1280 AVIF must stay ≤ 200 KB (widths 375–1400, `fetchpriority="high"`).

### 11.3 Trial client `clients/hnatek-g`

As §9.1. `client:validate`: PROTOTYPE PASS (errors 0); production blocked by G-012, G-020, G-021, G-031, G-032 (the home placeholder), G-040, i.e. Hnátek's own open items plus the placeholder. `client:build`: 10 pages. `client:export -- hnatek-g --out ~/Documents/hnatek-g-web`: **RESULT: PASS (10/10 steps)**.

The first export ended 9/10: `astro check` failed in `load.ts` because hnatek-g has no notices / people / FAQ / documents folders, so Astro generated no collection keys for them. This is the known core bug fixed by commit `a50e789` ("define every content collection even without its folder", branch `claude/awesome-solomon-8d8424`, also planned for D). Its diff (`core/content/collections.ts`, new `core/tests/collections.test.ts`) is **applied to this worktree uncommitted**. Merge it once with whichever branch lands first.

### 11.4 Greyscale and scorecard (§7)

Greyscale home, Ceník and O nás at 375 and 1280 beside A–E: G reads as its own template at both widths (the people photo beside the H1 at 1280, the photo essay grid, bold black headings, 3 px rules over every block). The closest pair is G / E: both have a wordmark with a wrapping two-row text nav and a "Menu" button, and a label column on Ceník.

| Dimension | G / A | G / B | G / C | G / D | G / E |
| --- | --- | --- | --- | --- | --- |
| Composition | 2 (both put a photo beside the H1; G then the places essay) | 2 | 3 | 3 | 2 (label column + long pages in both) |
| Navigation | 3 | 3 | 3 | 3 | 2 (same bar silhouette; CTA differs: green block vs stamp line) |
| Typography | 3 | 2 (both sans) | 2 (both grotesques) | 3 | 3 |
| Image usage | 3 | 3 | 3 | 3 | 2 (both captioned photos; numbered figures vs full-bleed bands) |
| Content hierarchy | 2 | 2 | 2 | 3 | 2 |
| **Total** | **13** | **12** | **13** | **15** | **11** |

All pairs pass (≥ 11, no dimension below 2). G / E passes at the limit; the main lever, if the owner wants more distance, is the header (for example the nonstop number in the bar at 1280).

### 11.5 Contrast

Unchanged from §9.2 (README tokens, rechecked against `global.css`): ink 16.86, muted 9.81, muted-2 7.88, green 8.87 on the ground; white on green 9.52 (strip, picked row, inset focus ring); ink on white 18.10 (print).

### 11.6 Not built, and why

- **Archivo width axis** (condensed captions and numerals): dropped for the weight budget (§10 point 8); numerals are bold and tabular instead.
- **O nás "Smuteční síň" column** (board): core has no field saying which place is the hall. The closing columns are Kancelář and Pro účastníky; a "Lidé" column was left out because `#lide` is on the same page.
- **Lidé as a page:** the `#lide` section of O nás with a nav item (approved §4.1).
- **Places address as a tracked fact:** free text by decision (§10 point 2); the tracked office address stays in `contact.json`.

### 11.7 Open questions

- ⚖ L1: neutral chrome on notice pages, as for C–E (no figures, no green, no strip; the publisher sentence carries the number).
- Photo rights for places: the existing `approvals.json` image entries cover the two Hnátek photos; any new place photo needs its own `rightsEvidence` (L-008) before launch.
- The home people photo (`home.people`) for Hnátek does not exist yet; hnatek-g shows the neutral placeholder.
