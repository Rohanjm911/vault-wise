import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("Vaultwise Web App", () => {
  it("renders sign-in screen when user is unauthenticated", () => {
    render(<App />);
    expect(screen.getByText("Vaultwise")).toBeInTheDocument();
    expect(screen.getByText("Your Money. Your Rules.")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/demo@vaultwise\.com|user@example\.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unlock vaultwise|sign in/i }),
    ).toBeInTheDocument();
  });
});
