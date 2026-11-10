/** Czech date formatting for notices and documents: "14. 11. 2026", "pátek 14. 11. 2026", "10:00". */
import { NBSP } from "./phone.ts";

const WEEKDAYS = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"] as const;

function parseIsoDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) {
    throw new Error(`Expected YYYY-MM-DD, got "${value}".`);
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** "2026-11-14" → "14. 11. 2026" (non-breaking spaces, so the date never wraps). */
export function formatCzechDate(value: string): string {
  const { year, month, day } = parseIsoDate(value);
  return `${day}.${NBSP}${month}.${NBSP}${year}`;
}

/** "2026-11-14" → "pátek". The weekday is computed in UTC, so it never depends on the build machine. */
export function czechWeekday(value: string): string {
  const { year, month, day } = parseIsoDate(value);
  const index = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEKDAYS[index] as string;
}

/** "1941" stays "1941"; "1941-04-03" → "3. 4. 1941". */
export function formatYearOrDate(value: string): string {
  if (/^\d{4}$/.test(value)) {
    return value;
  }
  return formatCzechDate(value);
}

/** "07:00" → "7:00" (Czech style without a leading zero, as in office hours). */
export function formatCzechTime(value: string): string {
  return value.replace(/^0(\d)/, "$1");
}
