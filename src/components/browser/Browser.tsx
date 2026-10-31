"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useLocale, useT } from "@/i18n/client";
import { pick } from "@/i18n/config";
import { PUZZLE_AFFECTS_HOSTS } from "@/lib/client/discoveries";
import type { PlayerPublic, PuzzleId, ResolveResponse, SiteHistoryEntry, SitePage } from "@/lib/types";
import { normalizeAddress, type GameCtx } from "@/lib/client/game";
import { BackIcon, CodeIcon, CompassMark, ForwardIcon, HistoryIcon, ReloadIcon } from "@/components/shell/icons";
import { PresenceAvatars, teammates } from "@/components/shell/Presence";
import { useNow, useRelativeTime } from "@/components/apps/shared";
import { SiteRenderer } from "./SiteRenderer";
import { ViewSource } from "./ViewSource";

type View =
  | { kind: "newtab" }
  | { kind: "loading"; address: string }
  | { kind: "page"; page: SitePage }
  | { kind: "unreachable"; address: string }
  | { kind: "error"; address: string };

/** Sites this device has seen in the shared history, so newer ones can be marked "new". */
const seenKey = (code: string) => `ada_history_seen_${code}`;
function loadSeen(code: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(seenKey(code));
    return raw ? new Set(JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function Browser({
  ctx,
  navRequest,
  onAddressChange,
}: {
  ctx: GameCtx;
  navRequest: { address: string; n: number } | null;
  onAddressChange?: (address: string | null) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const { code } = ctx;
  // The room's shared history (server-built from everyone's visits), newest first.
  const siteHistory = ctx.state.siteHistory ?? [];
  const [reloading, setReloading] = useState(false);
  const [nav, setNav] = useState<{ entries: string[]; idx: number }>({ entries: [], idx: -1 });
  const [view, setViewState] = useState<View>({ kind: "newtab" });
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const reqId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const current = nav.idx >= 0 ? nav.entries[nav.idx] : null;

  // Hosts this device has already seen in the history; null until loaded. Anything else is new (a dot on the button).
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const historyHosts = siteHistory.map((e) => e.host).join(",");
  useEffect(() => {
    const stored = loadSeen(code);
    // First visit on this device: everything already there counts as seen.
    setSeen(stored ?? new Set(historyHosts ? historyHosts.split(",") : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);
  // New to this device, found by someone else (your own finds are never "new" to you).
  const unseen = seen ? siteHistory.filter((e) => !seen.has(e.host) && e.foundById !== ctx.state.me.id).map((e) => e.host) : [];
  // What was new when the menu opened: still labelled inside it, though opening it marks everything seen.
  const [menuNew, setMenuNew] = useState<string[]>([]);
  const markSeen = () => {
    const all = new Set(siteHistory.map((e) => e.host));
    setSeen(all);
    try {
      localStorage.setItem(seenKey(code), JSON.stringify([...all]));
    } catch {}
  };

  useEffect(() => {
    onAddressChange?.(current);
  }, [current, onAddressChange]);

  /** Load an address. mode: push = new history entry, replace = keep idx (reload / back / forward). */
  const load = useCallback(
    async (raw: string, mode: "push" | "stay", keepScroll = false) => {
      const address = normalizeAddress(raw);
      if (!address) return;
      const id = ++reqId.current;
      const c = ctxRef.current;
      setInput(address);
      setViewState((v) => (keepScroll && v.kind === "page" ? v : { kind: "loading", address }));
      if (mode === "push") {
        setNav((h) => {
          if (h.entries[h.idx] === address) return h;
          const entries = [...h.entries.slice(0, h.idx + 1), address];
          return { entries, idx: entries.length - 1 };
        });
      }
      const res = await c.api<ResolveResponse>("!/api/resolve", { method: "POST", body: { code: c.code, address } });
      if (id !== reqId.current) return;
      if (res.ok && res.data && res.data.ok) {
        const page = res.data.page;
        setViewState({ kind: "page", page });
        setInput(page.address);
        if (page.address !== address) {
          setNav((h) => {
            const entries = [...h.entries];
            if (entries[h.idx] === address) entries[h.idx] = page.address;
            return { entries, idx: h.idx };
          });
        }
        try {
          localStorage.setItem(`ada_last_addr_${c.code}`, page.address);
        } catch {}
        if (!keepScroll) scrollRef.current?.scrollTo({ top: 0 });
        if (JSON.stringify(res.data.progress) !== JSON.stringify(c.state.progress)) void c.refresh();
      } else if ((res.data && res.data.ok === false) || res.status === 404) {
        setViewState({ kind: "unreachable", address });
      } else {
        setViewState({ kind: "error", address });
      }
    },
    [],
  );

  // Restore last page on mount
  useEffect(() => {
    let last: string | null = null;
    try {
      last = localStorage.getItem(`ada_last_addr_${code}`);
    } catch {}
    if (last) void load(last, "push");
  }, [code, load]);

  // External navigation (links in email, notes, etc.)
  const lastNav = useRef(0);
  useEffect(() => {
    if (navRequest && navRequest.n !== lastNav.current) {
      lastNav.current = navRequest.n;
      void load(navRequest.address, "push");
    }
  }, [navRequest, load]);

  const go = (delta: number) => {
    const idx = nav.idx + delta;
    if (idx < 0 || idx >= nav.entries.length) return;
    setNav((h) => ({ ...h, idx }));
    void load(nav.entries[idx], "stay");
  };
  const reload = async () => {
    if (!current || reloading) return;
    setReloading(true);
    await load(current, "stay", true);
    setReloading(false);
  };

  // Pages are rendered by the server in the player's language: refetch the open page when it changes.
  const lastLocale = useRef(locale);
  useEffect(() => {
    if (lastLocale.current === locale) return;
    lastLocale.current = locale;
    if (current) void load(current, "stay", true);
  }, [locale, current, load]);

  // A solve (by anyone in the room) can change what a site shows: reload the open page if it's affected.
  const solvedKey = ctx.state.progress.solved.join(",");
  const lastSolved = useRef<string[] | null>(null);
  useEffect(() => {
    const solved = solvedKey ? solvedKey.split(",") : [];
    const prev = lastSolved.current;
    lastSolved.current = solved;
    if (!prev || !current) return;
    const added = solved.filter((p) => !prev.includes(p)) as PuzzleId[];
    const host = current.split("/")[0];
    if (added.some((p) => PUZZLE_AFFECTS_HOSTS[p]?.includes(host))) void load(current, "stay", true);
  }, [solvedKey, current, load]);

  const btn =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-stone-300 active:bg-stone-800 disabled:text-stone-700";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="relative z-30 shrink-0 border-b border-stone-800 bg-stone-900">
        <div className="flex items-center gap-0.5 px-1 py-1">
          <button
            className={`${btn} hidden sm:flex`}
            onClick={() => go(-1)}
            disabled={nav.idx <= 0}
            aria-label={t("browser.toolbar.back")}
          >
            <BackIcon className="h-5 w-5" />
          </button>
          <button
            className={`${btn} hidden sm:flex`}
            onClick={() => go(1)}
            disabled={nav.idx >= nav.entries.length - 1}
            aria-label={t("browser.toolbar.forward")}
          >
            <ForwardIcon className="h-5 w-5" />
          </button>
          <form
            className="flex min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              inputRef.current?.blur();
              void load(input, "push");
            }}
            role="search"
          >
            <label htmlFor="address-bar" className="sr-only">
              {t("browser.toolbar.address")}
            </label>
            <input
              id="address-bar"
              ref={inputRef}
              type="text"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              placeholder={t("browser.toolbar.addressPlaceholder")}
              className="h-10 w-full min-w-0 rounded-full border border-stone-700 bg-black px-4 font-mono text-base text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-500 md:text-sm"
            />
          </form>
          <button className={btn} onClick={reload} disabled={!current} aria-label={t("browser.toolbar.reload")}>
            <ReloadIcon className={`h-5 w-5 ${reloading ? "animate-spin" : ""}`} />
          </button>
          <button
            className={`${btn} relative`}
            onClick={() => {
              if (!menuOpen) {
                setMenuNew(unseen);
                markSeen();
              }
              setMenuOpen((v) => !v);
            }}
            aria-label={t("browser.history.button", { count: unseen.length })}
            aria-expanded={menuOpen}
          >
            <HistoryIcon className="h-5 w-5" />
            {unseen.length > 0 && <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400" />}
          </button>
        </div>
        {/* Secondary row: back/forward pair (mobile), page title, view source */}
        <div className="flex items-center gap-1 overflow-x-auto px-1 pb-1">
          <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-stone-800 sm:hidden">
            <button
              className={btn}
              onClick={() => go(-1)}
              disabled={nav.idx <= 0}
              aria-label={t("browser.toolbar.back")}
            >
              <BackIcon className="h-5 w-5" />
            </button>
            <span aria-hidden className="h-5 w-px bg-stone-800" />
            <button
              className={btn}
              onClick={() => go(1)}
              disabled={nav.idx >= nav.entries.length - 1}
              aria-label={t("browser.toolbar.forward")}
            >
              <ForwardIcon className="h-5 w-5" />
            </button>
          </div>
          <span className="min-w-0 flex-1 truncate px-2 text-xs text-stone-400">
            {view.kind === "page" ? view.page.title : view.kind === "loading" ? t("browser.toolbar.loading") : ""}
          </span>
          <button
            className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs text-stone-300 active:bg-stone-800 disabled:text-stone-700"
            onClick={() => setSourceOpen(true)}
            disabled={view.kind !== "page"}
            aria-label={t("browser.toolbar.viewSource")}
          >
            <CodeIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("browser.toolbar.viewSource")}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-1 top-full z-20 mt-1 max-h-[70vh] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-stone-700 bg-stone-900 p-1 shadow-2xl shadow-black">
            <HistoryList
              ctx={ctx}
              entries={siteHistory}
              unseen={menuNew}
              onOpen={(a) => {
                setMenuOpen(false);
                void load(a, "push");
              }}
            />
          </div>
        )}
      </div>

      {/* Viewport */}
      <div
        ref={scrollRef}
        className="relative isolate min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-stone-950"
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        {view.kind === "newtab" && (
          <NewTab ctx={ctx} entries={siteHistory} unseen={unseen} onOpen={(a) => void load(a, "push")} />
        )}
        {view.kind === "loading" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-stone-500">
            <CompassMark className="h-10 w-10 animate-spin text-amber-500/70 [animation-duration:2.5s]" />
            <p className="font-mono text-xs">{t("browser.loading.connecting", { address: view.address })}</p>
          </div>
        )}
        {view.kind === "page" && (
          <SiteRenderer
            page={view.page}
            ctx={ctx}
            onNavigate={(a) => void load(a, "push")}
            onSolved={() => void load(view.page.address, "stay", true)}
          />
        )}
        {(view.kind === "unreachable" || view.kind === "error") && (
          <div className="mx-auto flex max-w-md flex-col items-start gap-3 px-6 py-16 text-stone-300">
            <svg viewBox="0 0 48 48" className="h-14 w-14 text-stone-600" aria-hidden>
              <path d="M8 34l16-24 16 24z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M24 20v7M24 31v1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h2 className="text-xl text-stone-100">{t("browser.error.title")}</h2>
            <p className="break-all text-sm text-stone-400">
              <FormattedMessage
                id={view.kind === "unreachable" ? "browser.error.unreachable" : "browser.error.timeout"}
                values={{
                  address: view.address,
                  addr: (c) => <span className="font-mono text-stone-200">{c}</span>,
                }}
              />
            </p>
            <p className="font-mono text-xs text-stone-600">
              {view.kind === "unreachable" ? "ERR_NAME_NOT_RESOLVED" : "ERR_CONNECTION_TIMED_OUT"}
            </p>
            <button
              onClick={() => void load(view.address, "stay")}
              className="mt-2 min-h-11 rounded-md bg-stone-800 px-4 text-sm text-stone-100 active:bg-stone-700"
            >
              {t("common.retry")}
            </button>
          </div>
        )}
      </div>

      {sourceOpen && view.kind === "page" && (
        <ViewSource address={view.page.address} source={view.page.source} onClose={() => setSourceOpen(false)} />
      )}
    </div>
  );
}

const hostOf = (address: string) => address.split("/")[0];

/**
 * Which teammates have each site open, by host. Only sites the team has already visited are named (every
 * page that loads counts), so a half-typed guess or a site nobody has reached never shows up here.
 */
function teamByHost(ctx: GameCtx): Map<string, PlayerPublic[]> {
  const known = new Set(ctx.state.progress.visitedSites);
  const byHost = new Map<string, PlayerPublic[]>();
  for (const p of teammates(ctx.state.players, ctx.state.me.id, (v) => v.startsWith("browser:"))) {
    const host = hostOf(p.currentView!.slice(8));
    if (!known.has(host)) continue;
    byHost.set(host, [...(byHost.get(host) ?? []), p]);
  }
  return byHost;
}

/**
 * The room's shared history: every site anyone has opened, newest first, with who found it and who's on it now.
 * A site someone else just found is marked new until this device has seen it.
 */
function HistoryList({
  ctx,
  entries,
  unseen,
  onOpen,
}: {
  ctx: GameCtx;
  entries: SiteHistoryEntry[];
  unseen: string[];
  onOpen: (address: string) => void;
}) {
  const t = useT();
  const now = useNow(30_000);
  const rel = useRelativeTime();
  const team = teamByHost(ctx);
  return (
    <div className="text-left">
      <p className="px-3 pb-0.5 pt-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{t("browser.history.title")}</p>
      <p className="px-3 pb-1 text-xs text-stone-500">{t("browser.history.shared")}</p>
      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.host}>
            <button
              onClick={() => onOpen(e.host)}
              className="flex min-h-14 w-full items-center gap-3 rounded-lg px-3 py-2 text-left active:bg-stone-800"
            >
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 font-serif text-amber-300">
                {e.title.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm text-stone-100">{e.title}</span>
                  {unseen.includes(e.host) && (
                    <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 text-10px font-semibold uppercase tracking-wider text-amber-300">
                      {t("browser.history.new")}
                    </span>
                  )}
                </span>
                <span className="block truncate font-mono text-xs text-stone-500">{e.host}</span>
                <span className="block truncate text-xs text-stone-500">
                  {e.foundBy
                    ? t("browser.history.foundBy", {
                        name: e.foundBy,
                        isMe: e.foundById === ctx.state.me.id,
                        when: e.foundAt ? rel(e.foundAt, now) : "",
                      })
                    : t("browser.history.start")}
                </span>
              </span>
              <PresenceAvatars players={team.get(e.host) ?? []} size="sm" ring="#1c1917" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewTab({
  ctx,
  entries,
  unseen,
  onOpen,
}: {
  ctx: GameCtx;
  entries: SiteHistoryEntry[];
  unseen: string[];
  onOpen: (address: string) => void;
}) {
  const t = useT();
  const x = pick(useLocale());
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center">
      <CompassMark className="h-16 w-16 text-amber-500/60" />
      <p className="mt-4 font-serif text-lg text-stone-200">{t("browser.newTab.title")}</p>
      <p className="mt-1 text-sm italic text-stone-500">&ldquo;{x({ en: "Start at the beginning.", ko: "처음부터 시작해.", "zh-TW": "從頭開始。", es: "Empieza por el principio.", ja: "最初から始めて。", "pt-BR": "Comece pelo começo." })}&rdquo;</p>
      <div className="mt-8 w-full rounded-xl border border-stone-800 bg-stone-900/60 p-1">
        <HistoryList ctx={ctx} entries={entries} unseen={unseen} onOpen={onOpen} />
      </div>
    </div>
  );
}
