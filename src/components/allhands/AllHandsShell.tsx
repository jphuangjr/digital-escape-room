"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { QrCode } from "@/components/site/QrCode";
import {
  DAY_OPTIONS_MS,
  ROLE_INFO,
  SKIP,
  type AllHandsView,
  type HistoryEntry,
  type NightKind,
  type Role,
  type SeatView,
} from "@/lib/allhands/types";

type Act = (body: Record<string, unknown>) => Promise<void>;

const ROLE_TONE: Record<Role, string> = {
  employee: "text-lime-300 border-lime-300/50 bg-lime-300/10",
  mole: "text-rose-300 border-rose-400/60 bg-rose-400/10",
  it: "text-sky-300 border-sky-300/50 bg-sky-300/10",
  hr: "text-amber-300 border-amber-300/50 bg-amber-300/10",
};

const PHASE_LABEL: Record<AllHandsView["phase"], string> = {
  lobby: "Lobby",
  reveal: "Onboarding",
  night: "After hours",
  dawn: "Morning Slack",
  day: "All-hands",
  vote: "Performance review",
  exit: "Exit interview",
  over: "Game over",
};

/** All Hands: one screen per phase, each phone showing only what its player may know. */
export function AllHandsShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const party = state.party!;
  const people = useMemo(() => new Map(state.players.map((p) => [p.id, p])), [state.players]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const act: Act = useCallback(
    async (body) => {
      setBusy(true);
      setErr(null);
      const res = await apiFetch<{ error?: string }>(code, "/party", { body });
      if (!res.ok && body.type !== "tick") setErr(res.data?.error ?? "That didn't work. Try again.");
      setBusy(false);
      await refresh();
    },
    [code, refresh],
  );

  // Presence: a heartbeat keeps this player counted as here (and the host's controls with the host).
  useEffect(() => {
    const beat = () => void apiFetch(code, "/presence", { body: { view: "party" } });
    beat();
    const id = setInterval(beat, 15_000);
    return () => clearInterval(id);
  }, [code]);

  const left = useCountdown(party.endsAt);
  // When the clock runs out, nudge the server: phases have no timer there and move on when asked.
  const ticked = useRef<string | null>(null);
  useEffect(() => {
    if (!party.endsAt || left === null || left > 0 || ticked.current === party.endsAt) return;
    ticked.current = party.endsAt;
    void act({ type: "tick" });
  }, [left, party.endsAt, act]);

  const isHost = state.me.id === party.hostId;
  const name = (id: string | null | undefined) => (id ? (people.get(id)?.displayName ?? "Someone") : "Nobody");

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header
        className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-edge backdrop-blur"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-11px font-semibold uppercase tracking-[0.25em] text-lime-300">All Hands · {code}</p>
            <p className="truncate text-lg font-bold">
              {PHASE_LABEL[party.phase]}
              {party.round > 0 && party.phase !== "over" && <span className="ml-2 text-sm font-normal text-slate-400">Round {party.round}</span>}
            </p>
          </div>
          <Clock left={left} paused={party.paused} remainingMs={party.remainingMs} />
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-5 px-edge py-5">
        {party.me.seated && !party.me.alive && party.phase !== "over" && <LinkedInBanner />}
        {!party.me.seated && party.phase !== "lobby" && party.phase !== "over" && (
          <Banner>The game started before you joined. You&apos;re watching this round and get dealt in next game.</Banner>
        )}
        {err && (
          <p role="alert" className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {err}
          </p>
        )}

        {party.phase === "lobby" && <Lobby code={code} state={state} party={party} isHost={isHost} act={act} busy={busy} name={name} />}
        {party.phase === "reveal" && <Onboarding party={party} meId={state.me.id} act={act} busy={busy} name={name} />}
        {party.phase === "night" && <AfterHours party={party} act={act} busy={busy} name={name} people={people} />}
        {(party.phase === "dawn" || party.phase === "day") && <Morning party={party} name={name} people={people} />}
        {party.phase === "vote" && <Review party={party} act={act} busy={busy} name={name} people={people} me={state.me.id} />}
        {party.phase === "exit" && <ExitInterview party={party} name={name} />}
        {party.phase === "over" && <GameOver party={party} isHost={isHost} act={act} busy={busy} name={name} people={people} />}

        {party.me.seated && party.phase !== "lobby" && party.phase !== "over" && party.phase !== "reveal" && (
          <BadgeCard party={party} meId={state.me.id} name={name} compact />
        )}
        {isHost && party.phase !== "lobby" && party.phase !== "over" && <HostBar party={party} act={act} busy={busy} />}
        {party.phase !== "lobby" && <History history={party.history} name={name} />}
      </main>
    </div>
  );
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
      className={`rounded-full border px-3 py-1 font-mono text-lg tabular-nums ${left < 10_000 ? "border-rose-400/60 text-rose-300" : "border-slate-700 text-slate-200"}`}
      aria-label={`${Math.ceil(left / 1000)} seconds left`}
    >
      {fmt(left)}
    </span>
  );
}

// ---------- shared bits ----------

type Name = (id: string | null | undefined) => string;

function Banner({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">{children}</p>;
}

function Dot({ p, size = "h-3 w-3" }: { p: PlayerPublic | undefined; size?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${size}`} style={{ backgroundColor: p?.color ?? "#64748b" }} />;
}

function RoleChip({ role }: { role: Role }) {
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_TONE[role]}`}>{ROLE_INFO[role].name}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="min-h-12 w-full rounded-xl bg-lime-300 px-4 font-bold text-slate-950 active:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function LinkedInBanner() {
  return (
    <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4">
      <p className="font-bold text-sky-200">You&apos;re on LinkedIn now.</p>
      <p className="mt-1 text-sm text-sky-100/80">
        &ldquo;Excited to announce I&apos;ve been let go! #OpenToWork&rdquo; You can see every role and every after-hours move. Keep a
        straight face and stay quiet at the table.
      </p>
    </div>
  );
}

/** Your employee badge: hold to read it, so a neighbour can't glance at it. */
function BadgeCard({ party, meId, name, compact = false }: { party: AllHandsView; meId: string; name: Name; compact?: boolean }) {
  const [shown, setShown] = useState(false);
  const role = party.me.role;
  if (!role) return null;
  const info = ROLE_INFO[role];
  const fellowMoles = role === "mole" ? party.seats.filter((x) => x.role === "mole" && x.id !== meId) : [];
  const show = () => setShown(true);
  const hide = () => setShown(false);
  return (
    <button
      type="button"
      onPointerDown={show}
      onPointerUp={hide}
      onPointerLeave={hide}
      onPointerCancel={hide}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && show()}
      onKeyUp={hide}
      onBlur={hide}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Hold to see your badge"
      className={`relative w-full select-none overflow-hidden rounded-3xl border text-left transition [-webkit-touch-callout:none] ${
        shown ? ROLE_TONE[role] : "border-slate-700 bg-slate-900"
      } ${compact ? "p-4" : "p-6"}`}
    >
      {shown ? (
        <div>
          <p className="text-11px font-semibold uppercase tracking-[0.25em] opacity-80">Synergr · {party.me.title}</p>
          <p className={`${compact ? "text-2xl" : "text-4xl"} mt-1 font-black`}>{info.name}</p>
          {!compact && <p className="mt-3 text-slate-200">{info.blurb}</p>}
          <p className="mt-2 text-sm text-slate-300">{info.power}</p>
          {fellowMoles.length > 0 && (
            <p className="mt-3 text-sm text-rose-200">Your fellow Moles: {fellowMoles.map((x) => name(x.id)).join(", ")}</p>
          )}
          {role === "mole" && fellowMoles.length === 0 && <p className="mt-3 text-sm text-rose-200">You&apos;re the only Mole. Good luck.</p>}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-2xl">🪪</span>
          <div>
            <p className="font-bold">{compact ? "Your badge" : "Hold to see your badge"}</p>
            <p className="text-sm text-slate-400">Press and hold. Keep it close to your chest.</p>
          </div>
        </div>
      )}
    </button>
  );
}

// ---------- lobby ----------

function Lobby({
  code,
  state,
  party,
  isHost,
  act,
  busy,
  name,
}: {
  code: string;
  state: RoomState;
  party: AllHandsView;
  isHost: boolean;
  act: Act;
  busy: boolean;
  name: Name;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}/r/${code}`;
  const count = state.players.length;
  const need = Math.max(0, party.minPlayers - count);
  return (
    <>
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Room code</p>
        <p className="font-mono text-5xl font-black tracking-widest text-lime-300">{code}</p>
        {origin && <QrCode url={url} size={168} label={`QR code to join room ${code}`} />}
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(url).then(() => setCopied(true));
          }}
          className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold active:bg-slate-800"
        >
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      </section>

      <Section title={`The team (${count})`}>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <Dot p={p} size="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {p.displayName}
                {p.id === state.me.id && <span className="ml-1 font-normal text-slate-400">(you)</span>}
              </span>
              {p.id === party.hostId && <span className="text-xs text-lime-300">Host</span>}
              {isHost && p.id !== state.me.id && (
                <button
                  type="button"
                  onClick={() => window.confirm(`Remove ${p.displayName} from the room?`) && void act({ type: "kick", playerId: p.id })}
                  className="min-h-11 px-2 text-xs text-slate-400 underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {isHost ? (
        <>
          <Section title="House rules">
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <span>
                <span className="block font-semibold">Reveal roles when someone leaves</span>
                <span className="block text-xs text-slate-400">Show a fired or laid-off player&apos;s role to the table</span>
              </span>
              <input
                type="checkbox"
                checked={party.settings.revealOnFire}
                onChange={(e) => void act({ type: "settings", settings: { revealOnFire: e.target.checked } })}
                className="h-6 w-6 accent-lime-300"
              />
            </label>
            <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span className="font-semibold">All-hands length</span>
              <div className="flex gap-2">
                {DAY_OPTIONS_MS.map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    aria-pressed={party.settings.dayMs === ms}
                    onClick={() => void act({ type: "settings", settings: { dayMs: ms } })}
                    className={`min-h-11 flex-1 rounded-lg border text-sm font-semibold ${
                      party.settings.dayMs === ms ? "border-lime-300 bg-lime-300/10 text-lime-300" : "border-slate-700"
                    }`}
                  >
                    {ms / 60_000} min
                  </button>
                ))}
              </div>
            </div>
          </Section>
          <PrimaryButton disabled={busy || need > 0} onClick={() => void act({ type: "start" })}>
            {need > 0 ? `Waiting for ${need} more ${need === 1 ? "player" : "players"}` : "Start the game"}
          </PrimaryButton>
        </>
      ) : (
        <Banner>Waiting for {name(party.hostId)} to start the game. Grab a seat where everyone can see each other.</Banner>
      )}
      <HowToPlay />
    </>
  );
}

function HowToPlay() {
  return (
    <details className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">
      <summary className="min-h-8 cursor-pointer font-semibold text-slate-100">How to play</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Everyone gets a secret badge. A few of you are Moles.</li>
        <li>After hours, everyone taps something on their phone. The Moles pick someone to lay off; IT and HR use their powers.</li>
        <li>In the morning the app tells you who got laid off. Then talk it out at all-hands.</li>
        <li>At performance review, vote to fire a suspect, or circle back.</li>
        <li>The company wins when every Mole is gone. The Moles win when they match everyone else.</li>
      </ol>
    </details>
  );
}

// ---------- onboarding ----------

function Onboarding({ party, meId, act, busy, name }: { party: AllHandsView; meId: string; act: Act; busy: boolean; name: Name }) {
  const ready = party.seats.filter((x) => x.ready).length;
  const waiting = party.seats.filter((x) => !x.ready).map((x) => name(x.id));
  return (
    <>
      <div>
        <h1 className="text-3xl font-black">Welcome to Synergr.</h1>
        <p className="mt-1 text-slate-300">Here&apos;s your badge. Don&apos;t let anyone see it.</p>
      </div>
      {party.me.seated ? <BadgeCard party={party} meId={meId} name={name} /> : <Banner>The team is reading their badges.</Banner>}
      {party.me.seated && (
        <PrimaryButton disabled={busy || party.me.ready} onClick={() => void act({ type: "ready" })}>
          {party.me.ready ? "Ready. Waiting for the others…" : "I've read my badge"}
        </PrimaryButton>
      )}
      <p className="text-sm text-slate-400">
        {ready} of {party.seats.length} ready{waiting.length > 0 && waiting.length <= 4 ? `. Waiting on ${waiting.join(", ")}.` : "."}
      </p>
    </>
  );
}

// ---------- after hours ----------

const NIGHT_COPY: Record<NightKind, { title: string; body: string }> = {
  mole: { title: "Pick someone to lay off", body: "Agree with the other Moles. Your picks show up on each other's phones." },
  it: { title: "Whose DMs will you read?", body: "You'll find out in the morning whether they're a Mole." },
  hr: { title: "Who gets your paperwork?", body: "If the Moles go after them tonight, the layoff is blocked." },
  decoy: { title: "", body: "Everyone taps something, so nobody can tell who has a power. Your answer is just for fun." },
};

function AfterHours({
  party,
  act,
  busy,
  name,
  people,
}: {
  party: AllHandsView;
  act: Act;
  busy: boolean;
  name: Name;
  people: Map<string, PlayerPublic>;
}) {
  const n = party.night;
  if (!n) {
    return (
      <>
        <h1 className="text-3xl font-black">After hours</h1>
        <Banner>The office is dark. Everyone still employed is making their move.</Banner>
        {party.nights && <NightLog nights={party.nights} name={name} live />}
      </>
    );
  }
  const solo = n.kind === "mole" && (n.team?.length ?? 0) <= 1;
  const copy = solo ? { ...NIGHT_COPY.mole, body: "You're the only Mole. Pick who gets laid off tonight." } : NIGHT_COPY[n.kind];
  return (
    <>
      <div>
        <h1 className="text-3xl font-black">{n.kind === "decoy" ? n.prompt : copy.title}</h1>
        <p className="mt-1 text-slate-300">{copy.body}</p>
        <p className="mt-2 text-xs text-slate-500">Heads down. Keep your screen close. You can change your pick until time runs out.</p>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {party.seats
          .filter((x) => x.alive && n.targets.includes(x.id))
          .map((x) => {
            const picked = n.myPick === x.id;
            const teammates = n.team?.filter((m) => m.pick === x.id) ?? [];
            return (
              <li key={x.id}>
                <button
                  type="button"
                  disabled={busy}
                  aria-pressed={picked}
                  onClick={() => void act({ type: "pick", target: x.id })}
                  className={`flex min-h-16 w-full flex-col items-start justify-center gap-1 rounded-2xl border px-3 py-2 text-left ${
                    picked ? "border-lime-300 bg-lime-300/10" : "border-slate-800 bg-slate-900 active:bg-slate-800"
                  }`}
                >
                  <span className="flex w-full items-center gap-2 font-semibold">
                    <Dot p={people.get(x.id)} />
                    <span className="truncate">{name(x.id)}</span>
                  </span>
                  <span className="text-xs text-slate-400">{x.title}</span>
                  {teammates.length > 0 && (
                    <span className="text-xs text-rose-300">Picked by {teammates.map((m) => name(m.id)).join(", ")}</span>
                  )}
                </button>
              </li>
            );
          })}
      </ul>
      {n.kind === "hr" && n.lastProtected && <p className="text-xs text-slate-500">You covered {name(n.lastProtected)} last night, so not them again.</p>}
      {n.kind === "mole" && n.team && n.team.length > 1 && new Set(n.team.map((m) => m.pick)).size > 1 && (
        <p className="text-sm text-rose-300">The Moles don&apos;t agree yet. If time runs out, the most-picked name goes.</p>
      )}
      <p className="text-sm text-slate-400">
        {n.acted} of {n.total} have made a move.
      </p>
      {party.checks.length > 0 && <Checks party={party} name={name} />}
    </>
  );
}

function Checks({ party, name }: { party: AllHandsView; name: Name }) {
  return (
    <Section title="DMs you've read">
      <ul className="flex flex-col gap-1 text-sm">
        {party.checks.map((c) => (
          <li key={c.round} className="flex justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
            <span>
              Night {c.round}: {name(c.target)}
            </span>
            <span className={c.isMole ? "font-bold text-rose-300" : "text-lime-300"}>{c.isMole ? "Mole" : "Not a Mole"}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ---------- morning and all-hands ----------

function SlackPost({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-lg font-black text-slate-950">S</span>
        <div>
          <p className="text-sm font-bold">
            Synergr Bot <span className="ml-1 rounded bg-slate-800 px-1 text-11px font-normal text-slate-400">APP</span>
          </p>
          <p className="text-xs text-slate-500">#general</p>
        </div>
      </div>
      <div className="mt-3 text-slate-200">{children}</div>
    </div>
  );
}

function Morning({ party, name, people }: { party: AllHandsView; name: Name; people: Map<string, PlayerPublic> }) {
  const d = party.dawn;
  const laidOffSeat = d?.laidOff ? party.seats.find((x) => x.id === d.laidOff) : undefined;
  const alive = party.seats.filter((x) => x.alive);
  return (
    <>
      {d && (
        <SlackPost>
          {d.laidOff ? (
            <>
              <p>
                <span className="text-sky-300">@channel</span> {name(d.laidOff)} is no longer with the company. We wish them well in their next
                chapter. 💼
              </p>
              {laidOffSeat?.role && <p className="mt-2 text-sm text-slate-400">Their badge said: {ROLE_INFO[laidOffSeat.role].name}.</p>}
            </>
          ) : d.saved ? (
            <p>HR blocked a layoff overnight. Synergy is up 4%. 📈</p>
          ) : (
            <p>Quiet night. Nobody got laid off. Suspicious. 👀</p>
          )}
        </SlackPost>
      )}
      {party.phase === "day" && (
        <>
          <div>
            <h1 className="text-3xl font-black">All-hands</h1>
            <p className="mt-1 text-slate-300">Put your phones down and talk it out. Who&apos;s the Mole? Performance review starts when the clock runs out.</p>
          </div>
          {party.checks.length > 0 && <Checks party={party} name={name} />}
          <Section title={`Still employed (${alive.length})`}>
            <Roster seats={alive} name={name} people={people} />
          </Section>
        </>
      )}
    </>
  );
}

function Roster({ seats, name, people, showRoles = false }: { seats: SeatView[]; name: Name; people: Map<string, PlayerPublic>; showRoles?: boolean }) {
  return (
    <ul className="flex flex-col gap-2">
      {seats.map((x) => (
        <li
          key={x.id}
          className={`flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 ${x.alive ? "" : "opacity-60"}`}
        >
          <Dot p={people.get(x.id)} size="h-4 w-4" />
          <span className="min-w-0 flex-1">
            <span className={`block truncate font-semibold ${x.alive ? "" : "line-through"}`}>{name(x.id)}</span>
            <span className="block text-xs text-slate-400">{x.title}</span>
          </span>
          {(showRoles || x.role) && x.role && <RoleChip role={x.role} />}
        </li>
      ))}
    </ul>
  );
}

// ---------- performance review ----------

function Review({
  party,
  act,
  busy,
  name,
  people,
  me,
}: {
  party: AllHandsView;
  act: Act;
  busy: boolean;
  name: Name;
  people: Map<string, PlayerPublic>;
  me: string;
}) {
  const v = party.vote!;
  const alive = party.seats.filter((x) => x.alive);
  const option = (id: string, label: React.ReactNode, sub: string | null) => {
    const voters = v.tally[id] ?? [];
    const mine = v.myVote === id;
    return (
      <li key={id}>
        <button
          type="button"
          disabled={busy || !v.canVote || id === me}
          aria-pressed={mine}
          onClick={() => void act({ type: "vote", target: id })}
          className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left disabled:cursor-default ${
            mine ? "border-lime-300 bg-lime-300/10" : "border-slate-800 bg-slate-900 enabled:active:bg-slate-800"
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{label}</span>
            {sub && <span className="block text-xs text-slate-400">{sub}</span>}
          </span>
          <span className="flex -space-x-1">
            {voters.map((p) => (
              <Dot key={p} p={people.get(p)} size="h-4 w-4 ring-2 ring-slate-900" />
            ))}
          </span>
          <span className="w-6 text-right font-mono text-lg tabular-nums">{voters.length}</span>
        </button>
      </li>
    );
  };
  return (
    <>
      <div>
        <h1 className="text-3xl font-black">Performance review</h1>
        <p className="mt-1 text-slate-300">
          {v.canVote ? "Vote to fire someone. Most votes is fired, unless circling back wins or it's a tie." : "The team is voting."}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {alive.map((x) =>
          option(
            x.id,
            <span className="flex items-center gap-2">
              <Dot p={people.get(x.id)} />
              {name(x.id)}
              {x.id === me && <span className="font-normal text-slate-400">(you)</span>}
            </span>,
            x.title,
          ),
        )}
        {option(SKIP, "Let's circle back", "Nobody gets fired today")}
      </ul>
      <p className="text-sm text-slate-400">
        {v.voted} of {v.total} have voted.
      </p>
    </>
  );
}

// ---------- exit interview and game over ----------

function ExitInterview({ party, name }: { party: AllHandsView; name: Name }) {
  const e = party.exit;
  if (!e) return null;
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center">
      {e.fired ? (
        <>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Fired with {e.votes} votes</p>
          <p className="text-4xl font-black">{name(e.fired)}</p>
          {e.role ? (
            <p className="text-lg">
              was the <RoleChip role={e.role} />
            </p>
          ) : (
            <p className="text-slate-400">Their badge goes in the shredder unread.</p>
          )}
        </>
      ) : (
        <>
          <p className="text-4xl font-black">Nobody got fired.</p>
          <p className="text-slate-400">The team decided to circle back. Synergy remains unclear.</p>
        </>
      )}
    </div>
  );
}

function GameOver({
  party,
  isHost,
  act,
  busy,
  name,
  people,
}: {
  party: AllHandsView;
  isHost: boolean;
  act: Act;
  busy: boolean;
  name: Name;
  people: Map<string, PlayerPublic>;
}) {
  const company = party.winner === "company";
  const myTeam = party.me.role ? ROLE_INFO[party.me.role].team : null;
  return (
    <>
      <div className={`rounded-3xl border p-6 text-center ${company ? "border-lime-300/50 bg-lime-300/10" : "border-rose-400/60 bg-rose-400/10"}`}>
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">{company ? "The company survives" : "Synergr was acquired for parts"}</p>
        <p className="mt-1 text-4xl font-black">{company ? "Every Mole is out." : "The Moles win."}</p>
        {myTeam && <p className="mt-2 text-slate-200">{myTeam === party.winner ? "Your side won. Update your LinkedIn." : "Your side lost. Time to pivot."}</p>}
      </div>
      <Section title="Who was who">
        <Roster seats={party.seats} name={name} people={people} showRoles />
      </Section>
      {party.nights && <NightLog nights={party.nights} name={name} />}
      {isHost ? (
        <div className="flex flex-col gap-2">
          <PrimaryButton disabled={busy} onClick={() => void act({ type: "start" })}>
            Play again with everyone here
          </PrimaryButton>
          <button type="button" disabled={busy} onClick={() => void act({ type: "end" })} className="min-h-11 text-sm text-slate-400 underline">
            Back to the lobby
          </button>
        </div>
      ) : (
        <Banner>Waiting for {name(party.hostId)} to start another round.</Banner>
      )}
      <Link href="/party" className="text-center text-sm text-slate-500 underline">
        More party games
      </Link>
    </>
  );
}

function NightLog({ nights, name, live = false }: { nights: NonNullable<AllHandsView["nights"]>; name: Name; live?: boolean }) {
  if (nights.length === 0) return null;
  return (
    <Section title={live ? "What happened after hours so far" : "What happened after hours"}>
      <ol className="flex flex-col gap-2 text-sm">
        {nights.map((n) => (
          <li key={n.round} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
            <p className="font-semibold">Night {n.round}</p>
            <p className="text-slate-300">
              Moles went after {name(n.moleTarget)}. HR covered {name(n.hrTarget)}. IT read {name(n.itTarget)}&apos;s DMs
              {n.itResult !== null && (n.itResult ? " (a Mole!)" : " (clean)")}.
            </p>
            <p className="text-xs text-slate-500">
              {n.outcome === "laidoff" ? `${name(n.moleTarget)} was laid off.` : n.outcome === "saved" ? "HR blocked the layoff." : "Nobody was laid off."}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function History({ history, name }: { history: HistoryEntry[]; name: Name }) {
  if (history.length === 0) return null;
  const line = (h: HistoryEntry) => {
    switch (h.kind) {
      case "laidoff":
        return `${name(h.playerId)} was laid off`;
      case "saved":
        return "HR blocked a layoff";
      case "quiet":
        return "A quiet night";
      case "fired":
        return `${name(h.playerId)} was fired`;
      case "kept":
        return "The team circled back";
    }
  };
  return (
    <Section title="Company news">
      <ol className="flex flex-col gap-1 text-sm text-slate-300">
        {[...history].reverse().map((h, i) => (
          <li key={i} className="flex items-center justify-between gap-2 border-b border-slate-800/70 py-1.5">
            <span>
              <span className="mr-2 text-xs text-slate-500">Round {h.round}</span>
              {line(h)}
            </span>
            {h.role && <RoleChip role={h.role} />}
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ---------- host controls ----------

function HostBar({ party, act, busy }: { party: AllHandsView; act: Act; busy: boolean }) {
  const skipLabel: Partial<Record<AllHandsView["phase"], string>> = {
    reveal: "Start after hours now",
    night: "End after hours now",
    dawn: "Go to all-hands",
    day: "Start performance review",
    vote: "Close the vote",
    exit: "Next",
  };
  return (
    <section aria-label="Host controls" className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-700 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Host controls</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void act({ type: "skip", from: party.phase })} className="min-h-11 flex-1 rounded-lg border border-slate-700 px-3 text-sm font-semibold">
          {skipLabel[party.phase] ?? "Skip ahead"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act({ type: party.paused ? "resume" : "pause" })}
          className="min-h-11 rounded-lg border border-slate-700 px-3 text-sm font-semibold"
        >
          {party.paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => window.confirm("End this game for everyone and go back to the lobby?") && void act({ type: "end" })}
          className="min-h-11 rounded-lg border border-rose-400/50 px-3 text-sm font-semibold text-rose-300"
        >
          End game
        </button>
      </div>
    </section>
  );
}
