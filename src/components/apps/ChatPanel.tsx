"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GameCtx } from "@/lib/client/game";
import type { Chat } from "@/lib/client/chat";
import { ColorDot, relativeTime, useNow } from "./shared";

const MAX = 500;

/** Room chat: messages oldest → newest, composer pinned at the bottom. Marks messages read while visible. */
export function ChatPanel({ ctx, chat }: { ctx: GameCtx; chat: Chat }) {
  const now = useNow(30_000);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const me = ctx.state.me.id;
  const { messages, markRead } = chat;

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
          <p className="py-6 text-center text-sm text-stone-500">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-500">No messages yet. Say hi to your crew.</p>
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
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-amber-500 text-black" : "bg-stone-800 text-stone-100"
                  }`}
                  title={new Date(m.createdAt).toLocaleString()}
                >
                  {m.body}
                </div>
                <span className="mt-0.5 text-[10px] text-stone-600">{relativeTime(m.createdAt, now)}</span>
              </div>
            );
          })
        )}
      </div>

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
            placeholder="Message the room…"
            aria-label="Chat message"
            enterKeyHint="send"
            className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-stone-700 bg-black px-3 py-2.5 text-base text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="min-h-11 shrink-0 rounded-xl bg-amber-500 px-4 font-semibold text-black active:bg-amber-400 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        {draft.length > MAX - 60 && <p className="mt-1 text-right text-[10px] text-stone-500">{MAX - draft.length} left</p>}
      </form>
    </div>
  );
}
