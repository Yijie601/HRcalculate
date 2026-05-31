import { differenceInHours, parseTimeToMinutes, roundToNearestHalfHour } from "./time";
import type { DayCalculation, DayEntry, PayrollSettings, PayrollTotals } from "./types";

export const defaultSettings: PayrollSettings = {
  month: "2026-05",
  salary: 2200,
  workingDays: 22,
  defaultStart: "08:30",
  defaultEnd: "17:30",
  lunchHours: 1,
  dinnerCutoff: "20:00",
  dinnerDeductionHours: 0.5,
  allowance: 100,
  previousOtHours: 4,
  previousOtMultiplier: 1.5,
  state: "Johor",
};

export function normalDailyHours(settings: PayrollSettings): number {
  return Math.max(differenceInHours(settings.defaultStart, settings.defaultEnd) - settings.lunchHours, 0);
}

export function hourlyRate(settings: PayrollSettings): number {
  const normalHours = normalDailyHours(settings);
  if (settings.salary <= 0 || settings.workingDays <= 0 || normalHours <= 0) return 0;
  return settings.salary / settings.workingDays / normalHours;
}

function hasActualTimes(day: DayEntry): day is DayEntry & { clockIn: string; clockOut: string } {
  return Boolean(day.clockIn && day.clockOut);
}

function isHolidayStyle(type: DayEntry["type"]): boolean {
  return type === "saturday" || type === "sunday" || type === "ph" || type === "ph_weekend";
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDay(settings: PayrollSettings, day: DayEntry, rate = hourlyRate(settings)): DayCalculation {
  if (!hasActualTimes(day)) {
    return {
      date: day.date,
      type: day.type,
      otHours: 0,
      amount: 0,
      dinnerDeducted: false,
    };
  }

  const clockInMinutes = parseTimeToMinutes(day.clockIn);
  const clockOutMinutes = parseTimeToMinutes(day.clockOut);
  if (clockOutMinutes < clockInMinutes) {
    return {
      date: day.date,
      type: day.type,
      otHours: 0,
      amount: 0,
      dinnerDeducted: false,
      invalidReason: "Clock out cannot be earlier than clock in.",
    };
  }

  let rawOt: number;
  if (isHolidayStyle(day.type)) {
    rawOt = (clockOutMinutes - clockInMinutes) / 60;
  } else {
    const early = Math.max((parseTimeToMinutes(settings.defaultStart) - clockInMinutes) / 60, 0);
    const after = Math.max((clockOutMinutes - parseTimeToMinutes(settings.defaultEnd)) / 60, 0);
    rawOt = early + after;
  }

  const dinnerDeducted = clockOutMinutes >= parseTimeToMinutes(settings.dinnerCutoff) && rawOt > 0;
  if (dinnerDeducted) rawOt -= settings.dinnerDeductionHours;

  const otHours = Math.max(roundToNearestHalfHour(rawOt), 0);
  return {
    date: day.date,
    type: day.type,
    otHours,
    amount: roundMoney(otHours * rate * day.multiplier),
    dinnerDeducted,
  };
}

export function calculatePayroll(settings: PayrollSettings, days: DayEntry[]): PayrollTotals {
  const rate = hourlyRate(settings);
  const dayResults = days.map((day) => calculateDay(settings, day, rate));
  const previousOtAmount = roundMoney(settings.previousOtHours * rate * settings.previousOtMultiplier);

  const totals = dayResults.reduce(
    (acc, result, index) => {
      const day = days[index];
      if (result.invalidReason) acc.invalidReasons.push(`${day.date}: ${result.invalidReason}`);
      if (result.dinnerDeducted) acc.dinnerDeductionCount += 1;
      if (day.isEdited) acc.editedDays += 1;

      if (day.type === "workday" || day.type === "custom") {
        acc.weekdayOtHours += result.otHours;
        acc.weekdayOtAmount += result.amount;
      } else {
        acc.weekendPhOtHours += result.otHours;
      }

      if (day.type === "saturday") acc.saturdayOtAmount += result.amount;
      if (day.type === "sunday") acc.sundayOtAmount += result.amount;
      if (day.type === "ph") acc.phOtAmount += result.amount;
      if (day.type === "ph_weekend") acc.phWeekendOtAmount += result.amount;
      return acc;
    },
    {
      hourlyRate: rate,
      baseSalary: settings.salary,
      weekdayOtAmount: 0,
      saturdayOtAmount: 0,
      sundayOtAmount: 0,
      phOtAmount: 0,
      phWeekendOtAmount: 0,
      previousOtAmount,
      allowance: settings.allowance,
      finalSalary: 0,
      weekdayOtHours: 0,
      weekendPhOtHours: 0,
      dinnerDeductionCount: 0,
      editedDays: 0,
      invalidReasons: [] as string[],
    },
  );

  totals.weekdayOtAmount = roundMoney(totals.weekdayOtAmount);
  totals.saturdayOtAmount = roundMoney(totals.saturdayOtAmount);
  totals.sundayOtAmount = roundMoney(totals.sundayOtAmount);
  totals.phOtAmount = roundMoney(totals.phOtAmount);
  totals.phWeekendOtAmount = roundMoney(totals.phWeekendOtAmount);
  totals.finalSalary = roundMoney(
    totals.baseSalary +
      totals.weekdayOtAmount +
      totals.saturdayOtAmount +
      totals.sundayOtAmount +
      totals.phOtAmount +
      totals.phWeekendOtAmount +
      totals.previousOtAmount +
      totals.allowance,
  );

  return totals;
}
