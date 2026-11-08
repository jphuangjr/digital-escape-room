import "server-only";

/**
 * A party game: a social game with hidden information, played by a table of players in one room.
 * Unlike a scene game (cooperative, one view shared by the whole room), every player gets their own view, so
 * secrets such as roles never leave the server except in the one player's own response.
 *
 * State lives in Room.scene and is changed under its row lock (see ../scene/store.ts). Everything here is pure:
 * time and randomness come in through the context, so the rules are easy to test.
 */
export interface PartyCtx {
  /** The player acting (or viewing). */
  playerId: string;
  /** Who may use the host controls right now. */
  hostId: string | null;
  /** Everyone in the room, in join order. */
  roomPlayerIds: string[];
  now: number;
  /** A random integer in [0, n). */
  rand: (n: number) => number;
}

export interface PartyResult<S> {
  state: S;
  changed: boolean;
  ok: boolean;
  /** Why an action was refused, in words for the player. */
  error?: string;
}

export interface PartyGame<S = unknown, A = unknown, V = unknown> {
  id: string;
  /** The most players a table seats (test rooms fill bots up to this). */
  maxPlayers?: number;
  /** Room.scene as stored, tolerating a missing or old value. */
  parse(raw: unknown): S;
  isAction(body: Record<string, unknown>): boolean;
  apply(state: S, action: A, ctx: PartyCtx): PartyResult<S>;
  /** Whether the current phase's timer has run out. */
  due(state: S, now: number): boolean;
  /** Move past a phase whose timer has run out (no-op otherwise). */
  advance(state: S, now: number): PartyResult<S>;
  /** What one player may see. */
  view(state: S, viewerId: string, ctx: { hostId: string | null }): V;
  /** Whether the game is over (the room counts as finished). */
  isOver(state: S): boolean;
  /** Whether this player may post in the room's public chat (say, not once they're out). Missing: always. */
  canChat?(state: S, playerId: string): boolean;
  /** Test rooms: a move a bot in this seat would make now, if any (a raw action body for `apply`). */
  botMove?(state: S, playerId: string, rand: (n: number) => number): Record<string, unknown> | null;
  /** Test rooms: each seated player's role, for the admin's test bar. */
  roles?(state: S): Map<string, string>;
}

export function definePartyGame<S, A, V>(game: PartyGame<S, A, V>): PartyGame<S, A, V> {
  return game;
}
