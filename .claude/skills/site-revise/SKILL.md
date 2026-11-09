---
name: site-revise
description: Apply one round of the owner's or client's feedback to a client site, keep the provenance ledger and approvals in sync, and re-validate. Use when the user runs /site-revise <id> or gives feedback on a client prototype.
argument-hint: <client-id> [feedback]
---

# /site-revise <id>

Arguments: `$ARGUMENTS` (client id, then optionally the feedback). If no feedback is given, ask for it. Works in `clients/<id>/`.

Read first: `clients/<id>/provenance/facts.json`, `approvals.json`, `notes/` and `docs/editable-fields.md` §3. The `/site-build` hard rules still apply.

## 1. Sort the feedback

Split it into numbered items, each one of:

- **Fact** (a phone, hours, address, IČO, tradition wording, a confirmation "the number is right"): goes through the ledger first.
- **Sign-off** (copy, prices, guidance review, image rights): goes into `approvals.json`.
- **Copy** (wording, tone, shorter, add a section): content files only.
- **Design** (colour, font, "nonstop number more prominent", section order, hero image): `src/site.config.ts` options and `homepage.sections` only.
- **Out of scope** (a new layout, custom CSS, a new page type, a contact form): do not do it; explain that it is a template change and record it for the owner.

Read the list back only if an item is ambiguous.

## 2. Apply

- **Fact.** Update `provenance/facts.json` first, then content to the same value.
  - The client stated or confirmed a value: ask who confirmed it, when and how, unless the feedback says. Then: a confirmation of an existing value → `"status": "VERIFIED"`, `"verifiedBy": "<name>"`, `"verifiedAt": "<date>"`, `note` with the method ("telefonicky", "e-mail"). A new value from the client that is not independently checked → `"status": "CLIENT_PROVIDED"`, `source` naming the person and date.
  - The operator says it is wrong but gives no replacement → set `UNKNOWN`, `value: null`, and null the content field (or restore the stand-in where the schema requires a value).
  - Never mark VERIFIED without a named person and date.
- **Sign-off.** Record only what the user states, with name and date: `copy[<file>] = { "status": "APPROVED", "approvedBy", "approvedAt" }`; `pricing = { "status": "APPROVED", …, "method" }` and then set those items to `"status": "approved"` plus `validFrom` and `vatNote`; guidance → both `approvals.guidance[<file>]` and the entry's `review.reviewedBy/reviewedAt`; images → `approvals.images["src/assets/media/<file>"].rightsEvidence` and `rightsConfirmed: true` on the image; CLIENT_PROVIDED facts → `approvals.facts[<key>]`.
- **Copy.** Edit the file; if its text changed after approval, set its `copy` entry back to `DRAFT` and say so. Keep `placeholder` honest.
- **Design.** Use only values in `templates/<template>/template.manifest.ts` (G-005). Example: "make the nonstop number more prominent, move family history higher" → `emergencyEmphasis: "high"` and move `family-story` up in `homepage.sections`.

Append the round to `clients/<id>/notes/feedback.md`: date, each item, what changed (files), what was not done and why.

## 3. Re-validate

1. `npm run client:validate -- <id>`: must end with `PROTOTYPE: PASS`.
2. `npm run client:build -- <id>`.
3. `npm run check:launch -- clients/<id>`: show how the launch findings moved (fewer L-003/L-005/L-006 lines is progress).

## 4. Report

Per item: done / not done (reason). Then the remaining production blockers and launch findings, and the open questions for the client. When `client:validate` shows no production errors and `check:launch` passes, suggest `/site-ship <id>`.
