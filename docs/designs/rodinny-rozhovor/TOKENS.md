# Rodinný rozhovor: tokens

Generated from the canvas source; contrast is computed (WCAG 2.2), not estimated.

## Palette Hlína (default)

| Role | Hex |
| --- | --- |
| ground | `#F6EFE4` |
| band | `#E9D9C2` |
| deep | `#5A2E22` |
| on_deep | `#F6EFE4` |
| on_deep_muted | `#E9D9C2` |
| ink | `#2B211C` |
| muted | `#5E5047` |
| accent | `#8A3F24` |
| rule | `#9A8670` |
| photo_placeholder | `#D9C7AE` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 13.75 : 1 | 4.5 : 1 | pass | body text |
| ink | band | 11.35 : 1 | 4.5 : 1 | pass | body text on sand fields |
| muted | ground | 6.77 : 1 | 4.5 : 1 | pass | secondary text |
| muted | band | 5.59 : 1 | 4.5 : 1 | pass | secondary text on sand fields |
| accent | ground | 6.53 : 1 | 4.5 : 1 | pass | accent text |
| accent | band | 5.38 : 1 | 4.5 : 1 | pass | accent text on sand |
| on_deep | deep | 9.95 : 1 | 4.5 : 1 | pass | text and nonstop number in the deep field |
| on_deep_muted | deep | 8.21 : 1 | 4.5 : 1 | pass | label in the deep field |
| rule | ground | 3.06 : 1 | 3.0 : 1 | pass | drawing frames, QR border |
| ink | ground | 13.75 : 1 | 3.0 : 1 | pass | focus ring (3 px ink; on_deep inside the deep field) |

## Palette Med

| Role | Hex |
| --- | --- |
| ground | `#F7F1E3` |
| band | `#EBDDB8` |
| deep | `#3F3A2A` |
| on_deep | `#F7F1E3` |
| on_deep_muted | `#E6D8B4` |
| ink | `#2A2619` |
| muted | `#5C5543` |
| accent | `#7A5A12` |
| rule | `#968A6C` |
| photo_placeholder | `#DCCB9F` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 13.42 : 1 | 4.5 : 1 | pass | body text |
| ink | band | 11.20 : 1 | 4.5 : 1 | pass | body text on sand fields |
| muted | ground | 6.58 : 1 | 4.5 : 1 | pass | secondary text |
| muted | band | 5.49 : 1 | 4.5 : 1 | pass | secondary text on sand fields |
| accent | ground | 5.65 : 1 | 4.5 : 1 | pass | accent text |
| accent | band | 4.72 : 1 | 4.5 : 1 | pass | accent text on sand |
| on_deep | deep | 10.08 : 1 | 4.5 : 1 | pass | text and nonstop number in the deep field |
| on_deep_muted | deep | 8.02 : 1 | 4.5 : 1 | pass | label in the deep field |
| rule | ground | 3.03 : 1 | 3.0 : 1 | pass | drawing frames, QR border |
| ink | ground | 13.42 : 1 | 3.0 : 1 | pass | focus ring (3 px ink; on_deep inside the deep field) |

## Fonts

| Family | Weights | Role | Licence | Package |
| --- | --- | --- | --- | --- |
| Alegreya | 400, 700 | headings and body | SIL OFL 1.1 | `@fontsource/alegreya` |
| Alegreya Sans | 500 | nav and labels | SIL OFL 1.1 | `@fontsource/alegreya-sans` |

Alternative pairing: Gelasio + Alegreya Sans. All faces render the pangram “Příliš žluťoučký kůň úpěl ďábelské ódy” in every weight used (checked in Chromium, 2026-11-10).

## Type scale (px)

| Token | Value |
| --- | --- |
| body | 21 |
| answer_lead | 30 |
| small_min | 18 |
| h1_375 | 36 |
| h1_1280 | 64 |
| h2_375 | 30 |
| h2_1280 | 44 |
| nonstop_number_375 | 36 |
| nonstop_number_1280 | 54 |
| line_height_body | 1.55 |
| line_height_display | 1.05 |

## Spacing (px)

8 · 16 · 28 · 56 · 80

## Layout

| Token | Value |
| --- | --- |
| grid_1280 | 12 columns, 24 px gap, 56 px side margin |
| field_padding_1280 | 72px 56px |
| field_padding_375 | 28-32px 16px |
| gutter_375 | 16 |
| radius | 0 |

## Separation device

full-bleed colour fields (cream / sand, the first one deep); no lines at all
