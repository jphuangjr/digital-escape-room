/** Display names for each escape room, keyed by Room.gameId. */
export const GAME_TITLES: Record<string, string> = {
  "ada-voss": "The Vanishing of Dr. Ada Voss",
};

export function gameTitle(gameId: string): string {
  return GAME_TITLES[gameId] ?? gameId;
}

/** 1:04:09 or 47:12 */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
