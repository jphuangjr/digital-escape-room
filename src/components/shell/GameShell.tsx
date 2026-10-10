"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/lib/client/chat";
import type { RoomTab } from "./RoomSheet";
import { describeDiscovery } from "@/lib/client/discoveries";
import type { AppId, RoomState } from "@/lib/types";
import { apiFetch, GameContext, type GameCtx } from "@/lib/client/game";
import { Browser } from "@/components/browser/Browser";
import { NotesApp } from "@/components/apps/NotesApp";
import { EmailApp, EMAILS_READ_EVENT, unreadCount } from "@/components/apps/EmailApp";
import { FilesApp } from "@/components/apps/FilesApp";
import { DecoderApp } from "@/components/apps/DecoderApp";
import { VoteOverlay } from "@/components/apps/VoteOverlay";
import { APP_META, APP_ORDER, CloseIcon, CompassMark, LockIcon } from "./icons";
import { Dock } from "./Dock";
import { StatusBar } from "./StatusBar";
import { RoomSheet } from "./RoomSheet";
import { Toasts, type ToastItem } from "./Toasts";

const PRESENCE_MS = 15_000;

export function GameShell({
  code,
  state,
  refresh,
}: {
  code: string;
  state: RoomState;
  refresh: () => Promise<void>;
}) {
  const [active, setActive] = useState<AppId | null>("browser");
  const [mounted, setMounted] = useState<AppId[]>(["browser"]);
  const [navRequest, setNavRequest] = useState<{ address: string; n: number } | null>(null);
  const [browserAddress, setBrowserAddress] = useState<string | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomTab, setRoomTab] = useState<RoomTab>("people");
  const chat = useChat(code, state.me.id);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [unreadEmails, setUnreadEmails] = useState(0);
  const toastId = useRef(0);

  const unlocked = state.progress.unlockedApps;
  const isUnlocked = useCallback(
    (app: AppId) => app !== "decoder" || unlocked.includes("decoder"),
    [unlocked],
  );

  // ---------- toasts ----------
  const toast = useCallback<GameCtx["toast"]>((msg, tone = "info", action) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, msg, tone, action }]);
    // Leave actionable toasts up a little longer so there's time to tap them.
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 7000 : 3800);
  }, []);

  // ---------- presence ----------
  const viewRef = useRef<string>("browser:newtab");
  const sendPresence = useCallback(
    (view: string) => {
      void apiFetch(code, "/presence", { method: "POST", body: { view } });
    },
    [code],
  );
  const setView = useCallback(
    (view: string) => {
      if (viewRef.current === view) return;
      viewRef.current = view;
      sendPresence(view);
    },
    [sendPresence],
  );
  useEffect(() => {
    sendPresence(viewRef.current);
    const t = setInterval(() => sendPresence(viewRef.current), PRESENCE_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") sendPresence(viewRef.current);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [sendPresence]);

  useEffect(() => {
    if (active === "browser") setView(`browser:${browserAddress ?? "newtab"}`);
    else if (active) setView(`app:${active}`);
    else setView("desktop");
  }, [active, browserAddress, setView]);

  // ---------- app switching ----------
  const openApp = useCallback(
    (app: AppId) => {
      if (!isUnlocked(app)) {
        toast("Decoder is locked. Keep digging through the sites.", "info");
        return;
      }
      setMounted((m) => (m.includes(app) ? m : [...m, app]));
      setActive(app);
      setRoomOpen(false);
    },
    [isUnlocked, toast],
  );
  const openAddress = useCallback((address: string) => {
    setMounted((m) => (m.includes("browser") ? m : [...m, "browser"]));
    setActive("browser");
    setRoomOpen(false);
    setNavRequest((r) => ({ address, n: (r?.n ?? 0) + 1 }));
  }, []);

  // ---------- decoder unlock toast ----------
  const decoderWasUnlocked = useRef<boolean>(unlocked.includes("decoder"));
  useEffect(() => {
    const now = unlocked.includes("decoder");
    if (now && !decoderWasUnlocked.current) toast("Decoder unlocked! Find it in your dock.", "success");
    decoderWasUnlocked.current = now;
  }, [unlocked, toast]);

  // ---------- teammates' discoveries ----------
  // Toast what other players find (the finder already knows). Seed with what's already in the log so
  // joining or reloading mid-game doesn't replay the whole case.
  const knownDiscoveries = useRef<Set<string> | null>(null);
  useEffect(() => {
    const list = state.progress.discoveries;
    if (knownDiscoveries.current) {
      for (const d of list) {
        if (knownDiscoveries.current.has(d.id) || d.playerId === state.me.id) continue;
        const msg = `${d.playerName} ${describeDiscovery(d)}`;
        if (d.kind === "site") toast(msg, "info", { label: "Open", onClick: () => openAddress(d.host) });
        else toast(msg, "success");
      }
    }
    knownDiscoveries.current = new Set(list.map((d) => d.id));
  }, [state.progress.discoveries, state.me.id, toast, openAddress]);

  // ---------- chat toasts (when the chat isn't on screen) ----------
  const chatVisible = roomOpen && roomTab === "chat";
  const knownChat = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!chat.loaded) return;
    if (knownChat.current && !chatVisible) {
      for (const m of chat.messages) {
        if (knownChat.current.has(m.id) || m.playerId === state.me.id) continue;
        const preview = m.body.length > 70 ? `${m.body.slice(0, 70)}…` : m.body;
        toast(`${m.playerName}: ${preview}`, "info", {
          label: "Reply",
          onClick: () => {
            setRoomTab("chat");
            setRoomOpen(true);
          },
        });
      }
    }
    knownChat.current = new Set(chat.messages.map((m) => m.id));
  }, [chat.messages, chat.loaded, chatVisible, state.me.id, toast]);

  // ---------- email unread ----------
  useEffect(() => {
    const recompute = () => setUnreadEmails(unreadCount(code, state.emails));
    recompute();
    window.addEventListener(EMAILS_READ_EVENT, recompute);
    return () => window.removeEventListener(EMAILS_READ_EVENT, recompute);
  }, [code, state.emails]);
  const knownEmails = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = state.emails.map((e) => e.id);
    if (knownEmails.current) {
      const fresh = state.emails.filter((e) => !knownEmails.current!.has(e.id));
      if (fresh.length) {
        const vm = fresh.find((e) => e.kind === "voicemail");
        toast(vm ? `New voicemail: ${vm.subject}` : `New email: ${fresh[0].subject}`, "info");
      }
    }
    knownEmails.current = new Set(ids);
  }, [state.emails, toast]);
  // ---------- context ----------
  const api = useCallback<GameCtx["api"]>((path, init) => apiFetch(code, path, init), [code]);
  const ctx = useMemo<GameCtx>(
    () => ({ code, state, refresh, api, openApp, openAddress, setView, toast }),
    [code, state, refresh, api, openApp, openAddress, setView, toast],
  );

  const badges: Partial<Record<AppId, number>> = { email: unreadEmails };

  return (
    <GameContext.Provider value={ctx}>
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0b0a08] text-stone-200">
        <Grain />
        <StatusBar
          ctx={ctx}
          active={active}
          chatUnread={chat.unread}
          onRoom={() => setRoomOpen(true)}
          onHome={() => setActive(null)}
        />

        <div className="relative flex min-h-0 flex-1">
          {/* Desktop icons (≥768px) */}
          <nav
            aria-label="Desktop"
            className="hidden w-28 shrink-0 flex-col items-center gap-3 overflow-y-auto py-6 md:flex"
          >
            {APP_ORDER.map((app) => (
              <AppTile
                key={app}
                app={app}
                locked={!isUnlocked(app)}
                badge={badges[app]}
                active={active === app}
                onClick={() => openApp(app)}
                size="sm"
              />
            ))}
          </nav>

          <main className="relative flex min-h-0 min-w-0 flex-1 md:p-5 md:pl-1">
            {active === null && <HomeScreen isUnlocked={isUnlocked} badges={badges} openApp={openApp} />}
            <div
              className={`relative min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-stone-950 md:mx-auto md:max-w-5xl md:rounded-xl md:border md:border-stone-800 md:shadow-2xl md:shadow-black ${
                active === null ? "hidden" : "flex"
              }`}
            >
              {/* Window chrome, desktop only */}
              <div className="hidden h-10 shrink-0 items-center gap-2 border-b border-stone-800 bg-stone-900/80 px-3 md:flex">
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close window"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 active:bg-stone-800"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400">
                  {active ? APP_META[active].label : ""}
                </span>
              </div>
              {mounted.map((app) => (
                <section
                  key={app}
                  aria-label={APP_META[app].label}
                  className={`min-h-0 flex-1 flex-col ${active === app ? "flex" : "hidden"} ${
                    app === "browser" ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"
                  }`}
                >
                  {app === "browser" && (
                    <Browser ctx={ctx} navRequest={navRequest} onAddressChange={setBrowserAddress} />
                  )}
                  {app === "notes" && <NotesApp ctx={ctx} />}
                  {app === "email" && <EmailApp ctx={ctx} />}
                  {app === "files" && <FilesApp ctx={ctx} />}
                  {app === "decoder" && isUnlocked("decoder") && <DecoderApp ctx={ctx} />}
                </section>
              ))}
            </div>
          </main>
        </div>

        <Dock
          active={active}
          isUnlocked={isUnlocked}
          badges={badges}
          onOpen={openApp}
          onRoom={() => setRoomOpen(true)}
          onlineCount={state.players.filter((p) => p.online).length}
          chatUnread={chat.unread}
        />

        <RoomSheet
          ctx={ctx}
          open={roomOpen}
          onClose={() => setRoomOpen(false)}
          tab={roomTab}
          setTab={setRoomTab}
          chat={chat}
        />
        <Toasts
          items={toasts}
          placement={roomOpen ? "top" : "bottom"}
          onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
        />
        <VoteOverlay ctx={ctx} />
      </div>
    </GameContext.Provider>
  );
}

export function AppTile({
  app,
  locked,
  badge,
  active,
  onClick,
  size = "lg",
}: {
  app: AppId;
  locked: boolean;
  badge?: number;
  active?: boolean;
  onClick: () => void;
  size?: "sm" | "lg";
}) {
  const { label, Icon } = APP_META[app];
  return (
    <button
      onClick={onClick}
      aria-label={`${label}${locked ? " (locked)" : ""}${badge ? `, ${badge} unread` : ""}`}
      aria-current={active ? "true" : undefined}
      className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-2 ${size === "lg" ? "w-24" : "w-20"} ${
        active ? "bg-amber-500/10" : ""
      } active:bg-stone-800/70`}
    >
      <span
        className={`relative flex items-center justify-center rounded-2xl border ${
          size === "lg" ? "h-16 w-16" : "h-12 w-12"
        } ${
          locked
            ? "border-stone-800 bg-stone-900 text-stone-600"
            : "border-amber-500/30 bg-gradient-to-b from-stone-800 to-stone-900 text-amber-400"
        }`}
      >
        <Icon className={size === "lg" ? "h-8 w-8" : "h-6 w-6"} />
        {locked && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-stone-200">
            <LockIcon className="h-3 w-3" />
          </span>
        )}
        {!!badge && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className={`text-xs ${locked ? "text-stone-600" : "text-stone-300"}`}>{label}</span>
    </button>
  );
}

function HomeScreen({
  isUnlocked,
  badges,
  openApp,
}: {
  isUnlocked: (a: AppId) => boolean;
  badges: Partial<Record<AppId, number>>;
  openApp: (a: AppId) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8">
      <CompassMark className="h-24 w-24 text-amber-500/30" />
      <p className="mt-3 max-w-xs text-center font-serif text-sm italic text-stone-500">
        &ldquo;If you&apos;re reading this, I got too close. Start at the beginning.&rdquo;
      </p>
      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
        {APP_ORDER.map((app) => (
          <AppTile key={app} app={app} locked={!isUnlocked(app)} badge={badges[app]} onClick={() => openApp(app)} />
        ))}
      </div>
    </div>
  );
}

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] mix-blend-screen"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
