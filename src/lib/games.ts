/** Site name shown on the directory and in browser tabs. */
export const SITE_NAME = "Escape Escape";

export interface GameInfo {
  /** Stored on Room.gameId and CaseRecord.gameId. Never change once rooms exist. */
  id: string;
  title: string;
  /** One line under the title on the directory card. */
  tagline: string;
  /** Two or three sentences of setup, no spoilers. */
  blurb: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tone: string;
  /** "live" games link to their page; "soon" games show as teasers. */
  status: "live" | "soon";
  /** The game's own landing page (create/join a room). */
  href: string;
}

/**
 * Every escape room on the site, in directory order. To add a game: add an entry here, give it a
 * page at `href`, and create rooms with its `id` as Room.gameId.
 */
export const GAMES: GameInfo[] = [
  {
    id: "ada-voss",
    title: "The Vanishing of Dr. Ada Voss",
    tagline: "An archivist is missing. Her laptop is still warm.",
    blurb:
      "Dr. Ada Voss vanished forty-eight hours ago, after getting too close to something at the Meridian Institute. Dig through her email, files and six corners of a fake internet to find out what she found, and what happened to her.",
    players: "Solo or up to 16",
    duration: "60–90 min",
    difficulty: "Medium",
    tone: "Noir mystery",
    status: "live",
    href: "/play/ada-voss",
  },
];

export function getGame(gameId: string): GameInfo | undefined {
  return GAMES.find((g) => g.id === gameId);
}

export function gameTitle(gameId: string): string {
  return getGame(gameId)?.title ?? gameId;
}

/** 1:04:09 or 47:12 */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
