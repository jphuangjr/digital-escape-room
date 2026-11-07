"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MAX_PLAYERS, MIN_PLAYERS, ROLE_INFO, molesFor, type Role } from "@/lib/allhands/types";

const ROLES: Role[] = ["employee", "mole", "it", "hr"];

const ROLE_TONE: Record<Role, string> = {
  employee: "border-lime-300/40 text-lime-300",
  mole: "border-rose-400/50 text-rose-300",
  it: "border-sky-300/40 text-sky-300",
  hr: "border-amber-300/40 text-amber-300",
};

const PHASES: { name: string; what: string }[] = [
  { name: "Onboarding", what: "Press and hold your badge to see your role. Moles also see who the other Moles are. Tap Ready." },
  { name: "After hours", what: "Heads down. Everyone taps a name, so nobody can tell who has a power. Moles pick a layoff, IT checks someone, HR protects someone." },
  { name: "Morning Slack", what: "Find out who got laid off overnight, or whether HR saved them. Laid-off players are out." },
  { name: "All-hands", what: "Talk it out, out loud. Accuse, defend, bluff." },
  { name: "Performance review", what: "Vote to fire someone, or circle back (skip). The most votes gets fired, unless it's a tie or circling back wins." },
  { name: "Exit interview", what: "The fired player leaves. If the host turned it on, their role is revealed." },
];

/** A quick reference anyone can open mid-game: who's who, what happens when, and how each side wins. */
export function RulesButton({ players }: { players: number }) {
  const [open, setOpen] = useState(false);
  const n = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, players));
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Roles and rules"
        className="flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-slate-700 px-3 text-sm font-semibold text-slate-200 transition-transform duration-75 active:scale-95 active:bg-slate-800"
      >
        <span aria-hidden>📖</span>
        <span className="hidden min-[420px]:inline">Rules</span>
      </button>
      {open &&
        // Portaled: the sticky header's backdrop blur would otherwise trap a fixed sheet inside the header.
        createPortal(
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Roles and rules"
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex max-h-[85dvh] w-full max-w-xl flex-col rounded-t-2xl border border-slate-800 bg-slate-950"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-lg font-bold">Roles and rules</p>
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 text-sm text-slate-400 active:bg-slate-800">
                Close
              </button>
            </div>
            <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-4 py-4 text-sm">
              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">How to win</h2>
                <p>
                  <span className="font-semibold text-lime-300">The company</span> wins when every Mole is fired.
                </p>
                <p>
                  <span className="font-semibold text-rose-300">The Moles</span> win when there are as many Moles as everyone else still employed.
                </p>
                <p className="text-slate-400">
                  This table of {players} has {molesFor(n)} {molesFor(n) === 1 ? "Mole" : "Moles"}, one IT Guy and one HR Rep.
                </p>
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Who&apos;s who</h2>
                {ROLES.map((r) => (
                  <div key={r} className={`rounded-xl border bg-slate-900 p-3 ${ROLE_TONE[r]}`}>
                    <p className="font-bold">
                      {ROLE_INFO[r].name} <span className="font-normal text-slate-500">({ROLE_INFO[r].classic})</span>
                    </p>
                    <p className="mt-1 text-slate-200">{ROLE_INFO[r].power}</p>
                  </div>
                ))}
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Each round</h2>
                <ol className="flex flex-col gap-2">
                  {PHASES.map((p, i) => (
                    <li key={p.name} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">{i + 1}</span>
                      <span>
                        <span className="font-semibold">{p.name}.</span> <span className="text-slate-300">{p.what}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="flex flex-col gap-1 text-slate-400">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">House rules</h2>
                <p>Laid-off and fired players can watch (they see every role) but can&apos;t talk, vote or post in #general.</p>
                <p>Don&apos;t show your screen. Moles can whisper in their private chat channel.</p>
              </section>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
