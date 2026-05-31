import { describe, expect, it } from "vitest";
import { differenceInHours, minutesToTime, parseTimeToMinutes, roundToNearestHalfHour } from "../time";

describe("time helpers", () => {
  it("parses HH:mm into minutes from midnight", () => {
    expect(parseTimeToMinutes("08:30")).toBe(510);
    expect(parseTimeToMinutes("17:30")).toBe(1050);
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
});
