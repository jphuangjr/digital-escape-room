"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { QrCode } from "@/components/site/QrCode";
import { TestBar } from "@/components/allhands/TestBar";
import {
  PICK_OPTIONS_MS,
  TARGET_OPTIONS,
  capitalize,
  fillParts,
  type EntryView,
  type ReplyAllView,
} from "@/lib/replyall/types";

type Act = (body: Record<string, unknown>) => Promise<void>;
type Name = (id: string | null | undefined) => string;

const PHASE_LABEL: Record<ReplyAllView["phase"], string> = {
  lobby: "Lobby",
  pick: "Replying",
  judge: "Manager's pick",
  vote: "Reactions",
  result: "Pinned",
  over: "Thread closed",
};

/**
 * Reply All on one phone: the lobby, your hand of replies, the anonymous replies on the table, and the pinned one.
 * Everyone is in the same room, so the prompt and the replies get read out loud; the phone keeps the hands secret.
 */
export function ReplyAllShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const people = useMemo(() => new Map(state.players.map((p) => [p.id, p])), [state.players]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const meId = state.partyTest?.viewingAs ?? state.me.id;

  // A tap shows at once (patched locally), then the server's answer replaces it, then the next full state.
  const [local, setLocal] = useState<ReplyAllView | null>(null);
  const inFlight = useRef(0);
  useEffect(() => {
    if (inFlight.current === 0) setLocal(null);
  }, [state]);
  const party = local ?? (state.party as ReplyAllView);
  const partyRef = useRef(party);
  partyRef.current = party;

  const act: Act = useCallback(
    async (body) => {
      const tick = body.type === "tick";
      if (!tick) {
        setErr(null);
        setLocal(optimistic(partyRef.current, body, meId));
      }
      inFlight.current++;
      setBusy(true);
      const res = await apiFetch<{ error?: string; party?: ReplyAllView }>(code, "/party", { body });
      inFlight.current--;
      if (res.data?.party) setLocal(res.data.party);
      else if (!res.ok) setLocal(null);
      if (!res.ok && !tick) setErr(res.data?.error ?? "That didn't work. Try again.");
      if (inFlight.current === 0) setBusy(false);
      void refresh();
    },
    [code, refresh, meId],
  );

  // Presence: a heartbeat keeps this player counted as here (and the host's controls with the host).
  useEffect(() => {
    const beat = () => void apiFetch(code, "/presence", { body: { view: "party" } });
    beat();
    const id = setInterval(beat, 15_000);
    return () => clearInterval(id);
  }, [code]);

  const left = useCountdown(party.endsAt);
  // When the clock runs out, nudge the server: phases move on when asked.
  const ticked = useRef<string | null>(null);
  useEffect(() => {
    if (!party.endsAt || left === null || left > 0 || ticked.current === party.endsAt) return;
    ticked.current = party.endsAt;
    void act({ type: "tick" });
  }, [left, party.endsAt, act]);

  const isHost = state.me.id === party.hostId;
  const name: Name = (id) => (id ? (people.get(id)?.displayName ?? "Someone") : "Nobody");
  const inGame = party.phase !== "lobby" && party.phase !== "over";

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header
        className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-edge backdrop-blur"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
      >
        {busy && <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-sky-300" />}
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="truncate whitespace-nowrap text-11px font-semibold uppercase tracking-[0.2em] text-sky-300">Reply All · {code}</p>
            <p className="truncate text-lg font-bold">
              {PHASE_LABEL[party.phase]}
              {party.round > 0 && inGame && <span className="ml-2 text-sm font-normal text-slate-400">Thread {party.round}</span>}
              {party.settings.afterHours && <span className="ml-2 rounded-full border border-rose-400/60 px-1.5 align-middle text-11px font-semibold text-rose-300">18+</span>}
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
            sizes={[3, 5, 8, 12]}
            hint="You play as whoever you pick: their hand, their pick as Manager and their vote. The host controls stay yours."
          />
        )}
        {err && (
          <p role="alert" className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {err}
          </p>
        )}
        {inGame && !party.me.seated && (
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4">
            <p className="text-sm text-sky-100">This thread started before you got here. Grab a hand and you&apos;re in.</p>
            <PrimaryButton disabled={busy} onClick={() => void act({ type: "join" })}>
              Deal me in
            </PrimaryButton>
          </div>
        )}

        {party.phase === "lobby" && <Lobby code={code} state={state} party={party} isHost={isHost} act={act} busy={busy} name={name} />}
        {party.phase === "pick" && <Pick party={party} act={act} busy={busy} name={name} />}
        {(party.phase === "judge" || party.phase === "vote") && <Table party={party} act={act} busy={busy} name={name} />}
        {party.phase === "result" && <Result party={party} name={name} />}
        {party.phase === "over" && <GameOver party={party} isHost={isHost} act={act} busy={busy} name={name} />}

        {inGame && <Scoreboard party={party} people={people} meId={meId} />}
        {isHost && inGame && <HostBar party={party} act={act} busy={busy} />}
        {party.phase !== "lobby" && <PinnedHistory party={party} name={name} />}
      </main>
    </div>
  );
}

/** What a tap will do to this phone's screen, shown before the server answers. */
function optimistic(p: ReplyAllView, body: Record<string, unknown>, meId: string): ReplyAllView {
  switch (body.type) {
    case "play": {
      const picked = p.me.hand.find((c) => c.card === body.card);
      if (!picked) return p;
      // Changing your reply puts the earlier card back in your hand.
      const back = p.me.played !== null && p.me.playedText !== null ? [{ card: p.me.played, text: p.me.playedText }] : [];
      const hand = [...p.me.hand.filter((c) => c.card !== picked.card), ...back];
      return {
        ...p,
        me: { ...p.me, played: picked.card, playedText: picked.text, hand },
        seats: p.seats.map((s) => (s.id === meId ? { ...s, done: true } : s)),
      };
    }
    case "vote":
      return { ...p, me: { ...p.me, voted: body.entry as number }, seats: p.seats.map((s) => (s.id === meId ? { ...s, done: true } : s)) };
    case "settings":
      return { ...p, settings: { ...p.settings, ...(body.settings as object) } };
    default:
      return p;
  }
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
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-lg tabular-nums ${left < 10_000 ? "border-rose-400/60 text-rose-300" : "border-slate-700 text-slate-200"}`}
      aria-label={`${Math.ceil(left / 1000)} seconds left`}
    >
      {fmt(left)}
    </span>
  );
}

// ---------- shared bits ----------

function Banner({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">{children}</p>;
}

function Dot({ p, size = "h-3 w-3" }: { p: PlayerPublic | undefined; size?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${size}`} style={{ backgroundColor: p?.color ?? "#64748b" }} />;
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
      className="min-h-12 w-full rounded-xl bg-sky-300 px-4 font-bold text-slate-950 transition-transform duration-75 enabled:active:scale-[0.98] active:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** The round's prompt, styled as the email that starts the thread. With a reply, it's shown filled in. */
function PromptCard({ prompt, reply, round }: { prompt: string; reply?: string; round: number }) {
  const parts = reply ? fillParts(prompt, reply) : null;
  return (
    <article className="rounded-3xl border border-slate-700 bg-slate-100 p-5 text-slate-900 shadow-lg">
      <p className="font-mono text-11px uppercase tracking-[0.2em] text-slate-500">
        To: all-staff@synergr · Thread {round}
      </p>
      <p className="mt-3 text-2xl font-black leading-snug">
        {parts ? (
          <>
            {parts.before}
            {parts.question && <br />}
            <mark className="rounded bg-sky-300 px-1 text-slate-950 [box-decoration-break:clone]">{parts.reply}</mark>
            {parts.after}
          </>
        ) : (
          prompt.split("____").map((piece, i, all) => (
            <span key={i}>
              {piece}
              {i < all.length - 1 && <span className="inline-block min-w-[4.5rem] border-b-4 border-slate-900 align-baseline">&nbsp;</span>}
            </span>
          ))
        )}
      </p>
    </article>
  );
}

function ReplyCard({
  text,
  selected,
  disabled,
  tag,
  onClick,
}: {
  text: string;
  selected?: boolean;
  disabled?: boolean;
  tag?: React.ReactNode;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="block text-base font-semibold leading-snug">{capitalize(text)}</span>
      {tag && <span className="mt-2 block text-xs text-slate-400">{tag}</span>}
    </>
  );
  const cls = `w-full rounded-2xl border p-4 text-left transition-transform duration-75 ${
    selected ? "border-sky-300 bg-sky-300/15 ring-2 ring-sky-300" : "border-slate-800 bg-slate-900"
  }`;
  if (!onClick) return <div className={cls}>{body}</div>;
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick} className={`${cls} enabled:active:scale-[0.99] disabled:opacity-50`}>
      {body}
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
  party: ReplyAllView;
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
  const tooMany = count > party.maxPlayers;
  return (
    <>
      <Link href="/party" className="-my-2 inline-flex min-h-11 items-center self-start text-sm text-slate-400 active:text-slate-200">
        ← Back to Party games
      </Link>
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Room code</p>
        <p className="font-mono text-5xl font-black tracking-widest text-sky-300">{code}</p>
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

      <Section title={`On the thread (${count})`}>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <Dot p={p} size="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {p.displayName}
                {p.id === state.me.id && <span className="ml-1 font-normal text-slate-400">(you)</span>}
              </span>
              {p.id === party.hostId && <span className="text-xs text-sky-300">Host</span>}
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
            <Choice
              label="Who picks the best reply"
              options={[
                { value: "manager", label: "A rotating Manager" },
                { value: "vote", label: "Everyone votes" },
              ]}
              value={party.settings.mode}
              onPick={(v) => void act({ type: "settings", settings: { mode: v } })}
              note={
                party.settings.mode === "manager"
                  ? "Each thread one player is the Manager: they don't reply, they read the replies out and pin their favourite."
                  : "Everyone replies, then everyone votes for their favourite (not their own). Ties all get a pin."
              }
            />
            <Choice
              label="Pins to win"
              options={TARGET_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
              value={party.settings.target}
              onPick={(v) => void act({ type: "settings", settings: { target: v } })}
            />
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span>
                <span className="block font-semibold">
                  After Hours cards <span className="ml-1 rounded-full border border-rose-400/60 px-1.5 text-11px text-rose-300">18+</span>
                </span>
                <span className="block text-xs text-slate-400">
                  Makes most of the deck crude, sexual 18+ cards (about 7 in 10). Only for a table where everyone is an adult and up for it.
                </span>
              </span>
              <input
                type="checkbox"
                checked={party.settings.afterHours}
                onChange={(e) => {
                  if (e.target.checked && !window.confirm("Turn on the 18+ After Hours cards? Only do this if everyone at the table is an adult and okay with crude humor.")) return;
                  void act({ type: "settings", settings: { afterHours: e.target.checked } });
                }}
                className="h-6 w-6 shrink-0 accent-rose-400"
              />
            </label>
            <Choice
              label="Time to reply"
              options={PICK_OPTIONS_MS.map((ms) => ({ value: ms, label: `${ms / 1000}s` }))}
              value={party.settings.pickMs}
              onPick={(v) => void act({ type: "settings", settings: { pickMs: v } })}
              note="Run out of time and your phone auto-replies with a random card for you."
            />
          </Section>
          <PrimaryButton disabled={busy || need > 0 || tooMany} onClick={() => void act({ type: "start" })}>
            {need > 0 ? `Waiting for ${need} more ${need === 1 ? "player" : "players"}` : tooMany ? `${party.maxPlayers} players at most` : "Start the thread"}
          </PrimaryButton>
        </>
      ) : (
        <Banner>
          Waiting for {name(party.hostId)} to start.{" "}
          {party.settings.afterHours && <span className="font-semibold text-rose-300">After Hours (18+) cards are on. </span>}
          {party.settings.mode === "manager" ? "A rotating Manager picks the best reply" : "Everyone votes for the best reply"}; first to {party.settings.target} pins wins.
        </Banner>
      )}
      <HowToPlay />
    </>
  );
}

function Choice<T extends string | number>({
  label,
  options,
  value,
  onPick,
  note,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onPick: (v: T) => void;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3">
      <span className="font-semibold">{label}</span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
            className={`min-h-11 flex-1 rounded-lg border px-2 text-sm font-semibold ${value === o.value ? "border-sky-300 bg-sky-300/10 text-sky-300" : "border-slate-700"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {note && <span className="text-xs text-slate-400">{note}</span>}
    </div>
  );
}

function HowToPlay() {
  return (
    <Section title="How to play">
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
        <li>Everyone holds a hand of seven reply cards on their phone.</li>
        <li>Each thread starts with a prompt. Read it out loud.</li>
        <li>Pick the reply from your hand that fits it best, or worst. Replies are anonymous.</li>
        <li>The Manager (or the whole table, in vote mode) reads them all out and pins the funniest.</li>
        <li>A pin is a point. First to the target wins.</li>
        <li>Hate your hand? Mark all as read: skip replying for one thread and get seven new cards.</li>
      </ol>
    </Section>
  );
}

// ---------- replying ----------

function Pick({ party, act, busy, name }: { party: ReplyAllView; act: Act; busy: boolean; name: Name }) {
  const [sel, setSel] = useState<number | null>(null);
  const waiting = party.seats.filter((s) => !s.isManager && !s.done).length;
  const repliers = party.seats.filter((s) => !s.isManager).length;
  const played = party.me.played;
  const playedText = party.me.playedText;
  useEffect(() => setSel(null), [party.round]);

  return (
    <>
      <PromptCard prompt={party.prompt ?? ""} round={party.round} />
      {party.managerId && !party.me.isManager && (
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">{name(party.managerId)}</span> is the Manager this thread and picks the winner.
        </p>
      )}
      {party.me.isManager ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4">
          <p className="font-bold text-sky-200">You&apos;re the Manager this thread.</p>
          <p className="text-sm text-sky-100/80">
            Read the prompt out loud. Once the replies are in, you&apos;ll read them out and pin the one you like best.{" "}
            {repliers - waiting} of {repliers} replied.
          </p>
        </div>
      ) : party.me.seated ? (
        <>
          {party.me.skipped && (
            <Banner>
              You&apos;re sitting this thread out. Here&apos;s your fresh hand for the next one. Waiting on {waiting} more.
            </Banner>
          )}
          {played !== null && (
            <Banner>
              Sent{playedText ? <>: <span className="font-semibold text-slate-100">{capitalize(playedText)}</span></> : ""}. Waiting on{" "}
              {waiting} more. Tap another card and send it to change your reply.
            </Banner>
          )}
          <Section title="Your hand">
            <ul className="flex flex-col gap-2">
              {party.me.hand.map((c) => (
                <li key={c.card}>
                  <ReplyCard
                    text={c.text}
                    selected={sel === c.card}
                    onClick={party.me.skipped ? undefined : () => setSel(sel === c.card ? null : c.card)}
                  />
                </li>
              ))}
            </ul>
          </Section>
          {!party.me.skipped && (
            <div className="sticky bottom-3 z-10 flex flex-col gap-2">
              <PrimaryButton
                disabled={busy || sel === null}
                onClick={() => {
                  if (sel === null) return;
                  void act({ type: "play", card: sel });
                  setSel(null);
                }}
              >
                {sel === null ? (played === null ? "Tap a card to reply" : "Tap a card to change your reply") : played === null ? "Send reply" : "Send this instead"}
              </PrimaryButton>
            </div>
          )}
          {party.me.canSkip && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                window.confirm("Skip replying this thread and swap your whole hand for seven new cards?") && void act({ type: "mulligan" })
              }
              className="min-h-11 self-center rounded-xl px-4 text-sm font-semibold text-slate-400 underline active:text-slate-200"
            >
              Mark all as read: skip this thread for a fresh hand
            </button>
          )}
        </>
      ) : null}
    </>
  );
}

// ---------- the replies on the table ----------

function Table({ party, act, busy, name }: { party: ReplyAllView; act: Act; busy: boolean; name: Name }) {
  const [sel, setSel] = useState<number | null>(null);
  const entries = party.entries ?? [];
  const judging = party.phase === "judge";
  const canPick = judging ? party.me.isManager : party.me.seated;
  const voted = party.me.voted;
  const waiting = party.seats.filter((s) => !s.done).length;

  return (
    <>
      <PromptCard prompt={party.prompt ?? ""} round={party.round} />
      {judging ? (
        party.me.isManager ? (
          <Banner>Read every reply out loud with the prompt, then tap the one to pin. Nobody knows who wrote what, yet.</Banner>
        ) : (
          <Banner>
            <span className="font-semibold text-slate-100">{name(party.managerId)}</span> is reading the replies out and picking one to pin.
          </Banner>
        )
      ) : (
        <Banner>
          Read them out, then react to your favourite. You can&apos;t vote for your own. {voted !== null ? `Waiting on ${waiting} more.` : ""}
        </Banner>
      )}
      <ul className="flex flex-col gap-2">
        {entries.map((e) => {
          const chosen = judging ? sel === e.entry : (sel ?? voted) === e.entry;
          return (
            <li key={e.entry}>
              <ReplyCard
                text={e.text}
                selected={chosen}
                disabled={!canPick || e.mine}
                tag={e.mine ? "Your reply" : !judging && voted === e.entry ? "Your vote" : undefined}
                onClick={canPick && !e.mine ? () => setSel(e.entry) : undefined}
              />
            </li>
          );
        })}
      </ul>
      {canPick && (
        <div className="sticky bottom-3 z-10">
          <PrimaryButton
            disabled={busy || sel === null || (!judging && sel === voted)}
            onClick={() => {
              if (sel === null) return;
              void act({ type: judging ? "choose" : "vote", entry: sel });
              if (!judging) setSel(null);
            }}
          >
            {judging ? (sel === null ? "Tap a reply to pin it" : "Pin this reply") : sel === null ? (voted === null ? "Tap a reply to vote" : "Voted. Tap another to change") : "React with 👍"}
          </PrimaryButton>
        </div>
      )}
    </>
  );
}

// ---------- the result ----------

function winnerLine(winners: string[], name: Name): string {
  if (!winners.length) return "Nobody";
  return winners.map((w) => name(w)).join(" and ");
}

function Result({ party, name }: { party: ReplyAllView; name: Name }) {
  const r = party.result;
  const entries = party.entries ?? [];
  const pinned = entries.find((e) => e.entry === r?.entry);
  const how =
    r?.byPicker === "manager" ? `${name(party.managerId)} pinned it.` : r?.byPicker === "vote" ? "The table voted." : "Nobody picked in time, so it went to a random reply.";
  const order = [...entries].sort((a, b) => Number(r?.winners.includes(b.by ?? "")) - Number(r?.winners.includes(a.by ?? "")) || (b.votes ?? 0) - (a.votes ?? 0));
  return (
    <>
      {pinned && <PromptCard prompt={party.prompt ?? ""} reply={pinned.text} round={party.round} />}
      <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">📌 Pinned</p>
        <p className="mt-1 text-2xl font-black">{winnerLine(r?.winners ?? [], name)}</p>
        <p className="text-sm text-sky-100/80">
          {how} {r && r.winners.length > 1 ? "A tie: everyone tied gets a pin." : ""}
        </p>
      </div>
      <Section title="Who wrote what">
        <ul className="flex flex-col gap-2">
          {order.map((e) => (
            <li key={e.entry}>
              <ReplyCard text={e.text} selected={r?.winners.includes(e.by ?? "")} tag={entryTag(e, name)} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function entryTag(e: EntryView, name: Name): string {
  const bits = [e.mine ? "You" : name(e.by)];
  if (e.votes !== undefined) bits.push(`${e.votes} ${e.votes === 1 ? "vote" : "votes"}`);
  if (e.auto) bits.push("auto-reply");
  return bits.join(" · ");
}

function GameOver({ party, isHost, act, busy, name }: { party: ReplyAllView; isHost: boolean; act: Act; busy: boolean; name: Name }) {
  const ranked = [...party.seats].sort((a, b) => b.score - a.score);
  return (
    <>
      <div className="rounded-3xl border border-sky-400/40 bg-sky-400/10 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">Thread closed</p>
        <p className="mt-2 text-3xl font-black">{winnerLine(party.champions, name)}</p>
        <p className="mt-1 text-sky-100/80">
          {party.champions.length > 1 ? "share" : "wins"} with {ranked[0]?.score ?? 0} pins. Promoted to Head of Replying.
        </p>
      </div>
      <Section title="Final pins">
        <ol className="flex flex-col gap-2">
          {ranked.map((s) => (
            <li key={s.id} className="flex min-h-12 items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3">
              <span className="font-semibold">{name(s.id)}</span>
              <span className="font-mono">{s.score}</span>
            </li>
          ))}
        </ol>
      </Section>
      {isHost ? (
        <div className="flex flex-col gap-2">
          <PrimaryButton disabled={busy} onClick={() => void act({ type: "start" })}>
            Play again
          </PrimaryButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => void act({ type: "end" })}
            className="min-h-12 rounded-xl border border-slate-700 font-semibold active:bg-slate-800 disabled:opacity-50"
          >
            Back to the lobby (change the rules)
          </button>
        </div>
      ) : (
        <Banner>Waiting for {name(party.hostId)} to start another game.</Banner>
      )}
    </>
  );
}

// ---------- always there ----------

function Scoreboard({ party, people, meId }: { party: ReplyAllView; people: Map<string, PlayerPublic>; meId: string }) {
  const showDone = party.phase === "pick" || party.phase === "vote";
  return (
    <Section title={`Pins · first to ${party.settings.target}`}>
      <ul className="grid grid-cols-2 gap-2">
        {party.seats.map((s) => {
          const p = people.get(s.id);
          return (
            <li key={s.id} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm">
              <Dot p={p} />
              <span className="min-w-0 flex-1 truncate">
                {p?.displayName ?? "Someone"}
                {s.id === meId && <span className="text-slate-400"> (you)</span>}
              </span>
              {s.isManager && <span className="rounded-full border border-sky-300/50 px-1.5 text-11px text-sky-300">Mgr</span>}
              {showDone && !s.isManager && (
                <span aria-label={s.skipped ? "skipped" : s.done ? "done" : "waiting"}>{s.skipped ? "↻" : s.done ? "✓" : "…"}</span>
              )}
              <span className="font-mono font-bold">{s.score}</span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function PinnedHistory({ party, name }: { party: ReplyAllView; name: Name }) {
  const past = party.history.filter((h) => party.phase !== "result" || h.round !== party.round).slice().reverse();
  if (!past.length) return null;
  return (
    <Section title="Pinned so far">
      <ul className="flex flex-col gap-2">
        {past.map((h) => {
          const parts = fillParts(h.prompt, h.reply);
          return (
            <li key={h.round} className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
              <p className="leading-snug text-slate-300">
                {parts.before}
                <span className="font-semibold text-sky-200">{parts.reply}</span>
                {parts.after}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Thread {h.round} · {winnerLine(h.winners, name)}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function HostBar({ party, act, busy }: { party: ReplyAllView; act: Act; busy: boolean }) {
  const skipLabel: Partial<Record<ReplyAllView["phase"], string>> = {
    pick: "Close replies now",
    judge: "Pick one at random",
    vote: "Close the vote",
    result: "Next thread",
  };
  const btn =
    "min-h-11 rounded-lg border border-slate-700 px-3 text-sm font-semibold transition-transform duration-75 enabled:active:scale-[0.97] enabled:active:bg-slate-800 disabled:opacity-50";
  return (
    <section aria-label="Host controls" className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-700 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Host controls</p>
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
