# S5 · Standalone export, independence verification, CMS config: session notes

**Status:** done 2026-11-05. Both fixture exports pass `npm run export:verify` (10/10 steps), and so do the production-ready exports (`--production pass`, sitemap emitted). Generator and export unit tests: 37 passing (`npx vitest run --project tools`). Root `npm run check` passes.

## Tools

| Command | File | What it does |
| --- | --- | --- |
| `npm run export -- --client <dir> --template <id> --out <dir> [--config <site.config.ts>] [--name <pkg>] [--force]` | `tools/export/export.ts` | Assembles a standalone Astro project (template-contract §9), see below. `--force` replaces only an earlier export (a directory with `TEMPLATE.json`). |
| `npm run export:verify -- <dir> [--production fail\|pass] [--rules G-…] [--keep]` | `tools/export/verify.ts` | Copies the export to a fresh `os.tmpdir()` directory outside the repo and runs the independence checks with a clean environment. Exits 1 with a readable report on any failure; keeps the work dir on failure. |
| `npm run cms:config -- --template <id> [--client <dir>] [--config <file>] [--out <file>]` | `tools/cms/generate.ts` | Prints or writes `.pages.yml` for a template + site. The export calls the same function. |
| `node tools/export/production-fixture.ts --template <id> --out <dir>` | `tools/export/production-fixture.ts` | Writes a production-ready copy of the neutral fixture (same resolutions as `harness/tests/harness.test.ts`). Test data only. |

Library files: `tools/cms/pages-config.ts` (the editable-fields policy and all S2 findings, as code), `tools/export/rewrite.ts` (core path rewriting), `tools/export/scan.ts` (static independence scan), `tools/export/render.ts` (`{{name}}` substitution), `tools/lib/*`. Document templates live in `tools/export/templates/` (`README.md.tpl`, `HANDOVER.md.tpl`, `CREDITS.md.tpl`, `publish.yml.tpl`, `discard.yml.tpl`, `validate.ts.tpl`); the code only fills in generated parts (CMS menu, font and image tables, versions). The `.tpl` suffix keeps the templates out of the root `tsc` and ESLint runs (`validate.ts.tpl` imports `../src/core/…`, which exists only in an export).

### What the export contains

- Template files at the root, without `dist`, `node_modules`, `.astro`, `fixture.site.config.ts`, `package.json`, tests (`tests/`, `*.test.*`) and `src/site.config.ts`.
- `core/` copied verbatim to `src/core/`, without `core/tests`.
- Client `src/content/`, `src/assets/media/`, `src/site.config.ts` (or `--config`), and `provenance/` → `docs/provenance/`.
- Rewrites: every quoted relative specifier that resolved into the repo's `core/` is re-pointed at `src/core/`. For the fixture exports that is the integration import and `new URL("../../core")` alias in `astro.config.mjs`, all `tsconfig.json` paths/include/exclude entries, `src/env.d.ts`'s `/// <reference path>`, A's `template.manifest.ts` `import type`, and the `import type` in `site.config.ts`. `@core/*` imports in template source need no change.
- `package.json`: name `<client>-<template>-web`, `private`, `type: module`, `engines.node` and `packageManager` from the root, scripts `dev`/`build`/`preview`/`check`/`validate` (no `SITE_ROOT`/`SITE_CONFIG`), dependencies = core's + the template's, devDependencies `@astrojs/check`, `typescript`, `@types/node`. Every version comes from the repo's `package-lock.json` (workspace-local install first, then hoisted). An exact spec that disagrees with the lockfile stops the export.
- `package-lock.json`: `npm install --package-lock-only --ignore-scripts` in a scratch dir outside the repo, with an empty npm user config and the public registry. The real clean install is `npm ci` in verify.
- `.nvmrc` (24.21.0), `.gitignore`, `scripts/validate.ts` (self-contained, imports `src/core` and the manifest, so it also runs G-005), `.pages.yml`, `.github/workflows/{publish,discard}.yml`, `README.md` (cs + en), `HANDOVER.md` (cs), `CREDITS.md`, `TEMPLATE.json`.
- CMS normalisation: `company.json` `familyOwned` `true`/`false`/`null` is written as `"yes"`/`"no"`/`"unknown"` (the only form the CMS select can save; the schema accepts both). The export prints this as a note.

## Verify results

Commands, from the repo root:

```
npm run export -- --client fixtures/neutral --template rodinna-tradice --config templates/rodinna-tradice/fixture.site.config.ts --out exports/neutral-rodinna-tradice
npm run export -- --client fixtures/neutral --template dustojna-jednoduchost --config templates/dustojna-jednoduchost/fixture.site.config.ts --out exports/neutral-dustojna-jednoduchost
npm run export:verify -- exports/neutral-rodinna-tradice
npm run export:verify -- exports/neutral-dustojna-jednoduchost
```

Both fixture exports: **RESULT: PASS (10/10 steps)**. Report for `neutral-rodinna-tradice` (B is identical except 17 HTML pages):

```
PASS  copy to a fresh directory outside the repository   (work dir under /var/folders/…/T/export-verify-*/site)
PASS  node version matches .nvmrc                          (.nvmrc 24.21.0, running 24.21.0)
PASS  static scan (specifiers, paths, @core, registries, agent files)   no findings
PASS  npm ci                                               exit 0
PASS  npm run build (prototype) must pass                  noindex meta, robots.txt Disallow, no sitemap.xml,
                                                           prototype banner, external runtime resources: none, 10 pages
PASS  SITE_MODE=production npm run build must fail         exit 1, gate failure reported,
                                                           rules named: G-011, G-012, G-020, G-021, G-031, G-032, G-040
PASS  npm run validate (prototype) must pass               errors 0 · warnings 1 · markers 52
PASS  npm run validate -- --mode production must fail      exit 1, same rules
PASS  npm run check (astro check)                          0 errors
PASS  build with the network blocked after install         macOS sandbox-exec denying outbound IP + proxy vars to 127.0.0.1:9
```

Production-ready exports (`node tools/export/production-fixture.ts --template <id> --out exports/fixture-production-<id>`, then `npm run export -- --client exports/fixture-production-<id> --template <id> --out exports/production-<id>` and `npm run export:verify -- exports/production-<id> --production pass`): both **PASS 10/10**. The production build exits 0 with `sitemap.xml` (A: 9 URLs, B: 16 URLs), `index,follow` on `/`, no prototype markers. Validate in both modes reports 0 errors, 0 warnings, 0 markers. The offline build runs in production mode in this variant.

How verify isolates the run: the copy excludes `node_modules`/`dist`/`.astro`; it fails if any parent directory has `node_modules`; all `npm_*`, `SITE_*`, `NODE_PATH`, `NODE_OPTIONS` variables are dropped and `NPM_CONFIG_USERCONFIG` points at an empty file, so this machine's npm settings (scoped or private registries, tokens) cannot help the install. The offline step uses `sandbox-exec` on macOS and falls back to the proxy variables plus `NODE_USE_ENV_PROXY=1` and `npm_config_offline` elsewhere; the report states which method ran.

## Generated `.pages.yml`, highlights

- `settings.content.merge: true`, `settings.hide: true`, commits as the editor with Czech commit messages.
- `media.input` = `media.output` = `src/assets/media`, `rename: safe`, jpg/jpeg/png/webp.
- Menu: **Nonstop převoz zesnulých** (own top-level entry, `emergency.json`; `label`, `availability`, `enabled` hidden) · **Firma a kontakt** (Firma, Kontakt, Otevírací doba kanceláře as three separate files; hours carry the help text "Jen doba kanceláře. Nonstop převoz zesnulých je samostatná položka v menu.") · **Ceník** · **Texty stránek** (one `type: file` entry per existing page, labelled "Stránka: …") · collections Služby, Jak postupovat, Rakve, Květiny. **No articles** entry while `features.articles` is off (or the template does not support articles).
- Pages: `operations` create/delete/rename all `false`; only the template's `pageFields` are visible, page images only where the manifest declares a slot for that page and field; every other page key stays declared with `hidden: true` (never `required`). Collections: create/delete on, rename off, file name from the slugified primary field (`field: false`).
- Every list item declares every key (`id`, `department`, `locationId`, `geo`, `country`, …); a test walks the whole fixture and fails on any undeclared key at any depth.
- Every `date` field has `default: ""` (validFrom, exception from/to, review.reviewedAt, article dates).
- Price `status` select: `demo` "Ukázková – nezveřejňovat" / `approved` "Schválená skutečná cena", required, default `demo`.
- Image objects are expanded inline (no shared component, because S2 could not confirm component overrides). `source` offers `placeholder` labelled "Zástupný obrázek – nezveřejňovat"; `depicts` offers `placeholder`; `decorative`/`rightsConfirmed` default `null` and selects have no default (B6). Collection images are visible only when the manifest has a `service.*` / `coffin.*` / `flower.*` slot; the logo is always editable (editable-fields §4.1).
- `familyOwned`: select `yes` "Ano" / `no` "Ne" / `unknown` "Neuvádět", default `unknown`.
- Bodies: `rich-text`, `format: markdown`, `switcher: false`, `media: false`; coffins and flowers keep a hidden body.
- Actions (A5), top-level: "Zveřejnit změny" → `publish.yml`, "Zahodit nepublikované změny" → `discard.yml`, both `ref: current`, `scope: repo`, `confirm: true`.
- No YAML anchors/aliases (`aliasDuplicateObjects: false`), so the file reads top to bottom. It is ~3 400 lines because image objects are inlined.

## Publish workflows (A5)

- `publish.yml`: `workflow_dispatch` with an optional `payload` string input (what Pages CMS sends). Job `build` runs only on `refs/heads/content`, with `contents: read` and `persist-credentials: false`: checkout of `github.sha`, setup-node from `.nvmrc` with npm cache, `npm ci`, `npm run build` with `SITE_MODE=production`. Job `promote` (`needs: build`, the only job with `contents: write`, no npm install) checks that `origin/main` is an ancestor of the built commit and pushes `<sha>:refs/heads/main` without force, so it can only fast-forward. A shared concurrency group `content-branch` serialises publish and discard.
- `discard.yml`: same trigger and guard; one job with `contents: write` that pushes `origin/main` to `content` with `--force-with-lease=refs/heads/content:<dispatched sha>` (refuses if someone saved after the Action started) and logs the old and new commit ids.
- Actions used: `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683` (v4.2.2) and `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020` (v4.4.0), in `PINNED_ACTIONS` in `tools/export/export.ts`. **These SHAs were written from memory; no network was available to confirm them against the tags.** Check them (and whether newer majors should be used) before Phase 6: `git ls-remote https://github.com/actions/checkout refs/tags/v4.2.2` and the same for setup-node.

## Decisions and deviations from the contract text

- **`scripts/validate.ts`** instead of `scripts/validate.mjs` (template-contract §9 tree): Node 24 runs `.ts` directly and the script imports `src/core` TypeScript, so a `.mjs` would add nothing.
- **`src/core/cli/` and `src/core/gate/launch-check.ts` are exported** because the brief says "core copied verbatim, excluding core/tests". The contract tree says launch-check is excluded. Keeping it costs nothing at build time, and `src/core/cli/media-inventory.ts` is useful to regenerate CREDITS. Decide which text wins; the filter is one line in `coreFilter()`.
- **Lockfile** via `--package-lock-only` in a scratch dir instead of a full `npm install` in the output: the lock is identical, the export stays free of `node_modules`, and verify does the real clean `npm ci`.
- **Pages as one file entry each**, not one collection: a Pages CMS collection has one field list for all entries, which cannot express per-page `pageFields`.
- **Exported `src/core/package.json`** stays (verbatim copy). It is private and lists the same exact versions; npm ignores it.
- **`@types/node`** is an export devDependency because `astro check` type-checks `src/core` (which imports `node:fs`).
- **Telemetry:** verify sets `ASTRO_TELEMETRY_DISABLED=1`; the README tells the owner how to disable it. The exported scripts do not disable it (a client decision).

## Core, template and contract changes needed (not made here)

1. **content-contract §6.1 / fixture:** store `familyOwned` as `"yes"`/`"no"`/`"unknown"` in content files, so content written by the agent is already in the CMS form. Until then the export converts it.
2. **template-contract §9:** update the tree to `scripts/validate.ts`, decide on `cli/` and `launch-check.ts` (see above), mention `.github/workflows/` and that `package-lock.json` is resolved with `--package-lock-only`.
3. **`core/paths.ts`:** `provenanceDir` is `<root>/provenance`, but the export puts the archive in `docs/provenance/`. `check:launch` therefore cannot run inside an export. That is fine if the launch check stays a pre-handover step; otherwise add a fallback to `docs/provenance`.
4. **Template A manifest:** A renders `company.logo` (`LetterheadHeader.astro`) but does not declare a `company.logo` slot. Harmless for the CMS (the logo is always editable), but QA reading `imageSlots` would miss it.
5. **Template B manifest:** declares `service.card` (aspect `none`), but no B component renders `service.data.image`. The CMS therefore shows a service image field that has no visible effect. Either drop the slot or render it.
6. **Template A `package.json`:** `@fontsource/cormorant-garamond` is still a dependency although S3 replaced it with Literata; it ships in every A export. CREDITS lists only fonts referenced in source.
7. **Root `package.json` `test` script** runs only `--project unit`, so the new `tools` Vitest project is not part of `npm run check`. Suggest `vitest run --project unit --project tools`. (Root `package.json` is outside S5's write scope.)
8. **Root `eslint.config.mjs`** lints `exports/**` when exports exist (they pass today). Suggest adding `exports/**` to `ignores`.
9. **editable-fields §4.5:** say that pages are one CMS file entry each (labels "Stránka: …"), and §4.10 that collection image fields follow the manifest's slot prefixes.

## Phase 6 manual tests (the workflows cannot run here)

Use a throwaway private repository, as in `docs/spikes/pages-cms-manual-checks.md`. Record PASS / FAIL / NOTE with evidence.

1. **SHAs.** Confirm both action SHAs match their tags (`git ls-remote …`). Replace them in `PINNED_ACTIONS` if not, re-export.
2. **Repo setup.** Export the fixture (`--template dustojna-jednoduchost`), `git init`, commit everything to `main`, push. Create `content` from `main`, push, set `content` as the default branch. Leave `main` unprotected for now.
3. **Config loads.** Install the Pages CMS GitHub App on that repo only. Open it: expect no config errors. Write down every warning ("isn't valid and will be ignored"), especially for `actions` (`scope`, `confirm`), and the menu as listed in HANDOVER.md. If `confirm: true` or `scope: repo` is rejected, adjust `generatePagesConfig()` and re-export.
4. **Actions visible.** Both Actions appear; record where (repo level, per entry) and whether a collaborator can see and run them.
5. **Publish, happy path.** Edit a price label on `content`, save. Run "Zveřejnit změny". Expect: a `publish.yml` run on `content`, `build` fails (the fixture is not production-ready) and `promote` is skipped; `main` unchanged. Then make the content production-ready on `content` (or export `production-dustojna-jednoduchost` into the repo instead) and run again. Expect `build` green, `promote` green, `main` = `content` head (`git ls-remote origin main content`).
6. **Publish, failing gate.** Save a body with a phone number (G-030) or a price `amountMax` below `amount`. Run "Zveřejnit změny". Expect the build log to show the Czech gate message with file and field, `promote` skipped, `main` unchanged, production site unchanged.
7. **Fast-forward guard.** Push a commit directly to `main` that is not on `content`. Run "Zveřejnit změny" with valid content. Expect `promote` to fail with the Czech message and `main` to keep the extra commit.
8. **Discard.** Save two edits on `content`. Run "Zahodit nepublikované změny" and confirm. Expect `content` = `main`, the CMS shows the published values again, the run log prints both commit ids. Run it again with nothing to discard: expect "Nothing to discard", exit 0.
9. **Discard race.** Start "Zahodit…" and save an edit in the CMS while the run is queued. Expect the push to be refused by `--force-with-lease` and the new edit kept.
10. **Payload input.** Confirm the run shows a `payload` input from Pages CMS and that dispatching from the GitHub UI without a payload also works.
11. **Branch protection.** Protect `main` (require PR). Run publish: expect `promote` to fail. Then allow `github-actions[bot]` to bypass and run again. Record which setting worked; HANDOVER.md §4 describes it.
12. **Host.** Connect a static host: production from `main` with `SITE_MODE=production`, preview from `content` without it. After a successful publish, check that the host deployed `main` (a push by `GITHUB_TOKEN` does not trigger other workflows, but host webhooks should fire) and that the preview stays `noindex`.
13. **Wrong branch.** Dispatch `publish.yml` from `main` in the GitHub UI: expect both jobs skipped (the `if` guard).

## Not done / follow-ups

- Hosted-host files (`netlify.toml`, `_headers`) are not generated, per §9.5 (U17).
- The Pages CMS `actions` syntax (`scope`, `confirm`) is taken from the S2 source reading and is not validated against a live instance (test 3 above).
