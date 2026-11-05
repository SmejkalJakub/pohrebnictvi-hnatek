/** Price formatting: whole CZK with non-breaking spaces (content-contract §6.11). */
import type { PriceItem } from "../content/schemas.ts";
import { NBSP } from "./phone.ts";

export function formatCzk(amount: number): string {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`Price amount must be a non-negative integer, got ${amount}`);
  }
  const digits = String(amount);
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) {
    groups.unshift(digits.slice(Math.max(0, end - 3), end));
  }
  return `${groups.join(NBSP)}${NBSP}Kč`;
}

function requireAmount(value: number | null, item: PriceItem): number {
  if (value === null) {
    throw new Error(`Price item "${item.id}" of kind "${item.kind}" has no amount.`);
  }
  return value;
}

/** Amount text only, without the demo marker. "na dotaz", "12 500 Kč", "od 3 900 Kč", "2 000–4 000 Kč". */
export function formatPriceAmount(item: PriceItem): string {
  let text: string;
  if (item.kind === "on-request") {
    text = "na dotaz";
  } else if (item.kind === "fixed") {
    text = formatCzk(requireAmount(item.amount, item));
  } else if (item.kind === "from") {
    text = `od${NBSP}${formatCzk(requireAmount(item.amount, item))}`;
  } else {
    const low = formatCzk(requireAmount(item.amount, item)).replace(`${NBSP}Kč`, "");
    text = `${low}–${formatCzk(requireAmount(item.amountMax, item))}`;
  }
  if (item.unit !== null && item.kind !== "on-request") {
    text = `${text} ${item.unit}`;
  }
  return text;
}
