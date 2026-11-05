/** Office-hours formatting (content-contract §6.4). Templates choose the markup; core produces rows. */
import { DAY_ORDER, type Day } from "../content/primitives.ts";
import type { OfficeHours, OfficeHoursGroup } from "../content/schemas.ts";

export const DAY_SHORT: Record<Day, string> = {
  mon: "Po",
  tue: "Út",
  wed: "St",
  thu: "Čt",
  fri: "Pá",
  sat: "So",
  sun: "Ne",
};

export const DAY_LONG: Record<Day, string> = {
  mon: "pondělí",
  tue: "úterý",
  wed: "středa",
  thu: "čtvrtek",
  fri: "pátek",
  sat: "sobota",
  sun: "neděle",
};

export interface HoursRow {
  dayIds: Day[];
  /** "Po–Pá", "So", "Po, St" */
  days: string;
  /** "pondělí až pátek" — for accessible names and print. */
  daysLong: string;
  closed: boolean;
  /** "7:00–15:30" or "zavřeno" */
  text: string;
  /** "přestávka 12:00–12:30" or null */
  note: string | null;
}

/** "07:00" → "7:00" */
export function formatTime(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

function scheduleKey(group: OfficeHoursGroup | undefined): string {
  if (group === undefined) {
    return "closed";
  }
  const breaks = group.breaks.map((pause) => `${pause.from}-${pause.to}`).join(",");
  return `${group.open}-${group.close}|${breaks}`;
}

function describeDays(days: Day[]): { short: string; long: string } {
  const first = days[0];
  const last = days[days.length - 1];
  if (first === undefined || last === undefined) {
    throw new Error("describeDays needs at least one day");
  }
  if (days.length === 1) {
    return { short: DAY_SHORT[first], long: DAY_LONG[first] };
  }
  return { short: `${DAY_SHORT[first]}–${DAY_SHORT[last]}`, long: `${DAY_LONG[first]} až ${DAY_LONG[last]}` };
}

/**
 * One row per run of consecutive days with an identical schedule, covering all seven days.
 * Days not listed in `weekly` are reported explicitly as closed (never silently omitted).
 */
export function formatOfficeHours(hours: OfficeHours): HoursRow[] {
  const groupByDay = new Map<Day, OfficeHoursGroup>();
  for (const group of hours.weekly) {
    for (const day of group.days) {
      groupByDay.set(day, group);
    }
  }

  const runs: Day[][] = [];
  let previousKey: string | null = null;
  for (const day of DAY_ORDER) {
    const key = scheduleKey(groupByDay.get(day));
    const currentRun = runs[runs.length - 1];
    if (key === previousKey && currentRun !== undefined) {
      currentRun.push(day);
    } else {
      runs.push([day]);
    }
    previousKey = key;
  }

  return runs.map((days) => {
    const description = describeDays(days);
    const group = groupByDay.get(days[0] as Day);
    if (group === undefined) {
      return {
        dayIds: days,
        days: description.short,
        daysLong: description.long,
        closed: true,
        text: "zavřeno",
        note: null,
      };
    }
    let note: string | null = null;
    if (group.breaks.length > 0) {
      const pauses = group.breaks.map((pause) => `${formatTime(pause.from)}–${formatTime(pause.to)}`);
      note = `přestávka ${pauses.join(", ")}`;
    }
    return {
      dayIds: days,
      days: description.short,
      daysLong: description.long,
      closed: false,
      text: `${formatTime(group.open)}–${formatTime(group.close)}`,
      note,
    };
  });
}
