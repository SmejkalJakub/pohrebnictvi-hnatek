---
name: site-ship
description: Print the step-by-step checklist for shipping a client site (publishing.json, export, verify, GitHub repo, DecapBridge, Netlify or Cloudflare Workers, contact form, content-branch workflow, launch check, manual tests). Executes nothing. Use when the user runs /site-ship <id> or asks how to put a client site live.
argument-hint: <client-id>
disable-model-invocation: true
---

# /site-ship <id>

Arguments: `$ARGUMENTS` (client id).

**Print a checklist. Do not run any command, create any repository, push, or change any setting.** The owner does every step by hand. Before printing, read `clients/<id>/src/site.config.ts` (template, `siteUrl`), `clients/<id>/publishing.json` and, if present, `clients/<id>/notes/feedback.md`, and fill in `<id>`, `<template>`, the hosting (`hosting.provider`: Netlify project ID or Worker name) and the domain below. Print only the hosting steps of that provider. Mention any blocker you can see (for example `siteUrl` still `https://example.invalid`, `repository` / `decapbridge.siteId` / `hosting.siteId` still `null`, or `features.contactForm` on while the privacy page is a placeholder). Keep the numbering; tick nothing. Details for every step: `docs/cms/setup.md`.

Output this checklist, adapted:

## A. Prototype online (the client reviews a noindex preview and tries the editor)

1. `nvm use && npm run client:validate -- <id>` → `PROTOTYPE: PASS`.
2. Create the client's private repository (empty) `<owner>/<id>-web`, then fill `clients/<id>/publishing.json`: `repository` = `<owner>/<id>-web`. Never the template-system repository; `client:export` refuses one used by another client.
3. DecapBridge (https://decapbridge.com, free plan: 3 sites): create a fine-grained GitHub token for **only** `<owner>/<id>-web` with *Contents: Read and write* (and *Metadata: Read*). **No Workflows, Actions, Secrets or Administration permission.** Add the site in DecapBridge with that token, auth type "Classic" (e-mail + password), CMS URL `https://<preview URL>/admin/` (Netlify: `https://preview--<project>.netlify.app/admin/`). Copy the site id from the generated config into `publishing.json` → `decapbridge.siteId`, and compare the dashboard's `backend:` block with `public/admin/config.yml` after the export.
4. Hosting project first, so the export knows its id:
   - **Netlify:** Add new project → Deploy manually (never import from GitHub), or `npx netlify-cli@27.15.0 sites:create --name <id>-web --disable-linking`. Copy the Project ID into `publishing.json` → `hosting.siteId`. Set Build status → Stopped builds. **Forms → Enable form detection**, and add a form submission e-mail notification. Create a personal access token with an expiry (it reaches every project of that Netlify user: use an account or team for this client only).
   - **Cloudflare:** `hosting` = `{ "provider": "cloudflare", "workerName": "<id>-web" }`; API token from the "Edit Cloudflare Workers" template. No contact form on Cloudflare.
   Then `npm run client:export -- <id> --out ../<id>-web` → ends with `RESULT: PASS` (or only the known `astro check` failure, see docs/cms/testing.md). The export carries the Decap admin, `netlify.toml` or `wrangler.jsonc`, the workflows with the integrity manifest, README.md, HANDOVER.md and CREDITS.md.
5. Push the export:
   ```
   cd ../<id>-web
   git init -b main && git add -A && git commit -m "Initial export"
   git remote add origin git@github.com:<owner>/<id>-web.git && git push -u origin main
   git push origin main:content
   gh repo edit <owner>/<id>-web --default-branch content
   ```
6. GitHub → Settings → Secrets and variables → Actions: Netlify secret `NETLIFY_AUTH_TOKEN` (Cloudflare: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), variable `DEPLOY` = `true`, and for the trial `PUBLISH_MODE` = `prototype`. **Do not** connect Netlify, Workers Builds or Pages to the repository through Git.
7. Run `gh workflow run preview.yml --ref content` → Netlify `https://preview--<project>.netlify.app` (Cloudflare: Worker `<worker>-preview` on workers.dev) shows the noindex preview. Send the client the preview URL and its `/admin/`. With the form: run `gh workflow run publish.yml --ref content` (trial, `PUBLISH_MODE` = `prototype`), send a test message from `https://<project>.netlify.app/kontakt/` and check Forms → kontakt and the e-mail.
8. Invite the client's editors in DecapBridge (Manage collaborators → e-mail). They set a password from the e-mail; no GitHub account.
9. Explain the content-branch workflow (HANDOVER.md §2 in Czech):
   - "Uložit do náhledu" saves to `content`; `preview.yml` rebuilds the preview;
   - editors publish by saving the last menu entry "Zveřejnit změny" (commits `src/content/publish/request.json`, which starts `publish.yml`); the agency can also run `gh workflow run publish.yml --ref content` (integrity check → production gate → deploy → fast-forward `main`);
   - `gh workflow run discard.yml --ref content` resets `content` to `main`;
   - a failing gate or integrity check stops publishing; the Action log names the field in Czech.

## B. Go-live (only when the facts are confirmed)

10. Collect the client's confirmations and sign-offs with `/site-revise <id>` until, in the template-system repo:
    - `npm run client:validate -- <id>` reports no production errors;
    - `npm run check:launch -- clients/<id>` prints `PASSED: ready for public launch.` (L-001 to L-008: production gate, every displayed fact VERIFIED or approved CLIENT_PROVIDED and equal to the ledger, nothing UNKNOWN shown, copy approved, pricing and guidance signed off, image rights recorded).
11. Set the real domain in `clients/<id>/src/site.config.ts` (`siteUrl`, G-012) before the final export.
12. Re-export to a scratch folder and copy it over the repository without touching `.git` (`--force` deletes the whole folder, including `.git`). If the client already edited content in the CMS, also keep their content (`--exclude src/content --exclude src/assets/media --exclude src/assets/documents`); the integrity manifest covers only non-content files, so it stays valid:
    ```
    npm run client:export -- <id> --force
    rsync -a --delete --exclude .git exports/<id>/ ../<id>-web/
    ```
    The verify step should now report the production build **passing** with a sitemap. Commit and push to `content` (this changes workflow files, so use your own GitHub login, not the CMS).
13. In the exported repo, run the launch check once more against the archived ledger: `node src/core/cli/check-launch.ts`.
14. Domain: Netlify → Domain management → Add a domain (DNS as Netlify shows); Cloudflare → Workers → `<worker>` → Settings → Domains & Routes. With the form: the privacy page must describe it and the client must have named the recipient. Delete the GitHub variable `PUBLISH_MODE`. Run `gh workflow run publish.yml --ref content`. Check HTTPS, `/robots.txt` allows indexing, `/sitemap.xml` exists, `/admin/` shows the login. In DecapBridge set the CMS URL to `https://<domain>/admin/`.
15. After handover the client repo owns the content. Template updates are re-exports copied over everything except content (step 12), reviewed and pushed by the agency.

## C. First client only: manual tests

16. Run the manual checks in `docs/cms/testing.md` ("Hosted checks") on a throwaway copy and record PASS / FAIL / NOTE: DecapBridge login, edit and save, preview deploy, publish with a failing gate, publish happy path, integrity check against a direct push, discard, rollback, contact form.
