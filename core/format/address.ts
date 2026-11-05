/** Address formatting for Czech postal style. */
import type { Address } from "../content/schemas.ts";
import { NBSP } from "./phone.ts";

export function formatPostalCode(postalCode: string): string {
  const digits = postalCode.replace(/\s/g, "");
  return `${digits.slice(0, 3)}${NBSP}${digits.slice(3)}`;
}

/** Two display lines: street line, then "PSČ Obec". */
export function formatAddressLines(address: Address): [string, string] {
  return [address.street, `${formatPostalCode(address.postalCode)} ${address.city}`];
}

export function formatAddressInline(address: Address): string {
  const [street, cityLine] = formatAddressLines(address);
  return `${street}, ${cityLine}`;
}
