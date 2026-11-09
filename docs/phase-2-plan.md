# Phase 2 plan: implement both design templates

**Status:** Phase 1 output, draft 1 (2026-11-05). Each session below is a bounded task with its own inputs, outputs and stop condition. Sessions must not rely on earlier chat context; they read these docs.

Related: [content-contract.md](content-contract.md) · [template-contract.md](template-contract.md) · [editable-fields.md](editable-fields.md) · [design-differentiation.md](design-differentiation.md)

**Phase 2 goal (test plan):** static builds succeed; nav and emergency contact work at mobile and desktop widths; layouts are structurally different; accessibility basics pass. Both templates are built against **neutral fixture content**, not Hnátek. Hnátek content generation is Phase 3.

---

## Entry checklist (must be true before S1 starts)

- [x] The five Phase 1 docs are reviewed by the project owner, and the decisions in "Decisions to confirm" below are accepted or amended. (Accepted 2026-11-05.)
- [x] The repository is a Git repository (`git init` done 2026-11-05; first commit still pending).
- [x] **Node:** the local version is v22.13.0, but the latest Astro (7.4.6, released 2026-11-05) requires Node ≥ 22.23.4. Install the current Active LTS and pin it in `.nvmrc` and `engines`.
- [x] **Astro version:** pin an exact Astro 7.x release that is at least two weeks old (not 7.4.6 from today). Confirm in S1 that the Content Layer `glob()` loader, the `astro/zod` re-export (Zod 4 API) and `astro:assets` behave as the contract assumes. Adjust the snippets in content-contract §6 if the API differs.
- [ ] Tailwind CSS v4 via `@tailwindcss/vite` (the test plan suggests Tailwind). Each template defines its own `@theme` tokens. Nothing is shared.
- [x] npm (workspaces) as the package manager, chosen for the simplest handover.
- [ ] Not required for Phase 2, but required before Phase 3: the Phase 0 artifacts (`clients/hnatek/provenance/facts.json` seeded from content-contract §10, the media inventory, the list of copy needing verification).

## Decisions to confirm (owner)

1. A fifth content-flag concept (`placeholder`, `demo`) alongside the four provenance statuses (content-contract §3.1).
2. `SITE_MODE` defaults to `prototype` when unset (content-contract §8).
3. Neither pilot template implements articles; the schema exists but there are no routes (template-contract §3).
4. Template A has no service detail pages and B does (design-differentiation §5).
5. Clients may add and delete services, catalogue entries and price items in the CMS, but not pages (editable-fields §4).
6. The repo layout in template-contract §2 lives in this repository (currently named after the client). Renaming it to a system name is recommended.

## Sessions

Sessions S3 and S4 can run in parallel once S1 is merged. They touch disjoint directories. S2 is independent research and can run any time before S5/Phase 6.

### S1: Workspace scaffold and core ✅ done 2026-11-05

**Result.** `npm run check` passes: ESLint, `tsc`, `astro check` (0 errors), 85 unit tests, and 10 harness tests that include real prototype and production Astro builds. The fixture passes prototype mode and fails production with exactly G-011, G-012, G-020, G-021, G-031, G-032 and G-040; a production-ready copy builds cleanly with a sitemap.

**Toolchain as pinned:** Node 24.21.0 LTS (`.nvmrc`; already installed, so no download of Node 26), npm 11.19.0, Astro 7.4.2 (2026-10-21), TypeScript 6.0.3 (TS 7 is not yet supported by `@astrojs/check` or typescript-eslint), Vitest 4.1.12, ESLint 10.13.0 with typescript-eslint 8.72.0, Prettier 3.9.10, yaml 2.9.1. Tailwind is deferred to S3/S4 because core has no styling. `npm audit` reports 9 moderate issues in dev tooling (minimatch); none are in shipped code.

**Contract amendments it made** (already applied to the docs):

- new gate rules G-002, G-003, G-004 and G-034, and the definition of G-010;
- launch-check rules L-001 to L-008, plus `approvals.facts`;
- a `published` field on guidance;
- Markdown restrictions as a line-based checker;
- `site.config.ts` as a plain object;
- data delivered through `virtual:site-core/data` and `SITE_ROOT`.

**Known limits:**

- The gate checks every image field of published content, including fields a template may not render. This is conservative by design.
- At runtime, the `articles` collection exists only when its directory does.

**Original brief:**

- **Inputs:** content-contract (all), template-contract §2, §5, §6 (safety components), §9.
- **Do:**
  - Set up npm workspaces, root `tsconfig` with `strict`, ESLint/Prettier with the user's style (braced conditionals, no nested ternaries), and vitest.
  - `core/content/schemas.ts`: every schema from content-contract §6, with Czech messages.
  - `core/content/load.ts` and `view-models.ts`: loaders and `getSiteContext()` etc.
  - `core/format/*`: phone, hours, price and address formatting with non-breaking spaces.
  - `core/gate/*`: rules G-001…G-061, `SITE_MODE` handling, and the CLI `check:launch` against the ledger.
  - `core/markdown/restrict-body.ts`: the remark plugin for content-contract §7.3.
  - `core/media/*`: the image resolver and inventory generator.
  - Headless components: `PriceValue`, `DemoPricingNotice`, `PlaceholderMark`, `MissingFact`, `PrototypeBanner`, `EmergencyPhoneLink`, `PhoneLink`, `SeoHead`, `StructuredData`.
  - `fixtures/neutral/`: a complete synthetic business, "Pohřební služba Vzor", with every entry `placeholder: true`, every price `demo`, neutral placeholder SVG/PNG images, ≥ 6 services across categories, ≥ 6 guidance entries across phases, 4 coffins and 4 flower items. Phone numbers must be clearly fictional and must not be real. Use the pattern `+420000000xxx`: it passes the schema but is not an allocated Czech number range. Confirm this in S1 and document it in the fixture README.
  - A minimal "contract harness" Astro page in `core/tests` that renders each headless component, for unit-level tests.
- **Tests:** schema unit tests (valid and invalid examples per rule, including 00:00–24:00 hours, a range with max ≤ min, an on-request item with an amount, a placeholder image marked `actual-business`, and H1 or a phone number in a Markdown body); gate tests (the fixture passes in prototype and fails in production with the exact expected rule ids); format tests (`12 500 Kč`, `Po–Pá`, `+420 517 352 020`).
- **Done when:** `npm test` passes; `npm run validate -- fixtures/neutral` passes in prototype mode and lists the expected production violations.
- **Out of scope:** any template styling or pages.

### Core fix-up after S2–S4 ✅ done 2026-11-05

This pass folded the template workarounds and the S2 findings back into core:

- **CMS-tolerant schemas:** defaults for objects the CMS deletes, `familyOwned` as a select, image objects without a file count as no image, and ids derived for rows added in the CMS.
- **Markdown:** H1 is demoted at render, heading issues only warn (G-035), `<u>`/`<br>` are allowed, and heading ids are ASCII via Sätteri plugins.
- **New core APIs:** `getOptionalPage`, `hasPage`, `hasBody`, `resolveTemplateOptions`, `UnreviewedMark` and `EmergencyPhoneLink variant="custom"`.
- **Media and map:** only referenced media is imported, and `supports.mapEmbed` is checked by G-005.
- **Templates:** both switched to the new APIs.
- **Docs:** amended in content-contract §7.3/§8, editable-fields §2/§4/§5/§6, and template-contract §3/§5/§6.
- **Still open for S5:** the `content`/`main` publish workflow (A5) and the CMS config generator, which must apply A3, A7 and B4.

### S2: Pages CMS spike (research only, ~half a session)

- **Inputs:** editable-fields (all).
- **Do:** in a throwaway GitHub repo containing a copy of the fixture content, confirm Pages CMS behaviour:
  - field types and options (`required`, `pattern`, `hidden`, `list`, select, image, date);
  - JSON file editing for singletons;
  - the image `media` input/output path format and how `core/media/resolve.ts` should normalise it;
  - rich-text output (Markdown vs HTML) and whether it can be restricted;
  - preview/branch workflow and history/revert;
  - whether creating collection entries can be disabled.
- **Output:** `docs/spikes/pages-cms.md` with findings, a minimal working `.pages.yml`, and any contract amendments needed (e.g., flattening a field).
- **Done when:** every "confirmed in S2" note in editable-fields is answered. No production code is changed.

### S3: Template A, `rodinna-tradice`

- **Inputs:** design-differentiation §1, §2, §4, §5; template-contract §3–§8; fixture content.
- **Do:** `templates/rodinna-tradice/`:
  - the manifest, `site.config.ts` for the fixture, and tokens for both palettes and both font pairs (self-hosted, latin-ext verified);
  - every required route and every component listed in design-differentiation §2.4;
  - the image-less variants, prototype markers and print-safe basics.
- **Done when:** `npm run build -w templates/rodinna-tradice` succeeds in prototype mode; every option value renders; the template-specific checks in S6 pass locally.
- **Out of scope:** anything in `templates/dustojna-jednoduchost/`; changes to `core/` (raise a contract issue instead, to be fixed in a small follow-up to S1).

### S4: Template B, `dustojna-jednoduchost`

- **Inputs:** design-differentiation §1, §3, §4, §5; template-contract §3–§8; fixture content.
- **Do:** as S3, for B, including the fixed mobile action bar (with reserved padding), service detail pages, the phased checklist with print styles, and price tables that reflow on mobile.
- **Done when:** the build succeeds; every option value renders; the S6 checks pass locally.
- **Out of scope:** template A; `core/` changes (as S3).

### S5: Standalone export and independence verification ✅ done 2026-11-09

**Result.** `tools/export`, `tools/export/verify.ts` and `tools/cms` are on `main`. Both fixture exports and both production-ready exports pass verify 10/10 from a clean folder outside the repo, including a network-blocked build. The publish and discard workflows, and the Pages CMS Actions, can only be tested on a real repository: see the 13 hands-on checks in `docs/notes/s5-export.md`.

**Original brief:**

- **Inputs:** template-contract §9; editable-fields §5 (CMS config generation); S2 findings.
- **Do:**
  - `tools/export` (assemble, rewrite the alias, generate `package.json` with exact versions, generate README/HANDOVER/CREDITS/TEMPLATE.json templates in Czech);
  - `tools/cms` (generate `.pages.yml` from the policy, manifest and features);
  - `tools/export/verify.ts` (clean-directory `npm ci` and build in both modes, a dependency and path scan, and an offline build after install).
- **Done when:** exporting the fixture with each template produces two repos that build from a clean temp directory; the production-mode build fails with the expected gate ids (the fixture is all placeholders); the scan is clean; the `.pages.yml` has no articles collection when the feature is off.

### S6: Cross-template QA and Phase 2 sign-off ✅ done 2026-11-09

**Result.** `npm run qa` (Playwright + axe) passes for both templates: 412 checks, after two small template fixes. The scorecard is 13/15, an agent assessment pending the owner's review. The report is `docs/qa/phase-2-report.md`; screenshots are regenerated locally and not tracked.

**Cleanup after S5/S6 (2026-11-09):**

- `npm test` now includes the tools tests, and lint ignores `exports/`;
- template A dropped the unused Cormorant font and declares its `company.logo` slot; B dropped the unused `service.card` slot;
- the fixture stores `familyOwned` as `"yes"`;
- the launch check also reads `docs/provenance/`;
- `playwright-core` is pinned to 1.64.1 through `overrides`;
- the contracts now name the required template hooks, the bootstrap exception, and the export as built.

**Original brief:**

- **Inputs:** design-differentiation §6–§7; template-contract §6; built outputs of S3–S5.
- **Do:** add a shared Playwright suite run against both builds:
  - the emergency `tel:` link is present on every page and in the first viewport (or a fixed bar) at 375 × 667 and 1280 × 800;
  - office hours and emergency share no container;
  - nav is keyboard operable and the mobile menu has working `aria-expanded`;
  - axe-core reports no serious or critical issues;
  - 320 px reflow without horizontal scroll;
  - demo prices show "UKÁZKA" and the notice;
  - prototype `noindex` is present;
  - full-page screenshots at both widths, in colour and greyscale.
  - Then complete the differentiation checklist and scorecard with evidence.
- **Output:** `docs/qa/phase-2-report.md` with results, screenshots (`docs/qa/screens/`), the scorecard, and the failures fixed or deferred with reasons.
- **Done when:** all invariants pass for both templates, the checklist is fully ticked, and the scorecard is ≥ 11/15 with no dimension below 2.

## Phase 2 exit, and what Phase 3 needs

- Phase 2 exit = the S6 report is accepted.
- Phase 3 additionally needs: the Phase 0 ledger for Hnátek; client answers on as many of U1–U24 as possible (content-contract §11), at least U5 (assets/logo), U13 (catalogue) and U14 (services list), which shape the prototype content; and a decision on which public sources the research session may consult (current website, ARES/commercial register for U10).

## Risks specific to Phase 2

| Risk | Mitigation |
| --- | --- |
| Astro 7 API differs from the contract's assumptions | S1 verifies first and amends the docs before the templates start. |
| Templates converge because S3 and S4 copy patterns from each other | Separate sessions that read only their own design section; the S6 recolour test and component-overlap check. |
| Core grows visual components "for convenience" | Contract rule: core components must be headless; S6 checks that core contains no `class` defaults or CSS. |
| Fixture content too tidy, hiding layout failures | The fixture includes long Czech words and titles at max length, a service without a summary image, zero-coffin and zero-flower variants, and a range price. |
| Mobile bottom bar (B) obscures content or focus | Reserved padding; Playwright checks that the focused element is not covered. |
