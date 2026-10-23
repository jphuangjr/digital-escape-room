import type { Translate } from "@/lib/games";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { ATLAS_GAME_ID } from "@/lib/atlas/types";
import { Defs } from "@/components/atlas/art/common";
import { Desk, Telescope } from "@/components/atlas/art/observatory";
import { DoorWall, WindowWall } from "@/components/train/art/compartment";
import { APP_META, APP_ORDER, CompassMark } from "@/components/shell/icons";

/**
 * A short looping "trailer" for a game's landing page (and a quieter strip on its lobby card), drawn from the
 * game's own art: only the opening room, in its untouched state, so nothing is given away. Decorative only
 * (aria-hidden, no pointer events); with reduced motion it holds still on the first shot (.tr-* in globals.css).
 * No hooks, so the lobby renders it on the server.
 */
export function GameTrailer({ gameId, t, variant = "hero", className = "" }: { gameId: string; t: Translate; variant?: "hero" | "card"; className?: string }) {
  const card = variant === "card";
  return (
    <div aria-hidden className={`tr-frame pointer-events-none relative select-none overflow-hidden ${card ? "tr-card" : ""} ${className}`}>
      {gameId === TRAIN_GAME_ID ? (
        <Shots
          a={<WindowWall flags={[]} />}
          b={card ? null : <DoorWall flags={[]} />}
          viewA="0 22 300 188"
          viewB="0 120 300 188"
        />
      ) : gameId === ATLAS_GAME_ID ? (
        <Shots a={<Telescope />} b={card ? null : <Desk s={{ flags: [], takes: new Set(), tanks: null }} />} viewA="0 40 300 188" viewB="0 140 300 188" />
      ) : (
        <Laptop t={t} view={card ? "0 84 480 172" : "0 0 480 300"} />
      )}
      {/* sink the edges into the page */}
      <div className="absolute inset-0 shadow-[inset_0_0_40px_12px_rgba(10,9,8,0.85)]" />
      <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent ${card ? "from-noir-bg-2" : "from-noir-bg/80"}`} />
    </div>
  );
}

/** One or two walls, each drifting slowly; the second crossfades in halfway through the loop. */
function Shots({ a, b, viewA, viewB }: { a: React.ReactNode; b: React.ReactNode; viewA: string; viewB: string }) {
  return (
    <>
      <svg viewBox={viewA} preserveAspectRatio="xMidYMid slice" className="tr-shot tr-shot-a absolute inset-0 h-full w-full">
        <Defs />
        {a}
      </svg>
      {b && (
        <svg viewBox={viewB} preserveAspectRatio="xMidYMid slice" className="tr-shot tr-shot-b absolute inset-0 h-full w-full">
          {b}
        </svg>
      )}
    </>
  );
}

/**
 * Ada's laptop, idling: the home screen with its app tiles, and a pointer that opens Email, then Notes. The
 * windows hold blank lines, not text, so there's nothing to read ahead.
 */
function Laptop({ t, view }: { t: Translate; view: string }) {
  const tileX = (i: number) => 90 + i * 64;
  const win = (app: "email" | "notes", x: number, y: number, cls: string, origin: number) => (
    <g className={`tr-win ${cls}`} style={{ transformOrigin: `${tileX(origin) + 22}px 212px` }}>
      <rect x={x} y={y} width="236" height="138" rx="8" fill="#0c0a09" stroke="#292524" />
      <path d={`M${x} ${y + 8} a8 8 0 0 1 8 -8 h220 a8 8 0 0 1 8 8 v12 h-236 Z`} fill="#1c1917" />
      <circle cx={x + 12} cy={y + 10} r="3.5" fill="#57534e" />
      <text x={x + 24} y={y + 13.5} fontSize="9" letterSpacing="1.6" className="fill-stone-400 font-mono uppercase">
        {t(`shell.app.${app}`)}
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={x + 14}
          y={y + 34 + i * 18}
          width={[180, 150, 196, 120, 164][i]}
          height="6"
          rx="3"
          fill={i === 0 ? "#f59e0b" : "#44403c"}
          opacity={i === 0 ? 0.55 : 0.7}
        />
      ))}
    </g>
  );
  return (
    <svg viewBox={view} preserveAspectRatio="xMidYMid slice" className="tr-shot absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="tr-ada-glow" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#f59e0b" stopOpacity="0.1" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="300" fill="#0b0a08" />
      <rect width="480" height="300" fill="url(#tr-ada-glow)" />
      {/* status bar */}
      <rect width="480" height="24" fill="#000" opacity="0.7" />
      <path d="M0 24 H480" stroke="#292524" />
      <CompassMark x="10" y="4" width="16" height="16" className="text-amber-500" />
      <text x="34" y="16" fontSize="9" letterSpacing="1.6" className="fill-stone-400 font-mono uppercase">
        {t("shell.home.title")}
      </text>
      <text x="468" y="16" fontSize="9" textAnchor="end" className="fill-stone-500 font-mono">
        23:47
      </text>
      {/* home screen */}
      <CompassMark x="200" y="58" width="80" height="80" className="tr-breathe text-amber-500/25" />
      {APP_ORDER.map((app, i) => {
        const { Icon } = APP_META[app];
        const x = tileX(i);
        return (
          <g key={app} className={app === "email" ? "tr-tile-a" : app === "notes" ? "tr-tile-b" : undefined}>
            <rect x={x} y="190" width="44" height="44" rx="12" fill="#1c1917" stroke="#f59e0b" strokeOpacity="0.3" />
            <Icon x={x + 10} y="200" width="24" height="24" className="text-amber-400" />
            <text x={x + 22} y="250" fontSize="9" textAnchor="middle" className="fill-stone-400">
              {t(`shell.app.${app}`)}
            </text>
          </g>
        );
      })}
      {win("email", 62, 36, "tr-win-a", 2)}
      {win("notes", 182, 62, "tr-win-b", 1)}
      {/* the pointer */}
      <path className="tr-cursor" d="M0 0 L0 15 L4 11 L7 18 L10 17 L7 10 L12 10 Z" fill="#f5f5f4" stroke="#0b0a08" strokeWidth="1" />
    </svg>
  );
}
