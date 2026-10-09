import "server-only";
import type { PuzzleId } from "@/lib/types";

/**
 * ANSWER KEY. Server only. Never import from client code.
 * Fragments: A = wren, B = 1987, C = 0412.
 */
export const FRAGMENTS = { name: "wren", year: "1987", id: "0412" } as const;

const SHIFT_ANSWERS = new Set(["7", "seven", "rot7", "shift7", "+7"]);
const INTRANET_USER = "wren.okafor";
const INTRANET_PASS = `${FRAGMENTS.year}${FRAGMENTS.id}`;
const FINAL_PHRASE = `${FRAGMENTS.name}-${FRAGMENTS.year}-${FRAGMENTS.id}`;
const BONUS_PIN = "0314";

/** Trim, lowercase, collapse internal whitespace to a single space. */
export function normalize(input: string): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Final-phrase normalization: `_`, `-`, space (and stray punctuation) are equivalent separators. */
export function normalizePhrase(input: string): string {
  return normalize(input)
    .replace(/[\s_\-.,/\\|:;]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function checkAnswer(puzzleId: PuzzleId, input: string): boolean {
  if (typeof input !== "string") return false;
  switch (puzzleId) {
    case "shift-key": {
      const v = normalize(input).replace(/\s+/g, "");
      return SHIFT_ANSWERS.has(v);
    }
    case "intranet-login": {
      const idx = input.indexOf(":");
      if (idx < 0) return false;
      const user = normalize(input.slice(0, idx)).replace(/\s+/g, "");
      const pass = input.slice(idx + 1).replace(/\s+/g, "");
      return user === INTRANET_USER && pass === INTRANET_PASS;
    }
    case "final-phrase":
      return normalizePhrase(input) === FINAL_PHRASE;
    case "bonus-pin":
      return input.replace(/\D/g, "") === BONUS_PIN;
    default:
      return false;
  }
}
