/**
 * Template UI strings (template-contract §7). Plain, direct Czech; no business facts: names,
 * numbers, hours and addresses always come from content through core. One-letter words are
 * followed by a non-breaking space ( ) so they never end a line.
 */
import type { FlowerArrangement, Guidance, Service } from "@core/content/schemas.ts";
import type { SpecificSituation } from "@core/content/guidance-flow.ts";

export const ui = {
  skipLink: "Přeskočit na obsah",
  menuOpen: "Obsah",
  menuClose: "Zavřít",
  mainNav: "Hlavní navigace",
  homeLink: "Úvodní stránka",
  faqLink: "Časté otázky",
  emergencyAround: "Ve dne, v noci i o svátcích.",
  emergencyDirect: "Voláte přímo nám.",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",

  // Home
  heroKicker: "Když někdo zemřel",
  heroLink: "Co udělat v prvních hodinách",
  noticesHeading: "Kdy a kde je rozloučení",
  noticesText: "Nadcházející rozloučení a oznámení, která zveřejňujeme se souhlasem rodiny.",
  noticesLink: "Najít oznámení",
  servicesKicker: "Služby",
  serviceLink: "Co služba zahrnuje",
  servicesHeading: "S čím vám pomůžeme",
  allServices: "Všechny služby",
  stepsKicker: "Jak postupovat",
  firstHoursHeading: "Co udělat jako první",
  fullGuide: "Celý postup krok za krokem",
  storyKicker: "O nás",
  storyLink: "Více o nás",
  officeKicker: "Kancelář",
  officeLink: "Všechny kontakty",
  catalogueKicker: "Rakve a květiny",

  // Guide
  pickerHeading: "Kde blízký člověk zemřel?",
  picked: "vybráno",
  tally: (shown: number, total: number) => `Zobrazeno ${shown} z ${total} kroků.`,
  showAll: "Zobrazit všechny kroky",
  stepOf: (total: number) => `z ${total}`,
  step: "Krok",
  appliesTo: "Platí, když člověk zemřel",
  readMore: "Podrobnosti",
  /** Guided list (design-differentiation §1.3): calm instructions, never tick boxes. */
  guideListHeading: "Postupně",
  then: "Potom",
  guideLead:
    "Nemusíte všechno vyřešit najednou. Ani si nic pamatovat. Stačí jít krok za krokem. Když si nebudete jistí, zavolejte nám. Poradíme vám.",
  guideCloseHeading: "Tím máte to nejdůležitější za sebou.",
  guideCloseText: "Se vším ostatním vám pomůžeme při sjednání pohřbu.",
  officePrompt: "Domluvte se s kanceláří",
  faqHeading: "Časté otázky",
  railTrackLabel: "Kroky na této stránce",
  railTrackCounter: "Krok {n} z {total}",
  railMoreNav: "Ostatní stránky",

  // Services
  moreServices: "Další služby",
  includesLink: "Co je v ceně",
  priceLink: "Ceny najdete v ceníku",
  allServicesBack: "Všechny služby",

  // Pricing
  included: "V ceně je zahrnuto",
  excluded: "Není zahrnuto",
  otherItems: "Jednotlivé položky",
  printHint:
    "Ceník vytisknete klávesami Ctrl + P (na Macu Cmd + P). Vytiskne se světle, černě na bílém papíře.",
  printedFrom: "Vytištěno z",
  priceValidFrom: (date: string) => `Ceny platí od ${date}.`,

  // Contact
  contactKicker: "Kontakt",
  mapLink: "Mapa a příjezd",
  hoursHeading: "Úřední hodiny",
  phonesHeading: "Telefony a e-mail",
  transportHeading: "Převoz zesnulých",
  peopleKicker: "Lidé",
  peopleHeading: "Kdo vás přijme",
  directLine: "Přímá linka",
  breakLabel: "Přestávka",
  exceptionsHeading: "Mimořádné změny",

  // Notices
  noticesUpcoming: "Nadcházející rozloučení",
  noticesWithoutCeremony: "Bez veřejného obřadu",
  noticesRecent: "Nedávná oznámení",
  noticesEmpty: "Momentálně nezveřejňujeme žádné oznámení.",
  allNotices: "Všechna oznámení",
  ceremonyHeld: "rozloučení proběhlo",
  ceremonySentence: (weekday: string, date: string, time: string | null, place: string | null) => {
    let sentence = `Rozloučení se koná ${weekdayWithPreposition(weekday)} ${date}`;
    if (time !== null) {
      sentence += ` v\u00a0${time}`;
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
  condolencesText: "Kondolenci můžete poslat rodině prostřednictvím pohřební služby na adresu",
  condolencesAfter: "Předáme ji.",
  qrHeading: "QR kód oznámení",
  qrText:
    "Oznámení vytisknete klávesami Ctrl + P (na Macu Cmd + P). Výtisk je světlý, černý text na bílém papíře.",
  qrFile: "QR kód k tisku (SVG)",
  livestreamShort: "přenos",

  // Catalogues
  catalogueEmpty: "Nabídku připravujeme. Zeptejte se v kanceláři.",
  code: "kód",
  flowersOrder: "Objednávka květin",
  flowersOrderText: "Květiny objednáte telefonicky nebo při sjednání pohřbu.",

  // Legal
  adrHeading: "Mimosoudní řešení sporů",
  adrText: "Spor ze smlouvy s námi můžete řešit mimosoudně. Příslušným subjektem je",
  adrFooter: "Spory řeší",
  complaintsHeading: "Reklamace",
  documentsHeading: "Dokumenty ke stažení",
  documentsFooter: "Dokumenty",
  validFrom: "platí od",
  pdf: "PDF",
  legalIds: "Údaje o společnosti",
  ico: "IČO",
  dic: "DIČ",
  privacy: "Ochrana osobních údajů",

  // 404
  notFoundKicker: "Chyba 404",
  notFoundTitle: "Tato stránka tu není.",
  notFoundText: "Možná byla přesunuta, nebo je v odkazu chyba.",
  notFoundNav: "Kam dál",
  unreviewed: "Neověřený text",
} as const;

/** "pátek" → "v pátek", "středa" → "ve středu" (the weekday after a preposition, accusative). */
const WEEKDAY_ACCUSATIVE: Record<string, string> = {
  pondělí: "v\u00a0pondělí",
  úterý: "v\u00a0úterý",
  středa: "ve středu",
  čtvrtek: "ve čtvrtek",
  pátek: "v\u00a0pátek",
  sobota: "v\u00a0sobotu",
  neděle: "v\u00a0neděli",
};

export function weekdayWithPreposition(weekday: string): string {
  return WEEKDAY_ACCUSATIVE[weekday] ?? weekday;
}

/** "pátek" → "Pátek" for agenda headings. */
export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const situationLabels: Record<SpecificSituation, string> = {
  home: "Doma",
  hospital: "V nemocnici",
  "care-home": "V domově pro seniory",
  abroad: "V zahraničí",
};

/** "Platí, když člověk zemřel doma." */
export const situationPhrases: Record<SpecificSituation, string> = {
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

export const serviceCategoryLabels: Record<Service["category"], string> = {
  ceremony: "Pohřeb a obřad",
  transport: "Převoz",
  arrangements: "Vyřízení a formality",
  cremation: "Kremace",
  memorial: "Oznámení a vzpomínka",
  other: "Další služby",
};

export const flowerTypeLabels: Record<FlowerArrangement["type"], string> = {
  wreath: "věnec",
  spray: "vazba na rakev",
  bouquet: "kytice",
  "urn-arrangement": "aranžmá k urně",
  other: "jiná vazba",
};
