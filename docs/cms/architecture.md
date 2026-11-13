# Architecture

Related: [README.md](README.md) · [security.md](security.md) · [../editable-fields.md](../editable-fields.md) · [../template-contract.md](../template-contract.md) §9

## 1. Overview

```
agency repository (this one)                     client repository (private, one per site)
  core/  templates/  clients/<id>/                 the export: template + src/core + content
  tools/cms/      → config.yml generator           public/admin/   Decap CMS (static)
  tools/export/   → standalone export  ─────────►  netlify.toml or wrangler.jsonc (hosting)
                                                   .github/workflows/ preview · publish · discard
                                                           │
     editor's browser ── /admin/ ── DecapBridge (auth + git-gateway) ── GitHub API ── branch content
                                                           │
                             preview.yml (on push) ── Netlify draft "preview" / Worker <name>-preview (noindex)
                             publish.yml (editor's "Zveřejnit změny" save, or agency)
                                                   ── Netlify production / Worker <name> (custom domain) + main

     visitor ── /kontakt/ form ── POST ── Netlify Forms (dashboard + e-mail notification)
```

Nothing runs on a server of ours. The public site and the editor are static files. DecapBridge is the only hosted service in the editing path; GitHub Actions and the host (Netlify or Cloudflare) are in the build and deploy path. On Netlify, Netlify Forms also receives the contact form.

## 2. What the export adds

| Path in the export | Source | Notes |
| --- | --- | --- |
| `public/admin/index.html` | `tools/export/templates/admin-index.html.tpl` | Czech, `noindex`, loads the pinned bundle with `integrity`, rewords Decap's "Publikovat" to "Uložit do náhledu", registers the image-rights `preSave` hook, shows a Czech notice instead of a login while `config.yml` still contains `DOPLNIT` |
| `public/admin/config.yml` | `tools/cms/decap-config.ts` | generated per site; never edited by hand |
| `public/admin/decap-cms-3.17.3/` | `tools/cms/vendor.ts` | the npm release's browser build (entry, ~95 chunks, 2 wasm files, licence notices; 6 MB). Downloaded once into `node_modules/.cache/` and checked against a pinned SHA-384 |
| `netlify.toml` (Netlify) | `tools/export/hosting.ts` | `publish = "dist"` and `ignore = "exit 0"`, which cancels any Git-triggered Netlify build; deploys come only from the workflows (`netlify deploy --no-build`) |
| `wrangler.jsonc` (Cloudflare) | `tools/export/hosting.ts` | Workers Static Assets, production Worker `<name>` and `env.preview` → `<name>-preview` |
| `.github/workflows/{preview,publish,discard}.yml` | `tools/export/templates/*.yml.tpl` | preview and publish start with the integrity step (`integrity-step.yml.tpl`); their deploy steps come from `hosting.ts` |
| content adjustments | `tools/export/cms-content.ts` | `familyOwned` in select form; `rightsConfirmedFor` on every confirmed image |

Astro copies `public/` into `dist/`, so the editor is served at `https://<domain>/admin/` by the same host as the site.

**Why self-hosted, not `<script src="https://unpkg.com/…">`:** Decap's entry loads its code-split chunks from the same base URL at runtime, and those requests carry no integrity check. A CDN tag with SRI would protect only the entry file. Self-hosting keeps every file of the editor on the site's own origin, inside the integrity manifest.

## 3. The config generator

`generateDecapConfig()` turns the field policy into Decap collections. Inputs: the template manifest (`pageFields`, `imageSlots`, `supports`), `site.config.ts` features, the page files that exist, `legal.json` presence, `siteUrl`, and `clients/<id>/publishing.json` (repository, DecapBridge site id and auth type, hosting).

| Menu | Decap type | Files |
| --- | --- | --- |
| Základní informace | files | `site/company.json` (Firma), `contact.json` (Kontaktní údaje), `office-hours.json` (Otevírací doba kanceláře), `legal.json` when the template renders it |
| Nonstop převoz zesnulých | files | `site/emergency.json`: its own menu entry, never inside contact or hours |
| Stránky | files | one entry per existing page the template declares in `pageFields`; only those fields are visible, the rest are hidden widgets |
| Služby, Jak postupovat, Rakve, Květiny | folder | create and delete allowed; file name from the title (ASCII), never renamed |
| Ceník | files | `site/pricing.json`, nested groups and items, `status` defaults to "demo" |
| Oznámení, Časté otázky, Lidé, Dokumenty, Články | folder | only when the feature is on **and** the template supports it (none for Hnátek) |

The backend block has the shape the DecapBridge dashboard generates (read from its source, [decapbridge.md](decapbridge.md)), with `branch: content`. `local_backend: true` is included: it only takes effect when `/admin/` runs on `localhost` with `npx decap-server` running, which is how the agency tests locally.

Design, layout, tokens, `site.config.ts`, features, workflows and code have no fields. `tools/cms/tests/decap-config.test.ts` asserts that for both Hnátek variants.

## 4. What a Decap save does (tested with Decap CMS 3.17.3)

Tested in a real browser against a copy of `clients/hnatek` with `decap-server` 3.11.6 (local backend). The saved files are fixtures in `tools/cms/tests/fixtures/decap-3.17.3/`, and `decap-roundtrip.test.ts` checks them.

| Behaviour | Finding | Handling |
| --- | --- | --- |
| JSON files | rewritten with 2-space indent; key order, `null`, nested objects, list items and undeclared keys kept; a one-field edit is a one-line diff | none needed |
| YAML front matter | rewritten in plain block style (quotes dropped, flow lists become block lists, long strings wrapped); values equal after parsing; keys follow the config order | schemas already accept it; round-trip test over all content of both variants |
| Markdown body | untouched unless edited; an edit keeps headings and paragraphs; the blank line after the closing `---` is dropped | none needed |
| `null` values | kept (`reviewedBy: null`, `amountMax: null`) | none needed |
| Empty optional date | stays `null` with `default: ""`; the picker offers "Teď" (now) but never fills it by itself | every date field has `default: ""` |
| Empty optional number with `min`/`max` | **blocks the save** ("musí být mezi 1800 a 2100") even when the field is optional | optional numbers have no `min`/`max` in the CMS; range in the hint, enforced by the schema |
| Hidden keys (`id`, `department`, `geo`, `placeholder`, `currency`) | kept on save | every key the content holds is declared (test) |
| Image thumbnails | with `public_folder: /src/assets/media` Decap requests that URL from the website, where the file does not exist (Astro serves `/_astro/…`): every existing image looks broken | `public_folder: src/assets/media` (relative): Decap then loads thumbnails through the Git backend. Bare names (`foto.jpg`) also resolve |
| Uploads | `Testovací Fotka.jpg` → `src/assets/media/testovaci-fotka.jpg`; stored value `src/assets/media/testovaci-fotka.jpg`, which core normalises | none needed |
| Replacing a photo | **keeps every other key**, including `rightsConfirmed: true`, `source` and `alt` of the old photo | admin `preSave` hook + `rightsConfirmedFor` + G-033 (below) |
| Editing a price | amount saved as a number; `status` stays "demo" | the editor must set "Schválená skutečná cena" explicitly |
| Save button wording | Decap calls a save "Publikovat" in simple mode | reworded to "Uložit do náhledu" in the admin page; a save is never presented as publication |

**Image rights follow the file.** On every save the admin page walks the entry's image objects: a confirmed image without `rightsConfirmedFor` gets the current file name; a confirmed image whose `rightsConfirmedFor` names another file gets `rightsConfirmed: false`. The export writes `rightsConfirmedFor` for every image confirmed before handover, so the first replacement is covered too. G-033 applies the same rule at build time, so content written outside the editor cannot bypass it. Tested in the browser: replacing the photo on "O nás" saved `rightsConfirmed: false`, and ticking the box again saved `rightsConfirmedFor: kvetiny-na-rakev-bila.jpg`.

**Not handled automatically:** the old photo's `alt`, `source` and `depicts` stay until the editor changes them (the image hint asks them to). The schema still rejects `actual-business` with a stock or placeholder source.

## 5. Media

Uploads go to `src/assets/media/` in the client repository (Git-backed; no R2 or other media service). Astro's image pipeline processes them at build time, as before. Only JPEG, PNG, WebP and AVIF uploads pass the integrity check; an SVG upload makes the next preview and publish fail (an SVG can carry script, and `/admin/` on the same origin holds the editor's session). Existing SVGs from the export (logos) stay usable and are locked.

PDF fields (notices, documents) upload into `src/assets/documents/` through field-level folders; untested, because no Hnátek variant enables them.

## 6. Adding a template or a content type

- A new page field: add it to `PAGE_FIELD_NAMES` and `pageField()` and to the template's `pageFields`.
- A new collection: add a builder next to `servicesCollection()` and a feature/support check in `generateDecapConfig()`; extend `editable-fields.md` §4 first.
- The test "declares every key the client's content holds" fails when content has a key the config does not declare. Fix the config, never the test.

## 7. Contact form

`features.contactForm` with `contactFormHandler: "netlify"` (both Hnátek variants, for testing). Plain HTML, no JavaScript:

- `core/forms/contact.ts`: form name `kontakt`, fields `jmeno`, `telefon-nebo-email`, `zprava` (with length limits), honeypot `bot-field`, success path `/kontakt/odeslano/`, the shared Czech wording and the Netlify attributes (`data-netlify="true"`, `netlify-honeypot`). A hidden `form-name` input is included, so the form also works if Netlify's HTML processing changes.
- `core/components/ContactForm.astro`: the markup; it repeats the nonstop number at the top ("Formulář je pro dotazy, které nespěchají…") and links the privacy page. Templates lay it out through class props: Rodinná tradice as a reply slip under the nonstop panel, Důstojná jednoduchost as a framed card after the page text.
- `pages/kontakt/[sent].astro` in each template: the success page, emitted only while the form is on; `noindex` and outside `sitemap.xml` (core integration).
- Gate G-060: the form needs a handler and the privacy page. The export refuses a Netlify form on a non-Netlify host, and `export:verify` checks the built form, honeypot and success page.
- Not done: the privacy page text for the form (placeholder today, so production stays blocked by G-031), a recipient decided by the client, and any CMS field for the form's wording (the wording is template copy).
