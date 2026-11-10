---
name: site-ship
description: Print the step-by-step checklist for shipping a client site (export, verify, GitHub repo, static host, Pages CMS, content-branch workflow, launch check, manual tests). Executes nothing. Use when the user runs /site-ship <id> or asks how to put a client site live.
argument-hint: <client-id>
disable-model-invocation: true
---

# /site-ship <id>

Arguments: `$ARGUMENTS` (client id).

**Print a checklist. Do not run any command, create any repository, push, or change any setting.** The owner does every step by hand. Before printing, read `clients/<id>/src/site.config.ts` (template, `siteUrl`) and, if present, `clients/<id>/notes/feedback.md`, and fill in `<id>`, `<template>` and the domain below. Mention any blocker you can see (for example `siteUrl` still `https://example.invalid`). Keep the numbering; tick nothing.

Output this checklist, adapted:

## A. Prototype online (the client reviews a noindex test site)

1. `nvm use && npm run client:validate -- <id>` → `PROTOTYPE: PASS`.
2. `npm run client:export -- <id> --out ../<id>-web` → ends with `RESULT: PASS` (export + `export:verify`: clean `npm ci`, prototype build, production build failing with exactly the listed rules, `astro check`, offline build). The export carries README.md (Czech and English), HANDOVER.md (Czech, for the client) and CREDITS.md.
3. Create the repository from the export:
   ```
   cd ../<id>-web
   git init -b main && git add -A && git commit -m "Initial export"
   gh repo create <owner>/<id>-web --private --source . --push
   git push origin main:content
   gh repo edit <owner>/<id>-web --default-branch content
   ```
   `content` is where the CMS saves; `main` is what production deploys.
4. Static host (Cloudflare Pages suggested): connect the GitHub repo; build command `npm run build`; output directory `dist`; environment variable `NODE_VERSION` = the version in `.nvmrc`.
   - Production branch `main` with `SITE_MODE=production`. It fails to build while the production gate has errors. That is the gate working, not a hosting problem.
   - Preview branch `content` with no `SITE_MODE` (prototype: banner, `noindex`, `robots.txt` disallow). Send the client the preview URL.
   - Trial run (whole flow online before the facts are confirmed): leave `SITE_MODE` unset on `main` as well, and add the GitHub repository variable `PUBLISH_MODE` = `prototype`. "Zveřejnit změny" then gates in prototype mode and `main` is a noindex test site. At go-live (B) delete the variable and set `SITE_MODE=production` on `main`.
5. Pages CMS: sign in at `https://app.pagescms.org` with GitHub, install the Pages CMS GitHub App on **this repository only**, open it on the `content` branch. Expect no configuration errors; note any warnings. Invite the client's editors as collaborators.
6. The content-branch workflow (explain to the client; HANDOVER.md §2 has the Czech text, §4 the one-time setup):
   - edits are saved to `content` and appear on the preview site;
   - the CMS action **Zveřejnit změny** runs `publish.yml`: a production build with the gate, then a fast-forward of `main`, which the host deploys;
   - **Zahodit nepublikované změny** runs `discard.yml` and resets `content` to `main`;
   - a failing gate stops publishing, and the Action log names the field in Czech.

## B. Go-live (only when the facts are confirmed)

7. Collect the client's confirmations and sign-offs with `/site-revise <id>` until, in the template-system repo:
   - `npm run client:validate -- <id>` reports no production errors;
   - `npm run check:launch -- clients/<id>` prints `PASSED: ready for public launch.` (L-001 to L-008: production gate, every displayed fact VERIFIED or approved CLIENT_PROVIDED and equal to the ledger, nothing UNKNOWN shown, copy approved, pricing and guidance signed off, image rights recorded).
8. Set the real domain in `clients/<id>/src/site.config.ts` (`siteUrl`, G-012) before the final export.
9. Re-export to a scratch folder and copy it over the repository without touching `.git` (`--force` deletes the whole folder, including `.git`):
   ```
   npm run client:export -- <id> --force
   rsync -a --delete --exclude .git exports/<id>/ ../<id>-web/
   ```
   The verify step should now report the production build **passing** with a sitemap. Commit and push to `main`, then `git push origin main:content`.
10. In the exported repo, run the launch check once more against the archived ledger: `node src/core/cli/check-launch.ts`.
11. Point the domain at the host, check HTTPS, and confirm `/robots.txt` allows indexing and `/sitemap.xml` exists on production.
12. After handover the client repo owns the content. Do not re-export over CMS edits; template updates are a separate, reviewed change.

## C. First client only: S5 manual tests

13. Run the 13 manual checks in `docs/notes/s5-export.md` ("Phase 6 manual tests") on this repository or a throwaway copy and record PASS / FAIL / NOTE: action SHAs, repo setup, CMS config loads, Actions visible, publish happy path, publish with a failing gate, fast-forward guard, discard, discard race, payload input, branch protection, host deploys, wrong-branch dispatch.
