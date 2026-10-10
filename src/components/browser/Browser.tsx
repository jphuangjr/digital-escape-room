"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useLocale, useT } from "@/i18n/client";
import { pick } from "@/i18n/config";
import { PUZZLE_AFFECTS_HOSTS } from "@/lib/client/discoveries";
import type { PuzzleId, ResolveResponse, SitePage } from "@/lib/types";
import { normalizeAddress, type GameCtx } from "@/lib/client/game";
import {
  BackIcon,
  BookmarksIcon,
  CodeIcon,
  CompassMark,
  ForwardIcon,
  ReloadIcon,
  StarIcon,
} from "@/components/shell/icons";
import { SiteRenderer } from "./SiteRenderer";
import { ViewSource } from "./ViewSource";

interface Bookmark {
  address: string;
  title: string;
}
const DEFAULT_BOOKMARKS: Bookmark[] = [{ address: "meridian-inst.net", title: "Meridian Institute" }];

/** The starter bookmark is stored in English; show it in the player's language. */
function bookmarkTitle(b: Bookmark, x: ReturnType<typeof pick>): string {
  return b.address === "meridian-inst.net" && b.title === "Meridian Institute"
    ? x({ en: "Meridian Institute", ko: "메리디언 연구소", "zh-TW": "子午研究院", es: "Instituto Meridian", ja: "メリディアン研究所", "pt-BR": "Instituto Meridian" })
    : b.title;
}

type View =
  | { kind: "newtab" }
  | { kind: "loading"; address: string }
  | { kind: "page"; page: SitePage }
  | { kind: "unreachable"; address: string }
  | { kind: "error"; address: string };

function loadBookmarks(code: string): Bookmark[] {
  try {
    const raw = localStorage.getItem(`ada_bookmarks_${code}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Bookmark[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return DEFAULT_BOOKMARKS;
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
  const x = pick(useLocale());
  const { code } = ctx;
  const [history, setHistory] = useState<{ entries: string[]; idx: number }>({ entries: [], idx: -1 });
  const [view, setViewState] = useState<View>({ kind: "newtab" });
  const [input, setInput] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(DEFAULT_BOOKMARKS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const reqId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const current = history.idx >= 0 ? history.entries[history.idx] : null;

  useEffect(() => {
    setBookmarks(loadBookmarks(code));
  }, [code]);
  const saveBookmarks = (b: Bookmark[]) => {
    setBookmarks(b);
    try {
      localStorage.setItem(`ada_bookmarks_${code}`, JSON.stringify(b));
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
        setHistory((h) => {
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
          setHistory((h) => {
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
    const idx = history.idx + delta;
    if (idx < 0 || idx >= history.entries.length) return;
    setHistory((h) => ({ ...h, idx }));
    void load(history.entries[idx], "stay");
  };
  const reload = () => {
    if (current) void load(current, "stay", true);
  };

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

  const pageAddr = view.kind === "page" ? view.page.address : null;
  const isBookmarked = !!pageAddr && bookmarks.some((b) => b.address === pageAddr);
  const toggleBookmark = () => {
    if (view.kind !== "page") return;
    const p = view.page;
    if (isBookmarked) saveBookmarks(bookmarks.filter((b) => b.address !== p.address));
    else saveBookmarks([...bookmarks, { address: p.address, title: p.title }]);
    ctx.toast(isBookmarked ? t("browser.toolbar.bookmarkRemoved") : t("browser.toolbar.bookmarked"), "info");
  };

  const btn =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-stone-300 active:bg-stone-800 disabled:text-stone-700";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="relative z-10 shrink-0 border-b border-stone-800 bg-stone-900">
        <div className="flex items-center gap-0.5 px-1 py-1">
          <button className={btn} onClick={() => go(-1)} disabled={history.idx <= 0} aria-label={t("browser.toolbar.back")}>
            <BackIcon className="h-5 w-5" />
          </button>
          <button
            className={`${btn} hidden sm:flex`}
            onClick={() => go(1)}
            disabled={history.idx >= history.entries.length - 1}
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
            <ReloadIcon className="h-5 w-5" />
          </button>
          <button
            className={btn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t("browser.toolbar.menu")}
            aria-expanded={menuOpen}
          >
            <BookmarksIcon className="h-5 w-5" />
          </button>
        </div>
        {/* Secondary row: forward (mobile), bookmark star, view source */}
        <div className="flex items-center gap-1 overflow-x-auto px-1 pb-1">
          <button
            className={`${btn} sm:hidden`}
            onClick={() => go(1)}
            disabled={history.idx >= history.entries.length - 1}
            aria-label={t("browser.toolbar.forward")}
          >
            <ForwardIcon className="h-5 w-5" />
          </button>
          <span className="min-w-0 flex-1 truncate px-1 text-xs text-stone-500">
            {view.kind === "page" ? view.page.title : view.kind === "loading" ? t("browser.toolbar.loading") : ""}
          </span>
          <button
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs text-stone-300 active:bg-stone-800 disabled:text-stone-700"
            onClick={toggleBookmark}
            disabled={view.kind !== "page"}
            aria-pressed={isBookmarked}
          >
            <StarIcon filled={isBookmarked} className={`h-4 w-4 ${isBookmarked ? "text-amber-400" : ""}`} />
            {isBookmarked ? t("browser.toolbar.bookmarked") : t("browser.toolbar.bookmark")}
          </button>
          <button
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs text-stone-300 active:bg-stone-800 disabled:text-stone-700"
            onClick={() => setSourceOpen(true)}
            disabled={view.kind !== "page"}
          >
            <CodeIcon className="h-4 w-4" />
            {t("browser.toolbar.viewSource")}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-1 top-full z-20 mt-1 w-72 max-w-[calc(100vw-1rem)] rounded-lg border border-stone-700 bg-stone-900 p-1 shadow-2xl shadow-black">
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{t("browser.menu.bookmarks")}</p>
            <ul>
              {bookmarks.map((b) => (
                <li key={b.address} className="flex items-center">
                  <button
                    className="flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center rounded px-3 py-1 text-left active:bg-stone-800"
                    onClick={() => {
                      setMenuOpen(false);
                      void load(b.address, "push");
                    }}
                  >
                    <span className="truncate text-sm text-stone-100">{bookmarkTitle(b, x)}</span>
                    <span className="truncate font-mono text-xs text-stone-500">{b.address}</span>
                  </button>
                  <button
                    className="flex h-11 w-11 items-center justify-center text-stone-500 active:bg-stone-800"
                    aria-label={t("browser.menu.removeBookmark", { title: bookmarkTitle(b, x) })}
                    onClick={() => saveBookmarks(bookmarks.filter((bm) => bm.address !== b.address))}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {bookmarks.length === 0 && <li className="px-3 py-2 text-sm text-stone-500">{t("browser.menu.empty")}</li>}
            </ul>
            {view.kind === "page" && !isBookmarked && (
              <button
                className="mt-1 flex min-h-11 w-full items-center gap-2 rounded border-t border-stone-800 px-3 text-sm text-amber-300 active:bg-stone-800"
                onClick={() => {
                  toggleBookmark();
                  setMenuOpen(false);
                }}
              >
                <StarIcon className="h-4 w-4" /> {t("browser.menu.bookmarkThisPage")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Viewport */}
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-stone-950"
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        {view.kind === "newtab" && (
          <NewTab
            bookmarks={bookmarks}
            onOpen={(a) => void load(a, "push")}
          />
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

function NewTab({ bookmarks, onOpen }: { bookmarks: Bookmark[]; onOpen: (address: string) => void }) {
  const t = useT();
  const x = pick(useLocale());
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center">
      <CompassMark className="h-16 w-16 text-amber-500/60" />
      <p className="mt-4 font-serif text-lg text-stone-200">{t("browser.newTab.title")}</p>
      <p className="mt-1 text-sm italic text-stone-500">&ldquo;{x({ en: "Start at the beginning.", ko: "처음부터 시작해.", "zh-TW": "從頭開始。", es: "Empieza por el principio.", ja: "最初から始めて。", "pt-BR": "Comece pelo começo." })}&rdquo;</p>
      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        {bookmarks.map((b) => (
          <button
            key={b.address}
            onClick={() => onOpen(b.address)}
            className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border border-stone-800 bg-stone-900 p-3 active:bg-stone-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 font-serif text-amber-300">
              {bookmarkTitle(b, x).charAt(0)}
            </span>
            <span className="w-full truncate text-xs text-stone-300">{bookmarkTitle(b, x)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
