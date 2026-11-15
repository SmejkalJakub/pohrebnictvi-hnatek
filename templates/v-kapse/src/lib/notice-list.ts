/**
 * The calm list on /oznameni/ (pure functions over core NoticeView): "Nadcházející rozloučení"
 * holds the upcoming ceremonies and the listed notices without a public ceremony that are not
 * past; everything else is "Nedávná oznámení".
 */
import type { NoticeIndex, NoticeView } from "@core/content/view-models.ts";

export interface NoticeList {
  upcoming: NoticeView[];
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

export function buildNoticeList(index: NoticeIndex, buildDate: string): NoticeList {
  const withoutPublic = index.recent.filter((view) => !hasPublicCeremony(view) && notPast(view, buildDate));
  const upcoming = [...index.upcoming, ...withoutPublic];
  const recent = index.recent.filter((view) => !withoutPublic.includes(view));
  return { upcoming, recent };
}

/** The ceremony as one plain sentence, or the line for a funeral without (public) ceremony. */
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
