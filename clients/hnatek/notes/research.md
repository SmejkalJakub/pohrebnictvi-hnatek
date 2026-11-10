# Hnátek: research notes

Internal working notes from `/site-research hnatek https://pohrebnictvihnatek.cz`. Not exported, never deployed. Nothing here is approved. Facts with a status live in `provenance/facts.json`.

## 1. Sources consulted (all on 2026-11-09)

| Source | URL | Used for |
| --- | --- | --- |
| Website, homepage | https://pohrebnictvihnatek.cz/ | header (phones, e-mail), services, burial variants, "o nás", transport wording |
| Website, kontakty | https://pohrebnictvihnatek.cz/kontakty/ | registered office, IČ, DIČ, phones, hours, flower shop, map |
| Website, jak postupovat | https://pohrebnictvihnatek.cz/jak-postupovat/ | guidance on what to do after a death |
| Website, potřebné informace | https://pohrebnictvihnatek.cz/potrebne-informace/ | documents to bring, urn handling, office deadline |
| Website, rakve | https://pohrebnictvihnatek.cz/rakve/ | coffin catalogue |
| Website, květiny | https://pohrebnictvihnatek.cz/kvetiny/ | flower gallery |
| Website, nabídka | https://pohrebnictvihnatek.cz/nabidka/ | not in the menu; unfinished page (Divi default text) |
| Website sitemap, WordPress REST API | https://pohrebnictvihnatek.cz/sitemap_index.xml, `/wp-json/wp/v2/pages`, `/wp-json/wp/v2/media` | URL list, media list |
| ARES | https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/08862711 | IČO, DIČ, VAT status, registered office |
| Commercial register | https://or.justice.cz/ias/ui/rejstrik-$firma?ico=08862711 | legal name, file number, registered office |
| Mapy.com | https://mapy.com/s/bejobanobu (the link the website embeds) | resolves to the address point "Dědická ev. č. 22" |

The website runs WordPress with the Divi 5 theme and Yoast SEO. Pages were last modified between April and November 2026 (`rakve` and `kvetiny` on 2026-11-07).

The register also names the company's managing directors and shareholders, who are private individuals. Their names, dates and addresses are deliberately not copied here. The succession story and any names come only from the client (U2, U3).

## 2. Services and ceremony types named on the website

Quoted as written. These are content for `/site-build`, not ledger facts.

**"NAŠE SLUŽBY"** (homepage, a list of headings with no descriptions):

1. OBJEDNÁVKA POHŘBU A DALŠÍCH NÁLEŽITOSTÍ S TÍM SPOJENÝCH
2. PŘEVOZY ZEMŘELÝCH
3. SMUTEČNÍ SLUŽBY
4. HROBY
5. URNY
6. KVĚTINOVÉ VAZBY
7. PARTE
8. DOKLADY A ADMINISTRATIVA

**"VARIANTY POHŘBŮ"** (homepage):

- ROZLOUČENÍ V OBŘADNÍ SÍNI: "Jedná se o klasické rozloučení s hudbou a civilním řečníkem v obřadní síni a s následným zpopelněním zesnulého, nebo s možností uložení do hrobu."
- ROZLOUČENÍ V KOSTELE: "Rozloučení v kostele nebo kapli, s farářem a s následným zpopelněním zesnulého, nebo s možností uložení do hrobu."
- ZPOPELNĚNÍ BEZ OBŘADU: "Jde pouze o zpopelnění zesnulého v krematoriu bez účasti pozůstalých. Urnu si vyzvednete v kanceláři pohřební služby."

**"O NÁS"** (homepage, the full text):

> Rádi bychom Vám ve Vaší těžké životní chvíli, kdy jste ztratili blízkého člověka, nabídli komplexní služby související s posledním rozloučením.
> V případě smutné události ve Vaší rodině zajišťujeme veškeré záležitosti spojené s kremací nebo pohřbem (v kostele, v obřadní síni či do hrobu).
> Zajišťujeme nepřetržitý provoz svozu zemřelých včetně dní volna a pracovního klidu.

Hero line: „S úctou a klidem vás provedeme rozloučením s vaším nejbližším."

Meta description: "Zajišťujeme komplexní služby související s posledním rozloučením Vaše blízkého. převoz zesnulého, kremace, pohřeb"

Not on the website: exhumation, a named crematorium or cremation partner, funeral cars or the Cadillac, a service area, tradition or family wording, founding year. The current fixture services `exhumace.md` and `smutecni-oznameni.md` need care: "PARTE" covers mourning notices, but exhumation is not mentioned anywhere (U14).

**Guidance content on the website** (to compare against our guidance drafts, U7):

- Jak postupovat: death at home ("zavolat lékaře – koronera na telefonním čísle 155 či 112", then "List o prohlídce zemřelého", then call the funeral service for transport); death in a hospital or care home; death with police involvement ("Není nutné čekat na vyjádření státního zástupce…").
- Potřebné informace: what to bring (ID of the deceased, ID of the person ordering the funeral, clothes for the deceased if they died at home); church funerals need the date agreed with the priest; the death certificate is sent by registered post by the registry office; urns are "připravena do 20 pracovních dnů od obřadu" and kept free for one month at the office, then for a daily fee, and after one year placed in a common grave; inheritance proceedings; paid leave under the Labour Code (three days or two days); the service issues a confirmation of attendance; "Je však nutné navštívit sjednávací kancelář do 14:00 hodin."
- The "Vyřízení úmrtního listu" section ends mid-sentence on the live site ("…posílá doporučeně na adresu vypravitele pohřbu - do 30"). Ask the client what was meant (30 days?).

## 3. Prices

None. The website has no price list, no ceník page, no PDF, and no amount in Kč on any page. ARES lists the company as a VAT payer (DPH registration active), which matters for the price note once real prices arrive (U6, U16). The website mentions one fee without an amount: a daily storage fee for urns not collected within one month.

## 4. Coffins and flowers

**Coffins** (https://pohrebnictvihnatek.cz/rakve/): a catalogue headed "NABÍDKA RAKVÍ, výrobce MOSER LEGNO s.r.o.". It has 16 items, each a model code and photo with no description or price: PA 2097, PA 960 ST, PA 377, PA 375, PA 374, PA 367, PA 365, PA 364, PA 311, PA 170 LG, PA 160 LG, PA 140 LG, PA 109, K 370, E 691, E 601. The images are at `https://pohrebnictvihnatek.cz/wp-content/uploads/2026/04/<CODE>.jpg` (spaces become hyphens, for example `PA-960-ST.jpg`, 800 px wide). The media library also holds PA-381 and K-360, which are not shown on the page. These look like manufacturer product photos, so the rights holder is probably MOSER LEGNO, not the client (U13).

**Flowers** (https://pohrebnictvihnatek.cz/kvetiny/): a gallery headed "NABÍDKA KVĚTIN" with no names, descriptions or prices:

- "Květiny rostlé": 32 photos (`2026/04/20250110_*.jpg` … `20251113_103843.jpg`, plus `IMG_2024*_resized_*.jpg`)
- "Květiny na rakve": 7 photos (`20250203_131911`, `20251023_105341`, `IMG_20241004_114608…`, `IMG_20241004_124302…`, `IMG_20241017_111346…`, `IMG_20241024_102327…`, `IMG_20241111_134159…`)
- "Květiny umělé": 3 photos (`umela.jpg`, `umela-.jpg`, `umela-2.jpg`)

The camera-style filenames (dated 2024–2025) suggest the client's own photos of their arrangements. Confirm with the client. The flower shop is called "VAZÁRNA KVĚTIN", phone +420 731 175 835, open "Všední dny: 07:00 - 15:30" (U12).

## 5. Images worth reusing (not downloaded)

| URL (`https://pohrebnictvihnatek.cz/wp-content/uploads/…`) | Shows | Likely rights holder |
| --- | --- | --- |
| `2026/05/Hnatek-sidlo.jpg` (722×533), `2026/05/Hnatek-sidlo-2.jpg` (722×455, on kontakty), `2026/05/Firma-foto.jpg` (1024×533) | The office building with the sign "POHŘEBNICTVÍ HNÁTEK s.r.o.", blue sky | Client (probably their own photo). These are low resolution, so ask for originals. |
| `2026/04/LOGO-NOVA-VERZE.png` (800×676) | Newer logo: wreath, candle, drape, "HNÁTEK / POHŘEBNÍ SLUŽBA" | Client |
| `2026/04/LOGO.png` (800×866, used in the site header) | Older emblem: candle, wreath, grey drape, no wordmark | Client |
| Flower gallery (section 4) | The client's arrangements | Client (to confirm) |
| `2026/04/10969.jpg` (candles), `2026/04/12112.jpg` (white flowers by a coffin), `svicky.jpg`, `278341.jpg`, `298.jpg`, `68070.jpg`, `33699.jpg`, `44232.jpg`, `418.jpg`, `232912.jpg` (all about 2000 px wide) | Generic mood photos; numeric filenames | Probably stock. Licence unknown, so do not reuse without evidence. |

No photo of a funeral vehicle or the Cadillac is on the website (U4).

## 6. Brand

- **Logos on the old site**: two versions (see section 5). The header uses the older emblem. The project owner's newer design (the "H ve věnci s plamenem" mockup, U22) is a separate design, not on the website.
- **Logo colours** (exact pixel values, most frequent first):
  - `LOGO-NOVA-VERZE.png`: dark green `#064D10`, yellow `#FFCE00`, greys `#A6A6A6`, `#DDDDDD`, `#777677`
  - `LOGO.png`: grey `#AEAEAD`, dark green `#034B14`, yellow `#F3DE08`
- **Website colours**: Divi defaults (blue `#2EA3F2` links, grey `#666666` text) plus a plum `#781A4D`. None of this is a brand system worth keeping.
- **Typefaces on the website**: Afacad (headings), Open Sans (body), Nunito. The logo wordmark uses a wide sans with spaced capitals, possibly a Montserrat-like face (not identified).
- **Tone of voice**: formal and practical, with polite capitalised "Vám/Vaší" in places. The copy is short, mostly lists, and has a few typos (the page title "Potřené informace", "Pohřebnictvi" without the accent). It is warm only in the hero line and the "O nás" paragraph.

## 7. Old-site URLs (for redirects)

| Old URL | Content | Suggested new target |
| --- | --- | --- |
| `/` (also `/uvod`) | homepage | `/` |
| `/jak-postupovat/` | what to do after a death | `/jak-postupovat/` |
| `/potrebne-informace/` | documents, urn, admin | `/jak-postupovat/` or a matching guidance page |
| `/kvetiny/` | flower gallery | `/kvetiny/` |
| `/rakve/` | coffin catalogue | `/rakve/` |
| `/kontakty/` | contact | `/kontakt/` |
| `/nabidka/` | unfinished page, not in menu | `/sluzby/` |
| `/hello-world/`, `/category/uncategorized/` | WordPress default post | `/` (or let it return 410) |
| `/wp-content/uploads/…` | images | none |

## 8. Open questions for the client

1. Office address: is it "Dědická 38/22" (č.p. 38, as in the register), "Dědická ev.č. 38/22" (as on the website), or "Dědická ev. č. 22" (where the website's map link points)? Are the office and the registered office the same building?
2. Is the map link https://mapy.com/s/bejobanobu the right pin for visitors?
3. Brand name for the new site: "Pohřebnictví Hnátek", "Hnátek – pohřební služba" (as on the newer logo), or something else? Is the new "H ve věnci" logo approved?
4. Which logo files and photos may we reuse, and can you send the originals in full resolution (building, flowers)?
5. Label for +420 739 404 909: is it the office mobile, and who answers it?
6. Does +420 720 283 499 really answer around the clock for transport, and what area do you cover?
7. Are office phones answered during the 12:00–12:30 break?
8. Holidays: is the office closed on public holidays, and what should people do then (apart from transport)?
9.  Is the "VAZÁRNA KVĚTIN" your own shop, and is it at the office address? Are its hours Mon–Fri 7:00–15:30?
10. Is pohrebnictvi@vyskov.cz still the preferred e-mail?
11. Is the business family-owned, since when, and how do you want to describe the tradition (exact wording)?
12. Which crematorium and ceremony halls do you work with, and do you offer exhumation?
13. Coffins: are the 16 MOSER LEGNO models still available? Do you have permission to use their photos, and do you want prices shown?
14. Do you have a price list we can publish? Prices with VAT (you are a VAT payer)?
15. What is the urn storage fee after the first month?
16. "Matrika … posílá doporučeně … - do 30": the sentence is cut off on the current site. What should it say?
17. Is there a Cadillac or another funeral vehicle you want mentioned or photographed?
18. Domain and hosting: will the new site replace pohrebnictvihnatek.cz, and who administers the WordPress site today?

## Answers
1. 38/22 Dědická is the real address
2. The map points to a wrong spot close to the funeral home now so it is wrong
3. yes I added the logo in the context of this message. Pohřebnictví Hnátek is the brand name 
4. you can reuse photos from the stite.I dont have the originals now
5. yes
6. yes and the area is international, germany, austria etc
7. people shouldnt call in the break
8. yes it is closed, transports are nonstop. People can fill in contact form then
9. yes it is in the same building and yes the opening hours checks out
10. yes
11. it is family owned. Original owner passed it to his granddaughter this year. The company exists for around 40 years now
12. not sure and no
13. yes they are, yes we can and the prices are hidden for now
14. I would like to add that to the site for preview
15. 300kč/month
16. just finish it according to the law
17. yes, mention the cadilac
18. yes it eventualy will and it is privately runned on the wordpress
