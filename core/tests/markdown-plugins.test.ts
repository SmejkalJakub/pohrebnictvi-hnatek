import { describe, expect, it } from "vitest";
import {
  asciiHeadingIdsPlugin,
  demoteBodyH1Plugin,
  installContractMarkdownPlugins,
} from "../markdown/satteri-plugins.ts";

function recorder() {
  const calls: { key: string; value: unknown }[] = [];
  return {
    calls,
    setProperty(_node: unknown, key: string, value: unknown) {
      calls.push({ key, value });
    },
    textContent(node: unknown) {
      return (node as { text: string }).text;
    },
  };
}

describe("Sätteri plugins", () => {
  it("demotes H1 to H2 and leaves other levels alone", () => {
    const ctx = recorder();
    demoteBodyH1Plugin.heading({ type: "heading", depth: 1 }, ctx);
    demoteBodyH1Plugin.heading({ type: "heading", depth: 3 }, ctx);
    expect(ctx.calls).toEqual([{ key: "depth", value: 2 }]);
  });

  it("assigns unique ASCII ids and keeps existing ones", () => {
    const ctx = recorder();
    const plugin = asciiHeadingIdsPlugin();
    const heading = (text: string, id?: string) => ({
      type: "element" as const,
      tagName: "h2",
      properties: id === undefined ? {} : { id },
      text,
    });
    plugin.element.visit(heading("Co služba zahrnuje"), ctx);
    plugin.element.visit(heading("Co služba zahrnuje"), ctx);
    plugin.element.visit(heading("Vlastní", "vlastni-id"), ctx);
    expect(ctx.calls).toEqual([
      { key: "id", value: "co-sluzba-zahrnuje" },
      { key: "id", value: "co-sluzba-zahrnuje-1" },
    ]);
  });

  it("installs into a Sätteri processor only", () => {
    const options = { mdastPlugins: [] as unknown[], hastPlugins: [] as unknown[] };
    expect(installContractMarkdownPlugins({ name: "satteri", options })).toBe(true);
    expect(options.mdastPlugins).toHaveLength(1);
    expect(options.hastPlugins).toHaveLength(1);
    expect(installContractMarkdownPlugins({ name: "unified", options: {} })).toBe(false);
  });
});
