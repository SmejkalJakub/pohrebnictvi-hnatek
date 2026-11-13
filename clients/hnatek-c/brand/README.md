# Pohřebnictví Hnátek — webový balíček loga

## Co je v ZIPu

- `logos/svg/` — **vektorové SVG**, doporučeno pro skutečný web; grafika obsahuje křivky včetně nápisů, takže nenačítá žádné externí fonty.
- `logos/png/` — exporty s průhledným pozadím a dvě barevné aplikace na neprůhledném podkladu. PNG jsou pomocné rastry, SVG je preferovaná varianta.
- `icons/` — favicon SVG + ICO, malá ikona 16/32/48/64/96, Apple Touch Icon 180, Android ikony 192/512, zjednodušený znak pro malé velikosti.
- `web/` — ukázka HTML použití, CSS barevné tokeny, manifest pro PWA.
- `source/` — původní schválený obrázek, ze kterého byla sada odvozena.
- `preview/` — přehledová tabule a zvětšené kontroly ikon.

## Doporučené nasazení

**Hlavička desktop/web:** `logos/svg/hnatek-primary-horizontal.svg`.

**Mobilní hlavička:** `logos/svg/hnatek-horizontal-compact.svg` nebo pouze `logos/svg/hnatek-symbol.svg`.

**Hero, tiskovina, patička:** `logos/svg/hnatek-primary-stacked.svg`.

**Tmavé pozadí:** `logos/svg/hnatek-horizontal-white.svg` (transparentní SVG s bílými písmeny).

**Favicon 16–48 px:** `icons/favicon.ico` + `icons/favicon.svg`. Tyto ikony záměrně používají **zjednodušený motiv H**, protože detailní šedé závěsy a tenký obvodový věnec by byly nečitelné.

**Maskovatelné Android PWA ikony:** `icons/hnatek-maskable-192x192.png` a `icons/hnatek-maskable-512x512.png` (bezpečné okraje pro adaptivní masku).

**Apple / Android:** `icons/apple-touch-icon.png`, `icons/android-chrome-192x192.png`, `icons/android-chrome-512x512.png`.

Zkopírujte `logos/` a `icons/` například do `/public/brand/` (React/Vite, Astro), poté použijte cesty z `web/INSTALL.html`. Zkopírujte `web/site.webmanifest` jako `/public/brand/site.webmanifest` a vložte značky z `web/HEAD_SNIPPET.html` do `<head>` webu. Upravte cesty, pokud assets ukládáte jinam.

`web/INSTALL.html` je samostatná lokální ukázka variant.

## Barvy (orientační hodnoty vzorkované a sjednocené z náhledu)

- Lesní zelená: `#113C2A`
- Zlatá: `#C7A24B`
- Šedá: `#969C9A`
- Slonová kost: `#F8F6F1`

## Důležitá poznámka ke kvalitě

Původní vstup je obrázek PNG, nikoli autorský zdrojový vektor. SVG v tomto balíčku je **nově trasované podle schválené předlohy**; snaží se velmi věrně zachovat původní monogram, opis a diakritiku. Některé měkké přechody a jemné detaily se nahrazují jednolitými vektorovými plochami. Toto je skutečný cestový SVG výstup, **nejde o PNG vložený do SVG**, ale není to originální editovatelný soubor od grafika. Před finálním tiskem ve velkém formátu doporučujeme zkontrolovat křivky v Illustratoru/Inkscape.

Pozn.: JPG a původní schválený obrázek jsou s neprůhledným pozadím; PNG exporty označené `-ivory` či `-on-green` mají záměrně podklad. Ostatní loga mají průhledné pozadí.
