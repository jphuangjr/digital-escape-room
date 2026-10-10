"use client";

import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useT } from "@/i18n/client";
import { localGameTitle } from "@/lib/games";

/**
 * Enter a purchase code to unlock hosting a game. Not a <form>, so it can sit inside another form.
 * Until Stripe is wired up, codes are the only way to buy a game.
 */
export function RedeemBox({ gameTitle, onRedeemed }: { gameTitle: string; onRedeemed: (gameId: string) => void }) {
  const t = useT();
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
        setMsg({ tone: "error", text: data.error ?? t("site.redeemBox.failed") });
        return;
      }
      const title = localGameTitle(t, data.gameId);
      setMsg({ tone: "ok", text: t(data.alreadyOwned ? "site.redeemBox.alreadyOwned" : "site.redeemBox.unlocked", { title }) });
      setCode("");
      onRedeemed(data.gameId);
    } catch {
      setMsg({ tone: "error", text: t("site.error.network") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-noir-brass/40 bg-noir-bg-3 p-3">
      <p className="text-sm text-noir-ink">
        <FormattedMessage
          id="site.redeemBox.needsCode"
          values={{ title: gameTitle, b: (c) => <span className="font-semibold">{c}</span> }}
        />
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
          aria-label={t("site.redeemBox.codeAria")}
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
          {busy ? "…" : t("site.redeemBox.unlock")}
        </button>
      </div>
      {msg && (
        <p role="status" className={`text-sm ${msg.tone === "error" ? "text-noir-ink-dim" : "text-noir-brass"}`}>
          {msg.text}
        </p>
      )}
      <p className="text-xs text-noir-ink-faint">{t("site.redeemBox.note")}</p>
    </div>
  );
}
