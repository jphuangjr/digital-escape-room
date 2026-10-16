import { FloorShade, Grain, Mottle, seeded } from "@/components/atlas/art/common";

/**
 * The Nightingale Express's shared drawing pieces (viewBox 300×400, portrait): the Art Deco palette, the panelled
 * room every wall stands in, and the sconces. The light, texture and motion kit is shared with the Atlas
 * (../../atlas/art/common); its defs are drawn once per wall by ../walls.
 */

export const C = {
  walnut: "#5b3a22",
  walnutDark: "#3d2615",
  walnutLine: "#7a5333",
  brass: "#c9a227",
  brassHi: "#ecd27a",
  velvet: "#2f5d4a",
  velvetDark: "#1f4033",
  cream: "#efe6d2",
  carpet: "#6e1f22",
  ink: "#1b120b",
};

export function Room({ children }: { children: React.ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id="nx-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.walnut} />
          <stop offset="1" stopColor={C.walnutDark} />
        </linearGradient>
        <linearGradient id="nx-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.brassHi} />
          <stop offset="0.6" stopColor={C.brass} />
          <stop offset="1" stopColor="#7a5f12" />
        </linearGradient>
        <linearGradient id="nx-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1422" />
          <stop offset="1" stopColor="#1d2c42" />
        </linearGradient>
        <linearGradient id="nx-velvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.velvet} />
          <stop offset="1" stopColor={C.velvetDark} />
        </linearGradient>
        <radialGradient id="nx-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nx-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9d4da" />
          <stop offset="0.5" stopColor="#8fa0aa" />
          <stop offset="1" stopColor="#b8c4ca" />
        </linearGradient>
        {/* walnut grain: long wavy streaks */}
        <pattern id="nx-grain" width="60" height="400" patternUnits="userSpaceOnUse">
          <path d="M6 0 C10 80 2 160 8 240 S4 360 8 400" stroke="#2a180c" strokeWidth="1" fill="none" opacity="0.35" />
          <path d="M22 0 C18 90 26 170 20 260 S24 350 21 400" stroke="#7a5333" strokeWidth="0.8" fill="none" opacity="0.25" />
          <path d="M38 0 C42 70 34 150 40 230 S36 340 39 400" stroke="#2a180c" strokeWidth="0.7" fill="none" opacity="0.3" />
          <path d="M52 0 C48 100 56 190 50 280 S54 370 51 400" stroke="#7a5333" strokeWidth="0.6" fill="none" opacity="0.2" />
        </pattern>
        {/* warm light from the ceiling lamp, dark corners */}
        <radialGradient id="nx-light" cx="0.5" cy="0.06" r="0.98">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.18" />
          <stop offset="0.25" stopColor="#ffd98a" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#ffd98a" stopOpacity="0.01" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        {/* the lamp's light on the panelling: a warm cone that fades down the wall */}
        <radialGradient id="nx-room-lampwash" cx="0.5" cy="0" r="1" gradientTransform="translate(0.5 0) scale(1 0.9) translate(-0.5 0)">
          <stop offset="0" stopColor="#ffdf9a" stopOpacity="0.32" />
          <stop offset="0.3" stopColor="#ffcf7a" stopOpacity="0.12" />
          <stop offset="0.7" stopColor="#ffcf7a" stopOpacity="0.02" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
        {/* French polish: a soft vertical sheen across the veneer */}
        <linearGradient id="nx-room-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.22" stopColor="#ffe2b0" stopOpacity="0.035" />
          <stop offset="0.38" stopColor="#ffe2b0" stopOpacity="0.09" />
          <stop offset="0.5" stopColor="#ffe2b0" stopOpacity="0.03" />
          <stop offset="0.66" stopColor="#ffe2b0" stopOpacity="0.08" />
          <stop offset="0.8" stopColor="#ffe2b0" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <radialGradient id="nx-room-bowl" cx="0.5" cy="0.15" r="0.9">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.55" stopColor="#f6e6c2" />
          <stop offset="1" stopColor="#c9a86a" />
        </radialGradient>
        <radialGradient id="nx-room-bloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1c8" stopOpacity="0.7" />
          <stop offset="0.35" stopColor="#ffdf9a" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffdf9a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nx-room-carpetLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#ffcf7a" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="nx-floorShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <pattern id="nx-carpet" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={C.carpet} />
          <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#8e3a2c" strokeWidth="1" />
          <circle cx="10" cy="10" r="1.6" fill={C.brass} opacity="0.6" />
        </pattern>
      </defs>
      <rect width="300" height="400" fill="url(#nx-wall)" />
      <rect width="300" height="400" fill="url(#nx-grain)" />
      <RoomVeneer />
      {/* panelling: raised mouldings above and below the dado, with corner fans */}
      <g stroke={C.walnutLine} strokeWidth="1" fill="none" opacity="0.7">
        <rect x="8" y="26" width="284" height="326" rx="4" />
        <path d="M8 254 H292" />
        <rect x="14" y="262" width="272" height="84" rx="3" />
      </g>
      <g stroke="#2a180c" strokeWidth="1" fill="none" opacity="0.5">
        <rect x="15" y="263" width="272" height="84" rx="3" />
        <rect x="9" y="27" width="284" height="326" rx="4" />
      </g>
      <g stroke="#e9c48a" strokeWidth="0.6" fill="none" opacity="0.28">
        <path d="M12 25.6 H288" />
        <path d="M18 261.6 H282" />
        <path d="M8 255 H292" />
      </g>
      <g fill="none" stroke={C.brass} strokeWidth="0.7" opacity="0.35">
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(300 0) scale(-1 1)" : undefined}>
            {[10, 18, 26].map((r) => (
              <path key={r} d={`M14 ${262 + r} A${r} ${r} 0 0 0 ${14 + r} 262`} />
            ))}
            {[0, 30, 60].map((a) => (
              <path key={a} d={`M14 262 l${(26 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(26 * Math.sin((a * Math.PI) / 180)).toFixed(1)}`} />
            ))}
          </g>
        ))}
      </g>
      {/* ceiling cornice with a stepped Art Deco frieze, and the floor */}
      <rect width="300" height="20" fill={C.ink} />
      <rect y="20" width="300" height="6" fill={C.walnutDark} />
      <path d="M0 20 H300" stroke="url(#nx-brass)" strokeWidth="2" />
      <g fill={C.brass} opacity="0.55">
        {Array.from({ length: 15 }, (_, i) => i * 20 + 10).map((x) => (
          <path key={x} d={`M${x - 5} 26 L${x} 21.5 L${x + 5} 26 Z`} />
        ))}
      </g>
      <path d="M0 26 H300" stroke={C.walnutLine} strokeWidth="0.8" />
      {/* the ceiling lamp: a frosted bowl on brass, its light washing down the panelling */}
      <rect y="26" width="300" height="330" fill="url(#nx-room-lampwash)" pointerEvents="none" />
      <ellipse cx="150" cy="22" rx="95" ry="14" fill="url(#nx-room-bloom)" opacity="0.75" />
      <ellipse cx="150" cy="20" rx="70" ry="10" fill="url(#nx-glow)" opacity="0.6" />
      <path d="M124 3.2 H176" stroke="url(#nx-brass)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M128 4 Q150 19 172 4 Z" fill="url(#nx-room-bowl)" stroke="url(#nx-brass)" strokeWidth="1.2" />
      <path d="M134 6 H166" stroke={C.brass} strokeWidth="0.8" opacity="0.7" />
      <path d="M138 9.5 Q150 14.5 162 9.5" stroke="#c9a227" strokeWidth="0.5" fill="none" opacity="0.45" />
      <ellipse cx="144" cy="7.8" rx="7" ry="1.4" fill="#fff" opacity="0.55" />
      <circle cx="150" cy="15.6" r="1.3" fill={C.brassHi} />
      <rect y="356" width="300" height="44" fill="url(#nx-carpet)" />
      <rect y="356" width="300" height="44" fill="url(#nx-room-carpetLight)" />
      <Grain opacity={0.08} />
      <g opacity="0.55">
        <FloorShade floorY={356} />
      </g>
      <path d="M0 356 H300" stroke="url(#nx-brass)" strokeWidth="2" />
      <path d="M0 357.6 H300" stroke="#fff1c8" strokeWidth="0.5" opacity="0.25" />
      {/* inlaid brass stringing along the dado rail, with little diamonds */}
      <path d="M8 250 H292" stroke="url(#nx-brass)" strokeWidth="1" opacity="0.6" />
      <g fill={C.brass} opacity="0.55">
        {Array.from({ length: 7 }, (_, i) => 30 + i * 40).map((x) => (
          <path key={x} d={`M${x} 247 l3 3 l-3 3 l-3 -3 z`} />
        ))}
      </g>
      {/* skirting shadow on the carpet */}
      <rect y="356" width="300" height="10" fill="url(#nx-floorShade)" opacity="0.8" />
      {children}
      {/* light and shadow over everything */}
      <rect width="300" height="400" fill="url(#nx-light)" pointerEvents="none" />
    </>
  );
}

/** Walnut figure under the varnish: soft mottling, seeded flame-figure streaks, and the polish sheen. Background only. */
function RoomVeneer() {
  const rnd = seeded(1934);
  const streaks = Array.from({ length: 34 }, () => {
    const x = 10 + rnd() * 280;
    const y = 30 + rnd() * 300;
    const len = 30 + rnd() * 70;
    const sw = (rnd() - 0.5) * 6;
    return { x, y, len, sw, dark: rnd() > 0.45, w: 0.4 + rnd() * 0.7, o: 0.1 + rnd() * 0.16 };
  });
  return (
    <g pointerEvents="none">
      <Mottle y={26} h={330} opacity={0.22} />
      <g fill="none" strokeLinecap="round">
        {streaks.map((s, i) => (
          <path
            key={i}
            d={`M${s.x.toFixed(1)} ${s.y.toFixed(1)} c${s.sw.toFixed(1)} ${(s.len / 3).toFixed(1)} ${(-s.sw).toFixed(1)} ${((2 * s.len) / 3).toFixed(1)} ${(s.sw / 2).toFixed(1)} ${s.len.toFixed(1)}`}
            stroke={s.dark ? "#1f1108" : "#9a6a40"}
            strokeWidth={s.w}
            opacity={s.o}
          />
        ))}
      </g>
      <rect y="26" width="300" height="330" fill="url(#nx-room-sheen)" />
    </g>
  );
}

export function Sconce({ x }: { x: number }) {
  return (
    <g>
      <circle cx={x} cy="118" r="18" fill="url(#nx-glow)" />
      <path d={`M${x} 140 V126`} stroke="url(#nx-brass)" strokeWidth="3" />
      <path d={`M${x - 8} 126 L${x - 5} 108 H${x + 5} L${x + 8} 126 Z`} fill="#f3e3b5" stroke="url(#nx-brass)" strokeWidth="1.5" />
    </g>
  );
}
