"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher, useT } from "@/i18n/client";
import { QrCode } from "@/components/site/QrCode";
import { GameTips } from "@/components/site/RoomLoader";
import type { GameCtx } from "@/lib/client/game";
import { AttemptLog } from "@/components/apps/AttemptLog";
import { CaseLog } from "@/components/apps/CaseLog";
import { ChatPanel } from "@/components/apps/ChatPanel";
import type { Chat } from "@/lib/client/chat";
import { HintsPanel } from "@/components/apps/HintsPanel";
import { APP_ORDER, CloseIcon, CrownIcon, ShareIcon } from "./icons";

function describeView(view: string | null, t: ReturnType<typeof useT>): string {
  if (!view) return t("room.view.idle");
  if (view.startsWith("browser:")) {
    const a = view.slice(8);
    return a === "newtab" ? t("room.view.newTab") : a;
  }
  if (view.startsWith("app:")) {
    const a = view.slice(4).split(":")[0];
    const name = (APP_ORDER as string[]).includes(a) ? t(`shell.app.${a}`) : `${a.charAt(0).toUpperCase()}${a.slice(1)}`;
    return t("room.view.app", { app: name });
  }
  if (view === "desktop") return t("room.view.desktop");
  // The Nightingale Express: "train:door", "train:corridor".
  if (view.startsWith("train:")) {
    const w = view.slice(6);
    return w === "corridor" ? t("train.view.corridor") : t("train.view.wall", { wall: t(`train.wall.${w}`) });
  }
  return view;
}

export type RoomTab = "people" | "chat" | "log" | "attempts" | "hints";
type Tab = RoomTab;

export function RoomSheet({
  ctx,
  open,
  onClose,
  tab,
  setTab,
  chat,
  onTour,
  tabs,
}: {
  ctx: GameCtx;
  open: boolean;
  onClose: () => void;
  tab: RoomTab;
  setTab: (t: RoomTab) => void;
  chat: Chat;
  /** Replays the first-time tour; the button is hidden when absent. */
  onTour?: () => void;
  /** Tabs to show (default: all). Games without Ada's hints or case log pass a subset. */
  tabs?: RoomTab[];
}) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const { state } = ctx;
  const players = [...state.players].sort((a, b) => Number(b.online) - Number(a.online));

  async function share() {
    const url = `${window.location.origin}/r/${ctx.code}`;
    const data = { title: t("room.share.title"), text: t("room.share.text", { code: ctx.code }), url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      ctx.toast(t("room.share.copied"), "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      ctx.toast(t("room.share.link", { url }), "info");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-label={t("room.sheet.label")}>
      <button aria-label={t("room.sheet.closeBackdrop")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-stone-700 bg-stone-950 md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-t-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded bg-stone-700 md:hidden" aria-hidden />
        <div className="flex items-center gap-2 px-4 pt-2" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500">{t("room.sheet.label")}</p>
            <p className="font-mono text-lg font-semibold text-amber-300">{ctx.code}</p>
          </div>
          <button
            data-tour="invite"
            onClick={share}
            className="flex h-11 items-center gap-2 rounded-md border border-amber-500/50 px-3 text-sm text-amber-300 active:bg-amber-500/10"
          >
            <ShareIcon className="h-4 w-4" />
            {copied ? t("common.copied") : t("room.sheet.invite")}
          </button>
          <button onClick={onClose} aria-label={t("common.close")} className="flex h-11 w-11 items-center justify-center rounded-md text-stone-400 active:bg-stone-800">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div role="tablist" className="mt-3 flex border-b border-stone-800 px-2">
          {(
            [
              ["people", t("room.tab.people", { count: state.players.filter((p) => p.online).length })],
              ["chat", t("room.tab.chat", { unread: chat.unread })],
              ["log", t("room.tab.log")],
              ["attempts", t("room.tab.attempts")],
              ["hints", t("room.tab.hints")],
            ] as [Tab, string][]
          ).filter(([id]) => !tabs || tabs.includes(id)).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              data-tour={`tab-${id}`}
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-11 flex-1 border-b-2 text-sm ${
                tab === id ? "border-amber-400 text-amber-300" : "border-transparent text-stone-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={`min-h-0 flex-1 overflow-x-hidden px-4 py-3 ${tab === "chat" ? "flex flex-col" : "overflow-y-auto"}`}
        >
          {tab === "chat" && <ChatPanel ctx={ctx} chat={chat} />}
          {tab === "people" && (
            <>
              <ul className="space-y-1">
              {players.map((p) => (
                <li key={p.id} className="flex min-h-12 items-center gap-3 rounded-md px-1 py-1.5">
                  <span className="relative shrink-0">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-full border-2 object-cover"
                        style={{ borderColor: p.color }}
                      />
                    ) : (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-black"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-stone-950 ${
                        p.online ? "bg-emerald-500" : "bg-stone-600"
                      }`}
                      aria-label={t(p.online ? "room.people.online" : "room.people.offlineAria")}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm text-stone-100">
                      <span className="truncate">{p.displayName}</span>
                      {p.isHost && <CrownIcon className="h-4 w-4 shrink-0 text-amber-400" aria-label={t("room.people.host")} />}
                      {p.id === state.me.id && <span className="text-xs text-stone-500">{t("room.people.you")}</span>}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {p.online ? t("room.people.viewing", { where: describeView(p.currentView, t) }) : t("room.people.offline")}
                    </p>
                  </div>
                </li>
              ))}
              </ul>
              {/* alone in the room: a nudge to invite, and a tip while the team gathers */}
              {state.players.filter((p) => p.online).length <= 1 && (
                <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-stone-400">{t("wait.tips.gathering")}</p>
                  <GameTips gameId={state.gameId} className="mt-1.5 min-h-[2.75rem] font-serif italic text-stone-300" />
                </div>
              )}
              <InviteQr code={ctx.code} />
              <div className="mt-3 flex justify-center">
                <LanguageSwitcher tone="shell" />
              </div>
              <div className="mt-4 border-t border-stone-800 pt-4">
                {onTour && <button
                  type="button"
                  onClick={onTour}
                  className="mb-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-amber-500/40 text-sm text-amber-300 active:bg-amber-500/10"
                >
                  <span aria-hidden>?</span>
                  {t("tour.replay")}
                </button>}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t("room.leave.confirm", { code: ctx.code }))) router.push("/");
                  }}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-stone-700 text-sm text-stone-300 active:bg-stone-900"
                >
                  <span aria-hidden>←</span>
                  {t("room.leave.button")}
                </button>
                <p className="mt-2 text-center text-xs text-stone-500">{t("room.leave.note", { code: ctx.code.replace("-", "\u2011") })}</p>
              </div>
            </>
          )}
          {tab === "log" && <CaseLog ctx={ctx} />}
          {tab === "attempts" && <AttemptLog ctx={ctx} />}
          {tab === "hints" && <HintsPanel ctx={ctx} />}
        </div>
      </div>
    </div>
  );
}

/** Scan-to-join: opens /r/CODE, where the join form offers Google sign-in or just a name. */
function InviteQr({ code }: { code: string }) {
  const t = useT();
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/r/${code}`;
  if (!url) return null;
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-stone-800 bg-stone-950 px-4 py-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{t("room.qr.title")}</p>
      <QrCode url={url} size={184} label={t("room.qr.label", { code })} />
      <p className="font-mono text-sm tracking-widest text-amber-300">{code}</p>
      <p className="text-xs text-stone-500">{t("room.qr.help")}</p>
    </div>
  );
}
