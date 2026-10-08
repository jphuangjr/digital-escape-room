import "server-only";

export type RoomEvent =
  | "presence.updated"
  | "note.public.created"
  | "note.public.updated"
  | "note.public.deleted"
  | "progress.updated"
  | "attempt.logged"
  | "hint.unlocked"
  | "vote.updated"
  | "ending.resolved";

/** Server-side publisher interface so the provider can be swapped. */
export interface RealtimePublisher {
  publish(topic: string, event: string, payload: unknown): Promise<void>;
}

function supabasePublisher(): RealtimePublisher | null {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return {
    async publish(topic, event, payload) {
      const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ messages: [{ topic, event, payload }] }),
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) console.warn(`[realtime] broadcast ${event} failed: ${res.status}`);
    },
  };
}

let publisher: RealtimePublisher | null | undefined;

/** Broadcast a hint event to everyone in the room. No-op without env; never throws. */
export async function publish(code: string, event: RoomEvent, payload: unknown = {}): Promise<void> {
  try {
    if (publisher === undefined) publisher = supabasePublisher();
    if (!publisher) return;
    await publisher.publish(`room:${code}`, event, payload);
  } catch (err) {
    console.warn("[realtime] publish error", err instanceof Error ? err.message : err);
  }
}
