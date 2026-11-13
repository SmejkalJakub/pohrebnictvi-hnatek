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
  homeLink: "Úvodní stránka",
  peopleLink: "Lidé",
  faqLink: "Časté otázky",
  documentsLink: "Dokumenty",
  stampNote: "ve dne, v noci i o svátcích",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",

  // Home
  firstHoursHeading: "Když někdo zemřel",
  pickerQuestion: "Kde blízký člověk zemřel?",
  fullGuide: "Celý postup krok za krokem",
  servicesHeading: "Pohřeb s obřadem i bez obřadu",
  servicePriceLink: "Co je v ceně a kolik to stojí",
  allServices: "Všechny služby",
  storyLink: "Více o nás",
  officeHeading: "Kancelář",
  officeLink: "Všechny kontakty",
  catalogueHeading: "Rakve a květiny",
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
  tally: (count: number, phrase: string) => `${count} ${stepsWord(count)} pro úmrtí ${phrase}.`,
  showAll: "Zobrazit vše",
  appliesWhen: "když člověk zemřel",
  appliesAlways: "vždy",
  readMore: "Podrobnosti",
  checklist: "Co mít hotové",
  officePrompt: "Domluvte se s kanceláří",
  faqHeading: "Časté otázky",

  // Services
  moreServices: "Další služby",
  includesLink: "Co je v ceně",

  // Pricing
  included: "V ceně je zahrnuto",
  excluded: "Není zahrnuto",
  otherItems: "Jednotlivé položky",
  printHint: "Ceník vytisknete klávesami Ctrl + P (na Macu Cmd + P).",
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

  // Bands
  photoBy: "Foto:",

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
  qrText: "Oznámení vytisknete i s QR kódem této stránky klávesami Ctrl + P (na Macu Cmd + P).",
  qrFile: "QR kód k tisku (SVG)",

  // Catalogues
  catalogueEmpty: "Nabídku připravujeme. Zeptejte se v kanceláři.",
  code: "kód",
  flowersOrder: "Objednávka květin",
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

/** The picker words, lower case, as one sentence: "doma · v nemocnici · …". */
export const situationWords: Record<SpecificSituation, string> = {
  home: "doma",
  hospital: "v nemocnici",
  "care-home": "v domově pro seniory",
  abroad: "v zahraničí",
};

export const guidancePhaseLabels: Record<Guidance["phase"], string> = {
  "first-hours": "V prvních hodinách",
  "first-days": "V dalších dnech",
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
