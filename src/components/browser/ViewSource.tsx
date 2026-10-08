"use client";

import { useEffect } from "react";

function tint(source: string) {
  const parts = source.split(/(<!--[\s\S]*?-->)/g);
  return parts.map((part, i) => {
    if (part.startsWith("<!--")) {
      return (
        <span key={i} className="italic text-amber-400">
          {part}
        </span>
      );
    }
    const sub = part.split(/(<\/?[a-zA-Z][^>]*>)/g);
    return sub.map((s, j) =>
      /^<\/?[a-zA-Z]/.test(s) ? (
        <span key={`${i}-${j}`} className="text-sky-300">
          {s}
        </span>
      ) : (
        <span key={`${i}-${j}`}>{s}</span>
      ),
    );
  });
}

export function ViewSource({ address, source, onClose }: { address: string; source: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 md:items-center md:justify-center md:p-8" role="dialog" aria-modal="true" aria-label="Page source">
      <div
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#0d1117] text-stone-200 md:max-w-4xl md:flex-none md:rounded-xl md:border md:border-stone-700 md:max-h-[85dvh]"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-stone-800 px-3 py-1">
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-stone-400">view-source:{address}</p>
          <button onClick={onClose} className="min-h-11 rounded px-3 text-sm text-amber-300 active:bg-stone-800">
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <pre className="w-max min-w-full p-4 font-mono text-[13px] leading-relaxed">{tint(source)}</pre>
        </div>
      </div>
    </div>
  );
}
