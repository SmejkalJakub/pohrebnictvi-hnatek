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

export const Order = z.number().int().min(0).max(999).default(100);
