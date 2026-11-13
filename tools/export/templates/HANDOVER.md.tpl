# Předání webu {{brandName}}

Tento dokument popisuje, co lze na webu upravovat a kde, jak se změny dostanou na web, jak opravit chybu a kdo za co odpovídá. Technický popis je v [README.md](README.md).

Šablona: {{templateName}} {{templateVersion}} · datum exportu: {{exportedDate}}

## 1. Kde se co upravuje

| Co | Kde | Kdo |
| --- | --- | --- |
| Texty, služby, postupy, katalog, ceník, kontakty, otevírací doba, fotografie | správa obsahu na adrese `/admin/` (Decap CMS) | redaktor webu |
| Číslo a texty nonstop převozu zesnulých | `/admin/`, samostatná položka „Nonstop převoz zesnulých“ | redaktor webu |
| Zveřejnění změn na ostrém webu | `/admin/`, položka „Zveřejnit změny“ (nebo GitHub, akce „Zveřejnit změny“) | redaktor webu nebo správce webu |
| Vzhled, barvy, písma, rozvržení, pořadí sekcí na úvodní stránce, menu, adresy stránek | zdrojový kód (`src/site.config.ts`, šablona) | vývojář |
| Doména, hosting, přihlašování do správy obsahu | {{hostingName}}, DecapBridge, GitHub | vlastník / správce webu |

Do správy obsahu se redaktor přihlašuje e-mailem a heslem (pozvánku pošle správce webu). Účet na GitHubu nepotřebuje.
{{formNote}}

### Položky ve správě obsahu

{{cmsMenu}}

Pole, která v editoru nevidíte (například interní označení zástupného obsahu, identifikátory nebo souřadnice na mapě), se při uložení zachovají. Upravit je může jen vývojář.

### Co ve správě obsahu záměrně nejde

- měnit vzhled, barvy, písma, rozvržení ani pořadí sekcí;
- přidávat nebo mazat stránky (seznam stránek je pevný; služby, postupy, rakve a květiny přidávat lze);
- přejmenovat soubor existující položky (změnila by se adresa stránky);
- upravit nastavení editoru, `src/site.config.ts`, šablonu ani nastavení nasazení.

### Na co dát pozor

- **Ceny:** každá cena má stav „Ukázková – nezveřejňovat“ nebo „Schválená skutečná cena“. Ostrý web se nezveřejní, dokud je v zobrazeném ceníku jediná ukázková cena. Když změníte částku, zkontrolujte, že stav ceny odpovídá skutečnosti. Pokud ceny zveřejnit nechcete, vypněte „Zobrazit ceník na webu“.
- **Fotografie:** vyplňte popis (alt), původ fotografie a potvrďte, že máte právo ji použít. Když fotografii vyměníte za jinou, editor potvrzení práv při uložení sám zruší; pro novou fotografii ho zaškrtněte znovu. Zástupné obrázky (původ „Zástupný obrázek – nezveřejňovat“) ostrý web odmítne.
- **Odborné texty v části Jak postupovat** nechte po změně zkontrolovat a vyplňte, kdo a kdy je zkontroloval. Bez data kontroly se ostrý web nezveřejní.
- **Telefonní čísla nepište do textů stránek.** Berou se z Kontaktních údajů a z Nonstop převozu, aby změna čísla na jednom místě platila všude.
- **Otevírací doba** je jen pro kancelář. Nepřetržitou službu uvádějte pouze v Nonstop převozu; kontrola obsahu „00:00–24:00“ v otevírací době odmítne.

## 2. Jak se změny dostanou na web

Tlačítko **„Uložit do náhledu“** v editoru uloží změnu do **náhledu webu**, ne na ostrý web.

Repozitář má dvě větve:

- `content` – sem ukládá editor. Z ní se sestavuje **náhled** v testovacím režimu (pruh „Testovací verze webu“, neindexováno). Sestavení náhledu dělá `.github/workflows/preview.yml` po každém uložení.
- `main` – záznam toho, co je na **ostrém webu**. Mění se jen zveřejněním.

Postup:

1. Redaktor upraví obsah na `/admin/` a uloží. Za několik minut je změna v náhledu.
2. Redaktor klikne v editoru nahoře na zelené tlačítko **„Zveřejnit změny“**, napíše krátký popis změn a klikne na **„Zveřejnit na ostrém webu“**. Uložení této položky spustí akci **„Zveřejnit změny“** (`.github/workflows/publish.yml`). Správce ji může spustit i ručně na GitHubu (Actions → „Zveřejnit změny“ → Run workflow na větvi `content`).
3. Akce nejdřív ověří, že se mimo obsah nic nezměnilo (šablona, kód, nastavení), pak sestaví web v režimu `production` včetně kontroly obsahu, a **jen když vše projde**, nasadí ho a posune `main`. Trvá to asi 2 minuty.
4. Když kontrola neprojde, ostrý web zůstane beze změny. Důvod je v záznamu běhu na GitHubu (záložka Actions), česky, s názvem souboru a pole; GitHub o neúspěšném běhu pošle e-mail vlastníkovi tokenu v DecapBridge. Redaktor obsah opraví v editoru a zveřejní znovu.

Akce **„Zahodit nepublikované změny“** (`.github/workflows/discard.yml`) vrátí větev `content` do stavu ostrého webu. Všechny uložené, ale nezveřejněné změny zmizí z editoru i z náhledu. Záznam běhu uvádí číslo původního stavu, ze kterého je správce umí obnovit.

## 3. Když se něco pokazí

1. **Opravit dopředu:** chybu opravte v editoru a uložte znovu. Nejrychlejší a nejbezpečnější cesta.
2. **Nezveřejněná chyba:** správce spustí „Zahodit nepublikované změny“.
3. **Zveřejněná chyba:** opravte ji v editoru a znovu zveřejněte; nebo správce na GitHubu vrátí commit („Revert“) ve větvi `content` a znovu spustí „Zveřejnit změny“, {{rollbackCs}}.

Neplatný obsah se nikdy nezveřejní sám: sestavení s chybou nic nenasadí a předchozí verze webu zůstává dostupná.

## 4. Jednorázové nastavení po předání

Postup krok za krokem je v dokumentaci agentury (`docs/cms/setup.md`). Shrnutí:

- GitHub: soukromý repozitář jen pro tento web, větve `content` a `main`, výchozí větev `content`.
- DecapBridge: web zaregistrovaný s přístupovým tokenem jen k tomuto repozitáři (oprávnění *Contents* čtení a zápis, **bez** oprávnění *Workflows*), redaktoři pozvaní e-mailem.
- {{setupCs}}
- Zkušební provoz před spuštěním: proměnná repozitáře `PUBLISH_MODE` = `prototype` (ostrá adresa pak ukazuje neindexovaný testovací web). Při spuštění ostrého webu proměnnou smažte.

## 5. Vlastnictví a odpovědnost

Správa obsahu omezuje jen **rozhraní pro úpravy**. Kdo vlastní repozitář na GitHubu, má plný přístup ke zdrojovému kódu a může změnit cokoli. Změny vzhledu nebo kódu provedené mimo správu obsahu jsou odpovědností vlastníka repozitáře a nespadají do podmínek podpory šablony; akce „Zveřejnit změny“ je odmítne, dokud je agentura znovu neexportuje.

Po předání odpovídá za správnost obsahu klient (texty, ceny, kontakty, odborné postupy, práva k fotografiím). Archiv ověření údajů z doby před předáním je ve složce `docs/provenance/`; při dalších úpravách v editoru se už nepoužívá.
