---
name: site-build
description: Turn a client's provenance ledger and research notes into content files, choose the template and its options, place client media in image slots, and iterate until client:validate passes in prototype mode. Use when the user runs /site-build <id> or asks to build a client's prototype site.
argument-hint: <client-id>
---

# /site-build <id>

Arguments: `$ARGUMENTS` (client id). Works in `clients/<id>/`. Run npm scripts with Node from `.nvmrc`.

Read first: `clients/<id>/provenance/facts.json`, `clients/<id>/notes/research.md`, `docs/content-contract.md` §6–§7, `docs/editable-fields.md` §3, and the chosen template's `templates/<template>/template.manifest.ts`.

## Hard rules

- A fact goes into content only if the ledger has it, and then **exactly** as the ledger value (the launch check compares them, L-004). No invented names, years, IČO, addresses, coordinates, prices, testimonials, quotations, services or service area.
- A ledger fact that is `UNKNOWN`: leave the content field `null` where the schema allows it (IČO, DIČ, register entry, registered office, `foundedYear`, `holidayNote`, `serviceArea`, `geo`, `mapUrl`). Where the schema requires a value (`brandName`, `legalName`, an office phone, the emergency phone, an address), keep the neutral stand-in from the skeleton (`Vzor`, `+420000000xxx`, `*.invalid`, `000 00`) so it is obviously fake, and list it in your report.
- Copy is plain professional Czech: no superlatives ("nejlepší"), no sentiment, no invented anecdotes. Copy you draft from ledger facts and research gets `placeholder: false` and stays `DRAFT` in `provenance/approvals.json`. Copy you cannot ground in research keeps `placeholder: true` and the neutral stand-in text.
- Prices: write only `"status": "demo"`, even for prices copied from the old website. With no prices at all, set `pricing.visible: false`.
- Guidance (`guidance/*.md`): drafted from general knowledge, `review.reviewedBy/reviewedAt: null`, list your sources in `review.sources`. Never fill in a review.
- Images: never generate or use realistic imagery. Real photos only from the client's website or the client, with `source: "existing-website"` or `"client"`, `depicts: "actual-business"` only for their own premises, staff, vehicles or products, `rightsConfirmed: false`.
- Never edit `templates/`, `core/` or any CSS for a client. Options and section order are the only design levers.
- No phone numbers in Markdown bodies (G-030), no raw HTML or inline images (G-034).
- Optional content types (notices, people, FAQ, documents, guest and pre-planning pages, legal information; `docs/content-contract.md` §6.13–§6.17): switch one on only when the template's manifest `supports` it (G-005) **and** the client has that content. Never invent a person, a notice, a document or a legal text.

## 1. Content from the ledger

- `src/content/site/company.json`, `contact.json`, `office-hours.json`, `emergency.json`: replace the skeleton values with ledger values. Rename list `id`s to the ledger ids (e.g. `vzorov` → `vyskov`) and update every reference to them (`phones[].locationId`, `office-hours.json` `locationId`; G-004).
- `familyOwned` is stored as `"yes"`, `"no"` or `"unknown"`.
- `services/*.md`: one file per service the research found (ASCII slug file names, G-001). Delete skeleton services the client does not offer. Set `featured` for the 3–4 most important.
- `coffins/`, `flowers/`: real entries only if the old site has a catalogue; otherwise keep the placeholder entries (prototype) and say so.
- `pages/*.md`: every page file must stay (G-002). Rewrite `title`, `navLabel`, `metaDescription`, `lead`, `excerpt` and the body per page. Render only the fields the template lists in `pageFields`.
- `provenance/approvals.json`: keep one `copy` entry per page and entry file (rename keys when you rename files), all `DRAFT`; one `guidance` entry per guidance file.

### Optional content types (only with template support; see `features` in `site.config.ts`)

`client:new` copies their skeleton files only when the template supports them, and every feature starts `false`.

- **Notices** (`features.notices`, `notices/*.md`, `pages/oznameni.md`): real notices come from the client, after launch, through the CMS. For the prototype keep the skeleton's placeholder notices (obviously fictional names, `placeholder: true`, each with a fictional `consent` record so G-070 passes). Never copy a real notice from the old website or any other source: relatives on a parte are personal data and need the orderer's consent. Keep `noindex: true`. No links to services, prices or other sites in a notice body (G-072).
- **People** (`features.people`, `people/*.md`): only people named in the ledger (`people.<id>.name/role/phone`, normally `EXISTING_WEBSITE` from the old site's team page). Photos only from the client or their site (`depicts: "actual-business"`). Add a `people["people/<id>.md"]` entry to `approvals.json` with `consentAt`, `recordedBy`, `method` all `null`: only the operator records consent (G-074 warns in prototype, fails production).
- **FAQ** (`features.faq`, `faq/*.md`): draft answers from general knowledge like guidance (96-hour rule, urn after 12 months, research §4a L4/L6), `placeholder: false` when grounded, `DRAFT` copy entries; list the open legal points in your report.
- **Documents** (`features.documents`, `documents/*.md`, PDFs in `src/assets/documents/`): only the client's own PDFs (řád pohřební služby, obchodní podmínky, reklamační řád). Until they arrive, keep the skeleton's "ZÁSTUPNÝ DOKUMENT" PDFs with `placeholder: true`, or switch the feature off.
- **Legal information** (`site/legal.json`, `pages/pravni-informace.md`; only for templates with `pageFields["pravni-informace"]`): keep the ADR default (Česká obchodní inspekce, `https://adr.coi.cz`); `complaintsContact` only from the client or their terms. Ledger keys `legal.adr.name`, `legal.adr.url`, `legal.complaintsContact`.
- **Guest and pre-planning pages** (`features.guestInfo` → `pages/pro-ucastniky.md`, `features.prePlanning` → `pages/pohreb-predem.md`): plain pages; pre-planning only if the client offers it, and never with a sign-up or e-mail capture.
- **Landscape photos** (`features.landscapes`, `site/landscapes.json`; only template E `ticha-krajina`): the full-bleed bands between sections. Only the client's own or commissioned photos of their region (landscapes or buildings), never stock, never photos found online, never generated images; **no people, sunsets, clouds or flowers**. Until the client delivers them, keep the skeleton's three neutral placeholders (`source`/`depicts` `placeholder`, G-032 marks them in prototype and fails production) or an empty list `{ "images": [] }` (bands become space). Each entry: `image` (an `ImageRef`, landscape format, ideally ≥ 2560 px wide; set `focus` so the phone crop 25:16 keeps the subject) and `place` (where it was taken). Keep the file whenever the feature is on (G-077). Brief for the client's photographer: 4–8 photos, landscape format, local fields, woods, hills, the village, the chapel or ceremony hall, the office building; no people, no sunsets, no dramatic skies, no flowers; early or overcast light. In `approvals.json` each photo needs `images["src/assets/media/<file>"].rightsEvidence` before launch (L-008).
- **Places** (`features.places`, `site/places.json`; only template G `lide-a-misto`): the firm's own places (office, ceremony hall, hearse, flower workshop, a cemetery it tends), each with `name` (≤ 80), optional `address` (free text, ≤ 120; not a tracked fact, the office address stays in `contact.json`), optional `note` (one sentence, ≤ 160) and optional `image`. Only the client's own or commissioned photos of those places (`source` `client-provided` or `commissioned`; `licensed-stock` and `depicts: generic` are rejected by the schema), no mourners and no deceased. A place without a photo is fine: the template shows it as a numbered text row, never an empty frame. Keep the file whenever the feature is on (G-080); `{ "places": [] }` is valid. Rights per photo in `approvals.json` as for any image (L-008).
- **Price inclusions** (`pricing.json` → `groups[].includes` / `excludes`): only items the research found; rendered only by templates with `supports.priceInclusions`.
- `pinnedBuildDate` never goes into a client's `site.config.ts` (G-073 fails production).

## 2. Template and options

Edit `src/site.config.ts`. Only values the manifest declares are allowed (G-005).

- Template: `rodinna-tradice` for a traditional, family, letterhead tone (serif, long-form, typographic hero); `dustojna-jednoduchost` for a practical, sober tone (sans-serif, phased checklist, mobile bottom bar, service detail pages). Changing template = change `template`, then reset `options` and `homepage.sections` to that manifest's values.
- `nocni-linka` (C, Noční linka) for a client whose first job is the night call and who wants a quiet, very sparse site: dark ground, one large sans (Schibsted or Hanken Grotesk), a sticky side rail with the nonstop number on desktop, one statement per section, no photos on home. It is the only template that **supports every optional content type** (notices with a neutral notice chrome, people on Kontakt, FAQ on Jak postupovat, documents in the footer and on Právní informace, guest and pre-planning pages, price inclusions); switch each on only when the client has the content. Its image slots: `company.logo` (must be the **light/white** logo variant; leave it null and the brand name is set as text when the client has none), `about.story` 4:3 (the only photo outside lists), `coffin.item` 4:3, `flower.item` 1:1, `person.photo` 4:5, `notice.photo` 4:5, `notice.parte` (natural aspect). Options: `palette` `noc` (green-black, amber number; sits next to green + gold logos) or `grafit` (neutral graphite, apricot number); `fontPair` `schibsted-grotesk` or `hanken-grotesk`; `heroVariant` only `statement`. Rail navigation labels come from `navLabel`: situation-led labels read best here ("Když někdo zemřel" for jak-postupovat, "Lidé a kancelář" for kontakt).
- `plny-prehled` (D, Plný přehled) for a client whose families compare and want facts at a glance, and who has **real prices, documents and people** to show: a light, dense directory (Overpass + Overpass Mono), the whole navigation in one row, a highlighted nonstop box in the header, tables everywhere, thumbnails only. It **supports every optional content type**; its home page has no hero and no story: sections `next-steps` (always first; its heading is the h1), `price-summary`, `services`, `catalogue-links`, and `people`, `notices`, `documents`, `faq`, which need their feature on (G-005), so add each only after switching the feature on. Image slots: `company.logo` (the normal dark logo), `coffin.item` 4:3, `flower.item` 1:1, `person.photo` 4:5 (small thumbnails), `notice.photo` 4:5, `notice.parte`. Options: `palette` `seda-a-terakota` (default; terracotta box) or `bila-a-zluta` (yellow box: stronger timetable look, but yellow on the urgent line may read as a warning, so only when the client wants it); `fontPair` `overpass` or `red-hat`; no `heroVariant`. Home shows no `title` or `lead`; set `metaTitle`.
- `ticha-krajina` (E, Tichá krajina) for a firm in a **rural region** that wants the site to feel calm and spacious, not like a shop, and that can commission (or already has) a few **photos of its own landscape**: a light 12-column long read in Spectral (or Gelasio) with Figtree labels, the nonstop number as a ruled "stamp line" after the opening and again in the footer, full-bleed landscape bands between sections (never in the first screen; without photos the page still reads as complete). It **supports every optional content type** and the **landscape set** (`features.landscapes`, see above); Služby is one long page with anchors (no detail pages). Sections: `hero` first and `contact-summary` required; default `hero`, `next-steps`, `services`, `family-story`, `people`, `contact-summary`; also `catalogue-links` and `notices` (a link with a count). Image slots: `company.logo` (the normal dark logo), `landscape.band` 32:11 (the landscape set), `contact.building` 32:11 (`pages/kontakt.md` `secondaryImage`: the office building, no people), `person.photo` 3:4, `coffin.item` 4:3, `flower.item` 1:1, `notice.photo` 3:4, `notice.parte`. No `home.hero` and no `about.story`. Options: `palette` `mlha` (mist and spruce-blue; sits next to green + gold logos) or `len` (linen and olive-brown); `fontPair` `spectral-figtree` or `gelasio-figtree`; no `heroVariant`; `emergencyEmphasis` `high` moves the first stamp line above the H1.
- `lide-a-misto` (G, Lidé a místo) for a firm that wants to be known through **its real people and places** and has (or will commission) photos of them: a documentary photo essay on an off-white ground with one deep green, Archivo bold headings, 3 px ink rules over blocks, and every photo a **numbered figure** ("01 Name. One sentence." with an optional address line) that degrades to a numbered list or table without photos. The nonstop number is a large green link under a 3 px rule in the hero column and in every page opening, plus a footer column. It **supports every optional content type** and the **places set** (`features.places`, see above); Služby is one long page with anchors (no detail pages); Lidé is the `#lide` section of O nás (nav item "Lidé"). Sections: `hero` first and `contact-summary` required; default `hero`, `family-story` (the places, or the O nás excerpt while places are off), `next-steps`, `people`, `price-summary`, `contact-summary`, `notices`; also `services` and `catalogue-links`. Image slots: `company.logo`, `home.people` 5:4 (`pages/home.md` `heroImage`: the owners or the team, in the first screen, ≤ 200 KB after optimisation), `about.people` 2:1 (`pages/o-nas.md` `heroImage`), `contact.office` 3:2 (`pages/kontakt.md` `secondaryImage`), `guest.hall` 3:2 (`pages/pro-ucastniky.md` `heroImage`), `place.photo` 3:2, `service.photo` 3:2, `person.photo` 3:4, `coffin.item` 4:3, `flower.item` 1:1, `notice.photo` 4:5, `notice.parte`. Options: `emergencyEmphasis` only (`high` adds a green strip under the header on every non-notice page); one palette, one font.
- `palette`: pick the accent closest to the logo's main colour (see `docs/design-differentiation.md` §8: green logo → `ivory-forest` or `slate-forest`). Logo colours with low contrast stay inside the logo; never ask for new colours.
- `fontPair`: serif-led brand → the template's serif pairing; geometric or plain logo → the sans pairing.
- `heroVariant`: the image variant only when a suitable real photo exists.
- `emergencyEmphasis`: `high` when the nonstop line is the client's main call to action.
- `homepage.sections`: within `homepageSections.available`, following that manifest's `constraints` (A, B, C, E and G: `hero` first, `contact-summary` required; D: `next-steps` first). The sections `people`, `notices`, `documents` and `faq` need their feature on (G-005); `price-summary` shows nothing while pricing is hidden.
- `siteUrl` stays `https://example.invalid` until the domain is confirmed.

## 3. Media

- Download the logo and chosen photos listed in `notes/research.md` into `src/assets/media/` (ASCII file names, jpg/png/webp/svg).
- Logo: `company.logo` = `{ "file": "logo.svg", "alt": "<brandName>", "source": "existing-website", "depicts": "actual-business" }`.
- Place photos only in slots the template's `imageSlots` declares (`home.hero` → `pages/home.md` `heroImage`, `about.story` → `pages/o-nas.md` `heroImage`, `coffin.item`, `flower.item`, `service.inline` for A, `person.photo` and `notice.photo` for C, D and E, `contact.building` → `pages/kontakt.md` `secondaryImage` for E). D and E have neither `home.hero` nor `about.story`. Match the slot aspect where possible and set `focus`. C has no `home.hero`: leave `pages/home.md` without `heroImage`.
- Remove placeholder images you replaced; delete unused `placeholder-*.png` files only when nothing references them (G-003).

## 4. Iterate

Repeat until clean:

1. `npm run client:validate -- <id>`: must end with `PROTOTYPE: PASS`. Fix every error it prints (file and field are given).
2. `npm run client:build -- <id>`: the template must render all pages.
3. Optionally `npm run client:dev -- <id>` and look at `/`, `/kontakt/`, `/sluzby/`, `/cenik/` at mobile and desktop widths.

## 5. Report

Tell the user:

- template and options chosen, and why (one line each);
- the production blockers from `client:validate` (the "Production mode: blocked by …" list) with what resolves each: G-011 legal ids from the client, G-012 domain, G-020/G-021 approved prices or `visible: false`, G-031 placeholder copy, G-032 placeholder images, G-033 image rights, G-040 guidance review, G-070 a notice without consent, G-074 staff consent, G-075 a missing PDF;
- which optional content types are on, and what is still placeholder in them;
- the stand-in values still in content (from the hard rules above);
- the open questions for the client;
- next step: `npm run client:dev -- <id>` to review, then `/site-revise <id>` with the feedback.
