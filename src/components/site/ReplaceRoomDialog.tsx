"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { OpenHostedRoom } from "@/lib/types";
import { gameTitle } from "@/lib/games";

const STATUS_LABEL: Record<OpenHostedRoom["status"], string> = {
  playing: "in progress",
  voting: "voting on the ending",
  finished: "finished",
};

/**
 * Shown when a host starts a new room while they still host an open one. Confirming deletes the old
 * room(s) immediately instead of waiting for the 48-hour expiry.
 */
export function ReplaceRoomDialog({
  rooms,
  busy,
  onCancel,
  onConfirm,
}: {
  rooms: OpenHostedRoom[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const single = rooms.length === 1;
  const others = rooms.reduce((n, r) => n + Math.max(0, r.playerCount - 1), 0);

  // Default focus on the safe choice; Escape cancels.
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-safe pt-safe sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="replace-title"
        aria-describedby="replace-desc"
        className="mb-4 w-full max-w-md rounded-xl border border-noir-blood/70 bg-noir-bg-2 p-5 shadow-2xl shadow-black sm:mb-0"
      >
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-noir-blood">Warning</p>
        <h2 id="replace-title" className="mt-2 font-serif text-2xl leading-tight text-noir-ink">
          {single ? "You already have an open room" : `You already have ${rooms.length} open rooms`}
        </h2>

        <ul className="mt-4 flex flex-col gap-2">
          {rooms.map((r) => (
            <li key={r.code} className="rounded-lg border border-noir-line bg-noir-bg-3 px-3 py-2">
              <span className="block font-mono tracking-widest text-noir-ink">{r.code}</span>
              <span className="block text-xs text-noir-ink-faint">
                {gameTitle(r.gameId)} · {STATUS_LABEL[r.status]} · {r.playerCount} {r.playerCount === 1 ? "player" : "players"}
              </span>
            </li>
          ))}
        </ul>

        <div id="replace-desc" className="mt-4 space-y-2 text-sm leading-relaxed text-noir-ink-dim">
          <p>
            Starting a new room will <strong className="text-noir-ink">permanently delete {single ? "this room" : "these rooms"} right away</strong>,
            including progress, notes and the attempt log.
            {others > 0 && (
              <>
                {" "}
                {others === 1 ? "The other player" : `The ${others} other players`} will be removed.
              </>
            )}
          </p>
          <p className="text-noir-ink-faint">Finished-case times already saved to your account are kept.</p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-12 rounded-lg bg-noir-blood font-semibold text-noir-ink active:opacity-80 disabled:opacity-60"
          >
            {busy ? "Deleting…" : single ? `Delete ${rooms[0].code} and start a new room` : "Delete them and start a new room"}
          </button>
          {single && (
            <Link
              href={`/r/${rooms[0].code}`}
              className="flex min-h-12 items-center justify-center rounded-lg border border-noir-line font-semibold text-noir-brass"
            >
              Rejoin {rooms[0].code} instead
            </Link>
          )}
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-12 rounded-lg text-noir-ink-dim active:bg-noir-bg-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
