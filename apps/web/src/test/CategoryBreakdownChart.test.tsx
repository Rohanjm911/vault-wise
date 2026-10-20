import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CategoryBreakdownChart } from "../features/dashboard/components/CategoryBreakdownChart";
import { AuthContext } from "../context/AuthContext";
import { CategoryBreakdownItem } from "../types";

const mockCategories: CategoryBreakdownItem[] = [
  {
    category_id: "cat-1",
    category_name: "Housing & Rent",
    category_color: "#2563eb",
    amount_cents: 120000,
    percentage: 60.0,
  },
  {
    category_id: "cat-2",
    category_name: "Groceries",
    category_color: "#10b981",
    amount_cents: 40000,
    percentage: 20.0,
  },
  {
    category_id: "cat-3",
    category_name: "Entertainment",
    category_color: "#f59e0b",
    amount_cents: 40000,
    percentage: 20.0,
  },
];

const mockAuthContext: any = {
  user: {
    id: "user-1",
    email: "test@vaultwise.com",
    full_name: "Test User",
    created_at: new Date().toISOString(),
    settings: {
      currency_code: "USD",
      currency_symbol: "$",
      date_format: "YYYY-MM-DD",
      theme_mode: "light",
      ai_consent: false,
    },
  },
  token: "mock-token",
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateSettings: async () => {},
};

describe("CategoryBreakdownChart Component", () => {
  it("renders category breakdown title and items", () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CategoryBreakdownChart categories={mockCategories} />
      </AuthContext.Provider>,
    );

    expect(screen.getByText("Category Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Housing & Rent")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
    expect(screen.getByText("$2000.00")).toBeInTheDocument();
  });

  it("updates center details when hovering over legend items", () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CategoryBreakdownChart categories={mockCategories} />
      </AuthContext.Provider>,
    );

    const housingRow = screen
      .getByText("Housing & Rent")
      .closest('div[class*="cursor-pointer"]');
    expect(housingRow).toBeInTheDocument();

    if (housingRow) {
      fireEvent.mouseEnter(housingRow);
    }

    expect(screen.getAllByText("$1200.00").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("60.0%").length).toBeGreaterThanOrEqual(2);

    if (housingRow) {
      fireEvent.mouseLeave(housingRow);
    }

    expect(screen.getByText("$2000.00")).toBeInTheDocument();
  });

  it("renders fallback when no categories are present", () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CategoryBreakdownChart categories={[]} />
      </AuthContext.Provider>,
    );

    expect(
      screen.getByText("No expense categories recorded in this period."),
    ).toBeInTheDocument();
  });
});
