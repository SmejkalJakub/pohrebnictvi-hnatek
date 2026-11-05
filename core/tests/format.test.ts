import { describe, expect, it } from "vitest";
import { formatPhone } from "../format/phone.ts";
import { formatCzk, formatPriceAmount } from "../format/price.ts";
import { formatOfficeHours, formatTime } from "../format/hours.ts";
import { formatAddressInline, formatPostalCode } from "../format/address.ts";
import { OfficeHours, type PriceItem } from "../content/schemas.ts";

const NBSP = " ";

describe("formatPhone", () => {
  it("formats Czech numbers in groups of three with non-breaking spaces", () => {
    const phone = formatPhone("+420517352020");
    expect(phone.display).toBe(`+420${NBSP}517${NBSP}352${NBSP}020`);
    expect(phone.spoken).toBe("+420 517 352 020");
    expect(phone.href).toBe("tel:+420517352020");
  });

  it("rejects non-E.164 input", () => {
    expect(() => formatPhone("517 352 020")).toThrow();
  });
});

describe("prices", () => {
  const item = (overrides: Partial<PriceItem>): PriceItem => ({
    id: "a",
    label: "A",
    description: null,
    kind: "fixed",
    amount: 12500,
    amountMax: null,
    unit: null,
    status: "approved",
    ...overrides,
  });

  it("formats whole crowns with non-breaking thousands separators", () => {
    expect(formatCzk(12500)).toBe(`12${NBSP}500${NBSP}Kč`);
    expect(formatCzk(1000000)).toBe(`1${NBSP}000${NBSP}000${NBSP}Kč`);
    expect(formatCzk(38)).toBe(`38${NBSP}Kč`);
  });

  it("formats each kind", () => {
    expect(formatPriceAmount(item({}))).toBe(`12${NBSP}500${NBSP}Kč`);
    expect(formatPriceAmount(item({ kind: "from", amount: 3900 }))).toBe(`od${NBSP}3${NBSP}900${NBSP}Kč`);
    expect(formatPriceAmount(item({ kind: "range", amount: 2000, amountMax: 4000 }))).toBe(
      `2${NBSP}000–4${NBSP}000${NBSP}Kč`,
    );
    expect(formatPriceAmount(item({ kind: "on-request", amount: null }))).toBe("na dotaz");
    expect(formatPriceAmount(item({ amount: 38, unit: "za km" }))).toBe(`38${NBSP}Kč za km`);
  });
});

describe("formatOfficeHours", () => {
  it("groups weekdays, shows the break and reports the weekend as closed", () => {
    const hours = OfficeHours.parse({
      locationId: "a",
      weekly: [
        {
          id: "wd",
          days: ["mon", "tue", "wed", "thu", "fri"],
          open: "07:00",
          close: "15:30",
          breaks: [{ from: "12:00", to: "12:30" }],
        },
      ],
    });
    expect(formatOfficeHours(hours)).toEqual([
      {
        dayIds: ["mon", "tue", "wed", "thu", "fri"],
        days: "Po–Pá",
        daysLong: "pondělí až pátek",
        closed: false,
        text: "7:00–15:30",
        note: "přestávka 12:00–12:30",
      },
      {
        dayIds: ["sat", "sun"],
        days: "So–Ne",
        daysLong: "sobota až neděle",
        closed: true,
        text: "zavřeno",
        note: null,
      },
    ]);
  });

  it("splits non-consecutive days and never hides a day", () => {
    const hours = OfficeHours.parse({
      locationId: "a",
      weekly: [
        { id: "a", days: ["mon", "wed"], open: "08:00", close: "16:00" },
        { id: "b", days: ["sat"], open: "09:00", close: "11:00" },
      ],
    });
    const rows = formatOfficeHours(hours);
    expect(rows.map((row) => `${row.days} ${row.text}`)).toEqual([
      "Po 8:00–16:00",
      "Út zavřeno",
      "St 8:00–16:00",
      "Čt–Pá zavřeno",
      "So 9:00–11:00",
      "Ne zavřeno",
    ]);
    expect(rows.flatMap((row) => row.dayIds)).toHaveLength(7);
  });

  it("drops the leading zero of hours only", () => {
    expect(formatTime("07:05")).toBe("7:05");
    expect(formatTime("12:00")).toBe("12:00");
  });
});

describe("address", () => {
  it("formats postal codes and inline addresses", () => {
    expect(formatPostalCode("68201")).toBe(`682${NBSP}01`);
    expect(
      formatAddressInline({
        street: "Dědická ev.č. 38/22",
        city: "Vyškov",
        postalCode: "682 01",
        country: "CZ",
      }),
    ).toBe(`Dědická ev.č. 38/22, 682${NBSP}01 Vyškov`);
  });
});
