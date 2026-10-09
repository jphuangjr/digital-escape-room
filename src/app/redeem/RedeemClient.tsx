"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getGame } from "@/lib/games";
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
            : { ok: false, error: data.error ?? "Couldn't redeem that code." },
        );
      })
      .catch(() => setResult({ ok: false, error: "Network trouble. Reload to try again." }));
  }, [code, me]);

  let body: React.ReactNode;
  if (!code) {
    body = <p className="text-noir-ink-dim">This link is missing its code. Ask whoever gave it to you for a new one.</p>;
  } else if (!me) {
    body = <p className="text-noir-ink-faint">Checking your account…</p>;
  } else if (!me.user) {
    body = (
      <>
        <p className="text-noir-ink-dim">
          You&apos;ve been given a free escape room. Sign in with Google and it&apos;s added to your account for good, so you
          can host it for your friends.
        </p>
        <p className="font-mono tracking-wider text-noir-brass">{code}</p>
        <GoogleButton label="Sign in with Google to claim" callbackUrl={`/redeem?code=${encodeURIComponent(code)}`} />
      </>
    );
  } else if (!result) {
    body = <p className="text-noir-ink-faint">Claiming {code}…</p>;
  } else if (result.ok) {
    const game = getGame(result.gameId);
    body = (
      <>
        <p className="font-serif text-2xl text-noir-ink">{result.alreadyOwned ? "You already own it" : "It's yours"}</p>
        <p className="text-noir-ink-dim">
          {result.alreadyOwned
            ? `${result.title} is already on your account, so this code wasn't used. Pass it on to a friend.`
            : `${result.title} is now on your account (${me.user.email ?? me.user.name}). Host it whenever you like.`}
        </p>
        {game && (
          <Link
            href={game.href}
            className="flex min-h-12 items-center justify-center rounded-lg bg-noir-brass font-semibold text-noir-bg active:bg-noir-brass-hi"
          >
            Host {game.title} →
          </Link>
        )}
      </>
    );
  } else {
    body = (
      <>
        <p className="font-serif text-2xl text-noir-ink">Couldn&apos;t claim it</p>
        <p className="text-noir-ink-dim">{result.error}</p>
        <p className="text-xs text-noir-ink-faint">Signed in as {me.user.email ?? me.user.name}.</p>
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
          All escape rooms
        </Link>
      </div>
    </main>
  );
}
