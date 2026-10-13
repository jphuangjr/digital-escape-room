"use client";

import type { HotspotId, WallId } from "@/lib/atlas/types";

/**
 * The Atlas of Silent Worlds, one illustrated wall at a time (viewBox 300×400, portrait). Each wall draws itself
 * from the room's shared state, and the shell lays invisible buttons over the hotspots listed in ./walls (same
 * coordinates). Every place has its own palette; the Cartographers' brass runs through all of them.
 */

export interface WallState {
  flags: string[];
  /** Hotspots that still have something lying there to pick up. */
  takes: Set<HotspotId>;
  /** Water in the Pelagic tanks, when known. */
  tanks: number[] | null;
}

const BRASS = "#c9a227";
const BRASS_HI = "#f0d98a";
const BRASS_DK = "#7a5f12";

/** Shared gradients, patterns and filters. Each wall draws once, so the ids are unique on the page. */
function Defs() {
  return (
    <defs>
      <linearGradient id="at-brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={BRASS_HI} />
        <stop offset="0.55" stopColor={BRASS} />
        <stop offset="1" stopColor={BRASS_DK} />
      </linearGradient>
      <linearGradient id="at-iron" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5d646a" />
        <stop offset="1" stopColor="#25292c" />
      </linearGradient>
      <linearGradient id="at-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6b4527" />
        <stop offset="1" stopColor="#3b2414" />
      </linearGradient>
      <linearGradient id="at-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f8f8a" stopOpacity="0.85" />
        <stop offset="1" stopColor="#123b3a" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="at-night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#05080d" />
        <stop offset="1" stopColor="#16222e" />
      </linearGradient>
      <linearGradient id="at-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f2e8cf" />
        <stop offset="1" stopColor="#d3c39c" />
      </linearGradient>
      <radialGradient id="at-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
        <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="at-teal-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#9ff3e4" stopOpacity="0.8" />
        <stop offset="1" stopColor="#9ff3e4" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="at-vignette" cx="0.5" cy="0.4" r="0.85">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.6" />
      </radialGradient>
      {/* dressed stone: staggered blocks */}
      <pattern id="at-stone" width="60" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 0 H60 M0 20 H60 M0 40 H60 M20 0 V20 M50 20 V40" stroke="#000" strokeWidth="1" opacity="0.25" fill="none" />
        <path d="M0 1 H60 M0 21 H60" stroke="#fff" strokeWidth="0.6" opacity="0.06" fill="none" />
      </pattern>
      <pattern id="at-planks" width="40" height="400" patternUnits="userSpaceOnUse">
        <path d="M0 0 V400 M40 0 V400" stroke="#000" strokeWidth="1" opacity="0.35" />
        <path d="M14 0 C18 90 10 180 16 260 S12 360 15 400" stroke="#2a180c" strokeWidth="0.7" fill="none" opacity="0.3" />
      </pattern>
      <pattern id="at-sand" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 14 Q10 8 20 14 T40 14" stroke="#8a6a3a" strokeWidth="0.8" fill="none" opacity="0.35" />
      </pattern>
      <pattern id="at-rain" width="24" height="40" patternUnits="userSpaceOnUse">
        <path d="M4 0 L1 10 M14 16 L11 26 M20 30 L17 40" stroke="#9fb6c4" strokeWidth="0.9" opacity="0.45" />
      </pattern>
      <pattern id="at-glass" width="50" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 0 H50 V60 M0 0 V60" stroke="#2b3b2b" strokeWidth="2.5" fill="none" />
      </pattern>
    </defs>
  );
}

/** A room's backdrop: wall, floor and a light falling from above. */
function Backdrop({ wall, floor, light = "#ffd98a", pattern = "at-stone", floorY = 330 }: { wall: [string, string]; floor: string; light?: string; pattern?: string; floorY?: number }) {
  const id = `bg-${wall[0].slice(1)}-${floorY}`;
  return (
    <>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={wall[0]} />
        <stop offset="1" stopColor={wall[1]} />
      </linearGradient>
      <rect width="300" height="400" fill={`url(#${id})`} />
      <rect width="300" height={floorY} fill={`url(#${pattern})`} />
      <rect y={floorY} width="300" height={400 - floorY} fill={floor} />
      <path d={`M0 ${floorY} H300`} stroke="#000" strokeOpacity="0.5" strokeWidth="2" />
      <ellipse cx="150" cy="20" rx="190" ry="160" fill={light} opacity="0.07" />
    </>
  );
}

function Vignette() {
  return <rect width="300" height="400" fill="url(#at-vignette)" pointerEvents="none" />;
}

/** A small sparkle where something can be picked up. */
function Glint({ x, y }: { x: number; y: number }) {
  return (
    <g className="motion-safe:animate-pulse">
      <circle cx={x} cy={y} r="9" fill="url(#at-glow)" />
      <path d={`M${x - 6} ${y} H${x + 6} M${x} ${y - 6} V${y + 6}`} stroke="#fff6d0" strokeWidth="1.4" />
    </g>
  );
}

const GLYPH: Record<string, string> = { sun: "☉", moon: "☾", star: "✶", eye: "◈", peak: "△", wave: "≈", knot: "⌘" };
const RING_ORDER = ["sun", "moon", "star", "eye", "peak", "wave", "knot"];

/** Glyphs set round a ring. */
function GlyphRing({ cx, cy, r, size = 11, fill = BRASS_HI, opacity = 1 }: { cx: number; cy: number; r: number; size?: number; fill?: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {RING_ORDER.map((g, i) => {
        const a = ((i * 360) / 7 - 90) * (Math.PI / 180);
        return (
          <text key={g} x={cx + Math.cos(a) * r} y={cy + Math.sin(a) * r + size / 3} textAnchor="middle" fontSize={size} fill={fill}>
            {GLYPH[g]}
          </text>
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------- the Observatory

function Telescope() {
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" pattern="at-stone" />
      {/* the dome's slit and a starless sky */}
      <path d="M150 0 H262 L246 64 H166 Z" fill="url(#at-night)" />
      <path d="M150 0 L166 64 M262 0 L246 64" stroke="#0a0f14" strokeWidth="3" />
      {/* the arched window on the west wall: rain on a still sea */}
      <path d="M22 236 V120 Q60 70 98 120 V236 Z" fill="#0f1b24" stroke={BRASS_DK} strokeWidth="4" />
      <rect x="26" y="190" width="68" height="44" fill="#3c4e57" />
      <path d="M26 236 V122 Q60 76 94 122 V236 Z" fill="url(#at-rain)" />
      <path d="M60 80 V236 M24 170 H96" stroke={BRASS_DK} strokeWidth="3" />
      {/* the telescope on its mount, aimed at the slit */}
      <g transform="rotate(-50 190 230)">
        <rect x="110" y="214" width="170" height="30" rx="8" fill="url(#at-brass)" stroke={BRASS_DK} />
        <rect x="266" y="210" width="20" height="38" rx="4" fill={BRASS_DK} />
        <rect x="100" y="220" width="14" height="18" rx="3" fill={BRASS_DK} />
        <path d="M150 214 V244 M220 214 V244" stroke={BRASS_DK} strokeWidth="2" />
      </g>
      <path d="M190 232 L156 330 M190 232 L224 330 M190 232 V330" stroke="#3a2a12" strokeWidth="6" strokeLinecap="round" />
      <circle cx="190" cy="232" r="10" fill="url(#at-brass)" />
      <Vignette />
    </>
  );
}

function Desk({ s }: { s: WallState }) {
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" />
      {/* the star chart pinned to the wall */}
      <circle cx="215" cy="125" r="56" fill="url(#at-paper)" stroke="#8a7440" strokeWidth="3" />
      <circle cx="215" cy="125" r="44" fill="none" stroke="#8a7440" strokeOpacity="0.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 60) * Math.PI) / 180;
        return <circle key={i} cx={215 + Math.cos(a) * 38} cy={125 + Math.sin(a) * 38} r="2.2" fill="#3a2c14" />;
      })}
      <circle cx="215" cy="125" r="3.5" fill="#3a2c14" />
      {/* the desk */}
      <rect x="10" y="250" width="280" height="22" fill="url(#at-wood)" stroke="#2a180c" />
      <rect x="22" y="272" width="16" height="70" fill="#3b2414" />
      <rect x="262" y="272" width="16" height="70" fill="#3b2414" />
      {/* the open journal */}
      <path d="M40 242 Q85 228 85 246 Q85 228 130 242 V252 H40 Z" fill="url(#at-paper)" stroke="#8a7440" />
      <path d="M50 236 H78 M50 240 H76 M92 236 H120 M92 240 H116" stroke="#5a4a2a" strokeWidth="0.8" />
      <path d="M85 232 V250" stroke="#8a7440" />
      {/* an ink pot and a candle */}
      <rect x="150" y="236" width="14" height="14" rx="2" fill="#1b1b2a" />
      <rect x="240" y="216" width="8" height="34" fill="#efe6d2" />
      <path d="M244 210 q4 -6 0 -12 q-4 6 0 12" fill="#ffd27a" />
      <circle cx="244" cy="206" r="16" fill="url(#at-glow)" />
      {s.flags.length === 0 && <Glint x={85} y={236} />}
      <Vignette />
    </>
  );
}

function Clock({ s }: { s: WallState }) {
  const open = s.flags.includes("clock.set");
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" />
      {/* the case */}
      <rect x="95" y="70" width="110" height="200" rx="10" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      <rect x="100" y="76" width="100" height="100" rx="50" fill="#1b120b" />
      {open ? (
        <>
          {/* the face swung open on its hinge; a mark cut inside */}
          <text x="150" y="138" textAnchor="middle" fontSize="34" fill={BRASS_HI}>
            ✶
          </text>
          <ellipse cx="96" cy="126" rx="12" ry="48" fill="url(#at-paper)" stroke={BRASS_DK} strokeWidth="3" />
          {s.takes.has("clock") && <Glint x={150} y={160} />}
        </>
      ) : (
        <>
          <circle cx="150" cy="126" r="46" fill="url(#at-paper)" stroke="url(#at-brass)" strokeWidth="5" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            return <circle key={i} cx={150 + Math.cos(a) * 38} cy={126 + Math.sin(a) * 38} r="2" fill="#3a2c14" />;
          })}
          {/* hands hanging loose: nowhere near the hour that matters */}
          <path d="M150 126 L150 160 M150 126 L178 112" stroke="#1b120b" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* the pendulum, still */}
      <rect x="120" y="186" width="60" height="76" rx="6" fill="#1b120b" />
      <path d="M150 186 V240" stroke={BRASS} strokeWidth="2" />
      <circle cx="150" cy="246" r="10" fill="url(#at-brass)" />
      <Vignette />
    </>
  );
}

const SEAL_COLOR: Record<string, string> = { "seal-leaf": "#3f9a52", "seal-sun": "#e2b23a", "seal-tide": "#2f86a8" };
const SEAL_SOCKET: Record<string, string> = { "seal-leaf": "eye", "seal-sun": "wave", "seal-tide": "sun" };

function Stairs({ s }: { s: WallState }) {
  const open = s.flags.includes("stairs.open");
  const registered = s.flags.includes("cathedral.registered");
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" />
      {/* the plate of seven sockets */}
      <rect x="28" y="96" width="104" height="104" rx="10" fill="url(#at-iron)" stroke="#111" strokeWidth="2" />
      {RING_ORDER.map((g, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = i === 6 ? 80 : 48 + col * 32;
        const y = 120 + row * 30;
        const seal = Object.keys(SEAL_SOCKET).find((k) => SEAL_SOCKET[k] === g && s.flags.includes(`seated.${k}`));
        const lit = registered && g === "peak";
        return (
          <g key={g}>
            {lit && <circle cx={x} cy={y} r="18" fill="url(#at-glow)" />}
            <circle cx={x} cy={y} r="11" fill={seal ? SEAL_COLOR[seal] : "#15191c"} stroke={lit ? BRASS_HI : BRASS_DK} strokeWidth="2" />
            {!seal && (
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={lit ? BRASS_HI : "#a89060"}>
                {GLYPH[g]}
              </text>
            )}
          </g>
        );
      })}
      {/* the iron door over the stairs */}
      <rect x="160" y="130" width="110" height="200" fill="#0b0d0f" />
      {open ? (
        <>
          <path d="M170 330 L200 280 H250 L262 330 Z" fill="#141a1e" />
          <path d="M184 310 H254 M192 296 H252 M200 284 H250" stroke="#2b343a" strokeWidth="3" />
          <path d="M160 130 L176 140 V322 L160 330 Z" fill="url(#at-iron)" />
        </>
      ) : (
        <>
          <rect x="160" y="130" width="110" height="200" fill="url(#at-iron)" stroke="#111" strokeWidth="2" />
          <path d="M160 180 H270 M160 280 H270" stroke="#1a1d20" strokeWidth="4" />
          <rect x="208" y="226" width="14" height="4" rx="1" fill="#000" stroke={BRASS} />
        </>
      )}
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Waterworks

function Valves({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  const open = (v: string) => s.flags.includes(`valve.${v}`);
  const valves = [
    { id: "intake", x: 80 },
    { id: "reservoir", x: 150 },
    { id: "outflow", x: 220 },
  ];
  return (
    <>
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" />
      {/* the standing orders */}
      <rect x="92" y="42" width="116" height="82" rx="4" fill="#e9e1c8" stroke="#8a7440" strokeWidth="3" />
      {[58, 72, 86, 100, 112].map((y) => (
        <path key={y} d={`M104 ${y} H196`} stroke="#5a4a2a" strokeWidth="1.2" opacity="0.7" />
      ))}
      {/* the main pipe and three valves */}
      <rect x="20" y="210" width="260" height="26" fill="url(#at-iron)" />
      {valves.map((v) => (
        <g key={v.id}>
          <rect x={v.x - 6} y="180" width="12" height="32" fill="#2c3236" />
          <g transform={`rotate(${open(v.id) ? 45 : 0} ${v.x} 176)`}>
            <circle cx={v.x} cy="176" r="24" fill="none" stroke="#9a2b22" strokeWidth="6" />
            <path d={`M${v.x - 24} 176 H${v.x + 24} M${v.x} 152 V200`} stroke="#9a2b22" strokeWidth="4" />
          </g>
          <circle cx={v.x} cy="176" r="5" fill={BRASS} />
          <rect x={v.x - 22} y="244" width="44" height="14" rx="2" fill="url(#at-brass)" />
        </g>
      ))}
      {!drained && <path d="M24 236 q4 30 -4 70 M276 236 q-6 40 4 80" stroke="#7fc6bf" strokeWidth="3" fill="none" opacity="0.6" />}
      <Vignette />
    </>
  );
}

function Tunnel({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  return (
    <>
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" />
      {/* the arch */}
      <path d="M70 330 V160 Q150 70 230 160 V330 Z" fill="#06100f" stroke="#33423f" strokeWidth="10" />
      {drained ? (
        <>
          <path d="M120 330 L140 200 H160 L180 330 Z" fill="#0f1c1a" />
          <path d="M140 200 V150 H160 V200" fill="#ffd98a" opacity="0.25" />
          <rect x="132" y="318" width="36" height="8" fill="#1e2a28" stroke="#33423f" />
          {s.takes.has("tunnel") && <Glint x={110} y={312} />}
        </>
      ) : (
        <>
          <path d="M75 330 V170 Q150 85 225 170 V330 Z" fill="url(#at-water)" />
          <path d="M80 180 Q115 172 150 180 T220 180" stroke="#bff3ea" strokeWidth="1.5" fill="none" opacity="0.6" />
          <Glint x={112} y={300} />
        </>
      )}
      <Vignette />
    </>
  );
}

function WaterWheel({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  return (
    <>
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" />
      <rect x="40" y="300" width="220" height="40" fill={drained ? "#18221f" : "url(#at-water)"} />
      <g className={drained ? undefined : "motion-safe:animate-spin"} style={{ transformOrigin: "150px 200px", animationDuration: "3s" }}>
        <circle cx="150" cy="200" r="90" fill="none" stroke="url(#at-wood)" strokeWidth="12" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <g key={i}>
              <path d={`M150 200 L${150 + Math.cos(a) * 90} ${200 + Math.sin(a) * 90}`} stroke="#4a3220" strokeWidth="5" />
              <rect x={150 + Math.cos(a) * 92 - 8} y={200 + Math.sin(a) * 92 - 8} width="16" height="16" fill="#5b3a22" transform={`rotate(${i * 30} ${150 + Math.cos(a) * 92} ${200 + Math.sin(a) * 92})`} />
            </g>
          );
        })}
      </g>
      <circle cx="150" cy="200" r="24" fill="#2a1a10" stroke={BRASS_DK} strokeWidth="3" />
      {drained ? (
        <text x="150" y="210" textAnchor="middle" fontSize="26" fill={BRASS_HI}>
          ≈
        </text>
      ) : (
        <path d="M60 300 q30 -20 60 0 t60 0 t60 0" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.5" />
      )}
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Threshold Chamber

function Gate({ s }: { s: WallState }) {
  const powered = s.flags.includes("engine.on");
  return (
    <>
      <Backdrop wall={["#2a2438", "#120f1a"]} floor="#1a1622" light={powered ? "#9ff3e4" : "#ffd98a"} />
      {powered && <circle cx="150" cy="160" r="130" fill="url(#at-teal-glow)" opacity="0.5" />}
      <circle cx="150" cy="160" r="104" fill="#0b0912" stroke="#4a4458" strokeWidth="18" />
      <circle cx="150" cy="160" r="88" fill="none" stroke={powered ? "#9ff3e4" : BRASS_DK} strokeWidth="3" />
      <GlyphRing cx={150} cy={160} r={78} size={14} fill={powered ? "#d6fff6" : "#8a7440"} />
      <circle cx="150" cy="160" r="62" fill="none" stroke={powered ? "#9ff3e4" : BRASS_DK} strokeWidth="2" />
      <GlyphRing cx={150} cy={160} r={50} size={11} fill={powered ? "#d6fff6" : "#8a7440"} opacity={0.9} />
      <circle cx="150" cy="160" r="34" fill={powered ? "#0f2a2c" : "#06050a"} />
      {/* the lever */}
      <path d="M262 300 L250 230" stroke="url(#at-iron)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="250" cy="228" r="9" fill={powered ? "#9a2b22" : "#5a2420"} />
      {/* the ledger on its chain */}
      <path d="M150 268 V300" stroke="#555" strokeWidth="2" strokeDasharray="3 2" />
      <rect x="112" y="298" width="76" height="52" rx="3" fill="#6b2a1e" stroke="#2a110c" strokeWidth="2" />
      <rect x="118" y="304" width="64" height="40" fill="url(#at-paper)" opacity="0.9" />
      <path d="M150 304 V344" stroke="#8a7440" />
      <Vignette />
    </>
  );
}

function Engine({ s }: { s: WallState }) {
  const geared = s.flags.includes("engine.geared");
  const on = s.flags.includes("engine.on");
  return (
    <>
      <Backdrop wall={["#2a2438", "#120f1a"]} floor="#1a1622" light={on ? "#9ff3e4" : "#ffd98a"} />
      {/* the plaque */}
      <rect x="100" y="50" width="100" height="60" rx="4" fill="url(#at-brass)" stroke={BRASS_DK} strokeWidth="2" />
      {[68, 80, 92].map((y) => (
        <path key={y} d={`M114 ${y} H186`} stroke="#3a2c14" strokeWidth="2" />
      ))}
      {/* the engine block */}
      <rect x="50" y="140" width="200" height="170" rx="12" fill="url(#at-iron)" stroke="#111" strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={100 + i * 50} cy="190" r="20" fill="#14171a" stroke={on ? "#9ff3e4" : BRASS} strokeWidth="3" />
          <text x={100 + i * 50} y="196" textAnchor="middle" fontSize="16" fill={on ? "#d6fff6" : BRASS_HI}>
            {on ? ["✶", "≈", "◈"][i] : "·"}
          </text>
        </g>
      ))}
      {/* the gear spindle */}
      <circle cx="150" cy="262" r="30" fill="#14171a" />
      {geared ? (
        <g className={on ? "motion-safe:animate-spin" : undefined} style={{ transformOrigin: "150px 262px", animationDuration: "4s" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="146" y="230" width="8" height="12" fill="url(#at-brass)" transform={`rotate(${i * 36} 150 262)`} />
          ))}
          <circle cx="150" cy="262" r="22" fill="url(#at-brass)" />
          <circle cx="150" cy="262" r="6" fill="#14171a" />
        </g>
      ) : (
        <circle cx="150" cy="262" r="5" fill="#777" />
      )}
      {on && <circle cx="150" cy="225" r="120" fill="url(#at-teal-glow)" opacity="0.25" />}
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Verdant Archive

/** Glasshouse ironwork over a green-lit library. */
function Glasshouse() {
  return (
    <>
      <Backdrop wall={["#1f3a28", "#0d1a10"]} floor="#2b2416" light="#d8ffcf" pattern="at-glass" />
      <path d="M0 0 Q150 -40 300 0 V30 Q150 -10 0 30 Z" fill="#2b3b2b" />
      <path d="M0 30 Q150 -10 300 30" stroke="#3d553d" strokeWidth="4" fill="none" />
    </>
  );
}

function VerdantArrival({ s }: { s: WallState }) {
  return (
    <>
      <Glasshouse />
      {/* the gate home, overgrown */}
      <circle cx="150" cy="190" r="86" fill="#08120a" stroke="#4a4458" strokeWidth="14" />
      <GlyphRing cx={150} cy={190} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      <path d="M70 120 C90 150 60 200 84 250 M226 110 C214 160 240 210 216 262" stroke="#3f7a3a" strokeWidth="5" fill="none" />
      <circle cx="80" cy="140" r="7" fill="#4f9a48" />
      <circle cx="222" cy="128" r="8" fill="#4f9a48" />
      {/* shelves on either side, and moss */}
      <rect x="0" y="120" width="40" height="210" fill="url(#at-wood)" />
      <rect x="260" y="120" width="40" height="210" fill="url(#at-wood)" />
      <path d="M0 330 Q75 312 150 330 T300 330 V340 H0 Z" fill="#355a2c" />
      {s.takes.has("verdant-gate") && <Glint x={92} y={322} />}
      <Vignette />
    </>
  );
}

function VerdantBeds({ s }: { s: WallState }) {
  const bloomed = s.flags.includes("verdant.seed.bloomed");
  return (
    <>
      <Glasshouse />
      {/* the spiral creeper on its cane */}
      <rect x="82" y="230" width="34" height="24" fill="#6b4a2b" />
      <path d="M99 230 V70" stroke="#8a6a3a" strokeWidth="3" />
      <path d="M99 225 C80 210 118 195 99 180 C80 165 118 150 99 135 C80 120 118 105 99 90" stroke="#3f8a3a" strokeWidth="3" fill="none" />
      {[200, 172, 148, 128, 110, 96].map((y, i) => (
        <ellipse key={y} cx={i % 2 ? 112 : 86} cy={y} rx="9" ry="5" fill="#57a84e" transform={`rotate(${i % 2 ? 30 : -30} ${i % 2 ? 112 : 86} ${y})`} />
      ))}
      <rect x="70" y="150" width="20" height="26" fill="url(#at-paper)" transform="rotate(-8 80 163)" />
      {/* the doubling fern, far too big for its pot */}
      <rect x="196" y="230" width="44" height="22" fill="#8a5a3a" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M218 230 Q${170 + i * 12} ${160 - (i % 3) * 14} ${150 + i * 18} ${170 + (i % 2) * 10}`} stroke="#4f9a48" strokeWidth="3" fill="none" />
      ))}
      {/* the bed of grey sand and the dormant seed */}
      <rect x="100" y="290" width="100" height="40" rx="4" fill="#5a5a52" stroke="#3a3a32" strokeWidth="3" />
      {bloomed ? (
        <g>
          <circle cx="150" cy="292" r="22" fill="url(#at-glow)" />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx="150" cy="282" rx="5" ry="12" fill="#f3e9ff" transform={`rotate(${i * 60} 150 292)`} />
          ))}
          <circle cx="150" cy="292" r="4" fill="#f0d98a" />
          {s.takes.has("seed") && <Glint x={170} y={300} />}
        </g>
      ) : (
        <ellipse cx="150" cy="304" rx="6" ry="4" fill="#3a2a1a" />
      )}
      <Vignette />
    </>
  );
}

function VerdantShelves({ s }: { s: WallState }) {
  const open = s.flags.includes("verdant.index.open");
  return (
    <>
      <Glasshouse />
      {/* the painted sign over seven empty pots */}
      <rect x="80" y="44" width="140" height="70" rx="4" fill="#3b2414" stroke="#6b4527" strokeWidth="3" />
      {[62, 78, 94].map((y) => (
        <path key={y} d={`M96 ${y} H204`} stroke="#e9d9a6" strokeWidth="2" opacity="0.8" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${54 + i * 30} 122 h18 l-3 14 h-12 z`} fill="#8a5a3a" />
      ))}
      {/* the index cabinet, roots growing through the stacks behind it */}
      <path d="M20 140 C40 200 10 260 30 330 M280 150 C260 210 290 270 270 330" stroke="#5a4028" strokeWidth="6" fill="none" />
      <rect x="70" y="150" width="160" height="200" rx="4" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={82 + (i % 3) * 48} y={168 + Math.floor(i / 3) * 34} width="40" height="24" rx="2" fill={open && i % 4 === 1 ? "#1b120b" : "#5b3a22"} stroke="#2a180c" />
      ))}
      <rect x="86" y="310" width="128" height="26" rx="3" fill="#1b120b" />
      {RING_ORDER.map((g, i) => (
        <text key={g} x={96 + i * 18} y="328" textAnchor="middle" fontSize="11" fill={open ? "#9ff3e4" : BRASS_HI}>
          {GLYPH[g]}
        </text>
      ))}
      {s.takes.has("cabinet") && <Glint x={150} y={190} />}
      <Vignette />
    </>
  );
}

function VerdantRoots({ s }: { s: WallState }) {
  const open = s.flags.includes("verdant.door.open");
  return (
    <>
      <Glasshouse />
      {/* seven saplings on a ledge, roots plunging through the floor */}
      <rect x="30" y="120" width="240" height="12" fill="url(#at-wood)" />
      {RING_ORDER.map((g, i) => (
        <g key={g}>
          <path d={`M${50 + i * 33} 90 q-8 -20 0 -34 q8 14 0 34`} fill="#4f9a48" />
          <path d={`M${42 + i * 33} 100 h16 l-3 20 h-10 z`} fill="#8a5a3a" />
          <text x={50 + i * 33} y="114" textAnchor="middle" fontSize="9" fill={BRASS_HI}>
            {GLYPH[g]}
          </text>
          <path d={`M${50 + i * 33} 132 C${50 + i * 33 + ((i % 3) - 1) * 20} 180 ${150 + (i - 3) * 14} 210 ${150 + (i - 3) * 10} 250`} stroke="#5a4028" strokeWidth="3.5" fill="none" />
        </g>
      ))}
      {/* the little door the roots hold shut */}
      <rect x="110" y="254" width="80" height="96" rx="6" fill={open ? "#0b0703" : "url(#at-wood)"} stroke="#2a180c" strokeWidth="3" />
      {open ? (
        <path d="M110 254 L94 264 V340 L110 350 Z" fill="url(#at-wood)" />
      ) : (
        <path d="M100 270 C140 290 160 250 200 280 M98 320 C140 300 170 340 204 310" stroke="#5a4028" strokeWidth="9" fill="none" strokeLinecap="round" />
      )}
      {s.takes.has("root-door") && <Glint x={150} y={300} />}
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Sunken Meridian

/** A stopped desert sun over dunes and buried towers. */
function Desert({ floorY = 300 }: { floorY?: number }) {
  return (
    <>
      <linearGradient id="at-desert-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0b860" />
        <stop offset="1" stopColor="#f6dfa4" />
      </linearGradient>
      <rect width="300" height="400" fill="url(#at-desert-sky)" />
      <circle cx="232" cy="64" r="26" fill="#fff4cf" />
      <circle cx="232" cy="64" r="60" fill="url(#at-glow)" />
      <rect x="20" y="150" width="24" height="120" fill="#b88a50" />
      <path d="M20 150 l12 -18 l12 18 z" fill="#a07840" />
      <rect x="250" y="170" width="20" height="100" fill="#b88a50" />
      <path d={`M0 ${floorY - 20} Q80 ${floorY - 50} 160 ${floorY - 24} T300 ${floorY - 30} V400 H0 Z`} fill="#d9b070" />
      <rect y={floorY - 20} width="300" height={420 - floorY} fill="url(#at-sand)" />
    </>
  );
}

function MeridianArrival() {
  return (
    <>
      <Desert />
      {/* the gate home, half in the sand */}
      <path d="M64 290 A86 86 0 1 1 236 290" fill="#140f08" stroke="#6a5a3a" strokeWidth="14" />
      <GlyphRing cx={150} cy={260} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      <path d="M40 300 Q150 270 260 300 V330 H40 Z" fill="#d9b070" />
      <Vignette />
    </>
  );
}

function MeridianPlaza({ s }: { s: WallState }) {
  const lit = s.flags.includes("meridian.lit");
  const vaultLit = s.flags.includes("meridian.vault.lit");
  return (
    <>
      <Desert floorY={250} />
      {/* the plaza floor and its mirrors */}
      <path d="M30 230 L270 230 L290 330 L10 330 Z" fill="#c49a5a" stroke="#8a6a3a" />
      {[0, 1, 2, 3].map((r) => (
        <path key={r} d={`M${30 - r * 5} ${230 + r * 25} H${270 + r * 5}`} stroke="#8a6a3a" strokeWidth="0.8" opacity="0.6" />
      ))}
      {[
        [80, 248],
        [96, 300],
        [150, 300],
        [150, 270],
        [204, 270],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 3} y={y - 4} width="6" height="12" fill="#6a5a3a" />
          <rect x={x - 12} y={y - 22} width="24" height="20" rx="3" fill="#cfe3ea" stroke="#8a7440" strokeWidth="2" transform={`rotate(${i % 2 ? 20 : -20} ${x} ${y - 12})`} />
        </g>
      ))}
      {lit && <path d="M30 236 L80 236 L96 290 L150 290 L150 262 L204 262 L210 330" stroke="#fff1a8" strokeWidth="4" fill="none" opacity="0.9" />}
      {/* the sun door */}
      <rect x="170" y="236" width="90" height="0" />
      <rect x="182" y="250" width="76" height="110" rx="4" fill={lit ? "#ffd75e" : "#a8862e"} stroke="#6a5a3a" strokeWidth="3" />
      <circle cx="220" cy="292" r="18" fill="none" stroke={lit ? "#fff6d0" : "#7a5f12"} strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M220 292 L${220 + Math.cos((i * Math.PI) / 4) * 30} ${292 + Math.sin((i * Math.PI) / 4) * 30}`} stroke={lit ? "#fff6d0" : "#7a5f12"} strokeWidth="2" />
      ))}
      {lit && <rect x="182" y="250" width="76" height="110" fill="url(#at-glow)" opacity="0.6" />}
      {/* the shaft in the sand */}
      <ellipse cx="74" cy="352" rx="42" ry="16" fill="#140f08" stroke="#8a6a3a" strokeWidth="3" />
      {vaultLit && <ellipse cx="74" cy="352" rx="10" ry="5" fill="#fff6d0" />}
      {s.takes.has("vault") && <Glint x={74} y={352} />}
      <Vignette />
    </>
  );
}

function SanctumMirror() {
  return (
    <>
      <Backdrop wall={["#3a2a16", "#160f07"]} floor="#2a1d0e" light="#ffd98a" />
      {/* the great bronze mirror, showing a dial that isn't there */}
      <rect x="70" y="40" width="160" height="240" rx="80" fill="url(#at-brass)" />
      <rect x="80" y="50" width="140" height="220" rx="70" fill="#5a4626" />
      <g transform="translate(300 0) scale(-1 1)">
        <ellipse cx="150" cy="210" rx="52" ry="22" fill="#d9c08a" opacity="0.75" />
        <path d="M150 210 L188 222" stroke="#2a1f0e" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      </g>
      <path d="M96 70 Q120 60 128 90" stroke="#fff" strokeOpacity="0.25" strokeWidth="6" fill="none" />
      {/* the tablet */}
      <rect x="96" y="292" width="108" height="72" rx="6" fill="#8a7a5a" stroke="#4a3e28" strokeWidth="3" />
      {[310, 324, 338, 352].map((y) => (
        <path key={y} d={`M110 ${y} H190`} stroke="#3a2c14" strokeWidth="2" opacity="0.7" />
      ))}
      <Vignette />
    </>
  );
}

function SanctumStudy({ s }: { s: WallState }) {
  const open = s.flags.includes("meridian.chest.open");
  return (
    <>
      <Backdrop wall={["#3a2a16", "#160f07"]} floor="#2a1d0e" light="#ffd98a" />
      {/* a sun carved over the keeper's room */}
      <circle cx="150" cy="80" r="30" fill="none" stroke="#8a7440" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${150 + Math.cos((i * Math.PI) / 6) * 36} ${80 + Math.sin((i * Math.PI) / 6) * 36} L${150 + Math.cos((i * Math.PI) / 6) * 48} ${80 + Math.sin((i * Math.PI) / 6) * 48}`} stroke="#8a7440" strokeWidth="3" />
      ))}
      {/* the keeper's chest */}
      <rect x="44" y="250" width="112" height="70" rx="6" fill="#7a5a2a" stroke="#3a2a12" strokeWidth="3" />
      {open ? (
        <path d="M44 250 L56 206 H168 L156 250 Z" fill="#8a6a3a" stroke="#3a2a12" strokeWidth="3" />
      ) : (
        <>
          <rect x="44" y="228" width="112" height="26" rx="8" fill="#8a6a3a" stroke="#3a2a12" strokeWidth="3" />
          <rect x="84" y="232" width="32" height="16" rx="2" fill="#1b120b" />
        </>
      )}
      {s.takes.has("chest") && <Glint x={100} y={240} />}
      {/* the altar */}
      <rect x="186" y="200" width="80" height="120" fill="#c9a24a" stroke="#6a5a3a" strokeWidth="3" />
      <rect x="180" y="192" width="92" height="12" fill="#d9b25a" />
      {s.takes.has("altar") && (
        <>
          <ellipse cx="226" cy="186" rx="12" ry="8" fill="#cfe3ea" stroke="#7a5f12" strokeWidth="2" />
          <Glint x={226} y={184} />
        </>
      )}
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Pelagic Library

function Sea() {
  return (
    <>
      <linearGradient id="at-sea-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a4552" />
        <stop offset="1" stopColor="#5a7a80" />
      </linearGradient>
      <rect width="300" height="400" fill="url(#at-sea-sky)" />
      <rect y="210" width="300" height="190" fill="url(#at-water)" />
      <path d="M0 214 Q30 206 60 214 T120 214 T180 214 T240 214 T300 214" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.6" />
    </>
  );
}

function PelagicArrival({ s }: { s: WallState }) {
  return (
    <>
      <Sea />
      {/* the sea wall and the library's door */}
      <rect x="0" y="300" width="300" height="100" fill="#4a5658" />
      <rect y="300" width="300" height="100" fill="url(#at-stone)" />
      <rect x="150" y="120" width="130" height="180" fill="#3a4648" />
      <path d="M180 300 V180 Q215 140 250 180 V300 Z" fill="#0b1a1c" stroke="#7a8a8c" strokeWidth="4" />
      {/* the gate home */}
      <circle cx="78" cy="214" r="58" fill="#08120f" stroke="#4a4458" strokeWidth="10" />
      <GlyphRing cx={78} cy={214} r={44} size={10} fill="#9ff3e4" opacity={0.7} />
      {/* the rack of flasks */}
      <rect x="150" y="304" width="70" height="10" fill="url(#at-wood)" />
      {[160, 176, 192, 208].map((x) => (
        <path key={x} d={`M${x} 304 v-14 h-4 v-6 h12 v6 h-4 v14 z`} fill="#bfe8df" opacity="0.7" />
      ))}
      {s.takes.has("pelagic-gate") && <Glint x={186} y={292} />}
      <Vignette />
    </>
  );
}

function PelagicAirlock({ s }: { s: WallState }) {
  const open = s.flags.includes("pelagic.airlock.open");
  const levels = s.tanks ?? [8, 0, 0];
  const caps = [8, 5, 3];
  const xs = [44, 92, 136];
  return (
    <>
      <Backdrop wall={["#1d3a3c", "#0a1a1c"]} floor="#14272a" light="#bff3ea" />
      {/* three tanks */}
      {caps.map((cap, i) => {
        const h = cap * 22;
        const y = 290 - h;
        return (
          <g key={i}>
            <rect x={xs[i]} y={y} width="36" height={h} rx="4" fill="#0b1416" stroke={i === 1 ? BRASS : "#7a8a8c"} strokeWidth="3" />
            <rect x={xs[i] + 3} y={290 - levels[i] * 22} width="30" height={levels[i] * 22 - 2} fill="url(#at-water)" />
            <path d={`M${xs[i] + 18} ${y} V${y - 14} H${xs[i] + 40}`} stroke="url(#at-iron)" strokeWidth="5" fill="none" />
          </g>
        );
      })}
      <rect x="30" y="292" width="150" height="8" fill="url(#at-iron)" />
      {/* the round glass airlock */}
      <circle cx="236" cy="200" r="50" fill={open ? "#0a1414" : "url(#at-water)"} stroke="url(#at-brass)" strokeWidth="8" />
      {open ? (
        <ellipse cx="200" cy="200" rx="12" ry="50" fill="#9fc6c4" opacity="0.5" stroke={BRASS_DK} strokeWidth="3" />
      ) : (
        <path d="M200 190 Q236 176 272 190" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.6" />
      )}
      <Vignette />
    </>
  );
}

function ArchiveHall({ s }: { s: WallState }) {
  const read = s.flags.includes("pelagic.glass.read");
  return (
    <>
      <Backdrop wall={["#123230", "#071715"]} floor="#1a2a26" light="#7cf2b0" />
      {/* the sea pressing on the glass ceiling */}
      <rect width="300" height="40" fill="url(#at-water)" />
      {/* green lamps */}
      {[170, 210, 250].map((x) => (
        <g key={x}>
          <path d={`M${x} 40 V62`} stroke="#555" />
          <path d={`M${x - 10} 62 h20 l-4 14 h-12 z`} fill="#3fae6a" />
          <circle cx={x} cy="80" r="16" fill="url(#at-teal-glow)" opacity="0.6" />
        </g>
      ))}
      {/* the depth gauge */}
      <circle cx="80" cy="85" r="34" fill="url(#at-paper)" stroke="url(#at-brass)" strokeWidth="5" />
      <path d="M80 85 L100 74" stroke="#1b120b" strokeWidth="3" />
      {/* four statues */}
      {[44, 76, 108].map((x, i) => (
        <g key={x} opacity={1 - i * 0.12}>
          <circle cx={x} cy="190" r="10" fill="#8a9a96" />
          <path d={`M${x - 14} 300 L${x - 8} 202 H${x + 8} L${x + 14} 300 Z`} fill="#7a8a86" />
        </g>
      ))}
      <g opacity="0.6">
        <circle cx="128" cy="186" r="8" fill="#8a9a96" />
        <path d="M117 300 L122 196 H134 L139 300 Z" fill="#7a8a86" />
      </g>
      {/* the glass wall, etched from the sea side */}
      <rect x="150" y="150" width="120" height="170" fill="url(#at-water)" stroke="#7a8a8c" strokeWidth="4" />
      <text x="210" y="230" textAnchor="middle" fontSize="12" fill="#e9fffa" opacity="0.35" transform="translate(420 0) scale(-1 1)">
        PULL THE THIRD TILE
      </text>
      {read && <rect x="196" y="290" width="40" height="18" fill="#2a1a10" stroke={BRASS} />}
      {s.takes.has("glass") && <Glint x={216} y={298} />}
      <Vignette />
    </>
  );
}

function ArchiveRegistry({ s }: { s: WallState }) {
  const open = s.flags.includes("pelagic.desk.open");
  const books = [
    { x: 60, c: "#7a2a22" },
    { x: 150, c: "#2f6a3a" },
    { x: 240, c: "#22507a" },
  ];
  return (
    <>
      <Backdrop wall={["#123230", "#071715"]} floor="#1a2a26" light="#7cf2b0" />
      <rect width="300" height="30" fill="url(#at-water)" />
      {/* three registries on their stands */}
      {books.map((b) => (
        <g key={b.x}>
          <path d={`M${b.x - 30} 150 L${b.x} 140 L${b.x + 30} 150 V160 H${b.x - 30} Z`} fill={b.c} stroke="#111" />
          <path d={`M${b.x - 26} 148 L${b.x} 139 L${b.x + 26} 148`} stroke="url(#at-paper)" strokeWidth="3" fill="none" />
          <path d={`M${b.x} 160 V200`} stroke="url(#at-wood)" strokeWidth="6" />
          <rect x={b.x - 16} y="200" width="32" height="6" fill="#3b2414" />
        </g>
      ))}
      {/* the registrar's desk */}
      <rect x="70" y="240" width="160" height="90" rx="4" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      <rect x={open ? 76 : 70} y={open ? 214 : 232} width="160" height="14" rx="3" fill="#5b3a22" stroke="#2a180c" transform={open ? "rotate(-8 76 228)" : undefined} />
      <rect x="110" y="270" width="80" height="22" rx="3" fill="#1b120b" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={122 + i * 19} cy="281" r="6" fill="url(#at-brass)" />
      ))}
      {s.takes.has("desk") && <Glint x={150} y={252} />}
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Null Cathedral

function CathedralNave({ s }: { s: WallState }) {
  const convened = s.flags.includes("core.convened");
  const rerouted = s.flags.includes("core.rerouted");
  return (
    <>
      <Backdrop wall={["#1d1528", "#06040a"]} floor="#0e0a14" light="#c9b6ff" />
      {/* pointed arches */}
      {[40, 150, 260].map((x) => (
        <path key={x} d={`M${x - 40} 330 V110 Q${x} 20 ${x + 40} 110 V330`} stroke="#2a2238" strokeWidth="6" fill="none" />
      ))}
      {/* the Atlas Core: a sphere of turning rings */}
      <circle cx="150" cy="190" r="110" fill="url(#at-teal-glow)" opacity={convened ? 0.5 : 0.3} />
      <g className="motion-safe:animate-spin" style={{ transformOrigin: "150px 190px", animationDuration: convened ? "40s" : "18s" }}>
        <ellipse cx="150" cy="190" rx="90" ry="90" fill="none" stroke="url(#at-brass)" strokeWidth="4" />
        <ellipse cx="150" cy="190" rx="90" ry="30" fill="none" stroke="url(#at-brass)" strokeWidth="3" />
        <ellipse cx="150" cy="190" rx="30" ry="90" fill="none" stroke="url(#at-brass)" strokeWidth="3" />
        <ellipse cx="150" cy="190" rx="70" ry="70" fill="none" stroke={rerouted ? "#9ff3e4" : BRASS_DK} strokeWidth="2" transform="rotate(45 150 190)" />
      </g>
      <circle cx="150" cy="190" r="16" fill={rerouted ? "#9ff3e4" : "#f0d98a"} />
      <circle cx="150" cy="190" r="34" fill="url(#at-glow)" />
      <Vignette />
    </>
  );
}

function CathedralDoor() {
  return (
    <>
      <Backdrop wall={["#1d1528", "#06040a"]} floor="#0e0a14" light="#c9b6ff" />
      {/* the lectern and Corin's page */}
      <path d="M86 330 V230" stroke="url(#at-wood)" strokeWidth="10" />
      <path d="M44 230 L86 206 L128 230 V240 H44 Z" fill="#3b2414" stroke="#111" />
      <rect x="56" y="214" width="58" height="20" fill="url(#at-paper)" transform="rotate(-6 86 224)" />
      <circle cx="86" cy="200" r="40" fill="url(#at-glow)" opacity="0.4" />
      {/* the black gate home */}
      <circle cx="215" cy="200" r="64" fill="#050308" stroke="#2a2238" strokeWidth="14" />
      <GlyphRing cx={215} cy={200} r={48} size={11} fill="#6a5a8a" />
      <Vignette />
    </>
  );
}

const WALL_ART: Record<WallId, (props: { s: WallState }) => React.ReactNode> = {
  telescope: () => <Telescope />,
  desk: ({ s }) => <Desk s={s} />,
  clock: ({ s }) => <Clock s={s} />,
  stairs: ({ s }) => <Stairs s={s} />,
  valves: ({ s }) => <Valves s={s} />,
  tunnel: ({ s }) => <Tunnel s={s} />,
  wheel: ({ s }) => <WaterWheel s={s} />,
  gate: ({ s }) => <Gate s={s} />,
  engine: ({ s }) => <Engine s={s} />,
  "verdant-arrival": ({ s }) => <VerdantArrival s={s} />,
  "verdant-beds": ({ s }) => <VerdantBeds s={s} />,
  "verdant-shelves": ({ s }) => <VerdantShelves s={s} />,
  "verdant-roots": ({ s }) => <VerdantRoots s={s} />,
  "meridian-arrival": () => <MeridianArrival />,
  "meridian-plaza": ({ s }) => <MeridianPlaza s={s} />,
  "sanctum-mirror": () => <SanctumMirror />,
  "sanctum-study": ({ s }) => <SanctumStudy s={s} />,
  "pelagic-arrival": ({ s }) => <PelagicArrival s={s} />,
  "pelagic-airlock": ({ s }) => <PelagicAirlock s={s} />,
  "archive-hall": ({ s }) => <ArchiveHall s={s} />,
  "archive-registry": ({ s }) => <ArchiveRegistry s={s} />,
  "cathedral-nave": ({ s }) => <CathedralNave s={s} />,
  "cathedral-door": () => <CathedralDoor />,
};

export interface TapSpot {
  id: HotspotId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * One wall, drawn from the room's state, with its tappable things as transparent shapes in the drawing's own
 * coordinates, so they stay on top of what they belong to however the wall is scaled or letterboxed.
 */
export function WallArt({
  wall,
  state,
  label,
  spots,
  pulse,
  onTap,
}: {
  wall: WallId;
  state: WallState;
  label: string;
  spots: TapSpot[];
  pulse: boolean;
  onTap: (id: HotspotId) => void;
}) {
  const Art = WALL_ART[wall];
  return (
    <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-label={label}>
      <Defs />
      <g aria-hidden>
        <Art s={state} />
      </g>
      {spots.map((s) => (
        <rect
          key={s.id}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx="8"
          role="button"
          tabIndex={0}
          aria-label={s.label}
          onClick={() => onTap(s.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTap(s.id);
            }
          }}
          className={`cursor-pointer outline-none [fill:transparent] [stroke-width:3] focus-visible:[stroke:#f4e7b5] active:[fill:#f4e7b51f] ${
            pulse ? "animate-pulse [fill:#f4e7b526] [stroke:#f4e7b5b3]" : ""
          }`}
        />
      ))}
    </svg>
  );
}
