import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import Home from "../page";

describe("Payroll workbench", () => {
  it("renders setup, timesheet, and summary sections", () => {
    render(<Home />);
    const app = within(screen.getByTestId("screen-app"));
    expect(app.getByRole("heading", { name: "HR Payroll Calculator" })).toBeInTheDocument();
    expect(app.getByRole("heading", { name: "Month Setup" })).toBeInTheDocument();
    expect(app.getByRole("heading", { name: "May 2026 Timesheet" })).toBeInTheDocument();
    expect(app.getByRole("heading", { name: "Live Salary Result" })).toBeInTheDocument();
  });

  it("updates salary summary when allowance changes", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const app = within(screen.getByTestId("screen-app"));
    const allowance = app.getByLabelText("Allowance");
    expect(allowance).toHaveValue(0);
    expect(app.getByLabelText("Previous OT Hours")).toHaveValue(0);
    expect(app.getByLabelText("Dinner Cutoff")).toHaveValue("21:00");
    await user.clear(allowance);
    await user.type(allowance, "200");
    expect(app.getByText("RM 2,400.00")).toBeInTheDocument();
  });

  it("uses text-based 24-hour time inputs and accepts compact time", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const app = within(screen.getByTestId("screen-app"));
    const defaultIn = app.getByLabelText("Default In");
    const clockIn = app.getByLabelText("2026-05-06 clock in");
    const clockOut = app.getByLabelText("2026-05-06 clock out");

    expect(defaultIn).toHaveAttribute("type", "text");
    expect(defaultIn).toHaveAttribute("inputmode", "numeric");
    expect(clockIn).toHaveAttribute("type", "text");

    await user.clear(clockIn);
    await user.type(clockIn, "0730");
    await user.tab();
    expect(clockIn).toHaveValue("07:30");

    await user.clear(clockOut);
    await user.type(clockOut, "1830");
    await user.tab();

    expect(clockOut).toHaveValue("18:30");
    expect(app.getByText("2.0h / RM 37.50")).toBeInTheDocument();
    expect(app.getByText("RM 2,237.50")).toBeInTheDocument();
  });

  it("moves to the next row in the same time column when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const app = within(screen.getByTestId("screen-app"));
    const currentClockIn = app.getByLabelText("2026-05-06 clock in");
    const nextClockIn = app.getByLabelText("2026-05-07 clock in");

    await user.clear(currentClockIn);
    await user.type(currentClockIn, "0730{Enter}");

    await waitFor(() => {
      expect(currentClockIn).toHaveValue("07:30");
      expect(nextClockIn).toHaveFocus();
    });
  });

  it("prints the current payroll report when the print button is clicked", async () => {
    const user = userEvent.setup();
    const printMock = vi.fn();
    Object.defineProperty(window, "print", { configurable: true, value: printMock });

    render(<Home />);
    await user.click(within(screen.getByTestId("screen-app")).getByRole("button", { name: "Print report" }));

    expect(printMock).toHaveBeenCalledOnce();
  });

  it("renders a print-ready payroll report with summary and timesheet details", () => {
    render(<Home />);

    const report = screen.queryByTestId("print-report");
    expect(report).toBeInTheDocument();
    expect(within(report as HTMLElement).getByRole("heading", { name: "Payroll Report - May 2026", hidden: true })).toBeInTheDocument();
    expect(within(report as HTMLElement).getByText("Monthly Salary")).toBeInTheDocument();
    expect(within(report as HTMLElement).getAllByText("RM 2,200.00").length).toBeGreaterThan(0);
    expect(within(report as HTMLElement).getByText("Final Salary")).toBeInTheDocument();
    expect(within(report as HTMLElement).getByText("2026-05-01")).toBeInTheDocument();
  });
});
