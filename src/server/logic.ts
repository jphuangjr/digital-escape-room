import "server-only";
// Pure helpers (no DB, no Next). Unit-tested in src/server/__tests__.
import type { AppId, Ending, FragmentTag, HintPuzzleId, PuzzleId, RoomProgress, Discovery } from "@/lib/types";

// ---------- Room codes ----------

/** No 0/O, 1/I/L to avoid ambiguity when read aloud or typed on a phone. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_RE = new RegExp(`^ADA-[${CODE_ALPHABET}]{4}$`);

export function generateRoomCode(randInt: (n: number) => number): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += CODE_ALPHABET[randInt(CODE_ALPHABET.length)];
  return `ADA-${s}`;
}

/** Uppercases, trims and validates; accepts "ada7k2q" / "ADA 7K2Q". Returns null when invalid. */
export function normalizeRoomCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  if (/^ADA[^-]/.test(s)) s = `ADA-${s.slice(3)}`;
  if (!s.startsWith("ADA-")) s = `ADA-${s}`;
  return CODE_RE.test(s) ? s : null;
}

// ---------- Identity validation ----------

const CONTROL_RE = /[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g;

/** Words matched as substrings (no plausible innocent embedding). */
const BLOCK_SUBSTR = ["fuck", "shit", "cunt", "nigger", "nigga", "faggot", "retard", "whore", "rapist"];
/** Words matched only as whole words (avoid "Dickens", "Hitchcock", "Scunthorpe"). */
const BLOCK_WORD = ["fag", "dick", "cock", "pussy", "bitch", "slut", "nazi", "rape", "twat", "wank", "kike", "spic"];
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s", "!": "i" };

export function isProfane(name: string): boolean {
  const lower = name.toLowerCase().replace(/[013457@$!]/g, (c) => LEET[c] ?? c);
  const squashed = lower.replace(/[^a-z]/g, "");
  if (BLOCK_SUBSTR.some((w) => squashed.includes(w))) return true;
  const words = lower.split(/[^a-z]+/).filter(Boolean);
  return words.some((w) => BLOCK_WORD.includes(w));
}

export function validateDisplayName(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Display name is required." };
  const value = raw.replace(CONTROL_RE, "").replace(/\s+/g, " ").trim();
  const len = Array.from(value).length;
  if (len < 1) return { ok: false, error: "Display name is required." };
  if (len > 24) return { ok: false, error: "Display name must be 24 characters or fewer." };
  if (isProfane(value)) return { ok: false, error: "Please choose a different display name." };
  return { ok: true, value };
}

export function validateColor(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return null;
}

// ---------- Progress ----------

export const INITIAL_APPS: AppId[] = ["browser", "notes", "email", "files"];
export const PUZZLE_IDS: PuzzleId[] = [
  "tools-folder",
  "shift-key",
  "intranet-login",
  "binary-lesson",
  "admin-console",
  "final-phrase",
  "bonus-pin",
];
export const FRAGMENT_TAGS: FragmentTag[] = ["name", "year", "id", "cipher", "address"];

export function initialProgress(): RoomProgress {
  return { unlockedApps: [...INITIAL_APPS], visitedSites: [], solved: [], badges: [], discoveries: [] };
}

export function parseProgress(raw: unknown): RoomProgress {
  const p = (raw && typeof raw === "object" ? raw : {}) as Partial<RoomProgress>;
  const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
  return {
    unlockedApps: arr<AppId>(p.unlockedApps, [...INITIAL_APPS]),
    visitedSites: arr<string>(p.visitedSites, []),
    solved: arr<PuzzleId>(p.solved, []),
    badges: arr<string>(p.badges, []),
    discoveries: arr<Discovery>(p.discoveries, []),
  };
}

/** Keep the case log bounded; the oldest entries drop off first. */
export const MAX_DISCOVERIES = 200;

/** Append a discovery to the case log (returns a new array). */
export function withDiscovery(
  list: Discovery[],
  d: DistributiveOmit<Discovery, "id" | "at">,
  now = new Date(),
): Discovery[] {
  const id = `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = { ...d, id, at: now.toISOString() } as Discovery;
  return [...list, entry].slice(-MAX_DISCOVERIES);
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export function isPuzzleId(v: unknown): v is PuzzleId {
  return typeof v === "string" && (PUZZLE_IDS as string[]).includes(v);
}

export function isFragmentTag(v: unknown): v is FragmentTag {
  return typeof v === "string" && (FRAGMENT_TAGS as string[]).includes(v);
}

export function isEnding(v: unknown): v is Ending {
  return v === "EXPOSE" || v === "PROTECT";
}

/** Canonical address: lowercase, strip scheme, www., query/hash, trailing slash. */
export function canonicalAddress(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
}

export function hostOf(address: string): string {
  return canonicalAddress(address).split("/")[0];
}

// ---------- Rate limiting ----------

export const ATTEMPT_LIMIT = 5;
export const ATTEMPT_WINDOW_MS = 60_000;

/**
 * Given timestamps of recent attempts (any order) for one room+puzzle, decide whether a new attempt
 * is allowed. retryAfterSec is when the oldest attempt in the window falls out of it.
 */
export function rateLimitDecision(
  recent: Date[],
  now: Date,
  limit = ATTEMPT_LIMIT,
  windowMs = ATTEMPT_WINDOW_MS,
): { limited: boolean; retryAfterSec: number } {
  const inWindow = recent
    .map((d) => d.getTime())
    .filter((t) => now.getTime() - t < windowMs)
    .sort((a, b) => b - a); // newest first
  if (inWindow.length < limit) return { limited: false, retryAfterSec: 0 };
  // The attempt that must expire before we drop below the limit.
  const pivot = inWindow[limit - 1];
  const retryAfterSec = Math.max(1, Math.ceil((pivot + windowMs - now.getTime()) / 1000));
  return { limited: true, retryAfterSec };
}

// ---------- Hints ----------

export const HINT_COOLDOWN_MS = 2 * 60_000;

export function nextHintTier(unlockedTiers: number[]): 1 | 2 | 3 | null {
  const max = unlockedTiers.length ? Math.max(...unlockedTiers) : 0;
  return max >= 3 ? null : ((max + 1) as 1 | 2 | 3);
}

/** ISO time when the next tier may be requested, or null if available now / no more tiers. */
export function hintCooldownUntil(
  hints: { puzzleId: HintPuzzleId; tier: number; createdAt: Date }[],
  puzzleId: HintPuzzleId,
  now: Date,
): Date | null {
  const mine = hints.filter((h) => h.puzzleId === puzzleId);
  if (!mine.length) return null;
  if (nextHintTier(mine.map((h) => h.tier)) === null) return null;
  const last = Math.max(...mine.map((h) => h.createdAt.getTime()));
  const until = last + HINT_COOLDOWN_MS;
  return until > now.getTime() ? new Date(until) : null;
}

// ---------- Voting ----------

export const VOTE_DURATION_MS = 3 * 60_000;
export const ONLINE_WINDOW_MS = 30_000;

export function tally(votes: { choice: string }[]): { EXPOSE: number; PROTECT: number } {
  const t = { EXPOSE: 0, PROTECT: 0 };
  for (const v of votes) if (isEnding(v.choice)) t[v.choice]++;
  return t;
}

export type VoteDecision =
  | { action: "open" }
  | { action: "close"; ending: Ending; summary: { EXPOSE: number; PROTECT: number } }
  | { action: "tie"; summary: { EXPOSE: number; PROTECT: number } };

/**
 * Vote closes when every online player has voted (and at least one online player exists),
 * or the deadline has passed. Majority wins; tie (including no votes) => host tie-break.
 */
export function decideVote(input: {
  votes: { playerId: string; choice: string }[];
  onlinePlayerIds: string[];
  deadline: Date | null;
  now: Date;
}): VoteDecision {
  const { votes, onlinePlayerIds, deadline, now } = input;
  const voted = new Set(votes.filter((v) => isEnding(v.choice)).map((v) => v.playerId));
  const allOnlineVoted = onlinePlayerIds.length > 0 && onlinePlayerIds.every((id) => voted.has(id));
  const expired = deadline !== null && now.getTime() >= deadline.getTime();
  if (!allOnlineVoted && !expired) return { action: "open" };
  const summary = tally(votes);
  if (summary.EXPOSE === summary.PROTECT) return { action: "tie", summary };
  return { action: "close", ending: summary.EXPOSE > summary.PROTECT ? "EXPOSE" : "PROTECT", summary };
}

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------- Chat ----------

export const CHAT_MAX_LEN = 500;
export const CHAT_HISTORY = 100;
/** Minimum gap between one player's messages. */
export const CHAT_MIN_INTERVAL_MS = 1000;

/** Trim, strip control characters (keeping newlines), collapse runs of blank lines. */
export function cleanChatBody(raw: unknown): { ok: true; body: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Message is empty." };
  const body = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!body) return { ok: false, error: "Message is empty." };
  if (body.length > CHAT_MAX_LEN) return { ok: false, error: `Messages can be up to ${CHAT_MAX_LEN} characters.` };
  return { ok: true, body };
}

/** Seconds to wait before this player may send again, or 0. */
export function chatCooldownSec(lastSentAt: Date | null, now = new Date()): number {
  if (!lastSentAt) return 0;
  const wait = CHAT_MIN_INTERVAL_MS - (now.getTime() - lastSentAt.getTime());
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}
