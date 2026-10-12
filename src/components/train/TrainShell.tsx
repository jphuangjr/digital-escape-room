"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomState } from "@/lib/types";
import type { HotspotId, ItemDTO, ItemId, SceneAction, SceneActionResponse, SceneDTO, TrainRoomId, WallId } from "@/lib/train/types";
import { WALLS_12B } from "@/lib/train/types";
import { apiFetch, GameContext, type GameCtx } from "@/lib/client/game";
import { useChat } from "@/lib/client/chat";
import { RoomSheet, type RoomTab } from "@/components/shell/RoomSheet";
import { Toasts, type ToastItem } from "@/components/shell/Toasts";
import { CloseIcon } from "@/components/shell/icons";
import { CorridorArt, HOTSPOTS, WALL_NAMES, WallArt } from "./walls";
import { CloseupDocView, ItemIcon, ItemReading, LockDial } from "./parts";
import { setSoundPreferred, soundPreferred, TrainAmbience } from "./sound";

/**
 * The room screen for The Nightingale Express (staging): one illustrated wall at a time, tap to look
 * closer, a shared inventory tray, padlocks. Everything found or opened is shared with the room.
 * English only while in staging.
 */

const PRESENCE_MS = 15_000;
const TABS: RoomTab[] = ["people", "chat"];

export function TrainShell({ code, state, refresh }: { code: string; state: RoomState; refresh: () => Promise<void> }) {
  const scene = state.scene as SceneDTO;
  const [wallIdx, setWallIdx] = useState(0);
  const [place, setPlace] = useState<TrainRoomId>("12b");
  const [closeup, setCloseup] = useState<HotspotId | null>(null);
  const [itemOpen, setItemOpen] = useState<ItemId | null>(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomTab, setRoomTab] = useState<RoomTab>("people");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const chat = useChat(code, state.me.id);
  const wall: WallId = WALLS_12B[wallIdx];

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
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundPreferred(next);
    if (next) ambience.current?.start();
    else ambience.current?.stop();
  };

  // ---------- presence ----------
  const view = place === "corridor" ? "train:corridor" : `train:${wall}`;
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
        if (knownLog.current.has(e.id) || e.playerId === state.me.id) continue;
        toast(`${e.playerName} ${e.text}`, "success");
      }
    }
    knownLog.current = new Set(scene.log.map((e) => e.id));
  }, [scene.log, state.me.id, toast]);

  // ---------- chat toasts ----------
  const knownChat = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!chat.loaded) return;
    const visible = roomOpen && roomTab === "chat";
    if (knownChat.current && !visible) {
      for (const m of chat.messages) {
        if (knownChat.current.has(m.id) || m.playerId === state.me.id) continue;
        toast(`${m.playerName}: ${m.body.length > 70 ? `${m.body.slice(0, 70)}…` : m.body}`, "info", {
          label: "Reply",
          onClick: () => {
            setRoomTab("chat");
            setRoomOpen(true);
          },
        });
      }
    }
    knownChat.current = new Set(chat.messages.map((m) => m.id));
  }, [chat.messages, chat.loaded, roomOpen, roomTab, state.me.id, toast]);

  // ---------- actions ----------
  const act = useCallback(
    async (action: SceneAction) => {
      if (busy) return null;
      setBusy(true);
      const res = await apiFetch<SceneActionResponse>(code, "/scene", { method: "POST", body: action });
      setBusy(false);
      const data = res.data;
      if (!data || typeof data !== "object" || !("scene" in data)) {
        toast("Couldn't reach the train. Try again.", "error");
        return null;
      }
      if (data.message) toast(data.message, data.ok ? "success" : "info");
      if (!data.ok && action.type === "unlock") {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      if (data.ok) void refresh();
      return data;
    },
    [busy, code, refresh, toast],
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
  const turn = (d: number) => setWallIdx((i) => (i + d + WALLS_12B.length) % WALLS_12B.length);
  const pouchHere = !scene.inventory.some((i) => i.id === "pouch") && Boolean(scene.closeups["under-berth"]?.takes.length);
  const here = state.players.filter((p) => p.online && p.id !== state.me.id && p.currentView === view);

  return (
    <GameContext.Provider value={ctx}>
      <div className="fixed inset-0 flex flex-col bg-[#120c07] text-stone-200" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* top bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#3d2615] px-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base text-[#ecd27a]">
              {place === "corridor" ? "The corridor" : `Compartment 12B · ${WALL_NAMES[wall]}`}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute train sounds" : "Play train sounds"}
            className="flex h-10 w-10 items-center justify-center rounded-md text-[#ecd27a] active:bg-[#3d2615]"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            onClick={() => setRoomOpen(true)}
            className="relative flex h-10 items-center gap-1.5 rounded-md border border-[#c9a227]/50 px-3 text-sm text-[#ecd27a] active:bg-[#3d2615]"
          >
            {state.players.filter((p) => p.online).length} · Room
            {chat.unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                {chat.unread}
              </span>
            )}
          </button>
        </header>

        {/* the wall */}
        <main
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || place !== "12b") return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) turn(dx < 0 ? 1 : -1);
          }}
        >
          <div className="relative aspect-[3/4] h-full max-h-full max-w-full">
            {place === "corridor" ? (
              <CorridorArt />
            ) : (
              <>
                <WallArt wall={wall} flags={scene.flags} mirrorLetters={scene.mirrorLetters} pouchHere={pouchHere} />
                {HOTSPOTS[wall].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    aria-label={h.label}
                    onClick={() => setCloseup(h.id)}
                    className="absolute rounded-lg outline-none ring-[#ecd27a]/70 transition hover:ring-2 focus-visible:ring-2 active:bg-[#ecd27a]/15"
                    style={{ left: `${(h.x / 300) * 100}%`, top: `${(h.y / 400) * 100}%`, width: `${(h.w / 300) * 100}%`, height: `${(h.h / 400) * 100}%` }}
                  />
                ))}
              </>
            )}
            {here.length > 0 && (
              <div className="absolute right-2 top-2 flex -space-x-1.5" aria-label={`${here.map((p) => p.displayName).join(", ")} looking here too`}>
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

          {place === "12b" ? (
            <>
              <button
                type="button"
                aria-label="Turn left"
                onClick={() => turn(-1)}
                className="absolute left-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#ecd27a] active:bg-black/60"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Turn right"
                onClick={() => turn(1)}
                className="absolute right-1 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-black/40 text-2xl text-[#ecd27a] active:bg-black/60"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
                {WALLS_12B.map((w, i) => (
                  <span key={w} className={`h-1.5 w-1.5 rounded-full ${i === wallIdx ? "bg-[#ecd27a]" : "bg-stone-600"}`} />
                ))}
              </div>
            </>
          ) : (
            <div className="absolute inset-x-0 bottom-4 mx-auto flex w-[min(92%,22rem)] flex-col gap-2 rounded-xl border border-[#c9a227]/40 bg-[#1b120b]/95 p-4 text-center">
              <p className="font-serif text-[#ecd27a]">The corridor is dark and empty.</p>
              <p className="text-sm text-stone-300">
                At the far end, warm light shows through the dining car door. The dining car opens in the next update.
              </p>
              <button
                type="button"
                onClick={() => setPlace("12b")}
                className="mt-1 min-h-11 rounded-md border border-[#c9a227]/50 text-sm text-[#ecd27a] active:bg-[#3d2615]"
              >
                ← Back to Compartment 12B
              </button>
            </div>
          )}
        </main>

        {/* inventory */}
        <footer className="shrink-0 border-t border-[#3d2615] bg-[#1b120b] px-2 pt-1.5" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <p className="px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">Your things</p>
          <div className="flex min-h-16 gap-1.5 overflow-x-auto py-1">
            {scene.inventory.length === 0 && <p className="self-center px-1 text-sm text-stone-500">Nothing yet. Tap around the room.</p>}
            {scene.inventory.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setItemOpen(it.id)}
                className="relative flex w-16 shrink-0 flex-col items-center rounded-lg border border-[#3d2615] bg-[#24160c] px-1 py-1 active:border-[#c9a227]"
              >
                <ItemIcon id={it.id} className="h-9 w-9" />
                <span className="mt-0.5 line-clamp-1 text-[10px] text-stone-300">{it.name}</span>
                {it.evidence && <span className="absolute right-0.5 top-0.5 text-[10px]" aria-label="Evidence">🔍</span>}
              </button>
            ))}
          </div>
        </footer>

        {closeup && (
          <CloseupSheet
            id={closeup}
            scene={scene}
            busy={busy}
            shake={shake}
            onClose={() => setCloseup(null)}
            act={act}
            goCorridor={() => {
              setCloseup(null);
              setPlace("corridor");
            }}
          />
        )}
        {itemOpen && (
          <ItemSheet
            item={scene.inventory.find((i) => i.id === itemOpen) ?? null}
            others={scene.inventory.filter((i) => i.id !== itemOpen)}
            busy={busy}
            onClose={() => setItemOpen(null)}
            onCombine={async (other) => {
              const r = await act({ type: "combine", items: [itemOpen, other] });
              if (r?.ok) setItemOpen(null);
            }}
          />
        )}
        <RoomSheet ctx={ctx} open={roomOpen} onClose={() => setRoomOpen(false)} tab={roomTab} setTab={setRoomTab} chat={chat} tabs={TABS} />
        <Toasts items={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} placement={closeup || itemOpen || roomOpen ? "top" : "bottom"} />
      </div>
    </GameContext.Provider>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative flex max-h-[86dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t border-[#c9a227]/40 bg-[#1b120b]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2 px-4 pt-3">
          <h2 className="min-w-0 flex-1 font-serif text-xl text-[#ecd27a]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-md text-stone-400 active:bg-[#3d2615]">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-2 pt-2">{children}</div>
      </div>
    </div>
  );
}

function CloseupSheet({
  id,
  scene,
  busy,
  shake,
  onClose,
  act,
  goCorridor,
}: {
  id: HotspotId;
  scene: SceneDTO;
  busy: boolean;
  shake: boolean;
  onClose: () => void;
  act: (a: SceneAction) => Promise<SceneActionResponse | null>;
  goCorridor: () => void;
}) {
  const c = scene.closeups[id];
  if (!c) return null;
  return (
    <Sheet title={c.title} onClose={onClose}>
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
                <span className="block text-sm font-semibold text-[#ecd27a]">Take: {it.name}</span>
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
          busy={busy}
          shake={shake}
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
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">Use something here</p>
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
}: {
  item: ItemDTO | null;
  others: ItemDTO[];
  busy: boolean;
  onClose: () => void;
  onCombine: (other: ItemId) => void;
}) {
  if (!item) return null;
  return (
    <Sheet title={item.name} onClose={onClose}>
      <div className="flex items-center gap-3">
        <ItemIcon id={item.id} className="h-16 w-16 shrink-0" />
        <p className="text-[15px] leading-relaxed text-stone-200">{item.description}</p>
      </div>
      {item.evidence && <p className="text-xs text-[#ecd27a]">🔍 Evidence. Keep it for when you name the thief.</p>}
      <ItemReading item={item} />
      {others.length > 0 && (
        <div className="border-t border-[#3d2615] pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-stone-500">Combine with</p>
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
      <p className="text-xs text-stone-500">To use it on something, tap that thing in the room.</p>
    </Sheet>
  );
}
