# Payroll Calculator Design

Date: 2026-05-31
Status: Approved for implementation planning

## Goal

Build a Vercel-deployable payroll calculator for one-time monthly salary calculation. The tool should let a user choose a month, configure salary and working rules, edit daily clock times, and calculate the final salary with OT, public holiday, allowance, and previous unpaid OT included.

The first implementation is a pure frontend app. It does not require login, cloud storage, database persistence, or history saving.

## Confirmed Requirements

- Month can be selected by the user.
- Default shift is `08:30` to `17:30`.
- Lunch defaults to `1 hour`.
- Normal daily hours are calculated as `default end - default start - lunch`, so the default is `8 hours`.
- User enters monthly salary and working days. Working days should default to `22`, but remain editable.
- Hourly rate formula:

  ```text
  hourly rate = monthly salary / working days / normal daily hours
  ```

- Weekday OT includes time before default start and after default end.
- Weekends and PH use actual worked duration, not the default shift comparison.
- Saturday OT multiplier defaults to `1.5x`.
- Sunday OT multiplier defaults to `2x`.
- Public holiday multiplier defaults to `2x`.
- PH + Saturday/Sunday multiplier defaults to `3x`.
- Every day can override multiplier and add a remark.
- OT is rounded to the nearest `0.5h`.
- Dinner deduction is based on a fixed clock-out cutoff. If clock-out is at or after the cutoff, deduct `0.5h` from that day's OT. The cutoff and deduction amount should be editable.
- Allowance is a one-time RM input and is added to final salary.
- Previous unpaid OT is entered as hours with a multiplier, defaulting to `1.5x`, and is added to final salary.
- PH preset is Malaysia National + Johor. PH dates must remain editable by the user.
- Weekday OT multiplier defaults to `1.5x`.

## Public Holiday Data

The app will ship with a local PH seed table for supported year/state combinations. Initial scope is Johor. The seed should use official sources and be easy to update as new years are added.

Sources checked on 2026-05-31:

- Malaysia federal PH source: BKPP JPM Hari Kelepasan Am page, updated 2026-05-21: https://www.kabinet.gov.my/hari-kelepasan-am/
- Johor PH source: Johor state government Cuti Umum Johor 2026 page, updated 2026-05-26: https://www.johor.gov.my/rakyat/cuti-umum-2

Johor 2026 seed dates from the Johor state page:

| Date | Holiday | Notes |
| --- | --- | --- |
| 2026-02-01 | Hari Thaipusam | State PH |
| 2026-02-17 | Tahun Baru Cina |  |
| 2026-02-18 | Tahun Baru Cina (Hari Kedua) |  |
| 2026-02-19 | Awal Ramadhan | State PH |
| 2026-03-21 | Hari Raya Puasa | Subject to amendment |
| 2026-03-22 | Hari Raya Puasa (Hari Kedua) | Subject to amendment |
| 2026-03-23 | Hari Keputeraan Rasmi DYMM Sultan Johor | State PH |
| 2026-05-01 | Hari Pekerja |  |
| 2026-05-27 | Hari Raya Qurban | Subject to amendment |
| 2026-05-31 | Hari Wesak |  |
| 2026-06-01 | Hari Keputeraan Seri Paduka Baginda Yang di-Pertuan Agong |  |
| 2026-06-17 | Awal Muharram (Ma'al Hijrah) |  |
| 2026-07-21 | Hari Hol Almarhum Sultan Iskandar | State PH |
| 2026-08-25 | Hari Keputeraan Nabi Muhammad S.A.W. (Maulidur Rasul) |  |
| 2026-08-31 | Hari Kebangsaan |  |
| 2026-09-16 | Hari Malaysia |  |
| 2026-11-08 | Hari Deepavali | Subject to amendment |
| 2026-12-25 | Hari Krismas |  |

The UI must allow the user to add, remove, or edit PH labels and multipliers. If a selected year has no seed data, the app should still work and show an unobtrusive notice that PH dates need manual confirmation.

PH dates that are subject to amendment or replacement must be treated as editable seed data, not as an irreversible legal rule. The calculator should make it easy for the user to adjust PH rows before calculating payroll.

## Layout

Use a single-page payroll workbench with three main zones:

1. Left setup panel
2. Center timesheet list
3. Right live salary summary

This replaces the calendar grid because the payroll workflow is easier to audit when dates are listed from top to bottom.

### Left Setup Panel

Fields:

- Month and year
- State PH preset, initially Johor
- Monthly salary
- Working days, default `22`
- Default clock-in time, default `08:30`
- Default clock-out time, default `17:30`
- Lunch duration, default `1h`
- Dinner deduction cutoff time, default `21:00`
- Dinner deduction duration, default `0.5h`
- Allowance amount, default `0`
- Previous unpaid OT hours, default `0`
- Previous unpaid OT multiplier, default `1.5x`

Time fields should use 24-hour text input instead of native browser time pickers. Users can type either `HH:mm` or compact values such as `830`, `0830`, `1730`, or `2100`; the UI normalizes valid compact values to `HH:mm`.

Within the timesheet rows, pressing `Enter` in a clock-in or clock-out field should normalize the current value and move focus to the next row in the same column. Pressing `Shift+Enter` should move focus to the previous row in the same column.

### Center Timesheet List

Generate one row per day in the selected month. Each row should show:

- Date number
- Weekday name
- Day type: workday, Saturday, Sunday, PH, PH + weekend, or custom
- Clock in
- Clock out
- Multiplier
- Calculated OT hours
- Calculated OT amount
- Remark

Rows should visually distinguish:

- Default untouched rows
- Edited rows
- Saturday/Sunday rows
- PH rows
- PH + weekend rows

The top of the timesheet should include quick stats:

- Edited days
- Weekday OT hours
- Weekend/PH OT hours
- Dinner deduction count

Optional filters:

- Show all dates
- Edited only

### Right Summary Panel

Show live totals:

- Hourly rate
- Base monthly salary
- Weekday OT total
- Saturday OT total
- Sunday OT total
- PH OT total
- PH + weekend OT total
- Previous unpaid OT total
- Allowance
- Final salary

Final salary formula:

```text
final salary =
  monthly salary
  + weekday OT amount
  + Saturday OT amount
  + Sunday OT amount
  + PH OT amount
  + PH + weekend OT amount
  + previous unpaid OT amount
  + allowance
```

### Printable Report

The app should provide a `Print` action in the main header. The action opens the browser print dialog with `window.print()`.

Print output should be a report layout, not the interactive calculator screen. It should include:

- Report title with the selected month
- Month setup summary
- Salary summary with final salary
- Full timesheet rows with date, weekday, day type, clock-in, clock-out, multiplier, OT, amount, and remark

Interactive controls such as inputs, filters, reset buttons, and the print button should be hidden in print media. The print layout should be optimized for A4 portrait with compact table styling.

## Calculation Rules

### Workday OT

For normal workdays:

```text
early OT = max(default start - actual clock in, 0)
after-work OT = max(actual clock out - default end, 0)
raw OT = early OT + after-work OT
```

If `actual clock out >= dinner cutoff`, subtract dinner deduction from raw OT.

Then round to nearest `0.5h` and multiply by the row multiplier.

### Weekend and PH OT

For Saturday, Sunday, PH, and PH + weekend:

```text
actual worked hours = actual clock out - actual clock in
raw OT = actual worked hours
```

If `actual worked hours >= 4h`, subtract lunch hours from raw OT. If actual worked hours is less than `4h`, do not subtract lunch. The same editable `Lunch Hours` setting is used for weekday normal hours and for weekend/PH meal deduction.

If `actual clock out >= dinner cutoff`, subtract dinner deduction from raw OT.

Then round to nearest `0.5h` and multiply by the row multiplier.

### Rounding

Round OT to the nearest half hour:

```text
rounded OT = round(raw OT * 2) / 2
```

Never allow negative OT after dinner deduction. Minimum OT is `0h`.

### Money

Display money to 2 decimal places. Internal calculations can use decimal-safe cents or consistent numeric rounding at the final display layer.

## Data Model

Suggested frontend state shape:

```ts
type PayrollSettings = {
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

type DayEntry = {
  date: string;
  weekday: string;
  type: "workday" | "saturday" | "sunday" | "ph" | "ph_weekend" | "custom";
  phName?: string;
  clockIn?: string;
  clockOut?: string;
  multiplier: number;
  remark?: string;
  isEdited: boolean;
};
```

Derived totals should be calculated from settings and day entries rather than stored manually.

## Error Handling

- If salary, working days, or normal daily hours is zero or invalid, do not calculate final salary. Show inline validation near the field.
- If clock-out is earlier than clock-in on the same day, mark the row invalid. Overnight shifts are out of scope for the first version.
- If a required time is missing on an edited weekend or PH row, do not calculate that row and show a row-level warning.
- If selected year has no PH seed data, show a notice and allow manual PH editing.

## Testing Plan

Core calculation tests:

- Hourly rate uses `salary / working days / normal daily hours`.
- Workday OT includes early and after-work OT.
- Weekend and PH use actual worked duration.
- Weekend and PH deduct lunch hours only when actual worked duration reaches `4h`.
- Saturday, Sunday, PH, and PH + weekend multipliers apply correctly.
- Dinner deduction applies when clock-out reaches the cutoff.
- OT rounds to nearest `0.5h`.
- OT never becomes negative after dinner deduction.
- Previous unpaid OT and allowance are included in final salary.
- Manual multiplier overrides affect only the selected day.

UI behavior tests:

- Selecting a month generates the correct number of rows and weekday labels.
- Edited rows are highlighted.
- PH rows load from Johor preset and remain editable.
- Summary updates when settings or day rows change.
- Invalid settings or times show inline errors.
- Print action calls the browser print dialog and a print-ready report is rendered with summary and timesheet details.

## Out of Scope

- Login and user accounts
- Database persistence
- Payroll history
- Multi-employee payroll
- Export to PDF/Excel
- Overnight shift handling
- Automatic live PH API syncing
