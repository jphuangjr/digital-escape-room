import "server-only";

/** Caesar-shift letters A-Z / a-z by `shift` (any integer, negative allowed). Non-letters pass through. */
export function caesar(text: string, shift: number): string {
  const s = ((Math.trunc(shift) % 26) + 26) % 26;
  return text.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

/** A1Z26: 1 -> A ... 26 -> Z. Out-of-range numbers become "?". */
export function a1z26Decode(numbers: number[]): string {
  return numbers.map((n) => (n >= 1 && n <= 26 ? String.fromCharCode(64 + n) : "?")).join("");
}

export function a1z26Encode(text: string): number[] {
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((c) => c.charCodeAt(0) - 64);
}

/** "12:15" -> "LO" (hours and minutes each read as A1Z26). */
export function decodeTimestamp(hhmm: string): string {
  const nums = hhmm.split(":").map((p) => parseInt(p, 10));
  return a1z26Decode(nums);
}

/** The Lost Paws listing shift. Kept here (server-only) so ciphertext is generated, never hand-encoded. */
export const LOSTPAWS_SHIFT = 7;

/**
 * The hidden message, split across listing descriptions in display order.
 * Reading the decoded listings top to bottom yields:
 * "WREN HAS THE KEY. VAULT CODE IS THE YEAR THEY LIED."
 */
export const LOSTPAWS_PLAINTEXT_CHUNKS: readonly string[] = [
  "WREN HAS",
  "THE KEY.",
  "VAULT CODE",
  "IS THE YEAR",
  "THEY LIED.",
];

export const LOSTPAWS_PLAINTEXT = LOSTPAWS_PLAINTEXT_CHUNKS.join(" ");

/** Generated at module load. */
export const LOSTPAWS_CIPHERTEXT_CHUNKS: readonly string[] = LOSTPAWS_PLAINTEXT_CHUNKS.map((c) =>
  caesar(c, LOSTPAWS_SHIFT),
);
