/**
 * Pages CMS configuration (.pages.yml) generated from:
 *   - the editable-fields policy (docs/editable-fields.md §4, §5), encoded below,
 *   - the template manifest (`pageFields`, `imageSlots`),
 *   - the site features (`site.config.ts`) and the page files that exist.
 *
 * Every Pages CMS finding of the S2 spike (docs/spikes/pages-cms.md) is applied here:
 *   B3/A7  settings.content.merge: true, and every key of every list item is declared
 *          (merge does not protect keys inside list items); non-editable keys are `hidden: true`.
 *   B4     every date field has `default: ""` (otherwise the editor pre-fills today).
 *   B5/A3  selects offer every value the content may hold, incl. image `placeholder`.
 *   B6     boolean children of optional image objects default to null, selects have no default.
 *   B8     pages cannot be created, deleted or renamed; collections cannot be renamed.
 *   A4     familyOwned is a yes / no / unknown select.
 *   A5     two Actions: publish (content → main) and discard (main → content).
 * Image objects are expanded inline instead of using a shared `component`, because the spike could
 * not confirm that component overrides (`label`, `required`) work.
 */
import { Document } from "yaml";
import type { TemplateManifest } from "../../core/content/config.ts";

// ---------------------------------------------------------------------------
// Field model (subset of Pages CMS 2.1.8 lib/config-schema.ts that we use)
// ---------------------------------------------------------------------------

export interface CmsPattern {
  regex: string;
  message: string;
}

export interface CmsListOptions {
  min?: number;
  max?: number;
  collapsible: { collapsed: boolean; summary?: string };
}

export interface CmsField {
  name: string;
  label?: string;
  type: string;
  description?: string;
  required?: boolean;
  hidden?: boolean;
  default?: unknown;
  pattern?: CmsPattern;
  list?: boolean | CmsListOptions;
  options?: Record<string, unknown>;
  fields?: CmsField[];
}

export interface CmsOperations {
  create: boolean;
  delete: boolean;
  rename: boolean;
}

export interface CmsFileEntry {
  name: string;
  label: string;
  type: "file";
  path: string;
  format: "json" | "yaml-frontmatter";
  operations: CmsOperations;
  fields: CmsField[];
}

export interface CmsCollectionEntry {
  name: string;
  label: string;
  type: "collection";
  path: string;
  format: "yaml-frontmatter";
  filename: { template: string; field: boolean };
  operations: CmsOperations;
  view: { primary: string; fields: string[]; sort?: string[] };
  fields: CmsField[];
}

export interface CmsGroupEntry {
  name: string;
  label: string;
  type: "group";
  items: (CmsFileEntry | CmsCollectionEntry)[];
}

export type CmsContentEntry = CmsFileEntry | CmsCollectionEntry | CmsGroupEntry;

export interface CmsAction {
  name: string;
  label: string;
  workflow: string;
  ref: string;
  scope: string;
  confirm: boolean;
}

export interface PagesConfig {
  settings: {
    hide: boolean;
    content: { merge: boolean };
    commit: { identity: string; templates: Record<string, string> };
  };
  media: {
    name: string;
    label: string;
    input: string;
    output: string;
    extensions: string[];
    rename: string;
  };
  content: CmsContentEntry[];
  actions: CmsAction[];
}

export interface PagesConfigInput {
  manifest: TemplateManifest;
  features: { articles: boolean };
  /** Ids of the page files that exist in src/content/pages (e.g. "home", "o-nas"). */
  pageIds: readonly string[];
}

// ---------------------------------------------------------------------------
// Shared patterns and constants (mirror core/content/primitives.ts and schemas.ts)
// ---------------------------------------------------------------------------

const MEDIA_DIR = "src/assets/media";
const CONTENT_DIR = "src/content";
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const PHONE: CmsPattern = {
  regex: "^\\+[1-9]\\d{7,14}$",
  message: "Telefon zadejte ve tvaru +420123456789 (bez mezer).",
};
const TIME: CmsPattern = {
  regex: "^([01]\\d|2[0-3]):[0-5]\\d$",
  message: "Čas zadejte ve tvaru HH:MM, např. 07:00.",
};
const POSTAL_CODE: CmsPattern = { regex: "^\\d{3}\\s?\\d{2}$", message: "PSČ zadejte ve tvaru 123 45." };
const ICO: CmsPattern = { regex: "^\\d{8}$", message: "IČO má 8 číslic." };
const DIC: CmsPattern = { regex: "^CZ\\d{8,10}$", message: "DIČ zadejte ve tvaru CZ12345678." };
const EMAIL: CmsPattern = { regex: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message: "Zadejte platný e-mail." };
const HTTP_URL: CmsPattern = { regex: "^https?://\\S+$", message: "Zadejte celý odkaz včetně https://." };
const HTTPS_URL: CmsPattern = { regex: "^https://\\S+$", message: "Zadejte odkaz začínající https://." };

const NO_FILE_OPERATIONS: CmsOperations = { create: false, delete: false, rename: false };
const COLLECTION_OPERATIONS: CmsOperations = { create: true, delete: true, rename: false };

export const PLACEHOLDER_IMAGE_LABEL = "Zástupný obrázek – nezveřejňovat";
export const PUBLISH_WORKFLOW = "publish.yml";
export const DISCARD_WORKFLOW = "discard.yml";

/** Czech menu labels of the fixed pages (content-contract §5). */
export const PAGE_LABELS: Record<string, string> = {
  home: "Úvodní stránka",
  "jak-postupovat": "Jak postupovat",
  sluzby: "Služby",
  rakve: "Rakve",
  kvetiny: "Květiny",
  "o-nas": "O nás",
  kontakt: "Kontakt",
  cenik: "Ceník",
  "ochrana-osobnich-udaju": "Ochrana osobních údajů",
  clanky: "Články",
};

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

interface FieldOptions {
  required?: boolean;
  description?: string;
  max?: number;
  pattern?: CmsPattern;
  default?: unknown;
}

function scalar(type: string, name: string, label: string, options: FieldOptions = {}): CmsField {
  const field: CmsField = { name, label, type };
  if (options.required === true) {
    field.required = true;
  }
  if (options.description !== undefined) {
    field.description = options.description;
  }
  if (options.pattern !== undefined) {
    field.pattern = options.pattern;
  }
  if (options.max !== undefined) {
    field.options = { maxlength: options.max };
  }
  if (options.default !== undefined) {
    field.default = options.default;
  }
  return field;
}

function str(name: string, label: string, options: FieldOptions = {}): CmsField {
  return scalar("string", name, label, options);
}

function txt(name: string, label: string, options: FieldOptions = {}): CmsField {
  return scalar("text", name, label, options);
}

function bool(name: string, label: string, defaultValue?: boolean | null): CmsField {
  const field: CmsField = { name, label, type: "boolean" };
  if (defaultValue !== undefined) {
    field.default = defaultValue;
  }
  return field;
}

function wholeNumber(name: string, label: string, min: number, max: number, required = false): CmsField {
  const field: CmsField = { name, label, type: "number", options: { min, max, step: 1 } };
  if (required) {
    field.required = true;
  }
  return field;
}

/** B4: a date field without `default: ""` is pre-filled with today's date by the editor. */
function date(name: string, label: string, required = false): CmsField {
  const field: CmsField = { name, label, type: "date", default: "", options: { format: "yyyy-MM-dd" } };
  if (required) {
    field.required = true;
  }
  return field;
}

interface SelectValue {
  value: string;
  label: string;
}

function select(
  name: string,
  label: string,
  values: SelectValue[],
  options: { required?: boolean; multiple?: boolean; default?: string; description?: string } = {},
): CmsField {
  const fieldOptions: Record<string, unknown> = {};
  if (options.multiple === true) {
    fieldOptions.multiple = true;
    fieldOptions.min = 1;
  }
  fieldOptions.values = values;
  const field: CmsField = { name, label, type: "select", options: fieldOptions };
  if (options.required === true) {
    field.required = true;
  }
  if (options.default !== undefined) {
    field.default = options.default;
  }
  if (options.description !== undefined) {
    field.description = options.description;
  }
  return field;
}

/** A declared, invisible key: preserved on save (A7), never shown to the editor. */
function hidden(name: string, type: string, defaultValue?: unknown): CmsField {
  const field: CmsField = { name, type, hidden: true };
  if (defaultValue !== undefined) {
    field.default = defaultValue;
  }
  return field;
}

function hiddenPlaceholderFlag(): CmsField {
  return hidden("placeholder", "boolean", null);
}

function richText(name: string, label: string, description?: string): CmsField {
  const field: CmsField = {
    name,
    label,
    type: "rich-text",
    options: { format: "markdown", switcher: false, media: false },
  };
  if (description !== undefined) {
    field.description = description;
  }
  return field;
}

function hiddenBody(): CmsField {
  return {
    name: "body",
    type: "rich-text",
    hidden: true,
    options: { format: "markdown", switcher: false, media: false },
  };
}

function objectField(
  name: string,
  label: string,
  fields: CmsField[],
  extra: Partial<CmsField> = {},
): CmsField {
  return { name, label, type: "object", ...extra, fields };
}

function listOf(
  name: string,
  label: string,
  fields: CmsField[],
  list: CmsListOptions,
  extra: Partial<CmsField> = {},
): CmsField {
  return { name, label, type: "object", list, ...extra, fields };
}

function collapsed(summary?: string): CmsListOptions {
  if (summary === undefined) {
    return { collapsible: { collapsed: true } };
  }
  return { collapsible: { collapsed: true, summary } };
}

function makeHidden(field: CmsField): CmsField {
  const copy: CmsField = { ...field, hidden: true };
  delete copy.required;
  if (copy.fields !== undefined) {
    copy.fields = copy.fields.map(makeHidden);
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Images (editable-fields §4.10)
// ---------------------------------------------------------------------------

export const IMAGE_SOURCE_VALUES: SelectValue[] = [
  { value: "client", label: "Fotografie od firmy" },
  { value: "existing-website", label: "Z dosavadního webu firmy" },
  { value: "own-photo", label: "Vlastní fotografie" },
  { value: "licensed-stock", label: "Licencovaná fotografie" },
  { value: "placeholder", label: PLACEHOLDER_IMAGE_LABEL },
];

const IMAGE_DEPICTS_VALUES: SelectValue[] = [
  { value: "actual-business", label: "Ano, skutečné prostory, vůz nebo lidi" },
  { value: "generic", label: "Ne, obecná fotografie" },
  { value: "placeholder", label: "Zástupný obrázek" },
];

const IMAGE_FOCUS_VALUES: SelectValue[] = [
  { value: "center", label: "Střed" },
  { value: "top", label: "Nahoře" },
  { value: "bottom", label: "Dole" },
  { value: "left", label: "Vlevo" },
  { value: "right", label: "Vpravo" },
];

/**
 * An ImageRef object. Booleans default to null and selects have no default, so an untouched
 * optional image counts as empty and does not demand its required children (B6).
 * Invisible images keep every key declared but drop `required`, so they can never block a save.
 */
export function imageRef(name: string, label: string, visible: boolean): CmsField {
  const field = objectField(name, label, [
    {
      name: "file",
      label: "Fotografie",
      type: "image",
      required: true,
      description: "JPEG, PNG nebo WebP, nejlépe do 8 MB.",
      options: { media: "media", extensions: IMAGE_EXTENSIONS },
    },
    str("alt", "Popis obrázku (alt)", {
      required: true,
      max: 200,
      description: "Stručně popište, co je na fotografii. Příklad: Budova kanceláře s vchodem z ulice.",
    }),
    bool("decorative", "Obrázek je pouze dekorace", null),
    str("caption", "Popisek", { max: 240 }),
    str("credit", "Autor / zdroj fotografie", { max: 120 }),
    select("source", "Původ fotografie", IMAGE_SOURCE_VALUES, { required: true }),
    select("depicts", "Fotografie ukazuje skutečné prostory, vůz nebo lidi firmy", IMAGE_DEPICTS_VALUES, {
      required: true,
    }),
    bool("rightsConfirmed", "Mám právo tuto fotografii použít", null),
    select("focus", "Výřez fotografie", IMAGE_FOCUS_VALUES),
  ]);
  if (visible) {
    return field;
  }
  return makeHidden(field);
}

/** True when the manifest declares an image slot whose key starts with `<prefix>.`. */
export function hasSlotPrefix(manifest: TemplateManifest, prefix: string): boolean {
  return Object.keys(manifest.imageSlots).some((slot) => slot.startsWith(`${prefix}.`));
}

/** True when the manifest declares a page image slot for this page and field. */
export function hasPageImageSlot(manifest: TemplateManifest, pageId: string, field: string): boolean {
  return Object.values(manifest.imageSlots).some((slot) => slot.page === pageId && slot.field === field);
}

// ---------------------------------------------------------------------------
// Singletons (src/content/site/*.json)
// ---------------------------------------------------------------------------

function jsonFile(name: string, label: string, file: string, fields: CmsField[]): CmsFileEntry {
  return {
    name,
    label,
    type: "file",
    path: `${CONTENT_DIR}/site/${file}`,
    format: "json",
    operations: NO_FILE_OPERATIONS,
    fields,
  };
}

function addressFields(): CmsField[] {
  return [
    str("street", "Ulice a číslo", { required: true, max: 120 }),
    str("city", "Obec", { required: true, max: 80 }),
    str("postalCode", "PSČ", { required: true, pattern: POSTAL_CODE }),
    hidden("country", "string", "CZ"),
  ];
}

/** §4.4: the nonstop transport is its own menu entry, never part of contact or office hours. */
function emergencyEntry(): CmsFileEntry {
  return jsonFile("emergency", "Nonstop převoz zesnulých", "emergency.json", [
    str("phone", "Telefon", {
      required: true,
      pattern: PHONE,
      description: "Číslo pro nonstop převoz zesnulých. Nejde o kancelář.",
    }),
    txt("shortNote", "Krátká poznámka", { max: 160 }),
    txt("serviceArea", "Oblast, kde převoz zajišťujete", { max: 160 }),
    hidden("enabled", "boolean", true),
    hidden("label", "string", "Nonstop převoz zesnulých"),
    hidden("availability", "string", "24/7"),
  ]);
}

function companyEntry(): CmsFileEntry {
  return jsonFile("company", "Firma", "company.json", [
    str("brandName", "Název značky", { required: true, max: 80 }),
    str("legalName", "Obchodní jméno", { required: true, max: 120 }),
    objectField("legalIds", "Údaje o firmě", [
      str("ico", "IČO", { pattern: ICO }),
      str("dic", "DIČ", { pattern: DIC }),
      str("registryEntry", "Zápis v obchodním rejstříku", { max: 200 }),
      objectField("registeredOffice", "Sídlo", addressFields()),
    ]),
    objectField("tradition", "Tradice firmy", [
      str("publicWording", "Text o tradici firmy (bez vymýšlení letopočtů)", { max: 120 }),
      wholeNumber("foundedYear", "Rok založení (jen pokud jej znáte jistě)", 1800, 2100),
    ]),
    select(
      "familyOwned",
      "Rodinná firma",
      [
        { value: "yes", label: "Ano" },
        { value: "no", label: "Ne" },
        { value: "unknown", label: "Neuvádět" },
      ],
      { default: "unknown" },
    ),
    // editable-fields §4.1: the logo is always editable; templates without a logo slot show a wordmark.
    imageRef("logo", "Logo", true),
  ]);
}

function contactEntry(): CmsFileEntry {
  return jsonFile("contact", "Kontakt", "contact.json", [
    // §4.2: one location in the pilot (multipleLocations: false), so min = max = 1.
    listOf(
      "locations",
      "Kancelář",
      [
        hidden("id", "string"),
        str("name", "Název pracoviště", { required: true, max: 80 }),
        objectField("address", "Adresa", addressFields(), { required: true }),
        // Coordinates are agent-only (§4.2) but must be declared so the list item keeps them.
        {
          name: "geo",
          type: "object",
          hidden: true,
          fields: [hidden("lat", "number"), hidden("lng", "number")],
        },
        str("mapUrl", "Odkaz na mapu", { pattern: HTTP_URL }),
        txt("accessNote", "Poznámka k příjezdu a parkování", { max: 400 }),
      ],
      { min: 1, max: 1, collapsible: { collapsed: false } },
    ),
    listOf(
      "phones",
      "Telefony",
      [
        hidden("id", "string"),
        str("label", "Popisek", { required: true, max: 60 }),
        str("number", "Telefon", {
          required: true,
          pattern: PHONE,
          description: "Ve tvaru +420123456789, bez mezer.",
        }),
        {
          name: "department",
          type: "select",
          hidden: true,
          default: "office",
          options: { values: ["office", "flowers", "other"] },
        },
        hidden("locationId", "string"),
      ],
      { min: 1, ...collapsed("{fields.label}") },
    ),
    listOf(
      "emails",
      "E-maily",
      [
        hidden("id", "string"),
        str("label", "Popisek", { required: true, max: 60 }),
        str("address", "E-mailová adresa", { required: true, pattern: EMAIL }),
      ],
      collapsed("{fields.label}"),
    ),
  ]);
}

const DAY_VALUES: SelectValue[] = [
  { value: "mon", label: "Pondělí" },
  { value: "tue", label: "Úterý" },
  { value: "wed", label: "Středa" },
  { value: "thu", label: "Čtvrtek" },
  { value: "fri", label: "Pátek" },
  { value: "sat", label: "Sobota" },
  { value: "sun", label: "Neděle" },
];

/** §4.3: office hours only; the emergency line is a separate entry. */
function officeHoursEntry(): CmsFileEntry {
  return jsonFile("office-hours", "Otevírací doba kanceláře", "office-hours.json", [
    hidden("locationId", "string"),
    str("label", "Nadpis", { required: true, max: 60 }),
    listOf(
      "weekly",
      "Pravidelná otevírací doba",
      [
        hidden("id", "string"),
        select("days", "Dny", DAY_VALUES, { required: true, multiple: true }),
        str("open", "Od (HH:MM)", { required: true, pattern: TIME }),
        str("close", "Do (HH:MM)", { required: true, pattern: TIME }),
        listOf(
          "breaks",
          "Přestávky",
          [
            str("from", "Od (HH:MM)", { required: true, pattern: TIME }),
            str("to", "Do (HH:MM)", { required: true, pattern: TIME }),
          ],
          collapsed(),
        ),
      ],
      { collapsible: { collapsed: false } },
      { description: "Jen doba kanceláře. Nonstop převoz zesnulých je samostatná položka v menu." },
    ),
    txt("holidayNote", "Poznámka ke svátkům", { max: 200 }),
    listOf(
      "exceptions",
      "Výjimky (např. vánoční zavření)",
      [
        date("from", "Od", true),
        date("to", "Do", true),
        bool("closed", "Zavřeno"),
        str("open", "Otevřeno od (HH:MM)", { pattern: TIME }),
        str("close", "Otevřeno do (HH:MM)", { pattern: TIME }),
        str("note", "Poznámka", { max: 160 }),
      ],
      collapsed("{fields.note}"),
    ),
    txt("outsideHoursNote", "Poznámka mimo otevírací dobu", { max: 200 }),
  ]);
}

/** §4.9: demo/approved status select; currency locked (hidden). */
function pricingEntry(): CmsFileEntry {
  return jsonFile("pricing", "Ceník", "pricing.json", [
    bool("visible", "Zobrazit ceník na webu"),
    hidden("currency", "string", "CZK"),
    str("vatNote", "Poznámka k DPH", { max: 120 }),
    date("validFrom", "Ceník platí od"),
    txt("generalNote", "Obecná poznámka", { max: 400 }),
    listOf(
      "groups",
      "Skupiny cen",
      [
        hidden("id", "string"),
        str("title", "Název skupiny", { required: true, max: 80 }),
        txt("description", "Popis skupiny", { max: 240 }),
        listOf(
          "items",
          "Položky",
          [
            hidden("id", "string"),
            str("label", "Název položky", { required: true, max: 100 }),
            txt("description", "Popis", { max: 240 }),
            select(
              "kind",
              "Druh ceny",
              [
                { value: "fixed", label: "Pevná cena" },
                { value: "from", label: "Cena od" },
                { value: "range", label: "Rozpětí" },
                { value: "on-request", label: "Na dotaz (bez částky)" },
              ],
              { required: true },
            ),
            {
              ...wholeNumber("amount", "Částka v Kč (celé číslo)", 0, 2_000_000),
              description: "U druhu 'Na dotaz' nechte prázdné. U rozpětí je to dolní mez.",
            },
            wholeNumber("amountMax", "Horní mez v Kč (jen u rozpětí)", 0, 2_000_000),
            str("unit", "Jednotka (např. za km)", { max: 30 }),
            select(
              "status",
              "Stav ceny",
              [
                { value: "demo", label: "Ukázková – nezveřejňovat" },
                { value: "approved", label: "Schválená skutečná cena" },
              ],
              {
                required: true,
                default: "demo",
                description: "Na webu se zveřejní jen ceník, ve kterém jsou všechny ceny schválené.",
              },
            ),
          ],
          { min: 1, ...collapsed("{fields.label}") },
          { required: true },
        ),
      ],
      collapsed("{fields.title}"),
    ),
  ]);
}

// ---------------------------------------------------------------------------
// Pages (§4.5): one file entry per page, so each page shows only the template's pageFields
// ---------------------------------------------------------------------------

export const PAGE_FIELD_NAMES = [
  "title",
  "navLabel",
  "lead",
  "excerpt",
  "metaTitle",
  "metaDescription",
  "heroImage",
  "secondaryImage",
  "body",
] as const;

function pageField(name: (typeof PAGE_FIELD_NAMES)[number], visible: boolean): CmsField {
  let field: CmsField;
  if (name === "title") {
    field = str("title", "Nadpis stránky", { required: true, max: 70 });
  } else if (name === "navLabel") {
    field = str("navLabel", "Název v menu", { required: true, max: 24 });
  } else if (name === "lead") {
    field = txt("lead", "Úvodní odstavec", { max: 400 });
  } else if (name === "excerpt") {
    field = txt("excerpt", "Krátký výtah pro jiné stránky", { max: 400 });
  } else if (name === "metaTitle") {
    field = str("metaTitle", "Titulek pro vyhledávače", { max: 60 });
  } else if (name === "metaDescription") {
    field = txt("metaDescription", "Popis pro vyhledávače", { required: true, max: 160 });
  } else if (name === "heroImage") {
    return imageRef("heroImage", "Hlavní obrázek", visible);
  } else if (name === "secondaryImage") {
    return imageRef("secondaryImage", "Další obrázek", visible);
  } else {
    if (!visible) {
      return hiddenBody();
    }
    return richText(
      "body",
      "Text stránky",
      "Nadpisy používejte od druhé úrovně. Telefonní čísla sem nepište, berou se z Kontaktu.",
    );
  }
  if (visible) {
    return field;
  }
  return makeHidden(field);
}

function isPageFieldVisible(manifest: TemplateManifest, pageId: string, name: string): boolean {
  const declared = manifest.pageFields[pageId] ?? [];
  if (!declared.includes(name)) {
    return false;
  }
  if (name === "heroImage" || name === "secondaryImage") {
    return hasPageImageSlot(manifest, pageId, name);
  }
  return true;
}

function pageEntries(
  manifest: TemplateManifest,
  pageIds: readonly string[],
  articles: boolean,
): CmsFileEntry[] {
  const entries: CmsFileEntry[] = [];
  for (const pageId of Object.keys(PAGE_LABELS)) {
    if (!pageIds.includes(pageId)) {
      continue;
    }
    if (pageId === "clanky" && !articles) {
      continue;
    }
    if (manifest.pageFields[pageId] === undefined) {
      continue;
    }
    entries.push({
      name: `page-${pageId}`,
      label: `Stránka: ${PAGE_LABELS[pageId] as string}`,
      type: "file",
      path: `${CONTENT_DIR}/pages/${pageId}.md`,
      format: "yaml-frontmatter",
      operations: NO_FILE_OPERATIONS,
      fields: [
        ...PAGE_FIELD_NAMES.map((name) => pageField(name, isPageFieldVisible(manifest, pageId, name))),
        hiddenPlaceholderFlag(),
      ],
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Collections (§4.6–§4.8, articles only when the feature is on)
// ---------------------------------------------------------------------------

function collection(
  name: string,
  label: string,
  view: CmsCollectionEntry["view"],
  fields: CmsField[],
): CmsCollectionEntry {
  return {
    name,
    label,
    type: "collection",
    path: `${CONTENT_DIR}/${name}`,
    format: "yaml-frontmatter",
    // A6: file names come from the slugified primary field; editors cannot type them.
    filename: { template: "{primary}.md", field: false },
    operations: COLLECTION_OPERATIONS,
    view,
    fields,
  };
}

function order(required = false): CmsField {
  return wholeNumber("order", "Pořadí", 0, 999, required);
}

function servicesCollection(manifest: TemplateManifest): CmsCollectionEntry {
  return collection(
    "services",
    "Služby",
    { primary: "title", fields: ["title", "category", "published"], sort: ["order", "title"] },
    [
      str("title", "Název služby", { required: true, max: 80 }),
      txt("summary", "Krátký popis", { required: true, max: 240 }),
      select(
        "category",
        "Kategorie",
        [
          { value: "ceremony", label: "Obřad" },
          { value: "transport", label: "Převoz" },
          { value: "arrangements", label: "Zařízení pohřbu" },
          { value: "cremation", label: "Kremace" },
          { value: "memorial", label: "Vzpomínka" },
          { value: "other", label: "Jiné" },
        ],
        { required: true },
      ),
      order(),
      bool("featured", "Zobrazit na úvodní stránce"),
      bool("published", "Zveřejnit", true),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "service")),
      hidden("priceGroupId", "string"),
      hiddenPlaceholderFlag(),
      richText(
        "body",
        "Podrobný text",
        "Telefonní čísla sem nepište, berou se z Kontaktu a z Nonstop převozu.",
      ),
    ],
  );
}

function guidanceCollection(): CmsCollectionEntry {
  return collection(
    "guidance",
    "Jak postupovat",
    { primary: "title", fields: ["title", "phase"], sort: ["order", "title"] },
    [
      str("title", "Nadpis kroku", { required: true, max: 90 }),
      txt("summary", "Shrnutí", { required: true, max: 240 }),
      select(
        "phase",
        "Fáze",
        [
          { value: "first-hours", label: "První hodiny" },
          { value: "first-days", label: "První dny" },
          { value: "arrangements", label: "Zařízení pohřbu" },
          { value: "after-funeral", label: "Po pohřbu" },
        ],
        { required: true },
      ),
      select(
        "situations",
        "Situace",
        [
          { value: "any", label: "Jakákoli" },
          { value: "home", label: "Doma" },
          { value: "hospital", label: "V nemocnici" },
          { value: "care-home", label: "V zařízení péče" },
          { value: "abroad", label: "V zahraničí" },
        ],
        { required: true, multiple: true },
      ),
      order(true),
      select("contactPrompt", "Odkaz na kontakt", [
        { value: "emergency", label: "Nonstop převoz" },
        { value: "office", label: "Kancelář" },
        { value: "none", label: "Žádný" },
      ]),
      {
        name: "checklist",
        label: "Co si připravit",
        type: "string",
        list: collapsed(),
        options: { maxlength: 160 },
      },
      objectField(
        "review",
        "Odborná kontrola",
        [
          str("reviewedBy", "Zkontroloval(a)", { max: 80 }),
          date("reviewedAt", "Datum kontroly"),
          listOf(
            "sources",
            "Zdroje",
            [
              str("title", "Název zdroje", { required: true, max: 120 }),
              str("url", "Odkaz", { required: true, pattern: HTTPS_URL }),
            ],
            collapsed("{fields.title}"),
          ),
        ],
        { description: "Odborný obsah – po změně nechte text zkontrolovat." },
      ),
      bool("published", "Zveřejnit", true),
      hiddenPlaceholderFlag(),
      richText("body", "Text kroku", "Odborný obsah – po změně nechte text zkontrolovat."),
    ],
  );
}

function coffinsCollection(manifest: TemplateManifest): CmsCollectionEntry {
  return collection(
    "coffins",
    "Rakve",
    { primary: "name", fields: ["name", "code", "published"], sort: ["order", "name"] },
    [
      str("name", "Název", { required: true, max: 80 }),
      str("code", "Kód v katalogu", { max: 40 }),
      str("material", "Materiál", { max: 120 }),
      txt("summary", "Popis", { required: true, max: 400 }),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "coffin")),
      order(),
      bool("published", "Zveřejnit", true),
      hiddenPlaceholderFlag(),
      hiddenBody(),
    ],
  );
}

function flowersCollection(manifest: TemplateManifest): CmsCollectionEntry {
  return collection(
    "flowers",
    "Květiny",
    { primary: "title", fields: ["title", "type", "published"], sort: ["order", "title"] },
    [
      str("title", "Název", { required: true, max: 80 }),
      select(
        "type",
        "Druh",
        [
          { value: "wreath", label: "Věnec" },
          { value: "spray", label: "Kytice" },
          { value: "bouquet", label: "Smuteční kytice" },
          { value: "urn-arrangement", label: "Aranžmá k urně" },
          { value: "other", label: "Jiné" },
        ],
        { required: true },
      ),
      txt("summary", "Popis", { max: 300 }),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "flower")),
      order(),
      bool("published", "Zveřejnit", true),
      hiddenPlaceholderFlag(),
      hiddenBody(),
    ],
  );
}

function articlesCollection(manifest: TemplateManifest): CmsCollectionEntry {
  return collection(
    "articles",
    "Články",
    { primary: "title", fields: ["title", "publishedAt", "draft"], sort: ["publishedAt"] },
    [
      str("title", "Nadpis článku", { required: true, max: 100 }),
      txt("summary", "Shrnutí", { required: true, max: 240 }),
      date("publishedAt", "Datum zveřejnění", true),
      date("updatedAt", "Datum aktualizace"),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "article")),
      bool("draft", "Koncept (nezveřejňovat)", true),
      hiddenPlaceholderFlag(),
      richText("body", "Text článku", "Telefonní čísla sem nepište, berou se z Kontaktu."),
    ],
  );
}

// ---------------------------------------------------------------------------
// Whole config
// ---------------------------------------------------------------------------

export function generatePagesConfig(input: PagesConfigInput): PagesConfig {
  const { manifest, features, pageIds } = input;
  const articles = features.articles && manifest.supports.articles;
  const content: CmsContentEntry[] = [
    emergencyEntry(),
    {
      name: "contact-group",
      label: "Firma a kontakt",
      type: "group",
      items: [companyEntry(), contactEntry(), officeHoursEntry()],
    },
    pricingEntry(),
    { name: "pages", label: "Texty stránek", type: "group", items: pageEntries(manifest, pageIds, articles) },
    servicesCollection(manifest),
    guidanceCollection(),
    coffinsCollection(manifest),
    flowersCollection(manifest),
  ];
  if (articles) {
    content.push(articlesCollection(manifest));
  }
  return {
    settings: {
      hide: true,
      content: { merge: true },
      commit: {
        identity: "user",
        templates: {
          create: "Obsah: vytvořeno {path} (Pages CMS)",
          update: "Obsah: upraveno {path} (Pages CMS)",
          delete: "Obsah: smazáno {path} (Pages CMS)",
        },
      },
    },
    media: {
      name: "media",
      label: "Obrázky",
      input: MEDIA_DIR,
      // Equal to input: the stored value is src/assets/media/<file>, which core normalises to <file>.
      output: MEDIA_DIR,
      extensions: IMAGE_EXTENSIONS,
      rename: "safe",
    },
    content,
    // A5: the editor works on `content`; these Actions dispatch workflows on the current branch.
    actions: [
      {
        name: "publish",
        label: "Zveřejnit změny",
        workflow: PUBLISH_WORKFLOW,
        ref: "current",
        scope: "repo",
        confirm: true,
      },
      {
        name: "discard",
        label: "Zahodit nepublikované změny",
        workflow: DISCARD_WORKFLOW,
        ref: "current",
        scope: "repo",
        confirm: true,
      },
    ],
  };
}

export interface RenderOptions {
  templateId: string;
  templateVersion: string;
}

export function renderPagesYaml(config: PagesConfig, options: RenderOptions): string {
  const document = new Document(config, { aliasDuplicateObjects: false });
  document.commentBefore = [
    ` Pages CMS configuration, generated for template ${options.templateId} ${options.templateVersion}.`,
    " Vygenerováno při exportu webu. Neupravujte ručně: pole odpovídají pravidlům šablony a obsahu,",
    " a nepromyšlená změna může smazat data při uložení. Změny konzultujte s vývojářem.",
    ' Publishing: the editor saves to branch `content`; the Action "Zveřejnit změny" runs',
    " .github/workflows/publish.yml, which builds in production mode and only then updates `main`.",
  ].join("\n");
  return document.toString({ lineWidth: 0 });
}
