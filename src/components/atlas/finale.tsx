"use client";

import Link from "next/link";
import { useState } from "react";
import type { RoomState } from "@/lib/types";
import type { AgeId, AtlasActionResponse, AtlasCloseupDTO, AtlasEnding, AtlasSceneAction, AtlasSceneDTO, GlyphId, ItemId } from "@/lib/atlas/types";
import { AGES, ATLAS_GAME_ID, GLYPHS } from "@/lib/atlas/types";
import { Leaderboard } from "@/components/site/Leaderboard";
import { useT } from "@/i18n/client";
import { AtlasItemIcon } from "./items";
import { RingPicker } from "./parts";
import { LOCK_THEMES, lockFrameClass, LockStatus, useLockFeedback, type LockPulse } from "@/components/shell/lockFeel";

type Act = (a: AtlasSceneAction) => Promise<AtlasActionResponse | null>;
const primary = "min-h-12 w-full rounded-lg bg-[#d8b56a] font-semibold text-[#14110a] active:bg-[#f4e7b5] disabled:opacity-60";

/** The Observatory plate: pick a seal you hold, then a socket. Seated seals show in their sockets. */
export function PlatePanel({
  plate,
  held,
  busy,
  pulse,
  act,
}: {
  plate: NonNullable<AtlasCloseupDTO["plate"]>;
  held: { id: ItemId; name: string }[];
  busy: boolean;
  pulse: LockPulse;
  act: Act;
}) {
  const t = useT();
  const [seal, setSeal] = useState<ItemId | null>(held[0]?.id ?? null);
  const chosen = held.some((h) => h.id === seal) ? seal : (held[0]?.id ?? null);
  const fb = useLockFeedback({ pulse, jammedUntil: plate.jammedUntil });
  return (
    <div className={`space-y-3 rounded-xl border border-[#8a7440] bg-[#1c170c] p-3 ${lockFrameClass(LOCK_THEMES.atlas, fb.phase)}`}>
      {held.length > 0 && !plate.registered && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("atlas.plate.seals")}>
          {held.map((h) => (
            <button
              key={h.id}
              type="button"
              aria-pressed={chosen === h.id}
              onClick={() => setSeal(h.id)}
              className={`min-h-11 rounded-full border px-3 text-sm ${chosen === h.id ? "border-[#f4e7b5] bg-[#3a3320] text-[#f4e7b5]" : "border-[#8a7440]/60 text-stone-300"}`}
            >
              <AtlasItemIcon id={h.id} className="mr-1.5 inline h-6 w-6 align-middle" />
              {h.name}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-7 gap-1">
        {plate.sockets.map((s) => {
          const char = GLYPHS.find((g) => g.id === s.glyph)!.char;
          return (
            <button
              key={s.glyph}
              type="button"
              disabled={busy || fb.jammed || !chosen || Boolean(s.seal) || plate.registered}
              onClick={() => chosen && void act({ type: "seat", seal: chosen, socket: s.glyph })}
              aria-label={s.seal ? t("atlas.plate.filled", { glyph: char }) : t("atlas.plate.socket", { glyph: char })}
              className={`lk-key flex h-14 flex-col items-center justify-center rounded-full border-2 text-lg ${
                s.seal ? "border-[#f4e7b5] bg-[#3a3320]" : plate.registered && s.glyph === "peak" ? "border-[#ffd75e] bg-[#5a4a1a] text-[#ffd75e]" : "border-[#8a7440] text-[#e9d9a6]"
              } disabled:opacity-90`}
            >
              {s.seal ? <AtlasItemIcon id={s.seal} className="h-9 w-9" /> : char}
            </button>
          );
        })}
      </div>
      {!plate.registered && <LockStatus jamSec={fb.jamSec} left={plate.left} theme={LOCK_THEMES.atlas} />}
    </div>
  );
}


/** The Atlas Core: reroute every Age gate to the Observatory (when all three secrets are found). */
export function CorePanel({ core, busy, pulse, act }: { core: NonNullable<AtlasCloseupDTO["core"]>; busy: boolean; pulse: LockPulse; act: Act }) {
  const t = useT();
  const [rings, setRings] = useState<Record<AgeId, { outer: GlyphId; inner: GlyphId }>>(
    () => Object.fromEntries(AGES.map((a) => [a, { outer: "sun", inner: "sun" }])) as Record<AgeId, { outer: GlyphId; inner: GlyphId }>,
  );
  const fb = useLockFeedback({ pulse, jammedUntil: core.jammedUntil });
  // Once rerouted the rings go away, after a moment's glow.
  if ((!core.canReroute || core.rerouted || core.convened) && fb.phase !== "open") return null;
  return (
    <div className={`space-y-4 rounded-xl border border-[#9fd3c7]/60 bg-[#0d2228] p-3 ${lockFrameClass(LOCK_THEMES.atlas, fb.phase)}`}>
      {core.gates.map((g) => (
        <div key={g.age} className="space-y-2">
          <p className="text-sm font-semibold text-[#f4e7b5]">{t("atlas.core.gate", { name: g.name, n: g.origin })}</p>
          <RingPicker label={t("atlas.gate.outer")} value={rings[g.age].outer} disabled={fb.jammed} onChange={(v) => setRings((r) => ({ ...r, [g.age]: { ...r[g.age], outer: v } }))} />
          <RingPicker label={t("atlas.gate.inner")} value={rings[g.age].inner} disabled={fb.jammed} onChange={(v) => setRings((r) => ({ ...r, [g.age]: { ...r[g.age], inner: v } }))} />
        </div>
      ))}
      <LockStatus jamSec={fb.jamSec} left={core.left} theme={LOCK_THEMES.atlas} />
      <button type="button" disabled={busy || fb.jammed} onClick={() => void act({ type: "reroute", rings })} className={`lk-key ${primary}`}>
        {t("atlas.core.reroute")}
      </button>
    </div>
  );
}

/** The room decides the ending: every player votes, a clear majority wins, the host breaks a tie. */
export function VotePanel({ state, scene, busy, act }: { state: RoomState; scene: AtlasSceneDTO; busy: boolean; act: Act }) {
  const t = useT();
  const vote = scene.vote!;
  const mine = vote.votes[state.me.id];
  const isHost = state.me.isHost;
  const voters = state.players.filter((p) => p.online || vote.votes[p.id]);
  const count = (c: AtlasEnding) => Object.values(vote.votes).filter((v) => v === c).length;
  const name = (c: AtlasEnding) => vote.choices.find((x) => x.id === c)?.name ?? c;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#071015] px-4 pb-8"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      role="dialog"
      aria-modal="true"
      aria-label={t("atlas.vote.title")}
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <p className="pt-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#9fd3c7]">{t("atlas.vote.eyebrow")}</p>
        <h1 className="text-center font-serif text-3xl text-[#f4e7b5]">{t("atlas.vote.title")}</h1>
        <p className="text-center text-sm text-stone-300">{t("atlas.vote.intro")}</p>
        <div className="space-y-2">
          {vote.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={busy || Boolean(vote.tie)}
              onClick={() => void act({ type: "vote", choice: c.id })}
              className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 text-left ${
                mine === c.id ? "border-[#f4e7b5] bg-[#1f3640]" : "border-[#1f3640] bg-[#0b161b] active:bg-[#0f2129]"
              } disabled:opacity-80`}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg text-stone-100">{c.name}</span>
                <span className="block text-xs text-stone-400">{c.line}</span>
              </span>
              <span className="font-mono text-xl text-[#f4e7b5]">{count(c.id) || ""}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-stone-500">
          {t(mine ? "atlas.vote.change" : "atlas.vote.count", { voted: Object.keys(vote.votes).length, total: voters.length })}
        </p>
        {vote.tie &&
          (isHost ? (
            <div className="space-y-2 rounded-xl border border-[#d8b56a]/50 p-3">
              <p className="text-center text-sm text-[#f4e7b5]">{t("atlas.vote.tieHost")}</p>
              {vote.tie.map((c) => (
                <button key={c} type="button" disabled={busy} onClick={() => void act({ type: "tiebreak", choice: c })} className={primary}>
                  {name(c)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#f4e7b5]">{t("atlas.vote.tieWait")}</p>
          ))}
        {isHost && !vote.tie && Object.keys(vote.votes).length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void act({ type: "close-vote" })}
            className="min-h-11 w-full rounded-lg border border-[#d8b56a]/50 text-sm text-[#f4e7b5] active:bg-[#1f3640] disabled:opacity-60"
          >
            {t("atlas.vote.close")}
          </button>
        )}
      </div>
    </div>
  );
}

export function EndingPanel({ scene, code }: { scene: AtlasSceneDTO; code: string }) {
  const t = useT();
  const e = scene.ending!;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#071015] px-4 pb-10"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      role="dialog"
      aria-modal="true"
      aria-label={e.title}
    >
      <article className="mx-auto max-w-md space-y-5 pt-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#9fd3c7]">{t("atlas.end.eyebrow")}</p>
        <h1 className="text-center font-serif text-4xl text-[#f4e7b5]">{e.title}</h1>
        <div className="space-y-4 font-serif text-[16px] leading-relaxed text-stone-200">
          {e.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-[#1f3640] p-2">
            <p className="text-[10px] uppercase tracking-wider text-stone-500">{t("atlas.end.time")}</p>
            <p className="font-mono text-lg text-stone-100">{t("atlas.end.minutes", { n: e.minutes })}</p>
          </div>
          <div className="rounded-lg border border-[#1f3640] p-2">
            <p className="text-[10px] uppercase tracking-wider text-stone-500">{t("atlas.end.secrets")}</p>
            <p className="font-mono text-lg text-stone-100">
              {e.secretsFound}/{e.secretsTotal}
            </p>
          </div>
          <div className="rounded-lg border border-[#1f3640] p-2">
            <p className="text-[10px] uppercase tracking-wider text-stone-500">{t("atlas.end.votes")}</p>
            <p className="font-mono text-lg text-stone-100">{e.counts[e.choice]}</p>
          </div>
        </div>
        <Leaderboard gameId={ATLAS_GAME_ID} roomCode={code} tone="room" />
        <div className="flex flex-col gap-2">
          <Link href={`/play/${ATLAS_GAME_ID}`} className="block min-h-12 rounded-lg bg-[#d8b56a] py-3 text-center font-semibold text-[#14110a]">
            {t("site.playAgain")}
          </Link>
          <Link href="/" className="block min-h-12 rounded-lg border border-[#d8b56a]/50 py-3 text-center text-[#f4e7b5]">
            {t("atlas.end.lobby")}
          </Link>
        </div>
      </article>
    </div>
  );
}
