"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import type { MeResponse, RoomState } from "@/lib/types";
import { apiFetch } from "@/lib/client/game";
import { useRoomChannel } from "@/lib/realtime/client";
import { GameShell } from "@/components/shell/GameShell";
import { CompassMark } from "@/components/shell/icons";

type Phase =
  | { kind: "loading" }
  | { kind: "join" }
  | { kind: "notfound" }
  | { kind: "error"; message: string }
  | { kind: "ready"; state: RoomState };

export const AVATAR_COLORS = [
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#eab308",
];

export function RoomClient({ code }: { code: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  const load = useCallback(async () => {
    const res = await apiFetch<RoomState>(code, "/state");
    if (res.ok && res.data) {
      setPhase({ kind: "ready", state: res.data });
    } else if (res.status === 401) {
      setPhase((p) => (p.kind === "ready" ? p : { kind: "join" }));
    } else if (res.status === 404) {
      setPhase({ kind: "notfound" });
    } else {
      setPhase((p) =>
        p.kind === "ready" ? p : { kind: "error", message: res.status ? `Server error (${res.status})` : "Network error" },
      );
    }
  }, [code]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-[100dvh] bg-[#0b0a08] text-stone-200">
      {phase.kind === "loading" && <Splash text="Booting Ada's laptop…" />}
      {phase.kind === "notfound" && <NotFound />}
      {phase.kind === "error" && (
        <Splash text={phase.message}>
          <button
            onClick={() => {
              setPhase({ kind: "loading" });
              void load();
            }}
            className="mt-6 min-h-11 rounded-md border border-amber-500/60 px-5 text-amber-300 active:bg-amber-500/10"
          >
            Retry
          </button>
        </Splash>
      )}
      {phase.kind === "join" && <JoinForm code={code} onJoined={load} onNotFound={() => setPhase({ kind: "notfound" })} />}
      {phase.kind === "ready" && <LiveRoom code={code} state={phase.state} load={load} />}
    </div>
  );
}

function LiveRoom({ code, state, load }: { code: string; state: RoomState; load: () => Promise<void> }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEvent = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void load();
    }, 250);
  }, [load]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useRoomChannel(code, onEvent);
  return <GameShell code={code} state={state} refresh={load} />;
}

function Splash({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <CompassMark className="h-16 w-16 animate-pulse text-amber-500/80" />
      <p className="mt-4 font-mono text-sm tracking-wide text-stone-400">{text}</p>
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <CompassMark className="h-16 w-16 text-stone-600" />
      <h1 className="mt-6 font-serif text-2xl text-stone-100">Room not found or expired</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-400">
        The trail has gone cold. Rooms close after 48 hours without activity.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-md bg-amber-500 px-6 font-semibold text-black active:bg-amber-400"
      >
        All escape rooms
      </Link>
    </div>
  );
}

function JoinForm({
  code,
  onJoined,
  onNotFound,
}: {
  code: string;
  onJoined: () => Promise<void>;
  onNotFound: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
      .then((data) => {
        if (!data) return;
        setMe(data);
        if (data.user?.name) setName((n) => n || data.user!.name!.slice(0, 24));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const n = localStorage.getItem("ada_name");
      const c = localStorage.getItem("ada_color");
      if (n) setName(n);
      if (c && AVATAR_COLORS.includes(c)) setColor(c);
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const displayName = name.trim();
    if (!displayName) {
      setError("Pick a name so the others know who you are.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await apiFetch<{ code?: string; error?: string }>(code, "/join", {
      method: "POST",
      body: { displayName, color },
    });
    if (res.status === 404) {
      onNotFound();
      return;
    }
    if (!res.ok) {
      setBusy(false);
      setError(res.data?.error ?? "Couldn't join the room. Try again.");
      return;
    }
    try {
      localStorage.setItem("ada_name", displayName);
      localStorage.setItem("ada_color", color);
    } catch {}
    await onJoined();
  }

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-4"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-stone-800 bg-stone-950/80 p-6 shadow-2xl shadow-black"
      >
        <div className="flex items-center gap-3">
          <CompassMark className="h-10 w-10 text-amber-500" />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500/80">Case file</p>
            <h1 className="font-serif text-xl text-stone-100">The Vanishing of Dr. Ada Voss</h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-stone-400">
          You&apos;ve been invited to investigate in room{" "}
          <span className="font-mono font-semibold text-amber-300">{code}</span>.
        </p>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-stone-400" htmlFor="join-name">
          Your name
        </label>
        <input
          id="join-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          autoComplete="nickname"
          enterKeyHint="go"
          className="mt-2 h-12 w-full rounded-md border border-stone-700 bg-black px-3 text-base text-stone-100 outline-none focus:border-amber-500"
          placeholder="e.g. Marlowe"
        />

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-wider text-stone-400">Avatar color</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                aria-label={`Color ${c}`}
                className={`h-11 w-11 rounded-full border-2 transition ${
                  color === c ? "scale-105 border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </fieldset>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 h-12 w-full rounded-md bg-amber-500 font-semibold text-black active:bg-amber-400 disabled:opacity-60"
        >
          {busy ? "Joining…" : "Join the investigation"}
        </button>

        {me?.googleEnabled && !me.user && (
          <div className="mt-5 border-t border-stone-800 pt-4 text-center">
            <p className="text-xs text-stone-500">Optional: keep your progress and times, and rejoin from any device.</p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: `/r/${code}` })}
              className="mt-2 min-h-11 px-3 text-sm font-semibold text-amber-300 underline"
            >
              Sign in with Google
            </button>
          </div>
        )}
        {me?.user && (
          <p className="mt-4 text-center text-xs text-stone-500">
            Signed in as {me.user.name || me.user.email}. You&apos;ll join as yourself.
          </p>
        )}
      </form>
    </div>
  );
}
