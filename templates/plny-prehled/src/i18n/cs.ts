/**
 * UI strings for Template D "Plný přehled" (plain, direct Czech; no business facts).
 * One-letter words (v, s, k, z, u, o, i, a) are followed by a non-breaking space.
 */
import type { SpecificSituation } from "@core/content/guidance-flow.ts";

/** Czech plural: 1 krok, 2–4 kroky, 5 a více kroků. */
function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) {
    return one;
  }
  if (count >= 2 && count <= 4) {
    return few;
  }
  return many;
}

export const ui = {
  skipLink: "Přeskočit na obsah",
  menuOpen: "Rejstřík",
  menuClose: "Zavřít",
  menuTitle: "Rejstřík",
  navLabel: "Hlavní navigace",
  homeLink: "Úvodní stránka",
  peopleLink: "Lidé",
  faqLink: "Časté otázky",
  documentsLink: "Dokumenty",

  // Header and footer
  officeBox: "Kancelář",
  neutralPublisher: (brand: string) => `Oznámení zveřejňuje ${brand}.`,
  neutralPhone: "Telefon nonstop",
  footerDocuments: "Dokumenty",
  footerLegal: "Právní",
  adrShort: "Spory:",
  ico: "IČO",
  privacy: "Ochrana osobních údajů",
  mapLink: "mapa",
  pdf: "PDF",

  // Home directory
  directoryHeading: "Když někdo zemřel",
  whereDied: "Kde zemřel?",
  firstHours: "První hodiny",
  fullGuide: "Celý postup",
  priceHeading: "Ceník, výběr",
  fullPriceList: "Celý ceník",
  servicesHeading: "Služby",
  allServices: "Všechny služby",
  peopleHeading: "Lidé",
  allPeople: "Všichni lidé a kontakty",
  noticesHeading: "Oznámení",
  upcomingCount: (count: number) => `${count} ${plural(count, "nadcházející", "nadcházející", "nadcházejících")}`,
  documentsHeading: "Dokumenty",
  faqHeading: "Časté otázky",
  allQuestions: "Všechny otázky",
  noFeatured: "Přehled služeb je na stránce Služby.",

  // Counts in the Rejstřík
  steps: (count: number) => `${count} ${plural(count, "krok", "kroky", "kroků")}`,
  pdfCount: (count: number) => `${count} PDF`,

  // Guide
  situationButtons: "Kde zemřel?",
  picked: "vybráno",
  stepColumn: "Krok",
  whatColumn: "Co udělat",
  appliesColumn: "Platí pro",
  yes: "ano",
  none: "—",
  everyone: "vše",
  allSteps: (count: number) => `Všechny kroky (${count})`,
  situationSteps: (label: string, count: number) => `${label}: ${count} ${plural(count, "krok", "kroky", "kroků")}`,
  showAllSteps: "Zobrazit všechny kroky",
  stepDetails: "Postup krok za krokem",
  checklist: "Co připravit",
  more: "Podrobnosti",
  callUs: "nonstop",
  officePrompt: "Kancelář",
  printGuide: "Postup vytisknete klávesami Ctrl + P, na Macu Cmd + P.",

  // Pricing
  vatAgain: "Ceník",
  includes: "V ceně je zahrnuto",
  excludes: "Není zahrnuto",
  itemsHeading: "Jednotlivé položky",
  itemColumn: "Položka",
  descriptionColumn: "Popis",
  kindColumn: "Typ ceny",
  priceColumn: "Cena",
  printPrices: "Verzi k tisku (A4) vytisknete klávesami Ctrl + P, na Macu Cmd + P.",
  validFrom: (date: string) => `Platí od ${date}.`,
  printSource: "Ceník je zveřejněn na",

  // Services
  serviceColumn: "Služba",
  includesColumn: "Co zahrnuje",
  detail: "Detail",
  detailOf: (title: string) => `Detail: ${title}`,
  categoryRow: "Druh služby",
  priceRow: "Cena",
  priceListLink: "Celý ceník",
  allServicesBack: "Všechny služby",

  // Contact
  addressRow: "Adresa",
  emailRow: "E-mail",
  hoursHeading: "Úřední hodiny",
  transportHeading: "Převoz zesnulých",
  availabilityRow: "Dostupnost",
  areaRow: "Oblast",
  callRow: "Telefon",
  contactsHeading: "Kontakty",
  availability247: "nonstop, 24 hodin denně, i o svátcích",
  accessRow: "Příjezd",

  // People
  photoColumn: "Fotografie",
  nameColumn: "Jméno",
  roleColumn: "Na starosti",
  lineColumn: "Přímá linka",

  // Catalogue
  nameCol: "Název",
  codeCol: "Označení",
  materialCol: "Materiál",
  typeCol: "Druh",
  aboutCol: "Popis",
  noItems: "Nabídku vám rádi ukážeme v kanceláři.",
  flowersOrder: "Objednávky květin",

  // Notices
  noticesUpcoming: "Nadcházející rozloučení",
  noticesRecent: "Nedávná oznámení",
  noticesUpcomingShort: "Nadcházející",
  noticesRecentShort: "Nedávná",
  noticesEmpty: "Momentálně nejsou zveřejněna žádná oznámení.",
  dateCol: "Datum",
  timeCol: "Čas",
  placeCol: "Místo",
  ceremonyCol: "Obřad",
  streamCol: "Přenos",
  diedCol: "Zemřel(a)",
  farewellCol: "Rozloučení",
  when: "Kdy",
  where: "Kde",
  withStream: "přenos",
  allNotices: "Oznámení a obřady",
  born: "Narozen(a)",
  died: "Zemřel(a)",
  farewell: "Rozloučení",
  place: "Místo",
  ceremony: "Obřad",
  stream: "Přenos",
  streamLink: "Sledovat přenos obřadu",
  condolences: "Kondolence",
  condolencesIntro: "Přes pohřební službu na",
  condolencesOutro: ", předáme ji rodině.",
  fromFamily: "Od rodiny",
  parte: "Parte",
  parteLink: "Parte ke stažení (PDF)",
  qrFile: "QR kód k tisku",
  printNotice: "Oznámení s QR kódem vytisknete klávesami Ctrl + P, na Macu Cmd + P.",
  ceremonySentence: (weekday: string, date: string, time: string | null, place: string | null) => {
    let text = `Rozloučení se koná ${weekdayPhrase(weekday)} ${date}`;
    if (time !== null) {
      text = `${text} v ${time}`;
    }
    if (place !== null) {
      text = `${text}, ${place}`;
    }
    return `${text}.`;
  },

  // Legal
  adrHeading: "Mimosoudní řešení sporů",
  adrBody: "Subjekt mimosoudního řešení spotřebitelských sporů",
  complaintsHeading: "Reklamace",
  documentsSheet: "Dokumenty ke stažení",
  validFromCol: "Platí od",
  fileCol: "Soubor",

  // 404
  notFoundTitle: "Stránka nenalezena",
  notFoundText: "Adresa neexistuje nebo byla změněna. Tady je celý obsah webu:",
} as const;

/** "v pátek", "ve středu", "ve čtvrtek": the preposition depends on the weekday. */
function weekdayPhrase(weekday: string): string {
  const accusative: Record<string, string> = {
    pondělí: "v pondělí",
    úterý: "v úterý",
    středa: "ve středu",
    čtvrtek: "ve čtvrtek",
    pátek: "v pátek",
    sobota: "v sobotu",
    neděle: "v neděli",
  };
  return accusative[weekday] ?? weekday;
}

/** "pá" for "pátek": the short weekday in the notice timetable. */
export const weekdayShort: Record<string, string> = {
  pondělí: "po",
  úterý: "út",
  středa: "st",
  čtvrtek: "čt",
  pátek: "pá",
  sobota: "so",
  neděle: "ne",
};

/** Column headers of the guide matrix and the situation buttons. */
export const situationColumns: Record<SpecificSituation, string> = {
  home: "Doma",
  hospital: "Nemocnice",
  "care-home": "Domov",
  abroad: "Zahraničí",
};

export const situationButtons: Record<SpecificSituation, string> = {
  home: "Doma",
  hospital: "V nemocnici",
  "care-home": "V domově pro seniory",
  abroad: "V zahraničí",
};

/** Lower-case words for the "Platí pro" column. */
export const situationWords: Record<SpecificSituation, string> = {
  home: "doma",
  hospital: "nemocnice",
  "care-home": "domov",
  abroad: "zahraničí",
};

export const serviceCategoryLabels: Record<string, string> = {
  ceremony: "Obřad",
  transport: "Převoz",
  arrangements: "Vyřízení",
  cremation: "Kremace",
  memorial: "Památka",
  other: "Další",
};

export const flowerTypeLabels: Record<string, string> = {
  wreath: "věnec",
  spray: "kytice na rakev",
  bouquet: "kytice",
  "urn-arrangement": "aranžmá k urně",
  other: "jiné",
};
