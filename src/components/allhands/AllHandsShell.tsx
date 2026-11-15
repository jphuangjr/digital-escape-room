"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { QrCode } from "@/components/site/QrCode";
import { AllHandsChat } from "./AllHandsChat";
import { TestBar } from "./TestBar";
import { RulesButton } from "./RulesSheet";
import { nightLines } from "@/lib/allhands/recap";
import { LineupPanel, tableLineup } from "./LineupPanel";
import { lineupIssues, swapRole } from "@/lib/allhands/lineup";
import { chatterLines, type Chatter } from "@/lib/allhands/chatter";
import { localPoll, localTitle } from "@/lib/allhands/content";
import { PackContext, useLoadedPack, usePack } from "./contentPack";
import { FirstGameTip, HowToPlayTour } from "./HowToPlayTour";
import { FormattedMessage } from "react-intl";
import { useT } from "@/i18n/client";
import { OPEN_TOUR_EVENT, markFirstGameDone, openTour, tipFor, tipsWanted, tourSeen } from "@/lib/allhands/tutorial";
import {
  DAY_OPTIONS_MS,
  SKIP,
  isMoleRole,
  type AllHandsView,
  type HistoryEntry,
  type NightKind,
  type PollResult,
  type Role,
  type DawnView,
  type SeatView,
} from "@/lib/allhands/types";

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

type T = ReturnType<typeof useT>;

/** Names joined for a sentence: "A", "A and B", "A and B and C". */
const joinNames = (t: T, names: string[]) => (names.length ? names.reduce((a, b) => t("party.and", { a, b })) : "");

/** "@channel" highlighted inside a translated sentence. */
const atChannel = (chunks: React.ReactNode) => (
  <span key="at" className="text-sky-300">
    {chunks}
  </span>
);

/** All Hands: one screen per phase, each phone showing only what its player may know. */
export function AllHandsShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const t = useT();
  const pack = useLoadedPack();
  const people = useMemo(() => new Map(state.players.map((p) => [p.id, p])), [state.players]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // In an admin's test room the views are through the eyes of the bot they picked.
  const meId = state.partyTest?.viewingAs ?? state.me.id;

  // A tap shows at once: the screen is patched with what the tap will do, then replaced by the server's answer,
  // then by the next full state. A new state from the server always wins, unless a tap is still on its way.
  const [local, setLocal] = useState<AllHandsView | null>(null);
  const inFlight = useRef(0);
  useEffect(() => {
    if (inFlight.current === 0) setLocal(null);
  }, [state]);
  const party = local ?? (state.party as AllHandsView);
  const partyRef = useRef(party);
  partyRef.current = party;
  const playersRef = useRef(state.players.length);
  playersRef.current = state.players.length;

  const act: Act = useCallback(
    async (body) => {
      const tick = body.type === "tick";
      if (!tick) {
        setErr(null);
        setLocal(optimistic(partyRef.current, body, meId, playersRef.current));
      }
      inFlight.current++;
      setBusy(true);
      const res = await apiFetch<{ error?: string; party?: AllHandsView }>(code, "/party", { body });
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
  // When the clock runs out, nudge the server: phases have no timer there and move on when asked.
  const ticked = useRef<string | null>(null);
  useEffect(() => {
    if (!party.endsAt || left === null || left > 0 || ticked.current === party.endsAt) return;
    ticked.current = party.endsAt;
    void act({ type: "tick" });
  }, [left, party.endsAt, act]);

  // The last five seconds of any timer: a buzz each second where the phone supports it (Android browsers; iPhones
  // don't), plus a pulsing edge on every phone. Every phone does the same thing, so it gives nothing away.
  const finalSecond = !party.paused && left !== null && left > 0 && left <= 5_000 ? Math.ceil(left / 1000) : null;
  const buzzed = useRef<string | null>(null);
  useEffect(() => {
    if (finalSecond === null || !party.endsAt) return;
    const key = `${party.endsAt}:${finalSecond}`;
    if (buzzed.current === key) return;
    buzzed.current = key;
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator && document.visibilityState === "visible") {
        navigator.vibrate(finalSecond === 1 ? 250 : 80);
      }
    } catch {}
  }, [finalSecond, party.endsAt]);

  // First-time help: the tour opens by itself the first time this phone reaches a lobby, and tips run through the first game.
  const [tourOpen, setTourOpen] = useState(false);
  const [tipsOn, setTipsOn] = useState(false);
  const [closedTips, setClosedTips] = useState<string[]>([]);
  useEffect(() => {
    setTipsOn(tipsWanted());
    if (!tourSeen() && partyRef.current.phase === "lobby") setTourOpen(true);
    const open = () => setTourOpen(true);
    window.addEventListener(OPEN_TOUR_EVENT, open);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, open);
  }, []);
  useEffect(() => {
    if (party.phase === "over" && party.me.seated) markFirstGameDone();
  }, [party.phase, party.me.seated]);
  const tip = tipsOn ? tipFor(party) : null;

  const isHost = state.me.id === party.hostId;
  const name = (id: string | null | undefined) => (id ? (people.get(id)?.displayName ?? t("party.someone")) : t("party.nobody"));

  return (
    <PackContext.Provider value={pack}>
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header
        className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-edge backdrop-blur"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
      >
        {busy && <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-lime-300" />}
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="truncate whitespace-nowrap text-11px font-semibold uppercase tracking-[0.2em] text-lime-300">All Hands · {code}</p>
            <p className="truncate text-lg font-bold">
              {t(`allhands.phase.${party.phase}`)}
              {party.round > 0 && party.phase !== "over" && <span className="ml-2 text-sm font-normal text-slate-400">{t("allhands.round", { n: party.round })}</span>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <RulesButton players={party.seats.length || state.players.length} settings={party.settings} lineup={party.lineup} seats={party.phase === "lobby" ? [] : party.seats} />
            <TourButton />
            <Clock left={left} paused={party.paused} remainingMs={party.remainingMs} />
          </div>
        </div>
      </header>

      {finalSecond !== null && (
        // A flash on each of the last five seconds, for phones that can't vibrate. Keyed so it restarts every second.
        <div key={finalSecond} aria-hidden className="ah-final-flash pointer-events-none fixed inset-0 z-50 rounded-[inherit] ring-[6px] ring-inset ring-rose-400" />
      )}
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-edge pb-24 pt-5">
        {state.partyTest && <TestBar code={code} test={state.partyTest} party={party} refresh={refresh} meId={state.me.id} />}
        {party.me.seated && !party.me.alive && party.phase !== "over" && <LinkedInBanner />}
        {!party.me.seated && party.phase !== "lobby" && party.phase !== "over" && (
          <Banner>{t("allhands.late")}</Banner>
        )}
        {err && (
          <p role="alert" className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {err}
          </p>
        )}

        {tip && !closedTips.includes(tip.id) && (
          <FirstGameTip
            tip={tip}
            onClose={() => (tipsWanted() ? setClosedTips((c) => [...c, tip.id]) : setTipsOn(false))}
            onTour={openTour}
          />
        )}

        {party.phase === "lobby" && <Lobby code={code} state={state} party={party} isHost={isHost} act={act} busy={busy} name={name} />}
        {party.phase === "reveal" && <Onboarding party={party} meId={meId} act={act} busy={busy} name={name} left={left} />}
        {party.phase === "night" && <AfterHours party={party} act={act} name={name} people={people} />}
        {(party.phase === "dawn" || party.phase === "day") && <Morning party={party} name={name} people={people} />}
        {party.phase === "vote" && <Review party={party} act={act} name={name} people={people} me={meId} />}
        {party.phase === "exit" && <ExitInterview party={party} name={name} />}
        {party.phase === "over" && <GameOver party={party} isHost={isHost} act={act} busy={busy} name={name} people={people} meId={meId} />}

        {party.me.seated && party.phase !== "lobby" && party.phase !== "over" && party.phase !== "reveal" && (
          <BadgeCard party={party} meId={meId} name={name} compact />
        )}
        {isHost && party.phase !== "lobby" && party.phase !== "over" && <HostBar party={party} act={act} busy={busy} />}
        {party.phase !== "lobby" && <History history={party.history} name={name} />}
      </main>
      <AllHandsChat code={code} state={state} party={party} refresh={refresh} people={people} meId={meId} />
      {tourOpen && <HowToPlayTour onClose={() => setTourOpen(false)} />}
    </div>
    </PackContext.Provider>
  );
}

/** What a tap will do to this phone's screen, shown before the server answers. */
function optimistic(p: AllHandsView, body: Record<string, unknown>, meId: string, players: number): AllHandsView {
  const target = typeof body.target === "string" ? body.target : null;
  switch (body.type) {
    case "ready":
      return { ...p, me: { ...p.me, ready: true }, seats: p.seats.map((x) => (x.id === meId ? { ...x, ready: true } : x)) };
    case "pick":
      if (!p.night || !target) return p;
      return {
        ...p,
        night: {
          ...p.night,
          myPick: target,
          offer: body.offer ? target : p.night.canOffer ? null : p.night.offer,
          acted: p.night.myPick ? p.night.acted : p.night.acted + 1,
          team: p.night.team?.map((m) => (m.id === meId ? { ...m, pick: target } : m)) ?? null,
        },
      };
    case "vote": {
      if (!p.vote || !target) return p;
      const tally: Record<string, string[]> = {};
      for (const [k, ids] of Object.entries(p.vote.tally)) tally[k] = ids.filter((id) => id !== meId);
      (tally[target] ??= []).push(meId);
      return { ...p, vote: { ...p.vote, tally, myVote: target, voted: p.vote.myVote ? p.vote.voted : p.vote.voted + 1 } };
    }
    case "lineup": {
      if (body.reset) return { ...p, lineup: null };
      const r = swapRole(tableLineup(p, players), body.from as Role, body.to as Role);
      return r.ok ? { ...p, lineup: r.lineup } : p;
    }
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
      className={`rounded-full border px-3 py-1 font-mono text-lg tabular-nums ${left < 10_000 ? "border-rose-400/60 text-rose-300" : "border-slate-700 text-slate-200"}`}
      aria-label={t("party.clock.left", { n: Math.ceil(left / 1000) })}
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
  const t = useT();
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_TONE[role]}`}>{t(`allhands.role.${role}.name`)}</span>;
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
      className="min-h-12 w-full rounded-xl bg-lime-300 px-4 font-bold text-slate-950 transition-transform duration-75 enabled:active:scale-[0.98] active:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function LinkedInBanner() {
  const t = useT();
  return (
    <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4">
      <p className="font-bold text-sky-200">{t("allhands.out.title")}</p>
      <p className="mt-1 text-sm text-sky-100/80">{t("allhands.out.body")}</p>
    </div>
  );
}

/** Your employee badge: hold to read it, so a neighbour can't glance at it. */
function BadgeCard({ party, meId, name, compact = false }: { party: AllHandsView; meId: string; name: Name; compact?: boolean }) {
  const t = useT();
  const pack = usePack();
  const [shown, setShown] = useState(false);
  const role = party.me.role;
  if (!role) return null;
  const fellowMoles = isMoleRole(role) ? party.seats.filter((x) => isMoleRole(x.role) && x.id !== meId) : [];
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
      aria-label={t("allhands.badge.hold")}
      className={`relative w-full select-none overflow-hidden rounded-3xl border text-left transition [-webkit-touch-callout:none] ${
        shown ? ROLE_TONE[role] : "border-slate-700 bg-slate-900"
      } ${compact ? "p-4" : "p-6"}`}
    >
      {shown ? (
        <div>
          <p className="text-11px font-semibold uppercase tracking-[0.25em] opacity-80">{t("allhands.badge.company", { title: localTitle(pack, party.me.title ?? "") })}</p>
          <p className={`${compact ? "text-2xl" : "text-4xl"} mt-1 font-black`}>{t(`allhands.role.${role}.name`)}</p>
          {!compact && <p className="mt-3 text-slate-200">{t(`allhands.role.${role}.blurb`)}</p>}
          <p className="mt-2 text-sm text-slate-300">{t(`allhands.role.${role}.power`)}</p>
          {party.me.recruited && <p className="mt-3 text-sm text-rose-200">{t("allhands.badge.recruited")}</p>}
          {fellowMoles.length > 0 && (
            <p className="mt-3 text-sm text-rose-200">
              {t("allhands.badge.fellowMoles", {
                names: joinNames(
                  t,
                  fellowMoles.map((x) => (x.role === "recruiter" ? t("allhands.badge.recruiterTag", { name: name(x.id) }) : name(x.id))),
                ),
              })}
            </p>
          )}
          {isMoleRole(role) && fellowMoles.length === 0 && <p className="mt-3 text-sm text-rose-200">{t("allhands.badge.onlyMole")}</p>}
          {role === "intern" && (
            <p className="mt-3 text-sm text-teal-200">
              {party.me.mentor ? t("allhands.badge.mentor", { name: name(party.me.mentor) }) : t("allhands.badge.pickMentor")}
            </p>
          )}
          {role === "nephew" && party.history.some((h) => h.kind === "spared" && h.playerId === meId) && (
            <p className="mt-3 text-sm text-orange-200">{t("allhands.badge.spared")}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-2xl">🪪</span>
          <div>
            <p className="font-bold">{compact ? t("allhands.badge.yours") : t("allhands.badge.hold")}</p>
            <p className="text-sm text-slate-400">{t("allhands.badge.press")}</p>
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
  const t = useT();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}/r/${code}`;
  const count = state.players.length;
  const need = Math.max(0, party.minPlayers - count);
  const blocked = lineupIssues(tableLineup(party, count)).some((x) => x.level === "block");
  return (
    <>
      <Link href="/party" className="-my-2 inline-flex min-h-11 items-center self-start text-sm text-slate-400 active:text-slate-200">
        {t("party.back")}
      </Link>
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t("party.roomCode")}</p>
        <p className="font-mono text-5xl font-black tracking-widest text-lime-300">{code}</p>
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

      <Section title={t("allhands.lobby.team", { n: count })}>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <Dot p={p} size="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {p.displayName}
                {p.id === state.me.id && <span className="ml-1 font-normal text-slate-400">{t("party.you")}</span>}
              </span>
              {p.id === party.hostId && <span className="text-xs text-lime-300">{t("party.hostTag")}</span>}
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

      <LineupPanel party={party} players={count} act={act} />

      {isHost ? (
        <>
          <Section title={t("party.houseRules")}>
            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3">
              <span>
                <span className="block font-semibold">{t("allhands.lobby.reveal")}</span>
                <span className="block text-xs text-slate-400">{t("allhands.lobby.revealNote")}</span>
              </span>
              <input
                type="checkbox"
                checked={party.settings.revealOnFire}
                onChange={(e) => void act({ type: "settings", settings: { revealOnFire: e.target.checked } })}
                className="h-6 w-6 shrink-0 accent-lime-300"
              />
            </label>
            <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span className="font-semibold">{t("allhands.lobby.dayLength")}</span>
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
                    {t("allhands.lobby.minutes", { n: ms / 60_000 })}
                  </button>
                ))}
              </div>
            </div>
          </Section>
          <PrimaryButton disabled={busy || need > 0 || blocked} onClick={() => void act({ type: "start" })}>
            {need > 0 ? t("party.waitingForPlayers", { n: need }) : blocked ? t("allhands.lobby.fixLineup") : t("allhands.lobby.start")}
          </PrimaryButton>
        </>
      ) : (
        <Banner>{t("allhands.lobby.waiting", { name: name(party.hostId) })}</Banner>
      )}
      <HowToPlay />
    </>
  );
}

function HowToPlay() {
  const t = useT();
  return (
    <button
      type="button"
      onClick={openTour}
      className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 text-left active:bg-slate-800"
    >
      <span aria-hidden className="text-2xl">🎓</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{t("allhands.lobby.newTitle")}</span>
        <span className="block text-sm text-slate-400">{t("allhands.lobby.newBody")}</span>
      </span>
      <span aria-hidden className="text-slate-500">›</span>
    </button>
  );
}

/** Replays the how-to-play tour from the top bar. */
function TourButton() {
  const t = useT();
  return (
    <button
      type="button"
      onClick={openTour}
      aria-label={t("allhands.tour.button")}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-sm font-bold text-slate-200 transition-transform duration-75 active:scale-95 active:bg-slate-800"
    >
      ?
    </button>
  );
}

// ---------- onboarding ----------

function Onboarding({
  party,
  meId,
  act,
  busy,
  name,
  left,
}: {
  party: AllHandsView;
  meId: string;
  act: Act;
  busy: boolean;
  name: Name;
  left: number | null;
}) {
  const t = useT();
  const ready = party.seats.filter((x) => x.ready).length;
  const waiting = party.seats.filter((x) => !x.ready).map((x) => name(x.id));
  const allReady = party.seats.length > 0 && waiting.length === 0;
  if (allReady && !party.paused) {
    const secs = left === null ? null : Math.ceil(left / 1000);
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-lime-300/40 bg-lime-300/10 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-lime-300">{t("allhands.reveal.allRead")}</p>
        <p className="text-7xl font-black tabular-nums" aria-live="polite">
          {secs ?? "…"}
        </p>
        <p className="text-slate-200">{t("allhands.reveal.startsIn", { n: secs ?? 10 })}</p>
      </div>
    );
  }
  return (
    <>
      <div>
        <h1 className="text-3xl font-black">{t("allhands.reveal.welcome")}</h1>
        <p className="mt-1 text-slate-300">{t("allhands.reveal.yourBadge")}</p>
      </div>
      {party.me.seated ? <BadgeCard party={party} meId={meId} name={name} /> : <Banner>{t("allhands.reveal.teamReading")}</Banner>}
      {party.me.seated && (
        <PrimaryButton disabled={busy || party.me.ready} onClick={() => void act({ type: "ready" })}>
          {party.me.ready ? t("allhands.reveal.readyWaiting") : t("allhands.reveal.ready")}
        </PrimaryButton>
      )}
      <p className="text-sm text-slate-400">
        {waiting.length > 0 && waiting.length <= 4
          ? t("allhands.reveal.countWaiting", { ready, total: party.seats.length, names: joinNames(t, waiting) })
          : t("allhands.reveal.count", { ready, total: party.seats.length })}
      </p>
    </>
  );
}

// ---------- after hours ----------

/** Who posted tonight's #random poll (the decoy question), one per round: allhands.night.author.<n>. */
const POLL_AUTHORS = 6;

/** What each kind of after-hours screen says: allhands.night.<kind>.title/body (a decoy's title is its poll question). */
const nightCopy = (t: T, kind: NightKind) => ({ title: kind === "decoy" ? "" : t(`allhands.night.${kind}.title`), body: t(`allhands.night.${kind}.body`) });

function AfterHours({
  party,
  act,
  name,
  people,
}: {
  party: AllHandsView;
  act: Act;
  name: Name;
  people: Map<string, PlayerPublic>;
}) {
  const t = useT();
  const pack = usePack();
  const n = party.night;
  const [offerMode, setOfferMode] = useState(Boolean(n?.offer && n.canOffer));
  if (!n) {
    return (
      <>
        <h1 className="text-3xl font-black">{t("allhands.night.title")}</h1>
        <Banner>{t("allhands.night.dark")}</Banner>
        {party.nights && <NightLog nights={party.nights} name={name} live />}
      </>
    );
  }
  const solo = n.kind === "mole" && (n.team?.length ?? 0) <= 1;
  const offering = n.canOffer && offerMode;
  const copy = offering
    ? { title: t("allhands.night.offer.title"), body: t("allhands.night.offer.body") }
    : solo
      ? { ...nightCopy(t, "mole"), body: t("allhands.night.mole.solo") }
      : nightCopy(t, n.kind);
  const targets = offering ? n.offerTargets : n.targets;
  return (
    <>
      <div>
        {n.kind === "decoy" && (
          <p className="mb-2 flex items-center gap-2 text-sm text-slate-400">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">#random</span>
            <span aria-hidden>📊</span> {t("allhands.night.pollFrom", { who: t(`allhands.night.author.${(party.round - 1 + POLL_AUTHORS) % POLL_AUTHORS}`) })}
          </p>
        )}
        <h1 className="text-3xl font-black">{n.kind === "decoy" ? localPoll(pack, n.prompt ?? "") : copy.title}</h1>
        <p className="mt-1 text-slate-300">{n.kind === "decoy" && n.myPick ? t("allhands.night.thanks") : copy.body}</p>
        <p className="mt-2 text-xs text-slate-500">{t("allhands.night.headsDown")}</p>
      </div>
      {n.canOffer && (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-900 p-1" role="group" aria-label={t("allhands.night.move")}>
          {[
            { on: false, label: t("allhands.night.layOff") },
            { on: true, label: t("allhands.night.makeOffer") },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={offerMode === o.on}
              onClick={() => setOfferMode(o.on)}
              className={`min-h-11 rounded-lg text-sm font-semibold ${offerMode === o.on ? (o.on ? "bg-fuchsia-500/25 text-fuchsia-100" : "bg-slate-700") : "text-slate-400"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      {n.kind === "mole" && !n.canOffer && n.offer && (
        <p className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-100">
          {t("allhands.night.offerTonight", { name: name(n.offer) })}
        </p>
      )}
      <ul className="grid grid-cols-2 gap-2">
        {party.seats
          .filter((x) => x.alive && targets.includes(x.id))
          .map((x) => {
            const picked = offering ? n.offer === x.id : n.myPick === x.id && !(n.canOffer && n.offer);
            const teammates = n.team?.filter((m) => m.pick === x.id) ?? [];
            return (
              <li key={x.id}>
                <button
                  type="button"
                  aria-pressed={picked}
                  onClick={() => void act(offering ? { type: "pick", target: x.id, offer: true } : { type: "pick", target: x.id })}
                  className={`flex min-h-16 w-full flex-col items-start justify-center gap-1 rounded-2xl border px-3 py-2 text-left transition-transform duration-75 active:scale-[0.97] ${
                    picked ? "border-lime-300 bg-lime-300/10" : "border-slate-800 bg-slate-900 active:bg-slate-800"
                  }`}
                >
                  <span className="flex w-full items-center gap-2 font-semibold">
                    <Dot p={people.get(x.id)} />
                    <span className="truncate">{name(x.id)}</span>
                    {x.id === party.me.mentor && <MentorTag />}
                    {x.role === "nephew" && <RoleChip role="nephew" />}
                  </span>
                  <span className="text-xs text-slate-400">{localTitle(pack, x.title)}</span>
                  {teammates.length > 0 && (
                    <span className="text-xs text-rose-300">{t("allhands.night.pickedBy", { names: joinNames(t, teammates.map((m) => name(m.id))) })}</span>
                  )}
                </button>
              </li>
            );
          })}
      </ul>
      {n.kind === "hr" && n.lastProtected && <p className="text-xs text-slate-500">{t("allhands.night.coveredLast", { name: name(n.lastProtected) })}</p>}
      {n.kind === "mole" && n.team && n.team.length > 1 && new Set(n.team.map((m) => m.pick)).size > 1 && (
        <p className="text-sm text-rose-300">{t("allhands.night.split")}</p>
      )}
      <p className="text-sm text-slate-400">
        {t("allhands.night.acted", { acted: n.acted, total: n.total })}
      </p>
      {party.checks.length > 0 && <Checks party={party} name={name} />}
    </>
  );
}

function Checks({ party, name }: { party: AllHandsView; name: Name }) {
  const t = useT();
  return (
    <Section title={t("allhands.checks.title")}>
      <ul className="flex flex-col gap-1 text-sm">
        {party.checks.map((c) => (
          <li key={c.round} className="flex justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
            <span>{t("allhands.checks.night", { n: c.round, name: name(c.target) })}</span>
            <span className={c.isMole ? "font-bold text-rose-300" : "text-lime-300"}>{c.isMole ? t("allhands.checks.mole") : t("allhands.checks.notMole")}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ---------- morning and all-hands ----------

function SlackPost({ children, channel = "#general" }: { children: React.ReactNode; channel?: string }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-lime-300 text-lg font-black text-slate-950">S</span>
        <div>
          <p className="text-sm font-bold">
            {t("allhands.slack.bot")} <span className="ml-1 rounded bg-slate-800 px-1 text-11px font-normal text-slate-400">{t("allhands.slack.app")}</span>
          </p>
          <p className="text-xs text-slate-500">{channel}</p>
        </div>
      </div>
      <div className="mt-3 text-slate-200">{children}</div>
    </div>
  );
}

/** A private DM about last night's offer: a hire goes to every other Mole, a turned-down or blocked offer to the Recruiter only. */
function OfferDm({ offer, name }: { offer: NonNullable<DawnView["offer"]>; name: Name }) {
  const t = useT();
  const who = name(offer.target);
  const hired = offer.result === "hired";
  return (
    <div className="rounded-2xl border border-fuchsia-400/50 bg-fuchsia-400/10 p-4">
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-fuchsia-400 text-lg text-slate-950">💼</span>
        <div>
          <p className="text-sm font-bold">{t("allhands.dm.recruiting")}</p>
          <p className="text-xs text-fuchsia-200/70">{t("allhands.dm.private", { moles: String(hired) })}</p>
        </div>
      </div>
      <p className="mt-3 text-fuchsia-50">
        {t(hired ? "allhands.dm.hired" : offer.result === "blocked" ? "allhands.dm.blocked" : "allhands.dm.refused", { name: who })}
      </p>
    </div>
  );
}

/** A private DM to the IT Guy or HR Rep who turned the Recruiter down: now they know who the Recruiter is. */
function ApproachedDm({ recruiter }: { recruiter: string }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-fuchsia-400/50 bg-fuchsia-400/10 p-4">
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-fuchsia-400 text-lg text-slate-950">💼</span>
        <div>
          <p className="text-sm font-bold">{recruiter}</p>
          <p className="text-xs text-fuchsia-200/70">{t("allhands.dm.private", { moles: "false" })}</p>
        </div>
      </div>
      <p className="mt-3 text-fuchsia-50">{t("allhands.dm.approached", { name: recruiter })}</p>
    </div>
  );
}

/** Anonymous coworkers gossiping in a Slack thread under an announcement. */
function ChatterThread({ chatter, who }: { chatter: Chatter; who: string }) {
  const t = useT();
  const pack = usePack();
  const lines = chatterLines(chatter, who, pack);
  if (!lines) return null;
  return (
    <div className="mt-3 border-l-2 border-slate-700 pl-3">
      <p className="text-xs font-semibold text-sky-300">{t("allhands.chatter.replies", { n: lines.length })}</p>
      <ul className="mt-1 flex flex-col gap-2">
        {lines.map((l, k) => (
          <li key={k} className="text-sm">
            <span className="block text-xs font-bold text-slate-400">{l.who}</span>
            <span className="text-slate-200">{l.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Morning({ party, name, people }: { party: AllHandsView; name: Name; people: Map<string, PlayerPublic> }) {
  const t = useT();
  const d = party.dawn;
  const laidOffSeat = d?.laidOff ? party.seats.find((x) => x.id === d.laidOff) : undefined;
  const alive = party.seats.filter((x) => x.alive);
  return (
    <>
      {d?.recruited && (
        <div className="rounded-2xl border border-rose-400/60 bg-rose-400/10 p-4">
          <p className="font-bold text-rose-200">{t("allhands.morning.recruitedTitle")}</p>
          <p className="mt-1 text-sm text-rose-100/80">{t("allhands.morning.recruitedBody")}</p>
        </div>
      )}
      {d?.offer && <OfferDm offer={d.offer} name={name} />}
      {d?.approachedBy && <ApproachedDm recruiter={name(d.approachedBy)} />}
      {d?.poll && <PollResults poll={d.poll} name={name} people={people} />}
      {d && (
        <SlackPost>
          {d.laidOff ? (
            <>
              <p>
                <FormattedMessage id="allhands.morning.laidOff" values={{ name: name(d.laidOff), at: atChannel }} />
              </p>
              {laidOffSeat?.role && (
                <p className="mt-2 text-sm text-slate-400">{t("allhands.morning.badgeSaid", { role: t(`allhands.role.${laidOffSeat.role}.name`) })}</p>
              )}
              {d.chatter && <ChatterThread chatter={d.chatter} who={name(d.laidOff)} />}
            </>
          ) : d.saved ? (
            <p>{t("allhands.morning.saved")}</p>
          ) : (
            <p>{t("allhands.morning.quiet")}</p>
          )}
        </SlackPost>
      )}
      {party.phase === "day" && (
        <>
          <div>
            <h1 className="text-3xl font-black">{t("allhands.day.title")}</h1>
            <p className="mt-1 text-slate-300">{t("allhands.day.body")}</p>
          </div>
          {party.checks.length > 0 && <Checks party={party} name={name} />}
          <Section title={t("allhands.day.employed", { n: alive.length })}>
            <Roster seats={alive} name={name} people={people} mentor={party.me.mentor} />
          </Section>
        </>
      )}
    </>
  );
}

/** Last night's #random poll. Just the winner, never a vote count: the poll's size would hint at how many have powers. */
function PollResults({ poll, name, people }: { poll: PollResult; name: Name; people: Map<string, PlayerPublic> }) {
  const t = useT();
  const pack = usePack();
  const tie = poll.winners.length > 1;
  const list = joinNames(t, poll.winners.map(name));
  return (
    <SlackPost channel="#random">
      <p className="text-sm text-slate-400">{t("allhands.poll.in")}</p>
      <p className="mt-1 font-semibold">{localPoll(pack, poll.prompt)}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {poll.winners.map((id) => (
          <li key={id} className="flex items-center gap-2 rounded-full border border-lime-300/40 bg-lime-300/10 px-3 py-1.5 font-semibold">
            <span aria-hidden>🏆</span>
            <Dot p={people.get(id)} />
            {name(id)}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-slate-300">
        {t(tie ? "allhands.poll.tie" : "allhands.poll.win", { names: list })}
      </p>
    </SlackPost>
  );
}

/** The IT Guy's own read on someone: `party.checks` is only ever filled on the IT Guy's phone (and at game over). */
function CheckTag({ party, id }: { party: AllHandsView; id: string }) {
  const t = useT();
  const c = [...party.checks].reverse().find((x) => x.target === id);
  if (!c || party.phase === "over") return null;
  return c.isMole ? (
    <span className="shrink-0 rounded-full border border-rose-400/60 px-1.5 py-0.5 text-[11px] font-semibold text-rose-300">{t("allhands.tag.mole")}</span>
  ) : (
    <span className="shrink-0 rounded-full border border-sky-300/50 px-1.5 py-0.5 text-[11px] font-semibold text-sky-200">{t("allhands.tag.notMole")}</span>
  );
}

/** Marks the Intern's mentor on the Intern's own phone. `me.mentor` is only ever set for the Intern, so nobody else sees it. */
function MentorTag() {
  const t = useT();
  return (
    <span className="shrink-0 rounded-full border border-teal-300/50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-200">{t("allhands.tag.mentor")}</span>
  );
}

/** A fellow Mole's badge. The server only sends Mole-side roles of living players to other Moles, so nobody else sees it. */
function FellowMoleTag({ seat, me }: { seat: SeatView; me: string }) {
  return seat.id !== me && isMoleRole(seat.role) ? <RoleChip role={seat.role!} /> : null;
}

function Roster({
  seats,
  name,
  people,
  showRoles = false,
  mentor = null,
}: {
  seats: SeatView[];
  name: Name;
  people: Map<string, PlayerPublic>;
  showRoles?: boolean;
  mentor?: string | null;
}) {
  const pack = usePack();
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
            <span className="block text-xs text-slate-400">{localTitle(pack, x.title)}</span>
          </span>
          {x.id === mentor && <MentorTag />}
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
  name,
  people,
  me,
}: {
  party: AllHandsView;
  act: Act;
  name: Name;
  people: Map<string, PlayerPublic>;
  me: string;
}) {
  const t = useT();
  const pack = usePack();
  const v = party.vote!;
  const alive = party.seats.filter((x) => x.alive);
  const option = (id: string, label: React.ReactNode, sub: string | null) => {
    const voters = v.tally[id] ?? [];
    const mine = v.myVote === id;
    return (
      <li key={id}>
        <button
          type="button"
          disabled={!v.canVote || id === me}
          aria-pressed={mine}
          onClick={() => void act({ type: "vote", target: id })}
          className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-transform duration-75 enabled:active:scale-[0.97] disabled:cursor-default ${
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
        <h1 className="text-3xl font-black">{t("allhands.vote.title")}</h1>
        <p className="mt-1 text-slate-300">{v.canVote ? t("allhands.vote.body") : t("allhands.vote.watching")}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {alive.map((x) =>
          option(
            x.id,
            <span className="flex items-center gap-2">
              <Dot p={people.get(x.id)} />
              {name(x.id)}
              {x.id === me && <span className="font-normal text-slate-400">{t("party.you")}</span>}
              {x.id === party.me.mentor && <MentorTag />}
              <FellowMoleTag seat={x} me={me} />
              {x.role === "nephew" && <RoleChip role="nephew" />}
              <CheckTag party={party} id={x.id} />
            </span>,
            localTitle(pack, x.title),
          ),
        )}
        {option(SKIP, t("allhands.vote.skip"), t("allhands.vote.skipNote"))}
      </ul>
      {party.checks.length > 0 && <Checks party={party} name={name} />}
      <p className="text-sm text-slate-400">
        {t("allhands.vote.count", { voted: v.voted, total: v.total })}
      </p>
    </>
  );
}

// ---------- exit interview and game over ----------

function ExitInterview({ party, name }: { party: AllHandsView; name: Name }) {
  const t = useT();
  const e = party.exit;
  if (!e) return null;
  return (
    <>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center">
      {e.fired && e.survived ? (
        <>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t("allhands.exit.votedOut", { n: e.votes })}</p>
          <p className="text-4xl font-black">{name(e.fired)}</p>
          <p className="text-lg">
            <FormattedMessage id="allhands.exit.isThe" values={{ role: <RoleChip key="role" role="nephew" /> }} />
          </p>
          <p className="text-slate-400">{t("allhands.exit.nephew")}</p>
        </>
      ) : e.fired ? (
        <>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t("allhands.exit.fired", { n: e.votes })}</p>
          <p className="text-4xl font-black">{name(e.fired)}</p>
          {e.role ? (
            <p className="text-lg">
              <FormattedMessage id="allhands.exit.wasThe" values={{ role: <RoleChip key="role" role={e.role} /> }} />
            </p>
          ) : (
            <p className="text-slate-400">{t("allhands.exit.shredder")}</p>
          )}
        </>
      ) : (
        <>
          <p className="text-4xl font-black">{t("allhands.exit.nobody")}</p>
          <p className="text-slate-400">{t("allhands.exit.circled")}</p>
        </>
      )}
      </div>
      {e.fired && e.chatter && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">#random</p>
          <ChatterThread chatter={e.chatter} who={name(e.fired)} />
        </div>
      )}
    </>
  );
}

function GameOver({
  party,
  isHost,
  act,
  busy,
  name,
  people,
  meId,
}: {
  party: AllHandsView;
  isHost: boolean;
  act: Act;
  busy: boolean;
  name: Name;
  people: Map<string, PlayerPublic>;
  meId: string;
}) {
  const t = useT();
  const company = party.winner === "company";
  const burnout = party.winner === "burnout";
  const won = party.me.seated ? party.winners.includes(meId) : null;
  const burntOut = party.seats.find((x) => x.role === "burnout");
  const banner = burnout
    ? { tone: "border-violet-300/50 bg-violet-300/10", kicker: t("allhands.over.burnoutKicker"), title: t("allhands.over.burnoutTitle", { name: name(burntOut?.id) }) }
    : company
      ? { tone: "border-lime-300/50 bg-lime-300/10", kicker: t("allhands.over.companyKicker"), title: t("allhands.over.companyTitle") }
      : { tone: "border-rose-400/60 bg-rose-400/10", kicker: t("allhands.over.molesKicker"), title: t("allhands.over.molesTitle") };
  return (
    <>
      <div className={`rounded-3xl border p-6 text-center ${banner.tone}`}>
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">{banner.kicker}</p>
        <p className="mt-1 text-4xl font-black">{banner.title}</p>
        {burnout && <p className="mt-2 text-slate-300">{t("allhands.over.burnoutNote")}</p>}
        {won !== null && <p className="mt-2 text-slate-200">{won ? t("allhands.over.won") : t("allhands.over.lost")}</p>}
      </div>
      <Section title={t("allhands.over.whoWasWho")}>
        <Roster seats={party.seats} name={name} people={people} showRoles mentor={party.me.mentor} />
      </Section>
      {party.nights && <NightLog nights={party.nights} name={name} />}
      {isHost ? (
        <div className="flex flex-col gap-2">
          <PrimaryButton disabled={busy} onClick={() => void act({ type: "start" })}>
            {t("allhands.over.again")}
          </PrimaryButton>
          <button type="button" disabled={busy} onClick={() => void act({ type: "end" })} className="min-h-11 text-sm text-slate-400 underline">
            {t("allhands.over.lobby")}
          </button>
        </div>
      ) : (
        <Banner>{t("allhands.over.waiting", { name: name(party.hostId) })}</Banner>
      )}
      <Link href="/party" className="text-center text-sm text-slate-500 underline">
        {t("allhands.over.more")}
      </Link>
    </>
  );
}

function NightLog({ nights, name, live = false }: { nights: NonNullable<AllHandsView["nights"]>; name: Name; live?: boolean }) {
  const t = useT();
  if (nights.length === 0) return null;
  return (
    <Section title={live ? t("allhands.nightLog.live") : t("allhands.nightLog.title")}>
      <ol className="flex flex-col gap-2 text-sm">
        {nights.map((n) => (
          <li key={n.round} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
            <p className="font-semibold">{t("allhands.nightLog.night", { n: n.round })}</p>
            {n.offerTarget && (
              <p className="text-fuchsia-200">
                {t("allhands.nightLog.offer", {
                  who: n.recruiter ? t("allhands.recap.who", { names: name(n.recruiter) }) : "",
                  name: name(n.offerTarget),
                  result: n.offerResult ?? "refused",
                })}
              </p>
            )}
            <p className="text-slate-300">{nightLines(n, name, t).join(" ")}</p>
            <p className="text-xs text-slate-500">
              {n.outcome === "laidoff"
                ? t("allhands.nightLog.laidOff", { name: name(n.moleTarget) })
                : n.outcome === "saved"
                  ? t("allhands.nightLog.saved")
                  : t("allhands.nightLog.quiet")}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function History({ history, name }: { history: HistoryEntry[]; name: Name }) {
  const t = useT();
  if (history.length === 0) return null;
  const line = (h: HistoryEntry) => t(`allhands.history.${h.kind}`, { name: name(h.playerId) });
  return (
    <Section title={t("allhands.history.title")}>
      <ol className="flex flex-col gap-1 text-sm text-slate-300">
        {[...history].reverse().map((h, i) => (
          <li key={i} className="flex items-center justify-between gap-2 border-b border-slate-800/70 py-1.5">
            <span>
              <span className="mr-2 text-xs text-slate-500">{t("allhands.round", { n: h.round })}</span>
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
  const t = useT();
  const skipLabel: Partial<Record<AllHandsView["phase"], string>> = {
    reveal: t("allhands.skip.reveal"),
    night: t("allhands.skip.night"),
    dawn: t("allhands.skip.dawn"),
    day: t("allhands.skip.day"),
    vote: t("allhands.skip.vote"),
    exit: t("allhands.skip.exit"),
  };
  return (
    <section aria-label={t("party.hostBar.title")} className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-700 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t("party.hostBar.title")}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void act({ type: "skip", from: party.phase })} className="min-h-11 flex-1 rounded-lg border border-slate-700 px-3 text-sm font-semibold transition-transform duration-75 enabled:active:scale-[0.97] enabled:active:bg-slate-800 disabled:opacity-50">
          {skipLabel[party.phase] ?? t("party.hostBar.skip")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act({ type: party.paused ? "resume" : "pause" })}
          className="min-h-11 rounded-lg border border-slate-700 px-3 text-sm font-semibold transition-transform duration-75 enabled:active:scale-[0.97] enabled:active:bg-slate-800 disabled:opacity-50"
        >
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
