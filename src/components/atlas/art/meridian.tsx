import { BRASS_DK, BRASS_HI, Backdrop, Dust, FloorShade, Glint, GlyphRing, Grain, LightPool, LightShaft, Mottle, SandDrift, Shadow, Vignette, seeded, type WallState } from "./common";
// ---------------------------------------------------------------- the Sunken Meridian

/** Wind-rippled sand: short crescent ripples, wider and further apart toward the viewer. */
function Ripples({ y0, y1, count = 16, seed = 9, x0 = 0, x1 = 300 }: { y0: number; y1: number; count?: number; seed?: number; x0?: number; x1?: number }) {
  const rnd = seeded(seed);
  return (
    <g fill="none" strokeLinecap="round" pointerEvents="none">
      {Array.from({ length: count }, (_, i) => {
        const t = (i + rnd() * 0.8) / count;
        const y = y0 + (y1 - y0) * t * t * 0.4 + (y1 - y0) * t * 0.6;
        const w = 14 + 34 * t + rnd() * 18;
        const x = x0 + rnd() * (x1 - x0 - w);
        const a = 1.5 + 2.5 * t;
        return (
          <g key={i}>
            <path d={`M${x} ${y} q${w / 2} ${-a} ${w} 0`} stroke="#8a5e2e" strokeWidth={0.7 + t * 0.7} opacity="0.35" />
            <path d={`M${x + 2} ${y - 1.4} q${w / 2 - 2} ${-a} ${w - 4} 0`} stroke="#fbe4b0" strokeWidth={0.5 + t * 0.5} opacity="0.45" />
          </g>
        );
      })}
    </g>
  );
}

/** A stopped desert sun over dunes, a ruined colonnade and half-buried towers. */
function Desert({ floorY = 300 }: { floorY?: number }) {
  const h = floorY;
  return (
    <>
      <defs>
        <linearGradient id="at-mer-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2953f" />
          <stop offset="0.5" stopColor="#efbd6e" />
          <stop offset="1" stopColor="#f9e2ab" />
        </linearGradient>
        <linearGradient id="at-mer-dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ebc382" />
          <stop offset="0.5" stopColor="#d6a463" />
          <stop offset="1" stopColor="#b07c42" />
        </linearGradient>
        <linearGradient id="at-mer-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5f34" />
          <stop offset="0.55" stopColor="#b48650" />
          <stop offset="1" stopColor="#e2b673" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#at-mer-sky)" />
      {/* the sun that has not moved in a year: a white-hot disc in a wide, heavy haze */}
      <circle cx="232" cy="64" r="150" fill="#fff0c0" opacity="0.3" filter="url(#at-softer)" />
      <circle cx="232" cy="64" r="66" fill="url(#at-glow)" />
      <circle cx="232" cy="64" r="33" fill="#fff4cf" opacity="0.55" />
      <circle cx="232" cy="64" r="26" fill="#fffbea" />
      <path d="M-10 118 Q90 104 170 116 T310 106" stroke="#fff5d8" strokeWidth="7" opacity="0.28" fill="none" filter="url(#at-soft)" />
      <path d="M-10 146 Q70 138 150 146 T310 140" stroke="#fff5d8" strokeWidth="4" opacity="0.2" fill="none" filter="url(#at-soft)" />
      {/* far dunes, pale with distance, and a colonnade drowning in them */}
      <path d={`M0 ${h - 58} Q50 ${h - 82} 110 ${h - 68} T230 ${h - 72} T300 ${h - 64} V${h} H0 Z`} fill="#f2d49c" />
      <g fill="#d8ac70" opacity="0.75">
        <rect x="64" y={h - 104} width="8" height="40" />
        <rect x="84" y={h - 104} width="8" height="40" />
        <path d={`M104 ${h - 64} V${h - 88} l4 -4 l3 5 V${h - 64} Z`} />
        <rect x="58" y={h - 110} width="40" height="6" />
        <path d={`M112 ${h - 66} l22 -6 l1 4 l-22 6 Z`} />
      </g>
      <path d={`M40 ${h - 62} Q100 ${h - 74} 160 ${h - 60}`} stroke="#f7e1b2" strokeWidth="1.2" fill="none" opacity="0.6" />
      {/* the old towers, buried to the shoulders: lit on the sun side, scoured smooth by wind */}
      <path d={`M14 ${h - 20} V${h - 150} L22 ${h - 160} H36 L44 ${h - 150} V${h - 20} Z`} fill="url(#at-mer-stone)" />
      <path d={`M22 ${h - 160} Q29 ${h - 186} 36 ${h - 160} Z`} fill="#c99a5c" />
      <path d={`M29 ${h - 184} V${h - 196}`} stroke="#7a522a" strokeWidth="1.6" />
      <rect x="14" y={h - 150} width="7" height="130" fill="#3a2410" opacity="0.18" />
      <g stroke="#6e4a26" strokeWidth="1.2" opacity="0.5">
        <path d={`M14 ${h - 60} H44 M14 ${h - 98} H44 M14 ${h - 128} H44`} />
      </g>
      <rect x="27" y={h - 142} width="4" height="12" rx="2" fill="#4a2e16" />
      <rect x="27" y={h - 90} width="4" height="10" rx="2" fill="#4a2e16" />
      <path d={`M246 ${h - 20} V${h - 128} L252 ${h - 136} L258 ${h - 129} L264 ${h - 142} L272 ${h - 134} V${h - 20} Z`} fill="url(#at-mer-stone)" />
      <rect x="246" y={h - 128} width="6" height="108" fill="#3a2410" opacity="0.18" />
      <path d={`M246 ${h - 70} H272 M246 ${h - 104} H272`} stroke="#6e4a26" strokeWidth="1.2" opacity="0.5" />
      <rect x="257" y={h - 116} width="4" height="11" rx="2" fill="#4a2e16" />
      {/* heat rising off the sand at the horizon */}
      <g className="at-shimmer" stroke="#fff6dc" strokeWidth="0.8" fill="none" opacity="0.4" pointerEvents="none">
        <path d={`M20 ${h - 46} q10 -2 20 0 t20 0 M150 ${h - 50} q12 -2 24 0 t24 0 M226 ${h - 42} q8 -2 16 0 t16 0`} />
        <path d={`M76 ${h - 40} q10 -2 20 0 t20 0 M180 ${h - 36} q9 -2 18 0 t18 0`} />
      </g>
      {/* the near dune, its crest catching the sun, the towers' hard shadows thrown across it */}
      <path d={`M0 ${h - 20} Q80 ${h - 50} 160 ${h - 24} T300 ${h - 30} V400 H0 Z`} fill="url(#at-mer-dune)" />
      <path d={`M0 ${h - 20} Q80 ${h - 50} 160 ${h - 24} T300 ${h - 30}`} stroke="#fbe6b4" strokeWidth="1.6" fill="none" opacity="0.7" />
      <path d={`M246 ${h - 28} L272 ${h - 30} L214 ${h - 4} L178 ${h - 2} Z`} fill="#6a4220" opacity="0.22" />
      <path d={`M14 ${h - 22} L44 ${h - 33} L4 ${h - 6} L-20 ${h} Z`} fill="#6a4220" opacity="0.22" />
      <rect y={h - 20} width="300" height={420 - h} fill="url(#at-sand)" />
      <Mottle y={h - 30} h={430 - h} opacity={0.16} />
    </>
  );
}

/** A colossal stone face, buried to the brow, looking up at the sun it has watched for a year. */
function BuriedHead({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`}>
      <path d="M-34 18 L-16 30 L44 26 L60 14 Z" fill="#6a4220" opacity="0.24" />
      <path d="M-26 20 Q-30 -14 -6 -26 Q18 -34 30 -18 Q38 -6 34 20 Z" fill="url(#at-mer-stone)" />
      {/* headdress band and its scoured stripes */}
      <path d="M-26 0 Q-24 -20 -6 -26 Q16 -32 28 -20 L24 -10 Q10 -20 -8 -14 Q-20 -8 -20 4 Z" fill="#9a6c3c" />
      <path d="M-22 -8 Q-8 -24 20 -20 M-24 -2 Q-12 -16 14 -14" stroke="#6e4a26" strokeWidth="0.8" fill="none" opacity="0.6" />
      {/* a closed eye, a broken nose */}
      <path d="M4 -2 q6 3 12 0" stroke="#4a2e16" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M2 -4 q8 -3 15 0" stroke="#6e4a26" strokeWidth="0.8" fill="none" />
      <path d="M22 0 L30 8 L26 11" stroke="#6e4a26" strokeWidth="1.2" fill="#c49660" />
      <path d="M18 14 q5 2 9 0" stroke="#4a2e16" strokeWidth="1.2" fill="none" />
      <path d="M-14 -6 l-4 16" stroke="#3a2410" strokeWidth="0.8" opacity="0.5" />
      {/* the sand it is drowning in */}
      <path d="M-44 22 Q-20 8 6 14 Q30 6 52 18 Q56 24 52 28 H-44 Z" fill="#d9a865" />
      <path d="M-40 20 Q-20 9 6 15 Q30 7 50 18" stroke="#fbe6b4" strokeWidth="1" fill="none" opacity="0.7" />
    </g>
  );
}

/** A clay jar half sunk in the sand. */
function Jar({ x, y, s = 1, tilt = 0 }: { x: number; y: number; s?: number; tilt?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      <ellipse cx="-8" cy="2" rx="20" ry="4" fill="#5a3818" opacity="0.3" />
      <path d="M-5 -26 H5 L6 -21 Q16 -14 14 -2 Q12 6 0 7 Q-12 6 -14 -2 Q-16 -14 -6 -21 Z" fill="#a85e34" />
      <path d="M4 -20 Q12 -13 11 -3" stroke="#e39a62" strokeWidth="1.6" fill="none" opacity="0.7" />
      <path d="M-13 -9 Q0 -6 13 -9" stroke="#6e3418" strokeWidth="1" fill="none" opacity="0.7" />
      <rect x="-7" y="-28" width="14" height="3" rx="1" fill="#8a4626" />
      <path d="M-18 6 Q0 -4 18 6 Z" fill="#d9a865" />
    </g>
  );
}

export function MeridianArrival() {
  const joints = [189, 207, 225, 243, 261, 279, 297, 315, 333, 351];
  return (
    <>
      <Desert />
      <defs>
        <linearGradient id="at-mer-drum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6bd7c" />
          <stop offset="0.45" stopColor="#b88a52" />
          <stop offset="1" stopColor="#6e4a26" />
        </linearGradient>
        <radialGradient id="at-mer-portal" cx="0.5" cy="0.9" r="0.8">
          <stop offset="0" stopColor="#1d3a38" />
          <stop offset="0.55" stopColor="#0d1613" />
          <stop offset="1" stopColor="#060403" />
        </radialGradient>
      </defs>
      {/* the gate's hard shadow, laid long across the sand by a sun that never moves */}
      <path d="M64 290 A86 86 0 1 1 236 290" fill="none" stroke="#5a3414" strokeWidth="26" opacity="0.22" transform="matrix(1 0 1 -0.3 -296 384.8)" />
      {/* the gate home, half in the sand: a dark mouth with a teal breath still in it */}
      <path d="M64 290 A86 86 0 1 1 236 290 Z" fill="url(#at-mer-portal)" />
      <circle cx="150" cy="272" r="64" fill="url(#at-teal-glow)" opacity="0.32" className="at-breathe" />
      <path d="M100 286 Q150 236 200 286 M118 288 Q150 256 182 288" stroke="#9ff3e4" strokeWidth="0.8" fill="none" opacity="0.18" className="at-breathe" />
      {/* sandstone voussoirs, the sun side lit, the inner edge in shadow */}
      <path d="M64 290 A86 86 0 1 1 236 290" fill="none" stroke="#4a2e16" strokeWidth="28" />
      <path d="M64 290 A86 86 0 1 1 236 290" fill="none" stroke="#7e5a32" strokeWidth="25" />
      <path d="M53 290 A97 97 0 0 1 247 290" fill="none" stroke="#e6bf80" strokeWidth="2" opacity="0.55" />
      <path d="M150 193 A97 97 0 0 1 247 290" fill="none" stroke="#f6dca4" strokeWidth="2.4" opacity="0.6" />
      <path d="M75 290 A75 75 0 0 1 225 290" fill="none" stroke="#24160a" strokeWidth="2.5" />
      <g stroke="#3a2410" strokeWidth="1.3" opacity="0.75">
        {joints.map((a) => {
          const r = (a * Math.PI) / 180;
          return <path key={a} d={`M${150 + Math.cos(r) * 75} ${290 + Math.sin(r) * 75} L${150 + Math.cos(r) * 98} ${290 + Math.sin(r) * 98}`} />;
        })}
      </g>
      {/* wind-scoured pits in the stone */}
      <g fill="#4a2e16" opacity="0.35">
        <circle cx="74" cy="262" r="1.4" />
        <circle cx="226" cy="246" r="1.2" />
        <circle cx="118" cy="210" r="1" />
        <circle cx="236" cy="272" r="1.6" />
      </g>
      {/* the ring of glyphs, glowing faintly in the stone */}
      <g filter="url(#at-soft)" opacity="0.55">
        <GlyphRing cx={150} cy={260} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      </g>
      <GlyphRing cx={150} cy={260} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      {/* the drift that buries the threshold */}
      <path d="M0 306 Q26 300 40 300 Q150 270 260 300 Q282 302 300 306 V400 H0 Z" fill="url(#at-mer-dune)" />
      <path d="M40 300 Q150 270 260 300" stroke="#fbe6b4" strokeWidth="1.6" fill="none" opacity="0.75" />
      <path d="M60 304 Q150 282 240 304 Q150 292 60 304 Z" fill="#8a5a2a" opacity="0.18" />
      <rect y="300" width="300" height="100" fill="url(#at-sand)" opacity="0.7" />
      <Ripples y0={312} y1={392} count={14} seed={17} />

      {/* a sun-bleached banner on a leaning pole, stirring in the hot wind */}
      <path d="M276 312 L284 196" stroke="#5a3a1c" strokeWidth="3" strokeLinecap="round" />
      <path d="M282 204 L258 300 L272 318" stroke="#5a3418" strokeWidth="1" fill="none" opacity="0.2" />
      <g className="at-sway" style={{ transformOrigin: "283px 200px" }}>
        <path d="M283 202 L258 206 Q252 232 260 258 L270 250 L276 262 Q282 234 283 202 Z" fill="#e7c9a0" />
        <path d="M282 214 L258 218 M281 230 L256 233 M279 246 L258 250" stroke="#c0704a" strokeWidth="3.4" opacity="0.55" />
        <path d="M283 202 L258 206" stroke="#8a5a34" strokeWidth="1.2" />
      </g>
      <path d="M284 196 l-2 -6 l4 0 z" fill={BRASS_DK} />
      <Jar x={38} y={308} s={0.9} tilt={-8} />
      <BuriedHead x={40} y={354} />
      {/* a fallen column drum, its fluting worn almost smooth */}
      <Shadow cx={238} cy={378} rx={48} ry={7} opacity={0.35} />
      <path d="M198 352 H266 V376 H198 Z" fill="url(#at-mer-drum)" transform="rotate(-6 232 364)" />
      <g transform="rotate(-6 232 364)">
        <path d="M200 357 H264 M200 371 H264" stroke="#6e4a26" strokeWidth="0.9" opacity="0.4" />
        <path d="M200 355 H264" stroke="#fbe6b4" strokeWidth="1.2" opacity="0.6" />
        <path d="M222 352 l3 8 l-2 6" stroke="#5a3418" strokeWidth="0.8" fill="none" opacity="0.5" />
        <ellipse cx="266" cy="364" rx="6" ry="12" fill="#d9ad6e" stroke="#8a5f34" />
        <ellipse cx="266" cy="364" rx="2" ry="4" fill="#a87c48" opacity="0.6" />
      </g>
      <path d="M186 380 Q214 368 236 374 Q262 368 290 380 V384 H186 Z" fill="#d9a865" />
      <SandDrift y={312} count={12} seed={16} />
      <SandDrift y={350} count={10} seed={26} />
      <Grain />
      <Vignette />
    </>
  );
}

/** Where each plaza mirror stands (its post's foot), and where its face is. */
const PLAZA_MIRRORS: [number, number][] = [
  [64, 248],
  [64, 308],
  [112, 308],
  [112, 278],
  [160, 278],
];

/** A broken pillar stump with its long shadow. */
function Stump({ x, y, w = 12, hgt = 18 }: { x: number; y: number; w?: number; hgt?: number }) {
  return (
    <g>
      <path d={`M${x} ${y} L${x + w} ${y} L${x - 26} ${y + 7} L${x - 34} ${y + 6} Z`} fill="#5a3414" opacity="0.28" />
      <path d={`M${x} ${y} V${y - hgt + 3} l${w * 0.3} -3 l${w * 0.25} 4 l${w * 0.45} -6 V${y} Z`} fill="url(#at-mer-stone)" />
      <path d={`M${x} ${y - 6} H${x + w}`} stroke="#6e4a26" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx={x + w / 2} cy={y} rx={w * 0.75} ry="2" fill="#d9a865" />
    </g>
  );
}

export function MeridianPlaza({ s }: { s: WallState }) {
  const lit = s.flags.includes("meridian.lit");
  const vaultLit = s.flags.includes("meridian.vault.lit");
  const beam = "M14 236 H64 V296 H112 V266 H160 L220 292";
  return (
    <>
      <Desert floorY={250} />
      <defs>
        <linearGradient id="at-plaza-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2cf" />
          <stop offset="0.45" stopColor="#d9c08a" />
          <stop offset="1" stopColor="#8a6a34" />
        </linearGradient>
        <linearGradient id="at-plaza-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c89a3c" />
          <stop offset="1" stopColor="#7a561a" />
        </linearGradient>
        <linearGradient id="at-plaza-gold-lit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0a8" />
          <stop offset="0.5" stopColor="#ffd75e" />
          <stop offset="1" stopColor="#d79a26" />
        </linearGradient>
        <radialGradient id="at-plaza-pit" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#2a1a0c" />
        </radialGradient>
      </defs>

      {/* the west wall, broken down to a stub, with the slit the sunlight comes through */}
      <path d="M0 250 V172 L10 166 L18 174 L30 170 V250 Z" fill="url(#at-mer-stone)" />
      <path d="M0 196 H30 M0 222 H30" stroke="#6e4a26" strokeWidth="1" opacity="0.5" />
      <rect x="12" y="228" width="6" height="16" fill="#fff6d0" />
      <circle cx="15" cy="236" r="16" fill="url(#at-glow)" />
      {/* a faded awning still lashed to it, sagging over the plaza */}
      <path d="M30 176 L70 162" stroke="#5a3a1c" strokeWidth="1.2" />
      <path d="M70 162 V214" stroke="#5a3a1c" strokeWidth="2.4" />
      <g className="at-sway" style={{ transformOrigin: "50px 168px" }}>
        <path d="M28 172 L70 160 Q68 178 62 186 Q48 186 34 194 Q30 186 28 172 Z" fill="#e8cfa8" />
        <path d="M38 169 Q40 182 40 191 M50 165 Q52 178 51 188 M61 162 Q62 174 60 185" stroke="#c0704a" strokeWidth="3.2" fill="none" opacity="0.5" />
        <path d="M34 194 l-2 6 M48 188 l0 5 M62 186 l2 6" stroke="#e8cfa8" strokeWidth="1" />
      </g>

      {/* the plaza floor: sand-scoured flagstones in perspective, drifted over at the corners */}
      <path d="M30 230 L270 230 L290 330 L10 330 Z" fill="#c99d5c" />
      <path d="M30 230 L270 230 L290 330 L10 330 Z" fill="url(#at-stone)" opacity="0.5" />
      <g stroke="#7a5630" strokeWidth="0.8" opacity="0.55">
        {[0, 1, 2, 3].map((r) => (
          <path key={r} d={`M${30 - r * 5} ${230 + r * 25} H${270 + r * 5}`} />
        ))}
        {[-60, 0, 50, 100, 150, 200, 250, 300, 360].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.8} 230 L${x} 330`} />
        ))}
      </g>
      <path d="M30 230 H270" stroke="#fbe6b4" strokeWidth="1" opacity="0.5" />
      <path d="M10 330 L30 230 Q40 270 64 330 Z" fill="#dcae6c" opacity="0.85" />
      <path d="M150 330 Q180 318 220 322 Q250 316 290 330 Z" fill="#dcae6c" opacity="0.8" />
      <path d="M10 330 H290" stroke="#6e4a26" strokeWidth="1.5" opacity="0.5" />

      {/* two broken pillars */}
      <Stump x={106} y={252} hgt={18} />
      <Stump x={14} y={312} w={13} hgt={24} />

      {/* the five tilting bronze mirrors on their pivots, each laying a hard shadow to the west */}
      {PLAZA_MIRRORS.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x + 4} ${y + 8} L${x - 8} ${y + 8} L${x - 40} ${y + 14} L${x - 26} ${y + 15} Z`} fill="#4a2a10" opacity="0.32" />
          <rect x={x - 3} y={y - 4} width="6" height="12" fill="#5a4626" />
          <rect x={x - 6} y={y + 6} width="12" height="3" rx="1" fill="#3a2a14" />
          <path d={`M${x - 14} ${y - 12} V${y - 3} H${x + 14} V${y - 12}`} stroke={BRASS_DK} strokeWidth="2" fill="none" />
          <g transform={`rotate(${i % 2 ? 20 : -20} ${x} ${y - 12})`}>
            <rect x={x - 12} y={y - 22} width="24" height="20" rx="3" fill="url(#at-plaza-face)" stroke="#8a7440" strokeWidth="2" />
            <path d={`M${x - 8} ${y - 6} L${x + 2} ${y - 19}`} stroke="#fff" strokeWidth="2" opacity="0.45" />
            <rect x={x - 12} y={y - 22} width="24" height="20" rx="3" fill="none" stroke={BRASS_HI} strokeWidth="0.6" opacity="0.6" />
          </g>
          <circle cx={x} cy={y - 12} r="1.6" fill={BRASS_DK} />
        </g>
      ))}
      {/* sunlight always finds the first mirror */}
      <path d="M14 236 H52" stroke="#fff1a8" strokeWidth="3" opacity="0.35" />
      {lit && (
        <g pointerEvents="none">
          <path d={beam} stroke="#fff1a8" strokeWidth="11" fill="none" opacity="0.35" filter="url(#at-soft)" />
          <path d={beam} stroke="#fff1a8" strokeWidth="4" fill="none" opacity="0.9" />
          <path d={beam} stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.9" />
          {PLAZA_MIRRORS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y - 12} r="10" fill="url(#at-glow)" />
          ))}
        </g>
      )}

      {/* the temple front, half buried, and in it the sun door */}
      <path d="M180 362 V200 L188 194 H290 L300 190 V362 Z" fill="url(#at-mer-stone)" />
      <rect x="180" y="200" width="120" height="162" fill="url(#at-stone)" opacity="0.6" />
      <path d="M180 200 H300 M180 208 H300" stroke="#5a3a1c" strokeWidth="1.2" opacity="0.6" />
      <g fill="#5a3a1c" opacity="0.45">
        {Array.from({ length: 15 }, (_, i) => (
          <rect key={i} x={182 + i * 8} y="210" width="4" height="4" />
        ))}
      </g>
      <path d="M180 200 H188 V362 H180 Z" fill="#3a2410" opacity="0.25" />
      <path d="M266 214 l3 7 l-2 6 l4 9 l-1 8" stroke="#4a2e16" strokeWidth="0.8" fill="none" opacity="0.55" />
      <rect x="176" y="244" width="88" height="8" fill="#8a5f34" />
      <path d="M176 244 H264" stroke="#f6dca4" strokeWidth="1" opacity="0.6" />
      <rect x="178" y="248" width="84" height="114" fill="#2a1a0c" />
      <rect x="182" y="250" width="76" height="110" rx="4" fill={lit ? "url(#at-plaza-gold-lit)" : "url(#at-plaza-gold)"} stroke="#6a5a3a" strokeWidth="3" />
      {!lit && <rect x="184" y="252" width="72" height="106" rx="3" filter="url(#at-mottle)" opacity="0.14" />}
      <path d="M190 256 V352 M250 256 V352" stroke={lit ? "#fff6d0" : "#5a4410"} strokeWidth="0.8" opacity="0.5" />
      <circle cx="220" cy="292" r="18" fill="none" stroke={lit ? "#fff6d0" : "#7a5f12"} strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M220 292 L${220 + Math.cos((i * Math.PI) / 4) * 30} ${292 + Math.sin((i * Math.PI) / 4) * 30}`} stroke={lit ? "#fff6d0" : "#7a5f12"} strokeWidth="2" />
      ))}
      {lit && (
        <>
          <rect x="182" y="250" width="76" height="110" fill="url(#at-glow)" opacity="0.6" />
          {/* swung inward a hand's breadth on the dark temple */}
          <path d="M250 252 H257 V358 H250 Z" fill="#140c05" />
          <circle cx="220" cy="292" r="56" fill="url(#at-glow)" opacity="0.5" />
        </>
      )}
      <path d="M176 362 Q200 352 226 358 Q252 350 270 362 Z" fill="#dcae6c" />
      <path d="M262 362 Q280 348 300 350 V362 Z" fill="#dcae6c" />
      <Ripples y0={336} y1={396} count={10} seed={23} />

      {/* the shaft in the sand: a ring of worn kerb stones round a drop into the dark */}
      <ellipse cx="74" cy="356" rx="50" ry="20" fill="#4a2a10" opacity="0.3" />
      <ellipse cx="74" cy="352" rx="47" ry="19" fill="#9c7444" />
      <ellipse cx="74" cy="350" rx="46" ry="18" fill="none" stroke="#e2b673" strokeWidth="1.4" opacity="0.6" />
      <ellipse cx="74" cy="352" rx="42" ry="16" fill="url(#at-plaza-pit)" stroke="#8a6a3a" strokeWidth="3" />
      <path d="M38 346 Q50 340 62 344 Q52 346 44 352 Z" fill="#d9a865" opacity="0.9" />
      <path d="M100 340 Q110 342 114 348" stroke="#d9a865" strokeWidth="2" fill="none" />
      {vaultLit && (
        <>
          <circle cx="74" cy="352" r="18" fill="url(#at-glow)" />
          <ellipse cx="74" cy="352" rx="10" ry="5" fill="#fff6d0" />
        </>
      )}
      {s.takes.has("vault") && <Glint x={74} y={352} />}

      {/* a toppled statue's arm, still holding a sun disc, and a cracked amphora */}
      <Shadow cx={152} cy={382} rx={30} ry={5} opacity={0.35} />
      <g transform="rotate(-10 150 366)">
        <rect x="128" y="360" width="44" height="12" rx="6" fill="url(#at-mer-stone)" />
        <path d="M132 362 Q150 358 168 362" stroke="#f6dca4" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="128" cy="366" r="9" fill="#c49660" stroke="#7a522a" />
        <path d="M168 360 V372" stroke="#6e4a26" strokeWidth="1" />
      </g>
      <path d="M124 380 Q148 372 178 380 Z" fill="#d9a865" />
      <Jar x={282} y={388} s={0.95} tilt={14} />
      <SandDrift y={318} count={12} seed={36} />
      <SandDrift y={354} count={8} seed={46} />
      <Grain />
      <Vignette />
    </>
  );
}

// ---------------------------------------------------------------- the Sun Temple (the sanctum)

/** The keeper's rooms: cool deep shade, sandstone blocks, a carved frieze, a floor of bare sand. */
function Sanctum({ floorY = 300 }: { floorY?: number }) {
  return (
    <>
      <Backdrop wall={["#3a2a18", "#120c07"]} floor="#4a3520" light="#ffd98a" floorY={floorY} />
      <Mottle h={floorY} opacity={0.45} />
      <rect width="300" height={floorY} fill="#1c2430" opacity="0.18" />
      <rect width="48" height={floorY} fill="#000" opacity="0.35" filter="url(#at-softer)" />
      <rect x="252" width="48" height={floorY} fill="#000" opacity="0.35" filter="url(#at-softer)" />
      {/* a carved frieze, worn by a year of drifting sand */}
      <rect y="10" width="300" height="16" fill="#5a4024" opacity="0.55" />
      <path d="M0 10 H300 M0 26 H300" stroke="#140c06" strokeWidth="1.5" />
      <path d="M0 11.5 H300" stroke="#e2b673" strokeWidth="0.6" opacity="0.25" />
      <g fill="#1a1008" opacity="0.55">
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={i * 10 + 2} y="27" width="6" height="5" />
        ))}
      </g>
      {/* the floor: sand blown in under the door, rippled */}
      <rect y={floorY} width="300" height={400 - floorY} fill="url(#at-sand)" opacity="0.7" />
      <path d={`M0 ${floorY + 2} Q60 ${floorY + 10} 120 ${floorY + 4} T300 ${floorY + 6}`} stroke="#8a6a3a" strokeWidth="1" fill="none" opacity="0.3" />
      <FloorShade floorY={floorY} />
    </>
  );
}

/** An oil lamp on a tall bronze stand, with its living flame and the amber light it throws. */
function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <LightPool cx={x} cy={y - 6} r={78} flicker />
      <Shadow cx={x} cy={y + 106} rx={18} ry={4} opacity={0.55} />
      <path d={`M${x} ${y + 4} V${y + 104}`} stroke={BRASS_DK} strokeWidth="3" />
      <path d={`M${x - 10} ${y + 106} L${x} ${y + 96} L${x + 10} ${y + 106} Z`} fill={BRASS_DK} />
      <path d={`M${x - 12} ${y} Q${x} ${y + 12} ${x + 12} ${y} Z`} fill="url(#at-brass)" />
      <path d={`M${x + 10} ${y} q6 -1 8 -4`} stroke={BRASS_DK} strokeWidth="2" fill="none" />
      <g className="at-flame" style={{ transformOrigin: `${x + 17}px ${y - 4}px` }}>
        <path d={`M${x + 17} ${y - 17} q5 7 0 12 q-5 -5 0 -12 z`} fill="#ffcf6b" />
        <path d={`M${x + 17} ${y - 11} q2 3 0 5 q-2 -2 0 -5 z`} fill="#fff6d8" />
      </g>
    </g>
  );
}

export function SanctumMirror() {
  return (
    <>
      <Sanctum />
      <defs>
        <clipPath id="at-sanc-glass">
          <rect x="80" y="50" width="140" height="220" rx="70" />
        </clipPath>
        <linearGradient id="at-sanc-bronze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e5630" />
          <stop offset="0.6" stopColor="#5a4626" />
          <stop offset="1" stopColor="#3e2f18" />
        </linearGradient>
      </defs>
      {/* sunlight forcing in through a vent high in the east wall */}
      <rect x="244" y="36" width="28" height="10" fill="#fff3c4" />
      <rect x="244" y="36" width="28" height="10" fill="none" stroke="#140c06" strokeWidth="1.5" />
      <LightShaft x1={246} x2={272} spread={10} y1={46} y2={304} opacity={0.75} dust={14} seed={31} />
      <ellipse cx="266" cy="306" rx="24" ry="5" fill="#ffe7a8" opacity="0.3" filter="url(#at-soft)" />

      {/* the niche the mirror stands in */}
      <rect x="60" y="30" width="180" height="262" rx="90" fill="#0e0905" opacity="0.6" />
      <rect x="60" y="30" width="180" height="262" rx="90" fill="none" stroke="#7a5a34" strokeWidth="1.5" opacity="0.5" />
      <rect x="58" y="280" width="184" height="12" fill="#5a4024" />
      <path d="M58 280 H242" stroke="#e2b673" strokeWidth="0.8" opacity="0.4" />

      {/* the great bronze mirror, showing a dial that isn't there */}
      <rect x="70" y="40" width="160" height="240" rx="80" fill="url(#at-brass)" />
      <rect x="74" y="44" width="152" height="232" rx="76" fill="none" stroke={BRASS_DK} strokeWidth="1.2" opacity="0.7" />
      <rect x="76.5" y="46.5" width="147" height="227" rx="73.5" fill="none" stroke={BRASS_HI} strokeWidth="1.4" strokeDasharray="1 3" opacity="0.55" />
      <rect x="80" y="50" width="140" height="220" rx="70" fill="url(#at-sanc-bronze)" />
      <g clipPath="url(#at-sanc-glass)">
        {/* the room behind you, dim in the bronze: a doorway of sun, and the sand floor */}
        <path d="M128 86 Q150 68 172 86 V150 H128 Z" fill="#e8c27a" opacity="0.16" />
        <rect x="80" y="166" width="140" height="110" fill="#8a6a3a" opacity="0.3" />
        <path d="M80 166 H220" stroke="#d9c08a" strokeWidth="0.8" opacity="0.3" />
        <g transform="translate(300 0) scale(-1 1)">
          <ellipse cx="150" cy="210" rx="52" ry="22" fill="#d9c08a" opacity="0.75" />
          <path d="M150 210 L188 222" stroke="#2a1f0e" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        </g>
        <path d="M80 50 L220 190" stroke="#fff" strokeWidth="18" opacity="0.04" />
      </g>
      <path d="M96 70 Q120 60 128 90" stroke="#fff" strokeOpacity="0.25" strokeWidth="6" fill="none" />
      <path d="M204 230 Q200 250 186 260" stroke="#fff" strokeOpacity="0.12" strokeWidth="3" fill="none" />
      <path d="M150 40 l-6 -10 l6 -8 l6 8 z" fill="url(#at-brass)" stroke={BRASS_DK} strokeWidth="0.8" />

      {/* the keeper's lamp, still burning */}
      <Lamp x={34} y={176} />
      {/* a wall niche with a little clay figure */}
      <path d="M14 104 V80 Q30 64 46 80 V104 Z" fill="#0e0905" opacity="0.7" />
      <path d="M26 104 V90 q4 -6 8 0 V104 Z" fill="#a06a3c" />
      <circle cx="30" cy="86" r="3.4" fill="#a06a3c" />
      <path d="M12 104 H48" stroke="#7a5a34" strokeWidth="2" />

      {/* the tablet, standing in the sand */}
      <Shadow cx={150} cy={368} rx={62} ry={6} opacity={0.6} />
      <g filter="url(#at-drop)">
        <rect x="96" y="292" width="108" height="72" rx="6" fill="#8a7a5a" stroke="#4a3e28" strokeWidth="3" />
        <rect x="100" y="296" width="100" height="64" rx="4" fill="none" stroke="#b4a47e" strokeWidth="0.8" opacity="0.5" />
        <rect x="96" y="292" width="108" height="72" rx="6" filter="url(#at-mottle)" opacity="0.18" />
        {[310, 324, 338, 352].map((y) => (
          <path key={y} d={`M110 ${y} H190`} stroke="#3a2c14" strokeWidth="2" opacity="0.7" />
        ))}
      </g>

      {/* scrolls the keeper left on the floor, and a water jar standing in the sunlight */}
      <Shadow cx={50} cy={360} rx={34} ry={5} opacity={0.5} />
      <g filter="url(#at-drop)">
        <g transform="rotate(-8 50 350)">
          <rect x="26" y="346" width="46" height="10" rx="5" fill="url(#at-paper)" />
          <ellipse cx="72" cy="351" rx="2.5" ry="5" fill="#c2b088" />
          <path d="M46 346 V356" stroke="#9a2a22" strokeWidth="2" />
        </g>
        <rect x="30" y="334" width="38" height="9" rx="4.5" fill="#d8c79c" transform="rotate(10 49 338)" />
      </g>
      <Shadow cx={262} cy={352} rx={22} ry={4} opacity={0.5} />
      <Jar x={266} y={350} s={1.15} />
      <Dust x={70} y={60} w={160} h={220} count={6} seed={33} color="#ffe2a8" />
      <Grain />
      <Vignette />
    </>
  );
}

export function SanctumStudy({ s }: { s: WallState }) {
  const open = s.flags.includes("meridian.chest.open");
  const ray = (i: number, r: number) => [150 + Math.cos((i * Math.PI) / 6) * r, 80 + Math.sin((i * Math.PI) / 6) * r];
  return (
    <>
      <Sanctum />
      <defs>
        <linearGradient id="at-study-bronze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a07a3a" />
          <stop offset="0.6" stopColor="#7a5a2a" />
          <stop offset="1" stopColor="#4a3416" />
        </linearGradient>
        <linearGradient id="at-study-altar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8823a" />
          <stop offset="0.6" stopColor="#c9a24a" />
          <stop offset="1" stopColor="#dcb85e" />
        </linearGradient>
      </defs>
      {/* a sun carved over the keeper's room, cut deep enough to hold shadow */}
      <circle cx="150" cy="80" r="62" fill="#ffd98a" opacity="0.06" />
      <g transform="translate(1.6 1.8)" stroke="#120a04" strokeWidth="3" opacity="0.7">
        <circle cx="150" cy="80" r="30" fill="none" />
        {Array.from({ length: 12 }, (_, i) => {
          const [a, b] = ray(i, 36);
          const [c, d] = ray(i, 48);
          return <path key={i} d={`M${a} ${b} L${c} ${d}`} />;
        })}
      </g>
      <circle cx="150" cy="80" r="30" fill="none" stroke="#8a7440" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const [a, b] = ray(i, 36);
        const [c, d] = ray(i, 48);
        return <path key={i} d={`M${a} ${b} L${c} ${d}`} stroke="#8a7440" strokeWidth="3" />;
      })}

      {/* sunlight through a high window, falling on the altar */}
      <rect x="226" y="34" width="34" height="12" fill="#fff3c4" />
      <rect x="226" y="34" width="34" height="12" fill="none" stroke="#140c06" strokeWidth="1.5" />
      <LightShaft x1={228} x2={258} spread={-12} y1={46} y2={196} opacity={0.8} dust={12} seed={41} />
      {/* a shelf of scrolls and pots in the cool shade */}
      <rect x="8" y="120" width="56" height="46" fill="#0e0905" opacity="0.65" />
      <path d="M6 166 H66" stroke="#7a5a34" strokeWidth="3" />
      <g filter="url(#at-drop)">
        <rect x="11" y="155" width="28" height="9" rx="4.5" fill="#d8c79c" />
        <rect x="14" y="146" width="24" height="9" rx="4.5" fill="#cbb98c" />
        <ellipse cx="39" cy="159" rx="2" ry="4.5" fill="#b4a074" />
        <path d="M52 164 q-6 -8 -2 -18 h8 q4 10 -2 18 z" fill="#a06a3c" />
        <path d="M50 146 h8" stroke="#7a4426" strokeWidth="2" />
      </g>
      {/* the keeper's hanging lamp, its amber light on the chest */}
      <path d="M96 0 V140" stroke="#2a1a0c" strokeWidth="1.2" />
      <LightPool cx={96} cy={150} r={96} flicker />
      <path d="M84 146 Q96 160 108 146 Z" fill="url(#at-brass)" />
      <path d="M84 146 H108" stroke={BRASS_DK} strokeWidth="1.5" />
      <path d="M88 140 L96 132 L104 140" stroke="#2a1a0c" strokeWidth="1" fill="none" />
      <g className="at-flame" style={{ transformOrigin: "96px 145px" }}>
        <path d="M96 132 q5 7 0 13 q-5 -6 0 -13 z" fill="#ffcf6b" />
        <path d="M96 138 q2 3 0 6 q-2 -3 0 -6 z" fill="#fff6d8" />
      </g>
      {/* a faded rug on the sand */}
      <path d="M22 312 H178 L196 360 H6 Z" fill="#7a3a26" opacity="0.75" />
      <path d="M30 316 H172 L186 354 H16 Z" fill="none" stroke="#d9b07a" strokeWidth="1.2" opacity="0.45" />
      <path d="M40 322 H164 L174 346 H30 Z" fill="none" stroke="#d9b07a" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 3" />

      {/* the keeper's chest: bronze, bound and footed */}
      <Shadow cx={100} cy={322} rx={64} ry={7} opacity={0.65} />
      <rect x="50" y="316" width="10" height="7" fill="#3a2a12" />
      <rect x="140" y="316" width="10" height="7" fill="#3a2a12" />
      <rect x="44" y="250" width="112" height="70" rx="6" fill="url(#at-study-bronze)" stroke="#3a2a12" strokeWidth="3" />
      <path d="M48 256 H152" stroke={BRASS_HI} strokeWidth="1" opacity="0.4" />
      <path d="M62 250 V320 M138 250 V320" stroke="#3a2a12" strokeWidth="5" opacity="0.6" />
      <path d="M62 250 V320 M138 250 V320" stroke={BRASS_HI} strokeWidth="1" opacity="0.25" />
      <rect x="44" y="250" width="112" height="70" rx="6" filter="url(#at-mottle)" opacity="0.15" />
      <path d="M90 284 h20 v14 h-20 z" fill="none" stroke="#3a2a12" strokeWidth="1.5" opacity="0.6" />
      {open ? (
        <>
          <path d="M48 252 H152 L150 262 H50 Z" fill="#140c05" />
          <path d="M44 250 L56 206 H168 L156 250 Z" fill="#8a6a3a" stroke="#3a2a12" strokeWidth="3" />
          <path d="M58 212 H162" stroke={BRASS_HI} strokeWidth="1" opacity="0.35" />
          <path d="M74 206 L64 250 M146 206 L136 250" stroke="#3a2a12" strokeWidth="4" opacity="0.55" />
        </>
      ) : (
        <>
          <rect x="44" y="228" width="112" height="26" rx="8" fill="#8a6a3a" stroke="#3a2a12" strokeWidth="3" />
          <path d="M52 233 Q100 229 148 233" stroke={BRASS_HI} strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M62 228 V254 M138 228 V254" stroke="#3a2a12" strokeWidth="4" opacity="0.55" />
          <rect x="84" y="232" width="32" height="16" rx="2" fill="#1b120b" />
          <path d="M86 234 H114" stroke={BRASS_DK} strokeWidth="0.8" opacity="0.6" />
        </>
      )}
      {s.takes.has("chest") && <Glint x={100} y={240} />}

      {/* the altar: yellow stone, warm where the sun lies on it */}
      <Shadow cx={226} cy={322} rx={56} ry={7} opacity={0.65} />
      <rect x="186" y="200" width="80" height="120" fill="url(#at-study-altar)" stroke="#6a5a3a" strokeWidth="3" />
      <rect x="196" y="216" width="60" height="88" fill="#000" opacity="0.12" />
      <path d="M196 216 H256 V304" stroke="#f6dca4" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M196 304 H256 M196 216 V304" stroke="#4a3416" strokeWidth="1" fill="none" opacity="0.5" />
      <rect x="186" y="200" width="80" height="120" filter="url(#at-mottle)" opacity="0.18" />
      <path d="M246 216 l-2 9 l3 7 l-3 10 l1 9" stroke="#6a4a20" strokeWidth="0.8" fill="none" opacity="0.5" />
      <rect x="180" y="192" width="92" height="12" fill="#d9b25a" />
      <path d="M180 192 H272" stroke="#fff3c4" strokeWidth="1.4" opacity="0.7" />
      <ellipse cx="236" cy="196" rx="30" ry="5" fill="#fff3c4" opacity="0.35" filter="url(#at-soft)" />
      {s.takes.has("altar") && (
        <>
          <ellipse cx="226" cy="186" rx="12" ry="8" fill="#cfe3ea" stroke="#7a5f12" strokeWidth="2" />
          <Glint x={226} y={184} />
        </>
      )}

      {/* a tall amphora in the corner, and a little brass incense burner smoking on the rug */}
      <Shadow cx={286} cy={372} rx={14} ry={3} opacity={0.5} />
      <g transform="translate(286 372) scale(1.25)">
        <path d="M-4 -40 H4 L5 -34 Q12 -26 10 -10 Q8 0 0 2 Q-8 0 -10 -10 Q-12 -26 -5 -34 Z" fill="#a85e34" />
        <path d="M3 -33 Q9 -24 8 -10" stroke="#e39a62" strokeWidth="1.4" fill="none" opacity="0.6" />
        <path d="M-5 -36 q-6 2 -5 10 M5 -36 q6 2 5 10" stroke="#8a4626" strokeWidth="1.4" fill="none" />
      </g>
      <Shadow cx={170} cy={372} rx={12} ry={3} opacity={0.5} />
      <path d="M162 370 L178 370 L174 360 H166 Z" fill="url(#at-brass)" />
      <path d="M163 360 Q170 354 177 360" fill={BRASS_DK} />
      <g className="at-sway" style={{ transformOrigin: "170px 354px" }} pointerEvents="none">
        <path d="M170 354 q-4 -8 1 -14 q5 -6 0 -14" stroke="#d8cbb0" strokeWidth="2" fill="none" opacity="0.14" />
      </g>
      <Dust x={40} y={60} w={220} h={240} count={6} seed={43} color="#ffe2a8" />
      <Grain />
      <Vignette />
    </>
  );
}
