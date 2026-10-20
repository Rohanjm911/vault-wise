import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryCards } from "../features/dashboard/components/SummaryCards";
import { AuthProvider } from "../context/AuthContext";
import { DashboardSummary } from "../types";

describe("SummaryCards Component", () => {
  const mockSummary: DashboardSummary = {
    total_spending_cents: 145025,
    total_income_cents: 400000,
    net_savings_cents: 254975,
    budget_limit_cents: 200000,
    remaining_budget_cents: 54975,
    budget_utilization_percent: 72.51,
    has_budget: true,
    transaction_count: 38,
  };

  it("renders all 6 financial KPI metrics with correct decimal formatting", () => {
    render(
      <AuthProvider>
        <SummaryCards summary={mockSummary} />
      </AuthProvider>,
    );

    expect(screen.getByText("$1,450.25")).toBeInTheDocument();
    expect(screen.getByText("$4,000.00")).toBeInTheDocument();
    expect(screen.getByText("$2,549.75")).toBeInTheDocument();
    expect(screen.getByText("$549.75")).toBeInTheDocument();
    expect(screen.getByText("72.5%")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
  });
});
