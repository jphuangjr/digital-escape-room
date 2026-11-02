"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import type { ChatMessageDTO } from "@/lib/types";
import { apiFetch } from "./game";

/** Window events the room page dispatches so chat updates without refetching the whole room state. */
export const CHAT_MESSAGE_EVENT = "escape:chat-message"; // detail: ChatMessageDTO (from realtime)
export const CHAT_POLL_EVENT = "escape:chat-poll"; // fallback/safety poll tick

const readKey = (code: string) => `chat_read_${code}`;

function merge(cur: ChatMessageDTO[], incoming: ChatMessageDTO[]): ChatMessageDTO[] {
  if (incoming.length === 0) return cur;
  const seen = new Set(cur.map((m) => m.id));
  const added = incoming.filter((m) => !seen.has(m.id));
  if (added.length === 0) return cur;
  return [...cur, ...added].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-200);
}

export interface Chat {
  messages: ChatMessageDTO[];
  loaded: boolean;
  unread: number;
  send: (body: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  markRead: () => void;
}

/**
 * Room chat: history on load, live appends from realtime, catch-up on poll ticks, unread tracking. Messages from
 * `blocked` players (RoomState.me.blocked) are left out everywhere: the list, unread counts and toasts.
 */
export function useChat(code: string, meId: string, blocked: string[] = []): Chat {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [readAt, setReadAt] = useState<string>("");
  const latest = useRef<string | null>(null);
  latest.current = messages.length ? messages[messages.length - 1].createdAt : null;

  useEffect(() => {
    try {
      setReadAt(localStorage.getItem(readKey(code)) ?? "");
    } catch {}
  }, [code]);

  const fetchMessages = useCallback(
    async (after: string | null) => {
      const res = await apiFetch<{ messages: ChatMessageDTO[] }>(
        code,
        after ? `/chat?after=${encodeURIComponent(after)}` : "/chat",
      );
      if (res.ok && res.data) setMessages((cur) => merge(cur, res.data.messages));
      setLoaded(true);
    },
    [code],
  );

  useEffect(() => {
    void fetchMessages(null);
    const onMessage = (e: Event) => setMessages((cur) => merge(cur, [(e as CustomEvent<ChatMessageDTO>).detail]));
    const onPoll = () => void fetchMessages(latest.current);
    window.addEventListener(CHAT_MESSAGE_EVENT, onMessage);
    window.addEventListener(CHAT_POLL_EVENT, onPoll);
    return () => {
      window.removeEventListener(CHAT_MESSAGE_EVENT, onMessage);
      window.removeEventListener(CHAT_POLL_EVENT, onPoll);
    };
  }, [fetchMessages]);

  const send = useCallback<Chat["send"]>(
    async (body) => {
      const res = await apiFetch<ChatMessageDTO & { error?: string }>(code, "/chat", { method: "POST", body: { body } });
      if (!res.ok || !res.data?.id) return { ok: false, error: res.data?.error ?? t("room.chat.sendFailed") };
      setMessages((cur) => merge(cur, [res.data]));
      return { ok: true };
    },
    [code, t],
  );

  const markRead = useCallback(() => {
    const last = latest.current;
    if (!last) return;
    setReadAt((r) => {
      if (r >= last) return r;
      try {
        localStorage.setItem(readKey(code), last);
      } catch {}
      return last;
    });
  }, [code]);

  // Unblocking someone: fetch the history again, since the server left their messages out.
  const blockedKey = blocked.join(",");
  const firstBlocked = useRef(true);
  useEffect(() => {
    if (firstBlocked.current) {
      firstBlocked.current = false;
      return;
    }
    void fetchMessages(null);
  }, [blockedKey, fetchMessages]);
  const visible = useMemo(
    () => (blockedKey ? messages.filter((m) => !blockedKey.split(",").includes(m.playerId)) : messages),
    [messages, blockedKey],
  );

  const unread = visible.filter((m) => m.playerId !== meId && m.createdAt > readAt).length;
  return { messages: visible, loaded, unread, send, markRead };
}
