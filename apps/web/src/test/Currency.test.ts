import { describe, it, expect } from "vitest";
import { SUPPORTED_CURRENCIES } from "../constants/currencies";

describe("Supported Currencies", () => {
  it("contains essential global currencies including INR, USD, EUR, GBP", () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain("INR");
    expect(codes).toContain("USD");
    expect(codes).toContain("EUR");
    expect(codes).toContain("GBP");
    expect(codes).toContain("JPY");
  });

  it("has valid non-empty symbols, flags, and distinct codes", () => {
    const codeSet = new Set<string>();
    for (const c of SUPPORTED_CURRENCIES) {
      expect(c.code.length).toBeGreaterThanOrEqual(3);
      expect(c.symbol.length).toBeGreaterThanOrEqual(1);
      expect(c.flag.length).toBeGreaterThanOrEqual(1);
      expect(c.name.length).toBeGreaterThan(0);
      expect(codeSet.has(c.code)).toBe(false);
      codeSet.add(c.code);
    }
  });

  it("correctly associates INR with ₹ symbol and Indian flag", () => {
    const inr = SUPPORTED_CURRENCIES.find((c) => c.code === "INR");
    expect(inr).toBeDefined();
    expect(inr?.symbol).toBe("₹");
    expect(inr?.flag).toBe("🇮🇳");
  });
});
