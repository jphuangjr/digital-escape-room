"use client";

import { useState } from "react";
import { MIN_PLAYERS, ROLE_INFO, type AllHandsView, type Role } from "@/lib/allhands/types";
import { LINEUP_ROLES, cantAdd, lineupFor, lineupIssues, type Lineup } from "@/lib/allhands/lineup";

type Act = (body: Record<string, unknown>) => Promise<void>;

const ROLE_TONE: Record<Role, string> = {
  employee: "text-lime-300 border-lime-300/50 bg-lime-300/10",
  mole: "text-rose-300 border-rose-400/60 bg-rose-400/10",
  it: "text-sky-300 border-sky-300/50 bg-sky-300/10",
  hr: "text-amber-300 border-amber-300/50 bg-amber-300/10",
  burnout: "text-violet-300 border-violet-300/50 bg-violet-300/10",
  intern: "text-teal-300 border-teal-300/50 bg-teal-300/10",
  nephew: "text-orange-300 border-orange-300/50 bg-orange-300/10",
  recruiter: "text-fuchsia-300 border-fuchsia-400/60 bg-fuchsia-400/10",
};

/** The lineup this table is dealt from, for the room's headcount. */
export function tableLineup(party: AllHandsView, players: number): Lineup {
  return lineupFor(players, party.settings, party.lineup);
}

/**
 * The lobby's role lineup: one chip per seat, the recommended mix to start with. Anyone at the table can tap a seat
 * and swap its role, see what the change does to the balance, and reset to the recommendation.
 */
export function LineupPanel({ party, players, act }: { party: AllHandsView; players: number; act: Act }) {
  const lineup = tableLineup(party, players);
  const issues = lineupIssues(lineup);
  // The seat being swapped, by its place in the list (seats of one role are interchangeable).
  const [picked, setPicked] = useState<number | null>(null);
  const seats: Role[] = LINEUP_ROLES.flatMap((r) => Array<Role>(lineup.counts[r]).fill(r));
  const pickedRole = picked !== null ? (seats[picked] ?? null) : null;

  const swap = (to: Role) => {
    if (!pickedRole) return;
    setPicked(null);
    void act({ type: "lineup", from: pickedRole, to });
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="lineup-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="lineup-title" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Lineup · {lineup.players} players
        </h2>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
            lineup.custom ? "border-amber-300/50 text-amber-300" : "border-lime-300/50 text-lime-300"
          }`}
        >
          {lineup.custom ? "Custom" : "Recommended"}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs text-slate-400">
          {players < MIN_PLAYERS ? `Shown for ${MIN_PLAYERS} players until more people join. ` : ""}
          Roles are dealt at random when the game starts. Anyone here can tap a seat to swap its role.
        </p>

        <ul className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3" aria-label="Roles in this game">
          {seats.map((r, i) => (
            <li key={`${r}-${i}`}>
              <button
                type="button"
                aria-pressed={picked === i}
                aria-label={`${ROLE_INFO[r].name}. Tap to swap`}
                onClick={() => setPicked(picked === i ? null : i)}
                className={`flex min-h-11 w-full items-center justify-between gap-1 rounded-xl border px-3 text-left text-sm font-semibold transition-transform duration-75 active:scale-[0.97] ${
                  ROLE_TONE[r]
                } ${picked === i ? "ring-2 ring-slate-100" : ""}`}
              >
                <span className="truncate">{ROLE_INFO[r].name}</span>
                <span aria-hidden className="text-xs opacity-60">
                  ⇄
                </span>
              </button>
            </li>
          ))}
        </ul>

        {pickedRole && (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-950 p-3" role="group" aria-label={`Swap the ${ROLE_INFO[pickedRole].name} for`}>
            <p className="text-sm font-semibold">Swap this {ROLE_INFO[pickedRole].name} for:</p>
            <div className="flex flex-wrap gap-2">
              {LINEUP_ROLES.filter((r) => r !== pickedRole).map((r) => {
                const why = cantAdd(lineup, r);
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={Boolean(why)}
                    title={why ?? ROLE_INFO[r].power}
                    onClick={() => swap(r)}
                    className={`min-h-11 rounded-full border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35 ${ROLE_TONE[r]}`}
                  >
                    {ROLE_INFO[r].name}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setPicked(null)} className="min-h-11 self-start text-sm text-slate-400 underline">
              Cancel
            </button>
          </div>
        )}

        {issues.length === 0 ? (
          <p className="rounded-xl border border-lime-300/40 bg-lime-300/10 px-3 py-2 text-sm text-lime-200">
            ✓ Balanced for {lineup.players} players.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Balance warnings">
            {issues.map((x) => (
              <li
                key={x.text}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  x.level === "block" ? "border-rose-400/50 bg-rose-400/10 text-rose-200" : "border-amber-300/50 bg-amber-300/10 text-amber-100"
                }`}
              >
                <span aria-hidden>{x.level === "block" ? "⛔ " : "⚠️ "}</span>
                {x.level === "block" && <span className="font-semibold">Can&apos;t start: </span>}
                {x.text}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={!lineup.custom}
          onClick={() => {
            setPicked(null);
            void act({ type: "lineup", reset: true });
          }}
          className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold active:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset to recommended
        </button>
      </div>
    </section>
  );
}
