/**
 * Template UI strings (template-contract §7). Every heading is the family's question, answered by
 * content. Plain, direct Czech; no business facts: names, numbers, hours, prices and addresses
 * always come from content through core. One-letter words are kept off line ends by
 * keepShortWords() at render time, so the strings here use ordinary spaces.
 */
import type { SpecificSituation } from "@core/content/guidance-flow.ts";
import type { NoticeCeremonyType, Service } from "@core/content/schemas.ts";

export const ui = {
  skipLink: "Přeskočit na obsah",
  mainNav: "Hlavní navigace",
  homeLink: "Úvodní stránka",

  // Nonstop forms
  helpNowQuestion: "Kdo nám pomůže hned?",
  helpNowAnswer: "My.",
  helpNowFallback: "Volejte kdykoli, ve dne i v noci.",
  stripQuestion: "Potřebujete nás hned?",
  closingBefore: "Kdykoli potřebujete, volejte",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",

  // Home
  whatNextQuestion: "Co nás teď čeká?",
  wherePrompt: "Kde zemřel?",
  stepByStep: "Krok za krokem",
  costQuestion: "Kolik to bude stát?",
  costCosts: "stojí",
  costMore: "Co je v ceně a co si vybíráte zvlášť, najdete v ceníku.",
  costLink: "Ceník a co je v ceně",
  whoQuestion: "Kdo jste?",
  aboutLink: "Více o nás",
  arrangeQuestion: "Co pro vás můžeme zařídit?",
  allServices: "Všechno, co zařídíme",
  findUsQuestion: "Kde vás najdeme?",
  officeQuestion: "Kdy můžeme přijít do kanceláře?",
  allContacts: "Všechny kontakty",
  receiveQuestion: "Kdo vás přijme?",
  noticeQuestion: "Kde najdeme oznámení?",
  noticeCount: (count: number) => {
    if (count === 0) {
      return "Teď nejsou zveřejněna žádná nadcházející rozloučení.";
    }
    if (count === 1) {
      return "Zveřejněné je 1 nadcházející rozloučení.";
    }
    if (count < 5) {
      return `Zveřejněná jsou ${count} nadcházející rozloučení.`;
    }
    return `Zveřejněno je ${count} nadcházejících rozloučení.`;
  },
  askAgainQuestion: "Na co se ještě ptáte?",
  allQuestions: "Všechny otázky",
  chooseQuestion: "Jakou rakev a jaké květiny?",
  itemCount: (count: number) => `(${count})`,

  // Page questions (H1)
  guideQuestion: "Co teď?",
  coffinsQuestion: "Jakou rakev vybrat?",
  flowersQuestion: "Jaké květiny vybrat?",
  guestsQuestion: "Jdete na pohřeb?",
  prePlanningQuestion: "Jak se připravit předem?",
  legalQuestion: "Kam se obrátit, když nejste spokojeni?",
  privacyQuestion: "Jak chráníme vaše údaje?",
  notFoundQuestion: "Tuhle stránku jsme nenašli.",
  notFoundAsk: "Co hledáte?",
  notFoundGuide: "Co dělat, když někdo zemřel",
  notFoundNotices: "Oznámení a obřady",
  notFoundCost: "Kolik to bude stát",
  notFoundContact: "Kde nás najdete",

  // Guide
  picked: "(vybráno)",
  showAll: "Ukázat všechno",
  doNowAny: "Co udělat hned?",
  doNowPicked: "Co udělat teď?",
  showSteps: "Co udělat",
  laterDaysQuestion: "Co v dalších dnech?",
  afterQuestion: "Co po pohřbu?",
  /** The step's short list (guidance `checklist`), a calm sequence, never tick boxes (§1.3). */
  guideList: "Postupně",
  /** Reassurance at the top of the guide (design-differentiation §1.3). */
  guideCalm:
    "Nemusíte všechno vyřešit najednou ani si nic pamatovat. Stačí jít krok za krokem. Když si nebudete jistí, zavolejte nám a poradíme vám.",
  /** "Potom" link to the next question field of the guide. */
  thenQuestion: "Potom",
  /** After the last field of the guide. */
  guideClosing: "Tím máte to nejdůležitější za sebou.",
  guideClosingCall: "Na nic z toho nejste sami. Když si nebudete jistí, zavolejte nám:",
  /** Unfolds the rest of a longer answer in place (the template's signature, §1.1). */
  sayMore: "Povězte mi víc",
  callTransport: "Zavolat nám převoz:",
  officePrompt: "Domluvte se s kanceláří:",
  faqLink: "Časté otázky",

  // Services
  includesLink: "Co je v ceně",

  // Pricing
  included: "V ceně je zahrnuto",
  excluded: "Není zahrnuto",
  itemsQuestion: "Co stojí jednotlivé věci?",
  groupFirstQuestion: (title: string) => `Kolik stojí ${title}?`,
  groupNextQuestion: (title: string) => `A ${title}?`,
  printHint: "Ceník vytisknete klávesami Ctrl + P (na Macu Cmd + P).",
  printedFrom: "Vytištěno z",
  priceValidFrom: (date: string) => `Ceny platí od ${date}.`,
  itemLabel: "Položka",
  priceLabel: "Cena",

  // Contact
  mapLink: "Mapa a příjezd",
  reachQuestion: "Jak se s vámi spojím?",
  nightQuestion: "Co když je to v noci?",
  nightCall: "Volejte",
  closedLabel: "zavřeno",
  exceptionsHeading: "Mimořádné změny",

  // People, about
  directLine: "Přímá linka",
  moreQuestion: "Co ještě u nás najdete?",

  // Notices
  noticesUpcoming: "Nadcházející rozloučení",
  noticesRecent: "Nedávná oznámení",
  noticesEmpty: "Momentálně nezveřejňujeme žádné oznámení.",
  allNotices: "Všechna oznámení",
  ceremonyHeld: "rozloučení proběhlo",
  ceremonySentence: (weekday: string, date: string, time: string | null, place: string | null) => {
    let sentence = `Rozloučení se koná ${weekdayWithPreposition(weekday)} ${date}`;
    if (time !== null) {
      sentence += ` v ${time}`;
    }
    if (place !== null) {
      sentence += `, ${place}`;
    }
    return `${sentence}.`;
  },
  whenWhere: "Kdy a kde",
  fromAfar: "Na dálku",
  familyNote: "Od rodiny",
  condolences: "Kondolence",
  condolencesText: "Kondolenci můžete poslat rodině prostřednictvím pohřební služby na",
  condolencesAfter: "Předáme ji.",
  born: "Datum narození",
  diedLabel: "Datum úmrtí",
  mapPrefix: "Mapa",
  livestream: "Sledovat přenos obřadu",
  livestreamNote: "Odkaz vede na přenos, který vysílá místo obřadu.",
  partePdf: "Parte ke stažení (PDF)",
  parteImage: "Parte",
  qrHeading: "Oznámení k tisku",
  qrText: "Oznámení s QR kódem této stránky vytisknete klávesami Ctrl + P (na Macu Cmd + P).",

  // Catalogues
  catalogueEmpty: "Nabídku připravujeme. Zeptejte se v kanceláři:",
  code: "kód",
  flowersOrderQuestion: "Jak květiny objednám?",
  flowersOrderText: "Zavolejte nám nebo je objednejte při sjednání pohřbu.",

  // Legal
  disputesQuestion: "Kdo řeší spory?",
  adrText: "Spor ze smlouvy s námi můžete řešit mimosoudně. Příslušným subjektem je",
  complaintsQuestion: "Komu poslat reklamaci?",
  documentsQuestion: "Jaké dokumenty si můžete stáhnout?",
  validFrom: "platí od",
  pdf: "PDF",
  ico: "IČO",
  adrFooter: "Spory",
  privacy: "Ochrana osobních údajů",

  // Footer
  footerWhere: "Kde nás najdete",
  footerOffice: "Kdy jsme v kanceláři",
  footerNight: "Kdykoli, i v noci",
  footerDocuments: "Dokumenty",
  footerMore: "Co tu ještě najdete?",
  peopleLink: "Lidé",
} as const;

/** Question per service category (Služby is one page of questions; services are the answers). */
export const categoryQuestions: Record<Service["category"], string> = {
  ceremony: "Musí být pohřeb s obřadem?",
  arrangements: "Kdo vyřídí úřady?",
  transport: "Přijedete i v noci?",
  cremation: "Co bude s urnou?",
  memorial: "Jak dáme lidem vědět?",
  other: "Co dalšího zařídíte?",
};

/** "doma", "v nemocnici": the picker words and the place in a situation question. */
export const situationWords: Record<SpecificSituation, string> = {
  home: "doma",
  hospital: "v nemocnici",
  "care-home": "v domově pro seniory",
  abroad: "v zahraničí",
};

/** "Zemřel doma?" / "Zemřel v nemocnici nebo v domově pro seniory?" */
export function situationQuestion(situations: readonly SpecificSituation[]): string {
  return `Zemřel ${situations.map((situation) => situationWords[situation]).join(" nebo ")}?`;
}

/** "Zemřel doma. Co udělat teď?" */
export function pickedQuestion(situation: SpecificSituation): string {
  return `Zemřel ${situationWords[situation]}. ${ui.doNowPicked}`;
}

/** The ceremony line for notices without a public ceremony date. */
export const noCeremonyText: Record<NoticeCeremonyType, string> = {
  civil: "Datum rozloučení zatím není zveřejněno.",
  church: "Datum rozloučení zatím není zveřejněno.",
  "without-ceremony": "Pohřeb bez obřadu.",
  private: "Rodina se rozloučí v soukromí.",
};

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

function weekdayWithPreposition(weekday: string): string {
  return WEEKDAY_ACCUSATIVE[weekday] ?? weekday;
}

/** Flower arrangement types, shown muted under the name. */
export const flowerTypeLabels: Record<"wreath" | "spray" | "bouquet" | "urn-arrangement" | "other", string> =
  {
    wreath: "věnec",
    spray: "vazba na rakev",
    bouquet: "kytice",
    "urn-arrangement": "aranžmá k urně",
    other: "jiná vazba",
  };
