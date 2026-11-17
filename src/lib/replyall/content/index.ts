// Reply All's cards in each language. A pack lists prompts and replies in the same order as the English decks
// (PROMPTS, REPLIES, AFTER_HOURS_*), so a card id finds its translation. A card a pack doesn't have yet shows in
// English. Each phone loads only its own language's pack.

import { AFTER_HOURS_BASE, isAfterHours } from "../deck";

export interface ReplyPack {
  prompts: readonly string[];
  replies: readonly string[];
  afterHoursPrompts?: readonly string[];
  afterHoursReplies?: readonly string[];
}

export const REPLY_PACK_LOADERS: Record<string, () => Promise<{ default: ReplyPack }>> = {
  ko: () => import("./ko"),
  es: () => import("./es"),
  ja: () => import("./ja"),
  "zh-TW": () => import("./zh-TW"),
  "pt-BR": () => import("./pt-BR"),
};

/** Languages whose packs have every card, After Hours included (the landing page says nothing about English). */
export const COMPLETE_PACKS = new Set<string>(["ko", "es", "ja"]);

export function localPrompt(pack: ReplyPack | null, id: number | null | undefined, english: string): string {
  if (!pack || id === null || id === undefined) return english;
  const t = isAfterHours(id) ? pack.afterHoursPrompts?.[id - AFTER_HOURS_BASE] : pack.prompts[id];
  return t || english;
}

export function localReply(pack: ReplyPack | null, id: number | null | undefined, english: string): string {
  if (!pack || id === null || id === undefined) return english;
  const t = isAfterHours(id) ? pack.afterHoursReplies?.[id - AFTER_HOURS_BASE] : pack.replies[id];
  return t || english;
}

/** The view with every card's text in the pack's language (cards it doesn't have stay English). */
export function localizeView<V extends {
  prompt: string | null;
  promptId?: number | null;
  me: { hand: { card: number; text: string }[]; played: number | null; playedText: string | null };
  entries: { card?: number; text: string }[] | null;
  history: { prompt: string; reply: string; promptId?: number; replyId?: number }[];
}>(v: V, pack: ReplyPack | null): V {
  if (!pack) return v;
  return {
    ...v,
    prompt: v.prompt === null ? null : localPrompt(pack, v.promptId, v.prompt),
    me: {
      ...v.me,
      hand: v.me.hand.map((c) => ({ ...c, text: localReply(pack, c.card, c.text) })),
      playedText: v.me.playedText === null ? null : localReply(pack, v.me.played, v.me.playedText),
    },
    entries: v.entries?.map((e) => ({ ...e, text: localReply(pack, e.card, e.text) })) ?? null,
    history: v.history.map((h) => ({ ...h, prompt: localPrompt(pack, h.promptId, h.prompt), reply: localReply(pack, h.replyId, h.reply) })),
  };
}
