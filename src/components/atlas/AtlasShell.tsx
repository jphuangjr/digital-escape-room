"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomState } from "@/lib/types";
import type { AtlasActionResponse, AtlasItemDTO, AtlasSceneAction, AtlasSceneDTO, HotspotId, ItemId, LocationId } from "@/lib/atlas/types";
import { GLYPHS, LOCATIONS, WALLS } from "@/lib/atlas/types";
import { apiFetch, GameContext, type GameCtx } from "@/lib/client/game";
import { useChat } from "@/lib/client/chat";
import { RoomSheet, type RoomTab } from "@/components/shell/RoomSheet";
import { Toasts, type ToastItem } from "@/components/shell/Toasts";
import { CloseIcon } from "@/components/shell/icons";
import { LockDial } from "@/components/train/parts";
import { useT } from "@/i18n/client";
import { AtlasDocView, GatePanel, useSecondsUntil, ValvePanel } from "./parts";
import { PLACE_TINT, SPOTS } from "./walls";

/**
 * The room screen for The Atlas of Silent Worlds (staging): one wall at a time with placeholder art, tap to
 * look closer, a shared inventory, the Atlas of places reached. Where each player stands is their own;
 * everything found or opened is shared with the room. English only while in staging.
 */

const PRESENCE_MS = 15_000;
const TABS: RoomTab[] = ["people", "chat", "attempts"];
const INTRO_KEY = "atlas_intro_done";
const ITEM_ICON: Record<ItemId, string> = { token: "🪙", gear: "⚙️" };

export function AtlasShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const scene = state.scene as AtlasSceneDTO;
  const t = useT();
  const placeKey = `atlas_place_${code}`;
  const [place, setPlaceRaw] = useState<LocationId>("observatory");
  const [wallIdxBy, setWallIdxBy] = useState<Partial<Record<LocationId, number>>>({});
  const [closeup, setCloseup] = useState<HotspotId | null>(null);
  const [itemOpen, setItemOpen] = useState<ItemId | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [intro, setIntro] = useState(false);
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
    } catch {}
  }, [placeKey]);
  // Never stand somewhere the team can't reach (e.g. a stale saved place).
  const here: LocationId = canStand(place) ? place : "observatory";
  const walls = WALLS[here];
  const wallIdx = (wallIdxBy[here] ?? 0) % walls.length;
  const wall = walls[wallIdx];
  const placeName = scene.places.find((p) => p.id === here)?.name ?? "";

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
      for (const e of scene.log) if (!knownLog.current.has(e.id) && e.playerId !== state.me.id) toast(e.text, "success");
    }
    knownLog.current = new Set(scene.log.map((e) => e.id));
  }, [scene.log, state.me.id, toast]);
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
  const act = useCallback(
    async (action: AtlasSceneAction) => {
      if (busy) return null;
      setBusy(true);
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

  return (
    <GameContext.Provider value={ctx}>
      <div className="fixed inset-0 flex flex-col bg-[#071015] text-stone-200" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-[#1f3640] px-3">
          <p className="min-w-0 flex-1 truncate font-serif text-base text-[#f4e7b5]">{t("atlas.title", { place: placeName, wall: t(`atlas.wall.${wall}`) })}</p>
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            aria-label={t("atlas.notesAria")}
            className="relative flex h-10 w-10 items-center justify-center rounded-md active:bg-[#1f3640]"
          >
            📜
            {nextHint && !nextHint.readyAt && scene.hints.length === 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#f4e7b5]" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => setPlacesOpen(true)}
            className="flex h-10 items-center rounded-md border border-[#9fd3c7]/40 px-2.5 text-sm text-[#9fd3c7] active:bg-[#1f3640]"
          >
            {t("atlas.places")}
          </button>
          <button
            type="button"
            onClick={() => setRoomOpen(true)}
            className="relative flex h-10 items-center rounded-md border border-[#d8b56a]/50 px-2.5 text-sm text-[#f4e7b5] active:bg-[#1f3640]"
          >
            {t("atlas.roomButton", { count: state.players.filter((p) => p.online).length })}
            {chat.unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                {chat.unread}
              </span>
            )}
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
          <div className={`relative aspect-[3/4] h-full max-h-full max-w-full bg-gradient-to-b ${PLACE_TINT[here]}`}>
            <p className="absolute inset-x-0 top-3 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-[#6f9aa6]" aria-hidden>
              {t(`atlas.wall.${wall}`)}
            </p>
            {SPOTS[wall].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCloseup(s.id)}
                className="absolute flex flex-col items-center justify-center gap-1 rounded-xl border border-[#9fd3c7]/30 bg-[#0d1f26]/70 text-center outline-none ring-[#f4e7b5]/70 focus-visible:ring-2 active:bg-[#1f3640]"
                style={{ left: `${(s.x / 300) * 100}%`, top: `${(s.y / 400) * 100}%`, width: `${(s.w / 300) * 100}%`, height: `${(s.h / 400) * 100}%` }}
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {s.icon}
                </span>
                <span className="px-1 text-xs text-[#d6f2ec]">{t(`atlas.spot.${s.id}`)}</span>
              </button>
            ))}
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
              <button type="button" aria-label={t("atlas.turnRight")} onClick={() => turn(1)} className="absolute right-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#f4e7b5] active:bg-black/60">
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
                {walls.map((w, i) => (
                  <span key={w} className={`h-1.5 w-1.5 rounded-full ${i === wallIdx ? "bg-[#f4e7b5]" : "bg-stone-600"}`} />
                ))}
              </div>
            </>
          )}
        </main>

        <footer className="shrink-0 border-t border-[#1f3640] bg-[#0b161b] px-2 pt-1.5" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <p className="px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">{t("atlas.things")}</p>
          <div className="flex min-h-16 gap-1.5 overflow-x-auto py-1">
            {scene.inventory.length === 0 && <p className="self-center px-1 text-sm text-stone-500">{t("atlas.thingsEmpty")}</p>}
            {scene.inventory.map((it) => (
              <ItemTile key={it.id} item={it} onClick={() => setItemOpen(it.id)} />
            ))}
          </div>
        </footer>

        {closeup && <CloseupSheet id={closeup} scene={scene} busy={busy} shake={shake} onClose={() => setCloseup(null)} act={act} go={go} />}
        {itemOpen && <ItemSheet item={scene.inventory.find((i) => i.id === itemOpen) ?? null} onClose={() => setItemOpen(null)} />}
        {notesOpen && <NotesSheet scene={scene} here={here} busy={busy} onClose={() => setNotesOpen(false)} onAsk={() => void act({ type: "hint", where: here })} />}
        {placesOpen && <PlacesSheet scene={scene} here={here} onClose={() => setPlacesOpen(false)} onGo={go} />}
        {intro && (
          <IntroCard
            onClose={() => {
              setIntro(false);
              try {
                localStorage.setItem(INTRO_KEY, "1");
              } catch {}
            }}
          />
        )}
        <RoomSheet ctx={ctx} open={roomOpen} onClose={() => setRoomOpen(false)} tab={roomTab} setTab={setRoomTab} chat={chat} tabs={TABS} />
        <Toasts items={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((x) => x.id !== id))} placement={closeup || itemOpen || roomOpen ? "top" : "bottom"} />
      </div>
    </GameContext.Provider>
  );
}

function ItemTile({ item, onClick, small }: { item: AtlasItemDTO; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-[#1f3640] bg-[#0f2129] px-1 py-1 active:border-[#d8b56a] disabled:opacity-60"
    >
      <span className={small ? "text-2xl" : "text-3xl"} aria-hidden>
        {ITEM_ICON[item.id]}
      </span>
      <span className="mt-0.5 line-clamp-1 text-[10px] text-stone-300">{item.name}</span>
    </button>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label={t("atlas.close")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative flex max-h-[86dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t border-[#9fd3c7]/40 bg-[#0b161b]" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-2 px-4 pt-3">
          <h2 className="min-w-0 flex-1 font-serif text-xl text-[#f4e7b5]">{title}</h2>
          <button onClick={onClose} aria-label={t("atlas.close")} className="flex h-10 w-10 items-center justify-center rounded-md text-stone-400 active:bg-[#1f3640]">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-2 pt-2">{children}</div>
      </div>
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
}: {
  id: HotspotId;
  scene: AtlasSceneDTO;
  busy: boolean;
  shake: boolean;
  onClose: () => void;
  act: (a: AtlasSceneAction) => Promise<AtlasActionResponse | null>;
  go: (p: LocationId) => void;
}) {
  const t = useT();
  const c = scene.closeups[id];
  if (!c) return null;
  return (
    <Sheet title={c.title} onClose={onClose}>
      {c.lines.map((l, i) => (
        <p key={i} className="text-[15px] leading-relaxed text-stone-200">
          {l}
        </p>
      ))}
      {c.doc && <AtlasDocView doc={c.doc} />}
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
          <span className="text-3xl" aria-hidden>
            {ITEM_ICON[it.id]}
          </span>
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
        <span className="text-5xl" aria-hidden>
          {ITEM_ICON[item.id]}
        </span>
        <p className="text-[15px] leading-relaxed text-stone-200">{item.description}</p>
      </div>
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
