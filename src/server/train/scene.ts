import "server-only";
import type { HotspotId, ItemDTO, ItemId, LockId, SceneAction, SceneDTO, SceneLogEntry } from "@/lib/train/types";
import { closeupText, ITEM_PLACES, ITEMS, LOCK_CODES, MIRROR_LETTERS } from "./content";

/** What a train room stores in Room.scene. Shared by everyone in the room. */
export interface TrainScene {
  v: 1;
  flags: string[];
  /** The team's shared inventory, in pick-up order. */
  inventory: ItemId[];
  /** Every item ever picked up (taken items never reappear in the room). */
  found: ItemId[];
  log: SceneLogEntry[];
}

const HOTSPOTS: HotspotId[] = [
  "window",
  "newspaper",
  "teacup",
  "door",
  "coat",
  "suitcase",
  "pillow",
  "under-berth",
  "lamp",
  "upper-berth",
  "washstand",
  "mirror",
  "vent",
  "towel",
];
const ITEM_IDS = Object.keys(ITEMS) as ItemId[];
const MAX_LOG = 100;

export function initialScene(): TrainScene {
  return { v: 1, flags: [], inventory: [], found: [], log: [] };
}

export function parseScene(raw: unknown): TrainScene {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<TrainScene>;
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  const items = (v: unknown) => strings(v).filter((x): x is ItemId => (ITEM_IDS as string[]).includes(x));
  return {
    v: 1,
    flags: strings(s.flags),
    inventory: items(s.inventory),
    found: items(s.found),
    log: Array.isArray(s.log) ? (s.log as SceneLogEntry[]).slice(-MAX_LOG) : [],
  };
}

const itemDTO = (id: ItemId, held: boolean): ItemDTO => {
  const { name, description, evidence, reading } = ITEMS[id];
  return { id, name, description, ...(evidence ? { evidence } : {}), ...(held && reading ? { reading } : {}) };
};

/** Items visible and takeable at a hotspot right now. */
function takeablesAt(scene: TrainScene, at: HotspotId): ItemId[] {
  return ITEM_IDS.filter((id) => {
    const place = ITEM_PLACES[id];
    return place?.at === at && !scene.found.includes(id) && place.needs.every((f) => scene.flags.includes(f));
  });
}

/** The client's view of the scene: only what the team has uncovered, never a lock code. */
export function sceneDTO(scene: TrainScene): SceneDTO {
  const has = (f: string) => scene.flags.includes(f);
  const closeups: SceneDTO["closeups"] = {};
  for (const h of HOTSPOTS) {
    const c = closeupText(h, has);
    const lock =
      h === "suitcase" && !has("suitcase.open")
        ? { id: "suitcase" as const, kind: "digits" as const, length: 3, label: "Suitcase lock" }
        : h === "door" && has("panel.open") && !has("door.open")
          ? { id: "door" as const, kind: "digits" as const, length: 4, label: "Crew override" }
          : undefined;
    closeups[h] = { ...c, takes: takeablesAt(scene, h).map((id) => itemDTO(id, false)), ...(lock ? { lock } : {}) };
  }
  return {
    flags: scene.flags,
    inventory: scene.inventory.map((id) => itemDTO(id, true)),
    closeups,
    log: scene.log.slice(-30),
    mirrorLetters: has("tap.hot") ? MIRROR_LETTERS : null,
  };
}

export interface ActionResult {
  scene: TrainScene;
  changed: boolean;
  ok: boolean;
  message?: string;
  /** A padlock guess to record in the shared Attempts log. */
  attempt?: { lock: LockId; input: string; correct: boolean };
}

type Who = { id: string; name: string };

/** Apply one player action to the scene. Pure: no I/O, so it's unit-testable. */
export function applyAction(prev: TrainScene, action: SceneAction, who: Who, now = new Date()): ActionResult {
  const scene: TrainScene = { ...prev, flags: [...prev.flags], inventory: [...prev.inventory], found: [...prev.found], log: [...prev.log] };
  const has = (f: string) => scene.flags.includes(f);
  const set = (f: string) => {
    if (!has(f)) scene.flags.push(f);
  };
  const clear = (f: string) => {
    scene.flags = scene.flags.filter((x) => x !== f);
  };
  const log = (text: string) => {
    scene.log.push({ id: `${now.getTime().toString(36)}-${scene.log.length}`, at: now.toISOString(), playerId: who.id, playerName: who.name, text });
    scene.log = scene.log.slice(-MAX_LOG);
  };
  const ok = (message?: string): ActionResult => ({ scene, changed: true, ok: true, message });
  const no = (message: string): ActionResult => ({ scene: prev, changed: false, ok: false, message });
  const holding = (id: ItemId) => scene.inventory.includes(id);

  switch (action.type) {
    case "take": {
      const place = ITEM_PLACES[action.item];
      if (!place || !takeablesAt(prev, place.at).includes(action.item)) return no("There's nothing like that here to take.");
      scene.inventory.push(action.item);
      scene.found.push(action.item);
      log(`found ${ITEMS[action.item].logName}`);
      return ok(`${ITEMS[action.item].name} added to your things.`);
    }

    case "operate": {
      const { target, op } = action;
      if (target === "coat" && op === "search" && !has("coat.searched")) {
        set("coat.searched");
        return ok("Something small and metal in the pocket.");
      }
      if (target === "pillow" && op === "lift" && !has("pillow.lifted")) {
        set("pillow.lifted");
        return ok();
      }
      if (target === "lamp" && op === "toggle") {
        if (has("lamp.on")) clear("lamp.on");
        else set("lamp.on");
        return ok();
      }
      if (target === "washstand" && has("washstand.open") && op === "hot" && !has("tap.hot")) {
        set("tap.hot");
        log("ran the hot tap");
        return ok("Steam curls up over the mirror.");
      }
      if (target === "washstand" && op === "cold" && has("tap.hot")) {
        clear("tap.hot");
        return ok("The steam clears from the mirror.");
      }
      return no("Nothing happens.");
    }

    case "use": {
      const { item, target } = action;
      if (!holding(item)) return no("You don't have that.");
      if (item === "washstand-key" && target === "washstand" && !has("washstand.open")) {
        set("washstand.open");
        scene.inventory = scene.inventory.filter((i) => i !== item);
        log("unlocked the washstand");
        return ok("The key turns. The cabinet folds down into a little washbasin.");
      }
      if (item === "screwdriver" && target === "vent" && !has("vent.open")) {
        set("vent.open");
        log("opened the ceiling vent");
        return ok("Standing on the washstand, you undo the screws. The grille swings down.");
      }
      if (item === "screwdriver" && target === "door" && !has("panel.open")) {
        set("panel.open");
        log("took the service plate off the door");
        return ok("Four screws later, the plate comes away. There's a dial behind it.");
      }
      return no("That doesn't work there.");
    }

    case "combine": {
      const [a, b] = action.items;
      const pair = new Set([a, b]);
      if (!holding(a) || !holding(b) || a === b) return no("You don't have both of those.");
      if (pair.has("telegram-left") && pair.has("telegram-right")) {
        scene.inventory = scene.inventory.filter((i) => !pair.has(i));
        scene.inventory.push("telegram");
        scene.found.push("telegram");
        log("pieced the telegram together");
        return ok("The torn edges match. You can read the whole telegram now.");
      }
      return no("Those don't go together.");
    }

    case "unlock": {
      const { lock } = action;
      const input = String(action.input ?? "").replace(/\D/g, "");
      const reachable = lock === "suitcase" ? !has("suitcase.open") : has("panel.open") && !has("door.open");
      if (!reachable) return no("There's no lock like that to try.");
      if (input.length !== LOCK_CODES[lock].length) return no(`The dial has ${LOCK_CODES[lock].length} wheels.`);
      const correct = input === LOCK_CODES[lock];
      const attempt = { lock, input, correct };
      if (!correct) return { scene: prev, changed: false, ok: false, message: "The lock doesn't give.", attempt };
      if (lock === "suitcase") {
        set("suitcase.open");
        log("opened Mrs. Lindqvist's suitcase");
        return { ...ok("Click. The suitcase springs open."), attempt };
      }
      set("door.open");
      log("opened the compartment door");
      return { ...ok("The dial clunks home and the door slides open."), attempt };
    }
  }
}

/** True for rooms of a physical-room game. */
export { TRAIN_GAME_ID } from "@/lib/train/types";
