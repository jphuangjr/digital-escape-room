import "server-only";
import { median } from "./logic";

/** One analytics row as the playtest report reads it (AnalyticsEvent, data narrowed to an object). */
export interface PlaytestEvent {
  roomRef: string;
  type: string;
  data: Record<string, unknown> | null;
  createdAt: Date;
}

const minutes = (ms: number | null) => (ms === null ? null : +(ms / 60_000).toFixed(1));
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** A room with no new event for this long, and no ending, counts as abandoned where it stopped. */
export const STALL_AFTER_MS = 60 * 60 * 1000;

/**
 * Where playtesters get stuck in one scene game: how far rooms got (each story flag, in the order rooms reach it),
 * where unfinished rooms stopped, which puzzles needed hints, and how often each lock was guessed wrong.
 * Pure, so it can be tested; /api/admin/playtest feeds it the game's events.
 */
export function playtestReport(gameId: string, events: PlaytestEvent[], now: Date) {
  const mine = events.filter((e) => e.data?.gameId === gameId);
  const rooms = new Map<string, { last: number; ended: boolean; reached: { flag: string; ms: number }[] }>();
  const room = (ref: string) => {
    let r = rooms.get(ref);
    if (!r) rooms.set(ref, (r = { last: 0, ended: false, reached: [] }));
    return r;
  };
  const milestones = new Map<string, { rooms: Set<string>; ms: number[] }>();
  const locks = new Map<string, { attempts: number; wrong: number; rooms: Set<string>; solved: Set<string>; ms: number[] }>();
  const hints = new Map<string, { requests: number; rooms: Set<string>; byTier: Record<1 | 2 | 3, number> }>();
  const endings: Record<string, number> = {};
  const finishMs: number[] = [];
  const hintsUsed: number[] = [];

  for (const e of mine) {
    const d = e.data!;
    const r = room(e.roomRef);
    r.last = Math.max(r.last, e.createdAt.getTime());
    switch (e.type) {
      case "milestone": {
        const flag = String(d.flag);
        const ms = num(d.msFromRoomStart);
        const m = milestones.get(flag) ?? { rooms: new Set<string>(), ms: [] };
        if (!m.rooms.has(e.roomRef)) {
          m.rooms.add(e.roomRef);
          if (ms !== null) m.ms.push(ms);
          r.reached.push({ flag, ms: ms ?? Number.MAX_SAFE_INTEGER });
        }
        milestones.set(flag, m);
        break;
      }
      case "attempt":
      case "puzzle.solved": {
        const id = String(d.puzzleId);
        const l = locks.get(id) ?? { attempts: 0, wrong: 0, rooms: new Set<string>(), solved: new Set<string>(), ms: [] };
        if (e.type === "attempt") {
          l.attempts++;
          if (!d.correct) l.wrong++;
          l.rooms.add(e.roomRef);
        } else if (!l.solved.has(e.roomRef)) {
          l.solved.add(e.roomRef);
          const ms = num(d.msFromRoomStart);
          if (ms !== null) l.ms.push(ms);
        }
        locks.set(id, l);
        break;
      }
      case "hint": {
        const id = String(d.puzzleId);
        const h = hints.get(id) ?? { requests: 0, rooms: new Set<string>(), byTier: { 1: 0, 2: 0, 3: 0 } };
        h.requests++;
        h.rooms.add(e.roomRef);
        const tier = Number(d.tier);
        if (tier === 1 || tier === 2 || tier === 3) h.byTier[tier]++;
        hints.set(id, h);
        break;
      }
      case "ending": {
        r.ended = true;
        const key = String(d.ending);
        endings[key] = (endings[key] ?? 0) + 1;
        const ms = num(d.msFromRoomStart);
        if (ms !== null) finishMs.push(ms);
        const h = num(d.hintsUsed);
        if (h !== null) hintsUsed.push(h);
        break;
      }
    }
  }

  const started = rooms.size;
  // Where each room that gave up (quiet for an hour, no ending) last got to.
  const stalls = new Map<string, number>();
  for (const r of rooms.values()) {
    if (r.ended || now.getTime() - r.last < STALL_AFTER_MS) continue;
    const lastFlag = [...r.reached].sort((a, b) => a.ms - b.ms).at(-1)?.flag ?? "(start)";
    stalls.set(lastFlag, (stalls.get(lastFlag) ?? 0) + 1);
  }

  return {
    gameId,
    rooms: {
      started,
      finished: [...rooms.values()].filter((r) => r.ended).length,
      inProgress: [...rooms.values()].filter((r) => !r.ended && now.getTime() - r.last < STALL_AFTER_MS).length,
      medianMinutesToFinish: minutes(median(finishMs)),
      medianHintsPerFinish: median(hintsUsed),
    },
    // The funnel: steps more rooms reached come first (earlier steps), ties broken by when they're usually reached.
    milestones: [...milestones.entries()]
      .map(([flag, m]) => ({ flag, rooms: m.rooms.size, share: started ? +(m.rooms.size / started).toFixed(3) : 0, medianMinutes: minutes(median(m.ms)) }))
      .sort((a, b) => b.rooms - a.rooms || (a.medianMinutes ?? Infinity) - (b.medianMinutes ?? Infinity)),
    // Most-abandoned spots first: "rooms stopped after this".
    stalls: [...stalls.entries()].map(([after, n]) => ({ after, rooms: n })).sort((a, b) => b.rooms - a.rooms),
    locks: [...locks.entries()]
      .map(([puzzleId, l]) => ({
        puzzleId,
        attempts: l.attempts,
        wrongAttempts: l.wrong,
        roomsAttempted: l.rooms.size,
        roomsSolved: l.solved.size,
        attemptsPerSolve: l.solved.size ? +(l.attempts / l.solved.size).toFixed(2) : null,
        medianMinutesToSolve: minutes(median(l.ms)),
      }))
      .sort((a, b) => (a.medianMinutesToSolve ?? Infinity) - (b.medianMinutesToSolve ?? Infinity)),
    hints: [...hints.entries()]
      .map(([puzzleId, h]) => ({ puzzleId, requests: h.requests, rooms: h.rooms.size, byTier: h.byTier }))
      .sort((a, b) => b.requests - a.requests),
    endings,
  };
}

export type PlaytestReport = ReturnType<typeof playtestReport>;

/**
 * Ada's events in the shape `playtestReport` reads. Ada has no story flags, so each first solve of a puzzle
 * (`puzzle:<id>`) and each first visit to a site (`site:<host>`) becomes a funnel step. Times run from the
 * room's `room.created` event (or its first event). Older rows predate `gameId` on Ada's events, so callers
 * pass every event of the game's rooms and this stamps `gameId`; endings without a time or hint count get them
 * from the room's own events.
 */
export function adaPlaytestEvents(gameId: string, events: PlaytestEvent[]): PlaytestEvent[] {
  const byRoom = new Map<string, PlaytestEvent[]>();
  for (const e of events) byRoom.set(e.roomRef, [...(byRoom.get(e.roomRef) ?? []), e]);
  const out: PlaytestEvent[] = [];
  for (const [roomRef, list] of byRoom) {
    const sorted = [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const start = (sorted.find((e) => e.type === "room.created") ?? sorted[0]).createdAt.getTime();
    const since = (e: PlaytestEvent) => Math.max(0, e.createdAt.getTime() - start);
    const step = (e: PlaytestEvent, flag: string) => ({ roomRef, type: "milestone", createdAt: e.createdAt, data: { gameId, flag, msFromRoomStart: since(e) } });
    const seen = new Set<string>();
    let hints = 0;
    for (const e of sorted) {
      const d: Record<string, unknown> = { ...(e.data ?? {}), gameId };
      switch (e.type) {
        case "site.visit": {
          const flag = `site:${String(d.host ?? d.address ?? "?")}`;
          if (!seen.has(flag)) out.push(step(e, flag));
          seen.add(flag);
          break;
        }
        case "puzzle.solved": {
          const flag = `puzzle:${String(d.puzzleId)}`;
          if (!seen.has(flag)) out.push(step(e, flag));
          seen.add(flag);
          out.push({ ...e, data: { msFromRoomStart: since(e), ...d } });
          break;
        }
        case "hint":
          hints++;
          out.push({ ...e, data: d });
          break;
        case "ending":
          out.push({ ...e, data: { msFromRoomStart: since(e), hintsUsed: hints, ...d } });
          break;
        case "attempt":
          out.push({ ...e, data: d });
          break;
      }
    }
  }
  return out;
}
