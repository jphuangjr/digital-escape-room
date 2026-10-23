"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/client";
import { gameText, getGame } from "@/lib/games";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { ATLAS_GAME_ID } from "@/lib/atlas/types";
import { CompassMark } from "@/components/shell/icons";
import { Compass } from "@/components/site/Compass";

/** Which tip set a game uses (wait.<key>.tip<n>). */
function tipKey(gameId: string): "ada" | "train" | "atlas" {
  return gameId === TRAIN_GAME_ID ? "train" : gameId === ATLAS_GAME_ID ? "atlas" : "ada";
}
const TIP_COUNT = 5;

/**
 * One spoiler-free tip at a time for the game, turning over every few seconds (a fade, held still with reduced
 * motion). Shown while the room loads and while a player waits for the team.
 */
export function GameTips({ gameId, className = "" }: { gameId: string; className?: string }) {
  const t = useT();
  const key = tipKey(gameId);
  const [i, setI] = useState(0);
  useEffect(() => {
    // Start somewhere different each visit; the first render stays at 0 so it matches the server's.
    setI(Math.floor(Math.random() * TIP_COUNT));
    const id = setInterval(() => setI((n) => (n + 1) % TIP_COUNT), 6500);
    return () => clearInterval(id);
  }, []);
  return (
    <p className={`text-sm leading-relaxed ${className}`} aria-live="off">
      <span key={i} className="ld-tip inline-block">
        {t(`wait.${key}.tip${i + 1}`)}
      </span>
    </p>
  );
}

/**
 * The room page's loading screen, themed per game: Ada's laptop boots, the Nightingale's departure board
 * announces boarding, the Atlas's compass turns. Nothing here holds the game back: it shows only until the
 * room's state arrives, and the tip fades in only if loading takes a while.
 */
export function RoomLoader({ gameId }: { gameId: string }) {
  const t = useT();
  const train = gameId === TRAIN_GAME_ID;
  const atlas = gameId === ATLAS_GAME_ID;
  return (
    <div role="status" className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      {train ? <Departures /> : atlas ? <TurningCompass /> : <Boot />}
      <p className="mt-5 font-mono text-sm tracking-wide text-stone-400">
        {t(train ? "train.room.boarding" : atlas ? "atlas.loading" : "site.room.booting")}
      </p>
      <div className="ld-late mt-8 max-w-xs">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-stone-600">{t("wait.tips.label")}</p>
        <GameTips gameId={gameId} className="mt-1.5 font-serif italic text-stone-500" />
      </div>
    </div>
  );
}

function Boot() {
  const t = useT();
  return (
    <div aria-hidden className="flex w-64 flex-col items-center">
      <CompassMark className="ld-boot-mark h-14 w-14 text-amber-500" />
      <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-stone-800">
        <div className="ld-boot-bar h-full rounded-full bg-amber-500/80" />
      </div>
      <ul className="mt-4 w-full space-y-1 text-left font-mono text-[11px] text-stone-500">
        {(["boot1", "boot2", "boot3"] as const).map((k, i) => (
          <li key={k} className="ld-boot-line truncate" style={{ animationDelay: `${0.15 + i * 0.35}s` }}>
            <span className="text-amber-500/70">&gt;</span> {t(`wait.ada.${k}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Departures() {
  const t = useT();
  const game = getGame(TRAIN_GAME_ID);
  return (
    <div aria-hidden className="flex flex-col items-center">
      {/* a brass whistle letting off steam */}
      <svg viewBox="16 -8 48 70" className="h-24 w-16 overflow-visible">
        <g fill="#e9e4d8">
          <circle className="ld-steam" cx="40" cy="22" r="7" opacity="0.5" />
          <circle className="ld-steam" cx="34" cy="20" r="5" opacity="0.4" style={{ animationDelay: "-0.6s" }} />
          <circle className="ld-steam" cx="46" cy="19" r="6" opacity="0.4" style={{ animationDelay: "-1.2s" }} />
        </g>
        <path d="M33 34 h14 l-2 22 h-10 z" fill="#c9a227" />
        <path d="M31 32 h18 v4 h-18 z" fill="#ecd27a" />
        <path d="M37 40 h6" stroke="#5b3a22" strokeWidth="2" />
        <path d="M29 58 h22" stroke="#7a5f12" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="mt-3 w-72 max-w-full rounded-md border border-noir-brass/40 bg-black/80 px-3 py-2.5 font-mono text-left shadow-[0_0_30px_-10px_rgba(201,162,39,0.4)]">
        <div className="flex items-center justify-between border-b border-noir-brass/20 pb-1.5 text-[10px] uppercase tracking-[0.3em] text-noir-brass">
          <span>{t("wait.train.departures")}</span>
          <span className="tracking-normal">23:55</span>
        </div>
        <div className="mt-2 flex items-baseline gap-3 text-sm">
          <span className="text-amber-200">23:55</span>
          <span className="min-w-0 flex-1 truncate text-stone-200">{game ? gameText(t, game, "title") : ""}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-wider">
          <span className="text-stone-500">{t("wait.train.platform", { n: 3 })}</span>
          <span className="ld-blink text-amber-300">{t("wait.train.status")}</span>
        </div>
      </div>
    </div>
  );
}

function TurningCompass() {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className="h-24 w-24 text-amber-500/85">
      <g className="ld-turn">
        <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d="M60 0 l3 9 h-6 z" fill="currentColor" opacity="0.7" transform={`rotate(${i * 90} 60 60)`} />
        ))}
      </g>
      <svg x="10" y="10" width="100" height="100" viewBox="0 0 100 100">
        <Compass needle="search" />
      </svg>
    </svg>
  );
}
