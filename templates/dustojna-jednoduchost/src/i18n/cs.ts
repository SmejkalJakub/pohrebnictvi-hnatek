/**
 * Template UI strings (template-contract §7). No business facts here: names, numbers,
 * hours and addresses always come from content through core.
 */
import type { Guidance, Service, FlowerArrangement } from "@core/content/schemas.ts";

export const ui = {
  skipLink: "Přeskočit na obsah",
  menu: "Menu",
  closeMenu: "Zavřít",
  mainNav: "Hlavní navigace",
  home: "Úvod",
  emergencyShort: "Nonstop převoz",
  emergencyAround: "24 hodin denně",
  officeShort: "Kancelář",
  actionBar: "Rychlé volání",
  callOffice: "Zavolat do kanceláře",
  showOnMap: "Zobrazit na mapě",
  address: "Adresa",
  phonesAndEmail: "Telefon a e-mail",
  legalIds: "Údaje o společnosti",
  legalName: "Obchodní název",
  ico: "IČO",
  dic: "DIČ",
  registryEntry: "Zápis v rejstříku",
  registeredOffice: "Sídlo",
  firstSteps: "Co dělat jako první",
  fullGuide: "Celý postup krok za krokem",
  allServices: "Všechny služby",
  serviceDetail: "Podrobnosti",
  moreAboutUs: "Více o nás",
  allContacts: "Všechny kontakty",
  contactSummary: "Kontakt",
  whatItIncludes: "Co zahrnuje",
  relatedPrices: "Související ceny",
  relatedPricesLink: "Zobrazit v ceníku",
  officeContacts: "Kontakt na kancelář",
  backToServices: "Zpět na všechny služby",
  breadcrumb: "Drobečková navigace",
  detailedSteps: "Podrobný postup",
  prepareList: "Co si připravit",
  printHint:
    "Postup si můžete vytisknout (Ctrl + P, na Macu Cmd + P). Tisková verze obsahuje všechny kroky rozbalené a seznamy k odškrtnutí.",
  phasesNav: "Fáze postupu",
  callEmergencyPrompt: "Potřebujete převoz nyní?",
  callOfficePrompt: "Domluvte se s kanceláří",
  unreviewed: "Neověřený text",
  catalogueSoon: "Katalog připravujeme.",
  catalogueContact: "Pro výběr a další informace nás kontaktujte",
  photoMissing: "Fotografie bude doplněna",
  material: "Materiál",
  code: "Kód",
  coffinsHeading: "Nabídka rakví",
  flowersHeading: "Nabídka květin",
  flowersOrder: "Jak objednat",
  flowersOrderText: "Květiny objednáte telefonicky nebo osobně při sjednání pohřbu.",
  flowerType: "Druh",
  factSheet: "Základní údaje",
  familyOwned: "Rodinná firma",
  yes: "ano",
  no: "ne",
  tradition: "Tradice",
  foundedYear: "Založeno",
  location: "Provozovna",
  priceItem: "Položka",
  priceDescription: "Popis",
  price: "Cena",
  priceValidFrom: "Ceny platné od",
  noDescription: "–",
  notFoundTitle: "Stránka nenalezena",
  notFoundText: "Stránka, kterou hledáte, neexistuje nebo byla přesunuta.",
  notFoundHelp: "Mohlo by vám pomoci",
  privacy: "Ochrana osobních údajů",
  catalogueLinks: "Rakve a květiny",
  emailLabel: "E-mail",
  hoursClosedDays: "zavřeno",
  exceptionsHeading: "Mimořádné změny",
} as const;

export const serviceCategoryLabels: Record<Service["category"], string> = {
  ceremony: "Pohřby a obřady",
  transport: "Převoz",
  arrangements: "Vyřízení a formality",
  cremation: "Kremace",
  memorial: "Oznámení a vzpomínka",
  other: "Další služby",
};

export const guidancePhaseLabels: Record<Guidance["phase"], string> = {
  "first-hours": "V prvních hodinách",
  "first-days": "V následujících dnech",
  arrangements: "Příprava pohřbu",
  "after-funeral": "Po pohřbu",
};

/** ASCII anchors for the phases (content-contract §5). */
export const guidancePhaseAnchors: Record<Guidance["phase"], string> = {
  "first-hours": "prvni-hodiny",
  "first-days": "nasledujici-dny",
  arrangements: "priprava-pohrbu",
  "after-funeral": "po-pohrbu",
};

export const situationLabels: Record<Guidance["situations"][number], string> = {
  any: "Platí vždy",
  home: "Úmrtí doma",
  hospital: "Úmrtí v nemocnici",
  "care-home": "Úmrtí v domově pro seniory",
  abroad: "Úmrtí v zahraničí",
};

export const flowerTypeLabels: Record<FlowerArrangement["type"], string> = {
  wreath: "Věnec",
  spray: "Vazba na rakev",
  bouquet: "Kytice",
  "urn-arrangement": "Aranžmá k urně",
  other: "Jiná vazba",
};
