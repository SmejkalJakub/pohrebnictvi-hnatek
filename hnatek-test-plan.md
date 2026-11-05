# Funeral-home website pipeline — pilot test plan

**Scope:** 1 real business, 2 intentionally different conservative templates, 2 fully working website variants. Add a second synthetic business only after these pass, to test within-template differentiation.

## Design goals
- Preserve a single reusable content contract for factual company data.
- Keep each template's layout and component design genuinely different.
- Allow AI-controlled customization during production; restrict client editing after handover.
- Deliver an independent Astro repository that can build without the private template/agent project.

## Phase 0 — Prepare the controlled input (no code changes)
Deliverables:
- Approved working business brief (01-business-and-design-brief.md).
- `facts.json` distinguishing verified, client-supplied, existing-site and unknown values.
- Reusable media inventory with source/rights and placeholder markers.
- List of site copy requiring legal or factual verification.

Done when: no required piece of information is silently fabricated, and all sample values are flagged as non-publishable.

## Phase 1 — Define contracts
Deliverables:
- Content schema for company/contact/hours/services/procedures/catalog/pricing and optional articles.
- Clear editable/locked field policy.
- Template interface and route definitions.
- Brand/design constraints; differentiation checklist.

Done when: both templates can use the same factual content, while choosing different page composition and optional sections.

## Phase 2 — Implement both design templates
Deliverables:
- Astro + TypeScript + Tailwind codebase or self-contained template projects.
- `heritage` and `dignified-simple` designs, both mobile-first.
- Neutral test content, reusable content schemas, sample pricing with visible test indicator.

Done when: static builds succeed; nav and emergency contact work at mobile and desktop widths; visual layouts are structurally different; accessibility basics pass.

## Phase 3 — Agent discovery and generation workflow
Separate bounded sessions/tasks:
1. Research existing site and normalize facts; no implementation.
2. Propose design/brand plan for selected template; record rationale and missing facts.
3. Generate content and configure one independent client site.
4. Build/test/audit and emit handoff summary; revise only on identified failures.

Required output: exact source provenance, changes made, files changed, open questions, acceptance results.

Done when: repeatable prompts generate a functional site from the same brief without relying on previous chat context.

## Phase 4 — Cross-template generation
- Generate Hnátek using Rodinná tradice.
- Generate Hnátek using Důstojná jednoduchost.
- Compare mobile and desktop snapshots and page structures.
- Check content facts and required emergency CTA appear in both.
- Score distinctiveness in composition, navigation, typography, image usage, content hierarchy.

Done when: they look like two credible designs, not a recoloring of one template, without sacrificing conservatism or usability.

## Phase 5 — Client feedback simulation
Example request:
> Keep the general visual identity but make the nonstop transport number more prominent, move family history higher on the homepage, replace the hero placeholder and revise the opening paragraph in Czech.

Done when: targeted changes are correct, build passes, and unrelated approved design/content remains unchanged. Record a before/after Git diff.

## Phase 6 — Restricted CMS pilot
- Install Pages CMS configuration **in the exported test client's GitHub repository**.
- Provide editors for pricing, contact/hours, services and selected image/text fields.
- Hide article/blog editor entirely for Hnátek.
- Configure a simple Git-triggered build/deploy to an access-controlled or non-indexed preview.
- Test with a non-technical user who has no Git knowledge.

Actions to test:
1. Edit a sample price and see resulting preview.
2. Change office hours while keeping nonstop transport clearly separate.
3. Update a service description.
4. Replace an approved image.
5. Attempt to change layout/colors through CMS (must be impossible through UI).
6. Recover from malformed content / failed deploy using validation and version history.

Done when: user performs common edits without developer assistance, and no editing action can silently publish invalid data.

## Phase 7 — Independent handover
- Export to separate client-owned repository.
- Build from clean checkout using documented Node/package-manager versions.
- Deploy static assets to a chosen compatible host.
- Validate mobile, SEO, map, contact form, accessibility and privacy behavior.
- Provide basic user guide: editing, publishing, drafts if applicable, rollback and ownership responsibilities.

Done when: finished website no longer depends on private internal templates/tooling, and a client can independently maintain permitted content.

## Non-goals for this pilot
- No customer portal or self-service template selection UI.
- No automatic billing, provisioning, or multi-tenant hosting.
- No custom CMS.
- No articles or blog on Hnátek.
- No real pricing without approval.
- No publication of generated or outdated emergency/legal guidance without review.

## Risks and mitigations
| Risk | Mitigation |
| --- | --- |
| Sites look nearly identical | Distinct page compositions and pre-defined variants; side-by-side review |
| AI fabricates facts | Provenance tags; explicit unknowns; approval gate |
| Fake company imagery | Real authorized assets or neutral, identifiable placeholders |
| Sample prices go live | Demo-only flag and pre-launch blocking validation |
| CMS edit breaks build | Schemas, preview builds, tests and rollback |
| Emergency availability confused with opening hours | Separate fields and always-visible CTA for nonstop transport |
| Outdated procedural/legal text | Human subject-matter verification before public launch |
