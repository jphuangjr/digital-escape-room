// All Hands: the first party game. A startup satire on classic Mafia rules.
// Client-safe shapes only. The game state with every role lives in src/server/allhands and never reaches a
// client whole: each player gets an AllHandsView built for them alone.

import type { Chatter } from "./chatter";

export const ALL_HANDS_GAME_ID = "all-hands";

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 16;

export type Role = "employee" | "mole" | "it" | "hr" | "burnout" | "intern" | "nephew" | "recruiter";
/** "burnout": the Burnt-out Employee plays for themselves. */
export type Team = "company" | "moles" | "burnout";

/** The smallest table each special role is dealt at (if the host leaves it on). Each takes an Employee's seat. */
export const INTERN_MIN_PLAYERS = 6;
export const BURNOUT_MIN_PLAYERS = 7;
export const NEPHEW_MIN_PLAYERS = 8;
/** The Recruiter is one of the Moles, not an extra one. */
export const RECRUITER_MIN_PLAYERS = 9;

/** Moles and the Recruiter: the Moles' side, who see each other and share the back channel. */
export function isMoleRole(role: Role | null | undefined): boolean {
  return role === "mole" || role === "recruiter";
}

export type Phase =
  | "lobby" // waiting for the host to start
  | "reveal" // onboarding: everyone looks at their badge
  | "night" // after hours: secret actions
  | "dawn" // morning Slack: who got laid off
  | "day" // all-hands: talk it out
  | "vote" // performance review
  | "exit" // exit interview: who got fired
  | "over";

export interface Settings {
  /** Show a fired player's role at the exit interview. */
  revealOnFire: boolean;
  /** Deal a Burnt-out Employee at tables of BURNOUT_MIN_PLAYERS or more. */
  burnout: boolean;
  /** Deal an Intern at tables of INTERN_MIN_PLAYERS or more. */
  intern: boolean;
  /** Deal the Founder's Nephew at tables of NEPHEW_MIN_PLAYERS or more. */
  nephew: boolean;
  /** Make one Mole the Recruiter at tables of RECRUITER_MIN_PLAYERS or more. */
  recruiter: boolean;
  dayMs: number;
  nightMs: number;
  voteMs: number;
}

export const DEFAULT_SETTINGS: Settings = { revealOnFire: true, burnout: true, intern: true, nephew: true, recruiter: true, dayMs: 180_000, nightMs: 45_000, voteMs: 60_000 };
export const DAY_OPTIONS_MS = [120_000, 180_000, 300_000];

/** A seat as everyone may see it. `role` is filled in only where this viewer is allowed to know it. */
export interface SeatView {
  id: string;
  title: string;
  alive: boolean;
  /** Onboarding only: whether they've tapped Ready. */
  ready: boolean;
  role: Role | null;
}

export type NightKind = "mole" | "it" | "hr" | "intern" | "decoy";

export interface NightView {
  kind: NightKind;
  /** The decoy question townsfolk answer so nobody can tell who has a power by who is tapping. */
  prompt: string;
  /** Who this player may pick. */
  targets: string[];
  /** This player's current pick. */
  myPick: string | null;
  /** Moles only: each mole's current pick, so they can agree in silence. */
  team: { id: string; pick: string | null }[] | null;
  /** HR only: who they protected last night (can't be picked twice running). */
  lastProtected: string | null;
  /** Moles' side: who the Recruiter is making an offer to tonight (instead of a layoff), if anyone. */
  offer: string | null;
  /** The Recruiter only: whether they can still make their one offer, and who they can make it to. */
  canOffer: boolean;
  offerTargets: string[];
  acted: number;
  total: number;
}

export interface DawnView {
  round: number;
  /** Who was laid off overnight, if anyone. */
  laidOff: string | null;
  /** HR blocked the layoff (nobody is named). */
  saved: boolean;
  /** Only on the phone of the player the Recruiter hired last night: you're a Mole now. */
  recruited: boolean;
  /** Anonymous coworkers gossiping about the layoff. */
  chatter?: Chatter;
}

export interface VoteView {
  /** target id (or "skip") → voters. Votes are public, as at a real performance review. */
  tally: Record<string, string[]>;
  myVote: string | null;
  canVote: boolean;
  voted: number;
  total: number;
}

export interface ExitView {
  fired: string | null;
  /** The Founder's Nephew was voted out and survived it (once per game); their role is now public. */
  survived: boolean;
  /** Null when the host turned role reveals off and the game isn't over. */
  role: Role | null;
  votes: number;
  /** Anonymous coworkers gossiping about the firing. */
  chatter?: Chatter;
}

export interface HistoryEntry {
  round: number;
  kind: "laidoff" | "saved" | "quiet" | "fired" | "kept" | "spared";
  playerId: string | null;
  /** Shown for fired players when reveals are on, and for everyone once the game is over. */
  role: Role | null;
}

export interface NightRecord {
  round: number;
  moleTarget: string | null;
  itTarget: string | null;
  itResult: boolean | null;
  hrTarget: string | null;
  /** The Recruiter's offer that night, and how it went. */
  offerTarget: string | null;
  offerResult: "hired" | "refused" | "blocked" | null;
  outcome: "laidoff" | "saved" | "quiet";
}

export interface AllHandsView {
  phase: Phase;
  round: number;
  /** ISO time the current phase ends; null in the lobby, at game over, or while paused. */
  endsAt: string | null;
  paused: boolean;
  /** While paused: how long the phase had left. */
  remainingMs: number | null;
  settings: Settings;
  /** Who may use the host controls right now (the host, or a stand-in while the host is away). */
  hostId: string | null;
  seats: SeatView[];
  me: {
    seated: boolean;
    alive: boolean;
    role: Role | null;
    title: string | null;
    ready: boolean;
    /** The Intern only: the mentor they picked (they never learn the mentor's role). */
    mentor: string | null;
    /** Was turned into a Mole by the Recruiter. */
    recruited: boolean;
  };
  night: NightView | null;
  /** IT Guy only: everything they've learned. */
  checks: { round: number; target: string; isMole: boolean }[];
  dawn: DawnView | null;
  vote: VoteView | null;
  exit: ExitView | null;
  history: HistoryEntry[];
  winner: Team | null;
  /** At game over: every player who won (the Intern goes with their mentor's side). */
  winners: string[];
  /** Every night's secret actions: for the laid-off and fired (on "LinkedIn") and for everyone at game over. */
  nights: NightRecord[] | null;
  /** The Moles' private back channel: for Moles, the laid-off and fired, and everyone at game over. Null otherwise. */
  moleChat: MoleChatMessage[] | null;
  /** Whether this player may post in the Mole channel right now. */
  canMoleChat: boolean;
  /** Whether this player may post in the team chat (the laid-off and fired can only read during a game). */
  canTeamChat: boolean;
  minPlayers: number;
  /** The table's custom role lineup (public), or null when it plays the recommended one. See lineup.ts. */
  lineup: Partial<Record<Role, number>> | null;
}

/** One message on the Moles' back channel. Never broadcast: it travels only in the HTTP responses of those allowed to read it. */
export interface MoleChatMessage {
  id: string;
  from: string;
  body: string;
  /** ISO time. */
  at: string;
}

/** How many Mole messages a game keeps. */
export const MOLE_CHAT_MAX = 100;

export type AllHandsAction =
  | { type: "start" }
  | { type: "settings"; settings: Partial<Settings> }
  | { type: "ready" }
  | { type: "pick"; target: string; offer?: boolean } // offer: the Recruiter makes their one offer instead of a layoff
  | { type: "vote"; target: string } // a player id or "skip"
  | { type: "tick" }
  | { type: "skip"; from?: Phase } // host: end the current phase now (`from`: the phase the host saw, so a stale tap can't skip two)
  | { type: "pause" }
  | { type: "resume" }
  | { type: "end" } // host: back to the lobby
  | { type: "kick"; playerId: string }
  | { type: "lineup"; from?: Role; to?: Role; reset?: boolean } // anyone, between games: swap one seat's role, or reset to recommended
  | { type: "moleChat"; body: string }; // a living Mole: post on the back channel

export const SKIP = "skip";

export const ROLE_INFO: Record<Role, { name: string; classic: string; team: Team; blurb: string; power: string }> = {
  employee: {
    name: "Employee",
    classic: "Townsfolk",
    team: "company",
    blurb: "You're just trying to ship. Somebody on this team is a Mole, and they're getting people laid off.",
    power: "No after-hours powers. Find the Moles at the all-hands and fire them at performance review.",
  },
  mole: {
    name: "Mole",
    classic: "Mafia",
    team: "moles",
    blurb: "A rival planted you here. Blend in, nod along at all-hands, and quietly get people laid off.",
    power: "After hours, agree with the other Moles on one coworker to lay off.",
  },
  it: {
    name: "IT Guy",
    classic: "Detective",
    team: "company",
    blurb: "You have admin on everything. Everyone forgets that.",
    power: "After hours, read one person's DMs and learn whether they're a Mole.",
  },
  burnout: {
    name: "Burnt-out Employee",
    classic: "Jester",
    team: "burnout",
    blurb: "You haven't closed a Jira ticket since March. Severance is the dream.",
    power: "Get yourself fired at performance review and you win alone. Getting laid off at night doesn't count. Act suspicious, but not too suspicious.",
  },
  intern: {
    name: "Intern",
    classic: "Apprentice",
    team: "company",
    blurb: "Unpaid, eager, and very easily influenced.",
    power: "On your first night, pick a mentor. You never learn their role, but you win if their side wins. Work out which side that is.",
  },
  nephew: {
    name: "Founder's Nephew",
    classic: "Tough Guy",
    team: "company",
    blurb: "You've never shipped anything. You also can't be fired. Probably.",
    power: "The first time the team votes you out, you survive and your role is revealed. A layoff at night still gets you.",
  },
  recruiter: {
    name: "Recruiter",
    classic: "Godfather",
    team: "moles",
    blurb: "A Mole with a LinkedIn Premium account.",
    power: "You're a Mole. Once per game, after hours, make an offer instead of a layoff: your target secretly becomes a Mole. It fails on the IT Guy and HR Rep, and HR can block it.",
  },
  hr: {
    name: "HR Rep",
    classic: "Doctor",
    team: "company",
    blurb: "You've seen things. You have forms for all of them.",
    power: "After hours, file paperwork that protects one person from a layoff. Not the same person two nights running.",
  },
};

/** Cosmetic job titles, dealt at random onto every badge. */
export const JOB_TITLES = [
  "Tech Bro",
  "Crypto Guy",
  "Growth Hacker",
  "10x Engineer",
  "LinkedIn Influencer",
  "Scrum Master",
  "Prompt Engineer",
  "Unpaid Intern",
  "Chief Vibes Officer",
  "Product Manager",
  "Designer (Dark Mode Only)",
  "Blockchain Evangelist",
  "Head of Synergy",
  "Thought Leader",
  "DevOps Wizard",
  "Founder's Nephew",
  "Agile Coach",
  "Full-Stack Ninja",
];

/** The decoy question for employees, one per round so it stays fresh. */
export const DECOY_PROMPTS = [
  "Who is using AI to write their Slack messages?",
  "Who has the most browser tabs open right now?",
  "Who would pivot the company to crypto?",
  "Who replies-all to everything?",
  "Who books meetings that could have been an email?",
  "Who says \"let's take this offline\" the most?",
  "Who has a podcast nobody asked for?",
  "Who is secretly on their phone during standup?",
];

/** The special roles a table of this size gets with these house rules, in the order they're added. */
export function specialsFor(players: number, s: Pick<Settings, "burnout" | "intern" | "nephew" | "recruiter">): Role[] {
  const out: Role[] = [];
  if (s.recruiter && players >= RECRUITER_MIN_PLAYERS) out.push("recruiter");
  if (s.intern && players >= INTERN_MIN_PLAYERS) out.push("intern");
  if (s.burnout && players >= BURNOUT_MIN_PLAYERS) out.push("burnout");
  if (s.nephew && players >= NEPHEW_MIN_PLAYERS) out.push("nephew");
  return out;
}

/** How many Moles a table gets. */
export function molesFor(players: number): number {
  if (players <= 6) return 1;
  if (players <= 9) return 2;
  if (players <= 12) return 3;
  return 4;
}
