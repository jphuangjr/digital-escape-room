import "server-only";
import { trainGame } from "../train/game";
import type { SceneGame } from "./registry";

/** Every physical-room game, by game id. */
const SCENE_GAMES = new Map<string, SceneGame>([trainGame].map((g) => [g.id, g as unknown as SceneGame]));

/** The scene game a room plays, or undefined for games that aren't scene games (Ada Voss). */
export function sceneGame(gameId: string): SceneGame | undefined {
  return SCENE_GAMES.get(gameId);
}
