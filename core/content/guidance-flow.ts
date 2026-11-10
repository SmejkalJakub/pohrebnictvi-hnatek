/**
 * Guided reading of the guidance collection, shared by every template (template-contract §6,
 * "Guided guidance"). Pure functions over sorted guidance entries (sortGuidance order):
 *  - which situations the guide can be filtered by ("Kde blízký člověk zemřel?"),
 *  - the ASCII anchor that selects a situation via :target (no JavaScript),
 *  - the step that follows a given step on every path that shows it.
 */
import type { Guidance } from "./schemas.ts";

export type GuidanceSituation = Guidance["situations"][number];
export type SpecificSituation = Exclude<GuidanceSituation, "any">;

/** Display order of the situation chooser. */
export const SPECIFIC_SITUATIONS: readonly SpecificSituation[] = ["home", "hospital", "care-home", "abroad"];

/** Fragment ids used as :target selectors on /jak-postupovat/ (e.g. /jak-postupovat/#situace-doma). */
export const SITUATION_ANCHOR: Record<SpecificSituation, string> = {
  home: "situace-doma",
  hospital: "situace-nemocnice",
  "care-home": "situace-domov",
  abroad: "situace-zahranici",
};

interface GuidanceLike {
  id: string;
  data: Pick<Guidance, "situations">;
}

function appliesToAll(entry: GuidanceLike): boolean {
  return entry.data.situations.includes("any");
}

/**
 * Situations worth offering in the chooser: those named by at least one entry that does not
 * apply to everybody. Without such entries filtering would change nothing, so the list is empty.
 */
export function chooserSituations(entries: readonly GuidanceLike[]): SpecificSituation[] {
  const named = new Set<SpecificSituation>();
  for (const entry of entries) {
    if (appliesToAll(entry)) {
      continue;
    }
    for (const situation of entry.data.situations) {
      if (situation !== "any") {
        named.add(situation);
      }
    }
  }
  return SPECIFIC_SITUATIONS.filter((situation) => named.has(situation));
}

/** True when the entry is shown for the chosen situation. */
export function showsFor(entry: GuidanceLike, situation: SpecificSituation): boolean {
  return appliesToAll(entry) || entry.data.situations.includes(situation);
}

/** Space-separated value for a `data-situations` attribute ("any" or the listed situations). */
export function situationsAttribute(entry: GuidanceLike): string {
  if (appliesToAll(entry)) {
    return "any";
  }
  return entry.data.situations.join(" ");
}

/**
 * The step to link as "Další krok" from entries[index]: the first later entry that is visible
 * whenever entries[index] is visible, so the link never points at a step hidden by the filter.
 * Returns null for the last step.
 */
export function nextGuidanceStep<T extends GuidanceLike>(entries: readonly T[], index: number): T | null {
  const current = entries[index];
  if (current === undefined) {
    return null;
  }
  for (const candidate of entries.slice(index + 1)) {
    if (appliesToAll(candidate)) {
      return candidate;
    }
    if (appliesToAll(current)) {
      continue;
    }
    const coversCurrent = current.data.situations.every((situation) => candidate.data.situations.includes(situation));
    if (coversCurrent) {
      return candidate;
    }
  }
  return null;
}
