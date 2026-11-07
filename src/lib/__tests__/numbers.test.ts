import { describe, expect, it } from "vitest";
import { clampInt } from "../numbers";

describe("clampInt", () => {
  it("keeps what was typed when it's in range", () => {
    expect(clampInt("5", 2, 10_000, 10)).toBe(5);
    expect(clampInt("250", 2, 10_000, 10)).toBe(250);
  });
  it("clamps out-of-range values and rounds decimals", () => {
    expect(clampInt("1", 2, 10_000, 10)).toBe(2);
    expect(clampInt("99999", 2, 10_000, 10)).toBe(10_000);
    expect(clampInt("7.6", 2, 10_000, 10)).toBe(8);
  });
  it("falls back when the field is empty or not a number", () => {
    expect(clampInt("", 2, 10_000, 10)).toBe(10);
    expect(clampInt("  ", 1, 50, 5)).toBe(5);
    expect(clampInt("abc", 1, 50, 5)).toBe(5);
  });
});
