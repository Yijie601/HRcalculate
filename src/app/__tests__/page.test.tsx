import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
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
    expect(allowance).toHaveValue(0);
    expect(screen.getByLabelText("Previous OT Hours")).toHaveValue(0);
    expect(screen.getByLabelText("Dinner Cutoff")).toHaveValue("21:00");
    await user.clear(allowance);
    await user.type(allowance, "200");
    expect(screen.getByText("RM 2,400.00")).toBeInTheDocument();
  });

  it("uses text-based 24-hour time inputs and accepts compact time", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const defaultIn = screen.getByLabelText("Default In");
    const clockIn = screen.getByLabelText("2026-05-06 clock in");
    const clockOut = screen.getByLabelText("2026-05-06 clock out");

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
    expect(screen.getByText("2.0h / RM 37.50")).toBeInTheDocument();
    expect(screen.getByText("RM 2,237.50")).toBeInTheDocument();
  });

  it("moves to the next row in the same time column when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const currentClockIn = screen.getByLabelText("2026-05-06 clock in");
    const nextClockIn = screen.getByLabelText("2026-05-07 clock in");

    await user.clear(currentClockIn);
    await user.type(currentClockIn, "0730{Enter}");

    await waitFor(() => {
      expect(currentClockIn).toHaveValue("07:30");
      expect(nextClockIn).toHaveFocus();
    });
  });
});
