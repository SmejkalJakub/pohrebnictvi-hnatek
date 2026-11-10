/**
 * Content schemas: the normative contract from docs/content-contract.md §6.
 * Flat, CMS-shaped objects only (no discriminated unions), so Pages CMS can edit them.
 */
import { z } from "astro/zod";
import {
  Day,
  Email,
  HttpsUrl,
  Id,
  IsoDate,
  Order,
  Phone,
  Time,
  Url,
  YearOrDate,
  asciiSlug,
  flag,
  labelField,
  nullable,
  objectOrEmpty,
  optionalText,
  text,
  withDerivedIds,
} from "./primitives.ts";

type RefinementContext = z.RefinementCtx;

function issue(ctx: RefinementContext, path: PropertyKey[], message: string): void {
  ctx.addIssue({ code: "custom", path, message });
}

// ---------------------------------------------------------------------------
// §6.3 Image metadata (inline everywhere)
// ---------------------------------------------------------------------------

export const IMAGE_SOURCES_SHOWING_REAL_BUSINESS = ["client", "existing-website", "own-photo"] as const;

export const ImageRef = z
  .object({
    file: text(300),
    alt: z.string().trim().max(200, "Maximálně 200 znaků.").default(""),
    decorative: flag(false),
    caption: optionalText(240),
    credit: optionalText(120),
    source: z.enum(["client", "existing-website", "own-photo", "licensed-stock", "placeholder"]),
    depicts: z.enum(["actual-business", "generic", "placeholder"]),
    rightsConfirmed: flag(false),
    focus: z.preprocess(
      emptyToUndefined,
      z.enum(["center", "top", "bottom", "left", "right"]).default("center"),
    ),
  })
  .superRefine((img, ctx) => {
    if (!img.decorative && img.alt.length < 5) {
      issue(ctx, ["alt"], "Doplňte popis obrázku (alt) nebo jej označte jako dekorativní.");
    }
    const isPlaceholderSource = img.source === "placeholder";
    const isPlaceholderSubject = img.depicts === "placeholder";
    if (isPlaceholderSource !== isPlaceholderSubject) {
      issue(ctx, ["depicts"], "Zástupný obrázek musí mít zdroj i obsah nastavený na 'placeholder'.");
    }
    const canShowRealBusiness = (IMAGE_SOURCES_SHOWING_REAL_BUSINESS as readonly string[]).includes(
      img.source,
    );
    if (img.depicts === "actual-business" && !canShowRealBusiness) {
      issue(
        ctx,
        ["depicts"],
        "Skutečné prostory, osoby či vozidla firmy smí ukazovat jen fotografie od klienta nebo z jeho webu.",
      );
    }
  });
export type ImageRef = z.infer<typeof ImageRef>;

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null) {
    return undefined;
  }
  return value;
}

/**
 * "No image" may arrive as null, "", a missing key, or an object without a file: Pages CMS keeps
 * booleans such as rightsConfirmed: false, so an untouched optional image is never fully empty (B6).
 */
function emptyImageToNull(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const file = (value as { file?: unknown }).file;
    const hasFile = typeof file === "string" && file.trim() !== "";
    if (!hasFile) {
      return null;
    }
  }
  return value;
}

const OptionalImage = z.preprocess(emptyImageToNull, ImageRef.nullable());

// ---------------------------------------------------------------------------
// §6.1 Company
// ---------------------------------------------------------------------------

export const Address = z.object({
  street: text(120),
  city: text(80),
  postalCode: z.string().regex(/^\d{3}\s?\d{2}$/, "PSČ zadejte ve tvaru 123 45."),
  country: z.literal("CZ").default("CZ"),
});
export type Address = z.infer<typeof Address>;

export const Company = z.object({
  brandName: text(80),
  legalName: text(120),
  legalIds: objectOrEmpty(
    z.object({
      ico: nullable(z.string().regex(/^\d{8}$/, "IČO má 8 číslic.")),
      dic: nullable(z.string().regex(/^CZ\d{8,10}$/, "DIČ zadejte ve tvaru CZ12345678.")),
      registryEntry: optionalText(200),
      registeredOffice: nullable(Address),
    }),
  ),
  tradition: objectOrEmpty(
    z.object({
      publicWording: optionalText(120),
      foundedYear: nullable(z.number().int().min(1800).max(2100)),
    }),
  ),
  // true / false / null (= not stated). A CMS select can send "yes" / "no" / "unknown" (A4).
  familyOwned: z.preprocess(triState, z.boolean().nullable()),
  logo: OptionalImage,
});
export type Company = z.infer<typeof Company>;

function triState(value: unknown): unknown {
  if (value === "yes" || value === "ano") {
    return true;
  }
  if (value === "no" || value === "ne") {
    return false;
  }
  if (value === undefined || value === "" || value === "unknown") {
    return null;
  }
  return value;
}

// ---------------------------------------------------------------------------
// §6.2 Contact
// ---------------------------------------------------------------------------

export const Location = z.object({
  id: Id,
  name: text(80),
  address: Address,
  geo: nullable(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })),
  mapUrl: nullable(Url),
  accessNote: optionalText(400),
});
export type Location = z.infer<typeof Location>;

export const ContactPhone = z.object({
  id: Id,
  label: text(60),
  number: Phone,
  // "emergency" is deliberately not an option: the nonstop line lives in emergency.json only.
  department: z.enum(["office", "flowers", "other"]),
  locationId: nullable(Id),
});
export type ContactPhone = z.infer<typeof ContactPhone>;

export const Contact = z
  .object({
    locations: z.array(Location).min(1, "Uveďte alespoň jedno místo."),
    phones: z.preprocess(
      withDerivedIds(labelField("label", "telefon")),
      z.array(ContactPhone).min(1, "Uveďte alespoň jeden telefon."),
    ),
    emails: z.preprocess(
      withDerivedIds(labelField("label", "email")),
      z.array(z.object({ id: Id, label: text(60), address: Email })).default([]),
    ),
  })
  .superRefine((contact, ctx) => {
    const officePhones = contact.phones.filter((phone) => phone.department === "office");
    if (officePhones.length === 0) {
      issue(ctx, ["phones"], "Uveďte alespoň jeden telefon kanceláře.");
    }
    reportDuplicateIds(ctx, ["locations"], contact.locations);
    reportDuplicateIds(ctx, ["phones"], contact.phones);
    reportDuplicateIds(ctx, ["emails"], contact.emails);
  });
export type Contact = z.infer<typeof Contact>;

function reportDuplicateIds(
  ctx: RefinementContext,
  path: PropertyKey[],
  items: readonly { id: string }[],
): void {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      issue(ctx, [...path, index, "id"], `Duplicitní id "${item.id}".`);
    }
    seen.add(item.id);
  });
}

// ---------------------------------------------------------------------------
// §6.4 Office hours
// ---------------------------------------------------------------------------

function isValidTime(value: unknown): boolean {
  return Time.safeParse(value).success;
}

export const OfficeHoursGroup = z.object({
  id: Id,
  days: z.array(Day).min(1, "Vyberte alespoň jeden den."),
  open: Time,
  close: Time,
  breaks: z.array(z.object({ from: Time, to: Time })).default([]),
});
export type OfficeHoursGroup = z.infer<typeof OfficeHoursGroup>;

export const OfficeHours = z
  .object({
    locationId: Id,
    label: text(60).default("Kancelář"),
    weekly: z.preprocess(withDerivedIds(labelField("days", "doba")), z.array(OfficeHoursGroup)),
    holidayNote: optionalText(200),
    exceptions: z
      .array(
        z.object({
          from: IsoDate,
          to: IsoDate,
          closed: z.boolean(),
          open: nullable(Time),
          close: nullable(Time),
          note: optionalText(160),
        }),
      )
      .default([]),
    outsideHoursNote: optionalText(200),
  })
  .superRefine((hours, ctx) => {
    const seenDays = new Set<string>();
    hours.weekly.forEach((group, i) => {
      // Zod 4 runs refinements even when a field already failed; compare only well-formed
      // times so a single typo produces a single, clear message for the editor.
      const times = [group.open, group.close, ...group.breaks.flatMap((pause) => [pause.from, pause.to])];
      if (!times.every(isValidTime)) {
        return;
      }
      if (group.open >= group.close) {
        issue(ctx, ["weekly", i, "close"], "Konec musí být později než začátek.");
      }
      if (group.open === "00:00" && group.close >= "23:59") {
        issue(
          ctx,
          ["weekly", i],
          "Nepřetržitou službu uveďte v části Nonstop převoz, ne v úředních hodinách kanceláře.",
        );
      }
      group.breaks.forEach((pause, j) => {
        const insideOpening = pause.from > group.open && pause.to < group.close && pause.from < pause.to;
        if (!insideOpening) {
          issue(ctx, ["weekly", i, "breaks", j], "Přestávka musí ležet uvnitř otevírací doby.");
        }
      });
      group.days.forEach((day) => {
        if (seenDays.has(day)) {
          issue(ctx, ["weekly", i, "days"], `Den ${day} je uveden vícekrát.`);
        }
        seenDays.add(day);
      });
    });
    reportDuplicateIds(ctx, ["weekly"], hours.weekly);
    hours.exceptions.forEach((exception, i) => {
      if (exception.from > exception.to) {
        issue(ctx, ["exceptions", i, "to"], "Konec výjimky musí být stejný nebo pozdější než začátek.");
      }
      if (!exception.closed) {
        const hasTimes = exception.open !== null && exception.close !== null;
        if (!hasTimes) {
          issue(ctx, ["exceptions", i], "Když není zavřeno, uveďte čas otevření i zavření.");
        }
      }
    });
  });
export type OfficeHours = z.infer<typeof OfficeHours>;

// ---------------------------------------------------------------------------
// §6.5 Emergency transport (never mixed with office hours)
// ---------------------------------------------------------------------------

export const EmergencyTransport = z.object({
  enabled: z.boolean(),
  label: text(60),
  phone: Phone,
  availability: z.literal("24/7"),
  shortNote: optionalText(160),
  serviceArea: optionalText(160),
});
export type EmergencyTransport = z.infer<typeof EmergencyTransport>;

// ---------------------------------------------------------------------------
// §6.6 Pages
// ---------------------------------------------------------------------------

export const PAGE_IDS = [
  "home",
  "jak-postupovat",
  "sluzby",
  "rakve",
  "kvetiny",
  "o-nas",
  "kontakt",
  "cenik",
  "ochrana-osobnich-udaju",
  "clanky",
  // Optional pages for the content types of research §8 (content-contract §5):
  "oznameni", // index of notices; required while features.notices is on
  "pro-ucastniky", // guests of a funeral; required while features.guestInfo is on
  "pohreb-predem", // planning ahead; required while features.prePlanning is on
  "pravni-informace", // legal information (ADR, complaints, documents); optional
] as const;
export const PageId = z.enum(PAGE_IDS);
export type PageId = z.infer<typeof PageId>;

/** Pages whose file must exist regardless of features (content-contract §5). */
export const REQUIRED_PAGE_IDS: readonly PageId[] = [
  "home",
  "jak-postupovat",
  "sluzby",
  "rakve",
  "kvetiny",
  "o-nas",
  "kontakt",
  "cenik",
];

export const Page = z.object({
  title: text(70),
  navLabel: text(24),
  metaTitle: optionalText(60),
  metaDescription: text(160),
  lead: optionalText(400),
  excerpt: optionalText(400),
  heroImage: OptionalImage,
  secondaryImage: OptionalImage,
  placeholder: z.boolean().default(false),
});
export type Page = z.infer<typeof Page>;

// ---------------------------------------------------------------------------
// §6.7–§6.10 Collections
// ---------------------------------------------------------------------------

export const SERVICE_CATEGORIES = [
  "ceremony",
  "transport",
  "arrangements",
  "cremation",
  "memorial",
  "other",
] as const;

export const Service = z.object({
  title: text(80),
  summary: text(240),
  category: z.enum(SERVICE_CATEGORIES),
  order: Order,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  image: OptionalImage,
  priceGroupId: nullable(Id).default(null),
  placeholder: z.boolean().default(false),
});
export type Service = z.infer<typeof Service>;

export const GUIDANCE_PHASES = ["first-hours", "first-days", "arrangements", "after-funeral"] as const;

export const Guidance = z.object({
  title: text(90),
  summary: text(240),
  phase: z.enum(GUIDANCE_PHASES),
  situations: z
    .array(z.enum(["any", "home", "hospital", "care-home", "abroad"]))
    .min(1)
    .default(["any"]),
  order: Order,
  contactPrompt: z.enum(["emergency", "office", "none"]).default("none"),
  checklist: z.array(text(160)).default([]),
  review: z
    .object({
      reviewedBy: optionalText(80),
      reviewedAt: nullable(IsoDate),
      sources: z.array(z.object({ title: text(120), url: Url })).default([]),
    })
    .default({ reviewedBy: null, reviewedAt: null, sources: [] }),
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type Guidance = z.infer<typeof Guidance>;

export const Coffin = z.object({
  name: text(80),
  code: optionalText(40),
  material: optionalText(120),
  summary: text(400),
  image: OptionalImage,
  order: Order,
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type Coffin = z.infer<typeof Coffin>;

export const FlowerArrangement = z.object({
  title: text(80),
  type: z.enum(["wreath", "spray", "bouquet", "urn-arrangement", "other"]),
  summary: optionalText(300),
  image: OptionalImage,
  order: Order,
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type FlowerArrangement = z.infer<typeof FlowerArrangement>;

export const Article = z.object({
  title: text(100),
  summary: text(240),
  publishedAt: IsoDate,
  updatedAt: nullable(IsoDate).default(null),
  image: OptionalImage,
  draft: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type Article = z.infer<typeof Article>;

// ---------------------------------------------------------------------------
// §6.13–§6.17 Optional content types (research funeral-ux.md §8). Each is switched on per site by
// site.config features and must be supported by the template manifest (G-005).
// ---------------------------------------------------------------------------

/** A PDF in src/assets/documents/ (bare name or CMS path; core normalises, G-075 checks it exists). */
export const DocumentFile = z
  .string()
  .trim()
  .min(1, "Vyberte soubor.")
  .regex(/\.pdf$/i, "Nahrajte soubor ve formátu PDF.");

function emptyObjectToNull(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const filled = Object.values(value as Record<string, unknown>).some(
      (inner) => inner !== null && inner !== undefined && inner !== "",
    );
    if (!filled) {
      return null;
    }
  }
  return value;
}

export const NOTICE_CEREMONY_TYPES = ["civil", "church", "without-ceremony", "private"] as const;
export type NoticeCeremonyType = (typeof NOTICE_CEREMONY_TYPES)[number];

/** Ceremony types that announce a public farewell, so date, time and place are required. */
const PUBLIC_CEREMONY_TYPES: readonly NoticeCeremonyType[] = ["civil", "church"];

export const NoticeCeremony = z
  .object({
    type: z.enum(NOTICE_CEREMONY_TYPES, "Vyberte druh rozloučení."),
    date: nullable(IsoDate),
    time: nullable(Time),
    placeName: optionalText(120),
    address: optionalText(200),
    mapUrl: nullable(Url),
  })
  .superRefine((ceremony, ctx) => {
    if (!PUBLIC_CEREMONY_TYPES.includes(ceremony.type)) {
      return;
    }
    if (ceremony.date === null) {
      issue(ctx, ["date"], "Doplňte datum obřadu.");
    }
    if (ceremony.time === null) {
      issue(ctx, ["time"], "Doplňte čas obřadu.");
    }
    if (ceremony.placeName === null) {
      issue(ctx, ["placeName"], "Doplňte místo obřadu.");
    }
  });
export type NoticeCeremony = z.infer<typeof NoticeCeremony>;

export const CONSENT_BASES = ["objednavka", "souhlas"] as const;

/** Who ordered the notice and on what basis (research L12). Never rendered (view models omit it). */
export const NoticeConsent = z.object({
  orderedBy: text(120),
  date: IsoDate,
  basis: z.enum(CONSENT_BASES, "Vyberte právní základ: objednávka, nebo souhlas."),
});
export type NoticeConsent = z.infer<typeof NoticeConsent>;

const NOTICE_SHAPE = {
  fullName: text(120),
  born: nullable(YearOrDate),
  died: YearOrDate,
  photo: OptionalImage,
  parteImage: OptionalImage,
  partePdf: nullable(DocumentFile),
  ceremony: z.preprocess(emptyObjectToNull, NoticeCeremony.nullable()).default(null),
  // Link only, never an embed; the stream is run by the hall or crematorium (research L14).
  livestreamUrl: nullable(HttpsUrl),
  familyNote: optionalText(600),
  // "Kondolenci můžete zaslat prostřednictvím pohřební služby" with the office e-mail.
  condolencesViaOffice: flag(false),
  publishFrom: nullable(IsoDate),
  publishUntil: IsoDate,
  noindex: flag(true),
  listed: flag(true),
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
  consent: z.preprocess(emptyObjectToNull, NoticeConsent.nullable()).default(null),
};

function unknownNoticeKeys(issueData: { code?: string; keys?: readonly PropertyKey[] }): string | undefined {
  if (issueData.code !== "unrecognized_keys") {
    return undefined;
  }
  const keys = (issueData.keys ?? []).map((key) => String(key)).join(", ");
  return `Oznámení nesmí obsahovat pole ${keys}: žádné ceny, služby ani propagaci (zákon o regulaci reklamy).`;
}

/**
 * Smuteční oznámení / obřad (routes /oznameni/ and /oznameni/<slug>/). A strict object: there are
 * no price, service or promotional fields, and unknown keys fail the schema (research L1).
 */
export const Notice = z
  .strictObject(NOTICE_SHAPE, { error: unknownNoticeKeys })
  .superRefine((notice, ctx) => {
    if (notice.born !== null && notice.born.slice(0, 4) > notice.died.slice(0, 4)) {
      issue(ctx, ["born"], "Datum narození musí předcházet datu úmrtí.");
    }
    if (notice.born !== null && notice.born.length === 10 && notice.died.length === 10) {
      if (notice.born > notice.died) {
        issue(ctx, ["born"], "Datum narození musí předcházet datu úmrtí.");
      }
    }
    if (notice.publishFrom !== null && notice.publishFrom > notice.publishUntil) {
      issue(ctx, ["publishUntil"], "Konec zveřejnění musí být stejný nebo pozdější než začátek.");
    }
  });
export type Notice = z.infer<typeof Notice>;

/** Lidé: staff shown on the site. Consent is recorded in provenance/approvals.json (G-074). */
export const Person = z.object({
  name: text(120),
  role: text(120),
  photo: OptionalImage,
  phone: nullable(Phone),
  order: Order,
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type Person = z.infer<typeof Person>;

export const FAQ_TOPICS = [
  "first-steps",
  "arrangements",
  "ceremony",
  "cremation-urn",
  "documents",
  "costs",
  "other",
] as const;
export type FaqTopic = (typeof FAQ_TOPICS)[number];

/** Časté otázky. The Markdown body is the answer. */
export const Faq = z.object({
  question: text(200),
  topic: z.enum(FAQ_TOPICS),
  order: Order,
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type Faq = z.infer<typeof Faq>;

export const DOCUMENT_KINDS = [
  "rad-pohrebni-sluzby",
  "obchodni-podminky",
  "reklamacni-rad",
  "other",
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/** Dokumenty ke stažení (research L3, L10). The PDF is copied to /dokumenty/<file> as it is. */
export const DocumentEntry = z.object({
  title: text(120),
  file: DocumentFile,
  kind: z.enum(DOCUMENT_KINDS),
  validFrom: nullable(IsoDate),
  order: Order,
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
export type DocumentEntry = z.infer<typeof DocumentEntry>;

export const DEFAULT_ADR_NAME = "Česká obchodní inspekce";
export const DEFAULT_ADR_URL = "https://adr.coi.cz";

/** Právní informace (site/legal.json, optional): the ADR body and complaints contact (research L10). */
export const LegalInfo = z.object({
  adr: objectOrEmpty(
    z.object({
      name: z.preprocess(emptyToUndefined, text(120).default(DEFAULT_ADR_NAME)),
      url: z.preprocess(emptyToUndefined, Url.default(DEFAULT_ADR_URL)),
    }),
  ),
  complaintsContact: optionalText(400),
});
export type LegalInfo = z.infer<typeof LegalInfo>;

// ---------------------------------------------------------------------------
// §6.11 Pricing
// ---------------------------------------------------------------------------

const Money = z
  .number()
  .int("Částku zadejte v celých korunách.")
  .min(0)
  .max(2_000_000, "Částka je mimo povolený rozsah.");

export const PriceItem = z.object({
  id: Id,
  label: text(100),
  description: optionalText(240),
  kind: z.enum(["fixed", "from", "range", "on-request"]),
  amount: nullable(Money),
  amountMax: nullable(Money),
  unit: optionalText(30),
  status: z.enum(["demo", "approved"]),
});
export type PriceItem = z.infer<typeof PriceItem>;

export const PriceGroup = z.object({
  id: Id,
  title: text(80),
  description: optionalText(240),
  items: z.array(PriceItem).min(1, "Skupina musí mít alespoň jednu položku."),
  // "Co je v ceně" (research §8): what the group's price includes and what is still to choose.
  includes: z.array(text(160)).default([]),
  excludes: z.array(text(160)).default([]),
});
export type PriceGroup = z.infer<typeof PriceGroup>;

/**
 * New price groups and items added in the CMS arrive without ids (B7). Groups get a slug of their
 * title; items get "<group id>-<slug of label>", unique across the whole price list, because item
 * ids must be unique list-wide. Explicit ids are kept as written.
 */
function derivePriceIds(value: unknown): unknown {
  const groups = withDerivedIds(labelField("title", "skupina"))(value);
  if (!Array.isArray(groups)) {
    return groups;
  }
  const used = new Set<string>();
  for (const group of groups) {
    const items = (group as { items?: unknown }).items;
    if (!Array.isArray(items)) {
      continue;
    }
    for (const item of items) {
      const id = (item as { id?: unknown }).id;
      if (typeof id === "string" && id.trim() !== "") {
        used.add(id.trim());
      }
    }
  }
  return groups.map((group: unknown) => {
    if (typeof group !== "object" || group === null) {
      return group;
    }
    const record = group as Record<string, unknown>;
    if (!Array.isArray(record.items)) {
      return record;
    }
    const groupId = String(record.id);
    const items = record.items.map((item: unknown, index) => {
      if (typeof item !== "object" || item === null) {
        return item;
      }
      const entry = item as Record<string, unknown>;
      if (typeof entry.id === "string" && entry.id.trim() !== "") {
        return entry;
      }
      const base = `${groupId}-${asciiSlug(labelField("label", "polozka")(entry, index))}`;
      let candidate = base;
      let suffix = 2;
      while (used.has(candidate)) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      used.add(candidate);
      return { ...entry, id: candidate };
    });
    return { ...record, items };
  });
}

export const Pricing = z
  .object({
    visible: z.boolean(),
    currency: z.literal("CZK"),
    vatNote: optionalText(120),
    validFrom: nullable(IsoDate),
    generalNote: optionalText(400),
    groups: z.preprocess(derivePriceIds, z.array(PriceGroup)),
  })
  .superRefine((pricing, ctx) => {
    const itemIds = new Set<string>();
    reportDuplicateIds(ctx, ["groups"], pricing.groups);
    pricing.groups.forEach((group, g) => {
      group.items.forEach((item, i) => {
        const path = ["groups", g, "items", i];
        if (itemIds.has(item.id)) {
          issue(ctx, [...path, "id"], `Duplicitní id položky "${item.id}".`);
        }
        itemIds.add(item.id);
        checkPriceItemAmounts(ctx, path, item);
      });
    });
  });
export type Pricing = z.infer<typeof Pricing>;

function checkPriceItemAmounts(ctx: RefinementContext, path: PropertyKey[], item: PriceItem): void {
  if (item.kind === "on-request") {
    if (item.amount !== null || item.amountMax !== null) {
      issue(ctx, path, "Položka 'na dotaz' nesmí mít částku.");
    }
    return;
  }
  if (item.amount === null) {
    issue(ctx, [...path, "amount"], "Doplňte částku.");
  }
  if (item.kind === "range") {
    const validRange = item.amount !== null && item.amountMax !== null && item.amountMax > item.amount;
    if (!validRange) {
      issue(ctx, [...path, "amountMax"], "Horní mez rozpětí musí být vyšší než dolní.");
    }
  } else if (item.amountMax !== null) {
    issue(ctx, [...path, "amountMax"], "Horní mez vyplňte jen u rozpětí.");
  }
}

// ---------------------------------------------------------------------------
// Schema registry for files and collections
// ---------------------------------------------------------------------------

export const SINGLETON_SCHEMAS = {
  company: Company,
  contact: Contact,
  "office-hours": OfficeHours,
  emergency: EmergencyTransport,
  pricing: Pricing,
} as const;
export type SingletonName = keyof typeof SINGLETON_SCHEMAS;
export const SINGLETON_NAMES = Object.keys(SINGLETON_SCHEMAS) as SingletonName[];

/** Singletons a site may omit (the file is then simply absent and the value is null). */
export const OPTIONAL_SINGLETON_SCHEMAS = {
  legal: LegalInfo,
} as const;
export type OptionalSingletonName = keyof typeof OPTIONAL_SINGLETON_SCHEMAS;
export const OPTIONAL_SINGLETON_NAMES = Object.keys(OPTIONAL_SINGLETON_SCHEMAS) as OptionalSingletonName[];

export const COLLECTION_SCHEMAS = {
  pages: Page,
  services: Service,
  guidance: Guidance,
  coffins: Coffin,
  flowers: FlowerArrangement,
  articles: Article,
  notices: Notice,
  people: Person,
  faq: Faq,
  documents: DocumentEntry,
} as const;
export type CollectionName = keyof typeof COLLECTION_SCHEMAS;
export const COLLECTION_NAMES = Object.keys(COLLECTION_SCHEMAS) as CollectionName[];
