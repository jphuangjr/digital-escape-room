"use client";

import { useState } from "react";

/**
 * Enter a purchase code to unlock hosting a game. Not a <form>, so it can sit inside another form.
 * Until Stripe is wired up, codes are the only way to buy a game.
 */
export function RedeemBox({ gameTitle, onRedeemed }: { gameTitle: string; onRedeemed: (gameId: string) => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "ok"; text: string } | null>(null);

  async function redeem() {
    if (!code.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; gameId?: string; title?: string; alreadyOwned?: boolean; error?: string };
      if (!res.ok || !data.ok || !data.gameId) {
        setMsg({ tone: "error", text: data.error ?? "Couldn't redeem that code." });
        return;
      }
      setMsg({ tone: "ok", text: data.alreadyOwned ? `You already own ${data.title}.` : `Unlocked ${data.title}. It's yours for good.` });
      setCode("");
      onRedeemed(data.gameId);
    } catch {
      setMsg({ tone: "error", text: "Network trouble. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-noir-brass/40 bg-noir-bg-3 p-3">
      <p className="text-sm text-noir-ink">
        Hosting <span className="font-semibold">{gameTitle}</span> needs a purchase code.
      </p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void redeem();
            }
          }}
          placeholder="KEY-XXXX-XXXX-XXXX"
          aria-label="Purchase code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={24}
          className="min-h-12 min-w-0 flex-1 rounded-lg border border-noir-line bg-noir-bg-2 px-2 font-mono text-[15px] text-noir-ink placeholder:text-noir-ink-faint"
        />
        <button
          type="button"
          onClick={() => void redeem()}
          disabled={busy || !code.trim()}
          className="min-h-12 shrink-0 rounded-lg bg-noir-brass px-4 font-semibold text-noir-bg active:bg-noir-brass-hi disabled:opacity-50"
        >
          {busy ? "…" : "Unlock"}
        </button>
      </div>
      {msg && (
        <p role="status" className={`text-sm ${msg.tone === "error" ? "text-noir-ink-dim" : "text-noir-brass"}`}>
          {msg.text}
        </p>
      )}
      <p className="text-xs text-noir-ink-faint">Codes are single-use and unlock hosting permanently. Joining a friend&apos;s room is always free.</p>
    </div>
  );
}
