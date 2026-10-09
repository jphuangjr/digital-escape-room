"use client";

import { useEffect, useState } from "react";
import type { AppId } from "@/lib/types";
import type { GameCtx } from "@/lib/client/game";
import { APP_META, CompassMark, HomeIcon, PeopleIcon } from "./icons";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function StatusBar({
  ctx,
  active,
  onRoom,
  onHome,
}: {
  ctx: GameCtx;
  active: AppId | null;
  onRoom: () => void;
  onHome: () => void;
}) {
  const now = useClock();
  const online = ctx.state.players.filter((p) => p.online);
  const status = ctx.state.status;
  return (
    <header
      className="relative z-10 shrink-0 border-b border-stone-800/80 bg-black/70 backdrop-blur"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div className="flex h-11 items-center gap-2 px-2 md:px-4">
        <button
          onClick={onHome}
          aria-label="Home screen"
          className="flex h-11 min-w-11 items-center gap-2 rounded-md px-1.5 text-amber-500 active:bg-stone-900"
        >
          <CompassMark className="h-6 w-6" />
          <span className="hidden font-serif text-sm text-stone-300 md:inline">Ada&apos;s Laptop</span>
          <HomeIcon className="h-4 w-4 text-stone-500 md:hidden" />
        </button>
        <span className="min-w-0 flex-1 truncate font-mono text-xs uppercase tracking-[0.18em] text-stone-400">
          <span className="md:hidden">{active ? APP_META[active].label : "Home"}</span>
          <span className="hidden md:inline">
            {status === "voting" ? "Vote in progress" : status === "finished" ? "Case closed" : "Investigation open"}
          </span>
        </span>
        <span className="hidden font-mono text-xs text-stone-500 sm:inline">
          {ctx.code}
        </span>
        <button
          onClick={onRoom}
          aria-label={`Room details, ${online.length} online`}
          className="flex h-11 items-center gap-1.5 rounded-md px-2 active:bg-stone-900"
        >
          <span className="flex -space-x-1.5">
            {online.slice(0, 4).map((p) => (
              <span
                key={p.id}
                className="h-5 w-5 rounded-full border-2 border-black"
                style={{ backgroundColor: p.color }}
                title={p.displayName}
              />
            ))}
          </span>
          <PeopleIcon className="hidden h-5 w-5 text-stone-400 md:block" />
          <span className="text-xs text-stone-400">{online.length}</span>
        </button>
        {now && (
          <time className="hidden font-mono text-xs text-stone-500 md:inline">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </time>
        )}
      </div>
    </header>
  );
}
