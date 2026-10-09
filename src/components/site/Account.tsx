"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import type { MeResponse } from "@/lib/types";
import { formatDuration, gameTitle } from "@/lib/games";

let mePromise: Promise<MeResponse | null> | null = null;

/** The signed-in user and their rooms/cases; null until loaded. One request per page load. */
export function useMe(): MeResponse | null {
  const [me, setMe] = useState<MeResponse | null>(null);
  useEffect(() => {
    let cancelled = false;
    mePromise ??= fetch("/api/me")
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
      .catch(() => null);
    mePromise.then((data) => {
      if (!cancelled && data) setMe(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return me;
}

export function GoogleButton({ label, callbackUrl = "/" }: { label: string; callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-noir-line bg-noir-ink font-semibold text-noir-bg active:opacity-80"
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.8-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z" />
      </svg>
      {label}
    </button>
  );
}

/** Signed-in identity with sign out, or a nudge to sign in. Hidden when Google sign-in is off. */
export function AccountBar({ me, callbackUrl = "/", fallbackColor = "#c9a227" }: { me: MeResponse | null; callbackUrl?: string; fallbackColor?: string }) {
  const signedIn = Boolean(me?.user);
  const color = fallbackColor;
  return (
    <>
        {me?.googleEnabled && (
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-noir-line bg-noir-bg-2/90 px-4 py-2">
            {signedIn ? (
              <>
                {me.user!.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.user!.image} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="h-8 w-8 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-noir-ink-dim">
                  Signed in as <span className="text-noir-ink">{me.user!.name || me.user!.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl })}
                  className="min-h-11 shrink-0 px-2 text-sm text-noir-ink-faint underline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 text-sm text-noir-ink-dim">
                  Sign in to keep your cases and times, and pick up on any device.
                </span>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl })}
                  className="min-h-11 shrink-0 px-2 text-sm font-semibold text-noir-brass underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        )}

    </>
  );
}

export function MyCases({ me, gameId }: { me: MeResponse; gameId?: string }) {
  const activeRooms = gameId ? me.activeRooms.filter((r) => r.gameId === gameId) : me.activeRooms;
  const cases = gameId ? me.cases.filter((c) => c.gameId === gameId) : me.cases;
  if (!me.user || (activeRooms.length === 0 && cases.length === 0)) return null;
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">My cases</h2>
      {activeRooms.length > 0 && (
        <ul className="flex flex-col gap-2">
          {activeRooms.map((r) => (
            <li key={r.code}>
              <a
                href={`/r/${r.code}`}
                className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-noir-line bg-noir-bg-3 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block font-mono tracking-widest text-noir-ink">{r.code}</span>
                  <span className="block truncate text-xs text-noir-ink-faint">
                    {gameTitle(r.gameId)} · {r.playerCount} {r.playerCount === 1 ? "player" : "players"}
                    {r.isHost ? " · host" : ""} · {r.status === "playing" ? "in progress" : r.status}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-noir-brass">Rejoin →</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {cases.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-noir-ink-faint">
              <tr>
                <th className="py-1 pr-3 font-normal">Case</th>
                <th className="py-1 pr-3 font-normal">Time</th>
                <th className="py-1 font-normal">Ending</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={`${c.roomCode}-${c.finishedAt}`} className="border-t border-noir-line align-top">
                  <td className="py-2 pr-3">
                    <span className="block text-noir-ink">{gameTitle(c.gameId)}</span>
                    <span className="block text-xs text-noir-ink-faint">
                      {new Date(c.finishedAt).toLocaleDateString()} · {c.playerCount} {c.playerCount === 1 ? "player" : "players"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-noir-brass">{formatDuration(c.durationMs)}</td>
                  <td className="py-2 text-noir-ink-dim">{c.ending ? c.ending.toLowerCase() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

