import "server-only";
import type { AtlasSceneAction, AtlasSceneDTO } from "@/lib/atlas/types";
import { ATLAS_GAME_ID } from "@/lib/atlas/types";
import { defineSceneGame } from "../scene/registry";
import { applyAction, parseScene, sceneDTO, type AtlasScene } from "./scene";
import { atlasT } from "./text";

const ACTIONS = new Set<AtlasSceneAction["type"]>(["take", "operate", "use", "unlock", "dial", "hint"]);

/** The Atlas of Silent Worlds on the shared scene engine. Act I only so far: no ending yet. */
export const atlasGame = defineSceneGame<AtlasScene, AtlasSceneAction, AtlasSceneDTO>({
  id: ATLAS_GAME_ID,
  parse: parseScene,
  dto: sceneDTO,
  isAction: (body) => typeof body.type === "string" && ACTIONS.has(body.type as AtlasSceneAction["type"]),
  apply: applyAction,
  // Padlock guesses and gate dials are rate-limited and logged as attempts.
  guessedLock: (action) =>
    action.type === "unlock"
      ? String(action.lock)
      : action.type === "dial"
        ? "gate"
        : action.type === "operate" && action.target === "roots" && String(action.op).startsWith("water:")
          ? "roots"
          : null,
  lockPuzzleId: (lock) => `atlas-${lock}`,
  tooManyMessage: (loc, s) => atlasT(loc)("msg.tooMany", { s }),
  ending: () => null,
  badges: () => [],
  solvedEnding: () => false,
});
