"use client";

export interface ToastItem {
  id: number;
  msg: string;
  tone: "info" | "success" | "error";
}

const TONE: Record<ToastItem["tone"], string> = {
  info: "border-stone-600 bg-stone-900 text-stone-100",
  success: "border-amber-500/70 bg-stone-900 text-amber-200",
  error: "border-red-600/70 bg-red-950 text-red-100",
};

export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
    >
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto min-h-11 w-full max-w-sm rounded-lg border px-4 py-2.5 text-left text-sm shadow-xl shadow-black/60 ${TONE[t.tone]}`}
        >
          {t.msg}
        </button>
      ))}
    </div>
  );
}
