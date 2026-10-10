"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MeResponse, OpenHostedRoom } from "@/lib/types";
import { AccountBar, GoogleButton, MyCases } from "@/components/site/Account";
import { Compass } from "@/components/site/Compass";
import { ReplaceRoomDialog } from "@/components/site/ReplaceRoomDialog";
import { RedeemBox } from "@/components/site/RedeemBox";
import { LanguageSwitcher, useT } from "@/i18n/client";
import { getGame, gameText } from "@/lib/games";
import { FormattedMessage } from "react-intl";

const COLORS = ["#c9a227", "#a3302a", "#3d8c88", "#6b7fd7", "#b56cc4", "#d9824b", "#7fae4e", "#d8d2c4"];
const PREF_KEY = "ada.profile";
const GAME_ID = "ada-voss";

function normalizeCode(raw: string): string {
  let s = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  if (/^ADA[^-]/.test(s)) s = `ADA-${s.slice(3)}`;
  if (s && !s.startsWith("ADA-")) s = `ADA-${s}`;
  return s;
}

export function AdaLanding() {
  const router = useRouter();
  const t = useT();
  const game = getGame(GAME_ID)!;
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [replaceRooms, setReplaceRooms] = useState<OpenHostedRoom[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        setMe(data);
        // Prefill from Google only when the player hasn't chosen a name on this device.
        if (data.user?.name) setName((n) => n || data.user!.name!.slice(0, 24));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = Boolean(me?.user);
  const mustSignInToHost = mode === "create" && Boolean(me?.googleEnabled) && !signedIn;
  const mustUnlockToHost = mode === "create" && signedIn && !me!.ownedGames.includes(GAME_ID);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null") as { name?: string; color?: string } | null;
      if (saved?.name) setName(saved.name);
      if (saved?.color && COLORS.includes(saved.color)) setColor(saved.color);
    } catch {
      /* storage unavailable */
    }
    const join = new URLSearchParams(window.location.search).get("join");
    if (join) {
      setJoinCode(normalizeCode(join));
      setMode("join");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await send(false);
  }

  async function send(replaceExisting: boolean) {
    setErr(null);
    const displayName = name.trim();
    if (!displayName) return setErr(t("site.ada.errName"));
    const code = normalizeCode(joinCode);
    if (mode === "join" && !/^ADA-[A-Z0-9]{4}$/.test(code)) return setErr(t("site.join.invalidCode"));
    setBusy(true);
    try {
      try {
        localStorage.setItem(PREF_KEY, JSON.stringify({ name: displayName, color }));
      } catch {
        /* ignore */
      }
      const res = await fetch(mode === "create" ? "/api/rooms" : `/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          color,
          ...(mode === "create" ? { gameId: GAME_ID } : {}),
          ...(mode === "create" && replaceExisting ? { replaceExisting: true } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        code?: string;
        error?: string;
        signInRequired?: boolean;
        replaceRequired?: boolean;
        purchaseRequired?: boolean;
        openRooms?: OpenHostedRoom[];
      };
      if (data.purchaseRequired) {
        setMe((m) => (m ? { ...m, ownedGames: m.ownedGames.filter((g) => g !== GAME_ID) } : m));
        setErr(t("site.ada.errPurchase"));
        setBusy(false);
        return;
      }
      if (data.replaceRequired && data.openRooms?.length) {
        setReplaceRooms(data.openRooms);
        setBusy(false);
        return;
      }
      if (data.signInRequired) {
        setErr(t("site.ada.errSignIn"));
        setMe((m) => (m ? { ...m, googleEnabled: true, user: null } : m));
        setBusy(false);
        return;
      }
      if (!res.ok || !data.code) {
        setErr(res.status === 404 ? t("site.ada.errNoRoom") : data.error || t("site.ada.errGeneric"));
        setBusy(false);
        return;
      }
      setReplaceRooms(null);
      router.push(`/r/${data.code}`);
    } catch {
      setErr(t("site.error.network"));
      setBusy(false);
    }
  }

  return (
    <main className="noir-vignette min-h-dvh pt-safe pb-safe px-safe">
      {replaceRooms && (
        <ReplaceRoomDialog
          rooms={replaceRooms}
          busy={busy}
          onCancel={() => setReplaceRooms(null)}
          onConfirm={() => void send(true)}
        />
      )}
      <div className="mx-auto flex max-w-md flex-col gap-8 px-4 pb-10 pt-10">
        <div className="-mb-4 flex flex-wrap items-center justify-between gap-x-4">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm text-noir-ink-faint">
            {t("site.ada.back")}
          </Link>
          <LanguageSwitcher tone="noir" />
        </div>
        <header className="flex flex-col items-center gap-4 text-center">
          <Compass className="h-20 w-20 text-noir-brass" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">{t("site.ada.caseFile")}</p>
          <h1 className="font-serif text-4xl leading-tight text-noir-ink">
            <FormattedMessage
              id="site.ada.heading"
              values={{
                line: (c) => (
                  <>
                    {c}
                    <br />
                  </>
                ),
                accent: (c) => <span className="text-noir-brass">{c}</span>,
              }}
            />
          </h1>
        </header>

        <section className="space-y-3 font-serif text-base leading-relaxed text-noir-ink-dim">
          <p>{t("site.ada.intro")}</p>
          <blockquote className="border-l-2 border-noir-brass pl-4 italic text-noir-ink">
            &ldquo;{t("site.ada.quote")}&rdquo;
          </blockquote>
          <p className="text-sm text-noir-ink-faint">{t("site.ada.solo")}</p>
        </section>

        <AccountBar me={me} callbackUrl="/play/ada-voss" fallbackColor={color} />

        <form onSubmit={submit} className="flex flex-col gap-5 rounded-xl border border-noir-line bg-noir-bg-2/90 p-4">
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-noir-bg-3 p-1">
            {(["create", "join"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setErr(null);
                }}
                className={`min-h-11 rounded-md text-sm font-medium transition-colors ${
                  mode === m ? "bg-noir-brass text-noir-bg" : "text-noir-ink-dim"
                }`}
              >
                {m === "create" ? t("site.ada.tabCreate") : t("site.ada.tabJoin")}
              </button>
            ))}
          </div>

          {mode === "join" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest text-noir-ink-faint">{t("site.ada.roomCode")}</span>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onBlur={() => setJoinCode((c) => normalizeCode(c))}
                placeholder="ADA-7K2Q"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                maxLength={12}
                className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 font-mono text-lg tracking-widest text-noir-ink placeholder:text-noir-ink-faint"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-noir-ink-faint">{t("site.form.yourName")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("site.ada.namePlaceholder")}
              maxLength={24}
              autoComplete="nickname"
              className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink placeholder:text-noir-ink-faint"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-xs uppercase tracking-widest text-noir-ink-faint">{t("site.form.avatarColor")}</legend>
            <div className="grid grid-cols-8 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={t("site.form.colorAria", { color: c })}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className="flex min-h-11 items-center justify-center rounded-full"
                >
                  <span
                    className={`block h-8 w-8 rounded-full border-2 ${color === c ? "border-noir-ink scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          {err && (
            <p role="alert" className="rounded-md border border-noir-blood/60 bg-noir-blood/15 px-3 py-2 text-sm text-noir-ink">
              {err}
            </p>
          )}

          {mustSignInToHost ? (
            <div className="flex flex-col gap-2">
              <GoogleButton label={t("site.ada.signInToHost")} callbackUrl="/play/ada-voss" />
              <p className="text-center text-xs text-noir-ink-faint">{t("site.ada.hostsSignIn")}</p>
            </div>
          ) : mustUnlockToHost ? (
            <RedeemBox
              gameTitle={gameText(t, game, "title")}
              onRedeemed={(gameId) =>
                setMe((m) => (m && !m.ownedGames.includes(gameId) ? { ...m, ownedGames: [...m.ownedGames, gameId] } : m))
              }
            />
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg transition-colors active:bg-noir-brass-hi disabled:opacity-60"
            >
              {busy ? t("site.ada.opening") : mode === "create" ? t("site.ada.openCase") : t("site.form.joinInvestigation")}
            </button>
          )}
        </form>

        {me && <MyCases me={me} gameId="ada-voss" />}

        <footer className="text-center font-mono text-[11px] text-noir-ink-faint">
          {t("site.ada.footer")}
        </footer>
      </div>
    </main>
  );
}
