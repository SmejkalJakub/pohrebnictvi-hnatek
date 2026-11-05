# Pages CMS: manual checks

Run these yourself with a **throwaway GitHub repository** and your own Pages CMS login. Nothing here was done by the spike: no repository was created, no OAuth app authorised, no sign-in made. Findings behind each check: [pages-cms.md](pages-cms.md). Config under test: [pages-cms.example.yml](pages-cms.example.yml).

Record each result as PASS / FAIL / NOTE with the evidence named in the step (diff, screenshot, path string).

## 0. Setup (about 20 minutes)

1. Create a private repo `pages-cms-spike`. Copy in `fixtures/neutral/src/` as `src/` and `core/` is **not** needed for steps 1–9 (only for step 10).
2. Copy `docs/spikes/pages-cms.example.yml` to `.pages.yml` in the repo root. Commit to `main`.
3. Open <https://app.pagescms.org>, sign in with GitHub, install the GitHub App on that repo only. Note the permissions GitHub shows (the docs list two different sets). Result: ______
4. Open the repo in Pages CMS. Expected: no config errors and no warnings. If a warning says a property "isn't valid and will be ignored", write down which. Check in particular the shared `image-ref` component: does a field using `component: image-ref` with `label` and `required: false` keep its override? If not, expand the component inline.

## 1. Menu and locked areas (Phase 6 action 5)

1. List the left menu. Expected: Nonstop převoz zesnulých, Firma a kontakt (Firma, Kontakt, Otevírací doba), Ceník, Stránky, Služby, Jak postupovat, Rakve, Květiny, Obrázky. No Články, no Settings, no code.
2. Search all forms for anything about colours, layout, fonts, navigation order, template, routes. Expected: none.
3. Try URL tampering while signed in: open `/<owner>/<repo>/main/file/…` for a path outside the declared entries (for example `src/site.config.ts`, `package.json`). Expected: not editable. If it opens, stop and record the URL.

## 2. Singleton JSON diffs

For each of `company`, `contact`, `office-hours`, `emergency`, `pricing`: open, change nothing, press Save, then look at the commit diff on GitHub.

- Is the file only re-formatted (2-space indent, no trailing newline), or did keys disappear? List every disappeared key. Expect nulls, `""`, `[]` and `{}` to vanish; `false`/`0` stay.
- `company.json`: `legalIds` is all-null, so it should vanish. Then run `core` content validation on the committed file (step 10). Expected: fails until contract amendment A1 is applied.
- `contact.json`: did `geo`, `locationId`, `department`, `id` survive on every list item?
- After the first save, edit one value and save again: is the diff only that line?
- Save with `settings.content.merge` set to `false` once (edit `.pages.yml` on the branch) and compare: undeclared keys should be stripped. Add a test key `"zzz": 1` to `emergency.json` by hand to see both behaviours.

## 3. Field behaviour (record exact messages)

1. Phone: enter `+420 123`, then `+420123456789`. Pattern message in Czech? Blocked on save?
2. Required string: clear `brandName`. Message? Save blocked?
3. Number: clear a **required** number (use `guidance.order`) and save. Expected per source: empty becomes `0`. Also try `18900.5` in a price: accepted by the CMS?
4. Select: set `status` to the demo/approved options; check the labels shown and the values written (`demo`/`approved`).
5. Date: open `pricing` with `validFrom: null` and `guidance` with empty `reviewedAt`. Expected: stay empty (`default: ""`). Remove `default: ""` temporarily and confirm today's date appears (this proves finding B4).
6. Hidden: confirm hidden fields (`placeholder`, `priceGroupId`, `emergency.label`) are not shown but remain in the saved file.
7. New list item: add a phone, a price item, a price group and an hours row. Can each be saved? Which hidden/required field blocks it (toast only)? Is `id` written, and as what? (Finding B7.)
8. Add a second row to `locations` (limit `max: 1`): is the Add button disabled?
9. Optional image object: open a service with no image, save. Expected: no `image` key, no error. Set `default: null` off for `rightsConfirmed` and compare (finding B6).

## 4. Collections and slugs

1. Pages: confirm there is no Create and no Delete button, and that Rename is not offered. Then try calling the API from the browser console with a DELETE (use the network tab to copy a delete request shape from a service) against a page file. Expected: 403.
2. Services: create an entry titled `Převoz zesnulých – přes den`. Which file name results? Expected ASCII (`prevoz-zesnulych-pres-den.md`). Try `Úprava č. 1 / ř`. Create a second entry with the same title: name collision handling.
3. Rename an existing service title and save: file name must not change.
4. Delete a service and check the commit; create it again from the history list on GitHub (revert is not in the UI).
5. Diff of a Markdown entry after a no-change save: frontmatter re-quoted or folded? Body untouched? List every difference.

## 5. Images and media (Phase 6 action 4)

1. Upload `Přední Pohled.JPG` through the Obrázky tab and through an image field. Which file name is committed (`rename: safe`)? 
2. Open the content file: write down the exact `file:` string. Expected `src/assets/media/<name>`. Run `normalizeMediaFile` on it (step 10) and confirm the basename.
3. Change `output` to `/src/assets/media` and to `../../assets/media`, upload again, record the string for each; normalise each.
4. Upload a file with the same name twice. Overwrite, error or renamed?
5. Upload a 12 MB image and a `.gif`. Is either rejected by the CMS? (The 8 MB limit is not expected to be enforced.)
6. In the Obrázky tab create a subfolder and upload there. Then reference it. The build should fail with G-003; record the message.
7. Replace an image on a service: set `file`, `alt`, `source`, `depicts`, `rightsConfirmed`. Try saving with empty `alt` and with `source = placeholder`.
8. Open an entry whose image has `source: placeholder` and save without touching it. Expected: saves (the select has the placeholder option). Remove that option from the config and repeat: expected "Invalid option" (finding B5).

## 6. Rich text

1. Open a page body and a service body. Type text and use the `/` menu: which items exist (H1–H3, table, code block, quote)? Confirm the Source tab is gone (`switcher: false`) and no image option appears (`media: false`).
2. Create `# Nadpis`, `<u>`-style underline, a table, a link `javascript:alert(1)`, a phone number `+420123456789`, and text with `+`, `_`, `*`. Save and read the committed Markdown.
3. Run the core restricted-body check (step 10) on each result. Record which items the build rejects and which slip through. Expect H1, underline HTML and phone numbers to be rejected by the build.
4. Re-open an existing body with `- ` bullets and save one edit: are bullet markers, blank lines, escapes or line wraps changed elsewhere?

## 7. Branches, preview and history (Phase 6 actions 1 and 6)

1. Open the branch menu. As the owner, create branch `content`. Make `content` the repository default on GitHub (Settings, Branches). Reopen Pages CMS. Does it land on `content`? Does the editor see `main` in the branch list, and can they create branches?
2. Enable a branch preview on the host you will use (Cloudflare Pages or similar) for `content`. Edit one price in Pages CMS. Is the preview URL updated and non-indexed? (Phase 6 action 1: the price must show with "UKÁZKA".)
3. Protect `main` (require pull request). Save while the editor sits on `main`. Record the error shown.
4. Add `.github/workflows/publish.yml` on `content`: `workflow_dispatch` with an `inputs.payload` string, build with `SITE_MODE=production`, push `content:main` only if the build passes. Add the two Actions from amendment A5 to `.pages.yml`. Press "Zveřejnit změny". Is the run status visible in the CMS? Does a failing build leave `main` unchanged?
5. History: open an entry's history. Is there any restore button? Expected: no. Test the "discard unpublished changes" action (reset `content` to `main`) and the fix-forward path.
6. Config cache: edit `.pages.yml` on the default branch and reload Pages CMS. How long before the change appears? Does the Settings/cache refresh exist for a collaborator?

## 8. Collaborators (the non-technical editor)

1. Invite a second e-mail address as collaborator (needs no GitHub account). Describe the sign-in flow (code, link).
2. As the collaborator: can they open `.pages.yml`, Settings, branches, Actions? Create a branch? Run the publish Action? Re-run? Record exactly.
3. Commit author on GitHub: app identity or the collaborator (`settings.commit.identity: user`)?
4. Check the commit message template output in Czech with diacritics.

## 9. Phase 6 actions (hnatek-test-plan.md)

| # | Action | Steps | Evidence |
| --- | --- | --- | --- |
| 1 | Edit a sample price | step 7.2 | preview shows new value with "UKÁZKA" |
| 2 | Change office hours, keep nonstop separate | edit `weekly`, then try `00:00`–`24:00` | nonstop is a separate menu entry; build rejects the 24-hour block with the Czech message pointing to the emergency section |
| 3 | Update a service description | edit summary and body | restricted Markdown rules (step 6) |
| 4 | Replace an approved image | step 5.7 | alt required; `rightsConfirmed` toggle |
| 5 | Try to change layout or colours | step 1.2 | no such fields; no `.pages.yml` access for collaborator |
| 6 | Recover from malformed content | save a body with `# H1` or a bad price (`amountMax` below `amount`), publish | build fails, `main` unchanged, fix in CMS or revert on GitHub; record what the editor sees |

## 10. Core round trip (optional, once the repo has `core/`)

For every file Pages CMS committed in the steps above, run the repo's content validation and the production gate. Expected: files saved without edits validate. Every FAIL here is a contract amendment candidate (A1–A8).

## Results table

| Step | Result | Evidence (commit, screenshot, string) |
| --- | --- | --- |
| 0.3 App permissions | | |
| 0.4 Component override | | |
| 2 Singleton diffs | | |
| 3.3 Empty required number | | |
| 3.7 New list rows | | |
| 4.2 Czech slugs | | |
| 5.2 Stored image path | | |
| 6.2 Rich-text output | | |
| 7.1 Landing branch | | |
| 7.4 Publish workflow | | |
| 8.2 Collaborator rights | | |
