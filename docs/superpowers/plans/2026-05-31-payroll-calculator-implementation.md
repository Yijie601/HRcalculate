# Payroll Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vercel-ready payroll calculator with a single-page timesheet workbench and tested OT/salary calculation rules.

**Architecture:** Use a pure frontend Next.js app. Keep payroll calculations in framework-independent TypeScript modules so they can be unit tested without rendering the UI. The UI reads/writes local React state only; no login, database, or persistence is required.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Testing Library, Lucide React.

---

## File Structure

- Create `package.json`: scripts and dependencies for Next.js, tests, lint, and build.
- Create `tsconfig.json`: strict TypeScript configuration.
- Create `next.config.ts`: minimal Next.js config.
- Create `postcss.config.mjs`: Tailwind PostCSS config.
- Create `tailwind.config.ts`: Tailwind content paths and theme tokens.
- Create `vitest.config.ts`: jsdom-based unit/component test config.
- Create `src/app/layout.tsx`: app shell metadata.
- Create `src/app/page.tsx`: main payroll workbench UI.
- Create `src/app/globals.css`: app styles and Tailwind layers.
- Create `src/lib/payroll/types.ts`: settings, day entry, totals, and PH seed types.
- Create `src/lib/payroll/time.ts`: time parsing, duration math, and rounding helpers.
- Create `src/lib/payroll/holidays.ts`: Johor 2026 PH seed data and lookup helpers.
- Create `src/lib/payroll/calculate.ts`: hourly rate, day calculation, totals calculation.
- Create `src/lib/payroll/generate.ts`: generate one day row per selected month.
- Create `src/lib/payroll/format.ts`: money/hour/date formatting helpers.
- Create `src/lib/payroll/__tests__/time.test.ts`: pure time helper tests.
- Create `src/lib/payroll/__tests__/calculate.test.ts`: payroll calculation tests.
- Create `src/lib/payroll/__tests__/generate.test.ts`: month generation and PH tests.
- Create `src/app/__tests__/page.test.tsx`: basic UI behavior tests.

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create package and config files**

Create `package.json`:

```json
{
  "name": "hr-payroll-calculator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.0.0",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        panel: "#f8fafc",
        line: "#dbe4f0",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Payroll Calculator",
  description: "One-time monthly payroll calculator for salary and OT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <h1 className="text-2xl font-semibold">HR Payroll Calculator</h1>
      <p className="mt-2 text-slate-600">Payroll workbench scaffold.</p>
    </main>
  );
}
```

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

html {
  color-scheme: light;
}

body {
  margin: 0;
  background: #f8fafc;
  color: #0f172a;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: exit code `0`, `package-lock.json` created.

- [ ] **Step 3: Run initial checks**

Run:

```bash
npm run build
```

Expected: build exits `0` and renders the scaffold page.

- [ ] **Step 4: Commit scaffold**

Run:

```bash
git init
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts vitest.config.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "chore: scaffold payroll calculator app"
```

Expected: commit succeeds. If `git init` is skipped by user preference, record that commits are unavailable and continue without commit steps.

## Task 2: Add Payroll Types and Time Helpers

**Files:**
- Create: `src/lib/payroll/types.ts`
- Create: `src/lib/payroll/time.ts`
- Create: `src/lib/payroll/__tests__/time.test.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Add failing time helper tests**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `src/lib/payroll/__tests__/time.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/payroll/__tests__/time.test.ts
```

Expected: FAIL because `src/lib/payroll/time.ts` does not exist.

- [ ] **Step 3: Add types and minimal time implementation**

Create `src/lib/payroll/types.ts`:

```ts
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
```

Create `src/lib/payroll/time.ts`:

```ts
export function parseTimeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    throw new Error(`Invalid time: ${time}`);
  }
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/payroll/__tests__/time.test.ts
```

Expected: PASS with all time helper tests green.

- [ ] **Step 5: Commit time helpers**

Run:

```bash
git add src/test/setup.ts src/lib/payroll/types.ts src/lib/payroll/time.ts src/lib/payroll/__tests__/time.test.ts
git commit -m "feat: add payroll time helpers"
```

Expected: commit succeeds.

## Task 3: Add Johor Public Holiday Seed and Month Generation

**Files:**
- Create: `src/lib/payroll/holidays.ts`
- Create: `src/lib/payroll/generate.ts`
- Create: `src/lib/payroll/__tests__/generate.test.ts`

- [ ] **Step 1: Add failing generation tests**

Create `src/lib/payroll/__tests__/generate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateMonthEntries } from "../generate";
import { getJohorPublicHolidays } from "../holidays";

describe("Johor PH seed and month generation", () => {
  it("includes official Johor 2026 public holidays", () => {
    const holidays = getJohorPublicHolidays(2026);
    expect(holidays).toContainEqual(
      expect.objectContaining({
        date: "2026-05-01",
        name: "Hari Pekerja",
      }),
    );
    expect(holidays).toContainEqual(
      expect.objectContaining({
        date: "2026-07-21",
        name: "Hari Hol Almarhum Sultan Iskandar",
      }),
    );
  });

  it("generates one row per day with weekday labels", () => {
    const rows = generateMonthEntries("2026-05");
    expect(rows).toHaveLength(31);
    expect(rows[0]).toMatchObject({
      date: "2026-05-01",
      weekday: "Friday",
      type: "ph",
      multiplier: 2,
    });
  });

  it("marks PH plus weekend as 3x", () => {
    const rows = generateMonthEntries("2026-05");
    expect(rows[30]).toMatchObject({
      date: "2026-05-31",
      weekday: "Sunday",
      type: "ph_weekend",
      multiplier: 3,
      phName: "Hari Wesak",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/payroll/__tests__/generate.test.ts
```

Expected: FAIL because `generate.ts` and `holidays.ts` do not exist.

- [ ] **Step 3: Implement holiday seed and generator**

Create `src/lib/payroll/holidays.ts`:

```ts
import type { PublicHoliday } from "./types";

const JOHOR_2026: PublicHoliday[] = [
  { date: "2026-02-01", name: "Hari Thaipusam", state: "Johor", notes: "State PH" },
  { date: "2026-02-17", name: "Tahun Baru Cina", state: "Johor" },
  { date: "2026-02-18", name: "Tahun Baru Cina (Hari Kedua)", state: "Johor" },
  { date: "2026-02-19", name: "Awal Ramadhan", state: "Johor", notes: "State PH" },
  { date: "2026-03-21", name: "Hari Raya Puasa", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-03-22", name: "Hari Raya Puasa (Hari Kedua)", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-03-23", name: "Hari Keputeraan Rasmi DYMM Sultan Johor", state: "Johor", notes: "State PH" },
  { date: "2026-05-01", name: "Hari Pekerja", state: "Johor" },
  { date: "2026-05-27", name: "Hari Raya Qurban", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-05-31", name: "Hari Wesak", state: "Johor" },
  { date: "2026-06-01", name: "Hari Keputeraan Seri Paduka Baginda Yang di-Pertuan Agong", state: "Johor" },
  { date: "2026-06-17", name: "Awal Muharram (Ma'al Hijrah)", state: "Johor" },
  { date: "2026-07-21", name: "Hari Hol Almarhum Sultan Iskandar", state: "Johor", notes: "State PH" },
  { date: "2026-08-25", name: "Hari Keputeraan Nabi Muhammad S.A.W. (Maulidur Rasul)", state: "Johor" },
  { date: "2026-08-31", name: "Hari Kebangsaan", state: "Johor" },
  { date: "2026-09-16", name: "Hari Malaysia", state: "Johor" },
  { date: "2026-11-08", name: "Hari Deepavali", state: "Johor", notes: "Subject to amendment" },
  { date: "2026-12-25", name: "Hari Krismas", state: "Johor" },
];

export function getJohorPublicHolidays(year: number): PublicHoliday[] {
  if (year === 2026) return JOHOR_2026;
  return [];
}

export function findJohorPublicHoliday(date: string): PublicHoliday | undefined {
  const year = Number(date.slice(0, 4));
  return getJohorPublicHolidays(year).find((holiday) => holiday.date === date);
}
```

Create `src/lib/payroll/generate.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/payroll/__tests__/generate.test.ts
```

Expected: PASS with all generation tests green.

- [ ] **Step 5: Commit PH and generator**

Run:

```bash
git add src/lib/payroll/holidays.ts src/lib/payroll/generate.ts src/lib/payroll/__tests__/generate.test.ts
git commit -m "feat: add Johor holiday seed and month generation"
```

Expected: commit succeeds.

## Task 4: Add Payroll Calculation Engine

**Files:**
- Create: `src/lib/payroll/calculate.ts`
- Create: `src/lib/payroll/format.ts`
- Create: `src/lib/payroll/__tests__/calculate.test.ts`

- [ ] **Step 1: Add failing calculation tests**

Create `src/lib/payroll/__tests__/calculate.test.ts`:

```ts
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

  it("adds allowance and previous unpaid OT to final salary", () => {
    const totals = calculatePayroll(defaultSettings, []);
    expect(totals.previousOtAmount).toBe(75);
    expect(totals.allowance).toBe(100);
    expect(totals.finalSalary).toBe(2375);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/payroll/__tests__/calculate.test.ts
```

Expected: FAIL because `calculate.ts` does not exist.

- [ ] **Step 3: Implement calculations and formatting**

Create `src/lib/payroll/calculate.ts`:

```ts
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
```

Create `src/lib/payroll/format.ts`:

```ts
export function formatMoney(value: number): string {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatHours(value: number): string {
  return `${value.toFixed(1)}h`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/payroll/__tests__/calculate.test.ts
```

Expected: PASS with all calculation tests green.

- [ ] **Step 5: Commit calculation engine**

Run:

```bash
git add src/lib/payroll/calculate.ts src/lib/payroll/format.ts src/lib/payroll/__tests__/calculate.test.ts
git commit -m "feat: add payroll calculation engine"
```

Expected: commit succeeds.

## Task 5: Build Payroll Workbench UI

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/__tests__/page.test.tsx`

- [ ] **Step 1: Add failing UI tests**

Create `src/app/__tests__/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Home from "../page";

describe("Payroll workbench", () => {
  it("renders setup, timesheet, and summary sections", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "HR Payroll Calculator" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Month Setup" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "May 2026 Timesheet" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Live Salary Result" })).toBeInTheDocument();
  });

  it("updates salary summary when allowance changes", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const allowance = screen.getByLabelText("Allowance");
    await user.clear(allowance);
    await user.type(allowance, "200");
    expect(screen.getByText("RM 2,475.00")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/app/__tests__/page.test.tsx
```

Expected: FAIL because current page only renders scaffold text.

- [ ] **Step 3: Implement the workbench page**

Replace `src/app/page.tsx` with:

```tsx
"use client";

import { CalendarDays, Clock, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateDay, calculatePayroll, defaultSettings } from "@/lib/payroll/calculate";
import { formatHours, formatMoney } from "@/lib/payroll/format";
import { generateMonthEntries } from "@/lib/payroll/generate";
import type { DayEntry, PayrollSettings } from "@/lib/payroll/types";

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function Home() {
  const [settings, setSettings] = useState<PayrollSettings>(defaultSettings);
  const [days, setDays] = useState<DayEntry[]>(() =>
    generateMonthEntries(defaultSettings.month).map((day) => ({
      ...day,
      clockIn: day.type === "workday" ? defaultSettings.defaultStart : undefined,
      clockOut: day.type === "workday" ? defaultSettings.defaultEnd : undefined,
    })),
  );
  const [showEditedOnly, setShowEditedOnly] = useState(false);

  const totals = useMemo(() => calculatePayroll(settings, days), [settings, days]);
  const visibleDays = showEditedOnly ? days.filter((day) => day.isEdited) : days;

  function updateSettings<K extends keyof PayrollSettings>(key: K, value: PayrollSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateMonth(month: string) {
    setSettings((current) => ({ ...current, month }));
    setDays(
      generateMonthEntries(month).map((day) => ({
        ...day,
        clockIn: day.type === "workday" ? settings.defaultStart : undefined,
        clockOut: day.type === "workday" ? settings.defaultEnd : undefined,
      })),
    );
  }

  function updateDay(index: number, patch: Partial<DayEntry>) {
    setDays((current) =>
      current.map((day, dayIndex) => (dayIndex === index ? { ...day, ...patch, isEdited: true } : day)),
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-4 flex flex-col gap-3 border-b border-slate-300 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">HR Payroll Calculator</h1>
            <p className="mt-1 text-sm text-slate-600">One-time monthly salary and OT calculation.</p>
          </div>
          <div className="flex gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2">Johor PH preset</span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-2">No login or database</span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[260px_minmax(620px,1fr)_280px]">
          <aside className="rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <CalendarDays size={18} /> Month Setup
            </h2>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Month</span>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="month" value={settings.month} onChange={(event) => updateMonth(event.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Monthly Salary</span>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" value={settings.salary} onChange={(event) => updateSettings("salary", numberValue(event.target.value))} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Working Days</span>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" value={settings.workingDays} onChange={(event) => updateSettings("workingDays", numberValue(event.target.value))} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Default In</span>
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="time" value={settings.defaultStart} onChange={(event) => updateSettings("defaultStart", event.target.value)} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600">Default Out</span>
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="time" value={settings.defaultEnd} onChange={(event) => updateSettings("defaultEnd", event.target.value)} />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Allowance</span>
                <input aria-label="Allowance" className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" value={settings.allowance} onChange={(event) => updateSettings("allowance", numberValue(event.target.value))} />
              </label>
            </div>
          </aside>

          <section className="rounded-lg border border-slate-300 bg-white p-4">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Clock size={18} /> May 2026 Timesheet
              </h2>
              <button className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm" type="button" onClick={() => setShowEditedOnly((value) => !value)}>
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
              <table className="min-w-[900px] w-full border-collapse text-sm">
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
                  </tr>
                </thead>
                <tbody>
                  {visibleDays.map((day) => {
                    const index = days.findIndex((candidate) => candidate.date === day.date);
                    const result = calculateDay(settings, day, totals.hourlyRate);
                    return (
                      <tr key={day.date} className={day.isEdited ? "bg-blue-50" : day.type.includes("ph") ? "bg-emerald-50" : day.type === "saturday" || day.type === "sunday" ? "bg-amber-50" : "bg-white"}>
                        <td className="border-t border-slate-200 p-2 font-medium">
                          {Number(day.date.slice(8))}
                          <div className="text-xs font-normal text-slate-500">{day.weekday}</div>
                        </td>
                        <td className="border-t border-slate-200 p-2">{day.phName || day.type}</td>
                        <td className="border-t border-slate-200 p-2">
                          <input className="w-28 rounded border border-slate-300 px-2 py-1" type="time" value={day.clockIn ?? ""} onChange={(event) => updateDay(index, { clockIn: event.target.value })} />
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <input className="w-28 rounded border border-slate-300 px-2 py-1" type="time" value={day.clockOut ?? ""} onChange={(event) => updateDay(index, { clockOut: event.target.value })} />
                        </td>
                        <td className="border-t border-slate-200 p-2">
                          <input className="w-20 rounded border border-slate-300 px-2 py-1" type="number" step="0.5" value={day.multiplier} onChange={(event) => updateDay(index, { multiplier: numberValue(event.target.value) })} />
                        </td>
                        <td className="border-t border-slate-200 p-2">{formatHours(result.otHours)}</td>
                        <td className="border-t border-slate-200 p-2">{formatMoney(result.amount)}</td>
                        <td className="border-t border-slate-200 p-2">
                          <input className="w-full rounded border border-slate-300 px-2 py-1" value={day.remark ?? ""} onChange={(event) => updateDay(index, { remark: event.target.value })} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-300 bg-white p-4">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <DollarSign size={18} /> Live Salary Result
            </h2>
            <Summary label="Hourly Rate" value={formatMoney(totals.hourlyRate)} />
            <Summary label="Base Salary" value={formatMoney(totals.baseSalary)} />
            <Summary label="Weekday OT" value={formatMoney(totals.weekdayOtAmount)} />
            <Summary label="Saturday OT" value={formatMoney(totals.saturdayOtAmount)} />
            <Summary label="Sunday OT" value={formatMoney(totals.sundayOtAmount)} />
            <Summary label="PH OT" value={formatMoney(totals.phOtAmount)} />
            <Summary label="PH + Weekend OT" value={formatMoney(totals.phWeekendOtAmount)} />
            <Summary label="Previous Unpaid OT" value={formatMoney(totals.previousOtAmount)} />
            <Summary label="Allowance" value={formatMoney(totals.allowance)} />
            <div className="mt-4 rounded-lg bg-emerald-50 p-4">
              <div className="text-sm text-emerald-700">Final Salary</div>
              <div className="text-2xl font-semibold text-emerald-800">{formatMoney(totals.finalSalary)}</div>
            </div>
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/app/__tests__/page.test.tsx
```

Expected: PASS with both UI tests green.

- [ ] **Step 5: Commit workbench UI**

Run:

```bash
git add src/app/page.tsx src/app/__tests__/page.test.tsx
git commit -m "feat: build payroll workbench UI"
```

Expected: commit succeeds.

## Task 6: Polish, Accessibility, and Verification

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: tests only if existing assertions need accessible labels updated.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 3: Browser verification**

Open the local URL and verify:

- The page first screen is the payroll workbench, not a landing page.
- Month setup, timesheet list, and summary are visible on desktop.
- On mobile width, panels stack without horizontal page scroll.
- Editing allowance updates final salary.
- Editing a daily clock-in/clock-out highlights that row and updates OT.
- Johor PH rows appear for May 2026, including Hari Pekerja and Hari Wesak.

- [ ] **Step 4: Commit polish**

Run:

```bash
git add src/app/page.tsx src/app/globals.css src/app/__tests__/page.test.tsx
git commit -m "chore: verify payroll calculator"
```

Expected: commit succeeds if there are changes. If no files changed during verification, skip this commit.

## Self-Review Notes

- Spec coverage: This plan covers the app scaffold, tested calculation logic, Johor PH seed data, month row generation, timesheet UI, live summary, one-time local state, and Vercel-compatible build.
- Placeholder scan: The plan contains no unfinished placeholder instructions.
- Type consistency: `PayrollSettings`, `DayEntry`, `DayCalculation`, and `PayrollTotals` names are defined in Task 2 and reused consistently in later tasks.
