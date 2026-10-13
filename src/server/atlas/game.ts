import "server-only";
import type { AtlasSceneAction, AtlasSceneDTO } from "@/lib/atlas/types";
import { ATLAS_ENDINGS, ATLAS_GAME_ID } from "@/lib/atlas/types";
import { defineSceneGame } from "../scene/registry";
import { applyAction, parseScene, sceneDTO, type AtlasScene } from "./scene";
import { atlasT } from "./text";
import { SECRETS } from "./world";

const ACTIONS = new Set<AtlasSceneAction["type"]>(["take", "operate", "use", "unlock", "dial", "hint", "seat", "reroute", "vote", "close-vote", "tiebreak"]);

/** Guesses that are rate-limited and logged as attempts, by the lock (or lock-like thing) they try. */
function guessedLock(action: AtlasSceneAction): string | null {
  switch (action.type) {
    case "unlock":
      return String(action.lock);
    case "dial":
      return "gate";
    case "seat":
      return "plate";
    case "reroute":
      return "core";
    case "operate":
      return action.target === "roots" && String(action.op).startsWith("water:") ? "roots" : null;
    default:
      return null;
  }
}

/** The Atlas of Silent Worlds on the shared scene engine. Every ending is an escape; the room chooses which. */
export const atlasGame = defineSceneGame<AtlasScene, AtlasSceneAction, AtlasSceneDTO>({
  id: ATLAS_GAME_ID,
  parse: parseScene,
  dto: sceneDTO,
  isAction: (body) => typeof body.type === "string" && ACTIONS.has(body.type as AtlasSceneAction["type"]),
  apply: applyAction,
  guessedLock,
  lockPuzzleId: (lock) => `atlas-${lock}`,
  tooManyMessage: (loc, s) => atlasT(loc)("msg.tooMany", { s }),
  ending: (scene) => scene.ending && { ending: scene.ending.choice, solved: true, hintsUsed: scene.hints.length },
  // Every cross-Age secret found, and the ending only they unlock.
  progress: (scene) => ({ flags: scene.flags, hints: scene.hints }),
  badges: (scene) => [
    ...(scene.ending && scene.ending.secrets === SECRETS.length ? ["atlas-secrets"] : []),
    ...(scene.ending?.choice === "reroute" ? ["atlas-reroute"] : []),
  ],
  solvedEnding: (ending) => (ATLAS_ENDINGS as (string | null)[]).includes(ending),
});
