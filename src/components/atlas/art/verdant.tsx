import type { ReactNode } from "react";
import { BRASS, BRASS_DK, BRASS_HI, Backdrop, Dust, FloorShade, GLYPH, Glint, Grain, GlyphRing, LightPool, LightShaft, Mottle, RING_ORDER, Shadow, Vignette, seeded, type WallState } from "./common";
// ---------------------------------------------------------------- the Verdant Archive

const LEAF = "#57a84e";
const LEAF_DK = "#2f6a2c";
const LEAF_HI = "#8fd37f";
const TERRACOTTA = "#a5643c";
const BOOKS = ["#6b2a1e", "#2c4a3a", "#3a3a5a", "#7a5a22", "#4a2a3a", "#5a6a3a", "#2a3a4a", "#8a6a3a"];

/** A pointed leaf, base at (x, y), pointing along angle a (degrees, 0 = up). */
function Leaf({ x, y, a, len = 12, w = 4, fill = LEAF }: { x: number; y: number; a: number; len?: number; w?: number; fill?: string }) {
  return (
    <path
      d={`M${x} ${y} q${-w} ${-len * 0.5} 0 ${-len} q${w} ${len * 0.5} 0 ${len} z`}
      fill={fill}
      transform={`rotate(${a} ${x} ${y})`}
    />
  );
}

/** Glasshouse ironwork over a green-lit library: misted panes, the garden beyond, a ribbed roof and a tiled floor. */
export function Glasshouse({ id, floorY = 330, shaft = 40, seed = 1 }: { id: string; floorY?: number; shaft?: number; seed?: number }) {
  const rnd = seeded(seed * 31 + 5);
  const sky = `at-${id}-sky`;
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8cf9c" />
          <stop offset="0.45" stopColor="#4f7d53" />
          <stop offset="1" stopColor="#1b3221" />
        </linearGradient>
      </defs>
      <Backdrop wall={["#1f3a28", "#0d1a10"]} floor="#3a2e1c" light="#e6ffd8" pattern="at-glass" floorY={floorY} />
      {/* daylight through misted glass, the jungle pressing on it from outside */}
      <rect width="300" height={floorY} fill={`url(#${sky})`} opacity="0.85" />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={i * 50 + rnd() * 30 - 10} cy={floorY - 40 - rnd() * 120} rx={40 + rnd() * 30} ry={50 + rnd() * 40} fill="#163020" opacity={0.5 + rnd() * 0.3} filter="url(#at-softer)" />
      ))}
      {/* panes: some fogged brighter, some streaked with condensation */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={Math.floor(rnd() * 6) * 50 + 2} y={Math.floor(rnd() * (floorY / 60)) * 60 + 2} width="46" height="56" fill="#eaffe0" opacity={0.05 + rnd() * 0.08} />
      ))}
      <g stroke="#e8fff0" strokeWidth="0.7" strokeLinecap="round" opacity="0.25">
        {Array.from({ length: 12 }, (_, i) => {
          const x = 4 + rnd() * 292;
          const y = 30 + rnd() * (floorY - 80);
          return <path key={i} d={`M${x} ${y} v${6 + rnd() * 14}`} />;
        })}
      </g>
      {/* the glazing: iron mullions and transoms */}
      <rect width="300" height={floorY} fill="url(#at-glass)" />
      <Mottle h={floorY} opacity={0.22} />
      {/* the roof: two curved iron ribs and their spandrel tracery */}
      <path d="M0 0 Q150 -40 300 0 V30 Q150 -10 0 30 Z" fill="#22301f" />
      <path d="M0 30 Q150 -10 300 30" stroke="#3d553d" strokeWidth="4" fill="none" />
      <path d="M0 33 Q150 -7 300 33" stroke="#8fbf86" strokeWidth="0.8" fill="none" opacity="0.35" />
      {[30, 90, 150, 210, 270].map((x) => (
        <circle key={x} cx={x} cy={x === 150 ? 8 : x === 90 || x === 210 ? 12 : 20} r="5" fill="none" stroke="#3d553d" strokeWidth="1.6" />
      ))}
      {/* sun through the roof, pollen turning in it */}
      <LightShaft x1={shaft} x2={shaft + 56} spread={70} y1={20} y2={floorY + 30} opacity={0.6} dust={12} seed={seed + 50} />
      {/* a low dwarf wall of old brick under the glass */}
      <rect y={floorY - 14} width="300" height="14" fill="#5a3a26" />
      <path d={`M0 ${floorY - 14} H300 M0 ${floorY - 7} H300`} stroke="#2a180c" strokeWidth="0.8" opacity="0.6" />
      {/* floor tiles running away from us, moss in the joints */}
      <g stroke="#1a1208" strokeOpacity="0.55" strokeWidth="1">
        {[-240, -120, -20, 60, 150, 240, 320, 420, 540].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.42} ${floorY} L${x} 400`} />
        ))}
        <path d={`M0 ${floorY + 14} H300 M0 ${floorY + 34} H300 M0 ${floorY + 62} H300`} />
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={rnd() * 300} cy={floorY + 8 + rnd() * 56} rx={10 + rnd() * 16} ry={2 + rnd() * 3} fill="#4f7a3a" opacity="0.45" />
      ))}
      {/* the humid haze where air meets earth */}
      <rect y={floorY - 50} width="300" height="70" fill="#d8ffcf" opacity="0.07" filter="url(#at-softer)" />
      <FloorShade floorY={floorY} />
    </>
  );
}

/** Ivy trailing down from the roof ribs (decoration only). */
function Ivy({ x, len, seed }: { x: number; len: number; seed: number }) {
  const rnd = seeded(seed);
  const pts = Array.from({ length: Math.floor(len / 14) }, (_, i) => [x + Math.sin(i * 1.3 + seed) * 5, 22 + i * 14] as const);
  return (
    <g>
      <path d={`M${x} 18 ${pts.map(([px, py]) => `L${px} ${py}`).join(" ")}`} stroke={LEAF_DK} strokeWidth="1.4" fill="none" />
      {pts.map(([px, py], i) => (
        <Leaf key={i} x={px} y={py} a={i % 2 ? 120 + rnd() * 30 : -120 - rnd() * 30} len={8 + rnd() * 4} w={3.5} fill={i % 3 ? LEAF_DK : "#3f8a3a"} />
      ))}
    </g>
  );
}

/** A foreground clump of broad fronds, close to us and swaying (decoration only). */
function Fronds({ x, y, flip = false, seed }: { x: number; y: number; flip?: boolean; seed: number }) {
  const rnd = seeded(seed);
  const s = flip ? -1 : 1;
  return (
    <g className="at-sway" style={{ animationDelay: `${-rnd() * 6}s` }}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (-60 + i * 22 + rnd() * 10) * s;
        const len = 46 + rnd() * 30;
        return <Leaf key={i} x={x} y={y} a={a} len={len} w={10 + rnd() * 4} fill={i % 2 ? "#14301a" : "#1d4424"} />;
      })}
      {Array.from({ length: 3 }, (_, i) => (
        <path key={i} d={`M${x} ${y} q${s * (10 + i * 8)} ${-30 - i * 6} ${s * (24 + i * 12)} ${-48 - i * 8}`} stroke="#2a5a2a" strokeWidth="0.8" fill="none" opacity="0.6" />
      ))}
    </g>
  );
}

/** A tall bookcase seen edge-on at a side of the wall, books swallowed by creepers. */
function Stacks({ x, w, y, h, seed }: { x: number; w: number; y: number; h: number; seed: number }) {
  const rnd = seeded(seed);
  const rows = Math.floor(h / 38);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#2a180c" />
      {Array.from({ length: rows }, (_, r) => {
        const sy = y + 6 + r * 38;
        let bx = x + 3;
        const books: ReactNode[] = [];
        while (bx < x + w - 6) {
          const bw = 4.5 + rnd() * 5;
          const bh = 22 + rnd() * 9;
          books.push(<rect key={bx} x={bx} y={sy + 32 - bh} width={bw} height={bh} fill={BOOKS[Math.floor(rnd() * BOOKS.length)]} opacity="0.9" />);
          bx += bw + 0.6;
        }
        return (
          <g key={r}>
            {books}
            <rect x={x} y={sy + 32} width={w} height="4" fill="url(#at-wood)" />
          </g>
        );
      })}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#1b0f07" strokeWidth="2" />
    </g>
  );
}

export function VerdantArrival({ s }: { s: WallState }) {
  return (
    <>
      <Glasshouse id="verdant-arrival" shaft={170} seed={1} />
      <Ivy x={26} len={90} seed={3} />
      <Ivy x={272} len={70} seed={4} />
      {/* shelves on either side, and a ladder against the right-hand stack */}
      <Stacks x={0} w={44} y={110} h={220} seed={5} />
      <Stacks x={256} w={44} y={110} h={220} seed={6} />
      <rect x="0" y="104" width="46" height="8" fill="url(#at-wood)" />
      <rect x="254" y="104" width="46" height="8" fill="url(#at-wood)" />
      <path d="M248 120 L270 330 M262 118 L284 330" stroke="#5c3d22" strokeWidth="3" />
      {[150, 180, 210, 240, 270, 300].map((y) => (
        <path key={y} d={`M${251 + (y - 120) * 0.105} ${y} h14`} stroke="#5c3d22" strokeWidth="2.2" />
      ))}
      {/* vines spilling over the stacks */}
      <path d="M4 108 C20 140 6 180 22 220 S14 280 30 320 M296 108 C282 150 296 190 280 240" stroke={LEAF_DK} strokeWidth="2" fill="none" />
      {[130, 160, 198, 232, 268, 300].map((y, i) => (
        <Leaf key={y} x={i % 2 ? 22 : 10} y={y} a={i % 2 ? 60 : -50} len={11} fill={i % 2 ? LEAF : LEAF_DK} />
      ))}
      {[140, 176, 214].map((y, i) => (
        <Leaf key={y} x={288} y={y} a={i % 2 ? -60 : -110} len={11} fill={LEAF_DK} />
      ))}

      {/* the gate home, overgrown, still humming behind you */}
      <Shadow cx={150} cy={332} rx={96} ry={8} opacity={0.6} />
      <path d="M84 332 L96 270 H204 L216 332 Z" fill="#3a3448" stroke="#14111a" strokeWidth="1.5" />
      <circle cx="150" cy="190" r="118" fill="url(#at-teal-glow)" opacity="0.35" className="at-breathe" />
      <circle cx="150" cy="190" r="86" fill="#08120a" stroke="#4a4458" strokeWidth="14" />
      <g stroke="#1a1622" strokeWidth="1.2" opacity="0.7">
        {Array.from({ length: 16 }, (_, i) => {
          const a = ((i * 22.5 + 11) * Math.PI) / 180;
          return <path key={i} d={`M${150 + Math.cos(a) * 79} ${190 + Math.sin(a) * 79} L${150 + Math.cos(a) * 93} ${190 + Math.sin(a) * 93}`} />;
        })}
      </g>
      <circle cx="150" cy="190" r="93" fill="none" stroke={BRASS_DK} strokeWidth="1.6" />
      <circle cx="150" cy="190" r="79" fill="none" stroke="#9ff3e4" strokeWidth="1" opacity="0.5" />
      <circle cx="150" cy="190" r="74" fill="url(#at-teal-glow)" opacity="0.3" className="at-pulse" />
      <GlyphRing cx={150} cy={190} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      {/* moss creeping over the stone */}
      <path d="M68 214 A86 86 0 0 0 96 258" stroke="#4f7a3a" strokeWidth="9" fill="none" opacity="0.7" />
      <path d="M206 120 A86 86 0 0 1 234 160" stroke="#4f7a3a" strokeWidth="7" fill="none" opacity="0.6" />
      {/* the original vines, now with their leaves */}
      <path d="M70 120 C90 150 60 200 84 250 M226 110 C214 160 240 210 216 262" stroke="#3f7a3a" strokeWidth="5" fill="none" />
      <path d="M70 120 C90 150 60 200 84 250 M226 110 C214 160 240 210 216 262" stroke={LEAF_HI} strokeWidth="1" fill="none" opacity="0.35" />
      <circle cx="80" cy="140" r="7" fill="#4f9a48" />
      <circle cx="222" cy="128" r="8" fill="#4f9a48" />
      {[
        [76, 166, -70],
        [72, 196, 60],
        [80, 228, -60],
        [222, 160, 70],
        [230, 196, -60],
        [224, 234, 70],
      ].map(([x, y, a]) => (
        <Leaf key={`${x}-${y}`} x={x} y={y} a={a} len={14} w={5} fill={a > 0 ? LEAF : "#3f8a3a"} />
      ))}

      {/* moss underfoot, a toppled pot, a stack of books sprouting a fern */}
      <path d="M0 330 Q75 312 150 330 T300 330 V340 H0 Z" fill="#355a2c" />
      <path d="M0 331 Q75 313 150 331 T300 331" stroke="#6faa5a" strokeWidth="1" fill="none" opacity="0.5" />
      {s.takes.has("verdant-gate") && (
        <g>
          <circle cx="92" cy="322" r="6" fill="#d8f4ff" opacity="0.5" stroke={BRASS} strokeWidth="2" />
          <path d="M97 325 l7 4" stroke={BRASS_DK} strokeWidth="2.5" strokeLinecap="round" />
          <Glint x={92} y={322} />
        </g>
      )}
      <g filter="url(#at-drop)">
        <rect x="8" y="350" width="44" height="9" rx="1" fill="#5a2a22" />
        <rect x="12" y="341" width="38" height="9" rx="1" fill="#2c4a3a" />
        <rect x="10" y="332" width="34" height="9" rx="1" fill="#3a3a5a" transform="rotate(-4 27 336)" />
      </g>
      <Fronds x={30} y={334} seed={7} />
      {/* a pot knocked on its side, soil spilling out */}
      <path d="M222 366 q10 -8 24 -4 q-8 8 -24 4 z" fill="#3a2a18" />
      <g filter="url(#at-drop)">
        <path d="M244 344 L276 349 V363 L244 368 Z" fill={TERRACOTTA} />
        <path d="M250 347 L272 350" stroke="#d89a6a" strokeWidth="1.5" opacity="0.4" />
        <ellipse cx="244" cy="356" rx="4.5" ry="13" fill="#b8744a" />
        <ellipse cx="244.5" cy="356" rx="2.6" ry="10" fill="#2a1a0c" />
      </g>
      <Fronds x={300} y={400} flip seed={8} />
      <Fronds x={0} y={400} seed={9} />
      <Dust x={40} y={40} w={220} h={280} count={10} color="#f4ffd8" seed={10} />
      <Grain />
      <Vignette />
    </>
  );
}

export function VerdantBeds({ s }: { s: WallState }) {
  const bloomed = s.flags.includes("verdant.seed.bloomed");
  return (
    <>
      <Glasshouse id="verdant-beds" shaft={120} seed={2} />
      <Ivy x={150} len={60} seed={11} />
      {/* a hanging basket from the roof */}
      <path d="M262 22 V40 M252 52 L262 40 L272 52" stroke="#2a2a2a" strokeWidth="1" fill="none" />
      <path d="M248 50 h28 q-2 14 -14 14 q-12 0 -14 -14 z" fill="#5a3a22" />
      <g className="at-sway" style={{ animationDuration: "7s" }}>
        {[200, 160, 130, 230].map((a, i) => (
          <Leaf key={a} x={256 + i * 4} y={54} a={a} len={13} w={4.5} fill={i % 2 ? LEAF : "#3f8a3a"} />
        ))}
        <path d="M252 60 q-4 18 2 30 M270 60 q6 14 0 28" stroke={LEAF_DK} strokeWidth="1.2" fill="none" />
        <Leaf x={254} y={90} a={200} len={9} fill={LEAF_DK} />
        <Leaf x={270} y={86} a={160} len={9} fill={LEAF_DK} />
      </g>

      {/* the potting bench the beds stand on */}
      <Shadow cx={150} cy={330} rx={140} ry={8} opacity={0.6} />
      <rect x="40" y="254" width="250" height="9" rx="1" fill="url(#at-wood)" stroke="#2a180c" />
      <path d="M42 255.5 H288" stroke="#8a6a4a" strokeWidth="0.8" opacity="0.5" />
      {[48, 278].map((x) => (
        <rect key={x} x={x} y="263" width="7" height="67" fill="#3b2414" />
      ))}
      <path d="M48 300 H285" stroke="#3b2414" strokeWidth="4" />

      {/* the spiral creeper on its cane */}
      <Shadow cx={99} cy={256} rx={22} ry={3} opacity={0.6} />
      <path d="M80 230 h38 l-3 24 h-32 z" fill={TERRACOTTA} />
      <rect x="78" y="228" width="42" height="7" rx="1" fill="#b8744a" />
      <path d="M86 238 V250" stroke="#d89a6a" strokeWidth="2" opacity="0.35" />
      <ellipse cx="99" cy="229" rx="18" ry="2.5" fill="#2a1a0c" />
      <path d="M99 230 V70" stroke="#8a6a3a" strokeWidth="3" />
      <path d="M100 230 V70" stroke="#c9a46a" strokeWidth="0.8" opacity="0.5" />
      <path d="M99 225 C80 210 118 195 99 180 C80 165 118 150 99 135 C80 120 118 105 99 90" stroke="#3f8a3a" strokeWidth="3" fill="none" />
      <path d="M99 225 C80 210 118 195 99 180 C80 165 118 150 99 135 C80 120 118 105 99 90" stroke={LEAF_HI} strokeWidth="0.8" fill="none" opacity="0.45" />
      {/* a curl of tendril at the tip, no leaf */}
      <path d="M99 90 q-4 -6 1 -10 q5 -2 3 3" stroke="#3f8a3a" strokeWidth="1.4" fill="none" />
      {[200, 172, 148, 128, 110, 96].map((y, i) => (
        <g key={y} transform={`rotate(${i % 2 ? 30 : -30} ${i % 2 ? 112 : 86} ${y})`}>
          <ellipse cx={i % 2 ? 112 : 86} cy={y} rx="9" ry="5" fill="#57a84e" />
          <path d={`M${(i % 2 ? 112 : 86) - 8} ${y} H${(i % 2 ? 112 : 86) + 8}`} stroke={LEAF_DK} strokeWidth="0.8" />
          <ellipse cx={i % 2 ? 112 : 86} cy={y - 2} rx="5" ry="1.4" fill={LEAF_HI} opacity="0.45" />
        </g>
      ))}
      {/* its growth record, hung on a string */}
      <path d="M99 146 L82 152" stroke="#d8ccb0" strokeWidth="0.8" />
      <g transform="rotate(-8 80 163)">
        <rect x="70" y="150" width="20" height="26" fill="url(#at-paper)" />
        <path d="M73 156 H87 M73 160 H85 M73 164 H87 M73 168 H84" stroke="#6a5a3a" strokeWidth="0.6" opacity="0.6" />
      </g>

      {/* the doubling fern, far too big for its pot */}
      <Shadow cx={218} cy={254} rx={26} ry={3} opacity={0.6} />
      <path d="M194 230 h48 l-3 22 h-42 z" fill={TERRACOTTA} />
      <rect x="192" y="228" width="52" height="6" rx="1" fill="#b8744a" />
      <path d="M200 236 V248" stroke="#d89a6a" strokeWidth="2" opacity="0.35" />
      <path d="M201 232 l2 -6 l3 6" stroke="#2a1a0c" strokeWidth="2" fill="none" />
      {/* the card tucked into its soil */}
      <rect x="226" y="214" width="12" height="15" fill="url(#at-paper)" transform="rotate(10 232 222)" />
      <g className="at-sway" style={{ animationDuration: "8s" }}>
        {Array.from({ length: 9 }, (_, i) => {
          const d = `M218 230 Q${170 + i * 12} ${160 - (i % 3) * 14} ${150 + i * 18} ${170 + (i % 2) * 10}`;
          return (
            <g key={i}>
              <path d={d} stroke="#3f8a3a" strokeWidth="7" strokeDasharray="1.6 1.4" fill="none" opacity="0.8" />
              <path d={d} stroke="#4f9a48" strokeWidth="2.2" fill="none" />
            </g>
          );
        })}
      </g>

      {/* gardener's things on the bench: gloves, a trowel, a book left open */}
      <g filter="url(#at-drop)">
        <path d="M128 252 q2 -8 10 -8 h10 l4 8 z" fill="#a8885a" />
        <path d="M142 244 l2 -6 M146 244 l3 -5" stroke="#a8885a" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M160 252 l18 -6" stroke="#7a8288" strokeWidth="5" strokeLinecap="round" />
        <path d="M178 246 l10 -3" stroke="#5a3a22" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M252 252 l14 -6 l18 6 z" fill="#d9c9a2" />
        <path d="M266 246 V252" stroke="#a8946a" strokeWidth="0.8" />
      </g>
      {/* a sack of soil slumped under the bench */}
      <g filter="url(#at-drop)">
        <path d="M232 330 q-6 -22 6 -34 q10 -6 22 0 q10 12 4 34 z" fill="#8a7454" />
        <path d="M240 298 q8 4 18 0" stroke="#5a4a32" strokeWidth="1.2" fill="none" />
      </g>

      {/* the bed of grey sand and the dormant seed */}
      <Shadow cx={150} cy={332} rx={58} ry={5} opacity={0.7} />
      <rect x="96" y="286" width="108" height="46" rx="3" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="1.5" />
      <rect x="100" y="290" width="100" height="40" rx="4" fill="#5a5a52" stroke="#3a3a32" strokeWidth="3" />
      <rect x="100" y="290" width="100" height="40" rx="4" fill="url(#at-sand)" opacity="0.5" />
      <path d="M104 296 Q150 291 196 296" stroke="#8a8a80" strokeWidth="1" fill="none" opacity="0.5" />
      {/* its label stake */}
      <path d="M186 298 V318" stroke="#5c3d22" strokeWidth="1.6" />
      <rect x="179" y="290" width="15" height="9" fill="url(#at-paper)" />
      {bloomed ? (
        <g>
          <LightPool cx={150} cy={292} r={40} color="#e9f6ff" opacity={0.5} />
          <circle cx="150" cy="292" r="22" fill="url(#at-glow)" className="at-pulse" />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx="150" cy="282" rx="5" ry="12" fill="#f3e9ff" transform={`rotate(${i * 60} 150 292)`} />
          ))}
          <circle cx="150" cy="292" r="4" fill="#f0d98a" />
          {s.takes.has("seed") && <Glint x={170} y={300} />}
        </g>
      ) : (
        <>
          <ellipse cx="150" cy="306" rx="9" ry="2" fill="#000" opacity="0.3" />
          <ellipse cx="150" cy="304" rx="6" ry="4" fill="#3a2a1a" />
          <path d="M147 302 q3 -1 5 1" stroke="#6a5a3a" strokeWidth="0.8" fill="none" />
        </>
      )}
      <Fronds x={0} y={400} seed={12} />
      <Fronds x={300} y={400} flip seed={13} />
      <Grain />
      <Vignette />
    </>
  );
}

export function VerdantShelves({ s }: { s: WallState }) {
  const open = s.flags.includes("verdant.index.open");
  return (
    <>
      <Glasshouse id="verdant-shelves" shaft={20} seed={3} />
      {/* the stacks either side, a library ladder hooked to the left one */}
      <Stacks x={0} w={60} y={150} h={180} seed={21} />
      <Stacks x={240} w={60} y={150} h={180} seed={22} />
      <rect x="0" y="144" width="62" height="8" fill="url(#at-wood)" />
      <rect x="238" y="144" width="62" height="8" fill="url(#at-wood)" />
      <path d="M14 150 L4 330 M34 150 L24 330" stroke="#6b4527" strokeWidth="2.6" />
      {[178, 210, 242, 274, 306].map((y) => (
        <path key={y} d={`M${14 - (y - 150) * 0.055} ${y} h20`} stroke="#6b4527" strokeWidth="2" />
      ))}
      {/* roots growing through the stacks */}
      <path d="M20 140 C40 200 10 260 30 330 M280 150 C260 210 290 270 270 330" stroke="#2a1a0c" strokeWidth="8" fill="none" />
      <path d="M20 140 C40 200 10 260 30 330 M280 150 C260 210 290 270 270 330" stroke="#5a4028" strokeWidth="6" fill="none" />
      <path d="M20 140 C40 200 10 260 30 330 M280 150 C260 210 290 270 270 330" stroke="#8a6a4a" strokeWidth="1.2" fill="none" opacity="0.5" transform="translate(-1.5 0)" />
      <path d="M30 230 q16 4 22 18 M272 260 q-14 6 -18 22" stroke="#5a4028" strokeWidth="2.5" fill="none" />

      {/* the painted sign over seven empty pots, hung from the roof */}
      <path d="M94 22 V46 M206 22 V46" stroke="#4a3a22" strokeWidth="1.5" />
      <rect x="80" y="44" width="140" height="70" rx="4" fill="#3b2414" stroke="#6b4527" strokeWidth="3" />
      <rect x="86" y="50" width="128" height="58" rx="2" fill="none" stroke="#2a180c" strokeWidth="1" />
      {[62, 78, 94].map((y) => (
        <path key={y} d={`M96 ${y} H204`} stroke="#e9d9a6" strokeWidth="2" opacity="0.8" />
      ))}
      <path d="M200 46 q14 10 10 30 M210 64 l6 -3" stroke={LEAF_DK} strokeWidth="1.3" fill="none" />
      <Leaf x={212} y={76} a={150} len={10} fill={LEAF_DK} />
      <Leaf x={206} y={58} a={60} len={9} fill="#3f8a3a" />
      <rect x="46" y="136" width="208" height="5" fill="url(#at-wood)" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <path d={`M${54 + i * 30} 122 h18 l-3 14 h-12 z`} fill={TERRACOTTA} />
          <rect x={53 + i * 30} y="120" width="20" height="4" rx="0.8" fill="#b8744a" />
          <ellipse cx={63 + i * 30} cy="121" rx="8" ry="1.3" fill="#2a1a0c" />
        </g>
      ))}

      {/* the index cabinet */}
      <Shadow cx={150} cy={352} rx={92} ry={7} opacity={0.7} />
      <g filter="url(#at-drop)">
        <rect x="70" y="150" width="160" height="200" rx="4" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      </g>
      <rect x="68" y="148" width="164" height="7" rx="1.5" fill="#4a2e18" />
      <path d="M72 158 H228" stroke="#8a6a4a" strokeWidth="0.8" opacity="0.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 82 + (i % 3) * 48;
        const y = 168 + Math.floor(i / 3) * 34;
        const dark = open && i % 4 === 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width="40" height="24" rx="2" fill={dark ? "#1b120b" : "#5b3a22"} stroke="#2a180c" />
            {dark ? (
              <path d={`M${x + 2} ${y + 3} H${x + 38}`} stroke="#000" strokeWidth="3" opacity="0.5" />
            ) : (
              <>
                <path d={`M${x + 1} ${y + 1.5} H${x + 39}`} stroke="#8a6a4a" strokeWidth="0.8" opacity="0.4" />
                <rect x={x + 13} y={y + 5} width="14" height="7" fill="none" stroke={BRASS_DK} strokeWidth="1" />
                <path d={`M${x + 16} ${y + 17} q4 4 8 0`} stroke={BRASS} strokeWidth="1.6" fill="none" />
              </>
            )}
          </g>
        );
      })}
      {/* the dial of seven glyph wheels, in a brass bezel */}
      <rect x="83" y="307" width="134" height="32" rx="4" fill="url(#at-brass)" />
      <rect x="86" y="310" width="128" height="26" rx="3" fill="#1b120b" />
      {RING_ORDER.map((g, i) => (
        <rect key={g} x={89 + i * 18} y="312" width="14" height="22" rx="2" fill="#2a1e14" />
      ))}
      <rect x="86" y="310" width="128" height="6" fill="#000" opacity="0.35" />
      {open && <rect x="86" y="310" width="128" height="26" rx="3" fill="#9ff3e4" opacity="0.1" />}
      {RING_ORDER.map((g, i) => (
        <text key={g} x={96 + i * 18} y="328" textAnchor="middle" fontSize="11" fill={open ? "#9ff3e4" : BRASS_HI}>
          {GLYPH[g]}
        </text>
      ))}
      {s.takes.has("cabinet") && <Glint x={150} y={190} />}

      {/* fallen books, and a reading lamp left burning on the floor */}
      <g filter="url(#at-drop)">
        <rect x="240" y="356" width="40" height="8" rx="1" fill="#2c4a3a" transform="rotate(-6 260 360)" />
        <rect x="246" y="347" width="32" height="8" rx="1" fill="#6b2a1e" />
        <path d="M232 378 l18 -8 l20 8 l-18 6 z" fill="url(#at-paper)" />
      </g>
      <LightPool cx={42} cy={356} r={44} flicker />
      <g filter="url(#at-drop)">
        <path d="M34 368 h16 l-2 -4 h-12 z" fill={BRASS_DK} />
        <path d="M42 364 V346" stroke={BRASS} strokeWidth="2" />
        <path d="M32 348 h20 l-5 -12 h-10 z" fill="#2c5a3a" />
        <path d="M34 348 h16" stroke="#ffe9a8" strokeWidth="1.5" opacity="0.8" />
      </g>
      <Fronds x={300} y={400} flip seed={23} />
      <Grain />
      <Vignette />
    </>
  );
}

export function VerdantRoots({ s }: { s: WallState }) {
  const open = s.flags.includes("verdant.door.open");
  const rnd = seeded(77);
  return (
    <>
      <Glasshouse id="verdant-roots" shaft={200} seed={4} floorY={352} />
      {/* the old wooden wall the roots have broken into */}
      <rect x="0" y="228" width="300" height="124" fill="url(#at-wood)" />
      <rect x="0" y="228" width="300" height="124" fill="url(#at-planks)" opacity="0.6" />
      <rect x="0" y="226" width="300" height="5" fill="#3b2414" />
      <path d="M0 231 H300" stroke="#000" strokeWidth="2" opacity="0.4" />
      <Mottle y={228} h={124} opacity={0.35} />
      <Ivy x={14} len={110} seed={31} />
      <Ivy x={288} len={90} seed={32} />

      {/* seven saplings on a ledge, roots plunging down the wall */}
      <Shadow cx={150} cy={134} rx={124} ry={4} opacity={0.6} />
      <rect x="30" y="120" width="240" height="12" fill="url(#at-wood)" />
      <path d="M30 121 H270" stroke="#8a6a4a" strokeWidth="0.8" opacity="0.5" />
      {[44, 256].map((x) => (
        <path key={x} d={`M${x} 132 l8 14 h-12 z`} fill="#3b2414" />
      ))}
      {RING_ORDER.map((g, i) => {
        const x = 50 + i * 33;
        const rootD = `M${x} 132 C${x + ((i % 3) - 1) * 20} 180 ${150 + (i - 3) * 14} 210 ${150 + (i - 3) * 10} 250`;
        return (
          <g key={g}>
            <path d={rootD} stroke="#24160a" strokeWidth="6" fill="none" />
            <path d={rootD} stroke="#5a4028" strokeWidth="3.5" fill="none" />
            <path d={rootD} stroke="#9a7a52" strokeWidth="0.8" fill="none" opacity="0.5" transform="translate(-0.8 0)" />
            {/* the sapling: a thin stem and a crown of leaves */}
            <g className="at-sway" style={{ animationDelay: `${-i * 0.8}s` }}>
              <path d={`M${x} 100 V70`} stroke="#5a4028" strokeWidth="1.4" />
              <path d={`M${x} 90 q-8 -20 0 -34 q8 14 0 34`} fill="#4f9a48" />
              <path d={`M${x} 88 V60`} stroke={LEAF_DK} strokeWidth="0.7" />
              <Leaf x={x} y={84} a={-55} len={11} w={3.5} fill="#3f8a3a" />
              <Leaf x={x} y={80} a={55} len={11} w={3.5} fill="#3f8a3a" />
            </g>
            <path d={`M${x - 8} 100 h16 l-3 20 h-10 z`} fill={TERRACOTTA} />
            <rect x={x - 9} y="98" width="18" height="4" rx="0.8" fill="#b8744a" />
            <ellipse cx={x} cy="99" rx="7" ry="1.2" fill="#2a1a0c" />
            <text x={x} y="114" textAnchor="middle" fontSize="9" fill={BRASS_HI}>
              {GLYPH[g]}
            </text>
          </g>
        );
      })}
      {/* fine rootlets (decoration) */}
      <g stroke="#3a2614" strokeWidth="0.7" fill="none" opacity="0.6">
        {Array.from({ length: 10 }, (_, i) => {
          const x = 60 + rnd() * 180;
          const y = 160 + rnd() * 70;
          return <path key={i} d={`M${x} ${y} q${4 - rnd() * 8} 6 ${6 - rnd() * 12} 12`} />;
        })}
      </g>

      {/* the little door the roots hold shut */}
      <Shadow cx={150} cy={352} rx={50} ry={5} opacity={0.6} />
      <rect x="104" y="248" width="92" height="104" rx="8" fill="#2a180c" />
      <rect x="110" y="254" width="80" height="96" rx="6" fill={open ? "#0b0703" : "url(#at-wood)"} stroke="#2a180c" strokeWidth="3" />
      {open ? (
        <>
          <ellipse cx="150" cy="320" rx="30" ry="20" fill="#2a1a0c" opacity="0.6" filter="url(#at-soft)" />
          <path d="M110 254 L94 264 V340 L110 350 Z" fill="url(#at-wood)" />
          <path d="M102 262 V344" stroke="#2a180c" strokeWidth="1" />
          <circle cx="99" cy="304" r="2.5" fill="none" stroke="#2a2a2a" strokeWidth="1.4" />
          <path d="M100 270 C80 280 70 300 60 330" stroke="#5a4028" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M130 256 V348 M150 256 V348 M170 256 V348" stroke="#2a180c" strokeWidth="1" opacity="0.6" />
          <path d="M112 272 H128 M112 330 H128" stroke="#2a2a2a" strokeWidth="3.5" />
          <circle cx="178" cy="304" r="4" fill="none" stroke="#2a2a2a" strokeWidth="1.8" />
          <path d="M100 270 C140 290 160 250 200 280 M98 320 C140 300 170 340 204 310" stroke="#24160a" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M100 270 C140 290 160 250 200 280 M98 320 C140 300 170 340 204 310" stroke="#5a4028" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M100 268 C140 288 160 248 200 278 M98 318 C140 298 170 338 204 308" stroke="#9a7a52" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5" />
        </>
      )}
      {s.takes.has("root-door") && <Glint x={150} y={300} />}

      {/* toadstools at the foot of the wall, a lantern on a hook, a trowel */}
      <g>
        <path d="M232 352 V344 M240 352 V340" stroke="#e8dcbc" strokeWidth="2" />
        <path d="M226 345 q6 -8 12 0 z M234 341 q6 -9 12 0 z" fill="#b8744a" />
      </g>
      <path d="M262 196 V214" stroke="#2a2a2a" strokeWidth="1.2" />
      <LightPool cx={262} cy={226} r={40} flicker />
      <rect x="255" y="214" width="14" height="20" rx="2" fill="#ffd27a" opacity="0.5" stroke="#2a2a2a" strokeWidth="1.6" />
      <g className="at-flame" style={{ transformOrigin: "262px 230px" }}>
        <path d="M262 220 q3.5 5 0 9 q-3.5 -4 0 -9 z" fill="#ffcf6b" />
      </g>
      <g filter="url(#at-drop)">
        <path d="M42 372 l22 -8" stroke="#7a8288" strokeWidth="5" strokeLinecap="round" />
        <path d="M64 364 l12 -4" stroke="#5a3a22" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <Fronds x={0} y={400} seed={33} />
      <Fronds x={300} y={400} flip seed={34} />
      <Dust x={30} y={60} w={240} h={260} count={8} color="#f4ffd8" seed={35} />
      <Grain />
      <Vignette />
    </>
  );
}
