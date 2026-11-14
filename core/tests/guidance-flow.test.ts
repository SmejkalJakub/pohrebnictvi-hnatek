import { describe, expect, it } from "vitest";
import {
  chooserSituations,
  guideSentence,
  nextGuidanceStep,
  showsFor,
  situationsAttribute,
  type GuidanceSituation,
} from "../content/guidance-flow.ts";

function entry(id: string, situations: GuidanceSituation[]) {
  return { id, data: { situations } };
}

const guide = [
  entry("umrti-doma", ["home"]),
  entry("umrti-v-nemocnici", ["hospital", "care-home"]),
  entry("sjednani", ["any"]),
  entry("doklady", ["any"]),
];

describe("guidance flow", () => {
  it("offers only situations named by situation-specific entries, in chooser order", () => {
    expect(chooserSituations(guide)).toEqual(["home", "hospital", "care-home"]);
    expect(chooserSituations([entry("a", ["any"]), entry("b", ["any", "home"])])).toEqual([]);
  });

  it("shows general entries for every situation and specific ones only for theirs", () => {
    expect(showsFor(guide[0]!, "home")).toBe(true);
    expect(showsFor(guide[0]!, "hospital")).toBe(false);
    expect(showsFor(guide[2]!, "abroad")).toBe(true);
  });

  it("writes the data-situations attribute", () => {
    expect(situationsAttribute(guide[1]!)).toBe("hospital care-home");
    expect(situationsAttribute(entry("x", ["any", "home"]))).toBe("any");
  });

  it("links the next step that is visible whenever the current one is", () => {
    expect(nextGuidanceStep(guide, 0)?.id).toBe("sjednani");
    expect(nextGuidanceStep(guide, 1)?.id).toBe("sjednani");
    expect(nextGuidanceStep(guide, 2)?.id).toBe("doklady");
    expect(nextGuidanceStep(guide, 3)).toBeNull();
  });

  it("skips a later specific step after a general one", () => {
    const mixed = [entry("a", ["any"]), entry("b", ["home"]), entry("c", ["any"])];
    expect(nextGuidanceStep(mixed, 0)?.id).toBe("c");
  });

  it("follows a specific step to a later step that covers the same situations", () => {
    const chain = [entry("a", ["home"]), entry("b", ["home", "hospital"]), entry("c", ["any"])];
    expect(nextGuidanceStep(chain, 0)?.id).toBe("b");
  });
});

describe("guideSentence", () => {
  it("turns a short lower-case item into a sentence", () => {
    expect(guideSentence("zavolat lékaře na čísle 155 nebo 112")).toBe(
      "Zavolat lékaře na čísle 155 nebo 112.",
    );
    expect(guideSentence("  občanský průkaz zesnulého ")).toBe("Občanský průkaz zesnulého.");
  });

  it("keeps the item's own end punctuation and Czech capitals", () => {
    expect(guideSentence("čekat na lékaře!")).toBe("Čekat na lékaře!");
    expect(guideSentence("Už hotová věta.")).toBe("Už hotová věta.");
    expect(guideSentence("")).toBe("");
  });
});
