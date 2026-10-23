"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomState } from "@/lib/types";
import type { HotspotId, ItemDTO, ItemId, SceneAction, SceneActionResponse, SceneDTO, Suspect, TrainRoomId, WallId } from "@/lib/train/types";
import { SUIT_SYMBOLS, SUSPECTS, TRAIN_GAME_ID, WALLS_12B, WALLS_DINING } from "@/lib/train/types";
import { apiFetch, GameContext, type GameCtx } from "@/lib/client/game";
import { useChat } from "@/lib/client/chat";
import { RoomSheet, type RoomTab } from "@/components/shell/RoomSheet";
import { Tour, type TourStep } from "@/components/shell/Tour";
import { SolveGlow, useArrivals, useSolveMoments } from "@/components/shell/SolveMoments";
import { Toasts, type ToastItem } from "@/components/shell/Toasts";
import { CloseIcon } from "@/components/shell/icons";
import { useLockPulse, useOpenHold, type LockPulse } from "@/components/shell/lockFeel";
import { useT } from "@/i18n/client";
import { Leaderboard } from "@/components/site/Leaderboard";
import { ResultReveal, type RevealTheme } from "@/components/site/ResultReveal";
import { CorridorArt, WallArt } from "./walls";
import { CloseupDocView, ItemIcon, ItemReading, LockDial } from "./parts";
import { setSoundPreferred, soundPreferred, TrainAmbience } from "./sound";
import { TrainNotebook, useDockedNotes, useSeenClues } from "./notebook";

/**
 * The room screen for The Nightingale Express (staging): one illustrated wall at a time, tap to look
 * closer, a shared inventory tray, padlocks. Everything found or opened is shared with the room.
 * Every player reads the story in their own language (see src/server/train/text).
 */

const PRESENCE_MS = 15_000;
const TABS: RoomTab[] = ["people", "chat", "attempts"];
const TOUR_DONE_KEY = "nx_tour_done_v1";

/** The first-time tour of the train: each step spotlights a real control (its data-tour name). */
const TRAIN_TOUR: TourStep[] = [
  { id: "wall", target: "nx-wall", sheet: null },
  { id: "turn", target: "nx-turn", sheet: null },
  { id: "spots", target: "nx-spots", sheet: null },
  { id: "things", target: "nx-things", sheet: null },
  { id: "teodor", target: "nx-hints", sheet: null },
  { id: "room", target: "nx-room", sheet: null },
  { id: "invite", target: "invite", sheet: "people" },
  { id: "chat", target: "tab-chat", sheet: "people" },
  { id: "attempts", target: "tab-attempts", sheet: "people" },
  { id: "end", sheet: null },
];

export function TrainShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const scene = state.scene as SceneDTO;
  const [place, setPlace] = useState<TrainRoomId>("12b");
  const [wallIdxBy, setWallIdxBy] = useState<Record<"12b" | "dining", number>>({ "12b": 0, dining: 0 });
  const [notesOpen, setNotesOpen] = useState(false);
  // The things tray opens from its tab; a dot on the tab says something new arrived while it was shut.
  const [itemsOpen, setItemsOpenRaw] = useState(false);
  const [newItems, setNewItems] = useState(false);
  const setItemsOpen = (open: boolean) => {
    setItemsOpenRaw(open);
    if (open) setNewItems(false);
  };
  const heldCount = scene.inventory.length;
  const itemCount = useRef<number | null>(null);
  useEffect(() => {
    if (itemCount.current !== null && heldCount > itemCount.current && !itemsOpen) setNewItems(true);
    itemCount.current = heldCount;
  }, [heldCount, itemsOpen]);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [intro, setIntro] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [showSpots, setShowSpots] = useState(false);
  useEffect(() => {
    if (!showSpots) return;
    const id = setTimeout(() => setShowSpots(false), 1800);
    return () => clearTimeout(id);
  }, [showSpots]);
  const [closeup, setCloseup] = useState<HotspotId | null>(null);
  // The notebook: everything this player reads goes into its Clues; it can stay docked beside close-ups.
  const [notesDocked, setNotesDocked] = useDockedNotes();
  const { seen, mark: markSeen } = useSeenClues(code);
  useEffect(() => {
    if (closeup) markSeen(closeup);
  }, [closeup, markSeen]);
  const [itemOpen, setItemOpen] = useState<ItemId | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockPulse, fireLock] = useLockPulse();
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomTab, setRoomTab] = useState<RoomTab>("people");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const chat = useChat(code, state.me.id);
  const t = useT();
  const walls = place === "dining" ? WALLS_DINING : WALLS_12B;
  const wallIdx = place === "dining" ? wallIdxBy.dining : wallIdxBy["12b"];
  const wall: WallId = walls[wallIdx];
  // First time on this device: the premise and how to play.
  useEffect(() => {
    try {
      if (localStorage.getItem("nx_intro_done") !== "1") setIntro(true);
      // Players who saw the intro before the tour existed get the tour once, after a moment.
      else if (localStorage.getItem(TOUR_DONE_KEY) !== "1") window.setTimeout(() => setTourOpen(true), 900);
    } catch {}
  }, []);

  const toast = useCallback<GameCtx["toast"]>((msg, tone = "info", action) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, msg, tone, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 7000 : 3800);
  }, []);

  // ---------- sound ----------
  const ambience = useRef<TrainAmbience | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    setSoundOn(soundPreferred());
    ambience.current = new TrainAmbience();
    // Browsers only allow audio after a gesture: start on the first tap if sound is on.
    const first = () => {
      if (soundPreferred()) ambience.current?.start();
    };
    window.addEventListener("pointerdown", first, { once: true });
    return () => {
      window.removeEventListener("pointerdown", first);
      ambience.current?.stop();
    };
  }, []);
  useEffect(() => ambience.current?.setPlace(place), [place]);
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundPreferred(next);
    if (next) ambience.current?.start();
    else ambience.current?.stop();
  };

  // ---------- presence ----------
  const view = place === "corridor" ? "train:corridor" : `train:${wall}`;
  const roomName = t(place === "dining" ? "train.room.dining" : "train.room.12b");
  // Moving between carriages: the new one's name, briefly.
  const [arrival, setArrival] = useState<string | null>(null);
  const lastPlace = useRef<TrainRoomId | null>(null);
  useEffect(() => {
    if (lastPlace.current && lastPlace.current !== place) {
      setArrival(t(`train.room.${place}`));
      const id = setTimeout(() => setArrival(null), 2600);
      lastPlace.current = place;
      return () => clearTimeout(id);
    }
    lastPlace.current = place;
  }, [place, t]);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
    void apiFetch(code, "/presence", { method: "POST", body: { view } });
  }, [code, view]);
  useEffect(() => {
    const id = setInterval(() => void apiFetch(code, "/presence", { method: "POST", body: { view: viewRef.current } }), PRESENCE_MS);
    return () => clearInterval(id);
  }, [code]);

  // ---------- teammates' finds ----------
  const knownLog = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (knownLog.current) {
      for (const e of scene.log) {
        if (knownLog.current.has(e.id) || e.playerId === state.me.id || e.solve) continue;
        toast(e.text, "success");
      }
    }
    knownLog.current = new Set(scene.log.map((e) => e.id));
  }, [scene.log, state.me.id, toast]);
  // Locks and puzzles: a moment for the whole room, the solver included.
  const solveFlash = useSolveMoments(scene.log.filter((e) => e.solve), toast, { sound: soundOn });
  const arrived = useArrivals(scene.inventory.map((i) => i.id));

  // ---------- chat toasts ----------
  const knownChat = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!chat.loaded) return;
    const visible = roomOpen && roomTab === "chat";
    if (knownChat.current && !visible) {
      for (const m of chat.messages) {
        if (knownChat.current.has(m.id) || m.playerId === state.me.id) continue;
        toast(`${m.playerName}: ${m.body.length > 70 ? `${m.body.slice(0, 70)}…` : m.body}`, "info", {
          label: t("train.reply"),
          onClick: () => {
            setRoomTab("chat");
            setRoomOpen(true);
          },
        });
      }
    }
    knownChat.current = new Set(chat.messages.map((m) => m.id));
  }, [chat.messages, chat.loaded, roomOpen, roomTab, state.me.id, toast, t]);

  // ---------- actions ----------
  const act = useCallback(
    async (action: SceneAction) => {
      if (busy) return null;
      setBusy(true);
      const res = await apiFetch<SceneActionResponse>(code, "/scene", { method: "POST", body: action });
      setBusy(false);
      const data = res.data;
      if (!data || typeof data !== "object" || !("scene" in data)) {
        toast(t("train.offline"), "error");
        return null;
      }
      if (data.message) toast(data.message, data.ok ? "success" : "info");
      if (action.type === "unlock") {
        fireLock(data.ok ? "open" : "wrong");
        ambience.current?.cue(data.ok ? "open" : "thunk");
      }
      // A wrong guess can jam the lock, so refresh then too.
      if (data.ok || action.type === "unlock") void refresh();
      return data;
    },
    [busy, code, refresh, toast, t, fireLock],
  );

  const ctx: GameCtx = useMemo(
    () => ({
      code,
      state,
      refresh,
      api: (path, init) => apiFetch(code, path, init),
      openApp: () => {},
      openAddress: () => {},
      setView: () => {},
      toast,
    }),
    [code, state, refresh, toast],
  );

  // ---------- swipe between walls ----------
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const turn = (d: number) => {
    if (place === "corridor") return;
    setWallIdxBy((m) => ({ ...m, [place]: (m[place] + d + walls.length) % walls.length }));
  };
  const pouchHere = Boolean(scene.closeups["under-berth"]?.takes.length);
  const scorecardHere = Boolean(scene.closeups.bridge?.takes.length);
  const here = state.players.filter((p) => p.online && p.id !== state.me.id && p.currentView === view);

  return (
    <GameContext.Provider value={ctx}>
      <div className="fixed inset-0 flex flex-col bg-[#120c07] text-stone-200" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* top bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#3d2615] px-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base text-[#ecd27a]">
              {place === "corridor" ? t("train.room.corridor") : t("train.title", { room: roomName, wall: t(`train.wall.${wall}`) })}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? t("train.mute") : t("train.unmute")}
            className="flex h-10 w-10 items-center justify-center rounded-md text-[#ecd27a] active:bg-[#3d2615]"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </header>

        {/* the wall */}
        <main
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || place === "corridor") return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) turn(dx < 0 ? 1 : -1);
          }}
        >
          <div key={place === "corridor" ? "corridor" : `${place}:${wall}`} className="at-enter relative aspect-[3/4] h-full max-h-full max-w-full" data-tour="nx-wall">
            {place === "corridor" ? (
              <CorridorArt onDining={() => setPlace("dining")} />
            ) : (
              <WallArt
                wall={wall}
                flags={scene.flags}
                mirrorLetters={scene.mirrorLetters}
                pouchHere={pouchHere}
                scorecardHere={scorecardHere}
                pulse={showSpots}
                onTap={setCloseup}
              />
            )}
            {here.length > 0 && (
              <div className="absolute right-2 top-2 flex -space-x-1.5" aria-label={t("train.lookingHere", { names: here.map((p) => p.displayName).join(", ") })}>
                {here.map((p) => (
                  <span
                    key={p.id}
                    title={p.displayName}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#120c07] text-xs font-bold text-black"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {place !== "corridor" ? (
            <>
              {place === "dining" && (
                <button
                  type="button"
                  onClick={() => setPlace("corridor")}
                  className="absolute left-2 top-2 min-h-9 rounded-md bg-black/50 px-3 text-xs text-[#ecd27a] active:bg-black/70"
                >
                  {t("train.toCorridor")}
                </button>
              )}
              <button
                type="button"
                aria-label={t("train.turnLeft")}
                onClick={() => turn(-1)}
                className="absolute left-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#ecd27a] active:bg-black/60"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t("train.turnRight")}
                data-tour="nx-turn"
                onClick={() => turn(1)}
                className="absolute right-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#ecd27a] active:bg-black/60"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setShowSpots(true)}
                aria-label={t("train.showSpots")}
                data-tour="nx-spots"
                className="absolute bottom-1 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-base active:bg-black/70"
              >
                👁
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
                {walls.map((w, i) => (
                  <span key={w} className={`h-1.5 w-1.5 rounded-full ${i === wallIdx ? "bg-[#ecd27a]" : "bg-stone-600"}`} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-[#0b0806] via-[#0b0806]/80 to-transparent px-4 pb-3 pt-12">
                <p className="text-center font-serif text-sm italic text-stone-300">{t("train.corridor.text")}</p>
                <div className="mx-auto flex w-full max-w-sm gap-2">
                  <button
                    type="button"
                    onClick={() => setPlace("12b")}
                    className="min-h-11 flex-1 rounded-md border border-[#c9a227]/50 bg-black/40 px-2 py-1 text-sm leading-tight text-[#ecd27a] active:bg-[#3d2615]"
                  >
                    {t("train.corridor.back")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlace("dining")}
                    className="min-h-11 flex-[1.3] rounded-md bg-[#c9a227] px-2 py-1 text-sm font-semibold leading-tight text-[#1b120b] active:bg-[#ecd27a]"
                  >
                    {t("train.corridor.dining")}
                  </button>
                </div>
              </div>
            </>
          )}
          {arrival && (
            <div className="at-arrive pointer-events-none absolute inset-x-0 top-6 flex justify-center" aria-hidden>
              <p className="rounded-full bg-black/60 px-5 py-2 font-serif text-xl tracking-wide text-[#ecd27a] shadow-lg">{arrival}</p>
            </div>
          )}
        </main>

        {/* the tab bar, with the team's things in a tray above it */}
        <footer className="shrink-0 border-t border-[#3d2615] bg-[#1b120b]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {itemsOpen && (
            <div id="nx-items" className="at-tray border-b border-[#3d2615] px-2 pt-1.5">
              <p className="px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">{t("train.things")}</p>
              <div className="flex min-h-16 gap-1.5 overflow-x-auto py-1">
                {scene.inventory.length === 0 && <p className="self-center px-1 text-sm text-stone-500">{t("train.thingsEmpty")}</p>}
                {scene.inventory.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setItemOpen(it.id)}
                    className={`relative flex w-16 shrink-0 flex-col items-center rounded-lg border border-[#3d2615] bg-[#24160c] px-1 py-1 active:border-[#c9a227] ${arrived.has(it.id) ? "sm-new-tile" : ""}`}
                  >
                    <ItemIcon id={it.id} className="h-9 w-9" />
                    <span className="mt-0.5 line-clamp-1 text-[10px] text-stone-300">{it.name}</span>
                    {it.evidence && <span className="absolute right-0.5 top-0.5 text-[10px]" aria-label={t("train.evidence")}>🔍</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <nav className="grid grid-cols-4" aria-label={t("train.tab.aria")}>
            <TabButton
              icon="🧳"
              label={t("train.tab.items")}
              tour="nx-things"
              active={itemsOpen}
              aria-expanded={itemsOpen}
              aria-controls="nx-items"
              onClick={() => setItemsOpen(!itemsOpen)}
              badge={scene.inventory.length > 0 ? String(scene.inventory.length) : undefined}
              dot={newItems}
              glow={!itemsOpen && arrived.size > 0}
            />
            <TabButton icon="📝" label={t("train.tab.notes")} onClick={() => setNotebookOpen(true)} />
            <TabButton
              icon="🛎"
              label={t("train.tab.hints")}
              tour="nx-hints"
              aria-label={t("train.hintsAria")}
              onClick={() => setNotesOpen(true)}
              dot={Boolean(scene.nextHint && !scene.nextHint.readyAt && scene.hints.length === 0)}
            />
            <TabButton
              icon="👥"
              label={t("train.roomButton", { count: state.players.filter((p) => p.online).length })}
              tour="nx-room"
              onClick={() => setRoomOpen(true)}
              badge={chat.unread > 0 ? String(chat.unread) : undefined}
              alert={chat.unread > 0}
            />
          </nav>
        </footer>

        {closeup && (
          <CloseupSheet
            id={closeup}
            scene={scene}
            busy={busy}
            pulse={lockPulse}
            onClose={() => setCloseup(null)}
            act={act}
            goCorridor={() => {
              setCloseup(null);
              setPlace("corridor");
            }}
            notes={notesDocked ? <TrainNotebook ctx={ctx} scene={scene} seen={seen} current={closeup} /> : null}
            notesOn={notesDocked}
            onNotes={() => setNotesDocked(!notesDocked)}
          />
        )}
        {itemOpen && (
          <ItemSheet
            item={scene.inventory.find((i) => i.id === itemOpen) ?? null}
            others={scene.inventory.filter((i) => i.id !== itemOpen)}
            busy={busy}
            onClose={() => setItemOpen(null)}
            onItemAction={(op) => void act({ type: "item", item: itemOpen, op })}
            onCombine={async (other) => {
              const r = await act({ type: "combine", items: [itemOpen, other] });
              if (r?.ok) setItemOpen(null);
            }}
          />
        )}
        {notebookOpen && (
          <Sheet title={t("train.notebook.title")} onClose={() => setNotebookOpen(false)} tall bare>
            <TrainNotebook ctx={ctx} scene={scene} seen={seen} />
          </Sheet>
        )}
        {notesOpen && <NotesSheet scene={scene} busy={busy} onClose={() => setNotesOpen(false)} onRing={() => void act({ type: "hint" })} />}
        {scene.vote && !scene.ending && <VotePanel state={state} scene={scene} busy={busy} act={act} />}
        {scene.ending && <EndingPanel scene={scene} code={code} signedIn={state.me.signedIn} />}
        {intro && (
          <IntroCard
            onClose={() => {
              setIntro(false);
              try {
                localStorage.setItem("nx_intro_done", "1");
                if (localStorage.getItem(TOUR_DONE_KEY) !== "1") setTourOpen(true);
              } catch {}
            }}
          />
        )}
        <RoomSheet
          ctx={ctx}
          open={roomOpen}
          onClose={() => setRoomOpen(false)}
          tab={roomTab}
          setTab={setRoomTab}
          chat={chat}
          tabs={TABS}
          onTour={() => {
            setRoomOpen(false);
            setPlace("12b");
            setTourOpen(true);
          }}
        />
        {tourOpen && (
          <Tour
            steps={TRAIN_TOUR}
            prefix="train.tour"
            doneKey="train.tour.done"
            showSheet={(tab) => {
              if (tab) setRoomTab(tab);
              setRoomOpen(tab !== null);
            }}
            onClose={() => {
              setTourOpen(false);
              try {
                localStorage.setItem(TOUR_DONE_KEY, "1");
              } catch {}
            }}
          />
        )}
        <SolveGlow flash={solveFlash} />
        <Toasts items={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} placement={closeup || itemOpen || itemsOpen || roomOpen || notebookOpen ? "top" : "bottom"} />
      </div>
    </GameContext.Provider>
  );
}

/**
 * A bottom sheet. `side` docks a second panel (the notebook) under it on phones and beside it on wider screens, so
 * a clue can stay in view while a lock is worked.
 */
function Sheet({
  title,
  onClose,
  children,
  side,
  headerExtra,
  tall,
  bare,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  side?: React.ReactNode;
  headerExtra?: React.ReactNode;
  /** Full height even when the content is short (the notebook). */
  tall?: boolean;
  /** No padding or scrolling of its own: the child manages both. */
  bare?: boolean;
}) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const panel = (
    <div
      className={`relative flex min-h-0 w-full flex-col overflow-hidden bg-[#1b120b] ${side ? "flex-1 md:w-auto" : `max-w-md rounded-t-2xl border-t border-[#c9a227]/40 ${tall ? "h-[86dvh]" : "max-h-[86dvh]"}`}`}
      style={side ? undefined : { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 px-4 pt-3">
        <h2 className="min-w-0 flex-1 font-serif text-xl text-[#ecd27a]">{title}</h2>
        {headerExtra}
        <button onClick={onClose} aria-label={t("train.close")} className="flex h-10 w-10 items-center justify-center rounded-md text-stone-400 active:bg-[#3d2615]">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <div className={bare ? "min-h-0 flex-1" : "min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-2 pt-2"}>{children}</div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label={t("train.close")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      {side ? (
        <div
          className="relative flex h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t border-[#c9a227]/40 bg-[#1b120b] md:h-[86dvh] md:max-w-4xl md:flex-row"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {panel}
          <aside aria-label={t("train.notebook.title")} className="flex h-[42%] min-h-0 shrink-0 flex-col border-t border-[#c9a227]/50 bg-[#120c07] md:h-auto md:w-[44%] md:border-l md:border-t-0">
            {side}
          </aside>
        </div>
      ) : (
        <div className="relative flex w-full justify-center">{panel}</div>
      )}
    </div>
  );
}

function CloseupSheet({
  id,
  scene,
  busy,
  pulse,
  onClose,
  act,
  goCorridor,
  notes,
  notesOn,
  onNotes,
}: {
  id: HotspotId;
  scene: SceneDTO;
  busy: boolean;
  pulse: LockPulse;
  onClose: () => void;
  act: (a: SceneAction) => Promise<SceneActionResponse | null>;
  goCorridor: () => void;
  /** The docked notebook, when it's on. */
  notes: React.ReactNode;
  notesOn: boolean;
  onNotes: () => void;
}) {
  const t = useT();
  // An opened lock stays up, glowing, for a moment before the close-up shows what's inside.
  const live = scene.closeups[id];
  const { value: c, opening } = useOpenHold(live, id, live?.lock?.id);
  if (!c) return null;
  return (
    <Sheet
      title={c.title}
      onClose={onClose}
      side={notes}
      headerExtra={
        <button
          type="button"
          onClick={onNotes}
          aria-pressed={notesOn}
          className={`flex h-10 items-center gap-1 rounded-md border px-2.5 text-sm ${notesOn ? "border-[#c9a227] bg-[#3d2615] text-[#ecd27a]" : "border-[#c9a227]/40 text-[#e9d9a6]"} active:bg-[#3d2615]`}
        >
          <span aria-hidden>📝</span>
          {t("train.notebook.toggle")}
        </button>
      }
    >
      {c.doc && <CloseupDocView doc={c.doc} />}
      {c.lines.map((l, i) => (
        <p key={i} className="text-[15px] leading-relaxed text-stone-200">
          {l}
        </p>
      ))}
      {c.takes.length > 0 && (
        <div className="space-y-2">
          {c.takes.map((it) => (
            <button
              key={it.id}
              type="button"
              disabled={busy}
              onClick={() => void act({ type: "take", item: it.id })}
              className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-[#c9a227]/50 bg-[#24160c] px-3 text-left active:bg-[#3d2615] disabled:opacity-60"
            >
              <ItemIcon id={it.id} className="h-10 w-10 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#ecd27a]">{t("train.take", { item: it.name })}</span>
                <span className="block text-xs text-stone-400">{it.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {c.lock && (
        <LockDial
          key={c.lock.id}
          length={c.lock.length}
          label={c.lock.label}
          faces={c.lock.kind === "symbols" ? SUIT_SYMBOLS : undefined}
          jammedUntil={c.lock.jammedUntil}
          left={c.lock.left}
          busy={busy}
          pulse={pulse}
          opening={opening}
          onTry={(input) => void act({ type: "unlock", lock: c.lock!.id, input })}
        />
      )}
      {c.actions.map((a) => (
        <button
          key={a.op}
          type="button"
          disabled={busy}
          onClick={() => (a.op === "go" ? goCorridor() : void act({ type: "operate", target: id, op: a.op }))}
          className="min-h-12 w-full rounded-lg bg-[#c9a227] font-semibold text-[#1b120b] active:bg-[#ecd27a] disabled:opacity-60"
        >
          {a.label}
        </button>
      ))}
      {scene.inventory.length > 0 && (
        <div className="border-t border-[#3d2615] pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">{t("train.useHere")}</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {scene.inventory.map((it) => (
              <button
                key={it.id}
                type="button"
                disabled={busy}
                onClick={() => void act({ type: "use", item: it.id, target: id })}
                className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-[#3d2615] bg-[#24160c] px-1 py-1 active:border-[#c9a227] disabled:opacity-60"
              >
                <ItemIcon id={it.id} className="h-8 w-8" />
                <span className="line-clamp-1 text-[10px] text-stone-300">{it.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}

function ItemSheet({
  item,
  others,
  busy,
  onClose,
  onCombine,
  onItemAction,
}: {
  item: ItemDTO | null;
  others: ItemDTO[];
  busy: boolean;
  onClose: () => void;
  onCombine: (other: ItemId) => void;
  onItemAction: (op: string) => void;
}) {
  const t = useT();
  if (!item) return null;
  return (
    <Sheet title={item.name} onClose={onClose}>
      <div className="flex items-center gap-3">
        <ItemIcon id={item.id} className="h-16 w-16 shrink-0" />
        <p className="text-[15px] leading-relaxed text-stone-200">{item.description}</p>
      </div>
      {item.evidence && <p className="text-xs text-[#ecd27a]">{t("train.evidenceNote")}</p>}
      <ItemReading item={item} />
      {item.actions?.map((a) => (
        <button
          key={a.op}
          type="button"
          disabled={busy}
          onClick={() => onItemAction(a.op)}
          className="min-h-12 w-full rounded-lg bg-[#c9a227] font-semibold text-[#1b120b] active:bg-[#ecd27a] disabled:opacity-60"
        >
          {a.label}
        </button>
      ))}
      {others.length > 0 && (
        <div className="border-t border-[#3d2615] pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">{t("train.combineWith")}</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {others.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={busy}
                onClick={() => onCombine(o.id)}
                className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-[#3d2615] bg-[#24160c] px-1 py-1 active:border-[#c9a227] disabled:opacity-60"
              >
                <ItemIcon id={o.id} className="h-8 w-8" />
                <span className="line-clamp-1 text-[10px] text-stone-300">{o.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-stone-500">{t("train.useTip")}</p>
    </Sheet>
  );
}

const suspectName = (t: ReturnType<typeof useT>, s: Suspect) => t(`train.suspect.${s}`);
const suspectLine = (t: ReturnType<typeof useT>, s: Suspect) => t(`train.suspect.${s}.line`);

function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** Teodor the porter's notes: the hint system. */
function NotesSheet({ scene, busy, onClose, onRing }: { scene: SceneDTO; busy: boolean; onClose: () => void; onRing: () => void }) {
  const t = useT();
  const now = useNow(1000);
  const next = scene.nextHint;
  const wait = next?.readyAt ? Math.max(0, Math.ceil((new Date(next.readyAt).getTime() - now) / 1000)) : 0;
  return (
    <Sheet title={t("train.notes.title")} onClose={onClose}>
      <p className="text-sm text-stone-400">{t("train.notes.intro")}</p>
      {[...scene.hints].reverse().map((h) => (
        <div key={h.id} className="rotate-[-0.5deg] rounded-sm bg-[#f7f2e4] px-4 py-3 text-stone-800 shadow">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
            {t("train.notes.tier", { title: h.title, tier: h.tier })}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            {h.text}
          </p>
        </div>
      ))}
      {next ? (
        <button
          type="button"
          disabled={busy || wait > 0}
          onClick={onRing}
          className="min-h-12 w-full rounded-lg bg-[#c9a227] font-semibold text-[#1b120b] active:bg-[#ecd27a] disabled:opacity-60"
        >
          {wait > 0 ? t("train.notes.busy", { s: wait }) : t("train.notes.ring", { title: next.title, tier: next.tier })}
        </button>
      ) : (
        <p className="text-sm text-stone-500">{t("train.notes.none")}</p>
      )}
    </Sheet>
  );
}

function EvidenceStrip({ items }: { items: ItemDTO[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {items.map((it) => (
        <span key={it.id} className="flex w-16 flex-col items-center rounded-lg border border-[#3d2615] bg-[#24160c] px-1 py-1" title={it.name}>
          <ItemIcon id={it.id} className="h-8 w-8" />
          <span className="line-clamp-1 text-[10px] text-stone-300">{it.name}</span>
        </span>
      ))}
    </div>
  );
}

/** The accusation: every player picks a suspect; a clear majority closes the case, the host breaks ties. */
function VotePanel({ state, scene, busy, act }: { state: RoomState; scene: SceneDTO; busy: boolean; act: (a: SceneAction) => Promise<SceneActionResponse | null> }) {
  const t = useT();
  const vote = scene.vote!;
  const mine = vote.votes[state.me.id];
  const isHost = state.me.isHost;
  const voters = state.players.filter((p) => p.online || vote.votes[p.id]);
  const count = (s: Suspect) => Object.values(vote.votes).filter((v) => v === s).length;
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#120c07] px-4 pb-8" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }} role="dialog" aria-modal="true" aria-label={t("train.vote.aria")}>
      <div className="mx-auto w-full max-w-md space-y-4">
        <p className="pt-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#c9a227]">{t("train.vote.eyebrow")}</p>
        <h1 className="text-center font-serif text-3xl text-[#ecd27a]">{t("train.vote.title")}</h1>
        <p className="text-center text-sm text-stone-300">{t("train.vote.intro")}</p>
        <EvidenceStrip items={scene.evidence} />
        <div className="space-y-2">
          {SUSPECTS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy || Boolean(vote.tie)}
              onClick={() => void act({ type: "vote", suspect: s })}
              className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 text-left ${
                mine === s ? "border-[#ecd27a] bg-[#3d2615]" : "border-[#3d2615] bg-[#1b120b] active:bg-[#24160c]"
              } disabled:opacity-80`}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg text-stone-100">{suspectName(t, s)}</span>
                <span className="block text-xs text-stone-400">{suspectLine(t, s)}</span>
              </span>
              <span className="font-mono text-xl text-[#ecd27a]">{count(s) || ""}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-stone-500">
          {t(mine ? "train.vote.change" : "train.vote.count", { voted: Object.keys(vote.votes).length, total: voters.length })}
        </p>
        {vote.tie &&
          (isHost ? (
            <div className="space-y-2 rounded-xl border border-[#c9a227]/50 p-3">
              <p className="text-center text-sm text-[#ecd27a]">{t("train.vote.tieHost")}</p>
              {vote.tie.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => void act({ type: "tiebreak", suspect: s })}
                  className="min-h-11 w-full rounded-lg bg-[#c9a227] font-semibold text-[#1b120b] disabled:opacity-60"
                >
                  {t("train.vote.accuse", { name: suspectName(t, s) })}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#ecd27a]">{t("train.vote.tieWait")}</p>
          ))}
        {isHost && !vote.tie && Object.keys(vote.votes).length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void act({ type: "close-vote" })}
            className="min-h-11 w-full rounded-lg border border-[#c9a227]/50 text-sm text-[#ecd27a] active:bg-[#3d2615] disabled:opacity-60"
          >
            {t("train.vote.close")}
          </button>
        )}
      </div>
    </div>
  );
}

const ENDING_THEME: RevealTheme = {
  eyebrow: "font-mono text-[#c9a227]",
  accent: "text-[#ecd27a]",
  title: "font-serif text-4xl text-[#ecd27a]",
  label: "text-stone-500",
  value: "text-stone-100",
  tile: "border-[#3d2615] bg-[#1b120b]/60",
  divide: "divide-[#3d2615]",
  muted: "text-stone-400",
  text: "text-stone-100",
  chip: "border-[#c9a227]/50 bg-[#c9a227]/10 text-[#ecd27a]",
  primary: "block min-h-12 w-full rounded-lg bg-[#c9a227] py-3 text-center font-semibold text-[#1b120b] active:bg-[#ecd27a]",
  ghost: "block min-h-12 rounded-lg border border-[#c9a227]/50 py-3 text-center text-[#ecd27a] active:bg-[#3d2615]",
};

function EndingPanel({ scene, code, signedIn }: { scene: SceneDTO; code: string; signedIn: boolean }) {
  const t = useT();
  const e = scene.ending!;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#120c07] px-4 pb-14" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }} role="dialog" aria-modal="true" aria-label={e.title}>
      <article className="mx-auto max-w-md pt-6">
        <ResultReveal
          code={code}
          gameId={TRAIN_GAME_ID}
          signedIn={signedIn}
          theme={ENDING_THEME}
          eyebrow={<span className={e.correct ? "" : "text-red-400"}>{t(e.correct ? "train.end.solved" : "train.end.closed", { name: suspectName(t, e.accused) })}</span>}
          title={e.title}
          extraStats={[
            { label: t("train.end.evidence"), value: e.evidenceFound, total: e.evidenceTotal },
            { label: t("train.end.votes"), value: e.counts[e.accused] },
          ]}
          slotBadges={["nx-every-clue"]}
          badgeSlot={
            e.everyClue && (
              <p className="mx-auto w-fit rounded-full border border-[#c9a227]/60 bg-[#c9a227]/10 px-3 py-1 text-xs font-semibold text-[#ecd27a]">{t("train.end.everyClue")}</p>
            )
          }
        >
          <div className="space-y-4 font-serif text-[16px] leading-relaxed text-stone-200">
            {e.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Leaderboard gameId={TRAIN_GAME_ID} roomCode={code} tone="room" />
        </ResultReveal>
      </article>
    </div>
  );
}

function IntroCard({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" role="dialog" aria-modal="true" aria-label={t("site.game.nightingale-express.title")}>
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-[#c9a227]/50 bg-[#1b120b] p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c9a227]">{t("train.intro.when")}</p>
        <h2 className="font-serif text-2xl text-[#ecd27a]">{t("train.intro.title")}</h2>
        <p className="font-serif text-[15px] leading-relaxed text-stone-200">
          {t("train.intro.text")}
        </p>
        <button type="button" onClick={onClose} className="min-h-12 w-full rounded-lg bg-[#c9a227] font-semibold text-[#1b120b] active:bg-[#ecd27a]">
          {t("train.intro.start")}
        </button>
      </div>
    </div>
  );
}

/** One tab in the bottom bar: an icon over a short label, with an optional count and a "something new" dot. */
function TabButton({
  icon,
  label,
  onClick,
  active,
  badge,
  dot,
  glow,
  alert,
  tour,
  ...aria
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: string;
  dot?: boolean;
  /** Something just arrived: glow once. */
  glow?: boolean;
  alert?: boolean;
  /** The guided tour's name for this control. */
  tour?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={tour}
      {...aria}
      className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 active:bg-[#3d2615] ${glow ? "sm-new-tab" : ""} ${active ? "bg-[#24160c] text-[#ecd27a]" : "text-stone-300"}`}
    >
      {active && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#c9a227]" aria-hidden />}
      <span className="relative text-lg leading-none" aria-hidden>
        {icon}
        {badge && (
          <span
            className={`absolute -right-3 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${alert ? "bg-red-600 text-white" : "bg-[#c9a227] text-[#1b120b]"}`}
          >
            {badge}
          </span>
        )}
        {dot && <span className={`absolute -top-0.5 h-2 w-2 rounded-full bg-[#ecd27a] ${badge ? "-left-1.5" : "-right-1.5"}`} />}
      </span>
      <span className="max-w-full truncate text-[11px] leading-tight">{label}</span>
    </button>
  );
}
