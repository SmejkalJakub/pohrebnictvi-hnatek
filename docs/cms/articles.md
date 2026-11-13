# Articles: deferred

**Decision (2026-11-12):** articles are not part of this proof of concept. The CMS side is ready; the public side is not, and building it is a template change for two templates, which the CMS integration did not need.

## What exists

- Content contract: the `Article` schema (`core/content/schemas.ts`: title, summary, `publishedAt`, `updatedAt`, image, `draft`, body), the `articles` collection loader, visibility (`draft` entries never render) and gate rules G-051 (no `articles/` folder while the feature is off; feature on only when the template supports it).
- CMS: `articlesCollection()` in `tools/cms/decap-config.ts`. Generated only when `features.articles` is on **and** `manifest.supports.articles` is true. New articles start with `draft: true`; the file name comes from the title. Tested with a synthetic manifest (`decap-config.test.ts`, "optional collections").

## What is missing

- Neither template supports articles (`supports.articles: false` in both manifests) and neither has routes for them. Turning the feature on today fails G-005 / G-051, which is correct.
- The contract has no separate SEO fields for articles; `title` and `summary` serve as meta title and description, as for services. Adding `metaTitle` / `metaDescription` is a contract change.
- The page `clanky` (listing intro) exists in the contract but in no template's `pageFields`.

## Bounded plan (one template at a time)

1. Template A (`rodinna-tradice`): `src/pages/clanky/index.astro` (listing, newest first, non-draft only) and `src/pages/clanky/[slug].astro` (article), using the template's existing typography and page layout; a nav item only while the feature is on; `pageFields.clanky`; `imageSlots["article.image"]` if a cover image is shown; `supports.articles: true`.
2. Sitemap and structured data (`Article`) through core, not per template.
3. Test fixture with the feature on (a copy of the neutral fixture, never the Hnátek clients): build, gate, CMS config with the collection, and a browser check of creating an article in Decap with the local backend.
4. Template B (`dustojna-jednoduchost`) the same way, with its own layout, not a copy of A.
5. Keep `features.articles: false` for both Hnátek variants until the client asks for news and supplies real articles; no generated or sample articles on a real site.

Estimate: about one working day per template, plus QA.
