# {{brandName}} – web

Statický web postavený na [Astro](https://astro.build) (šablona „{{templateName}}“ {{templateVersion}}). Obsah se upravuje v Pages CMS, sestavený web je složka `dist/`, kterou lze nahrát na jakýkoli statický hosting.

*English version below.*

## Česky

### Co potřebujete

- Node.js {{nodeVersion}} (verze je v souboru `.nvmrc`; s nástrojem nvm stačí `nvm use`)
- npm {{npmVersion}} (je součástí Node.js)

### Příkazy

| Příkaz | Co dělá |
| --- | --- |
| `npm ci` | nainstaluje přesně ty verze balíčků, které jsou v `package-lock.json` |
| `npm run dev` | spustí vývojový server na <http://localhost:4321> |
| `npm run build` | sestaví web do `dist/` v **testovacím režimu** (výchozí) |
| `SITE_MODE=production npm run build` | sestaví **ostrý web**; selže, pokud obsah obsahuje ukázkové ceny, zástupné texty či obrázky nebo chybí povinné údaje |
| `npm run preview` | zobrazí sestavený web z `dist/` |
| `npm run validate` | zkontroluje obsah bez sestavení (`-- --mode production` pro pravidla ostrého webu) |
| `npm run check` | typová kontrola šablony (Astro check) |

### Režimy webu (`SITE_MODE`)

- `prototype` (výchozí, i když proměnná chybí): web má pruh „Testovací verze webu“, není indexován vyhledávači (`noindex`, `robots.txt` vše zakazuje) a nemá `sitemap.xml`. Zástupný obsah a ukázkové ceny jsou viditelně označené.
- `production`: ostrý web, indexovaný, se `sitemap.xml`. Sestavení skončí chybou, pokud kontrola obsahu najde cokoli, co nesmí být zveřejněno. Chybová hlášení jsou česky, s názvem souboru a pole.

### Nasazení

Sestavený web je složka `dist/`. Na hostingu nastavte:

- příkaz pro sestavení `npm ci && npm run build`, výstupní složku `dist`, Node.js podle `.nvmrc`;
- pro větev `main` proměnnou prostředí `SITE_MODE=production` (ostrý web);
- pro větev `content` žádnou proměnnou (náhled v testovacím režimu, neindexovaný);
- e-mailové upozornění při neúspěšném nasazení.

**Zkušební provoz** (než klient vše potvrdí): pro `main` proměnnou `SITE_MODE` nenastavujte a na GitHubu přidejte proměnnou repozitáře `PUBLISH_MODE` = `prototype` (Settings → Secrets and variables → Actions → Variables). Akce „Zveřejnit změny“ pak kontroluje obsah v testovacím režimu a `main` běží jako neindexovaný testovací web. Před spuštěním ostrého webu proměnnou smažte a pro `main` nastavte `SITE_MODE=production`.

Jak se změny z CMS dostanou na ostrý web, popisuje [HANDOVER.md](HANDOVER.md).

### Struktura

- `src/content/` – obsah webu (texty, služby, ceník, kontakty); upravuje se v Pages CMS
- `src/assets/media/` – obrázky
- `src/site.config.ts` – nastavení šablony (varianty, pořadí sekcí); jen pro vývojáře
- `src/core/` – sdílená vrstva pro data a kontroly obsahu; neupravujte
- `src/pages/`, `src/components/`, `src/layouts/`, `src/styles/` – šablona
- `.pages.yml` – konfigurace Pages CMS
- `.github/workflows/` – zveřejnění a zahození změn z CMS
- `docs/provenance/` – archiv ověření údajů před předáním webu

## English

Static site built with [Astro](https://astro.build) (template "{{templateName}}" {{templateVersion}}). Content is edited in Pages CMS; the built site is the `dist/` folder, which any static host can serve.

### Requirements

- Node.js {{nodeVersion}} (pinned in `.nvmrc`; with nvm run `nvm use`)
- npm {{npmVersion}}

### Commands

| Command | What it does |
| --- | --- |
| `npm ci` | installs the exact versions from `package-lock.json` |
| `npm run dev` | dev server on <http://localhost:4321> |
| `npm run build` | builds `dist/` in **prototype mode** (the default) |
| `SITE_MODE=production npm run build` | builds the **public site**; fails while demo prices, placeholder copy or images remain, or required facts are missing |
| `npm run preview` | serves the built `dist/` |
| `npm run validate` | checks content and the publication gate without building (`-- --mode production` for production rules) |
| `npm run check` | type check (Astro check) |

### Build modes (`SITE_MODE`)

- `prototype` (default, also when unset): prototype banner, `noindex`, `robots.txt` disallows everything, no sitemap. Placeholders and demo prices are visibly marked.
- `production`: indexable, with `sitemap.xml`. The build fails if the publication gate finds anything that must not be published. Messages are in Czech and English, with file and field.

### Deploy

`dist/` is the artifact. On the host: build command `npm ci && npm run build`, output `dist`, Node.js from `.nvmrc`; set `SITE_MODE=production` for the `main` branch only; leave the `content` branch preview in prototype mode; turn on e-mail alerts for failed deploys. For a trial run before the content is approved, leave `SITE_MODE` unset on `main` too and add the GitHub repository variable `PUBLISH_MODE` = `prototype`: "Zveřejnit změny" then gates in prototype mode and `main` is a noindex test site. Remove the variable and set `SITE_MODE=production` on `main` to go live. No host-specific files are included; add them only for the host you choose.

The build needs no network access after `npm ci`: fonts are self-hosted from `@fontsource` packages and images live in `src/assets/media/`. Astro may try to send anonymous telemetry; disable it with `npx astro telemetry disable` or `ASTRO_TELEMETRY_DISABLED=1`.

Publishing from the CMS (`content` → `main`) is described in [HANDOVER.md](HANDOVER.md) (Czech).
