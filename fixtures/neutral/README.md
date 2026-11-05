# Neutral fixture: "Pohřební služba Vzor"

A **fictional** business used to develop and test templates (phase-2-plan S1). Nothing here describes a real company.

- Every page and entry is `placeholder: true`, every price is `status: "demo"`, and every image is a neutral placeholder (`source: "placeholder"`).
- Phone numbers use the pattern `+420000000xxx`. It passes the schema, but `000` is not an allocated Czech number range, so the numbers cannot reach anyone.
- E-mail and map links use the reserved `.invalid` domain (RFC 2606).
- Legal identifiers (IČO, register entry, registered office) are intentionally `null`, to exercise the "[Doplnit: …]" markers.
- Expected gate result: **prototype passes** (markers and warnings only); **production fails** with G-011, G-012, G-020, G-021, G-031, G-032 and G-040.
- `provenance/` holds an illustrative ledger in the Phase 0 format. `npm run check:launch fixtures/neutral` is expected to fail.

Use it from a template or the harness with `SITE_ROOT=../fixtures/neutral`.
