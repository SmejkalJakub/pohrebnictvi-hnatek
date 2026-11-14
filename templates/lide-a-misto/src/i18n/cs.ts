/**
 * Template UI strings (template-contract §7). Plain, direct Czech; no business facts: names,
 * numbers, hours and addresses always come from content through core. One-letter words are
 * followed by a non-breaking space ( ) so they never end a line.
 */
import type { FlowerArrangement, Guidance } from "@core/content/schemas.ts";
import type { SpecificSituation } from "@core/content/guidance-flow.ts";

export const ui = {
  skipLink: "Přeskočit na obsah",
  menuOpen: "Menu",
  menuClose: "Zavřít",
  mainNav: "Hlavní navigace",
  homeLink: "Úvodní stránka",
  peopleLink: "Lidé",
  faqLink: "Časté otázky",
  documentsLink: "Dokumenty ke stažení",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",
  photoBy: "Foto",

  // Home
  placesHeading: "Kde se o vašeho blízkého postaráme",
  placesLink: "O nás a naše místa",
  ourPlaces: "Naše místa",
  allPlaces: (count: number) => `Všechna místa (${count})`,
  /** The index of numbered figures above a places grid ("numbers are links"). */
  figureIndex: "Místa na fotografiích",
  /** Caption of the home people photo when the photo has none of its own. */
  heroCaption: "Kdo vás přijme",
  storyLink: "Více o nás",
  firstHoursHeading: "Když někdo zemřel",
  fullGuide: "Celý postup podle místa úmrtí",
  receptionHeading: "Kdo vás přijme",
  servicesHeading: "Služby",
  allServices: "Všechny služby",
  priceHeading: "Ceník",
  priceLink: "Ceník a co je v ceně",
  priceFrom: "od",
  officeHeading: "Kancelář",
  officeLink: "Všechny kontakty",
  noticesHeading: "Oznámení a obřady",
  noticesLink: (count: number) => `Zobrazit oznámení (${count})`,
  noticesText: "Oznámení a termíny rozloučení, které rodiny zveřejnily u nás.",
  catalogueHeading: "Rakve a květiny",

  // Guide
  pickerQuestion: "Kde blízký člověk zemřel?",
  picked: "(vybráno)",
  pickHint: "Zatím ukazujeme kroky pro všechna místa.",
  tally: (phrase: string) => `Ukazujeme kroky, když člověk zemřel ${phrase}.`,
  showAll: "Zobrazit kroky pro všechna místa",
  appliesWhen: "Jen když člověk zemřel",
  readMore: "Podrobnosti",
  /** The guide is a guided list, not a checklist (design-differentiation §1.3). */
  guideCalmLabel: "Než začnete",
  guideCalm:
    "Nemusíte všechno vyřešit najednou ani si nic pamatovat. Stačí jít krok za krokem. Když si nebudete jistí, zavolejte nám a poradíme vám.",
  guideSequence: "Krok za krokem",
  nextStep: (title: string) => `Potom: ${title}`,
  guideCloseLabel: "Na závěr",
  guideClose: "Tím máte to nejdůležitější za sebou. Se vším ostatním vám rádi poradíme.",
  officePrompt: "Kancelář",
  faqHeading: "Časté otázky",

  // Services
  anchorsLabel: "Na této stránce",
  includesLink: "Co je v ceně",
  undecidedHeading: "Nevíte, co vybrat?",
  undecidedText: "Zavolejte do kanceláře, projdeme to spolu:",

  // Pricing
  included: "V ceně je zahrnuto",
  excluded: "Není zahrnuto",
  groupsLabel: "Skupiny ceníku",
  inclVat: "včetně DPH",
  printHint: "Ceník vytisknete klávesami Ctrl + P (na Macu Cmd + P).",
  printedFrom: "Vytištěno z",
  priceValidFrom: (date: string) => `Ceník platí od ${date}.`,
  itemsCaption: (group: string) => `Položky: ${group}`,

  // Contact
  mapLink: "Otevřít v mapě",
  hoursHeading: "Úřední hodiny",
  phonesHeading: "Telefony a e-mail",
  email: "E-mail",
  transportHeading: "Převoz zesnulých",
  billingHeading: "Fakturační údaje",
  allPeople: "Všichni lidé a jejich telefony",
  exceptionsHeading: "Mimořádné změny",
  dic: "DIČ",

  // About
  aboutHeading: "Kdo jsme",
  peopleHeading: "Lidé",
  directLine: "Přímá linka",

  // Notices
  noticesUpcoming: "Nadcházející rozloučení",
  noticesRecent: "Starší oznámení",
  noticesEmpty: "Momentálně nezveřejňujeme žádné oznámení.",
  allNotices: "Všechna oznámení",
  ceremonyHeld: (date: string) => `Rozloučení proběhlo ${date}.`,
  withoutCeremony: "Pohřeb bez obřadu.",
  privateCeremony: "Rodina se rozloučí v soukromí.",
  ceremonyHeading: (weekday: string, date: string, time: string | null) => {
    let text = `Rozloučení ${weekdayWithPreposition(weekday)} ${date}`;
    if (time !== null) {
      text += ` v ${time}`;
    }
    return text;
  },
  where: "Kde",
  ceremonyType: "Obřad",
  livestreamLabel: "Přenos",
  born: "Datum narození",
  diedLabel: "Datum úmrtí",
  mapShort: "mapa",
  livestream: "Sledovat přenos obřadu",
  livestreamNote: "Odkaz vede na přenos, který vysílá místo obřadu.",
  partePdf: "Parte ke stažení (PDF)",
  parteImage: "Parte",
  familyNote: "Od rodiny",
  condolences: "Kondolence",
  condolencesText: "Kondolenci můžete poslat rodině prostřednictvím pohřební služby na",
  condolencesAfter: "Předáme ji.",
  qrLabel: "QR kód oznámení",
  qrText: "Vytisknout oznámení: Ctrl + P (na Macu Cmd + P). Výtisk je na bílém papíře, i s QR kódem.",
  qrFile: "QR kód k tisku (SVG)",
  familyPhoto: "Fotografie od rodiny",

  // Catalogues
  catalogueEmpty: "Nabídku připravujeme. Zeptejte se v kanceláři.",
  code: "kód",
  flowersOrder: "Objednávka květin",
  flowersOrderText: "Květiny objednáte telefonicky nebo při sjednání pohřbu.",
  itemsLabel: "Nabídka",

  // Footer and legal
  onSite: "Na webu",
  adrHeading: "Mimosoudní řešení sporů",
  adrText: "Spor ze smlouvy s námi můžete řešit mimosoudně. Příslušným subjektem je",
  adrFooter: "Spory:",
  complaintsHeading: "Reklamace",
  documentsHeading: "Dokumenty",
  legalHeading: "Právní informace",
  validFrom: "platí od",
  pdf: "PDF",
  ico: "IČO",
  privacy: "Ochrana osobních údajů",

  // 404
  notFoundKicker: "Chyba 404",
  notFoundTitle: "Tuto stránku jsme nenašli.",
  notFoundBefore: "Adresa se mohla změnit. Pokračujte na",
  notFoundHome: "úvodní stránku",
  notFoundOr: ", nebo otevřete",
  notFoundContact: "kontakty",
} as const;

/** "pátek" → "v pátek", "středa" → "ve středu" (the weekday after a preposition, accusative). */
const WEEKDAY_ACCUSATIVE: Record<string, string> = {
  pondělí: "v pondělí",
  úterý: "v úterý",
  středa: "ve středu",
  čtvrtek: "ve čtvrtek",
  pátek: "v pátek",
  sobota: "v sobotu",
  neděle: "v neděli",
};

export function weekdayWithPreposition(weekday: string): string {
  return WEEKDAY_ACCUSATIVE[weekday] ?? weekday;
}

/** The picker rows: where the person died. */
export const situationRows: Record<SpecificSituation, string> = {
  home: "Doma",
  hospital: "V nemocnici",
  "care-home": "V domově pro seniory",
  abroad: "V zahraničí",
};

/** The same place, inside a sentence ("když člověk zemřel doma"). */
export const situationWords: Record<SpecificSituation, string> = {
  home: "doma",
  hospital: "v nemocnici",
  "care-home": "v domově pro seniory",
  abroad: "v zahraničí",
};

export const guidancePhaseLabels: Record<Guidance["phase"], string> = {
  "first-hours": "První hodiny",
  "first-days": "První dny",
  arrangements: "Příprava pohřbu",
  "after-funeral": "Po pohřbu",
};

export const flowerTypeLabels: Record<FlowerArrangement["type"], string> = {
  wreath: "věnec",
  spray: "vazba na rakev",
  bouquet: "kytice",
  "urn-arrangement": "aranžmá k urně",
  other: "jiná vazba",
};
