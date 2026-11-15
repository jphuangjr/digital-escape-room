"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { QrCode } from "@/components/site/QrCode";
import { TestBar } from "@/components/allhands/TestBar";
import { useT } from "@/i18n/client";
import { useCardPack } from "./useCardPack";
import {
  EMOJI,
  EMOJI_GROUPS,
  MAX_GUESS,
  ROUND_OPTIONS,
  TEAM_ICONS,
  TURN_OPTIONS_MS,
  type GruntView,
  type TeamId,
  type TurnRecord,
} from "@/lib/grunt/types";

type Act = (body: Record<string, unknown>) => Promise<void>;
type Name = (id: string | null | undefined) => string;
type T = ReturnType<typeof useT>;

/**
 * Grunt on one phone. The clue-giver gets the card and an emoji keyboard; their team sees the clue grow and guesses
 * (out loud, or typed); the other team sees the card too and has the BONK button for anyone caught talking.
 */
export function GruntShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const t = useT();
  const people = useMemo(() => new Map(state.players.map((p) => [p.id, p])), [state.players]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const meId = state.partyTest?.viewingAs ?? state.me.id;

  // Taps show at once (patched locally), then the server's answer, then the next full state.
  const [local, setLocal] = useState<GruntView | null>(null);
  const inFlight = useRef(0);
  useEffect(() => {
    if (inFlight.current === 0) setLocal(null);
  }, [state]);
  const party = local ?? (state.party as GruntView);
  const partyRef = useRef(party);
  partyRef.current = party;

  const act: Act = useCallback(
    async (body) => {
      const tick = body.type === "tick";
      if (!tick) {
        setErr(null);
        setLocal(optimistic(partyRef.current, body));
      }
      inFlight.current++;
      setBusy(true);
      const res = await apiFetch<{ error?: string; party?: GruntView }>(code, "/party", { body });
      inFlight.current--;
      if (res.data?.party) setLocal(res.data.party);
      else if (!res.ok) setLocal(null);
      if (!res.ok && !tick) setErr(res.data?.error ?? t("party.err.generic"));
      if (inFlight.current === 0) setBusy(false);
      void refresh();
    },
    [code, refresh, t],
  );

  useEffect(() => {
    const beat = () => void apiFetch(code, "/presence", { body: { view: "party" } });
    beat();
    const id = setInterval(beat, 15_000);
    return () => clearInterval(id);
  }, [code]);

  const left = useCountdown(party.endsAt);
  const ticked = useRef<string | null>(null);
  useEffect(() => {
    if (!party.endsAt || left === null || left > 0 || ticked.current === party.endsAt) return;
    ticked.current = party.endsAt;
    void act({ type: "tick" });
  }, [left, party.endsAt, act]);

  const bonked = useBonkFlash(party);
  const isHost = state.me.id === party.hostId;
  const name: Name = (id) => (id ? (people.get(id)?.displayName ?? t("party.someone")) : t("party.nobody"));
  const inGame = party.phase !== "lobby" && party.phase !== "over";
  const seated = party.me.team !== null;

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-stone-100" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {bonked && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-orange-500/25">
          <span className="animate-bounce text-7xl font-black tracking-tight text-orange-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]">{t("grunt.bonk")}</span>
        </div>
      )}
      <header
        className="sticky top-0 z-20 border-b border-stone-800 bg-stone-950/95 px-edge backdrop-blur"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
      >
        {busy && <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-orange-300" />}
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="truncate whitespace-nowrap text-11px font-semibold uppercase tracking-[0.2em] text-orange-300">Grunt · {code}</p>
            <p className="truncate text-lg font-bold">
              {t(`grunt.phase.${party.phase}`)}
              {inGame && (
                <span className="ml-2 text-sm font-normal text-stone-400">
                  {t("grunt.turnOf", { n: party.turn, total: party.totalTurns })}
                </span>
              )}
            </p>
          </div>
          <Clock left={left} paused={party.paused} remainingMs={party.remainingMs} />
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-5 px-edge pb-24 pt-5">
        {state.partyTest && (
          <TestBar
            code={code}
            test={state.partyTest}
            party={party}
            refresh={refresh}
            meId={state.me.id}
            sizes={[4, 6, 8]}
            hint={t("grunt.testHint")}
          />
        )}
        {err && (
          <p role="alert" className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {err}
          </p>
        )}
        {inGame && !seated && (
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-400/40 bg-orange-400/10 p-4">
            <p className="text-sm text-orange-100">{t("grunt.late")}</p>
            <PrimaryButton disabled={busy} onClick={() => void act({ type: "join" })}>
              {t("grunt.joinTeam")}
            </PrimaryButton>
          </div>
        )}

        {party.phase === "lobby" && <Lobby code={code} state={state} party={party} isHost={isHost} act={act} busy={busy} name={name} />}
        {party.phase === "ready" && <Ready party={party} isHost={isHost} act={act} busy={busy} name={name} />}
        {party.phase === "clue" && <Clue party={party} act={act} busy={busy} name={name} />}
        {party.phase === "recap" && party.lastTurn && <Recap turn={party.lastTurn} name={name} />}
        {party.phase === "over" && <GameOver party={party} isHost={isHost} act={act} busy={busy} />}

        {party.phase !== "lobby" && <Teams party={party} people={people} meId={meId} />}
        {isHost && inGame && <HostBar party={party} act={act} busy={busy} />}
        {party.phase !== "lobby" && <History party={party} name={name} />}
      </main>
    </div>
  );
}

/** The clue-giver's own taps, shown before the server answers so the keyboard feels instant. */
function optimistic(p: GruntView, body: Record<string, unknown>): GruntView {
  switch (body.type) {
    case "emoji":
      return typeof body.emoji === "number" && EMOJI[body.emoji] ? { ...p, clue: [...p.clue, EMOJI[body.emoji]] } : p;
    case "undo":
      return { ...p, clue: p.clue.slice(0, -1) };
    case "clear":
      return { ...p, clue: [] };
    case "settings":
      return { ...p, settings: { ...p.settings, ...(body.settings as object) } };
    default:
      return p;
  }
}

/** A BONK flash (and a buzz on the clue-giver's phone) whenever this turn's bonk count goes up. */
function useBonkFlash(party: GruntView): boolean {
  const [on, setOn] = useState(false);
  const seen = useRef({ turn: party.turn, bonks: party.turnBonks });
  useEffect(() => {
    const prev = seen.current;
    seen.current = { turn: party.turn, bonks: party.turnBonks };
    if (party.phase !== "clue" || party.turn !== prev.turn || party.turnBonks <= prev.bonks) return;
    setOn(true);
    if (party.me.isGiver) navigator.vibrate?.([80, 40, 80]);
    thunk();
    const id = setTimeout(() => setOn(false), 900);
    return () => clearTimeout(id);
  }, [party.turn, party.turnBonks, party.phase, party.me.isGiver]);
  return on;
}

/** A short low "bonk" from the Web Audio API (no sound file to load). */
function thunk() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
    osc.onended = () => void ctx.close();
  } catch {}
}

// ---------- clock ----------

function useCountdown(endsAt: string | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);
  if (!endsAt) return null;
  return Math.max(0, Date.parse(endsAt) - now);
}

function fmt(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Clock({ left, paused, remainingMs }: { left: number | null; paused: boolean; remainingMs: number | null }) {
  const t = useT();
  if (paused)
    return (
      <span className="rounded-full border border-amber-300/50 px-3 py-1 font-mono text-sm text-amber-300">
        {t("party.clock.paused")} {remainingMs !== null && fmt(remainingMs)}
      </span>
    );
  if (left === null) return null;
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-lg tabular-nums ${left < 10_000 ? "border-rose-400/60 text-rose-300" : "border-stone-700 text-stone-200"}`}
      aria-label={t("party.clock.left", { n: Math.ceil(left / 1000) })}
    >
      {fmt(left)}
    </span>
  );
}

// ---------- shared bits ----------

function Banner({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-300">{children}</p>;
}

function Dot({ p, size = "h-3 w-3" }: { p: PlayerPublic | undefined; size?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${size}`} style={{ backgroundColor: p?.color ?? "#78716c" }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">{title}</h2>
      {children}
    </section>
  );
}

function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`min-h-12 w-full rounded-xl bg-orange-400 px-4 font-bold text-stone-950 transition-transform duration-75 enabled:active:scale-[0.98] active:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50 ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

const teamLabel = (t: T, team: TeamId) => t("grunt.team", { icon: TEAM_ICONS[team], team: String(team) });

/** The emoji clue so far, big. */
function ClueStrip({ clue, big }: { clue: string[]; big?: boolean }) {
  const t = useT();
  return (
    <div
      aria-label={clue.length ? t("grunt.clue.label", { clue: clue.join(" ") }) : t("grunt.clue.empty")}
      className={`flex min-h-20 flex-wrap items-center gap-1 rounded-2xl border border-stone-700 bg-stone-900 p-3 ${big ? "text-5xl" : "text-3xl"}`}
    >
      {clue.length ? clue.map((e, i) => <span key={i}>{e}</span>) : <span className="text-base text-stone-500">{t("grunt.clue.none")}</span>}
    </div>
  );
}

/** The card: the 1-point word and the 3-point phrase. */
function Card({ card }: { card: NonNullable<GruntView["card"]> }) {
  const t = useT();
  const local = useCardPack()?.[card.id];
  const word = local?.word ?? card.word;
  const phrase = local?.phrase ?? card.phrase;
  return (
    <article className="grid grid-cols-2 overflow-hidden rounded-3xl border-2 border-orange-300/70 bg-orange-50 text-stone-900 shadow-lg">
      <div className={`p-4 ${card.word1 ? "bg-emerald-200" : ""}`}>
        <p className="text-11px font-bold uppercase tracking-[0.2em] text-stone-500">
          {t("grunt.card.word")}
          {card.word1 && " ✓"}
        </p>
        <p className="mt-1 text-2xl font-black leading-tight">{word}</p>
      </div>
      <div className="border-l-2 border-orange-300/70 p-4">
        <p className="text-11px font-bold uppercase tracking-[0.2em] text-stone-500">{t("grunt.card.phrase")}</p>
        <p className="mt-1 text-2xl font-black leading-tight">{phrase}</p>
      </div>
    </article>
  );
}

// ---------- lobby ----------

function Lobby({ code, state, party, isHost, act, busy, name }: { code: string; state: RoomState; party: GruntView; isHost: boolean; act: Act; busy: boolean; name: Name }) {
  const t = useT();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}/r/${code}`;
  const count = state.players.length;
  const need = Math.max(0, party.minPlayers - count);
  const tooMany = count > party.maxPlayers;
  return (
    <>
      <Link href="/party" className="-my-2 inline-flex min-h-11 items-center self-start text-sm text-stone-400 active:text-stone-200">
        {t("party.back")}
      </Link>
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-stone-800 bg-stone-900 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">{t("party.roomCode")}</p>
        <p className="font-mono text-5xl font-black tracking-widest text-orange-300">{code}</p>
        {origin && <QrCode url={url} size={168} label={t("party.qrLabel", { code })} />}
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(url).then(() => setCopied(true))}
          className="min-h-11 rounded-xl border border-stone-700 px-4 text-sm font-semibold active:bg-stone-800"
        >
          {copied ? t("party.linkCopied") : t("party.copyLink")}
        </button>
      </section>

      <Section title={t("grunt.lobby.players", { n: count })}>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 px-3">
              <Dot p={p} size="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {p.displayName}
                {p.id === state.me.id && <span className="ml-1 font-normal text-stone-400">{t("party.you")}</span>}
              </span>
              {p.id === party.hostId && <span className="text-xs text-orange-300">{t("party.hostTag")}</span>}
              {isHost && p.id !== state.me.id && (
                <button
                  type="button"
                  onClick={() => window.confirm(t("party.removeConfirm", { name: p.displayName })) && void act({ type: "kick", playerId: p.id })}
                  className="min-h-11 px-2 text-xs text-stone-400 underline"
                >
                  {t("party.remove")}
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-stone-500">{t("grunt.lobby.randomTeams")}</p>
      </Section>

      {isHost ? (
        <>
          <Section title={t("party.houseRules")}>
            <Choice
              label={t("grunt.lobby.turnTime")}
              options={TURN_OPTIONS_MS.map((ms) => ({ value: ms, label: t("party.seconds", { n: ms / 1000 }) }))}
              value={party.settings.turnMs}
              onPick={(v) => void act({ type: "settings", settings: { turnMs: v } })}
            />
            <Choice
              label={t("grunt.lobby.rounds")}
              options={ROUND_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
              value={party.settings.rounds}
              onPick={(v) => void act({ type: "settings", settings: { rounds: v } })}
              note={t("grunt.lobby.roundsNote")}
            />
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-900 p-3">
              <span>
                <span className="block font-semibold">{t("grunt.lobby.bonks")}</span>
                <span className="block text-xs text-stone-400">{t("grunt.lobby.bonksNote")}</span>
              </span>
              <input
                type="checkbox"
                checked={party.settings.bonk}
                onChange={(e) => void act({ type: "settings", settings: { bonk: e.target.checked } })}
                className="h-6 w-6 shrink-0 accent-orange-400"
              />
            </label>
          </Section>
          <PrimaryButton disabled={busy || need > 0 || tooMany} onClick={() => void act({ type: "start" })}>
            {need > 0 ? t("party.waitingForPlayers", { n: need }) : tooMany ? t("party.atMost", { max: party.maxPlayers }) : t("grunt.lobby.start")}
          </PrimaryButton>
        </>
      ) : (
        <Banner>
          {t("grunt.lobby.waiting", {
            name: name(party.hostId),
            secs: party.settings.turnMs / 1000,
            rounds: party.settings.rounds,
            bonk: String(party.settings.bonk),
          })}
        </Banner>
      )}
      <HowToPlay />
    </>
  );
}

function Choice<T extends string | number>({ label, options, value, onPick, note }: { label: string; options: { value: T; label: string }[]; value: T; onPick: (v: T) => void; note?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stone-800 bg-stone-900 p-3">
      <span className="font-semibold">{label}</span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
            className={`min-h-11 flex-1 rounded-lg border px-2 text-sm font-semibold ${value === o.value ? "border-orange-300 bg-orange-300/10 text-orange-300" : "border-stone-700"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {note && <span className="text-xs text-stone-400">{note}</span>}
    </div>
  );
}

function HowToPlay() {
  const t = useT();
  return (
    <Section title={t("party.howToPlay")}>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-stone-300">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <li key={n}>{t(`grunt.how.${n}`)}</li>
        ))}
      </ol>
    </Section>
  );
}

// ---------- a turn ----------

function Ready({ party, isHost, act, busy, name }: { party: GruntView; isHost: boolean; act: Act; busy: boolean; name: Name }) {
  const t = useT();
  const team = party.clueTeam!;
  const mine = party.me.team === team;
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-orange-400/40 bg-orange-400/10 p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">{t("grunt.ready.up", { team: teamLabel(t, team) })}</p>
      <p className="text-3xl font-black">{party.me.isGiver ? t("grunt.ready.you") : t("grunt.ready.other", { name: name(party.giverId) })}</p>
      <p className="text-sm text-orange-100/80">
        {party.me.isGiver
          ? t("grunt.ready.youNote", { secs: party.settings.turnMs / 1000 })
          : mine
            ? t("grunt.ready.mateNote")
            : party.me.team !== null
              ? t(party.settings.bonk ? "grunt.ready.otherNote" : "grunt.ready.otherNoBonk")
              : t("grunt.ready.watch")}
      </p>
      {(party.me.isGiver || isHost) && (
        <PrimaryButton disabled={busy} onClick={() => void act({ type: "begin" })}>
          {party.me.isGiver ? t("grunt.ready.start") : t("grunt.ready.startFor", { name: name(party.giverId) })}
        </PrimaryButton>
      )}
    </section>
  );
}

function Clue({ party, act, busy, name }: { party: GruntView; act: Act; busy: boolean; name: Name }) {
  const t = useT();
  if (party.me.isGiver) return <GiverView party={party} act={act} busy={busy} />;
  const guessing = party.me.team === party.clueTeam;
  return (
    <>
      <p className="text-center text-sm text-stone-400">
        {t("grunt.clue.status", { team: teamLabel(t, party.clueTeam!), name: name(party.giverId), points: t("grunt.points", { n: party.turnPoints }) })}
      </p>
      {party.card && <Card card={party.card} />}
      <ClueStrip clue={party.clue} big />
      {guessing ? <GuessBox party={party} act={act} name={name} /> : <BonkBox party={party} act={act} busy={busy} />}
    </>
  );
}

function GiverView({ party, act, busy }: { party: GruntView; act: Act; busy: boolean }) {
  const t = useT();
  const [group, setGroup] = useState(0);
  const offsets = EMOJI_GROUPS.map((_, i) => EMOJI_GROUPS.slice(0, i).reduce((n, g) => n + g.emoji.length, 0));
  const btn = "min-h-12 rounded-xl border px-3 font-bold transition-transform duration-75 enabled:active:scale-[0.97] disabled:opacity-50";
  return (
    <>
      {party.card && <Card card={party.card} />}
      <ClueStrip clue={party.clue} />
      <div className="flex gap-2">
        <button type="button" onClick={() => void act({ type: "undo" })} disabled={!party.clue.length} className={`${btn} flex-1 border-stone-700`}>
          {t("grunt.giver.undo")}
        </button>
        <button type="button" onClick={() => void act({ type: "clear" })} disabled={!party.clue.length} className={`${btn} flex-1 border-stone-700`}>
          {t("grunt.giver.clear")}
        </button>
      </div>

      <div className="rounded-2xl border border-stone-800 bg-stone-900 p-2">
        <div role="tablist" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {EMOJI_GROUPS.map((g, i) => (
            <button
              key={g.label}
              role="tab"
              aria-selected={group === i}
              onClick={() => setGroup(i)}
              className={`min-h-10 shrink-0 rounded-lg px-3 text-sm font-semibold ${group === i ? "bg-orange-400 text-stone-950" : "text-stone-300"}`}
            >
              {t(`grunt.giver.group.${g.label}`)}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-8 gap-0.5">
          {EMOJI_GROUPS[group].emoji.map((e, i) => (
            <button
              key={e}
              type="button"
              aria-label={e}
              onClick={() => void act({ type: "emoji", emoji: offsets[group] + i })}
              className="flex aspect-square items-center justify-center rounded-lg text-2xl active:bg-stone-700"
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy || Boolean(party.card?.word1)}
          onClick={() => void act({ type: "got", points: 1 })}
          className={`${btn} border-emerald-400/60 bg-emerald-400/15 text-emerald-200`}
        >
          {t("grunt.giver.gotWord")}
        </button>
        <button type="button" disabled={busy} onClick={() => void act({ type: "got", points: 3 })} className={`${btn} border-emerald-400/60 bg-emerald-400/25 text-emerald-100`}>
          {t("grunt.giver.gotPhrase")}
        </button>
        <button type="button" disabled={busy || !party.card?.word1} onClick={() => void act({ type: "next" })} className={`${btn} border-stone-700`}>
          {t("grunt.giver.next")}
        </button>
        <button type="button" disabled={busy} onClick={() => void act({ type: "pass" })} className={`${btn} border-stone-700 text-stone-300`}>
          {t("grunt.giver.pass")}
        </button>
      </div>
      <p className="text-center text-xs text-stone-500">
        {t("grunt.giver.status", { points: t("grunt.points", { n: party.turnPoints }), bonks: party.turnBonks })}
      </p>
    </>
  );
}

function GuessBox({ party, act, name }: { party: GruntView; act: Act; name: Name }) {
  const t = useT();
  const [text, setText] = useState("");
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [party.guesses.length]);
  return (
    <section className="flex flex-col gap-2">
      <p className="text-center text-sm font-semibold text-orange-200">{t("grunt.guess.prompt")}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const g = text.trim();
          if (!g) return;
          setText("");
          void act({ type: "guess", text: g });
        }}
        className="flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_GUESS))}
          placeholder={t("grunt.guess.placeholder")}
          aria-label={t("grunt.guess.placeholder")}
          autoComplete="off"
          enterKeyHint="send"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-stone-700 bg-black px-3 text-base text-stone-100 outline-none focus:border-orange-400"
        />
        <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-orange-400 px-4 font-bold text-stone-950 active:bg-orange-300">
          {t("grunt.guess.button")}
        </button>
      </form>
      {party.guesses.length > 0 && (
        <ul ref={list} className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {party.guesses.map((g, i) => (
            <li key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${g.hit ? "bg-emerald-400/20 text-emerald-100" : "bg-stone-900 text-stone-300"}`}>
              <span className="min-w-0 flex-1 truncate">
                <span className="text-stone-400">{name(g.by)}:</span> {g.text}
              </span>
              {g.hit && <span className="shrink-0 font-bold">{g.hit === "phrase" ? "+3" : "+1"}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BonkBox({ party, act, busy }: { party: GruntView; act: Act; busy: boolean }) {
  const t = useT();
  if (party.me.team === null) return null;
  if (!party.settings.bonk) return <Banner>{t("grunt.bonk.off")}</Banner>;
  return (
    <section className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={busy || !party.me.canBonk}
        onClick={() => void act({ type: "bonk" })}
        className="flex aspect-square w-48 items-center justify-center rounded-full border-4 border-orange-200 bg-orange-500 text-4xl font-black text-stone-950 shadow-[0_8px_0_#9a3412] transition-transform duration-75 enabled:active:translate-y-2 enabled:active:shadow-none disabled:opacity-40"
      >
        {t("grunt.bonk.button")}
      </button>
      <p className="text-center text-xs text-stone-400">{t("grunt.bonk.note")}</p>
    </section>
  );
}

// ---------- after a turn, and the end ----------

function Recap({ turn, name }: { turn: TurnRecord; name: Name }) {
  const t = useT();
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-orange-400/40 bg-orange-400/10 p-5">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
        {teamLabel(t, turn.team)} · {name(turn.giver)}
      </p>
      <p className="text-center text-4xl font-black">{t("grunt.pointsSigned", { sign: turn.points > 0 ? "+" : "", n: turn.points })}</p>
      {turn.bonks > 0 && <p className="text-center text-sm text-orange-200">{t("grunt.recap.bonked", { n: turn.bonks })}</p>}
      <TurnCards turn={turn} />
    </section>
  );
}

function TurnCards({ turn }: { turn: TurnRecord }) {
  const t = useT();
  const pack = useCardPack();
  if (!turn.cards.length) return <p className="text-center text-sm text-stone-400">{t("grunt.recap.noCards")}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {turn.cards.map((c, i) => {
        const local = c.card !== undefined ? pack?.[c.card] : undefined;
        return (
        <li key={i} className="rounded-xl border border-stone-800 bg-stone-900 p-3 text-sm">
          <p className="font-semibold">
            <span className={c.word1 ? "text-emerald-300" : "text-stone-400 line-through"}>{local?.word ?? c.word}</span>
            <span className="text-stone-500"> · </span>
            <span className={c.phrase3 ? "text-emerald-300" : "text-stone-400 line-through"}>{local?.phrase ?? c.phrase}</span>
          </p>
          {c.clue && <p className="mt-1 text-2xl leading-snug">{c.clue}</p>}
        </li>
        );
      })}
    </ul>
  );
}

function GameOver({ party, isHost, act, busy }: { party: GruntView; isHost: boolean; act: Act; busy: boolean }) {
  const t = useT();
  const [a, b] = party.teams;
  return (
    <>
      <div className="rounded-3xl border border-orange-400/40 bg-orange-400/10 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">{t("grunt.phase.over")}</p>
        <p className="mt-2 text-3xl font-black">{party.winner === null ? t("grunt.over.tie") : t("grunt.over.wins", { team: teamLabel(t, party.winner) })}</p>
        <p className="mt-1 text-orange-100/80">
          {t("grunt.over.score", { a: a.score, b: b.score })} {t(party.winner === null ? "grunt.over.tieLine" : "grunt.over.winLine")}
        </p>
      </div>
      {isHost ? (
        <div className="flex flex-col gap-2">
          <PrimaryButton disabled={busy} onClick={() => void act({ type: "start" })}>
            {t("grunt.over.again")}
          </PrimaryButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => void act({ type: "end" })}
            className="min-h-12 rounded-xl border border-stone-700 font-semibold active:bg-stone-800 disabled:opacity-50"
          >
            {t("party.backToLobby")}
          </button>
        </div>
      ) : (
        <Banner>{t("party.waitingHostAnother")}</Banner>
      )}
    </>
  );
}

// ---------- always there ----------

function Teams({ party, people, meId }: { party: GruntView; people: Map<string, PlayerPublic>; meId: string }) {
  const t = useT();
  return (
    <Section title={t("grunt.teams")}>
      <div className="grid grid-cols-2 gap-2">
        {party.teams.map((team) => (
          <div
            key={team.id}
            className={`flex flex-col gap-2 rounded-2xl border p-3 ${party.clueTeam === team.id ? "border-orange-400/70 bg-orange-400/10" : "border-stone-800 bg-stone-900"}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-bold">{teamLabel(t, team.id)}</span>
              <span className="font-mono text-2xl font-black">{team.score}</span>
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {team.players.map((id) => (
                <li key={id} className="flex items-center gap-2">
                  <Dot p={people.get(id)} />
                  <span className="min-w-0 flex-1 truncate">
                    {people.get(id)?.displayName ?? t("party.someone")}
                    {id === meId && <span className="text-stone-400"> {t("party.you")}</span>}
                  </span>
                  {id === party.giverId && <span aria-label={t("grunt.giverTag")}>🗿</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function History({ party, name }: { party: GruntView; name: Name }) {
  const t = useT();
  // In the recap the turn that just ended is already shown above, and it's always the last one in history.
  const past = (party.phase === "recap" ? party.history.slice(0, -1) : party.history.slice()).reverse();
  if (!past.length) return null;
  return (
    <Section title={t("grunt.history")}>
      <ul className="flex flex-col gap-2">
        {past.map((h, i) => (
          <li key={i} className="rounded-xl border border-stone-800 bg-stone-900 p-3 text-sm">
            <p className="flex justify-between gap-2">
              <span className="truncate">
                {TEAM_ICONS[h.team]} {name(h.giver)}
              </span>
              <span className="font-mono font-bold">
                {h.points > 0 ? "+" : ""}
                {h.points}
              </span>
            </p>
            {h.cards.some((c) => c.clue) && <p className="mt-1 truncate text-xl">{h.cards.find((c) => c.word1 || c.phrase3)?.clue ?? h.cards[0].clue}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function HostBar({ party, act, busy }: { party: GruntView; act: Act; busy: boolean }) {
  const t = useT();
  const skipLabel: Partial<Record<GruntView["phase"], string>> = { ready: t("grunt.skip.ready"), clue: t("grunt.skip.clue"), recap: t("grunt.skip.recap") };
  const btn =
    "min-h-11 rounded-lg border border-stone-700 px-3 text-sm font-semibold transition-transform duration-75 enabled:active:scale-[0.97] enabled:active:bg-stone-800 disabled:opacity-50";
  return (
    <section aria-label={t("party.hostBar.title")} className="flex flex-col gap-2 rounded-2xl border border-dashed border-stone-700 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">{t("party.hostBar.title")}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void act({ type: "skip" })} className={`${btn} flex-1`}>
          {skipLabel[party.phase] ?? t("party.hostBar.skip")}
        </button>
        <button type="button" disabled={busy} onClick={() => void act({ type: party.paused ? "resume" : "pause" })} className={btn}>
          {party.paused ? t("party.hostBar.resume") : t("party.hostBar.pause")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => window.confirm(t("party.hostBar.endConfirm")) && void act({ type: "end" })}
          className="min-h-11 rounded-lg border border-rose-400/50 px-3 text-sm font-semibold text-rose-300 transition-transform duration-75 enabled:active:scale-[0.97] disabled:opacity-50"
        >
          {t("party.hostBar.end")}
        </button>
      </div>
    </section>
  );
}
