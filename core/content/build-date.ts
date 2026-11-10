/**
 * The build date ("today" for a static site): decides which notices are live (publishFrom /
 * publishUntil) and which ceremonies are upcoming. Builds stay deterministic when it is pinned:
 *   1. SITE_BUILD_DATE=YYYY-MM-DD in the environment (tests, CI, previews of a given day),
 *   2. site.config.ts `pinnedBuildDate` (fixtures and template development; prototype only, G-073),
 *   3. otherwise the current date in Europe/Prague.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type BuildDateSource = "env" | "config" | "clock";

export interface BuildDate {
  date: string;
  source: BuildDateSource;
}

/** Calendar date in Prague, so a build shortly after midnight CET uses the Czech date. */
export function pragueDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string): string => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function resolveBuildDate(input: {
  env?: string | undefined;
  pinned?: string | null;
  now?: Date;
}): BuildDate {
  const fromEnv = input.env?.trim() ?? "";
  if (fromEnv !== "") {
    if (!ISO_DATE.test(fromEnv)) {
      throw new Error(`SITE_BUILD_DATE must be YYYY-MM-DD, got "${input.env}".`);
    }
    return { date: fromEnv, source: "env" };
  }
  if (input.pinned !== undefined && input.pinned !== null) {
    return { date: input.pinned, source: "config" };
  }
  return { date: pragueDate(input.now ?? new Date()), source: "clock" };
}
