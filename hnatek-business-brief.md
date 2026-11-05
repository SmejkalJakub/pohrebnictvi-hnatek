# Pohřebnictví Hnátek — pilot business and design brief

**Status:** Pilot working brief, 2026-11-05. Not client-approved website copy.

## 1. Objective

Test a repeatable AI-assisted workflow that starts with a selected Astro template and real company information, creates a professionally customized funeral-home website, supports controlled revision, and exports a standalone static website whose owner can edit specific content fields without editing design or layouts.

Prototype **two different but conservative** template directions using Pohřebnictví Hnátek. Do not build a website generator, multi-tenant product, or client portal.

## 2. Information provenance and verification

| Statement | Source/status | Publication rule |
| --- | --- | --- |
| Company name: Pohřebnictví Hnátek s.r.o. | Current company website | Use after normal pre-publication confirmation |
| Located in Vyškov, Dědická ev.č. 38/22 | Current company website | Check location before launch |
| Family-owned company with about 40 years of business tradition | User-provided, approximate | Write as approximate until dates are verified; do NOT equate company tradition with the current legal entity's incorporation date |
| Founder: older Mr. Hnátek; business handed to granddaughter recently | User-provided, no names or dates | Do not invent names, precise succession dates, quotations, or personal biography; seek approval before public-facing text |
| Mostly family operated | User-provided | Draft wording subject to client review |
| Classic Cadillac used for funeral transport | User-provided | Visual inspiration only until a genuine approved photo is available; do not generate a purported documentary image of the specific vehicle |
| Friendly, empathetic service | User-provided desired positioning | Reflect in tone; avoid invented testimonials or claims |
| Nonstop service | User and existing website | Specifically identify the round-the-clock transport service, **not** the office as open 24/7 |
| Existing services and current contact details | Current website, considered accurate by user | Recheck specifics before launch |
| Price list | Not supplied | Use demonstrative TEST prices only, visibly marked and excluded from live publication until replaced and confirmed |
| Photos and existing website assets | User says permission to use for this test | Copy only actual authorized assets; other images are neutral placeholders with appropriate rights |
| Articles/blog | User explicitly says none required for this website | Hide completely for Hnátek; future templates may support optional articles |

### Current public contact details (verify again before launch)

- Website: https://pohrebnictvihnatek.cz
- Office: +420 517 352 020, +420 739 404 909
- Nonstop deceased transport: +420 720 283 499
- Email: pohrebnictvi@vyskov.cz
- Office hours on current website: Mon–Fri 07:00–15:30, break 12:00–12:30
- Address on current website: Dědická ev.č. 38/22, 682 01 Vyškov
- Flower arrangements contact on current website: +420 731 175 835

Source: https://pohrebnictvihnatek.cz (retrieved 2026-11-05).

## 3. What the redesign should accomplish

1. Immediately distinguish **urgent help / nonstop transport** from regular office questions.
2. Convey personal, empathetic assistance and long-standing family tradition without invented anecdotes.
3. Make next steps after a death understandable; sensitive procedural/legal guidance must be fact-checked by a responsible human.
4. Make services, location, contact and hours obvious on mobile.
5. Replace the old site's perceived outdated/confusing structure with dignified, straightforward navigation.
6. Provide clear pricing UI for a *demonstration* data set, with a hard approval gate before any real publication.
7. Be fully static for public pages; backend only if needed for the contact form via a managed service/serverless endpoint.

## 4. Two conservative template directions

### A — Rodinná tradice (heritage and warmth)
- Mood: traditional, personal, composed, discreet.
- Visual system: warm ivory/paper neutrals, dark warm gray, modest restrained accent, sophisticated classic serif headlines paired with readable body type.
- Layout: editorial hero, narrative family-history emphasis, calm long-form sections and balanced photography.
- Service presentation: descriptive groupings, visible contact actions, plain-language guidance.
- Differentiate structurally from B, not just with fonts and colors.

### B — Důstojná jednoduchost (clarity and structure)
- Mood: reserved, professional, reassuring, unfussy.
- Visual system: neutral off-white and charcoal, restrained forest/slate accent, highly legible sans-serif or discreet serif pairing.
- Layout: clear practical hero with priority phone CTA; more structured service overview and compact information blocks; visual separation without excessive card UI.
- Information hierarchy: urgent contact > next steps > services > company background.
- Differentiate structurally from A, not just with colors and photography.

### Shared design constraints
- Conservative, trustworthy design suitable for Czech funeral homes.
- No unnecessary gradients, generic AI-looking cards, glows, carousels, animated flourishes, made-up portraits or stock images suggesting the real premises/personnel.
- No melodramatic grief imagery, manipulative emotional language or fabricated social proof.
- Accessibility target: WCAG 2.2 AA where practical; strong contrast, semantic headings, keyboard access and mobile usability.
- Plain, professional Czech copy. No sensational or overly sentimental marketing.

## 5. Website scope for this pilot

Required navigable content (architecture may vary by design):
- Home / Úvod
- What to do after a death / Jak postupovat
- Services / Služby, including ceremony types and transportation
- Coffins / Rakve (retain useful existing catalog content if available and rights cleared)
- Flowers / Květiny
- About / O nás and family story
- Contact / Kontakt, map, office hours, distinct emergency phone
- Demonstration pricing / Ceník: **test-only, not publishable as actual business prices**

Not required: blog/articles, obituaries, online funeral bookings, payments, client portal, multi-location platform.

## 6. Editing contract after handover

Allowed through CMS:
- Individual test/approved prices and price descriptions
- Service descriptions and basic labels
- Contact details, phone numbers and opening hours
- Selected page content and images

Locked out of CMS:
- Templates, CSS/theme tokens, typography, layout and page structure
- Code, dependencies, deployment configuration
- Arbitrary page/component creation

The CMS restricts the *interface*; a repository owner still has source access. This distinction should be documented at handover.

## 7. Unresolved items — do not invent

- Confirm exact founding date / wording of approximately 40 years.
- Confirm whether and how to tell the succession story publicly.
- Obtain approved photo of actual Cadillac if it is to appear as the company's vehicle.
- Confirm image rights/asset files and logo treatment.
- Replace all sample prices with approved real ones, or omit pricing before live launch.
- Review all medical/legal/procedural guidance about death notifications and documentation for current correctness.
- Verify company contact details and opening hours before public launch.
- Choose handling for contact form data and privacy disclosures before enabling a live form.
