import type { ReactNode } from "react";
import { BRASS, BRASS_DK, BRASS_HI, Bubbles, Caustics, Dust, FloorShade, Glint, GlyphRing, Grain, LightPool, Mottle, Shadow, Vignette, seeded, type WallState } from "./common";
// ---------------------------------------------------------------- the Pelagic Library

/** The open sea under a low, grey-green sky: a sun smothered in cloud, a long swell, light glittering on the water. */
export function Sea() {
  return (
    <>
      <defs>
        <linearGradient id="at-sea-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14272f" />
          <stop offset="0.6" stopColor="#3c5f66" />
          <stop offset="1" stopColor="#8db3a8" />
        </linearGradient>
        <linearGradient id="at-sea-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f9289" />
          <stop offset="0.25" stopColor="#24615d" />
          <stop offset="1" stopColor="#0a2427" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#at-sea-sky)" />
      {/* a drowned sun behind the cloud, and the cloud banks */}
      <ellipse cx="214" cy="150" rx="80" ry="46" fill="#e6f3d6" opacity="0.28" filter="url(#at-softer)" />
      <circle cx="214" cy="156" r="13" fill="#eef7e2" opacity="0.5" filter="url(#at-soft)" />
      <g fill="#10222a" filter="url(#at-soft)">
        <path d="M-20 40 Q60 18 140 36 T320 30 V64 Q220 76 120 62 T-20 70 Z" opacity="0.55" />
        <path d="M-20 110 Q70 94 160 112 T320 104 V124 Q240 132 150 126 T-20 132 Z" opacity="0.3" />
        <path d="M60 176 Q140 166 220 178 T330 174 V184 Q240 190 150 186 T60 186 Z" opacity="0.25" />
      </g>
      {/* a far headland on the horizon */}
      <path d="M0 210 V200 Q18 192 34 198 Q50 190 66 202 L80 210 Z" fill="#2b4a50" opacity="0.7" />
      <rect y="210" width="300" height="190" fill="url(#at-sea-deep)" />
      {/* the swell, flattening toward the horizon */}
      <g stroke="#bff3ea" fill="none">
        {[222, 234, 250, 270, 294].map((y, i) => (
          <path key={y} d={`M-10 ${y} q${18 + i * 6} ${-2 - i} ${36 + i * 12} 0 t${36 + i * 12} 0 t${36 + i * 12} 0 t${36 + i * 12} 0 t${36 + i * 12} 0 t${36 + i * 12} 0`} strokeWidth={0.6 + i * 0.25} opacity={0.18 + i * 0.03} />
        ))}
      </g>
      {/* light glittering on the water under the sun */}
      <g className="at-shimmer" stroke="#f2fbe6" strokeLinecap="round">
        {[
          [206, 216, 10],
          [222, 219, 8],
          [196, 224, 14],
          [218, 229, 12],
          [190, 236, 18],
          [226, 242, 14],
          [200, 252, 22],
        ].map(([x, y, w]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y} h${w}`} strokeWidth="1.2" opacity="0.55" />
        ))}
      </g>
      <path d="M0 214 Q30 206 60 214 T120 214 T180 214 T240 214 T300 214" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.6" />
    </>
  );
}

/** A frond of kelp, rooted at (x, y), swaying. */
function Kelp({ x, y, h, lean = 1, color = "#2f6a3e", delay = 0 }: { x: number; y: number; h: number; lean?: number; color?: string; delay?: number }) {
  return (
    <path
      d={`M${x - 2} ${y} C${x + 6 * lean} ${y - h * 0.3} ${x - 8 * lean} ${y - h * 0.6} ${x + 4 * lean} ${y - h} C${x - 2 * lean} ${y - h * 0.6} ${x + 10 * lean} ${y - h * 0.3} ${x + 3} ${y} Z`}
      fill={color}
      className="at-sway"
      style={{ animationDelay: `${delay}s`, animationDuration: `${5 + (Math.abs(delay) % 3)}s` }}
    />
  );
}

/** A green glass lamp: a bell shade, its glowing mouth and the light it throws. */
function GreenLamp({ x, y, r = 30, shade = 13 }: { x: number; y: number; r?: number; shade?: number }) {
  return (
    <g>
      <LightPool cx={x} cy={y + 16} r={r} color="#5cf0a0" opacity={0.55} />
      <rect x={x - 2.5} y={y - 3} width="5" height="4" fill={BRASS_DK} />
      <path d={`M${x - shade * 0.45} ${y + 1} Q${x - shade * 0.55} ${y + 8} ${x - shade} ${y + 14} H${x + shade} Q${x + shade * 0.55} ${y + 8} ${x + shade * 0.45} ${y + 1} Z`} fill="#2f9a5c" />
      <path d={`M${x - shade * 0.3} ${y + 3} Q${x - shade * 0.45} ${y + 9} ${x - shade * 0.75} ${y + 12}`} stroke="#b8ffd6" strokeWidth="1" fill="none" opacity="0.6" />
      <path d={`M${x - shade} ${y + 14} H${x + shade}`} stroke="#a8ffcf" strokeWidth="1.6" className="at-flicker" />
      <circle cx={x} cy={y + 15} r={shade * 0.3} fill="#e0ffe9" opacity="0.8" className="at-flicker" />
    </g>
  );
}

/** The sea pressing on a glass ceiling: iron ribs, light rippling through, bubbles rising. */
function GlassCeiling({ h, id }: { h: number; id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d3b33" />
          <stop offset="1" stopColor="#3f9a7c" />
        </linearGradient>
      </defs>
      <rect width="300" height={h} fill={`url(#${id})`} />
      <Caustics x={-20} y={0} w={340} h={h} opacity={0.45} seed={h} />
      <Bubbles x={10} y={-6} w={280} h={h} count={8} seed={h + 3} />
      {/* iron ribs of the glass roof, foreshortened */}
      <g stroke="#0b1715" strokeWidth="3">
        {[-60, 0, 50, 100, 150, 200, 250, 300, 360].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.7} 0 L${x} ${h}`} />
        ))}
      </g>
      <path d={`M0 ${h} H300`} stroke="#0b1715" strokeWidth="5" />
      <path d={`M0 ${h + 3} H300`} stroke="#7cf2b0" strokeWidth="0.8" opacity="0.3" />
    </>
  );
}

/** The reading room's walls: dark green stone, damp from the sea above, green light washing down. */
function ReadingRoom({ id, ceiling }: { id: string; ceiling: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#164038" />
          <stop offset="1" stopColor="#071715" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f3a32" />
          <stop offset="1" stopColor="#0e1d19" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${id}-wall)`} />
      <rect width="300" height="330" fill="url(#at-stone)" opacity="0.8" />
      <Mottle h={330} opacity={0.45} />
      {/* water stains running down from the ceiling */}
      <g stroke="#04100d" strokeLinecap="round" opacity="0.35" filter="url(#at-soft)">
        {[18, 64, 128, 196, 282].map((x, i) => (
          <path key={x} d={`M${x} ${ceiling} q${(i % 2) * 4 - 2} 60 0 ${90 + i * 14}`} strokeWidth={5 + (i % 3) * 3} />
        ))}
      </g>
      {/* the floor: wet green marble, a runner down the middle */}
      <rect y="330" width="300" height="70" fill={`url(#${id}-floor)`} />
      <path d="M0 330 H300" stroke="#000" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M118 330 H182 L222 400 H78 Z" fill="#163a2a" />
      <path d="M118 330 L78 400 M182 330 L222 400" stroke="#4c7a4a" strokeWidth="1" opacity="0.5" />
      <g stroke="#000" strokeOpacity="0.3">
        {[-200, -60, 40, 260, 360, 500].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.4} 330 L${x} 400`} />
        ))}
      </g>
      <Caustics x={-10} y={336} w={320} h={60} opacity={0.12} seed={ceiling + 9} />
      <FloorShade floorY={330} />
      {/* the room curves away into the dark at both sides */}
      <rect width="34" height="400" fill="#000" opacity="0.4" filter="url(#at-softer)" />
      <rect x="266" width="34" height="400" fill="#000" opacity="0.4" filter="url(#at-softer)" />
    </>
  );
}

/** A tall bookcase of damp books. */
function Bookcase({ x, y, w, h, rows, seed }: { x: number; y: number; w: number; h: number; rows: number; seed: number }) {
  const rnd = seeded(seed);
  const cols = ["#3b2a1e", "#2a3b2a", "#4a2a24", "#253642", "#4a4026", "#2e2a3c", "#1f3a33"];
  const rowH = h / rows;
  const books: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    let bx = x + 3;
    const by = y + rowH * (r + 1) - 3;
    while (bx < x + w - 6) {
      const bw = 4 + Math.floor(rnd() * 5);
      const bh = rowH * (0.55 + rnd() * 0.35);
      const lean = rnd() < 0.08;
      books.push(
        <rect key={`${r}-${bx}`} x={bx} y={by - bh} width={bw} height={bh} fill={cols[Math.floor(rnd() * cols.length)]} transform={lean ? `rotate(12 ${bx + bw} ${by})` : undefined} />,
      );
      bx += bw + 0.6 + (lean ? 3 : 0);
    }
  }
  return (
    <g>
      <rect x={x - 3} y={y - 6} width={w + 6} height={h + 9} fill="#22170e" />
      <rect x={x} y={y} width={w} height={h} fill="#0b120f" />
      {books}
      {Array.from({ length: rows + 1 }, (_, r) => (
        <rect key={r} x={x - 2} y={y + rowH * r - 3} width={w + 4} height="3" fill="#3b2616" />
      ))}
      {/* damp: a green bloom creeping over the lower shelves */}
      <rect x={x} y={y + h * 0.55} width={w} height={h * 0.45} fill="#2f6a4a" opacity="0.18" />
    </g>
  );
}

// ---------------------------------------------------------------- walls

export function PelagicArrival({ s }: { s: WallState }) {
  return (
    <>
      <Sea />
      <defs>
        <radialGradient id="at-pel-portal" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1f5a52" />
          <stop offset="0.7" stopColor="#0a1c1a" />
          <stop offset="1" stopColor="#040b0a" />
        </radialGradient>
        <linearGradient id="at-pel-dome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c5e52" />
          <stop offset="0.45" stopColor="#5fa38c" />
          <stop offset="1" stopColor="#1d4038" />
        </linearGradient>
        <linearGradient id="at-pel-quay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#56625f" />
          <stop offset="1" stopColor="#2a3231" />
        </linearGradient>
        <clipPath id="at-pel-under">
          <rect y="214" width="300" height="86" />
        </clipPath>
      </defs>

      {/* the drowned library, dim through the water: arches and a dome below the surface */}
      <g clipPath="url(#at-pel-under)" opacity="0.35">
        <path d="M0 300 V262 Q20 238 40 262 V300 M48 300 V258 Q72 230 96 258 V300 M104 300 V264 Q122 244 140 264 V300" fill="#0a2224" />
        <path d="M-6 300 V250 H146 V300" fill="none" stroke="#0a2224" strokeWidth="4" />
        <Caustics x={0} y={230} w={150} h={70} opacity={0.5} seed={31} />
      </g>
      <Bubbles x={8} y={222} w={135} h={78} count={9} seed={32} />

      {/* old mooring piles standing in the water, crusted with barnacles */}
      {[
        [138, 196, 7],
        [24, 232, 6],
      ].map(([x, y, w]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={300 - y} fill="#3a2a1c" />
          <rect x={x} y={y} width={w / 3} height={300 - y} fill="#5a4430" opacity="0.6" />
          <ellipse cx={x + w / 2} cy={y} rx={w / 2} ry="1.5" fill="#6a5440" />
          <path d={`M${x} 214 h${w}`} stroke="#d9e8d8" strokeWidth="2" strokeDasharray="1.5 1" opacity="0.6" />
          <rect x={x} y="216" width={w} height={300 - 216} fill="#0a2427" opacity="0.4" />
        </g>
      ))}

      {/* the library's pavilion: green copper dome, wet stone, the door going down */}
      <path d="M146 124 Q215 44 284 124 Z" fill="url(#at-pel-dome)" />
      <g stroke="#1a3a32" strokeWidth="1.4" fill="none" opacity="0.8">
        <path d="M215 64 Q190 90 182 124 M215 64 Q240 90 248 124 M215 64 V124" />
      </g>
      <path d="M215 64 V50" stroke={BRASS_DK} strokeWidth="2.5" />
      <circle cx="215" cy="48" r="3" fill="url(#at-brass-ball)" />
      <path d="M154 108 Q215 96 276 108" stroke="#9fd9c0" strokeWidth="1" fill="none" opacity="0.35" />
      <rect x="142" y="122" width="146" height="8" fill="#56625f" />
      <rect x="150" y="128" width="130" height="172" fill="#3a4648" />
      <rect x="150" y="128" width="130" height="172" fill="url(#at-stone)" />
      <rect x="150" y="128" width="130" height="172" filter="url(#at-mottle)" opacity="0.4" />
      <rect x="250" y="128" width="30" height="172" fill="#000" opacity="0.25" />
      {/* verdigris weeping from the dome down the stone */}
      <g stroke="#4f9a80" strokeLinecap="round" opacity="0.35" filter="url(#at-soft)">
        <path d="M162 130 v40 M262 130 v58 M204 130 v18" strokeWidth="5" />
      </g>
      {/* the doorway: a dark stair going down, green lamplight rising from below */}
      <path d="M180 300 V180 Q215 140 250 180 V300 Z" fill="#071311" />
      <ellipse cx="215" cy="290" rx="30" ry="28" fill="#4fd890" opacity="0.18" filter="url(#at-soft)" />
      <path d="M184 300 h62 M188 290 h54 M192 281 h46 M196 273 h38" stroke="#1d4a3a" strokeWidth="2" />
      <path d="M180 300 V180 Q215 140 250 180 V300" fill="none" stroke="#7a8a8c" strokeWidth="4" />
      <path d="M176 300 V178 Q215 132 254 178 V300" fill="none" stroke="#2a3436" strokeWidth="1.5" />
      <path d="M211 152 h8 l1 10 h-10 z" fill="#5a6a6c" stroke="#2a3436" />
      {/* a green ship's lamp on a bracket beside the door */}
      <path d="M268 172 h-8 v6" stroke="#1d2426" strokeWidth="2" fill="none" />
      <GreenLamp x={260} y={176} r={34} shade={7} />
      <Caustics x={150} y={236} w={130} h={60} opacity={0.14} seed={33} />

      {/* the gate home, standing half in the sea */}
      <circle cx="78" cy="214" r="66" fill="none" stroke="#1d1a26" strokeWidth="4" />
      <circle cx="78" cy="214" r="58" fill="url(#at-pel-portal)" stroke="#4a4458" strokeWidth="10" />
      <circle cx="78" cy="214" r="62" fill="none" stroke="#6a6480" strokeWidth="1" opacity="0.6" />
      <circle cx="78" cy="214" r="53" fill="none" stroke="#1d1a26" strokeWidth="1.5" />
      <ellipse cx="78" cy="206" rx="30" ry="26" fill="#9ff3e4" opacity="0.14" filter="url(#at-soft)" className="at-breathe" />
      <GlyphRing cx={78} cy={214} r={44} size={10} fill="#9ff3e4" opacity={0.75} />
      {/* the sea closes over its lower half */}
      <g clipPath="url(#at-pel-under)">
        <circle cx="78" cy="214" r="68" fill="#0f3a3a" opacity="0.4" />
      </g>
      <path d="M8 214 Q40 208 78 213 T150 214" stroke="#d8fbf4" strokeWidth="1.6" fill="none" opacity="0.7" />
      <ellipse cx="78" cy="217" rx="72" ry="4" fill="none" stroke="#bff3ea" strokeWidth="0.8" opacity="0.45" className="at-shimmer" />
      {/* kelp breaking the surface beside it */}
      <Kelp x={146} y={300} h={96} lean={-1} color="#2a5a36" delay={-1} />
      <Kelp x={152} y={300} h={76} lean={1} color="#3a7446" delay={-3} />
      <Kelp x={8} y={300} h={88} lean={1} color="#2a5a36" delay={-2} />

      {/* the quay you stand on: wet stone running toward you */}
      <rect y="300" width="300" height="100" fill="url(#at-pel-quay)" />
      <g stroke="#000" strokeOpacity="0.4" strokeWidth="1">
        <path d="M0 312 H300 M0 330 H300 M0 356 H300" />
        {[-240, -100, 10, 110, 200, 300, 410, 540].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.3} 300 L${x} 400`} />
        ))}
      </g>
      <path d="M0 301 H300" stroke="#9fb6b0" strokeWidth="1" opacity="0.5" />
      <rect y="296" width="300" height="5" fill="#2a3231" />
      {/* puddles holding the sky */}
      <ellipse cx="96" cy="372" rx="40" ry="7" fill="#8db3a8" opacity="0.28" />
      <ellipse cx="232" cy="350" rx="24" ry="4" fill="#8db3a8" opacity="0.22" />
      <FloorShade floorY={300} />

      {/* the rack of flasks by the door */}
      <Shadow cx={185} cy={316} rx={42} ry={5} />
      <rect x="150" y="304" width="70" height="10" fill="url(#at-wood)" />
      <rect x="150" y="304" width="70" height="2" fill="#8a6440" />
      <path d="M154 314 v8 M216 314 v8" stroke="#3b2414" strokeWidth="3" />
      {[160, 176, 192, 208].map((x) => (
        <g key={x}>
          <path d={`M${x} 304 v-14 h-4 v-6 h12 v6 h-4 v14 z`} fill="#bfe8df" opacity="0.7" />
          <rect x={x - 3} y="296" width="10" height="8" fill="#3fae9a" opacity="0.6" />
          <rect x={x - 1} y="282" width="6" height="4" fill="#8a6a44" />
          <path d={`M${x - 2.5} 292 v10`} stroke="#fff" strokeWidth="1" opacity="0.6" />
        </g>
      ))}

      {/* a coil of rope and an iron bollard, left from the last crossing */}
      <Shadow cx={60} cy={350} rx={30} ry={5} />
      <g fill="none" stroke="#8a7650" strokeWidth="3">
        <ellipse cx="60" cy="344" rx="24" ry="7" />
        <ellipse cx="60" cy="341" rx="17" ry="5" stroke="#a08a5e" />
        <ellipse cx="60" cy="338" rx="10" ry="3" stroke="#b49c6a" />
        <path d="M84 344 q14 6 28 2 t30 6" stroke="#7a6640" />
      </g>
      <Shadow cx={268} cy={384} rx={20} ry={4} />
      <path d="M254 384 V362 q14 -8 28 0 V384 Z" fill="#2a2e30" />
      <ellipse cx="268" cy="362" rx="16" ry="5" fill="#4a5256" />
      <path d="M258 366 V382" stroke="#6a7276" strokeWidth="1.5" opacity="0.6" />

      {s.takes.has("pelagic-gate") && <Glint x={186} y={292} />}
      <Grain />
      <Vignette />
    </>
  );
}

export function PelagicAirlock({ s }: { s: WallState }) {
  const open = s.flags.includes("pelagic.airlock.open");
  const levels = s.tanks ?? [8, 0, 0];
  const caps = [8, 5, 3];
  const xs = [44, 92, 136];
  const bolts = Array.from({ length: 20 }, (_, i) => (i * Math.PI * 2) / 20);
  return (
    <>
      <defs>
        <linearGradient id="at-lock-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f3d3e" />
          <stop offset="1" stopColor="#0a1a1c" />
        </linearGradient>
        <pattern id="at-lock-plate" width="75" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 0.5 H75 M0.5 0 V80" stroke="#000" strokeOpacity="0.45" strokeWidth="1.4" />
          <path d="M0 2 H75 M2 0 V80" stroke="#bff3ea" strokeOpacity="0.07" />
          {[7, 22, 37, 52, 67].map((x) => (
            <circle key={x} cx={x} cy="5" r="1.4" fill="#5d6a6c" opacity="0.7" />
          ))}
        </pattern>
        <pattern id="at-lock-grate" width="12" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0 H12 M0 0 V8" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
        </pattern>
        <linearGradient id="at-lock-tank" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a1416" />
          <stop offset="0.25" stopColor="#1a2e30" />
          <stop offset="1" stopColor="#050b0c" />
        </linearGradient>
        <radialGradient id="at-lock-beyond" cx="0.55" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#2a6a4a" />
          <stop offset="1" stopColor="#061210" />
        </radialGradient>
        <clipPath id="at-lock-glass">
          <circle cx="236" cy="200" r="46" />
        </clipPath>
      </defs>
      {/* a riveted iron chamber below the sea */}
      <rect width="300" height="400" fill="url(#at-lock-wall)" />
      <rect width="300" height="330" fill="url(#at-lock-plate)" />
      <Mottle h={330} opacity={0.5} />
      {/* rust weeping from the seams */}
      <g stroke="#7a4a24" strokeLinecap="round" opacity="0.35" filter="url(#at-soft)">
        <path d="M22 80 v50 M98 80 v34 M172 160 v44 M262 80 v26 M290 240 v50" strokeWidth="3" />
      </g>
      {/* the floor: an iron grating, wet */}
      <rect y="330" width="300" height="70" fill="#14272a" />
      <rect y="330" width="300" height="70" fill="url(#at-lock-grate)" />
      <path d="M0 330 H300" stroke="#000" strokeOpacity="0.55" strokeWidth="2" />
      <FloorShade floorY={330} />

      {/* a caged green lamp lights the tanks */}
      <path d="M110 0 V30" stroke="#1d2426" strokeWidth="2" />
      <GreenLamp x={110} y={30} r={70} shade={15} />
      <path d="M100 40 q10 10 20 0 M104 44 q6 6 12 0" stroke="#1d2426" strokeWidth="1.2" fill="none" />

      {/* the feed main along the top, down to the airlock's collar */}
      <path d="M0 64 H236 V138" stroke="#1a1f22" strokeWidth="11" fill="none" />
      <path d="M0 64 H236 V138" stroke="url(#at-iron)" strokeWidth="8" fill="none" />
      <path d="M0 61.5 H233" stroke="#9fb6b0" strokeWidth="1" opacity="0.3" />
      {[60, 150].map((x) => (
        <rect key={x} x={x - 3} y="57" width="6" height="14" rx="1" fill="#3a4246" />
      ))}
      {/* a stopcock on the feed pipe (no dial: a needle here would look like a hint for the tanks) */}
      <path d="M252 114 H236" stroke="#2a3034" strokeWidth="4" />
      <rect x="252" y="108" width="12" height="12" rx="2" fill="url(#at-brass)" stroke="#7a5f12" />
      <path d="M258 108 V100 M252 100 H264" stroke="#9a2a22" strokeWidth="2.5" strokeLinecap="round" />

      {/* three tanks */}
      <Shadow cx={105} cy={330} rx={84} ry={8} opacity={0.6} />
      <rect x="34" y="300" width="142" height="30" fill="url(#at-iron)" />
      <path d="M34 300 H176" stroke="#8a9a9c" strokeWidth="1" opacity="0.4" />
      <rect x="34" y="300" width="142" height="30" fill="url(#at-lock-plate)" opacity="0.8" />
      <rect x="34" y="318" width="142" height="12" fill="#000" opacity="0.3" />
      {caps.map((cap, i) => {
        const h = cap * 22;
        const y = 290 - h;
        const lv = levels[i];
        return (
          <g key={i}>
            <path d={`M${xs[i] + 18} ${y} V${y - 14} H${xs[i] + 40}`} stroke="#141a1c" strokeWidth="7" fill="none" />
            <path d={`M${xs[i] + 18} ${y} V${y - 14} H${xs[i] + 40}`} stroke="url(#at-iron)" strokeWidth="5" fill="none" />
            <rect x={xs[i] + 36} y={y - 18} width="5" height="8" rx="1" fill="#3a4246" />
            <circle cx={xs[i] + 18} cy={y - 7} r="4.5" fill="none" stroke="#9a3a2a" strokeWidth="1.8" />
            <rect x={xs[i]} y={y} width="36" height={h} rx="4" fill="url(#at-lock-tank)" stroke={i === 1 ? BRASS : "#7a8a8c"} strokeWidth="3" />
            {lv > 0 && (
              <>
                <rect x={xs[i] + 3} y={290 - lv * 22} width="30" height={lv * 22 - 2} fill="url(#at-water)" />
                <path d={`M${xs[i] + 3} ${291 - lv * 22} h30`} stroke="#d8fbf4" strokeWidth="1.2" opacity="0.8" />
                <circle cx={xs[i] + 12} cy={284 - lv * 8} r="1.2" fill="none" stroke="#d8fbf4" strokeWidth="0.5" opacity="0.7" />
                <circle cx={xs[i] + 22} cy={286 - lv * 4} r="0.9" fill="none" stroke="#d8fbf4" strokeWidth="0.5" opacity="0.7" />
              </>
            )}
            {/* the glass catches the lamp */}
            <rect x={xs[i] + 6} y={y + 6} width="3" height={h - 14} rx="1.5" fill="#e8fff8" opacity="0.18" />
            {/* brass bands top and bottom */}
            <rect x={xs[i] - 2} y={y - 2} width="40" height="6" rx="2" fill="url(#at-brass)" />
            <rect x={xs[i] - 2} y="286" width="40" height="6" rx="2" fill="url(#at-brass)" />
          </g>
        );
      })}
      <rect x="30" y="292" width="150" height="8" fill="url(#at-iron)" />
      {/* barnacles crusting the base */}
      {[[40, 300], [48, 302], [170, 301], [128, 304], [134, 302]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="#b8bfae" stroke="#5a5e52" strokeWidth="0.6" />
      ))}

      {/* the round glass airlock: an iron collar, a brass bezel, the sea (or the reading room) behind */}
      <circle cx="236" cy="200" r="64" fill="#0d1517" />
      <circle cx="236" cy="200" r="62" fill="url(#at-iron)" />
      <circle cx="236" cy="200" r="62" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
      {bolts.map((a, i) => (
        <circle key={i} cx={236 + Math.cos(a) * 57} cy={200 + Math.sin(a) * 57} r="2" fill="#6a767a" stroke="#1a1f22" strokeWidth="0.6" />
      ))}
      <circle cx="236" cy="200" r="50" fill={open ? "#0a1414" : "url(#at-water)"} stroke="url(#at-brass)" strokeWidth="8" />
      {open ? (
        <>
          {/* beyond: the dry reading room, green lamplight */}
          <circle cx="236" cy="200" r="46" fill="url(#at-lock-beyond)" />
          <g clipPath="url(#at-lock-glass)">
            <rect x="196" y="210" width="80" height="40" fill="#0b1a14" />
            <path d="M204 172 v40 M214 172 v40 M262 168 v44 M272 168 v44" stroke="#2a1a10" strokeWidth="6" />
            <circle cx="244" cy="186" r="14" fill="#6af0a8" opacity="0.35" filter="url(#at-soft)" />
            <path d="M238 176 h12 l-3 8 h-6 z" fill="#3fae6a" />
          </g>
          <ellipse cx="236" cy="252" rx="40" ry="6" fill="#6af0a8" opacity="0.18" filter="url(#at-soft)" />
          <ellipse cx="200" cy="200" rx="12" ry="50" fill="#9fc6c4" opacity="0.5" stroke={BRASS_DK} strokeWidth="3" />
        </>
      ) : (
        <>
          <g clipPath="url(#at-lock-glass)">
            <Caustics x={186} y={150} w={100} h={100} opacity={0.35} seed={41} />
            <Bubbles x={196} y={160} w={80} h={90} count={10} seed={42} />
          </g>
          <path d="M200 190 Q236 176 272 190" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.6" />
        </>
      )}
      <path d="M206 170 Q220 156 240 154" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.18" strokeLinecap="round" />
      {/* the hinge */}
      <rect x="170" y="186" width="10" height="28" rx="2" fill="url(#at-brass)" stroke={BRASS_DK} />
      {/* sea-light rippling out over the iron round the porthole */}
      <Caustics x={170} y={130} w={130} h={150} opacity={0.12} seed={44} />
      {/* sea-light spilling through the glass onto the grating */}
      <ellipse cx="236" cy="352" rx="52" ry="10" fill="#7cf2c8" opacity="0.1" filter="url(#at-soft)" />

      {/* a diver's helmet left on the grating, its hose trailing off */}
      <Shadow cx={250} cy={354} rx={26} ry={5} />
      <path d="M182 352 q20 18 50 4" stroke="#3a3428" strokeWidth="4" fill="none" />
      <g>
        <path d="M228 352 q0 -34 24 -34 q24 0 24 34 z" fill="url(#at-brass)" stroke={BRASS_DK} />
        <circle cx="252" cy="336" r="9" fill="#0e1e20" stroke={BRASS_DK} strokeWidth="2.5" />
        <path d="M248 331 q3 -2 6 0" stroke="#bff3ea" strokeWidth="1" fill="none" opacity="0.6" />
        <rect x="224" y="350" width="56" height="5" rx="1.5" fill={BRASS_DK} />
        <path d="M238 324 q14 -8 28 0" stroke={BRASS_HI} strokeWidth="1" fill="none" opacity="0.6" />
      </g>
      {/* a puddle under the main */}
      <ellipse cx="60" cy="366" rx="34" ry="5" fill="#9fd9c8" opacity="0.14" />
      <Dust x={20} y={40} w={180} h={260} count={10} color="#c9fff0" seed={43} />
      <Grain />
      <Vignette />
    </>
  );
}

export function ArchiveHall({ s }: { s: WallState }) {
  const read = s.flags.includes("pelagic.glass.read");
  return (
    <>
      <ReadingRoom id="at-hall" ceiling={40} />
      <defs>
        <linearGradient id="at-hall-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cf2b0" stopOpacity="0.3" />
          <stop offset="1" stopColor="#7cf2b0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="at-hall-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f8f7a" />
          <stop offset="1" stopColor="#0c2e2a" />
        </linearGradient>
        <linearGradient id="at-hall-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e7e78" />
          <stop offset="0.45" stopColor="#a9bab2" />
          <stop offset="1" stopColor="#56645f" />
        </linearGradient>
        <clipPath id="at-hall-pane">
          <rect x="150" y="150" width="120" height="170" />
        </clipPath>
      </defs>
      {/* the sea pressing on the glass ceiling */}
      <GlassCeiling h={40} id="at-hall-ceil" />
      {/* bookcases at the edges of the hall */}
      <Bookcase x={0} y={150} w={22} h={176} rows={5} seed={51} />
      <Bookcase x={276} y={100} w={24} h={226} rows={6} seed={52} />
      {/* a cornice under the glass */}
      <rect y="132" width="150" height="6" fill="#0b1a16" />
      <path d="M0 131 H150" stroke="#7cf2b0" strokeWidth="0.8" opacity="0.25" />

      {/* the depth gauge, piped to the sea above */}
      <path d="M80 40 V52" stroke="#1a2022" strokeWidth="6" />
      <rect x="74" y="44" width="12" height="5" rx="1" fill="url(#at-brass)" />
      <circle cx="80" cy="85" r="40" fill="#0a1512" opacity="0.6" filter="url(#at-soft)" />
      <circle cx="80" cy="85" r="34" fill="url(#at-paper)" stroke="url(#at-brass)" strokeWidth="5" />
      <circle cx="80" cy="85" r="30" fill="none" stroke={BRASS_DK} strokeWidth="0.8" opacity="0.6" />
      <path d="M80 85 L100 74" stroke="#1b120b" strokeWidth="3" />
      <circle cx="80" cy="85" r="3.2" fill={BRASS_DK} />
      <path d="M58 66 Q66 56 80 54" stroke="#fff" strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round" />

      {/* green lamps, and their green light falling */}
      {[170, 210, 250].map((x) => (
        <path key={`cone-${x}`} d={`M${x - 8} 74 L${x + 8} 74 L${x + 30} 150 L${x - 30} 150 Z`} fill="url(#at-hall-cone)" className="at-breathe" />
      ))}
      {[170, 210, 250].map((x) => (
        <g key={x}>
          <path d={`M${x} 40 V62`} stroke="#2a3230" strokeWidth="1.4" />
          <circle cx={x} cy="80" r="26" fill="#5cf0a0" opacity="0.35" filter="url(#at-soft)" />
          <path d={`M${x - 3} 60 h6 v3 h-6 z`} fill={BRASS_DK} />
          <path d={`M${x - 10} 62 h20 l-4 14 h-12 z`} fill="#3fae6a" />
          <path d={`M${x - 13} 76 Q${x} 64 ${x + 13} 76 Z`} fill="#3fae6a" />
          <path d={`M${x - 8} 66 h4 l-2 9`} stroke="#b8ffd6" strokeWidth="1" fill="none" opacity="0.6" />
          <ellipse cx={x} cy="77" rx="7" ry="3" fill="#e0ffe9" className="at-flicker" />
          <circle cx={x} cy="80" r="16" fill="url(#at-teal-glow)" opacity="0.6" />
        </g>
      ))}

      {/* four statues of robed cartographers, each in its niche, each holding a stone compass */}
      {[42, 72, 102, 132].map((x) => (
        <g key={x}>
          <path d={`M${x - 14} 304 V190 Q${x} 168 ${x + 14} 190 V304 Z`} fill="#081410" />
          <path d={`M${x - 14} 304 V190 Q${x} 168 ${x + 14} 190 V304`} fill="none" stroke="#2f4a40" strokeWidth="1.5" />
          <Shadow cx={x} cy={300} rx={14} ry={3} opacity={0.7} />
          <rect x={x - 13} y="292" width="26" height="12" fill="#56645f" />
          <rect x={x - 13} y="292" width="26" height="2.5" fill="#a9bab2" opacity="0.6" />
          <path d={`M${x - 11} 292 L${x - 6} 200 Q${x} 194 ${x + 6} 200 L${x + 11} 292 Z`} fill="url(#at-hall-stone)" />
          <path d={`M${x - 2} 206 L${x - 4} 290 M${x + 3} 206 L${x + 5} 290`} stroke="#4a5853" strokeWidth="0.8" opacity="0.7" />
          {/* hooded head */}
          <path d={`M${x - 7} 202 Q${x - 8} 182 ${x} 181 Q${x + 8} 182 ${x + 7} 202 Z`} fill="#8a9a94" />
          <ellipse cx={x} cy="194" rx="4" ry="5" fill="#5e6c67" />
          {/* arms folded round the compass */}
          <path d={`M${x - 8} 220 Q${x} 232 ${x + 8} 220`} stroke="#7a8a84" strokeWidth="3" fill="none" />
          <circle cx={x} cy="224" r="5" fill="#b6c6be" stroke="#5e6c67" strokeWidth="1" />
          <path d={`M${x} 220 V228`} stroke="#5e6c67" strokeWidth="0.8" />
          {/* green lamplight catching the hood */}
          <path d={`M${x - 5} 186 Q${x} 182 ${x + 5} 186`} stroke="#9ff3c4" strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      ))}

      {/* the glass wall, etched from the sea side */}
      <rect x="146" y="146" width="128" height="178" fill="#0b1513" />
      <rect x="150" y="150" width="120" height="170" fill="url(#at-hall-sea)" />
      <g clipPath="url(#at-hall-pane)">
        <Caustics x={140} y={150} w={140} h={170} opacity={0.3} seed={53} />
        {/* the wall of the sea outside, the sealed drawer set into it */}
        <rect x="150" y="282" width="120" height="40" fill="#0a2622" opacity="0.8" />
        <path d="M150 282 H270" stroke="#1d4a40" strokeWidth="1" />
        <Kelp x={158} y={322} h={70} lean={1} color="#245a3a" delay={-1} />
        <Kelp x={166} y={322} h={46} lean={-1} color="#2f6a44" delay={-2.5} />
        <Kelp x={262} y={322} h={80} lean={-1} color="#245a3a" delay={-4} />
      </g>
      <text x="210" y="230" textAnchor="middle" fontSize="12" fill="#e9fffa" opacity="0.4" transform="translate(420 0) scale(-1 1)">
        PULL THE THIRD TILE
      </text>
      {read && <rect x="196" y="290" width="40" height="18" fill="#2a1a10" stroke={BRASS} />}
      <rect x="150" y="150" width="120" height="170" fill="none" stroke="#7a8a8c" strokeWidth="4" />
      <path d="M156 160 L196 152 M156 176 L220 158" stroke="#fff" strokeWidth="2" opacity="0.1" strokeLinecap="round" />
      {s.takes.has("glass") && <Glint x={216} y={298} />}

      {/* a stack of damp books on the floor, and a drip from the ceiling into a puddle */}
      <Shadow cx={50} cy={366} rx={34} ry={5} />
      <rect x="22" y="352" width="54" height="10" rx="1" fill="#2a3b2a" />
      <rect x="28" y="343" width="46" height="9" rx="1" fill="#4a2a24" transform="rotate(-3 50 347)" />
      <rect x="25" y="334" width="40" height="9" rx="1" fill="#253642" />
      <path d="M26 357 H72 M30 348 H70" stroke="#d3c39c" strokeWidth="0.7" opacity="0.5" />
      <ellipse cx="248" cy="368" rx="26" ry="5" fill="#7cf2b0" opacity="0.14" />
      <ellipse cx="248" cy="368" rx="12" ry="2.5" fill="none" stroke="#bff3ea" strokeWidth="0.7" opacity="0.4" className="at-pulse" />
      {/* green lamplight on the runner */}
      <ellipse cx="200" cy="350" rx="70" ry="14" fill="#5cf0a0" opacity="0.1" filter="url(#at-soft)" />
      <Dust x={150} y={90} w={130} h={220} count={9} color="#c9ffe0" seed={55} />
      <Grain />
      <Vignette />
    </>
  );
}

export function ArchiveRegistry({ s }: { s: WallState }) {
  const open = s.flags.includes("pelagic.desk.open");
  const books = [
    { x: 60, c: "#7a2a22" },
    { x: 150, c: "#2f6a3a" },
    { x: 240, c: "#22507a" },
  ];
  return (
    <>
      <ReadingRoom id="at-reg" ceiling={30} />
      <GlassCeiling h={30} id="at-reg-ceil" />
      {/* the registry shelves: the whole back wall, damp to the cornice */}
      <Bookcase x={8} y={44} w={284} h={190} rows={4} seed={61} />
      <rect x="0" y="236" width="300" height="94" fill="#0c1a16" />
      <rect x="0" y="236" width="300" height="94" fill="url(#at-planks)" opacity="0.5" />
      <path d="M0 236 H300" stroke="#3b2616" strokeWidth="4" />
      <rect y="30" width="300" height="206" fill="#000" opacity="0.35" />
      {/* green lamps hanging between the stands */}
      {[105, 195].map((x) => (
        <g key={x}>
          <path d={`M${x} 30 V58`} stroke="#2a3230" strokeWidth="1.4" />
          <GreenLamp x={x} y={56} r={46} shade={16} />
        </g>
      ))}
      <Caustics x={0} y={40} w={300} h={180} opacity={0.08} seed={62} />

      {/* three registries on their stands */}
      {books.map((b) => (
        <g key={b.x}>
          <ellipse cx={b.x} cy="150" rx="40" ry="26" fill="#5cf0a0" opacity="0.1" filter="url(#at-soft)" />
          <Shadow cx={b.x} cy={210} rx={22} ry={3} opacity={0.6} />
          <rect x={b.x - 3} y="158" width="6" height="44" fill="url(#at-wood)" />
          <path d={`M${b.x - 8} 172 h16`} stroke="#2a180c" strokeWidth="2" />
          <path d={`M${b.x - 18} 208 L${b.x - 14} 200 H${b.x + 14} L${b.x + 18} 208 Z`} fill="#3b2414" />
          <rect x={b.x - 16} y="200" width="32" height="6" fill="#3b2414" />
          <path d={`M${b.x - 30} 150 L${b.x} 140 L${b.x + 30} 150 V160 H${b.x - 30} Z`} fill={b.c} stroke="#111" />
          <path d={`M${b.x - 26} 148 L${b.x} 139 L${b.x + 26} 148`} stroke="url(#at-paper)" strokeWidth="3" fill="none" />
          <path d={`M${b.x - 25} 151 L${b.x - 1} 143 M${b.x + 1} 143 L${b.x + 25} 151`} stroke="#f2e8cf" strokeWidth="2.4" opacity="0.8" />
          <path d={`M${b.x + 4} 144 v20`} stroke={b.c} strokeWidth="1.6" />
          <path d={`M${b.x - 29} 160 H${b.x + 29}`} stroke="#000" strokeOpacity="0.4" strokeWidth="1" />
        </g>
      ))}

      {/* the registrar's desk */}
      <Shadow cx={150} cy={332} rx={92} ry={8} opacity={0.65} />
      <rect x="70" y="240" width="160" height="90" rx="4" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      <rect x="80" y="300" width="64" height="24" rx="2" fill="none" stroke="#2a180c" strokeWidth="1.5" opacity="0.8" />
      <rect x="156" y="300" width="64" height="24" rx="2" fill="none" stroke="#2a180c" strokeWidth="1.5" opacity="0.8" />
      <path d="M72 244 H228" stroke="#8a6440" strokeWidth="1" opacity="0.5" />
      {[74, 226].map((x) => (
        <rect key={x} x={x - 4} y="320" width="8" height="10" fill="url(#at-brass)" />
      ))}
      {open && <rect x="74" y="232" width="152" height="10" fill="#0e0805" />}
      <rect x={open ? 76 : 70} y={open ? 214 : 232} width="160" height="14" rx="3" fill="#5b3a22" stroke="#2a180c" transform={open ? "rotate(-8 76 228)" : undefined} />
      <rect x="126" y="258" width="48" height="6" rx="1" fill="url(#at-brass)" opacity="0.85" />
      <rect x="110" y="270" width="80" height="22" rx="3" fill="#1b120b" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={122 + i * 19} cy="281" r="6" fill="url(#at-brass)" />
      ))}
      <ellipse cx="150" cy="268" rx="60" ry="14" fill="#5cf0a0" opacity="0.07" filter="url(#at-soft)" />
      {s.takes.has("desk") && <Glint x={150} y={252} />}

      {/* loose pages blown across the floor, a bucket catching the drip */}
      <g opacity="0.85">
        <path d="M24 356 l26 -4 l4 14 l-26 4 z" fill="url(#at-paper)" />
        <path d="M244 372 l24 3 l-2 13 l-24 -3 z" fill="url(#at-paper)" />
        <path d="M29 360 l18 -3 M30 364 l16 -2.5" stroke="#8a7a5a" strokeWidth="0.6" />
      </g>
      <Shadow cx={262} cy={348} rx={16} ry={3} />
      <path d="M250 330 L253 348 H271 L274 330 Z" fill="#3a4246" />
      <ellipse cx="262" cy="330" rx="12" ry="3" fill="#0b1a16" stroke="#5a6266" />
      <ellipse cx="262" cy="330" rx="7" ry="1.6" fill="none" stroke="#bff3ea" strokeWidth="0.6" opacity="0.5" className="at-pulse" />
      <Dust x={20} y={60} w={260} h={250} count={10} color="#c9ffe0" seed={63} />
      <Grain />
      <Vignette />
    </>
  );
}
