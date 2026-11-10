# Plný přehled: tokens

Generated from the canvas source; contrast is computed (WCAG 2.2), not estimated.

## Palette Bílá a žlutá (default)

| Role | Hex |
| --- | --- |
| ground | `#FFFFFF` |
| ink | `#111111` |
| muted | `#4A4A4A` |
| highlight | `#F2C230` |
| rule | `#8A8A8A` |
| thumb_placeholder | `#DADAD6` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 18.88 : 1 | 4.5 : 1 | pass | body text, links |
| muted | ground | 8.86 : 1 | 4.5 : 1 | pass | secondary text, counts |
| ink | highlight | 11.27 : 1 | 4.5 : 1 | pass | nonstop label and number on the highlight |
| highlight | ground | 1.68 : 1 | 3.0 : 1 | FAIL | highlight box edge: FAILS alone, so the box always has a 2 px ink border |
| rule | ground | 3.45 : 1 | 3.0 : 1 | pass | column and table rules |
| ink | ground | 18.88 : 1 | 3.0 : 1 | pass | focus ring (3 px ink) |

## Palette Šedá a terakota

| Role | Hex |
| --- | --- |
| ground | `#F2F2F0` |
| ink | `#141414` |
| muted | `#4A4A4A` |
| highlight | `#E8B98C` |
| rule | `#868684` |
| thumb_placeholder | `#D6D6D2` |

| Foreground | on | Ratio | Needs | Result | Used for |
| --- | --- | --- | --- | --- | --- |
| ink | ground | 16.44 : 1 | 4.5 : 1 | pass | body text, links |
| muted | ground | 7.91 : 1 | 4.5 : 1 | pass | secondary text, counts |
| ink | highlight | 10.31 : 1 | 4.5 : 1 | pass | nonstop label and number on the highlight |
| highlight | ground | 1.59 : 1 | 3.0 : 1 | FAIL | highlight box edge: FAILS alone, so the box always has a 2 px ink border |
| rule | ground | 3.25 : 1 | 3.0 : 1 | pass | column and table rules |
| ink | ground | 16.44 : 1 | 3.0 : 1 | pass | focus ring (3 px ink) |

## Fonts

| Family | Weights | Role | Licence | Package |
| --- | --- | --- | --- | --- |
| Overpass | 400, 700 | text and headings | SIL OFL 1.1 | `@fontsource/overpass` |
| Overpass Mono | 500 | every number: phones, times, dates, prices | SIL OFL 1.1 | `@fontsource/overpass-mono` |

Alternative pairing: Red Hat Text + Red Hat Mono. All faces render the pangram “Příliš žluťoučký kůň úpěl ďábelské ódy” in every weight used (checked in Chromium, 2026-11-10).

## Type scale (px)

| Token | Value |
| --- | --- |
| body | 18 |
| small_min | 18 |
| section_heading | 22 |
| h1_375 | 32 |
| h1_1280 | 40 |
| nonstop_number_375 | 28 |
| nonstop_number_1280 | 30 |
| line_height_body | 1.45 |

## Spacing (px)

4 · 8 · 12 · 16 · 24 · 32

## Layout

| Token | Value |
| --- | --- |
| directory_1280 | 4 equal columns, 20 px padding, 1 px column rules |
| side_margin_1280 | 32 |
| gutter_375 | 16 |
| radius | 0 |
| heavy_rule | 3 px ink above the directory and the footer |

## Separation device

column rules and table rules; a 3 px ink rule above the directory
