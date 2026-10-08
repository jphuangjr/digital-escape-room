"use client";

import { useEffect, useState } from "react";
import type { GameCtx } from "@/lib/client/game";
import type { Ending } from "@/lib/types";
import { ColorDot, CompassBadge, btnGhost, formatCountdown, useNow } from "./shared";

const CHOICES: { id: Ending; label: string; blurb: string; tone: string }[] = [
  {
    id: "EXPOSE",
    label: "EXPOSE",
    blurb: "Leak the evidence. The Institute falls. Ada stays hidden a little longer, but the truth is out.",
    tone: "border-red-500/60 bg-red-950/40 text-red-100",
  },
  {
    id: "PROTECT",
    label: "PROTECT",
    blurb: "Keep the records sealed. Ada stays safe and disappears for good. Her sister gets one last message.",
    tone: "border-sky-500/60 bg-sky-950/40 text-sky-100",
  },
];

const shell =
  "fixed inset-0 z-50 flex flex-col bg-zinc-950/95 text-zinc-100 backdrop-blur-sm pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]";

function MinimizedPill({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="fixed left-1/2 z-50 min-h-11 -translate-x-1/2 rounded-full border border-amber-500/60 bg-zinc-950/95 px-5 text-sm font-semibold text-amber-300 shadow-lg shadow-black/50 active:bg-zinc-900"
      style={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      {label}
    </button>
  );
}

function VotingScreen({ ctx, onMinimize }: { ctx: GameCtx; onMinimize: () => void }) {
  const { state } = ctx;
  const vote = state.vote;
  const now = useNow(500);
  const [busy, setBusy] = useState<string | null>(null);
  const votes = vote?.votes ?? [];
  const myVote = votes.find((v) => v.playerId === state.me.id)?.choice ?? null;
  const deadline = vote?.deadline ? new Date(vote.deadline).getTime() : null;
  const remaining = deadline !== null ? deadline - now : null;
  const tie = vote?.tieBreakNeeded ?? false;

  const counts = { EXPOSE: 0, PROTECT: 0 } as Record<Ending, number>;
  for (const v of votes) counts[v.choice]++;

  async function cast(choice: Ending) {
    setBusy(choice);
    const res = await ctx.api("/vote", { method: "POST", body: { choice } });
    setBusy(null);
    if (!res.ok) ctx.toast((res.data as { error?: string } | null)?.error ?? "Vote failed", "error");
    await ctx.refresh();
  }

  async function tiebreak(choice: Ending) {
    if (!window.confirm(`Break the tie for ${choice}? This decides the ending for everyone.`)) return;
    setBusy(`tb-${choice}`);
    const res = await ctx.api("/tiebreak", { method: "POST", body: { choice } });
    setBusy(null);
    if (!res.ok) ctx.toast((res.data as { error?: string } | null)?.error ?? "Tiebreak failed", "error");
    await ctx.refresh();
  }

  const players = [...state.players].sort((a, b) => Number(b.online) - Number(a.online));

  return (
    <div className={shell} role="dialog" aria-modal="true" aria-labelledby="vote-title">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Room vote</span>
        <button onClick={onMinimize} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-zinc-400 active:bg-zinc-900">
          Minimize
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        <div className="mx-auto max-w-lg space-y-6">
          <header className="pt-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80">Signal confirmed</p>
            <h1 id="vote-title" className="mt-2 text-4xl font-black tracking-tight text-amber-300 drop-shadow sm:text-5xl">
              ADA IS ALIVE
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
              The switch didn&apos;t fire. Ada hid inside the Institute&apos;s own network after she caught them rewriting
              history. Now she&apos;s asking you what happens next. The room decides together. Majority wins; a tie goes to
              the host.
            </p>
          </header>

          <div className="flex items-center justify-center gap-3 text-sm">
            {remaining !== null && !tie && (
              <span className="rounded-full border border-zinc-700 px-3 py-1 font-mono text-zinc-200">
                ⏱ {formatCountdown(remaining)}
              </span>
            )}
            <span className="text-zinc-400">
              {votes.length}/{state.players.filter((p) => p.online).length || state.players.length} voted
            </span>
          </div>

          {!tie && (
            <div className="grid gap-3 sm:grid-cols-2">
              {CHOICES.map((c) => {
                const selected = myVote === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => cast(c.id)}
                    disabled={busy !== null}
                    aria-pressed={selected}
                    className={`min-h-28 rounded-2xl border-2 p-4 text-left transition ${c.tone} ${
                      selected ? "ring-4 ring-amber-400/70" : "opacity-90"
                    } disabled:opacity-60`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black tracking-wider">{c.label}</span>
                      <span className="font-mono text-lg">{counts[c.id]}</span>
                    </div>
                    <p className="mt-2 text-sm leading-snug opacity-90">{c.blurb}</p>
                    {selected && <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-300">Your vote · tap the other to change</p>}
                  </button>
                );
              })}
            </div>
          )}

          {tie && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 text-center">
              <p className="text-lg font-bold text-amber-300">
                It&apos;s a tie: {counts.EXPOSE} – {counts.PROTECT}
              </p>
              {state.me.isHost ? (
                <>
                  <p className="mt-1 text-sm text-zinc-300">You&apos;re the host. Your call breaks the tie.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {CHOICES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => tiebreak(c.id)}
                        disabled={busy !== null}
                        className={`min-h-16 rounded-xl border-2 text-lg font-black tracking-wider ${c.tone}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-2 animate-pulse text-sm text-zinc-300">Waiting for host to break the tie…</p>
              )}
            </div>
          )}

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Votes</h2>
            <ul className="divide-y divide-zinc-900 rounded-xl border border-zinc-800 bg-zinc-900/50">
              {players.map((p) => {
                const v = votes.find((x) => x.playerId === p.id)?.choice;
                return (
                  <li key={p.id} className="flex min-h-11 items-center gap-3 px-3 py-2 text-sm">
                    <ColorDot color={p.color} />
                    <span className={`min-w-0 flex-1 truncate ${p.online ? "text-zinc-100" : "text-zinc-500"}`}>
                      {p.displayName}
                      {p.id === state.me.id && " (you)"}
                      {p.isHost && <span className="ml-1 text-xs text-amber-500">host</span>}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        v === "EXPOSE" ? "text-red-300" : v === "PROTECT" ? "text-sky-300" : "text-zinc-600"
                      }`}
                    >
                      {v ?? (p.online ? "deciding…" : "offline")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function EndingScreen({ ctx, onMinimize }: { ctx: GameCtx; onMinimize: () => void }) {
  const ending = ctx.state.ending!;
  const hasCompass = ctx.state.progress.badges.includes("compass");
  const { summary } = ending;
  return (
    <div className={shell} role="dialog" aria-modal="true" aria-labelledby="ending-title">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Case closed · {ending.ending}</span>
        <button onClick={onMinimize} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-zinc-400 active:bg-zinc-900">
          Keep browsing
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
        <article className="mx-auto max-w-lg space-y-6">
          <header className="pt-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500/80">
              {ending.ending === "EXPOSE" ? "The truth is out" : "The records stay sealed"}
            </p>
            <h1 id="ending-title" className="mt-2 text-3xl font-black tracking-tight text-amber-300 sm:text-4xl">
              {ending.title}
            </h1>
          </header>

          <div className="space-y-4 text-[15px] leading-relaxed text-zinc-200">
            {ending.body.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {p}
              </p>
            ))}
          </div>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">The vote</h2>
            <div className="flex gap-3">
              {(["EXPOSE", "PROTECT"] as const).map((c) => (
                <div
                  key={c}
                  className={`flex-1 rounded-lg border p-3 text-center ${
                    ending.ending === c ? "border-amber-500/60 bg-amber-500/10" : "border-zinc-800"
                  }`}
                >
                  <div className="text-xs font-bold tracking-wider text-zinc-400">{c}</div>
                  <div className="font-mono text-2xl font-bold text-zinc-100">{summary[c]}</div>
                </div>
              ))}
            </div>
            {summary.tieBrokenByHost && (
              <p className="mt-3 text-center text-sm text-amber-300">Tie broken by the host.</p>
            )}
          </section>

          {ending.bonusEpilogue && (
            <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">Epilogue</h2>
              <div className="space-y-3 text-[15px] italic leading-relaxed text-zinc-200">
                {ending.bonusEpilogue.split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {hasCompass && (
            <div className="flex flex-col items-center gap-2 text-center">
              <CompassBadge label="Compass badge earned" />
              <p className="text-xs text-zinc-500">You opened Ada&apos;s Personal folder.</p>
            </div>
          )}

          <div className="flex justify-center">
            <button className={btnGhost} onClick={onMinimize}>
              Keep browsing Ada&apos;s laptop
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

export function VoteOverlay({ ctx }: { ctx: GameCtx }) {
  const { state } = ctx;
  const [minimized, setMinimized] = useState(false);
  const phase = state.status === "finished" && state.ending ? "ending" : state.status === "voting" ? "voting" : null;

  // Re-open automatically when the phase changes (e.g. voting -> ending).
  useEffect(() => {
    setMinimized(false);
  }, [phase]);

  if (!phase) return null;
  if (minimized) {
    return (
      <MinimizedPill
        label={phase === "voting" ? "● Vote in progress · open" : "Case closed · view ending"}
        onOpen={() => setMinimized(false)}
      />
    );
  }
  return phase === "voting" ? (
    <VotingScreen ctx={ctx} onMinimize={() => setMinimized(true)} />
  ) : (
    <EndingScreen ctx={ctx} onMinimize={() => setMinimized(true)} />
  );
}
