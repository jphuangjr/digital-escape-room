import { timingSafeEqual } from "node:crypto";
import { db } from "@/server/db";
import { error, json } from "@/server/http";
import { median, PUZZLE_IDS } from "@/server/logic";
import { HINT_PUZZLES } from "@/server/content";

function tokenOk(given: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Data = Record<string, unknown> | null;

/**
 * GET /api/admin/analytics?token=ADMIN_TOKEN[&days=30]
 * Per-puzzle funnel: which puzzles stall players.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!tokenOk(url.searchParams.get("token"))) return error(401, "Unauthorized.");
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 86_400_000);

  const events = await db.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { roomRef: true, type: true, data: true },
  });

  const roomsCreated = new Set<string>();
  const puzzles = new Map<
    string,
    { attempts: number; wrongAttempts: number; roomsAttempted: Set<string>; roomsSolved: Set<string>; solveMs: number[] }
  >();
  const hints = new Map<string, { requests: number; rooms: Set<string>; byTier: Record<1 | 2 | 3, number> }>();
  const visits = new Map<string, { visits: number; rooms: Set<string> }>();
  const endings: Record<string, number> = { EXPOSE: 0, PROTECT: 0 };
  let tieBreaks = 0;

  const puzzle = (id: string) => {
    let p = puzzles.get(id);
    if (!p) puzzles.set(id, (p = { attempts: 0, wrongAttempts: 0, roomsAttempted: new Set(), roomsSolved: new Set(), solveMs: [] }));
    return p;
  };
  PUZZLE_IDS.forEach(puzzle);
  for (const h of HINT_PUZZLES) hints.set(h, { requests: 0, rooms: new Set(), byTier: { 1: 0, 2: 0, 3: 0 } });

  for (const e of events) {
    const d = (e.data ?? null) as Data;
    switch (e.type) {
      case "room.created":
        roomsCreated.add(e.roomRef);
        break;
      case "attempt": {
        const p = puzzle(String(d?.puzzleId));
        p.attempts++;
        if (!d?.correct) p.wrongAttempts++;
        p.roomsAttempted.add(e.roomRef);
        break;
      }
      case "puzzle.solved": {
        const p = puzzle(String(d?.puzzleId));
        p.roomsSolved.add(e.roomRef);
        if (typeof d?.msFromRoomStart === "number") p.solveMs.push(d.msFromRoomStart);
        break;
      }
      case "hint": {
        const id = String(d?.puzzleId);
        const h = hints.get(id) ?? { requests: 0, rooms: new Set<string>(), byTier: { 1: 0, 2: 0, 3: 0 } };
        h.requests++;
        h.rooms.add(e.roomRef);
        const tier = Number(d?.tier) as 1 | 2 | 3;
        if (tier in h.byTier) h.byTier[tier]++;
        hints.set(id, h);
        break;
      }
      case "site.visit": {
        const host = String(d?.host ?? d?.address ?? "unknown");
        const v = visits.get(host) ?? { visits: 0, rooms: new Set<string>() };
        v.visits++;
        v.rooms.add(e.roomRef);
        visits.set(host, v);
        break;
      }
      case "ending":
        if (d?.ending === "EXPOSE" || d?.ending === "PROTECT") endings[d.ending]++;
        if (d?.tieBrokenByHost) tieBreaks++;
        break;
    }
  }

  const puzzleStats = [...puzzles.entries()].map(([puzzleId, p]) => {
    const med = median(p.solveMs);
    const stalled = [...p.roomsAttempted].filter((r) => !p.roomsSolved.has(r)).length;
    return {
      puzzleId,
      attempts: p.attempts,
      wrongAttempts: p.wrongAttempts,
      roomsAttempted: p.roomsAttempted.size,
      roomsSolved: p.roomsSolved.size,
      roomsStalled: stalled, // attempted but never solved
      solveRate: p.roomsAttempted.size ? +(p.roomsSolved.size / p.roomsAttempted.size).toFixed(3) : null,
      attemptsPerSolve: p.roomsSolved.size ? +(p.attempts / p.roomsSolved.size).toFixed(2) : null,
      medianMinutesToSolve: med === null ? null : +(med / 60_000).toFixed(1),
    };
  });

  const hintStats = [...hints.entries()].map(([puzzleId, h]) => ({
    puzzleId,
    requests: h.requests,
    rooms: h.rooms.size,
    byTier: h.byTier,
  }));

  return json({
    windowDays: days,
    roomsCreated: roomsCreated.size,
    puzzles: puzzleStats,
    // Sorted by most hint-heavy first: a quick "where do people get stuck" signal.
    hints: hintStats.sort((a, b) => b.requests - a.requests),
    sites: [...visits.entries()]
      .map(([host, v]) => ({ host, visits: v.visits, rooms: v.rooms.size }))
      .sort((a, b) => b.rooms - a.rooms),
    endings: { ...endings, tieBreaks },
  });
}
