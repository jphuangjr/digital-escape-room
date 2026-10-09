import { describe, expect, it } from "vitest";
import {
  a1z26ToLetters,
  caesarDecode,
  caesarShift,
  caesarWheel,
  letterToNumber,
  lettersToA1z26,
  looksNumeric,
  normalizeShift,
  numberToLetter,
} from "../decoderLogic";

describe("caesar", () => {
  it("normalizes shift", () => {
    expect(normalizeShift(0)).toBe(0);
    expect(normalizeShift(26)).toBe(0);
    expect(normalizeShift(27)).toBe(1);
    expect(normalizeShift(-1)).toBe(25);
    expect(normalizeShift(NaN)).toBe(0);
  });
  it("shifts preserving case and punctuation", () => {
    expect(caesarShift("Hello, World!", 3)).toBe("Khoor, Zruog!");
    expect(caesarShift("xyz", 3)).toBe("abc");
  });
  it("decode inverts encode for all shifts", () => {
    const text = "The quick brown fox, 123.";
    for (let s = 0; s < 26; s++) expect(caesarDecode(caesarShift(text, s), s)).toBe(text);
  });
  it("wheel maps cipher to plain", () => {
    const w = caesarWheel(3);
    expect(w).toHaveLength(26);
    expect(w[0]).toEqual({ cipher: "A", plain: "X" });
    expect(w[3]).toEqual({ cipher: "D", plain: "A" });
    expect(caesarWheel(0).every((m) => m.cipher === m.plain)).toBe(true);
  });
});

describe("a1z26", () => {
  it("single conversions", () => {
    expect(numberToLetter(1)).toBe("A");
    expect(numberToLetter(26)).toBe("Z");
    expect(numberToLetter(0)).toBeNull();
    expect(numberToLetter(27)).toBeNull();
    expect(letterToNumber("a")).toBe(1);
    expect(letterToNumber("Z")).toBe(26);
    expect(letterToNumber("3")).toBeNull();
  });
  it("numbers to letters with any separator", () => {
    expect(a1z26ToLetters("12 15")).toBe("LO");
    expect(a1z26ToLetters("12:15")).toBe("LO");
    expect(a1z26ToLetters("12-15")).toBe("LO");
    expect(a1z26ToLetters("8,9")).toBe("HI");
    expect(a1z26ToLetters(" 3  1 20 ")).toBe("CAT");
    expect(a1z26ToLetters("0 27")).toBe("??");
    expect(a1z26ToLetters("")).toBe("");
  });
  it("letters to numbers", () => {
    expect(lettersToA1z26("lo")).toBe("12 15");
    expect(lettersToA1z26("hi there")).toBe("8 9 / 20 8 5 18 5");
    expect(lettersToA1z26("a!b")).toBe("1 2");
    expect(lettersToA1z26("  ")).toBe("");
  });
  it("detects numeric input", () => {
    expect(looksNumeric("12:15")).toBe(true);
    expect(looksNumeric("abc")).toBe(false);
    expect(looksNumeric("")).toBe(false);
  });
});
