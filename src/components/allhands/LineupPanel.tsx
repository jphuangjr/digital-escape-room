"use client";

import { useState } from "react";
import { MIN_PLAYERS, type AllHandsView, type Role } from "@/lib/allhands/types";
import { useT } from "@/i18n/client";
import { formatMsg } from "@/i18n/msg";
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
  const t = useT();
  const role = (r: Role) => t(`allhands.role.${r}.name`);
  const short = (r: Role) => t(`allhands.role.${r}.short`);
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
          {t("allhands.lineup.title", { n: lineup.players })}
        </h2>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
            lineup.custom ? "border-amber-300/50 text-amber-300" : "border-lime-300/50 text-lime-300"
          }`}
        >
          {lineup.custom ? t("allhands.lineup.custom") : t("allhands.lineup.recommended")}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs text-slate-400">
          {players < MIN_PLAYERS ? `${t("allhands.lineup.shownFor", { min: MIN_PLAYERS })} ` : ""}
          {t("allhands.lineup.explain")}
        </p>

        <ul className="grid grid-cols-2 gap-2" aria-label={t("allhands.lineup.roles")}>
          {seats.map((r, i) => (
            <li key={`${r}-${i}`}>
              <button
                type="button"
                aria-pressed={picked === i}
                aria-label={t("allhands.lineup.seatLabel", { role: role(r), short: short(r) })}
                onClick={() => setPicked(picked === i ? null : i)}
                className={`flex h-full min-h-11 w-full flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition-transform duration-75 active:scale-[0.97] ${
                  ROLE_TONE[r]
                } ${picked === i ? "ring-2 ring-slate-100" : ""}`}
              >
                <span className="flex w-full items-center justify-between gap-1 text-sm font-semibold">
                  <span className="truncate">{role(r)}</span>
                  <span aria-hidden className="text-xs opacity-60">
                    ⇄
                  </span>
                </span>
                <span className="text-xs leading-snug text-slate-300">{short(r)}</span>
              </button>
            </li>
          ))}
        </ul>

        {pickedRole && (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-950 p-3" role="group" aria-label={t("allhands.lineup.swapGroup", { role: role(pickedRole) })}>
            <p className="text-sm font-semibold">{t("allhands.lineup.swapFor", { role: role(pickedRole) })}</p>
            <div className="flex flex-col gap-2">
              {LINEUP_ROLES.filter((r) => r !== pickedRole).map((r) => {
                const why = cantAdd(lineup, r);
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={Boolean(why)}
                    title={t(`allhands.role.${r}.power`)}
                    onClick={() => swap(r)}
                    className={`flex min-h-11 flex-col rounded-xl border px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-40 ${ROLE_TONE[r]}`}
                  >
                    <span className="text-sm font-semibold">{role(r)}</span>
                    <span className="text-xs leading-snug text-slate-300">{why ? formatMsg(t, why.id, why.values) : short(r)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setPicked(null)} className="min-h-11 self-start text-sm text-slate-400 underline">
              {t("allhands.lineup.cancel")}
            </button>
          </div>
        )}

        {issues.length === 0 ? (
          <p className="rounded-xl border border-lime-300/40 bg-lime-300/10 px-3 py-2 text-sm text-lime-200">
            {t("allhands.lineup.balanced", { n: lineup.players })}
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label={t("allhands.lineup.warnings")}>
            {issues.map((x) => (
              <li
                key={x.msg.id}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  x.level === "block" ? "border-rose-400/50 bg-rose-400/10 text-rose-200" : "border-amber-300/50 bg-amber-300/10 text-amber-100"
                }`}
              >
                <span aria-hidden>{x.level === "block" ? "⛔ " : "⚠️ "}</span>
                {x.level === "block" && <span className="font-semibold">{t("allhands.lineup.cantStart")} </span>}
                {formatMsg(t, x.msg.id, x.msg.values)}
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
          {t("allhands.lineup.reset")}
        </button>
      </div>
    </section>
  );
}
