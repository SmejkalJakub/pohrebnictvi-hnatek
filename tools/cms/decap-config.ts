/**
 * Decap CMS configuration (public/admin/config.yml) generated from:
 *   - the editable-fields policy (docs/editable-fields.md §4, §5), encoded below,
 *   - the template manifest (`pageFields`, `imageSlots`, `supports`),
 *   - the site features (`site.config.ts`) and the page files that exist,
 *   - the client's publishing settings (repository, DecapBridge site), see ./settings.ts.
 *
 * Decap rules applied here (docs/cms-decap/architecture.md §4):
 *   - Decap fields are required by default, so every field states `required` explicitly.
 *   - Every key the content may hold is declared. Keys the editor must not change are `hidden`
 *     widgets: Decap keeps their value on save and never shows them.
 *   - Fields inside image objects are never required in the editor: an optional image that was left
 *     empty must not block a save. The schema and the publication gate enforce alt text and rights.
 *   - Every date field has `default: ""`, so the editor never pre-fills today's date.
 *   - Fixed pages are a `files` collection (no create, no delete); collections get stable file names
 *     from the title at creation and are never renamed afterwards.
 *   - Rich text offers only the restricted Markdown of content-contract §7.3: no images, no code, no
 *     raw mode.
 */
import { Document } from "yaml";
import type { ContentFeature, TemplateManifest } from "../../core/content/config.ts";
import { PLACEHOLDER_VALUE, type ResolvedPublishingSettings } from "./settings.ts";

// ---------------------------------------------------------------------------
// Decap field model (the subset of Decap CMS 3.x widgets that we use)
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
}

export interface DecapField {
  name: string;
  label?: string;
  widget: string;
  required: boolean;
  hint?: string;
  default?: unknown;
  pattern?: [string, string];
  options?: SelectOption[];
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value_type?: "int";
  format?: string;
  date_format?: string;
  time_format?: boolean;
  picker_utc?: boolean;
  fields?: DecapField[];
  field?: DecapField;
  summary?: string;
  collapsed?: boolean;
  allow_add?: boolean;
  buttons?: string[];
  editor_components?: string[];
  modes?: string[];
  sanitize_preview?: boolean;
  choose_url?: boolean;
  media_folder?: string;
  public_folder?: string;
}

export interface DecapFile {
  name: string;
  label: string;
  file: string;
  fields: DecapField[];
}

interface CollectionCommon {
  name: string;
  label: string;
  label_singular?: string;
  description?: string;
  editor: { preview: false };
}

export interface DecapFilesCollection extends CollectionCommon {
  files: DecapFile[];
}

export interface DecapFolderCollection extends CollectionCommon {
  folder: string;
  extension: "md";
  format: "frontmatter";
  create: boolean;
  delete: boolean;
  slug: string;
  identifier_field: string;
  summary: string;
  sortable_fields: string[];
  fields: DecapField[];
}

export type DecapCollection = DecapFilesCollection | DecapFolderCollection;

export interface DecapBackend {
  name: "git-gateway";
  repo: string;
  branch: string;
  identity_url?: string;
  auth_type?: "pkce";
  base_url?: string;
  auth_endpoint?: string;
  auth_token_endpoint?: string;
  gateway_url: string;
  commit_messages: Record<string, string>;
}

export interface DecapConfig {
  backend: DecapBackend;
  /** Only used when the admin runs on localhost and `npx decap-server` is running (agency QA). */
  local_backend: true;
  publish_mode: "simple";
  locale: "cs";
  site_url?: string;
  display_url?: string;
  show_preview_links: false;
  media_folder: string;
  public_folder: string;
  slug: { encoding: "ascii"; clean_accents: true; sanitize_replacement: "-" };
  collections: DecapCollection[];
}

export interface DecapConfigInput {
  manifest: TemplateManifest;
  /** site.config features; the optional content types default to off. */
  features: { articles: boolean } & Partial<Record<ContentFeature, boolean>>;
  /** Ids of the page files that exist in src/content/pages (e.g. "home", "o-nas"). */
  pageIds: readonly string[];
  /** True when src/content/site/legal.json exists. */
  legal?: boolean;
  /** site.config siteUrl; omitted from the CMS while it is the example.invalid placeholder. */
  siteUrl?: string;
  publishing: ResolvedPublishingSettings;
}

// ---------------------------------------------------------------------------
// Shared constants (mirror core/content/primitives.ts and schemas.ts)
// ---------------------------------------------------------------------------

export const CONTENT_DIR = "src/content";
export const MEDIA_DIR = "src/assets/media";
export const DOCUMENTS_DIR = "src/assets/documents";
/**
 * Relative on purpose. Decap stores "src/assets/media/<file>" (core/media/normalize.ts reduces it to
 * "<file>"), and a relative public folder makes Decap load thumbnails of existing images through the
 * Git backend. With "/src/assets/media" it requests that URL from the website, where Astro has
 * already turned the originals into /_astro/ files, so every existing image showed as broken.
 * Bare names written before the CMS ("foto.jpg") resolve the same way (tested in Decap 3.17.3).
 */
export const MEDIA_PUBLIC_FOLDER = MEDIA_DIR;
export const CONTENT_BRANCH = "content";
export const PRODUCTION_BRANCH = "main";
/**
 * The editor's "Zveřejnit změny" entry (docs/cms/publishing.md §2). Saving it commits this file to
 * `content`, and a push that changes it starts publish.yml (integrity check, gate, production deploy,
 * fast-forward of `main`). Content path on purpose: the CMS token needs no Actions permission, and
 * no Astro collection or gate rule reads src/content/publish/.
 */
export const PUBLISH_COLLECTION = "zverejneni";
export const PUBLISH_REQUEST_FILE = `${CONTENT_DIR}/publish/request.json`;

const PHONE: [string, string] = [
  "^\\+[1-9]\\d{7,14}$",
  "Telefon zadejte ve tvaru +420123456789 (bez mezer).",
];
const TIME: [string, string] = ["^([01]\\d|2[0-3]):[0-5]\\d$", "Čas zadejte ve tvaru HH:MM, např. 07:00."];
const POSTAL_CODE: [string, string] = ["^\\d{3}\\s?\\d{2}$", "PSČ zadejte ve tvaru 123 45."];
const ICO: [string, string] = ["^\\d{8}$", "IČO má 8 číslic."];
const DIC: [string, string] = ["^CZ\\d{8,10}$", "DIČ zadejte ve tvaru CZ12345678."];
const EMAIL: [string, string] = ["^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", "Zadejte platný e-mail."];
const HTTP_URL: [string, string] = ["^https?://\\S+$", "Zadejte celý odkaz včetně https://."];
const HTTPS_URL: [string, string] = ["^https://\\S+$", "Zadejte odkaz začínající https://."];
const YEAR_OR_DATE: [string, string] = [
  "^\\d{4}(-\\d{2}-\\d{2})?$",
  "Zadejte rok (RRRR) nebo datum (RRRR-MM-DD).",
];

export const PLACEHOLDER_IMAGE_LABEL = "Zástupný obrázek – nezveřejňovat";
export const EXPERT_CONTENT_HINT = "Odborný obsah – po změně nechte text zkontrolovat.";

/** Restricted Markdown (content-contract §7.3): no images, code blocks, raw HTML or H1. */
export const MARKDOWN_BUTTONS = [
  "bold",
  "italic",
  "link",
  "heading-two",
  "heading-three",
  "heading-four",
  "bulleted-list",
  "numbered-list",
  "quote",
];

/** Czech menu labels of the fixed pages (content-contract §5). */
export const PAGE_LABELS: Record<string, string> = {
  home: "Úvodní stránka",
  "o-nas": "O nás",
  sluzby: "Služby",
  "jak-postupovat": "Jak postupovat",
  kontakt: "Kontakt",
  cenik: "Ceník",
  rakve: "Rakve",
  kvetiny: "Květiny",
  "ochrana-osobnich-udaju": "Ochrana osobních údajů",
  clanky: "Články",
  oznameni: "Oznámení a obřady",
  "pro-ucastniky": "Pro účastníky pohřbu",
  "pohreb-predem": "Pohřeb předem",
  "pravni-informace": "Právní informace",
};

/** Pages that exist only while their feature is on (mirrors core/gate/visibility.ts FEATURE_PAGES). */
const FEATURE_PAGE_IDS: Record<string, ContentFeature> = {
  oznameni: "notices",
  "pro-ucastniky": "guestInfo",
  "pohreb-predem": "prePlanning",
};

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

interface FieldOptions {
  required?: boolean;
  hint?: string;
  max?: number;
  pattern?: [string, string];
  default?: unknown;
}

/** Decap has no max length for strings; a pattern gives the same early feedback. */
function lengthPattern(max: number): [string, string] {
  return [`^[\\s\\S]{0,${max}}$`, `Maximálně ${max} znaků.`];
}

function scalar(widget: string, name: string, label: string, options: FieldOptions = {}): DecapField {
  const field: DecapField = { name, label, widget, required: options.required === true };
  if (options.hint !== undefined) {
    field.hint = options.hint;
  }
  if (options.pattern !== undefined) {
    field.pattern = options.pattern;
  } else if (options.max !== undefined) {
    field.pattern = lengthPattern(options.max);
  }
  if (options.default !== undefined) {
    field.default = options.default;
  }
  return field;
}

function str(name: string, label: string, options: FieldOptions = {}): DecapField {
  return scalar("string", name, label, options);
}

function txt(name: string, label: string, options: FieldOptions = {}): DecapField {
  return scalar("text", name, label, options);
}

function bool(name: string, label: string, options: { default?: boolean; hint?: string } = {}): DecapField {
  const field: DecapField = { name, label, widget: "boolean", required: false };
  if (options.default !== undefined) {
    field.default = options.default;
  }
  if (options.hint !== undefined) {
    field.hint = options.hint;
  }
  return field;
}

function wholeNumber(
  name: string,
  label: string,
  min: number,
  max: number,
  options: { required?: boolean; hint?: string } = {},
): DecapField {
  const required = options.required === true;
  const field: DecapField = { name, label, widget: "number", required, value_type: "int", step: 1 };
  // Decap 3.17 reports an empty (null) number as outside min/max even when the field is optional,
  // which would block saving an untouched file. Optional numbers therefore state the range in the
  // hint only; the schema enforces it at build time.
  if (required) {
    field.min = min;
    field.max = max;
  }
  const range = `Celé číslo od ${min} do ${max}.`;
  if (options.hint !== undefined) {
    field.hint = `${options.hint} ${range}`;
  } else if (!required) {
    field.hint = range;
  }
  return field;
}

/** A date stored as RRRR-MM-DD. `default: ""` keeps the editor from pre-filling today's date. */
function date(name: string, label: string, required = false): DecapField {
  return {
    name,
    label,
    widget: "datetime",
    required,
    default: "",
    format: "YYYY-MM-DD",
    date_format: "D. M. YYYY",
    time_format: false,
    picker_utc: true,
  };
}

function select(
  name: string,
  label: string,
  options: SelectOption[],
  extra: { required?: boolean; multiple?: boolean; default?: string; hint?: string } = {},
): DecapField {
  const field: DecapField = { name, label, widget: "select", required: extra.required === true, options };
  if (extra.multiple === true) {
    field.multiple = true;
    field.min = 1;
  }
  if (extra.default !== undefined) {
    field.default = extra.default;
  }
  if (extra.hint !== undefined) {
    field.hint = extra.hint;
  }
  return field;
}

/** A declared, invisible key: kept as it is on save, never shown to the editor. */
export function hidden(name: string, defaultValue?: string): DecapField {
  const field: DecapField = { name, widget: "hidden", required: false };
  if (defaultValue !== undefined) {
    field.default = defaultValue;
  }
  return field;
}

function richText(name: string, label: string, hint?: string): DecapField {
  const field: DecapField = {
    name,
    label,
    widget: "markdown",
    required: false,
    buttons: MARKDOWN_BUTTONS,
    editor_components: [],
    modes: ["rich_text"],
    sanitize_preview: true,
  };
  if (hint !== undefined) {
    field.hint = hint;
  }
  return field;
}

function objectField(
  name: string,
  label: string,
  fields: DecapField[],
  extra: { hint?: string; collapsed?: boolean } = {},
): DecapField {
  const field: DecapField = { name, label, widget: "object", required: false, fields };
  if (extra.hint !== undefined) {
    field.hint = extra.hint;
  }
  if (extra.collapsed !== undefined) {
    field.collapsed = extra.collapsed;
  }
  return field;
}

function listOf(
  name: string,
  label: string,
  fields: DecapField[],
  extra: {
    summary?: string;
    min?: number;
    max?: number;
    allowAdd?: boolean;
    hint?: string;
    collapsed?: boolean;
  } = {},
): DecapField {
  const field: DecapField = {
    name,
    label,
    widget: "list",
    required: extra.min !== undefined && extra.min > 0,
    collapsed: extra.collapsed ?? true,
    fields,
  };
  if (extra.summary !== undefined) {
    field.summary = extra.summary;
  }
  if (extra.min !== undefined) {
    field.min = extra.min;
  }
  if (extra.max !== undefined) {
    field.max = extra.max;
  }
  if (extra.allowAdd === false) {
    field.allow_add = false;
  }
  if (extra.hint !== undefined) {
    field.hint = extra.hint;
  }
  return field;
}

/** A list of short strings, or a hidden key when the template does not render it. */
function stringList(name: string, label: string, max: number, visible: boolean): DecapField {
  if (!visible) {
    return hidden(name);
  }
  return {
    name,
    label,
    widget: "list",
    required: false,
    collapsed: true,
    field: str("item", "Položka", { required: true, max }),
  };
}

// ---------------------------------------------------------------------------
// Images (editable-fields §4.10)
// ---------------------------------------------------------------------------

export const IMAGE_SOURCE_OPTIONS: SelectOption[] = [
  { value: "client", label: "Fotografie od firmy" },
  { value: "existing-website", label: "Z dosavadního webu firmy" },
  { value: "own-photo", label: "Vlastní fotografie" },
  { value: "licensed-stock", label: "Licencovaná fotografie" },
  { value: "placeholder", label: PLACEHOLDER_IMAGE_LABEL },
];

const IMAGE_DEPICTS_OPTIONS: SelectOption[] = [
  { value: "actual-business", label: "Ano, skutečné prostory, vůz nebo lidi" },
  { value: "generic", label: "Ne, obecná fotografie" },
  { value: "placeholder", label: "Zástupný obrázek" },
];

const IMAGE_FOCUS_OPTIONS: SelectOption[] = [
  { value: "center", label: "Střed" },
  { value: "top", label: "Nahoře" },
  { value: "bottom", label: "Dole" },
  { value: "left", label: "Vlevo" },
  { value: "right", label: "Vpravo" },
];

/**
 * An ImageRef object. Nothing inside is required in the editor, so an optional image left empty
 * never blocks a save; core treats an image object without a file as "no image", and the
 * publication gate requires alt text, origin and the rights confirmation (G-030 to G-034).
 * `rightsConfirmed` has no default: the editor must tick it, it is never pre-set to true. Decap keeps
 * the other keys when the photo is replaced, so the admin page records which file a confirmation
 * belongs to (`rightsConfirmedFor`) and clears it when the file changes (admin-index.html.tpl).
 */
export function imageRef(name: string, label: string, visible: boolean): DecapField {
  if (!visible) {
    return hidden(name);
  }
  return objectField(
    name,
    label,
    [
      {
        name: "file",
        label: "Fotografie",
        widget: "image",
        required: false,
        choose_url: false,
        hint: "JPEG, PNG nebo WebP, nejlépe do 8 MB. Velikost se upraví automaticky. Po výměně fotografie upravte popis a původ a práva k ní potvrďte znovu.",
      },
      str("alt", "Popis obrázku (alt)", {
        max: 200,
        hint: "Stručně popište, co je na fotografii. Příklad: Budova kanceláře s vchodem z ulice. Povinné, pokud obrázek není jen dekorace.",
      }),
      bool("decorative", "Obrázek je pouze dekorace"),
      str("caption", "Popisek", { max: 240 }),
      str("credit", "Autor / zdroj fotografie", { max: 120 }),
      select("source", "Původ fotografie", IMAGE_SOURCE_OPTIONS, {
        hint: "Zástupné obrázky se na ostrý web nedostanou.",
      }),
      select("depicts", "Fotografie ukazuje skutečné prostory, vůz nebo lidi firmy", IMAGE_DEPICTS_OPTIONS),
      bool("rightsConfirmed", "Mám právo tuto fotografii použít", {
        hint: "Zaškrtněte jen tehdy, když máte k fotografii práva. Bez toho se fotografie na ostrý web nedostane.",
      }),
      // Set by the admin page on save (preSave): the file the confirmation belongs to (G-033).
      hidden("rightsConfirmedFor"),
      select("focus", "Výřez fotografie", IMAGE_FOCUS_OPTIONS),
    ],
    { collapsed: true },
  );
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

function jsonFile(name: string, label: string, file: string, fields: DecapField[]): DecapFile {
  return { name, label, file: `${CONTENT_DIR}/site/${file}`, fields };
}

function addressFields(): DecapField[] {
  return [
    str("street", "Ulice a číslo", { max: 120 }),
    str("city", "Obec", { max: 80 }),
    str("postalCode", "PSČ", { pattern: POSTAL_CODE }),
    hidden("country"),
  ];
}

function requiredAddressFields(): DecapField[] {
  return [
    str("street", "Ulice a číslo", { required: true, max: 120 }),
    str("city", "Obec", { required: true, max: 80 }),
    str("postalCode", "PSČ", { required: true, pattern: POSTAL_CODE }),
    hidden("country"),
  ];
}

function companyFile(): DecapFile {
  return jsonFile("company", "Firma", "company.json", [
    str("brandName", "Název firmy (značka)", {
      required: true,
      max: 80,
      hint: "Zobrazuje se v záhlaví a v titulcích stránek.",
    }),
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
    select("familyOwned", "Rodinná firma", [
      { value: "yes", label: "Ano" },
      { value: "no", label: "Ne" },
      { value: "unknown", label: "Neuvádět" },
    ]),
    imageRef("logo", "Logo", true),
  ]);
}

function contactFile(): DecapFile {
  return jsonFile("contact", "Kontaktní údaje", "contact.json", [
    // §4.2: one location in the pilot (multipleLocations: false): it cannot be added or removed.
    listOf(
      "locations",
      "Kancelář",
      [
        hidden("id"),
        str("name", "Název pracoviště", { required: true, max: 80 }),
        objectField("address", "Adresa", requiredAddressFields()),
        // Coordinates are agent-only (§4.2).
        hidden("geo"),
        str("mapUrl", "Odkaz na mapu", { pattern: HTTP_URL }),
        txt("accessNote", "Poznámka k příjezdu a parkování", { max: 400 }),
      ],
      { min: 1, max: 1, allowAdd: false, collapsed: false, summary: "{{fields.name}}" },
    ),
    listOf(
      "phones",
      "Telefony",
      [
        hidden("id"),
        str("label", "Popisek", { required: true, max: 60 }),
        str("number", "Telefon", {
          required: true,
          pattern: PHONE,
          hint: "Ve tvaru +420123456789, bez mezer.",
        }),
        // Hidden so the editor cannot re-purpose a line; the nonstop line lives in its own entry.
        hidden("department", "office"),
        hidden("locationId"),
      ],
      {
        min: 1,
        summary: "{{fields.label}}: {{fields.number}}",
        hint: "Telefon pro nonstop převoz zesnulých se upravuje v položce „Nonstop převoz zesnulých“.",
      },
    ),
    listOf(
      "emails",
      "E-maily",
      [
        hidden("id"),
        str("label", "Popisek", { required: true, max: 60 }),
        str("address", "E-mailová adresa", { required: true, pattern: EMAIL }),
      ],
      { summary: "{{fields.label}}: {{fields.address}}" },
    ),
  ]);
}

const DAY_OPTIONS: SelectOption[] = [
  { value: "mon", label: "Pondělí" },
  { value: "tue", label: "Úterý" },
  { value: "wed", label: "Středa" },
  { value: "thu", label: "Čtvrtek" },
  { value: "fri", label: "Pátek" },
  { value: "sat", label: "Sobota" },
  { value: "sun", label: "Neděle" },
];

/** §4.3: office hours only; the emergency line is a separate entry. */
function officeHoursFile(): DecapFile {
  return jsonFile("office-hours", "Otevírací doba kanceláře", "office-hours.json", [
    hidden("locationId"),
    str("label", "Nadpis", { required: true, max: 60 }),
    listOf(
      "weekly",
      "Pravidelná otevírací doba",
      [
        hidden("id"),
        select("days", "Dny", DAY_OPTIONS, { required: true, multiple: true }),
        str("open", "Od (HH:MM)", { required: true, pattern: TIME }),
        str("close", "Do (HH:MM)", { required: true, pattern: TIME }),
        listOf("breaks", "Přestávky", [
          str("from", "Od (HH:MM)", { required: true, pattern: TIME }),
          str("to", "Do (HH:MM)", { required: true, pattern: TIME }),
        ]),
      ],
      {
        collapsed: false,
        summary: "{{fields.open}}–{{fields.close}}",
        hint: "Jen doba kanceláře. Nonstop převoz zesnulých je samostatná položka v menu.",
      },
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
      { summary: "{{fields.from}} – {{fields.note}}" },
    ),
    txt("outsideHoursNote", "Poznámka mimo otevírací dobu", { max: 200 }),
  ]);
}

/** §4.4: the nonstop transport is its own menu entry, never part of contact or office hours. */
function emergencyFile(): DecapFile {
  return jsonFile("emergency", "Nonstop převoz zesnulých", "emergency.json", [
    str("phone", "Telefon pro nonstop převoz", {
      required: true,
      pattern: PHONE,
      hint: "Číslo pro nonstop převoz zesnulých. Nejde o kancelář. Ve tvaru +420123456789.",
    }),
    txt("shortNote", "Krátká poznámka", { max: 160 }),
    txt("serviceArea", "Oblast, kde převoz zajišťujete", { max: 160 }),
    // Locked wording and switches (§4.4).
    hidden("enabled"),
    hidden("label"),
    hidden("availability"),
  ]);
}

/** site/legal.json: the ADR body defaults to ČOI (research L10). */
function legalFile(): DecapFile {
  return jsonFile("legal", "Právní informace", "legal.json", [
    objectField(
      "adr",
      "Mimosoudní řešení spotřebitelských sporů",
      [str("name", "Subjekt", { max: 120 }), str("url", "Odkaz", { pattern: HTTP_URL })],
      { hint: "Obvykle Česká obchodní inspekce (adr.coi.cz)." },
    ),
    txt("complaintsContact", "Kde a jak uplatnit reklamaci", { max: 400 }),
  ]);
}

/** An imageRef whose file field carries its own size hint (landscapes, places). */
function imageWithFileHint(name: string, label: string, fileHint: string): DecapField {
  const image = imageRef(name, label, true);
  image.fields = (image.fields ?? []).map((field) => {
    if (field.name !== "file") {
      return field;
    }
    return { ...field, hint: fileHint };
  });
  return image;
}

/** Mirrors core MAX_LANDSCAPE_IMAGES (checked in tests). */
export const MAX_LANDSCAPES = 12;

/** Guardrail of the landscape bands (content-contract §6.18), shown above the photo list. */
export const LANDSCAPES_HELP =
  "Fotografie krajiny nebo budov z vašeho okolí, vlastní nebo zakázkové. Na fotografii nesmí být lidé, " +
  "západ slunce, mraky ani květiny. Nepoužívejte fotobanky ani obrázky vytvořené počítačem. Na webu se " +
  "nikdy nezobrazí na začátku stránky. Bez fotografií zůstane mezi oddíly volné místo.";

/** site/landscapes.json: the photos for the full-bleed bands between sections (features.landscapes). */
function landscapesFile(): DecapFile {
  return jsonFile("landscapes", "Krajiny", "landscapes.json", [
    listOf(
      "images",
      "Fotografie krajiny",
      [
        imageWithFileHint(
          "image",
          "Fotografie",
          "JPEG, PNG nebo WebP, nejlépe do 8 MB. Na šířku, alespoň 2560 px. Po výměně fotografie upravte popis a původ a práva k ní potvrďte znovu.",
        ),
        str("place", "Místo", {
          required: true,
          max: 120,
          hint: "Kde fotografie vznikla. Příklad: Drahanská vrchovina nad Vyškovem.",
        }),
      ],
      { min: 0, max: MAX_LANDSCAPES, summary: "{{fields.place}}", hint: LANDSCAPES_HELP },
    ),
  ]);
}

/** Mirrors core MAX_PLACES (checked in tests). */
export const MAX_PLACES = 12;

/** Guardrail of the places list (content-contract §6.19), shown above the list. */
export const PLACES_HELP =
  "Místa, kde se staráte o zesnulé a o rodiny: kancelář, obřadní síň, vůz, vazárna, hřbitov. Fotografie " +
  "jen vlastní nebo zakázkové, bez smutečních hostů a bez zesnulých. Nepoužívejte fotobanky ani obrázky " +
  "vytvořené počítačem. Místo bez fotografie se na webu ukáže jako řádek s adresou.";

/** site/places.json: the firm's places with optional photos (features.places). */
function placesFile(): DecapFile {
  const image = imageWithFileHint(
    "image",
    "Fotografie",
    "Nepovinné. JPEG, PNG nebo WebP, nejlépe do 8 MB. Na šířku, alespoň 1600 px. Popisek se nezobrazuje: pod fotografií je název místa, věta a adresa.",
  );
  return jsonFile("places", "Naše místa", "places.json", [
    listOf(
      "places",
      "Místa",
      [
        str("name", "Název místa", { required: true, max: 80, hint: "Příklad: Kancelář na náměstí." }),
        str("address", "Adresa nebo upřesnění", { max: 120, hint: "Příklad: Náměstí 12, Vyškov." }),
        str("note", "Jedna věta o místě", {
          max: 160,
          hint: "Příklad: Tady spolu vše domluvíme, bez spěchu.",
        }),
        image,
      ],
      { min: 0, max: MAX_PLACES, summary: "{{fields.name}}", hint: PLACES_HELP },
    ),
  ]);
}

/** §4.9: each price is "demo" until the client sets it to approved; currency is locked. */
function pricingFile(inclusions: boolean): DecapFile {
  return jsonFile("pricing", "Ceník", "pricing.json", [
    bool("visible", "Zobrazit ceník na webu", {
      hint: "Vypnutím zmizí stránka Ceník i položka v menu.",
    }),
    hidden("currency"),
    str("vatNote", "Poznámka k DPH", { max: 120 }),
    date("validFrom", "Ceník platí od"),
    txt("generalNote", "Obecná poznámka", { max: 400 }),
    listOf(
      "groups",
      "Skupiny cen",
      [
        hidden("id"),
        str("title", "Název skupiny", { required: true, max: 80 }),
        txt("description", "Popis skupiny", { max: 240 }),
        listOf(
          "items",
          "Položky",
          [
            hidden("id"),
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
            wholeNumber("amount", "Částka v Kč (celé číslo)", 0, 2_000_000, {
              hint: "U druhu „Na dotaz“ nechte prázdné. U rozpětí je to dolní mez.",
            }),
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
                hint: "Po změně částky cenu znovu potvrďte. Na ostrý web se dostane jen ceník, ve kterém jsou všechny ceny schválené.",
              },
            ),
          ],
          { min: 1, summary: "{{fields.label}}" },
        ),
        stringList("includes", "V ceně je zahrnuto", 160, inclusions),
        stringList("excludes", "Není zahrnuto", 160, inclusions),
      ],
      { summary: "{{fields.title}}" },
    ),
  ]);
}

// ---------------------------------------------------------------------------
// Pages (§4.5): one file per page, so each page shows only the template's pageFields
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

function pageField(name: (typeof PAGE_FIELD_NAMES)[number], visible: boolean): DecapField {
  if (!visible) {
    return hidden(name);
  }
  if (name === "title") {
    return str("title", "Nadpis stránky", { required: true, max: 70 });
  }
  if (name === "navLabel") {
    return str("navLabel", "Název v menu", { required: true, max: 24 });
  }
  if (name === "lead") {
    return txt("lead", "Úvodní odstavec", { max: 400 });
  }
  if (name === "excerpt") {
    return txt("excerpt", "Krátký výtah pro jiné stránky", { max: 400 });
  }
  if (name === "metaTitle") {
    return str("metaTitle", "Titulek pro vyhledávače", { max: 60, hint: "Nejvýše 60 znaků." });
  }
  if (name === "metaDescription") {
    return txt("metaDescription", "Popis pro vyhledávače", {
      required: true,
      max: 160,
      hint: "Nejvýše 160 znaků.",
    });
  }
  if (name === "heroImage") {
    return imageRef("heroImage", "Hlavní obrázek", true);
  }
  if (name === "secondaryImage") {
    return imageRef("secondaryImage", "Další obrázek", true);
  }
  return richText(
    "body",
    "Text stránky",
    "Nadpisy používejte od druhé úrovně. Telefonní čísla sem nepište, berou se z Kontaktu.",
  );
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

function pageFiles(
  manifest: TemplateManifest,
  pageIds: readonly string[],
  articles: boolean,
  enabled: (feature: ContentFeature) => boolean,
): DecapFile[] {
  const files: DecapFile[] = [];
  for (const pageId of Object.keys(PAGE_LABELS)) {
    if (!pageIds.includes(pageId)) {
      continue;
    }
    if (pageId === "clanky" && !articles) {
      continue;
    }
    const feature = FEATURE_PAGE_IDS[pageId];
    if (feature !== undefined && !enabled(feature)) {
      continue;
    }
    if (manifest.pageFields[pageId] === undefined) {
      continue;
    }
    files.push({
      name: pageId,
      label: PAGE_LABELS[pageId] as string,
      file: `${CONTENT_DIR}/pages/${pageId}.md`,
      fields: [
        ...PAGE_FIELD_NAMES.map((name) => pageField(name, isPageFieldVisible(manifest, pageId, name))),
        hidden("placeholder"),
      ],
    });
  }
  return files;
}

// ---------------------------------------------------------------------------
// Folder collections (§4.6–§4.8, §4.12–§4.15, articles)
// ---------------------------------------------------------------------------

function folder(
  name: string,
  label: string,
  labelSingular: string,
  view: { identifier: string; summary: string; sortable: string[] },
  fields: DecapField[],
  description?: string,
): DecapFolderCollection {
  const collection: DecapFolderCollection = {
    name,
    label,
    label_singular: labelSingular,
    folder: `${CONTENT_DIR}/${name}`,
    extension: "md",
    format: "frontmatter",
    create: true,
    delete: true,
    // The file name is set once from the title (ASCII, no accents) and never renamed afterwards.
    slug: `{{${view.identifier}}}`,
    identifier_field: view.identifier,
    summary: view.summary,
    sortable_fields: view.sortable,
    editor: { preview: false },
    fields,
  };
  if (description !== undefined) {
    collection.description = description;
  }
  return collection;
}

function order(required = false): DecapField {
  return wholeNumber("order", "Pořadí", 0, 999, {
    required,
    hint: "Nižší číslo se zobrazí dříve.",
  });
}

function servicesCollection(manifest: TemplateManifest): DecapFolderCollection {
  return folder(
    "services",
    "Služby",
    "Služba",
    { identifier: "title", summary: "{{title}}", sortable: ["order", "title"] },
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
      bool("published", "Zveřejnit", {
        default: true,
        hint: "Vypnutím službu skryjete, aniž byste ji smazali.",
      }),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "service")),
      hidden("priceGroupId"),
      hidden("placeholder"),
      richText(
        "body",
        "Podrobný text",
        "Telefonní čísla sem nepište, berou se z Kontaktu a z Nonstop převozu.",
      ),
    ],
  );
}

function guidanceCollection(): DecapFolderCollection {
  return folder(
    "guidance",
    "Jak postupovat",
    "Krok",
    { identifier: "title", summary: "{{title}}", sortable: ["order", "title"] },
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
        widget: "list",
        required: false,
        collapsed: true,
        field: str("item", "Položka", { required: true, max: 160 }),
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
            { summary: "{{fields.title}}" },
          ),
        ],
        {
          hint: `${EXPERT_CONTENT_HINT} Po každé změně textu vyplňte znovu, kdo a kdy text zkontroloval.`,
        },
      ),
      bool("published", "Zveřejnit", { default: true }),
      hidden("placeholder"),
      richText("body", "Text kroku", EXPERT_CONTENT_HINT),
    ],
    EXPERT_CONTENT_HINT,
  );
}

function coffinsCollection(manifest: TemplateManifest): DecapFolderCollection {
  return folder(
    "coffins",
    "Rakve",
    "Rakev",
    { identifier: "name", summary: "{{name}} {{code}}", sortable: ["order", "name"] },
    [
      str("name", "Název", { required: true, max: 80 }),
      str("code", "Kód v katalogu", { max: 40 }),
      str("material", "Materiál", { max: 120 }),
      txt("summary", "Popis", { required: true, max: 400 }),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "coffin")),
      order(),
      bool("published", "Zveřejnit", { default: true }),
      hidden("placeholder"),
      hidden("body"),
    ],
  );
}

function flowersCollection(manifest: TemplateManifest): DecapFolderCollection {
  return folder(
    "flowers",
    "Květiny",
    "Květinová vazba",
    { identifier: "title", summary: "{{title}}", sortable: ["order", "title"] },
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
      bool("published", "Zveřejnit", { default: true }),
      hidden("placeholder"),
      hidden("body"),
    ],
  );
}

/**
 * Articles (content-contract Article schema). Only generated while `features.articles` is on and
 * the template supports articles; neither current template does (docs/cms-decap/articles.md).
 * New articles start as drafts, so nothing is published by accident.
 */
function articlesCollection(manifest: TemplateManifest): DecapFolderCollection {
  return folder(
    "articles",
    "Články",
    "Článek",
    { identifier: "title", summary: "{{title}} ({{publishedAt}})", sortable: ["publishedAt", "title"] },
    [
      str("title", "Nadpis článku", { required: true, max: 100 }),
      txt("summary", "Shrnutí", { required: true, max: 240 }),
      date("publishedAt", "Datum zveřejnění", true),
      date("updatedAt", "Datum aktualizace"),
      imageRef("image", "Obrázek", hasSlotPrefix(manifest, "article")),
      bool("draft", "Koncept (nezveřejňovat)", {
        default: true,
        hint: "Článek se na webu objeví, až toto pole vypnete a změny zveřejníte.",
      }),
      hidden("placeholder"),
      richText("body", "Text článku", "Telefonní čísla sem nepište, berou se z Kontaktu."),
    ],
  );
}

/** A PDF upload into src/assets/documents/. */
function pdfFile(
  name: string,
  label: string,
  options: { required?: boolean; hint?: string } = {},
): DecapField {
  const field: DecapField = {
    name,
    label,
    widget: "file",
    required: options.required === true,
    choose_url: false,
    // Field-level folders: a leading "/" means relative to the repository root.
    media_folder: `/${DOCUMENTS_DIR}`,
    public_folder: DOCUMENTS_DIR,
  };
  if (options.hint !== undefined) {
    field.hint = options.hint;
  }
  return field;
}

function noticesCollection(manifest: TemplateManifest): DecapFolderCollection {
  const images = hasSlotPrefix(manifest, "notice");
  return folder(
    "notices",
    "Oznámení a obřady",
    "Oznámení",
    { identifier: "fullName", summary: "{{fullName}} ({{died}})", sortable: ["died", "fullName"] },
    [
      str("fullName", "Jméno zesnulé/ho", {
        required: true,
        max: 120,
        hint: "Celé jméno včetně titulů, jak má být na oznámení.",
      }),
      str("born", "Narození", { pattern: YEAR_OR_DATE, hint: "Rok (1941) nebo datum (1941-04-03)." }),
      str("died", "Úmrtí", {
        required: true,
        pattern: YEAR_OR_DATE,
        hint: "Rok (2026) nebo datum (2026-11-02).",
      }),
      imageRef("photo", "Fotografie", images),
      imageRef("parteImage", "Parte jako obrázek", images),
      pdfFile("partePdf", "Parte jako PDF", { hint: "Tištěné parte ke stažení. Zmizí s koncem zveřejnění." }),
      objectField(
        "ceremony",
        "Rozloučení",
        [
          select(
            "type",
            "Druh rozloučení",
            [
              { value: "civil", label: "Občanský obřad" },
              { value: "church", label: "Církevní obřad" },
              { value: "without-ceremony", label: "Pohřeb bez obřadu" },
              { value: "private", label: "V úzkém rodinném kruhu" },
            ],
            { required: true },
          ),
          date("date", "Datum obřadu"),
          str("time", "Čas obřadu (HH:MM)", { pattern: TIME }),
          str("placeName", "Místo obřadu", { max: 120, hint: "Např. Smuteční síň Vyškov." }),
          str("address", "Adresa místa", { max: 200 }),
          str("mapUrl", "Odkaz na mapu", { pattern: HTTP_URL }),
        ],
        { hint: "U občanského a církevního obřadu vyplňte datum, čas i místo." },
      ),
      str("livestreamUrl", "Odkaz na přenos obřadu", {
        pattern: HTTPS_URL,
        hint: "Jen odkaz na přenos, který provozuje obřadní síň nebo krematorium. Přenos na web nevkládáme.",
      }),
      txt("familyNote", "Krátký text od rodiny", { max: 600 }),
      bool("condolencesViaOffice", "Rodina souhlasí s kondolencemi přes e-mail kanceláře", {
        default: false,
      }),
      date("publishFrom", "Zveřejnit od"),
      date("publishUntil", "Zveřejnit do", true),
      bool("noindex", "Skrýt před vyhledávači (doporučeno)", { default: true }),
      bool("listed", "Zobrazit v přehledu oznámení", { default: true }),
      bool("published", "Zveřejnit", { default: true }),
      objectField(
        "consent",
        "Souhlas objednatele",
        [
          str("orderedBy", "Kdo oznámení objednal", { required: true, max: 120 }),
          date("date", "Datum objednávky nebo souhlasu", true),
          select(
            "basis",
            "Právní základ",
            [
              { value: "objednavka", label: "Objednávka služby" },
              { value: "souhlas", label: "Písemný souhlas" },
            ],
            { required: true },
          ),
        ],
        {
          hint: "Povinné. Bez záznamu, kdo zveřejnění objednal, kdy a na jakém základě, se oznámení na web nedostane. Údaje se na webu nezobrazují.",
        },
      ),
      hidden("placeholder"),
      richText(
        "body",
        "Text oznámení",
        "Jen text oznámení. Žádné odkazy na služby, ceník ani jiné weby a žádná telefonní čísla.",
      ),
    ],
  );
}

function peopleCollection(manifest: TemplateManifest): DecapFolderCollection {
  return folder(
    "people",
    "Lidé",
    "Člověk",
    { identifier: "name", summary: "{{name}} – {{role}}", sortable: ["order", "name"] },
    [
      str("name", "Jméno", { required: true, max: 120 }),
      str("role", "Role", { required: true, max: 120, hint: "Např. Vedoucí kanceláře." }),
      imageRef("photo", "Fotografie", hasSlotPrefix(manifest, "person")),
      str("phone", "Přímý telefon", {
        pattern: PHONE,
        hint: "Nepovinné. Ve tvaru +420123456789, bez mezer.",
      }),
      order(),
      bool("published", "Zveřejnit", {
        default: false,
        hint: "Zveřejnit lze jen člověka, jehož souhlas se zveřejněním má správce webu zaznamenaný. Nového pracovníka nejdřív nahlaste správci.",
      }),
      hidden("placeholder"),
      hidden("body"),
    ],
  );
}

function faqCollection(): DecapFolderCollection {
  return folder(
    "faq",
    "Časté otázky",
    "Otázka",
    { identifier: "question", summary: "{{question}}", sortable: ["order", "question"] },
    [
      str("question", "Otázka", { required: true, max: 200 }),
      select(
        "topic",
        "Téma",
        [
          { value: "first-steps", label: "Úmrtí a první kroky" },
          { value: "arrangements", label: "Sjednání pohřbu" },
          { value: "ceremony", label: "Obřad a rozloučení" },
          { value: "cremation-urn", label: "Kremace a urna" },
          { value: "documents", label: "Doklady a úřady" },
          { value: "costs", label: "Náklady a platba" },
          { value: "other", label: "Další otázky" },
        ],
        { required: true },
      ),
      order(),
      bool("published", "Zveřejnit", { default: true }),
      hidden("placeholder"),
      richText("body", "Odpověď", `${EXPERT_CONTENT_HINT} Telefonní čísla sem nepište.`),
    ],
  );
}

function documentsCollection(): DecapFolderCollection {
  return folder(
    "documents",
    "Dokumenty ke stažení",
    "Dokument",
    { identifier: "title", summary: "{{title}}", sortable: ["order", "title"] },
    [
      str("title", "Název dokumentu", { required: true, max: 120 }),
      pdfFile("file", "Soubor PDF", { required: true }),
      select(
        "kind",
        "Druh",
        [
          { value: "rad-pohrebni-sluzby", label: "Řád pohřební služby" },
          { value: "obchodni-podminky", label: "Obchodní podmínky" },
          { value: "reklamacni-rad", label: "Reklamační řád" },
          { value: "other", label: "Jiný dokument" },
        ],
        { required: true },
      ),
      date("validFrom", "Platí od"),
      order(),
      bool("published", "Zveřejnit", { default: true }),
      hidden("placeholder"),
      hidden("body"),
    ],
  );
}

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------

const COMMIT_MESSAGES: Record<string, string> = {
  create: "Obsah: vytvořeno {{collection}} „{{slug}}“ – {{author-name}} (Decap CMS)",
  update: "Obsah: upraveno {{collection}} „{{slug}}“ – {{author-name}} (Decap CMS)",
  delete: "Obsah: smazáno {{collection}} „{{slug}}“ – {{author-name}} (Decap CMS)",
  uploadMedia: "Média: nahráno {{path}} – {{author-name}} (Decap CMS)",
  deleteMedia: "Média: smazáno {{path}} – {{author-name}} (Decap CMS)",
};

/**
 * The DecapBridge backend block, in the shape the DecapBridge dashboard generates
 * (decapbridge-web, src/pages/dashboard/sites/edit/InstallConfig/useCmsYamlConfig.ts), with our
 * branch: the editor always saves to `content`, never to `main`.
 */
export function decapBackend(publishing: ResolvedPublishingSettings): DecapBackend {
  const { decapbridge } = publishing;
  const base = {
    name: "git-gateway" as const,
    repo: publishing.repository,
    branch: CONTENT_BRANCH,
  };
  if (decapbridge.authType === "pkce") {
    return {
      ...base,
      auth_type: "pkce",
      base_url: decapbridge.authUrl,
      auth_endpoint: `/sites/${decapbridge.siteId}/pkce`,
      auth_token_endpoint: `/sites/${decapbridge.siteId}/token`,
      gateway_url: decapbridge.gatewayUrl,
      commit_messages: COMMIT_MESSAGES,
    };
  }
  return {
    ...base,
    identity_url: `${decapbridge.authUrl}/sites/${decapbridge.siteId}`,
    gateway_url: decapbridge.gatewayUrl,
    commit_messages: COMMIT_MESSAGES,
  };
}

// ---------------------------------------------------------------------------
// Publishing from the editor
// ---------------------------------------------------------------------------

/** Last menu entry: saving it publishes what the preview shows (PUBLISH_REQUEST_FILE). */
function publishCollection(): DecapFilesCollection {
  return {
    name: PUBLISH_COLLECTION,
    label: "Zveřejnit změny",
    description:
      "Zveřejní na ostrém webu všechno, co je teď uložené v náhledu. Před zveřejněním se web zkontroluje; když kontrola neprojde, ostrý web zůstane beze změny.",
    editor: { preview: false },
    files: [
      {
        name: "request",
        label: "Zveřejnit změny na ostrém webu",
        file: PUBLISH_REQUEST_FILE,
        fields: [
          txt("note", "Co se zveřejňuje", {
            required: true,
            max: 300,
            hint: "Pokaždé napište nový krátký popis, např. „Nové číslo nonstop linky“ (bez změny popisu nejde zveřejnit). Pak nahoře klikněte na „Zveřejnit na ostrém webu“: spustí se kontrola a zveřejnění. Ostrý web se změní asi za 2 minuty.",
          }),
          // Set by the admin page on save, so every request is a new commit with its time.
          hidden("requestedAt"),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Whole config
// ---------------------------------------------------------------------------

export function generateDecapConfig(input: DecapConfigInput): DecapConfig {
  const { manifest, features, pageIds } = input;
  const articles = features.articles && manifest.supports.articles;
  const enabled = (feature: ContentFeature): boolean =>
    features[feature] === true && manifest.supports[feature];
  const showLegal = input.legal === true && manifest.pageFields["pravni-informace"] !== undefined;

  const basicFiles = [companyFile(), contactFile(), officeHoursFile()];
  if (showLegal) {
    basicFiles.push(legalFile());
  }
  if (enabled("landscapes")) {
    basicFiles.push(landscapesFile());
  }
  if (enabled("places")) {
    basicFiles.push(placesFile());
  }
  const collections: DecapCollection[] = [
    {
      name: "zakladni-informace",
      label: "Základní informace",
      description: "Název firmy, kontakty a otevírací doba kanceláře.",
      editor: { preview: false },
      files: basicFiles,
    },
    {
      name: "nonstop",
      label: "Nonstop převoz zesnulých",
      description: "Telefon a texty nepřetržité služby. Odděleně od otevírací doby kanceláře.",
      editor: { preview: false },
      files: [emergencyFile()],
    },
    {
      name: "stranky",
      label: "Stránky",
      description: "Texty jednotlivých stránek webu. Stránky nelze přidávat ani mazat.",
      editor: { preview: false },
      files: pageFiles(manifest, pageIds, articles, enabled),
    },
    servicesCollection(manifest),
    {
      name: "cenik",
      label: "Ceník",
      description: "Ceny služeb. Každou cenu je třeba schválit, jinak se ceník na ostrý web nedostane.",
      editor: { preview: false },
      files: [pricingFile(manifest.supports.priceInclusions)],
    },
    guidanceCollection(),
    coffinsCollection(manifest),
    flowersCollection(manifest),
  ];
  if (enabled("notices")) {
    collections.push(noticesCollection(manifest));
  }
  if (enabled("faq")) {
    collections.push(faqCollection());
  }
  if (enabled("people")) {
    collections.push(peopleCollection(manifest));
  }
  if (enabled("documents")) {
    collections.push(documentsCollection());
  }
  if (articles) {
    collections.push(articlesCollection(manifest));
  }
  collections.push(publishCollection());

  const config: DecapConfig = {
    backend: decapBackend(input.publishing),
    local_backend: true,
    publish_mode: "simple",
    locale: "cs",
    show_preview_links: false,
    media_folder: MEDIA_DIR,
    public_folder: MEDIA_PUBLIC_FOLDER,
    slug: { encoding: "ascii", clean_accents: true, sanitize_replacement: "-" },
    collections,
  };
  if (input.siteUrl !== undefined && !input.siteUrl.includes("example.invalid")) {
    config.site_url = input.siteUrl;
    config.display_url = input.siteUrl;
  }
  return config;
}

export interface RenderOptions {
  templateId: string;
  templateVersion: string;
}

export function renderDecapYaml(config: DecapConfig, options: RenderOptions): string {
  const document = new Document(config, { aliasDuplicateObjects: false });
  document.commentBefore = [
    ` Decap CMS configuration, generated for template ${options.templateId} ${options.templateVersion}.`,
    " Vygenerováno při exportu webu. Neupravujte ručně: pole odpovídají pravidlům šablony a obsahu",
    " a nepromyšlená změna může poškodit data při uložení. Změny konzultujte s vývojářem.",
    " Publishing: the editor saves to branch `content` (preview). Production is updated only by",
    " .github/workflows/publish.yml, which checks the build files, runs the production gate and only",
    ` then updates \`main\`. Saving the "Zveřejnit změny" entry (${PUBLISH_REQUEST_FILE}) starts it.`,
    " See docs/cms/publishing.md.",
  ].join("\n");
  return document.toString({ lineWidth: 0 });
}

/** True while the rendered config still contains an unfilled placeholder (admin shows a notice). */
export function hasPlaceholders(yaml: string): boolean {
  return yaml.includes(PLACEHOLDER_VALUE);
}
