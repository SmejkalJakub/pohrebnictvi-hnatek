# Noční linka: tokens

Generated from the canvas source; contrast is computed (WCAG 2.2), not estimated.

## Palette Noc (default)

| Role | Hex |
| --- | --- |
| ground | `#121614` |
| rail | `#1B211E` |
| ink | `#F1EEE6` |
| muted | `#B9BDB5` |
| signal | `#F0B54A` |
| rule | `#6F7771` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 15.74 : 1 | 4.5 : 1 | pass | body text |
| ink | rail | 14.12 : 1 | 4.5 : 1 | pass | text in the rail / mobile nonstop panel |
| muted | ground | 9.57 : 1 | 4.5 : 1 | pass | secondary text |
| muted | rail | 8.58 : 1 | 4.5 : 1 | pass | secondary text in the rail |
| signal | ground | 9.92 : 1 | 4.5 : 1 | pass | nonstop number only |
| signal | rail | 8.90 : 1 | 4.5 : 1 | pass | nonstop number in the rail |
| rule | ground | 3.96 : 1 | 3.0 : 1 | pass | rules, button borders |
| signal | ground | 9.92 : 1 | 3.0 : 1 | pass | focus ring (3 px) |

## Palette Grafit

| Role | Hex |
| --- | --- |
| ground | `#1C1D20` |
| rail | `#25272B` |
| ink | `#F2F1EE` |
| muted | `#BDBEC2` |
| signal | `#E9A77A` |
| rule | `#75777C` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 14.92 : 1 | 4.5 : 1 | pass | body text |
| ink | rail | 13.24 : 1 | 4.5 : 1 | pass | text in the rail / mobile nonstop panel |
| muted | ground | 9.08 : 1 | 4.5 : 1 | pass | secondary text |
| muted | rail | 8.06 : 1 | 4.5 : 1 | pass | secondary text in the rail |
| signal | ground | 8.25 : 1 | 4.5 : 1 | pass | nonstop number only |
| signal | rail | 7.32 : 1 | 4.5 : 1 | pass | nonstop number in the rail |
| rule | ground | 3.76 : 1 | 3.0 : 1 | pass | rules, button borders |
| signal | ground | 8.25 : 1 | 3.0 : 1 | pass | focus ring (3 px) |

## Fonts

| Family | Weights | Role | Licence | Package |
| --- | --- | --- | --- | --- |
| Schibsted Grotesk | 400, 700 | everything | SIL OFL 1.1 | `@fontsource/schibsted-grotesk` |

Alternative pairing: Hanken Grotesk 400/700. All faces render the pangram “Příliš žluťoučký kůň úpěl ďábelské ódy” in every weight used (checked in Chromium, 2026-11-10).

## Type scale (px)

| Token | Value |
| --- | --- |
| body | 20 |
| lead | 24 |
| small_min | 18 |
| h1_375 | 40 |
| h1_1280 | 76 |
| h2_375 | 34 |
| h2_1280 | 60 |
| nonstop_number_375 | 36 |
| nonstop_number_rail | 38 |
| line_height_body | 1.5 |
| line_height_display | 1.05 |

## Spacing (px)

8 · 16 · 32 · 64 · 96 · 160

## Layout

| Token | Value |
| --- | --- |
| rail_width_1280 | 440 |
| content_padding_1280 | 0 96px |
| gutter_375 | 16 |
| radius | 0 |

## Separation device

darkness and space; one 1 px rule at the top of each statement section
