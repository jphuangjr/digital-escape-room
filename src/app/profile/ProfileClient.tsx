"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import type { ProfileResponse } from "@/lib/types";
import { endingLabel, formatDuration, localGameTitle } from "@/lib/games";
import { LanguageSwitcher, useT } from "@/i18n/client";
import { SignInButton, useMe } from "@/components/site/Account";
import { addPasskey, KeyIcon } from "@/components/site/SignIn";
import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import type { PasskeyDTO } from "@/lib/types";

type Load = { kind: "loading" } | { kind: "signedOut" } | { kind: "error" } | { kind: "ready"; data: ProfileResponse };

/** A signed-in player's record across every escape room: totals, achievements, bests and recent cases. */
export function ProfileClient() {
  const t = useT();
  const me = useMe();
  const [load, setLoad] = useState<Load>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 401) return setLoad({ kind: "signedOut" });
        if (!r.ok) return setLoad({ kind: "error" });
        setLoad({ kind: "ready", data: (await r.json()) as ProfileResponse });
      })
      .catch(() => !cancelled && setLoad({ kind: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="noir-vignette min-h-dvh px-4 pb-12 pt-8">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-noir-ink-faint">
            ← {t("site.allRooms")}
          </Link>
          <LanguageSwitcher tone="noir" />
        </div>
        {load.kind === "loading" && <p className="py-16 text-center text-noir-ink-faint">{t("profile.loading")}</p>}
        {load.kind === "error" && <p className="py-16 text-center text-noir-ink-dim">{t("profile.error")}</p>}
        {load.kind === "signedOut" && (
          <section className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-6 text-center">
            <h1 className="font-serif text-2xl text-noir-ink">{t("profile.signIn.title")}</h1>
            <p className="text-sm leading-relaxed text-noir-ink-dim">{t("profile.signIn.text")}</p>
            {(me?.authProviders?.length ?? 0) > 0 && <SignInButton label={t("profile.signIn.button")} callbackUrl="/profile" />}
          </section>
        )}
        {load.kind === "ready" && <Profile data={load.data} />}
      </div>
    </main>
  );
}

function Profile({ data }: { data: ProfileResponse }) {
  const t = useT();
  const intl = useIntl();
  const date = (iso: string) => intl.formatDate(iso, { year: "numeric", month: "short", day: "numeric" });
  const earned = data.achievements.filter((a) => a.earnedAt);
  const ending = (gameId: string, e: string) => endingLabel(t, gameId, e);

  return (
    <>
      <header className="flex items-center gap-4">
        {data.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.user.image} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full border-2 border-noir-brass" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-noir-brass bg-noir-bg-3 font-serif text-2xl text-noir-brass" aria-hidden>
            {(data.user.name ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-noir-ink-faint">{t("profile.heading")}</p>
          <h1 className="truncate font-serif text-3xl text-noir-ink">{data.user.name}</h1>
          <p className="text-sm text-noir-ink-faint">{t("profile.since", { date: date(data.user.since) })}</p>
        </div>
      </header>
      <PasskeysSection />

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t("profile.stat.cases")} value={String(data.totals.cases)} />
        <Stat label={t("profile.stat.solved")} value={String(data.totals.solved)} />
        <Stat label={t("profile.stat.hosted")} value={String(data.totals.hosted)} />
        <Stat label={t("profile.stat.time")} value={formatDuration(data.totals.totalMs)} />
      </dl>

      <section className="flex flex-col gap-3" aria-labelledby="profile-ach">
        <div className="flex items-baseline justify-between">
          <h2 id="profile-ach" className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">
            {t("profile.achievements")}
          </h2>
          <span className="font-mono text-sm text-noir-brass">{t("profile.achievementsCount", { earned: earned.length, total: data.achievements.length })}</span>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {data.achievements.map((a) => (
            <li
              key={a.id}
              className={`flex flex-col gap-1 rounded-xl border p-3 ${a.earnedAt ? "border-noir-brass/60 bg-noir-brass/10" : "border-noir-line bg-noir-bg-2/70"}`}
            >
              <span className={`text-2xl ${a.earnedAt ? "" : "opacity-30 grayscale"}`} aria-hidden>
                {a.icon}
              </span>
              <span className={`text-sm font-semibold ${a.earnedAt ? "text-noir-ink" : "text-noir-ink-dim"}`}>{t(`profile.ach.${a.id}.name`)}</span>
              <span className="text-xs leading-snug text-noir-ink-faint">{t(`profile.ach.${a.id}.how`)}</span>
              <span className={`mt-auto pt-1 text-[11px] uppercase tracking-wider ${a.earnedAt ? "text-noir-brass" : "text-noir-ink-faint"}`}>
                {a.earnedAt ? t("profile.earned", { date: date(a.earnedAt) }) : `🔒 ${t("profile.locked")}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="profile-games">
        <h2 id="profile-games" className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">
          {t("profile.games")}
        </h2>
        {data.games.map((g) => (
          <article key={g.gameId} className="flex flex-col gap-3 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-lg text-noir-ink">{localGameTitle(t, g.gameId)}</h3>
              <Link href={`/play/${g.gameId}`} className="shrink-0 text-sm font-semibold text-noir-brass">
                {t("profile.game.play")}
              </Link>
            </div>
            <p className="-mt-2 text-xs text-noir-ink-faint">
              {t("profile.game.plays", { n: g.plays })}
              {g.plays > 0 && ` · ${t("profile.game.solved", { n: g.solved })}`}
            </p>
            {g.plays > 0 && (
              <dl className="grid grid-cols-3 gap-2 text-center">
                <Stat small label={t("profile.game.best")} value={g.bestMs !== null ? formatDuration(g.bestMs) : "—"} />
                <Stat small label={t("profile.game.rank")} value={g.bestRank !== null ? t("profile.game.rankOf", { rank: g.bestRank, total: g.boardSize }) : "—"} />
                <Stat small label={t("profile.game.endings")} value={g.endings.length ? g.endings.map((e) => ending(g.gameId, e)).join(", ") : "—"} capitalize />
              </dl>
            )}
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="profile-recent">
        <h2 id="profile-recent" className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">
          {t("profile.recent")}
        </h2>
        {data.recent.length === 0 ? (
          <p className="rounded-xl border border-noir-line bg-noir-bg-2/90 p-4 text-sm text-noir-ink-faint">{t("profile.recent.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.recent.map((c) => (
              <li key={`${c.gameId}-${c.finishedAt}`} className="flex items-center gap-3 rounded-lg border border-noir-line bg-noir-bg-2/90 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-noir-ink">{localGameTitle(t, c.gameId)}</span>
                  <span className="block text-xs leading-snug text-noir-ink-faint">
                    {t("profile.recent.meta", { date: date(c.finishedAt), count: c.playerCount, host: c.wasHost })}
                    {c.ending && ` · ${ending(c.gameId, c.ending)}`}
                    {c.hintsUsed !== null && ` · ${t("profile.recent.hints", { n: c.hintsUsed })}`}
                    {c.wrongAttempts !== null && ` · ${t("profile.recent.wrong", { n: c.wrongAttempts })}`}
                  </span>
                  {!c.solved && <span className="text-xs text-red-400">{t("profile.recent.unsolved")}</span>}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm font-semibold text-noir-brass">{formatDuration(c.durationMs)}</span>
                  {c.rank !== null && <span className="block font-mono text-xs text-noir-ink-faint">#{c.rank}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({ label, value, small, capitalize }: { label: string; value: string; small?: boolean; capitalize?: boolean }) {
  return (
    <div className={`rounded-lg border border-noir-line bg-noir-bg-3 ${small ? "px-1 py-2" : "px-3 py-3"}`}>
      <dt className="text-[10px] uppercase tracking-wider text-noir-ink-faint">{label}</dt>
      <dd className={`font-mono font-bold text-noir-ink ${small ? "text-sm" : "text-xl"} ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}

/** The account's passkeys: add one on this device, see when each was last used, remove one. */
function PasskeysSection() {
  const t = useT();
  const intl = useIntl();
  const me = useMe();
  const [list, setList] = useState<PasskeyDTO[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [canAdd, setCanAdd] = useState(false);
  const load = () =>
    fetch("/api/account/passkeys")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { passkeys?: PasskeyDTO[] } | null) => setList(d?.passkeys ?? null))
      .catch(() => setList(null));
  useEffect(() => {
    setCanAdd(browserSupportsWebAuthn());
    void load();
  }, []);
  if (!me?.authProviders?.includes("passkey") || list === null) return null;
  const date = (iso: string) => intl.formatDate(iso, { year: "numeric", month: "short", day: "numeric" });

  async function add() {
    setBusy(true);
    setMsg(null);
    try {
      if (!(await addPasskey())) setMsg(t("auth.passkey.failed"));
      await load();
    } catch {
      setMsg(t("auth.passkey.failed"));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm(t("auth.manage.removeConfirm"))) return;
    await fetch(`/api/account/passkeys/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">{t("auth.manage.title")}</h2>
      <p className="text-sm text-noir-ink-dim">{t("auth.manage.body")}</p>
      {list.length === 0 && <p className="text-sm text-noir-ink-faint">{t("auth.manage.none")}</p>}
      <ul className="flex flex-col gap-2">
        {list.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-lg border border-noir-line bg-noir-bg-3 px-3 py-2">
            <KeyIcon className="h-5 w-5 shrink-0 text-noir-brass" />
            <span className="min-w-0 flex-1 text-sm">
              <span className="block text-noir-ink">{p.synced ? t("auth.manage.synced") : t("auth.manage.thisDevice")}</span>
              <span className="block text-xs text-noir-ink-faint">
                {t("auth.manage.added", { date: date(p.createdAt) })} · {p.lastUsedAt ? t("auth.manage.lastUsed", { date: date(p.lastUsedAt) }) : t("auth.manage.never")}
              </span>
            </span>
            <button type="button" onClick={() => remove(p.id)} className="min-h-11 shrink-0 px-2 text-sm text-noir-ink-faint underline">
              {t("auth.manage.remove")}
            </button>
          </li>
        ))}
      </ul>
      {canAdd && (
        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-noir-brass/60 font-semibold text-noir-brass active:bg-noir-brass/10 disabled:opacity-60"
        >
          <KeyIcon /> {busy ? t("auth.passkey.creating") : t("auth.manage.add")}
        </button>
      )}
      {msg && <p className="text-sm text-red-300">{msg}</p>}
    </section>
  );
}
