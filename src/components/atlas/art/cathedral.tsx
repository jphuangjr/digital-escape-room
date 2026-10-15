import { BRASS, BRASS_DK, BRASS_HI, Candle, Dust, FloorShade, GlyphRing, Grain, LightPool, Mottle, Shadow, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Null Cathedral

/** A pointed arch opening, from its springing line up. */
function arch(x: number, w: number, spring: number, bottom: number, peak: number) {
  const l = x - w / 2;
  const r = x + w / 2;
  return `M${l} ${bottom} V${spring} Q${l} ${spring - (spring - peak) * 0.75} ${x} ${peak} Q${r} ${spring - (spring - peak) * 0.75} ${r} ${spring} V${bottom}`;
}

/** The vault of the Cathedral: violet-black, arcades fading back into the dark, a polished floor. */
function Vault({ id, floorY = 330 }: { id: string; floorY?: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05030a" />
          <stop offset="0.55" stopColor="#1b1328" />
          <stop offset="1" stopColor="#0c0814" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1424" />
          <stop offset="1" stopColor="#07050b" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${id}-wall)`} />
      <rect width="300" height={floorY} fill="url(#at-stone)" opacity="0.35" />
      <Mottle h={floorY} opacity={0.5} />
      {/* the far arcade, small and faint, deep in the dark */}
      <g fill="none" stroke="#2c2340" strokeWidth="3" opacity="0.6">
        {[90, 130, 170, 210].map((x) => (
          <path key={x} d={arch(x, 34, 210, floorY, 150)} />
        ))}
      </g>
      {/* the nearer arcade, taller, fading upward into nothing */}
      <g fill="none" stroke="#2a2238" strokeWidth="6">
        {[40, 150, 260].map((x) => (
          <path key={x} d={arch(x, 80, 120, floorY, 24)} />
        ))}
      </g>
      <g fill="none" stroke="#4a3d66" strokeWidth="1" opacity="0.5">
        {[40, 150, 260].map((x) => (
          <path key={x} d={arch(x, 74, 122, floorY, 30)} />
        ))}
      </g>
      <rect width="300" height="120" fill="#05030a" opacity="0.55" filter="url(#at-softer)" />
      {/* the floor: dark polished stone, the nave running away */}
      <rect y={floorY} width="300" height={400 - floorY} fill={`url(#${id}-floor)`} />
      <path d={`M0 ${floorY} H300`} stroke="#000" strokeOpacity="0.6" strokeWidth="2" />
      <g stroke="#000" strokeOpacity="0.4">
        {[-280, -120, 0, 100, 200, 300, 420, 580].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.35} ${floorY} L${x} 400`} />
        ))}
        <path d={`M0 ${floorY + 16} H300 M0 ${floorY + 40} H300`} />
      </g>
      <FloorShade floorY={floorY} />
    </>
  );
}

/** A clustered pier at the edge of the view, its inner face lit. */
function Pier({ x, w, lit, side }: { x: number; w: number; lit: string; side: "l" | "r" }) {
  const edge = side === "l" ? x + w - 4 : x;
  return (
    <g>
      <rect x={x} y="0" width={w} height="400" fill="#0a0710" />
      <rect x={x + w * 0.3} y="0" width={w * 0.4} height="400" fill="#120d1a" />
      <rect x={edge} y="0" width="4" height="400" fill={lit} opacity="0.35" />
      <rect x={x - 4} y="356" width={w + 8} height="44" fill="#0d0914" />
      <path d={`M${x - 4} 356 H${x + w + 4}`} stroke={lit} strokeOpacity="0.3" />
    </g>
  );
}

export function CathedralNave({ s }: { s: WallState }) {
  const convened = s.flags.includes("core.convened");
  const rerouted = s.flags.includes("core.rerouted");
  const heart = rerouted ? "#9ff3e4" : "#f0d98a";
  const dur = convened ? 40 : 18;
  return (
    <>
      <Vault id="at-nave" />
      {/* the Core's light washing the vault */}
      <LightPool cx={150} cy={190} r={130} color={rerouted ? "#7fe6d6" : "#b9a0ff"} opacity={convened ? 0.22 : 0.14} />
      {/* chains hanging out of the dark, holding nothing now */}
      <g stroke="#2e2640" strokeWidth="1.5" strokeDasharray="3 2" fill="none">
        <path d="M74 0 V112" className="at-sway" />
        <path d="M228 0 V96" className="at-sway" style={{ animationDelay: "-2s" }} />
      </g>
      <path d="M70 112 h8 l-2 6 h-4 z M224 96 h8 l-2 6 h-4 z" fill="#3a3050" />

      {/* a dais under the Core, and its reflection in the floor */}
      <ellipse cx="150" cy="342" rx="96" ry="12" fill={rerouted ? "#9ff3e4" : "#e8d8ff"} opacity="0.12" filter="url(#at-soft)" />
      <Shadow cx={150} cy={336} rx={84} ry={8} opacity={0.6} />
      <path d="M78 330 L92 316 H208 L222 330 Z" fill="#1c1628" />
      <path d="M92 316 H208" stroke="#6a5a8a" strokeOpacity="0.5" />
      <path d="M104 316 L112 304 H188 L196 316 Z" fill="#251d34" />
      <path d="M112 304 H188" stroke="#8a7aaa" strokeOpacity="0.5" />
      {/* a thread of light from the Core down to the dais */}
      <path d="M146 210 L154 210 L160 304 H140 Z" fill={heart} opacity="0.12" filter="url(#at-soft)" className="at-breathe" />

      {/* the Atlas Core: a sphere of turning rings */}
      <circle cx="150" cy="190" r="110" fill="url(#at-teal-glow)" opacity={convened ? 0.5 : 0.3} />
      {/* the fixed meridian frame */}
      <circle cx="150" cy="190" r="100" fill="none" stroke="#120d1a" strokeWidth="8" />
      <circle cx="150" cy="190" r="100" fill="none" stroke="url(#at-brass)" strokeWidth="5" />
      <circle cx="150" cy="190" r="100" fill="none" stroke={BRASS_DK} strokeWidth="1" strokeDasharray="1 5" opacity="0.8" />
      <path d="M150 80 V90 M150 290 V300" stroke="url(#at-brass)" strokeWidth="6" />
      <circle cx="150" cy="88" r="4" fill="url(#at-brass-ball)" />
      <circle cx="150" cy="292" r="4" fill="url(#at-brass-ball)" />
      {/* the turning rings: no filters inside, so they spin cheaply */}
      <g className="at-spin" style={{ animationDuration: `${dur}s` }}>
        <ellipse cx="150" cy="190" rx="90" ry="90" fill="none" stroke="url(#at-brass)" strokeWidth="4" />
        <ellipse cx="150" cy="190" rx="90" ry="30" fill="none" stroke="url(#at-brass)" strokeWidth="3" />
        <ellipse cx="150" cy="190" rx="90" ry="30" fill="none" stroke={BRASS_HI} strokeWidth="0.8" strokeDasharray="2 6" opacity="0.7" />
        <ellipse cx="150" cy="190" rx="30" ry="90" fill="none" stroke="url(#at-brass)" strokeWidth="3" />
        <ellipse cx="150" cy="190" rx="30" ry="90" fill="none" stroke={BRASS_HI} strokeWidth="0.8" strokeDasharray="2 6" opacity="0.7" />
      </g>
      <g className="at-spin" style={{ animationDuration: `${dur * 1.6}s`, animationDirection: "reverse" }}>
        <ellipse cx="150" cy="190" rx="70" ry="70" fill="none" stroke={rerouted ? "#9ff3e4" : BRASS_DK} strokeWidth="2" transform="rotate(45 150 190)" />
        {/* the broad ecliptic band, tilted */}
        <ellipse cx="150" cy="190" rx="96" ry="34" fill="none" stroke="#120d1a" strokeWidth="8" opacity="0.6" transform="rotate(-23 150 190)" />
        <ellipse cx="150" cy="190" rx="96" ry="34" fill="none" stroke="url(#at-brass)" strokeWidth="6" transform="rotate(-23 150 190)" />
        <ellipse cx="150" cy="190" rx="96" ry="34" fill="none" stroke={BRASS_DK} strokeWidth="1" strokeDasharray="1 4" transform="rotate(-23 150 190)" />
      </g>
      {/* the heart */}
      <circle cx="150" cy="190" r="34" fill="url(#at-glow)" />
      <circle cx="150" cy="190" r="22" fill={heart} opacity="0.3" className="at-pulse" />
      <circle cx="150" cy="190" r="16" fill={heart} />
      <circle cx="145" cy="185" r="6" fill="#fffbe8" opacity="0.7" />
      <Dust x={50} y={90} w={200} h={210} count={18} color={rerouted ? "#d8fff8" : "#f4e8ff"} seed={71} />

      {/* the nearest piers frame the view */}
      <Pier x={-6} w={30} lit="#b9a6ff" side="l" />
      <Pier x={276} w={30} lit="#b9a6ff" side="r" />
      {/* the ends of the last pews, either side of the nave */}
      {[
        [28, 92],
        [208, 272],
      ].map(([a, b]) => (
        <g key={a}>
          <Shadow cx={(a + b) / 2} cy={398} rx={40} ry={5} />
          <path d={`M${a} 400 V364 Q${a} 356 ${a + 8} 356 H${b - 8} Q${b} 356 ${b} 364 V400 Z`} fill="#130d1b" />
          <path d={`M${a + 4} 357 H${b - 4}`} stroke="#6a5a8a" strokeWidth="1.2" opacity="0.6" />
          <path d={`M${a} 376 H${b}`} stroke="#07050b" strokeWidth="4" />
        </g>
      ))}
      <path d="M108 362 l22 -3 l3 12 l-22 3 z" fill="#d8ccb0" opacity="0.45" />
      <path d="M160 376 l18 2 l-1 10 l-18 -2 z" fill="#d8ccb0" opacity="0.35" />
      <Grain opacity={0.09} />
      <Vignette />
    </>
  );
}

export function CathedralDoor() {
  return (
    <>
      <Vault id="at-door" />
      <defs>
        <radialGradient id="at-door-void" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#140c22" />
          <stop offset="0.8" stopColor="#050308" />
          <stop offset="1" stopColor="#020104" />
        </radialGradient>
        <linearGradient id="at-door-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3050" />
          <stop offset="1" stopColor="#140f1e" />
        </linearGradient>
      </defs>
      {/* the great door behind the gate: a tall pointed arch of black stone, shut */}
      <path d={arch(215, 120, 140, 330, 40)} fill="#0a0710" />
      <path d={arch(215, 120, 140, 330, 40)} fill="none" stroke="#2a2238" strokeWidth="8" />
      <path d={arch(215, 104, 144, 330, 54)} fill="none" stroke="#1a1426" strokeWidth="3" />
      <path d="M215 60 V330" stroke="#000" strokeOpacity="0.5" strokeWidth="2" />

      {/* the black gate home: its rings standing still */}
      <Shadow cx={215} cy={330} rx={70} ry={7} opacity={0.6} />
      <path d="M180 330 L188 262 H242 L250 330 Z" fill="#110c1a" />
      <path d="M188 262 H242" stroke="#4a3d66" strokeOpacity="0.6" />
      <circle cx="215" cy="200" r="72" fill="none" stroke="#06040a" strokeWidth="4" />
      <circle cx="215" cy="200" r="64" fill="url(#at-door-void)" stroke="url(#at-door-stone)" strokeWidth="14" />
      <circle cx="215" cy="200" r="70.5" fill="none" stroke="#5a4c7a" strokeWidth="1" opacity="0.5" />
      <circle cx="215" cy="200" r="57" fill="none" stroke="#06040a" strokeWidth="1.5" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI * 2) / 16;
        return <path key={i} d={`M${215 + Math.cos(a) * 58} ${200 + Math.sin(a) * 58} L${215 + Math.cos(a) * 70} ${200 + Math.sin(a) * 70}`} stroke="#0a0710" strokeWidth="1" />;
      })}
      <path d="M160 160 Q182 134 215 130" stroke="#8a7aaa" strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round" />
      <circle cx="215" cy="200" r="40" fill="#3a2a5a" opacity="0.18" filter="url(#at-soft)" className="at-breathe" />
      <GlyphRing cx={215} cy={200} r={48} size={11} fill="#6a5a8a" />

      {/* the lectern by the door, and Corin's last page pinned to it */}
      <Shadow cx={86} cy={332} rx={42} ry={6} opacity={0.7} />
      <path d="M58 332 L66 318 H106 L114 332 Z" fill="#2a180c" />
      <rect x="80" y="236" width="12" height="84" fill="url(#at-wood)" />
      <rect x="82" y="236" width="3" height="84" fill="#8a6440" opacity="0.5" />
      <path d="M74 252 h24 M74 300 h24" stroke="#2a180c" strokeWidth="4" />
      <path d="M44 230 L86 206 L128 230 V240 H44 Z" fill="#3b2414" stroke="#111" />
      <path d="M44 240 H128" stroke="#8a6440" strokeWidth="1" opacity="0.6" />
      <rect x="56" y="214" width="58" height="20" fill="url(#at-paper)" transform="rotate(-6 86 224)" />
      <g transform="rotate(-6 86 224)" stroke="#6a5a3a" strokeWidth="0.6" opacity="0.6">
        <path d="M61 219 H106 M61 223 H109 M61 227 H100" />
      </g>
      <circle cx="61" cy="216" r="1.6" fill={BRASS} />
      {/* a quill laid across the lectern's lip, and his satchel slumped at its foot */}
      <path d="M96 240 L124 232" stroke="#e8e0cc" strokeWidth="1.2" />
      <path d="M112 236 q8 -6 12 -4 q-4 4 -12 4" fill="#d8ccb0" />
      <Shadow cx={128} cy={330} rx={14} ry={3} />
      <path d="M114 330 Q112 306 126 304 Q140 306 138 330 Z" fill="#3a2a1c" />
      <path d="M114 314 Q126 302 138 314" stroke="#2a1a10" strokeWidth="2" fill="none" />
      <rect x="123" y="312" width="6" height="5" rx="1" fill={BRASS_DK} />
      {/* the single candle: the only warm light in the Cathedral */}
      <circle cx="86" cy="220" r="44" fill="#ffb347" opacity="0.08" filter="url(#at-softer)" />
      <Candle x={49} y={229} h={16} />
      <Dust x={40} y={160} w={90} h={100} count={8} color="#ffe6b0" seed={81} />
      <ellipse cx="80" cy="338" rx="56" ry="9" fill="#ffb347" opacity="0.12" filter="url(#at-soft)" />
      <Grain opacity={0.09} />
      <Vignette />
    </>
  );
}
