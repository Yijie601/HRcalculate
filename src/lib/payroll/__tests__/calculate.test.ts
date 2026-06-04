import { describe, expect, it } from "vitest";
import { calculateDay, calculatePayroll, defaultSettings } from "../calculate";
import type { DayEntry } from "../types";

describe("payroll calculations", () => {
  it("calculates hourly rate from salary, working days, and normal hours", () => {
    const totals = calculatePayroll(defaultSettings, []);
    expect(totals.hourlyRate).toBe(12.5);
  });

  it("calculates weekday early and after-work OT", () => {
    const day: DayEntry = {
      date: "2026-05-06",
      weekday: "Wednesday",
      type: "workday",
      clockIn: "07:30",
      clockOut: "18:30",
      multiplier: 1.5,
      isEdited: true,
    };
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 2,
      amount: 37.5,
      dinnerDeducted: false,
    });
  });

  it("returns an invalid reason instead of throwing for invalid text time", () => {
    const day: DayEntry = {
      date: "2026-05-06",
      weekday: "Wednesday",
      type: "workday",
      clockIn: "2500",
      clockOut: "18:30",
      multiplier: 1.5,
      isEdited: true,
    };
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 0,
      amount: 0,
      invalidReason: "Use 24-hour time, e.g. 0830 or 17:30.",
    });
  });

  it("deducts dinner when clock out reaches cutoff", () => {
    const day: DayEntry = {
      date: "2026-05-17",
      weekday: "Wednesday",
      type: "workday",
      clockIn: "08:30",
      clockOut: "21:00",
      multiplier: 1.5,
      isEdited: true,
    };
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 3,
      amount: 56.25,
      dinnerDeducted: true,
    });
  });

  it("does not deduct dinner before the default 9pm cutoff", () => {
    const day: DayEntry = {
      date: "2026-05-17",
      weekday: "Wednesday",
      type: "workday",
      clockIn: "08:30",
      clockOut: "20:30",
      multiplier: 1.5,
      isEdited: true,
    };
    expect(defaultSettings.dinnerCutoff).toBe("21:00");
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 3,
      amount: 56.25,
      dinnerDeducted: false,
    });
  });

  it("deducts lunch from weekend OT when actual worked time reaches 4 hours", () => {
    const day: DayEntry = {
      date: "2026-05-03",
      weekday: "Sunday",
      type: "sunday",
      clockIn: "10:00",
      clockOut: "16:00",
      multiplier: 2,
      isEdited: true,
    };
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 5,
      amount: 125,
    });
  });

  it("does not deduct lunch from weekend OT when actual worked time is less than 4 hours", () => {
    const day: DayEntry = {
      date: "2026-05-03",
      weekday: "Sunday",
      type: "sunday",
      clockIn: "10:00",
      clockOut: "13:30",
      multiplier: 2,
      isEdited: true,
    };
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 3.5,
      amount: 87.5,
    });
  });

  it("uses 3x for PH plus weekend unless overridden", () => {
    const day: DayEntry = {
      date: "2026-05-31",
      weekday: "Sunday",
      type: "ph_weekend",
      phName: "Hari Wesak",
      clockIn: "09:00",
      clockOut: "14:00",
      multiplier: 3,
      isEdited: true,
    };
    expect(calculateDay(defaultSettings, day, 12.5)).toMatchObject({
      otHours: 4,
      amount: 150,
    });
  });

  it("defaults allowance and previous unpaid OT to zero", () => {
    const totals = calculatePayroll(defaultSettings, []);
    expect(defaultSettings.previousOtHours).toBe(0);
    expect(totals.previousOtAmount).toBe(0);
    expect(totals.allowance).toBe(0);
    expect(totals.finalSalary).toBe(2200);
  });
});
