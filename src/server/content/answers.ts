import "server-only";
import type { PuzzleId } from "@/lib/types";

/**
 * ANSWER KEY. Server only. Never import from client code.
 * Fragments: A = wren, B = 1987, C = 0412.
 */
export const FRAGMENTS = { name: "wren", year: "1987", id: "0412" } as const;

const SHIFT_ANSWERS = new Set(["7", "seven", "rot7", "shift7", "+7", "칠", "일곱", "七", "siete"]);
const INTRANET_USER = "wren.okafor";
const INTRANET_PASS = `${FRAGMENTS.year}${FRAGMENTS.id}`;
const FINAL_PHRASE = `${FRAGMENTS.name}-${FRAGMENTS.year}-${FRAGMENTS.id}`;
const BONUS_PIN = "0314";
/** "What's the weather?" (notes_on_mara.txt inside Ada's Personal). */
const TOOLS_ANSWER = "mara";

/**
 * Names as they're written in translated story text, accepted alongside the English answer.
 * Usernames, passwords and decoded words (wren.okafor, lantern, hello) stay Latin-only: the story
 * always shows those in English.
 */
const NAME_ALIASES: Record<string, string[]> = {
  wren: ["렌", "芮恩"],
  mara: ["마라", "瑪拉"],
};
const nameMatches = (input: string, name: string) =>
  normalize(input).replace(/[^a-z]/g, "") === name ||
  (NAME_ALIASES[name] ?? []).includes(normalize(input).replace(/[^\p{L}]/gu, ""));
/** harbourcc.edu/cs110/binary practice quiz word, shown there in 5-bit binary. */
export const BINARY_PRACTICE_WORD = "hello";
/** Vault admin console password, shown in binary on Wren's dashboard notice. */
export const ADMIN_PASSWORD = "lantern";

/** "lantern" -> "01100 00001 01110 10100 00101 10010 01110" (5 bits per letter, A = 1). */
export function toBinary5(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .map((c) => (c.charCodeAt(0) - 96).toString(2).padStart(5, "0"))
    .join(" ");
}

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
    case "final-phrase": {
      const p = normalizePhrase(input);
      if (p === FINAL_PHRASE) return true;
      const rest = `-${FRAGMENTS.year}-${FRAGMENTS.id}`;
      return p.endsWith(rest) && (NAME_ALIASES[FRAGMENTS.name] ?? []).includes(p.slice(0, -rest.length));
    }
    case "bonus-pin":
      return input.replace(/\D/g, "") === BONUS_PIN;
    case "tools-folder":
      return nameMatches(input, TOOLS_ANSWER);
    case "binary-lesson":
      return normalize(input).replace(/[^a-z]/g, "") === BINARY_PRACTICE_WORD;
    case "admin-console":
      return normalize(input).replace(/[^a-z]/g, "") === ADMIN_PASSWORD;
    default:
      return false;
  }
}
