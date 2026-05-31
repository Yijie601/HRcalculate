const TIME_INPUT_ERROR = "Use 24-hour time, e.g. 0830 or 17:30.";

export type NormalizedTimeInput = { value: string; error?: never } | { value?: never; error: string };

export function normalizeTimeInput(input: string): NormalizedTimeInput {
  const trimmed = input.trim();
  if (!trimmed) return { value: "" };

  let hourText: string;
  let minuteText: string;

  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    [hourText, minuteText] = trimmed.split(":");
  } else if (/^\d{3,4}$/.test(trimmed)) {
    hourText = trimmed.slice(0, -2);
    minuteText = trimmed.slice(-2);
  } else {
    return { error: TIME_INPUT_ERROR };
  }

  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { error: TIME_INPUT_ERROR };
  }

  return { value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
}

export function parseTimeToMinutes(time: string): number {
  const normalized = normalizeTimeInput(time);
  const value = normalized.value;
  if (normalized.error || !value) {
    throw new Error(normalized.error || TIME_INPUT_ERROR);
  }
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function differenceInHours(start: string, end: string): number {
  return (parseTimeToMinutes(end) - parseTimeToMinutes(start)) / 60;
}

export function roundToNearestHalfHour(hours: number): number {
  return Math.round(hours * 2) / 2;
}
