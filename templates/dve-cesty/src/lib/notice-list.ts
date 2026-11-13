/**
 * The notice list on /oznameni/ (pure functions over core NoticeView): upcoming farewells grouped
 * by day, then the recent notices. Listed notices without a public ceremony that are not past
 * count as upcoming (in their own group, "Bez veřejného rozloučení").
 */
import type { NoticeIndex, NoticeView } from "@core/content/view-models.ts";

export interface NoticeDay {
  /** YYYY-MM-DD, or null for the group without a public ceremony date. */
  date: string | null;
  weekday: string | null;
  dateText: string | null;
  notices: NoticeView[];
}

export interface NoticeList {
  days: NoticeDay[];
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

function dayOf(view: NoticeView): string | null {
  if (view.ceremony === null) {
    return null;
  }
  return view.ceremony.date;
}

export function buildNoticeList(index: NoticeIndex, buildDate: string): NoticeList {
  const withoutPublic = index.recent.filter((view) => !hasPublicCeremony(view) && notPast(view, buildDate));
  const upcoming = [...index.upcoming, ...withoutPublic];
  const recent = index.recent.filter((view) => !withoutPublic.includes(view));

  const days: NoticeDay[] = [];
  const undated: NoticeView[] = [];
  for (const view of upcoming) {
    const date = dayOf(view);
    if (date === null || view.ceremony === null) {
      undated.push(view);
      continue;
    }
    let day = days.find((entry) => entry.date === date);
    if (day === undefined) {
      day = { date, weekday: view.ceremony.weekday, dateText: view.ceremony.dateText, notices: [] };
      days.push(day);
    }
    day.notices.push(view);
  }
  days.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  if (undated.length > 0) {
    days.push({ date: null, weekday: null, dateText: null, notices: undated });
  }
  return { days, recent };
}

/** One short line under the name: "10.00, smuteční síň ve Vzorově" or the line for no ceremony. */
export function ceremonyShortLine(
  view: NoticeView,
  text: {
    line: (time: string | null, place: string | null) => string;
    without: string;
    private: string;
  },
): string | null {
  const ceremony = view.ceremony;
  if (ceremony === null) {
    return null;
  }
  if (ceremony.type === "without-ceremony") {
    return text.without;
  }
  if (ceremony.type === "private") {
    return text.private;
  }
  const line = text.line(ceremony.timeText, ceremony.placeName);
  if (line === "") {
    return null;
  }
  return line;
}

/** The ceremony as one plain sentence (notice page), or the line for a funeral without (public) ceremony. */
export function ceremonySentence(
  view: NoticeView,
  text: {
    sentence: (weekday: string, date: string, time: string | null, place: string | null) => string;
    without: string;
    private: string;
  },
): string | null {
  const ceremony = view.ceremony;
  if (ceremony === null) {
    return null;
  }
  if (ceremony.type === "without-ceremony") {
    return text.without;
  }
  if (ceremony.type === "private") {
    return text.private;
  }
  if (ceremony.weekday === null || ceremony.dateText === null) {
    return null;
  }
  return text.sentence(ceremony.weekday, ceremony.dateText, ceremony.timeText, ceremony.placeName);
}
