"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import type { AdminCodeDTO } from "@/lib/types";
import { GAMES } from "@/lib/games";
import { useMe } from "@/components/site/Account";
import { QrCode } from "@/components/site/QrCode";
import { useT } from "@/i18n/client";

export function AdminClient() {
  const me = useMe();
  const t = useT();

  if (!me) return <Shell><p className="text-noir-ink-faint">{t("common.loading")}</p></Shell>;
  if (!me.isAdmin) {
    return (
      <Shell>
        <p className="text-noir-ink-dim">{t("admin.page.notAdmin")}</p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-noir-brass underline">
          {t("admin.page.backHome")}
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
  const t = useT();
  return (
    <main className="min-h-dvh pt-safe pb-safe px-safe">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-10 pt-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint">Escape Escape</p>
            <h1 className="font-serif text-3xl text-noir-ink">{t("admin.page.heading")}</h1>
          </div>
          <Link href="/" className="min-h-11 content-center text-sm text-noir-ink-faint underline">
            {t("admin.page.site")}
          </Link>
        </header>
        {children}
      </div>
    </main>
  );
}

type Kind = "single" | "group";

const EXPIRY_OPTIONS: (number | null)[] = [null, 1, 7, 30];

type T = ReturnType<typeof useT>;

function usesLabel(c: AdminCodeDTO, t: T): string {
  if (c.maxUses === 1) return t("admin.code.singleUse");
  return t("admin.code.groupUses", { used: c.useCount, max: c.maxUses ?? "∞" });
}

function statusLabel(status: AdminCodeDTO["status"], t: T): string {
  return status === "active" ? "" : t(`admin.code.status.${status}`);
}

function CodesPanel() {
  const t = useT();
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
    if (!res.ok) setMsg(data.error ?? t("admin.msg.loadFailed"));
    setCodes(data.codes ?? []);
  }, [gameId, t]);

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
    if (!res.ok || !data.codes) return setMsg(data.error ?? t("admin.msg.generateFailed"));
    setFresh(new Set(data.codes.map((c) => c.id)));
    setCodes((cur) => [...data.codes!, ...(cur ?? [])]);
    if (kind === "group") {
      setMsg(t("admin.msg.groupCreated"));
      setQrFor(data.codes[0]);
    } else {
      setMsg(t("admin.msg.generated", { count: data.codes.length }));
    }
  }

  async function turnOff(c: AdminCodeDTO) {
    const warning =
      c.useCount > 0
        ? t("admin.confirm.turnOffClaimed", { code: c.code, count: c.useCount })
        : t("admin.confirm.turnOff", { code: c.code });
    if (!confirm(warning)) return;
    const res = await fetch(`/api/admin/codes/${c.id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return setMsg(data.error ?? t("admin.msg.turnOffFailed"));
    setCodes((cur) => (cur ?? []).map((x) => (x.id === c.id ? { ...x, status: "revoked", revokedAt: new Date().toISOString() } : x)));
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(t("admin.msg.copied", { label }));
    } catch {
      setMsg(t("admin.msg.copyFailed"));
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
      <div role="tablist" aria-label={t("admin.games.aria")} className="-mx-4 flex gap-2 overflow-x-auto px-4">
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
            {g.status === "soon" ? ` ${t("admin.games.soon")}` : ""}
          </button>
        ))}
      </div>

      <form onSubmit={generate} className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2 p-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">{t("admin.form.heading")}</h2>

        <div role="radiogroup" aria-label={t("admin.form.kindAria")} className="grid grid-cols-2 gap-2">
          <button type="button" role="radio" aria-checked={kind === "single"} onClick={() => setKind("single")} className={chip(kind === "single")}>
            {t("admin.form.single")}
          </button>
          <button type="button" role="radio" aria-checked={kind === "group"} onClick={() => setKind("group")} className={chip(kind === "group")}>
            {t("admin.form.group")}
          </button>
        </div>
        <p className="text-xs text-noir-ink-faint">
          {kind === "single"
            ? t("admin.form.singleHelp")
            : t("admin.form.groupHelp")}
        </p>

        <div className="flex flex-wrap gap-3">
          {kind === "single" ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-noir-ink-faint">{t("admin.form.count")}</span>
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
              <span className="text-xs text-noir-ink-faint">{t("admin.form.usesAllowed")}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={10000}
                  value={maxUses ?? ""}
                  disabled={maxUses === null}
                  aria-label={t("admin.form.usesAllowed")}
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
                  {t("admin.form.unlimited")}
                </label>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-noir-ink-faint">{t("admin.form.expires")}</span>
            <div className="flex flex-wrap gap-1">
              {EXPIRY_OPTIONS.map((days) => (
                <button key={days ?? "never"} type="button" onClick={() => setExpiresInDays(days)} className={chip(expiresInDays === days)} aria-pressed={expiresInDays === days}>
                  {days === null ? t("admin.form.expiryNever") : t("admin.form.expiryDays", { days })}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-noir-ink-faint">{t("admin.form.note")}</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder={kind === "group" ? t("admin.form.notePlaceholderGroup") : t("admin.form.notePlaceholderSingle")}
            className="min-h-12 rounded-lg border border-noir-line bg-noir-bg-3 px-3 text-noir-ink placeholder:text-noir-ink-faint"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-lg bg-noir-brass font-semibold text-noir-bg active:bg-noir-brass-hi disabled:opacity-60"
        >
          {busy ? t("admin.form.creating") : kind === "group" ? t("admin.form.createGroup") : t("admin.form.generate", { count })}
        </button>
        {msg && (
          <p role="status" className="text-sm text-noir-ink-dim">
            {msg}
          </p>
        )}
      </form>

      {codes === null ? (
        <p className="text-noir-ink-faint">{t("admin.list.loading")}</p>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">{t("admin.list.active", { count: active.length })}</h2>
              {activeSingles.length > 1 && (
                <button
                  onClick={() => copy(activeSingles.map((c) => c.code).join("\n"), t("admin.list.allSinglesLabel", { count: activeSingles.length }))}
                  className="min-h-11 text-sm text-noir-brass underline"
                >
                  {t("admin.list.copyAllSingles")}
                </button>
              )}
            </div>
            {active.length === 0 && <p className="text-sm text-noir-ink-faint">{t("admin.list.noActive")}</p>}
            <ul className="flex flex-col gap-2">
              {active.map((c) => (
                <CodeRow key={c.id} c={c} highlight={fresh.has(c.id)} onQr={() => setQrFor(c)} onCopy={copy} onTurnOff={() => turnOff(c)} />
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">{t("admin.list.done", { count: done.length })}</h2>
            {done.length === 0 && <p className="text-sm text-noir-ink-faint">{t("admin.list.none")}</p>}
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
  const t = useT();
  const intl = useIntl();
  const live = c.status === "active";
  const meta = [
    usesLabel(c, t),
    statusLabel(c.status, t),
    c.expiresAt
      ? t(new Date(c.expiresAt).getTime() > Date.now() ? "admin.code.expiresOn" : "admin.code.expiredOn", {
          date: intl.formatDate(c.expiresAt),
        })
      : "",
    c.note ?? "",
  ].filter(Boolean);
  return (
    <li
      className={`rounded-lg border px-3 py-2 ${
        highlight ? "border-noir-brass/70 bg-noir-brass/10" : live ? "border-noir-line bg-noir-bg-2" : "border-noir-line bg-noir-bg-2/60"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onQr} className="min-w-0 flex-1 text-left" aria-label={t("admin.code.showQrAria", { code: c.code })}>
          <span className={`block font-mono tracking-wider ${live ? "text-noir-ink" : "text-noir-ink-dim line-through decoration-noir-ink-faint"}`}>
            {c.code}
          </span>
          <span className="block text-xs text-noir-ink-faint">{meta.join(" · ")}</span>
        </button>
        {live && (
          <>
            <button onClick={onQr} className="min-h-11 px-2 text-sm text-noir-brass underline">
              {t("admin.code.qr")}
            </button>
            <button onClick={() => onCopy(c.code, c.code)} className="min-h-11 px-2 text-sm text-noir-brass underline">
              {t("common.copy")}
            </button>
            {onTurnOff && (
              <button onClick={onTurnOff} className="min-h-11 px-2 text-sm text-noir-ink-faint underline">
                {t("admin.code.turnOff")}
              </button>
            )}
          </>
        )}
      </div>
      {c.redemptions.length > 0 && (
        <details className="mt-1 text-xs text-noir-ink-faint">
          <summary className="min-h-8 cursor-pointer content-center">
            {t("admin.code.claimedBy", { count: c.useCount })}
          </summary>
          <ul className="mt-1 flex flex-col gap-0.5 pl-3">
            {c.redemptions.map((r) => (
              <li key={r.email + r.at}>
                {r.email} · {intl.formatDate(r.at, { dateStyle: "medium", timeStyle: "short" })}
              </li>
            ))}
            {c.useCount > c.redemptions.length && <li>{t("admin.code.more", { count: c.useCount - c.redemptions.length })}</li>}
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
  const t = useT();
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
          {t("admin.qr.title", { game: game?.title ?? code.gameId })}
        </h2>
        <QrCode url={url} size={240} label={t("admin.qr.label", { code: code.code })} />
        <p className="font-mono tracking-wider text-noir-brass">{code.code}</p>
        {code.note && <p className="text-xs text-noir-ink-faint">{code.note}</p>}
        <p className="text-xs text-noir-ink-dim">
          {t("admin.qr.help")}{" "}
          {code.maxUses === 1 ? t("admin.qr.singleUse") : t("admin.qr.groupUses", { used: code.useCount, max: code.maxUses ?? "∞" })}
        </p>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => onCopy(url, t("admin.qr.linkLabel"))}
            className="min-h-12 flex-1 rounded-lg border border-noir-line font-semibold text-noir-brass"
          >
            {t("admin.qr.copyLink")}
          </button>
          <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-lg bg-noir-brass font-semibold text-noir-bg" autoFocus>
            {t("admin.qr.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
