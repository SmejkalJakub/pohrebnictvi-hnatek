# Files saved by Decap CMS 3.17.3

Byte-for-byte output of a real Decap CMS 3.17.3 editor (self-hosted bundle, generated
`config.yml`, `local_backend` with `decap-server` 3.11.6), saved on 2026-11-12 from a copy of
`clients/hnatek`. Do not reformat (listed in `.prettierignore`).

| File | Edit made in the editor |
| --- | --- |
| `site/company.json` | `brandName` → "Pohřebnictví Hnátek TEST" |
| `site/contact.json` | second phone `number` → "+420739404910" |
| `site/pricing.json` | first price `amount` 18900 → 19500 (status left "demo") |
| `guidance/umrti-doma.md` | " Upraveno." appended to `summary` (body untouched) |
| `pages/o-nas.md` | " Testovací věta." appended to the first body paragraph; hero image replaced with `kvetiny-na-rakev-bila.jpg` (the admin page cleared the inherited rights confirmation on save), then rights confirmed again and saved |

`tools/cms/tests/decap-roundtrip.test.ts` checks that each file, read by core, equals the original
content with only these edits.
