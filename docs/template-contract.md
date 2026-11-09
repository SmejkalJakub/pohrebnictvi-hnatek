# Template contract

**Status:** Phase 1 contract, draft 1 (2026-11-05).

This document defines what a template is, what core provides, what every template must do, what it is free to do differently, and how a client site is exported as a standalone repository.

Related: [content-contract.md](content-contract.md) · [editable-fields.md](editable-fields.md) · [design-differentiation.md](design-differentiation.md) · [phase-2-plan.md](phase-2-plan.md)

---

## 1. Core idea

Two templates must render **the same facts** with **different page compositions**. A shared component tree with swapped CSS variables would fail Phase 4 ("not a recoloring of one template"), so the contract splits the work this way:

- **Core** owns *data and safety*: schemas, loaders, view models, formatting, the publication gate, SEO and structured data, plus a few **headless** components for safety-critical output (prices, placeholders, emergency link semantics). Core contains **no layout and no visual styling**.
- **Each template** owns *all composition and presentation*: layouts, navigation pattern, page section order, components, tokens and typography. Templates never import from each other.

The shared surface is data-shaped, not markup-shaped. A template can therefore reorganise a page completely, and still cannot drop the emergency CTA, show an unmarked demo price or invent a fact.

## 2. Repository layout (private template-system repo)

```
/                                   # this repository (currently "pohrebnictvi-hnatek"; may be renamed)
  package.json                      # npm workspaces: core, templates/*, tools/*
  core/                             # plain TypeScript/Astro source, no build step (copied verbatim on export)
    content/      schemas.ts  load.ts  view-models.ts
    gate/         rules.ts  run.ts  launch-check.ts
    format/       phone.ts  hours.ts  price.ts  address.ts
    seo/          SeoHead.astro  StructuredData.astro  sitemap-filter.ts
    components/   PriceValue.astro  DemoPricingNotice.astro  PlaceholderMark.astro
                  MissingFact.astro  EmergencyPhoneLink.astro  PhoneLink.astro  PrototypeBanner.astro
    markdown/     restrict-body.ts  (remark plugin, content-contract §7.3)
    media/        resolve.ts  inventory.ts
    tests/        *.test.ts (vitest)
  templates/
    rodinna-tradice/                # full Astro project, consumes @core via path alias
      template.manifest.ts
      astro.config.mjs  src/{layouts,components,pages,styles}  src/site.config.ts
    dustojna-jednoduchost/
  fixtures/
    neutral/                        # synthetic business "Pohřební služba Vzor", every value marked placeholder/demo
  clients/                          # tracked; created by npm run client:new (docs/client-workflow.md)
    hnatek/
      src/         site.config.ts  content/ (content-contract §2 layout)  assets/media/
      provenance/  facts.json  approvals.json
      notes/       research and feedback notes (not exported)
  tools/
    export/                         # builds a standalone client repo (§9)
    cms/                            # generates .pages.yml from contract + manifest + features
  docs/
```

**Import convention.** Templates import core only through the alias `@core/*`.

- In the system repo, `@core/*` resolves to `../../core/*`, set in both the tsconfig `paths` and the Vite `resolve.alias`.
- In an exported site, the same alias resolves to `./src/core/*`.

Template source therefore needs no rewriting on export.

**Bootstrap exception.** `astro.config.mjs` and `fixture.site.config.ts` load before any Vite alias exists, so they reach core by relative path (`../../core/integration.ts`). The export rewrites those paths. `template.manifest.ts` uses only `import type` from `@core/…`, which is erased at load time.

**How it is wired (implemented in S1).**

- Every Astro project installs the integration `siteCore()` from `core/integration.ts`, and its `src/content.config.ts` is a one-line re-export of `@core/content/collections.ts`.
- The integration reads the site from `SITE_ROOT`. This defaults to the project root; template and harness scripts set `SITE_ROOT=../fixtures/neutral`.
- During template development, `SITE_CONFIG` can point at a template's own fixture config (e.g. `templates/<id>/fixture.site.config.ts`, with that template's id, default options and section order). It overrides `<SITE_ROOT>/src/site.config.ts`.
- Pass the manifest as `siteCore({ manifest })`. The gate then checks the config against it (G-005).
- Before every build the integration runs the schema check and the publication gate, and fails the build on errors. It also fixes the route conventions, and writes `robots.txt`, plus `sitemap.xml` in production.
- It exposes the singletons, the config, the build mode and the media map through the virtual module `virtual:site-core/data`. Templates never import that module directly; they use `@core/content/load.ts` and `@core/media/resolve.ts`.
- The harness (`harness/`) is the reference consumer.

**Content source.** During template development, a template builds against `fixtures/neutral/`. For a client, `npm run client:dev -- hnatek` runs the template named in `clients/hnatek/src/site.config.ts` with `SITE_ROOT`/`SITE_CONFIG` pointing at the client, and `npm run client:export -- hnatek` assembles the standalone project (§9) from the template, core, and the client's content, assets and `site.config.ts` (see [client-workflow.md](client-workflow.md)). Templates read content from `src/content/` and never know which client they render.

## 3. Template manifest

Each template exports a manifest. Tools read it to generate the CMS config, validate `site.config.ts` and run QA.

```ts
// templates/<id>/template.manifest.ts
import type { TemplateManifest } from "@core/content/view-models";

export default {
  id: "dustojna-jednoduchost",
  name: "Důstojná jednoduchost",
  version: "0.1.0",
  coreVersion: "^0.1.0",

  supports: {
    articles: false,              // pilot: neither template implements articles
    multipleLocations: false,
    contactForm: false,           // reserved; enabling needs U9 resolved
    serviceDetailPages: true,     // generates /sluzby/<slug>/
    mapEmbed: false,              // features.map "embed-on-click" rejected by G-005 when false
  },

  homepageSections: {
    available: ["hero", "next-steps", "services", "contact-summary", "family-story", "catalogue-links"],
    default:   ["hero", "next-steps", "services", "contact-summary", "family-story"],
    constraints: { first: "hero", required: ["hero", "contact-summary"] },
  },

  options: {                      // agent-selectable variants (never CMS)
    palette:  { values: ["slate-forest", "slate-blue"], default: "slate-forest" },
    fontPair: { values: ["public-sans", "plex-sans-serif"], default: "public-sans" },
    heroVariant: { values: ["text-only", "text-with-image"], default: "text-only" },
    emergencyEmphasis: { values: ["standard", "high"], default: "standard" },
  },

  imageSlots: {
    "home.hero":      { aspect: "3:2",  required: false, page: "home",  field: "heroImage" },
    "about.story":    { aspect: "4:3",  required: false, page: "o-nas", field: "heroImage" },
    "company.logo":   { aspect: "none", required: false },          // rendered in the header; text wordmark while null
    "coffin.item":    { aspect: "4:3",  required: false },
    "flower.item":    { aspect: "1:1",  required: false },
  },

  pageFields: {                   // which Page fields this template renders (drives CMS field visibility)
    home:  ["title", "lead", "heroImage", "metaDescription"],
    "o-nas": ["title", "lead", "excerpt", "heroImage", "body", "metaDescription"],
    // … every required page listed
  },
} satisfies TemplateManifest;
```

Every value in `options` must be fully implemented and must pass contrast and layout QA. The agent cannot ask for values outside the declared set (`site.config.ts` is validated against the manifest).

## 4. Route contract

Core owns the URLs (content-contract §5). Templates own the `src/pages/*.astro` files that render them.

| Route | Template obligation | Data available (core view model) |
| --- | --- | --- |
| `/` | must render; sections in `site.config.homepage.sections` order | `SiteContext`, `pages.home`, featured services, guidance (first-hours), `pages["o-nas"].excerpt` |
| `/jak-postupovat/` | must render all published guidance, grouped or ordered by the template | `guidance[]` (sorted by phase, then order) |
| `/sluzby/` | must render all published services | `services[]` grouped by category |
| `/sluzby/<slug>/` | only if `supports.serviceDetailPages`; otherwise the build must not emit these paths, and anchors `/sluzby/#<slug>` are used instead | `service`, linked price group |
| `/rakve/` | must render; must handle 0 entries | `coffins[]` |
| `/kvetiny/` | must render; must handle 0 entries | `flowers[]`, flowers phone |
| `/o-nas/` | must render | `pages["o-nas"]`, `company.tradition` |
| `/kontakt/` | must render address, all office/department phones, e-mail, office hours, separate emergency block, map link | `contact`, `officeHours`, `emergency` |
| `/cenik/` | must render if `pricing.visible`; otherwise no file is emitted | `pricing` (+ `hasDemo`) |
| `/ochrana-osobnich-udaju/` | must render if the page exists | `pages["ochrana-osobnich-udaju"]` |
| `/clanky/…` | only if `supports.articles` and the feature is on | `articles[]` |
| `/404.html` | must render, including the emergency CTA | `SiteContext` |

Conditional routes are implemented as dynamic routes whose `getStaticPaths` returns no paths when the route is disabled (e.g. `src/pages/clanky/[...path].astro`). Disabled sections therefore produce no files at all, not empty pages.

Each template must ship a page file for every required route, or the build fails.

## 5. Data access interface

Templates obtain data only through core:

```ts
// @core/content/view-models.ts (shape, abbreviated)
export interface SiteContext {
  mode: "prototype" | "production";
  config: SiteConfig;                 // validated site.config.ts
  company: Company;
  contact: Contact;
  officeHours: OfficeHours;
  emergency: EmergencyTransport;
  nav: NavItem[];                     // derived: required pages + conditional ones that are on; labels from pages/*.md navLabel
  pricingVisible: boolean;
  missing: MissingFact[];             // null required facts (for prototype markers)
}

export async function getSiteContext(): Promise<SiteContext>;
export async function getPage(id: PageId): Promise<LoadedPage>;        // { data, Content, hasBody }; throws if missing (G-002)
export async function getOptionalPage(id: PageId): Promise<LoadedPage | null>; // e.g. ochrana-osobnich-udaju
export async function hasPage(id: PageId): Promise<boolean>;
export async function getServices(): Promise<ServiceView[]>;           // published only, sorted
export async function getGuidance(): Promise<GuidanceView[]>;
export async function getCoffins(): Promise<CoffinView[]>;
export async function getFlowers(): Promise<FlowerView[]>;
export async function getPricing(): Promise<PricingView | null>;       // null when not visible
export function formatOfficeHours(h: OfficeHours): HoursRow[];         // [{ days: "Po–Pá", text: "7:00–15:30", note: "polední přestávka 12:00–12:30" }, { days: "So–Ne", text: "zavřeno" }]
export function formatPhone(e164: string): { display: string; href: string };
export function resolveImage(ref: ImageRef): ResolvedImage;            // ImageMetadata + alt + flags
```

Templates must not read `src/content/**` directly, call `fetch` at build time for content, or make runtime network calls of any kind.

## 6. Mandatory behaviours (invariants every template must satisfy)

These are tested by the shared QA suite in Phase 2 (S6), not just reviewed.

**Emergency and contact**

1. The nonstop transport CTA renders on every page via `<EmergencyPhoneLink>`, as specified in content-contract §6.5. At 375 × 667 px it lies inside the first viewport, or in a persistent bar that does not cover content (the page reserves padding for it).
2. Office hours and emergency transport never share a container, list or heading.
3. The contact page and the footer show the address, office phones and office hours. Each office phone is a `tel:` link.

**Safety components (headless, from core; templates style them through `class` props or `data-*` attributes and cannot remove their text)**

| Component | Purpose | Unremovable output |
| --- | --- | --- |
| `<PriceValue item>` | every price | formatted amount; "UKÁZKA" text for demo items |
| `<DemoPricingNotice>` | `/cenik/` when any demo item is present | the notice paragraph (`role="note"`) |
| `<PlaceholderMark>` | wraps placeholder entries/images | "Zástupný obsah" / "Zástupný obrázek" label |
| `<MissingFact name>` | null required facts in prototype | "[Doplnit: …]" |
| `<PrototypeBanner>` | prototype mode, top of `<body>` | banner text |
| `<EmergencyPhoneLink variant>` | the emergency CTA | `tel:` href, label + number in the accessible name |
| `<SeoHead>` / `<StructuredData>` | head metadata, JSON-LD | canonical, robots (mode-dependent), `LocalBusiness` with office hours; the emergency line as a separate `contactPoint` (`hoursAvailable` 24/7); never demo prices or UNKNOWN facts |

**Required template hooks** (the QA suite in `qa/` relies on them; added after S6)

- `data-office-hours` on every block that shows office hours, headed by its own heading (not a styled `<p>`);
- `data-emergency-block` on every separately headed emergency block (footer, contact page);
- `data-section="<homepage section id>"` on every homepage section, in rendered order.

**Accessibility (WCAG 2.2 AA where practical)**

- `lang="cs"`; one `<h1>` per page; no skipped heading levels; landmarks `header`, `nav`, `main`, `footer`; a skip link to `#obsah`.
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text); UI component and focus indicator contrast ≥ 3:1; visible `:focus-visible` on every interactive element.
- Fully keyboard operable. A mobile navigation toggle is a `<button aria-expanded aria-controls>` and works without other JS.
- Tap targets ≥ 44 × 44 px for primary actions, ≥ 24 × 24 px minimum elsewhere (2.5.8).
- Text resizes to 200 % without loss; reflow at 320 px with no horizontal scroll (1.4.10).
- `prefers-reduced-motion` respected. In practice there is no decorative motion at all.
- Images use `alt` from `ImageRef`; decorative images use `alt=""`.
- The map is a link ("Zobrazit na mapě"). A click-to-load embed is allowed only with the privacy page (gate G-061).

**Core components and template CSS (learned in S3/S4)**

- Classes passed into core components (`class`, `labelClass`, …) are not reached by Astro-scoped `<style>`. Style them in global CSS or by their `data-*` hooks (`[data-placeholder-label]`, `[data-demo-label]`, `[data-missing-fact]`, `[data-unreviewed-mark]`, `[data-emergency-link]`).
- `EmergencyPhoneLink variant="custom"` renders only the slot (short UI text such as "Nonstop převoz"), while the accessible name still comes from core.
- `UnreviewedMark` renders the G-040 "Neověřený text" marker. `resolveTemplateOptions(config, manifest)` (from `@core/content/config.ts`) fills in manifest defaults.
- Tailwind v4 scans templates, so a custom class named like a utility (e.g. `float-right`) also receives that utility. Give template classes non-utility names.
- `@fontsource/<font>/latin-<weight>.css` files have no `unicode-range`. Import the combined `<weight>.css`, or declare the faces with ranges yourself.
- The integration imports only images referenced by content, so unused files in `src/assets/media/` are not emitted.

**Technical**

- Static output only (`output: "static"`). No client framework islands. Vanilla JS is limited to the nav disclosure and is optional.
- Fonts are self-hosted (`@fontsource/*` packages or files in the repo). Calls to Google Fonts or other CDNs are forbidden, both for privacy and so the export works without them.
- No third-party scripts, trackers or embeds by default.
- Images go only through `astro:assets` (`<Image>`/`<Picture>`), with width and height set and lazy loading below the fold.
- Performance budget per page (mobile): HTML + CSS ≤ 100 KB compressed, JS ≤ 10 KB, LCP image ≤ 200 KB.

## 7. What templates are free to differ in

Everything else. The minimum differences required for the pilot are specified in [design-differentiation.md](design-differentiation.md). In summary:

- the header and navigation pattern, and the placement pattern of the emergency CTA (within invariant 1);
- homepage sections, their order and composition (within manifest constraints);
- services architecture: one long page with anchors, or an index plus detail pages;
- how guidance is presented: narrative, phased checklist, etc.;
- catalogue presentation, pricing presentation (list, table or definition list), footer structure;
- typography, palette, spacing system, rules and ornaments, image proportions and how much photography is used;
- which optional page fields are rendered (`pageFields`).

**Forbidden for every template:** gradients for decoration, glows, carousels or sliders, parallax, scroll-triggered animation, generic icon-card grids as the main structure, stock portraits, realistic generated imagery, emotionally manipulative copy in template defaults, and hard-coded Czech copy that states business facts. Template UI strings (e.g. "Zobrazit na mapě") are fine; they live in `src/i18n/cs.ts` in each template.

## 8. Agent-level customisation (`site.config.ts`)

```ts
// Plain object and `import type` only: Node loads this file directly (type stripping) for the validator.
import type { SiteConfigInput } from "./core/content/config.ts";   // path differs per layout; erased at runtime

const config = {
  template: "rodinna-tradice",
  siteUrl: "https://example.invalid",               // real domain required in production (G-012)
  features: { articles: false, contactForm: false, map: "link" },
  homepage: { sections: ["hero", "family-story", "services", "next-steps", "contact-summary"] },
  options: { palette: "ivory-umber", fontPair: "garamond-source", heroVariant: "photo-right", emergencyEmphasis: "standard" },
} satisfies SiteConfigInput;

export default config;
```

The config is validated by `SiteConfig` (schema) and by `checkConfigAgainstManifest()` (declared options and section constraints).

The scenario in Phase 5 ("make the nonstop number more prominent, move family history higher") is answered entirely by `options.emergencyEmphasis` and `homepage.sections`. Template source is untouched, which keeps the diff small and keeps unrelated design unchanged.

Per-client changes to template source are **not** customisation. They are a template change, made in `templates/<id>`, versioned, and re-exported. Free-form per-client CSS overrides were rejected (§10).

## 9. Standalone export

`npm run export -- --client hnatek --template rodinna-tradice --out ../hnatek-web` produces a self-contained Astro project.

**Contents**

```
hnatek-web/
  package.json            # name, scripts, exact-pinned public npm deps, "engines", "packageManager"
  package-lock.json       # resolved with `npm install --package-lock-only` from public versions; verify runs `npm ci`
  .nvmrc                  # Node version used for the verified build
  astro.config.mjs        # template config; @core alias → ./src/core
  tsconfig.json
  .pages.yml              # generated CMS config (static file; generator is NOT exported)
  src/
    core/                 # verbatim copy of core/ without core/tests (cli/ and the launch check included)
    layouts/ components/ pages/ styles/ i18n/   # from the template
    content/  assets/media/  site.config.ts      # from clients/hnatek
  public/                 # favicon, robots handled by core at build time
  scripts/validate.ts     # runs schema + gate (+ G-005 against the manifest) without building; Node runs .ts directly
  .github/workflows/      # publish.yml (production build + gate, then fast-forward main) and discard.yml
  README.md               # Czech + English: build, preview, deploy, SITE_MODE
  HANDOVER.md             # Czech: what can be edited where, publishing, rollback, responsibilities
  CREDITS.md              # fonts (licences), image sources and rights holders
  TEMPLATE.json           # { template, templateVersion, coreVersion, exportedAt }: informational only
  docs/provenance/        # archived facts.json + approvals.json (record of what was verified, by whom)
```

**Exclusions:** other templates, `fixtures/`, other clients, `tools/` (export, CMS generator), agent prompts and instruction files (`CLAUDE.md`, `AGENTS.md`, `.cursor/`), `core/tests`, and any internal credentials or URLs.

**Independence requirements** (verified by `tools/export/verify.ts`, which must pass before handover):

1. Run in a fresh temp directory, outside the system repo, with no parent `node_modules`: `npm ci && npm run build && npm run validate`, with `SITE_MODE=prototype` and again with `SITE_MODE=production`. The production run is expected to fail while demo or placeholder content is present, and must name the exact gate rules.
2. A text scan finds no `workspace:`, `file:` or `link:` dependency specifiers, no `../` imports escaping the project root, no absolute local paths, no private registry URLs, and no references to `@core` that do not resolve inside `src/core`.
3. The only network access at build time is the public npm registry during install. A build with the network disabled after install succeeds.
4. Fonts and images are all present in the repo.
5. Deploy target: any static host. `dist/` is the artifact. Host-specific files (`netlify.toml`, Cloudflare `_headers`) are added only for the host the client chooses (U17). The host environment sets `SITE_MODE=production`.

**Launch check inside an export.** `check:launch` looks for the ledger in `provenance/`, then in the archived `docs/provenance/`, so it also runs in an exported site.

**Tooling note (Astro 7).** In agent shells, `astro preview` moves itself into the background, so test runners report "webServer exited early" and the server keeps holding its port. Pass `--ignore-lock` to keep it in the foreground, as `qa/playwright.config.ts` does.

**Ownership statement for HANDOVER.md.** The CMS restricts the *editing interface*. Whoever owns the GitHub repository has full source access and can change anything. Design changes made outside the CMS are the owner's responsibility and fall outside the template's support terms (U18).

## 10. Alternatives considered and rejected

| Alternative | Why rejected |
| --- | --- |
| One template with theme switching via CSS variables/tokens | Produces recolourings, which is exactly what Phase 4 must rule out. |
| Shared styled component library used by both templates | Components converge, and the "two templates" become one. Core is limited to headless safety components. |
| Core published as a private npm package | The exported site would depend on a private registry. Vendoring the source copy satisfies independence. |
| Both templates shipped in the export with a switch | Dead code; invites client-side layout changes; widens the support surface. |
| Per-client free-form CSS overrides | Breaks template versioning and the Phase 5 "unrelated design unchanged" check; contrast could regress silently. Declared options replace it. |
| SSR/hybrid output, or a hosted headless CMS | Adds runtime dependencies and cost; the brief requires static public pages. Pages CMS edits Git, and the site stays static. |
| Templates reading content files directly | Bypasses validation and makes renaming a field a two-template change. Everything goes through core loaders. |
| "Open now" status indicator | Needs client-side time logic; wrong on holidays and exceptions; low value against its risk. |
| Google Maps iframe / Google Fonts by default | Third-party data transfer and consent obligations in the EU; breaks offline builds. |
