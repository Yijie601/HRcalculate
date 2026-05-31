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

  it("uses actual worked time for Sunday", () => {
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
      otHours: 6,
      amount: 150,
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
      otHours: 5,
      amount: 187.5,
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
