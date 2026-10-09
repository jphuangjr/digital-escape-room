"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AdminCodeDTO } from "@/lib/types";
import { GAMES } from "@/lib/games";
import { useMe } from "@/components/site/Account";
import { QrCode } from "@/components/site/QrCode";

export function AdminClient() {
  const me = useMe();

  if (!me) return <Shell><p className="text-noir-ink-faint">Loading…</p></Shell>;
  if (!me.isAdmin) {
    return (
      <Shell>
        <p className="text-noir-ink-dim">This page is for admins.</p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-noir-brass underline">
          Back to Escape Escape
        </Link>
      </Shell>
    );
  }
  return (
    <Shell>
      <CodesPanel />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh pt-safe pb-safe px-safe">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-10 pt-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">Escape Escape</p>
            <h1 className="font-serif text-3xl text-noir-ink">Admin</h1>
          </div>
          <Link href="/" className="min-h-11 content-center text-sm text-noir-ink-faint underline">
            Site
          </Link>
        </header>
        {children}
      </div>
    </main>
  );
}

type Kind = "single" | "group";

const EXPIRY_OPTIONS: { label: string; days: number | null }[] = [
  { label: "Never", days: null },
  { label: "1 day", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
];

function usesLabel(c: AdminCodeDTO): string {
  if (c.maxUses === 1) return "Single-use";
  return `Group · ${c.useCount}/${c.maxUses ?? "∞"} uses`;
}

const STATUS_LABEL: Record<AdminCodeDTO["status"], string> = {
  active: "",
  used: "Used up",
  expired: "Expired",
  revoked: "Turned off",
};

function CodesPanel() {
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [codes, setCodes] = useState<AdminCodeDTO[] | null>(null);
  const [kind, setKind] = useState<Kind>("single");
  const [count, setCount] = useState(5);
  const [maxUses, setMaxUses] = useState<number | null>(10);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [qrFor, setQrFor] = useState<AdminCodeDTO | null>(null);

  const load = useCallback(async () => {
    setCodes(null);
    const res = await fetch(`/api/admin/codes?gameId=${encodeURIComponent(gameId)}`);
    const data = (await res.json().catch(() => ({}))) as { codes?: AdminCodeDTO[]; error?: string };
    if (!res.ok) setMsg(data.error ?? "Couldn't load codes.");
    setCodes(data.codes ?? []);
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        kind === "group" ? { gameId, kind, maxUses, expiresInDays, note } : { gameId, kind, count, expiresInDays, note },
      ),
    });
    const data = (await res.json().catch(() => ({}))) as { codes?: AdminCodeDTO[]; error?: string };
    setBusy(false);
    if (!res.ok || !data.codes) return setMsg(data.error ?? "Couldn't generate codes.");
    setFresh(new Set(data.codes.map((c) => c.id)));
    setCodes((cur) => [...data.codes!, ...(cur ?? [])]);
    if (kind === "group") {
      setMsg("Group code created. Share its QR or link in the group chat.");
      setQrFor(data.codes[0]);
    } else {
      setMsg(`Generated ${data.codes.length} ${data.codes.length === 1 ? "code" : "codes"}.`);
    }
  }

  async function turnOff(c: AdminCodeDTO) {
    const warning =
      c.useCount > 0
        ? `Turn off ${c.code}? Nobody else can use it. The ${c.useCount} ${c.useCount === 1 ? "person" : "people"} who already claimed it keep their room.`
        : `Turn off ${c.code}? It will stop working.`;
    if (!confirm(warning)) return;
    const res = await fetch(`/api/admin/codes/${c.id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return setMsg(data.error ?? "Couldn't turn it off.");
    setCodes((cur) => (cur ?? []).map((x) => (x.id === c.id ? { ...x, status: "revoked", revokedAt: new Date().toISOString() } : x)));
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`Copied ${label}.`);
    } catch {
      setMsg("Copy failed; select the text instead.");
    }
  }

  const active = (codes ?? []).filter((c) => c.status === "active");
  const done = (codes ?? []).filter((c) => c.status !== "active");
  const activeSingles = active.filter((c) => c.maxUses === 1);
  const chip = (on: boolean) =>
    `min-h-11 rounded-lg border px-3 text-sm ${on ? "border-noir-brass bg-noir-brass text-noir-bg" : "border-noir-line text-noir-ink-dim"}`;

  return (
    <div className="flex flex-col gap-5">
      {qrFor && <CodeQrDialog code={qrFor} onClose={() => setQrFor(null)} onCopy={copy} />}
      <div role="tablist" aria-label="Game" className="-mx-4 flex gap-2 overflow-x-auto px-4">
        {GAMES.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === gameId}
            onClick={() => {
              setGameId(g.id);
              setFresh(new Set());
              setMsg(null);
            }}
            className={`shrink-0 ${chip(g.id === gameId)}`}
          >
            {g.title}
            {g.status === "soon" ? " (soon)" : ""}
          </button>
        ))}
      </div>

      <form onSubmit={generate} className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2 p-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">Create purchase codes</h2>

        <div role="radiogroup" aria-label="Code type" className="grid grid-cols-2 gap-2">
          <button type="button" role="radio" aria-checked={kind === "single"} onClick={() => setKind("single")} className={chip(kind === "single")}>
            Single-use codes
          </button>
          <button type="button" role="radio" aria-checked={kind === "group"} onClick={() => setKind("group")} className={chip(kind === "group")}>
            Group code
          </button>
        </div>
        <p className="text-xs text-noir-ink-faint">
          {kind === "single"
            ? "One code per person. Each works for exactly one account."
            : "One shareable code for a group chat. Anyone with it can claim a free room, once per account, until it runs out or expires."}
        </p>

        <div className="flex flex-wrap gap-3">
          {kind === "single" ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-noir-ink-faint">How many codes</span>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="min-h-12 w-24 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink"
              />
            </label>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-noir-ink-faint">Uses allowed</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={10000}
                  value={maxUses ?? ""}
                  disabled={maxUses === null}
                  aria-label="Uses allowed"
                  onChange={(e) => setMaxUses(Math.max(2, Math.min(10000, Number(e.target.value) || 2)))}
                  className="min-h-12 w-24 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink disabled:opacity-40"
                />
                <label className="flex min-h-11 items-center gap-2 text-sm text-noir-ink-dim">
                  <input
                    type="checkbox"
                    checked={maxUses === null}
                    onChange={(e) => setMaxUses(e.target.checked ? null : 10)}
                    className="h-5 w-5 accent-[var(--color-noir-brass,#c9a227)]"
                  />
                  Unlimited
                </label>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-noir-ink-faint">Expires</span>
            <div className="flex flex-wrap gap-1">
              {EXPIRY_OPTIONS.map((o) => (
                <button key={o.label} type="button" onClick={() => setExpiresInDays(o.days)} className={chip(expiresInDays === o.days)} aria-pressed={expiresInDays === o.days}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-noir-ink-faint">Note (optional, e.g. who it&apos;s for)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder={kind === "group" ? "Book club chat" : "Birthday gift for Alex"}
            className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink placeholder:text-noir-ink-faint"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg active:bg-noir-brass-hi disabled:opacity-60"
        >
          {busy ? "Creating…" : kind === "group" ? "Create group code" : `Generate ${count} ${count === 1 ? "code" : "codes"}`}
        </button>
        {msg && (
          <p role="status" className="text-sm text-noir-ink-dim">
            {msg}
          </p>
        )}
      </form>

      {codes === null ? (
        <p className="text-noir-ink-faint">Loading codes…</p>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">Active ({active.length})</h2>
              {activeSingles.length > 1 && (
                <button
                  onClick={() => copy(activeSingles.map((c) => c.code).join("\n"), `${activeSingles.length} single-use codes`)}
                  className="min-h-11 text-sm text-noir-brass underline"
                >
                  Copy all single-use
                </button>
              )}
            </div>
            {active.length === 0 && <p className="text-sm text-noir-ink-faint">No active codes for this game.</p>}
            <ul className="flex flex-col gap-2">
              {active.map((c) => (
                <CodeRow key={c.id} c={c} highlight={fresh.has(c.id)} onQr={() => setQrFor(c)} onCopy={copy} onTurnOff={() => turnOff(c)} />
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">Used, expired or off ({done.length})</h2>
            {done.length === 0 && <p className="text-sm text-noir-ink-faint">None yet.</p>}
            <ul className="flex flex-col gap-2">
              {done.map((c) => (
                <CodeRow key={c.id} c={c} onQr={() => setQrFor(c)} onCopy={copy} />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function CodeRow({
  c,
  highlight = false,
  onQr,
  onCopy,
  onTurnOff,
}: {
  c: AdminCodeDTO;
  highlight?: boolean;
  onQr: () => void;
  onCopy: (text: string, label: string) => void;
  onTurnOff?: () => void;
}) {
  const live = c.status === "active";
  const meta = [
    usesLabel(c),
    STATUS_LABEL[c.status],
    c.expiresAt ? `${new Date(c.expiresAt).getTime() > Date.now() ? "expires" : "expired"} ${new Date(c.expiresAt).toLocaleDateString()}` : "",
    c.note ?? "",
  ].filter(Boolean);
  return (
    <li
      className={`rounded-lg border px-3 py-2 ${
        highlight ? "border-noir-brass/70 bg-noir-brass/10" : live ? "border-noir-line bg-noir-bg-2" : "border-noir-line bg-noir-bg-2/60"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onQr} className="min-w-0 flex-1 text-left" aria-label={`Show QR for ${c.code}`}>
          <span className={`block font-mono tracking-wider ${live ? "text-noir-ink" : "text-noir-ink-dim line-through decoration-noir-ink-faint"}`}>
            {c.code}
          </span>
          <span className="block text-xs text-noir-ink-faint">{meta.join(" · ")}</span>
        </button>
        {live && (
          <>
            <button onClick={onQr} className="min-h-11 px-2 text-sm text-noir-brass underline">
              QR
            </button>
            <button onClick={() => onCopy(c.code, c.code)} className="min-h-11 px-2 text-sm text-noir-brass underline">
              Copy
            </button>
            {onTurnOff && (
              <button onClick={onTurnOff} className="min-h-11 px-2 text-sm text-noir-ink-faint underline">
                Turn off
              </button>
            )}
          </>
        )}
      </div>
      {c.redemptions.length > 0 && (
        <details className="mt-1 text-xs text-noir-ink-faint">
          <summary className="min-h-8 cursor-pointer content-center">
            Claimed by {c.useCount} {c.useCount === 1 ? "account" : "accounts"}
          </summary>
          <ul className="mt-1 flex flex-col gap-0.5 pl-3">
            {c.redemptions.map((r) => (
              <li key={r.email + r.at}>
                {r.email} · {new Date(r.at).toLocaleString()}
              </li>
            ))}
            {c.useCount > c.redemptions.length && <li>…and {c.useCount - c.redemptions.length} more</li>}
          </ul>
        </details>
      )}
    </li>
  );
}

/** Full-screen QR for one purchase code. Scanning opens /redeem?code=…, which signs the person in and credits them. */
function CodeQrDialog({
  code,
  onClose,
  onCopy,
}: {
  code: AdminCodeDTO;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}) {
  const url = `${window.location.origin}/redeem?code=${encodeURIComponent(code.code)}`;
  const game = GAMES.find((g) => g.id === code.gameId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 pb-safe pt-safe" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-noir-line bg-noir-bg-2 p-5 text-center"
      >
        <h2 id="qr-title" className="font-serif text-xl text-noir-ink">
          Scan to claim {game?.title ?? code.gameId}
        </h2>
        <QrCode url={url} size={240} label={`QR code to redeem ${code.code}`} />
        <p className="font-mono tracking-wider text-noir-brass">{code.code}</p>
        {code.note && <p className="text-xs text-noir-ink-faint">{code.note}</p>}
        <p className="text-xs text-noir-ink-dim">
          They&apos;ll sign in with Google and the room is added to their account.{" "}
          {code.maxUses === 1 ? "Single use." : `Once per account · ${code.useCount}/${code.maxUses ?? "∞"} used.`}
        </p>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => onCopy(url, "claim link")}
            className="min-h-12 flex-1 rounded-lg border border-noir-line font-semibold text-noir-brass"
          >
            Copy link
          </button>
          <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-lg bg-noir-brass font-semibold text-noir-bg" autoFocus>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
