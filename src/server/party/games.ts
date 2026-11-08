import "server-only";
import { allHandsGame } from "../allhands/game";
import { replyAllGame } from "../replyall/game";
import type { PartyGame } from "./registry";

/** Every party game, by game id. */
const PARTY_GAMES = new Map<string, PartyGame>([allHandsGame, replyAllGame].map((g) => [g.id, g as unknown as PartyGame]));

/** The party game a room plays, or undefined for escape rooms. */
export function partyGame(gameId: string): PartyGame | undefined {
  return PARTY_GAMES.get(gameId);
}
