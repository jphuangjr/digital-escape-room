import "server-only";
import type { SceneAction, SceneDTO } from "@/lib/train/types";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { defineSceneGame } from "../scene/registry";
import { THIEF } from "./content";
import { applyAction, parseScene, sceneDTO, type TrainScene } from "./scene";
import { trainT } from "./text";

const ACTIONS = new Set<SceneAction["type"]>(["take", "operate", "use", "combine", "unlock", "item", "hint", "vote", "close-vote", "tiebreak"]);

/** The Nightingale Express on the shared scene engine. */
export const trainGame = defineSceneGame<TrainScene, SceneAction, SceneDTO>({
  id: TRAIN_GAME_ID,
  parse: parseScene,
  dto: sceneDTO,
  isAction: (body) => typeof body.type === "string" && ACTIONS.has(body.type as SceneAction["type"]),
  apply: applyAction,
  guessedLock: (action) => (action.type === "unlock" ? String(action.lock) : null),
  lockPuzzleId: (lock) => `nx-${lock}`,
  tooManyMessage: (loc, s) => trainT(loc)("msg.tooMany", { s }),
  ending: (scene) => scene.ending && { ending: scene.ending.accused, solved: scene.ending.accused === THIEF, hintsUsed: scene.hints.length },
  progress: (scene) => ({ flags: scene.flags, hints: scene.hints }),
  badges: (scene) => (scene.ending?.everyClue ? ["everyclue"] : []),
  // A train case is solved only by naming the thief.
  solvedEnding: (ending) => ending === THIEF,
});
