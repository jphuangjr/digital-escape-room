"use client";

import { useEffect } from "react";
import { NotesApp } from "@/components/apps/NotesApp";
import { CloseIcon } from "@/components/shell/icons";
import type { GameCtx } from "@/lib/client/game";
import { useT } from "@/i18n/client";

/**
 * Ada's Notes app for the physical-room games: private notes, one tap to share with the room, and the room's
 * shared notes. Case-file tags are Ada's, so they're hidden here.
 */
export function NotebookSheet({ ctx, onClose, closeLabel }: { ctx: GameCtx; onClose: () => void; closeLabel: string }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={t("shell.app.notes")}>
      <button aria-label={closeLabel} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative flex h-[86dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border-t border-zinc-700 bg-zinc-950"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex shrink-0 items-center gap-2 px-4 pt-3">
          <h2 className="min-w-0 flex-1 text-xl font-semibold text-zinc-100">{t("shell.app.notes")}</h2>
          <button onClick={onClose} aria-label={closeLabel} className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 active:bg-zinc-800">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <NotesApp ctx={ctx} tags={[]} />
        </div>
      </div>
    </div>
  );
}
