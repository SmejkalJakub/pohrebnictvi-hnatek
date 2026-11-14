/**
 * "Is the office open right now?" from office-hours.json, computed in the visitor's browser
 * (core/client/interactions.ts) for Europe/Prague. Pure and deterministic so it can be tested.
 *
 * Czech public holidays are known: on a holiday the office counts as closed when office-hours.json
 * has a holidayNote, and the status is "unknown" (nothing is shown) when it does not, because the
 * site cannot know.
 */
import type { Day } from "../content/primitives.ts";
import type { OfficeHours } from "../content/schemas.ts";
import { glueOneLetterWords } from "../typography/czech.ts";

// Kept local (not imported from primitives.ts / hours.ts) so the browser bundle stays free of zod.
const DAY_ORDER: readonly Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LONG: Record<Day, string> = {
  mon: "pondělí",
  tue: "úterý",
  wed: "středa",
  thu: "čtvrtek",
  fri: "pátek",
  sat: "sobota",
  sun: "neděle",
};

/** "07:00" → "7:00" (same as formatTime in hours.ts). */
function formatTime(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

export type OfficeState = "open" | "break" | "closed" | "unknown";

export interface OfficeStatus {
  state: OfficeState;
  /** A full sentence, e.g. "Kancelář je teď otevřená, do 15:30." Empty when unknown. */
  text: string;
  /** A short label, e.g. "Otevřeno do 15:30". Empty when unknown. */
  short: string;
}

/** The moment to evaluate, already converted to Prague local time. */
export interface PragueMoment {
  /** YYYY-MM-DD */
  date: string;
  day: Day;
  /** Minutes since local midnight. */
  minutes: number;
}

interface DaySchedule {
  open: number;
  close: number;
  breaks: { from: number; to: number }[];
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function fromMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return formatTime(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
}

/** Easter Sunday (Gregorian), as YYYY-MM-DD in UTC arithmetic. */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoOf(date);
}

/** Státní svátky a ostatní svátky (zákon 245/2000 Sb.), when shops and offices usually close. */
export function isCzechPublicHoliday(iso: string): boolean {
  const monthDay = iso.slice(5);
  const fixed = [
    "01-01",
    "05-01",
    "05-08",
    "07-05",
    "07-06",
    "09-28",
    "10-28",
    "11-17",
    "12-24",
    "12-25",
    "12-26",
  ];
  if (fixed.includes(monthDay)) {
    return true;
  }
  const easter = easterSunday(Number(iso.slice(0, 4)));
  const goodFriday = new Date(easter);
  goodFriday.setUTCDate(easter.getUTCDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setUTCDate(easter.getUTCDate() + 1);
  return iso === isoOf(goodFriday) || iso === isoOf(easterMonday);
}

function dayOf(iso: string): Day {
  // 1970-01-01 was a Thursday; DAY_ORDER starts on Monday.
  const days = Math.round(new Date(`${iso}T00:00:00Z`).getTime() / 86_400_000);
  const index = (((days + 3) % 7) + 7) % 7;
  const day = DAY_ORDER[index];
  if (day === undefined) {
    throw new Error(`No weekday for ${iso}`);
  }
  return day;
}

/** The schedule for one date, null when closed, "unknown" when it cannot be known. */
function scheduleFor(hours: OfficeHours, iso: string): DaySchedule | null | "unknown" {
  const exception = hours.exceptions.find((entry) => entry.from <= iso && iso <= entry.to);
  if (exception !== undefined) {
    if (exception.closed || exception.open === null || exception.close === null) {
      return null;
    }
    return { open: toMinutes(exception.open), close: toMinutes(exception.close), breaks: [] };
  }
  if (isCzechPublicHoliday(iso)) {
    if (hours.holidayNote === null) {
      return "unknown";
    }
    return null;
  }
  const day = dayOf(iso);
  const group = hours.weekly.find((entry) => entry.days.includes(day));
  if (group === undefined) {
    return null;
  }
  return {
    open: toMinutes(group.open),
    close: toMinutes(group.close),
    breaks: group.breaks.map((pause) => ({ from: toMinutes(pause.from), to: toMinutes(pause.to) })),
  };
}

function whenLabel(offset: number, iso: string): string {
  if (offset === 0) {
    return "dnes";
  }
  if (offset === 1) {
    return "zítra";
  }
  const day = DAY_LONG[dayOf(iso)];
  let preposition = "v";
  if (day === "středa") {
    return "ve středu";
  }
  if (day === "čtvrtek") {
    preposition = "ve";
  }
  const accusative: Record<string, string> = { sobota: "sobotu", neděle: "neděli" };
  return `${preposition} ${accusative[day] ?? day}`;
}

const UNKNOWN: OfficeStatus = { state: "unknown", text: "", short: "" };

/** The office status at a Prague moment, with Czech one-letter words glued (it is set in the browser). */
export function officeStatusAt(hours: OfficeHours, now: PragueMoment): OfficeStatus {
  const status = rawOfficeStatusAt(hours, now);
  return { state: status.state, text: glueOneLetterWords(status.text), short: glueOneLetterWords(status.short) };
}

function rawOfficeStatusAt(hours: OfficeHours, now: PragueMoment): OfficeStatus {
  const today = scheduleFor(hours, now.date);
  if (today === "unknown") {
    return UNKNOWN;
  }
  if (today !== null && now.minutes >= today.open && now.minutes < today.close) {
    const pause = today.breaks.find((entry) => now.minutes >= entry.from && now.minutes < entry.to);
    if (pause !== undefined) {
      const until = fromMinutes(pause.to);
      return {
        state: "break",
        text: `Kancelář má polední přestávku, otevíráme v ${until}.`,
        short: `Přestávka do ${until}`,
      };
    }
    const close = fromMinutes(today.close);
    return { state: "open", text: `Kancelář je teď otevřená, do ${close}.`, short: `Otevřeno do ${close}` };
  }
  for (let offset = 0; offset <= 14; offset++) {
    const iso = addDays(now.date, offset);
    const schedule = scheduleFor(hours, iso);
    if (schedule === "unknown") {
      return { state: "closed", text: "Kancelář je teď zavřená.", short: "Zavřeno" };
    }
    if (schedule === null) {
      continue;
    }
    if (offset === 0 && now.minutes >= schedule.open) {
      continue;
    }
    const open = fromMinutes(schedule.open);
    const when = whenLabel(offset, iso);
    return {
      state: "closed",
      text: `Kancelář je teď zavřená. Otevíráme ${when} v ${open}.`,
      short: `Zavřeno · otevíráme ${when} v ${open}`,
    };
  }
  return { state: "closed", text: "Kancelář je teď zavřená.", short: "Zavřeno" };
}

/** Convert an instant to Prague local date, weekday and minutes. */
export function pragueMoment(instant: Date): PragueMoment {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  return { date, day: dayOf(date), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}
