import { findJohorPublicHoliday } from "./holidays";
import type { DayEntry, DayType } from "./types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function toDateString(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function defaultType(dayOfWeek: number, hasPh: boolean): DayType {
  if (hasPh && (dayOfWeek === 0 || dayOfWeek === 6)) return "ph_weekend";
  if (hasPh) return "ph";
  if (dayOfWeek === 6) return "saturday";
  if (dayOfWeek === 0) return "sunday";
  return "workday";
}

function defaultMultiplier(type: DayType): number {
  switch (type) {
    case "saturday":
      return 1.5;
    case "sunday":
    case "ph":
      return 2;
    case "ph_weekend":
      return 3;
    default:
      return 1.5;
  }
}

export function generateMonthEntries(month: string): DayEntry[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const monthIndex = monthNumber - 1;
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = toDateString(year, monthIndex, day);
    const jsDate = new Date(year, monthIndex, day);
    const ph = findJohorPublicHoliday(date);
    const type = defaultType(jsDate.getDay(), Boolean(ph));

    return {
      date,
      weekday: WEEKDAYS[jsDate.getDay()],
      type,
      phName: ph?.name,
      multiplier: defaultMultiplier(type),
      isEdited: false,
    };
  });
}
