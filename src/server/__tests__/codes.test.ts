import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, CODE_LEN, formatCode, generateCodeBody, normalizeCodeInput, parseAdminEmails } from "../codes";

describe("purchase codes", () => {
  it("generates bodies from the unambiguous alphabet", () => {
    let i = 0;
    const body = generateCodeBody((n) => i++ % n);
    expect(body).toHaveLength(CODE_LEN);
    expect([...body].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
  });

  it("formats and round-trips through normalization", () => {
    const body = "7K2QM9XP4HTR";
    expect(formatCode(body)).toBe("KEY-7K2Q-M9XP-4HTR");
    for (const v of ["KEY-7K2Q-M9XP-4HTR", "key 7k2q m9xp 4htr", "7K2Q-M9XP-4HTR", " 7k2qm9xp4htr "]) {
      expect(normalizeCodeInput(v)).toBe(body);
    }
  });

  it("rejects malformed input", () => {
    for (const v of ["", "ADA-7K2Q", "KEY-7K2Q-M9XP", "KEY-7K2Q-M9XP-4HTR-XXXX", 42, null]) {
      expect(normalizeCodeInput(v)).toBeNull();
    }
  });

  it("parses one or many admin emails, case-insensitively", () => {
    expect(parseAdminEmails("Admin@Example.com")).toEqual(new Set(["admin@example.com"]));
    expect(parseAdminEmails(" a@x.com, B@y.com ,")).toEqual(new Set(["a@x.com", "b@y.com"]));
    expect(parseAdminEmails(undefined).size).toBe(0);
  });
});
