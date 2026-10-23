"use client";

import type { ToastAction } from "@/lib/client/game";

export interface ToastItem {
  id: number;
  msg: string;
  tone: "info" | "success" | "error" | "solve";
  action?: ToastAction;
}

const TONE: Record<ToastItem["tone"], string> = {
  info: "border-stone-600 bg-stone-900 text-stone-100",
  success: "border-amber-500/70 bg-stone-900 text-amber-200",
  error: "border-red-600/70 bg-red-950 text-red-100",
  solve: "sm-toast border-[#c9a227] bg-[#1b140a] text-[#f3dfa0]",
};

/** `placement: "top"` keeps toasts clear of bottom sheets (e.g. the Room sheet) that would otherwise be covered. */
export function Toasts({
  items,
  onDismiss,
  placement = "bottom",
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
  placement?: "top" | "bottom";
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={
        placement === "top"
          ? { top: "calc(env(safe-area-inset-top) + 12px)" }
          : { bottom: "calc(env(safe-area-inset-bottom) + 76px)" }
      }
    >
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            t.action?.onClick();
            onDismiss(t.id);
          }}
          className={`pointer-events-auto flex min-h-11 w-full max-w-sm items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm shadow-xl shadow-black/60 ${TONE[t.tone]}`}
        >
          {t.tone === "solve" && <SolveMark />}
          <span className="min-w-0 flex-1">{t.msg}</span>
          {t.action && <span className="shrink-0 font-semibold text-amber-300 underline">{t.action.label}</span>}
        </button>
      ))}
    </div>
  );
}

/** The brass seal on a solve toast: a small open shackle with a ring that rings out once. */
function SolveMark() {
  return (
    <span aria-hidden className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9a227]/70 bg-[#2a1f0e] text-[#ecd27a]">
      <span className="sm-ring absolute inset-0 rounded-full border border-[#ecd27a]" />
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M5.5 7V5a2.5 2.5 0 0 1 4.9-.7" />
        <rect x="3.5" y="7" width="9" height="6.5" rx="1.4" />
      </svg>
    </span>
  );
}
