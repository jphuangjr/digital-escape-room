"use client";

import { useState } from "react";
import type { PartyTestInfo } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { ROLE_INFO, type Role } from "@/lib/allhands/types";

const SIZES = [5, 8, 12, 16];

/**
 * Admin test room tools: fill the table with bots, switch whose phone you're looking at, and make the bots move.
 * Only admins hosting the room get `partyTest` in their state, and the server checks again on every call.
 */
export function TestBar({
  code,
  test,
  party,
  refresh,
  meId,
  sizes = SIZES,
  hint = "You play as whoever you pick: their badge, their after-hours move, their vote and the Moles' channel. The host controls stay yours.",
}: {
  meId: string;
  code: string;
  test: PartyTestInfo;
  /** Any party game's view: only the phase is read ("lobby" and "over" are between games). */
  party: { phase: string };
  refresh: () => Promise<void>;
  /** Table sizes the fill buttons offer. */
  sizes?: number[];
  /** What looking through a bot's eyes lets you do, in this game. */
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const between = party.phase === "lobby" || party.phase === "over";
  const bots = test.players.filter((p) => p.bot).length;

  async function call(body: Record<string, unknown>, done?: (data: Record<string, unknown>) => string | null) {
    setBusy(true);
    setNote(null);
    const res = await apiFetch<Record<string, unknown> & { error?: string }>(code, "/party/test", { body });
    setBusy(false);
    if (!res.ok) setNote(res.data?.error ?? "That didn't work.");
    else if (done && res.data) setNote(done(res.data));
    await refresh();
  }

  const label = (p: PartyTestInfo["players"][number]) =>
    `${p.name}${p.id === meId ? " (you)" : p.bot ? "" : " (real player)"}${p.role ? ` · ${ROLE_INFO[p.role as Role]?.name ?? p.role}` : ""}`;

  return (
    <section aria-label="Test room tools" className="flex flex-col gap-3 rounded-2xl border border-amber-300/50 bg-amber-300/10 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Test room · admin</p>
        <p className="text-xs text-amber-100/70">{bots ? `${bots} bots` : "No bots yet"}</p>
      </div>

      {between && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-amber-100">Fill the table with bots, up to:</p>
          <div className="flex gap-2">
            {sizes.map((n) => (
              <button
                key={n}
                type="button"
                disabled={busy || test.players.length >= n}
                onClick={() => void call({ action: "fill", total: n }, (d) => `Added ${d.added} bots.`)}
                className="min-h-11 flex-1 rounded-xl border border-amber-300/50 text-sm font-semibold text-amber-200 active:bg-amber-300/20 disabled:opacity-40"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {bots > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-amber-100">See the game as</span>
          <select
            value={test.viewingAs}
            disabled={busy}
            onChange={(e) => void call({ action: "viewAs", playerId: e.target.value })}
            className="min-h-12 rounded-xl border border-amber-300/50 bg-slate-950 px-3 text-base text-slate-100"
          >
            {test.players.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.bot && p.id !== meId}>
                {label(p)}
              </option>
            ))}
          </select>
          <span className="text-xs text-amber-100/70">{hint}</span>
        </label>
      )}

      {bots > 0 && !between && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void call({ action: "botsAct" }, (d) => (d.moved ? `${d.moved} bots made their move.` : "Nothing for the bots to do right now."))}
          className="min-h-12 rounded-xl bg-amber-300 px-4 font-bold text-slate-950 active:bg-amber-200 disabled:opacity-50"
        >
          Bots: make your moves
        </button>
      )}
      {note && <p className="text-xs text-amber-100">{note}</p>}
    </section>
  );
}
