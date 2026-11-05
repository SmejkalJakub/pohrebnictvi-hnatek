# Spike S2: Pages CMS

**Status:** research only, 2026-11-05. Nothing was run against a live Pages CMS and no Pages CMS code was downloaded or executed. All behaviour below comes from reading docs and source. Anything marked **[manual]** needs the hands-on checks in [pages-cms-manual-checks.md](pages-cms-manual-checks.md).

**Sources read**

- Docs: <https://pagescms.org/docs/> and sub-pages `configuration/{content,media,actions,settings,collaborators}/`, `configuration/content/{fields,filename,operations,view}/`, `configuration/fields/<type>/`, `development/{authentication,caching}/`, `guides/installing/github-app/`, `guides/upgrading-to-2/`, `quick-start/`. The docs carry no version number.
- Source: <https://github.com/pagescms/pagescms> at tag **2.1.8**, commit `6f4e860a35d934406580287e7042e5e111e207a1` (2026-06-08). Raw base: `https://raw.githubusercontent.com/pagescms/pagescms/6f4e860a35d934406580287e7042e5e111e207a1/<path>`. File paths below are relative to that commit. The fetch tool gave no line numbers, so citations name the function.
- **No machine-readable schema for `.pages.yml` is published** (no `*.schema.json` in the tree, no link in the docs). The authoritative schema is Zod code in `lib/config-schema.ts`. The draft `pages-cms.example.yml` was therefore checked by reading that code (§8), not by a validator.
- Our own check: `fixtures/neutral` content was passed through a re-implementation of Pages CMS `sanitizeObject` and then through `core/content/schemas.ts` (script kept outside the repo). See §2.

## Blocking and near-blocking findings (read first)

| # | Finding | Effect | Mitigation |
| --- | --- | --- | --- |
| B1 | **No revert in the UI.** History is a read-only list of the last commits linking to GitHub (`components/entry/entry-history.tsx`, `entries/[path]/history/route.ts`). | Phase 6 action 6 "revert via history" is not possible in Pages CMS itself. | Fix-forward in the CMS, or a custom Action backed by a GitHub workflow (§6, A5). |
| B2 | **No merge/PR feature and no preview.** Branch UI can switch and create branches only (`components/repo/repo-branches.tsx`, `branches/route.ts`). The editor lands on the repo's default branch (`app/(main)/[owner]/[repo]/page.tsx`). | editable-fields §5 "Pages CMS writes to a preview branch, production deploys from `main`" needs extra machinery. | Make a `content` branch the repo default; promote to `main` through a workflow dispatched by a CMS Action (A5). |
| B3 | **Saves rewrite the whole file and delete empty values.** `sanitizeObject` removes `null`, `""`, `[]`, `{}` on every content save (`lib/schema.ts`, files route POST `case "content"`). Keys not declared in `fields` are dropped unless `settings.content.merge: true`. | Our "null means absent" JSON must parse when the keys are missing. Our `fixtures/neutral` simulation: all files survive **except `company.json`**, where `legalIds` (all null) disappears and the required object fails. | A1 (default `{}` for `legalIds`, `tradition`, `review`); `settings.content.merge: true`; declare every key (hidden when not editable). |
| B4 | **Empty `date` fields are filled with today's date** when the form loads (`initializeState`/`getDefaultValue`, `fields/core/date/index.ts`). | An unreviewed `review.reviewedAt` or empty `validFrom` would silently become a real-looking date on the next save. | `default: ""` on every date field (verified path: `getDefaultValue` returns `field.default` when defined). |
| B5 | **Select validation rejects values outside `values`** (`fields/core/select/index.tsx`, message "Invalid option"). | `ImageRef.source`/`depicts` may hold `placeholder`; editable-fields §4.10 says `placeholder` is not offered. A select without it would block saving any entry that still has a placeholder image. | A3: offer `placeholder` with an explicit label. The production gate (G-032) still fails the build. |
| B6 | **Optional object with a boolean child is never "empty".** `isEffectivelyEmpty` treats `false` and non-empty select defaults as content (`lib/schema.ts`). An untouched optional `image` object with `rightsConfirmed: false` then demands its required children and blocks the save. | Entries without an image cannot be saved. | Boolean children get `default: null` and selects no default (config schema allows `default: null`). **[manual]** confirm. |
| B7 | **List item ids.** `id` is required by our schemas but new list items get `""`; a hidden required field cannot be filled and its error shows only as a toast. The `uuid` type rejects non-UUID ids such as `pracovni-dny` (`z.string().uuid()`). | New phone/hours/price rows cannot be saved, or ids must be UUIDs. | A2: `id` optional in client-addable lists, assigned by core. |
| B8 | **Create/delete are enforced server-side, rename is not.** `isContentOperationAllowed` is checked for create (POST without `sha`) and DELETE; rename is blocked only in the client (`entry.tsx`). | Pages "no create/delete" is real; rename-lock is UI-only (acceptable because only the UI is offered, and slugs come from `filename`). | Use `operations`; treat slug stability as UI-level plus gate. |
| B9 | **Collaborator rights are broad inside the declared content.** Collaborators (invited by e-mail, no GitHub account) can edit content and media, cannot manage `.pages.yml` or collaborators; no per-path or per-branch restriction (docs `configuration/collaborators/`). The server only checks `startsWith(schema.path)`. | Safe for code and config if only the declared paths exist; branch picker lets editors create/switch branches. | Keep content `path`s narrow; verify in manual checks that other paths (e.g. `src/site.config.ts`) cannot be written. |

## 1. Field types and options

Types registered in docs: `string`, `text`, `rich-text`, `number`, `boolean`, `date`, `image`, `file`, `select`, `object`, `reference`, `block`, `code`, `uuid`. `list: true` works on any of them (<https://pagescms.org/docs/configuration/content/fields/>). `reference` **exists** (`fields/core/reference/`, option `collection`), but we do not use it: ids stay plain strings.

Config validation: `lib/config-schema.ts` is Zod with `.strict()` objects. Unknown keys give a **warning** and are ignored. There is no type-specific option checking: `options` is a free-form object, so `minlength`, `maxlength`, `min`, `max`, `values`, `format` go **inside `options:`** (docs examples do the same).

| Option | Support (source) |
| --- | --- |
| `required` | all types; string/text/rich-text `min(1)`; number via `z.literal("")` refine (see quirk); select/date/image handled in own schema; list `required` means at least one item. |
| `pattern` | string, text, rich-text. `pattern: "regex"` or `{ regex, message }`; message is shown to the editor (use Czech). The config schema does not restrict it to those types, the validators do. |
| `hidden` | field is not rendered (`entry-form.tsx`: `if (!field \|\| field.hidden) return null`), but stays in form state, in zod validation and in the payload. |
| `readonly` | UI only (disables input); value still validated and submitted. |
| `default` | `getDefaultValue`: used for undefined **and null** values of non-object, non-list fields. For lists use `list.default`. |
| `description` | help text under the field; `label: false` hides the label. |
| length | `options.minlength` / `options.maxlength` on string/text/rich-text (truthy check, `0` ignored). |
| value range | `options.min` / `options.max` on number (and date min/max as strings, select multiple min/max). Number input accepts decimals; `step` is a UI hint only. No integer check. |
| list | `list: true` or `{ min, max, collapsible }`. In the schema `collapsible` is not marked optional, so always include it when using the object form. |

**Save enforcement.** Validation runs twice with the same `generateZodSchema`: in the browser (react-hook-form resolver, blocks submit; hidden-field errors appear only as a toast "Please fix the errors before saving") and on the server (files route POST, "Content validation failed"). Only per-field rules exist; **no cross-field rules** (time ordering, `kind`/`amount` pairs, duplicate ids): those stay build-time only.

Quirks: (a) required `number` left empty coerces to `0` because the `.or(z.coerce.number())` branch accepts `""` (read from `fields/core/number/index.tsx`, not run; **[manual]**); (b) a required select left empty reports "Invalid option"; (c) the number field is a string in the form but the saved file gets a real number (zod coercion output is serialised); (d) `boolean` uses `z.coerce.boolean()`.

## 2. Singleton JSON

- `type: file`, `format: json`, `fields: [...]` works. Nested `type: object` with `fields`, and `list: true` on an object field give lists of objects (docs `configuration/content/` example `data/authors.json`; code `deepMap`).
- JSON is written with `JSON.stringify(obj, null, 2)` and **no trailing newline** (`lib/serialization.ts`). The first save reformats the file (our fixtures use inline objects).
- **Unknown keys:** with default `settings.content.merge: false` the zod parse strips everything not declared. With `merge: true` the server deep-merges the new values over the existing file (`mergeWith`, arrays from the editor replace arrays whole) and keeps undeclared top-level and nested-object keys. Keys inside **list items** are not preserved by merge, so every item key must be declared. Merge is skipped for root-level `list` files and for creates.
- **Hidden keys are preserved** when declared with `hidden: true`: they are in `defaultValues` and in the payload. They are validated, so a hidden `required` field with no value blocks the save.
- **Empty values are deleted** (`sanitizeObject`): `null`, `""`, `[]`, `{}`; `false` and `0` are kept. Also applied to existing values that the form does not touch, on every save. Simulation on `fixtures/neutral`: only `company.json` breaks (`legalIds` object vanishes). Other nullable fields already have `default(null)`/`default([])` in `core/content/schemas.ts`.

## 3. Markdown collections

- `type: collection`, `format: yaml-frontmatter`; the body is the field named **`body`** (docs `configuration/content/`). **If `body` is not declared and merge is off, the body is written as empty** (`stringify`: `body || ""`). Always declare it.
- Frontmatter is re-serialised with `YAML.stringify` defaults: comments, quoting and folding change, so the first save of a generated file produces a noisy diff. Content is semantically unchanged **[manual]**.
- **Filename:** `filename: "{primary}.md"` or `{ template, field }` (`field: false` hides the name input). Tokens `{primary}`, `{slug}`, `{fields.<name>}`, date tokens. Token values are slugified with `slugify(..., { lower: true, strict: true })`; whether Czech diacritics become ASCII must be checked **[manual]**. A typed file name (`field: create`) is **not** slugified. Name collisions get `-2`..`-3`. Updating an entry never renames it; `view.primary` selects the primary field.
- **Disable create/delete/rename:** `operations: { create: false, delete: false, rename: false }` (<https://pagescms.org/docs/configuration/content/operations/>); defaults are all true for collections; for `file` entries create true, rename false, delete true. Enforcement: create and delete are server-side 403; rename is UI-only (B8).
- Fixed pages: use a collection with all three operations off, or one `type: file` entry per page. The draft uses one collection.

## 4. Media

`media: { input: src/assets/media, output: <public path>, extensions, rename }`. Stored string for an image field = `swapPrefix(path, input, output)` (`fields/core/image/index.tsx` `write`, `lib/github-image.ts`):

| `output` | stored for upload `foo.jpg` |
| --- | --- |
| `src/assets/media` (= input) | `src/assets/media/foo.jpg` (no swap) |
| `/src/assets/media` | `/src/assets/media/foo.jpg` |
| `../../assets/media` | `../../assets/media/foo.jpg` (pure string substitution) |

`core/media/normalize.ts` was read, not changed. `normalizeMediaFile` trims, converts `\` to `/`, rejects `..`, drops empty and `.` segments, and returns the last segment, so **all three forms normalise to `foo.jpg`**. `isSupportedMediaFile` lowercases the extension. Limits: a file uploaded into a subfolder of `src/assets/media` normalises to its basename and then fails G-003 (media map is flat, `core/media/resolve.ts`). Use `rename: safe`: it slugifies base names and lowercases extensions (`getSafeUploadName`), which avoids `.JPG` and diacritics. The 8 MB limit is not enforceable in the image field (`maxImageBytes` exists only as an editor prop and is not passed), so it stays a build/inventory check. Recommendation: `output` equal to `input` (no leading slash), which avoids the prefix swap altogether **[manual]** confirm. Rich-text: set `media: false` (no images allowed in bodies, matching §7.3). Rich-text with images does a second prefix swap that may double the prefix when `output` starts with `input`.

## 5. rich-text

- Output is **Markdown** by default (`options.format` is `markdown` or `html`; anything else gives markdown). Editor: Tiptap 3 with `@tiptap/markdown` (`components/ui/editor/index.tsx`, `package.json`).
- Enabled: bold, italic, strike, underline, inline code, links, bullet/ordered lists, blockquote, code block, tables, horizontal rule/hard break (no UI), images only if media is configured. Block menu offers Text, **H1–H3**. The toolbar is a bubble menu on selection and a `/` menu.
- **Not restrictable by config:** the field accepts only `format`, `switcher`, `media`, `path`, `extensions`, `categories`, `rename`. Headings, tables, code blocks and links cannot be turned off.
- `switcher: false` removes the Source tab, so editors cannot type raw Markdown or HTML. `media: false` removes images.
- Raw HTML handling in `@tiptap/markdown` was not read. Underline likely serialises as `<u>`, which would trip our "no raw HTML" rule. **[manual]**

Comparison with content-contract §7.3:

| §7.3 rule | Pages CMS |
| --- | --- |
| no raw HTML | no passthrough extension, Source tab removable; underline may emit HTML |
| no H1 | **H1 is in the menu**, cannot be removed; build rejects it |
| no skipped heading levels | not prevented |
| no inline images | prevented with `media: false` |
| no phone numbers | not prevented; build G-030 rejects |
| no `javascript:` links | not checked in repo code; Tiptap default URI check is assumed (unverified) |

Net: the build gate stays authoritative (as the contract already says). Fallback if editing proves error-prone: use `text` (plain Markdown textarea) for bodies.

## 6. Branches, preview, history

- Branch is the URL segment; `.pages.yml` is read per repository and branch (docs `configuration/`). The editor opens the repo default branch. A dropdown with "Manage branches" lets any user switch or **create** branches (no role check seen). No branch restrictions, PRs or merges exist in the code read. Protected branches return 409 "requires changes through a pull request" with no PR fallback.
- No preview feature (the docs only show a custom action). Preview is the host's branch preview.
- History: `listCommits` for the file, 3 entries plus "View on GitHub". No restore (B1).
- **Actions** (<https://pagescms.org/docs/configuration/actions/>): `workflow`, `ref: current`, `scope`, `confirm`, `fields`; dispatches `workflow_dispatch` with one input `payload` (JSON). Collaborators may trigger; they can cancel only their own runs and cannot re-run (`actions/route.ts`). The workflow file must exist on the dispatched ref.
- Caching: Pages CMS caches `.pages.yml` in its database; changes may apply only after a TTL (default 5 min with sync) or a cache refresh by a GitHub user (docs `development/caching/`). **[manual]**
- Hosted app: `app.pagescms.org`, sign in with GitHub, install the GitHub App (docs `quick-start/`). App permissions listed on `guides/installing/github-app/` include Contents and Actions read/write; the upgrade guide lists fewer, so the authoritative list needs checking at install time. No pricing is documented.

## 7. What blocks the policy

Summarised in the table at the top. In short: hidden fields **are** preserved if declared; no field can be forced non-editable except by `hidden`/`readonly` (UI only); no conditional visibility; no cross-field validation; no revert; no merge; rich-text cannot be restricted.

## 8. editable-fields §4 mapping

The draft config parses as YAML and passed a strict-key lint that re-implements the rules of `lib/config-schema.ts` (allowed field and content keys, one of `type`/`component`, `object` needs `fields`, `select` needs `options.values`); this is not the real validator. Shorthand: `S` string, `T` text, `RT` rich-text, `N` number, `B` boolean, `D` date, `I` image object (see ImageRef block), `SEL` select, `H` hidden (declared, `hidden: true`), `L` `list: true`. Config keys live in `pages-cms.example.yml`.

| Row (§4) | Pages CMS config | Gap / workaround |
| --- | --- | --- |
| 4.1 `brandName`, `legalName` | S, `required`, `options.maxlength` 80/120 | none |
| 4.1 `legalIds.ico/dic` | S, `pattern {regex,message}` | optional; nullable handled by defaults |
| 4.1 `registryEntry` | S, maxlength 200 | none |
| 4.1 `registeredOffice` | object of S (street, city, postalCode pattern) + H `country` | optional object; empty object deleted, schema needs `nullable().default(null)` (present) |
| 4.1 `tradition.publicWording` | S maxlength 120, label from policy | none |
| 4.1 `tradition.foundedYear` | N `min 1800`, `max 2100` | decimals accepted by CMS, build rejects |
| 4.1 `familyOwned` | B | tri-state (null) not representable: `false` is kept, null becomes `false`. Contract allows null. See A4. |
| 4.1 `logo` | `I` object | B6 default trick |
| 4.2 `locations[]` fields | object L with `list: { min: 1, max: 1, collapsible }` | add/remove cannot be disabled per list: `max: 1` + `min: 1` makes it a single row, but "Add" button remains until max reached |
| 4.2 `geo`, `locationId` | H object (lat/lng number H), H string | declare so list items keep them |
| 4.2 `mapUrl` | S pattern `^https?://` | none |
| 4.2 `phones[]` label/number | S maxlength 60; number pattern `^\+[1-9]\d{7,14}$` with Czech message, description shows format | CMS does not format spaces |
| 4.2 `phones[].department` | SEL office/flowers/other, `hidden`, `default: office` | new phones become office phones |
| 4.2 `emails[]` | S, pattern simple e-mail | none |
| 4.3 `label`, notes | S/T with maxlength | none |
| 4.3 `weekly[]` | object L: `days` SEL multiple (7 values), `open`/`close` S pattern `^([01]\d\|2[0-3]):[0-5]\d$`, `breaks` object L | no time widget; no cross-field check (build rejects) |
| 4.3 `exceptions[]` | object L with `from`/`to` D `default: ""` format `yyyy-MM-dd`, `closed` B, times S, `note` S | B4 |
| 4.4 emergency `phone`, `shortNote`, `serviceArea` | own `content` entry, S/T | none |
| 4.4 `label`, `availability`, `enabled` | H (declared so they are preserved) | hidden is UI-only; build and review still guard |
| 4.5 pages `title`, `lead`, `excerpt`, `navLabel`, `metaTitle`, `metaDescription` | S/T with maxlength | only template `pageFields` shown: generator emits others as H |
| 4.5 body | RT `format: markdown`, `switcher: false`, `media: false` | §5: H1/tables available |
| 4.5 `heroImage`, `secondaryImage` | `I` | only declared slots |
| 4.5 `placeholder` | H B `default: null` | |
| 4.5 create/delete | `operations` all false | create/delete server-enforced |
| 4.6 services text fields | S/T/RT with limits; `category` SEL | |
| 4.6 `order` | N min 0 max 999 | |
| 4.6 `featured`, `published` | B | `published: false` kept (false is retained) |
| 4.6 `image` | `I` | |
| 4.6 `priceGroupId` | H S | |
| 4.6 add/delete | collection with create/delete true, rename false | slug from `{primary}`; diacritics **[manual]** |
| 4.7 guidance | S/T/RT, `checklist` string L (`options.maxlength` 160), selects, `review` object, `sources` object L with S + S pattern `^https://` | B4 for `reviewedAt`; warning text goes in `description` |
| 4.8 coffins/flowers | per schema, `type` SEL, `placeholder` H | |
| 4.9 `visible` | B label "Zobrazit ceník na webu" | |
| 4.9 text/date | T/D `default: ""` | B4 |
| 4.9 `groups[]`, `items[]` | nested object L | ids, A2 |
| 4.9 `kind`, `amount`, `amountMax` | SEL; N min 0 max 2000000 | no cross-field rules, empty required number becomes 0, so `amount` stays non-required in CMS |
| 4.9 `status` | SEL `demo`/`approved` with Czech labels, required | new items default to `demo` (set `default: demo`) |
| 4.9 `currency` | H S `default: CZK` | |
| 4.10 `file` | `image` field with `media`, `rename: safe` | |
| 4.10 `alt` | S maxlength 200, required (build enforces "unless decorative") | CMS cannot make it conditional |
| 4.10 `decorative`, `caption`, `credit` | B, S, S | |
| 4.10 `source`, `depicts` | SEL incl. `placeholder` | B5 |
| 4.10 `rightsConfirmed` | B, label from policy | |
| 4.10 `focus` | SEL, no default | B6 |
| 4.11 never in CMS | not declared; `settings: { hide: true }` | `.pages.yml` editing is GitHub-user only; collaborators cannot |

## 9. Proposed amendments (proposals only; no other doc edited)

- **A1 (content-contract §2, §6):** every schema must parse after the CMS "empty value" normalisation. Rule: any `nullable()` has `.default(null)`, any array `.default([])`, any object whose children are all optional has `.default({})` (`legalIds`, `tradition`, `review`, `registeredOffice`). Add a core test that runs `sanitizeObject` over `fixtures/neutral` and re-parses. The simulation shows `company.legalIds` currently fails.
- **A2 (§6.2, §6.4, §6.11):** make `id` optional on `phones[]`, `emails[]`, `weekly[]`, `exceptions[]`, `items[]`, and on groups; core assigns a deterministic fallback (`<list>-<index>`) and still checks duplicates. `locations[].id` stays required and hidden (single location).
- **A3 (editable-fields §4.10):** replace "`placeholder` is not offered in the CMS" with "`placeholder` is offered with the label 'Zástupný obrázek – nezveřejňovat'"; production gate G-032 already rejects it.
- **A4 (§6.1):** `familyOwned` is `boolean` with default `false`, or a three-value select (`true`/`false`/`unknown`); a CMS toggle cannot represent `null`.
- **A5 (editable-fields §5, template-contract §9):** workflow instead of "preview branch". Default branch of the client repo is `content`; the host deploys production from `main` and previews `content`. A CMS Action "Zveřejnit změny" dispatches `publish.yml` (exists on `content`, `ref: current`), which builds with `SITE_MODE=production` plus the gate and, only on success, fast-forwards `main`. A second Action "Zahodit nepublikované změny" resets `content` to `main` (with `confirm`). Reverting a published change remains a GitHub or host operation.
- **A6 (§5 gate):** add a gate rule that content file names match `^[a-z0-9-]+\.md$`; the CMS slugifier is not a guarantee.
- **A7 (editable-fields §2 Hidden):** reword as "declared with `hidden: true`; preserved, validated, defaulted". Undeclared keys are stripped unless `settings.content.merge: true`, and merge does not protect keys inside list items.
- **A8 (editable-fields §5):** state that invalid saves caught by the CMS give a toast only; the Czech build messages are the real error channel.
