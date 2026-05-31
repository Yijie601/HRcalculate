"use client";

import { CalendarDays, Clock, DollarSign, Filter, ListRestart } from "lucide-react";
import { type KeyboardEvent, useMemo, useState } from "react";
import { calculateDay, calculatePayroll, defaultSettings } from "@/lib/payroll/calculate";
import { formatHours, formatMoney } from "@/lib/payroll/format";
import { generateMonthEntries } from "@/lib/payroll/generate";
import { normalizeTimeInput } from "@/lib/payroll/time";
import type { DayEntry, DayType, PayrollSettings } from "@/lib/payroll/types";

const DAY_TYPE_LABELS: Record<DayType, string> = {
  workday: "Workday",
  saturday: "Saturday",
  sunday: "Sunday",
  ph: "PH",
  ph_weekend: "PH + Weekend",
  custom: "Custom",
};

type TimeField = "clockIn" | "clockOut";

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizedTimeValue(value: string): string {
  const normalized = normalizeTimeInput(value);
  return normalized.value ?? value;
}

function monthTitle(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1, 1));
}

function buildInitialDays(settings: PayrollSettings): DayEntry[] {
  return generateMonthEntries(settings.month).map((day) => ({
    ...day,
    clockIn: day.type === "workday" ? settings.defaultStart : undefined,
    clockOut: day.type === "workday" ? settings.defaultEnd : undefined,
  }));
}

function rowTone(day: DayEntry): string {
  if (day.isEdited) return "bg-blue-50 shadow-[inset_3px_0_0_#2563eb]";
  if (day.type === "ph_weekend") return "bg-slate-100 shadow-[inset_3px_0_0_#0f172a]";
  if (day.type === "ph") return "bg-emerald-50";
  if (day.type === "saturday" || day.type === "sunday") return "bg-amber-50";
  return "bg-white";
}

function typeBadgeTone(type: DayType): string {
  if (type === "ph_weekend") return "border-slate-900 bg-slate-900 text-white";
  if (type === "ph") return "border-emerald-200 bg-emerald-100 text-emerald-800";
  if (type === "saturday" || type === "sunday") return "border-amber-200 bg-amber-100 text-amber-800";
  if (type === "custom") return "border-blue-200 bg-blue-100 text-blue-800";
  return "border-slate-200 bg-white text-slate-700";
}

export default function Home() {
  const [settings, setSettings] = useState<PayrollSettings>(defaultSettings);
  const [days, setDays] = useState<DayEntry[]>(() => buildInitialDays(defaultSettings));
  const [showEditedOnly, setShowEditedOnly] = useState(false);

  const totals = useMemo(() => calculatePayroll(settings, days), [settings, days]);
  const visibleDays = showEditedOnly ? days.filter((day) => day.isEdited) : days;
  const title = monthTitle(settings.month);

  function updateSettings<K extends keyof PayrollSettings>(key: K, value: PayrollSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateMonth(month: string) {
    const nextSettings = { ...settings, month };
    setSettings(nextSettings);
    setDays(buildInitialDays(nextSettings));
    setShowEditedOnly(false);
  }

  function updateDefaultTime(key: "defaultStart" | "defaultEnd", value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
    setDays((current) =>
      current.map((day) =>
        day.type === "workday" && !day.isEdited
          ? {
              ...day,
              clockIn: key === "defaultStart" ? value : day.clockIn,
              clockOut: key === "defaultEnd" ? value : day.clockOut,
            }
          : day,
      ),
    );
  }

  function updateDay(date: string, patch: Partial<DayEntry>) {
    setDays((current) => current.map((day) => (day.date === date ? { ...day, ...patch, isEdited: true } : day)));
  }

  function resetDay(date: string) {
    const freshDay = buildInitialDays(settings).find((day) => day.date === date);
    if (!freshDay) return;
    setDays((current) => current.map((day) => (day.date === date ? freshDay : day)));
  }

  function handleTimeKeyDown(event: KeyboardEvent<HTMLInputElement>, date: string, field: TimeField) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    updateDay(date, { [field]: normalizedTimeValue(event.currentTarget.value) });

    const currentIndex = visibleDays.findIndex((day) => day.date === date);
    const target = visibleDays[currentIndex + (event.shiftKey ? -1 : 1)];
    if (!target) return;

    window.setTimeout(() => {
      const nextInput = document.querySelector<HTMLInputElement>(`input[data-time-date="${target.date}"][data-time-field="${field}"]`);
      nextInput?.focus();
      nextInput?.select();
    }, 0);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950 md:px-6">
      <div className="mx-auto max-w-[1540px]">
        <header className="mb-4 flex flex-col gap-3 border-b border-slate-300 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">HR Payroll Calculator</h1>
            <p className="mt-1 text-sm text-slate-600">One-time Johor payroll calculator for monthly salary, OT, PH, and allowance.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2">Malaysia + Johor PH</span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2">No login or database</span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_280px] 2xl:grid-cols-[280px_minmax(0,1fr)_300px]">
          <aside className="min-w-0 rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <CalendarDays size={18} aria-hidden="true" /> Month Setup
            </h2>

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Month</span>
                <input className="field-input" type="month" value={settings.month} onChange={(event) => updateMonth(event.target.value)} />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">PH Preset</span>
                <select className="field-input" value={settings.state} onChange={() => updateSettings("state", "Johor")}>
                  <option value="Johor">Malaysia + Johor</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Monthly Salary</span>
                <input className="field-input" type="number" min="0" value={settings.salary} onChange={(event) => updateSettings("salary", numberValue(event.target.value))} />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Working Days</span>
                <input className="field-input" type="number" min="0" value={settings.workingDays} onChange={(event) => updateSettings("workingDays", numberValue(event.target.value))} />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Default In</span>
                  <input
                    className="field-input"
                    inputMode="numeric"
                    placeholder="0830"
                    type="text"
                    value={settings.defaultStart}
                    onBlur={(event) => updateDefaultTime("defaultStart", normalizedTimeValue(event.target.value))}
                    onChange={(event) => updateDefaultTime("defaultStart", event.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Default Out</span>
                  <input
                    className="field-input"
                    inputMode="numeric"
                    placeholder="1730"
                    type="text"
                    value={settings.defaultEnd}
                    onBlur={(event) => updateDefaultTime("defaultEnd", normalizedTimeValue(event.target.value))}
                    onChange={(event) => updateDefaultTime("defaultEnd", event.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Lunch Hours</span>
                  <input className="field-input" type="number" min="0" step="0.5" value={settings.lunchHours} onChange={(event) => updateSettings("lunchHours", numberValue(event.target.value))} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Dinner Cutoff</span>
                  <input
                    className="field-input"
                    inputMode="numeric"
                    placeholder="2100"
                    type="text"
                    value={settings.dinnerCutoff}
                    onBlur={(event) => updateSettings("dinnerCutoff", normalizedTimeValue(event.target.value))}
                    onChange={(event) => updateSettings("dinnerCutoff", event.target.value)}
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Dinner Deduction Hours</span>
                <input className="field-input" type="number" min="0" step="0.5" value={settings.dinnerDeductionHours} onChange={(event) => updateSettings("dinnerDeductionHours", numberValue(event.target.value))} />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Allowance</span>
                <input aria-label="Allowance" className="field-input" type="number" value={settings.allowance} onChange={(event) => updateSettings("allowance", numberValue(event.target.value))} />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Previous OT Hours</span>
                  <input className="field-input" type="number" min="0" step="0.5" value={settings.previousOtHours} onChange={(event) => updateSettings("previousOtHours", numberValue(event.target.value))} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Previous OT Rate</span>
                  <input className="field-input" type="number" min="0" step="0.5" value={settings.previousOtMultiplier} onChange={(event) => updateSettings("previousOtMultiplier", numberValue(event.target.value))} />
                </label>
              </div>
            </div>
          </aside>

          <section className="min-w-0 rounded-lg border border-slate-300 bg-white p-4">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Clock size={18} aria-hidden="true" /> {title} Timesheet
                </h2>
                <p className="mt-1 text-xs text-slate-500">Rows run top-to-bottom by date, with weekday visible for every day.</p>
              </div>
              <button className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50" type="button" onClick={() => setShowEditedOnly((value) => !value)}>
                <Filter size={16} aria-hidden="true" />
                {showEditedOnly ? "Show all dates" : "Edited only"}
              </button>
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-4">
              <Stat label="Edited Days" value={String(totals.editedDays)} />
              <Stat label="Weekday OT" value={formatHours(totals.weekdayOtHours)} />
              <Stat label="Weekend/PH OT" value={formatHours(totals.weekendPhOtHours)} />
              <Stat label="Dinner Deduct" value={`${totals.dinnerDeductionCount} days`} />
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Clock In</th>
                    <th className="p-2">Clock Out</th>
                    <th className="p-2">Rate</th>
                    <th className="p-2">OT</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Remark</th>
                    <th className="p-2">Reset</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDays.map((day) => {
                    const result = calculateDay(settings, day, totals.hourlyRate);
                    return (
                      <tr key={day.date} className={rowTone(day)}>
                        <td className="border-t border-slate-200 p-2 font-medium">
                          {Number(day.date.slice(8))}
                          <div className="text-xs font-normal text-slate-500">{day.weekday}</div>
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <select className={`rounded-full border px-2 py-1 text-xs font-semibold ${typeBadgeTone(day.type)}`} value={day.type} onChange={(event) => updateDay(day.date, { type: event.target.value as DayType })}>
                            {Object.entries(DAY_TYPE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          {day.phName ? <div className="mt-1 max-w-40 truncate text-xs text-slate-500">{day.phName}</div> : null}
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <input
                            aria-label={`${day.date} clock in`}
                            className="table-input w-28"
                            inputMode="numeric"
                            placeholder="0830"
                            data-time-date={day.date}
                            data-time-field="clockIn"
                            type="text"
                            value={day.clockIn ?? ""}
                            onBlur={(event) => updateDay(day.date, { clockIn: normalizedTimeValue(event.target.value) })}
                            onChange={(event) => updateDay(day.date, { clockIn: event.target.value })}
                            onKeyDown={(event) => handleTimeKeyDown(event, day.date, "clockIn")}
                          />
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <input
                            aria-label={`${day.date} clock out`}
                            className="table-input w-28"
                            inputMode="numeric"
                            placeholder="1730"
                            data-time-date={day.date}
                            data-time-field="clockOut"
                            type="text"
                            value={day.clockOut ?? ""}
                            onBlur={(event) => updateDay(day.date, { clockOut: normalizedTimeValue(event.target.value) })}
                            onChange={(event) => updateDay(day.date, { clockOut: event.target.value })}
                            onKeyDown={(event) => handleTimeKeyDown(event, day.date, "clockOut")}
                          />
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <input aria-label={`${day.date} multiplier`} className="table-input w-20" type="number" min="0" step="0.5" value={day.multiplier} onChange={(event) => updateDay(day.date, { multiplier: numberValue(event.target.value) })} />
                        </td>
                        <td className="border-t border-slate-200 p-2">{formatHours(result.otHours)}</td>
                        <td className="border-t border-slate-200 p-2">{formatMoney(result.amount)}</td>
                        <td className="border-t border-slate-200 p-2">
                          <input aria-label={`${day.date} remark`} className="table-input w-full min-w-36" value={day.remark ?? ""} onChange={(event) => updateDay(day.date, { remark: event.target.value })} />
                          {result.invalidReason ? <div className="mt-1 text-xs text-red-600">{result.invalidReason}</div> : null}
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <button aria-label={`Reset ${day.date}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50" type="button" onClick={() => resetDay(day.date)}>
                            <ListRestart size={16} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="min-w-0 rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <DollarSign size={18} aria-hidden="true" /> Live Salary Result
            </h2>

            <Summary label="Hourly Rate" value={formatMoney(totals.hourlyRate)} />
            <Summary label="Base Salary" value={formatMoney(totals.baseSalary)} />
            <Summary label="Weekday OT" value={`${formatHours(totals.weekdayOtHours)} / ${formatMoney(totals.weekdayOtAmount)}`} />
            <Summary label="Saturday OT" value={formatMoney(totals.saturdayOtAmount)} />
            <Summary label="Sunday OT" value={formatMoney(totals.sundayOtAmount)} />
            <Summary label="PH OT" value={formatMoney(totals.phOtAmount)} />
            <Summary label="PH + Weekend OT" value={formatMoney(totals.phWeekendOtAmount)} />
            <Summary label="Previous Unpaid OT" value={`${formatHours(settings.previousOtHours)} x ${settings.previousOtMultiplier} / ${formatMoney(totals.previousOtAmount)}`} />
            <Summary label="Allowance" value={formatMoney(totals.allowance)} />

            <div className="mt-4 rounded-lg bg-emerald-50 p-4">
              <div className="text-sm text-emerald-700">Final Salary</div>
              <div className="text-2xl font-semibold text-emerald-800">{formatMoney(totals.finalSalary)}</div>
            </div>

            {totals.invalidReasons.length > 0 ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {totals.invalidReasons.map((reason) => (
                  <div key={reason}>{reason}</div>
                ))}
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
