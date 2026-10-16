/** The dining car: the bar, tables, kitchen end and lounge end. Each draws itself from the room's shared flags. */
import { C, Room, Sconce } from "./common";
import { useT } from "@/i18n/client";
import { Grain, LightPool, Shadow, seeded } from "@/components/atlas/art/common";

// ---------------------------------------------------------------- small local helpers (decoration only)

/** Cigar or cigarette smoke curling up from a point: unfiltered strokes that sway and breathe. */
function Smoke({ x, y, h = 50, seed = 1, opacity = 0.32 }: { x: number; y: number; h?: number; seed?: number; opacity?: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none" className="at-breathe" style={{ animationDuration: `${5 + rnd() * 3}s` }}>
      {[0, 1, 2].map((i) => {
        const a = (rnd() - 0.5) * 10;
        const b = (rnd() - 0.5) * 14;
        const top = y - h * (0.7 + i * 0.15);
        const d = `M${x} ${y} C${x + 3} ${y - h * 0.18} ${x - 4 + a / 3} ${y - h * 0.3} ${x + a / 2} ${y - h * 0.45} S${x + b} ${y - h * 0.62} ${x + a} ${top}`;
        return (
          <g key={i} className="at-sway" style={{ animationDelay: `${-rnd() * 6}s`, animationDuration: `${4 + rnd() * 4}s` }}>
            <path d={d} stroke="#ddd8ce" strokeWidth={0.8 + i * 1.1} strokeLinecap="round" fill="none" opacity={opacity * (1 - i * 0.28)} />
          </g>
        );
      })}
    </g>
  );
}

/** Wisps of steam that lift and fade (the train's own nx-steam motion). */
function Steam({ x, y, seed = 1, n = 3, opacity = 0.3 }: { x: number; y: number; seed?: number; n?: number; opacity?: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none">
      {Array.from({ length: n }, (_, i) => {
        const cx = x + (i - (n - 1) / 2) * 9 + (rnd() - 0.5) * 4;
        const s = (rnd() - 0.5) * 8;
        return (
          <path
            key={i}
            d={`M${cx} ${y} q${-4 + s / 2} -6 ${s / 3} -12 q${5} -6 ${s / 2} -14`}
            stroke="#efe9df"
            strokeWidth={2 + rnd() * 1.6}
            strokeLinecap="round"
            fill="none"
            opacity={opacity}
            className="nx-steam"
            style={{ animationDelay: `${-rnd() * 2.4}s`, animationDuration: `${2.2 + rnd() * 1.4}s` }}
          />
        );
      })}
    </g>
  );
}

/** A dark rim around the edges of a wall, drawn last. */
function Vignette() {
  return <rect width="300" height="400" fill="url(#at-vignette)" opacity="0.7" pointerEvents="none" />;
}

// ---------------------------------------------------------------- the bar

export function BarWall({ flags }: { flags: string[] }) {
  const open = flags.includes("cashbox.open");
  const frost = seeded(41);
  return (
    <Room>
      <defs>
        <linearGradient id="nx-bar-mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#33414e" />
          <stop offset="0.5" stopColor="#1f2932" />
          <stop offset="1" stopColor="#2b3744" />
        </linearGradient>
        <linearGradient id="nx-bar-shelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nx-bar-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b0603a" />
          <stop offset="0.4" stopColor="#7a3a1e" />
          <stop offset="1" stopColor="#4a2414" />
        </linearGradient>
        <linearGradient id="nx-bar-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#56291a" />
          <stop offset="1" stopColor="#331a0e" />
        </linearGradient>
        <linearGradient id="nx-bar-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa4ab" />
          <stop offset="0.3" stopColor="#f2f6f8" />
          <stop offset="0.55" stopColor="#c3cbd1" />
          <stop offset="1" stopColor="#7d878e" />
        </linearGradient>
        <linearGradient id="nx-bar-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#77818a" />
          <stop offset="1" stopColor="#4c545b" />
        </linearGradient>
      </defs>
      {/* mirrored back bar with shelves of bottles */}
      <Shadow cx={150} cy={162} rx={120} ry={5} opacity={0.45} />
      <rect x="28" y="40" width="244" height="120" rx="6" fill="url(#nx-bar-mirror)" stroke="url(#nx-brass)" strokeWidth="2" />
      {/* strip lights hidden under each shelf wash the bottles below */}
      <rect x="30" y="42" width="240" height="38" fill="url(#nx-bar-shelf)" />
      <rect x="30" y="88" width="240" height="34" fill="url(#nx-bar-shelf)" />
      {/* the room reflected faintly: the ceiling lamp, and a dark band of the far wall */}
      <ellipse cx="150" cy="56" rx="40" ry="8" fill="#ffe9b0" opacity="0.12" filter="url(#at-soft)" />
      <rect x="30" y="132" width="240" height="26" fill="#0d1218" opacity="0.35" />
      {/* a brass sunburst in the middle of the back mirror */}
      <g stroke="url(#nx-brass)" strokeWidth="1" opacity="0.8">
        {Array.from({ length: 9 }, (_, i) => (i * Math.PI) / 8).map((a, i) => (
          <path key={i} d={`M150 84 L${(150 - 26 * Math.cos(a)).toFixed(1)} ${(84 - 26 * Math.sin(a)).toFixed(1)}`} />
        ))}
      </g>
      <circle cx="150" cy="84" r="6" fill="url(#nx-brass)" />
      <circle cx="148.4" cy="82.4" r="1.6" fill="#fff6d0" opacity="0.8" />
      <path d="M40 46 L60 46 L44 70 Z M260 46 L240 46 L256 70 Z" fill="#fff" opacity="0.06" />
      {[86, 128].map((y) => (
        <g key={y}>
          <path d={`M32 ${y} H268`} stroke="url(#nx-brass)" strokeWidth="2.5" />
          <path d={`M32 ${y - 0.8} H268`} stroke="#fff3c4" strokeWidth="0.5" opacity="0.5" />
        </g>
      ))}
      {[
        [44, 58, "#3f6b3a"],
        [60, 52, "#8a2c1f"],
        [78, 60, "#c9a227"],
        [96, 54, "#2f4a6b"],
        [116, 58, "#6b3a5a"],
        [182, 54, "#3f6b3a"],
        [202, 60, "#c98b3a"],
        [222, 52, "#8a2c1f"],
        [244, 58, "#efe6d2"],
        [52, 98, "#c9a227"],
        [74, 102, "#3f6b3a"],
        [196, 100, "#8a2c1f"],
        [220, 98, "#2f4a6b"],
        [242, 104, "#c98b3a"],
      ].map(([x, y, c]) => {
        const h = (y as number) < 86 ? 86 - Number(y) : 128 - Number(y);
        return (
          <g key={`${x}-${y}`}>
            <rect x={Number(x) - 5} y={Number(y)} width="10" height={h} rx="3" fill={c as string} opacity="0.9" />
            <rect x={Number(x) - 2} y={Number(y) - 7} width="4" height="8" fill={c as string} />
            {/* glass catching the strip light: a bright edge on the left, shade on the right */}
            <rect x={Number(x) - 3.6} y={Number(y) + 3} width="1.3" height={h - 6} rx="0.6" fill="#fff" opacity="0.38" />
            <rect x={Number(x) + 2.4} y={Number(y) + 2} width="2" height={h - 3} rx="1" fill="#000" opacity="0.2" />
          </g>
        );
      })}
      {/* a slow gleam travelling across the mirror glass */}
      <g className="at-shimmer" pointerEvents="none">
        <path d="M110 44 L124 44 L92 156 L78 156 Z" fill="#fff" opacity="0.045" />
        <path d="M128 44 L133 44 L101 156 L96 156 Z" fill="#fff" opacity="0.04" />
      </g>
      <rect x="31.5" y="43.5" width="237" height="113" rx="4" fill="none" stroke="#e8f0f5" strokeWidth="0.6" opacity="0.18" />
      <text x="150" y="152" textAnchor="middle" fontSize="8" fill={C.brass} fontFamily="Georgia, serif" letterSpacing="3">
        THE NIGHTINGALE
      </text>
      {/* Table 5's scorecard, tucked into the corner of the mirror */}
      <g transform="rotate(8 251 143)">
        <rect x="241" y="130" width="22" height="28" rx="1" fill="#000" opacity="0.3" />
        <rect x="240" y="128" width="22" height="28" rx="1" fill="#fffaf0" stroke="#9a8f78" strokeWidth="0.6" />
        <path d="M243 134 H259 M243 139 H257 M243 144 H259 M243 149 H255" stroke="#9a8f78" strokeWidth="0.8" />
        <rect x="248" y="125" width="6" height="5" fill="url(#nx-brass)" />
      </g>
      {/* the ceiling lamp's pool of light on the bar top */}
      <ellipse cx="150" cy="214" rx="140" ry="22" fill="#ffd98a" opacity="0.12" filter="url(#at-softer)" />
      {/* counter */}
      <rect x="18" y="222" width="264" height="14" rx="3" fill="url(#nx-bar-top)" stroke={C.ink} />
      <path d="M21 223.6 H279" stroke="#f0b27a" strokeWidth="0.8" opacity="0.45" />
      <rect x="24" y="236" width="252" height="90" fill="url(#nx-bar-front)" stroke={C.ink} />
      <rect x="24" y="236" width="252" height="90" fill="url(#nx-grain)" opacity="0.8" />
      <rect x="24" y="236" width="252" height="8" fill="url(#nx-floorShade)" />
      <path d="M24 280 H276" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M24 279 H276" stroke="#fff3c4" strokeWidth="0.5" opacity="0.5" />
      {[60, 110, 160, 210].map((x) => (
        <g key={x}>
          <rect x={x} y="246" width="34" height="26" rx="3" fill="none" stroke="#6b3a20" />
          <path d={`M${x + 1} 270 V249 Q${x + 1} 247 ${x + 3} 247 H${x + 33}`} stroke="#b0703f" strokeWidth="0.6" fill="none" opacity="0.45" />
          <path d={`M${x + 34} 249 V269 Q${x + 34} 272 ${x + 31} 272 H${x + 2}`} stroke="#1b0d06" strokeWidth="0.8" fill="none" opacity="0.6" />
        </g>
      ))}
      {/* the lower front, in shadow under the rail */}
      <rect x="24" y="282" width="252" height="44" fill="#000" opacity="0.18" />
      {/* lemons and two coupes on the counter */}
      <Shadow cx={38} cy={221} rx={17} ry={2.2} opacity={0.55} />
      <path d="M22 220 Q22 210 38 210 Q54 210 54 220 Z" fill="url(#nx-brass)" opacity="0.9" />
      <ellipse cx="32" cy="209" rx="6" ry="4.5" fill="#e8c93a" />
      <ellipse cx="43" cy="208" rx="6" ry="4.5" fill="#f0d54a" />
      <ellipse cx="30.5" cy="207.4" rx="2" ry="1.1" fill="#fffbe0" opacity="0.7" />
      <ellipse cx="41.5" cy="206.4" rx="2" ry="1.1" fill="#fffbe0" opacity="0.7" />
      <path d="M25 216 Q27 212 33 211.5" stroke="#fff6d0" strokeWidth="0.8" fill="none" opacity="0.6" />
      {[262, 276].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="221.5" rx="5" ry="1.2" fill="#000" opacity="0.35" />
          <path d={`M${x - 6} 204 Q${x} 212 ${x + 6} 204 Z`} fill="#f2e4b0" opacity="0.55" stroke="#b8ad92" strokeWidth="0.6" />
          <path d={`M${x} 209 V220 M${x - 4} 221 H${x + 4}`} stroke="#b8ad92" strokeWidth="1" />
          <path d={`M${x - 4.4} 205 Q${x - 2} 207.6 ${x} 207.8`} stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.7" />
        </g>
      ))}
      {/* someone's drink, abandoned half-finished between the cash box and the shaker */}
      <ellipse cx="141.5" cy="221.4" rx="5" ry="1.1" fill="#000" opacity="0.35" />
      <path d="M137.2 207.5 H145.8 L145 221 H138 Z" fill="#cfe0e8" opacity="0.28" stroke="#c6d2d8" strokeWidth="0.5" />
      <path d="M137.8 214 H145.2 L144.9 220.6 H138.1 Z" fill="#c98b3a" opacity="0.75" />
      <rect x="139" y="212.6" width="3.4" height="3.2" rx="0.6" fill="#eef6f8" opacity="0.7" transform="rotate(-12 140.7 214.2)" />
      <path d="M138.6 209 V219.6" stroke="#fff" strokeWidth="0.6" opacity="0.6" />
      {/* the cocktail shaker, still frosted with cold */}
      <Shadow cx={166} cy={221} rx={11} ry={2.2} opacity={0.55} />
      <path d="M160 220 L157 196 H175 L172 220 Z" fill="url(#nx-bar-steel)" stroke="#8a949b" strokeWidth="0.8" />
      <path d="M159 196 Q166 186 173 196 Z" fill="#dfe5e9" stroke="#8a949b" strokeWidth="0.8" />
      <rect x="164" y="182" width="4" height="7" rx="1" fill="#cfd6db" stroke="#8a949b" strokeWidth="0.6" />
      <path d="M161 202 V216" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
      <path d="M157.6 199 H174.4" stroke="#8a949b" strokeWidth="0.6" />
      <g fill="#ffffff" opacity="0.55">
        {Array.from({ length: 16 }, (_, i) => {
          const t = frost();
          return <circle key={i} cx={159 + 2 * t + frost() * (12 - 3 * t)} cy={201 + t * 18} r={0.35 + frost() * 0.35} />;
        })}
      </g>
      {/* cash box */}
      <Shadow cx={96} cy={222} rx={38} ry={3} opacity={0.6} />
      <rect x="62" y="186" width="68" height="36" rx="3" fill="url(#nx-bar-box)" stroke="#2a2f34" strokeWidth="1.5" />
      <path d="M64 188.2 H128" stroke="#c9d2d8" strokeWidth="0.7" opacity="0.5" />
      {open ? (
        <g>
          <rect x="65" y="188" width="62" height="5" fill="#0d0f11" opacity="0.6" />
          <path d="M62 186 L70 166 H138 L130 186 Z" fill="#717b84" stroke="#2a2f34" />
          <path d="M71 168 H136" stroke="#c9d2d8" strokeWidth="0.6" opacity="0.5" />
        </g>
      ) : (
        [72, 86, 100, 114].map((x) => <rect key={x} x={x} y="196" width="10" height="16" rx="2" fill="url(#nx-brass)" stroke="#7a5f12" strokeWidth="0.6" />)
      )}
      {/* an ashtray, the cigarette still burning */}
      <ellipse cx="200" cy="219.6" rx="5.2" ry="1.8" fill="#9fb0b8" opacity="0.6" stroke="#6c7a82" strokeWidth="0.5" />
      <path d="M195.4 218.6 L204.6 216.2" stroke="#f4efe4" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="204.8" cy="216.1" r="0.8" fill="#ff8a3a" className="at-flicker" />
      <Smoke x={205} y={215} h={46} seed={7} opacity={0.3} />
      {/* bell */}
      <Shadow cx={231} cy={223} rx={20} ry={2.4} opacity={0.6} />
      <path d="M216 222 Q216 200 231 198 Q246 200 246 222 Z" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M220 218 Q220 205 228 201.6" stroke="#fff6d0" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
      <rect x="212" y="220" width="38" height="4" rx="2" fill="#7a5f12" />
      <circle cx="231" cy="196" r="3" fill="url(#nx-brass)" />
      <circle cx="230" cy="195" r="0.9" fill="#fff6d0" opacity="0.8" />
      {/* brass footrail */}
      <path d="M24 314 H276" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M24 313 H276" stroke="#fff3c4" strokeWidth="0.5" opacity="0.5" />
      {/* stools */}
      {[70, 150, 230].map((x) => (
        <g key={x}>
          <Shadow cx={x} cy={359} rx={16} ry={2.6} opacity={0.6} />
          <path d={`M${x - 8} 356 Q${x} 350 ${x + 8} 356`} stroke="url(#nx-brass)" strokeWidth="2" fill="none" />
          <path d={`M${x} 337 V354`} stroke={C.brass} strokeWidth="3" />
          <path d={`M${x - 0.8} 338 V353`} stroke="#fff3c4" strokeWidth="0.6" opacity="0.6" />
          <path d={`M${x - 8} 346 H${x + 8}`} stroke="url(#nx-brass)" strokeWidth="1.5" />
          <ellipse cx={x} cy="332" rx="18" ry="5" fill="#2f5d4a" stroke={C.ink} />
          <ellipse cx={x - 4} cy="330.6" rx="9" ry="1.8" fill="#8fc0a8" opacity="0.28" />
          <path d={`M${x - 18} 332 Q${x} 340 ${x + 18} 332`} stroke="#173328" strokeWidth="2" fill="none" />
          {[-12, -4, 4, 12].map((dx) => (
            <circle key={dx} cx={x + dx} cy={335} r="0.9" fill={C.brass} />
          ))}
        </g>
      ))}
      <Grain opacity={0.06} />
      <Vignette />
    </Room>
  );
}

// ---------------------------------------------------------------- the tables

/** A Pullman table lamp: a brass stem and a pleated silk shade glowing rose-gold. */
function TableLamp({ x, base }: { x: number; base: number }) {
  return (
    <g>
      <LightPool cx={x} cy={148} r={48} />
      <LightPool cx={x} cy={150} r={20} />
      <ellipse cx={x} cy={base + 0.8} rx="8" ry="1.8" fill="#000" opacity="0.28" />
      <path d={`M${x} 156 V${base - 2}`} stroke={C.brass} strokeWidth="2" />
      <path d={`M${x + 0.6} 158 V${base - 3}`} stroke="#7a5f12" strokeWidth="0.6" opacity="0.7" />
      <path d={`M${x - 0.5} 158 V${base - 4}`} stroke="#fff3c4" strokeWidth="0.5" opacity="0.6" />
      <ellipse cx={x} cy={base} rx="6" ry="1.8" fill="url(#nx-brass)" stroke="#7a5f12" strokeWidth="0.5" />
      <path d={`M${x - 6} 156 L${x - 9} 156 L${x - 6} 138 H${x + 6} L${x + 9} 156 Z`} fill="url(#nx-tables-shade)" stroke="#a8613f" strokeWidth="0.6" />
      <path d={`M${x - 3} 139 L${x - 4.5} 155.5 M${x} 139 V155.5 M${x + 3} 139 L${x + 4.5} 155.5`} stroke="#c97a55" strokeWidth="0.4" opacity="0.6" />
      <path d={`M${x - 9} 156 H${x + 9}`} stroke="url(#nx-brass)" strokeWidth="1" />
      <ellipse cx={x} cy="156.6" rx="7" ry="1.4" fill="#fff3d0" opacity="0.8" />
    </g>
  );
}

export function TablesWall({ taken }: { taken: boolean }) {
  const snow = seeded(77);
  return (
    <Room>
      <defs>
        <clipPath id="nx-tables-win">
          <rect x="32" y="38" width="236" height="84" rx="9" />
        </clipPath>
        <linearGradient id="nx-tables-cloth" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9e1cd" />
          <stop offset="0.2" stopColor="#fbf6ea" />
          <stop offset="0.5" stopColor="#f4efe2" />
          <stop offset="0.8" stopColor="#fbf6ea" />
          <stop offset="1" stopColor="#e9e1cd" />
        </linearGradient>
        <linearGradient id="nx-tables-drape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece4d0" />
          <stop offset="1" stopColor="#cfc6b0" />
        </linearGradient>
        <linearGradient id="nx-tables-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e8a582" />
          <stop offset="0.45" stopColor="#ffe0c4" />
          <stop offset="1" stopColor="#d98f6c" />
        </linearGradient>
        <linearGradient id="nx-tables-frost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe8f0" stopOpacity="0" />
          <stop offset="1" stopColor="#dfe8f0" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {/* window with the mountains and snow */}
      <rect x="30" y="36" width="240" height="88" rx="10" fill="url(#nx-night)" stroke="url(#nx-brass)" strokeWidth="4" />
      <g clipPath="url(#nx-tables-win)">
        {/* a hidden moon lighting the clouds and the snowfields */}
        <circle cx="222" cy="50" r="26" fill="#c9d6e8" opacity="0.14" filter="url(#at-soft)" />
        <path d="M30 64 Q80 52 130 62 T240 58 T300 62 V40 H30 Z" fill="#2a3850" opacity="0.4" />
        <path d="M34 120 L80 70 L112 100 L150 56 L196 104 L228 78 L266 120 Z" fill="#2c3a52" />
        <path d="M150 56 L138 70 L150 66 L162 72 Z M80 70 L72 80 L84 78 Z" fill="#dfe6ee" />
        <path d="M150 56 L162 72 L168 82 L156 74 Z M228 78 L236 88 L226 86 Z" fill="#8fa2bb" opacity="0.5" />
        {/* lamps along the line, flashing past in the dark */}
        <g className="nx-lights" fill="#ffd98a">
          <circle cx="150" cy="116" r="1.6" />
          <circle cx="150" cy="113" r="1.1" opacity="0.8" />
          <circle cx="150" cy="118" r="2" opacity="0.9" />
        </g>
        {/* snow drifting past the glass */}
        {Array.from({ length: 10 }, (_, i) => (
          <circle
            key={i}
            cx={38 + snow() * 224}
            cy={44 + snow() * 70}
            r={0.6 + snow() * 0.8}
            fill="#f2f6fa"
            opacity={0.5 + snow() * 0.4}
            className="at-mote"
            style={{ animationDelay: `${-snow() * 14}s`, animationDuration: `${8 + snow() * 6}s` }}
          />
        ))}
        {/* frost creeping up from the sill, and a reflection on the glass */}
        <rect x="30" y="96" width="240" height="28" fill="url(#nx-tables-frost)" />
        <path d="M70 38 L92 38 L58 124 L36 124 Z" fill="#fff" opacity="0.045" />
        <path d="M196 38 L206 38 L172 124 L162 124 Z" fill="#fff" opacity="0.035" />
      </g>
      <g className="nx-rain" stroke="#e8eef5" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
        {[54, 92, 130, 168, 206, 244].map((x, i) => (
          <path key={x} d={`M${x} ${48 + (i % 2) * 18} l-2 3`} />
        ))}
      </g>
      <rect x="33" y="39" width="234" height="82" rx="8" fill="none" stroke="#000" strokeWidth="1.5" opacity="0.35" />
      <path d="M33 44 Q33 38.5 40 38.5 H260" stroke="#fff3c4" strokeWidth="0.6" fill="none" opacity="0.5" />
      {/* swagged curtains over the window */}
      <path d="M26 30 H274 V40 Q212 58 150 42 Q88 58 26 40 Z" fill="#7a2d2d" stroke={C.ink} strokeWidth="0.6" />
      <path d="M40 31 Q88 52 120 44 M180 44 Q212 52 260 31 M60 31 Q94 46 112 43 M188 43 Q206 46 240 31" stroke="#4a1616" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M50 31 Q90 49 116 44 M184 44 Q210 49 250 31" stroke="#b25454" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M26 40 Q88 58 150 42 Q212 58 274 40" stroke="url(#nx-brass)" strokeWidth="1.2" fill="none" />
      {[26, 150, 274].map((x) => (
        <path key={x} d={`M${x - 3} 44 h6 l1 8 h-8 z`} fill="url(#nx-brass)" />
      ))}
      {/* the side drapes sway a little with the train */}
      <g className="at-sway" style={{ transformOrigin: "top center", animationDuration: "7s" }}>
        <path d="M22 36 Q30 80 24 128 H34 Q40 80 32 36 Z" fill="#7a2d2d" opacity="0.95" />
        <path d="M28 40 Q33 80 29 126" stroke="#4a1616" strokeWidth="1" fill="none" opacity="0.6" />
      </g>
      <g className="at-sway" style={{ transformOrigin: "top center", animationDuration: "7s", animationDelay: "-2.5s" }}>
        <path d="M278 36 Q270 80 276 128 H266 Q260 80 268 36 Z" fill="#7a2d2d" opacity="0.95" />
        <path d="M272 40 Q267 80 271 126" stroke="#4a1616" strokeWidth="1" fill="none" opacity="0.6" />
      </g>
      {/* chairs, with piping and a napkin each */}
      {[48, 252].map((x) => (
        <g key={x}>
          <rect x={x - 20} y="156" width="44" height="130" rx="8" fill="#000" opacity="0.3" filter="url(#at-soft)" />
          <rect x={x - 22} y="150" width="44" height="130" rx="8" fill="url(#nx-velvet)" stroke={C.ink} />
          <path d={`M${x - 18} 160 Q${x - 19} 200 ${x - 17} 270`} stroke="#6fa58c" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />
          <rect x={x - 16} y="158" width="32" height="56" rx="6" fill="none" stroke="url(#nx-brass)" strokeWidth="0.8" opacity="0.6" />
          <path d={`M${x - 6} 226 l6 -10 l6 10 z`} fill="#f7f2e4" stroke="#b8ad92" strokeWidth="0.6" />
        </g>
      ))}
      {/* the lamps' light falling on the cloth */}
      <Shadow cx={150} cy={292} rx={118} ry={7} opacity={0.5} />
      <Shadow cx={150} cy={362} rx={50} ry={5} opacity={0.6} />
      {/* table */}
      <path d="M40 222 H260 L270 268 H30 Z" fill="url(#nx-tables-cloth)" stroke="#b8ad92" />
      <ellipse cx="62" cy="236" rx="38" ry="12" fill="#ffd9a0" opacity="0.28" filter="url(#at-soft)" />
      <ellipse cx="238" cy="236" rx="38" ry="12" fill="#ffd9a0" opacity="0.28" filter="url(#at-soft)" />
      <path d="M30 268 Q150 280 270 268 V282 Q150 294 30 282 Z" fill="url(#nx-tables-drape)" />
      {/* linen folds in the hanging cloth */}
      <g stroke="#a99f88" strokeWidth="0.7" fill="none" opacity="0.45">
        {[44, 74, 108, 192, 226, 256].map((x) => (
          <path key={x} d={`M${x} ${270 + Math.abs(150 - x) * -0.02 + 2} q2 6 -1 ${12 - Math.abs(150 - x) * 0.01}`} />
        ))}
      </g>
      <path d="M30 268 Q150 280 270 268" stroke="#fffaf0" strokeWidth="0.8" fill="none" opacity="0.8" />
      {/* two table lamps, warm under their silk shades */}
      <TableLamp x={41} base={231} />
      <TableLamp x={259} base={231} />
      <rect x="140" y="282" width="20" height="74" fill={C.walnutDark} />
      <rect x="141.5" y="290" width="3" height="64" fill="#7a5333" opacity="0.6" />
      <rect x="140" y="282" width="20" height="8" fill="#000" opacity="0.35" />
      <path d="M128 356 Q150 346 172 356 Z" fill="url(#nx-brass)" />
      {/* bridge: four hands and a scorecard */}
      <ellipse cx="150" cy="248" rx="38" ry="10" fill="#7a6a4a" opacity="0.18" filter="url(#at-soft)" />
      {[
        [130, 236, -20],
        [150, 232, 0],
        [170, 236, 20],
        [150, 254, 180],
      ].map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
          {[-8, -4, 0, 4, 8].map((dx) => (
            <rect key={dx} x={Number(x) + dx - 4} y={Number(y) - 10} width="8" height="12" rx="1" fill="#fff" stroke="#9a8f78" strokeWidth="0.5" />
          ))}
        </g>
      ))}
      {!taken && <rect x="186" y="244" width="18" height="14" fill="#fffaf0" stroke="#9a8f78" strokeWidth="0.6" transform="rotate(8 195 251)" />}
      {/* name cards */}
      {[112, 188].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="230.6" rx="11" ry="1.4" fill="#000" opacity="0.18" />
          <path d={`M${x - 9} 230 l3 -7 h12 l3 7 z`} fill="#fffaf0" stroke="#9a8f78" strokeWidth="0.6" />
        </g>
      ))}
      {/* sugar bowl and spill */}
      <Shadow cx={72} cy={215} rx={16} ry={2.4} opacity={0.4} />
      <path d="M58 214 Q58 196 72 196 Q86 196 86 214 Z" fill="#e8eef2" stroke="#9aa6ad" />
      <path d="M62 210 Q62 200 68 198" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.8" strokeLinecap="round" />
      <path d="M82 200 Q85 206 84 212" stroke="#8a969d" strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="72" cy="196" rx="14" ry="3" fill="#cfd8dc" />
      <ellipse cx="94" cy="218" rx="6" ry="1.6" fill="#ffffff" opacity="0.9" />
      {/* a single rose in a silver bud vase */}
      <ellipse cx="150" cy="222.6" rx="6" ry="1.2" fill="#000" opacity="0.3" />
      <path d="M146 222 Q144 204 148 190 H152 Q156 204 154 222 Z" fill="#cfd6db" stroke="#8a949b" strokeWidth="0.8" />
      <path d="M147.6 218 Q146.4 205 149 193" stroke="#fff" strokeWidth="0.9" fill="none" opacity="0.75" />
      <path d="M150 190 Q148 172 150 158" stroke="#3f6b3a" strokeWidth="1.5" fill="none" />
      <path d="M150 176 q-8 -2 -10 -8 q8 0 10 6" fill="#3f6b3a" />
      <path d="M150 170 q6 -1 9 -6 q-7 -1 -9 4" fill="#3f6b3a" />
      <path d="M144 156 Q150 144 156 156 Q154 162 150 162 Q146 162 144 156 Z" fill="#b3242a" stroke="#7a1a1e" strokeWidth="0.6" />
      <path d="M147 154 Q150 150 153 154" stroke="#7a1a1e" strokeWidth="0.8" fill="none" />
      <path d="M145.6 155 Q147 150 149.6 149" stroke="#e05a5a" strokeWidth="0.7" fill="none" opacity="0.6" />
      {/* champagne coupe */}
      <ellipse cx="236" cy="208.4" rx="9" ry="1.5" fill="#000" opacity="0.28" />
      <path d="M222 172 Q236 190 250 172 Z" fill="#f2e4b0" stroke="#b8ad92" opacity="0.9" />
      <path d="M236 182 V206 M228 208 H244" stroke="#b8ad92" strokeWidth="1.5" />
      <path d="M235.4 184 V205" stroke="#fff" strokeWidth="0.5" opacity="0.7" />
      <path d="M225 174 Q229 180 235 181.4" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.75" />
      <g fill="#fffbe6" opacity="0.8">
        <circle cx="233" cy="178" r="0.5" />
        <circle cx="238" cy="176.4" r="0.45" />
        <circle cx="236" cy="180" r="0.4" />
      </g>
      <path d="M244 172 q2 3 -1 5" stroke="#a3302a" strokeWidth="2" fill="none" />
      <Grain opacity={0.06} />
      <Vignette />
    </Room>
  );
}

// ---------------------------------------------------------------- the kitchen end

export function KitchenWall({ flags }: { flags: string[] }) {
  const t = useT();
  const open = flags.includes("dumbwaiter.open");
  const raised = flags.includes("dumbwaiter.raised");
  const sway = seeded(23);
  return (
    <Room>
      <defs>
        <linearGradient id="nx-kitchen-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#3a2412" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="nx-kitchen-tin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a949b" />
          <stop offset="0.35" stopColor="#e2e8ec" />
          <stop offset="1" stopColor="#5f6870" />
        </linearGradient>
        <radialGradient id="nx-kitchen-copper" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f0a868" />
          <stop offset="0.5" stopColor="#b8642e" />
          <stop offset="1" stopColor="#6e3418" />
        </radialGradient>
      </defs>
      {/* chalk menu */}
      <rect x="32" y="54" width="120" height="142" rx="4" fill="#000" opacity="0.35" filter="url(#at-soft)" />
      <rect x="30" y="50" width="120" height="142" rx="4" fill="#1d2420" stroke="url(#nx-brass)" strokeWidth="3" />
      {/* old chalk, wiped and rewritten */}
      <ellipse cx="80" cy="128" rx="40" ry="30" fill="#dfe6df" opacity="0.06" filter="url(#at-soft)" />
      <ellipse cx="118" cy="168" rx="22" ry="10" fill="#dfe6df" opacity="0.05" filter="url(#at-soft)" />
      <path d="M33 52.5 H147" stroke="#fff3c4" strokeWidth="0.6" opacity="0.5" />
      <text x="90" y="72" textAnchor="middle" fontSize="11" fill="#e8e4d8" fontFamily="'Segoe Script', 'Brush Script MT', cursive">
        {t("train.sign.tonight")}
      </text>
      <g stroke="#cfcab9" strokeWidth="1" opacity="0.8">
        {[86, 100, 114, 128].map((y) => (
          <path key={y} d={`M44 ${y} H${118 + (y % 3) * 6}`} strokeDasharray="5 2" />
        ))}
        <path d="M44 162 H136" strokeDasharray="3 2" />
        <path d="M44 174 H110" strokeDasharray="3 2" />
      </g>
      {/* the chalk ledge, with a stub of chalk */}
      <rect x="34" y="189" width="112" height="3" rx="1" fill="#5c4710" />
      <rect x="120" y="186.6" width="9" height="2.6" rx="1.2" fill="#f4f1e8" />
      {/* dumbwaiter hatch */}
      <Shadow cx={92} cy={314} rx={54} ry={4} opacity={0.5} />
      <rect x="40" y="218" width="104" height="92" rx="3" fill={open ? "#090604" : C.walnutDark} stroke="url(#nx-brass)" strokeWidth="2" />
      {open ? (
        <g>
          {/* the shaft: dark, with the lift's cables going down, and a faint warmth from the kitchen below */}
          <rect x="42" y="220" width="100" height="88" fill="url(#nx-kitchen-shaft)" />
          <path d="M70 220 V308 M114 220 V308" stroke="#4a4038" strokeWidth="0.8" opacity="0.8" />
          <ellipse cx="92" cy="310" rx="44" ry="10" fill="#e8823a" opacity="0.1" filter="url(#at-soft)" />
          {raised && (
            <g>
              <rect x="50" y="250" width="84" height="56" fill="#5a3a22" stroke={C.ink} />
              <rect x="50" y="250" width="84" height="56" fill="url(#nx-grain)" opacity="0.6" />
              <path d="M50 250 H134" stroke="url(#nx-brass)" strokeWidth="2" />
              <path d="M78 246 q8 -12 20 -8 q12 2 10 10 z" fill="#efe6d2" stroke="#b8ad92" />
              <circle cx="96" cy="244" r="2.5" fill="#3a5cc9" />
            </g>
          )}
          <path d="M40 218 L24 210 V318 L40 310" fill="#3d2615" stroke={C.ink} />
          <path d="M26 212 V316" stroke="#7a5333" strokeWidth="0.8" opacity="0.6" />
        </g>
      ) : (
        <g>
          <rect x="40" y="218" width="104" height="92" rx="3" fill="url(#nx-grain)" opacity="0.7" />
          <rect x="52" y="230" width="80" height="68" rx="2" fill="none" stroke={C.walnutLine} />
          <path d="M53 297 V231 H131" stroke="#a87a50" strokeWidth="0.6" fill="none" opacity="0.5" />
          <path d="M131 231 V297 H53" stroke="#140a04" strokeWidth="0.8" fill="none" opacity="0.6" />
          <circle cx="126" cy="264" r="4" fill="url(#nx-brass)" />
          <circle cx="125" cy="263" r="1.2" fill="#fff6d0" opacity="0.8" />
        </g>
      )}
      {/* steam escaping round the top of the kitchen door, curling up past the pans */}
      <Steam x={200} y={70} seed={5} n={2} opacity={0.3} />
      <Steam x={250} y={70} seed={9} n={2} opacity={0.28} />
      {/* copper pans on a rail, swinging gently with the train */}
      <path d="M160 35 H288" stroke="url(#nx-brass)" strokeWidth="2" />
      {[
        [178, 7],
        [206, 8.5],
        [236, 6.5],
        [264, 7.5],
      ].map(([x, r]) => (
        <g key={x} className="at-sway" style={{ transformOrigin: "top center", animationDelay: `${-sway() * 6}s`, animationDuration: `${5 + sway() * 2}s` }}>
          <circle cx={x} cy="37" r="1.6" fill="none" stroke="#5c4710" strokeWidth="1" />
          <path d={`M${x} 39 V${50 - r}`} stroke="#3d2615" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={x} cy={58 - r + 2} r={r + 1.2} fill="#7a3a1a" />
          <circle cx={x} cy={58 - r + 2} r={r} fill="url(#nx-kitchen-copper)" />
          <path d={`M${x - r * 0.6} ${58 - r * 0.4} A${r * 0.7} ${r * 0.7} 0 0 1 ${x + r * 0.2} ${58 - r * 0.7}`} stroke="#f0b27a" strokeWidth="1.2" fill="none" opacity="0.7" />
          <circle cx={x - r * 0.35} cy={58 - r * 0.55} r="0.9" fill="#fff3d0" opacity="0.8" />
        </g>
      ))}
      {/* fire bucket */}
      <Shadow cx={161} cy={317} rx={10} ry={2} opacity={0.5} />
      <path d="M152 290 H170 L167 316 H155 Z" fill="#a3302a" stroke="#5a1a16" strokeWidth="0.8" />
      <path d="M154.4 292 L156.4 314" stroke="#e8705a" strokeWidth="1" opacity="0.5" />
      <path d="M152 290 Q161 280 170 290" stroke={C.ink} strokeWidth="1" fill="none" />
      <text x="161" y="306" textAnchor="middle" fontSize="4" fill="#efe6d2" fontFamily="Georgia, serif">
        FEU
      </text>
      {/* a churn of milk waiting for breakfast */}
      <Shadow cx={161} cy={356} rx={10} ry={2} opacity={0.55} />
      <path d="M154 356 V336 Q154 332 157 330 V326 H165 V330 Q168 332 168 336 V356 Z" fill="url(#nx-kitchen-tin)" stroke="#4c545b" strokeWidth="0.6" />
      <rect x="155.6" y="323" width="10.8" height="3.4" rx="1" fill="#9aa4ab" stroke="#4c545b" strokeWidth="0.5" />
      <path d="M154 344 H168" stroke="#4c545b" strokeWidth="0.6" />
      {/* a crate of oranges */}
      <Shadow cx={90} cy={357} rx={60} ry={3} opacity={0.6} />
      <rect x="34" y="324" width="112" height="32" fill="#a77a48" stroke="#5a3b20" />
      <path d="M40 327 q30 3 60 0 t40 1 M38 338 q36 2 70 -1 t34 1 M38 350 q30 2 60 0 t44 1" stroke="#7a5430" strokeWidth="0.4" fill="none" opacity="0.6" />
      <path d="M34 334 H146 M34 345 H146" stroke="#5a3b20" strokeWidth="0.8" />
      <rect x="34" y="324" width="112" height="3" fill="#000" opacity="0.2" />
      <text x="90" y="343" textAnchor="middle" fontSize="6" fill="#3d2615" fontFamily="Georgia, serif" letterSpacing="1">
        FINEST SEVILLE
      </text>
      {[44, 56, 68, 80, 92, 104, 116, 128, 138].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={322 - (i % 2) * 3} r="6" fill={i === 4 ? "#f0a040" : "#e8862a"} stroke="#b8601a" strokeWidth="0.5" />
          <circle cx={x - 2} cy={320 - (i % 2) * 3} r="1.4" fill="#ffd8a0" opacity="0.7" />
        </g>
      ))}
      <path d="M86 316 a5 5 0 0 0 8 0" fill="#f7e4c0" />
      <rect x="120" y="328" width="18" height="12" fill="#f7f2e4" transform="rotate(6 129 334)" />
      <circle cx="122" cy="329.4" r="0.9" fill="#7a5f12" />
      <rect x="150" y="262" width="12" height="12" rx="2" fill="#1b120b" stroke="url(#nx-brass)" />
      <rect x="153" y="265" width="6" height="6" fill="#090604" />
      {/* kitchen door */}
      <rect x="179" y="74" width="98" height="286" rx="3" fill="#000" opacity="0.35" filter="url(#at-soft)" />
      <rect x="176" y="70" width="98" height="286" rx="3" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
      <rect x="177" y="71" width="96" height="284" fill="url(#nx-grain)" opacity="0.9" />
      <path d="M178 72 V354" stroke="#a87a50" strokeWidth="0.8" opacity="0.35" />
      {/* the lower panel and a brass kick plate */}
      <rect x="186" y="262" width="78" height="66" rx="2" fill="none" stroke={C.walnutLine} />
      <path d="M187 327 V263 H263" stroke="#a87a50" strokeWidth="0.6" fill="none" opacity="0.4" />
      <rect x="180" y="336" width="90" height="16" rx="1" fill="url(#nx-brass)" opacity="0.8" />
      <path d="M181 337.4 H269" stroke="#fff3c4" strokeWidth="0.5" opacity="0.6" />
      {/* a sliver of firelight under the door */}
      <path d="M180 356.6 H270" stroke="#ffb45a" strokeWidth="1" opacity="0.7" />
      <ellipse cx="225" cy="364" rx="46" ry="6" fill="#ffb45a" opacity="0.22" filter="url(#at-soft)" />
      <LightPool cx={225} cy={120} r={44} opacity={0.8} flicker />
      <circle cx="225" cy="120" r="22" fill="#2a1f14" stroke="url(#nx-brass)" strokeWidth="3" />
      {/* through the porthole: a stove's glow and the cook asleep under his hat */}
      <circle cx="225" cy="120" r="19" fill="#3a2a18" />
      <circle cx="214" cy="112" r="7" fill="#e8823a" opacity="0.35" className="at-flicker" />
      <circle cx="214" cy="114" r="11" fill="#e8823a" opacity="0.12" className="at-flicker" style={{ animationDelay: "-1.3s" }} />
      <path d="M212 134 Q225 122 240 132 L240 138 H212 Z" fill="#e8e0cc" opacity="0.8" />
      <path d="M226 124 q-4 -10 6 -12 q8 2 4 12 z" fill="#f7f2e4" />
      <path d="M216 108 q10 -6 18 0" stroke="#c97a3a" strokeWidth="2" fill="none" />
      <path d="M210 104 Q218 100 222 106" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M232 131 A13 13 0 0 0 238 118" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M205 118 A20 20 0 0 1 215 103" stroke="#fff3c4" strokeWidth="1" fill="none" opacity="0.55" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={225 + 22 * Math.cos((a * Math.PI) / 180)} cy={120 + 22 * Math.sin((a * Math.PI) / 180)} r="1.2" fill="#7a5f12" />
      ))}
      <rect x="187" y="188" width="78" height="20" rx="2" fill="#000" opacity="0.35" />
      <rect x="186" y="186" width="78" height="20" rx="2" fill={C.cream} />
      <text x="225" y="199" textAnchor="middle" fontSize="6.5" fill={C.ink} fontFamily="Georgia, serif" letterSpacing="0.5">
        {t("train.sign.kitchenClosed")}
      </text>
      <rect x="253" y="232" width="8" height="24" rx="3" fill="#000" opacity="0.35" />
      <rect x="252" y="230" width="8" height="24" rx="3" fill="url(#nx-brass)" />
      <path d="M254 233 V251" stroke="#fff6d0" strokeWidth="0.9" opacity="0.7" strokeLinecap="round" />
      <Grain opacity={0.06} />
      <Vignette />
    </Room>
  );
}

// ---------------------------------------------------------------- the lounge end

const STOLE = "M210 92 Q232 84 254 92 Q262 150 250 220 Q236 236 222 222 Q206 160 210 92 Z";

export function LoungeWall({ flags }: { flags: string[] }) {
  const searched = flags.includes("stole.searched");
  const fur = seeded(55);
  return (
    <Room>
      <defs>
        <clipPath id="nx-lounge-stole">
          <path d={STOLE} />
        </clipPath>
        <clipPath id="nx-lounge-photo">
          <rect x="44" y="44" width="90" height="62" />
        </clipPath>
        <linearGradient id="nx-lounge-furshade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#3a3a46" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="nx-lounge-cab" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6a3f24" />
          <stop offset="0.3" stopColor="#4a2a18" />
          <stop offset="1" stopColor="#2e190d" />
        </linearGradient>
      </defs>
      {/* silk wallpaper stripes above the dado */}
      <g fill="#7a5333" opacity="0.18">
        {Array.from({ length: 14 }, (_, i) => 14 + i * 20).map((x) => (
          <rect key={x} x={x} y="28" width="8" height="220" />
        ))}
      </g>
      <g fill="#e8c48a" opacity="0.05">
        {Array.from({ length: 14 }, (_, i) => 14 + i * 20).map((x) => (
          <rect key={x} x={x} y="28" width="1.2" height="220" />
        ))}
      </g>
      {/* the sconce's warm light washing the wall */}
      <LightPool cx={150} cy={118} r={80} flicker />
      <LightPool cx={150} cy={118} r={34} />
      <ellipse cx="150" cy="190" rx="44" ry="80" fill="#ffd98a" opacity="0.1" filter="url(#at-softer)" />
      {/* a framed photograph of the Nightingale on her first run */}
      <rect x="38" y="39" width="106" height="78" rx="2" fill="#000" opacity="0.45" filter="url(#at-soft)" />
      <rect x="36" y="36" width="106" height="78" rx="2" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="2" />
      <rect x="44" y="44" width="90" height="62" fill="#c8b48a" />
      <path d="M44 92 H134" stroke="#7a6444" strokeWidth="1" />
      <path d="M52 92 V76 H86 V70 H98 V76 L112 82 V92 Z" fill="#4a3a28" />
      <rect x="56" y="64" width="8" height="12" fill="#4a3a28" />
      <circle cx="62" cy="58" r="7" fill="#e8dcc0" opacity="0.8" />
      <circle cx="70" cy="50" r="6" fill="#e8dcc0" opacity="0.7" />
      {[60, 72, 84, 96].map((x) => (
        <circle key={x} cx={x} cy="96" r="1.8" fill="#4a3a28" />
      ))}
      {[60, 72, 84, 96].map((x) => (
        <path key={x} d={`M${x} 98 V104`} stroke="#4a3a28" strokeWidth="2" />
      ))}
      <circle cx="122" cy="96" r="1.8" fill="#4a3a28" />
      <path d="M122 98 V104" stroke="#4a3a28" strokeWidth="2" />
      {/* sepia toning darkening at the edges, and the glass catching the sconce */}
      <rect x="44" y="44" width="90" height="62" fill="none" stroke="#6a5030" strokeWidth="3" opacity="0.3" />
      <g clipPath="url(#nx-lounge-photo)">
        <path d="M104 44 L122 44 L96 106 L78 106 Z" fill="#fff" opacity="0.1" />
        <path d="M126 44 L131 44 L105 106 L100 106 Z" fill="#fff" opacity="0.07" />
      </g>
      <path d="M37.5 37.5 H140.5" stroke="#fff3c4" strokeWidth="0.6" opacity="0.5" />
      <rect x="60" y="108" width="58" height="4" fill="url(#nx-brass)" />
      {/* gramophone */}
      <Shadow cx={96} cy={286} rx={58} ry={4} opacity={0.6} />
      <rect x="44" y="214" width="104" height="70" rx="4" fill="url(#nx-lounge-cab)" stroke={C.ink} />
      <rect x="45" y="215" width="102" height="68" rx="3" fill="url(#nx-grain)" opacity="0.8" />
      <rect x="54" y="226" width="84" height="48" rx="3" fill="none" stroke="#7a5333" strokeWidth="0.8" opacity="0.7" />
      <path d="M55 273 V227 H137" stroke="#b0784a" strokeWidth="0.5" fill="none" opacity="0.5" />
      <rect x="52" y="200" width="88" height="16" rx="2" fill="#5b3a22" stroke={C.ink} />
      <path d="M53 201.4 H139" stroke="#c08a5a" strokeWidth="0.6" opacity="0.6" />
      <ellipse cx="96" cy="200" rx="30" ry="6" fill="#111" />
      <ellipse cx="96" cy="200" rx="22" ry="4.2" fill="none" stroke="#2a2a2a" strokeWidth="0.6" />
      <path d="M74 198.4 Q84 195.6 96 195.6" stroke="#8a8a8a" strokeWidth="0.8" fill="none" opacity="0.6" />
      <ellipse cx="96" cy="200" rx="5" ry="1.2" fill="#8a2c1f" />
      <path d="M118 198 L130 170" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M128 172 Q118 140 76 132 Q60 150 72 172 Q100 168 128 172 Z" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M76 134 Q66 150 74 168" stroke="#5c4710" strokeWidth="2.4" fill="none" opacity="0.45" />
      <path d="M124 166 Q114 144 82 136" stroke="#fff6d0" strokeWidth="1.2" fill="none" opacity="0.55" strokeLinecap="round" />
      {/* records */}
      <Shadow cx={96} cy={346} rx={52} ry={3.5} opacity={0.6} />
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={52 + i * 4} y={292 - i * 2} width="80" height="52" rx="2" fill={["#c9b48a", "#8a2c1f", "#2f4a6b", "#c9a227", "#efe6d2"][i]} stroke={C.ink} strokeWidth="0.6" />
        ))}
        <path d="M69 285 H147" stroke="#fff" strokeWidth="0.6" opacity="0.45" />
        <circle cx="108" cy="312" r="12" fill="#111" />
        <circle cx="108" cy="312" r="8" fill="none" stroke="#2c2c2c" strokeWidth="0.6" />
        <path d="M99 306 A11 11 0 0 1 108 301" stroke="#9a9a9a" strokeWidth="0.8" fill="none" opacity="0.6" />
        <circle cx="108" cy="312" r="3" fill="#c9a227" />
      </g>
      {/* coat stand and fur stole */}
      <Shadow cx={232} cy={350} rx={26} ry={3} opacity={0.6} />
      <path d="M232 70 V346 M210 346 H254" stroke="url(#nx-brass)" strokeWidth="4" />
      <path d="M231 72 V344" stroke="#fff3c4" strokeWidth="0.8" opacity="0.5" />
      <path d="M232 80 L212 92 M232 80 L252 92" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d={STOLE} fill="#000" opacity="0.3" transform="translate(3 4)" filter="url(#at-soft)" />
      <g className="at-sway" style={{ transformOrigin: "top center", animationDuration: "8s" }}>
        <path d={STOLE} fill="#cfcfd4" stroke="#8f8f99" />
        <g clipPath="url(#nx-lounge-stole)">
          <rect x="206" y="84" width="58" height="150" fill="url(#nx-lounge-furshade)" />
          <g fill="none" strokeLinecap="round">
            {Array.from({ length: 56 }, (_, i) => {
              const x = 208 + fur() * 50;
              const y = 90 + fur() * 136;
              const l = 2 + fur() * 3;
              return <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)} q${((fur() - 0.5) * 1.6).toFixed(1)} ${(l / 2).toFixed(1)} ${((fur() - 0.2) * 1.6).toFixed(1)} ${l.toFixed(1)}`} stroke={i % 3 ? "#f4f4f7" : "#a3a3ae"} strokeWidth={i % 3 ? 1.1 : 0.7} opacity={i % 3 ? 0.32 : 0.4} />;
            })}
          </g>
        </g>
        <path d={STOLE} fill="none" stroke="#e4e4e9" strokeWidth="3" opacity="0.35" />
        <path d="M216 120 q16 8 32 0 M218 160 q14 8 28 0 M222 196 q10 6 20 0" stroke="#a9a9b2" fill="none" />
        {!searched && <ellipse cx="236" cy="206" rx="8" ry="5" fill="#a9a9b2" />}
      </g>
      <Sconce x={150} />
      {/* a smoker's stand: a cigar left burning, and a cognac half drunk */}
      <Shadow cx={22} cy={357} rx={12} ry={2} opacity={0.6} />
      <path d="M22 300 V354 M14 356 H30" stroke="url(#nx-brass)" strokeWidth="2.4" />
      <ellipse cx="22" cy="354.6" rx="8" ry="2" fill="url(#nx-brass)" />
      <ellipse cx="22" cy="300" rx="11" ry="3" fill="url(#nx-brass)" stroke="#7a5f12" strokeWidth="0.6" />
      <ellipse cx="20" cy="299.6" rx="5" ry="1.4" fill="#3a2a1c" />
      <path d="M14 299 L22 297.6" stroke="#5a3a1e" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="299" r="1" fill="#ff8a3a" className="at-flicker" />
      <path d="M27 298.6 Q25 293 27.6 290 H31.4 Q34 293 32 298.6 Z" fill="#d9e3e8" opacity="0.35" stroke="#c6d2d8" strokeWidth="0.4" />
      <path d="M25.6 294.6 Q29.5 296.4 33.4 294.6 Q33 298 29.5 298.4 Q26 298 25.6 294.6 Z" fill="#a8582a" opacity="0.8" />
      <path d="M28.4 291 V296" stroke="#fff" strokeWidth="0.5" opacity="0.7" />
      <Smoke x={13} y={297} h={70} seed={31} opacity={0.3} />
      {/* the potted palm */}
      <Shadow cx={182} cy={356} rx={18} ry={2.4} opacity={0.6} />
      <g className="at-sway" style={{ animationDuration: "9s" }}>
        <g stroke="#3f6b3a" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M182 318 Q176 290 160 270" />
          <path d="M182 318 Q184 284 196 262" />
          <path d="M182 318 Q190 300 206 292" />
          <path d="M182 318 Q170 304 158 300" />
          <path d="M182 318 Q182 290 182 266" />
        </g>
        <g fill="#4f7d45">
          <path d="M160 270 q6 4 8 12 q-8 -2 -8 -12 z" />
          <path d="M196 262 q-2 8 -10 10 q2 -8 10 -10 z" />
          <path d="M206 292 q-6 4 -14 2 q6 -6 14 -2 z" />
          <path d="M158 300 q8 -2 12 4 q-8 2 -12 -4 z" />
          <path d="M182 266 q4 6 0 12 q-4 -6 0 -12 z" />
        </g>
        {/* going a little yellow at the tips */}
        <g fill="#b9a64a" opacity="0.85">
          <circle cx="160.6" cy="271" r="1.2" />
          <circle cx="195.4" cy="263" r="1.2" />
          <circle cx="205" cy="292.6" r="1.1" />
        </g>
      </g>
      <path d="M166 318 H198 L194 354 H170 Z" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M168 330 H196" stroke="#7a5f12" strokeWidth="1" />
      <path d="M170 320 L173 352" stroke="#fff6d0" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      {/* the rug */}
      <path d="M40 362 H260 L270 392 H30 Z" fill="#2f4a6b" opacity="0.85" />
      <path d="M50 368 H250 L256 386 H44 Z" fill="none" stroke={C.brass} strokeWidth="1" opacity="0.6" />
      <path d="M150 370 L170 377 L150 384 L130 377 Z" fill="none" stroke={C.brass} strokeWidth="0.8" opacity="0.45" />
      <path d="M40 362 H260 L270 392 H30 Z" fill="url(#nx-floorShade)" opacity="0.5" />
      <ellipse cx="150" cy="374" rx="90" ry="10" fill="#ffd98a" opacity="0.08" filter="url(#at-soft)" />
      <Grain opacity={0.06} />
      <Vignette />
    </Room>
  );
}

/** Transparent tap shapes in the drawing's coordinates: they stay on their objects even when the wall is letterboxed. */
