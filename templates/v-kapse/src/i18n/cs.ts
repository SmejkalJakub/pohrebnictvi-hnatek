/**
 * Template UI strings (template-contract §7). Plain, direct Czech; no business facts: names,
 * numbers, hours and addresses always come from content through core. One-letter words are
 * followed by a non-breaking space ( ) so they never end a line.
 */
import type { FlowerArrangement, Guidance } from "@core/content/schemas.ts";
import type { SpecificSituation } from "@core/content/guidance-flow.ts";

export const ui = {
  skipLink: "Přeskočit na obsah",
  menuOpen: "Menu",
  menuClose: "Zavřít",
  mainNav: "Hlavní navigace",
  pagesNav: "Všechny stránky",
  homeLink: "Úvodní stránka",
  peopleLink: "Lidé",
  faqLink: "Časté otázky",
  documentsLink: "Dokumenty",
  /** The header pill: one short word before the number (the accessible name comes from core). */
  pillWord: "Nonstop",
  /** Under the nonstop number when emergency.json has no shortNote (availability is always 24/7). */
  emergencyAlways: "Ve dne, v noci i o svátcích.",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",

  // Home: one question, large rows, the answer opens beside or under its row
  askTitle: "S čím vám můžeme pomoct?",
  askIntro: "Vyberte, co právě řešíte. Odpověď je krátká a na jednom místě.",
  askIdle: "Vyberte vlevo, co právě řešíte, a odpověď se otevře tady.",
  rowNow: "Někdo právě zemřel",
  rowNowHint: "Co udělat teď",
  rowVisit: "Chci sjednat pohřeb",
  rowVisitHint: "Kancelář, co si přinést",
  rowFarewell: "Jak se můžeme rozloučit",
  rowFarewellHint: "Obřad, nebo bez obřadu",
  rowPrice: "Kolik to bude stát",
  rowPriceHint: "Ceny a co je v ceně",
  rowGoods: "Květiny a rakve",
  rowGoodsHint: "Fotografie z nabídky",
  rowWhere: "Kde vás najdeme",
  rowPeople: "Kdo vás přijme",
  rowPeopleHint: "Lidé, se kterými budete mluvit",
  rowNoticesHint: "Rozloučení a parte",
  nowLabel: "Teď hned",
  nowTitle: "Nemusíte všechno vyřešit najednou.",
  nowLead: "Stačí jít krok za krokem. Když si nebudete jistí, zavolejte nám.",
  visitLabel: "Sjednání",
  farewellLabel: "Rozloučení",
  priceLabel: "Ceník",
  goodsLabel: "Nabídka",
  whereLabel: "Kontakt",
  peopleLabel: "Lidé",
  noticesLabel: "Oznámení",
  priceFrom: "od",
  pickerQuestion: "Kde blízký člověk zemřel?",
  otherPlaceQuestion: "Zemřel jinde?",
  fullGuide: "Celý postup krok za krokem",
  placeGuide: "Postup podle místa úmrtí",
  priceHeading: "Kolik to bude stát",
  priceLink: "Ceník a co je v ceně",
  allServices: "Všechny služby",
  storyLink: "O nás",
  officeHeading: "Kancelář",
  officeHoursHeading: "Úřední hodiny kanceláře",
  officeLink: "Všechny kontakty",
  contactHeading: "Kontakt",
  noticesCount: (count: number) => {
    if (count === 1) {
      return "1 nadcházející rozloučení";
    }
    if (count >= 2 && count <= 4) {
      return `${count} nadcházející rozloučení`;
    }
    return `${count} nadcházejících rozloučení`;
  },

  // Guide
  picked: "(vybráno)",
  /** The guide's picker, rewritten once a place is picked: "Blízký člověk zemřel doma." */
  composedPlace: (phrase: string) => `Blízký člověk zemřel ${phrase}.`,
  composedCount: (count: number, total: number) => {
    if (count === total) {
      return `Ukazujeme celý postup, ${count} ${stepsWord(count)}.`;
    }
    return `Ukazujeme ${count} ${stepsWord(count)} z ${total}.`;
  },
  /** The guide as a calm guided list (design-differentiation §1.3): a lead, the steps, a close. */
  guideLead:
    "Nemusíte všechno vyřešit najednou ani si nic pamatovat. Stačí jít krok za krokem. Když si nebudete jistí, zavolejte nám a poradíme vám.",
  guideListLabel: "Postupně",
  stepCount: (index: number, total: number) => `Krok ${index} z ${total}`,
  nextStep: (title: string) => `Potom: ${title}`,
  guideClosing: "Tím máte to nejdůležitější za sebou.",
  guideClosingCall: "Na nic z toho nejste sami. Když si nebudete jistí, zavolejte nám",
  showAll: "Zobrazit vše",
  appliesWhen: "když člověk zemřel",
  readMore: "Podrobnosti",
  officePrompt: "Domluvte se s kanceláří",
  faqHeading: "Časté otázky",

  // Services
  includesLink: "Co je v ceně",

  // Pricing
  included: "V ceně je zahrnuto",
  excluded: "Není zahrnuto",
  otherItems: "Jednotlivé položky",
  printHint: "Ceník vytisknete klávesami Ctrl + P (na Macu Cmd + P).",
  printedFrom: "Vytištěno z",
  priceValidFrom: (date: string) => `Ceny platí od ${date}.`,

  // Contact
  mapLink: "Mapa a příjezd",
  hoursHeading: "Úřední hodiny",
  phonesHeading: "Telefony",
  transportHeading: "Převoz zesnulých",
  peopleHeading: "Kdo vás přijme",
  directLine: "Přímá linka",
  exceptionsHeading: "Mimořádné změny",

  // Notices
  noticesUpcoming: "Nadcházející rozloučení",
  noticesRecent: "Nedávná oznámení",
  noticesEmpty: "Momentálně nezveřejňujeme žádné oznámení.",
  allNotices: "Všechna oznámení",
  ceremonyHeld: "rozloučení proběhlo",
  withoutCeremony: "Pohřeb bez obřadu.",
  privateCeremony: "Rodina se rozloučí v soukromí.",
  ceremonySentence: (weekday: string, date: string, time: string | null, place: string | null) => {
    let sentence = `Rozloučení se koná ${weekdayWithPreposition(weekday)} ${date}`;
    if (time !== null) {
      sentence += ` v ${time}`;
    }
    if (place !== null) {
      sentence += `, ${place}`;
    }
    return `${sentence}.`;
  },
  born: "Datum narození",
  diedLabel: "Datum úmrtí",
  mapPrefix: "Mapa",
  livestream: "Sledovat přenos obřadu",
  livestreamNote: "Odkaz vede na přenos, který vysílá místo obřadu.",
  partePdf: "Parte ke stažení (PDF)",
  parteImage: "Parte",
  familyNote: "Od rodiny",
  condolences: "Kondolence",
  condolencesText: "Kondolenci můžete poslat rodině prostřednictvím pohřební služby na",
  condolencesAfter: "Předáme ji.",
  qrHeading: "QR kód oznámení",
  qrText: "Oznámení vytisknete i s QR kódem této stránky klávesami Ctrl + P (na Macu Cmd + P).",
  qrFile: "QR kód k tisku (SVG)",

  // Catalogues
  catalogueEmpty: "Nabídku připravujeme. Zeptejte se v kanceláři.",
  code: "kód",
  flowersOrder: "Kam zavolat",
  flowersOrderText: "Květiny objednáte telefonicky nebo při sjednání pohřbu.",

  // Legal
  adrHeading: "Mimosoudní řešení sporů",
  adrText: "Spor ze smlouvy s námi můžete řešit mimosoudně. Příslušným subjektem je",
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
  notFoundBefore: "Možná byla přesunuta. Zkuste",
  notFoundHome: "úvodní stránku",
  notFoundOr: "nebo",
  notFoundGuide: "jak postupovat, když někdo zemřel",
} as const;

function stepsWord(count: number): string {
  if (count === 1) {
    return "krok";
  }
  if (count >= 2 && count <= 4) {
    return "kroky";
  }
  return "kroků";
}

/** "pátek" → "v pátek", "středa" → "ve středu" (the weekday after a preposition, accusative). */
const WEEKDAY_ACCUSATIVE: Record<string, string> = {
  pondělí: "v pondělí",
  úterý: "v úterý",
  středa: "ve středu",
  čtvrtek: "ve čtvrtek",
  pátek: "v pátek",
  sobota: "v sobotu",
  neděle: "v neděli",
};

export function weekdayWithPreposition(weekday: string): string {
  return WEEKDAY_ACCUSATIVE[weekday] ?? weekday;
}

/** The picker words, lower case: "doma", "v nemocnici", … */
export const situationWords: Record<SpecificSituation, string> = {
  home: "doma",
  hospital: "v nemocnici",
  "care-home": "v domově pro seniory",
  abroad: "v zahraničí",
};

export const guidancePhaseLabels: Record<Guidance["phase"], string> = {
  "first-hours": "V prvních hodinách",
  "first-days": "V následujících dnech",
  arrangements: "Příprava pohřbu",
  "after-funeral": "Po pohřbu",
};

export const flowerTypeLabels: Record<FlowerArrangement["type"], string> = {
  wreath: "věnec",
  spray: "vazba na rakev",
  bouquet: "kytice",
  "urn-arrangement": "aranžmá k urně",
  other: "jiná vazba",
};
