# Setting up one client

Every step here is done by a person from the agency. Nothing is automated against GitHub, DecapBridge, Netlify or Cloudflare. `/site-ship <id>` prints this as a checklist filled in for the client.

Hosting is **Netlify** (both Hnátek variants, and needed for the contact form) or **Cloudflare Workers** (no contact form). Either way GitHub Actions build and deploy; the host never builds the repository itself.

Related: [decapbridge.md](decapbridge.md) · [publishing.md](publishing.md) · [security.md](security.md)

## 1. What each client needs

| Thing | Owner | Cost | Holds |
| --- | --- | --- | --- |
| Private GitHub repository `<owner>/<id>-web` | agency or client | free (GitHub Free; Actions: 2,000 min/month for private repos) | the exported site and its content |
| DecapBridge site | agency account | free plan: 3 sites, 10 editors per site; Pro $9/month for more | the GitHub token (server-side), editor accounts |
| Netlify project (or Cloudflare account with two Workers) | client or agency | free plan covers a static site and the form | production deploys, the `preview` deploy, form submissions |
| Domain | client | – | DNS pointed at the host |

Each Hnátek variant is its own client here: its own repository, DecapBridge site and Netlify project. `client:export` refuses two clients with the same repository, DecapBridge site, Netlify project or Worker, and refuses the agency's own repository.

## 2. `clients/<id>/publishing.json`

```json
{
  "repository": "<owner>/<id>-web",
  "decapbridge": { "siteId": "<uuid from the DecapBridge dashboard>", "authType": "classic" },
  "hosting": { "provider": "netlify", "siteId": "<Netlify Project ID>" }
}
```

For Cloudflare: `"hosting": { "provider": "cloudflare", "workerName": "<id>-web" }`.

- Only non-secret values. Tokens never go into this repository or the export.
- `null` for anything not known yet. The export then writes `DOPLNIT`: `/admin/` shows "Správa obsahu zatím není připojená" instead of a login, and a Netlify deploy fails with "project not found".
- `authType`: `classic` = e-mail and password inside the Decap login (the default); `pkce` = DecapBridge's login page with Google / Microsoft as well ([decapbridge.md](decapbridge.md) §3).
- Optional `decapbridge.authUrl` / `gatewayUrl` override `https://auth.decapbridge.com` and `https://gateway.decapbridge.com` (only for a self-hosted DecapBridge).
- The contact form (`site.config.ts` → `features.contactForm` with `contactFormHandler: "netlify"`) needs `hosting.provider` = `netlify`; the export refuses anything else.

Current state (2026-11-12): both clients use Netlify; `repository` is `SmejkalJakub/hnatek-web` and `SmejkalJakub/hnatek-b-web` (both repositories updated to this setup, `main` = `content`); hnatek has its DecapBridge site (`edb0b539-…`) and Netlify project `hnatek` (`df5ff8c4-…`), exported and pushed as `ea05391`, preview deployed; hnatek-b's ids are still `null`. Both have the contact form on. hnatek-web `content` also has `ea87e18` (editor publishing, "Zveřejnit změny"); the live admin shows that entry only after the next publish. The repositories still have the old Cloudflare Workers Builds Git connection (its builds now fail) and the Pages CMS app; both must be disconnected.

## 3. GitHub repository

1. Create an empty **private** repository `<owner>/<id>-web`. Not the agency repository, not shared with another site.
2. Fill `repository` in `publishing.json`.
3. Export and push (after §4 and §5, so the export has the DecapBridge site id and the Netlify Project ID):
   ```
   npm run client:export -- <id> --out ../<id>-web
   cd ../<id>-web
   git init -b main && git add -A && git commit -m "Initial export"
   git remote add origin git@github.com:<owner>/<id>-web.git
   git push -u origin main
   git push origin main:content
   gh repo edit <owner>/<id>-web --default-branch content
   ```
   Pushing `.github/workflows/` over HTTPS needs the `workflow` scope (`gh auth refresh -s workflow`); SSH needs nothing extra.
4. Settings → Actions → General: allow GitHub Actions; "Workflow permissions" may stay "Read" (the workflows request `contents: write` only in the jobs that push).

The push to `content` already runs `preview.yml`: integrity check and build run, the deploy step is skipped until `DEPLOY` is set (§5).

## 4. DecapBridge

1. Sign in at <https://decapbridge.com> (agency account).
2. Create a **fine-grained** GitHub personal access token (<https://github.com/settings/personal-access-tokens>):
   - Resource owner: the repository owner; Repository access: **Only select repositories** → `<owner>/<id>-web`.
   - Permissions: **Contents: Read and write** (Metadata: Read is added automatically). Nothing else: no Workflows, Actions, Secrets, Variables, Administration or Pull requests (the editorial workflow is not used).
   - Expiry: the longest your policy allows; put the date in the agency calendar. An expired token stops all saves.
3. DecapBridge → Add site: repository `<owner>/<id>-web`, the token, auth type "Classic", CMS URL `https://preview--<project>.netlify.app/admin/` for now (change it to the real domain at go-live).
4. Copy the site id from the generated `config.yml` (the UUID in `/sites/<id>`) into `publishing.json` → `decapbridge.siteId`.
5. After the export, compare the dashboard's `backend:` block with `public/admin/config.yml`. They must agree on `name`, `repo`, `identity_url` (or the PKCE endpoints) and `gateway_url`; `branch` is `content` in ours on purpose.

## 5. Netlify

1. Create the project **without Git**: Add new project → **Deploy manually** (drag in any folder, e.g. an empty one with an `index.html`), or `npx netlify-cli@27.15.0 sites:create --name <id>-web --disable-linking` (creates an empty project not associated with any Git remote). Never "Import an existing project" from GitHub.
2. Project configuration → General → Project details: copy the **Project ID** into `publishing.json` → `hosting.siteId`. The project name gives the URLs: production `https://<project>.netlify.app`, preview `https://preview--<project>.netlify.app`.
3. Project configuration → Developer settings → Continuous deployment → Build settings → Configure: if a repository is linked, unlink it; set **Build status → Stopped builds** ("Netlify will never build your site"; manual deploys, which the workflows use, keep working). (The exported `netlify.toml` also cancels any Git-triggered build with `ignore = "exit 0"`, as a second guard.)
4. **Forms → Enable form detection.** Netlify then finds the contact form in each new deploy. Then, in the project's notification settings, add a **form submission e-mail notification** (form `kontakt`) → the address that should receive the messages (the client decides; until then the agency's own address for the trial).
5. Create a personal access token: User settings → Applications → Personal access tokens → New access token, with an expiry date. **It can manage every project the Netlify user can reach**, so use a Netlify account (or team) that holds only this client's projects ([security.md](security.md) §4).
6. In the GitHub repository → Settings → Secrets and variables → Actions:
   - secret `NETLIFY_AUTH_TOKEN`;
   - variable `DEPLOY` = `true`;
   - for the trial before go-live, variable `PUBLISH_MODE` = `prototype`.
7. Re-export with the filled `publishing.json` (it now has the Netlify Project ID in the deploy steps) and push to both branches:
   ```
   npm run client:export -- <id> --out ../<id>-web --force
   ```
   Then in `../<id>-web`: `git add -A && git commit -m "Export with publishing settings" && git push origin main && git push origin main:content` (only while `content` has no CMS edits yet; later re-exports keep the content, see [publishing.md](publishing.md) §7).
8. First deploys: `gh workflow run preview.yml --ref content` → draft deploy `https://preview--<project>.netlify.app`; `gh workflow run publish.yml --ref content` → production `https://<project>.netlify.app` (a noindex test site while `PUBLISH_MODE` = `prototype`).
   New Netlify projects may protect non-production deploys with a Netlify team login (the `preview--` URL answers 401 and redirects to `app.netlify.com/edge-access`). Editors without a Netlify account cannot open it. Either switch that protection off in the project's visitor access settings, or give editors the production URL during the trial (it is a noindex prototype while `PUBLISH_MODE` = `prototype`) and set DecapBridge's CMS URL to it.
9. Domain at go-live: Domain management → Add a domain → the client's domain; point DNS as Netlify shows (or move the DNS to Netlify). Netlify issues the certificate.

### Testing the contact form

- Test on the **production** URL (`https://<project>.netlify.app/kontakt/`) after a trial publish. Whether Netlify accepts form posts on the `preview--` draft deploy is not documented; try it, but rely on production.
- Fill in the form and send it: the browser lands on `/kontakt/odeslano/` ("Děkujeme, zprávu jsme přijali"); the message appears under **Forms → kontakt** and in the notification e-mail. Fields: `jmeno`, `telefon-nebo-email`, `zprava`.
- If the browser shows a Netlify 404 after sending: form detection was off when that deploy was made. Switch it on and run `publish.yml` again.
- Spam: Netlify filters every submission with Akismet; the form also has a hidden honeypot field (`bot-field`). Filtered messages are under Forms → Spam submissions.
- Before go-live, the privacy page must say what the form collects, why, how long it is kept and that Netlify (USA) processes it. Today it is placeholder text, so the production gate (G-031) blocks publishing anyway.

## 5b. Cloudflare instead of Netlify (no contact form)

1. `publishing.json` → `"hosting": { "provider": "cloudflare", "workerName": "<id>-web" }`; the export writes `wrangler.jsonc` (Workers Static Assets, Worker `<id>-web` and `<id>-web-preview`).
2. API token: My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers", scoped to the client's account. Note the account id.
3. GitHub secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; variable `DEPLOY` = `true` (and `PUBLISH_MODE` for the trial).
4. **Do not** connect Workers Builds or Cloudflare Pages to the repository.
5. First deploys as in §5.8; the preview is `https://<id>-web-preview.<subdomain>.workers.dev`. Domain: Workers & Pages → `<worker>` → Settings → Domains & Routes → Custom domain.
6. Wrangler runs pinned as `npx wrangler@4.155.0` in the workflows.

## 6. Editors

DecapBridge → the site → Manage collaborators → enter the editor's e-mail → send. The editor gets an e-mail, sets a password and logs in at `https://<domain>/admin/` (before go-live: the preview URL + `/admin/`). No GitHub account. Give them [handover.md](handover.md) (Czech). Removing access: the same tab.

## 7. Adding another client

1. `npm run client:new -- <id> --template <template>`, research, build, revise ([../client-workflow.md](../client-workflow.md)).
2. Create `clients/<id>/publishing.json` (copy one, `null` for the values not known yet).
3. §3 to §6. Nothing in shared code changes per client: the generator reads the template manifest and the client's files.

## 8. Testing the editor locally (agency)

```
npm run client:export -- <id>
cd exports/<id> && npm ci && npm run build
npx decap-server@3.11.6          # terminal 1: local Git proxy on port 8081, writes into this folder
python3 -m http.server 8090 -d dist   # terminal 2 (any static server works)
```

Open <http://localhost:8090/admin/> and click "Přihlásit": with `local_backend: true` and a `localhost` address, Decap uses `decap-server` instead of DecapBridge and saves straight into the folder's files.

The contact form cannot be sent locally (a static server does not accept the POST); it is tested on Netlify (§5).
