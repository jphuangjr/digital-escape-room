"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGame } from "@/lib/games";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { AVATAR_COLORS } from "@/app/r/[code]/RoomClient";

/** Staging landing page for The Nightingale Express: start a room (admins only). English only for now. */
export function TrainLanding() {
  const router = useRouter();
  const game = getGame(TRAIN_GAME_ID)!;
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem("ada_name");
      if (n) setName(n);
    } catch {}
  }, []);

  async function start(replaceExisting = false): Promise<void> {
    const displayName = name.trim();
    if (!displayName) return setErr("Enter a name first.");
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: TRAIN_GAME_ID, displayName, color, replaceExisting }),
    });
    const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string; replaceRequired?: boolean; openRooms?: { code: string }[] };
    if (res.status === 409 && data.replaceRequired) {
      const codes = (data.openRooms ?? []).map((r) => r.code).join(", ");
      if (window.confirm(`You already host ${codes}. Close it and start a new room?`)) return start(true);
      setBusy(false);
      return;
    }
    if (!res.ok || !data.code) {
      setBusy(false);
      setErr(data.error ?? "Couldn't start a room.");
      return;
    }
    try {
      localStorage.setItem("ada_name", displayName);
    } catch {}
    router.push(`/r/${data.code}`);
  }

  return (
    <main className="noir-vignette min-h-dvh px-4 pb-10 pt-8">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <Link href="/" className="text-sm text-noir-ink-faint">
          ← All escape rooms
        </Link>
        <header className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-noir-blood">Staging · admins only</p>
          <h1 className="mt-2 font-serif text-4xl text-noir-ink">{game.title}</h1>
          <p className="mt-2 font-serif italic text-noir-ink-dim">{game.tagline}</p>
        </header>
        <p className="font-serif leading-relaxed text-noir-ink-dim">{game.blurb}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
          className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-noir-ink-faint">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoComplete="nickname"
              className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink"
            />
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1.5 text-xs uppercase tracking-widest text-noir-ink-faint">Avatar colour</legend>
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                aria-label={`Colour ${c}`}
                className={`h-10 w-10 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </fieldset>
          {err && <p className="text-sm text-noir-ink-dim">{err}</p>}
          <button type="submit" disabled={busy} className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg disabled:opacity-60">
            {busy ? "Boarding…" : "Board the train"}
          </button>
          <p className="text-xs text-noir-ink-faint">Invite playtesters from the Room menu once you&apos;re aboard.</p>
        </form>
      </div>
    </main>
  );
}
