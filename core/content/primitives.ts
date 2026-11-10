/**
 * Shared Zod primitives for the content contract (docs/content-contract.md §6.0).
 * Error messages are Czech because CMS editors read them in build logs.
 */
import { z } from "astro/zod";

/** CMS tools often write "" for an emptied optional field; treat it as "no value". */
function emptyToNull(value: unknown): unknown {
  if (value === "" || value === undefined) {
    return null;
  }
  return value;
}

/** YAML frontmatter parsers may turn 2026-11-05 into a Date; normalise to an ISO date string. */
function dateToIsoString(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

export const Id = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Použijte malá písmena bez diakritiky, číslice a pomlčky.");

export const Phone = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Telefon zadejte ve tvaru +420123456789 (bez mezer).");

export const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Čas zadejte ve tvaru HH:MM, např. 07:00.");

export const IsoDate = z.preprocess(
  dateToIsoString,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum zadejte ve tvaru RRRR-MM-DD."),
);

export const Day = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
export type Day = z.infer<typeof Day>;

export const DAY_ORDER: readonly Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Required single-line or multi-line text with a length limit. */
export function text(max: number) {
  return z.string().trim().min(1, "Pole nesmí být prázdné.").max(max, `Maximálně ${max} znaků.`);
}

/** Optional text: missing, null and "" all become null. */
export function optionalText(max: number) {
  return z.preprocess(emptyToNull, z.string().trim().max(max, `Maximálně ${max} znaků.`).nullable());
}

/** Optional value of any schema: missing, null and "" all become null. */
export function nullable<T extends z.ZodType>(schema: T) {
  return z.preprocess(emptyToNull, schema.nullable());
}

export const Email = z.email("Zadejte platnou e-mailovou adresu.");
export const Url = z.url("Zadejte celou adresu včetně https://.");
/** A link that must use HTTPS (e.g. a ceremony livestream run by the hall or crematorium). */
export const HttpsUrl = z.url({
  protocol: /^https$/,
  error: "Zadejte celou adresu začínající https://.",
});

/** Year ("1941") or full date ("1941-04-03"): notices may give either (research §8). */
export const YearOrDate = z.preprocess(
  yearOrDateToString,
  z.string().regex(/^\d{4}(-\d{2}-\d{2})?$/, "Zadejte rok (RRRR) nebo datum (RRRR-MM-DD)."),
);

function yearOrDateToString(value: unknown): unknown {
  if (typeof value === "number" && Number.isInteger(value)) {
    return String(value);
  }
  return dateToIsoString(value);
}

export const Order = z.number().int().min(0).max(999).default(100);

// ---------------------------------------------------------------------------
// Tolerance for what Pages CMS writes (docs/spikes/pages-cms.md B3, B6, B7)
// ---------------------------------------------------------------------------

/** Pages CMS deletes empty values on save, so a whole object of nulls may vanish: treat missing as {}. */
export function objectOrEmpty<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => {
    if (value === undefined || value === null) {
      return {};
    }
    return value;
  }, schema);
}

/** Boolean that a CMS may leave as null/missing (it cannot represent "unset"): null → fallback. */
export function flag(fallback: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    return value;
  }, z.boolean());
}

/** "Příliš žluťoučký kůň" → "prilis-zlutoucky-kun"; never empty (falls back to "polozka"). */
export function asciiSlug(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug === "") {
    return "polozka";
  }
  return slug;
}

/**
 * Lists the client can extend in the CMS: new rows arrive without an `id` (B7). Missing or empty ids
 * are derived from a label (ASCII slug, "-2", "-3" on collision). Explicit ids are kept as written, so
 * duplicate explicit ids are still reported by the schema.
 */
export function withDerivedIds(labelOf: (item: Record<string, unknown>, index: number) => string) {
  return (value: unknown): unknown => {
    if (!Array.isArray(value)) {
      return value;
    }
    const explicit = new Set<string>();
    for (const item of value) {
      if (typeof item === "object" && item !== null && typeof (item as { id?: unknown }).id === "string") {
        const id = (item as { id: string }).id.trim();
        if (id !== "") {
          explicit.add(id);
        }
      }
    }
    const used = new Set(explicit);
    return value.map((item: unknown, index) => {
      if (typeof item !== "object" || item === null) {
        return item;
      }
      const record = item as Record<string, unknown>;
      const current = typeof record.id === "string" ? record.id.trim() : "";
      if (current !== "") {
        return record;
      }
      const base = asciiSlug(labelOf(record, index));
      let candidate = base;
      let suffix = 2;
      while (used.has(candidate)) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      used.add(candidate);
      return { ...record, id: candidate };
    });
  };
}

/** Read a string field for id derivation, with a positional fallback. */
export function labelField(field: string, fallbackPrefix: string) {
  return (item: Record<string, unknown>, index: number): string => {
    const value = item[field];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      return value.join("-");
    }
    return `${fallbackPrefix}-${index + 1}`;
  };
}
