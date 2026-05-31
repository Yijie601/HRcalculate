import { describe, expect, it } from "vitest";
import { differenceInHours, minutesToTime, normalizeTimeInput, parseTimeToMinutes, roundToNearestHalfHour } from "../time";

describe("time helpers", () => {
  it("parses HH:mm into minutes from midnight", () => {
    expect(parseTimeToMinutes("08:30")).toBe(510);
    expect(parseTimeToMinutes("17:30")).toBe(1050);
    expect(parseTimeToMinutes("830")).toBe(510);
    expect(parseTimeToMinutes("1730")).toBe(1050);
  });

  it("formats minutes to HH:mm", () => {
    expect(minutesToTime(510)).toBe("08:30");
    expect(minutesToTime(1050)).toBe("17:30");
  });

  it("calculates positive hour differences", () => {
    expect(differenceInHours("08:30", "17:30")).toBe(9);
  });

  it("rounds to the nearest half hour", () => {
    expect(roundToNearestHalfHour(1.16)).toBe(1);
    expect(roundToNearestHalfHour(1.33)).toBe(1.5);
    expect(roundToNearestHalfHour(1.75)).toBe(2);
  });

  it("normalizes compact 24-hour time entry", () => {
    expect(normalizeTimeInput("830")).toEqual({ value: "08:30" });
    expect(normalizeTimeInput("0830")).toEqual({ value: "08:30" });
    expect(normalizeTimeInput("1730")).toEqual({ value: "17:30" });
    expect(normalizeTimeInput("21:00")).toEqual({ value: "21:00" });
  });

  it("rejects invalid 24-hour time entry", () => {
    expect(normalizeTimeInput("2500")).toEqual({ error: "Use 24-hour time, e.g. 0830 or 17:30." });
    expect(normalizeTimeInput("2360")).toEqual({ error: "Use 24-hour time, e.g. 0830 or 17:30." });
  });
});
