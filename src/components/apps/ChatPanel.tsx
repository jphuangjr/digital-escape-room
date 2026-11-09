"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import type { Chat } from "@/lib/client/chat";
import type { ChatMessageDTO } from "@/lib/types";
import { ColorDot, relativeTime, useNow } from "./shared";

const MAX = 500;

/**
 * Room chat: messages oldest → newest, composer pinned at the bottom. Marks messages read while visible.
 * `readOnly`: a note shown in place of the composer (say, for a player who's out of a party game).
 */
export function ChatPanel({ ctx, chat, readOnly }: { ctx: GameCtx; chat: Chat; readOnly?: string }) {
  const now = useNow(30_000);
  const intl = useIntl();
  const t = useT();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The message whose report/block menu is open, messages this player reported (hidden for them), and a notice.
  const [acting, setActing] = useState<ChatMessageDTO | null>(null);
  const [reported, setReported] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const me = ctx.state.me.id;
  const messages = chat.messages.filter((m) => !reported.includes(m.id));
  const { markRead } = chat;

  // Stick to the bottom as messages arrive, and count them as read while this panel is on screen.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);
  useEffect(() => {
    markRead();
  }, [messages.length, markRead]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const res = await chat.send(body);
    setSending(false);
    if (res.ok) setDraft("");
    else setError(res.error);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2">
        {!chat.loaded ? (
          <p className="py-6 text-center text-sm text-stone-500">{t("common.loading")}</p>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-500">{t("room.chat.empty")}</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.playerId === me;
            const showName = !mine && messages[i - 1]?.playerId !== m.playerId;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                {showName && (
                  <span className="mb-0.5 flex items-center gap-1.5 text-xs text-stone-400">
                    <ColorDot color={m.playerColor} size={8} />
                    {m.playerName}
                  </span>
                )}
                <div className={`flex max-w-[85%] items-start gap-1 ${mine ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`min-w-0 whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-amber-500 text-black" : "bg-stone-800 text-stone-100"
                    }`}
                    title={intl.formatDate(m.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                  >
                    {m.body}
                  </div>
                  {!mine && (
                    <button
                      type="button"
                      onClick={() => setActing(m)}
                      aria-label={t("room.chat.actions", { name: m.playerName })}
                      className="flex h-9 w-7 shrink-0 items-center justify-center rounded-md text-stone-500 active:bg-stone-800"
                    >
                      ⋯
                    </button>
                  )}
                </div>
                <span className="mt-0.5 text-10px text-stone-600">{relativeTime(m.createdAt, now, intl)}</span>
              </div>
            );
          })
        )}
      </div>

      {notice && (
        <p role="status" className="mb-2 rounded-lg bg-stone-800 px-3 py-2 text-xs text-stone-300">
          {notice}
        </p>
      )}
      {acting && (
        <MessageActions
          ctx={ctx}
          message={acting}
          onClose={() => setActing(null)}
          onDone={(kind) => {
            if (kind === "reported") setReported((r) => [...r, acting.id]);
            setNotice(kind === "reported" ? t("room.chat.reportedNotice") : t("room.chat.blockedNotice", { name: acting.playerName }));
            setActing(null);
          }}
        />
      )}
      {readOnly ? (
        <p className="shrink-0 border-t border-stone-800 pt-2 text-center text-xs text-stone-500">{readOnly}</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="shrink-0 border-t border-stone-800 pt-2"
        >
          {error && (
            <p role="alert" className="mb-1 text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder={t("room.chat.placeholder")}
              aria-label={t("room.chat.inputAria")}
              enterKeyHint="send"
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-stone-700 bg-black px-3 py-2.5 text-base text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="min-h-11 shrink-0 rounded-xl bg-amber-500 px-4 font-semibold text-black active:bg-amber-400 disabled:opacity-40"
            >
              {t("room.chat.send")}
            </button>
          </div>
          {draft.length > MAX - 60 && <p className="mt-1 text-right text-10px text-stone-500">{t("room.chat.left", { count: MAX - draft.length })}</p>}
        </form>
      )}
    </div>
  );
}

const REASONS = ["abuse", "spam", "other"] as const;

/**
 * Report a message (it's hidden for you and kept for review) or block its author (you stop seeing their chat; if
 * you're both signed in, in future rooms too). Either way the room state refreshes so the block list is current.
 */
function MessageActions({
  ctx,
  message,
  onClose,
  onDone,
}: {
  ctx: GameCtx;
  message: ChatMessageDTO;
  onClose: () => void;
  onDone: (kind: "reported" | "blocked") => void;
}) {
  const t = useT();
  const [step, setStep] = useState<"menu" | "report">("menu");
  const [reason, setReason] = useState<(typeof REASONS)[number]>("abuse");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(kind: "reported" | "blocked") {
    setBusy(true);
    setErr(null);
    const res =
      kind === "reported"
        ? await ctx.api<{ ok?: boolean; error?: string }>("/chat/report", { body: { messageId: message.id, reason, block: alsoBlock } })
        : await ctx.api<{ ok?: boolean; error?: string }>("/block", { body: { playerId: message.playerId, block: true } });
    setBusy(false);
    if (!res.ok) return setErr(res.data?.error ?? t("room.chat.actionFailed"));
    void ctx.refresh();
    onDone(kind);
  }

  const btn = "flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm active:bg-stone-800 disabled:opacity-50";
  return (
    <div role="dialog" aria-label={t("room.chat.actions", { name: message.playerName })} className="mb-2 rounded-xl border border-stone-700 bg-stone-900 p-2">
      <p className="line-clamp-2 px-3 pb-2 pt-1 text-xs text-stone-500">
        {message.playerName}: “{message.body}”
      </p>
      {step === "menu" ? (
        <>
          <button type="button" className={`${btn} text-stone-100`} onClick={() => setStep("report")}>
            {t("room.chat.report")}
          </button>
          <button type="button" className={`${btn} text-red-300`} disabled={busy} onClick={() => void run("blocked")}>
            {t("room.chat.block", { name: message.playerName })}
          </button>
        </>
      ) : (
        <fieldset className="flex flex-col gap-1 px-1">
          <legend className="px-2 pb-1 text-sm text-stone-200">{t("room.chat.reportWhy")}</legend>
          {REASONS.map((r) => (
            <label key={r} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-stone-200">
              <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-amber-500" />
              {t(`room.chat.reason.${r}`)}
            </label>
          ))}
          <label className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-stone-300">
            <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} className="h-4 w-4 accent-amber-500" />
            {t("room.chat.alsoBlock", { name: message.playerName })}
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("reported")}
            className="mt-1 min-h-11 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black active:bg-amber-400 disabled:opacity-50"
          >
            {t("room.chat.sendReport")}
          </button>
        </fieldset>
      )}
      {err && (
        <p role="alert" className="px-3 pt-1 text-xs text-red-400">
          {err}
        </p>
      )}
      <button type="button" className={`${btn} justify-center text-stone-400`} onClick={onClose}>
        {t("common.cancel")}
      </button>
    </div>
  );
}
