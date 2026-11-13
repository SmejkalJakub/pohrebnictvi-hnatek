# S10 · Template D `dve-cesty` (Dvě cesty): plan

**Status:** built (2026-11-13). The plan below was approved as proposed (every **[review]** item, including bringing in commit a50e789); the build results are in §15. Nothing is committed. Built from Prompt 2 in [docs/prompts/new-templates.md](../prompts/new-templates.md) with the design input in [docs/designs/dve-cesty/](../designs/dve-cesty/README.md): the approved direction D3 (three boards) and the page set the owner approved on 2026-11-13 (canvas "Šablona D Dvě cesty – stránky", 21 boards, `html/*.dc.html` for exact values, `comps/*.png`, `tokens.json`).

**D `dve-cesty` replaces D `plny-prehled`**, which the owner rejected outright. The old template, its trial client and its registrations go in the same change (§12). Its core additions stay. Templates A, B, C and E exist on this branch and are peers (no imports, no shared component names, every pairwise check). F `rodinny-rozhovor` and G `lide-a-misto` are on other branches and join at merge time. Reserved for D: QA port **4417**, gate rule **G-079** (not needed, see §2), this note s10, client `hnatek-d`.

Decisions that need the owner's yes are marked **[review]**. Everything else follows the approved boards, the contract, an approved answer from S6–S8, or an existing pattern. Lessons applied from S6 and S8: label-plus-number phone links never use flex (QA test 9); core fixes the nav order; people on `/kontakt/#lide`; print links become a Ctrl/Cmd + P hint; QA with `--workers=4 --timeout=240000` outside the sandbox; Lighthouse via `npx lighthouse` on Playwright's Chromium.

## 1. Concept (from the boards)

For a funeral home whose visitors arrive in two very different states. The home page asks "S čím vám můžeme pomoct?" and splits in two: a **navy half "Někdo právě zemřel"** with the nonstop number and three first steps, and a **stone half "Chci se informovat nebo připravit"** with prices, a funeral without ceremony, pre-planning and questions. A **"Teď hned / S předstihem" switch** in the header keeps the two paths apart across the site: every page belongs to one path and opens in that path's colour, so a person in shock is never sent through price lists, and a person planning ahead is not rushed.

Structural ideas that make it D, not A, B, C or E:

- **The split home.** H1 question, then two equal halves (navy | stone) at ≥ 64 rem, stacked navy-first on phones. No hero image ever.
- **The path switch.** A segmented control of two links in the centre of the header (1280) or full width under it (375). It is the only rounded shape besides the Menu button.
- **Path-coloured openings.** Every non-notice page opens with a full-bleed panel in its path's colour: navy with the nonstop number (Teď hned) or stone with a ruled nonstop line (S předstihem). At 1280 the panel starts with "V této cestě:" and the path's pages.
- **One family, two colours.** Manrope only; navy `#1C2940`, stone `#ECE7DF`, white, paper `#F4F1EC`. Separation by colour fields and 1–2 px rules; no cards, icons or photos in the openings.
- **Notices are outside both paths**: reduced header, grey publisher line, no switch, no navy field, neutral footer.

## 2. Core: no change proposed; one fix to bring in **[review]**

- **No new data.** Paths are a template-local mapping of page ids (§4). The switch, the path openings and the grouped menu need nothing from core. No gate rule, so G-079 stays unused.
- **Nav order.** Core's `NAV_ORDER` (and the extras C/E add for optional pages) is kept. The template splits that ordered list into the two path groups and never reorders items inside a group. On the boards Ceník came first in the S předstihem row; I follow core instead (Služby · Rakve · Květiny · O nás · Ceník, then Pro účastníky · Pohřeb předem · Časté otázky · Dokumenty). **[review]** that grouping by path counts as "within core's order". Alternative: one list with a small path label beside each item.
- **The collections fix a50e789 [review].** The new `hnatek-d` must have content "exactly as clients/hnatek" with every optional type off, so it has no `notices`, `people`, `faq` or `documents` folder. On this branch `core/content/collections.ts` still defines those collections only when their folder exists, so `client:export` fails `astro check` (9/10, the S6 finding). The fix exists as commit **a50e789** "fix(core): define every content collection even without its folder" on branch `claude/awesome-solomon-8d8424` (not in main, not here). I propose to **cherry-pick a50e789** into this change (two files: `collections.ts` + a test). Alternative: give `hnatek-d` empty folders with a `.gitkeep`, which keeps core untouched but makes the client differ from `hnatek`. Without one of the two, the done criterion "export PASS 10/10" cannot be met.

## 3. Intended manifest

```ts
{
  id: "dve-cesty",
  name: "Dvě cesty",
  version: "0.1.0",
  coreVersion: "^0.1.0",
  supports: {
    articles: false,
    multipleLocations: false,
    contactForm: false,
    serviceDetailPages: true,      // Služby is an index of ruled rows; each row links to its page
    mapEmbed: false,
    notices: true,                 // neutral /oznameni/ by day + /oznameni/<slug>/
    people: true,                  // /kontakt/#lide (photos 3:4, or a ruled table without photos)
    faq: true,                     // /sluzby/#caste-otazky (S předstihem), see §5
    documents: true,               // /pravni-informace/#dokumenty + footer link
    guestInfo: true,               // /pro-ucastniky/ (drawn)
    prePlanning: true,             // /pohreb-predem/, built from Pro účastníky
    priceInclusions: true,         // "V ceně je zahrnuto" / "Není zahrnuto" (drawn)
    landscapes: false,
  },
  homepageSections: {
    available: ["hero", "contact-summary", "notices", "family-story", "next-steps", "services",
                "price-summary", "people", "catalogue-links", "documents", "faq"],
    default:   ["hero", "contact-summary", "notices", "family-story"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },
  options: {
    palette:           { values: ["noc-a-kamen"], default: "noc-a-kamen" },
    fontPair:          { values: ["manrope"], default: "manrope" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },
  imageSlots: {
    "company.logo":  { aspect: "none", required: false },  // dark logo on the white header; wordmark while null
    "person.photo":  { aspect: "3:4", required: false },
    "coffin.item":   { aspect: "4:3", required: false },
    "flower.item":   { aspect: "1:1", required: false },
    "notice.photo":  { aspect: "3:4", required: false },
    "notice.parte":  { aspect: "none", required: false },
  },
  pageFields: {
    home: ["navLabel", "metaTitle", "metaDescription"],    // the H1 is the question (UI string), see §3.1
    "jak-postupovat", sluzby, rakve, kvetiny, cenik, oznameni, "pro-ucastniky", "pohreb-predem",
    "pravni-informace", "ochrana-osobnich-udaju", kontakt:
                     ["title", "navLabel", "metaTitle", "metaDescription", "lead", "body"],
    "o-nas":         ["title", "navLabel", "metaTitle", "metaDescription", "lead", "excerpt", "body"],
  },
}
```

### 3.1 Notes on the manifest

- **The hero is the split.** `hero` renders the H1 question and both halves, so the split always follows the H1 and the client cannot separate the halves by reordering sections. Navy half: path label, heading, `<EmergencyPhoneLink>` (label, number, availability), three first steps, link "Postup podle místa úmrtí" → `/jak-postupovat/`. Stone half: Ceník with the first group's from-price (`<PriceValue>`) while pricing is visible, the featured services **except category `transport`** (transport belongs to Teď hned), Pohřeb předem (when on), Časté otázky (when on), then `<VatNote>` when a price shows. Each row is a link plus a short line (service `summary`, page `lead`, FAQ topics).
- **H1 and the three steps are UI strings** in `src/i18n/cs.ts` ("S čím vám můžeme pomoct?"; "Lékař provede prohlídku zemřelého a vystaví list o prohlídce." · "Zavolejte nám. Převoz domluvíme hned." · "Pohřeb nemusíte zařizovat hned. Máte na to několik dní."), as drawn. They state no business facts. The home `title` is therefore not shown and not a page field, as for the old D; `<title>` comes from `metaTitle`, then the brand name. **[review]** Alternative: H1 = `home.title`, which for Hnátek is a long sentence and would break the question-first idea.
- **Default order** hero → contact-summary → notices → family-story is the drawn row "Kancelář · Oznámení a obřady · O nás" (three columns at 1280, stacked at 375). `defaultSectionsFor` drops `notices` while the feature is off, so `hnatek-d` gets hero → contact-summary → family-story. Measured on the fixtures (sections only), it differs from A in 4 positions (hero, family-story, services, next-steps, contact-summary), B in 4, C in 3 and E in 4. The other sections (next-steps, services, price-summary, people, catalogue-links, documents, faq) are available below them as single plain columns or ruled lists, never as a second split.
- **One palette, one font pair [review].** The two colours are the structure, so there is nothing to vary without changing the idea. I declare `palette` and `fontPair` with one value each, so `/site-build` and `site.config.ts` stay uniform. A second palette can be added later if a client's logo clashes with navy.
- **Manrope 400 / 700 / 800** (the boards' 500 becomes 400; ≤ 3 weights). `@fontsource/manrope`, combined weight CSS with `unicode-range` (latin + latin-ext), preload 800 latin + latin-ext (the H1 and the number are the LCP candidates). Pangram checked in every weight.
- **`emergencyEmphasis: "high"`** adds a navy band directly under the switch on every page that opens with the stone panel (§7). Home and Teď hned pages already open with the number, so they do not change (approved with the page set).
- **No hero or about images.** The template has no photo in the first screen anywhere; O nás is text. No `about.story`, `home.hero` or `contact.building` slot.

## 4. Paths (template-local, `src/lib/paths.ts`)

| Path | Page ids | Opening |
| --- | --- | --- |
| `now` (Teď hned) | `jak-postupovat`, `kontakt` (Lidé at `/kontakt/#lide`) | navy panel with the number |
| `ahead` (S předstihem) | `sluzby` (+ detail pages), `rakve`, `kvetiny`, `o-nas`, `cenik`, `pro-ucastniky`, `pohreb-predem`, `pravni-informace`, `ochrana-osobnich-udaju` (+ Časté otázky and Dokumenty anchors) | stone panel with the ruled nonstop line |
| `neutral` | `oznameni` and every notice | no panel, no switch |
| `both` | `home`, 404 | home: the split; 404: two small halves, switch with nothing selected |

**Switch targets:** "Teď hned" → `/jak-postupovat/`, "S předstihem" → `/sluzby/` (both always exist; `/cenik/` may be hidden). On a path page the matching option is filled with `aria-current="page"`. On home "Teď hned" is filled as drawn, without `aria-current` (approved with the page set). On the 404 neither is filled. A typed function `pathOf(pageId)` with an exhaustive switch, so a new core page id fails the typecheck until it is assigned.

## 5. Pages and composition

Exact values from `docs/designs/dve-cesty/html/*.dc.html`: body 18 / 1.6, lead 19 / 18, H1 40 (1280) / 30 (375; home 28), section headings 24–32 / 22–24, step titles 20 / 800, nonstop 50 / 34 in a navy panel, 26 / 22 on the stone line; side margin 56 / gutter 16; radius 0 except the switch and Menu (999 px). **Every text at ≥ 18 px** in the build, including footer, availability lines, dates and path labels (the boards show 15–17 px there); the path label may wrap at 320. Phone numbers `white-space: nowrap`; one-letter words get `&nbsp;` (`nbsp()` as in E).

| Route | Path | Composition | Drawn |
| --- | --- | --- | --- |
| `/` | both | header + switch; `hero` = H1 question + split (§3.1); then sections in config order: **contact-summary** ("Kancelář": address, hours under their own heading with `data-office-hours`, office phone; never in navy), **notices** (heading + "Zobrazit oznámení (n)", count only, L1), **family-story** (o-nas `excerpt` + "Kdo jsme"); three columns at ≥ 64 rem when exactly these three follow the hero, otherwise one plain column each | 1280, 375 |
| `/jak-postupovat/` | now | navy opening (label, H1 = page title, number); picker "Kde blízký člověk zemřel?" as full-width ruled link rows to `#situace-…` (core `guidance-flow.ts`, `:has(:target)` + `[data-guide]`, no JS); picked row filled navy with "(vybráno)" and a "Zrušit výběr a ukázat vše" link; phases as 22 px headings on a 2 px navy rule; steps numbered by CSS counters (28 px column, 20 px title, text), native 24 px checkboxes in 44 px rows, long text in `<details>` **with a visible marker**; steps with an emergency `contactPrompt` carry the nonstop link; a stone Kancelář block closes the page. 1280: Kontakt-style two-column opening, content in 8/12 | 375 ×5 |
| `/kontakt/` | now | navy opening = the emergency block (`data-emergency-block`: label, H1, number, availability, `serviceArea`); then Kancelář · Úřední hodiny (ruled table, holiday note, `data-office-hours`) · Telefony a e-mail (three columns at 1280); `#lide` on stone when people are on | 375, 1280 |
| people | now | with any photo: four per row at 1280 (3:4 portrait, name 21 px 800, role, phone), two per row at 375; a person without a photo gets no frame. Without photos: a ruled three-column table (name · role · phone) beside a 4/12 heading column; one column at 375 | 1280 ×2 |
| `/cenik/` | ahead | stone opening: "V této cestě", label, H1, **`<VatNote>` in bold right under the H1**, then the ruled nonstop line (kept inside the first screen at 375, the S8 lesson), then the lead, `<DemoPricingNotice>`, validity and the Ctrl/Cmd + P hint below the panel; groups: name left, from-price right (30 px 800) on a 2 px rule, description, "V ceně je zahrnuto" / "Není zahrnuto" in two columns; groups without lists and single items in "Jednotlivé položky" as a ruled three-column table (amount `nowrap`, UKÁZKA may wrap under it); `<VatNote>` again under the table | 1280 |
| `/cenik/` print | ahead | `print.css`: black on white, no switch, no panels; letterhead line, H1 + validity + VAT note, groups at 14–19 px, items table, closing block with nonstop and Kancelář in **two separate cells**, legal identification and source URL | A4 |
| `/sluzby/` | ahead | stone opening; services by category as sections: heading column 4/12 + ruled list 8/12 (service link 23 px 800, price from its linked group or a short fact, summary); **Časté otázky** (`#caste-otazky`, when faq is on): topics as headings, each question a `<details>` | 1280 |
| `/sluzby/<slug>/` | ahead | stone opening (H1 = service title, summary, ruled nonstop line); body in 8/12; "Co je v ceně a kolik to stojí" → `/cenik/#<group>` with the from-price and `<VatNote>`; "Další služby" ruled list | from Služby |
| `/rakve/`, `/kvetiny/` | ahead | stone opening; ruled rows: image (4:3 / 1:1, 160 px) + name + code / material / type + summary; without images, plain ruled rows; zero items: one sentence + office phone; Květiny ends with the flowers phone | from Služby |
| `/o-nas/` | ahead | stone opening; body as plain sections (h2 4/12, text 8/12); no photo | from Služby |
| `/pro-ucastniky/`, `/pohreb-predem/` | ahead | stone opening with the ruled nonstop line; body split at `##` into sections under 1 px rules; no prices, no service teasers on Pro účastníky | Pro účastníky 375 |
| `/pravni-informace/` | ahead | stone opening; Mimosoudní řešení sporů (ADR + link), Reklamace, **Dokumenty** (`#dokumenty`: ruled list, title link, "PDF", valid from), body | from Kontakt |
| `/ochrana-osobnich-udaju/` | ahead | stone opening, body | from Pro účastníky |
| `/oznameni/` | neutral | reduced header (Oznámení a obřady · Kontakt · Úvodní stránka; Kontakt only at 375), grey publisher line, H1 + lead; "Nadcházející rozloučení" grouped by day (uppercase date on a 2 px rule; name as a 26 / 23 px link, ceremony sentence, dates); "Nedávná oznámení" as a ruled name list (right 5/12 at 1280, below at 375); links to Pro účastníky and Úvodní stránka; empty state one sentence; neutral footer | 1280, 375 |
| `/oznameni/<slug>/` | neutral | as the approved notice board: "Všechna oznámení", placeholder mark, name 34 px 800, dates; ceremony sentence 21 px 700 under a 2 px rule, type, map link, "Sledovat přenos obřadu" + note (L14); optional 3:4 family photo above the name (uncropped, consent per G-070); Od rodiny; Kondolence (instruction with e-mail); QR (`<NoticeQrCode>`) + Ctrl/Cmd + P hint | 375 |
| `/404.html` | both | switch with nothing selected; H1 "Tuto stránku jsme nenašli"; one sentence; small navy half (number, Jak postupovat) and small stone half (Ceník, Služby, Kontakt a úřední hodiny); a line to Oznámení a obřady when on | 375 |

## 6. Header, switch, menu, footer

- **Header ≥ 64 rem:** a three-column grid: wordmark or logo | `PathSwitch` (`<nav aria-label="Cesta">`, two links) | general nav (`<nav aria-label="Hlavní">`: Oznámení a obřady when on, O nás, Kontakt; core order). Not sticky. The path's other pages are in the opening panel's "V této cestě" row (`<nav aria-label="V této cestě">`), current page bold with a 3 px underline.
- **Header < 64 rem:** wordmark + "Menu" button (`aria-expanded`, `aria-controls`, "Menu" ↔ "Zavřít", Escape closes, focus returns); the switch full width under the header (always visible, outside the menu). The menu opens in the flow under the header: a navy group (path label, `<EmergencyPhoneLink>` 30 px, Jak postupovat, Kontakt, Lidé when on), a stone group (S předstihem pages in core order; the current page bold with "(tato stránka)"), a plain group (Oznámení a obřady, Úvodní stránka). 20 px 700 links in ruled rows ≥ 48 px. Without JS the list is shown and the button hidden. One inline script ≤ 1 KB.
- **Footer (every non-notice page):** two halves, the navy one with path label, `<EmergencyPhoneLink>` (34 px), availability, Teď hned links, in a `data-emergency-block` with a visually hidden heading; the stone one with **Kancelář** (address, hours under their own heading with `data-office-hours`, office phone) and the S předstihem links; then the legal row on paper: legal name, sídlo, IČO, register entry, ADR line, Právní informace (`site.legalLink`), Dokumenty (when on), Ochrana osobních údajů. **Neutral footer** (notices): the legal row only, with Kancelář's address and hours kept as one plain line (invariant 3, L8, L10) and no links to Služby or Ceník.

## 7. Emergency CTA forms

| Form | Where | Build |
| --- | --- | --- |
| Default, navy | home navy half, every Teď hned opening, footer, menu | `<EmergencyPhoneLink variant="custom">` as one block link: label span, number span, availability span, each `display: block` inside the `<a>` with explicit `{" "}` between them (never flex: QA test 9); number 50 / 34 px 800 white, underlined 3 px; label and availability in mist; ≥ 44 px tall |
| Default, stone | every S předstihem opening (last element of the panel) | "Někdo právě zemřel?" as plain text, then the link with **label + number visible** ("Nonstop převoz zesnulých +420 …", 26 / 22 px 800, underlined 2 px), under a 2 px navy rule |
| High emphasis | additionally, a band under the switch on every S předstihem page | full-width navy band: one block link "Někdo právě zemřel?" (mist) + label + number (white, 22 px 800, underlined) |
| Neutral ⚖ | notice list and notices | grey paper line under the reduced header: "Oznámení zveřejňuje <brand>." + link "Telefon nonstop +420 …" (`inline-block`, padded to ≥ 44 px); no panel, no switch, no path label |

**Visible label (deviation from the boards, on purpose):** the boards show "Nonstop +420 …" on the stone line and the band. Prompt 1 requires the visible text of the `tel:` link to include the label and the number, and core's accessible name is "<label>, volat <number>"; with the full label visible, the name contains the visible text (WCAG 2.5.3). On notices the visible form stays "Telefon nonstop …", as approved for C and E (no "převoz" on notice pages), with the known 2.5.3 caveat (§11).

## 8. Options, tokens, contrast

One palette `noc-a-kamen` exactly as `tokens.json` (custom properties on `:root`, `html[data-emphasis]` for high emphasis). Contrast, computed (WCAG 2.2), rechecked after the build:

| Pair | Ratio | Use |
| --- | --- | --- |
| navy on white | 14.58 | body, headings, links, switch border, focus ring (3 px) on white and stone |
| navy on stone | 11.84 | text and links in stone panels |
| navy on paper | 12.94 | footer legal links, publisher line link |
| white on navy | 14.58 | text and number in navy, focus ring (3 px white) inside navy |
| mist on navy | 9.59 | path label, nonstop label, availability |
| stone text on stone | 7.14 | path label and notes on stone |
| slate on white / paper | 9.36 / 8.31 | secondary text, legal row |
| slate light on white | 5.93 | notes |
| print ink on white | 18.88 | A4 |
| hairlines (navy rule on navy 2.10, stone rule on stone 1.72, hairline on white 1.53), stone panel on white 1.23 | decorative | never the only boundary of a control; the path is also named in text and in the switch |

## 9. Component inventory (all new names; none matches a file in A, B, C or E)

| Area | Components |
| --- | --- |
| Layout | `layouts/CestyLayout.astro` (options → `data-palette`, `data-emphasis`; `path` prop: `now` / `ahead` / `neutral` / `both`; SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`) |
| Chrome | `PathHeader`, `PathSwitch`, `PathMenu`, `PathPanel` (opening in the path colour, with `PathSubnav`), `PathSubnav`, `UrgentBand` (high emphasis), `NowNumber` (navy form), `AheadNonstopLine` (stone form), `PublisherStrip` (neutral form), `SplitFooter` (full / neutral) |
| Home | `SplitHero` (`UrgentHalf` + `PrepareHalf`), `UrgentHalf`, `PrepareHalf`, `OfficeColumn`, `NoticesLinkColumn`, `AboutColumn`, `PlacePickerLinks` (next-steps), `ServicesRuledList`, `PriceFromLine` (price-summary), `PeopleColumn`, `CataloguePairLinks`, `DocumentsColumn`, `FaqColumn` |
| Guidance, FAQ | `PlaceRows` (picker), `PhaseSteps`, `StepItem`, `FaqDetailsGroups` |
| Pricing | `PriceGroupBlock` (name + from-price + two inclusion columns), `ItemsRuledTable`, `styles/print.css` |
| Services, catalogue | `ServiceGroupList`, `ServiceDetailBody`, `ProductRows` |
| Notices | `DayGroupedNotices`, `RecentNoticeList`, `NoticeDetailBlocks`, `NoticeQrHint` |
| Contact, people, legal | `OfficeColumns`, `HoursRuledTable`, `PeopleFourUp`, `PeopleRuledTable`, `AdrRows`, `DocumentRuledList`, `LostSplit` (404) |

Plus `src/i18n/cs.ts` (UI strings only), `src/lib/paths.ts`, `src/lib/site.ts`, `src/lib/notice-list.ts`, `src/lib/options.ts`, `src/styles/fonts.css`, `global.css`, `print.css`. Plain CSS, no Tailwind (as C and E). Core safety components styled through `class` + global CSS or their `data-*` hooks. Wiring copied from B for scripts only (`package.json` "@site/template-dve-cesty", `astro.config.mjs`, `content.config.ts`, `env.d.ts`, `fixture.site.config.ts` with every optional type on and default options). F and G pick their names on other branches; the structure test catches a clash at merge time.

## 10. Differentiation row (design-differentiation §5)

| Dimension | A Rodinná tradice | B Důstojná jednoduchost | C Noční linka | E Tichá krajina | **D Dvě cesty** |
| --- | --- | --- | --- | --- | --- |
| Header | centred letterhead | left logo, right nav, sticky | sticky side rail | plain bar, text nav | **wordmark · centred two-option path switch · three links; not sticky** |
| Emergency CTA | dark utility strip | header button + bottom bar | the rail itself | ruled stamp line twice | **navy half / navy page opening; ruled line in stone openings; band in high emphasis** |
| Mobile navigation | in-flow full-height list | dropdown under sticky header | ruled list under the panel | large serif words | **switch always visible; Menu grouped by path (navy group with the number, stone group, plain group)** |
| Homepage order | hero → story → services → steps → visit | hero → steps → services → contact → story | hero → services → steps → story → office | hero → steps → services → story → people → office | **split hero → office → notices → about** |
| Hero | editorial, image or panel | practical, CTA tier | one statement | text-only grid | **a question and two equal halves by situation** |
| Services IA | one long page | index + detail | statement index + detail | one long page with bands | **index of ruled rows by category + detail pages; FAQ on Služby** |
| Guidance | article + margin TOC | phased checklist | one step per statement | picker sentence, narrative | **picker as full-width rows, picked row filled; numbered phases under navy rules** |
| Catalogues | figure gallery | uniform grid | ruled rows | one per row, large names | **ruled rows with a small image** |
| Pricing | `dl` + dot leaders | table per group | statement per group | price as H2, lists | **group name + from-price on one ruled line, two inclusion columns, items table** |
| Notices | – | – | large-type agenda | calm sentences | **grouped by day under uppercase dates; recent list beside** |
| Footer | rich letter | compact two rows | four columns on rail colour | stamp line + three columns | **navy nonstop half | stone office half, legal row** |
| Typography | serif + humanist sans | neutral grotesque | one grotesque | light serif + Figtree labels | **one geometric sans (Manrope 800 headings, 400 text)** |
| Colour | warm paper, umber | cool slate, forest | dark, amber | mist / linen | **navy and stone as two fields; white ground** |
| Image use | larger, fewer | minimal | none on home | full-bleed landscapes | **none in any opening; people and catalogue only** |
| Separation | hairlines, small caps | 1 px lines, tinted bands | darkness and space | photographs and space | **colour fields by path + 2 px navy rules** |

**Closest pairs:** D / B (both sans, practical, ruled lists and tables, light grounds) and D / C (both use a dark navy field for the number). Against B the structure differs (no sticky header, no CTA button, no bottom bar; the split hero and the switch); against C the dark field is half a page, not the whole site, and the rest is light. I expect typography at 2 against B and colour at 2 against C, and will check both on greyscale screenshots before scoring.

## 11. Law (research §4a) and what I will not build

- **L1, notices:** neutral chrome (reduced header, grey publisher line, neutral footer), no switch, no navy field, no `PriceValue`, no links to Služby or Ceník, no "Objednat", no homepage sections. The home `notices` section is a heading with a link and a count, never names. ⚖ The neutral line, the reduced nav and the home link need the lawyer; as for C and E, core's fixed accessible name still says "převoz" on notice pages and does not contain the visible "Telefon nonstop …" (WCAG 2.5.3).
- **L1, home:** the navy half (death) sits beside the stone half with prices. The halves are about the visitor's situation, not a notice; there is no notice content on home except the count. ⚖ worth confirming with the lawyer.
- **L8** identification in every footer, neutral included; **L9** `<VatNote>` wherever a price shows (home stone half, Ceník twice, service detail, price-summary, A4); **L10** Právní informace + ADR in every footer; **L11** no cookies, no third-party requests, self-hosted fonts; **L12** family photos only with the notice's consent (G-070), people photos with recorded consent (G-074); **L14** livestream as a link. No newsletter or e-mail capture.
- **Print links** become the Ctrl/Cmd + P hint (approved for C, D, E).
- **Not built:** a `/lide/` page (people on `/kontakt/#lide`), a separate FAQ page (core has no route; FAQ on `/sluzby/#caste-otazky`, the S předstihem hub) **[review]**, nav items outside core's list, a sticky header or bottom bar.

## 12. Replacing `plny-prehled`

In the same change:

1. **Remove** `templates/plny-prehled/` and its registrations: `qa/templates.ts` (D entry → `dve-cesty`, port 4417; port 4414 is retired, not reused), any D-specific wording in `qa/structure.spec.ts` (the pair checks run over `templatePairs()`, so only comments and test names mentioning "D" as plny-prehled change), `tools/client/new.ts` usage text, `tools/client/tests/client.test.ts` and `tools/cms/tests/pages-config.test.ts` template lists (D on its own line, so F/G merges stay line-level), the `.claude/skills/site-build/SKILL.md` entry, the `docs/design-differentiation.md` D section and matrix column (replaced by `dve-cesty`), the `docs/designs/README.md` row (H marked superseded, D3 added), and the workspace entry in `package-lock.json` (via `npm install`).
2. **Keep** the core additions: homepage section ids `price-summary`, `people`, `notices`, `documents`, `faq` in `core/content/config.ts`, `defaultSectionsFor`, their G-005 checks and tests. Comments that say "template D" are reworded to "directory-style sections" so they do not point at a removed template.
3. **Mark superseded, do not delete:** `docs/notes/s7-plny-prehled.md` and `docs/designs/plny-prehled/README.md` get a status line "Superseded: rejected by the owner on 2026-11-13; replaced by D `dve-cesty` (docs/notes/s10-dve-cesty.md)."
4. **Replace `clients/hnatek-d`:** delete the old folder, then copy `clients/hnatek` (content exactly as is), switch per /site-build step 2 to `dve-cesty` with every optional type off (`features` as in `hnatek`), default sections (`defaultSectionsFor` → hero, contact-summary, family-story), default options (`noc-a-kamen`, `manrope`) and `emergencyEmphasis: "high"`; add a dated entry to `notes/feedback.md` ("2026-11-13: prototype rebuilt on template D `dve-cesty`; the earlier `plny-prehled` prototype was rejected"). Needs §2's collections fix to export.
5. **Export:** `client:export -- hnatek-d --out ~/Documents/hnatek-d-web --force` replaces the old D export there.

## 13. Registration and verification

- `qa/templates.ts`: `dve-cesty` (letter D, port 4417). No new QA test is needed for the idea, but I will add one small structure check, run only on templates that mark paths: **notice pages carry no `[data-path-switch]` and no navy panel**, and **every non-notice page has exactly one `aria-current` option in the switch, except home and 404** **[review]** (it guards the guardrail cheaply).
- `.claude/skills/site-build/SKILL.md`: when to choose D (firms with many planning-ahead visitors and a clear price list; no photos needed; navy works next to the logo), its slots, which optional types it supports, where FAQ, documents and people appear, and "put Pohřeb bez obřadu first among featured services". `docs/design-differentiation.md`: section for D and the column in §5.
- Verify in order: `npm test`, `npm run lint`, `npm run typecheck`; `npm run build -w templates/dve-cesty` (fixture, prototype) and `build:production` (expect exactly the fixture's rules, as for C and E, without the landscapes' three G-032 entries); `npm run qa` for A, B, C, D, E (`--workers=4 --timeout=240000`, outside the sandbox; axe serious/critical 0); Lighthouse mobile (`npx lighthouse`, `CHROME_PATH` = Playwright's Chromium 1248) on home, jak-postupovat, cenik, oznameni; option variant (`high`, sections reordered with `notices` second and every available section on) at 320, 375 and 1280; `hnatek-d` → `client:validate`, `client:build`, `client:export -- hnatek-d --out ~/Documents/hnatek-d-web --force` (RESULT: PASS 10/10); greyscale screenshots at 375 and 1280 beside A, B, C and E; the §7 scorecard against each (≥ 11/15, no dimension < 2); budgets (HTML + CSS ≤ 100 KB gzip, JS ≤ 10 KB; no LCP image).
- `clients/hnatek`, `-b`, `-c`, `-e`, `-f`, the main checkout and other worktrees are not touched. Nothing is committed until asked.

## 14. What needs your answer

1. **Collections fix (§2):** cherry-pick commit a50e789 into this change, or give `hnatek-d` empty optional folders instead. Without one of them the `hnatek-d` export cannot pass.
2. **Menu and "V této cestě" grouped by path (§2)**, keeping core's order inside each group.
3. **H1 as a UI string question (§3.1)**, home `title` not shown (as the old D).
4. **One palette and one font pair declared (§3.1).**
5. **FAQ on `/sluzby/#caste-otazky` (§11)**, the S předstihem hub, instead of `/jak-postupovat/` (Teď hned).
6. **Visible label on the stone line and the band (§7)**, a deliberate change from the boards' "Nonstop +420 …".
7. **One small structure check (§13)** for the switch and neutral notices.

## 15. Build results (2026-11-13)

### What was built

| Area | Files |
| --- | --- |
| Core (approved §2) | Commit a50e789 brought in: `core/content/collections.ts` defines every collection, with an empty loader when its folder is missing (so `hnatek-d` builds without optional folders); new `core/tests/collections.test.ts`. The homepage section ids `price-summary`, `people`, `notices`, `documents`, `faq`, `defaultSectionsFor` and their G-005 checks stay; the `config.ts` comment no longer names a template. G-079 was not used. |
| Wiring | `templates/dve-cesty/`: `package.json` (`@site/template-dve-cesty`, `@fontsource/manrope` 5.3.0, `astro` 7.4.2), `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/content.config.ts`, `template.manifest.ts` (as §3), `fixture.site.config.ts` (every optional type on, default options and sections). |
| Shell | `src/layouts/CestyLayout.astro`: options → `data-palette`, `data-font`, `data-emphasis`, `data-path`; preloads Manrope 800 latin + latin-ext (the H1 and the number); SeoHead, StructuredData, PrototypeBanner, skip link, `main#obsah`; `path` prop (`now`, `ahead`, `neutral`, `both`) and `lost` for the 404; one inline Menu script. |
| Components (44, all new names) | `PathHeader`, `PathSwitch`, `PathMenu`, `PathPanel`, `PathSubnav`, `UrgentBand`, `NowNumber`, `AheadNonstopLine`, `PublisherStrip`, `SplitFooter`, `SplitHero`, `UrgentHalf`, `PrepareHalf`, `OfficeColumn`, `NoticesLinkColumn`, `AboutColumn`, `PlacePickerLinks`, `ServicesRuledList`, `PriceFromLine`, `PeopleColumn`, `CataloguePairLinks`, `DocumentsColumn`, `FaqColumn`, `PhaseSteps`, `StepItem`, `FaqDetailsGroups`, `PriceGroupBlock`, `ItemsRuledTable`, `ServiceGroupList`, `ServiceDetailBody`, `ProductRows`, `ProseSections`, `DayGroupedNotices`, `RecentNoticeList`, `NoticeDates`, `NoticeDetailBlocks`, `NoticeQrHint`, `OfficeColumns`, `HoursRuledTable`, `PeopleFourUp`, `PeopleRuledTable`, `AdrRows`, `DocumentRuledList`, `LostSplit` |
| Lib, strings, styles | `src/lib/paths.ts` (`pathOf(pageId)`, an exhaustive switch, and the switch targets), `src/lib/site.ts` (path navigation, phones, location, SEO helpers, price group lookup), `src/lib/page-links.ts`, `src/lib/notice-list.ts` (days and recent notices), `src/lib/options.ts`; `src/i18n/cs.ts`; `src/styles/fonts.css` (Manrope 400/700/800, latin + latin-ext with `unicode-range`), `global.css`, `print.css` |
| QA | `qa/templates.ts` (D → `dve-cesty`, port 4417; 4414 retired); `qa/structure.spec.ts`: new check "path switch: never on notice pages; exactly one current path elsewhere (D)", run only on templates whose home has `[data-path-switch]` |
| Removed | `templates/plny-prehled/` and the old `clients/hnatek-d`; registrations in `tools/client/new.ts`, `tools/client/tests/client.test.ts`, `tools/cms/tests/pages-config.test.ts` (D on its own line), `package-lock.json` |
| Docs | `docs/design-differentiation.md` (§3b and the D column), `docs/designs/README.md` (H superseded, D3 added), `docs/designs/dve-cesty/README.md` status, `.claude/skills/site-build/SKILL.md` (when to choose D, slots, sections), superseded lines on `docs/notes/s7-plny-prehled.md` and `docs/designs/plny-prehled/README.md` |

**Routes (fixture, every optional type on): 24 pages.** `/`, `/jak-postupovat/`, `/kontakt/`, `/sluzby/` + 7 service pages, `/rakve/`, `/kvetiny/`, `/o-nas/`, `/cenik/`, `/pro-ucastniky/`, `/pohreb-predem/`, `/pravni-informace/`, `/ochrana-osobnich-udaju/`, `/oznameni/` + 3 notices, `/404.html`.

**Inventory changes against §9:** the picker is `PlacePickerLinks` (planned as `PlaceRows`), also used for the home `next-steps` section; `ProseSections` (a body split at `##`, heading 4/12 and text 8/12 at 1280, by CSS grid on the prose) and `NoticeDates` (the life dates, shared by the three notice components) were added.

### Decisions taken while building

- **The stone nonstop line follows the H1 on phones.** The boards put it last in every S předstihem opening. With a long service title (fixture: "Vyřízení všech formalit …") and its summary, it fell below the first screen at 375 (QA test 1). Below 64 rem the panel is now a flex column (label, H1, Ceník's VAT note, the line, then the lead); at 1280 it stays last, as drawn. Ceník already did this (§5).
- **Notice header at 375:** the reduced nav keeps **Kontakt** visible beside "Menu" (as the board), and Oznámení a obřady and Úvodní stránka sit behind the Menu. Hiding all three left notice pages without a visible navigation landmark (QA test 3).
- **The number's width at 320:** `min(50 / 34 px, 9.75vw)`. At 10.5vw "+420 000 000 199" overflowed the 404 halves and the transport block by 8 px. The transport block on Převoz zesnulých now bleeds to the edges instead of sitting inside a padded section.
- **The home row Kancelář · Oznámení a obřady · O nás** is three columns only when exactly these three follow the hero (a `data-home-row` mark on the hero); any other order or set renders one plain column per section. A scoped `main { display: block }` in the layout had silently disabled the grid; it was removed.
- **Stone half rows:** a price or a short note sits at the right; a long note (a service summary) wraps within 45 % of the row (`fit-content(45%)`) and never squeezes the link. Found on the option variant, where the right column took the summary's full width.
- **Placeholder marks never carry layout.** Core's `PlaceholderMark` renders no wrapper when inactive, so every styled block (panel lead, product rows, notice main, list lead, service rows) has its own element around the mark. Found on `hnatek-d`, whose content is real: the lead had jumped above the H1 on phones.
- **Phone links are never flex** (S6 lesson): label, number and note are spans with explicit `{" "}`; every stand-alone link is `inline-block` with 0.625 rem block padding (≥ 44 px).

### Contrast (computed, WCAG 2.x, `noc-a-kamen`)

| Pair | Ratio | Use |
| --- | --- | --- |
| navy `#1C2940` on white | 14.58 | body, headings, links, rules, focus ring (3 px) |
| navy on stone `#ECE7DF` | 11.84 | text and links in stone fields |
| navy on paper `#F4F1EC` | 12.94 | legal row, publisher line |
| white on navy | 14.58 | text, number and focus ring (3 px white) in navy fields |
| mist `#C9D2E3` on navy | 9.59 | path label, nonstop label, availability |
| stone text `#4F4A42` on stone | 7.14 | path label and notes on stone |
| slate `#3E4757` on white / paper / stone | 9.36 / 8.31 / 7.60 | secondary text |
| slate light `#5B6478` on white | 5.93 | notes (break times) |
| hover `#3A4B6B` on white | 8.75 | link hover |
| navy rule on navy 2.10, stone rule on stone 1.72, hairline on white 1.53, stone on white 1.23 | decorative | never the only boundary of a control; the path is also named in text and in the switch |

### Budgets

Fixture build, gzip: HTML at most 8.3 KB per page (`/jak-postupovat/`), one CSS file 3.9 KB, so HTML + CSS ≤ 12.2 KB per page (limit 100 KB). JS: two inline scripts (no-js switch and the Menu), about 1.5 KB raw (limit 10 KB). No image in any opening; the LCP element is the H1 or the number (text). Fonts: Manrope 800 latin (13.6 KB) and latin-ext preloaded, 400 and 700 on demand; no third-party requests.

### Speed

**Lighthouse, mobile (default emulation), Playwright's Chromium 1248, fixture build in prototype mode** (`astro preview`):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 96 | 66 | 0.8 s | 0 | 10 ms | 80 KiB |
| `/jak-postupovat/` | 100 | 100 | 96 | 66 | 0.8 s | 0 | 0 ms | 81 KiB |
| `/cenik/` | 98 | 100 | 96 | 66 | 0.9 s | 0 | 170 ms | 80 KiB |
| `/oznameni/` | 100 | 100 | 96 | 66 | 0.9 s | 0.0003 | 0 ms | 79 KiB |

Best practices 96: the fixture has no `public/favicon.ico` (404 in the console). SEO 66: the only failing audit is `is-crawlable` (prototype builds are `noindex`, `robots.txt` disallows all). Both by design, as for C and E. Ceník's 170 ms TBT was one run on a loaded machine (other sessions were building).

### Distinctiveness scorecard (design-differentiation §7)

Scored 0–3 from the built pages, the DOM outlines recorded by QA (`docs/qa/structure.json`) and the greyscale screenshots (`docs/notes/screens/dve-cesty/greyscale/`: home at 375 and 1280 for A–E and `sheet-1280.png`). Measured home order differences (sections only): A/D 4 positions, B/D 4, C/D 5, D/E 4.

| Dimension | D vs A (Rodinná tradice) | D vs B (Důstojná jednoduchost) | D vs C (Noční linka) | D vs E (Tichá krajina) | Evidence |
| --- | --- | --- | --- | --- | --- |
| Composition | 3 | 3 | 2 | 3 | D: an H1 question over two equal full-bleed fields (navy · stone), then one short row of three columns; every other page opens in its path's colour. A: letterhead and image hero, long prose; B: CTA tier and tinted bands of cards; E: text grid broken by bands. C also puts the number in a large dark field, but the whole site sits on it; D's dark field is half the first screen and the rest is white. |
| Navigation | 3 | 2 | 3 | 2 | D: the centred two-option path switch (the only rounded shape), three general links, the path's pages in the opening ("V této cestě"), a Menu grouped by path. B and E also show a logo-left, links-right top row; B adds a CTA button, a sticky header and a bottom bar, E a second nav line; neither has a switch. A: centred letterhead; C: side rail. |
| Typography | 3 | 2 | 2 | 3 | D: one geometric sans (Manrope 800 headings, 400 text). A and E are serif-led; B (Public Sans) and C (Schibsted Grotesk) are sans too, so 2. |
| Image usage | 3 | 2 | 2 | 3 | D: no image in any opening; people, catalogues and notices only. A: large photo beside the hero; E: full-bleed landscapes. B (minimal, optional hero image) and C (none on home) are close in amount, so 2. |
| Content hierarchy | 2 | 2 | 2 | 3 | D: the visitor's situation first, number and prices side by side, then the office. A ends with a story and an office too; B and C lead with first steps and the number as well (B in a CTA tier, C on the rail). E leads with a text opening and narrative. |
| **Total** | **14 / 15** | **11 / 15** | **11 / 15** | **14 / 15** | all pass (≥ 11, no dimension < 2) |

The closest pairs are D / B and D / C, as §10 expected. D / B: both are sans, practical and ruled on light grounds; they separate on structure (switch and split hero vs CTA tier, sticky header and bottom bar; path-coloured openings vs tinted bands of cards). D / C: both put the number in a dark navy field; in C the dark field is the whole site, in D it is one half of the first screen and the Teď hned openings. All five stay conservative: no ornament, motion or icons.

### Verification

| Step | Result |
| --- | --- |
| `npm test` | 16 files, 301 tests passed (incl. `core/tests/collections.test.ts`; D in the client and CMS template lists) |
| `npm run lint` | clean |
| `npm run typecheck` | 0 errors |
| `npm run check -w templates/dve-cesty` | 0 errors, 0 warnings, 0 hints |
| `npm run build -w templates/dve-cesty` | 24 pages (fixture, prototype) |
| `npm run build:production -w templates/dve-cesty` | fails with exactly the fixture's rules, 79 errors: G-011 (3), G-012, G-020, G-021, G-031 (50), G-032 (12), G-040 (7), G-073, G-074 (3); G-071 the expected warning. E's 82 are these plus its three placeholder landscapes. |
| `npm run qa` (A–E + structure; `--workers=4 --timeout=240000`, outside the sandbox) | first run 1480 / 1487: seven D failures (no visible nav landmark on the four notice pages at 375; the stone nonstop line below the first screen on "Vyřízení všech formalit" at 375; the number overflowing by 8 px at 320 on the 404 and Převoz zesnulých), fixed as above. **Final full run: 1487 / 1487 passed** (5.0 min). axe serious/critical: 0. |
| option variant (`high`; sections `hero`, `notices`, `next-steps`, `services`, `price-summary`, `people`, `catalogue-links`, `documents`, `faq`, `family-story`, `contact-summary`) | 24 pages; at 320, 375 and 1280: no horizontal scroll, the band and the first nonstop link at 216 px (phones) / 143 px (1280) on S předstihem pages, home sections in the configured order as one plain column each. Found and fixed: the stone half's long notes squeezing the links. |

**QA change (shared, approved §13):** one new structure check; it skips templates without `[data-path-switch]`, so A, B, C and E are unaffected. D's pairs run through `templatePairs()` as before.

### Prototype client and export

`clients/hnatek-d`: deleted and recreated as a copy of `clients/hnatek` (content, ledger and approvals unchanged; `clients/hnatek`, `-b`, `-c`, `-e` not touched), on `dve-cesty` with every optional type off, sections `hero`, `contact-summary`, `family-story` (the default without `notices`), `noc-a-kamen`, `manrope`, `emergencyEmphasis: "high"`, and a dated entry in `notes/feedback.md`.

- `client:validate -- hnatek-d`: **PROTOTYPE: PASS** (production blocked by G-012, G-020, G-021, G-031, G-040, as for `hnatek`).
- `client:build -- hnatek-d`: 18 pages.
- `client:export -- hnatek-d --out ~/Documents/hnatek-d-web --force`: **RESULT: PASS (10/10 steps)**; it replaced the old D export there.
- Seen on the build: the logo (green and gold) sits well beside the navy switch; real service summaries are long, so the stone half's notes wrap (fixed, see above). `o-nas.md` keeps its `heroImage`, which D does not show (no `about.story` slot), as for E.

### What from the boards is not implemented, and why

| Board detail | Built instead | Why |
| --- | --- | --- |
| "Nonstop +420 …" on the stone line and the band | label + number visible | WCAG 2.5.3 against core's accessible name (approved §7) |
| The stone nonstop line last in the opening at 375 | after the H1 (and Ceník's VAT note) below 64 rem; last at 1280 | keeps the number in the first screen with long titles (QA test 1) |
| Notice header at 375 with Kontakt only | Kontakt plus a Menu with the other two links | every page needs a visible navigation landmark and the menu toggle at mobile width (QA tests 3 and 7) |
| 15–17 px labels, footer and dates | 18 px | the 18 px minimum (§5) |
| Nav order with Ceník first in S předstihem | core's order inside each path group | core fixes nav order (approved §2) |
| A Lidé page; a separate FAQ page | people at `/kontakt/#lide`; FAQ at `/sluzby/#caste-otazky` | no core route (approved §11) |
| "Vytisknout ceník" / "Vytisknout oznámení" | Ctrl/Cmd + P hint | approved for C, D, E (no JS beyond the menu) |

### Open legal questions (⚖, research §4a)

1. **L1, neutral form:** the grey "Oznámení zveřejňuje <brand>." line with "Telefon nonstop …", the reduced header and the neutral footer on `/oznameni/` and notice pages.
2. **L1, home:** the navy half (a death) sits beside the stone half with prices. The halves are about the visitor's situation, not a notice, and the optional `notices` section is a count with a link, never names; worth confirming that this is not advertising "v souvislosti s informováním o smrti".
3. **L1 + accessibility:** as for C and E, core's fixed accessible name of the nonstop link still says "převoz" on notice pages and does not contain the visible "Telefon nonstop …" (WCAG 2.5.3).
4. **L9:** the VAT note sits under the Ceník H1 (bold), under the items table, in the home stone half, on service pages and on the A4 sheet; confirm that this is "near the prices".

### Screenshots (local only: `docs/notes/screens/` is gitignored)

`docs/notes/screens/dve-cesty/greyscale/`: home at 375 and 1280 for A–E and a contact sheet. QA's own screenshots are in `docs/qa/screens/dve-cesty/`. Working screenshots (fixture pages, the option variant, `hnatek-d`) are in the session scratchpad only.
