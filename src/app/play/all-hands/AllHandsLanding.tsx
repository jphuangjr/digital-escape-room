"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gameText, getGame } from "@/lib/games";
import { AccountBar, ContinueRooms, SignInButton, useMe } from "@/components/site/Account";
import { RedeemBox } from "@/components/site/RedeemBox";
import { LanguageSwitcher, useT } from "@/i18n/client";
import { AVATAR_COLORS } from "@/lib/avatarColors";
import { HowToPlayTour } from "@/components/allhands/HowToPlayTour";
import { ALL_HANDS_GAME_ID, MAX_PLAYERS, MIN_PLAYERS, ROLE_INFO, type Role } from "@/lib/allhands/types";

const ROLES: Role[] = ["employee", "mole", "it", "hr", "recruiter", "intern", "burnout", "nephew"];

/** All Hands' page: the rules, and hosting a room. Hosting needs sign-in and a purchase code; joining is free. */
export function AllHandsLanding() {
  const router = useRouter();
  const game = getGame(ALL_HANDS_GAME_ID)!;
  const me = useMe();
  const t = useT();
  const [unlocked, setUnlocked] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const signedIn = Boolean(me?.user) && !signedOut;
  const mustSignIn = Boolean(me?.googleEnabled) && !signedIn;
  const mustUnlock = signedIn && !unlocked && !me!.ownedGames.includes(ALL_HANDS_GAME_ID);
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tour, setTour] = useState(false);

  useEffect(() => {
    try {
      const n = localStorage.getItem("ada_name");
      if (n) setName(n);
    } catch {}
  }, []);

  async function start(replaceExisting = false, test = false): Promise<void> {
    const displayName = name.trim();
    if (!displayName) return setErr(t("train.landing.errName"));
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: ALL_HANDS_GAME_ID, displayName, color, replaceExisting }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      code?: string;
      error?: string;
      replaceRequired?: boolean;
      signInRequired?: boolean;
      purchaseRequired?: boolean;
      openRooms?: { code: string }[];
    };
    if (data.signInRequired || data.purchaseRequired) {
      if (data.signInRequired) setSignedOut(true);
      else setUnlocked(false);
      setErr(data.signInRequired ? t("site.ada.errSignIn") : "Enter a purchase code to host All Hands.");
      setBusy(false);
      return;
    }
    if (res.status === 409 && data.replaceRequired) {
      const codes = (data.openRooms ?? []).map((r) => r.code).join(", ");
      if (window.confirm(t("train.landing.replace", { codes }))) return start(true, test);
      setBusy(false);
      return;
    }
    if (!res.ok || !data.code) {
      setBusy(false);
      setErr(data.error ?? t("train.landing.errStart"));
      return;
    }
    try {
      localStorage.setItem("ada_name", displayName);
    } catch {}
    // Admin test room: a full table of bots, ready to start.
    if (test) {
      await fetch(`/api/rooms/${encodeURIComponent(data.code)}/party/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fill", total: 8 }),
      }).catch(() => null);
    }
    router.push(`/r/${data.code}`);
  }

  return (
    <main className="min-h-dvh bg-slate-950 px-edge pt-edge pb-10 text-slate-100 pt-safe pb-safe">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/party" className="inline-flex min-h-11 items-center text-sm text-slate-400">
            ← {t("site.party.title")}
          </Link>
          <LanguageSwitcher tone="shell" />
        </div>
        <header className="text-center">
          {game.status === "staging" && <p className="font-mono text-11px uppercase tracking-[0.3em] text-rose-400">Staging · admins only</p>}
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-lime-300">A Synergr party game</p>
          <h1 className="mt-1 text-5xl font-black tracking-tight">{gameText(t, game, "title")}</h1>
          <p className="mt-2 text-slate-300">{gameText(t, game, "tagline")}</p>
        </header>
        <p className="leading-relaxed text-slate-300">{gameText(t, game, "blurb")}</p>

        <section aria-labelledby="ah-roles" className="flex flex-col gap-2">
          <h2 id="ah-roles" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Who&apos;s who
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <li key={r} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                <p className="font-bold">{ROLE_INFO[r].name}</p>
                <p className="text-xs text-slate-400">{ROLE_INFO[r].power}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            {MIN_PLAYERS} to {MAX_PLAYERS} players in the same room, talking out loud. Every phone is a secret badge; the app runs
            the clock and the narration.
          </p>
          <button
            type="button"
            onClick={() => setTour(true)}
            className="min-h-11 self-start rounded-xl border border-slate-700 px-4 text-sm font-semibold active:bg-slate-800"
          >
            🎓 How to play
          </button>
        </section>
        {tour && <HowToPlayTour onClose={() => setTour(false)} />}

        <ContinueRooms me={me} gameId={ALL_HANDS_GAME_ID} />
        <AccountBar me={me} callbackUrl={game.href} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-slate-400">{t("train.landing.name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoComplete="nickname"
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-slate-100 outline-none focus:border-lime-300"
            />
            <span className="text-xs leading-relaxed text-slate-500">{t("site.form.nameNotice")}</span>
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1.5 text-xs uppercase tracking-widest text-slate-400">{t("train.landing.color")}</legend>
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                aria-label={t("train.landing.colorAria", { color: c })}
                className={`h-11 w-11 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </fieldset>
          {err && <p className="text-sm text-rose-300">{err}</p>}
          {mustSignIn ? (
            <div className="flex flex-col gap-2">
              <SignInButton label={t("site.ada.signInToHost")} callbackUrl={game.href} />
              <p className="text-center text-xs text-slate-500">{t("site.ada.hostsSignIn")}</p>
            </div>
          ) : mustUnlock ? (
            <RedeemBox gameTitle={gameText(t, game, "title")} onRedeemed={(id) => id === ALL_HANDS_GAME_ID && setUnlocked(true)} />
          ) : (
            <button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-lime-300 font-bold text-slate-950 active:bg-lime-200 disabled:opacity-60">
              {busy ? "Booking the meeting room…" : "Host a room"}
            </button>
          )}
          {me?.isAdmin && signedIn && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void start(false, true)}
              className="min-h-12 rounded-xl border border-amber-300/60 font-semibold text-amber-200 active:bg-amber-300/10 disabled:opacity-60"
            >
              Admin: create a test room with 7 bots
            </button>
          )}
          <p className="text-xs text-slate-500">Friends join with the room code, the invite link or the QR code. No account needed to play.</p>
        </form>
      </div>
    </main>
  );
}
