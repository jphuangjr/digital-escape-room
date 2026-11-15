// All Hands: the role lineup a table is dealt from. Client-safe and pure, so the lobby can show it and the server
// can deal from it with the same rules.
//
// A lineup counts the roles other than Employee; Employees fill every seat that's left. The lobby starts on the
// recommended lineup for its headcount (and follows it as people join) until someone swaps a role. From then on
// the table plays the custom lineup until someone resets it.

import type { Msg } from "@/i18n/msg";
import {
  BURNOUT_MIN_PLAYERS,
  INTERN_MIN_PLAYERS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  NEPHEW_MIN_PLAYERS,
  RECRUITER_MIN_PLAYERS,
  isMoleRole,
  molesFor,
  specialsFor,
  type Role,
  type Settings,
} from "./types";

/** How many of each role other than Employee. Missing means none. */
export type RoleCounts = Partial<Record<Role, number>>;

/** Display order: the Moles' side, then the company's powers, then the wildcards, then Employees. */
export const LINEUP_ROLES: Role[] = ["mole", "recruiter", "it", "hr", "intern", "nephew", "burnout", "employee"];

/** At most this many of a role (the rules assume one of each power). Moles and Employees are unlimited. */
export const ROLE_MAX: Partial<Record<Role, number>> = { recruiter: 1, it: 1, hr: 1, intern: 1, nephew: 1, burnout: 1 };

/** The smallest table a role is recommended at. */
export const ROLE_MIN_PLAYERS: Partial<Record<Role, number>> = {
  intern: INTERN_MIN_PLAYERS,
  burnout: BURNOUT_MIN_PLAYERS,
  nephew: NEPHEW_MIN_PLAYERS,
  recruiter: RECRUITER_MIN_PLAYERS,
};

type SpecialSettings = Pick<Settings, "burnout" | "intern" | "nephew" | "recruiter">;

/** The headcount a lineup is shown and checked for: the room's, kept within the game's limits. */
export function tableSize(players: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, players));
}

/** The recommended lineup: molesFor(n) Moles (one of them the Recruiter at 9+), IT, HR, and the specials that fit. */
export function recommendedLineup(players: number, settings: SpecialSettings): RoleCounts {
  const n = tableSize(players);
  const specials = specialsFor(n, settings);
  const moles = molesFor(n);
  const out: RoleCounts = { mole: moles, it: 1, hr: 1 };
  for (const r of specials) {
    if (r === "recruiter") {
      out.mole = moles - 1;
      out.recruiter = 1;
    } else out[r] = 1;
  }
  return tidy(out);
}

/** Drops zeros, Employees and unknown roles, so two lineups compare equal when they deal the same table. */
function tidy(c: RoleCounts): RoleCounts {
  const out: RoleCounts = {};
  for (const r of LINEUP_ROLES) {
    const v = c[r];
    if (r !== "employee" && typeof v === "number" && v > 0) out[r] = Math.floor(v);
  }
  return out;
}

export function sameLineup(a: RoleCounts, b: RoleCounts): boolean {
  const x = tidy(a);
  const y = tidy(b);
  return LINEUP_ROLES.every((r) => (x[r] ?? 0) === (y[r] ?? 0));
}

/** A stored custom lineup, tolerating junk: null when there's nothing usable. */
export function parseLineup(raw: unknown): RoleCounts | null {
  if (!raw || typeof raw !== "object") return null;
  const out: RoleCounts = {};
  for (const r of LINEUP_ROLES) {
    const v = (raw as Record<string, unknown>)[r];
    if (r === "employee" || typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    out[r] = Math.min(Math.floor(v), ROLE_MAX[r] ?? MAX_PLAYERS);
  }
  return Object.keys(out).length ? out : null;
}

export interface Lineup {
  /** Every role's count at this headcount, Employees included (never below 0). */
  counts: Record<Role, number>;
  /** The headcount this lineup is for. */
  players: number;
  /** Whether the table is on a custom lineup rather than the recommended one. */
  custom: boolean;
  recommended: RoleCounts;
}

/** The lineup a table of `players` plays: the custom one if there is one, otherwise the recommended one. */
export function lineupFor(players: number, settings: SpecialSettings, custom: RoleCounts | null): Lineup {
  const n = tableSize(players);
  const recommended = recommendedLineup(n, settings);
  const base = custom ?? recommended;
  const counts = Object.fromEntries(LINEUP_ROLES.map((r) => [r, r === "employee" ? 0 : (base[r] ?? 0)])) as Record<Role, number>;
  counts.employee = Math.max(0, n - specialsCount(counts));
  return { counts, players: n, custom: custom !== null && !sameLineup(custom, recommended), recommended };
}

function specialsCount(c: RoleCounts): number {
  return LINEUP_ROLES.reduce((sum, r) => sum + (r === "employee" ? 0 : (c[r] ?? 0)), 0);
}

/** Every seat's role at this headcount, specials first (shuffle before dealing). Null if the roles don't fit. */
export function lineupRoles(l: Lineup): Role[] | null {
  if (specialsCount(l.counts) > l.players) return null;
  const roles: Role[] = [];
  for (const r of LINEUP_ROLES) for (let i = 0; i < l.counts[r]; i++) roles.push(r);
  return roles;
}

/** A role's name inside a lineup message: translated where it's shown (see src/i18n/msg.ts). */
const roleName = (r: Role) => `@allhands.role.${r}.name`;

/** Why a role can't take one more seat, or null if it can. */
export function cantAdd(l: Lineup, role: Role): Msg | null {
  const max = ROLE_MAX[role];
  if (max !== undefined && l.counts[role] >= max) return { id: "allhands.lineup.onlyOne", values: { role: roleName(role) } };
  return null;
}

/**
 * Swap one seat from `from` to `to`, and return the new custom lineup: null when that lands back on the recommended
 * one (so the table follows the recommendation again as people come and go). An error in words if it can't be done.
 */
export function swapRole(l: Lineup, from: Role, to: Role): { ok: true; lineup: RoleCounts | null } | { ok: false; error: Msg } {
  if (!LINEUP_ROLES.includes(from) || !LINEUP_ROLES.includes(to)) return { ok: false, error: { id: "allhands.lineup.notRole" } };
  if (from === to) return { ok: false, error: { id: "allhands.lineup.sameRole" } };
  if (l.counts[from] <= 0) return { ok: false, error: { id: "allhands.lineup.noneToSwap", values: { role: roleName(from) } } };
  const blocked = cantAdd(l, to);
  if (blocked) return { ok: false, error: blocked };
  const next: RoleCounts = { ...l.counts };
  next[from] = (next[from] ?? 0) - 1;
  next[to] = (next[to] ?? 0) + 1;
  const lineup = tidy(next);
  return { ok: true, lineup: sameLineup(lineup, l.recommended) ? null : lineup };
}

export interface LineupIssue {
  /** "block": the game can't start like this. "warn": it can, but one side has the edge. */
  level: "block" | "warn";
  /** What's wrong, as a message id and values (shown in the viewer's language). */
  msg: Msg;
}

/** What's off about a lineup, worst first. Empty means it's balanced for the table. */
export function lineupIssues(l: Lineup): LineupIssue[] {
  const c = l.counts;
  const n = l.players;
  const out: LineupIssue[] = [];
  const extra = specialsCount(c) - n;
  const moleSide = LINEUP_ROLES.filter((r) => isMoleRole(r)).reduce((sum, r) => sum + c[r], 0);
  const recMoles = LINEUP_ROLES.filter((r) => isMoleRole(r)).reduce((sum, r) => sum + (l.recommended[r] ?? 0), 0);

  if (extra > 0) {
    out.push({ level: "block", msg: { id: "allhands.lineup.tooManyRoles", values: { n: extra } } });
  }
  if (moleSide === 0) out.push({ level: "block", msg: { id: "allhands.lineup.noMoles" } });
  else if (moleSide * 2 >= n) out.push({ level: "block", msg: { id: "allhands.lineup.halfMoles", values: { moles: moleSide, n } } });
  else if (moleSide > recMoles) out.push({ level: "warn", msg: { id: "allhands.lineup.manyMoles", values: { moles: moleSide, rec: recMoles, n } } });
  else if (moleSide < recMoles) out.push({ level: "warn", msg: { id: "allhands.lineup.fewMoles", values: { moles: moleSide, rec: recMoles, n } } });

  if (c.it === 0 && c.hr === 0) out.push({ level: "warn", msg: { id: "allhands.lineup.noItHr" } });
  else if (c.it === 0) out.push({ level: "warn", msg: { id: "allhands.lineup.noIt" } });
  else if (c.hr === 0) out.push({ level: "warn", msg: { id: "allhands.lineup.noHr" } });

  if (c.recruiter > 0 && c.mole === 0 && moleSide > 0) out.push({ level: "warn", msg: { id: "allhands.lineup.loneRecruiter" } });
  for (const r of LINEUP_ROLES) {
    const min = ROLE_MIN_PLAYERS[r];
    if (min !== undefined && c[r] > 0 && n < min) {
      out.push({ level: "warn", msg: { id: "allhands.lineup.smallTable", values: { role: roleName(r), min, n } } });
    }
  }
  if (c.employee === 0 && extra <= 0) out.push({ level: "warn", msg: { id: "allhands.lineup.noEmployees" } });
  return out;
}
