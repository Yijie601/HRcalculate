export type DayType = "workday" | "saturday" | "sunday" | "ph" | "ph_weekend" | "custom";

export type PayrollSettings = {
  month: string;
  salary: number;
  workingDays: number;
  defaultStart: string;
  defaultEnd: string;
  lunchHours: number;
  dinnerCutoff: string;
  dinnerDeductionHours: number;
  allowance: number;
  previousOtHours: number;
  previousOtMultiplier: number;
  state: "Johor";
};

export type DayEntry = {
  date: string;
  weekday: string;
  type: DayType;
  phName?: string;
  clockIn?: string;
  clockOut?: string;
  multiplier: number;
  remark?: string;
  isEdited: boolean;
};

export type DayCalculation = {
  date: string;
  type: DayType;
  otHours: number;
  amount: number;
  dinnerDeducted: boolean;
  invalidReason?: string;
};

export type PayrollTotals = {
  hourlyRate: number;
  baseSalary: number;
  weekdayOtAmount: number;
  saturdayOtAmount: number;
  sundayOtAmount: number;
  phOtAmount: number;
  phWeekendOtAmount: number;
  previousOtAmount: number;
  allowance: number;
  finalSalary: number;
  weekdayOtHours: number;
  weekendPhOtHours: number;
  dinnerDeductionCount: number;
  editedDays: number;
  invalidReasons: string[];
};

export type PublicHoliday = {
  date: string;
  name: string;
  state: "Johor";
  notes?: string;
};
