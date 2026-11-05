# Claude Code / Cursor — Phase 1 agent handoff

You are a senior Astro/TypeScript developer, accessible UX designer and design-systems architect. We are prototyping a repeatable AI-assisted workflow to create conservative Czech funeral-home websites from templates.

Before doing anything, inspect the entire repository, its package configuration, existing templates and any AI instruction files (e.g., AGENTS.md, CLAUDE.md). Follow repository conventions and do not replace working code for convenience.

Read these project inputs:
- `01-business-and-design-brief.md`
- `02-pilot-test-plan.md`

**Your assignment for this session is ONLY Phase 1 (contracts). Do not build full pages or generate a website yet.**

Tasks:
1. Design a shared content model for company identity, branches/contact, ordinary opening hours, emergency transport, services, practical guidance, coffin/flower content, approved imagery, optional pricing and optional articles.
2. Make the distinction between VERIFIED/CLIENT_PROVIDED/EXISTING_WEBSITE/UNKNOWN information explicit in project input. Never fill missing real facts with invented data.
3. Define field-level policy for what the initial agent may customize versus what a later non-technical client may edit through a CMS. Design and layout are never CMS-editable.
4. Define a common Astro template interface so two **conservative but structurally distinct** designs can render the same business facts without being the same component tree with different CSS variables.
5. Specify a handover-friendly standalone export: no runtime or build-time dependency on private internal repos or agent tools.
6. Recommend minimal schemas (Zod/Astro Content Collections as appropriate), route conventions, image metadata, and robust validation for demonstration pricing.
7. Define the first two templates: `rodinna-tradice` (warm heritage) and `dustojna-jednoduchost` (restrained practical elegance). Document actual structural differentiation, not only different palettes.
8. Identify blocking unknowns and propose reasonable prototype-only placeholders; never imply synthetic prices or images are real.
9. Prepare concise, actionable implementation tasks for Phase 2, in separate bounded sessions.

Deliverables in repository `docs/`:
- `content-contract.md`
- `template-contract.md`
- `editable-fields.md`
- `design-differentiation.md`
- `phase-2-plan.md`

Acceptance criteria:
- Covers every required business information type and page.
- Blog/article module is OPTIONAL and DISABLED for Hnátek.
- Emergency transport telephone and office hours use different fields and display rules.
- Sample prices must never be mistaken for approved real prices.
- Template structure allows meaningful visual differentiation while maintaining clarity and accessibility.
- Document exactly what remains uncertain and needs client signoff.
- No implementation of full websites in this session.

At the end, summarize created files, significant decisions, rejected alternatives, uncertainties and the Phase 2 entry checklist. Stop after Phase 1.
