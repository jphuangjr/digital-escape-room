// All Hands' content in each language: the coworker gossip under announcements, the anonymous handles, the badge
// job titles and the #random poll questions. The game state only stores English titles and prompts, and pool and
// line numbers for gossip, so each phone shows them in its own language. Kept out of the message catalogs so other
// pages don't download it; a phone loads only its own language's pack (useContentPack).

import { ANON_NAMES, CHATTER, type ChatterPool } from "../chatter";
import { DECOY_PROMPTS, JOB_TITLES } from "../types";

export interface ContentPack {
  /** Same pools, threads and line counts as English; "{name}" is the player who left. */
  chatter: Record<ChatterPool, readonly (readonly string[])[]>;
  anon: readonly string[];
  /** In JOB_TITLES order. */
  titles: readonly string[];
  /** In DECOY_PROMPTS order. */
  polls: readonly string[];
}

export const EN_PACK: ContentPack = { chatter: CHATTER, anon: ANON_NAMES, titles: JOB_TITLES, polls: DECOY_PROMPTS };

/** Each language's pack, loaded on demand. English is built in. */
export const PACK_LOADERS: Record<string, () => Promise<{ default: ContentPack }>> = {
  ko: () => import("./ko"),
  "zh-TW": () => import("./zh-TW"),
  es: () => import("./es"),
  ja: () => import("./ja"),
  "pt-BR": () => import("./pt-BR"),
};

/** A badge's job title (stored in English) in this pack's language. */
export function localTitle(pack: ContentPack, title: string): string {
  const i = JOB_TITLES.indexOf(title);
  return (i >= 0 && pack.titles[i]) || title;
}

/** A #random poll question (stored in English) in this pack's language. */
export function localPoll(pack: ContentPack, prompt: string): string {
  const i = DECOY_PROMPTS.indexOf(prompt);
  return (i >= 0 && pack.polls[i]) || prompt;
}
