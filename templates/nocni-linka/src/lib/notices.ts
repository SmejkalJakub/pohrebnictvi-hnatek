/** Grouping for the large-type agenda on /oznameni/ (pure functions over core NoticeView). */
import type { NoticeIndex, NoticeView } from "@core/content/view-models.ts";

export interface AgendaDay {
  date: string;
  weekday: string;
  dateText: string;
  notices: NoticeView[];
}

export interface Agenda {
  /** Public ceremonies on or after the build date, grouped by day. */
  days: AgendaDay[];
  /** Listed notices without a public ceremony whose funeral is not yet past. */
  withoutPublic: NoticeView[];
  /** Everything else, most recent death first. */
  recent: NoticeView[];
}

function hasPublicCeremony(view: NoticeView): boolean {
  if (view.ceremony === null) {
    return false;
  }
  return view.ceremony.type === "civil" || view.ceremony.type === "church";
}

function notPast(view: NoticeView, buildDate: string): boolean {
  if (view.ceremony === null || view.ceremony.date === null) {
    return true;
  }
  return view.ceremony.date >= buildDate;
}

export function buildAgenda(index: NoticeIndex, buildDate: string): Agenda {
  const days: AgendaDay[] = [];
  for (const view of index.upcoming) {
    const ceremony = view.ceremony;
    if (ceremony === null || ceremony.date === null || !hasPublicCeremony(view)) {
      continue;
    }
    const last = days[days.length - 1];
    if (last !== undefined && last.date === ceremony.date) {
      last.notices.push(view);
    } else {
      days.push({
        date: ceremony.date,
        weekday: ceremony.weekday ?? "",
        dateText: ceremony.dateText ?? ceremony.date,
        notices: [view],
      });
    }
  }
  const all = [...index.upcoming, ...index.recent];
  const withoutPublic = all.filter((view) => !hasPublicCeremony(view) && notPast(view, buildDate));
  const recent = index.recent.filter((view) => !withoutPublic.includes(view));
  return { days, withoutPublic, recent };
}
