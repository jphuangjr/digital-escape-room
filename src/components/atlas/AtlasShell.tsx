"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomState } from "@/lib/types";
import type { AtlasActionResponse, AtlasItemDTO, AtlasSceneAction, AtlasSceneDTO, HotspotId, ItemId, LocationId } from "@/lib/atlas/types";
import { GLYPHS, LOCATIONS, WALLS } from "@/lib/atlas/types";
import { apiFetch, GameContext, type GameCtx } from "@/lib/client/game";
import { useChat } from "@/lib/client/chat";
import { RoomSheet, type RoomTab } from "@/components/shell/RoomSheet";
import { Tour, type TourStep } from "@/components/shell/Tour";
import { SolveGlow, useArrivals, useSolveMoments } from "@/components/shell/SolveMoments";
import { Toasts, type ToastItem } from "@/components/shell/Toasts";
import { CloseIcon } from "@/components/shell/icons";
import { LockDial } from "@/components/train/parts";
import { useT } from "@/i18n/client";
import { AtlasDocView, GatePanel, MirrorGrid, TankPanel, useSecondsUntil, ValvePanel } from "./parts";
import { CorePanel, EndingPanel, PlatePanel, VotePanel } from "./finale";
import { WallArt, type WallState } from "./art";
import { AtlasItemIcon } from "./items";
import { SPOTS } from "./walls";
import { AtlasNotebook, useDockedNotes, useSeenClues } from "./notebook";
import { isLetter, LetterCard, lettersHeld } from "./story";
import { AtlasAmbience, setSoundPreferred, soundPreferred } from "./sound";

/**
 * The room screen for The Atlas of Silent Worlds: one illustrated wall at a time, tap to look closer, a shared inventory, the Atlas of places reached. Where each player stands is their own;
 * everything found or opened is shared with the room. English only until it is translated.
 */

const PRESENCE_MS = 15_000;
const TABS: RoomTab[] = ["people", "chat", "attempts"];
const INTRO_KEY = "atlas_intro_done";
const TOUR_DONE_KEY = "atlas_tour_done_v1";

/** The first-time tour of the Atlas: each step spotlights a real control (its data-tour name). */
const ATLAS_TOUR: TourStep[] = [
  { id: "wall", target: "at-wall", sheet: null },
  { id: "turn", target: "at-turn", sheet: null },
  { id: "spots", target: "at-spots", sheet: null },
  { id: "items", target: "at-items", sheet: null },
  { id: "notebook", target: "at-notebook", sheet: null },
  { id: "hints", target: "at-hints", sheet: null },
  { id: "places", target: "at-places", sheet: null },
  { id: "room", target: "at-room", sheet: null },
  { id: "invite", target: "invite", sheet: "people" },
  { id: "chat", target: "tab-chat", sheet: "people" },
  { id: "attempts", target: "tab-attempts", sheet: "people" },
  { id: "end", sheet: null },
];

export function AtlasShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const scene = state.scene as AtlasSceneDTO;
  const t = useT();
  const placeKey = `atlas_place_${code}`;
  const [place, setPlaceRaw] = useState<LocationId>("observatory");
  const [wallIdxBy, setWallIdxBy] = useState<Partial<Record<LocationId, number>>>({});
  const [closeup, setCloseup] = useState<HotspotId | null>(null);
  const [itemOpen, setItemOpen] = useState<ItemId | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  // The items tray opens from its tab; a dot on the tab says something new arrived while it was shut.
  const [itemsOpen, setItemsOpenRaw] = useState(false);
  const [newItems, setNewItems] = useState(false);
  const setItemsOpen = (open: boolean) => {
    setItemsOpenRaw(open);
    if (open) setNewItems(false);
  };
  const itemCount = useRef<number | null>(null);
  const heldCount = scene.inventory.length;
  useEffect(() => {
    if (itemCount.current !== null && heldCount > itemCount.current && !itemsOpen) setNewItems(true);
    itemCount.current = heldCount;
  }, [heldCount, itemsOpen]);
  const [notesDocked, setNotesDocked] = useDockedNotes();
  const { seen, mark: markSeen } = useSeenClues(code);
  // Everything this player reads goes into their notebook's Clues.
  useEffect(() => {
    if (closeup) markSeen(closeup);
  }, [closeup, markSeen]);
  const [showSpots, setShowSpots] = useState(false);
  useEffect(() => {
    if (!showSpots) return;
    const id = setTimeout(() => setShowSpots(false), 1800);
    return () => clearTimeout(id);
  }, [showSpots]);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [intro, setIntro] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomTab, setRoomTab] = useState<RoomTab>("people");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const chat = useChat(code, state.me.id);

  const canStand = useCallback((p: LocationId) => Boolean(scene.places.find((x) => x.id === p)?.reachable), [scene.places]);
  const setPlace = useCallback(
    (p: LocationId) => {
      setPlaceRaw(p);
      try {
        localStorage.setItem(placeKey, p);
      } catch {}
    },
    [placeKey],
  );
  // Where this player stood last time on this device, and the intro the first time.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(placeKey) as LocationId | null;
      if (saved && (LOCATIONS as string[]).includes(saved)) setPlaceRaw(saved);
      if (localStorage.getItem(INTRO_KEY) !== "1") setIntro(true);
      // Players who saw the intro before the tour existed get the tour once, after a moment.
      else if (localStorage.getItem(TOUR_DONE_KEY) !== "1") window.setTimeout(() => setTourOpen(true), 900);
    } catch {}
  }, [placeKey]);
  // Never stand somewhere the team can't reach (e.g. a stale saved place).
  const here: LocationId = canStand(place) ? place : "observatory";
  const walls = WALLS[here];
  const wallIdx = (wallIdxBy[here] ?? 0) % walls.length;
  const wall = walls[wallIdx];
  const placeName = scene.places.find((p) => p.id === here)?.name ?? "";

  // ---------- sound: one soundscape per place, started on the first tap ----------
  const ambience = useRef<AtlasAmbience | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    setSoundOn(soundPreferred());
    ambience.current = new AtlasAmbience();
    const first = () => {
      if (soundPreferred()) ambience.current?.start();
    };
    window.addEventListener("pointerdown", first, { once: true });
    return () => {
      window.removeEventListener("pointerdown", first);
      ambience.current?.stop();
    };
  }, []);
  useEffect(() => ambience.current?.setPlace(here), [here]);
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundPreferred(next);
    if (next) ambience.current?.start();
    else ambience.current?.stop();
  };

  // ---------- arriving somewhere: the place's name, briefly ----------
  const [arrival, setArrival] = useState<string | null>(null);
  const lastPlace = useRef<LocationId | null>(null);
  useEffect(() => {
    if (lastPlace.current && lastPlace.current !== here) {
      setArrival(placeName);
      const id = setTimeout(() => setArrival(null), 2600);
      lastPlace.current = here;
      return () => clearTimeout(id);
    }
    lastPlace.current = here;
  }, [here, placeName]);

  const toast = useCallback<GameCtx["toast"]>((msg, tone = "info", action) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-3), { id, msg, tone, action }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), action ? 7000 : 3800);
  }, []);

  // ---------- presence ----------
  const view = `atlas:${here}:${wall}`;
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
    void apiFetch(code, "/presence", { method: "POST", body: { view } });
  }, [code, view]);
  useEffect(() => {
    const id = setInterval(() => void apiFetch(code, "/presence", { method: "POST", body: { view: viewRef.current } }), PRESENCE_MS);
    return () => clearInterval(id);
  }, [code]);

  // ---------- teammates' finds and chat ----------
  const knownLog = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (knownLog.current) {
      for (const e of scene.log) if (!knownLog.current.has(e.id) && e.playerId !== state.me.id && !e.solve) toast(e.text, "success");
    }
    knownLog.current = new Set(scene.log.map((e) => e.id));
  }, [scene.log, state.me.id, toast]);
  // Locks and puzzles: a moment for the whole room, the solver included.
  const solveFlash = useSolveMoments(scene.log.filter((e) => e.solve), toast, { sound: soundOn });
  const arrived = useArrivals(scene.inventory.map((i) => i.id));
  const knownChat = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!chat.loaded) return;
    if (knownChat.current && !(roomOpen && roomTab === "chat")) {
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
  const go = useCallback(
    (p: LocationId) => {
      setCloseup(null);
      setPlacesOpen(false);
      setPlace(p);
      setWallIdxBy((m) => ({ ...m, [p]: 0 }));
    },
    [setPlace],
  );
  // ---------- the Cartographers' letters ----------
  // Whoever picks one up reads it at once; everyone else is told and can open it.
  const [letterOpen, setLetterOpen] = useState<ItemId | null>(null);
  const tookLetter = useRef<ItemId | null>(null);
  const knownLetters = useRef<Set<string> | null>(null);
  useEffect(() => {
    const held = scene.inventory.filter((i) => isLetter(i.id)).map((i) => i.id);
    if (knownLetters.current) {
      for (const id of held) {
        if (knownLetters.current.has(id)) continue;
        if (tookLetter.current === id) setLetterOpen(id);
        else toast(t("atlas.story.found"), "success", { label: t("atlas.story.read"), onClick: () => setLetterOpen(id) });
      }
    }
    knownLetters.current = new Set(held);
  }, [scene.inventory, toast, t]);

  const act = useCallback(
    async (action: AtlasSceneAction) => {
      if (busy) return null;
      setBusy(true);
      // Flagged before sending: the room's live update can arrive before this response does.
      if (action.type === "take" && isLetter(action.item)) tookLetter.current = action.item;
      const res = await apiFetch<AtlasActionResponse>(code, "/scene", { method: "POST", body: action });
      setBusy(false);
      const data = res.data;
      if (!data || typeof data !== "object" || !("scene" in data)) {
        toast(t("atlas.offline"), "error");
        return null;
      }
      if (data.message) toast(data.message, data.ok ? "success" : "info");
      if (!data.ok && (action.type === "unlock" || action.type === "dial")) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      // Failed guesses can still change things (a jam, a flood), so refresh whenever something was tried.
      void refresh();
      if (data.arrived) go(data.arrived);
      return data;
    },
    [busy, code, refresh, toast, t, go],
  );

  const ctx: GameCtx = useMemo(
    () => ({ code, state, refresh, api: (path, init) => apiFetch(code, path, init), openApp: () => {}, openAddress: () => {}, setView: () => {}, toast }),
    [code, state, refresh, toast],
  );

  const turn = (d: number) => setWallIdxBy((m) => ({ ...m, [here]: (wallIdx + d + walls.length) % walls.length }));
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const others = state.players.filter((p) => p.online && p.id !== state.me.id && p.currentView === view);
  const nextHint = scene.nextHints[here] ?? null;
  const wallState: WallState = useMemo(
    () => ({
      flags: scene.flags,
      takes: new Set(Object.entries(scene.closeups).flatMap(([h, c]) => (c && c.takes.length ? [h as HotspotId] : []))),
      tanks: scene.closeups.tanks?.tanks?.levels ?? null,
    }),
    [scene.flags, scene.closeups],
  );

  return (
    <GameContext.Provider value={ctx}>
      <div className="fixed inset-0 flex flex-col bg-[#071015] text-stone-200" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-[#1f3640] px-3">
          <p className="min-w-0 flex-1 truncate font-serif text-base text-[#f4e7b5]">{t("atlas.title", { place: placeName, wall: t(`atlas.wall.${wall}`) })}</p>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? t("atlas.mute") : t("atlas.unmute")}
            className="flex h-10 w-9 items-center justify-center rounded-md text-sm active:bg-[#1f3640]"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </header>

        <main
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || walls.length < 2) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) turn(dx < 0 ? 1 : -1);
          }}
        >
          <div key={`${here}:${wall}`} className="at-enter relative aspect-[3/4] h-full max-h-full max-w-full" data-tour="at-wall">
            <WallArt
              wall={wall}
              state={wallState}
              label={t("atlas.wallAria", { wall: t(`atlas.wall.${wall}`) })}
              spots={SPOTS[wall].map((s) => ({ ...s, label: t(`atlas.spot.${s.id}`) }))}
              pulse={showSpots}
              onTap={setCloseup}
            />
            {others.length > 0 && (
              <div className="absolute right-2 top-2 flex -space-x-1.5" aria-label={t("atlas.lookingHere", { names: others.map((p) => p.displayName).join(", ") })}>
                {others.map((p) => (
                  <span key={p.id} title={p.displayName} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#071015] text-xs font-bold text-black" style={{ backgroundColor: p.color }}>
                    {p.displayName.charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
          {walls.length > 1 && (
            <>
              <button type="button" aria-label={t("atlas.turnLeft")} onClick={() => turn(-1)} className="absolute left-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#f4e7b5] active:bg-black/60">
                ‹
              </button>
              <button type="button" aria-label={t("atlas.turnRight")} onClick={() => turn(1)} data-tour="at-turn" className="absolute right-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#f4e7b5] active:bg-black/60">
                ›
              </button>
              <button
                type="button"
                onClick={() => setShowSpots(true)}
                aria-label={t("atlas.showSpots")}
                data-tour="at-spots"
                className="absolute bottom-1 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-base active:bg-black/70"
              >
                👁
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
                {walls.map((w, i) => (
                  <span key={w} className={`h-1.5 w-1.5 rounded-full ${i === wallIdx ? "bg-[#f4e7b5]" : "bg-stone-600"}`} />
                ))}
              </div>
            </>
          )}
          {arrival && (
            <div className="at-arrive pointer-events-none absolute inset-x-0 top-6 flex justify-center" aria-hidden>
              <p className="rounded-full bg-black/55 px-5 py-2 font-serif text-xl tracking-wide text-[#f4e7b5] shadow-lg">{arrival}</p>
            </div>
          )}
        </main>

        <footer className="shrink-0 border-t border-[#1f3640] bg-[#0b161b]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {itemsOpen && (
            <div id="atlas-items" className="at-tray border-b border-[#1f3640] px-2 pt-1.5">
              <p className="px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">{t("atlas.things")}</p>
              <div className="flex min-h-16 gap-1.5 overflow-x-auto py-1">
                {scene.inventory.length === 0 && <p className="self-center px-1 text-sm text-stone-500">{t("atlas.thingsEmpty")}</p>}
                {scene.inventory.map((it) => (
                  <ItemTile key={it.id} item={it} onClick={() => setItemOpen(it.id)} fresh={arrived.has(it.id)} />
                ))}
              </div>
            </div>
          )}
          <nav className="grid grid-cols-5" aria-label={t("atlas.tab.aria")}>
            <TabButton
              icon="🎒"
              tour="at-items"
              label={t("atlas.tab.items")}
              active={itemsOpen}
              aria-expanded={itemsOpen}
              aria-controls="atlas-items"
              onClick={() => setItemsOpen(!itemsOpen)}
              badge={scene.inventory.length > 0 ? String(scene.inventory.length) : undefined}
              dot={newItems}
              glow={!itemsOpen && arrived.size > 0}
            />
            <TabButton icon="📝" tour="at-notebook" label={t("atlas.tab.notebook")} onClick={() => setNotebookOpen(true)} />
            <TabButton
              icon="📜"
              tour="at-hints"
              label={t("atlas.tab.hints")}
              aria-label={t("atlas.notesAria")}
              onClick={() => setNotesOpen(true)}
              dot={Boolean(nextHint && !nextHint.readyAt && scene.hints.length === 0)}
            />
            <TabButton icon="🧭" tour="at-places" label={t("atlas.places")} onClick={() => setPlacesOpen(true)} />
            <TabButton
              icon="👥"
              tour="at-room"
              label={t("atlas.roomButton", { count: state.players.filter((p) => p.online).length })}
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
            shake={shake}
            onClose={() => setCloseup(null)}
            act={act}
            go={go}
            notes={notesDocked ? <AtlasNotebook ctx={ctx} scene={scene} seen={seen} current={closeup} /> : null}
            notesOn={notesDocked}
            onNotes={() => setNotesDocked(!notesDocked)}
          />
        )}
        {itemOpen && <ItemSheet item={scene.inventory.find((i) => i.id === itemOpen) ?? null} onClose={() => setItemOpen(null)} />}
        {notebookOpen && (
          <Sheet title={t("atlas.notebook.title")} onClose={() => setNotebookOpen(false)} tall bare>
            <AtlasNotebook ctx={ctx} scene={scene} seen={seen} />
          </Sheet>
        )}
        {notesOpen && <NotesSheet scene={scene} here={here} busy={busy} onClose={() => setNotesOpen(false)} onAsk={() => void act({ type: "hint", where: here })} />}
        {letterOpen && scene.inventory.some((i) => i.id === letterOpen && i.reading) && (
          <LetterCard
            letter={scene.inventory.find((i) => i.id === letterOpen)!}
            held={lettersHeld(scene.inventory).length}
            onClose={() => setLetterOpen(null)}
          />
        )}
        {placesOpen && <PlacesSheet scene={scene} here={here} onClose={() => setPlacesOpen(false)} onGo={go} />}
        {scene.vote && !scene.ending && <VotePanel state={state} scene={scene} busy={busy} act={act} />}
        {scene.ending && <EndingPanel scene={scene} code={code} />}
        {intro && (
          <IntroCard
            onClose={() => {
              setIntro(false);
              try {
                localStorage.setItem(INTRO_KEY, "1");
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
            setTourOpen(true);
          }}
        />
        {tourOpen && (
          <Tour
            steps={ATLAS_TOUR}
            prefix="atlas.tour"
            doneKey="atlas.tour.done"
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
        <Toasts items={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((x) => x.id !== id))} placement={closeup || itemOpen || itemsOpen || roomOpen || notebookOpen ? "top" : "bottom"} />
      </div>
    </GameContext.Provider>
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
      {...aria}
      data-tour={tour}
      className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 active:bg-[#1f3640] ${glow ? "sm-new-tab" : ""} ${active ? "bg-[#0f2129] text-[#f4e7b5]" : "text-stone-300"}`}
    >
      {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[#d8b56a]" aria-hidden />}
      <span className="relative text-lg leading-none" aria-hidden>
        {icon}
        {badge && (
          <span
            className={`absolute -right-3 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${alert ? "bg-red-600 text-white" : "bg-[#d8b56a] text-[#14110a]"}`}
          >
            {badge}
          </span>
        )}
        {dot && !badge && <span className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-[#f4e7b5]" />}
        {dot && badge && <span className="absolute -left-1.5 -top-0.5 h-2 w-2 rounded-full bg-[#f4e7b5]" />}
      </span>
      <span className="max-w-full truncate text-[11px] leading-tight">{label}</span>
    </button>
  );
}

function ItemTile({ item, onClick, small, fresh }: { item: AtlasItemDTO; onClick: () => void; small?: boolean; fresh?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-16 shrink-0 flex-col items-center rounded-lg border border-[#1f3640] bg-[#0f2129] px-1 py-1 active:border-[#d8b56a] disabled:opacity-60 ${fresh ? "sm-new-tile" : ""}`}
    >
      <AtlasItemIcon id={item.id} className={small ? "h-8 w-8" : "h-9 w-9"} />
      <span className="mt-0.5 line-clamp-1 text-[10px] text-stone-300">{item.name}</span>
    </button>
  );
}

/**
 * A bottom sheet. `side` docks a second panel (the notebook) under it on phones and beside it on wider screens, so
 * a clue can stay in view while the puzzle is worked.
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
      className={`relative flex min-h-0 w-full flex-col overflow-hidden ${side ? "flex-1 md:w-auto" : `max-w-md rounded-t-2xl border-t border-[#9fd3c7]/40 ${tall ? "h-[86dvh]" : "max-h-[86dvh]"}`} bg-[#0b161b]`}
      style={side ? undefined : { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 px-4 pt-3">
        <h2 className="min-w-0 flex-1 font-serif text-xl text-[#f4e7b5]">{title}</h2>
        {headerExtra}
        <button onClick={onClose} aria-label={t("atlas.close")} className="flex h-10 w-10 items-center justify-center rounded-md text-stone-400 active:bg-[#1f3640]">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <div className={bare ? "min-h-0 flex-1" : "min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-2 pt-2"}>{children}</div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label={t("atlas.close")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      {side ? (
        <div
          className="relative flex h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t border-[#9fd3c7]/40 bg-[#0b161b] md:h-[86dvh] md:max-w-4xl md:flex-row"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {panel}
          <aside aria-label={t("atlas.notebook.title")} className="flex h-[42%] min-h-0 shrink-0 flex-col border-t border-[#d8b56a]/40 bg-[#071015] md:h-auto md:w-[44%] md:border-l md:border-t-0">
            {side}
          </aside>
        </div>
      ) : (
        <div className="relative flex w-full justify-center">{panel}</div>
      )}
    </div>
  );
}

const primary = "min-h-12 w-full rounded-lg bg-[#d8b56a] font-semibold text-[#14110a] active:bg-[#f4e7b5] disabled:opacity-60";

function CloseupSheet({
  id,
  scene,
  busy,
  shake,
  onClose,
  act,
  go,
  notes,
  notesOn,
  onNotes,
}: {
  id: HotspotId;
  scene: AtlasSceneDTO;
  busy: boolean;
  shake: boolean;
  onClose: () => void;
  act: (a: AtlasSceneAction) => Promise<AtlasActionResponse | null>;
  go: (p: LocationId) => void;
  /** The docked notebook, when it's on. */
  notes: React.ReactNode;
  notesOn: boolean;
  onNotes: () => void;
}) {
  const t = useT();
  const c = scene.closeups[id];
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
          className={`flex h-10 items-center gap-1 rounded-md border px-2.5 text-sm ${notesOn ? "border-[#d8b56a] bg-[#3a3320] text-[#f4e7b5]" : "border-[#d8b56a]/40 text-[#e9d9a6]"} active:bg-[#1f3640]`}
        >
          <span aria-hidden>📝</span>
          {t("atlas.notebook.toggle")}
        </button>
      }
    >
      {c.lines.map((l, i) => (
        <p key={i} className="text-[15px] leading-relaxed text-stone-200">
          {l}
        </p>
      ))}
      {c.doc && <AtlasDocView doc={c.doc} />}
      {c.mirrors && <MirrorGrid grid={c.mirrors} busy={busy} onTilt={(i) => void act({ type: "operate", target: id, op: `mirror:${i}` })} />}
      {c.tanks && <TankPanel tanks={c.tanks} />}
      {c.plate && (
        <PlatePanel
          plate={c.plate}
          held={scene.inventory.filter((i) => i.id.startsWith("seal-")).map((i) => ({ id: i.id, name: i.name }))}
          busy={busy}
          act={act}
        />
      )}
      {c.core && <CorePanel core={c.core} busy={busy} act={act} />}
      {c.valves && <ValvePanel valves={c.valves} busy={busy} onTurn={(v) => void act({ type: "operate", target: id, op: v })} />}
      {c.gate && <GatePanel powered={c.gate.powered} jammedUntil={c.gate.jammedUntil} busy={busy} onPull={(outer, inner) => void act({ type: "dial", outer, inner })} />}
      {c.lock && (
        <LockDial
          key={c.lock.id}
          length={c.lock.length}
          label={c.lock.label}
          faces={c.lock.kind === "symbols" ? GLYPHS.map((g) => g.char) : undefined}
          jammedUntil={c.lock.jammedUntil}
          busy={busy}
          shake={shake}
          onTry={(input) => void act({ type: "unlock", lock: c.lock!.id, input })}
        />
      )}
      {c.takes.map((it) => (
        <button
          key={it.id}
          type="button"
          disabled={busy}
          onClick={() => void act({ type: "take", item: it.id })}
          className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-[#d8b56a]/50 bg-[#0f2129] px-3 text-left active:bg-[#1f3640] disabled:opacity-60"
        >
          <AtlasItemIcon id={it.id} className="h-10 w-10 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#f4e7b5]">{t("atlas.take", { item: it.name })}</span>
            <span className="block text-xs text-stone-400">{it.description}</span>
          </span>
        </button>
      ))}
      {c.actions.map((a) => (
        <button
          key={a.op}
          type="button"
          disabled={busy}
          onClick={() => (a.op.startsWith("go:") ? go(a.op.slice(3) as LocationId) : void act({ type: "operate", target: id, op: a.op }))}
          className={primary}
        >
          {a.label}
        </button>
      ))}
      {scene.inventory.length > 0 && (
        <div className="border-t border-[#1f3640] pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">{t("atlas.useHere")}</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {scene.inventory.map((it) => (
              <ItemTile key={it.id} item={it} small onClick={() => !busy && void act({ type: "use", item: it.id, target: id })} />
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}

function ItemSheet({ item, onClose }: { item: AtlasItemDTO | null; onClose: () => void }) {
  const t = useT();
  if (!item) return null;
  return (
    <Sheet title={item.name} onClose={onClose}>
      <div className="flex items-center gap-3">
        <AtlasItemIcon id={item.id} className="h-16 w-16 shrink-0" />
        <p className="text-[15px] leading-relaxed text-stone-200">{item.description}</p>
      </div>
      {item.reading && <AtlasDocView doc={{ kind: "note", lines: [item.reading.title, ...item.reading.lines] }} />}
      <p className="text-xs text-stone-500">{t("atlas.useTip")}</p>
    </Sheet>
  );
}

/** The Cartographer's notes (hints) for the puzzle where this player stands. */
function NotesSheet({ scene, here, busy, onClose, onAsk }: { scene: AtlasSceneDTO; here: LocationId; busy: boolean; onClose: () => void; onAsk: () => void }) {
  const t = useT();
  const next = scene.nextHints[here] ?? null;
  const wait = useSecondsUntil(next?.readyAt);
  return (
    <Sheet title={t("atlas.notes.title")} onClose={onClose}>
      <p className="text-sm text-stone-400">{t("atlas.notes.intro")}</p>
      {[...scene.hints].reverse().map((h) => (
        <div key={h.id} className="rounded-sm bg-[#efe6cf] px-4 py-3 text-stone-800 shadow">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{t("atlas.notes.tier", { title: h.title, tier: h.tier })}</p>
          <p className="mt-1 text-[15px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            {h.text}
          </p>
        </div>
      ))}
      {next ? (
        <button type="button" disabled={busy || wait > 0} onClick={onAsk} className={primary}>
          {wait > 0 ? t("atlas.notes.busy", { s: wait }) : t("atlas.notes.ask", { title: next.title, tier: next.tier })}
        </button>
      ) : (
        <p className="text-sm text-stone-500">{t("atlas.notes.none")}</p>
      )}
    </Sheet>
  );
}

/** The Atlas: every place the team has reached, for fast travel. */
function PlacesSheet({ scene, here, onClose, onGo }: { scene: AtlasSceneDTO; here: LocationId; onClose: () => void; onGo: (p: LocationId) => void }) {
  const t = useT();
  return (
    <Sheet title={t("atlas.placesTitle")} onClose={onClose}>
      <p className="text-sm text-stone-400">{t("atlas.placesIntro")}</p>
      <div className="space-y-2">
        {scene.places.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.reachable || p.id === here}
            onClick={() => onGo(p.id)}
            className={`flex min-h-14 w-full items-center justify-between rounded-lg border px-3 text-left ${
              p.id === here ? "border-[#f4e7b5] bg-[#1f3640]" : p.reachable ? "border-[#9fd3c7]/40 bg-[#0f2129] active:bg-[#1f3640]" : "border-[#1f3640] bg-transparent"
            }`}
          >
            <span className={`font-serif text-lg ${p.reachable ? "text-stone-100" : "text-stone-600"}`}>{p.reachable ? p.name : "? ? ?"}</span>
            <span className="text-xs text-stone-500">{p.id === here ? t("atlas.here") : p.reachable ? "" : t("atlas.notReached")}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function IntroCard({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" role="dialog" aria-modal="true" aria-label={t("atlas.intro.title")}>
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-[#9fd3c7]/40 bg-[#0b161b] p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#9fd3c7]">{t("atlas.intro.when")}</p>
        <h2 className="font-serif text-2xl text-[#f4e7b5]">{t("atlas.intro.title")}</h2>
        <p className="font-serif text-[15px] leading-relaxed text-stone-200">{t("atlas.intro.text")}</p>
        <button type="button" onClick={onClose} className={primary}>
          {t("atlas.intro.start")}
        </button>
      </div>
    </div>
  );
}
