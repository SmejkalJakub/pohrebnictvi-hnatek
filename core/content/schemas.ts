/**
 * Content schemas: the normative contract from docs/content-contract.md §6.
 * Flat, CMS-shaped objects only (no discriminated unions), so Pages CMS can edit them.
 */
import { z } from "astro/zod";
import {
  Day,
  Email,
  Id,
  IsoDate,
  Order,
  Phone,
  Time,
  Url,
  nullable,
  optionalText,
  text,
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
    decorative: z.boolean().default(false),
    caption: optionalText(240),
    credit: optionalText(120),
    source: z.enum(["client", "existing-website", "own-photo", "licensed-stock", "placeholder"]),
    depicts: z.enum(["actual-business", "generic", "placeholder"]),
    rightsConfirmed: z.boolean().default(false),
    focus: z.enum(["center", "top", "bottom", "left", "right"]).default("center"),
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

const OptionalImage = nullable(ImageRef).default(null);

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
  legalIds: z.object({
    ico: nullable(z.string().regex(/^\d{8}$/, "IČO má 8 číslic.")),
    dic: nullable(z.string().regex(/^CZ\d{8,10}$/, "DIČ zadejte ve tvaru CZ12345678.")),
    registryEntry: optionalText(200),
    registeredOffice: nullable(Address),
  }),
  tradition: z.object({
    publicWording: optionalText(120),
    foundedYear: nullable(z.number().int().min(1800).max(2100)),
  }),
  familyOwned: nullable(z.boolean()),
  logo: OptionalImage,
});
export type Company = z.infer<typeof Company>;

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
    phones: z.array(ContactPhone).min(1, "Uveďte alespoň jeden telefon."),
    emails: z.array(z.object({ id: Id, label: text(60), address: Email })).default([]),
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
    weekly: z.array(OfficeHoursGroup),
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
});
export type PriceGroup = z.infer<typeof PriceGroup>;

export const Pricing = z
  .object({
    visible: z.boolean(),
    currency: z.literal("CZK"),
    vatNote: optionalText(120),
    validFrom: nullable(IsoDate),
    generalNote: optionalText(400),
    groups: z.array(PriceGroup),
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

export const COLLECTION_SCHEMAS = {
  pages: Page,
  services: Service,
  guidance: Guidance,
  coffins: Coffin,
  flowers: FlowerArrangement,
  articles: Article,
} as const;
export type CollectionName = keyof typeof COLLECTION_SCHEMAS;
export const COLLECTION_NAMES = Object.keys(COLLECTION_SCHEMAS) as CollectionName[];
