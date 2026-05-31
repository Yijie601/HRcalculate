import { render, screen } from "@testing-library/react";
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
});
