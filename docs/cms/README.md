# CMS: Decap CMS with DecapBridge

**Status:** proof of concept, implemented and tested locally on 2026-11-12. Hosted parts (DecapBridge login, GitHub Actions runs, Netlify deploys and Netlify Forms) are configured and documented but **not yet run**, because no client repository, DecapBridge site or Netlify project exists yet. Both Hnátek variants are set up for Netlify, with a contact form for testing; Cloudflare Workers remains available as a hosting option without the form. Decap CMS replaced Pages CMS; Pages CMS code and docs were removed.

| Document | For | What it covers |
| --- | --- | --- |
| [architecture.md](architecture.md) | developers | how the editor is generated, exported and served; what a Decap save does to the content |
| [setup.md](setup.md) | agency operator | step-by-step setup of one client: repository, DecapBridge, Netlify (or Cloudflare), the contact form, editors, adding another client |
| [decapbridge.md](decapbridge.md) | agency operator | what DecapBridge is, verified facts, the exact config shape, plans |
| [publishing.md](publishing.md) | agency operator | preview, publish, discard, rollback; renewing approvals after edits |
| [security.md](security.md) | owner, developers | threat model, what the integrity check enforces, GitHub Free limits, remaining risks |
| [testing.md](testing.md) | developers | automated tests, local browser QA results, the hosted checklist still to run |
| [handover.md](handover.md) | the client (Czech) | how to edit the website, in plain language |
| [articles.md](articles.md) | developers | why articles are deferred and the bounded plan to add them |

## In one paragraph

Each exported client site carries a static editor at `/admin/`: Decap CMS 3.17.3, self-hosted and pinned, with a `config.yml` generated from the field policy ([../editable-fields.md](../editable-fields.md)), the template manifest and the site's features. Editors log in through DecapBridge with e-mail and password (no GitHub account). Every save is a commit to branch `content` of the client's own private repository, which a GitHub workflow builds as a noindex preview. Production changes only when the agency runs `publish.yml`: it checks that nothing but content changed since the export, runs the production build with the publication gate, deploys to Netlify (or Cloudflare Workers) and fast-forwards `main`. On Netlify, the Kontakt page carries a contact form received by Netlify Forms. A failing step changes nothing.

## Commands

| Command | What it does |
| --- | --- |
| `npm run cms:config -- --template <id> --client clients/<id>` | prints the generated `config.yml` |
| `npm run client:export -- <id>` | exports the site, including `public/admin/`, `netlify.toml` (or `wrangler.jsonc`) and the workflows, then verifies it |
| `npm test` | unit and tool tests, including the Decap config, round-trip and integrity tests |

## Progress log

| Phase | State (2026-11-12) |
| --- | --- |
| A. Audit and architecture | done: [architecture.md](architecture.md) |
| B. Decap integration | done: `tools/cms/decap-config.ts`, `settings.ts`, `vendor.ts`, `tools/export/templates/admin-index.html.tpl` |
| C. Both Hnátek variants | done: configs generated and tested; real Decap saves checked in a browser against a copy of `clients/hnatek` |
| D. Export | done: both variants export; verify passes every step except `astro check`, which already failed before this work (testing.md §3) |
| E. Publishing | done locally: `preview.yml`, `publish.yml`, `discard.yml` with the integrity check; deploy steps (Netlify or Cloudflare, from `publishing.json`) off until the variable `DEPLOY` is set. Not run on GitHub yet |
| H. Netlify and contact form | done locally: `tools/export/hosting.ts`, `core/forms/contact.ts`, `core/components/ContactForm.astro`, success page in both templates, G-060 with `contactFormHandler`, `export:verify` checks the built form. Not run on Netlify yet |
| F. Articles | deferred: neither template renders articles; plan in [articles.md](articles.md). The generator's articles collection is tested with a synthetic manifest |
| G. QA and handover | done locally; hosted checklist in [testing.md](testing.md) §4 is open |

## Next steps (in order)

1. Create the first client repository, DecapBridge site and Netlify project, fill `clients/hnatek/publishing.json`, export and run the hosted checklist ([testing.md](testing.md) §4), including the form.
2. With the client: who receives the form messages, and the privacy page text covering the form (Netlify as processor, retention). Until then production stays blocked.
3. Fix the pre-existing `astro check` errors in exported sites (testing.md §3), so `export:verify` passes completely again.
4. Articles for one template, then the other ([articles.md](articles.md)).
