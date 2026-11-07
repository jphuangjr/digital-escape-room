"use client";

import { useCallback, useEffect, useState } from "react";
import type { TakenColor } from "@/lib/avatarColors";

/**
 * Avatar colors the other players in room `code` already have, refreshed every few seconds while a join form is
 * open (someone may join meanwhile). `code` null: nothing to check yet. `set` takes a list the server sent back.
 */
export function useTakenColors(code: string | null): { taken: TakenColor[]; set: (t: TakenColor[]) => void } {
  const [taken, setTaken] = useState<TakenColor[]>([]);
  const load = useCallback(async () => {
    if (!code) return setTaken([]);
    const res = await fetch(`/api/rooms/${encodeURIComponent(code)}/colors`).catch(() => null);
    if (!res?.ok) return setTaken([]);
    const data = (await res.json().catch(() => null)) as { taken?: TakenColor[] } | null;
    setTaken(data?.taken ?? []);
  }, [code]);
  useEffect(() => {
    void load();
    if (!code) return;
    const id = window.setInterval(() => void load(), 5000);
    return () => clearInterval(id);
  }, [code, load]);
  return { taken, set: setTaken };
}
