import "server-only";
import type { Note, Player, Room } from "@prisma/client";
import type {
  AttemptDTO,
  FragmentTag,
  HintDTO,
  HintPuzzleId,
  NoteDTO,
  PlayerPublic,
  PuzzleId,
  RoomState,
  RoomStatus,
} from "@/lib/types";
import { db } from "./db";
import { hintCooldownUntil, isFragmentTag, ONLINE_WINDOW_MS, parseProgress } from "./logic";
import { baseEmails, getHint, voicemailsFor } from "./content";
import { buildEnding, loadVoteState } from "./vote";

export function isOnline(p: Pick<Player, "lastSeenAt">, now = new Date()): boolean {
  return now.getTime() - p.lastSeenAt.getTime() <= ONLINE_WINDOW_MS;
}

export function noteDTO(n: Note, author: Pick<Player, "displayName" | "color"> | undefined): NoteDTO {
  return {
    id: n.id,
    authorId: n.authorId,
    authorName: author?.displayName ?? "Unknown",
    authorColor: author?.color ?? "#888888",
    visibility: n.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    body: n.body,
    fragmentTag: isFragmentTag(n.fragmentTag) ? (n.fragmentTag as FragmentTag) : null,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export async function loadHints(roomId: string) {
  return db.hintRequest.findMany({ where: { roomId }, orderBy: { createdAt: "asc" } });
}

export function hintDTO(h: { puzzleId: string; tier: number; createdAt: Date }): HintDTO {
  const tier = h.tier as 1 | 2 | 3;
  const puzzleId = h.puzzleId as HintPuzzleId;
  return { puzzleId, tier, text: getHint(puzzleId, tier), unlockedAt: h.createdAt.toISOString() };
}

export async function buildRoomState(room: Room, player: Player): Promise<RoomState> {
  const now = new Date();
  const [players, notes, attempts, hintRows, vote, ending] = await Promise.all([
    db.player.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "asc" } }),
    db.note.findMany({
      where: { roomId: room.id, OR: [{ visibility: "PUBLIC" }, { authorId: player.id }] },
      orderBy: { createdAt: "asc" },
    }),
    db.attempt.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    loadHints(room.id),
    loadVoteState(room),
    buildEnding(room),
  ]);

  const byId = new Map(players.map((p) => [p.id, p]));
  const progress = parseProgress(room.progress);
  const hints = hintRows.map(hintDTO);

  const hintCooldowns: Partial<Record<HintPuzzleId, string>> = {};
  const typedHintRows = hintRows.map((h) => ({ ...h, puzzleId: h.puzzleId as HintPuzzleId }));
  for (const pid of new Set(typedHintRows.map((h) => h.puzzleId))) {
    const until = hintCooldownUntil(typedHintRows, pid, now);
    if (until) hintCooldowns[pid] = until.toISOString();
  }

  const playersPublic: PlayerPublic[] = players.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    color: p.color,
    isHost: p.id === room.hostId,
    online: p.id === player.id || isOnline(p, now),
    currentView: p.currentView,
  }));

  const attemptDTOs: AttemptDTO[] = attempts.map((a) => {
    const p = byId.get(a.playerId);
    return {
      id: a.id,
      playerId: a.playerId,
      playerName: p?.displayName ?? "Unknown",
      playerColor: p?.color ?? "#888888",
      puzzleId: a.puzzleId as PuzzleId,
      input: a.input,
      correct: a.correct,
      createdAt: a.createdAt.toISOString(),
    };
  });

  return {
    code: room.code,
    status: room.status as RoomStatus,
    hostId: room.hostId,
    me: { id: player.id, displayName: player.displayName, color: player.color, isHost: player.id === room.hostId },
    players: playersPublic,
    progress,
    publicNotes: notes.filter((n) => n.visibility === "PUBLIC").map((n) => noteDTO(n, byId.get(n.authorId))),
    privateNotes: notes
      .filter((n) => n.visibility !== "PUBLIC" && n.authorId === player.id)
      .map((n) => noteDTO(n, byId.get(n.authorId))),
    attempts: attemptDTOs,
    hints,
    hintCooldowns,
    emails: [...baseEmails(), ...voicemailsFor(progress, hints)],
    vote,
    ending,
  };
}
