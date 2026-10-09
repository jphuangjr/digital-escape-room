"use client";

import { useEffect, useState } from "react";
import type { GameCtx } from "@/lib/client/game";
import { AttemptLog } from "@/components/apps/AttemptLog";
import { HintsPanel } from "@/components/apps/HintsPanel";
import { CloseIcon, CrownIcon, ShareIcon } from "./icons";

function describeView(view: string | null): string {
  if (!view) return "idle";
  if (view.startsWith("browser:")) {
    const a = view.slice(8);
    return a === "newtab" ? "a new browser tab" : a;
  }
  if (view.startsWith("app:")) {
    const a = view.slice(4).split(":")[0];
    return `${a.charAt(0).toUpperCase()}${a.slice(1)} app`;
  }
  if (view === "desktop") return "the desktop";
  return view;
}

type Tab = "people" | "attempts" | "hints";

export function RoomSheet({ ctx, open, onClose }: { ctx: GameCtx; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("people");
  const [copied, setCopied] = useState(false);

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
    const data = { title: "The Vanishing of Dr. Ada Voss", text: `Join my investigation (room ${ctx.code})`, url };
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
      ctx.toast("Invite link copied", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      ctx.toast(`Invite link: ${url}`, "info");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-label="Room">
      <button aria-label="Close room panel" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-stone-700 bg-stone-950 md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-t-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded bg-stone-700 md:hidden" aria-hidden />
        <div className="flex items-center gap-2 px-4 pt-2" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500">Room</p>
            <p className="font-mono text-lg font-semibold text-amber-300">{ctx.code}</p>
          </div>
          <button
            onClick={share}
            className="flex h-11 items-center gap-2 rounded-md border border-amber-500/50 px-3 text-sm text-amber-300 active:bg-amber-500/10"
          >
            <ShareIcon className="h-4 w-4" />
            {copied ? "Copied!" : "Invite"}
          </button>
          <button onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-md text-stone-400 active:bg-stone-800">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div role="tablist" className="mt-3 flex border-b border-stone-800 px-2">
          {(
            [
              ["people", `People (${state.players.filter((p) => p.online).length})`],
              ["attempts", "Attempts"],
              ["hints", "Hints"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
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

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
          {tab === "people" && (
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
                      aria-label={p.online ? "online" : "offline"}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm text-stone-100">
                      <span className="truncate">{p.displayName}</span>
                      {p.isHost && <CrownIcon className="h-4 w-4 shrink-0 text-amber-400" aria-label="host" />}
                      {p.id === state.me.id && <span className="text-xs text-stone-500">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {p.online ? `Viewing ${describeView(p.currentView)}` : "Offline"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {tab === "attempts" && <AttemptLog ctx={ctx} />}
          {tab === "hints" && <HintsPanel ctx={ctx} />}
        </div>
      </div>
    </div>
  );
}
