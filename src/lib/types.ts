// Shared contracts between server and client.
// IMPORTANT: nothing in this file may contain answers. The answer key lives in src/server/content/answers.ts.

export type AppId = "browser" | "notes" | "email" | "files" | "decoder";

export type PuzzleId =
  | "shift-key" // submitted on lostpaws.net "decode listings" form; unlocks plaintext listings
  | "intranet-login" // intranet login form (username + password joined as "user:pass")
  | "final-phrase" // switch.ada-voss.net input
  | "bonus-pin"; // Files app "Ada's Personal" PIN

/** Puzzles that have hints. Includes navigation milestones that aren't attempt-validated. */
export type HintPuzzleId =
  | "find-blog" // Site 1 -> Site 2
  | "shift-key"
  | "find-pets" // Site 3 -> lostpaws.net
  | "pet-id"
  | "intranet-login"
  | "final-phrase"
  | "bonus-pin";

export type FragmentTag = "name" | "year" | "id" | "cipher" | "address";
export type Ending = "EXPOSE" | "PROTECT";
export type RoomStatus = "playing" | "voting" | "finished";

export interface RoomProgress {
  unlockedApps: AppId[];
  visitedSites: string[]; // canonical addresses, e.g. "thedrift.blog"
  solved: PuzzleId[];
  /** Puzzle-revealed data the client may now show, e.g. decoded plaintext. */
  badges: string[]; // e.g. "compass"
}

export interface PlayerPublic {
  id: string;
  displayName: string;
  color: string;
  isHost: boolean;
  online: boolean; // lastSeenAt within 30s
  currentView: string | null;
}

export interface NoteDTO {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  visibility: "PRIVATE" | "PUBLIC";
  body: string;
  fragmentTag: FragmentTag | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptDTO {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  puzzleId: PuzzleId;
  input: string; // shown in full: the log is shared so the room avoids duplicate guesses
  correct: boolean;
  createdAt: string;
}

export interface HintDTO {
  puzzleId: HintPuzzleId;
  tier: 1 | 2 | 3;
  text: string;
  unlockedAt: string;
}

/** A voicemail/email in the shared Email app. */
export interface EmailDTO {
  id: string;
  from: string;
  subject: string;
  date: string; // in-fiction date string
  body: string; // plain text, \n for newlines
  kind: "email" | "voicemail";
}

export interface VoteState {
  deadline: string | null;
  votes: { playerId: string; choice: Ending }[];
  tieBreakNeeded: boolean; // host must pick
}

export interface EndingDTO {
  ending: Ending;
  title: string;
  body: string; // narrative, \n\n paragraphs
  summary: { EXPOSE: number; PROTECT: number; tieBrokenByHost: boolean };
  bonusEpilogue: string | null; // present when bonus-pin solved
}

export interface RoomState {
  code: string;
  status: RoomStatus;
  hostId: string | null;
  me: { id: string; displayName: string; color: string; isHost: boolean };
  players: PlayerPublic[];
  progress: RoomProgress;
  publicNotes: NoteDTO[];
  privateNotes: NoteDTO[]; // only the requesting player's
  attempts: AttemptDTO[]; // newest first, max 100
  hints: HintDTO[];
  hintCooldowns: Partial<Record<HintPuzzleId, string>>; // ISO time when next tier may be requested
  emails: EmailDTO[]; // base emails + voicemails unlocked by hints/progress
  vote: VoteState | null;
  ending: EndingDTO | null;
}

// ---------- Fake internet ----------

export interface ImageFileInfo {
  filename: string;
  author?: string;
  camera?: string;
  date?: string;
  dimensions?: string;
  comment?: string;
}

/** Content blocks rendered by the client's generic SiteRenderer. */
export type Block =
  | { type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "link"; text: string; href: string } // href is an in-game address, e.g. "meridian-inst.net/about"
  | { type: "nav"; links: { text: string; href: string }[] }
  | { type: "image"; alt: string; caption?: string; art: string; fileInfo: ImageFileInfo } // art = emoji/glyph or key for an SVG placeholder
  | { type: "redacted"; text: string; label?: string } // tap-to-reveal
  | { type: "list"; items: string[] }
  | { type: "staff"; people: { name: string; role: string; bio: string; photo: string | null }[] }
  | { type: "post"; title: string; author?: string; date: string; time?: string; body: string; series?: string }
  | { type: "listing"; title: string; meta: string; body: string; petId?: string } // body may be ciphertext
  | { type: "diff"; label: string; before: string; after: string }
  | { type: "memo"; heading: string; parts: ({ text: string } | { redacted: string })[] }
  | { type: "countdown"; seconds: number; label: string }
  | { type: "form"; form: "shift-key" | "intranet-login" | "final-phrase"; prompt: string }
  | { type: "notice"; tone: "info" | "warning" | "danger" | "success"; text: string }
  | { type: "footer"; text: string }
  | { type: "compass" }; // the broken-needle compass motif (7 notches)

export type SiteTheme = "meridian" | "drift" | "runnerboard" | "lostpaws" | "intranet" | "switch" | "honeypot";

export interface SitePage {
  address: string; // canonical, e.g. "meridian-inst.net/about"
  title: string;
  theme: SiteTheme;
  blocks: Block[];
  source: string; // prettified "HTML" shown by View Source, includes hidden comments
}

export type ResolveResponse =
  | { ok: true; page: SitePage; progress: RoomProgress }
  | { ok: false; error: "unreachable" };

export interface AttemptResponse {
  correct: boolean;
  rateLimited?: boolean;
  retryAfterSec?: number;
  message?: string;
  progress: RoomProgress;
}
