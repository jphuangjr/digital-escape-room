"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { KeyIcon, openSignIn } from "./SignIn";
import { FormattedMessage, useIntl } from "react-intl";
import type { MeResponse } from "@/lib/types";
import { endingLabel, formatDuration, localGameTitle } from "@/lib/games";
import { useT } from "@/i18n/client";

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

/** A full-width "Sign in" button: opens the sign-in sheet (passkey, Google or an email code). */
export function SignInButton({ label, callbackUrl = "/" }: { label: string; callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => openSignIn(callbackUrl)}
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-noir-line bg-noir-ink font-semibold text-noir-bg active:opacity-80"
    >
      <KeyIcon />
      {label}
    </button>
  );
}

/** Signed-in identity with sign out, or a nudge to sign in. Hidden when sign-in is off. */
export function AccountBar({ me, callbackUrl = "/", fallbackColor = "#c9a227" }: { me: MeResponse | null; callbackUrl?: string; fallbackColor?: string }) {
  const t = useT();
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
                  <FormattedMessage
                    id="site.account.signedInAs"
                    values={{
                      name: me.user!.name || me.user!.email || "",
                      b: (c) => <span className="text-noir-ink">{c}</span>,
                    }}
                  />
                </span>
                <a href="/profile" className="min-h-11 shrink-0 content-center px-2 text-sm font-semibold text-noir-brass underline">
                  {t("profile.link")}
                </a>
                {me!.isTester && !me!.isAdmin && (
                  <span className="shrink-0 rounded border border-noir-brass/60 px-1.5 py-0.5 font-mono text-10px uppercase tracking-widest text-noir-brass">
                    {t("site.account.tester")}
                  </span>
                )}
                {me!.isAdmin && (
                  <a href="/admin" className="min-h-11 shrink-0 content-center px-2 text-sm font-semibold text-noir-brass underline">
                    {t("site.account.admin")}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl })}
                  className="min-h-11 shrink-0 px-2 text-sm text-noir-ink-faint underline"
                >
                  {t("site.account.signOut")}
                </button>
              </>
            ) : (
              <>
                <span className="min-w-0 flex-1 text-sm text-noir-ink-dim">
                  {t("site.account.nudge")}
                </span>
                <button
                  type="button"
                  onClick={() => openSignIn(callbackUrl)}
                  className="min-h-11 shrink-0 px-2 text-sm font-semibold text-noir-brass underline"
                >
                  {t("site.account.signIn")}
                </button>
              </>
            )}
          </div>
        )}

    </>
  );
}

/** A game's landing page: the rooms of this game you're still in, to jump straight back into. Guests too. */
export function ContinueRooms({ me, gameId }: { me: MeResponse | null; gameId: string }) {
  const t = useT();
  const rooms = (me?.activeRooms ?? []).filter((r) => r.gameId === gameId && r.status !== "finished");
  if (rooms.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-noir-brass/40 bg-noir-bg-2/90 p-4" aria-labelledby={`continue-${gameId}`}>
      <h2 id={`continue-${gameId}`} className="font-mono text-xs uppercase tracking-[0.3em] text-noir-brass">
        {t("site.continue.title")}
      </h2>
      <ul className="flex flex-col gap-2">
        {rooms.map((r) => (
          <li key={r.code}>
            <a href={`/r/${r.code}`} className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-noir-line bg-noir-bg-3 px-3 py-2 active:bg-noir-bg">
              <span className="min-w-0">
                <span className="block font-mono tracking-widest text-noir-ink">{r.code}</span>
                <span className="block text-xs leading-snug text-noir-ink-faint">
                  {t("site.cases.roomMeta", { title: localGameTitle(t, r.gameId), count: r.playerCount, host: r.isHost, status: r.status })}
                </span>
              </span>
              <span className="shrink-0 rounded-md bg-noir-brass px-3 py-1.5 text-sm font-semibold text-noir-bg">{t("site.cases.rejoin")}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Rooms and finished cases. On a game's page (gameId) the open rooms are left to ContinueRooms. */
export function MyCases({ me, gameId }: { me: MeResponse; gameId?: string }) {
  const t = useT();
  const intl = useIntl();
  const activeRooms = gameId ? [] : me.activeRooms;
  const cases = gameId ? me.cases.filter((c) => c.gameId === gameId) : me.cases;
  if (!me.user || (activeRooms.length === 0 && cases.length === 0)) return null;
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">{t("site.cases.heading")}</h2>
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
                    {t("site.cases.roomMeta", {
                      title: localGameTitle(t, r.gameId),
                      count: r.playerCount,
                      host: r.isHost,
                      status: r.status,
                    })}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-noir-brass">{t("site.cases.rejoin")}</span>
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
                <th className="py-1 pr-3 font-normal">{t("site.cases.colCase")}</th>
                <th className="py-1 pr-3 font-normal">{t("site.cases.colTime")}</th>
                <th className="py-1 font-normal">{t("site.cases.colEnding")}</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={`${c.roomCode}-${c.finishedAt}`} className="border-t border-noir-line align-top">
                  <td className="py-2 pr-3">
                    <span className="block text-noir-ink">{localGameTitle(t, c.gameId)}</span>
                    <span className="block text-xs text-noir-ink-faint">
                      {t("site.cases.caseMeta", { date: intl.formatDate(c.finishedAt), count: c.playerCount })}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-noir-brass">{formatDuration(c.durationMs)}</td>
                  <td className="py-2 text-noir-ink-dim">{endingLabel(t, c.gameId, c.ending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

