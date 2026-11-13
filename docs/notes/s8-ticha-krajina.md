# S8 · Template E `ticha-krajina` (Tichá krajina): plan and build results

**Status:** built (2026-11-13). The plan below was approved as proposed (every **[review]** item); the build results are in §11. Nothing is committed. Built from Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md), with the approved round-2 design G in [docs/designs/ticha-krajina/](../designs/ticha-krajina/README.md) as the design input (comps per palette `mlha` and `len`, `html/*.html` for exact values, `tokens.json` / `TOKENS.md`). Templates C `nocni-linka` and D `plny-prehled` exist on this branch and are treated as peers: no imports, no shared component names, and every pairwise check and the §7 scorecard cover E against A, B, C **and** D.

Decisions that need the owner's yes are marked **[review]**. Everything else follows the comps, the contract, an approved answer from S6/S7, or an existing pattern. **This template needs one core addition (§2, the landscape photo set). It is proposed here and nothing is edited until it is approved.**

## 1. Concept (from the comps)

For a firm in a rural region that wants the site to feel like air and distance, not like a shop. Every page is one long, slow read on a 12-column grid: short text passages (heading in columns 1–4, text in 6–11) alternate with **full-bleed photographs of the local landscape**, commissioned, without people, and never in the first screen. The nonstop number is set as one long ruled line, the **stamp line**, after the opening of each page and again at the top of the footer, so it is found at both ends of the read.

Structural ideas that make it E, not A, B, C or D:

- **The stamp line is the emergency pattern.** One `tel:` link between two 1 px ink rules: Figtree label · Spectral 600 number in the accent colour, underlined (42 / 33 px) · "ve dne, v noci i o svátcích". Twice per page: after the opening (inside the first viewport at 375 × 667, at about 380 px) and as the first thing in the footer. No header button, no bar, no rail, no box.
- **Landscape bands as the separation device.** Full-bleed figures (1280 × 440 on desktop, 375 × 240 on phones) with a Figtree caption naming the place. Without photos each band collapses to 96 px of space and the page still reads complete; the first band is always below the first screen, so the LCP element is text.
- **A plain top bar.** Wordmark on the left, text navigation in Figtree 18 px on the right (desktop); "Menu" opens an in-flow list of large light Spectral words separated by space only, closed by a stamp line (phones). No sticky header.
- **Light serif display.** Spectral 400 for H1 (72 / 38 px) and H2 (44 / 30 px): light, never bold. Figtree 500 only for labels, navigation and captions (≥ 18 px).
- **No boxes anywhere.** No cards, tinted panels, borders around sections, icons or centred layouts. The only lines are the stamp rules and table hairlines.
- **Notice pages lose the bands, the stamp line and most of the navigation**: a muted sentence "Oznámení zveřejňuje <brand>. Telefon nonstop <number>" under the header, reduced nav (Oznámení a obřady · Kontakt · Úvodní stránka).

## 2. Core addition: the landscape photo set **[review]**

The bands are the template's main idea, and no core field can hold a client's set of landscape photos (page `heroImage` / `secondaryImage` give at most two images per page, and the home page alone needs several). The design proposes `landscapeImages[]` with `{ image, caption, place }`. The minimal addition, leaving A–D unchanged in behaviour:

### 2.1 Where it lives and its schema

- **An optional site singleton `src/content/site/landscapes.json`**, registered in `OPTIONAL_SINGLETON_SCHEMAS` next to `legal`. A singleton, not a collection: one ordered list is what the CMS needs (the client reorders photos by dragging), it needs no ids, slugs or Markdown, and it avoids the "missing optional collection folder" class of `astro check` failures from S6.
- Schema (`core/content/schemas.ts`):

  ```ts
  export const LandscapeImage = z.object({
    image: ImageRef,          // existing image metadata: file, alt / decorative, caption, credit,
                              // source, depicts, rightsConfirmed, focus
    place: text(120),         // "Drahanská vrchovina nad Vyškovem" – shown under the band
  }).superRefine(/* source "licensed-stock" rejected, see below */);
  export const LandscapeSet = z.object({
    images: z.array(LandscapeImage).max(12).default([]),
  });
  ```

  The design's `caption` maps onto the existing `ImageRef.caption`, so nothing is duplicated. The line under a band reads `place`, then `image.caption` when filled, then "Foto: <credit>" when filled (Figtree 500, 18 px, muted).
- **Stock photos rejected [review]:** a landscape with `source: "licensed-stock"` fails schema validation (G-001): *"Krajiny musí být vlastní nebo zakázkové fotografie z vašeho okolí, ne z fotobanky."* The guardrail says "only commissioned local landscapes", and stock landscapes are exactly the drift it warns about. `placeholder` stays allowed (fixture, prototypes) and is caught by G-032 as today. Alternative: allow stock and rely on the CMS help text only.

### 2.2 Feature switch and `supports` flag

- `landscapes` joins `CONTENT_FEATURES` in `core/content/config.ts`: `features.landscapes` (default `false`, agent-only in `site.config.ts`) and `supports.landscapes` on `TemplateManifest`. A–D get `landscapes: false` (one line in each manifest; nothing else in A–D changes). The existing G-005 loop already rejects the feature on a template that does not support it, with no new code.
- Reusing the content-feature mechanism means the rest follows existing rules: the CMS shows the file only while the feature is on, `client:new` copies the fixture's file only for a supporting template, and the images count for the gate only while the feature is on (like notice and people photos).

### 2.3 Image slot

`imageSlots["landscape.band"] = { aspect: "32:11", required: false }` (the desktop band, 1280 × 440). Phones crop the same file to 25:16 (375 × 240) around `ImageRef.focus`. The site-build skill and the CMS help ask for originals at least 2560 px wide, landscape format (3:2 or wider), so both crops hold. Rendered through `astro:assets` `<Picture>` (AVIF + WebP, widths 640–2560, `sizes="100vw"`, `loading="lazy"`, `decoding="async"`, width and height set).

### 2.4 Image rights, gate and launch check

- `collectPublishedImages()` and `collectReferencedMediaFiles()` in `core/gate/rules.ts` include `landscapes.json` images **while `features.landscapes` is on**. That alone applies every existing image rule: **G-003** (file exists), **G-032** (no placeholder in production), **G-033** (rights confirmed), the `ImageRef` refinements (alt or decorative, placeholder source ⇔ placeholder subject, `actual-business` only from the client's own photos), and the launch check's per-image `approvals.images[<file>].rightsEvidence`. With the feature off the file is ignored and its media are not emitted.
- **New rule G-077 "Landscape set present while the feature is on"** (error in prototype and production): `features.landscapes` is on but `site/landscapes.json` is missing. The CMS cannot create files (S2 finding B8), so without the file the client could never add photos. **[review]** Alternative: a warning only, since an empty set is a valid state (bands become space).
- No fact-ledger keys (photos are not facts). The launch check needs no code change: it already walks `collectPublishedImages()`.

### 2.5 CMS (`tools/cms/pages-config.ts`)

A file entry **"Krajiny"** (`src/content/site/landscapes.json`), in the "Firma a kontakt" group, shown while `features.landscapes` is on and the template supports it. Fields: a collapsible list `images` (0–12 items, summary `{place}`), each item `image` (the existing inline `imageRef`, visible) and `place` ("Místo", required, max 120).

**How the guardrail reaches the client.** Pages CMS shows field `description`s under the field, so the rules are written there, in plain Czech:

- list `images`: *"Fotografie krajiny nebo budov z vašeho okolí, vlastní nebo zakázkové. Na fotografii nesmí být lidé, západ slunce, mraky ani květiny. Nepoužívejte fotobanky ani obrázky vytvořené počítačem. Na web se nikdy nedávají na začátek stránky. Bez fotografií zůstane mezi oddíly volné místo."*
- `place`: *"Kde fotografie vznikla. Příklad: Drahanská vrchovina nad Vyškovem."*
- `image.file` keeps the shared text and adds the size: *"Na šířku, alespoň 2560 px."*

The schema enforces what it can (no stock, rights, placeholders); people, sunsets, clouds and flowers cannot be detected, so they stay a written rule plus the owner's review before launch (the site-build skill and the launch-check sign-off list say so). Alternative **[review]**: a required per-photo checkbox "Fotografie odpovídá pravidlům (bez lidí, západu slunce, mraků a květin)", checked by the production gate like G-033. I propose the description only: a checkbox the client ticks without reading adds friction, not safety.

If the uncommitted Decap switch in the main checkout lands first, the same entry moves to the Decap generator with the same fields and texts.

### 2.6 Loader, fixture, client tools

- `core/content/load.ts`: `getLandscapes(): Promise<LandscapeView[]>` (empty unless the feature is on): resolved image metadata, alt (or `""` when decorative), focus, the caption line parts and the placeholder flag (for `<PlaceholderMark>`); `virtual:site-core/data` exports `landscapes` like `legal` (the integration already loops over `OPTIONAL_SINGLETON_NAMES`); `core/content/snapshot.ts` validates it like `legal`.
- **Fixture:** `fixtures/neutral/src/content/site/landscapes.json` with three entries pointing at a new neutral placeholder `placeholder-32x11.png` (2560 × 880, same flat style as the existing four: grey ground, dashed border, "Zástupný obrázek · poměr 32:11 · krajina bez lidí"), `source` and `depicts` `placeholder`, places "Zástupné místo 1–3". Generated by a small script with `sharp` (already a dependency through Astro), never a photograph and never generated imagery. The fixture's own `site.config.ts` keeps `landscapes` off (the harness has nothing to render, and A–D builds and the export production fixture stay byte-identical); E's `fixture.site.config.ts` switches it on.
- `tools/client/new.ts`: `"site/landscapes.json": "landscapes"` in `OPTIONAL_CONTENT` (copied only for a supporting template; the feature starts off like every optional type).

### 2.7 Tests and docs

- **Tests** (`core/tests/`): `LandscapeSet` parses an empty and a full set, rejects stock sources and an invalid `ImageRef`; G-005 rejects `features.landscapes` on a template without support; G-077 fires with the feature on and no file, not otherwise; G-003 / G-032 / G-033 report landscape images only while the feature is on; `collectReferencedMediaFiles` includes them only then; the launch check asks for rights evidence of a published landscape. `tools/cms/tests`: the "Krajiny" entry appears only with feature and support, with every declared key and the descriptions; `tools/client/tests`: `landscapes.json` copied for E only. A–D manifests still validate.
- **Docs:** `docs/content-contract.md` (new §6.18 "Krajiny", G-077 row, G-003/G-032/G-033 scope), `docs/template-contract.md` §3 (`supports.landscapes`, `landscape.band`), `docs/editable-fields.md` (the Krajiny entry and its help texts), `.claude/skills/site-build/SKILL.md` (when to switch it on, the photo brief for the client, the guardrail), `fixtures/neutral/README.md` (the new file and placeholder).

## 3. Intended manifest

```ts
{
  id: "ticha-krajina",
  name: "Tichá krajina",
  version: "0.1.0",
  coreVersion: "^0.1.0",
  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: false,     // "one long page with anchors, no detail pages" (Služby comp note)
    mapEmbed: false,               // map is always a link
    notices: true,                 // /oznameni/ calm list + /oznameni/<slug>/
    people: true,                  // "Kdo vás přijme" on /kontakt/#lide and on home
    faq: true,                     // /jak-postupovat/#caste-otazky
    documents: true,               // footer "Dokumenty" column + /pravni-informace/#dokumenty
    guestInfo: true,               // /pro-ucastniky/ (drawn)
    prePlanning: true,             // /pohreb-predem/, built from Pro účastníky
    priceInclusions: true,         // "V ceně je zahrnuto" / "Není zahrnuto" on /cenik/
    landscapes: true,              // §2
  },
  homepageSections: {
    available: ["hero", "next-steps", "services", "family-story", "people",
                "contact-summary", "catalogue-links", "notices"],
    default:   ["hero", "next-steps", "services", "family-story", "people", "contact-summary"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },
  options: {
    palette:           { values: ["mlha", "len"], default: "mlha" },
    fontPair:          { values: ["spectral-figtree", "gelasio-figtree"], default: "spectral-figtree" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },
  imageSlots: {
    "company.logo":     { aspect: "none", required: false },  // dark logo on the light ground; wordmark while null
    "landscape.band":   { aspect: "32:11", required: false }, // §2.3; phones crop to 25:16
    "contact.building": { aspect: "32:11", required: false, page: "kontakt", field: "secondaryImage" },
    "person.photo":     { aspect: "3:4", required: false },   // "3:4 se souhlasem"
    "coffin.item":      { aspect: "4:3", required: false },
    "flower.item":      { aspect: "1:1", required: false },
    "notice.photo":     { aspect: "3:4", required: false },   // family photo (list: small portrait beside the name)
    "notice.parte":     { aspect: "none", required: false },
  },
  pageFields: {
    home:  ["title", "navLabel", "metaTitle", "metaDescription", "lead"],   // no image: nothing above the fold
    "jak-postupovat", sluzby, rakve, kvetiny, cenik, oznameni, "pro-ucastniky",
    "pohreb-predem", "pravni-informace", "ochrana-osobnich-udaju":
           ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    kontakt: ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body", "secondaryImage"],
    "o-nas": ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "body"],
  },
}
```

### 3.1 Notes on the manifest

- **Default homepage order** hero → next-steps → services → family-story → people → contact-summary follows the comp (opening, stamp line, "Když někdo zemřel" with the place picker, first band, "Pohřeb s obřadem i bez obřadu") and continues the long read with the family, the people and the office. Counted on `data-section` only (bands and stamp lines ignored), it differs from A in 4 positions, B in 3, C in 4 and D in 6. **Honest caveat:** for a client with people off, `defaultSectionsFor` drops `people`, and the order then differs from B's default in only 2 positions; QA runs on the fixture (people on), and E's structure (stamp line, bands, grid) differs regardless. I note it rather than reorder against the comp.
- **`notices` section** (available, not default): a link with the count only, as approved for D ("Oznámení a obřady · 3 nadcházející"), never names on home (L1), and never next to a band (no landscape directly before or after it).
- **No `heroVariant`.** The hero is text only by guardrail (no photo in the first viewport), so there is nothing to vary; approved for D. `home` therefore has no image field.
- **Kontakt building photo** uses the existing page field `secondaryImage` (slot `contact.building`), so it needs no core change. It is the "optional band of the building" drawn on the Kontakt comp.
- **No `about.story` slot.** O nás is text passages with bands from the landscape set; a photo of people is outside the guardrail, and a building photo belongs to Kontakt.
- **`emergencyEmphasis: "high"`**: the first stamp line **moves** directly under the header, before the H1, on every page (the footer stamp stays). The comp says "also"; a third copy of the same number on every page would be a duplicate CTA (the reasoning approved for D). **[review]** if you want it repeated rather than moved.
- **Palettes** are exactly `tokens.json` (`mlha` default, `len`), switched by `html[data-palette]` custom properties. **Font pairs:** Spectral 400/600 + Figtree 500 (default) or Gelasio 400/600 + Figtree 500: two families, three weights, OFL, `@fontsource/spectral`, `@fontsource/gelasio`, `@fontsource/figtree` 5.3.0 (checked on npm; new dependencies, the lockfile changes). Faces declared with `unicode-range` for latin and latin-ext (S3 lesson); preload Spectral 400 latin and latin-ext (the H1, the LCP element, has "ř" in most Czech titles). Every weight checked against "Příliš žluťoučký kůň úpěl ďábelské ódy".

## 4. Pages and composition

Exact values from `html/*.html`: body Spectral 20 / 1.65; lead 22; H1 72 / 38 px (1280 / 375) at line-height 1.06; H2 44 / 30; small text and labels Figtree 500 at **18 px minimum** (the comp's 16 px band caption and 17 px Menu label are built at 18, as the design's self-check asks); spacing 12 · 24 · 48 · 96 · 144; grid 12 columns, 24 px gap, 64 px side margin at 1280, 16 px gutter at 375; radius 0; links ink, underlined with a 4–5 px offset. One-letter words carry `&nbsp;`, phone numbers `white-space: nowrap`. Below 48 rem every passage is one column (heading, then text).

| Route | Composition | Drawn? |
| --- | --- | --- |
| `/` | **hero** (H1 = page title in cols 1–7, lead in cols 9–12, bottom-aligned) → **stamp line** → sections in config order as grid passages: **next-steps** ("Když někdo zemřel": first-hours text + the place picker as a sentence of words, each a ≥ 44 px target, linking to `/jak-postupovat/#situace-…`) · **services** (featured services as short passages with "Co je v ceně a kolik to stojí" → `/sluzby/#<id>`) · **family-story** (o-nas `excerpt`, link) · **people** (names in light 36 px, role, direct line) · **contact-summary** ("Kancelář": address, map link, office phone, office hours under their own heading, `data-office-hours`) · **catalogue-links** (inline words "Rakve · Květiny") · **notices** (link + count). **Bands** after the 1st, 3rd, 5th … section following the hero, never after the last one. | 1280, 375 |
| `/jak-postupovat/` | H1, lead; stamp line; picker sentence "Kde blízký člověk zemřel? doma · v nemocnici · v domově pro seniory · v zahraničí" (`:has(:target)` + `[data-guide]`, core `guidance-flow.ts`, no JS); picked word: no underline, 3 px accent bar under it, "(vybráno)"; "5 kroků pro úmrtí doma. Zobrazit vše" (one precomputed sentence per situation). **Narrative:** phases as small Figtree labels, steps as Spectral 600 headings with a muted "when it applies" line, text, native checkboxes, long text in `<details>`; steps with an emergency `contactPrompt` carry the nonstop link inline. Then **Časté otázky** (`#caste-otazky`): passages per topic, each question a `<details>`. **No bands** (a task page, like Ceník). | 375 ×2 |
| `/sluzby/` | H1 + lead (grid); stamp line; **one passage per service** (`id=<service id>`, H2 cols 1–4, summary + body cols 6–11, "Co je v ceně" → `/cenik/#<group>`); featured first, the rest in one "Další služby" passage of inline links to their anchors; a band after every second passage. No detail pages. | 1280 |
| `/cenik/` | H1 "Ceník" + `<VatNote>` in bold and the print hint (cols 6–11); `<DemoPricingNotice>` as a muted line with UKÁZKA; per group with inclusion lists: group title as a small Figtree label, **the first item's price as the 44 px H2** (label + `<PriceValue>`, as approved for C), "V ceně je zahrnuto" cols 6–8, "Není zahrnuto" cols 9–11, 96 px between groups; "Jednotlivé položky": H2 cols 1–4, hairline table cols 6–11 (label, price right, `nowrap`), groups without lists go here; `<VatNote>` again under the table; **no bands**; the stamp line closes the page (the footer one follows, so the page shows the footer stamp only, see §7). | 1280 |
| `/cenik/` print | `print.css`: letterhead (name, address, office and nonstop phones), H1, VAT note, groups as label + price left and the two lists right at reduced size, items table, legal identification + source URL; no photos, no accent. | A4 |
| `/kontakt/` | H1 + one sentence (lead); stamp line; passages **Kancelář** (address, map link), **Úřední hodiny** (hairline table, holiday note, `data-office-hours`), **Telefony** (office, flowers, e-mail), **Převoz zesnulých** (`data-emergency-block`: service area, availability, the nonstop link in ink); the **building band** (`secondaryImage`) when set; **Kdo vás přijme** (`#lide`) when people are on. | 375 |
| people | With photos: one person per row, 3:4 portrait in cols 1–2, name in light 36 px Spectral in cols 4–11, muted role, "Přímá linka …". Without any photo: names two per row in the text column, no initials, no empty frames. Mixed: rows; a person without a photo gets no frame. | 1280 ×2 |
| `/oznameni/` | **Neutral chrome** (§5). H1 + muted consent sentence; "Nadcházející rozloučení" as a small muted label; each notice is a sentence, not a card: name as a 34 px link, dates, the ceremony sentence ("Rozloučení se koná v pátek 14. 11. 2026 v 10:00 ve smuteční síni ve Vyškově." / "Pohřeb bez obřadu."), the optional 3:4 family photo beside it; "Nedávná oznámení": name + "zemřel … · rozloučení proběhlo …". Empty state: one sentence. No bands, no stamp line. | 1280, 375 |
| `/oznameni/<slug>/` | **Neutral chrome.** "Všechna oznámení" link; the family photo (uncropped at its natural aspect, full width at 375, max-height 60 vh; never cropped around a face); H1 name 42 px light; dates; the ceremony sentence 22 px; type; map link; "Sledovat přenos obřadu" link + note (L14); parte image or PDF link; **Od rodiny**; **Kondolence** (instruction with the e-mail); QR (`<NoticeQrCode>`) with the print hint. Nothing promotional. | 375 |
| `/pro-ucastniky/`, `/pohreb-predem/` | H1, lead; stamp line; the Markdown body split at each `##` into grid passages; **one band after the middle passage** when there are at least three. | pro-ucastniky 375 |
| `/o-nas/` | Built from Služby / Pro účastníky: H1, lead, stamp line, body as passages, one band after the middle passage. No photo of people. | from Služby |
| `/rakve/`, `/kvetiny/` | Built from Lidé: one item per row (4:3 / 1:1 image in cols 1–2, name in light 36 px in cols 4–11, muted code / material / type, summary); without images, names two per row; zero items: one sentence + office phone; Květiny ends with the flowers phone passage. No bands (the items are the images). | from Lidé |
| `/pravni-informace/` | Built from Kontakt: passages **Mimosoudní řešení sporů** (ADR + link), **Reklamace**, **Dokumenty** (`#dokumenty`: title link, "PDF", valid from), body. No bands. | from Kontakt |
| `/ochrana-osobnich-udaju/` | H1, body as passages. No bands. | from Pro účastníky |
| `/404.html` | Muted "Chyba 404", H1 "Tuto stránku jsme nenašli.", one sentence with two inline links (úvodní stránka, jak postupovat), stamp line. | 375 |

**Band rule (template-side, `src/lib/bands.ts`).** A page takes photos from the set in list order, starting at a fixed position per page (home starts with the first photo, so the client chooses the home photo by ordering the list); a page never shows the same photo twice; when the set runs out, the remaining bands are 96 px of space. Bands sit only between passages (never after the stamp line, never before the footer) and never in the first viewport: the first band follows at least one full passage after the stamp line (in the comps it starts at about 735 px at 375 and below 800 px at 1280), and a QA check measures it (§8).

**Navigation.** Core fixes the nav order and takes labels from `navLabel` (approved for C and D), so the comp's "Pohřeb bez obřadu" (a service) and "O nás a lidé" cannot be nav items. One `<nav>`: `site.nav` without "home" (the wordmark links home), plus Pro účastníky, Pohřeb předem, Lidé (`/kontakt/#lide`), Časté otázky (`/jak-postupovat/#caste-otazky`) and Dokumenty (`/pravni-informace/#dokumenty`) when on, before Kontakt. ≥ 64 rem: a plain text row in Figtree 18 px beside the wordmark, wrapping to a second left-aligned line when the list is long (the fixture, with every type on, has 13 items, so two lines at 1280). < 64 rem: the "Menu" button (`aria-expanded`, "Menu" ↔ "Zavřít", Escape closes) opens the list in the flow as large light Spectral words separated by space only, closed by a stamp line. Without JS the list is shown in flow and the button is hidden. Current page: `aria-current`, no underline plus the 3 px accent bar (the same mark as the picked word).

**Footer (every page).** The second stamp line, then three columns: **Kancelář** (address, office hours under their own heading with `data-office-hours`, office phone), **Dokumenty** (PDF links, when on), **Právní informace** (Právní informace a spory, Ochrana osobních údajů); then the legal row: legal name, sídlo, IČO, register entry, "Spory: Česká obchodní inspekce, adr.coi.cz". The footer stamp sits in a `data-emergency-block` with a visually hidden heading "Nonstop převoz zesnulých", so emergency and office hours are separate, separately headed blocks. **Neutral footer** (notice pages): no stamp line, no Dokumenty column; Kancelář (hours, office phone), Právní informace and the legal row stay (invariant 3, L8, L10).

## 5. Emergency CTA forms

| Form | Where | Build |
| --- | --- | --- |
| Default | after the opening of every page except notices; at the top of the footer | `<EmergencyPhoneLink variant="custom">` as one block link: label, number and note as `inline-block` spans with explicit `{" "}` between them (never flex: S6 lesson, QA test 9); 1 px ink rules top and bottom; desktop: label · number · note on one baseline (grid with `justify-content: space-between`, not flex inside the link text), phones: three lines; ≥ 44 px tall |
| High emphasis | directly under the header, before the H1 (instead of after the opening) | same component |
| Neutral | notice pages | muted Figtree sentence "Oznámení zveřejňuje <brand>." + an ink link "Telefon nonstop +420 …"; no rules, no accent, no "převoz" in the visible text. ⚖ L1 |

The number never wraps: 42 px Spectral 600 for "+420 000 000 199" is about 330 px, and 33 px at 375 fits 343 px; I will measure both font pairs at 320, 375 and 1280 px and use `min(…)` sizing where needed, as C did.

## 6. Component inventory (all new names; none matches a file in A, B, C or D)

| Area | Components |
| --- | --- |
| Layout | `layouts/QuietLayout.astro` (options → `data-palette`, `data-font`, `data-emphasis` on `<html>`, SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`, `neutral` prop) |
| Chrome | `QuietTopBar` (wordmark / logo, Menu toggle), `QuietNav` (full / reduced), `StampLine` (default, footer), `NoticePublisherLine` (neutral form), `QuietFooter` (full / neutral) |
| Grid and bands | `GridPassage` (12-column passage: heading cols 1–4, body 6–11, optional `data-section`), `LandscapeBand` (figure + `<Picture>` + caption line; renders 96 px of space without a photo), `ProsePassages` (Markdown body split at `##`, optional middle band) |
| Home | `OpeningText` (hero), `PickerSentence` (place picker; home and guide), `ServicesPassage`, `FamilyPassage`, `PeoplePassage`, `OfficePassage` (contact-summary), `CatalogueWords`, `NoticesCountLine` |
| Guidance + FAQ | `GuideNarrative`, `StepPassage`, `QuestionsPassage` |
| Pricing | `PriceGroupPassage` (label + from-price H2, two lists), `HairlineItems` (items table) + `styles/print.css` |
| Notices | `NoticeSentences` (list), `NoticeDetailText`, `NoticeQrPassage` |
| Contact, people, catalogue, legal | `OfficeHoursHairlines` (`data-office-hours`), `ContactPassages`, `TransportPassage` (`data-emergency-block`), `PeoplePortraitRows`, `CatalogueQuietRows`, `AdrPassage`, `DocumentLines` |

Plus `src/i18n/cs.ts` (UI strings only, plain Czech, `&nbsp;` after one-letter words), `src/lib/options.ts`, `src/lib/bands.ts`, `src/styles/global.css`, `fonts.css`, `print.css`. Plain CSS, no Tailwind (as C and D). Core safety components styled only through `class` + global CSS or their `data-*` hooks. One inline script for the Menu toggle (target ≤ 1 KB). Wiring copied from B for scripts only (`package.json` "@site/template-ticha-krajina", `astro.config.mjs`, `content.config.ts`, `env.d.ts`, `fixture.site.config.ts` with every optional type and `landscapes` on).

## 7. Differentiation row (design-differentiation §5)

| Dimension | A Rodinná tradice | B Důstojná jednoduchost | C Noční linka | D Plný přehled | **E Tichá krajina** |
| --- | --- | --- | --- | --- | --- |
| Header | centred letterhead | left logo, right nav, sticky | sticky side rail | name + nonstop box + Kancelář box + nav row | **plain, non-sticky top bar: wordmark + text nav in Figtree 18** |
| Emergency CTA | dark utility strip | header button + bottom bar | the rail itself | highlighted header box | **ruled stamp line after the opening and at the top of the footer; muted sentence on notices** |
| Mobile navigation | in-flow full-height list | dropdown under sticky header | in-flow ruled list under the panel | "Rejstřík" rows with counts | **"Menu": large light serif words, space only, stamp line under the list** |
| Homepage order | hero → story → services → steps → visit | hero → steps → services → contact → story | hero → [notices] → services → steps → story → office | steps → prices → services → catalogues → people → notices → documents → FAQ | **hero → stamp → steps → band → services → story → band → people → office** |
| Hero | editorial, image or panel | practical, CTA tier | one statement, one screen | none | **text only on the 12-col grid: 72 px light H1 cols 1–7, lead cols 9–12** |
| Services IA | one long page | index + detail | statement index + detail | index table + reference sheets | **one long page of passages with anchors, broken by bands** |
| Guidance | article + margin TOC | phased checklist | one step per statement | situation × step matrix | **picker as a sentence of words; narrative timeline** |
| Catalogues | figure gallery | uniform grid | ruled rows | tables with thumbnails | **one item per row, light 36 px names, image in cols 1–2** |
| Pricing | `dl` + dot leaders | `table` per group | statement per group | package pair + "Typ ceny" table | **from-price as the H2 in cols 1–4, included / excluded lists, hairline table** |
| Notices | – | – | large-type agenda | timetable | **calm sentences, optional 3:4 family photo beside the name** |
| About | long-form, drop cap | fact sheet first | statements, one photo | reference sheet | **passages with one landscape band** |
| Footer | rich letter | compact two rows | four columns on the rail colour | 3 px rule, four ruled columns | **opens with the second stamp line; three columns; legal row** |
| Typography | serif display + humanist sans | neutral grotesque | one grotesque, 76 px H1 | sans + mono | **light screen serif (Spectral 400) for all headings and body; Figtree only for labels** |
| Colour | warm paper, umber | cool slate, forest | dark, amber | white / grey, one highlight | **mist + spruce-blue, or linen + olive-brown** |
| Image use | larger, fewer, captioned | minimal, uniform | none on home | thumbnails only | **full-bleed commissioned landscapes between sections, never in the first screen** |
| Separation | hairlines, small caps | 1 px lines, tinted bands | darkness and space | column and table rules | **photographs and space; two 1 px rules around the stamp line** |

**Closest pair: E / A** (both serif-led, light grounds, captioned photographs, services on one long page with anchors). The structure still differs: A's centred letterhead, utility strip, asymmetric editorial hero with an image, dot leaders and drop cap against E's plain top bar, stamp line, text-only grid hero, full-bleed bands and price-as-heading. I expect typography and image use at 2 for this pair and will check it on greyscale screenshots before claiming more. The QA route-set check passes E/A through the optional types (A supports none); if it ever compared equal sets, the `/sluzby/` outline rule from S7 applies.

## 8. Law (research §4a) and things I will not build

- **L1, notices:** neutral chrome (muted publisher sentence, reduced nav, neutral footer), no bands, no stamp line, no `PriceValue`, no service links, no "Objednat", no homepage sections. The home `notices` section is a link with a count, never names, never beside a band. ⚖ The neutral sentence, the reduced nav and the home link need the lawyer; as for C and D, core's fixed accessible name of the nonstop link still says "převoz" and does not contain the visible "Telefon nonstop …" (WCAG 2.5.3).
- **L8** legal identification in every footer, neutral included; **L9** `<VatNote>` under the Ceník title and under the items table, and on the A4 sheet (home shows no prices; service passages link to Ceník without prices); **L10** ADR + Právní informace in every footer; **L11** no cookies, no third-party requests, fonts self-hosted; **L12** family photos only with the notice's consent record (core G-070), people photos with recorded consent (G-074); **L14** livestream as a plain link. No newsletter or e-mail capture.
- **Print links** ("Vytisknout ceník", "Vytisknout oznámení") become the Ctrl/Cmd + P instruction, as approved for C and D.
- **Ceník stamp line.** The comp closes Ceník with a stamp line; the footer opens with one, so the page would show two in a row. I render the opening stamp line (after the H1 passage, for the first screen) and let the footer's stamp close the page. Same for every page: one stamp after the opening, one in the footer.
- **Not built:** a separate Lidé page (`/lide/` is not a core route; people on `/kontakt/#lide`, approved), nav items "Pohřeb bez obřadu" and "O nás a lidé" (core nav), any band, caption or photo on notice pages, text on photos.

## 9. Registration and verification plan

- `qa/templates.ts`: `ticha-krajina` (letter E, port 4415). Every pairwise check already runs over `templatePairs()`, so E is compared with A, B, C and D (ten pairs). New checks for E's idea, run on every template that renders bands: **no `[data-band]` image intersects the first viewport** at 375 × 667 and 1280 × 800; **no band or stamp line on notice pages**; bands without photos are space (no `<img>`, no empty frame). **The order check needs a small shared change:** it lists every child of `main`, falling back to the tag name, so E's bands and stamp line (`figure`, `div`) would count as positions and pass the check by decoration. I will mark them `data-interlude` and have the check skip such children; A–D render no such element, so their results are unchanged, and E's counts are then the honest ones from §3.1.
- `tools/client/new.ts` usage text; `tools/client/tests` and `tools/cms/tests` template lists (+ the Krajiny entry); `.claude/skills/site-build/SKILL.md` (when to choose E: rural firms with a real landscape and the budget for a short commissioned shoot; image slots; the photo brief and guardrail; palette choice by logo); `docs/design-differentiation.md` section 3c + the E column in the §5 matrix.
- Verify in order: `npm test`, `npm run lint`, `npm run typecheck`; `npm run build -w templates/ticha-krajina` (prototype) and `build:production` (expect exactly the fixture's rules, as for C and D, with G-032 counting the three placeholder landscapes); `npm run qa` for A–E (`--workers=4 --timeout=240000`, outside the sandbox; axe serious/critical = 0); Lighthouse mobile via `npx lighthouse` with `CHROME_PATH` on Playwright's Chromium under `~/Library/Caches/ms-playwright/chromium-1248/` for home, jak-postupovat, cenik, oznameni; trial client **`clients/hnatek-e`** (copy of `clients/hnatek`, switched per /site-build step 2 to `ticha-krajina` with `mlha`, `spectral-figtree`, `high`; the fixture's placeholder notices, people, FAQ and documents with all four optional folders present; `landscapes` on with the fixture's three neutral placeholders; Kontakt's `secondaryImage` set to the client's own existing `budova-kancelare.jpg` with the metadata it already has in `pages/o-nas.md`) → `client:validate`, `client:build`, `client:export -- hnatek-e` (RESULT: PASS 10/10); greyscale screenshots at 375 and 1280 beside A, B, C and D; the §7 scorecard against each of A–D (≥ 11/15, no dimension < 2); contrast per palette computed and recorded; budgets (HTML + CSS ≤ 100 KB gzip, JS ≤ 10 KB; band images AVIF ≤ 200 KB at 1280 even though they are never the LCP).
- `clients/hnatek`, `hnatek-b`, `hnatek-c` and `hnatek-d` are not touched. Nothing is committed until asked.

### Contrast (from `TOKENS.md`, computed; rechecked after the build)

| Pair | Mlha | Len | Use |
| --- | --- | --- | --- |
| ink on ground | 13.98 | 13.99 | body, headings, links, stamp rules, focus ring (3 px) |
| muted on ground | 6.51 | 6.63 | captions, labels, notice sentence, dates |
| accent on ground | 7.49 | 5.82 | nonstop number, picked-word and current-page bar (3 px) |
| on_accent on accent | 8.51 | 6.67 | not used unless a filled control is needed |
| rule on ground | 3.14 | 3.14 | table hairlines (UI ≥ 3 : 1) |

## 10. Summary of what needed your answer (all approved as proposed, 2026-11-13)

1. **The core addition (§2):** `site/landscapes.json` as an optional singleton (`images[]` of `{ image, place }`, caption from `ImageRef.caption`), the `landscapes` content feature and `supports` flag (false for A–D), the `landscape.band` slot (32:11, phones 25:16), existing image rules applied while the feature is on, the CMS entry "Krajiny" with the guardrail in its help texts, tests and docs.
2. **Stock photos rejected by the schema (§2.1)**, and **G-077 as an error (§2.4)** rather than a warning.
3. **Guardrail in CMS descriptions only (§2.5)**, not a per-photo confirmation checkbox.
4. **High emphasis moves the first stamp line above the H1 (§3.1)** instead of adding a third copy.
5. **Default homepage order (§3.1)** including `people`, with the caveat for clients without people.
6. **Kontakt building photo via the existing `secondaryImage` (§3.1)**, and in the trial client the existing `budova-kancelare.jpg`.
7. **Shared QA change (§9):** the homepage order check skips `data-interlude` children (bands, stamp line), so E is not credited for decoration.

## 11. Build results (2026-11-13)

### What was built

| Area | Files |
| --- | --- |
| Core (approved §2) | `core/content/schemas.ts`: `LandscapeImage` (`{ image: ImageRef, place }`, `source: "licensed-stock"` rejected with a Czech message), `LandscapeSet` (`images`, at most `MAX_LANDSCAPE_IMAGES` = 12), registered in `OPTIONAL_SINGLETON_SCHEMAS`; `snapshot.ts` (`landscapes: LandscapeSet \| null`); `config.ts` (`features.landscapes`, default false, in `CONTENT_FEATURES`; `supports.landscapes`); `env.d.ts`; `load.ts` (`getLandscapes()`, `[]` while off or absent). `core/gate/rules.ts`: **G-077** "Landscape set present while the feature is on" (error in both modes); landscapes count as published images (G-032, G-033 and launch check L-008) only while the feature is on, G-003 (file exists) always applies, and the referenced-media check ignores them while off. `landscapes: false` added to the A–D manifests and the test manifests. |
| Core tests | new `core/tests/landscapes.test.ts` (15 tests: schema incl. stock rejection and the cap, G-005, G-077, G-032 marker / error, G-033, G-003, referenced media, launch check L-008); default-feature expectations in `schemas.test.ts`. |
| CMS, client tools | `tools/cms/pages-config.ts`: "Krajiny" (`site/landscapes.json`) under the company items while the feature is on: list of 0–12, each an image (help "Na šířku, alespoň 2560 px.") and a required place, with the guardrail text `LANDSCAPES_HELP` as the list description; tests in `tools/cms/tests/pages-config.test.ts`. `tools/client/new.ts`: `landscapes.json` in the optional content copied by `client:new`, `ticha-krajina` in the usage; tests in `tools/client/tests/client.test.ts`. |
| Fixture | `fixtures/neutral/src/content/site/landscapes.json` (three entries "Zástupné místo 1–3" on the new flat `placeholder-32x11.png`, 2560 × 880, text only; no realistic or generated imagery), fixture README. The fixture's own `site.config.ts` keeps the feature off, so A–D are unchanged. |
| Docs | `docs/template-contract.md` (supports + "Landscape photo set"), `docs/content-contract.md` (§6.18, G-077), `docs/editable-fields.md` (§4.17 Krajiny), `docs/design-differentiation.md` (§3c and the E column), `.claude/skills/site-build/SKILL.md` (landscapes, when to choose E, slots). |
| Wiring | `templates/ticha-krajina/`: `package.json` (`@site/template-ticha-krajina`, `@fontsource/spectral`, `gelasio`, `figtree` 5.3.0, `astro` 7.4.2), `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`, `template.manifest.ts` (as §3), `fixture.site.config.ts` (every optional type and `landscapes` on, default options). |
| Shell | `src/layouts/QuietLayout.astro`: options → `data-palette`, `data-font`, `data-emphasis`; preloads the serif 400 latin + latin-ext faces; SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`; `neutral` prop; one inline Menu script (0.9 KB raw). |
| Components (33, all new names) | `QuietTopBar`, `QuietNav`, `StampLine`, `NoticePublisherLine`, `QuietFooter`, `GridPassage`, `LandscapeBand`, `ProsePassages`, `OpeningText`, `PickerSentence`, `FirstHoursPassage`, `ServicesPassage`, `FamilyPassage`, `PeoplePassage`, `OfficePassage`, `CatalogueWords`, `NoticesCountLine`, `GuideNarrative`, `StepPassage`, `QuestionsPassage`, `ServicePassages`, `InclusionLists`, `PriceGroupPassage`, `HairlineItems`, `OfficeHoursHairlines`, `TransportPassage`, `PeoplePortraitRows`, `CatalogueQuietRows`, `NoticeSentences`, `NoticeDetailText`, `NoticeQrPassage`, `AdrPassage`, `DocumentLines` |
| Lib, strings, styles | `src/lib/bands.ts` (band positions and photo choice per page), `src/lib/site.ts` (nav, phones, location, SEO helpers), `src/lib/notice-list.ts`, `src/lib/options.ts`; `src/i18n/cs.ts`; `src/styles/fonts.css` (latin + latin-ext with `unicode-range`, both pairs), `global.css`, `print.css` |
| QA | `qa/templates.ts` (E, port 4415); `qa/structure.spec.ts`: the home order check skips `data-interlude` children (approved §9), and a new check "landscape bands: never on notice pages, never in the first viewport (E)" at 375 × 667 and 1280 × 800 |

**Routes (fixture, every optional type on): 17 pages.** `/`, `/jak-postupovat/`, `/sluzby/`, `/rakve/`, `/kvetiny/`, `/o-nas/`, `/kontakt/`, `/cenik/`, `/oznameni/` + 3 notices, `/pro-ucastniky/`, `/pohreb-predem/`, `/pravni-informace/`, `/ochrana-osobnich-udaju/`, `/404.html`.

**Inventory changes against §6:** `ContactPassages` was not needed (Kontakt composes `GridPassage`s directly); `FirstHoursPassage`, `ServicePassages` (the Služby page) and `InclusionLists` were split out.

### Decisions taken while building

- **Bands.** `LandscapeBand` is a full-bleed `<Picture>` (AVIF / WebP, JPEG fallback, 480–2560 w, lazy), 32:11 from 48 rem, 25:16 on phones, with one muted Figtree 18 px caption line under it ("place · caption · Foto: credit"); without a photo it is 96 px of space, no frame. Home starts at photo 1, Služby at 2, O nás at 3, Pro účastníky at 4, Pohřeb předem at 5; a page never repeats a photo. Measured band tops on the fixture: about 1210 px at 375 and 1080 px at 1280, so never in the first viewport (QA checks it).
- **Ceník stamp line before the intro.** The comp puts the VAT note, the lead, the validity and the print hint beside the H1, and the stamp line after them. With the fixture's text that pushed the stamp below the first screen at 375 (QA test 1 failed). The opening is now H1 + `<VatNote>` (bold), then the stamp line, then a passage with the lead, general note, validity, print hint and `<DemoPricingNotice>` (still before the first price, QA test 8).
- **Price cells may wrap.** The amount is `nowrap`, the UKÁZKA mark may drop under it; a fully `nowrap` cell overflowed at 320 px ("800–1 500 Kč UKÁZKA").
- **People and catalogue rows** are one per row on the 12-column grid only when at least one item has an image; without images, names sit two per row; an item without an image among others gets no frame (`:only-child` rule repeated inside the media query so it does not fall back to the phone column).
- **Kontakt people**: with photos, the rows span the grid under a full-width heading (as the Lidé comp); without photos, a normal grid passage.
- **High emphasis** moves the first stamp line above the H1 (approved §3.1); checked on the option variant (`len`, `gelasio-figtree`, `high`, sections reordered with `notices` second) at 320, 375 and 1280: the number never wraps.
- **Phone links are never flex** (S6 lesson): the stamp line is a grid on desktop, spans with explicit `{" "}`; every `tel:` link is `inline-block` with 0.625 rem block padding (≥ 44 px).
- **Print rule colour** darkened from `#9aa3a1` (2.58 : 1 on white) to `#7e8a88` (3.57 : 1).

### Contrast (computed, WCAG 2.x)

| Pair | Mlha | Len | Use |
| --- | --- | --- | --- |
| ink on ground | 13.98 | 13.99 | body, headings, links, stamp rules, focus ring (3 px) |
| muted on ground | 6.51 | 6.63 | captions, labels, notice sentences, dates, demo line |
| accent on ground | 7.49 | 5.82 | nonstop number, picked-word and current-page bar (3 px) |
| rule on ground | 3.14 | 3.14 | table and list hairlines (UI ≥ 3 : 1) |
| ink on photo placeholder | 10.29 | 10.38 | text on the empty image fill (placeholder label) |
| muted on photo placeholder | 4.79 | 4.92 | placeholder sub-line |
| photo placeholder on ground | 1.36 | 1.35 | image fill only, never carries meaning |

`on-accent` is not used (no filled controls). Print: ink `#1b1f1e` on white 16.65, muted `#3d4442` 9.98, rule `#7e8a88` 3.57; no accent in print.

### Budgets

Fixture build, gzip: HTML at most 5.9 KB per page (`/jak-postupovat/`), one CSS file 3.3 KB, so HTML + CSS ≤ 9.2 KB per page (limit 100 KB). JS: one inline Menu script, 0.9 KB raw (limit 10 KB). The LCP element is the H1 text (no image in the first screen by design); the largest band file is 61 KB (2560 w JPEG fallback; AVIF / WebP smaller), limit 200 KB. Fonts: two preloaded faces (Spectral 400 latin 22 KB, latin-ext 20 KB), the rest on demand; no third-party requests.

### Distinctiveness scorecard (design-differentiation §7)

Scored 0–3 from the built pages, the DOM outlines recorded by QA (`docs/qa/structure.json`) and the greyscale screenshots (`docs/notes/screens/ticha-krajina/greyscale/`: home at 375 and 1280 for A–E, plus `sheet-375.png` and `sheet-1280.png`). Measured home order differences (sections only, interludes skipped): A/E 4 positions, B/E 3, C/E 3, D/E 6.

| Dimension | E vs A (Rodinná tradice) | E vs B (Důstojná jednoduchost) | E vs C (Noční linka) | E vs D (Plný přehled) | Evidence |
| --- | --- | --- | --- | --- | --- |
| Composition | 2 | 3 | 3 | 3 | E: text-only grid hero (H1 cols 1–7, lead 9–12), offset passages (heading 1–4, text 6–11), full-bleed bands between passages. A is also a long editorial read with prose sections, but with a centred letterhead and an image beside the hero; B: CTA tier and tinted bands; C: one statement per screen on a dark rail; D: a four-column directory. |
| Navigation | 3 | 2 | 3 | 2 | E: plain non-sticky bar, text nav (two lines at 1280), "Menu" opening large serif words, CTA as a ruled stamp line. A: centred letterhead + dark strip; C: side rail. B and D also show the nav as a top row, but B has a CTA button, dropdown and fixed bottom bar, D the boxed nonstop / Kancelář pair. |
| Typography | 2 | 3 | 3 | 3 | E: Spectral 400 for every heading and body, Figtree only for labels. A is serif-led as well (different family, drop cap, small caps), so 2; B, C and D are sans / mono. |
| Image usage | 3 | 3 | 3 | 3 | E: no image in the first screen; full-bleed 32:11 landscapes between passages, captioned. A: large photo beside the hero; B: one optional hero image, uniform grids; C: none on home; D: thumbnails only. |
| Content hierarchy | 2 | 2 | 2 | 3 | E: opening, stamp, first steps, services, family, people, office; one long page per topic. A leads with the family story; B and C lead with first steps too (B with a CTA tier, C one decision per screen); D shows everything at once. |
| **Total** | **12 / 15** | **13 / 15** | **14 / 15** | **14 / 15** | all pass (≥ 11, no dimension < 2) |

The closest pair is E / A, as expected in §7: both are serif-led on light grounds and both are long reads. They separate on structure (letterhead + strip vs plain bar + stamp line; image hero vs text grid; dot leaders vs price-as-heading; inline photos vs full-bleed bands). All five stay conservative: no ornament, no motion, no icons.

### Speed

**Lighthouse 13.6, mobile (default emulation), Playwright's Chromium 1248, fixture build in prototype mode** (`astro preview`; load average 58–100 from other sessions during the run):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 96 | 69 | 0.8 s | 0.001 | 0 ms | 121 KiB |
| `/jak-postupovat/` | 100 | 100 | 96 | 66 | 0.8 s | 0 | 0 ms | 115 KiB |
| `/cenik/` | 100 | 100 | 96 | 66 | 0.8 s | 0 | 0 ms | 114 KiB |
| `/oznameni/` | 100 | 100 | 96 | 69 | 0.8 s | 0 | 0 ms | 116 KiB |

Best practices 96: the fixture has no `public/favicon.ico` (404 in the console). SEO 66–69: the only failing audit is `is-crawlable` (prototype builds are `noindex`, `robots.txt` disallows all). Both by design, as for C and D.

### Verification

| Step | Result |
| --- | --- |
| `npm test` | 15 files, 294 tests passed (landscape schema, gate, CMS and client tests; E in the client and CMS template lists) |
| `npm run lint` | clean |
| `npm run typecheck` (tsc + harness check) | 0 errors |
| `npm run check -w templates/ticha-krajina` | 0 errors, 0 warnings, 0 hints |
| `npm run build -w templates/ticha-krajina` | 17 pages (fixture, prototype) |
| `npm run build:production -w templates/ticha-krajina` | fails with exactly the fixture's rules, as for D: G-011 (3), G-012, G-020, G-021, G-031 (50), G-032 (15 = D's 12 + the three placeholder landscapes), G-040 (7), G-073, G-074 (3); G-071 the expected warning |
| `npm run qa` (A–E + structure; `--workers=4 --timeout=240000`, outside the sandbox) | first run: 1484 / 1486, both failures E `/cenik/` (stamp line below the first screen at 375; a price cell overflowing at 320), fixed as above. **Final full run: 1486 / 1486 passed** (5.8 min). axe serious/critical: 0 on every page of every template. |
| option variant (`len`, `gelasio-figtree`, `high`, sections reordered) | 17 pages; screenshots at 320, 375 and 1280: the number never wraps, the stamp sits above the H1 |

**QA change (shared, approved §9):** the home order check skips `main` children marked `data-interlude` (E's bands and stamp lines). A–D render none, so their results are unchanged. The new band check is a no-op for templates without `data-band`.

### Trial client and export

`clients/hnatek-e`: a copy of `clients/hnatek` (which, with `hnatek-b`, `hnatek-c` and `hnatek-d`, was not touched), switched to `ticha-krajina` (`mlha`, `spectral-figtree`, `high`; default sections), with the fixture's placeholder notices, people, FAQ and documents (fictional, `placeholder: true`, people consent `null`, so G-074 warns), the fixture's three neutral landscape placeholders, and Kontakt's `secondaryImage` set to the client's own `budova-kancelare.jpg` (existing website, rights confirmed, no people). Not a client deliverable.

- `client:validate -- hnatek-e`: **PROTOTYPE: PASS** (production blocked by G-012, G-020, G-021, G-031, G-032, G-040, G-074).
- `client:build -- hnatek-e`: 14 pages.
- `client:export -- hnatek-e --force`: **RESULT: PASS (10/10 steps)** (`exports/hnatek-e/`, ignored by Git).
- Seen on the build: the building photo is 722 px wide, so the full-bleed band upscales it visibly at 1280. A real client needs a ≥ 2560 px landscape shot, as the CMS help says.

### What from the comps is not implemented, and why

| Comp detail | Built instead | Why |
| --- | --- | --- |
| Nav items "Pohřeb bez obřadu", "O nás a lidé"; a Lidé page | core `site.nav` with `navLabel`s, plus Pro účastníky, Pohřeb předem, Lidé (`/kontakt/#lide`), Časté otázky, Dokumenty | core fixes nav order; `/lide/` is not a core route (approved for C, D) |
| Ceník: VAT note, lead and print hint beside the H1, stamp after them | H1 + VAT note, stamp line, then the intro passage | keeps the nonstop number in the first screen at 375 (QA test 1) |
| Ceník closed by a stamp line | the footer's stamp closes it | two identical stamp lines in a row (§8) |
| 16 px band caption, 17 px Menu label | 18 px | the design's self-check (18 px minimum) |
| "Vytisknout ceník" / "Vytisknout oznámení" | Ctrl/Cmd + P instruction | approved for C and D (no JS beyond the menu) |
| High emphasis "also" before the H1 | moved, not repeated | approved §3.1 (no third copy) |

### Open legal questions (⚖, research §4a)

1. **L1, neutral form:** the muted "Oznámení zveřejňuje <brand>." with the ink link "Telefon nonstop …", the reduced nav and the neutral footer on `/oznameni/` and notice pages.
2. **L1, home:** the optional `notices` section shows a count with a link, never names and never beside a band; confirm that this is not advertising "v souvislosti s informováním o smrti".
3. **L1 + accessibility:** as for C and D, core's fixed accessible name of the nonstop link still says "převoz" on notice pages and does not contain the visible "Telefon nonstop …" (WCAG 2.5.3).
4. **L9:** the VAT note sits under the Ceník H1 (bold), under the items table, and on the A4 sheet; confirm that this is "near the prices".
5. **Landscapes:** commissioned photos of public landscape without people need the photographer's licence (recorded through `ImageRef` rights, G-032 / L-008); no further consent is expected, but a lawyer may want to confirm for recognisable private buildings.

### Screenshots (local only: `docs/notes/screens/` is gitignored)

`docs/notes/screens/ticha-krajina/greyscale/`: home at 375 and 1280 for A–E and two contact sheets. Working screenshots (fixture pages, the option variant, the trial client) are in the session scratchpad only.
