# Funeral-home websites: UX and UI research for new templates

**Status:** research brief, 2026-11-10 (revised the same day: Czech law §4a, trends and speed §4b, new content types §8). Input for [docs/prompts/new-templates.md](../prompts/new-templates.md).
**Scope:** international practice (UK, US, Canada, Germany, Netherlands, Sweden) and Czech law. Czech funeral-home websites were deliberately not used as design references.
**Evidence quality:** UK government content research, NN/g and W3C/WAI are primary or well-founded. Statistics from US funeral-software vendors (Tribute, Frazer, funeralOne, Tukios) are indicative only: the vendors sell websites, and the surveys differ in year and method. The site reviews in §5 were done from page text, so typography and colour were not observed. Check those on a phone before relying on them.

Related: [template-contract.md](../template-contract.md) · [design-differentiation.md](../design-differentiation.md) · [content-contract.md](../content-contract.md)

---

## 1. Who arrives, and in what state

| Visitor | When | What they need first | Share (indicative) |
| --- | --- | --- | --- |
| **At-need family member** | hours or days after a death, often at night, often on a phone | "Who do I call now?", then "what happens next?", then "what will it cost?" | the group that decides whether the firm gets the work |
| **Funeral guest** | days before a ceremony | time, place, how to get there, flowers, what to wear | large in volume where obituaries are published (in the US, obituaries are the most-visited pages) |
| **Planner (pre-need)** | calm, comparing | prices, what is included, who the people are | smaller, more deliberate |
| **Returning family** | after the funeral | documents, urn collection, memorial, gravestone | small, but they come back |

Vendor surveys put "look for pricing" at roughly one visit in six and "options, contact details and pricing" at about two in three. They also say most families contact only one firm. Treat the numbers as directional.

**Implications for every template:**

- The first screen must answer *"Who do I call, and are they there now?"* on a 375 px screen without scrolling. Our invariant 1 already requires this.
- The three intents (*someone has just died* / *I am arranging a funeral* / *I am planning ahead or attending*) should be separable early, without forcing a choice before the phone number.
- Many visitors are older adults under acute stress. They have reduced working memory and more trouble with small targets and low contrast, and are less willing to explore. Design for the worst moment, not the average visit.

## 2. Language and tone

UK government content research (DWP Digital, *Designing content for people dealing with a death*, 2020) found:

- **Be direct.** People dealing with a death preferred plain words such as "died" and "death" over euphemisms such as "passed away" or "loss". Euphemisms are harder to understand, especially for non-native speakers.
- **Brief beats sympathetic.** Adding words to sound sympathetic made content less helpful. Give only what people need to know, not what the organisation wants to say.
- **Avoid jargon**, including sector terms such as "bereavement" or "at-need".

Practice from reviewed sites:

- Reassurance that *nothing has to be decided immediately* and that *you can change your mind* (Poppy's) lowers pressure without sentimentality.
- Nav labels named after the situation work better than labels named after the product, for example "A death has occurred" (Tulip) or "Report a death 24/7" (November).

**Czech translation of this guidance:**

- Use "zemřel / zemřela", "úmrtí" and "pohřeb". Avoid "odešel na věčnost" and "skonal" in UI text. Client copy is the client's call; template UI strings are ours.
- Use the formal "vy" with a capital "V" only where the client's copy already does; keep template strings neutral.
- No exclamation marks, no "Nejlepší", no urgency language.

## 3. Older adults and accessibility

- **NN/g (users 65+):** task success was about 55 % against about 75 % for younger users, and older users were less likely to try another route when stuck. Guidance includes:
  - large, resizable text;
  - accepting input in any reasonable format;
  - a longer sequence of simple steps rather than a short sequence of complex ones;
  - links that look like links;
  - no hover-only affordances.
- **W3C WAI (older users):** most older-user needs are covered by WCAG. The gaps are cognitive load, unfamiliar interaction patterns and small targets. Our contract already requires WCAG 2.2 AA where practical, 44 px primary targets, 200 % zoom and 320 px reflow.
- **Trauma-informed design** (the SAMHSA principles applied to the web): safety, transparency, choice and control. Key information should be identifiable in about five seconds.

**Implications:**

- Body text at 18 px or more, with headings that differ in size *and* weight.
- Visible underlined links, real buttons for actions, and no icon-only controls.
- One primary action per screen region.
- The filter and guidance pattern already in core (`:target` chooser, checklists, `<details>`) suits this audience. New templates should reuse the behaviour and present it differently.

## 4. Price transparency (international direction of travel)

- **UK:** since 2021 the CMA *Funerals Market Investigation Order* requires funeral directors to publish a Standardised Price List and an Additional Options list. These must be prominent on the website, no more than one click from the home page, and downloadable as a PDF.
- **US:** the FTC Funeral Rule is under review. Online price disclosure is proposed but not in force as of the sources checked. FTC staff found that fewer than 40 % of funeral websites showed any prices, and an industry survey reported that families prefer firms that publish prices.
- **What sites do:**
  - nothing on the home page, with a pricing page one click away (Poppy's, A Natural Undertaking);
  - a from-price with an itemised "included / still to choose" split (November);
  - one fixed headline price with "what's included" (Tulip, direct cremation);
  - a quote per case with an explicit inclusion list (Pure Cremation).

**Implications:** no Czech rule requires an online price list (§ 4a), but the international direction is clear and it builds trust. Every template should:

- keep `/cenik/` at most one click from every page;
- make "what is included" scannable;
- handle `kind: from | range | on-request` honestly;
- show final prices including VAT (§ 4a).

The core `PriceValue` and `DemoPricingNotice` components already enforce honesty about demo prices.

## 4a. Czech law that shapes a funeral-home website

> **Not legal advice.** This is a design brief compiled from the consolidated statute texts on zakonyprolidi.cz, read 2026-11-10: zákon o pohřebnictví in the version effective 1 July 2025, and zákon o regulaci reklamy in the version effective 10 October 2025. Secondary sources were used for the other acts. Have a Czech lawyer confirm the rules marked ⚖ before templates go live, and record the result in this file.

| # | Rule | Source | What it means for templates and content |
| --- | --- | --- | --- |
| L1 | **Advertising for funeral services must not be spread** (a) in the grounds of a hospital or social-care facility, (b) in addressed form, "zejména prostřednictvím dopisů, letáků nebo elektronickou poštou", or (c) "v souvislosti s informováním o smrti". "Reklama" covers presentations spread through computer networks that promote a business (§ 1(2)–(3)). Fines go up to 2 000 000 Kč. | zákon 40/1995 Sb., § 6a; § 1(2)–(3); § 8, § 8a | ⚖ **Online death notices (parte) and ceremony pages must carry no advertising.** No service teasers, prices, "Objednejte" or "Naše služby" blocks, and no promotional CTAs on those pages. Keep only what identifies who publishes the notice and the practical facts. The nonstop CTA required by invariant 1 needs a lawyer's view on these pages: a neutral "Kontakt" line may be acceptable where a promotional CTA is not. **No newsletter sign-up and no e-mail marketing features** in any template. |
| L2 | A funeral service must **not arrange funerals in the premises or grounds of healthcare or social-care facilities**, including through another person. | zákon 256/2001 Sb., § 7(1)(c) | Copy and UI must not offer "we come to the hospital to arrange the funeral". Arranging happens at the office, at home or by phone. Transporting the body from a hospital is fine. |
| L3 | The **řád pro provozování pohřební služby** (approved by the regional hygiene station; it covers the scope of services, the urn hand-over procedure and more) must be published "na viditelném místě" at the premises. | § 7(1)(b), § 7a, § 15(1)(h) | Not required online, but publishing it as a download is cheap and builds trust. New content type: **documents** (§ 8). |
| L4 | The **vypravitel pohřbu** is whoever arranges the funeral within **96 hours** of the death being reported. If nobody does, the municipality arranges a dignified funeral ("sociální pohřeb"). | § 2(p), § 5(1) | Guidance content should say this plainly. It is client content, but templates must give it a clear home in the "Jak postupovat" flow. |
| L5 | The funeral service takes over a body only with the **list o prohlídce zemřelého** from the examining doctor. | § 7(2)(a) | Guidance step "Lékař musí provést prohlídku" comes before "Zavolejte převoz" for deaths at home. Templates already order guidance by phase; this is content. |
| L6 | **Urns:** the family is called to collect the urn within the period set in the řád. If it is not collected **within 12 months**, the urn is buried in a common grave. | § 7(1)(i), § 14(3)(h) | Content for "Po pohřbu" guidance and FAQ. Templates need a place for it, not special UI. |
| L7 | Pohřební služba is a **koncesovaná živnost**. No duty to display the licence was found. | § 6(1) | Nothing to render. Do not invent a "licensed" badge. |
| L8 | **Business identification online:** name, registered office, IČO, and for companies the commercial register entry (oddíl, vložka). Added details must not mislead. | občanský zákoník 89/2012 Sb., § 435 | Already modelled (`company.legalIds`) and enforced in production (G-011). Every template's footer must show it on every page. |
| L9 | **Prices for consumers must be final, including VAT.** The Ministry of Finance says a price without VAT may appear only next to the price with VAT. Supreme Administrative Court rulings disagree on price lists that show prices without VAT, so the safe option is to always show the VAT-inclusive price. | zákon o cenách 526/1990 Sb., § 13; NSS case law | ⚖ `PriceValue` must render the consumer price; the `vatNote` field ("ceny jsou uvedeny včetně DPH") must be visible near the prices. A lawyer and core should decide whether this becomes a gate rule. |
| L10 | **Out-of-court dispute resolution (ADR):** businesses must tell consumers about the ADR body, usually ČOI (adr.coi.cz), clearly and accessibly, including on their website. Fines go up to 1 000 000 Kč. | zákon 634/1992 Sb., § 14 | ⚖ New content: a legal-information block or page (ADR, complaints procedure, terms). Templates need a footer link and a quiet legal page. |
| L11 | **Cookies:** since 2022, storing or reading data on a device needs **opt-in consent** unless it is strictly necessary. | zákon 127/2005 Sb., § 89(3) (as amended by 374/2021 Sb.) | Our sites set no cookies and load no third-party scripts, so they need no consent banner. Keep it that way. Any analytics must be cookieless and self-hosted, or the client accepts a consent banner as a separate decision. |
| L12 | **GDPR:** the deceased are generally outside GDPR, but **relatives named on a parte**, staff named on the site and anyone writing in are personal data. The site needs a lawful basis and a privacy notice. | GDPR; ÚOOÚ guidance | ⚖ Death notices need a **recorded consent or contract basis** from the person who orders them, a take-down route, a set publication period and optional `noindex`. A team page needs staff consent. The privacy page (`ochrana-osobnich-udaju`) becomes required when either is used. |
| L13 | **Accessibility act (European Accessibility Act):** applies to consumer e-commerce services from 28 June 2025. **Microenterprises** (fewer than 10 staff, turnover up to €2 million) providing services are exempt. | zákon 424/2023 Sb. | Most clients are microenterprises, so not mandatory, but we target WCAG 2.2 AA anyway (template-contract §6). It becomes binding if a larger client sells online. |
| L14 | **Livestreams and recordings** of ceremonies involve the attendees' personal data and copyrighted music (licensed through the OSA collecting society). | GDPR; copyright act 121/2000 Sb. | ⚖ Templates show only a link to a stream run by the ceremony hall or crematorium. They never embed a player, and never stream themselves. |

## 4b. Trends and speed

**What sites abroad offer now.** These come from US and UK vendor sources, so the claims are directional:

- Online obituaries or death notices are the most visited pages.
- A ceremony livestream link is becoming standard, typically a private link and sometimes recorded.
- QR codes on printed notices and orders of service lead to the online notice.
- Password-protected or unlisted notices give families privacy.
- Clear, plain pricing and a "what's included" list.
- Grief and practical resources that families come back to after the funeral.

**Czech practice.** Online arrangement forms and ceremony streaming spread during covid (Pegas, Funebralis). Ceremony-free funerals are common, reportedly about half nationally and most in Prague (Forbes; unverified). So a "pohřeb bez obřadu" path deserves first-class design.

**Speed.** Google's Core Web Vitals thresholds are unchanged: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, at the 75th percentile of real users. Our budgets (template-contract §6) are stricter by design.

New templates must keep:

- static HTML, almost no JS (so INP is trivially good), and no third-party requests;
- AVIF/WebP via `astro:assets` with explicit width and height (CLS);
- font subsets with latin-ext and at most two families and three weights, `font-display: swap`, and the LCP font preloaded;
- a hero that works without an image, so LCP is text.

Each template's report should include a Lighthouse mobile run: 100 for performance and accessibility is the expectation, not a stretch goal.

**Answer engines.** People increasingly ask AI assistants "co dělat, když zemře…". Clean semantic HTML, the `LocalBusiness` JSON-LD core already emits, and clearly structured FAQ and guidance content make the client's answers quotable. This is a content-structure point, not a design trend; avoid FAQ-schema spam.

## 5. What well-regarded sites do (outside Czechia)

Reviewed on 2026-11-10 from page text. Co-op Funeralcare blocked automated access.

| Site | Lead | Urgent line | Pricing | Borrow | Avoid |
| --- | --- | --- | --- | --- | --- |
| Poppy's (London) | need-led: "choices and prices" | out-of-hours handling stated in words | one click away, standardised list | "no rush, you can change your mind"; illustration instead of grief stock photos | long FAQ wall and review wall on the home page |
| Farewill (UK) | product-led: direct cremation | phone in header; named staff with roles | PDF lists | named people next to the phone number | a pre-paid plan ahead of "arrange now" |
| Pure Cremation (UK) | sales-led | "any time, 365 days" in a sticky footer | quote and inclusion list | inclusion list ("everything included") | countdown and "HURRY" banner |
| November (DE) | configurator | separate "Report a death 24/7" number next to office hours | "from" plus included/optional split | separating the office line from the 24/7 line visually and verbally | a configurator modal over the content |
| Yarden (NL) | task tiles: "arrange it yourself" | "reachable 24 hours a day" in header and body | calculator | large task tiles as the first choice | insurance upsell on the home page |
| Fonus (SE) | "book a meeting" | not visible in text | none on home | a section for **funeral guests** (flowers, dress, livestream) | no visible urgent path |
| A Natural Undertaking (UK) | "the choice is yours" | persistent "Call anytime" bar with named branches | in nav | the persistent call bar; founders shown by name | news feed, recruitment and Instagram competing with the call |
| Tulip / Altogether (US) | situation fork: "arrange a service now" vs "planning ahead" | 24/7 answering service in small text | one fixed price plus "what's included" | **the situation fork as the first decision**, with a phone fallback | "Arrange online" above the phone number for older users |

**Cross-site findings:**

1. The urgent line is stated in words ("24 hours", "any time"), not implied by an icon.
2. The best sites split *now* from *later* early: a fork, two nav items or two calls to action.
3. Need-led sites (Poppy's, A Natural Undertaking, Tulip) feel right. Sales-led patterns (countdowns, plan upsells, calculators, configurator modals) feel wrong for bereaved visitors.
4. Imagery falls into four families, each of which can define a design direction:
   - illustration (Poppy's, Farewill);
   - landscape or still-life photography (November, Fonus);
   - named people and premises (Farewill, A Natural Undertaking);
   - text only (Yarden, Eirene).
5. Funeral guests are an under-served audience on most sites. Serving them needs ceremony and notice data, which is now in scope as new content types (§8).

## 6. Design space: axes along which templates can differ

Templates A and B occupy two points. New templates should take clearly different positions on at least three of these axes.

| Axis | A Rodinná tradice | B Důstojná jednoduchost | Open positions |
| --- | --- | --- | --- |
| Entry pattern | editorial hero, then story | practical hero with call tier | **situation fork first** (Tulip/Yarden); single-column "one thing per screen"; index or table-of-contents home |
| Urgent CTA | dark utility strip | sticky header button + bottom bar | in-hero framed notice; side rail on desktop; a typographic "always here" line repeated as a page footer stamp |
| Navigation | centred letterhead | left logo, right nav | full-screen index menu; persistent left rail (desktop) with an in-flow list (mobile); no top nav, a home that *is* the index |
| Typography | classic serif + humanist sans | neutral grotesque | legibility-first sans (Atkinson Hyperlegible, Lexend); a contemporary serif with large optical sizes (Newsreader, Fraunces at low softness); a slab or mono-accented editorial pair |
| Colour mood | warm paper, umber/forest | cool slate, forest | deep ground with light text (high contrast, evening calm); stone/limestone neutrals with one mineral accent; near-monochrome with one warm signal colour for the urgent line only |
| Density | long-form | compact blocks | very sparse, one column, oversized type; or a dense almanac/index |
| Imagery | few large warm photos | minimal functional | landscape/still-life bands; drawn line illustrations (must be commissioned or hand-made, never AI); typographic only |
| Separation | hairline rules, small caps | 1 px lines, tinted bands | generous whitespace only; full-bleed colour fields; framed "notice" boxes |
| Services IA | one long page | index + detail | question-led ("Co potřebujete zařídit?") accordions; a comparison table of ceremony types |
| Pricing | `<dl>` with dot leaders | `<table>` | "what's included" lists per group with the price as a heading; a printable price sheet layout |
| Guidance | narrative article + margin TOC | phased checklist | timeline (hours → days → weeks); a "today / this week / later" three-column board on desktop |

A cultural reference worth testing, taken from print rather than from Czech websites: the **smuteční oznámení (parte)**. It is a framed, centred, typographic notice that every Czech family knows. A restrained modern take could be one distinct direction: framed blocks, centred composition, a strong typographic hierarchy, black or near-black on warm white, and no religious symbols by default. It must not become sombre or decorative.

## 7. Anti-patterns: what makes a page feel AI-generated or wrong for this sector

**AI-generated tells to ban outright.** These recur across critiques of AI-generated UI (Superdesign, Hallmark, Impeccable anti-patterns, an analysis of 500 Show HN pages):

- Inter or Roboto as the only face; Tailwind default indigo/violet; purple-to-blue gradients; gradient text.
- A centred hero with a badge above the H1 and two pill buttons.
- A row of three identical rounded cards with an icon on top; nested cards; glassmorphism.
- A coloured stripe on one side of a card (left or top border as the accent). Our impeccable hook flags this as "side-tab".
- Big rounded corners on everything; soft drop shadows as the main depth device.
- Stat banners ("40+ let, 1000+ rodin"), "1-2-3" numbered feature steps used as decoration, and emoji or generic line icons in place of words.
- Testimonial carousels, logo walls, "Trusted by" strips.
- Over-symmetric, centre-aligned everything; every section the same height and rhythm.
- Generic microcopy: "Elevate", "Seamless", "Your journey", "We're here for you every step of the way".

**Sector-specific wrongness:**

- Wilting flowers, doves, sunsets through clouds, crying people, stock hands holding hands. (Our contract already forbids stock portraits and melodramatic imagery.)
- Urgency or sales mechanics: countdowns, "limited offer", upsell before help, configurator modals, insurance or plan calculators on the home page.
- Hiding the phone number behind a menu or an icon.
- Long FAQ or testimonial walls on the home page.
- Cheerful brand colour on the urgent line. The urgent line must read as calm and certain, not alarming.
- Newsletter sign-ups, e-mail capture or "send me offers". These also conflict with Czech law (§ 4a, L1).
- Promotional blocks on death-notice or ceremony pages (§ 4a, L1).

**What reads as made by a person:**

- A deliberate, slightly unusual type pairing chosen for Czech diacritics.
- Asymmetry with a reason.
- One distinctive structural idea per template, used consistently.
- Real copy rhythm, with lines of varying length.
- Restraint in colour: one accent used only for meaning.
- Details that come from the sector itself: the parte frame, the order-of-service booklet, the signage of a cemetery office, the printed price sheet.

## 8. New content types (added to the scope 2026-11-10)

The research points at content we do not yet model. The owner decided to include it:

- New templates **design for it now, using placeholder data**.
- Core gains the content types **before** the templates are built ([prompt 0](../prompts/new-templates.md)).
- Every type is **optional**: a manifest `supports` flag plus a `site.config` feature switch, so A and B keep working until they adopt it.

| Type | Content (proposed fields) | Legal and safety rules | Static-site note |
| --- | --- | --- | --- |
| **Smuteční oznámení / obřady** (`notices` collection; routes `/oznameni/` and `/oznameni/<slug>/`) | full name, years or dates of birth and death, optional photo or parte image (PDF/JPG), ceremony date, time and place (with map link), ceremony type (with or without ceremony, church, civil), optional private livestream link, a short text from the family, `publishFrom` / `publishUntil`, `noindex`, `consent` record (who ordered it, date, basis) | L1: no advertising on these pages. L12: consent record required, enforced by a gate rule. Expired notices are not built, so they drop out of the site automatically. | No condolence comments (they need a server and moderation). Offer "Kondolenci můžete zaslat rodině prostřednictvím pohřební služby" with the office e-mail, if the family agrees. A QR code for each notice is generated at build as SVG and is printable. |
| **Pro účastníky pohřbu** (page `pro-ucastniky`) | how to find the hall, arriving and parking, dress, ordering flowers (links to `/kvetiny/`), the livestream etiquette | – | Plain page; templates design a scannable layout. |
| **Lidé** (`people` collection) | name, role, optional photo, optional direct phone, order | L12: staff consent recorded in `approvals.json` | Must look complete without photos (initials or typographic). |
| **Ceník ke stažení** | generated from `pricing.json` at build: an A4 print stylesheet for `/cenik/` and a static PDF | L9: prices including VAT, `vatNote` visible; demo prices marked | Generated at build, with no runtime service. |
| **Co je v ceně** (pricing extension) | `includes: string[]` and `excludes: string[]` per price group | – | Enables the "included / still to choose" pattern (November, Pure Cremation). |
| **Dokumenty** (`documents` collection) | title, file (PDF), kind (`rad-pohrebni-sluzby`, `obchodni-podminky`, `reklamacni-rad`, `other`), valid from | L3, L10 | Downloads list; files in the repo. |
| **Právní informace** (singleton or page `pravni-informace`) | ADR body (default ČOI, adr.coi.cz), complaints contact, link to documents | L10 | Footer link on every page. |
| **Časté otázky** (`faq` collection) | question, answer (Markdown), topic, order | – | Rendered as `<details>` or plain sections; no FAQ-schema spam. |
| **Pohřeb předem** (page `pohreb-predem`, optional) | standard page | L1(b): no e-mail marketing or sign-up | Only if the client offers pre-need. |
| **Online sjednání** | – | L2: must not imply arranging in hospitals | **Deferred:** needs a form backend (template-contract U9, `contactForm`). Templates may design the entry point as a phone-first "Domluvte si schůzku" block. |

## 9. Sources

- DWP Digital, [Designing content for people dealing with a death](https://dwpdigital.blog.gov.uk/2020/02/06/designing-content-for-people-dealing-with-a-death/) (2020); Content Design London, [Designing for death and bereavement](https://www.contentdesign.london/blog/designing-for-death-and-bereavement); Co-op Digital, [Funeralcare "start an arrangement online" research](https://digitalblog.coop.co.uk/2020/07/13/remote-research-funeralcares-start-an-arrangement-online-form/)
- NN/g senior-usability findings, via [UXmatters](https://uxmatters.com/mt/archives/2017/04/designing-user-interfaces-for-an-aging-population.php) and [Econsultancy](https://econsultancy.com/six-design-tips-for-making-your-website-senior-friendly/); W3C WAI, [Older Users and Web Accessibility](https://www.w3.org/WAI/older-users/)
- Trauma-informed content: [UX Content Collective guide](https://uxcontent.com/a-guide-to-trauma-informed-content-design/), [UX Magazine](https://uxmag.com/articles/trauma-informed-design-understanding-trauma-and-healing)
- CMA: [funeral directors and crematorium operators guidance](https://www.gov.uk/government/publications/working-with-the-funerals-market-investigation-order/funeral-directors-and-crematorium-operators-guidance), [press release](https://www.gov.uk/government/news/cma-requires-clearer-prices-and-information-from-funeral-providers), [SAIF online pricing FAQ](https://saif.org.uk/wp-content/uploads/2021/06/Online-pricing-FAQ.pdf)
- FTC Funeral Rule review: [NFDA](https://nfda.org/advocacy/current-issues/ftc-review-of-the-funeral-rule), [Checkbook](https://www.checkbook.org/boston-area/consumers-notebook/articles/UPDATE-FTC-May-Require-Funeral-Homes-to-Disclose-Prices-on-Their-Websites-7529)
- Visitor intent (vendor data, indicative): [Tukios](https://blog.tukios.com/3-types-of-website-visitors-how-to-best-serve-them), [Tribute Technology](https://www.tributetech.com/10-expectations-families-have-for-funeral-home-websites-in-2026), [NFDA study via National Law Review](https://natlawreview.com/press-releases/nfda-study-finds-families-seek-more-personalized-transparent-end-life)
- AI design tells: [Superdesign](https://superdesign.dev/blog/why-ai-design-looks-generic), [Impeccable anti-patterns](https://www.mintlify.com/pbakaus/impeccable/concepts/anti-patterns), [Show HN design-slop analysis](https://adriankrebs.ch/blog/design-slop/), [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)
- Czech law, consolidated texts: [zákon 256/2001 Sb. o pohřebnictví](https://www.zakonyprolidi.cz/cs/2001-256) (version from 1 July 2025), [zákon 40/1995 Sb. o regulaci reklamy](https://www.zakonyprolidi.cz/cs/1995-40) (version from 10 October 2025, § 6a), [novela 193/2017 Sb.](https://www.zakonyprolidi.cz/cs/2017-193), [MMR on the hospital advertising ban (e15)](https://www.e15.cz/byznys/ostatni/pohrebni-ustavy-nesmi-mit-reklamu-v-arealu-nemocnic-a-ustavu-1239248)
- § 435 OZ, website identification: [epravo.cz](https://www.epravo.cz/top/clanky/nekolik-poznamek-k-internetovym-strankam-spolecnosti-s-rucenim-omezenym-100295.html); prices including VAT: [Ministerstvo financí](https://mf.gov.cz/cs/kontrola-a-regulace/cenova-regulace-a-kontrola/stanoviska-a-odpovedi/2017/oznaceni-zbozi-28599), [zákon o cenách § 13](https://www.podnikatel.cz/zakony/zakon-c-526-1990-sb-o-cenach/f1339941/)
- ADR, § 14 of the consumer protection act: [kurzy.cz](https://www.kurzy.cz/zakony/634-1992-zakon-o-ochrane-spotrebitele/paragraf-14/), [epravo.cz](https://epravo.cz/top/clanky/nove-povinnosti-podnikatelu-pri-reseni-spotrebitelskych-sporu-100689.html)
- Cookies, § 89(3) ZEK: [epravo.cz](https://www.epravo.cz/top/clanky/cookies-nove-jen-se-souhlasem-poslanecka-snemovna-prijala-zprisnujici-pravidla-od-roku-2022-113207.html); GDPR and the deceased: [epravo.cz](https://www.epravo.cz/top/clanky/osoba-zesnula-a-gdpr-107890.html)
- Accessibility act 424/2023 Sb.: [Portál veřejné správy (ČOI)](https://portal.gov.cz/sluzby-vs/informovani-ceske-obchodni-inspekce-o-neplneni-pozadavku-na-pristupnost-S93683), [EY](https://www.ey.com/cs_cz/technical/tax/tax-alerts/2025/06/novy-zakon-o-pozadavcich-na-pristupnost-nekterych-vyrobku-a-sluzeb)
- Trends: [Echo24 on online arrangement and streaming](https://www.echo24.cz/a/SNsHr/pohrebni-ustavy-sjednavaji-sluzby-on-line-a-zive-prenaseji-obrady), [CNN Prima on streaming](https://cnn.iprima.cz/roste-zajem-o-streamovani-pohrebnich-obradu-ovlivni-covid-19-jejich-digitalizaci-2307), [Forbes on ceremony-free funerals](https://forbes.cz/vypousteni-motylu-i-namornicky-pohreb-nezvykla-pohrebni-sluzba-pomaha-ritualy-ke-smireni-se-smrti/), [Tribute Technology](https://www.tributetech.com/what-the-most-successful-funeral-home-websites-have-in-common), [Dignity Memorial](https://www.dignitymemorial.com/memorial-services/planning-a-celebration-of-life/trends), [TL Web Design](https://www.tlwebdesign.net/blog/funeral-home-website-trends-2026); [Portál veřejné správy: informace pro pozůstalé](https://portal.gov.cz/informace/informace-pro-pozustale-INF-193)
- Core Web Vitals thresholds: [web.dev](https://web.dev/articles/vitals) (unchanged per [Meta Digital](https://www.metadigital.co.nz/core-web-vitals-in-2026-what-they-measure-and-whats-actually-worth-fixing/))
- Sites reviewed: [Poppy's](https://www.poppysfunerals.co.uk), [Farewill](https://farewill.com/funerals), [Pure Cremation](https://www.purecremation.co.uk), [November](https://www.november.de), [Yarden](https://www.yarden.nl), [Fonus](https://www.fonus.se), [A Natural Undertaking](https://www.anaturalundertaking.co.uk), [Tulip / Altogether](https://www.altogetherfuneral.com/funeral-cremation/locations/tulip-northern-california), [Eirene](https://www.eirene.ca)
