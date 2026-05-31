import { describe, expect, it } from "vitest";
import { generateMonthEntries } from "../generate";
import { getJohorPublicHolidays } from "../holidays";

describe("Johor PH seed and month generation", () => {
  it("includes official Johor 2026 public holidays", () => {
    const holidays = getJohorPublicHolidays(2026);
    expect(holidays).toContainEqual(
      expect.objectContaining({
        date: "2026-05-01",
        name: "Hari Pekerja",
      }),
    );
    expect(holidays).toContainEqual(
      expect.objectContaining({
        date: "2026-07-21",
        name: "Hari Hol Almarhum Sultan Iskandar",
      }),
    );
  });

  it("generates one row per day with weekday labels", () => {
    const rows = generateMonthEntries("2026-05");
    expect(rows).toHaveLength(31);
    expect(rows[0]).toMatchObject({
      date: "2026-05-01",
      weekday: "Friday",
      type: "ph",
      multiplier: 2,
    });
  });

  it("marks PH plus weekend as 3x", () => {
    const rows = generateMonthEntries("2026-05");
    expect(rows[30]).toMatchObject({
      date: "2026-05-31",
      weekday: "Sunday",
      type: "ph_weekend",
      multiplier: 3,
      phName: "Hari Wesak",
    });
  });
});
