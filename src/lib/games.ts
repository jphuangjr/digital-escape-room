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
  /**
   * "live" games link to their page; "soon" games show as teasers; "staging" games are in development:
   * only admins (ACCOUNT_ADMIN) see them, open their page or host them.
   */
  status: "live" | "soon" | "staging";
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
  {
    id: "nightingale-express",
    title: "The Nightingale Express",
    tagline: "A sapphire is missing. They locked you in with the evidence.",
    blurb:
      "1934, the overnight sleeper to the border. You wake in Compartment 12B with the door locked from outside and an empty jewel pouch under your berth. Search the compartment, then the dining car, and name the thief before the police board at dawn.",
    players: "Solo or up to 8",
    duration: "45–60 min",
    difficulty: "Easy",
    tone: "Art Deco mystery",
    status: "live",
    href: "/play/nightingale-express",
  },
  {
    id: "atlas-silent-worlds",
    title: "The Atlas of Silent Worlds",
    tagline: "The doors beneath the Observatory lead somewhere else.",
    blurb:
      "You wake in a deserted observatory on an unmapped island. Beneath it, ancient doorways called Thresholds open onto other worlds, and someone fragmented the network on purpose. Learn the rule that governs the gates, and decide what to do with what you find.",
    players: "Solo or up to 8",
    duration: "90–120 min",
    difficulty: "Hard",
    tone: "Atmospheric mystery",
    status: "live",
    href: "/play/atlas-silent-worlds",
  },
];

/** Games a viewer may see and host: everything that isn't in staging, plus staging for admins. */
export function visibleGames(isAdmin: boolean): GameInfo[] {
  return GAMES.filter((g) => g.status !== "staging" || isAdmin);
}

export function getGame(gameId: string): GameInfo | undefined {
  return GAMES.find((g) => g.id === gameId);
}

/** English title; for server-only code (OG images, case records). UI should use `localGameTitle`. */
export function gameTitle(gameId: string): string {
  return getGame(gameId)?.title ?? gameId;
}

/** A message formatter: `useT()` on the client, `await getT()` on the server. */
export type Translate = (id: string, values?: Record<string, string | number>) => string;

/** The directory-card strings a viewer sees, translated via message ids `site.game.<id>.<field>`. */
export type GameTextField = "title" | "tagline" | "blurb" | "players" | "duration" | "difficulty" | "tone";

/** `game[field]` in the viewer's language, falling back to the English value above if no message exists. */
export function gameText(t: Translate, game: GameInfo, field: GameTextField): string {
  const id = `site.game.${game.id}.${field}`;
  const s = t(id);
  return s && s !== id ? s : game[field];
}

/** Translated title for a game id (the id itself if the game is unknown). */
export function localGameTitle(t: Translate, gameId: string): string {
  const game = getGame(gameId);
  return game ? gameText(t, game, "title") : gameId;
}

/** How a finished case ended, in the viewer's language: the train's accused, the Atlas's choice, Ada's vote. */
export function endingLabel(t: Translate, gameId: string, ending: string | null): string {
  if (!ending) return t("site.cases.ending", { ending: "none" });
  if (gameId === "nightingale-express") return t(`train.suspect.${ending}`);
  if (gameId === "atlas-silent-worlds") return t(`atlas.ending.${ending}`);
  return t("site.cases.ending", { ending });
}

/** 1:04:09 or 47:12 */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
