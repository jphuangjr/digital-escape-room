"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gameText, getGame } from "@/lib/games";
import { AccountBar, ContinueRooms, SignInButton, useMe } from "@/components/site/Account";
import { RedeemBox } from "@/components/site/RedeemBox";
import { LanguageSwitcher, useT } from "@/i18n/client";
import { AVATAR_COLORS } from "@/lib/avatarColors";
import { PartyCodeField, PartyModeTabs, joinRoom, normalizeRoomCode, type PartyMode } from "@/components/site/PartyJoin";
import { GRUNT_GAME_ID, MAX_PLAYERS, MIN_PLAYERS } from "@/lib/grunt/types";

const STEPS: { title: string; body: string }[] = [
  { title: "Two teams", body: "Rocks and Sticks, picked at random. Teams take turns; everyone gets a go at giving the clues." },
  { title: "The card", body: "A word for 1 point and a harder phrase for 3. Your team can't see it." },
  { title: "Emoji only", body: "No talking, no pointing. Tap emoji on your phone; they appear on every phone as you go." },
  { title: "Bonk!", body: "The other team sees the card too. Catch the clue-giver talking or gesturing: a point off." },
];
/** Grunt's page: the rules, and hosting a room. Hosting needs sign-in and a purchase code; joining is free. */
export function GruntLanding() {
  const router = useRouter();
  const game = getGame(GRUNT_GAME_ID)!;
  const me = useMe();
  const t = useT();
  const [unlocked, setUnlocked] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const signedIn = Boolean(me?.user) && !signedOut;
  const mustSignIn = Boolean(me?.googleEnabled) && !signedIn;
  const mustUnlock = signedIn && !unlocked && !me!.ownedGames.includes(GRUNT_GAME_ID);
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<PartyMode>("host");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    try {
      const n = localStorage.getItem("ada_name");
      if (n) setName(n);
    } catch {}
    const join = new URLSearchParams(window.location.search).get("join");
    if (join) {
      setJoinCode(normalizeRoomCode(join));
      setMode("join");
    }
  }, []);

  async function start(replaceExisting = false, test = false): Promise<void> {
    const displayName = name.trim();
    if (!displayName) return setErr(t("train.landing.errName"));
    setBusy(true);
    setErr(null);
    if (mode === "join") {
      const joined = await joinRoom(joinCode, displayName, color, t);
      if ("error" in joined) {
        setErr(joined.error);
        setBusy(false);
        return;
      }
      try {
        localStorage.setItem("ada_name", displayName);
      } catch {}
      router.push(`/r/${joined.code}`);
      return;
    }
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: GRUNT_GAME_ID, displayName, color, replaceExisting }),
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
      setErr(data.signInRequired ? t("site.ada.errSignIn") : "Enter a purchase code to host Grunt.");
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
        body: JSON.stringify({ action: "fill", total: 6 }),
      }).catch(() => null);
    }
    router.push(`/r/${data.code}`);
  }

  return (
    <main className="min-h-dvh bg-stone-950 px-edge pt-edge pb-10 text-stone-100 pt-safe pb-safe">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/party" className="inline-flex min-h-11 items-center text-sm text-stone-400">
            ← {t("site.party.title")}
          </Link>
          <LanguageSwitcher tone="shell" />
        </div>
        <header className="text-center">
          {game.status === "staging" && <p className="font-mono text-11px uppercase tracking-[0.3em] text-rose-400">Staging · admins only</p>}
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">A party game for loud rooms</p>
          <h1 className="mt-1 text-5xl font-black tracking-tight">{gameText(t, game, "title")}</h1>
          <p className="mt-2 text-stone-300">{gameText(t, game, "tagline")}</p>
          {game.tags && game.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {game.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-orange-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>
        <p className="leading-relaxed text-stone-300">{gameText(t, game, "blurb")}</p>

        <section aria-labelledby="gr-how" className="flex flex-col gap-2">
          <h2 id="gr-how" className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
            How it plays
          </h2>
          <ol className="grid grid-cols-2 gap-2">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-stone-800 bg-stone-900 p-3">
                <p className="font-bold">
                  <span className="mr-1 text-orange-400">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="text-xs text-stone-400">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-stone-500">
            {MIN_PLAYERS} to {MAX_PLAYERS} players in the same room. Everyone needs a phone: the app deals the cards, runs the
            clock, shows the emoji clues and keeps score.
          </p>
        </section>

        <ContinueRooms me={me} gameId={GRUNT_GAME_ID} />
        <AccountBar me={me} callbackUrl={game.href} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
          className="flex flex-col gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-4"
        >
          <PartyModeTabs
            mode={mode}
            onChange={(m) => {
              setMode(m);
              setErr(null);
            }}
            activeClass="bg-orange-400 text-stone-950"
          />
          {mode === "join" && <PartyCodeField value={joinCode} onChange={setJoinCode} focusClass="focus:border-orange-400" />}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-stone-400">{t("train.landing.name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoComplete="nickname"
              className="min-h-12 rounded-xl border border-stone-700 bg-stone-950 px-3 text-base text-stone-100 outline-none focus:border-orange-400"
            />
            <span className="text-xs leading-relaxed text-stone-500">{t("site.form.nameNotice")}</span>
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="mb-1.5 text-xs uppercase tracking-widest text-stone-400">{t("train.landing.color")}</legend>
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
          {mode === "join" ? (
            <button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-orange-400 text-stone-950 font-bold active:opacity-80 disabled:opacity-60">
              {busy ? "Joining the cave…" : t("site.join.button")}
            </button>
          ) : mustSignIn ? (
            <div className="flex flex-col gap-2">
              <SignInButton label={t("site.ada.signInToHost")} callbackUrl={game.href} />
              <p className="text-center text-xs text-stone-500">{t("site.ada.hostsSignIn")}</p>
            </div>
          ) : mustUnlock ? (
            <RedeemBox gameTitle={gameText(t, game, "title")} onRedeemed={(id) => id === GRUNT_GAME_ID && setUnlocked(true)} />
          ) : (
            <button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-orange-400 font-bold text-stone-950 active:bg-orange-300 disabled:opacity-60">
              {busy ? "Lighting the fire…" : "Host a room"}
            </button>
          )}
          {mode === "host" && me?.isAdmin && signedIn && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void start(false, true)}
              className="min-h-12 rounded-xl border border-amber-300/60 font-semibold text-amber-200 active:bg-amber-300/10 disabled:opacity-60"
            >
              Admin: create a test room with 5 bots
            </button>
          )}
          {mode === "host" && <p className="text-xs text-stone-500">Friends join with the room code, the invite link or the QR code. No account needed to play.</p>}
        </form>
      </div>
    </main>
  );
}
