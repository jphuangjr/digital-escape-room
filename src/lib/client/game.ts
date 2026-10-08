"use client";

import { createContext, useContext } from "react";
import type { AppId, RoomState } from "@/lib/types";

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export interface GameCtx {
  code: string;
  state: RoomState;
  refresh: () => Promise<void>;
  /** path relative to /api/rooms/<code>, e.g. "/notes"; prefix "!" for absolute, e.g. "!/api/resolve" */
  api: <T = unknown>(path: string, init?: { method?: string; body?: unknown }) => Promise<ApiResult<T>>;
  openApp: (app: AppId) => void;
  /** switches to browser and navigates */
  openAddress: (address: string) => void;
  /** presence, e.g. "app:notes" or "browser:thedrift.blog" */
  setView: (view: string) => void;
  toast: (msg: string, tone?: "info" | "success" | "error") => void;
}

export const GameContext = createContext<GameCtx | null>(null);

export function useGame(): GameCtx {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameContext.Provider>");
  return ctx;
}

/** Shared fetch helper used to build ctx.api. */
export async function apiFetch<T = unknown>(
  code: string,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<ApiResult<T>> {
  const url = path.startsWith("!") ? path.slice(1) : `/api/rooms/${encodeURIComponent(code)}${path}`;
  const method = init?.method ?? (init?.body !== undefined ? "POST" : "GET");
  try {
    const res = await fetch(url, {
      method,
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
    let data: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return { ok: res.ok, status: res.status, data: data as T };
  } catch {
    return { ok: false, status: 0, data: null as T };
  }
}

/** Normalize an in-game address: lowercase, strip scheme, www., trailing slash. */
export function normalizeAddress(input: string): string {
  let a = input.trim().toLowerCase();
  a = a.replace(/^[a-z]+:\/\//, "");
  a = a.replace(/^www\./, "");
  a = a.replace(/\/+$/, "");
  return a;
}
