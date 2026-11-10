# Neutral fixture: "Pohřební služba Vzor"

A **fictional** business used to develop and test templates (phase-2-plan S1). Nothing here describes a real company.

- Every page and entry is `placeholder: true`, every price is `status: "demo"`, and every image is a neutral placeholder (`source: "placeholder"`).
- Phone numbers use the pattern `+420000000xxx`. It passes the schema, but `000` is not an allocated Czech number range, so the numbers cannot reach anyone.
- E-mail and map links use the reserved `.invalid` domain (RFC 2606).
- Legal identifiers (IČO, register entry, registered office) are intentionally `null`, to exercise the "[Doplnit: …]" markers.
- Optional content types (content-contract §6.13–§6.17) are present and switched **on** in this fixture's own `src/site.config.ts`, so the harness renders them: five notices (`notices/`: one with an upcoming civil ceremony, a photo and a livestream link; one with a past church ceremony and a parte PDF; one without ceremony; one expired; one unpublished draft without consent), three people, six FAQ entries, three documents with "ZÁSTUPNÝ DOKUMENT" PDFs in `src/assets/documents/`, `site/legal.json`, the pages `oznameni`, `pro-ucastniky`, `pohreb-predem` and `pravni-informace`, and `includes` / `excludes` on the first price group. All names are fictional ("Vzorový", "Ukázková", "Příkladný"), every entry is `placeholder: true`, and each published notice has a fictional consent record.
- Dates of notices are relative to **2026-11-10**, pinned with `pinnedBuildDate` (prototype only, G-073) so builds and tests never depend on the clock. `SITE_BUILD_DATE` overrides it.
- Templates preview this fixture with their own `fixture.site.config.ts`, in which the optional features stay off until the template supports them; A and B therefore build exactly as before.
- Expected gate result: **prototype passes** (markers and warnings only; warnings G-021, G-071 for the expired notice, G-074 for people without recorded consent); **production fails** with G-011, G-012, G-020, G-021, G-031, G-032, G-040, G-073 and G-074.
- `provenance/` holds an illustrative ledger in the Phase 0 format. `npm run check:launch fixtures/neutral` is expected to fail.

Use it from a template or the harness with `SITE_ROOT=../fixtures/neutral`.
