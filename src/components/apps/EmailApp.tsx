"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import type { EmailDTO } from "@/lib/types";
import { readJSON, writeJSON } from "./shared";

const readKey = (code: string) => `read_${code}`;
/** Fired on window whenever the local read set changes (so a dock badge can recompute unreadCount). */
export const EMAILS_READ_EVENT = "escape:emails-read";

function saveRead(code: string, ids: Set<string>) {
  writeJSON(readKey(code), [...ids]);
  try {
    window.dispatchEvent(new Event(EMAILS_READ_EVENT));
  } catch {
    /* ignore */
  }
}

function getReadIds(code: string): string[] {
  const v = readJSON<unknown>(readKey(code), []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Number of emails/voicemails in this room the local viewer hasn't opened yet. */
export function unreadCount(code: string, emails: EmailDTO[]): number {
  if (typeof window === "undefined") return 0;
  const read = new Set(getReadIds(code));
  return emails.filter((e) => !read.has(e.id)).length;
}

// In-game addresses, e.g. meridian-inst.net, thedrift.blog, intranet.meridian-inst.net/login.
// Not preceded by "@" or a word char (so e-mail addresses are not linkified).
const ADDRESS_RE =
  /(?<![@\w.-])(?:https?:\/\/)?(?:www\.)?((?:[a-z0-9-]+\.)+(?:net|blog|com|org|io|info))(\/[\w\-/.]*[\w/])?(?![\w@])/gi;

export function linkifyAddresses(text: string, onOpen: (address: string) => void): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(ADDRESS_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const address = (m[1] + (m[2] ?? "")).toLowerCase();
    out.push(
      <button
        key={`${idx}-${address}`}
        type="button"
        onClick={() => onOpen(address)}
        className="inline rounded px-0.5 py-1 font-medium text-amber-300 underline decoration-amber-500/60 underline-offset-4 active:bg-amber-500/10"
      >
        {m[0]}
      </button>,
    );
    last = idx + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function VoicemailIcon() {
  const t = useT();
  return (
    <span
      aria-label={t("apps.email.voicemail")}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-300"
    >
      ▶
    </span>
  );
}

function MailIcon() {
  const t = useT();
  return (
    <span aria-label={t("apps.email.email")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
      ✉
    </span>
  );
}

export function EmailApp({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const { code, state } = ctx;
  const emails = state.emails;
  const [openId, setOpenId] = useState<string | null>(null);
  const [read, setRead] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setRead(new Set(getReadIds(code)));
  }, [code]);

  // Newest (last delivered) first.
  const ordered = useMemo(() => [...emails].reverse(), [emails]);
  const open = emails.find((e) => e.id === openId) ?? null;

  function openEmail(e: EmailDTO) {
    setOpenId(e.id);
    if (!read.has(e.id)) {
      const next = new Set(read);
      next.add(e.id);
      setRead(next);
      saveRead(code, next);
    }
  }

  function markAllRead() {
    const next = new Set(emails.map((e) => e.id));
    setRead(next);
    saveRead(code, next);
  }

  if (open) {
    const paragraphs = open.body.split(/\n{2,}/);
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 p-2">
          <button
            onClick={() => setOpenId(null)}
            className="min-h-11 min-w-11 rounded-lg px-3 text-sm font-semibold text-amber-300 active:bg-zinc-900"
          >
            {t("apps.email.backToInbox")}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="mb-4 flex items-start gap-3">
            {open.kind === "voicemail" ? <VoicemailIcon /> : <MailIcon />}
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold leading-snug">{open.subject}</h2>
              <p className="break-words text-sm text-zinc-400">{open.from}</p>
              <p className="text-xs text-zinc-500">{open.date}</p>
            </div>
          </div>
          {open.kind === "voicemail" && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              {t("apps.email.voicemailTranscript")}
            </div>
          )}
          <div
            className={`space-y-4 break-words text-[15px] leading-relaxed text-zinc-200 ${
              open.kind === "voicemail" ? "border-l-2 border-amber-500/40 pl-3 italic" : ""
            }`}
          >
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {linkifyAddresses(p, ctx.openAddress).map((n, j) => (
                  <Fragment key={j}>{n}</Fragment>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unread = emails.filter((e) => !read.has(e.id)).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          {t("apps.email.inbox")}{" "}
          {unread > 0 && <span className="text-amber-300">{t("apps.email.newCount", { count: unread })}</span>}
        </h2>
        {unread > 0 && (
          <button onClick={markAllRead} className="min-h-11 rounded-lg px-3 text-xs font-semibold text-zinc-400 active:bg-zinc-900">
            {t("apps.email.markAllRead")}
          </button>
        )}
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-zinc-900 overflow-y-auto overscroll-contain">
        {ordered.length === 0 && <li className="p-10 text-center text-sm text-zinc-500">{t("apps.email.empty")}</li>}
        {ordered.map((e) => {
          const isUnread = !read.has(e.id);
          const preview = e.body.replace(/\s+/g, " ").slice(0, 90);
          return (
            <li key={e.id}>
              <button
                onClick={() => openEmail(e)}
                className="flex min-h-16 w-full items-start gap-3 px-3 py-3 text-left active:bg-zinc-900"
              >
                {e.kind === "voicemail" ? <VoicemailIcon /> : <MailIcon />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`truncate text-sm ${isUnread ? "font-bold text-zinc-50" : "text-zinc-300"}`}>{e.from}</span>
                    <span className="shrink-0 text-[11px] text-zinc-500">{e.date}</span>
                  </div>
                  <div className={`truncate text-sm ${isUnread ? "font-semibold text-amber-200" : "text-zinc-400"}`}>
                    {e.kind === "voicemail" && (
                      <span className="mr-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                        {t("apps.email.transcript")}
                      </span>
                    )}
                    {e.subject}
                  </div>
                  <div className="truncate text-xs text-zinc-500">{preview}</div>
                </div>
                {isUnread && <span aria-label={t("apps.email.unread")} className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
