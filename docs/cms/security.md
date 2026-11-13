# Security

Related: [decapbridge.md](decapbridge.md) §4 · [publishing.md](publishing.md)

## 1. What we protect

1. The live website: only reviewed content that passed the publication gate, built by code the agency shipped.
2. The agency's source repository: never reachable with client credentials.
3. Other clients: one client's credentials never reach another client's site.
4. Secrets: no token or password in the repository, the export or the built site.

## 2. Facts that shape the design

- `/admin/` is public by design. Anyone can load the editor; only DecapBridge decides who can save. Hiding fields in the editor is not a security boundary.
- The DecapBridge gateway forwards any `git`, `contents`, `branches`, `merges`, `commits`… call for the repository, on **any branch and path**, for any logged-in editor ([decapbridge.md](decapbridge.md) §4). The editor UI only offers content files, but the API does not care.
- A fine-grained token with *Contents: write* cannot be limited to paths or branches.
- **GitHub Free does not enforce branch protection or rulesets on private repositories.** "Only the workflow may push to `main`" cannot be configured.
- GitHub refuses changes to `.github/workflows/` pushed with a token that lacks the *Workflows* permission. This is the one path restriction GitHub enforces without a paid plan.

So: whoever holds an editor session (or the token, or DecapBridge itself) can write `main`, `content`, build code and content. Branch names alone protect nothing.

## 3. What stops tampering from reaching production

**Production is deployed only by `publish.yml`**, never by a host watching a branch. The workflow file cannot be changed with the CMS token (no *Workflows* permission), and the hosting token (Netlify or Cloudflare) lives in GitHub Actions secrets, which the CMS token cannot read. The Netlify project is not linked to Git and has stopped builds; the exported `netlify.toml` also cancels any Git-triggered build (`ignore = "exit 0"`), and it is itself a locked file.

**`publish.yml` (and `preview.yml`) first run the integrity check:**

- The export computes the SHA-256 of every file that is not CMS content and embeds the list in the workflow files (`tools/export/integrity.ts`).
- CMS content is: `src/content/<collection>/<file>.md|.json` (one level, those extensions only), `src/assets/media/<file>.jpg|.jpeg|.png|.webp|.avif`, `src/assets/documents/<file>.pdf`, and the workflow files themselves.
- Before `npm ci`, the run checks that the tracked non-content files are exactly the listed ones with exactly the listed hashes. A changed `astro.config.mjs`, gate, template, `package.json`, `public/admin/config.yml`; an added `src/pages/x.astro`, `src/content/config.ts` (Astro would execute it) or SVG upload; a deleted file: the run fails before any code from the repository executes.
- Tested with the real bash step on real Git repositories (`tools/export/tests/export-parts.test.ts`) and on each export (`export:verify`).

Consequences:

| Attack or mistake | Result |
| --- | --- |
| Editor writes invalid content (demo price, placeholder, unconfirmed rights) | preview builds with markers; publish fails at the gate; live site unchanged |
| Editor session used to change code or the CMS config | preview and publish fail at the integrity check; live site unchanged |
| Push directly to `main` | nothing deploys from `main`; the next publish fast-forward fails because `main` diverged (agency investigates) |
| Push to `.github/workflows/` with the CMS token | refused by GitHub |
| Build code exfiltrating the hosting token | impossible without first passing the integrity check; the token is only in the deploy step's environment |
| Editor session edits `netlify.toml`, `_redirects` or `_headers` | locked files: preview and publish fail at the integrity check |

## 4. Remaining risks (accepted for the proof of concept)

| Risk | Severity | Note / mitigation |
| --- | --- | --- |
| A compromised editor session or DecapBridge can rewrite `content` and `main`, delete branches, or add junk commits | medium: availability and history, not the live site | the live site stays as last published; recover from any clone or the run logs. Keep a mirror clone at the agency |
| Content itself is attacker-controlled once someone has an editor session (defacing text, wrong phone numbers) | medium | editors publish from the editor ("Zveřejnit změny"), so such content goes live if it passes the gate; no human review before publishing. Mitigations: few editor accounts, the agency watches publish runs (GitHub e-mails, Netlify deploy notifications), quick fix-forward or Netlify rollback |
| The preview shows whatever `content` holds after a passing integrity check | low | noindex; on Netlify a draft deploy (`preview--<project>.netlify.app`), on Cloudflare a workers.dev Worker (optionally behind Cloudflare Access) |
| Netlify preview drafts live in the same project as production | low | "Publish deploy" on a `preview` draft would put a prototype build live; roll back only to deploys marked Production |
| `preview.yml` runs on every push; a flood of commits burns Actions minutes | low | concurrency cancels older runs; GitHub Free gives 2,000 min/month |
| The Cloudflare token can edit every Worker in the client's account | low | only `publish.yml` and `preview.yml` see it, after the integrity check; use a dedicated account per client |
| The Netlify personal access token can manage **every** project and setting the Netlify user can reach (Netlify has no per-project tokens) | medium | only the deploy steps see it, after the integrity check; give it an expiry; use a Netlify account or team that holds only this client's projects, never the agency's main account |
| The GitHub token in DecapBridge expires or is revoked | operational | saves fail with an error in the editor; renew in DecapBridge |
| `npx wrangler@4.155.0` / `npx netlify-cli@27.15.0` download at deploy time (registry checksum, not lockfile) | low | pinned versions; could move into the export's `package-lock.json` later |
| Contact form messages (name, phone or e-mail, free text) are stored by Netlify (USA) | data protection | needs a privacy page that names it and a retention habit (delete old submissions in Forms); a processing agreement with Netlify (its DPA). Not done: the privacy page is a placeholder, so production stays blocked |
| Form spam | low | Akismet filtering by Netlify on every submission, plus the honeypot field; reCAPTCHA can be added later |
| Someone with GitHub access edits a locked file by hand | – | publish fails until the agency re-exports; intended |

**Production readiness:** acceptable for a pilot with a few trusted editors who publish themselves (the gate and the integrity check run on every publish). Before many clients: a GitHub plan with branch rulesets (Team, or a public repository), or a GitHub App instead of a personal token, and an alert on any push to `main` that did not come from `publish.yml`.

## 5. Secrets

- None in this repository, `publishing.json` or the export. `export:verify` scans every text file of the export for GitHub, GitLab, AWS and Cloudflare token formats and private keys (Netlify tokens have no recognisable prefix, so the scan cannot see one; they belong only in GitHub secrets) (`tools/export/cms-checks.ts`), and the static scan already rejects agent files and local paths.
- `/admin/config.yml` holds only the repository name, the DecapBridge site id and public hostnames.
- The editor's session token is kept by Decap in the browser's `localStorage` for the site's origin. Every script on that origin could read it, which is why only raster images may be uploaded and the editor bundle is self-hosted and hash-checked.

## 6. Separation between sites

`client:export` reads every `clients/*/publishing.json` and refuses an export when two clients share a repository, a DecapBridge site, a Netlify project or a Worker name, or when a client names the agency's own repository (`git remote get-url origin`). Each site's token in DecapBridge is limited to its own repository.
