"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { QrCode } from "@/components/site/QrCode";
import { TestBar } from "@/components/allhands/TestBar";
import { FormattedMessage } from "react-intl";
import { useT } from "@/i18n/client";
import { localizeView } from "@/lib/replyall/content";
import { useReplyPack } from "./useReplyPack";
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
type T = ReturnType<typeof useT>;

/** Bold text inside a translated sentence (`<b>…</b>` in the message). */
const bold = (chunks: React.ReactNode) => (
  <span key="b" className="font-semibold text-slate-100">
    {chunks}
  </span>
);

/**
 * Reply All on one phone: the lobby, your hand of replies, the anonymous replies on the table, and the pinned one.
 * Everyone is in the same room, so the prompt and the replies get read out loud; the phone keeps the hands secret.
 */
export function ReplyAllShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const t = useT();
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
  const pack = useReplyPack();
  const party = localizeView(local ?? (state.party as ReplyAllView), pack);
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
      if (!res.ok && !tick) setErr(res.data?.error ?? t("party.err.generic"));
      if (inFlight.current === 0) setBusy(false);
      void refresh();
    },
    [code, refresh, meId, t],
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
  const name: Name = (id) => (id ? (people.get(id)?.displayName ?? t("party.someone")) : t("party.nobody"));
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
              {t(`replyall.phase.${party.phase}`)}
              {party.round > 0 && inGame && <span className="ml-2 text-sm font-normal text-slate-400">{t("replyall.thread", { n: party.round })}</span>}
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
            hint={t("replyall.testHint")}
          />
        )}
        {err && (
          <p role="alert" className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {err}
          </p>
        )}
        {inGame && !party.me.seated && (
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4">
            <p className="text-sm text-sky-100">{t("replyall.late")}</p>
            <PrimaryButton disabled={busy} onClick={() => void act({ type: "join" })}>
              {t("replyall.dealMeIn")}
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
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-lg tabular-nums ${left < 10_000 ? "border-rose-400/60 text-rose-300" : "border-slate-700 text-slate-200"}`}
      aria-label={t("party.clock.left", { n: Math.ceil(left / 1000) })}
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
  const t = useT();
  const parts = reply ? fillParts(prompt, reply) : null;
  return (
    <article className="rounded-3xl border border-slate-700 bg-slate-100 p-5 text-slate-900 shadow-lg">
      <p className="font-mono text-11px uppercase tracking-[0.2em] text-slate-500">
        {t("replyall.promptTo", { n: round })}
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
      <Link href="/party" className="-my-2 inline-flex min-h-11 items-center self-start text-sm text-slate-400 active:text-slate-200">
        {t("party.back")}
      </Link>
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t("party.roomCode")}</p>
        <p className="font-mono text-5xl font-black tracking-widest text-sky-300">{code}</p>
        {origin && <QrCode url={url} size={168} label={t("party.qrLabel", { code })} />}
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(url).then(() => setCopied(true));
          }}
          className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold active:bg-slate-800"
        >
          {copied ? t("party.linkCopied") : t("party.copyLink")}
        </button>
      </section>

      <Section title={t("replyall.lobby.players", { n: count })}>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <Dot p={p} size="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {p.displayName}
                {p.id === state.me.id && <span className="ml-1 font-normal text-slate-400">{t("party.you")}</span>}
              </span>
              {p.id === party.hostId && <span className="text-xs text-sky-300">{t("party.hostTag")}</span>}
              {isHost && p.id !== state.me.id && (
                <button
                  type="button"
                  onClick={() => window.confirm(t("party.removeConfirm", { name: p.displayName })) && void act({ type: "kick", playerId: p.id })}
                  className="min-h-11 px-2 text-xs text-slate-400 underline"
                >
                  {t("party.remove")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {isHost ? (
        <>
          <Section title={t("party.houseRules")}>
            <Choice
              label={t("replyall.lobby.mode")}
              options={[
                { value: "manager", label: t("replyall.lobby.modeManager") },
                { value: "vote", label: t("replyall.lobby.modeVote") },
              ]}
              value={party.settings.mode}
              onPick={(v) => void act({ type: "settings", settings: { mode: v } })}
              note={
                party.settings.mode === "manager"
                  ? t("replyall.lobby.modeManagerNote")
                  : t("replyall.lobby.modeVoteNote")
              }
            />
            <Choice
              label={t("replyall.lobby.target")}
              options={TARGET_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
              value={party.settings.target}
              onPick={(v) => void act({ type: "settings", settings: { target: v } })}
            />
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span>
                <span className="block font-semibold">
                  {t("replyall.lobby.afterHours")} <span className="ml-1 rounded-full border border-rose-400/60 px-1.5 text-11px text-rose-300">18+</span>
                </span>
                <span className="block text-xs text-slate-400">
                  {t("replyall.lobby.afterHoursNote")}
                </span>
              </span>
              <input
                type="checkbox"
                checked={party.settings.afterHours}
                onChange={(e) => {
                  if (e.target.checked && !window.confirm(t("replyall.lobby.afterHoursConfirm"))) return;
                  void act({ type: "settings", settings: { afterHours: e.target.checked } });
                }}
                className="h-6 w-6 shrink-0 accent-rose-400"
              />
            </label>
            <Choice
              label={t("replyall.lobby.pickTime")}
              options={PICK_OPTIONS_MS.map((ms) => ({ value: ms, label: t("party.seconds", { n: ms / 1000 }) }))}
              value={party.settings.pickMs}
              onPick={(v) => void act({ type: "settings", settings: { pickMs: v } })}
              note={t("replyall.lobby.pickTimeNote")}
            />
          </Section>
          <PrimaryButton disabled={busy || need > 0 || tooMany} onClick={() => void act({ type: "start" })}>
            {need > 0 ? t("party.waitingForPlayers", { n: need }) : tooMany ? t("party.atMost", { max: party.maxPlayers }) : t("replyall.lobby.start")}
          </PrimaryButton>
        </>
      ) : (
        <Banner>
          {t("replyall.lobby.waiting", { name: name(party.hostId) })}{" "}
          {party.settings.afterHours && <span className="font-semibold text-rose-300">{t("replyall.lobby.afterHoursOn")} </span>}
          {t(party.settings.mode === "manager" ? "replyall.lobby.summaryManager" : "replyall.lobby.summaryVote", { target: party.settings.target })}
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
  const t = useT();
  return (
    <Section title={t("party.howToPlay")}>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <li key={n}>{t(`replyall.how.${n}`)}</li>
        ))}
      </ol>
    </Section>
  );
}

// ---------- replying ----------

function Pick({ party, act, busy, name }: { party: ReplyAllView; act: Act; busy: boolean; name: Name }) {
  const t = useT();
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
          <FormattedMessage id="replyall.pick.managerIs" values={{ name: name(party.managerId), b: bold }} />
        </p>
      )}
      {party.me.isManager ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4">
          <p className="font-bold text-sky-200">{t("replyall.pick.youManager")}</p>
          <p className="text-sm text-sky-100/80">{t("replyall.pick.youManagerNote", { done: repliers - waiting, total: repliers })}</p>
        </div>
      ) : party.me.seated ? (
        <>
          {party.me.skipped && (
            <Banner>{t("replyall.pick.skipped", { n: waiting })}</Banner>
          )}
          {played !== null && (
            <Banner>
              {playedText ? (
                <FormattedMessage id="replyall.pick.sent" values={{ card: capitalize(playedText), n: waiting, b: bold }} />
              ) : (
                t("replyall.pick.sentPlain", { n: waiting })
              )}
            </Banner>
          )}
          <Section title={t("replyall.pick.hand")}>
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
                {sel === null
                  ? t(played === null ? "replyall.pick.tapToReply" : "replyall.pick.tapToChange")
                  : t(played === null ? "replyall.pick.send" : "replyall.pick.sendInstead")}
              </PrimaryButton>
            </div>
          )}
          {party.me.canSkip && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                window.confirm(t("replyall.pick.mulliganConfirm")) && void act({ type: "mulligan" })
              }
              className="min-h-11 self-center rounded-xl px-4 text-sm font-semibold text-slate-400 underline active:text-slate-200"
            >
              {t("replyall.pick.mulligan")}
            </button>
          )}
        </>
      ) : null}
    </>
  );
}

// ---------- the replies on the table ----------

function Table({ party, act, busy, name }: { party: ReplyAllView; act: Act; busy: boolean; name: Name }) {
  const t = useT();
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
          <Banner>{t("replyall.table.managerReads")}</Banner>
        ) : (
          <Banner>
            <FormattedMessage id="replyall.table.managerPicking" values={{ name: name(party.managerId), b: bold }} />
          </Banner>
        )
      ) : (
        <Banner>
          {t("replyall.table.vote")} {voted !== null ? t("replyall.table.waiting", { n: waiting }) : ""}
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
                tag={e.mine ? t("replyall.table.yourReply") : !judging && voted === e.entry ? t("replyall.table.yourVote") : undefined}
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
            {judging
                ? t(sel === null ? "replyall.table.tapToPin" : "replyall.table.pin")
                : sel === null
                  ? t(voted === null ? "replyall.table.tapToVote" : "replyall.table.voted")
                  : t("replyall.table.react")}
          </PrimaryButton>
        </div>
      )}
    </>
  );
}

// ---------- the result ----------

function winnerLine(t: T, winners: string[], name: Name): string {
  if (!winners.length) return t("party.nobody");
  return winners.map((w) => name(w)).reduce((a, b) => t("party.and", { a, b }));
}

function Result({ party, name }: { party: ReplyAllView; name: Name }) {
  const t = useT();
  const r = party.result;
  const entries = party.entries ?? [];
  const pinned = entries.find((e) => e.entry === r?.entry);
  const how =
    r?.byPicker === "manager"
      ? t("replyall.result.pinnedBy", { name: name(party.managerId) })
      : r?.byPicker === "vote"
        ? t("replyall.result.voted")
        : t("replyall.result.random");
  const order = [...entries].sort((a, b) => Number(r?.winners.includes(b.by ?? "")) - Number(r?.winners.includes(a.by ?? "")) || (b.votes ?? 0) - (a.votes ?? 0));
  return (
    <>
      {pinned && <PromptCard prompt={party.prompt ?? ""} reply={pinned.text} round={party.round} />}
      <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">{t("replyall.result.pinned")}</p>
        <p className="mt-1 text-2xl font-black">{winnerLine(t, r?.winners ?? [], name)}</p>
        <p className="text-sm text-sky-100/80">
          {how} {r && r.winners.length > 1 ? t("replyall.result.tie") : ""}
        </p>
      </div>
      <Section title={t("replyall.result.whoWrote")}>
        <ul className="flex flex-col gap-2">
          {order.map((e) => (
            <li key={e.entry}>
              <ReplyCard text={e.text} selected={r?.winners.includes(e.by ?? "")} tag={entryTag(t, e, name)} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function entryTag(t: T, e: EntryView, name: Name): string {
  const bits = [e.mine ? t("replyall.result.you") : name(e.by)];
  if (e.votes !== undefined) bits.push(t("replyall.result.votes", { n: e.votes }));
  if (e.auto) bits.push(t("replyall.result.auto"));
  return bits.join(" · ");
}

function GameOver({ party, isHost, act, busy, name }: { party: ReplyAllView; isHost: boolean; act: Act; busy: boolean; name: Name }) {
  const t = useT();
  const ranked = [...party.seats].sort((a, b) => b.score - a.score);
  return (
    <>
      <div className="rounded-3xl border border-sky-400/40 bg-sky-400/10 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">{t("replyall.over.title")}</p>
        <p className="mt-2 text-3xl font-black">{winnerLine(t, party.champions, name)}</p>
        <p className="mt-1 text-sky-100/80">{t("replyall.over.wins", { tie: String(party.champions.length > 1), n: ranked[0]?.score ?? 0 })}</p>
      </div>
      <Section title={t("replyall.over.final")}>
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
            {t("party.playAgain")}
          </PrimaryButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => void act({ type: "end" })}
            className="min-h-12 rounded-xl border border-slate-700 font-semibold active:bg-slate-800 disabled:opacity-50"
          >
            {t("party.backToLobby")}
          </button>
        </div>
      ) : (
        <Banner>{t("party.waitingAnother", { name: name(party.hostId) })}</Banner>
      )}
    </>
  );
}

// ---------- always there ----------

function Scoreboard({ party, people, meId }: { party: ReplyAllView; people: Map<string, PlayerPublic>; meId: string }) {
  const t = useT();
  const showDone = party.phase === "pick" || party.phase === "vote";
  return (
    <Section title={t("replyall.score.title", { n: party.settings.target })}>
      <ul className="grid grid-cols-2 gap-2">
        {party.seats.map((s) => {
          const p = people.get(s.id);
          return (
            <li key={s.id} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm">
              <Dot p={p} />
              <span className="min-w-0 flex-1 truncate">
                {p?.displayName ?? t("party.someone")}
                {s.id === meId && <span className="text-slate-400"> {t("party.you")}</span>}
              </span>
              {s.isManager && <span className="rounded-full border border-sky-300/50 px-1.5 text-11px text-sky-300">{t("replyall.score.manager")}</span>}
              {showDone && !s.isManager && (
                <span aria-label={t(s.skipped ? "replyall.score.skipped" : s.done ? "replyall.score.done" : "replyall.score.waiting")}>{s.skipped ? "↻" : s.done ? "✓" : "…"}</span>
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
  const t = useT();
  const past = party.history.filter((h) => party.phase !== "result" || h.round !== party.round).slice().reverse();
  if (!past.length) return null;
  return (
    <Section title={t("replyall.history.title")}>
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
                {t("replyall.history.line", { n: h.round, winners: winnerLine(t, h.winners, name) })}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function HostBar({ party, act, busy }: { party: ReplyAllView; act: Act; busy: boolean }) {
  const t = useT();
  const skipLabel: Partial<Record<ReplyAllView["phase"], string>> = {
    pick: t("replyall.skip.pick"),
    judge: t("replyall.skip.judge"),
    vote: t("replyall.skip.vote"),
    result: t("replyall.skip.result"),
  };
  const btn =
    "min-h-11 rounded-lg border border-slate-700 px-3 text-sm font-semibold transition-transform duration-75 enabled:active:scale-[0.97] enabled:active:bg-slate-800 disabled:opacity-50";
  return (
    <section aria-label={t("party.hostBar.title")} className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-700 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t("party.hostBar.title")}</p>
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
