"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gameText, getGame } from "@/lib/games";
import { AccountBar, ContinueRooms, GoogleButton, MyCases, useMe } from "@/components/site/Account";
import { RedeemBox } from "@/components/site/RedeemBox";
import { LanguageSwitcher, useT } from "@/i18n/client";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { AVATAR_COLORS } from "@/app/r/[code]/RoomClient";
import { Leaderboard } from "@/components/site/Leaderboard";
import { GameTrailer } from "@/components/site/GameTrailer";

/**
 * Landing page for a physical-room game (The Nightingale Express by default): start or rejoin a room. Staging
 * games are admins only (the page 404s for everyone else).
 */
export function TrainLanding({
  gameId = TRAIN_GAME_ID,
  startKey = "train.landing.board",
  startingKey = "train.landing.boarding",
}: { gameId?: string; startKey?: string; startingKey?: string } = {}) {
  const router = useRouter();
  const game = getGame(gameId)!;
  const me = useMe();
  // Hosting needs Google sign-in and owning the game (a purchase code), like Ada's case. Joining is free.
  const [unlocked, setUnlocked] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const signedIn = Boolean(me?.user) && !signedOut;
  const mustSignIn = Boolean(me?.googleEnabled) && !signedIn;
  const mustUnlock = signedIn && !unlocked && !me!.ownedGames.includes(gameId);
  const t = useT();
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
    if (!displayName) return setErr(t("train.landing.errName"));
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, displayName, color, replaceExisting }),
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
      setErr(data.signInRequired ? t("site.ada.errSignIn") : t("site.ada.errPurchase"));
      setBusy(false);
      return;
    }
    if (res.status === 409 && data.replaceRequired) {
      const codes = (data.openRooms ?? []).map((r) => r.code).join(", ");
      if (window.confirm(t("train.landing.replace", { codes }))) return start(true);
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
    router.push(`/r/${data.code}`);
  }

  return (
    <main className="noir-vignette min-h-dvh px-4 pb-10 pt-8">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-noir-ink-faint">
            {t("train.landing.back")}
          </Link>
          <LanguageSwitcher tone="noir" />
        </div>
        <header className="text-center">
          {game.status === "staging" && (
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-noir-blood">{t("train.landing.staging")}</p>
          )}
          <h1 className="mt-2 font-serif text-4xl text-noir-ink">{gameText(t, game, "title")}</h1>
          <p className="mt-2 font-serif italic text-noir-ink-dim">{gameText(t, game, "tagline")}</p>
        </header>
        <GameTrailer gameId={gameId} t={t} className="aspect-[16/10] rounded-xl border border-noir-line" />
        <p className="font-serif leading-relaxed text-noir-ink-dim">{gameText(t, game, "blurb")}</p>
        <ContinueRooms me={me} gameId={gameId} />
        <AccountBar me={me} callbackUrl={game.href} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
          className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-noir-ink-faint">{t("train.landing.name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoComplete="nickname"
              className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink"
            />
            <span className="text-xs leading-relaxed text-noir-ink-faint">{t("site.form.nameNotice")}</span>
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1.5 text-xs uppercase tracking-widest text-noir-ink-faint">{t("train.landing.color")}</legend>
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                aria-label={t("train.landing.colorAria", { color: c })}
                className={`h-10 w-10 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </fieldset>
          {err && <p className="text-sm text-noir-ink-dim">{err}</p>}
          {mustSignIn ? (
            <div className="flex flex-col gap-2">
              <GoogleButton label={t("site.ada.signInToHost")} callbackUrl={game.href} />
              <p className="text-center text-xs text-noir-ink-faint">{t("site.ada.hostsSignIn")}</p>
            </div>
          ) : mustUnlock ? (
            <RedeemBox gameTitle={gameText(t, game, "title")} onRedeemed={(id) => id === gameId && setUnlocked(true)} />
          ) : (
            <button type="submit" disabled={busy} className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg disabled:opacity-60">
              {busy ? t(startingKey) : t(startKey)}
            </button>
          )}
          <p className="text-xs text-noir-ink-faint">{t("train.landing.invite")}</p>
        </form>
        {me && <MyCases me={me} gameId={gameId} />}
        <Leaderboard gameId={gameId} />
      </div>
    </main>
  );
}
