"use client";

import type { ToastAction } from "@/lib/client/game";

export interface ToastItem {
  id: number;
  msg: string;
  tone: "info" | "success" | "error";
  action?: ToastAction;
}

const TONE: Record<ToastItem["tone"], string> = {
  info: "border-stone-600 bg-stone-900 text-stone-100",
  success: "border-amber-500/70 bg-stone-900 text-amber-200",
  error: "border-red-600/70 bg-red-950 text-red-100",
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
          <span className="min-w-0 flex-1">{t.msg}</span>
          {t.action && <span className="shrink-0 font-semibold text-amber-300 underline">{t.action.label}</span>}
        </button>
      ))}
    </div>
  );
}
