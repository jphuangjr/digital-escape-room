import type { HotspotId } from "@/lib/atlas/types";

/**
 * The Atlas of Silent Worlds' shared drawing kit (viewBox 300×400, portrait): palette, gradients, textures, light and
 * ambient motion. Each place's walls live in their own module beside this one; ./index puts them together.
 */

export interface WallState {
  flags: string[];
  /** Hotspots that still have something lying there to pick up. */
  takes: Set<HotspotId>;
  /** Water in the Pelagic tanks, when known. */
  tanks: number[] | null;
}

export const BRASS = "#c9a227";
export const BRASS_HI = "#f0d98a";
export const BRASS_DK = "#7a5f12";

/** Shared gradients, patterns and filters. Each wall draws once, so the ids are unique on the page. */
export function Defs() {
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
      {/* ---- light, texture and depth (the richer pass) ---- */}
      {/* fine grain over a whole wall: stone, plaster and paper stop looking flat */}
      <filter id="at-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 0.95" />
      </filter>
      {/* blotchy stains and damp: large, soft noise */}
      <filter id="at-mottle" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="3" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.25" />
      </filter>
      {/* soft edges for glows and shadows */}
      <filter id="at-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id="at-softer" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      {/* objects sit on the floor: a soft drop shadow */}
      <filter id="at-drop" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.55" />
      </filter>
      <linearGradient id="at-shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3c4" stopOpacity="0.32" />
        <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="at-floor-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.45" />
        <stop offset="0.35" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.35" />
      </linearGradient>
      <radialGradient id="at-candle" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
        <stop offset="0.5" stopColor="#ffb347" stopOpacity="0.16" />
        <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="at-brass-ball" cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor="#fff2c2" />
        <stop offset="0.35" stopColor={BRASS} />
        <stop offset="1" stopColor={BRASS_DK} />
      </radialGradient>
      <pattern id="at-glass" width="50" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 0 H50 V60 M0 0 V60" stroke="#2b3b2b" strokeWidth="2.5" fill="none" />
      </pattern>
    </defs>
  );
}

/** A room's backdrop: wall, floor and a light falling from above. */
export function Backdrop({ wall, floor, light = "#ffd98a", pattern = "at-stone", floorY = 330 }: { wall: [string, string]; floor: string; light?: string; pattern?: string; floorY?: number }) {
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
      <ellipse cx="150" cy="20" rx="190" ry="160" fill={light} opacity="0.08" filter="url(#at-softer)" />
    </>
  );
}

export function Vignette() {
  return <rect width="300" height="400" fill="url(#at-vignette)" pointerEvents="none" />;
}

/** A small sparkle where something can be picked up. */
export function Glint({ x, y }: { x: number; y: number }) {
  return (
    <g className="motion-safe:animate-pulse">
      <circle cx={x} cy={y} r="9" fill="url(#at-glow)" />
      <path d={`M${x - 6} ${y} H${x + 6} M${x} ${y - 6} V${y + 6}`} stroke="#fff6d0" strokeWidth="1.4" />
    </g>
  );
}

export const GLYPH: Record<string, string> = { sun: "☉", moon: "☾", star: "✶", eye: "◈", peak: "△", wave: "≈", knot: "⌘" };
export const RING_ORDER = ["sun", "moon", "star", "eye", "peak", "wave", "knot"];

/** Glyphs set round a ring. */
export function GlyphRing({ cx, cy, r, size = 11, fill = BRASS_HI, opacity = 1 }: { cx: number; cy: number; r: number; size?: number; fill?: string; opacity?: number }) {
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


// ---------------------------------------------------------------- the richer pass: light, texture, life

/** A seeded random sequence, so scattered details (dust, bubbles, cracks) land in the same place every render. */
export function seeded(seed: number) {
  let x = seed % 2147483647 || 1;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

/** Fine grain over everything below it. Draw last, before the vignette. */
export function Grain({ opacity = 0.07 }: { opacity?: number }) {
  return <rect width="300" height="400" filter="url(#at-grain)" opacity={opacity} pointerEvents="none" />;
}

/** Large soft stains: damp on stone, age on plaster. */
export function Mottle({ y = 0, h = 400, opacity = 0.35 }: { y?: number; h?: number; opacity?: number }) {
  return <rect y={y} width="300" height={h} filter="url(#at-mottle)" opacity={opacity} pointerEvents="none" />;
}

/** Depth on a floor: darker at the wall line and toward the viewer. */
export function FloorShade({ floorY }: { floorY: number }) {
  return <rect y={floorY} width="300" height={400 - floorY} fill="url(#at-floor-fade)" pointerEvents="none" />;
}

/** A soft shadow pooled under an object. */
export function Shadow({ cx, cy, rx, ry = rx / 5, opacity = 0.5 }: { cx: number; cy: number; rx: number; ry?: number; opacity?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity={opacity} filter="url(#at-soft)" />;
}

/** A pool of light: candlelight, lamplight, a glowing thing. `flicker` makes it breathe. */
export function LightPool({ cx, cy, r, color, opacity = 1, flicker = false }: { cx: number; cy: number; r: number; color?: string; opacity?: number; flicker?: boolean }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color ? undefined : "url(#at-candle)"}
      style={color ? { fill: color } : undefined}
      opacity={opacity}
      className={flicker ? "at-flicker" : undefined}
      filter={color ? "url(#at-softer)" : undefined}
      pointerEvents="none"
    />
  );
}

/** A slanted shaft of light from a window or opening, with dust turning in it. */
export function LightShaft({ x1, x2, spread = 60, y1 = 0, y2 = 400, opacity = 1, dust = 0, seed = 1 }: { x1: number; x2: number; spread?: number; y1?: number; y2?: number; opacity?: number; dust?: number; seed?: number }) {
  const w = x2 - x1;
  const rnd = seeded(seed);
  return (
    <g opacity={opacity} pointerEvents="none">
      <path d={`M${x1} ${y1} L${x2} ${y1} L${x2 + spread} ${y2} L${x1 + spread} ${y2} Z`} fill="url(#at-shaft)" filter="url(#at-soft)" className="at-breathe" />
      {Array.from({ length: dust }, (_, i) => {
        const t = rnd();
        const x = x1 + spread * t + rnd() * w;
        const y = y1 + (y2 - y1) * t;
        return <circle key={i} cx={x} cy={y} r={0.6 + rnd() * 0.9} fill="#fff6d8" opacity={0.5 + rnd() * 0.4} className="at-mote" style={{ animationDelay: `${-rnd() * 14}s`, animationDuration: `${10 + rnd() * 8}s` }} />;
      })}
    </g>
  );
}

/** Motes drifting in still air across an area. */
export function Dust({ x, y, w, h, count = 14, color = "#fff1c9", seed = 2 }: { x: number; y: number; w: number; h: number; count?: number; color?: string; seed?: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={x + rnd() * w}
          cy={y + rnd() * h}
          r={0.5 + rnd() * 1}
          fill={color}
          opacity={0.25 + rnd() * 0.45}
          className="at-mote"
          style={{ animationDelay: `${-rnd() * 16}s`, animationDuration: `${12 + rnd() * 10}s` }}
        />
      ))}
    </g>
  );
}

/** Rain running down glass, inside a clip the caller supplies (a window's shape). */
export function Rain({ x, y, w, h, count = 16, seed = 3 }: { x: number; y: number; w: number; h: number; count?: number; seed?: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none">
      {Array.from({ length: count }, (_, i) => {
        const cx = x + rnd() * w;
        const len = 6 + rnd() * 10;
        return (
          <path
            key={i}
            d={`M${cx} ${y} l-2 ${len}`}
            stroke="#b9d0dc"
            strokeWidth={0.7 + rnd() * 0.5}
            strokeLinecap="round"
            opacity="0.55"
            className="at-rain"
            style={{ animationDelay: `${-rnd() * 1.4}s`, animationDuration: `${0.9 + rnd() * 0.7}s`, ["--fall" as string]: `${h}px` }}
          />
        );
      })}
    </g>
  );
}

/** Bubbles rising through water. */
export function Bubbles({ x, y, w, h, count = 10, seed = 4 }: { x: number; y: number; w: number; h: number; count?: number; seed?: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={x + rnd() * w}
          cy={y + h}
          r={0.8 + rnd() * 1.8}
          fill="none"
          stroke="#d8fbf4"
          strokeWidth="0.6"
          opacity="0.7"
          className="at-bubble"
          style={{ animationDelay: `${-rnd() * 9}s`, animationDuration: `${6 + rnd() * 6}s`, ["--rise" as string]: `${-h}px` }}
        />
      ))}
    </g>
  );
}

/** Light rippling over a surface under water (or water's reflection on a wall). */
export function Caustics({ x, y, w, h, opacity = 0.18, seed = 5 }: { x: number; y: number; w: number; h: number; opacity?: number; seed?: number }) {
  const rnd = seeded(seed);
  return (
    <g opacity={opacity} pointerEvents="none" className="at-shimmer">
      {Array.from({ length: 7 }, (_, i) => {
        const yy = y + (h / 7) * i + rnd() * 6;
        return <path key={i} d={`M${x} ${yy} q${w / 8} -5 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} stroke="#c9fff3" strokeWidth={1 + rnd()} fill="none" filter="url(#at-soft)" />;
      })}
    </g>
  );
}

/** Sand blowing low across the ground. */
export function SandDrift({ y, count = 12, seed = 6 }: { y: number; count?: number; seed?: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          d={`M${rnd() * 300} ${y + rnd() * 40} h${8 + rnd() * 14}`}
          stroke="#f6dfae"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
          className="at-sand"
          style={{ animationDelay: `${-rnd() * 6}s`, animationDuration: `${4 + rnd() * 4}s` }}
        />
      ))}
    </g>
  );
}

/** A candle with a living flame and the light it throws. */
export function Candle({ x, y, h = 18 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <LightPool cx={x} cy={y - h - 4} r={46} flicker />
      <rect x={x - 3} y={y - h} width="6" height={h} rx="1" fill="#efe6d2" />
      <path d={`M${x - 3} ${y - h + 2} q1.5 3 0 6`} stroke="#d8ccb0" strokeWidth="1" fill="none" />
      <g className="at-flame" style={{ transformOrigin: `${x}px ${y - h}px` }}>
        <path d={`M${x} ${y - h - 11} q4.5 6 0 10 q-4.5 -4 0 -10 z`} fill="#ffcf6b" />
        <path d={`M${x} ${y - h - 6} q2 3 0 5 q-2 -2 0 -5 z`} fill="#fff6d8" />
      </g>
    </g>
  );
}
