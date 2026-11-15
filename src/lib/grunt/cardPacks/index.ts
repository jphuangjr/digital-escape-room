// Grunt's cards in each language, in the same order as CARDS (the card id is the index). A phone shows the card in
// its own language; a typed guess counts if it matches the card in any language (see server/grunt/game.ts).
import type { GruntCard } from "../cards";

/** Loaded on demand by the phone, for its own language. English is CARDS itself. */
export const CARD_PACK_LOADERS: Record<string, () => Promise<{ default: GruntCard[] }>> = {
  ko: () => import("./ko"),
  "zh-TW": () => import("./zh-TW"),
  es: () => import("./es"),
  ja: () => import("./ja"),
  "pt-BR": () => import("./pt-BR"),
};
