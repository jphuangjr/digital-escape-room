import "server-only";
import type {
  AtlasCloseupDTO,
  AtlasItemDTO,
  AtlasSceneAction,
  AtlasSceneDTO,
  GlyphId,
  HotspotId,
  ItemId,
  LocationId,
  LockId,
  ValveId,
} from "@/lib/atlas/types";
import { GLYPHS, HOTSPOT_WALL, LOCATIONS, VALVES } from "@/lib/atlas/types";
import type { HintNote, SceneLogEntry } from "@/lib/scene/types";
import type { Locale } from "@/i18n/config";
import {
  addHint,
  appendLog,
  jammedUntil,
  JAM_SEC,
  MAX_LOG,
  nextHintTier,
  parseHints,
  parseJams,
  recordGuess,
  type Jams,
  type RoomCtx,
  type StoredHint,
  type StoredLogBase,
  type Who,
} from "../scene/engine";
import type { SceneResult } from "../scene/registry";
import { GATE_ORIGIN, GLYPH_VALUE, traverse } from "./router";
import { atlasLines, atlasT, type AT, type AtlasTextKey } from "./text";
import { docFor, HINT_COOLDOWN_SEC, HINT_PUZZLES, holds, HOTSPOTS, hotspotPlace, ITEM_PLACES, LOCKS, PLACE_NEEDS, PLAZA, ROOTS_ANSWER, traceBeam, USES } from "./world";

/** A case-log line as stored: no words, so each viewer reads it in their own language. */
interface StoredLog extends StoredLogBase {
  key: AtlasTextKey;
  item?: ItemId;
  place?: LocationId;
  thing?: JamId;
}

/** Locks that jam: the two padlocks and the gate (three misroutes in a row). */
type JamId = LockId | "gate" | "roots";
const JAM_IDS: JamId[] = ["clock", "engine", "index", "dial", "gate", "roots"];

/** What an Atlas room stores in Room.scene. Shared by everyone in the room. */
export interface AtlasScene {
  v: 1;
  flags: string[];
  /** The team's shared inventory, in pick-up order. */
  inventory: ItemId[];
  /** Every item ever picked up (taken items never reappear). */
  found: ItemId[];
  /** Valve turns since the tunnel last flooded, e.g. ["+intake", "+reservoir"]. */
  valveRun: string[];
  log: StoredLog[];
  hints: StoredHint[];
  jams: Jams<JamId>;
}

const ITEM_IDS = Object.keys(ITEM_PLACES) as ItemId[];
const HOTSPOT_IDS = Object.keys(HOTSPOT_WALL) as HotspotId[];
const GLYPH_IDS = GLYPHS.map((g) => g.id);
const LOCK_IDS = Object.keys(LOCKS) as LockId[];

export function initialScene(): AtlasScene {
  return { v: 1, flags: [], inventory: [], found: [], valveRun: [], log: [], hints: [], jams: {} };
}

export function parseScene(raw: unknown): AtlasScene {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<AtlasScene>;
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  const items = (v: unknown) => strings(v).filter((x): x is ItemId => (ITEM_IDS as string[]).includes(x));
  return {
    v: 1,
    flags: strings(s.flags),
    inventory: items(s.inventory),
    found: items(s.found),
    valveRun: strings(s.valveRun),
    log: Array.isArray(s.log) ? (s.log as StoredLog[]).filter((l) => l && typeof l.key === "string").slice(-MAX_LOG) : [],
    hints: parseHints(s.hints),
    jams: parseJams(s.jams, JAM_IDS),
  };
}

const hasIn = (scene: AtlasScene) => (f: string) => scene.flags.includes(f);
const reachable = (scene: AtlasScene, place: LocationId) => holds(PLACE_NEEDS[place], hasIn(scene));

/** Long text on an item, shown once it's held. The numeral card is the team's permanent record of the glyphs. */
function readingFor(id: ItemId, T: AT, mirror: boolean): AtlasItemDTO["reading"] {
  if (id === "numerals") {
    const byValue = [...GLYPHS].sort((a, b) => GLYPH_VALUE[a.id] - GLYPH_VALUE[b.id]);
    return { title: T("item.numerals.title"), lines: byValue.map((g) => `${g.char} = ${GLYPH_VALUE[g.id]}`) };
  }
  if (id === "memory-verdant") return { title: T("item.memory-verdant.title"), lines: atlasLines(T, "item.memory-verdant.lines") };
  if (id === "memory-meridian") return { title: T("item.memory-meridian.title"), lines: atlasLines(T, "item.memory-meridian.lines") };
  // Mirror writing: each line runs backwards until the team has the hand mirror to read it in.
  if (id === "engineer-note") {
    const lines = atlasLines(T, "item.engineer-note.lines");
    return mirror
      ? { title: T("item.engineer-note.title"), lines: [...lines, "", T("item.engineer-note.mirrorHint")] }
      : { title: Array.from(T("item.engineer-note.title")).reverse().join(""), lines: lines.map((l) => Array.from(l).reverse().join("")) };
  }
  return undefined;
}

function itemDTO(id: ItemId, T: AT, held = false, mirror = false): AtlasItemDTO {
  const reading = held ? readingFor(id, T, mirror) : undefined;
  return { id, name: T(`item.${id}.name`), description: T(`item.${id}.desc`), ...(reading ? { reading } : {}) };
}

function takeablesAt(scene: AtlasScene, at: HotspotId): ItemId[] {
  const has = hasIn(scene);
  return ITEM_IDS.filter((id) => ITEM_PLACES[id].at === at && !scene.found.includes(id) && holds(ITEM_PLACES[id].when, has));
}

/** The first unsolved puzzle where the player stands, else the first unsolved one anywhere. */
function hintPuzzle(scene: AtlasScene, where: LocationId) {
  const has = hasIn(scene);
  const open = HINT_PUZZLES.filter((p) => !holds(p.solved, has));
  return open.find((p) => p.place === where) ?? open[0] ?? null;
}

function closeupDTO(h: HotspotId, scene: AtlasScene, T: AT, now: Date): AtlasCloseupDTO {
  const has = hasIn(scene);
  const def = HOTSPOTS[h];
  const text = def.text.find((t) => holds(t.when, has))!;
  const c: AtlasCloseupDTO = {
    title: T(def.title),
    lines: atlasLines(T, text.key),
    actions: (def.actions ?? []).filter((a) => holds(a.when, has)).map((a) => ({ op: a.op, label: T(a.label) })),
    takes: takeablesAt(scene, h).map((id) => itemDTO(id, T)),
  };
  if (def.doc && holds(def.doc.when, has)) c.doc = docFor(def.doc.doc, T);
  for (const id of LOCK_IDS) {
    const l = LOCKS[id];
    if (l.at !== h || !holds(l.when, has)) continue;
    const until = jammedUntil(scene.jams, id, now);
    c.lock = { id, kind: l.kind, length: l.length, label: T(l.label), ...(until ? { jammedUntil: until } : {}) };
  }
  if (h === "valves" && !has("water.drained")) c.valves = Object.fromEntries(VALVES.map((v) => [v, has(`valve.${v}`)])) as Record<ValveId, boolean>;
  if (h === "gate") {
    const until = jammedUntil(scene.jams, "gate", now);
    c.gate = { powered: has("engine.on"), ...(until ? { jammedUntil: until } : {}) };
  }
  // With the can in hand, each pot can be watered until the right one opens the little door.
  if (h === "mirrors") {
    const back = PLAZA.mirrors.map((_, i) => has(`mirror.${i}`));
    const beam = traceBeam(back);
    c.mirrors = {
      w: PLAZA.w,
      h: PLAZA.h,
      mirrors: PLAZA.mirrors.map(([x, y], i) => ({ x, y, back: back[i] })),
      pillars: PLAZA.pillars,
      door: PLAZA.door,
      path: beam.path,
      lit: has("meridian.lit"),
    };
    if (!has("meridian.lit")) c.lines.push(T("c.mirrors.tap"));
  }
  if (h === "roots" && scene.inventory.includes("can") && !has("verdant.door.open")) {
    c.actions.push(...GLYPHS.map((g) => ({ op: `water:${g.id}`, label: T("c.roots.water", { glyph: g.char }) })));
  }
  return c;
}

/** The client's view: only places the team can reach, never a code or a glyph's value. */
export function sceneDTO(scene: AtlasScene, opts: { startedAt?: Date; now?: Date; loc?: Locale } = {}): AtlasSceneDTO {
  const T = atlasT(opts.loc ?? "en");
  const now = opts.now ?? new Date();
  const open = LOCATIONS.filter((p) => reachable(scene, p));
  const closeups: AtlasSceneDTO["closeups"] = {};
  for (const h of HOTSPOT_IDS) if (open.includes(hotspotPlace(h))) closeups[h] = closeupDTO(h, scene, T, now);
  const hints: HintNote[] = scene.hints.map((h) => ({
    id: h.id,
    puzzle: h.puzzle,
    title: T(`hint.${h.puzzle}.title` as AtlasTextKey),
    tier: h.tier,
    text: T(`hint.${h.puzzle}.${h.tier}` as AtlasTextKey),
    at: h.at,
  }));
  const nextHints: AtlasSceneDTO["nextHints"] = {};
  for (const p of open) {
    const puzzle = hintPuzzle(scene, p);
    const next = puzzle && nextHintTier(scene.hints, puzzle.id, HINT_COOLDOWN_SEC, now);
    nextHints[p] = puzzle && next ? { title: T(`hint.${puzzle.id}.title` as AtlasTextKey), ...next } : null;
  }
  const log: SceneLogEntry[] = scene.log.slice(-30).map((l) => ({
    id: l.id,
    at: l.at,
    playerId: l.playerId,
    playerName: l.playerName,
    text: T(l.key, {
      name: l.playerName,
      item: l.item ? T(`item.${l.item}.log`) : "",
      place: l.place ? T(`place.${l.place}`) : "",
      thing: l.thing ? T(`thing.${l.thing}`) : "",
    }),
  }));
  return {
    flags: scene.flags,
    inventory: scene.inventory.map((id) => itemDTO(id, T, true, scene.inventory.includes("hand-mirror"))),
    closeups,
    log,
    hints,
    nextHints,
    places: LOCATIONS.map((id) => ({ id, name: T(`place.${id}`), reachable: open.includes(id) })),
  };
}

export interface AtlasResult extends SceneResult<AtlasScene> {
  reply?: { arrived?: LocationId };
}

const isGlyph = (v: unknown): v is GlyphId => typeof v === "string" && (GLYPH_IDS as string[]).includes(v);
const isHotspot = (v: unknown): v is HotspotId => typeof v === "string" && v in HOTSPOT_WALL;
const isPlace = (v: unknown): v is LocationId => typeof v === "string" && (LOCATIONS as string[]).includes(v);

/** Apply one player action to the scene. Pure: no I/O, so it's unit-testable. */
export function applyAction(
  prev: AtlasScene,
  action: AtlasSceneAction,
  who: Who,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- part of the SceneGame signature; Atlas has no vote yet
  _room: RoomCtx = { hostId: null, onlineIds: [] },
  now = new Date(),
  loc: Locale = "en",
): AtlasResult {
  const T = atlasT(loc);
  const scene: AtlasScene = { ...prev, flags: [...prev.flags], inventory: [...prev.inventory], found: [...prev.found], valveRun: [...prev.valveRun] };
  const has = hasIn(scene);
  const set = (...fs: string[]) => fs.forEach((f) => !has(f) && scene.flags.push(f));
  const clear = (pred: (f: string) => boolean) => (scene.flags = scene.flags.filter((f) => !pred(f)));
  const log = (key: AtlasTextKey, extra: Omit<StoredLog, keyof StoredLogBase | "key"> = {}) => {
    scene.log = appendLog(scene.log, who, now, { key, ...extra });
  };
  const ok = (key?: AtlasTextKey, values?: Record<string, string | number>): AtlasResult => ({
    scene,
    changed: true,
    ok: true,
    message: key ? T(key, values) : undefined,
  });
  const no = (key: AtlasTextKey, values?: Record<string, string | number>): AtlasResult => ({ scene: prev, changed: false, ok: false, message: T(key, values) });
  const canReach = (h: HotspotId) => reachable(prev, hotspotPlace(h));
  const secs = (until: string) => Math.ceil((new Date(until).getTime() - now.getTime()) / 1000);

  switch (action.type) {
    case "take": {
      const place = ITEM_PLACES[action.item];
      if (!place || !canReach(place.at) || !takeablesAt(prev, place.at).includes(action.item)) return no("msg.nothingToTake");
      scene.inventory.push(action.item);
      scene.found.push(action.item);
      log("log.found", { item: action.item });
      return ok("msg.took", { item: T(`item.${action.item}.name`) });
    }

    case "use": {
      const { item, target } = action;
      if (!scene.inventory.includes(item)) return no("msg.dontHave");
      if (!isHotspot(target) || !canReach(target)) return no("msg.cantReach");
      const use = USES.find((u) => u.item === item && u.target === target && holds(u.when, has));
      if (!use) return no("msg.doesntWork");
      set(...use.sets);
      if (use.consumes) scene.inventory = scene.inventory.filter((i) => i !== item);
      log(use.log);
      return ok(use.message);
    }

    case "unlock": {
      const def = LOCKS[action.lock];
      if (!def || !canReach(def.at) || !holds(def.when, has)) return no("msg.noLock");
      const raw = String(action.input ?? "");
      const input = def.kind === "digits" ? raw.replace(/\D/g, "") : Array.from(raw).filter((c) => GLYPHS.some((g) => g.char === c)).join("");
      if (Array.from(input).length !== def.length) return no("msg.wheels", { n: def.length });
      const jammed = jammedUntil(prev.jams, action.lock, now);
      if (jammed) return no("msg.jammed", { s: secs(jammed) });
      const correct = def.answers.includes(input);
      const attempt = { lock: action.lock, input, correct };
      const guess = recordGuess(prev.jams, action.lock, correct, now);
      scene.jams = guess.jams;
      if (!correct) {
        if (guess.jammedNow) log("log.jammed", { thing: action.lock });
        return { scene, changed: true, ok: false, message: guess.jammedNow ? T("msg.jamsNow", { s: JAM_SEC }) : T("msg.wrong"), attempt };
      }
      set(...def.sets);
      log(def.log);
      return { ...ok(def.message), attempt };
    }

    case "operate": {
      const { target, op } = action;
      if (!isHotspot(target) || !canReach(target)) return no("msg.cantReach");
      if (target === "valves" && (VALVES as string[]).includes(op)) return turnValve(op as ValveId);
      if (target === "roots" && op.startsWith("water:")) return waterPot(op.slice(6));
      if (target === "mirrors" && op.startsWith("mirror:")) return tiltMirror(Number(op.slice(7)));
      return no("msg.nothing");
    }

    case "dial": {
      if (!isGlyph(action.outer) || !isGlyph(action.inner)) return no("msg.nothing");
      if (!reachable(prev, "chamber")) return no("msg.cantReach");
      const jammed = jammedUntil(prev.jams, "gate", now);
      if (jammed) return no("msg.gate.jammed", { s: secs(jammed) });
      const crossing = traverse({ origin: GATE_ORIGIN.observatory, outer: action.outer, inner: action.inner, powered: has("engine.on") });
      if (crossing.kind === "unpowered") return no("msg.gate.unpowered");
      const correct = crossing.kind === "arrive";
      const attempt = { lock: "gate", input: `${action.outer}/${action.inner}`, correct };
      const guess = recordGuess(prev.jams, "gate", correct, now);
      scene.jams = guess.jams;
      if (crossing.kind !== "arrive") {
        if (guess.jammedNow) log("log.jammed", { thing: "gate" });
        const message = guess.jammedNow ? T("msg.gate.jamsNow", { s: JAM_SEC }) : T(`msg.gate.${crossing.kind}`);
        return { scene, changed: true, ok: false, message, attempt };
      }
      const first = !has(`reached.${crossing.place}`);
      set("crossed", `reached.${crossing.place}`);
      if (first) log("log.crossed", { place: crossing.place });
      return { ...ok("msg.gate.arrive", { place: T(`place.${crossing.place}`) }), attempt, reply: { arrived: crossing.place } };
    }

    case "hint": {
      const where = isPlace(action.where) && reachable(prev, action.where) ? action.where : "observatory";
      const puzzle = hintPuzzle(prev, where);
      const next = puzzle && nextHintTier(prev.hints, puzzle.id, HINT_COOLDOWN_SEC, now);
      if (!puzzle || !next) return no("msg.noHint");
      if (next.readyAt) return no("msg.hintBusy");
      scene.hints = addHint(prev.hints, puzzle.id, next.tier, now);
      log("log.hint");
      return ok("msg.hint");
    }
  }
  return no("msg.nothing");

  /** The Meridian plaza: tilt one mirror. When the light lands on the sun door, the door opens for good. */
  function tiltMirror(i: number): AtlasResult {
    if (!Number.isInteger(i) || i < 0 || i >= PLAZA.mirrors.length) return no("msg.nothing");
    if (has("meridian.lit")) return no("msg.mirrorsDone");
    const flag = `mirror.${i}`;
    if (has(flag)) clear((f) => f === flag);
    else set(flag);
    if (!traceBeam(PLAZA.mirrors.map((_, m) => has(`mirror.${m}`))).lit) return ok("msg.mirror");
    set("meridian.lit");
    log("log.lit");
    return ok("msg.lit");
  }

  /**
   * The Verdant roots: water one pot. The pot whose root (followed down through every graft) reaches the
   * little door opens it; any other just soaks the soil. Three wrong pots in a row and the soil needs to drain.
   */
  function waterPot(pot: string): AtlasResult {
    if (!isGlyph(pot)) return no("msg.nothing");
    if (has("verdant.door.open")) return no("msg.nothing");
    if (!scene.inventory.includes("can")) return no("msg.needCan");
    const jammed = jammedUntil(prev.jams, "roots", now);
    if (jammed) return no("msg.rootsJammed", { s: secs(jammed) });
    const glyph = GLYPHS.find((g) => g.id === pot)!.char;
    const correct = pot === ROOTS_ANSWER;
    const attempt = { lock: "roots", input: pot, correct };
    const guess = recordGuess(prev.jams, "roots", correct, now);
    scene.jams = guess.jams;
    if (!correct) {
      if (guess.jammedNow) log("log.jammed", { thing: "roots" });
      const message = guess.jammedNow ? T("msg.rootsJamsNow", { s: JAM_SEC }) : T("msg.rootsWrong", { glyph });
      return { scene, changed: true, ok: false, message, attempt };
    }
    set("verdant.door.open");
    scene.inventory = scene.inventory.filter((i) => i !== "can");
    log("log.roots");
    return { ...ok("msg.rootsRight", { glyph }), attempt };
  }

  /**
   * The Waterworks valves, by the standing orders: the intake opens before the reservoir; the reservoir closes
   * again before the outflow opens; the intake doesn't close until the reservoir has. Breaking an order floods
   * the tunnel and resets every valve. Outflow open with the other two closed, after a full reservoir cycle,
   * drains it.
   */
  function turnValve(v: ValveId): AtlasResult {
    if (has("water.drained")) return no("msg.valvesDone");
    const opening = !has(`valve.${v}`);
    const cycled = has("run.reservoir.closed");
    const allowed = opening
      ? v === "intake" || (v === "reservoir" && has("valve.intake")) || (v === "outflow" && cycled && !has("valve.reservoir"))
      : v !== "intake" || cycled;
    scene.valveRun.push(`${opening ? "+" : "-"}${v}`);
    const input = scene.valveRun.join(" ");
    if (!allowed) {
      clear((f) => f.startsWith("valve.") || f.startsWith("run."));
      scene.valveRun = [];
      log("log.flooded");
      return { scene, changed: true, ok: false, message: T("msg.flooded"), attempt: { lock: "valves", input, correct: false } };
    }
    if (opening) {
      set(`valve.${v}`);
      if (v === "reservoir") clear((f) => f === "run.reservoir.closed");
    } else {
      clear((f) => f === `valve.${v}`);
      if (v === "reservoir") set("run.reservoir.closed");
    }
    if (has("valve.outflow") && !has("valve.intake") && !has("valve.reservoir") && has("run.reservoir.closed")) {
      clear((f) => f.startsWith("valve.") || f.startsWith("run."));
      scene.valveRun = [];
      set("water.drained");
      log("log.drained");
      return { ...ok("msg.drained"), attempt: { lock: "valves", input, correct: true } };
    }
    return ok("msg.valve", { valve: T(`valve.${v}`) });
  }
}
