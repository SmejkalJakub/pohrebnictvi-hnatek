---
name: site-research
description: Research a funeral-home client's existing website and public registers, and fill clients/<id>/provenance/facts.json with a status and source for every fact. Use when the user runs /site-research <id> <url> or asks to research a new client.
argument-hint: <client-id> <existing-website-url>
---

# /site-research <id> <url>

Arguments: `$ARGUMENTS` (client id, then the client's current website).

Goal: a complete, honest fact ledger for `clients/<id>/`. You record what public sources say. You never guess, round, "complete" or infer a value. A fact you cannot find stays `UNKNOWN` with `value: null`.

Read first: `docs/content-contract.md` §3 (provenance), §6.1–6.5 (fact shapes), §10 (an example ledger seed); `docs/editable-fields.md` §3 (what the agent must not do).

## 1. Make sure the client exists

- If `clients/<id>/` does not exist, ask which template to start with (`rodinna-tradice`: warm, editorial, serif; `dustojna-jednoduchost`: practical, sans-serif, mobile action bar), then run `npm run client:new -- <id> --template <template>`. Template choice can change later in `/site-build`.
- Use Node from `.nvmrc` (`nvm use`) for every npm script.

## 2. Collect sources

Read, in this order, and keep every URL you use:

1. The client's website `<url>`: every page in its navigation, plus the footer, contact page, price list (ceník), services, "o nás", coffins/flowers catalogue, any PDF price list.
2. ARES (`https://ares.gov.cz`) for IČO, DIČ, legal name and registered office; the commercial register (`https://or.justice.cz`) for the register entry ("C 12345 vedená u Krajského soudu v …").
3. A map link for each location (`https://mapy.cz`). Record the link the old website uses, if any; do not take coordinates from a map search unless the address match is exact, and say so in `note`.
4. Nothing else without asking the user (no review sites, no social media scraping, no guessing from photos).

## 3. Fill the ledger

Edit `clients/<id>/provenance/facts.json`. Keys follow content-contract §3.2: `<file>.<path>`, list members by their `id`. The skeleton already lists every key the launch check tracks (`collectTrackedFacts()` in `core/gate/launch-check.ts`) with the neutral fixture's ids (`vzorov`, `kancelar`, `kancelar-mobil`, `kvetiny`, `pracovni-dny`).

- Rename ids to fit the client (e.g. `contact.locations.vyskov.address`, `contact.phones.office-main.number`). Use the same ids you will use in content. Add keys for extra phones, e-mails, locations or hours groups; delete keys for things the client does not have (e.g. no flowers phone).
- Each entry:
  - Found on the client's website: `"status": "EXISTING_WEBSITE"`, `"value"` exactly as it should appear in content (phones in E.164 `+420…`, addresses as `{ "street", "city", "postalCode", "country": "CZ" }`, hours as the `weekly` group object), `"source"` the page URL, `"retrievedAt"` today's date.
  - Found in ARES / the commercial register: also `EXISTING_WEBSITE` (the vocabulary has no separate "public register" status; it means "published, must be re-confirmed by the client"), `source` the register URL, `note: "public register"`.
  - Not found, or sources disagree: `"status": "UNKNOWN"`, `"value": null`; put what you saw in `note` (e.g. "web shows two different office numbers").
  - Never write `VERIFIED` or `CLIENT_PROVIDED`. Those come only from the operator relaying the client (see `/site-revise`).
- `company.tradition.foundedYear`: never derive it from the incorporation date. `company.tradition.publicWording`: only a phrase the website itself uses, quoted exactly.
- Keep the emergency (nonstop transport) number separate from office phones. If the site gives no nonstop line, `emergency.phone` stays UNKNOWN.

## 4. Write the research notes

Create `clients/<id>/notes/research.md` (not exported, never deployed):

- Sources consulted, with dates.
- Services and ceremony types the website names (for `/site-build`; services are content, not ledger facts). Quote, do not embellish.
- Prices found: item, amount, unit, source URL, and whether VAT is stated. These are not approved prices.
- Coffins, flowers: does a catalogue exist, how many items, image URLs.
- Images worth reusing (logo, premises, vehicles): URL, what it shows, likely rights holder. Do not download yet.
- Logo: URL or file, colours (hex), typefaces if identifiable; tone of voice (formal, warm, practical).
- Old-site URLs (for redirects later).
- Open questions for the client, numbered, one line each (missing IČO, which phone is the nonstop line, holiday closures, …).

## 5. Check and report

- Run `npm run client:validate -- <id>` (the ledger does not affect it yet; it must still say `PROTOTYPE: PASS`).
- Run `npm run check:launch -- clients/<id>` and expect it to fail: `L-005` lines list content values that still come from the skeleton.
- Report to the user: how many facts are EXISTING_WEBSITE vs UNKNOWN, the open questions, and suggest `/site-build <id>` next.
