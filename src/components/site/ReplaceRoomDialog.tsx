"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { OpenHostedRoom } from "@/lib/types";
import { FormattedMessage } from "react-intl";
import { localGameTitle } from "@/lib/games";
import { useT } from "@/i18n/client";

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
  const t = useT();
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
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-noir-blood">{t("site.replace.warning")}</p>
        <h2 id="replace-title" className="mt-2 font-serif text-2xl leading-tight text-noir-ink">
          {t("site.replace.title", { count: rooms.length })}
        </h2>

        <ul className="mt-4 flex flex-col gap-2">
          {rooms.map((r) => (
            <li key={r.code} className="rounded-lg border border-noir-line bg-noir-bg-3 px-3 py-2">
              <span className="block font-mono tracking-widest text-noir-ink">{r.code}</span>
              <span className="block text-xs text-noir-ink-faint">
                {t("site.replace.roomMeta", { title: localGameTitle(t, r.gameId), status: r.status, count: r.playerCount })}
              </span>
            </li>
          ))}
        </ul>

        <div id="replace-desc" className="mt-4 space-y-2 text-sm leading-relaxed text-noir-ink-dim">
          <p>
            <FormattedMessage
              id="site.replace.desc"
              values={{ count: rooms.length, b: (c) => <strong className="text-noir-ink">{c}</strong> }}
            />
            {others > 0 && (
              <>
                {" "}
                {t("site.replace.others", { others })}
              </>
            )}
          </p>
          <p className="text-noir-ink-faint">{t("site.replace.kept")}</p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-12 rounded-lg bg-noir-blood font-semibold text-noir-ink active:opacity-80 disabled:opacity-60"
          >
            {busy
              ? t("site.replace.deleting")
              : single
                ? t("site.replace.confirmOne", { code: rooms[0].code })
                : t("site.replace.confirmMany")}
          </button>
          {single && (
            <Link
              href={`/r/${rooms[0].code}`}
              className="flex min-h-12 items-center justify-center rounded-lg border border-noir-line font-semibold text-noir-brass"
            >
              {t("site.replace.rejoin", { code: rooms[0].code })}
            </Link>
          )}
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-12 rounded-lg text-noir-ink-dim active:bg-noir-bg-3"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
