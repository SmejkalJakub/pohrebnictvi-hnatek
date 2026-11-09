# Editable fields policy

**Status:** Phase 1 contract, draft 1 (2026-11-05).

This document says who may change what, and through which interface. It is the source for the generated Pages CMS configuration (`.pages.yml`) in Phase 6.

Related: [content-contract.md](content-contract.md) · [template-contract.md](template-contract.md)

---

## 1. Actors and interfaces

| Actor | When | Interface | Scope |
| --- | --- | --- | --- |
| **Template developer** | template build and maintenance | system repo source | everything in `core/` and `templates/` |
| **Production agent** (AI session, supervised by an operator) | before handover | client content files, `site.config.ts`, `provenance/` | content and declared template options; **never facts without provenance** |
| **Operator** (human running the pipeline) | before handover | same as the agent, plus sign-off records | records client approvals; sets ledger `VERIFIED` |
| **Client editor** (non-technical) | after handover (and in the Phase 6 pilot) | Pages CMS web UI | the CMS-editable fields in §4 only |
| **Repository owner** (client or their developer) | after handover | Git source | everything. This is outside the CMS contract and is stated in HANDOVER.md. |

**Design and layout are never CMS-editable.** Templates, CSS, tokens, typography, layout, page structure, routes, navigation structure, code, dependencies and deployment config are all outside the CMS, with no exceptions.

## 2. Policy levels

| Level | Meaning |
| --- | --- |
| **CMS** | Visible and editable in Pages CMS, with the widget and validation listed. |
| **CMS (toggle)** | Editable only as a boolean or select from fixed options. |
| **Agent** | Set by the agent/operator before handover; not shown in the CMS. Changeable later only through source. |
| **Locked** | Set by the template or core; never changed per client except through a template release. |
| **Hidden** | Declared in `.pages.yml` with `hidden: true`: preserved, validated and defaulted, but not displayed (e.g., `placeholder`, `id`). Keys **not declared** are stripped on save unless `settings.content.merge: true`, and merge does not protect keys inside list items, so every list-item key must be declared (S2 amendment A7). |

## 3. Production agent rules (before handover)

The agent **may**:

- populate content fields from ledger facts, copying values exactly. A value that is not in the ledger is not written.
- draft Czech copy (page bodies, service descriptions, guidance) based on ledger facts. Each drafted file is recorded as `DRAFT` in `approvals.json`.
- create placeholder entries (`placeholder: true`), neutral placeholder images (`source: "placeholder"`) and demo prices (`status: "demo"`) for prototype review.
- choose template options and homepage section order within the manifest's declared values.
- set feature flags: `articles` stays `false` for Hnátek; `contactForm` stays `false` until U9 is resolved.
- set `pricing.visible` to `false` if no prices are approved.

The agent **must not**:

- invent or "complete" a fact: names, dates, years, IČO, addresses, coordinates, prices, testimonials, quotations, service offerings, service area.
- set ledger status `VERIFIED`, or record any approval. Only the operator can, and only on the client's explicit confirmation, recorded with name, date and method.
- set `PriceItem.status = "approved"` or `ImageRef.rightsConfirmed = true` without recorded evidence in `approvals.json`.
- set `ImageRef.depicts = "actual-business"` for anything not supplied by the client or copied from the client's own site with permission.
- generate imagery that depicts, or could be read as, the real premises, staff, family members or the Cadillac.
- edit template source, tokens or CSS for a single client (template-contract §8).
- turn `SITE_MODE` to `production` on any deployment before `npm run check:launch` passes.

## 4. Field matrix

Legend for the CMS widget: `string` single line · `text` multi-line plain · `rich-text` restricted Markdown · `number` · `boolean` · `select` · `date` · `image` · `list`. Pages CMS widget names are confirmed in the Phase 2 spike (S2).

### 4.1 Company (`site/company.json`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `brandName` | yes | **CMS** | string, 1–80 | changes appear site-wide |
| `legalName` | yes | **CMS** | string, 1–120 | |
| `legalIds.ico`, `dic`, `registryEntry`, `registeredOffice` | yes (from ledger only) | **CMS** | string with pattern | legally required text (U10) |
| `tradition.publicWording` | draft only | **CMS** | string, ≤ 120 | label: "Text o tradici firmy (bez vymýšlení letopočtů)" |
| `tradition.foundedYear` | from ledger only | **CMS** | number 1800–2100, optional | shown only as "od roku…" |
| `familyOwned` | from ledger | **CMS** | select: `yes` / `no` / `unknown` (a toggle cannot represent "not stated") | S2 amendment A4 |
| `logo` | yes | **CMS** | image + alt | §4.10 image rules |

### 4.2 Contact (`site/contact.json`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `locations[].name`, `address.*`, `accessNote` | yes | **CMS** | strings; PSČ pattern | |
| `locations[].geo` | from ledger only | **Agent** | – | coordinates affect maps and structured data; wrong values are hard to spot |
| `locations[].mapUrl` | yes | **CMS** | string, URL | |
| `locations[]` add/remove | yes | **Locked** in pilot | – | templates support one location (`multipleLocations: false`) |
| `phones[].label`, `phones[].number` | yes | **CMS** | string ≤ 60; phone pattern `+420…` | CMS help text shows the format |
| `phones[].department` | yes | **Hidden** | select (office, flowers, other) | hidden to prevent re-purposing; emergency is not an option anyway |
| `phones[]` add/remove | yes | **CMS** | list | at least one office phone (schema) |
| `emails[].label`, `address` | yes | **CMS** | string; e-mail | |

### 4.3 Office hours (`site/office-hours.json`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `label` | yes | **CMS** | string ≤ 60 | default "Kancelář" |
| `weekly[]` days, open, close, breaks | yes | **CMS** | list of objects: multi-select days, HH:MM strings | schema rejects 00:00–24:00 with a message pointing to the emergency section |
| `holidayNote`, `outsideHoursNote` | yes | **CMS** | text ≤ 200 | |
| `exceptions[]` | yes | **CMS** | list: dates, closed toggle, times, note | e.g. Christmas closures |

### 4.4 Emergency transport (`site/emergency.json`): kept separate from hours

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `phone` | from ledger | **CMS** | phone pattern | CMS help: "Číslo pro nonstop převoz zesnulých. Nejde o kancelář." |
| `shortNote` | draft | **CMS** | text ≤ 160 | |
| `serviceArea` | from ledger | **CMS** | text ≤ 160 | |
| `label` | yes | **Agent** | – | locked wording prevents "Nonstop" from drifting onto the office |
| `availability` | yes | **Locked** | – | `24/7` in the pilot |
| `enabled` | yes | **Agent** | – | turning the service off is a business change and needs a developer review of all pages |

In the CMS this file is a **separate menu entry** ("Nonstop převoz zesnulých"), not a section inside "Kontakt" or "Otevírací doba". Phase 6 action 2 tests this.

### 4.5 Pages (`pages/*.md`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `title`, `lead`, `excerpt` | draft | **CMS** | string/text with length limits | only fields in the template's `pageFields` are shown |
| body | draft | **CMS** | rich-text (restricted Markdown, content-contract §7.3) | build rejects H1, raw HTML, inline images, phone numbers |
| `navLabel` | yes | **CMS** | string ≤ 24 | labels only; nav order and membership are locked |
| `metaTitle`, `metaDescription` | yes | **CMS** | string ≤ 60 / ≤ 160 | |
| `heroImage`, `secondaryImage` | yes | **CMS** | image (§4.10) | only slots the template declares |
| `placeholder` | yes | **Hidden** | – | the client "clears" a placeholder by having the operator re-record approval. In the pilot the agent flips it after approval. |
| create / delete pages | – | **Locked** | – | page set fixed by the route contract. In the CMS every existing page is its own file entry ("Stránka: …") with create, delete and rename off, because a Pages CMS collection cannot show different fields per page |

### 4.6 Services (`services/*.md`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `title`, `summary`, body | draft | **CMS** | string ≤ 80, text ≤ 240, rich-text | |
| `category` | yes | **CMS** | select (fixed list) | |
| `order`, `featured`, `published` | yes | **CMS** | number, boolean, boolean | `published: false` hides without deleting |
| `image` | yes | **CMS** | image | shown only if the template manifest declares a `service.*` image slot (coffins `coffin.*`, flowers `flower.*` likewise) |
| `priceGroupId` | yes | **Agent** | – | links depend on the pricing structure |
| add / delete entries | yes | **CMS** | collection | new services are content, not new page *types*. In template B each one becomes a detail page using the same layout. |
| file name (slug) | yes | **Locked after launch** | – | renaming breaks URLs; needs a developer redirect |

### 4.7 Guidance (`guidance/*.md`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `title`, `summary`, body, `checklist[]` | draft | **CMS** | string, text, rich-text, list of strings | CMS warning text: "Odborný obsah – po změně nechte text zkontrolovat." |
| `phase`, `situations`, `order`, `contactPrompt` | yes | **CMS** | selects, number | |
| `review.reviewedBy`, `reviewedAt`, `sources[]` | operator only before handover | **CMS** | string, date, list | after handover the client owns accuracy and records their own review |
| add / delete | yes | **CMS** | collection | |

### 4.8 Coffins and flowers (`coffins/*.md`, `flowers/*.md`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| all descriptive fields, `order`, `published`, `image` | yes | **CMS** | per schema | |
| `type` (flowers) | yes | **CMS** | select | |
| add / delete | yes | **CMS** | collection | |
| `placeholder` | yes | **Hidden** | – | |

### 4.9 Pricing (`site/pricing.json`)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `visible` | yes | **CMS (toggle)** | boolean "Zobrazit ceník na webu" | off removes the route and nav item |
| `vatNote`, `validFrom`, `generalNote` | draft | **CMS** | text, date, text | required in production when visible |
| `groups[].title`, `description` | yes | **CMS** | string, text | |
| `items[].label`, `description`, `unit` | yes | **CMS** | string, text, string | |
| `items[].kind`, `amount`, `amountMax` | demo values only | **CMS** | select; number (whole CZK, 0–2 000 000); number | cross-field rules from content-contract §6.11 |
| `items[].status` | **only `demo`** | **CMS (toggle)** | select: "Ukázková – nezveřejňovat" / "Schválená skutečná cena" | the client approves their own prices; production build rejects any remaining demo item |
| add / delete items and groups | yes | **CMS** | lists | |
| `currency` | yes | **Locked** | – | CZK |

### 4.10 Images (`ImageRef`, everywhere)

| Field | Agent | Client CMS | Widget / validation | Notes |
| --- | --- | --- | --- | --- |
| `file` | yes | **CMS** | image upload into `src/assets/media/` | JPEG/PNG/WebP; ≤ 8 MB; resized at build |
| `alt` | yes | **CMS** | string ≤ 200, required unless decorative | help text with an example |
| `decorative`, `caption`, `credit` | yes | **CMS** | boolean, strings | |
| `source` | yes | **CMS** | select (client, existing-website, own-photo, licensed-stock, and `placeholder` labelled "Zástupný obrázek – nezveřejňovat"). It must be offered, because Pages CMS refuses to save a select value outside its list (S2 B5, A3); the production gate (G-032) still rejects it | |
| `depicts` | yes | **CMS** | select (actual-business, generic) | label: "Fotografie ukazuje skutečné prostory, vůz nebo lidi firmy" |
| `rightsConfirmed` | evidence required | **CMS (toggle)** | boolean "Mám právo tuto fotografii použít" | production fails if false |
| `focus` | yes | **CMS** | select | cropping hint |

### 4.11 Never in the CMS

`site.config.ts` (template, options, homepage order, features, `siteUrl`), `template.manifest.ts`, everything under `src/core/`, `src/layouts/`, `src/components/`, `src/pages/`, `src/styles/`, `astro.config.mjs`, `package*.json`, `.pages.yml` itself, deployment settings, `docs/provenance/`, the `articles/` collection (absent for Hnátek), and the `emergency.label`, `emergency.availability` and `emergency.enabled` fields.

## 5. CMS validation and failure handling

- **The CMS is a convenience; the build is the gate.** Pages CMS field constraints (`required`, `pattern`, selects) give early feedback. Zod and the publication gate are authoritative, and they run on every Git-triggered build.
- **No silent publication of invalid data:** a commit that fails validation produces a failed build, so nothing deploys and the previous version stays live. The host must be configured to e-mail the client and operator on failed deploys (Phase 6). The gate prints Czech messages with the file and field.
- **Where errors appear:** an invalid save caught by Pages CMS shows only a short toast. The Czech build messages are the real error channel (S2 amendment A8). Pages CMS validates per field only; cross-field rules (time order, price `kind`/`amount`, duplicate ids) exist only at build time.
- **Branches and publishing (S2 amendment A5, to be built in S5 and tested in Phase 6):** Pages CMS has no merge, PR or preview feature.
  - The client repo's default branch is `content`, which the CMS edits and the host previews (`noindex`). Production deploys from `main`.
  - A CMS Action, "Zveřejnit změny", dispatches a `publish.yml` workflow. It builds with `SITE_MODE=production` and the gate, and only on success fast-forwards `main`.
  - A second Action, "Zahodit nepublikované změny", resets `content` to `main`.
- **Recovery:** Pages CMS history is read-only, with no revert (S2 B1). A broken edit is either fixed forward in the CMS, or reverted in GitHub ("Revert") or by redeploying the previous version at the host.
- **Dates:** Pages CMS pre-fills an empty `date` field with today's date (S2 B4). Every date field in the generated config must declare `default: ""`; otherwise an unreviewed guidance entry would silently gain a review date.
- **Generated, not hand-written:** `.pages.yml` is generated by `tools/cms` from this policy, the template manifest (`pageFields`, `imageSlots`) and features. A collection is generated only when its feature is on, so Hnátek has no articles editor.

## 6. Phase 6 test mapping

| Phase 6 action | Fields involved | Expected guard |
| --- | --- | --- |
| 1. Edit a sample price | `pricing.items[].amount` | preview build shows the new value, still marked "UKÁZKA" |
| 2. Change office hours, keep nonstop separate | `office-hours.weekly[]` | emergency is a separate CMS entry; 00:00–24:00 rejected with a pointer to the emergency section |
| 3. Update a service description | `services/*.md` summary/body | restricted Markdown rules |
| 4. Replace an approved image | `ImageRef.file`, `alt`, `rightsConfirmed` | alt required; rights toggle required for production |
| 5. Try to change layout or colours | – | no such fields exist in the CMS |
| 6. Recover from malformed content | any | the production build in `publish.yml` fails, so `main` is not updated; fix forward in the CMS, or revert in GitHub (Pages CMS history cannot revert) |
