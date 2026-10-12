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
import type { Locale } from "@/i18n/config";
import {
  closeupText,
  endingText,
  EVIDENCE,
  HINT_COOLDOWN_SEC,
  HINT_PUZZLES,
  hintText,
  hintTitle,
  ITEM_PLACES,
  itemText,
  LOCK_CODES,
  suspectName,
  THIEF,
} from "./content";
import { trainT, type TrainTextKey, type TT } from "./text";

/** A case-log line as stored: no words, so each viewer reads it in their own language. */
interface StoredLog {
  id: string;
  at: string;
  playerId: string;
  playerName: string;
  key: TrainTextKey;
  item?: ItemId;
  suspect?: Suspect;
}

/** What a train room stores in Room.scene. Shared by everyone in the room. */
export interface TrainScene {
  v: 1;
  flags: string[];
  /** The team's shared inventory, in pick-up order. */
  inventory: ItemId[];
  /** Every item ever picked up (taken items never reappear in the room). */
  found: ItemId[];
  log: StoredLog[];
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
  "plaque",
  "heater",
  "hatbox",
  "safety-card",
  "umbrella",
  "painting",
  "carafe",
  "toiletries",
  "water-sign",
  "shaker",
  "stools",
  "vase",
  "porthole",
  "crate",
  "photo",
  "palm",
];
const ITEM_IDS: ItemId[] = [
  "pouch",
  "washstand-key",
  "screwdriver",
  "telegram-left",
  "telegram-right",
  "telegram",
  "cufflink",
  "scorecard",
  "keyring",
  "crank",
  "powder",
  "bank-notice",
  "star",
];
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
    log: Array.isArray(s.log) ? (s.log as StoredLog[]).filter((l) => l && typeof l.key === "string").slice(-MAX_LOG) : [],
    hints: Array.isArray(s.hints) ? s.hints : [],
    vote,
    ending: s.ending && isSuspect(s.ending.accused) ? s.ending : null,
  };
}

function itemDTO(id: ItemId, held: boolean, has: (f: string) => boolean, T: TT): ItemDTO {
  const peeled = has("powder.peeled");
  const { name, description, evidence, reading } = itemText(id, T, { held, peeled });
  return {
    id,
    name,
    description,
    ...(evidence ? { evidence } : {}),
    ...(reading ? { reading } : {}),
    ...(held && id === "powder" && !peeled ? { actions: [{ op: "peel", label: T("item.powder.peel") }] } : {}),
  };
}

/** Items visible and takeable at a hotspot right now. */
function takeablesAt(scene: TrainScene, at: HotspotId): ItemId[] {
  return ITEM_IDS.filter((id) => {
    const place = ITEM_PLACES[id];
    return place?.at === at && !scene.found.includes(id) && place.needs.every((f) => scene.flags.includes(f));
  });
}

function lockAt(h: HotspotId, has: (f: string) => boolean, T: TT): CloseupDTO["lock"] {
  if (h === "suitcase" && !has("suitcase.open")) return { id: "suitcase", kind: "digits", length: 3, label: T("lock.suitcase") };
  if (h === "door" && has("panel.open") && !has("door.open")) return { id: "door", kind: "digits", length: 4, label: T("lock.door") };
  if (h === "cashbox" && !has("cashbox.open")) return { id: "cashbox", kind: "symbols", length: 4, label: T("lock.cashbox") };
  return undefined;
}

/** The first puzzle the team hasn't done yet (what Teodor would help with). */
function currentPuzzle(scene: TrainScene) {
  const has = (f: string) => scene.flags.includes(f);
  const found = (i: ItemId) => scene.found.includes(i);
  return HINT_PUZZLES.find((p) => !p.solved(has, found)) ?? null;
}

function nextHint(scene: TrainScene, now: Date, T: TT = trainT("en")): SceneDTO["nextHint"] {
  if (scene.ending) return null;
  const p = currentPuzzle(scene);
  if (!p) return null;
  const given = scene.hints.filter((h) => h.puzzle === p.id);
  if (given.length >= 3) return null;
  const last = given.at(-1);
  const ready = last ? new Date(new Date(last.at).getTime() + HINT_COOLDOWN_SEC * 1000) : null;
  return { title: hintTitle(T, p.id), tier: (given.length + 1) as 1 | 2 | 3, readyAt: ready && ready > now ? ready.toISOString() : null };
}

function endingDTO(scene: TrainScene, startedAt: Date | null, T: TT): EndingDTO | null {
  const e = scene.ending;
  if (!e) return null;
  const text = endingText(T, e.accused);
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
export function sceneDTO(scene: TrainScene, opts: { startedAt?: Date; now?: Date; loc?: Locale } = {}): SceneDTO {
  const T = trainT(opts.loc ?? "en");
  const has = (f: string) => scene.flags.includes(f);
  const closeups: SceneDTO["closeups"] = {};
  for (const h of HOTSPOTS) {
    const c = closeupText(h, has, T);
    // Once taken, the scorecard is read from the inventory instead.
    const doc = h === "bridge" && scene.found.includes("scorecard") ? undefined : c.doc;
    const lock = lockAt(h, has, T);
    closeups[h] = { ...c, doc, takes: takeablesAt(scene, h).map((id) => itemDTO(id, false, has, T)), ...(lock ? { lock } : {}) };
  }
  const hints: HintNote[] = scene.hints.map((h) => ({
    id: h.id,
    puzzle: h.puzzle,
    title: hintTitle(T, h.puzzle),
    tier: h.tier,
    text: hintText(T, h.puzzle, h.tier),
    at: h.at,
  }));
  const log: SceneLogEntry[] = scene.log.slice(-30).map((l) => ({
    id: l.id,
    at: l.at,
    playerId: l.playerId,
    playerName: l.playerName,
    text: T(l.key, {
      name: l.playerName,
      item: l.item ? itemText(l.item, T, { held: false, peeled: false }).logName : "",
      suspect: l.suspect ? suspectName(T, l.suspect) : "",
    }),
  }));
  return {
    flags: scene.flags,
    inventory: scene.inventory.map((id) => itemDTO(id, true, has, T)),
    closeups,
    log,
    mirrorLetters: has("tap.hot") ? T("mirror.letters") : null,
    hints,
    nextHint: nextHint(scene, opts.now ?? new Date(), T),
    vote: scene.vote && !scene.ending ? { open: true, votes: scene.vote.votes, tie: scene.vote.tie } : null,
    ending: endingDTO(scene, opts.startedAt ?? null, T),
    evidence: EVIDENCE.filter((i) => scene.found.includes(i)).map((id) => itemDTO(id, true, has, T)),
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
export function applyAction(
  prev: TrainScene,
  action: SceneAction,
  who: Who,
  room: RoomCtx = { hostId: null, onlineIds: [] },
  now = new Date(),
  loc: Locale = "en",
): ActionResult {
  const T = trainT(loc);
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
  const log = (key: TrainTextKey, extra: { item?: ItemId; suspect?: Suspect } = {}) => {
    scene.log.push({ id: `${now.getTime().toString(36)}-${scene.log.length}`, at: now.toISOString(), playerId: who.id, playerName: who.name, key, ...extra });
    scene.log = scene.log.slice(-MAX_LOG);
  };
  const ok = (key?: TrainTextKey, values?: Record<string, string | number>): ActionResult => ({
    scene,
    changed: true,
    ok: true,
    message: key ? T(key, values) : undefined,
  });
  const no = (key: TrainTextKey, values?: Record<string, string | number>): ActionResult => ({ scene: prev, changed: false, ok: false, message: T(key, values) });
  const holding = (id: ItemId) => scene.inventory.includes(id);
  const drop = (id: ItemId) => {
    scene.inventory = scene.inventory.filter((i) => i !== id);
  };

  if (prev.ending) return no("msg.closed");
  if (prev.vote && !["vote", "close-vote", "tiebreak", "hint"].includes(action.type)) return no("msg.waiting");

  /** Close the vote: a clear winner ends the game; a tie goes to the host. */
  const closeVote = (): ActionResult => {
    const votes = scene.vote!.votes;
    const counts = tally(votes);
    const top = Math.max(...Object.values(counts));
    if (top === 0) return no("msg.noVotes");
    const leaders = SUSPECTS.filter((s) => counts[s] === top);
    if (leaders.length > 1) {
      scene.vote!.tie = leaders;
      return ok("msg.tie");
    }
    return finish(leaders[0], counts);
  };
  const finish = (accused: Suspect, counts: Record<Suspect, number>): ActionResult => {
    scene.ending = { accused, at: now.toISOString(), counts, everyClue: has("everyclue") };
    log("log.accused", { suspect: accused });
    return { scene, changed: true, ok: true, finished: true };
  };

  switch (action.type) {
    case "take": {
      const place = ITEM_PLACES[action.item];
      if (!place || !takeablesAt(prev, place.at).includes(action.item)) return no("msg.nothingToTake");
      scene.inventory.push(action.item);
      scene.found.push(action.item);
      log("log.found", { item: action.item });
      return ok("msg.took", { item: itemText(action.item, T, { held: false, peeled: false }).name });
    }

    case "operate": {
      const { target, op } = action;
      if (target === "coat" && op === "search" && !has("coat.searched")) {
        set("coat.searched");
        return ok("msg.coat");
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
        log("log.ranHot");
        return ok("msg.hot");
      }
      if (target === "washstand" && op === "cold" && has("tap.hot")) {
        clear("tap.hot");
        return ok("msg.cold");
      }
      if (!has("door.open")) return no("msg.nothing");
      if (target === "stole" && op === "search" && !has("stole.searched")) {
        set("stole.searched");
        return ok("msg.stole");
      }
      if (target === "records" && op === "search" && !has("records.searched")) {
        set("records.searched");
        return ok("msg.records");
      }
      if (target === "bell" && op === "ring" && !has("bell.rung")) {
        if (!scene.found.includes("star")) return no("msg.bellEarly");
        set("bell.rung");
        if (EVIDENCE.every((i) => scene.found.includes(i))) set("everyclue");
        scene.vote = { votes: {}, tie: null };
        log("log.bell");
        return ok("msg.bell");
      }
      return no("msg.nothing");
    }

    case "use": {
      const { item, target } = action;
      if (!holding(item)) return no("msg.dontHave");
      if (item === "washstand-key" && target === "washstand" && !has("washstand.open")) {
        set("washstand.open");
        drop(item);
        log("log.washstand");
        return ok("msg.washstand");
      }
      if (item === "screwdriver" && target === "vent" && !has("vent.open")) {
        set("vent.open");
        log("log.vent");
        return ok("msg.vent");
      }
      if (item === "screwdriver" && target === "door" && !has("panel.open")) {
        set("panel.open");
        log("log.panel");
        return ok("msg.panel");
      }
      if (item === "keyring" && target === "dumbwaiter" && !has("dumbwaiter.open")) {
        set("dumbwaiter.open");
        drop(item);
        log("log.dumbwaiter");
        return ok("msg.dumbwaiter");
      }
      if (item === "crank" && target === "dumbwaiter") {
        if (!has("dumbwaiter.open")) return no("msg.crankLocked");
        if (has("dumbwaiter.raised")) return no("msg.crankDone");
        set("dumbwaiter.raised");
        drop(item);
        log("log.crank");
        return ok("msg.crank");
      }
      return no("msg.doesntWork");
    }

    case "item": {
      if (!holding(action.item)) return no("msg.dontHave");
      if (action.item === "powder" && action.op === "peel" && !has("powder.peeled")) {
        set("powder.peeled");
        log("log.peel");
        return ok("msg.peel");
      }
      return no("msg.nothing");
    }

    case "combine": {
      const [a, b] = action.items;
      const pair = new Set([a, b]);
      if (!holding(a) || !holding(b) || a === b) return no("msg.dontHaveBoth");
      if (pair.has("telegram-left") && pair.has("telegram-right")) {
        scene.inventory = scene.inventory.filter((i) => !pair.has(i));
        scene.inventory.push("telegram");
        scene.found.push("telegram");
        log("log.telegram");
        return ok("msg.telegram");
      }
      return no("msg.dontGo");
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
      if (!reachable) return no("msg.noLock");
      const length = Array.from(LOCK_CODES[lock]).length;
      if (Array.from(input).length !== length) return no("msg.wheels", { n: length });
      const correct = input === LOCK_CODES[lock];
      const attempt = { lock, input, correct };
      if (!correct) return { scene: prev, changed: false, ok: false, message: T("msg.wrong"), attempt };
      if (lock === "suitcase") {
        set("suitcase.open");
        log("log.suitcase");
        return { ...ok("msg.suitcase"), attempt };
      }
      if (lock === "door") {
        set("door.open");
        log("log.door");
        return { ...ok("msg.door"), attempt };
      }
      set("cashbox.open");
      log("log.cashbox");
      return { ...ok("msg.cashbox"), attempt };
    }

    case "hint": {
      const p = currentPuzzle(prev);
      const next = nextHint(prev, now);
      if (!p || !next) return no("msg.noHint");
      if (next.readyAt) return no("msg.hintBusy");
      scene.hints.push({ id: `${now.getTime().toString(36)}-${scene.hints.length}`, puzzle: p.id, tier: next.tier, at: now.toISOString() });
      log("log.hint");
      return ok("msg.hint");
    }

    case "vote": {
      if (!scene.vote) return no("msg.noVote");
      if (!isSuspect(action.suspect)) return no("msg.who");
      scene.vote.votes[who.id] = action.suspect;
      scene.vote.tie = null;
      const everyone = room.onlineIds.length > 0 && room.onlineIds.every((id) => scene.vote!.votes[id]);
      return everyone ? closeVote() : ok();
    }

    case "close-vote": {
      if (!scene.vote) return no("msg.noVote");
      if (room.hostId && who.id !== room.hostId) return no("msg.hostOnlyClose");
      return closeVote();
    }

    case "tiebreak": {
      if (!scene.vote?.tie) return no("msg.noTie");
      if (room.hostId && who.id !== room.hostId) return no("msg.hostOnlyTie");
      if (!scene.vote.tie.includes(action.suspect)) return no("msg.pickTied");
      return finish(action.suspect, tally(scene.vote.votes));
    }
  }
}

/** True for rooms of a physical-room game. */
export { TRAIN_GAME_ID } from "@/lib/train/types";
