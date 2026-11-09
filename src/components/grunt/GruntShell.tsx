"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { QrCode } from "@/components/site/QrCode";
import { TestBar } from "@/components/allhands/TestBar";
import {
  EMOJI,
  EMOJI_GROUPS,
  MAX_GUESS,
  ROUND_OPTIONS,
  TEAM_ICONS,
  TEAM_NAMES,
  TURN_OPTIONS_MS,
  type GruntView,
  type TeamId,
  type TurnRecord,
} from "@/lib/grunt/types";

type Act = (body: Record<string, unknown>) => Promise<void>;
type Name = (id: string | null | undefined) => string;

const PHASE_LABEL: Record<GruntView["phase"], string> = {
  lobby: "Lobby",
  ready: "Next up",
  clue: "Grunting",
  recap: "Turn over",
  over: "Game over",
};

/**
 * Grunt on one phone. The clue-giver gets the card and an emoji keyboard; their team sees the clue grow and guesses
 * (out loud, or typed); the other team sees the card too and has the BONK button for anyone caught talking.
 */
export function GruntShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
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
      if (!res.ok && !tick) setErr(res.data?.error ?? "That didn't work. Try again.");
      if (inFlight.current === 0) setBusy(false);
      void refresh();
    },
    [code, refresh],
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
  const name: Name = (id) => (id ? (people.get(id)?.displayName ?? "Someone") : "Nobody");
  const inGame = party.phase !== "lobby" && party.phase !== "over";
  const seated = party.me.team !== null;

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-stone-100" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {bonked && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-orange-500/25">
          <span className="animate-bounce text-7xl font-black tracking-tight text-orange-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]">BONK!</span>
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
              {PHASE_LABEL[party.phase]}
              {inGame && (
                <span className="ml-2 text-sm font-normal text-stone-400">
                  Turn {party.turn} of {party.totalTurns}
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
            hint="Look through a bot's eyes to give its clues or bonk for its team. Bot clue-givers start, tap a few emoji and pass. The host controls stay yours."
          />
        )}
        {err && (
          <p role="alert" className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {err}
          </p>
        )}
        {inGame && !seated && (
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-400/40 bg-orange-400/10 p-4">
            <p className="text-sm text-orange-100">This game started before you got here. Join a team and you&apos;re in.</p>
            <PrimaryButton disabled={busy} onClick={() => void act({ type: "join" })}>
              Join a team
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
  if (paused) return <span className="rounded-full border border-amber-300/50 px-3 py-1 font-mono text-sm text-amber-300">Paused {remainingMs !== null && fmt(remainingMs)}</span>;
  if (left === null) return null;
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-lg tabular-nums ${left < 10_000 ? "border-rose-400/60 text-rose-300" : "border-stone-700 text-stone-200"}`}
      aria-label={`${Math.ceil(left / 1000)} seconds left`}
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

const teamLabel = (t: TeamId) => `${TEAM_ICONS[t]} Team ${TEAM_NAMES[t]}`;

/** The emoji clue so far, big. */
function ClueStrip({ clue, big }: { clue: string[]; big?: boolean }) {
  return (
    <div
      aria-label={clue.length ? `Clue: ${clue.join(" ")}` : "No clue yet"}
      className={`flex min-h-20 flex-wrap items-center gap-1 rounded-2xl border border-stone-700 bg-stone-900 p-3 ${big ? "text-5xl" : "text-3xl"}`}
    >
      {clue.length ? clue.map((e, i) => <span key={i}>{e}</span>) : <span className="text-base text-stone-500">No grunts yet…</span>}
    </div>
  );
}

/** The card: the 1-point word and the 3-point phrase. */
function Card({ card }: { card: NonNullable<GruntView["card"]> }) {
  return (
    <article className="grid grid-cols-2 overflow-hidden rounded-3xl border-2 border-orange-300/70 bg-orange-50 text-stone-900 shadow-lg">
      <div className={`p-4 ${card.word1 ? "bg-emerald-200" : ""}`}>
        <p className="text-11px font-bold uppercase tracking-[0.2em] text-stone-500">1 point{card.word1 && " ✓"}</p>
        <p className="mt-1 text-2xl font-black leading-tight">{card.word}</p>
      </div>
      <div className="border-l-2 border-orange-300/70 p-4">
        <p className="text-11px font-bold uppercase tracking-[0.2em] text-stone-500">3 points</p>
        <p className="mt-1 text-2xl font-black leading-tight">{card.phrase}</p>
      </div>
    </article>
  );
}

// ---------- lobby ----------

function Lobby({ code, state, party, isHost, act, busy, name }: { code: string; state: RoomState; party: GruntView; isHost: boolean; act: Act; busy: boolean; name: Name }) {
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
        ← Back to Party games
      </Link>
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-stone-800 bg-stone-900 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">Room code</p>
        <p className="font-mono text-5xl font-black tracking-widest text-orange-300">{code}</p>
        {origin && <QrCode url={url} size={168} label={`QR code to join room ${code}`} />}
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(url).then(() => setCopied(true))}
          className="min-h-11 rounded-xl border border-stone-700 px-4 text-sm font-semibold active:bg-stone-800"
        >
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      </section>

      <Section title={`In the cave (${count})`}>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 px-3">
              <Dot p={p} size="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {p.displayName}
                {p.id === state.me.id && <span className="ml-1 font-normal text-stone-400">(you)</span>}
              </span>
              {p.id === party.hostId && <span className="text-xs text-orange-300">Host</span>}
              {isHost && p.id !== state.me.id && (
                <button
                  type="button"
                  onClick={() => window.confirm(`Remove ${p.displayName} from the room?`) && void act({ type: "kick", playerId: p.id })}
                  className="min-h-11 px-2 text-xs text-stone-400 underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-stone-500">Teams are picked at random when the game starts.</p>
      </Section>

      {isHost ? (
        <>
          <Section title="House rules">
            <Choice
              label="Time per turn"
              options={TURN_OPTIONS_MS.map((ms) => ({ value: ms, label: `${ms / 1000}s` }))}
              value={party.settings.turnMs}
              onPick={(v) => void act({ type: "settings", settings: { turnMs: v } })}
            />
            <Choice
              label="Turns each"
              options={ROUND_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
              value={party.settings.rounds}
              onPick={(v) => void act({ type: "settings", settings: { rounds: v } })}
              note="How many times every player gives the clues."
            />
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-900 p-3">
              <span>
                <span className="block font-semibold">Bonks</span>
                <span className="block text-xs text-stone-400">
                  The other team gets a BONK button. Catch the clue-giver talking, pointing or acting it out: a point off.
                </span>
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
            {need > 0 ? `Waiting for ${need} more ${need === 1 ? "player" : "players"}` : tooMany ? `${party.maxPlayers} players at most` : "Start the game"}
          </PrimaryButton>
        </>
      ) : (
        <Banner>
          Waiting for {name(party.hostId)} to start. {party.settings.turnMs / 1000}s turns, {party.settings.rounds}{" "}
          {party.settings.rounds === 1 ? "turn" : "turns"} each{party.settings.bonk ? ", bonks on" : ""}.
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
  return (
    <Section title="How to play">
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-stone-300">
        <li>Two teams take turns. Each turn one player is the clue-giver.</li>
        <li>They get a card: a word for 1 point and a harder phrase for 3.</li>
        <li>No talking, pointing or acting. The only clues allowed are emoji, tapped on their phone. Everyone sees them appear.</li>
        <li>Their team shouts guesses (or types them). The clue-giver taps when someone gets it.</li>
        <li>The other team sees the card too. Catch the clue-giver making a sound or a gesture? BONK: a point off.</li>
        <li>Stuck? Pass for a new card. Most points after everyone&apos;s turns wins.</li>
      </ol>
    </Section>
  );
}

// ---------- a turn ----------

function Ready({ party, isHost, act, busy, name }: { party: GruntView; isHost: boolean; act: Act; busy: boolean; name: Name }) {
  const t = party.clueTeam!;
  const mine = party.me.team === t;
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-orange-400/40 bg-orange-400/10 p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">{teamLabel(t)} is up</p>
      <p className="text-3xl font-black">{party.me.isGiver ? "You're grunting." : `${name(party.giverId)} grunts.`}</p>
      <p className="text-sm text-orange-100/80">
        {party.me.isGiver
          ? `You'll get a card and ${party.settings.turnMs / 1000} seconds. Emoji only: no talking, no pointing.`
          : mine
            ? "Get ready to guess. Shout it out, or type it."
            : party.me.team !== null
              ? `You'll see their card. ${party.settings.bonk ? "Bonk them if they talk or point." : "Keep them honest."}`
              : "Watch the clues come in."}
      </p>
      {(party.me.isGiver || isHost) && (
        <PrimaryButton disabled={busy} onClick={() => void act({ type: "begin" })}>
          {party.me.isGiver ? "Start grunting" : `Start ${name(party.giverId)}'s turn`}
        </PrimaryButton>
      )}
    </section>
  );
}

function Clue({ party, act, busy, name }: { party: GruntView; act: Act; busy: boolean; name: Name }) {
  if (party.me.isGiver) return <GiverView party={party} act={act} busy={busy} />;
  const guessing = party.me.team === party.clueTeam;
  return (
    <>
      <p className="text-center text-sm text-stone-400">
        {teamLabel(party.clueTeam!)} · {name(party.giverId)} is grunting · {party.turnPoints} {Math.abs(party.turnPoints) === 1 ? "point" : "points"} this turn
      </p>
      {party.card && <Card card={party.card} />}
      <ClueStrip clue={party.clue} big />
      {guessing ? <GuessBox party={party} act={act} name={name} /> : <BonkBox party={party} act={act} busy={busy} />}
    </>
  );
}

function GiverView({ party, act, busy }: { party: GruntView; act: Act; busy: boolean }) {
  const [group, setGroup] = useState(0);
  const offsets = EMOJI_GROUPS.map((_, i) => EMOJI_GROUPS.slice(0, i).reduce((n, g) => n + g.emoji.length, 0));
  const btn = "min-h-12 rounded-xl border px-3 font-bold transition-transform duration-75 enabled:active:scale-[0.97] disabled:opacity-50";
  return (
    <>
      {party.card && <Card card={party.card} />}
      <ClueStrip clue={party.clue} />
      <div className="flex gap-2">
        <button type="button" onClick={() => void act({ type: "undo" })} disabled={!party.clue.length} className={`${btn} flex-1 border-stone-700`}>
          ⌫ Undo
        </button>
        <button type="button" onClick={() => void act({ type: "clear" })} disabled={!party.clue.length} className={`${btn} flex-1 border-stone-700`}>
          Clear
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
              {g.label}
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
          Got the word +1
        </button>
        <button type="button" disabled={busy} onClick={() => void act({ type: "got", points: 3 })} className={`${btn} border-emerald-400/60 bg-emerald-400/25 text-emerald-100`}>
          Got the phrase +3
        </button>
        <button type="button" disabled={busy || !party.card?.word1} onClick={() => void act({ type: "next" })} className={`${btn} border-stone-700`}>
          Next card
        </button>
        <button type="button" disabled={busy} onClick={() => void act({ type: "pass" })} className={`${btn} border-stone-700 text-stone-300`}>
          Pass
        </button>
      </div>
      <p className="text-center text-xs text-stone-500">
        {party.turnPoints} {Math.abs(party.turnPoints) === 1 ? "point" : "points"} this turn{party.turnBonks > 0 && ` · ${party.turnBonks} bonked`}. Typed guesses
        that are right count by themselves.
      </p>
    </>
  );
}

function GuessBox({ party, act, name }: { party: GruntView; act: Act; name: Name }) {
  const [text, setText] = useState("");
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [party.guesses.length]);
  return (
    <section className="flex flex-col gap-2">
      <p className="text-center text-sm font-semibold text-orange-200">Shout it out, or type it:</p>
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
          placeholder="Your guess"
          aria-label="Your guess"
          autoComplete="off"
          enterKeyHint="send"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-stone-700 bg-black px-3 text-base text-stone-100 outline-none focus:border-orange-400"
        />
        <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-orange-400 px-4 font-bold text-stone-950 active:bg-orange-300">
          Guess
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
  if (party.me.team === null) return null;
  if (!party.settings.bonk) return <Banner>Keep them honest: emoji only, no talking or pointing.</Banner>;
  return (
    <section className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={busy || !party.me.canBonk}
        onClick={() => void act({ type: "bonk" })}
        className="flex aspect-square w-48 items-center justify-center rounded-full border-4 border-orange-200 bg-orange-500 text-4xl font-black text-stone-950 shadow-[0_8px_0_#9a3412] transition-transform duration-75 enabled:active:translate-y-2 enabled:active:shadow-none disabled:opacity-40"
      >
        🦴 BONK
      </button>
      <p className="text-center text-xs text-stone-400">Talking, pointing or acting it out costs them a point.</p>
    </section>
  );
}

// ---------- after a turn, and the end ----------

function Recap({ turn, name }: { turn: TurnRecord; name: Name }) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-orange-400/40 bg-orange-400/10 p-5">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
        {teamLabel(turn.team)} · {name(turn.giver)}
      </p>
      <p className="text-center text-4xl font-black">
        {turn.points > 0 ? "+" : ""}
        {turn.points} {Math.abs(turn.points) === 1 ? "point" : "points"}
      </p>
      {turn.bonks > 0 && <p className="text-center text-sm text-orange-200">Bonked {turn.bonks} {turn.bonks === 1 ? "time" : "times"}.</p>}
      <TurnCards turn={turn} />
    </section>
  );
}

function TurnCards({ turn }: { turn: TurnRecord }) {
  if (!turn.cards.length) return <p className="text-center text-sm text-stone-400">No cards this turn.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {turn.cards.map((c, i) => (
        <li key={i} className="rounded-xl border border-stone-800 bg-stone-900 p-3 text-sm">
          <p className="font-semibold">
            <span className={c.word1 ? "text-emerald-300" : "text-stone-400 line-through"}>{c.word}</span>
            <span className="text-stone-500"> · </span>
            <span className={c.phrase3 ? "text-emerald-300" : "text-stone-400 line-through"}>{c.phrase}</span>
          </p>
          {c.clue && <p className="mt-1 text-2xl leading-snug">{c.clue}</p>}
        </li>
      ))}
    </ul>
  );
}

function GameOver({ party, isHost, act, busy }: { party: GruntView; isHost: boolean; act: Act; busy: boolean }) {
  const [a, b] = party.teams;
  return (
    <>
      <div className="rounded-3xl border border-orange-400/40 bg-orange-400/10 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Game over</p>
        <p className="mt-2 text-3xl font-black">{party.winner === null ? "It's a tie!" : `${teamLabel(party.winner)} wins!`}</p>
        <p className="mt-1 text-orange-100/80">
          {a.score} to {b.score}. {party.winner === null ? "Everyone shares the fire." : "Ooga booga."}
        </p>
      </div>
      {isHost ? (
        <div className="flex flex-col gap-2">
          <PrimaryButton disabled={busy} onClick={() => void act({ type: "start" })}>
            Play again (new teams)
          </PrimaryButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => void act({ type: "end" })}
            className="min-h-12 rounded-xl border border-stone-700 font-semibold active:bg-stone-800 disabled:opacity-50"
          >
            Back to the lobby (change the rules)
          </button>
        </div>
      ) : (
        <Banner>Waiting for the host to start another game.</Banner>
      )}
    </>
  );
}

// ---------- always there ----------

function Teams({ party, people, meId }: { party: GruntView; people: Map<string, PlayerPublic>; meId: string }) {
  return (
    <Section title="Teams">
      <div className="grid grid-cols-2 gap-2">
        {party.teams.map((t) => (
          <div
            key={t.id}
            className={`flex flex-col gap-2 rounded-2xl border p-3 ${party.clueTeam === t.id ? "border-orange-400/70 bg-orange-400/10" : "border-stone-800 bg-stone-900"}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-bold">{teamLabel(t.id)}</span>
              <span className="font-mono text-2xl font-black">{t.score}</span>
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {t.players.map((id) => (
                <li key={id} className="flex items-center gap-2">
                  <Dot p={people.get(id)} />
                  <span className="min-w-0 flex-1 truncate">
                    {people.get(id)?.displayName ?? "Someone"}
                    {id === meId && <span className="text-stone-400"> (you)</span>}
                  </span>
                  {id === party.giverId && <span aria-label="clue-giver">🗿</span>}
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
  // In the recap the turn that just ended is already shown above, and it's always the last one in history.
  const past = (party.phase === "recap" ? party.history.slice(0, -1) : party.history.slice()).reverse();
  if (!past.length) return null;
  return (
    <Section title="Turns so far">
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
  const skipLabel: Partial<Record<GruntView["phase"], string>> = { ready: "Start the clock", clue: "End this turn", recap: "Next turn" };
  const btn =
    "min-h-11 rounded-lg border border-stone-700 px-3 text-sm font-semibold transition-transform duration-75 enabled:active:scale-[0.97] enabled:active:bg-stone-800 disabled:opacity-50";
  return (
    <section aria-label="Host controls" className="flex flex-col gap-2 rounded-2xl border border-dashed border-stone-700 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Host controls</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void act({ type: "skip" })} className={`${btn} flex-1`}>
          {skipLabel[party.phase] ?? "Skip ahead"}
        </button>
        <button type="button" disabled={busy} onClick={() => void act({ type: party.paused ? "resume" : "pause" })} className={btn}>
          {party.paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => window.confirm("End this game for everyone and go back to the lobby?") && void act({ type: "end" })}
          className="min-h-11 rounded-lg border border-rose-400/50 px-3 text-sm font-semibold text-rose-300 transition-transform duration-75 enabled:active:scale-[0.97] disabled:opacity-50"
        >
          End game
        </button>
      </div>
    </section>
  );
}
