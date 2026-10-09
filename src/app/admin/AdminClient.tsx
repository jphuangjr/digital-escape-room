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

function CodesPanel() {
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [codes, setCodes] = useState<AdminCodeDTO[] | null>(null);
  const [count, setCount] = useState(5);
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
      body: JSON.stringify({ gameId, count, note }),
    });
    const data = (await res.json().catch(() => ({}))) as { codes?: AdminCodeDTO[]; error?: string };
    setBusy(false);
    if (!res.ok || !data.codes) return setMsg(data.error ?? "Couldn't generate codes.");
    setFresh(new Set(data.codes.map((c) => c.id)));
    setCodes((cur) => [...data.codes!, ...(cur ?? [])]);
    setMsg(`Generated ${data.codes.length} ${data.codes.length === 1 ? "code" : "codes"}.`);
  }

  async function revoke(c: AdminCodeDTO) {
    if (!confirm(`Revoke ${c.code}? It will stop working.`)) return;
    const res = await fetch(`/api/admin/codes/${c.id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return setMsg(data.error ?? "Couldn't revoke.");
    setCodes((cur) => (cur ?? []).filter((x) => x.id !== c.id));
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`Copied ${label}.`);
    } catch {
      setMsg("Copy failed; select the text instead.");
    }
  }

  const unused = (codes ?? []).filter((c) => !c.redeemedAt);
  const used = (codes ?? []).filter((c) => c.redeemedAt);

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
            className={`min-h-11 shrink-0 rounded-lg border px-4 text-sm ${
              g.id === gameId ? "border-noir-brass bg-noir-brass text-noir-bg" : "border-noir-line text-noir-ink-dim"
            }`}
          >
            {g.title}
            {g.status === "soon" ? " (soon)" : ""}
          </button>
        ))}
      </div>

      <form onSubmit={generate} className="flex flex-col gap-3 rounded-xl border border-noir-line bg-noir-bg-2 p-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">Generate purchase codes</h2>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-noir-ink-faint">How many</span>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              className="min-h-12 w-24 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink"
            />
          </label>
          <label className="flex min-w-48 flex-1 flex-col gap-1">
            <span className="text-xs text-noir-ink-faint">Note (optional, e.g. who it&apos;s for)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              placeholder="Birthday gift for Alex"
              className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink placeholder:text-noir-ink-faint"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg active:bg-noir-brass-hi disabled:opacity-60"
        >
          {busy ? "Generating…" : `Generate ${count} ${count === 1 ? "code" : "codes"}`}
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
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">Unused ({unused.length})</h2>
              {unused.length > 0 && (
                <button
                  onClick={() => copy(unused.map((c) => c.code).join("\n"), `${unused.length} unused codes`)}
                  className="min-h-11 text-sm text-noir-brass underline"
                >
                  Copy all
                </button>
              )}
            </div>
            {unused.length === 0 && <p className="text-sm text-noir-ink-faint">No unused codes for this game.</p>}
            <ul className="flex flex-col gap-2">
              {unused.map((c) => (
                <li
                  key={c.id}
                  className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 ${
                    fresh.has(c.id) ? "border-noir-brass/70 bg-noir-brass/10" : "border-noir-line bg-noir-bg-2"
                  }`}
                >
                  <button type="button" onClick={() => setQrFor(c)} className="min-w-0 flex-1 text-left" aria-label={`Show QR for ${c.code}`}>
                    <span className="block font-mono tracking-wider text-noir-ink">{c.code}</span>
                    <span className="block text-xs text-noir-ink-faint">
                      {new Date(c.createdAt).toLocaleDateString()}
                      {c.note ? ` · ${c.note}` : ""}
                    </span>
                  </button>
                  <button onClick={() => setQrFor(c)} className="min-h-11 px-2 text-sm text-noir-brass underline">
                    QR
                  </button>
                  <button onClick={() => copy(c.code, c.code)} className="min-h-11 px-2 text-sm text-noir-brass underline">
                    Copy
                  </button>
                  <button onClick={() => revoke(c)} className="min-h-11 px-2 text-sm text-noir-ink-faint underline">
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">Redeemed ({used.length})</h2>
            {used.length === 0 && <p className="text-sm text-noir-ink-faint">None yet.</p>}
            <ul className="flex flex-col gap-2">
              {used.map((c) => (
                <li key={c.id} className="rounded-lg border border-noir-line bg-noir-bg-2/60 px-3 py-2">
                  <span className="block font-mono tracking-wider text-noir-ink-dim line-through decoration-noir-ink-faint">{c.code}</span>
                  <span className="block text-xs text-noir-ink-faint">
                    {c.redeemedBy} · {new Date(c.redeemedAt!).toLocaleString()}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
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
        <p className="text-xs text-noir-ink-dim">They&apos;ll sign in with Google and the room is added to their account. Single use.</p>
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
