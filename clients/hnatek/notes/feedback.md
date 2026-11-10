# Hnátek: feedback log

## Round 1: 2026-11-09, client answers to the research questions

Given by Jakub Smejkal (client contact) in writing: the answers in `notes/research.md` § Answers, the chat, and a new logo file. Follow-up answers were given in chat on the same day.

The content files still hold the neutral skeleton. This round updated only the ledger, the approvals and the media folder. `/site-build` copies the values into content.

| # | Item | Type | Done | Files / note |
| --- | --- | --- | --- | --- |
| 1 | The address is Dědická 38/22 (not "ev.č.") | fact | yes | `facts.json`: `contact.locations.vyskov.address` and `company.legalIds.registeredOffice` VERIFIED |
| 2 | The old map link points to the wrong spot | fact | yes | `contact.locations.vyskov.geo` from an exact mapy.com address match (EXISTING_WEBSITE, pin to confirm). New mapUrl: https://mapy.com/cs/zakladni?source=addr&id=10371336&x=16.9882785&y=49.2847786&z=17 |
| 3 | Brand "Pohřebnictví Hnátek", new logo supplied | fact + sign-off | yes | `company.brandName` VERIFIED; `src/assets/media/logo-hnatek.webp` (1254×1254, off-white background); rights evidence in `approvals.json`. `company.json` `logo` is still null until `/site-build`. |
| 4 | Photos from the old site may be reused; no originals | sign-off | recorded here | Rights evidence goes into `approvals.images` once `/site-build` places each file. Low resolution (building photos 722 px wide). |
| 5 | +420 739 404 909 is the office mobile | fact | yes | VERIFIED |
| 6 | Transport line is 24/7; area is international (Germany, Austria, …) | fact | yes | `emergency.phone` and `availability` VERIFIED; `emergency.serviceArea` CLIENT_PROVIDED "Česko i zahraničí, např. Německo a Rakousko". This is our wording and still needs approval. |
| 7 | People should not call in the 12:00–12:30 break | copy | noted | Keep the break visible. The office hours were not re-confirmed, so they stay EXISTING_WEBSITE. |
| 8 | Closed on public holidays; people can use a contact form then | fact + out of scope | partly | `office-hours.holidayNote` CLIENT_PROVIDED "Ve státní svátky je kancelář zavřená." (wording needs approval). The contact form is **not done**: `contactForm` stays false until data handling, the privacy page and the recipient are decided (U9). Recorded for the owner. |
| 9 | Flower shop is the client's own, same building, Mon–Fri 07:00–15:30 | fact | yes | `contact.phones.kvetiny.number` VERIFIED; the shop hours go into the flowers copy |
| 10 | pohrebnictvi@vyskov.cz is still preferred | fact | yes | VERIFIED |
| 11 | Family-owned, about 40 years, handed from the founder to his granddaughter in 2026 | fact + sign-off + copy | yes | `company.familyOwned` = true and `tradition.publicWording` = "Rodinná firma se 40 letou tradicí" (client's exact wording), both CLIENT_PROVIDED and approved in `approvals.facts`. `foundedYear` stays UNKNOWN. "O nás" may tell the handover **without names** (`/site-build`). |
| 12 | Crematorium unknown; no exhumation | copy | for build | Remove `services/exhumace.md` in `/site-build`; name no crematorium. |
| 13 | The 16 MOSER LEGNO coffins are available, photos may be used, prices hidden | copy + sign-off | for build | Rights evidence goes in once the files are placed. No coffin prices. |
| 14 | Price list in the preview | copy | for build | Demo prices, visibly marked (the operator's choice). |
| 15 | Urn storage costs 300 Kč/month | copy | for build | The old site said "za každý den uložení" (per day); the client now says per month. Price unapproved. |
| 16 | Finish the cut-off death-certificate sentence "according to the law" | copy | for build | Draft in `guidance/doklady.md` from the Act on Registers (zákon č. 301/2000 Sb.). Marked unreviewed until the guidance review (U7). |
| 17 | Mention the Cadillac | copy | for build | Text only. No vehicle image until a real photo is supplied (U4). |
| 18 | The new site will eventually replace pohrebnictvihnatek.cz; WordPress is run privately | config | noted | `siteUrl` stays a placeholder until launch (U17). Redirects are in `research.md` § 7. |

Still open: approval of the holiday and service-area wording, a re-confirmation of the main office number and the office hours, IČO, DIČ and the register entry (taken from public sources, not re-confirmed), the map pin, the crematorium, and a vector or transparent version of the logo for dark backgrounds.

Follow-up, 2026-11-09: the client keeps the spelling "40 letou" (with a space). Use it verbatim.

## Round 2: 2026-11-09, prototype review by Jakub Smejkal (client contact)

Feedback given in chat: images are not visible and show as placeholders; new logo pack attached (`Pohrebnictvi_Hnatek_logo_web_assets.zip`); "Jak postupovat" should be more interactive and guiding, and other pages read as a wall of text.

| # | Item | Type | Done | Files / note |
| --- | --- | --- | --- | --- |
| 1 | Images not visible in the dev preview | bug (core) | yes | Cause: core set `trailingSlash: "always"` for dev too, so the dev server answered 404 to Astro's image endpoint (`/_image?…`). Production builds were never affected. Fix in `core/integration.ts`: dev uses `"ignore"`, builds keep `"always"`. The client asked for this fix here. Checked on a fresh dev server (images return 200), and the unit tests pass (162). Dev servers started before the fix need a restart. |
| 2 | New logo pack | sign-off + media | yes | Header logo is now `src/assets/media/logo-hnatek-horizontal.svg` (the pack's compact horizontal SVG, as its README recommends for the header). The full pack is kept in `clients/hnatek/brand/`. Rights evidence is in `approvals.json`. The cropped emblem `logo-hnatek-znak.png` was removed. |
| 3 | Favicons, touch icons and web manifest from the pack | out of scope | no | Neither template nor core renders favicons or a manifest. This is a template/core change, recorded for the owner. The files are ready in `brand/icons/` and `brand/web/`. |
| 4 | "Jak postupovat" more interactive and guiding | design / out of scope | no | Template A has no guided or interactive step component. Template B (`dustojna-jednoduchost`) has phased steps with checklists, fold-out details and a call button on each step; a preview was shown. The client chose to leave this for later. |
| 5 | Other pages read as a wall of text | design / out of scope | no | Deferred together with item 4 (either switch to template B or extend template A). |

## Round 3: 2026-11-09, guided templates (request from Jakub Smejkal)

Request: both templates read "like a wall of text"; make them more guided and interactive for older visitors, then apply them to hnatek.

| # | Item | Type | Done | Files / note |
| --- | --- | --- | --- | --- |
| 1 | Guided "Jak postupovat" | template (A and B) | yes | A "Kde blízký člověk zemřel?" chooser filters the guide through `#situace-…` links and CSS `:has(:target)`, with no JavaScript (`core/content/guidance-flow.ts`, `templates/*/src/components/SituationChooser.astro` / `SituationPicker.astro`). Steps renumber when filtered and lead with "Co udělat", a tickable checklist and the right phone; the longer text is folded into "Přečíst podrobnosti" / "Podrobný postup"; "Další krok" links lead on. |
| 2 | Homepage | template + config | yes | The first-steps band shows the same chooser and links into the filtered guide. For hnatek (A), `next-steps` moved to second place in `site.config.ts` so it sits right under the hero. |
| 3 | Služby less text-heavy | template (A and B) | yes | A: "S čím potřebujete pomoci?" quick list, service bodies in "Co služba zahrnuje", and a "Nevíte si rady?" phone panel at the end. B: every service is one large tappable row, and the index ends with the call tier. |
| 4 | Readability | template (B) | yes | B body text raised from 17 px to 18 px (A was already 18 px). |

Content files and the ledger are unchanged; copy approvals stay DRAFT. Checks: unit tests (168), lint, typecheck, both fixture builds and the Playwright QA suite (412 passed); `client:validate` passes in prototype mode, `client:build` builds every page, and the launch findings are unchanged.

## Round 4: 2026-11-09, favicon and team preview (request from Jakub Smejkal)

| # | Item | Type | Done | Files / note |
| --- | --- | --- | --- | --- |
| 1 | Favicon from the logo pack | core + media | yes | Core now serves a site's `public/` folder from the site root and `SeoHead` links `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` and `site.webmanifest` when they exist (`core/media/site-icons.ts`). `public/` holds those files from `brand/icons/` plus the Android and maskable icons; the manifest from `brand/web/` was rewritten to root paths. The export copies `public/`. This closes round 2 item 3. Rights: same client-provided logo pack as the header logo. |
| 2 | Online preview for the team | export + hosting | yes | Repo `SmejkalJakub/hnatek-web` (default branch `content`). Cloudflare Workers: `main` → https://hnatek-web.smejkal-jakub99-fc3.workers.dev, `content` → https://content-hnatek-web.smejkal-jakub99-fc3.workers.dev, both prototype mode (banner, noindex, robots disallow). `wrangler.jsonc` with a `previews` block was added in the repo only (not part of the export; re-exporting with `rsync --delete` would remove it). GitHub variable `PUBLISH_MODE=prototype` lets "Zveřejnit změny" gate in prototype mode (new in `publish.yml.tpl`). Pages CMS installed. |

2026-11-10: CMS flow tested end to end on hnatek-web: an edit saved in Pages CMS reached the `content` preview in about 40 s; "Zveřejnit změny" ran `publish.yml`, fast-forwarded `main`, and the live site updated about 60 s later, still noindex. The test edit was reverted and published again; the only leftover is the CMS dropping the trailing newline in `emergency.json`.
