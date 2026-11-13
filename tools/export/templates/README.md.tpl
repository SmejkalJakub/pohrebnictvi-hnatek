# {{brandName}} – web

Statický web postavený na [Astro](https://astro.build) (šablona „{{templateName}}“ {{templateVersion}}). Obsah se upravuje v Decap CMS na adrese `/admin/`, sestavený web je složka `dist/`, kterou nasazují workflow na GitHubu na hosting {{hostingName}}.

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

Web nasazují workflow na GitHubu, ne hosting sám:

- `.github/workflows/preview.yml` po každém uložení v CMS (větev `content`) ověří soubory mimo obsah, sestaví **náhled** v testovacím režimu a nasadí ho {{previewTargetCs}};
- `.github/workflows/publish.yml` spouští redaktor uložením položky „Zveřejnit změny“ v editoru (soubor `{{publishRequestFile}}`), nebo správce ručně: ověří soubory, sestaví web v režimu `production` s kontrolou obsahu, nasadí **ostrý web** a posune `main`.

Nasazení je zapnuté, jen když má repozitář {{secretsCs}} (Settings → Secrets and variables → Actions). Bez nich workflow jen sestaví a zkontroluje web.

**Nepropojujte hosting přímo s větví `main` ani `content`** (Cloudflare Workers Builds, Netlify, Cloudflare Pages s Git integrací): hosting by pak nasadil i změnu, která obešla kontrolu souborů.

**Zkušební provoz** (než klient vše potvrdí): na GitHubu přidejte proměnnou repozitáře `PUBLISH_MODE` = `prototype`. Akce „Zveřejnit změny“ pak kontroluje obsah v testovacím režimu a ostrá adresa ukazuje neindexovaný testovací web. Před spuštěním ostrého webu proměnnou smažte.

Jak se změny z CMS dostanou na ostrý web, popisuje [HANDOVER.md](HANDOVER.md).

### Struktura

- `src/content/` – obsah webu (texty, služby, ceník, kontakty); upravuje se v Decap CMS
- `src/assets/media/` – obrázky
- `src/site.config.ts` – nastavení šablony (varianty, pořadí sekcí); jen pro vývojáře
- `src/core/` – sdílená vrstva pro data a kontroly obsahu; neupravujte
- `src/pages/`, `src/components/`, `src/layouts/`, `src/styles/` – šablona
- `public/admin/` – editor Decap CMS (`index.html`, vygenerovaný `config.yml`, pevná verze editoru); neupravujte ručně
- `.github/workflows/` – náhled (`preview.yml`), zveřejnění (`publish.yml`) a zahození (`discard.yml`) změn z CMS; obsahují kontrolní součty všech souborů mimo obsah
- {{hostingFile}}
- `docs/provenance/` – archiv ověření údajů před předáním webu

## English

Static site built with [Astro](https://astro.build) (template "{{templateName}}" {{templateVersion}}). Content is edited in Decap CMS at `/admin/`; the built site is the `dist/` folder, deployed by GitHub Actions to {{hostingName}} ({{hostingFileEn}}).

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

GitHub Actions deploy the site, not the host: `preview.yml` builds every CMS save on `content` in prototype mode and deploys it to {{previewTargetEn}}; `publish.yml` (started by an editor saving "Zveřejnit změny", which commits `{{publishRequestFile}}`, or by hand) checks the integrity manifest, builds in production mode with the gate, deploys to {{productionTargetEn}} and fast-forwards `main`. Deploys run only when {{secretsEn}}. Do not connect a host's Git integration to `main` or `content`: it would deploy changes that bypassed the integrity check. For a trial run before the content is approved, set the repository variable `PUBLISH_MODE` = `prototype`.

The build needs no network access after `npm ci`: fonts are self-hosted from `@fontsource` packages and images live in `src/assets/media/`. Astro may try to send anonymous telemetry; disable it with `npx astro telemetry disable` or `ASTRO_TELEMETRY_DISABLED=1`.

Publishing from the CMS (`content` → `main`) is described in [HANDOVER.md](HANDOVER.md) (Czech).
