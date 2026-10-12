import "server-only";
import type {
  CloseupDTO,
  EndingDTO,
  HintNote,
  HotspotId,
  ItemDTO,
  ItemId,
  LockId,
  SceneAction,
  SceneDTO,
  SceneLogEntry,
  Suspect,
} from "@/lib/train/types";
import { SUSPECTS } from "@/lib/train/types";
import {
  closeupText,
  ENDINGS,
  EVIDENCE,
  HINT_COOLDOWN_SEC,
  HINT_PUZZLES,
  ITEM_PLACES,
  ITEMS,
  LOCK_CODES,
  MIRROR_LETTERS,
  POWDER_PEELED,
  THIEF,
} from "./content";

/** What a train room stores in Room.scene. Shared by everyone in the room. */
export interface TrainScene {
  v: 1;
  flags: string[];
  /** The team's shared inventory, in pick-up order. */
  inventory: ItemId[];
  /** Every item ever picked up (taken items never reappear in the room). */
  found: ItemId[];
  log: SceneLogEntry[];
  /** Teodor's notes, oldest first. */
  hints: { id: string; puzzle: string; tier: 1 | 2 | 3; at: string }[];
  /** The accusation, once the bell is rung. */
  vote: { votes: Record<string, Suspect>; tie: Suspect[] | null } | null;
  ending: { accused: Suspect; at: string; counts: Record<Suspect, number>; everyClue: boolean } | null;
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
  "bell",
  "cashbox",
  "bottles",
  "bridge",
  "sugar",
  "champagne",
  "menu",
  "dumbwaiter",
  "kitchen-door",
  "gramophone",
  "records",
  "stole",
  "dining-window",
];
const ITEM_IDS = Object.keys(ITEMS) as ItemId[];
const MAX_LOG = 100;

export function initialScene(): TrainScene {
  return { v: 1, flags: [], inventory: [], found: [], log: [], hints: [], vote: null, ending: null };
}

const isSuspect = (v: unknown): v is Suspect => typeof v === "string" && (SUSPECTS as string[]).includes(v);

export function parseScene(raw: unknown): TrainScene {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<TrainScene>;
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  const items = (v: unknown) => strings(v).filter((x): x is ItemId => (ITEM_IDS as string[]).includes(x));
  const vote =
    s.vote && typeof s.vote === "object"
      ? {
          votes: Object.fromEntries(Object.entries(s.vote.votes ?? {}).filter(([, v]) => isSuspect(v))) as Record<string, Suspect>,
          tie: Array.isArray(s.vote.tie) ? s.vote.tie.filter(isSuspect) : null,
        }
      : null;
  return {
    v: 1,
    flags: strings(s.flags),
    inventory: items(s.inventory),
    found: items(s.found),
    log: Array.isArray(s.log) ? (s.log as SceneLogEntry[]).slice(-MAX_LOG) : [],
    hints: Array.isArray(s.hints) ? s.hints : [],
    vote,
    ending: s.ending && isSuspect(s.ending.accused) ? s.ending : null,
  };
}

function itemDTO(id: ItemId, held: boolean, has: (f: string) => boolean): ItemDTO {
  const { name, description, evidence, reading } = ITEMS[id];
  const peeled = id === "powder" && has("powder.peeled");
  return {
    id,
    name,
    description: peeled ? "A little brown bottle, half empty. Its label is peeled back." : description,
    ...(evidence ? { evidence } : {}),
    ...(held && reading ? { reading: peeled ? POWDER_PEELED : reading } : {}),
    ...(held && id === "powder" && !peeled ? { actions: [{ op: "peel", label: "Peel back the label" }] } : {}),
  };
}

/** Items visible and takeable at a hotspot right now. */
function takeablesAt(scene: TrainScene, at: HotspotId): ItemId[] {
  return ITEM_IDS.filter((id) => {
    const place = ITEM_PLACES[id];
    return place?.at === at && !scene.found.includes(id) && place.needs.every((f) => scene.flags.includes(f));
  });
}

function lockAt(h: HotspotId, has: (f: string) => boolean): CloseupDTO["lock"] {
  if (h === "suitcase" && !has("suitcase.open")) return { id: "suitcase", kind: "digits", length: 3, label: "Suitcase lock" };
  if (h === "door" && has("panel.open") && !has("door.open")) return { id: "door", kind: "digits", length: 4, label: "Crew override" };
  if (h === "cashbox" && !has("cashbox.open")) return { id: "cashbox", kind: "symbols", length: 4, label: "Cash box" };
  return undefined;
}

/** The first puzzle the team hasn't done yet (what Teodor would help with). */
function currentPuzzle(scene: TrainScene) {
  const has = (f: string) => scene.flags.includes(f);
  const found = (i: ItemId) => scene.found.includes(i);
  return HINT_PUZZLES.find((p) => !p.solved(has, found)) ?? null;
}

function nextHint(scene: TrainScene, now: Date): SceneDTO["nextHint"] {
  if (scene.ending) return null;
  const p = currentPuzzle(scene);
  if (!p) return null;
  const given = scene.hints.filter((h) => h.puzzle === p.id);
  if (given.length >= 3) return null;
  const last = given.at(-1);
  const ready = last ? new Date(new Date(last.at).getTime() + HINT_COOLDOWN_SEC * 1000) : null;
  return { title: p.title, tier: (given.length + 1) as 1 | 2 | 3, readyAt: ready && ready > now ? ready.toISOString() : null };
}

function endingDTO(scene: TrainScene, startedAt: Date | null): EndingDTO | null {
  const e = scene.ending;
  if (!e) return null;
  const text = ENDINGS[e.accused];
  return {
    accused: e.accused,
    correct: e.accused === THIEF,
    title: text.title,
    paragraphs: text.paragraphs,
    counts: e.counts,
    evidenceFound: EVIDENCE.filter((i) => scene.found.includes(i)).length,
    evidenceTotal: EVIDENCE.length,
    everyClue: e.everyClue,
    minutes: startedAt ? Math.max(1, Math.round((new Date(e.at).getTime() - startedAt.getTime()) / 60000)) : 0,
  };
}

/** The client's view of the scene: only what the team has uncovered, never a lock code. */
export function sceneDTO(scene: TrainScene, opts: { startedAt?: Date; now?: Date } = {}): SceneDTO {
  const has = (f: string) => scene.flags.includes(f);
  const closeups: SceneDTO["closeups"] = {};
  for (const h of HOTSPOTS) {
    const c = closeupText(h, has);
    // Once taken, the scorecard is read from the inventory instead.
    const doc = h === "bridge" && scene.found.includes("scorecard") ? undefined : c.doc;
    const lock = lockAt(h, has);
    closeups[h] = { ...c, doc, takes: takeablesAt(scene, h).map((id) => itemDTO(id, false, has)), ...(lock ? { lock } : {}) };
  }
  const hints: HintNote[] = scene.hints.map((h) => {
    const p = HINT_PUZZLES.find((x) => x.id === h.puzzle);
    return { id: h.id, puzzle: h.puzzle, title: p?.title ?? h.puzzle, tier: h.tier, text: p?.tiers[h.tier - 1] ?? "", at: h.at };
  });
  return {
    flags: scene.flags,
    inventory: scene.inventory.map((id) => itemDTO(id, true, has)),
    closeups,
    log: scene.log.slice(-30),
    mirrorLetters: has("tap.hot") ? MIRROR_LETTERS : null,
    hints,
    nextHint: nextHint(scene, opts.now ?? new Date()),
    vote: scene.vote && !scene.ending ? { open: true, votes: scene.vote.votes, tie: scene.vote.tie } : null,
    ending: endingDTO(scene, opts.startedAt ?? null),
    evidence: EVIDENCE.filter((i) => scene.found.includes(i)).map((id) => itemDTO(id, true, has)),
  };
}

export interface ActionResult {
  scene: TrainScene;
  changed: boolean;
  ok: boolean;
  message?: string;
  /** A padlock guess to record in the shared Attempts log. */
  attempt?: { lock: LockId; input: string; correct: boolean };
  /** The accusation just closed: the room is finished. */
  finished?: boolean;
}

export type Who = { id: string; name: string };
/** Who's in the room right now (the vote closes once every online player has voted). */
export type RoomCtx = { hostId: string | null; onlineIds: string[] };

function tally(votes: Record<string, Suspect>): Record<Suspect, number> {
  const counts = Object.fromEntries(SUSPECTS.map((s) => [s, 0])) as Record<Suspect, number>;
  for (const v of Object.values(votes)) counts[v] += 1;
  return counts;
}

/** Apply one player action to the scene. Pure: no I/O, so it's unit-testable. */
export function applyAction(prev: TrainScene, action: SceneAction, who: Who, room: RoomCtx = { hostId: null, onlineIds: [] }, now = new Date()): ActionResult {
  const scene: TrainScene = {
    ...prev,
    flags: [...prev.flags],
    inventory: [...prev.inventory],
    found: [...prev.found],
    log: [...prev.log],
    hints: [...prev.hints],
    vote: prev.vote ? { votes: { ...prev.vote.votes }, tie: prev.vote.tie } : null,
  };
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
  const drop = (id: ItemId) => {
    scene.inventory = scene.inventory.filter((i) => i !== id);
  };

  if (prev.ending) return no("The case is closed.");
  if (prev.vote && !["vote", "close-vote", "tiebreak", "hint"].includes(action.type)) return no("Everyone's waiting for your accusation.");

  /** Close the vote: a clear winner ends the game; a tie goes to the host. */
  const closeVote = (): ActionResult => {
    const votes = scene.vote!.votes;
    const counts = tally(votes);
    const top = Math.max(...Object.values(counts));
    if (top === 0) return no("Nobody has voted yet.");
    const leaders = SUSPECTS.filter((s) => counts[s] === top);
    if (leaders.length > 1) {
      scene.vote!.tie = leaders;
      return ok("It's a tie. The host has the deciding word.");
    }
    return finish(leaders[0], counts);
  };
  const finish = (accused: Suspect, counts: Record<Suspect, number>): ActionResult => {
    scene.ending = { accused, at: now.toISOString(), counts, everyClue: has("everyclue") };
    log(`accused ${accused === "varga" ? "Countess Varga" : accused === "carrow" ? "Mr. Carrow" : accused === "osei" ? "Dr. Osei" : "Mrs. Lindqvist"}`);
    return { scene, changed: true, ok: true, finished: true };
  };

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
      if (!has("door.open")) return no("Nothing happens.");
      if (target === "stole" && op === "search" && !has("stole.searched")) {
        set("stole.searched");
        return ok("A small glass bottle in the pocket.");
      }
      if (target === "records" && op === "search" && !has("records.searched")) {
        set("records.searched");
        return ok("A folded letter slides out of one sleeve.");
      }
      if (target === "bell" && op === "ring" && !has("bell.rung")) {
        if (!scene.found.includes("star")) return no("Teodor puts his head round the door: \"Find the Star first, or no one will believe you.\"");
        set("bell.rung");
        if (EVIDENCE.every((i) => scene.found.includes(i))) set("everyclue");
        scene.vote = { votes: {}, tie: null };
        log("rang for the conductor");
        return ok("The conductor and Teodor hurry in. \"Well? Who took it?\"");
      }
      return no("Nothing happens.");
    }

    case "use": {
      const { item, target } = action;
      if (!holding(item)) return no("You don't have that.");
      if (item === "washstand-key" && target === "washstand" && !has("washstand.open")) {
        set("washstand.open");
        drop(item);
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
      if (item === "keyring" && target === "dumbwaiter" && !has("dumbwaiter.open")) {
        set("dumbwaiter.open");
        drop(item);
        log("unlocked the dumbwaiter");
        return ok("The DUMBWAITER key turns. The hatch swings open onto a dark shaft.");
      }
      if (item === "crank" && target === "dumbwaiter") {
        if (!has("dumbwaiter.open")) return no("The hatch is locked; winding it up wouldn't help yet.");
        if (has("dumbwaiter.raised")) return no("It's already up.");
        set("dumbwaiter.raised");
        drop(item);
        log("wound up the dumbwaiter");
        return ok("You wind and wind. The little lift creaks up into view.");
      }
      return no("That doesn't work there.");
    }

    case "item": {
      if (!holding(action.item)) return no("You don't have that.");
      if (action.item === "powder" && action.op === "peel" && !has("powder.peeled")) {
        set("powder.peeled");
        log("peeled back the label on the sleeping powder");
        return ok("Under the label is an older one, with a different name on it.");
      }
      return no("Nothing happens.");
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
      const input =
        lock === "cashbox"
          ? Array.from(String(action.input ?? "")).filter((c) => "♠♥♦♣".includes(c)).join("")
          : String(action.input ?? "").replace(/\D/g, "");
      const reachable =
        lock === "suitcase"
          ? !has("suitcase.open")
          : lock === "door"
            ? has("panel.open") && !has("door.open")
            : has("door.open") && !has("cashbox.open");
      if (!reachable) return no("There's no lock like that to try.");
      const length = Array.from(LOCK_CODES[lock]).length;
      if (Array.from(input).length !== length) return no(`The lock has ${length} wheels.`);
      const correct = input === LOCK_CODES[lock];
      const attempt = { lock, input, correct };
      if (!correct) return { scene: prev, changed: false, ok: false, message: "The lock doesn't give.", attempt };
      if (lock === "suitcase") {
        set("suitcase.open");
        log("opened Mrs. Lindqvist's suitcase");
        return { ...ok("Click. The suitcase springs open."), attempt };
      }
      if (lock === "door") {
        set("door.open");
        log("opened the compartment door");
        return { ...ok("The dial clunks home and the door slides open."), attempt };
      }
      set("cashbox.open");
      log("opened the cash box");
      return { ...ok("The wheels line up and the lid springs open."), attempt };
    }

    case "hint": {
      const p = currentPuzzle(prev);
      const next = nextHint(prev, now);
      if (!p || !next) return no("Teodor has nothing more to add.");
      if (next.readyAt) return no("Teodor is busy down the corridor. Ring again in a minute.");
      scene.hints.push({ id: `${now.getTime().toString(36)}-${scene.hints.length}`, puzzle: p.id, tier: next.tier, at: now.toISOString() });
      log(`rang for a note from Teodor (${p.title.toLowerCase()})`);
      return ok("A note slides under the door.");
    }

    case "vote": {
      if (!scene.vote) return no("There's nothing to vote on yet.");
      if (!isSuspect(action.suspect)) return no("Who?");
      scene.vote.votes[who.id] = action.suspect;
      scene.vote.tie = null;
      const everyone = room.onlineIds.length > 0 && room.onlineIds.every((id) => scene.vote!.votes[id]);
      return everyone ? closeVote() : ok();
    }

    case "close-vote": {
      if (!scene.vote) return no("There's nothing to vote on yet.");
      if (room.hostId && who.id !== room.hostId) return no("Only the host can close the vote.");
      return closeVote();
    }

    case "tiebreak": {
      if (!scene.vote?.tie) return no("There's no tie to break.");
      if (room.hostId && who.id !== room.hostId) return no("Only the host can break the tie.");
      if (!scene.vote.tie.includes(action.suspect)) return no("Pick one of the tied suspects.");
      return finish(action.suspect, tally(scene.vote.votes));
    }
  }
}

/** True for rooms of a physical-room game. */
export { TRAIN_GAME_ID } from "@/lib/train/types";
