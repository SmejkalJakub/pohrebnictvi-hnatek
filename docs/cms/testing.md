# Testing

Related: [architecture.md](architecture.md) §4 · [security.md](security.md) §3

Legend: **tested** = run and passed on 2026-11-12 · **failing** = run and failed · **not run** = needs a hosted account that does not exist yet.

## 1. Automated tests (`npm test`)

| File | What it proves |
| --- | --- |
| `tools/cms/tests/decap-config.test.ts` | config for both Hnátek variants: backend `git-gateway` on branch `content`; placeholders until `publishing.json` is filled; exactly the expected menus; one page entry per existing page the template declares; locked fields (`emergency.enabled/label/availability`, `geo`, `department`, `currency`, `priceGroupId`, `placeholder`, `id`) are hidden widgets; no design or configuration fields; every field states `required`; dates default to `""`; `rightsConfirmed` has no default; price status defaults to `demo`; Markdown without images, code or raw mode; **every key the real content holds is declared**; PKCE block in DecapBridge's shape; articles and notices only when enabled and supported; publishing conflicts (shared repository, DecapBridge site, Worker, agency repository) |
| `tools/cms/tests/decap-roundtrip.test.ts` | five files saved by real Decap 3.17.3 equal the original content plus only the edit; all content of both variants rewritten Decap-style validates to identical content and identical gate findings; the export's `rightsConfirmedFor` step only adds keys and changes no gate finding |
| `tools/export/tests/export-parts.test.ts` | workflows: pinned actions, write permission only in jobs that push and never with `npm ci`, integrity before install, gate in publish, deploy only when `CLOUDFLARE_DEPLOY` is `true`, secrets only in the deploy step, fast-forward only; **the integrity step run with bash on Git repositories**: passes for content edits, new raster images, deleted entries, PDFs; fails for a changed build file, gate or CMS config, a new page, `src/content/config.ts`, nested content, an SVG upload or change, a script in `public/`, a deleted locked file; admin page template (noindex, pinned bundle, no external script, reworded save button, placeholder notice, rights hook); secret scan |
| `core/tests/gate.test.ts` | G-033 rejects a rights confirmation recorded for a different file, accepts the same file in either path form and a missing record; G-060 requires `contactFormHandler` and the privacy page, and passes with both |
| `tools/export/tests/export-parts.test.ts` (hosting) | the workflow tests above run for **both** Netlify and Cloudflare: Netlify deploys use `netlify-cli@27.15.0 deploy --no-build --dir dist --site <id>`, `--alias preview` in preview and `--prod` only in publish, `NETLIFY_AUTH_TOKEN` only in the deploy step; `netlify.toml` cancels Git-triggered builds; the hosting and form check accepts a Netlify form on a Netlify site and refuses it with `wrangler.jsonc` |
| `tools/cms/tests/decap-config.test.ts` (hosting) | both Hnátek variants on Netlify with nothing shared; two clients sharing a Netlify project or Worker are refused; a missing Netlify Project ID is listed and rendered as `DOPLNIT` |
| `tools/export/tests/export-parts.test.ts`, `tools/cms/tests/decap-config.test.ts` (publishing from the editor) | `publish.yml` runs on dispatch and on pushes to `content` that change `src/content/publish/request.json`, and its job still requires `refs/heads/content`; that file is CMS-writable; "Zveřejnit změny" is the last menu entry with a required note and a hidden `requestedAt`, and no other entry or Astro collection uses `src/content/publish/`; the admin page sets `requestedAt` on save and shows the started message |
| `core/tests/cms-tolerance.test.ts` | schemas accept what a CMS writes (empty values dropped, `null` booleans, rows without ids, select form of `familyOwned`) |

Result: see §5.

## 2. Local browser QA with real Decap (tested)

Setup: Decap CMS 3.17.3 bundle and generated `config.yml` for `clients/hnatek`, served from `localhost`, `decap-server` 3.11.6 as local backend on a Git copy of the client content. Steps and outcomes:

| # | Check | Result |
| --- | --- | --- |
| 1 | `/admin/` loads the self-hosted bundle (integrity attribute) in Czech, login button "Přihlásit" | tested |
| 2 | config loads without errors; menus Základní informace, Nonstop převoz zesnulých, Stránky, Služby, Ceník, Jak postupovat, Rakve, Květiny | tested |
| 3 | edit company name → one-line JSON diff, everything else kept | tested |
| 4 | change a phone number → one-line diff; hidden `id`, `department`, `locationId`, `geo` kept | tested |
| 5 | edit a guidance summary → YAML restyled, values equal, `reviewedAt: null` kept, body untouched | tested |
| 6 | edit a page body (rich text) → only the sentence and one blank line differ; headings kept | tested |
| 7 | change a price amount → number saved, status still `demo` | tested |
| 8 | thumbnails of existing images (bare names and `src/assets/media/…`) | tested after the `public_folder` fix |
| 9 | upload an image ("Testovací Fotka.jpg" → `testovaci-fotka.jpg`) and select it | tested |
| 10 | select an existing image from the library | tested |
| 11 | replace a confirmed photo → saved with `rightsConfirmed: false`; confirm again → `rightsConfirmedFor` = new file | tested |
| 12 | save button reads "Uložit do náhledu" / "Uloženo v náhledu", never "Publikovat" | tested |
| 13 | the saved files built with Astro inside the exported Hnátek site: body edit, new photo (`/_astro/…webp`), company name, price 19 500 and phone render | tested |
| 14 | the same files in production mode: build fails with G-012, G-020, G-021, G-031, G-040 (as before the edits) | tested |
| 15 | empty optional number (`foundedYear: null`) no longer blocks saving | tested after the `min`/`max` fix |
| 16 | green "Zveřejnit změny" button in the top bar opens the publish entry; its save button and menu item read "Zveřejnit na ostrém webu", unchanged state "Nejdřív napište, co se mění"; fill "Co se zveřejňuje", save → `src/content/publish/request.json` created with the note and `requestedAt` (ISO time set on save); "Zveřejnění spuštěno" shown; the integrity script accepts the commit; the prototype build is unchanged | tested |

Not tested in the browser: PDF fields (no variant enables notices or documents), creating and deleting collection entries, Hnátek-B's editor (same generator; its config is covered by the automated tests).

## 3. Export (`npm run client:export -- <id>`)

| Step of `export:verify` | hnatek | hnatek-b |
| --- | --- | --- |
| copy outside the repo, Node version, static scan | tested | tested |
| Decap admin present (noindex, pinned bundle hash, backend `content`, simple mode, media folder) and no secrets | tested | tested |
| integrity step of `preview.yml` and `publish.yml` on a Git copy of the export: passes; with `astro.config.mjs` changed: fails | tested | tested |
| `npm ci`, prototype build (noindex, robots, no sitemap, banner, `dist/admin/` present, no external resources) | tested | tested |
| hosting and contact form in the build: one hosting config (`netlify.toml` with `ignore = "exit 0"`), `/kontakt/` form with `data-netlify="true"` and the honeypot, `/kontakt/odeslano/` present and noindex | tested | tested |
| production build fails naming exactly the client's open rules; `validate` in both modes | tested | tested |
| build with the network blocked | tested | tested |
| `npm run check` (astro check) | **failing: 11 errors** | **failing: 11 errors** |

Cloudflare option: `wrangler.jsonc` was checked with `npx wrangler@4.155.0 deploy --dry-run --env=""` and `--env preview` on a built export: both read the 245 files of `dist/` (including `admin/`) and report no errors (no upload, no account). Netlify: the deploy flags were checked against `netlify-cli@27.15.0 deploy --help` (`--no-build`, `--dir`, `--site`, `--alias`, `--prod`, `--message`); nothing was deployed (Netlify has no dry run without an account).

Contact form, checked in a browser on local builds of both variants (`/kontakt/` and `/kontakt/odeslano/`, screenshots): layout, the nonstop line at the top of the form, the privacy link, required fields. **Sending was not tested**: a static server cannot receive the POST; that needs Netlify (§4).

The `astro check` errors are in `src/core/content/load.ts` (`getCollection("people")`, `"notices"` are not known collections when those folders are absent). They are **not caused by this work**: the same 11 errors appear with `core/content/schemas.ts` and `core/gate/rules.ts` restored to the previous commit. They date from the optional content types commit. Separate follow-up.

## 4. Hosted checklist (not run)

Run once on a throwaway copy before the first real client, after [setup.md](setup.md). Record PASS / FAIL / NOTE.

| # | Check | Expected |
| --- | --- | --- |
| 1 | Open `https://<preview>/admin/` before `publishing.json` is filled | Czech notice "Správa obsahu zatím není připojená", no login |
| 2 | After setup: log in with an invited e-mail and password (no GitHub account) | collections listed; the dashboard's `backend:` block matches `config.yml` |
| 3 | Edit the homepage `lead` and save | commit on `content` by the DecapBridge token, message "Obsah: upraveno …"; `preview.yml` runs |
| 4 | Change a phone number | one-line diff in `contact.json` |
| 5 | Edit a service description | Markdown body diff only |
| 6 | Change a price amount | status stays "Ukázková"; preview shows "UKÁZKA" |
| 7 | Upload a JPEG and use it | file in `src/assets/media/`; preview shows it |
| 8 | Upload an SVG | `preview.yml` fails at the integrity check with the Czech message |
| 9 | Inspect the commits on GitHub | only content paths changed |
| 10 | Preview URL (`https://preview--<project>.netlify.app`) | updated within minutes; noindex banner; listed in Netlify Deploys as a draft, not Production |
| 11 | `gh workflow run publish.yml --ref content` with the demo price | fails at the gate (G-020); live site and `main` unchanged |
| 12 | Live site after 11 | unchanged |
| 13 | Trial publish with `PUBLISH_MODE=prototype` | production deploy on `https://<project>.netlify.app`; `main` fast-forwarded |
| 14 | Contact form on the production URL: send a message | lands on `/kontakt/odeslano/`; Netlify Forms lists form `kontakt` and the message with `jmeno`, `telefon-nebo-email`, `zprava`; the notification e-mail arrives. (Confirms that form detection works for CLI deploys, which Netlify's docs do not state.) |
| 15 | Contact form with the hidden `bot-field` filled (devtools) | no submission shown under Verified submissions |
| 16 | Contact form on the `preview--` URL | record whether Netlify accepts it (not documented) |
| 17 | Netlify project settings | not linked to GitHub; builds stopped; no build ran in Deploys |
| 18 | Same steps for Hnátek-B | its own repository, DecapBridge site and Netlify project; nothing in Hnátek changes |
| 19 | Direct push of a changed `astro.config.mjs` to `content` with the DecapBridge token (curl through the gateway) | push accepted (GitHub cannot stop it), preview and publish fail at the integrity check |
| 20 | Same with `.github/workflows/publish.yml` | refused by GitHub (no Workflows permission) |
| 21 | `discard.yml` | `content` equals `main`; the editor shows the published state |
| 22 | Netlify rollback: Deploys → previous production deploy → Publish deploy | previous deployment restored |
| 23 | Editor: top-bar "Zveřejnit změny" → note → "Zveřejnit na ostrém webu" | commit of `src/content/publish/request.json` on `content`; both "Náhled webu" and "Zveřejnit změny" run; the live site changes, `main` fast-forwards |
| 24 | Same with a demo price in production mode | publish fails at the gate; live site unchanged; GitHub e-mails the failure |

## 5. Commands run on 2026-11-12

| Command | Result |
| --- | --- |
| `npm run check` (lint, typecheck, unit + tools tests, harness build + tests) | pass: 248 unit/tool tests, 14 harness tests, 0 type errors (after the Netlify and contact form changes) |
| `npm run client:validate -- hnatek` / `-- hnatek-b` | `PROTOTYPE: PASS` for both; production still blocked by the client's open facts (as before) |
| `npm run client:build -- hnatek` / `-- hnatek-b` | build complete for both, with `/kontakt/odeslano/` (11 and 19 pages) |
| `npm run client:export -- hnatek --force` / `hnatek-b --force` | 11 of 12 verify steps pass, including the hosting and form check; `astro check` fails with the same 11 pre-existing errors (§3) |
| browser QA (§2) | 15 checks pass |

Re-run with:

```
npm run check
npm run client:validate -- hnatek && npm run client:validate -- hnatek-b
npm run client:build -- hnatek && npm run client:build -- hnatek-b
npm run client:export -- hnatek --force && npm run client:export -- hnatek-b --force
```
