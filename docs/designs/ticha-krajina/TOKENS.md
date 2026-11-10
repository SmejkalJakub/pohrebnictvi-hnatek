# Tichá krajina: tokens

Generated from the canvas source; contrast is computed (WCAG 2.2), not estimated.

## Palette Mlha (default)

| Role | Hex |
| --- | --- |
| ground | `#EEF1F0` |
| ink | `#1B2422` |
| muted | `#4C5856` |
| accent | `#2F5160` |
| on_accent | `#FFFFFF` |
| rule | `#7E8A88` |
| photo_placeholder | `#C9D2CF` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 13.98 : 1 | 4.5 : 1 | pass | body text, stamp-line rules |
| muted | ground | 6.51 : 1 | 4.5 : 1 | pass | secondary text, captions |
| accent | ground | 7.49 : 1 | 4.5 : 1 | pass | nonstop number |
| on_accent | accent | 8.51 : 1 | 4.5 : 1 | pass | button text on accent fill |
| rule | ground | 3.14 : 1 | 3.0 : 1 | pass | hairlines |
| ink | ground | 13.98 : 1 | 3.0 : 1 | pass | focus ring (3 px ink) |

## Palette Len

| Role | Hex |
| --- | --- |
| ground | `#F3EFE7` |
| ink | `#24211C` |
| muted | `#59534A` |
| accent | `#6B5A3A` |
| on_accent | `#FFFFFF` |
| rule | `#8F8676` |
| photo_placeholder | `#D8CFBF` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 13.99 : 1 | 4.5 : 1 | pass | body text, stamp-line rules |
| muted | ground | 6.63 : 1 | 4.5 : 1 | pass | secondary text, captions |
| accent | ground | 5.82 : 1 | 4.5 : 1 | pass | nonstop number |
| on_accent | accent | 6.67 : 1 | 4.5 : 1 | pass | button text on accent fill |
| rule | ground | 3.14 : 1 | 3.0 : 1 | pass | hairlines |
| ink | ground | 13.99 : 1 | 3.0 : 1 | pass | focus ring (3 px ink) |

## Fonts

| Family | Weights | Role | Licence | Package |
| --- | --- | --- | --- | --- |
| Spectral | 400, 600 | headings and body | SIL OFL 1.1 | `@fontsource/spectral` |
| Figtree | 500 | nav, labels, captions | SIL OFL 1.1 | `@fontsource/figtree` |

Alternative pairing: Gelasio + Figtree. All faces render the pangram “Příliš žluťoučký kůň úpěl ďábelské ódy” in every weight used (checked in Chromium, 2026-11-10).

## Type scale (px)

| Token | Value |
| --- | --- |
| body | 20 |
| lead | 22 |
| small_min | 18 |
| h1_375 | 38 |
| h1_1280 | 72 |
| h2_375 | 30 |
| h2_1280 | 44 |
| nonstop_number_375 | 33 |
| nonstop_number_1280 | 42 |
| line_height_body | 1.65 |
| line_height_display | 1.06 |

## Spacing (px)

12 · 24 · 48 · 96 · 144

## Layout

| Token | Value |
| --- | --- |
| grid_1280 | 12 columns, 24 px gap, 64 px side margin |
| photo_band_1280 | full bleed, 1280 x 440 |
| photo_band_375 | full bleed, 375 x 240 |
| gutter_375 | 16 |
| radius | 0 |

## Separation device

the landscape photographs themselves, plus two 1 px ink rules around the stamp line
