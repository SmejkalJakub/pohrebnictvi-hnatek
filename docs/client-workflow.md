# Client workflow: prompt → iterate → ship

**Status:** MVP, 2026-11-09.

How a new funeral-home site goes from a URL to a live, client-editable site. Claude Code does the research and content work through four project skills; npm scripts do the mechanical parts; the owner does every shipping step by hand.

Related: [content-contract.md](content-contract.md) (provenance, schemas, gate) · [template-contract.md](template-contract.md) (§2 layout, §9 export) · [editable-fields.md](editable-fields.md) (§3 agent rules) · [notes/s5-export.md](notes/s5-export.md) (export and manual tests)

## The loop

| Step | Who | Command | Result |
| --- | --- | --- | --- |
| 1. Scaffold | agent or owner | `npm run client:new -- <id> --template <rodinna-tradice\|dustojna-jednoduchost>` | `clients/<id>/` from the neutral fixture; passes prototype validation |
| 2. Research | agent | `/site-research <id> <url>` | `provenance/facts.json` filled from the old website and public registers; `notes/research.md` |
| 3. Build | agent | `/site-build <id>` | content from the ledger, template options, media; `client:validate` passes |
| 4. Review | owner | `npm run client:dev -- <id>` | local preview at `http://localhost:4321` |
| 5. Revise (repeat) | agent | `/site-revise <id> <feedback>` | content, ledger and approvals updated; `notes/feedback.md` |
| 6. Ship | owner | `/site-ship <id>` (prints a checklist) | export, GitHub repo, host, Pages CMS, then go-live after `check:launch` |

Steps 4–5 repeat until the owner is happy with the prototype. Go-live additionally waits for the client's confirmations: every displayed fact `VERIFIED` (or an approved `CLIENT_PROVIDED`), copy, prices, guidance and image rights signed off.

## Scripts (`tools/client/`)

| Script | What it does |
| --- | --- |
| `npm run client:new -- <id> --template <t>` | Copies `fixtures/neutral/src/content` and its placeholder graphics into `clients/<id>/src/`, writes `src/site.config.ts` with the manifest's default options and homepage order, and writes `provenance/facts.json` (every fact the launch check tracks, all `UNKNOWN`) and `approvals.json` (all copy `DRAFT`, nothing signed off). Refuses an existing client and ids that are not ASCII slugs. |
| `npm run client:validate -- <id> [--json]` | Schema, publication gate and G-005 against the template manifest, in both modes. Prints the prototype findings and the rules that still block production. Exit 1 only when prototype fails. |
| `npm run client:dev -- <id> [astro flags]` | `astro dev` in `templates/<template>/` with `SITE_ROOT` and `SITE_CONFIG` pointing at the client (prototype mode). |
| `npm run client:build -- <id> [--production]` | `astro build` the same way, as a render check. Output goes to the template's `dist/`. |
| `npm run client:export -- <id> [--out <dir>] [--force] [--name <pkg>] [--keep]` | Validates, runs `tools/export` (default output `exports/<id>/`, Git-ignored), then `export:verify`. The production expectation follows the client: while the gate has errors, verify requires the production build to fail and name exactly those rules; once it has none, verify requires it to pass. |

The launch check needs no wrapper: `npm run check:launch -- clients/<id>`.

## The client folder

```
clients/<id>/
  src/site.config.ts        # template, options, homepage order, siteUrl (agent only)
  src/content/              # content-contract §2
  src/assets/media/         # client media (starts with the fixture's placeholder graphics)
  public/                   # optional: favicon.svg, favicon.ico, apple-touch-icon.png, site.webmanifest
                            #   and the icons it lists; served from the site root, linked by SeoHead
  provenance/facts.json     # fact ledger: value, status, source per fact
  provenance/approvals.json # copy, pricing, guidance and image sign-offs
  notes/                    # research.md, feedback.md (agent notes; never exported)
```

The export copies `src/content`, `src/assets/media`, `src/site.config.ts`, `public/` and `provenance/` (to `docs/provenance/`). `notes/` stays in this repository.

**`clients/` is tracked in Git.** The content is the client's real business data, gathered from public sources and confirmed by the client, and the ledger is the record of who confirmed what. That record must survive this machine. The repository is private; do not put credentials or private correspondence in `notes/`.

## Rules the skills enforce

- **No invention.** A fact appears in content only if the ledger has it, with the same value (L-004). Unknown stays `UNKNOWN`/`null`; where the schema requires a value, the obviously fake fixture stand-in stays until the client answers (`check:launch` reports it as L-005).
- **Statuses.** The agent writes only `EXISTING_WEBSITE` (old website or public register, with `source` and `retrievedAt`) and `UNKNOWN`. `VERIFIED` and `CLIENT_PROVIDED` come only from the operator relaying the client, with a name and date (`/site-revise`).
- **Synthetic content is marked.** Placeholder copy keeps `placeholder: true`, prices are `demo`, AI-drafted copy is `DRAFT`, guidance stays unreviewed. Production builds reject all of them.
- **Design levers are the manifest's options only.** No per-client CSS or template edits (template-contract §8).

## First run, for the pilot

`clients/hnatek/` does not exist yet. Start with:

```
npm run client:new -- hnatek --template rodinna-tradice
```

then `/site-research hnatek https://pohrebnictvihnatek.cz`. The ledger seed in content-contract §10 and the open items U1–U24 in §11 are the checklist for what research should find and what only the client can answer.
