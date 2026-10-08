"use client";

import { useEffect, useRef } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type RoomEventHandler = (event: string, payload: unknown) => void;

/** Swappable realtime provider. `subscribe` returns an unsubscribe function. */
export interface RealtimeClient {
  subscribe(topic: string, onEvent: RoomEventHandler): () => void;
}

const POLL_MS = 4000;
/** Even with a push provider, resync occasionally (covers missed messages, vote deadlines). */
const SAFETY_POLL_MS = 30_000;

/** Fallback when no push provider is configured: emits a synthetic "poll" event on an interval. */
export function pollingRealtime(intervalMs = POLL_MS): RealtimeClient {
  return {
    subscribe(_topic, onEvent) {
      const id = setInterval(() => {
        if (typeof document === "undefined" || document.visibilityState !== "hidden") onEvent("poll", {});
      }, intervalMs);
      return () => clearInterval(id);
    },
  };
}

let supabase: SupabaseClient | null = null;

export function supabaseRealtime(url: string, anonKey: string): RealtimeClient {
  supabase ??= createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const sb = supabase;
  return {
    subscribe(topic, onEvent) {
      const channel = sb
        .channel(topic, { config: { broadcast: { self: false } } })
        .on("broadcast", { event: "*" }, (msg: { event: string; payload?: unknown }) => {
          onEvent(msg.event, msg.payload ?? {});
        })
        .subscribe((status) => {
          // On (re)connect, resync since we may have missed messages.
          if (status === "SUBSCRIBED") onEvent("poll", {});
        });
      const safety = pollingRealtime(SAFETY_POLL_MS).subscribe(topic, onEvent);
      return () => {
        safety();
        void sb.removeChannel(channel);
      };
    },
  };
}

let defaultClient: RealtimeClient | null = null;

export function getRealtimeClient(): RealtimeClient {
  if (defaultClient) return defaultClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  defaultClient = url && key ? supabaseRealtime(url, key) : pollingRealtime();
  return defaultClient;
}

/** Subscribe to `room:<CODE>` events. Event names per CONTRACTS.md, plus synthetic "poll". */
export function useRoomChannel(code: string | null | undefined, onEvent: RoomEventHandler): void {
  const handler = useRef(onEvent);
  useEffect(() => {
    handler.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!code) return;
    return getRealtimeClient().subscribe(`room:${code}`, (event, payload) => handler.current(event, payload));
  }, [code]);
}
