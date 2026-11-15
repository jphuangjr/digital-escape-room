import "server-only";
// Every language's cards, for matching typed guesses on the server.
import { CARDS, type GruntCard } from "@/lib/grunt/cards";
import ko from "@/lib/grunt/cardPacks/ko";
import zhTW from "@/lib/grunt/cardPacks/zh-TW";
import es from "@/lib/grunt/cardPacks/es";
import ja from "@/lib/grunt/cardPacks/ja";
import ptBR from "@/lib/grunt/cardPacks/pt-BR";

export const ALL_CARD_PACKS: GruntCard[][] = [CARDS, ko, zhTW, es, ja, ptBR];

/** This card's word and phrase in every language. */
export function cardInEveryLanguage(id: number): GruntCard[] {
  return ALL_CARD_PACKS.map((p) => p[id]).filter((c): c is GruntCard => Boolean(c));
}
