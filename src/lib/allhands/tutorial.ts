// All Hands' first-time help: the how-to-play tour, and one tip per phase during a player's first game.
// Everything here is per device (localStorage), so a new player on a new phone gets the tour, and nobody needs an account.

import { ROLE_INFO, type AllHandsView, type NightKind, type Phase } from "./types";

const TOUR_SEEN_KEY = "allhands_tour_seen";
const FIRST_GAME_DONE_KEY = "allhands_first_game_done";
const TIPS_OFF_KEY = "allhands_tips_off";

/** Any page can ask the open game screen to show the tour (the Rules sheet does). */
export const OPEN_TOUR_EVENT = "allhands:open-tour";

export function openTour(): void {
  window.dispatchEvent(new Event(OPEN_TOUR_EVENT));
}

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    // Private mode or blocked storage: act as if they've seen it, so the tour doesn't pop up every visit.
    return true;
  }
}

function write(key: string): void {
  try {
    localStorage.setItem(key, "1");
  } catch {}
}

export const tourSeen = () => read(TOUR_SEEN_KEY);
export const markTourSeen = () => write(TOUR_SEEN_KEY);
/** First-game tips show until this phone has seen a game to the end, or the player turns them off. */
export const tipsWanted = () => !read(FIRST_GAME_DONE_KEY) && !read(TIPS_OFF_KEY);
export const markFirstGameDone = () => write(FIRST_GAME_DONE_KEY);
export const turnTipsOff = () => write(TIPS_OFF_KEY);

export interface Tip {
  /** Which advice this is. A tip the player closes stays closed for the rest of the game. */
  id: string;
  /** The advice, as a message id (src/i18n/messages/<locale>/allhands.ts). */
  text: string;
}

const NIGHT_TIPS: Partial<Record<NightKind, string>> = {
  decoy: "allhands.tip.night.decoy",
  mole: "allhands.tip.night.mole",
  it: "allhands.tip.night.it",
  intern: "allhands.tip.night.intern",
  hr: "allhands.tip.night.hr",
};

/** The one tip a first-time player sees right now, or null. */
export function tipFor(party: Pick<AllHandsView, "phase" | "round" | "me" | "night">): Tip | null {
  const { phase, round, me } = party;
  if (!me.seated) return null;
  if (!me.alive && phase !== "over") return { id: "out", text: "allhands.tip.out" };
  const tips: Partial<Record<Phase, string>> = {
    reveal: "allhands.tip.reveal",
    dawn: "allhands.tip.dawn",
    day: me.role && ROLE_INFO[me.role].team === "moles" ? "allhands.tip.dayMole" : "allhands.tip.day",
    vote: "allhands.tip.vote",
    exit: "allhands.tip.exit",
    over: "allhands.tip.over",
  };
  // Two rounds of hand-holding is enough; after that the screens explain themselves.
  if (round > 2 && phase !== "over") return null;
  if (phase === "night") {
    const kind = party.night?.kind;
    const text = (kind && NIGHT_TIPS[kind]) ?? "allhands.tip.night";
    return { id: `night-${kind ?? "none"}`, text };
  }
  const text = tips[phase];
  return text ? { id: phase, text } : null;
}
