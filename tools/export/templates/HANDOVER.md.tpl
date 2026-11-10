# Předání webu {{brandName}}

Tento dokument popisuje, co lze na webu upravovat a kde, jak se změny zveřejňují, jak opravit chybu a kdo za co odpovídá. Technický popis je v [README.md](README.md).

Šablona: {{templateName}} {{templateVersion}} · datum exportu: {{exportedDate}}

## 1. Kde se co upravuje

| Co | Kde | Kdo |
| --- | --- | --- |
| Texty, služby, postupy, katalog, ceník, kontakty, otevírací doba, obrázky | Pages CMS (webové rozhraní) | redaktor webu |
| Číslo a texty nonstop převozu zesnulých | Pages CMS, samostatná položka „Nonstop převoz zesnulých“ | redaktor webu |
| Vzhled, barvy, písma, rozvržení, pořadí sekcí na úvodní stránce, menu, adresy stránek | zdrojový kód (`src/site.config.ts`, šablona) | vývojář |
| Doména, hosting, nasazení | nastavení hostingu a repozitáře | vlastník repozitáře |

### Položky v Pages CMS

{{cmsMenu}}

Pole, která v CMS nevidíte (například interní označení zástupného obsahu nebo souřadnice na mapě), se při uložení zachovají. Upravit je může jen vývojář.

### Co v CMS záměrně nejde

- měnit vzhled, barvy, písma, rozvržení ani pořadí sekcí;
- přidávat nebo mazat stránky (seznam stránek je pevný; služby, postupy, rakve a květiny přidávat lze);
- přejmenovat soubor existující položky (změnila by se adresa stránky);
- upravit `.pages.yml`, `src/site.config.ts`, šablonu ani nastavení nasazení.

### Na co dát pozor

- **Ceny:** každá cena má stav „Ukázková – nezveřejňovat“ nebo „Schválená skutečná cena“. Ostrý web se nesestaví, dokud je v zobrazeném ceníku jediná ukázková cena. Pokud ceny zveřejnit nechcete, vypněte „Zobrazit ceník na webu“.
- **Obrázky:** vyplňte popis (alt), původ fotografie a potvrďte, že máte právo ji použít. Zástupné obrázky (původ „Zástupný obrázek – nezveřejňovat“) ostrý web odmítne.
- **Odborné texty v části Jak postupovat** nechte po změně zkontrolovat a vyplňte datum kontroly. Bez něj se ostrý web nesestaví.
- **Telefonní čísla nepište do textů stránek.** Berou se z Kontaktu a z Nonstop převozu, aby změna čísla na jednom místě platila všude.
- **Otevírací doba** je jen pro kancelář. Nepřetržitou službu uvádějte pouze v Nonstop převozu; kontrola obsahu „00:00–24:00“ v otevírací době odmítne.

## 2. Jak se změny zveřejňují

Repozitář má dvě větve:

- `content` – sem ukládá Pages CMS. Hosting z ní sestavuje **náhled** v testovacím režimu (pruh „Testovací verze webu“, neindexováno).
- `main` – **ostrý web**. Hosting ji sestavuje s `SITE_MODE=production`.

Postup:

1. Upravte obsah v Pages CMS a uložte. Změna se objeví v náhledu (obvykle do několika minut).
2. Až je vše v pořádku, spusťte v Pages CMS akci **„Zveřejnit změny“**.
3. Akce spustí na GitHubu workflow `.github/workflows/publish.yml`. Ten nainstaluje balíčky, sestaví web v režimu `production` včetně kontroly obsahu a **jen když vše projde**, posune `main` na stav `content`. Hosting pak nasadí ostrý web. (Ve zkušebním provozu s proměnnou repozitáře `PUBLISH_MODE` = `prototype` se kontroluje v testovacím režimu a `main` zůstává neindexovaný testovací web.)
4. Když kontrola neprojde, `main` se nezmění a ostrý web zůstane beze změny. Důvod je v záznamu běhu na GitHubu (záložka Actions), česky, s názvem souboru a pole. Opravte obsah v CMS a akci spusťte znovu.

Akce **„Zahodit nepublikované změny“** (`.github/workflows/discard.yml`) vrátí větev `content` do stavu ostrého webu. Všechny uložené, ale nezveřejněné změny zmizí z CMS i z náhledu. Záznam běhu na GitHubu uvádí číslo původního stavu, ze kterého je vývojář umí obnovit.

## 3. Když se něco pokazí

Pages CMS ukazuje historii změn, ale **neumí vrátit starší verzi**. Možnosti:

1. **Opravit dopředu:** v Pages CMS chybu opravte a uložte znovu. Nejrychlejší a nejbezpečnější cesta.
2. **Nezveřejněná chyba:** akce „Zahodit nepublikované změny“ vrátí `content` na stav ostrého webu.
3. **Zveřejněná chyba:** na GitHubu otevřete commit se změnou a použijte „Revert“ (vlastník repozitáře nebo vývojář), nebo na hostingu znovu nasaďte předchozí úspěšné nasazení. Revert na větvi `content` je pak potřeba znovu zveřejnit.

Neplatný obsah se nikdy nezveřejní sám: sestavení s chybou nic nenasadí a předchozí verze webu zůstává dostupná.

## 4. Jednorázové nastavení po předání

- Na GitHubu nastavte výchozí větev repozitáře na `content` (Pages CMS otevírá výchozí větev).
- Ve větvi `main` nesmí být ochrana, která zakazuje push z GitHub Actions, jinak akce „Zveřejnit změny“ selže. Pokud ochranu chcete, povolte výjimku pro `github-actions[bot]`.
- Na hostingu: produkce z `main` se `SITE_MODE=production`, náhled z `content` bez této proměnné, upozornění e-mailem při neúspěšném nasazení.
- Zkušební provoz před spuštěním: `main` bez `SITE_MODE` a na GitHubu proměnná repozitáře `PUBLISH_MODE` = `prototype`. Při spuštění ostrého webu proměnnou smažte a pro `main` nastavte `SITE_MODE=production`.
- V Pages CMS nainstalujte GitHub aplikaci jen pro tento repozitář a pozvěte redaktory jako spolupracovníky.

## 5. Vlastnictví a odpovědnost

Pages CMS omezuje jen **rozhraní pro úpravy**. Kdo vlastní repozitář na GitHubu, má plný přístup ke zdrojovému kódu a může změnit cokoli. Změny vzhledu nebo kódu provedené mimo CMS jsou odpovědností vlastníka repozitáře a nespadají do podmínek podpory šablony.

Po předání odpovídá za správnost obsahu klient (texty, ceny, kontakty, odborné postupy, práva k obrázkům). Archiv ověření údajů z doby před předáním je ve složce `docs/provenance/`; při dalších úpravách v CMS se už nepoužívá.
