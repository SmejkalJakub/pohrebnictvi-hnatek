/** Czech one-letter-word glue (core/typography/czech.ts) and the live office status. */
import { describe, expect, it } from "vitest";
import type { OfficeHours } from "../content/schemas.ts";
import {
  isCzechPublicHoliday,
  officeStatusAt,
  pragueMoment,
  type PragueMoment,
} from "../format/office-status.ts";
import { glueOneLetterWords, glueOneLetterWordsInHtml } from "../typography/czech.ts";

const NBSP = " ";

describe("glueOneLetterWords", () => {
  it("glues every one-letter preposition and conjunction, also in a row", () => {
    expect(glueOneLetterWords("rozloučením s vaším nejbližším")).toBe(`rozloučením s${NBSP}vaším nejbližším`);
    expect(glueOneLetterWords("a v noci i o svátcích")).toBe(`a${NBSP}v${NBSP}noci i${NBSP}o${NBSP}svátcích`);
    expect(glueOneLetterWords("V nemocnici")).toBe(`V${NBSP}nemocnici`);
  });

  it("leaves other words and numbers alone", () => {
    expect(glueOneLetterWords("Rakev PA 2097")).toBe("Rakev PA 2097");
    expect(glueOneLetterWords("od 18 900 Kč")).toBe("od 18 900 Kč");
  });
});

describe("glueOneLetterWordsInHtml", () => {
  it("changes text nodes only, also across inline tags", () => {
    const html = '<h1 class="a b">Zavolejte nám a <em>v</em> noci</h1><a href="/a v">k nám</a>';
    expect(glueOneLetterWordsInHtml(html)).toBe(
      `<h1 class="a b">Zavolejte nám a${NBSP}<em>v</em> noci</h1><a href="/a v">k${NBSP}nám</a>`,
    );
  });

  it("skips script, style, pre, code and comments", () => {
    const html =
      '<script>const a = "a b";</script><style>a b{}</style><pre>a b</pre><code>k x</code><!-- a b --><p>a b</p>';
    expect(glueOneLetterWordsInHtml(html)).toBe(
      `<script>const a = "a b";</script><style>a b{}</style><pre>a b</pre><code>k x</code><!-- a b --><p>a${NBSP}b</p>`,
    );
  });
});

const HOURS: OfficeHours = {
  locationId: "vyskov",
  label: "Kancelář – úřední hodiny",
  weekly: [
    {
      id: "pracovni-dny",
      days: ["mon", "tue", "wed", "thu", "fri"],
      open: "07:00",
      close: "15:30",
      breaks: [{ from: "12:00", to: "12:30" }],
    },
  ],
  holidayNote: "Ve státní svátky je kancelář zavřená.",
  exceptions: [],
  outsideHoursNote: null,
};

const at = (date: string, day: PragueMoment["day"], time: string): PragueMoment => {
  const [h, m] = time.split(":").map(Number);
  return { date, day, minutes: (h ?? 0) * 60 + (m ?? 0) };
};

describe("officeStatusAt", () => {
  it("open, break, before opening and after closing", () => {
    expect(officeStatusAt(HOURS, at("2026-11-12", "thu", "09:00"))).toEqual({
      state: "open",
      text: "Kancelář je teď otevřená, do 15:30.",
      short: "Otevřeno do 15:30",
    });
    expect(officeStatusAt(HOURS, at("2026-11-12", "thu", "12:10")).state).toBe("break");
    expect(officeStatusAt(HOURS, at("2026-11-12", "thu", "06:00")).text).toBe(
      `Kancelář je teď zavřená. Otevíráme dnes v${NBSP}7:00.`,
    );
    expect(officeStatusAt(HOURS, at("2026-11-12", "thu", "16:00")).text).toBe(
      `Kancelář je teď zavřená. Otevíráme zítra v${NBSP}7:00.`,
    );
  });

  it("names the weekday after a weekend, and skips public holidays when the office closes on them", () => {
    expect(officeStatusAt(HOURS, at("2026-11-14", "sat", "10:00")).text).toBe(
      `Kancelář je teď zavřená. Otevíráme v${NBSP}pondělí v${NBSP}7:00.`,
    );
    // 17. 11. 2026 is a Tuesday and a public holiday.
    expect(officeStatusAt(HOURS, at("2026-11-16", "mon", "16:00")).text).toBe(
      `Kancelář je teď zavřená. Otevíráme ve středu v${NBSP}7:00.`,
    );
    expect(officeStatusAt(HOURS, at("2026-11-17", "tue", "10:00")).state).toBe("closed");
  });

  it("is unknown on a holiday when the site does not say what happens then", () => {
    expect(officeStatusAt({ ...HOURS, holidayNote: null }, at("2026-11-17", "tue", "10:00")).state).toBe(
      "unknown",
    );
  });

  it("follows exceptions", () => {
    const closed = {
      ...HOURS,
      exceptions: [
        { from: "2026-11-12", to: "2026-11-13", closed: true, open: null, close: null, note: null },
      ],
    };
    expect(officeStatusAt(closed, at("2026-11-12", "thu", "09:00")).text).toBe(
      `Kancelář je teď zavřená. Otevíráme v${NBSP}pondělí v${NBSP}7:00.`,
    );
  });

  it("knows Czech public holidays, Easter included", () => {
    expect(isCzechPublicHoliday("2026-12-24")).toBe(true);
    expect(isCzechPublicHoliday("2026-04-03")).toBe(true); // Velký pátek
    expect(isCzechPublicHoliday("2026-04-06")).toBe(true); // Velikonoční pondělí
    expect(isCzechPublicHoliday("2026-04-07")).toBe(false);
  });

  it("converts an instant to Prague time", () => {
    expect(pragueMoment(new Date("2026-11-13T22:30:00Z"))).toEqual({
      date: "2026-11-13",
      day: "fri",
      minutes: 23 * 60 + 30,
    });
    expect(pragueMoment(new Date("2026-07-01T22:30:00Z"))).toEqual({
      date: "2026-07-02",
      day: "thu",
      minutes: 30,
    });
  });
});
