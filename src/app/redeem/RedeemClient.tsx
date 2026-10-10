"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getGame, gameText } from "@/lib/games";
import { useT } from "@/i18n/client";
import { GoogleButton, useMe } from "@/components/site/Account";
import { Compass } from "@/components/site/Compass";

type Result = { ok: true; gameId: string; title: string; alreadyOwned: boolean } | { ok: false; error: string };

/**
 * Landing page for a purchase-code QR (`/redeem?code=KEY-…`). Asks the visitor to sign in with Google,
 * then redeems the code onto their account automatically.
 */
export function RedeemClient() {
  const code = (useSearchParams().get("code") ?? "").trim().toUpperCase();
  const me = useMe();
  const t = useT();
  const [result, setResult] = useState<Result | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!code || !me?.user || started.current) return;
    started.current = true;
    fetch("/api/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as Partial<Extract<Result, { ok: true }>> & { error?: string };
        setResult(
          res.ok && data.gameId
            ? { ok: true, gameId: data.gameId, title: data.title ?? data.gameId, alreadyOwned: Boolean(data.alreadyOwned) }
            : { ok: false, error: data.error ?? t("site.redeemBox.failed") },
        );
      })
      .catch(() => setResult({ ok: false, error: t("site.redeem.networkReload") }));
  }, [code, me, t]);

  let body: React.ReactNode;
  if (!code) {
    body = <p className="text-noir-ink-dim">{t("site.redeem.missingCode")}</p>;
  } else if (!me) {
    body = <p className="text-noir-ink-faint">{t("site.redeem.checking")}</p>;
  } else if (!me.user) {
    body = (
      <>
        <p className="text-noir-ink-dim">{t("site.redeem.invite")}</p>
        <p className="font-mono tracking-wider text-noir-brass">{code}</p>
        <GoogleButton label={t("site.redeem.signIn")} callbackUrl={`/redeem?code=${encodeURIComponent(code)}`} />
      </>
    );
  } else if (!result) {
    body = <p className="text-noir-ink-faint">{t("site.redeem.claiming", { code })}</p>;
  } else if (result.ok) {
    const game = getGame(result.gameId);
    const title = game ? gameText(t, game, "title") : result.title;
    body = (
      <>
        <p className="font-serif text-2xl text-noir-ink">{result.alreadyOwned ? t("site.redeem.alreadyOwnedTitle") : t("site.redeem.okTitle")}</p>
        <p className="text-noir-ink-dim">
          {result.alreadyOwned
            ? t("site.redeem.alreadyOwnedBody", { title })
            : t("site.redeem.okBody", { title, account: me.user.email ?? me.user.name ?? "" })}
        </p>
        {game && (
          <Link
            href={game.href}
            className="flex min-h-12 items-center justify-center rounded-lg bg-noir-brass font-semibold text-noir-bg active:bg-noir-brass-hi"
          >
            {t("site.redeem.host", { title })}
          </Link>
        )}
      </>
    );
  } else {
    body = (
      <>
        <p className="font-serif text-2xl text-noir-ink">{t("site.redeem.failedTitle")}</p>
        <p className="text-noir-ink-dim">{result.error}</p>
        <p className="text-xs text-noir-ink-faint">{t("site.redeem.signedInAs", { account: me.user.email ?? me.user.name ?? "" })}</p>
      </>
    );
  }

  return (
    <main className="noir-vignette flex min-h-dvh items-center justify-center pt-safe pb-safe px-safe">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 px-4 py-10 text-center">
        <Compass className="h-16 w-16 text-noir-brass" />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">Escape Escape</p>
        <div className="flex w-full flex-col gap-4">{body}</div>
        <Link href="/" className="min-h-11 content-center text-sm text-noir-ink-faint underline">
          {t("site.allRooms")}
        </Link>
      </div>
    </main>
  );
}
