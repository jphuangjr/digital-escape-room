import "server-only";
import type {
  AgeId,
  AtlasCloseupDTO,
  AtlasEnding,
  AtlasEndingDTO,
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
import { AGES, ATLAS_ENDINGS, GLYPHS, HOTSPOT_WALL, LOCATIONS, VALVES } from "@/lib/atlas/types";
import type { HintNote, SceneLogEntry } from "@/lib/scene/types";
import type { Locale } from "@/i18n/config";
import {
  addHint,
  appendLog,
  jammedUntil,
  JAM_SEC,
  lockState,
  MAX_LOG,
  nextHintTier,
  parseHints,
  parseJams,
  parseVote,
  recordGuess,
  stepVote,
  type Jams,
  type RoomCtx,
  type StoredHint,
  type StoredLogBase,
  type StoredVote,
  type VoteStep,
  type Who,
} from "../scene/engine";
import type { SceneResult } from "../scene/registry";
import { GATE_ORIGIN, GLYPH_VALUE, NODES, route, traverse } from "./router";
import { atlasLines, atlasT, type AT, type AtlasTextKey } from "./text";
import { docFor, HINT_COOLDOWN_SEC, HINT_PUZZLES, holds, HOTSPOTS, hotspotPlace, ITEM_PLACES, LOCKS, PLACE_NEEDS, PLAZA, pour, ROOTS_ANSWER, SEAL_SOCKETS, SEALS, SECRETS, TANKS, traceBeam, USES } from "./world";

/** A case-log line as stored: no words, so each viewer reads it in their own language. */
interface StoredLog extends StoredLogBase {
  key: AtlasTextKey;
  item?: ItemId;
  place?: LocationId;
  thing?: JamId;
  ending?: AtlasEnding;
}

/** Locks that jam: the two padlocks and the gate (three misroutes in a row). */
type JamId = LockId | "gate" | "roots" | "plate" | "core";
const JAM_IDS: JamId[] = ["clock", "engine", "index", "dial", "registry", "gate", "roots", "plate", "core"];
const TANK_NAMES = ["c.tanks.big", "c.tanks.pressure", "c.tanks.small"] as const;

/** What an Atlas room stores in Room.scene. Shared by everyone in the room. */
export interface AtlasScene {
  v: 1;
  flags: string[];
  /** The team's shared inventory, in pick-up order. */
  inventory: ItemId[];
  /** Every item ever picked up (taken items never reappear). */
  found: ItemId[];
  /** Water in the Pelagic airlock's tanks (big, pressure, small). */
  tanks: number[];
  /** Valve turns since the tunnel last flooded, e.g. ["+intake", "+reservoir"]. */
  valveRun: string[];
  log: StoredLog[];
  hints: StoredHint[];
  jams: Jams<JamId>;
  /** The room vote on the ending, once someone calls it at the Atlas Core. */
  vote: StoredVote<AtlasEnding> | null;
  ending: { choice: AtlasEnding; at: string; counts: Record<AtlasEnding, number>; secrets: number } | null;
}

/** Case-log lines that mark a lock opened or a puzzle solved (the room celebrates these). */
const SOLVE_LOGS = new Set<AtlasTextKey>([
  "log.clock",
  "log.stairs",
  "log.drained",
  "log.engine",
  "log.index",
  "log.registered",
  "log.rerouted",
  "log.balanced",
  "log.registry",
  "log.seed",
  "log.lit",
  "log.vault",
  "log.dial",
  "log.roots",
  "log.crossed",
]);
const ITEM_IDS = Object.keys(ITEM_PLACES) as ItemId[];
const HOTSPOT_IDS = Object.keys(HOTSPOT_WALL) as HotspotId[];
const GLYPH_IDS = GLYPHS.map((g) => g.id);
const LOCK_IDS = Object.keys(LOCKS) as LockId[];

export function initialScene(): AtlasScene {
  return { v: 1, flags: [], inventory: [], found: [], tanks: [...TANKS.start], valveRun: [], log: [], hints: [], jams: {}, vote: null, ending: null };
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
    tanks: validTanks(s.tanks) ? s.tanks : [...TANKS.start],
    valveRun: strings(s.valveRun),
    log: Array.isArray(s.log) ? (s.log as StoredLog[]).filter((l) => l && typeof l.key === "string").slice(-MAX_LOG) : [],
    hints: parseHints(s.hints),
    jams: parseJams(s.jams, JAM_IDS),
    vote: parseVote(s.vote, isEnding),
    ending: s.ending && isEnding(s.ending.choice) ? s.ending : null,
  };
}

/** Stored tank levels are kept only if they're whole numbers within each tank and add up to the water there is. */
function validTanks(v: unknown): v is number[] {
  const total = TANKS.start.reduce((a, b) => a + b, 0);
  return (
    Array.isArray(v) &&
    v.length === TANKS.caps.length &&
    v.every((l, i) => Number.isInteger(l) && l >= 0 && l <= TANKS.caps[i]) &&
    v.reduce((a: number, b: number) => a + b, 0) === total
  );
}

const isEnding = (v: unknown): v is AtlasEnding => typeof v === "string" && (ATLAS_ENDINGS as string[]).includes(v);

/** The endings on offer: Reroute only once the Core has been rerouted. */
const choicesFor = (scene: AtlasScene): AtlasEnding[] => (scene.flags.includes("core.rerouted") ? ATLAS_ENDINGS : ["restore", "sever"]);
const secretsFound = (scene: AtlasScene) => SECRETS.filter((i) => scene.found.includes(i)).length;

const hasIn = (scene: AtlasScene) => (f: string) => scene.flags.includes(f);
const reachable = (scene: AtlasScene, place: LocationId) => holds(PLACE_NEEDS[place], hasIn(scene));

/** Long text on an item, shown once it's held. The numeral card is the team's permanent record of the glyphs. */
function readingFor(id: ItemId, T: AT, mirror: boolean): AtlasItemDTO["reading"] {
  if (id === "numerals") {
    const byValue = [...GLYPHS].sort((a, b) => GLYPH_VALUE[a.id] - GLYPH_VALUE[b.id]);
    return { title: T("item.numerals.title"), lines: byValue.map((g) => `${g.char} = ${GLYPH_VALUE[g.id]}`) };
  }
  if (id === "memory-verdant") return { title: T("item.memory-verdant.title"), lines: atlasLines(T, "item.memory-verdant.lines") };
  if (id === "memory-pelagic") return { title: T("item.memory-pelagic.title"), lines: atlasLines(T, "item.memory-pelagic.lines") };
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
  const open = HINT_PUZZLES.filter((p) => !holds(p.solved, has) && holds(p.ready, has));
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
    c.lock = { id, kind: l.kind, length: l.length, label: T(l.label), ...lockState(scene.jams, id, now) };
  }
  if (h === "valves" && !has("water.drained")) c.valves = Object.fromEntries(VALVES.map((v) => [v, has(`valve.${v}`)])) as Record<ValveId, boolean>;
  if (h === "gate") c.gate = { powered: has("engine.on"), ...lockState(scene.jams, "gate", now) };
  // With the can in hand, each pot can be watered until the right one opens the little door.
  if (h === "plate") {
    const sockets = GLYPHS.map((g) => {
      const seal = SEALS.find((s) => SEAL_SOCKETS[s] === g.id && has(`seated.${s}`)) ?? null;
      return { glyph: g.id, seal };
    });
    c.plate = { sockets, registered: has("cathedral.registered"), ...lockState(scene.jams, "plate", now) };
    if (!has("cathedral.registered") && SEALS.some((s) => scene.inventory.includes(s))) c.lines.push(T("c.plate.how"));
  }
  if (h === "core") {
    const canReroute = SECRETS.every((i) => scene.found.includes(i));
    c.core = {
      canReroute,
      rerouted: has("core.rerouted"),
      gates: AGES.map((age) => ({ age, name: T(`place.${age}`), origin: GATE_ORIGIN[age] })),
      convened: has("core.convened"),
      ...lockState(scene.jams, "core", now),
    };
    if (!has("core.convened")) {
      if (has("core.rerouted")) c.lines.push(T("c.core.rerouted"));
      else if (canReroute) c.lines.push(T("c.core.canReroute"));
      c.actions.push({ op: "convene", label: T("c.core.convene") });
    }
  }
  if (h === "tanks") {
    const balanced = has("pelagic.airlock.open");
    c.tanks = { caps: TANKS.caps, levels: scene.tanks, balanced };
    if (!balanced) {
      c.lines.push(T("c.tanks.how"));
      const names = TANK_NAMES.map((k) => T(k));
      for (let a = 0; a < 3; a++)
        for (let b = 0; b < 3; b++) if (a !== b) c.actions.push({ op: `pour:${a}:${b}`, label: T("c.tanks.pour", { from: names[a], to: names[b] }) });
      c.actions.push({ op: "reset", label: T("c.tanks.reset") });
    }
  }
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
    ...(SOLVE_LOGS.has(l.key) ? { solve: true } : {}),
    id: l.id,
    at: l.at,
    playerId: l.playerId,
    playerName: l.playerName,
    text: T(l.key, {
      name: l.playerName,
      item: l.item ? T(`item.${l.item}.log`) : "",
      place: l.place ? T(`place.${l.place}`) : "",
      thing: l.thing ? T(`thing.${l.thing}`) : "",
      ending: l.ending ? T(`ending.${l.ending}.name`) : "",
    }),
  }));
  return {
    flags: scene.flags,
    inventory: scene.inventory.map((id) => itemDTO(id, T, true, scene.inventory.includes("hand-mirror"))),
    closeups,
    log,
    hints,
    nextHints,
    // A place is named only once the team can stand there.
    places: LOCATIONS.map((id) => ({ id, name: open.includes(id) ? T(`place.${id}`) : "", reachable: open.includes(id) })),
    vote:
      scene.vote && !scene.ending
        ? {
            open: true,
            votes: scene.vote.votes,
            tie: scene.vote.tie,
            choices: choicesFor(scene).map((id) => ({ id, name: T(`ending.${id}.name`), line: T(`ending.${id}.line`) })),
          }
        : null,
    ending: endingDTO(scene, opts.startedAt ?? null, T),
  };
}

function endingDTO(scene: AtlasScene, startedAt: Date | null, T: AT): AtlasEndingDTO | null {
  const e = scene.ending;
  if (!e) return null;
  return {
    choice: e.choice,
    title: T(`ending.${e.choice}.title`),
    paragraphs: atlasLines(T, `ending.${e.choice}.text`),
    counts: e.counts,
    secretsFound: e.secrets,
    secretsTotal: SECRETS.length,
    minutes: startedAt ? Math.max(1, Math.round((new Date(e.at).getTime() - startedAt.getTime()) / 60000)) : 0,
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
  room: RoomCtx = { hostId: null, onlineIds: [] },
  now = new Date(),
  loc: Locale = "en",
): AtlasResult {
  const T = atlasT(loc);
  const scene: AtlasScene = { ...prev, flags: [...prev.flags], inventory: [...prev.inventory], found: [...prev.found], tanks: [...prev.tanks], valveRun: [...prev.valveRun], vote: prev.vote };
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

  if (prev.ending) return no("msg.closed");
  if (prev.vote && !["vote", "close-vote", "tiebreak", "hint"].includes(action.type)) return no("msg.waiting");

  /** A move in the vote: a clear winner ends the game; a tie goes to the host. */
  const voted = (step: VoteStep<AtlasEnding>): AtlasResult => {
    if (step.kind === "refused") return no(`msg.${step.reason}`);
    scene.vote = step.vote;
    if (step.kind === "recorded") return ok();
    if (step.kind === "tie") return ok("msg.tie");
    scene.ending = { choice: step.choice, at: now.toISOString(), counts: step.counts, secrets: secretsFound(scene) };
    log("log.ended", { ending: step.choice });
    return { scene, changed: true, ok: true, finished: true };
  };

  switch (action.type) {
    case "vote":
      return voted(stepVote(prev.vote, { type: "vote", choice: action.choice }, who, room, choicesFor(prev)));
    case "close-vote":
      return voted(stepVote(prev.vote, { type: "close" }, who, room, choicesFor(prev)));
    case "tiebreak":
      return voted(stepVote(prev.vote, { type: "tiebreak", choice: action.choice }, who, room, choicesFor(prev)));

    case "seat":
      return seatSeal(action.seal, action.socket);

    case "reroute":
      return reroute(action.rings);

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
      if (target === "tanks" && (op === "reset" || op.startsWith("pour:"))) return pourTank(op);
      if (target === "core" && op === "convene") {
        if (has("core.convened")) return no("msg.nothing");
        set("core.convened");
        scene.vote = { votes: {}, tie: null };
        log("log.convened");
        return ok("msg.convened");
      }
      return no("msg.nothing");
    }

    case "dial": {
      if (!isGlyph(action.outer) || !isGlyph(action.inner)) return no("msg.nothing");
      if (!reachable(prev, "chamber")) return no("msg.cantReach");
      const jammed = jammedUntil(prev.jams, "gate", now);
      if (jammed) return no("msg.gate.jammed", { s: secs(jammed) });
      const crossing = traverse({
        origin: GATE_ORIGIN.observatory,
        outer: action.outer,
        inner: action.inner,
        powered: has("engine.on"),
        cathedralRegistered: has("cathedral.registered"),
      });
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
      const arrive = crossing.place === "cathedral" ? "msg.gate.cathedral" : "msg.gate.arrive";
      return { ...ok(arrive, { place: T(`place.${crossing.place}`) }), attempt, reply: { arrived: crossing.place } };
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

  /**
   * The Observatory plate: seat a seal in a socket. Each seal fits only its own Age's node socket; three wrong
   * tries in a row and the plate needs a minute. All three seated restores the Null Cathedral's registration.
   */
  function seatSeal(seal: ItemId, socket: GlyphId): AtlasResult {
    if (!(SEALS as string[]).includes(seal)) return no("msg.notSeal");
    if (!isGlyph(socket)) return no("msg.nothing");
    if (!scene.inventory.includes(seal)) return no("msg.dontHave");
    if (!reachable(prev, "observatory") || has("cathedral.registered")) return no("msg.nothing");
    const jammed = jammedUntil(prev.jams, "plate", now);
    if (jammed) return no("msg.plateJammed", { s: secs(jammed) });
    const correct = SEAL_SOCKETS[seal] === socket;
    const attempt = { lock: "plate", input: `${seal}/${socket}`, correct };
    const guess = recordGuess(prev.jams, "plate", correct, now);
    scene.jams = guess.jams;
    if (!correct) {
      if (guess.jammedNow) log("log.jammed", { thing: "plate" });
      return { scene, changed: true, ok: false, message: guess.jammedNow ? T("msg.plateJamsNow", { s: JAM_SEC }) : T("msg.wrongSocket"), attempt };
    }
    scene.inventory = scene.inventory.filter((i) => i !== seal);
    set(`seated.${seal}`, "plate.any");
    log("log.seated", { item: seal });
    if (!SEALS.every((s) => has(`seated.${s}`))) return { ...ok("msg.seated"), attempt };
    set("cathedral.registered");
    log("log.registered");
    return { ...ok("msg.registered"), attempt };
  }

  /**
   * The Atlas Core: set each Age's gate so it routes only to the Observatory (node 0) from its own number. Needs
   * all three cross-Age secrets; three wrong tries and the rings need a minute. Unlocks the Reroute ending.
   */
  function reroute(rings: Record<AgeId, { outer: GlyphId; inner: GlyphId }>): AtlasResult {
    if (!reachable(prev, "cathedral") || has("core.rerouted") || has("core.convened")) return no("msg.nothing");
    if (!SECRETS.every((i) => scene.found.includes(i))) return no("msg.rerouteNeedsSecrets");
    if (!rings || !AGES.every((a) => rings[a] && isGlyph(rings[a].outer) && isGlyph(rings[a].inner))) return no("msg.nothing");
    const jammed = jammedUntil(prev.jams, "core", now);
    if (jammed) return no("msg.rerouteJammed", { s: secs(jammed) });
    const home = AGES.every((a) => route(GATE_ORIGIN[a], GLYPH_VALUE[rings[a].outer], GLYPH_VALUE[rings[a].inner], NODES.length) === GATE_ORIGIN.observatory);
    const attempt = { lock: "core", input: AGES.map((a) => `${rings[a].outer}/${rings[a].inner}`).join(" "), correct: home };
    const guess = recordGuess(prev.jams, "core", home, now);
    scene.jams = guess.jams;
    if (!home) {
      if (guess.jammedNow) log("log.jammed", { thing: "core" });
      return { scene, changed: true, ok: false, message: guess.jammedNow ? T("msg.rerouteJamsNow", { s: JAM_SEC }) : T("msg.rerouteWrong"), attempt };
    }
    set("core.rerouted");
    log("log.rerouted");
    return { ...ok("msg.rerouted"), attempt };
  }

  /** The Pelagic tanks: pour one into another, or drain all back to the start. Exactly 4 in the pressure tank opens the airlock. */
  function pourTank(op: string): AtlasResult {
    if (has("pelagic.airlock.open")) return no("msg.tanksDone");
    if (op === "reset") {
      scene.tanks = [...TANKS.start];
      return ok("msg.reset");
    }
    const [from, to] = op.slice(5).split(":").map(Number);
    if (![from, to].every((n) => Number.isInteger(n) && n >= 0 && n < TANKS.caps.length) || from === to) return no("msg.nothing");
    const next = pour(prev.tanks, from, to);
    if (next.every((l, i) => l === prev.tanks[i])) return no("msg.pourNothing");
    scene.tanks = next;
    if (next[TANKS.pressure] !== TANKS.target) return ok("msg.pour", { from: T(TANK_NAMES[from]), to: T(TANK_NAMES[to]) });
    set("pelagic.airlock.open");
    log("log.balanced");
    return { ...ok("msg.balanced"), attempt: { lock: "tanks", input: next.join("/"), correct: true } };
  }

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
