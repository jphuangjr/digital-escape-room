"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import type { AdminBoardEntry, AdminCodeDTO } from "@/lib/types";
import { ALL_GAMES, GAMES, formatDuration, gameTitle } from "@/lib/games";
import { ATLAS_GAME_ID } from "@/lib/atlas/types";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import type { PlaytestReport } from "@/server/playtest";
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
      <AdminTabs />
    </Shell>
  );
}

function AdminTabs() {
  const t = useT();
  const [tab, setTab] = useState<"codes" | "playtest" | "board">("codes");
  return (
    <>
      <div role="tablist" aria-label={t("admin.tabs.aria")} className="grid grid-cols-3 gap-2">
        {(["codes", "playtest", "board"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-11 rounded-lg border px-3 text-sm ${tab === k ? "border-noir-brass bg-noir-brass text-noir-bg" : "border-noir-line text-noir-ink-dim"}`}
          >
            {t(`admin.tabs.${k}`)}
          </button>
        ))}
      </div>
      {tab === "codes" ? <CodesPanel /> : tab === "playtest" ? <PlaytestPanel /> : <BoardPanel />}
    </>
  );
}

const PLAYTEST_GAMES = [ATLAS_GAME_ID, TRAIN_GAME_ID, "ada-voss"];
const PLAYTEST_DAYS = [7, 30, 90];

/** Where playtesters get stuck in a physical-room game: how far rooms got, where they gave up, hints and locks. */
function PlaytestPanel() {
  const t = useT();
  const [gameId, setGameId] = useState(PLAYTEST_GAMES[0]);
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<PlaytestReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setReport(null);
    setErr(null);
    void (async () => {
      const res = await fetch(`/api/admin/playtest?game=${encodeURIComponent(gameId)}&days=${days}`);
      const data = (await res.json().catch(() => ({}))) as PlaytestReport & { error?: string };
      if (!live) return;
      if (!res.ok) setErr(data.error ?? t("admin.msg.loadFailed"));
      else setReport(data);
    })();
    return () => {
      live = false;
    };
  }, [gameId, days, t]);

  const chip = (on: boolean) =>
    `min-h-11 shrink-0 rounded-lg border px-3 text-sm ${on ? "border-noir-brass bg-noir-brass text-noir-bg" : "border-noir-line text-noir-ink-dim"}`;
  const card = "flex flex-col gap-2 rounded-xl border border-noir-line bg-noir-bg-2 p-4";
  const h2 = "font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint";
  const empty = <p className="text-sm text-noir-ink-faint">{t("admin.play.none")}</p>;
  const min = (m: number | null) => (m === null ? "—" : t("admin.play.min", { n: m }));

  return (
    <div className="flex flex-col gap-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label={t("admin.games.aria")}>
        {PLAYTEST_GAMES.map((g) => (
          <button key={g} role="tab" aria-selected={g === gameId} onClick={() => setGameId(g)} className={chip(g === gameId)}>
            {GAMES.find((x) => x.id === g)?.title ?? g}
          </button>
        ))}
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={t("admin.play.window")}>
        {PLAYTEST_DAYS.map((d) => (
          <button key={d} role="radio" aria-checked={d === days} onClick={() => setDays(d)} className={chip(d === days)}>
            {t("admin.play.days", { n: d })}
          </button>
        ))}
      </div>
      {err && <p className="text-sm text-red-300">{err}</p>}
      {!report && !err && <p className="text-noir-ink-faint">{t("common.loading")}</p>}
      {report && (
        <>
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              [t("admin.play.started"), report.rooms.started],
              [t("admin.play.finished"), report.rooms.finished],
              [t("admin.play.medianTime"), min(report.rooms.medianMinutesToFinish)],
              [t("admin.play.medianHints"), report.rooms.medianHintsPerFinish ?? "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-noir-line bg-noir-bg-2 p-3">
                <p className="text-11px uppercase tracking-wider text-noir-ink-faint">{label}</p>
                <p className="font-mono text-xl text-noir-ink">{value}</p>
              </div>
            ))}
          </section>

          <section className={card}>
            <h2 className={h2}>{t("admin.play.stalls")}</h2>
            <p className="text-xs text-noir-ink-faint">{t("admin.play.stallsHelp")}</p>
            {report.stalls.length === 0
              ? empty
              : report.stalls.map((s) => (
                  <p key={s.after} className="flex justify-between gap-3 text-sm">
                    <span className="font-mono text-noir-ink">{s.after}</span>
                    <span className="text-noir-ink-dim">{t("admin.play.rooms", { n: s.rooms })}</span>
                  </p>
                ))}
          </section>

          <section className={card}>
            <h2 className={h2}>{t("admin.play.funnel")}</h2>
            {report.milestones.length === 0
              ? empty
              : report.milestones.map((m) => (
                  <div key={m.flag} className="text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="min-w-0 truncate font-mono text-noir-ink">{m.flag}</span>
                      <span className="shrink-0 text-noir-ink-dim">
                        {Math.round(m.share * 100)}% · {min(m.medianMinutes)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-noir-bg-3">
                      <div className="h-1.5 rounded-full bg-noir-brass" style={{ width: `${Math.round(m.share * 100)}%` }} />
                    </div>
                  </div>
                ))}
          </section>

          <section className={card}>
            <h2 className={h2}>{t("admin.play.hints")}</h2>
            {report.hints.length === 0
              ? empty
              : report.hints.map((h) => (
                  <p key={h.puzzleId} className="flex flex-wrap justify-between gap-x-3 text-sm">
                    <span className="font-mono text-noir-ink">{h.puzzleId}</span>
                    <span className="text-noir-ink-dim">
                      {t("admin.play.hintRow", { n: h.requests, rooms: h.rooms, t1: h.byTier[1], t2: h.byTier[2], t3: h.byTier[3] })}
                    </span>
                  </p>
                ))}
          </section>

          <section className={card}>
            <h2 className={h2}>{t("admin.play.locks")}</h2>
            {report.locks.length === 0
              ? empty
              : report.locks.map((l) => (
                  <p key={l.puzzleId} className="flex flex-wrap justify-between gap-x-3 text-sm">
                    <span className="font-mono text-noir-ink">{l.puzzleId}</span>
                    <span className="text-noir-ink-dim">
                      {t("admin.play.lockRow", { solved: l.roomsSolved, tried: l.roomsAttempted, per: l.attemptsPerSolve ?? "—" })} · {min(l.medianMinutesToSolve)}
                    </span>
                  </p>
                ))}
          </section>

          <section className={card}>
            <h2 className={h2}>{t("admin.play.endings")}</h2>
            {Object.keys(report.endings).length === 0
              ? empty
              : Object.entries(report.endings).map(([k, n]) => (
                  <p key={k} className="flex justify-between gap-3 text-sm">
                    <span className="font-mono text-noir-ink">{k}</span>
                    <span className="text-noir-ink-dim">{n}</span>
                  </p>
                ))}
          </section>
        </>
      )}
    </div>
  );
}

/** Recent leaderboard entries with a hide/unhide switch, for test runs that went on the public board. */
function BoardPanel() {
  const t = useT();
  const intl = useIntl();
  const [entries, setEntries] = useState<AdminBoardEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      const res = await fetch("/api/admin/leaderboard");
      const data = (await res.json().catch(() => ({}))) as { entries?: AdminBoardEntry[]; error?: string };
      if (!live) return;
      if (!res.ok) setErr(data.error ?? t("admin.msg.loadFailed"));
      setEntries(data.entries ?? []);
    })();
    return () => {
      live = false;
    };
  }, [t]);

  async function toggle(e: AdminBoardEntry) {
    setBusy(e.id);
    setErr(null);
    const res = await fetch("/api/admin/leaderboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id, hidden: !e.hidden }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(null);
    if (!res.ok) return setErr(data.error ?? t("admin.board.failed"));
    setEntries((cur) => (cur ?? []).map((x) => (x.id === e.id ? { ...x, hidden: !e.hidden } : x)));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-noir-ink-dim">{t("admin.board.help")}</p>
      {err && <p className="text-sm text-red-300">{err}</p>}
      {!entries && <p className="text-noir-ink-faint">{t("common.loading")}</p>}
      {entries?.length === 0 && <p className="text-sm text-noir-ink-faint">{t("admin.play.none")}</p>}
      <ul className="flex flex-col gap-2">
        {entries?.map((e) => (
          <li key={e.id} className={`flex items-center gap-3 rounded-xl border border-noir-line bg-noir-bg-2 p-3 ${e.hidden ? "opacity-60" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-noir-ink">
                {e.players.map((p, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <span style={{ color: p.color }}>●</span> {p.name}
                  </span>
                ))}
              </p>
              <p className="text-xs text-noir-ink-faint">
                {gameTitle(e.gameId)} · {formatDuration(e.durationMs)} · {intl.formatDate(e.finishedAt, { dateStyle: "medium", timeStyle: "short" })}
                {e.hidden && <> · {t("admin.board.hidden")}</>}
              </p>
            </div>
            <button
              type="button"
              disabled={busy === e.id}
              onClick={() => void toggle(e)}
              className="min-h-11 shrink-0 rounded-lg border border-noir-line px-3 text-sm text-noir-ink-dim disabled:opacity-50"
            >
              {e.hidden ? t("admin.board.show") : t("admin.board.hide")}
            </button>
          </li>
        ))}
      </ul>
    </div>
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
      gameId === ALL_GAMES && c.useCount > 0
        ? t("admin.confirm.turnOffTester", { code: c.code, count: c.useCount })
        : c.useCount > 0
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

  // A fully claimed tester key still grants access, so it stays here where it can be turned off.
  const isOn = (c: AdminCodeDTO) => c.status === "active" || (gameId === ALL_GAMES && c.status === "used");
  const active = (codes ?? []).filter(isOn);
  const done = (codes ?? []).filter((c) => !isOn(c));
  const activeSingles = active.filter((c) => c.status === "active" && c.maxUses === 1);
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
        <button
          role="tab"
          aria-selected={gameId === ALL_GAMES}
          onClick={() => {
            setGameId(ALL_GAMES);
            setFresh(new Set());
            setMsg(null);
          }}
          className={`shrink-0 ${chip(gameId === ALL_GAMES)}`}
        >
          {t("admin.games.tester")}
        </button>
      </div>

      <form onSubmit={generate} className="flex flex-col gap-4 rounded-xl border border-noir-line bg-noir-bg-2 p-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-noir-ink-faint">{t("admin.form.heading")}</h2>
        {gameId === ALL_GAMES && <p className="text-sm text-noir-ink-dim">{t("admin.form.testerHelp")}</p>}

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
  // A tester key with no claims left still grants access to whoever claimed it.
  const testerOn = c.gameId === ALL_GAMES && c.status === "used";
  const meta = [
    usesLabel(c, t),
    testerOn ? t("admin.code.status.testerOn") : statusLabel(c.status, t),
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
          <span className={`block font-mono tracking-wider ${live || testerOn ? "text-noir-ink" : "text-noir-ink-dim line-through decoration-noir-ink-faint"}`}>
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
          </>
        )}
        {onTurnOff && (
          <button onClick={onTurnOff} className="min-h-11 px-2 text-sm text-noir-ink-faint underline">
            {t("admin.code.turnOff")}
          </button>
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
