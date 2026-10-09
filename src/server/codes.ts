/** Purchase-code formatting. Pure (no DB) so it can be unit-tested. */

/** No 0/O, 1/I/L, so codes survive being read aloud or retyped from a screenshot. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const GROUPS = 3;
const GROUP_LEN = 4;
export const CODE_LEN = GROUPS * GROUP_LEN; // 31^12 ≈ 7.9e17 possibilities

/** Random code body, e.g. "7K2QM9XP4HTR". `randInt(n)` must return a uniform int in [0, n). */
export function generateCodeBody(randInt: (n: number) => number): string {
  let s = "";
  for (let i = 0; i < CODE_LEN; i++) s += CODE_ALPHABET[randInt(CODE_ALPHABET.length)];
  return s;
}

/** "KEY-7K2Q-M9XP-4HTR" for display. */
export function formatCode(body: string): string {
  const groups = body.match(new RegExp(`.{1,${GROUP_LEN}}`, "g")) ?? [];
  return ["KEY", ...groups].join("-");
}

/** Accepts "key-7k2q-m9xp-4htr", "7K2Q M9XP 4HTR", etc. Returns the stored body, or null if malformed. */
export function normalizeCodeInput(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length === CODE_LEN + 3 && s.startsWith("KEY")) s = s.slice(3);
  if (s.length !== CODE_LEN) return null;
  return [...s].every((c) => CODE_ALPHABET.includes(c)) ? s : null;
}

/** ACCOUNT_ADMIN may hold one email or a comma-separated list. */
export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}
