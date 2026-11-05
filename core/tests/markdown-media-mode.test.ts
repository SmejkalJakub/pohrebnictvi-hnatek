import { describe, expect, it } from "vitest";
import { checkMarkdownBody } from "../markdown/restrict-body.ts";
import { isSupportedMediaFile, normalizeMediaFile } from "../media/normalize.ts";
import { resolveMode } from "../mode.ts";
import { resolveConfigOverride, resolveSiteRoot, sitePaths } from "../paths.ts";

function kinds(body: string): string[] {
  return checkMarkdownBody(body).map((issue) => issue.kind);
}

describe("restricted Markdown", () => {
  it("accepts ordinary prose, lists, https links and autolinks", () => {
    const body =
      "## Nadpis\n\nText s [odkazem](https://example.cz) a <https://example.cz>.\n\n- položka\n\n### Podnadpis\n";
    expect(kinds(body)).toEqual([]);
  });

  it("rejects H1, skipped levels, raw HTML, inline images and unsafe links", () => {
    expect(kinds("# Titulek")).toEqual(["h1"]);
    expect(kinds("## A\n\n#### B")).toEqual(["heading-skip"]);
    expect(kinds("### Hned třetí úroveň")).toEqual(["heading-skip"]);
    expect(kinds('Text <div class="x">blok</div>')).toEqual(["html"]);
    expect(kinds("<!-- komentář -->")).toEqual(["html"]);
    expect(kinds("![foto](a.jpg)")).toEqual(["image"]);
    expect(kinds("[klik](javascript:alert(1))")).toEqual(["unsafe-link"]);
    expect(kinds("[web](http://example.cz)")).toEqual(["unsafe-link"]);
  });

  it("rejects phone numbers in any common spelling", () => {
    expect(kinds("Volejte +420 720 283 499.")).toEqual(["phone"]);
    expect(kinds("Volejte +420720283499.")).toEqual(["phone"]);
    expect(kinds("Volejte 720 283 499.")).toEqual(["phone"]);
    expect(kinds("Volejte 720283499.")).toEqual(["phone"]);
  });

  it("does not flag postal codes, years, prices or IČO-length numbers", () => {
    expect(kinds("PSČ 682 01, rok 1985, cena 12 500 Kč, IČO 12345678.")).toEqual([]);
  });

  it("ignores code fences and inline code", () => {
    expect(kinds("```\n# not a heading <b>x</b> +420 720 283 499\n```\nText `<b>`")).toEqual([]);
  });

  it("reports line numbers", () => {
    expect(checkMarkdownBody("## A\n\ntext\n![x](y.png)")[0]?.line).toBe(4);
  });
});

describe("media file names", () => {
  it("normalises CMS paths to a bare file name", () => {
    expect(normalizeMediaFile("foto.jpg")).toBe("foto.jpg");
    expect(normalizeMediaFile("/src/assets/media/foto.jpg")).toBe("foto.jpg");
    expect(normalizeMediaFile("src\\assets\\media\\foto.jpg")).toBe("foto.jpg");
  });

  it("refuses path traversal", () => {
    expect(() => normalizeMediaFile("../secret.jpg")).toThrow();
  });

  it("knows supported formats", () => {
    expect(isSupportedMediaFile("a.JPG")).toBe(true);
    expect(isSupportedMediaFile("a.gif")).toBe(false);
  });
});

describe("mode and paths", () => {
  it("defaults to prototype and rejects unknown values", () => {
    expect(resolveMode(undefined)).toBe("prototype");
    expect(resolveMode("")).toBe("prototype");
    expect(resolveMode("production")).toBe("production");
    expect(() => resolveMode("prod")).toThrow();
  });

  it("resolves SITE_ROOT relative to the working directory", () => {
    expect(resolveSiteRoot("/repo/harness", { SITE_ROOT: "../fixtures/neutral" })).toBe(
      "/repo/fixtures/neutral",
    );
    expect(resolveSiteRoot("/client-site", {})).toBe("/client-site");
  });

  it("lets SITE_CONFIG point at a template's own fixture config", () => {
    expect(resolveConfigOverride("/repo/templates/a", {})).toBeNull();
    const override = resolveConfigOverride("/repo/templates/a", { SITE_CONFIG: "./fixture.site.config.ts" });
    expect(override).toBe("/repo/templates/a/fixture.site.config.ts");
    expect(sitePaths("/repo/fixtures/neutral", override).configFile).toBe(override);
    expect(sitePaths("/site").configFile).toBe("/site/src/site.config.ts");
  });
});
