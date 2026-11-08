import { AFTER_HOURS_PROMPTS, AFTER_HOURS_REPLIES } from "./afterHours";
import { OFFICE_PROMPT_COUNT, OFFICE_REPLY_COUNT, PROMPTS, REPLIES } from "./cards";

/**
 * Card ids: an office card's id is its index in PROMPTS or REPLIES; an After Hours card's id is this plus its index
 * in the After Hours lists. A gap this wide lets both decks grow without ids ever colliding.
 */
export const AFTER_HOURS_BASE = 10_000;

export const isAfterHours = (id: number) => id >= AFTER_HOURS_BASE;

/** Which pile a card is from: office satire, general (not about work), or the 18+ After Hours deck. */
export type CardKind = "office" | "general" | "adult";

export const promptKind = (id: number): CardKind => (isAfterHours(id) ? "adult" : id < OFFICE_PROMPT_COUNT ? "office" : "general");
export const replyKind = (id: number): CardKind => (isAfterHours(id) ? "adult" : id < OFFICE_REPLY_COUNT ? "office" : "general");

export function promptText(id: number): string {
  return (isAfterHours(id) ? AFTER_HOURS_PROMPTS[id - AFTER_HOURS_BASE] : PROMPTS[id]) ?? "";
}

export function replyText(id: number): string {
  return (isAfterHours(id) ? AFTER_HOURS_REPLIES[id - AFTER_HOURS_BASE] : REPLIES[id]) ?? "";
}

const ids = (n: number, base = 0) => Array.from({ length: n }, (_, i) => base + i);

/** Every prompt id in play: the office deck, plus After Hours when it's on. */
export function promptIds(afterHours: boolean): number[] {
  return [...ids(PROMPTS.length), ...(afterHours ? ids(AFTER_HOURS_PROMPTS.length, AFTER_HOURS_BASE) : [])];
}

export function replyIds(afterHours: boolean): number[] {
  return [...ids(REPLIES.length), ...(afterHours ? ids(AFTER_HOURS_REPLIES.length, AFTER_HOURS_BASE) : [])];
}
