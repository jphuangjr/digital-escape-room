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
  text: string;
}

const NIGHT_TIPS: Partial<Record<NightKind, string>> = {
  decoy:
    "You have no secret power, but answer the poll anyway. Everyone taps something after hours, so nobody can tell who has a power by who's tapping.",
  mole: "Pick who gets laid off. Agree with the other Moles without talking: your picks show on each other's phones. If you split, the most-picked name goes.",
  it: "Pick someone to check. Only you see the answer. Choose when to share it at all-hands: the Moles will go after a loud IT Guy.",
  intern: "Pick your mentor. You'll never learn their role, but you win if their side wins, so pick someone you trust.",
  hr: "Pick someone to protect, yourself included. If the Moles go after them tonight, nobody gets laid off. You can't cover the same person two nights running.",
};

/** The one tip a first-time player sees right now, or null. */
export function tipFor(party: Pick<AllHandsView, "phase" | "round" | "me" | "night">): Tip | null {
  const { phase, round, me } = party;
  if (!me.seated) return null;
  if (!me.alive && phase !== "over") {
    return { id: "out", text: "You're out. You can see every role now. Keep a straight face, and don't help either side at the table." };
  }
  const tips: Partial<Record<Phase, string>> = {
    reveal:
      "Press and hold your badge to read it, and tilt your screen away from your neighbours. When you've read it, tap the button. The game starts once everyone's ready.",
    dawn: "The bot announces who got laid off overnight. Whoever it names is out: they can watch but not talk.",
    day:
      me.role && ROLE_INFO[me.role].team === "moles"
        ? "Put your phone down and blend in. Accuse someone, defend yourself, agree with the room. Just don't be the one everyone suspects."
        : "Put your phone down and talk. Who's being quiet? Who's too helpful? Who pushed for that last firing? The Moles are lying to you.",
    vote: "Votes are public. Tap a name to fire them, or Let's circle back to fire nobody. You can change your vote until time runs out. A tie fires nobody.",
    exit: "If the host turned role reveals on, you'll see what the fired player really was. Look back at who voted for them.",
    over: "That's your first game. Scroll down to see who was who and every after-hours move.",
  };
  // Two rounds of hand-holding is enough; after that the screens explain themselves.
  if (round > 2 && phase !== "over") return null;
  if (phase === "night") {
    const kind = party.night?.kind;
    const text = (kind && NIGHT_TIPS[kind]) ?? "Heads down. Make your pick on your phone before the clock runs out, and keep your screen close.";
    return { id: `night-${kind ?? "none"}`, text };
  }
  const text = tips[phase];
  return text ? { id: phase, text } : null;
}
