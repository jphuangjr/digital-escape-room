// Shared contracts between server and client.
// IMPORTANT: nothing in this file may contain answers. The answer key lives in src/server/content/answers.ts.

export type AppId = "browser" | "notes" | "email" | "files" | "decoder";

export type PuzzleId =
  | "shift-key" // submitted on lostpaws.net "decode listings" form; unlocks plaintext listings
  | "intranet-login" // intranet login form (username + password joined as "user:pass")
  | "final-phrase" // switch.ada-voss.net input
  | "bonus-pin" // Files app "Ada's Personal" PIN
  | "tools-folder" // Files app "Ada's Tools" security question; unlocks the Decoder
  | "binary-lesson" // harbourcc.edu practice quiz; installs the Binary tab in the Decoder
  | "admin-console"; // the Vault's Systems Admin console (password shown in binary on the dashboard)

/** Puzzles that have hints. Includes navigation milestones that aren't attempt-validated. */
export type HintPuzzleId =
  | "find-blog" // Site 1 -> Site 2
  | "shift-key"
  | "find-pets" // Site 3 -> lostpaws.net
  | "pet-id"
  | "intranet-login"
  | "final-phrase"
  | "bonus-pin"
  | "tools-folder"
  | "binary-lesson"
  | "admin-console";

export type FragmentTag = "name" | "year" | "id" | "cipher" | "address";
export type Ending = "EXPOSE" | "PROTECT";
export type RoomStatus = "playing" | "voting" | "finished";

export interface RoomProgress {
  unlockedApps: AppId[];
  visitedSites: string[]; // canonical addresses, e.g. "thedrift.blog"
  solved: PuzzleId[];
  /** Puzzle-revealed data the client may now show, e.g. decoded plaintext. */
  badges: string[]; // e.g. "compass"
  /** Room-wide case log, oldest first (capped). Drives teammates' toasts and the Case log tab. */
  discoveries: Discovery[];
}

/** Something a player found for the whole room: a new site, or a solved puzzle. */
export type Discovery =
  | { id: string; kind: "site"; host: string; playerId: string; playerName: string; at: string }
  | { id: string; kind: "puzzle"; puzzleId: PuzzleId; playerId: string; playerName: string; at: string };

export interface PlayerPublic {
  id: string;
  displayName: string;
  color: string;
  isHost: boolean;
  online: boolean; // lastSeenAt within 30s
  currentView: string | null;
  image: string | null; // Google profile photo when signed in
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
  me: { id: string; displayName: string; color: string; isHost: boolean; image: string | null; signedIn: boolean };
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
  | { type: "staff"; people: { name: string; role: string; bio: string; photo: string | null; link?: { text: string; href: string } }[] }
  | { type: "post"; title: string; author?: string; date: string; time?: string; body: string; series?: string }
  | { type: "listing"; title: string; meta: string; body: string; petId?: string } // body may be ciphertext
  | { type: "diff"; label: string; before: string; after: string }
  | { type: "memo"; heading: string; parts: ({ text: string } | { redacted: string })[] }
  | { type: "countdown"; seconds: number; label: string }
  | { type: "form"; form: SiteFormId; prompt: string }
  | { type: "table"; caption?: string; columns: string[]; rows: string[][] } // wide tables scroll in their own box
  | { type: "bits" } // interactive 5-bit place-value widget (generic teaching tool, no answers)
  | { type: "notice"; tone: "info" | "warning" | "danger" | "success"; text: string }
  | { type: "footer"; text: string }
  | { type: "compass" }; // the broken-needle compass motif (7 notches)

export type SiteFormId = "shift-key" | "intranet-login" | "final-phrase" | "binary-quiz" | "admin-login";

export type SiteTheme = "meridian" | "drift" | "runnerboard" | "lostpaws" | "intranet" | "switch" | "honeypot" | "harbourcc";

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

// ---------- Accounts (optional Google sign-in) ----------

export interface MeResponse {
  googleEnabled: boolean; // false when the server has no OAuth credentials configured
  isAdmin: boolean; // email listed in ACCOUNT_ADMIN
  ownedGames: string[]; // game ids this user may host (all of them for admins)
  user: { name: string | null; email: string | null; image: string | null } | null;
  activeRooms: { code: string; gameId: string; status: RoomStatus; isHost: boolean; playerCount: number; createdAt: string }[];
  cases: {
    gameId: string;
    roomCode: string;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    ending: Ending | null;
    wasHost: boolean;
    playerCount: number;
  }[];
}

/** A room the signed-in host already has open; creating another requires confirming its deletion. */
export interface OpenHostedRoom {
  code: string;
  gameId: string;
  status: RoomStatus;
  playerCount: number;
  createdAt: string;
}

/** 409 from POST /api/rooms when the host already has open rooms and didn't pass `replaceExisting`. */
export interface ReplaceRoomsRequired {
  error: string;
  replaceRequired: true;
  openRooms: OpenHostedRoom[];
}

/** A purchase code as the admin page sees it. */
export interface AdminCodeDTO {
  id: string;
  code: string; // display form, KEY-XXXX-XXXX-XXXX
  gameId: string;
  note: string | null;
  maxUses: number | null; // 1 = single-use; null = unlimited group code
  useCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  status: "active" | "used" | "expired" | "revoked";
  redemptions: { email: string; at: string }[]; // newest first, up to 50
}

/** One room chat message. Delivered live over the realtime channel as the `chat.message` payload. */
export interface ChatMessageDTO {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  body: string;
  createdAt: string;
}
