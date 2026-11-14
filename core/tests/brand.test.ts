/**
 * Brand profile (template-contract §8a): colour maths, derived roles with guaranteed contrast,
 * the font registry, the virtual-module source and gate rules G-090 / G-091.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { contrast, ensureContrast, fromOklch, toOklch } from "../brand/color.ts";
import { BRAND_FONTS, fontFiles, type BrandFontId } from "../brand/fonts.ts";
import { brandModuleSource } from "../brand/module.ts";
import { BrandProfile, deriveBrandTokens } from "../brand/profile.ts";
import { SiteConfig } from "../content/config.ts";
import type { ValidatedContent } from "../content/snapshot.ts";
import { runGate } from "../gate/rules.ts";
import { loadFixture, makeProductionReady, PRODUCTION_BUILD_DATE } from "./helpers.ts";

const NODE_MODULES = fileURLToPath(new URL("../../node_modules", import.meta.url));

/** The Hnátek brand board (clients/hnatek/brand/preview/brand-overview.png). */
const HNATEK = BrandProfile.parse({
  colors: { primary: "#0B3D2C", secondary: "#C9A24A", neutral: "#8A8A8A", ground: "#F9F6EF" },
  fonts: { display: "playfair-display", body: "source-serif-4" },
});

let fixture: ValidatedContent;

beforeAll(async () => {
  fixture = await loadFixture();
});

describe("colour maths", () => {
  it("computes WCAG contrast", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("round-trips through OKLCH", () => {
    for (const hex of ["#0b3d2c", "#c9a24a", "#f9f6ef", "#1c2940"]) {
      expect(fromOklch(toOklch(hex))).toBe(hex);
    }
  });

  it("moves a colour along its hue until it reaches the ratio", () => {
    const gold = ensureContrast("#c9a24a", ["#f9f6ef"], 4.5);
    expect(contrast(gold, "#f9f6ef")).toBeGreaterThanOrEqual(4.5);
    expect(Math.abs(toOklch(gold).h - toOklch("#c9a24a").h)).toBeLessThan(6);
  });
});

describe("BrandProfile", () => {
  it("normalises hex colours and defaults the optional parts", () => {
    const profile = BrandProfile.parse({ colors: { primary: "0B3D2C" } });
    expect(profile.colors.primary).toBe("#0b3d2c");
    expect(profile.colors.secondary).toBeNull();
    expect(profile.fonts).toEqual({ display: null, body: null });
    expect(profile.mark).toBeNull();
  });

  it("rejects colours that are not hex and fonts outside the registry", () => {
    expect(BrandProfile.safeParse({ colors: { primary: "zelená" } }).success).toBe(false);
    expect(
      BrandProfile.safeParse({ colors: { primary: "#000" }, fonts: { display: "cormorant-garamond" } })
        .success,
    ).toBe(false);
  });

  it("is optional in site.config", () => {
    const base = {
      template: "x",
      siteUrl: "https://example.invalid",
      features: {},
      homepage: { sections: ["hero"] },
    };
    expect(SiteConfig.parse(base).brand).toBeNull();
    expect(
      SiteConfig.parse({ ...base, brand: { colors: { primary: "#0B3D2C" } } }).brand?.colors.primary,
    ).toBe("#0b3d2c");
  });
});

describe("deriveBrandTokens", () => {
  const { vars, adjustments } = deriveBrandTokens(HNATEK);
  const v = (name: string): string => {
    const value = vars[name];
    if (value === undefined) {
      throw new Error(`missing role ${name}`);
    }
    return value;
  };

  it("keeps the board's ground and primary for fills", () => {
    expect(v("ground")).toBe("#f9f6ef");
    expect(v("primary")).toBe("#0b3d2c");
    expect(v("secondary")).toBe("#c9a24a");
  });

  it("guarantees AA text contrast for every text role on its background", () => {
    for (const bg of ["ground", "surface", "surface-2"]) {
      expect(contrast(v("ink"), v(bg))).toBeGreaterThanOrEqual(12);
      expect(contrast(v("muted"), v(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(v("primary-text"), v(bg))).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(v("secondary-text"), v("ground"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(v("on-primary"), v("primary"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(v("muted-on-primary"), v("primary"))).toBeGreaterThanOrEqual(4.5);
    for (const bg of ["deep", "deep-2"]) {
      expect(contrast(v("on-deep"), v(bg))).toBeGreaterThanOrEqual(12);
      expect(contrast(v("muted-on-deep"), v(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(v("signal-on-deep"), v(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(v("primary-on-deep"), v(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(v("rule-on-deep"), v(bg))).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(v("rule"), v("ground"))).toBeGreaterThanOrEqual(3);
  });

  it("reports the gold it had to darken for text on cream", () => {
    expect(adjustments.map((adjustment) => adjustment.role)).toContain("secondary-text");
  });

  it("replaces a ground that is too dark to read on", () => {
    const dark = deriveBrandTokens(BrandProfile.parse({ colors: { primary: "#0B3D2C", ground: "#0B3D2C" } }));
    expect(dark.groundReplaced).toBe(true);
    expect(toOklch(dark.vars.ground ?? "").l).toBeGreaterThan(0.9);
  });

  it("works for a light primary too (text roles are darkened, fills keep the colour)", () => {
    const light = deriveBrandTokens(BrandProfile.parse({ colors: { primary: "#9FC5E8" } }));
    expect(light.vars.primary).toBe("#9fc5e8");
    expect(contrast(light.vars["primary-text"] ?? "", light.vars.ground ?? "")).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light.vars["on-primary"] ?? "", light.vars.primary ?? "")).toBeGreaterThanOrEqual(4.5);
  });

  it("adds font stacks only for fonts the brand names", () => {
    expect(vars["font-display"]).toContain('"Playfair Display"');
    expect(vars["font-body"]).toContain('"Source Serif 4"');
    expect(
      deriveBrandTokens(BrandProfile.parse({ colors: { primary: "#000" } })).vars["font-display"],
    ).toBeUndefined();
  });
});

describe("font registry", () => {
  it("points at files that exist for every font, weight and subset", () => {
    for (const id of Object.keys(BRAND_FONTS) as BrandFontId[]) {
      for (const file of fontFiles(id)) {
        expect(existsSync(path.join(NODE_MODULES, file.specifier)), file.specifier).toBe(true);
      }
    }
  });
});

describe("brandModuleSource", () => {
  it("exports an empty brand without a profile", () => {
    expect(brandModuleSource(null)).toBe('export const brandCss = "";\nexport const brand = null;');
  });

  it("imports only the chosen fonts and emits the roles", () => {
    const source = brandModuleSource(HNATEK);
    expect(source).toContain(
      '"@fontsource/playfair-display/files/playfair-display-latin-ext-400-normal.woff2?url"',
    );
    expect(source).toContain("source-serif-4");
    expect(source).not.toContain("lora");
    expect(source).toContain("--brand-primary: #0b3d2c;");
    expect(source).toContain("unicode-range");
  });
});

describe("gate", () => {
  const gate = (content: ValidatedContent): ReturnType<typeof runGate> =>
    runGate(content, {
      mode: "production",
      now: new Date("2026-11-05T12:00:00Z"),
      buildDate: PRODUCTION_BUILD_DATE,
    });

  it("is silent without a brand", () => {
    const content = makeProductionReady(fixture);
    expect(gate(content).filter((finding) => finding.rule.startsWith("G-09"))).toEqual([]);
  });

  it("G-090 warns about adjusted colours, G-091 fails a missing mark", () => {
    const content = makeProductionReady(fixture);
    content.config.brand = { ...HNATEK, mark: "neni-tu.svg" };
    const findings = gate(content);
    expect(findings.filter((finding) => finding.rule === "G-090").every((f) => f.level === "warning")).toBe(
      true,
    );
    expect(findings.some((finding) => finding.rule === "G-090")).toBe(true);
    expect(findings.filter((finding) => finding.rule === "G-091").map((finding) => finding.level)).toEqual([
      "error",
    ]);
  });
});
