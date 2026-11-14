/** Notice sentences (research L1: the practical facts only). */
import type { NoticeView } from "@core/content/view-models.ts";
import { noCeremonyText, ui } from "../i18n/cs.ts";

/** "Rozloučení se koná v pátek 14. 11. 2026 v 10:00, Smuteční síň Vzorov." or the no-ceremony line. */
export function ceremonyLine(view: NoticeView): string {
  const ceremony = view.ceremony;
  if (ceremony === null) {
    return noCeremonyText["without-ceremony"];
  }
  if (ceremony.date !== null && ceremony.weekday !== null && ceremony.dateText !== null) {
    return ui.ceremonySentence(ceremony.weekday, ceremony.dateText, ceremony.timeText, ceremony.placeName);
  }
  return noCeremonyText[ceremony.type];
}
