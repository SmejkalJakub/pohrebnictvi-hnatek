/**
 * Homepage imagery (view-models.ts buildHomeImagery): only real photos of the business reach the
 * homepage, in catalogue order; placeholders, stock and unpublished entries are skipped.
 */
import { describe, expect, it } from "vitest";
import type { ImageRef } from "../content/schemas.ts";
import { buildHomeImagery } from "../content/view-models.ts";

function photo(file: string, depicts: ImageRef["depicts"] = "actual-business"): ImageRef {
  let source: ImageRef["source"] = "client";
  if (depicts === "placeholder") {
    source = "placeholder";
  }
  if (depicts === "generic") {
    source = "licensed-stock";
  }
  return {
    file,
    alt: "Popis fotografie",
    decorative: false,
    caption: null,
    credit: null,
    source,
    depicts,
    rightsConfirmed: true,
    rightsConfirmedFor: null,
    focus: "center",
  };
}

const about = { title: "O nás", heroImage: photo("budova.jpg"), secondaryImage: null };

describe("buildHomeImagery", () => {
  it("takes the about page photo and the first real catalogue photos", () => {
    const imagery = buildHomeImagery({
      about,
      flowers: [
        { data: { published: true, image: null, title: "Bez fotky" } },
        { data: { published: true, image: photo("kytice.jpg"), title: "Kytice" } },
      ],
      coffins: [{ data: { published: true, image: photo("rakev.jpg"), name: "PA 109" } }],
    });
    expect(imagery.place?.image.file).toBe("budova.jpg");
    expect(imagery.flower).toEqual({ image: photo("kytice.jpg"), title: "Kytice" });
    expect(imagery.coffin?.title).toBe("PA 109");
  });

  it("skips placeholders, stock photos and unpublished entries", () => {
    const imagery = buildHomeImagery({
      about: {
        title: "O nás",
        heroImage: photo("zastupny.png", "placeholder"),
        secondaryImage: photo("sklad.jpg", "generic"),
      },
      flowers: [
        { data: { published: false, image: photo("skryta.jpg"), title: "Skrytá" } },
        { data: { published: true, image: photo("ukazka.jpg"), title: "Ukázka", placeholder: true } },
      ],
      coffins: [],
    });
    expect(imagery).toEqual({ place: null, flower: null, coffin: null });
  });

  it("falls back to the about page's second image", () => {
    const imagery = buildHomeImagery({
      about: { title: "O nás", heroImage: null, secondaryImage: photo("vazarna.jpg") },
      flowers: [],
      coffins: [],
    });
    expect(imagery.place?.image.file).toBe("vazarna.jpg");
  });
});
