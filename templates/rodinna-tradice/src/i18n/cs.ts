/**
 * Template UI strings (template-contract §7). Generic wording only: nothing here states a
 * business fact. Facts (names, numbers, hours, years) always come from content via core.
 */
import type { Guidance, Service } from "@core/content/schemas.ts";

type ServiceCategory = Service["category"];
type GuidancePhase = Guidance["phase"];

export const ui = {
  skipLink: "Přeskočit na obsah",
  mainNav: "Hlavní navigace",
  footerNav: "Další odkazy",
  menu: "Menu",
  menuClose: "Zavřít",
  call: "Volat",
  homeLink: "Úvodní stránka",
  pageContents: "Obsah stránky",
  showOnMap: "Zobrazit na mapě",
  phones: "Telefony",
  email: "E-mail",
  address: "Adresa",
  contactHeading: "Kontakt",
  holidayExceptions: "Mimořádné změny",
  closed: "zavřeno",
  exceptionOpen: "otevřeno",
  legalHeading: "Údaje o společnosti",
  ico: "IČO",
  dic: "DIČ",
  registeredOffice: "Sídlo",
  serviceArea: "Oblast",
  privacy: "Ochrana osobních údajů",
  reviewedOn: "Text ověřen",
  sources: "Zdroje",
  foundedSince: "od roku",
  familyOwned: "Rodinná firma",

  // Home sections
  sectionLabelStory: "O nás",
  moreAboutUs: "Více o nás",
  sectionLabelServices: "Služby",
  servicesHeading: "Jak vám pomůžeme",
  allServices: "Přehled všech služeb",
  sectionLabelSteps: "První kroky",
  stepsHeading: "Když zemře blízký člověk",
  stepsIntro: "Následující kroky vám pomohou zorientovat se v tom, co je potřeba zařídit nejdříve.",
  stepsEmergencyLead: "Potřebujete-li převoz zesnulého, volejte:",
  stepsFullGuide: "Celý postup krok za krokem",
  sectionLabelVisit: "Kontakt",
  visitHeading: "Navštivte nás",
  sectionLabelCatalogue: "Nabídka",
  catalogueHeading: "Rakve a smuteční květiny",
  catalogueCoffins: "Prohlédnout nabídku rakví",
  catalogueFlowers: "Prohlédnout smuteční květiny",

  // Jak postupovat
  urgentAsideTitle: "Potřebujete převoz hned?",
  checklistLabel: "K tomuto kroku si připravte",
  promptEmergency: "Převoz zesnulého:",
  promptOffice: "Zavolejte nám do kanceláře:",

  // Služby
  relatedPrices: "Související ceny",

  // Catalogues
  coffinsHeading: "Nabídka rakví",
  flowersHeading: "Smuteční květiny",
  materialLabel: "Materiál",
  codeLabel: "Označení",
  catalogueEmpty: "Katalog připravujeme.",
  catalogueEmptyContact: "Na aktuální nabídku se zeptejte v kanceláři:",
  flowersOrderHeading: "Objednávka květin",
  flowersOrderText: "Květiny můžete objednat telefonicky:",

  // Ceník
  validFrom: "Platnost od",

  // 404
  notFoundTitle: "Stránka nenalezena",
  notFoundText: "Tuto stránku jsme nenašli. Mohla být přesunuta nebo odstraněna.",
  notFoundHome: "Zpět na úvodní stránku",
  notFoundContact: "Kontakt",
} as const;

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  ceremony: "Pohřby a obřady",
  transport: "Převoz zesnulých",
  arrangements: "Vyřízení náležitostí",
  cremation: "Kremace a uložení",
  memorial: "Vzpomínka a oznámení",
  other: "Další služby",
};

/** ASCII anchors for category sections on /sluzby/ (content-contract §5). */
export const SERVICE_CATEGORY_ANCHOR: Record<ServiceCategory, string> = {
  ceremony: "obrady",
  transport: "prevoz",
  arrangements: "nalezitosti",
  cremation: "kremace-a-ulozeni",
  memorial: "vzpominka",
  other: "dalsi-sluzby",
};

/** Homepage prose groupings: two or three headed paragraphs instead of cards. */
export const SERVICE_PROSE_GROUPS: readonly { title: string; categories: readonly ServiceCategory[] }[] = [
  { title: "Pohřeb a rozloučení", categories: ["ceremony", "cremation"] },
  { title: "Převoz a vyřízení náležitostí", categories: ["transport", "arrangements"] },
  { title: "Vzpomínka a další služby", categories: ["memorial", "other"] },
];

export const GUIDANCE_PHASE_LABEL: Record<GuidancePhase, string> = {
  "first-hours": "V prvních hodinách",
  "first-days": "V následujících dnech",
  arrangements: "Příprava pohřbu",
  "after-funeral": "Po pohřbu",
};
