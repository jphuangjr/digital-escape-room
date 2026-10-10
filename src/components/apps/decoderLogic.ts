// Pure, client-side decoder helpers. No answers here — generic tools only.

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Wrap any integer shift into 0..25. */
export function normalizeShift(shift: number): number {
  if (!Number.isFinite(shift)) return 0;
  const s = Math.trunc(shift) % 26;
  return s < 0 ? s + 26 : s;
}

/** Shift letters forward by `shift` (encode). Preserves case and non-letters. */
export function caesarShift(text: string, shift: number): string {
  const s = normalizeShift(shift);
  let out = "";
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) out += String.fromCharCode(((c - 65 + s) % 26) + 65);
    else if (c >= 97 && c <= 122) out += String.fromCharCode(((c - 97 + s) % 26) + 97);
    else out += ch;
  }
  return out;
}

/** Decode a Caesar ciphertext that was encoded with `shift` (i.e. shift backwards). */
export function caesarDecode(text: string, shift: number): string {
  return caesarShift(text, -normalizeShift(shift));
}

/** Mapping row for the A–Z wheel: cipher letter -> plain letter, for a decode shift. */
export function caesarWheel(shift: number): { cipher: string; plain: string }[] {
  const s = normalizeShift(shift);
  return ALPHABET.split("").map((cipher, i) => ({ cipher, plain: ALPHABET[(i - s + 26) % 26] }));
}

/** 1 -> "A", 26 -> "Z"; anything else -> null. */
export function numberToLetter(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 26) return null;
  return ALPHABET[n - 1];
}

/** "A"/"a" -> 1 … "Z" -> 26; non-letters -> null. */
export function letterToNumber(ch: string): number | null {
  if (ch.length !== 1) return null;
  const c = ch.toUpperCase().charCodeAt(0);
  return c >= 65 && c <= 90 ? c - 64 : null;
}

/**
 * Numbers -> letters. Accepts any separators: "12 15", "12:15", "12-15", "12,15", "12.15".
 * Numbers out of range (0, 27+) are shown as "?".
 */
export function a1z26ToLetters(input: string): string {
  const nums = input.match(/\d+/g);
  if (!nums) return "";
  return nums.map((n) => numberToLetter(parseInt(n, 10)) ?? "?").join("");
}

/** Letters -> numbers, space separated. Spaces between words become " / ". Other chars ignored. */
export function lettersToA1z26(input: string): string {
  const words = input.trim().split(/\s+/).filter(Boolean);
  return words
    .map((w) =>
      w
        .split("")
        .map(letterToNumber)
        .filter((n): n is number => n !== null)
        .join(" "),
    )
    .filter(Boolean)
    .join(" / ");
}

/** Guess whether the A1Z26 input is numbers (true) or letters (false). */
export function looksNumeric(input: string): boolean {
  const digits = (input.match(/\d/g) ?? []).length;
  const letters = (input.match(/[a-z]/gi) ?? []).length;
  return digits > 0 && digits >= letters;
}

// ---------- Binary (class code: 5 bits per letter, A = 1) ----------

export const BIT_VALUES = [16, 8, 4, 2, 1];

/** True when the input is only 0s, 1s and separators. */
export function looksBinary(input: string): boolean {
  return /[01]/.test(input) && /^[01\s,./|:;-]*$/.test(input);
}

/**
 * Bits -> letters. Groups may be separated by anything; an unseparated run whose length is a
 * multiple of 5 is split into 5-bit letters. Values outside 1..26 show as "?".
 */
export function binaryToLetters(input: string): string {
  const runs = input.match(/[01]+/g);
  if (!runs) return "";
  const groups = runs.flatMap((r) => (r.length > 5 && r.length % 5 === 0 ? (r.match(/[01]{5}/g) ?? []) : [r]));
  return groups.map((g) => numberToLetter(parseInt(g, 2)) ?? "?").join("");
}

/** Letters -> 5-bit groups, space separated; words separated by " / ". */
export function lettersToBinary(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((w) =>
      w
        .split("")
        .map(letterToNumber)
        .filter((n): n is number => n !== null)
        .map((n) => n.toString(2).padStart(5, "0"))
        .join(" "),
    )
    .filter(Boolean)
    .join(" / ");
}
