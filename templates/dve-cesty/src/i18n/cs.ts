/**
 * Template UI strings (template-contract §7). Plain, direct Czech; no business facts: names,
 * numbers, hours, prices and addresses always come from content through core. One-letter words
 * are followed by a non-breaking space ( ) so they never end a line.
 */
import type { FlowerArrangement, Guidance, Service } from "@core/content/schemas.ts";
import type { SpecificSituation } from "@core/content/guidance-flow.ts";

export const ui = {
  skipLink: "Přeskočit na obsah",
  menuOpen: "Menu",
  menuClose: "Zavřít",
  homeLink: "Úvodní stránka",
  peopleLink: "Lidé",
  faqLink: "Časté otázky",
  documentsLink: "Dokumenty",

  // The two paths
  pathNav: "Cesta",
  mainNav: "Hlavní navigace",
  subnav: "V této cestě",
  subnavLead: "V této cestě:",
  nowSwitch: "Teď hned",
  aheadSwitch: "S předstihem",
  nowLabel: "Někdo právě zemřel",
  aheadLabel: "Chci se informovat nebo připravit",
  menuNowLabel: "Teď hned · někdo právě zemřel",
  menuAheadLabel: "S předstihem · informace a ceny",
  thisPage: "(tato stránka)",
  availability: "Ve dne, v noci i o svátcích.",
  someoneDied: "Někdo právě zemřel?",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",

  // Home
  homeQuestion: "S čím vám můžeme pomoct?",
  nowHeading: "Zavolejte nám. Další kroky zařídíme spolu.",
  aheadHeading: "V klidu si projděte možnosti a ceny.",
  firstSteps: [
    "Lékař provede prohlídku zemřelého a vystaví list o prohlídce.",
    "Zavolejte nám. Převoz domluvíme hned.",
    "Pohřeb nemusíte zařizovat hned. Máte na to několik dní.",
  ],
  firstStepsLabel: "První kroky",
  guideByPlace: "Postup podle místa úmrtí: doma, v nemocnici, v domově, v zahraničí",
  guideByPlaceShort: "Postup podle místa úmrtí",
  priceRow: "Ceník a co je v ceně",
  faqRowNote: "doklady, platba, urna",
  officeHeading: "Kancelář",
  hoursHeading: "Úřední hodiny",
  noticesHeading: "Oznámení a obřady",
  noticesText: "Smuteční oznámení a termíny rozloučení, které rodiny zveřejnily u nás.",
  noticesShow: (count: number) => `Zobrazit oznámení (${count})`,
  aboutLink: "Kdo jsme",
  servicesHeading: "Služby",
  allServices: "Všechny služby",
  priceHeading: "Ceny",
  priceLink: "Celý ceník",
  peopleHeading: "Kdo vás přijme",
  allPeople: "Všichni lidé a kontakty",
  catalogueHeading: "Rakve a květiny",
  documentsHeading: "Dokumenty",
  allFaq: "Všechny otázky",
  pickerQuestion: "Kde blízký člověk zemřel?",

  // Guide
  picked: "(vybráno)",
  showAll: "Zrušit výběr a ukázat vše",
  pickHint: "Vyberte místo a ukážeme jen kroky, které se vás týkají.",
  allHint: "Bez výběru vidíte celý postup.",
  readMore: "Podrobnosti",
  checklist: "Co mít připravené",
  officePrompt: "Domluvte se s kanceláří",

  // Services
  moreServices: "Další služby",
  includesHeading: "Co je v ceně a kolik to stojí",
  allServicesBack: "Všechny služby",
  faqHeading: "Časté otázky",

  // Pricing
  included: "V ceně je zahrnuto",
  excluded: "Není zahrnuto",
  otherItems: "Jednotlivé položky",
  itemColumn: "Položka",
  noteColumn: "Poznámka",
  priceColumn: "Cena",
  printHint: "Vytisknout: Ctrl + P (na Macu Cmd + P).",
  printedFrom: "Vytištěno z",
  priceValidFrom: (date: string) => `Ceník platí od ${date}.`,

  // Contact
  mapLink: "Mapa a příjezd",
  phonesHeading: "Telefony a e-mail",
  exceptionsHeading: "Mimořádné změny",
  serviceAreaPrefix: "Převážíme:",

  // Notices
  noticesUpcoming: "Nadcházející rozloučení",
  noticesRecent: "Nedávná oznámení",
  noticesWithoutDate: "Bez veřejného rozloučení",
  noticesEmpty: "Momentálně nezveřejňujeme žádné oznámení.",
  allNotices: "Všechna oznámení",
  ceremonyHeld: (date: string) => `rozloučení proběhlo ${date}`,
  withoutCeremony: "Pohřeb bez obřadu.",
  privateCeremony: "Rodina se rozloučí v soukromí.",
  ceremonyLine: (time: string | null, place: string | null) => {
    const parts: string[] = [];
    if (time !== null) {
      parts.push(time);
    }
    if (place !== null) {
      parts.push(place);
    }
    return parts.join(", ");
  },
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
  qrText: "Vytisknout oznámení: Ctrl + P (na Macu Cmd + P). Výtisk je černobílý.",
  qrFile: "QR kód k tisku (SVG)",
  guestsLink: "Pro účastníky pohřbu",

  // Catalogues
  catalogueEmpty: "Nabídku připravujeme. Zeptejte se v kanceláři:",
  code: "kód",
  flowersOrder: "Objednávka květin",
  flowersOrderText: "Květiny objednáte telefonicky nebo při sjednání pohřbu.",

  // Legal
  adrHeading: "Mimosoudní řešení sporů",
  adrText: "Spor ze smlouvy s námi můžete řešit mimosoudně. Příslušným subjektem je",
  adrFooter: "Spory:",
  complaintsHeading: "Reklamace",
  legalHeading: "Právní informace",
  validFrom: "platí od",
  pdf: "PDF",
  ico: "IČO",
  privacy: "Ochrana osobních údajů",

  // 404
  notFoundTitle: "Tuto stránku jsme nenašli",
  notFoundText: "Adresa je možná chybně, nebo stránka už neexistuje. Vyberte, co potřebujete.",
  notFoundGuide: "Jak postupovat po úmrtí",
  notFoundContact: "Kontakt a úřední hodiny",
  notFoundNotices: "Hledáte oznámení?",
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

/** "pátek" → "Pátek" (day headings on the notice list). */
export function capitalise(text: string): string {
  if (text === "") {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The picker rows, as drawn: "Doma", "V nemocnici", … */
export const situationRows: Record<SpecificSituation, string> = {
  home: "Doma",
  hospital: "V nemocnici",
  "care-home": "V domově pro seniory",
  abroad: "V zahraničí",
};

export const guidancePhaseLabels: Record<Guidance["phase"], string> = {
  "first-hours": "První hodiny",
  "first-days": "Další dny",
  arrangements: "Zařizování pohřbu",
  "after-funeral": "Po pohřbu",
};

export const serviceCategoryLabels: Record<Service["category"], string> = {
  ceremony: "Rozloučení a obřad",
  transport: "Převoz",
  arrangements: "Úřední věci a sjednání",
  cremation: "Kremace a pohřeb bez obřadu",
  memorial: "Co k pohřbu patří",
  other: "Další služby",
};

export const flowerTypeLabels: Record<FlowerArrangement["type"], string> = {
  wreath: "věnec",
  spray: "vazba na rakev",
  bouquet: "kytice",
  "urn-arrangement": "aranžmá k urně",
  other: "jiná vazba",
};
