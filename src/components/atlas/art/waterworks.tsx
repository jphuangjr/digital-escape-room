import { BRASS, BRASS_DK, BRASS_HI, Backdrop, Bubbles, Candle, Caustics, Dust, FloorShade, Glint, Grain, LightPool, LightShaft, Mottle, Shadow, Vignette, seeded, type WallState } from "./common";
// ---------------------------------------------------------------- the Waterworks

/** A soft wet or rusty streak running down stone or iron. */
function Streak({ x, y, h, w = 5, color = "#06100e", opacity = 0.4 }: { x: number; y: number; h: number; w?: number; color?: string; opacity?: number }) {
  return <path d={`M${x} ${y} q${w} ${h * 0.4} ${-w / 2} ${h}`} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" opacity={opacity} filter="url(#at-soft)" />;
}

/** Drops gathering and falling from a pipe joint or a roof, one after another. */
function Drips({ at, fall, seed }: { at: [number, number][]; fall: number; seed: number }) {
  const rnd = seeded(seed);
  return (
    <g pointerEvents="none">
      {at.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 1} rx="1.4" ry="1.8" fill="#bff3ea" opacity="0.7" />
          <ellipse
            cx={x}
            cy={y + 2}
            rx="1.1"
            ry="2"
            fill="#d8fbf4"
            className="at-rain"
            style={{ animationDelay: `${-rnd() * 2}s`, animationDuration: `${1.4 + rnd() * 1.4}s`, ["--fall" as string]: `${fall}px` }}
          />
        </g>
      ))}
    </g>
  );
}

/** A clump of moss clinging to wet stone or a pipe joint, a strand or two hanging from it. */
function Moss({ x, y, w = 14, flip = false }: { x: number; y: number; w?: number; flip?: boolean }) {
  const k = flip ? -1 : 1;
  return (
    <g>
      <ellipse cx={x} cy={y + 1} rx={w / 2} ry={w / 4.5} fill="#1f3f2a" opacity="0.9" />
      <ellipse cx={x - k * w * 0.15} cy={y} rx={w / 3} ry={w / 6} fill="#2f5a3a" />
      <ellipse cx={x + k * w * 0.2} cy={y - 0.5} rx={w / 5} ry={w / 9} fill="#4f8a52" opacity="0.7" />
      <path d={`M${x + k * w * 0.25} ${y + w / 5} q${k * 1} ${w / 4} 0 ${w / 2}`} stroke="#2f5a3a" strokeWidth="1" fill="none" opacity="0.7" />
    </g>
  );
}

/** The engine-room beneath the Observatory: wet green-grey stone, pipes along the vault, a tide line. */
function EngineRoom({ drained, floorY = 320 }: { drained: boolean; floorY?: number }) {
  return (
    <>
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" floorY={floorY} />
      <Mottle h={floorY} opacity={0.5} />
      <rect width="40" height={floorY} fill="#000" opacity="0.4" filter="url(#at-softer)" />
      <rect x="260" width="40" height={floorY} fill="#000" opacity="0.4" filter="url(#at-softer)" />
      {/* the tide line: where the flood has stood, and stood before */}
      <rect y={floorY - 70} width="300" height="70" fill="#07110f" opacity={drained ? 0.35 : 0.25} />
      <path d={`M0 ${floorY - 70} q40 3 80 0 t80 1 t80 -1 t60 1`} stroke="#9fc9bd" strokeWidth="1" fill="none" opacity="0.18" />
      {/* the floor: flags in perspective */}
      <g stroke="#000" strokeOpacity="0.35" strokeWidth="1">
        {[-220, -100, 10, 100, 200, 290, 400, 520].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.42} ${floorY} L${x} 400`} />
        ))}
        <path d={`M0 ${floorY + 24} H300 M0 ${floorY + 52} H300`} />
      </g>
      <FloorShade floorY={floorY} />
      {/* pipes run along the vault overhead */}
      <rect x="-5" y="10" width="310" height="14" fill="url(#at-iron)" />
      <path d="M0 12 H300" stroke="#8a969c" strokeWidth="1" opacity="0.4" />
      {[30, 130, 230].map((x) => (
        <g key={x}>
          <rect x={x} y="7" width="8" height="20" rx="1" fill="#2c3236" />
          <Streak x={x + 4} y={27} h={50 + (x % 7) * 6} w={4} color="#6a3412" opacity={0.4} />
        </g>
      ))}
    </>
  );
}

/** Standing floodwater over the floor, or the wet floor once it has gone. Draw after anything that stands on the floor. */
function FloorWater({ drained, floorY = 320, seed = 1 }: { drained: boolean; floorY?: number; seed?: number }) {
  const rnd = seeded(seed);
  if (drained)
    return (
      <g pointerEvents="none">
        {[0, 1, 2].map((i) => {
          const cx = 30 + rnd() * 240;
          const cy = floorY + 20 + rnd() * 60;
          const rx = 14 + rnd() * 26;
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={rx / 6} fill="#0c1513" opacity="0.6" />
              <path d={`M${cx - rx * 0.6} ${cy - rx / 14} q${rx * 0.6} -2 ${rx * 1.1} 0`} stroke="#9fd9cc" strokeWidth="0.8" fill="none" opacity="0.3" />
            </g>
          );
        })}
        <rect y={floorY} width="300" height={400 - floorY} fill="#9fd9cc" opacity="0.04" />
      </g>
    );
  return (
    <g pointerEvents="none">
      <rect y={floorY - 4} width="300" height={404 - floorY} fill="#1d5654" opacity="0.55" />
      <path d={`M0 ${floorY - 4} H300`} stroke="#bff3ea" strokeWidth="1.2" opacity="0.45" />
      <g className="at-shimmer" opacity="0.35">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = floorY + 8 + i * 15;
          const x = rnd() * 120;
          return <path key={i} d={`M${x} ${y} q20 -3 40 0 t40 0 M${x + 150} ${y + 6} q16 -2 32 0 t32 0`} stroke="#bff3ea" strokeWidth="0.9" fill="none" />;
        })}
      </g>
      <Caustics x={0} y={floorY - 60} w={300} h={56} opacity={0.16} seed={seed + 7} />
    </g>
  );
}

export function Valves({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  const open = (v: string) => s.flags.includes(`valve.${v}`);
  const valves = [
    { id: "intake", x: 80 },
    { id: "reservoir", x: 150 },
    { id: "outflow", x: 220 },
  ];
  return (
    <>
      <EngineRoom drained={drained} />
      {/* a grating in the vault: the Observatory's grey light leaks down */}
      <rect x="18" y="0" width="50" height="8" fill="#9fb6c4" opacity="0.3" />
      <path d="M24 0 V8 M32 0 V8 M40 0 V8 M48 0 V8 M56 0 V8 M64 0 V8" stroke="#111" strokeWidth="2" />
      <LightShaft x1={20} x2={66} spread={40} y1={24} y2={320} opacity={0.35} dust={8} seed={61} />

      {/* risers climbing from the main into the vault, with the sign screwed between them */}
      {[100, 200].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="24" width="14" height="190" fill="url(#at-valves-riser)" />
          <path d={`M${x - 4} 24 V210`} stroke="#8a969c" strokeWidth="1" opacity="0.35" />
          <rect x={x - 9} y="150" width="18" height="6" rx="1" fill="#2c3236" />
        </g>
      ))}

      {/* the standing orders: an enamel sign, chipped and rust-bloomed at the screws */}
      <rect x="96" y="47" width="116" height="82" rx="4" fill="#000" opacity="0.5" filter="url(#at-soft)" />
      <rect x="92" y="42" width="116" height="82" rx="4" fill="#e9e1c8" stroke="#8a7440" strokeWidth="3" />
      <rect x="97" y="47" width="106" height="72" rx="2" fill="none" stroke="#2a4a5a" strokeWidth="1" opacity="0.6" />
      {[58, 72, 86, 100, 112].map((y) => (
        <path key={y} d={`M104 ${y} H196`} stroke="#5a4a2a" strokeWidth="1.2" opacity="0.7" />
      ))}
      <path d="M92 70 l4 2 l-1 5 l-3 1 Z M208 98 l-5 1 l1 6 l4 1 Z M150 124 l2 -4 l6 1 l1 3 Z" fill="#2c3236" />
      <ellipse cx="99" cy="49" rx="6" ry="5" fill="#7a3a14" opacity="0.4" filter="url(#at-soft)" />
      <ellipse cx="201" cy="117" rx="6" ry="6" fill="#7a3a14" opacity="0.4" filter="url(#at-soft)" />
      {[
        [98, 48],
        [202, 48],
        [98, 118],
        [202, 118],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#5d646a" stroke="#25292c" strokeWidth="0.6" />
      ))}
      <path d="M96 46 L140 46" stroke="#fff" strokeWidth="1" opacity="0.4" />

      {/* a spanner hung on a nail, and a coil of hose */}
      <g filter="url(#at-drop)">
        <circle cx="262" cy="70" r="1.6" fill="#111" />
        <path d="M262 72 L258 134" stroke="url(#at-iron)" strokeWidth="5" strokeLinecap="round" />
        <path d="M256 66 a7 7 0 1 0 12 2 l-4 1 l-2 4 l-4 -1 z" fill="#4a5258" />
        <path d="M258 134 a6 6 0 1 0 0.1 0" stroke="#4a5258" strokeWidth="4" fill="none" />
      </g>

      {/* the main: flanged iron, sweating and stained, turning down into the floor at both ends */}
      <Shadow cx={150} cy={246} rx={140} ry={6} opacity={0.5} />
      <defs>
        <linearGradient id="at-valves-riser" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1c2023" />
          <stop offset="0.3" stopColor="#6a747a" />
          <stop offset="1" stopColor="#15191c" />
        </linearGradient>
      </defs>
      {[8, 266].map((x) => (
        <g key={x}>
          <rect x={x} y="214" width="26" height="110" fill="url(#at-valves-riser)" />
          <rect x={x} y="214" width="26" height="110" fill="#5a2e14" filter="url(#at-mottle)" opacity="0.35" />
          <rect x={x - 2} y="296" width="30" height="6" rx="1" fill="#1e2326" />
        </g>
      ))}
      <rect x="20" y="210" width="260" height="26" fill="url(#at-iron)" />
      <path d="M20 213 H280" stroke="#9aa6ac" strokeWidth="1.2" opacity="0.45" />
      <path d="M20 234 H280" stroke="#000" strokeWidth="2" opacity="0.4" />
      <rect x="20" y="210" width="260" height="26" fill="#5a2e14" filter="url(#at-mottle)" opacity="0.4" />
      {[44, 115, 185, 256].map((x) => (
        <g key={x}>
          <rect x={x - 4} y="205" width="8" height="36" rx="1.5" fill="#2c3236" stroke="#15191c" />
          <path d={`M${x - 3} 207 V239`} stroke="#8a969c" strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
      <Streak x={115} y={238} h={60} w={4} color="#6a3412" />
      <Streak x={185} y={238} h={40} w={3} color="#6a3412" />

      {valves.map((v) => (
        <g key={v.id}>
          {/* stem and gland */}
          <rect x={v.x - 6} y="180" width="12" height="32" fill="#2c3236" />
          <path d={`M${v.x - 4} 180 V210`} stroke="#8a969c" strokeWidth="1" opacity="0.35" />
          <path d={`M${v.x - 10} 202 h20 l-2 8 h-16 z`} fill="url(#at-brass)" />
          <circle cx={v.x + 3} cy="180" r="25" fill="#000" opacity="0.45" filter="url(#at-soft)" />
          <g transform={`rotate(${open(v.id) ? 45 : 0} ${v.x} 176)`}>
            <circle cx={v.x} cy="176" r="24" fill="none" stroke="#5e1a14" strokeWidth="7" />
            <circle cx={v.x} cy="176" r="24" fill="none" stroke="#9a2b22" strokeWidth="5" />
            <path d={`M${v.x - 24} 176 H${v.x + 24} M${v.x} 152 V200`} stroke="#9a2b22" strokeWidth="4" />
            <path d={`M${v.x - 24} 175 H${v.x + 24} M${v.x - 1} 152 V200`} stroke="#d0574a" strokeWidth="0.8" opacity="0.5" />
            <path d={`M${v.x - 21} 166 A23 23 0 0 1 ${v.x - 6} 153`} stroke="#e07a6a" strokeWidth="1.4" fill="none" opacity="0.55" />
            <path d={`M${v.x + 8} 198 A23 23 0 0 0 ${v.x + 22} 184`} stroke="#3a0e0a" strokeWidth="1.4" fill="none" opacity="0.6" />
          </g>
          <circle cx={v.x} cy="176" r="6.5" fill="url(#at-brass-ball)" stroke={BRASS_DK} />
          <circle cx={v.x} cy="176" r="2" fill={BRASS_DK} />
          {/* the brass tag, wired to the main */}
          <path d={`M${v.x - 14} 236 L${v.x - 10} 244 M${v.x + 14} 236 L${v.x + 10} 244`} stroke="#8a969c" strokeWidth="0.8" />
          <rect x={v.x - 22} y="244" width="44" height="14" rx="2" fill="url(#at-brass)" />
          <rect x={v.x - 19} y="247" width="38" height="8" rx="1" fill="none" stroke={BRASS_DK} strokeWidth="0.7" opacity="0.7" />
          <circle cx={v.x - 18} cy="251" r="1" fill={BRASS_DK} />
          <circle cx={v.x + 18} cy="251" r="1" fill={BRASS_DK} />
          <path d={`M${v.x - 20} 245.5 H${v.x + 8}`} stroke={BRASS_HI} strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}

      {/* a candle stuck in its own wax on the elbow of the main */}
      <path d="M262 210 q6 -3 12 0 v3 h-12 z" fill="#e4d6b4" />
      <Candle x={268} y={210} h={14} />
      <path d="M266 198 q-1 4 0 8" stroke="#d8ccb0" strokeWidth="1.2" fill="none" />

      {/* still leaking while the room is flooded */}
      {!drained && (
        <>
          <path d="M33 236 q8 26 2 70 M267 236 q-8 36 0 76" stroke="#7fc6bf" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M33 236 q8 26 2 70" stroke="#d8fbf4" strokeWidth="0.8" fill="none" opacity="0.6" className="at-shimmer" />
          <Drips at={[[115, 241], [185, 241], [44, 241]]} fall={74} seed={62} />
        </>
      )}
      {drained && <Drips at={[[115, 241]]} fall={74} seed={63} />}

      {/* an oil can and a bucket by the riser */}
      <g filter="url(#at-drop)">
        <path d="M232 348 L236 318 H262 L266 348 Z" fill="url(#at-iron)" />
        <ellipse cx="249" cy="318" rx="13" ry="3" fill="#1a1d20" />
        <path d="M236 320 Q249 300 262 320" stroke="#5d646a" strokeWidth="1.2" fill="none" />
        <path d="M58 352 L61 336 H77 L80 352 Z" fill="#4a5258" />
        <path d="M61 336 L69 327 L77 336 Z" fill="#3a4246" />
        <path d="M69 329 L90 316" stroke="#3a4246" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M60 346 H78" stroke="#6a3412" strokeWidth="3" opacity="0.6" />
        <path d="M62 340 V350" stroke="#8a969c" strokeWidth="1" opacity="0.5" />
      </g>
      <Moss x={46} y={238} w={10} flip />
      <Moss x={254} y={238} w={10} />
      <FloorWater drained={drained} seed={64} />
      <Dust x={40} y={120} w={220} h={180} count={6} color="#c9fff3" seed={65} />
      <Grain />
      <Vignette />
    </>
  );
}

export function Tunnel({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  const mouth = "M76 330 V168 Q150 84 224 168 V330 Z";
  // the tunnel recedes toward a far doorway: each ring is the mouth scaled toward the vanishing point
  const rings = [0.78, 0.58, 0.42, 0.3];
  const vp = { x: 150, y: 236 };
  const ring = (k: number) => {
    const X = (x: number) => vp.x + (x - vp.x) * k;
    const Y = (y: number) => vp.y + (y - vp.y) * k;
    return `M${X(76)} ${Y(330)} V${Y(168)} Q${X(150)} ${Y(84)} ${X(224)} ${Y(168)} V${Y(330)}`;
  };
  return (
    <>
      <EngineRoom drained={drained} />
      {/* a pipe down the left wall, and a barrel and chain at the right */}
      <path d="M26 0 V320" stroke="#2c3236" strokeWidth="18" />
      <path d="M26 0 V320" stroke="url(#at-iron)" strokeWidth="14" />
      <path d="M22 0 V320" stroke="#8a969c" strokeWidth="1" opacity="0.35" />
      {[70, 180, 290].map((y) => (
        <rect key={y} x="14" y={y} width="24" height="7" rx="1" fill="#1e2326" />
      ))}
      <Streak x={28} y={77} h={60} w={4} color="#6a3412" />
      <Moss x={26} y={186} w={12} />
      <path d="M268 24 V110" stroke="#3a4246" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M268 110 q-6 6 0 12 q5 0 4 -6" stroke="#3a4246" strokeWidth="2" fill="none" />

      {/* the arch: dressed voussoirs and a keystone, black with wet */}
      <path d="M58 334 V164 Q150 50 242 164 V334 Z" fill="#000" opacity="0.5" filter="url(#at-soft)" />
      <path d="M62 330 V164 Q150 60 238 164 V330 Z" fill="#33423f" />
      <path d="M62 330 V164 Q150 60 238 164 V330 Z" fill="url(#at-stone)" />
      <g stroke="#0e1716" strokeWidth="1.2" opacity="0.7">
        {[0.12, 0.26, 0.4, 0.6, 0.74, 0.88].map((t) => {
          // points along the inner and outer curves
          const ix = (1 - t) ** 2 * 76 + 2 * (1 - t) * t * 150 + t * t * 224;
          const iy = (1 - t) ** 2 * 168 + 2 * (1 - t) * t * 84 + t * t * 168;
          const ox = (1 - t) ** 2 * 62 + 2 * (1 - t) * t * 150 + t * t * 238;
          const oy = (1 - t) ** 2 * 164 + 2 * (1 - t) * t * 60 + t * t * 164;
          return <path key={t} d={`M${ix} ${iy} L${ox} ${oy}`} />;
        })}
        <path d="M62 210 H76 M62 260 H76 M224 230 H238 M224 290 H238" />
      </g>
      <path d="M140 104 L144 128 H156 L160 104 Z" fill="#40524e" stroke="#0e1716" />
      <path d="M64 330 V166 Q150 64 236 166" stroke="#9fc9bd" strokeWidth="1" fill="none" opacity="0.2" />

      <defs>
        <clipPath id="at-tunnel-mouth">
          <path d={mouth} />
        </clipPath>
        <linearGradient id="at-tunnel-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1a18" />
          <stop offset="1" stopColor="#050b0a" />
        </linearGradient>
      </defs>
      <g clipPath="url(#at-tunnel-mouth)">
        <rect x="70" y="80" width="160" height="260" fill="url(#at-tunnel-depth)" />
        {/* the tunnel floor running away into the dark */}
        <path d={`M76 330 L${vp.x - 22} 262 H${vp.x + 22} L224 330 Z`} fill={drained ? "#14211f" : "#0b1716"} />
        {rings.map((k, i) => (
          <path key={k} d={ring(k)} fill="none" stroke="#2a3a37" strokeWidth={6 - i * 1.2} opacity={0.9 - i * 0.15} />
        ))}
        {drained ? (
          <>
            {/* at the far end a stair climbs toward warm light */}
            <path d="M140 262 V214 Q150 202 160 214 V262 Z" fill="#ffd98a" opacity="0.28" />
            <path d="M142 258 H158 M143 250 H157 M144 242 H156 M145 234 H155 M146 226 H154" stroke="#3a2e1a" strokeWidth="1.6" opacity="0.8" />
            <LightPool cx={150} cy={240} r={36} color="#ffd98a" opacity={0.25} />
            <path d="M132 300 Q150 290 168 300" stroke="#ffd98a" strokeWidth="1" fill="none" opacity="0.18" />
            {/* puddles holding the far light, and the grate that swallowed the flood */}
            <ellipse cx="122" cy="300" rx="16" ry="3" fill="#ffd98a" opacity="0.08" />
            <ellipse cx="176" cy="288" rx="10" ry="2" fill="#ffd98a" opacity="0.1" />
            <rect x="132" y="318" width="36" height="8" fill="#1e2a28" stroke="#33423f" />
            <path d="M138 318 V326 M144 318 V326 M150 318 V326 M156 318 V326 M162 318 V326" stroke="#050b0a" strokeWidth="2" />
            <Drips at={[[110, 150], [196, 170]]} fall={140} seed={71} />
            {s.takes.has("tunnel") && <Glint x={110} y={312} />}
          </>
        ) : (
          <>
            {/* flooded to the roof: the far doorway only a smudge through the water */}
            <path d="M140 262 V214 Q150 202 160 214 V262 Z" fill="#9ff3e4" opacity="0.12" />
            <rect x="70" y="80" width="160" height="260" fill="url(#at-water)" opacity="0.7" />
            {rings.map((k) => (
              <path key={k} d={ring(k)} fill="none" stroke="#06201e" strokeWidth="3" opacity="0.45" />
            ))}
            <LightPool cx={150} cy={236} r={50} color="#9ff3e4" opacity={0.2} />
            <Caustics x={76} y={190} w={148} h={140} opacity={0.22} seed={72} />
            <path d="M76 140 H224" stroke="#bff3ea" strokeWidth="1.5" opacity="0.5" />
            <path d="M80 141 Q115 135 150 141 T220 141" stroke="#e6fffa" strokeWidth="0.8" fill="none" opacity="0.5" className="at-shimmer" />
            <rect x="70" y="80" width="160" height="60" fill="#06100f" opacity="0.35" />
            <Bubbles x={90} y={150} w={120} h={170} count={9} seed={73} />
            <Glint x={112} y={300} />
          </>
        )}
      </g>
      {/* water still running off the keystone */}
      <Drips at={[[150, 128]]} fall={drained ? 194 : 12} seed={74} />
      <Moss x={70} y={172} w={12} flip />
      <Moss x={232} y={240} w={10} />

      {/* a barrel at the arch's foot */}
      <Shadow cx={268} cy={340} rx={28} ry={5} opacity={0.6} />
      <g filter="url(#at-drop)">
        <path d="M246 340 Q242 310 246 280 H290 Q294 310 290 340 Z" fill="url(#at-wood)" />
        <path d="M244 290 H292 M243 330 H293" stroke="#25292c" strokeWidth="3" />
        <path d="M258 280 V340 M272 280 V340" stroke="#2a180c" strokeWidth="0.8" opacity="0.6" />
        <ellipse cx="268" cy="280" rx="22" ry="4" fill="#3b2414" />
        <path d="M250 286 Q248 310 250 334" stroke="#a87a4a" strokeWidth="1" fill="none" opacity="0.5" />
      </g>
      <FloorWater drained={drained} seed={75} />
      <Grain />
      <Vignette />
    </>
  );
}

export function WaterWheel({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  const R = 88;
  return (
    <>
      <EngineRoom drained={drained} />
      {/* the wheel pit: a deep arched recess in the wall */}
      <path d="M36 300 V120 Q150 6 264 120 V300 Z" fill="#0a1413" />
      <path d="M36 300 V120 Q150 6 264 120 V300" fill="none" stroke="#33423f" strokeWidth="8" />
      <path d="M36 300 V120 Q150 6 264 120 V300" fill="none" stroke="#9fc9bd" strokeWidth="0.8" opacity="0.2" />
      {!drained && <Caustics x={40} y={60} w={220} h={180} opacity={0.12} seed={81} />}

      {/* the iron frame carrying the axle */}
      <path d="M150 200 L104 304 M150 200 L196 304" stroke="#1e2326" strokeWidth="9" strokeLinecap="round" />
      <path d="M150 200 L104 304 M150 200 L196 304" stroke="#5d646a" strokeWidth="1.2" opacity="0.5" />
      <path d="M122 262 H178" stroke="#1e2326" strokeWidth="5" />

      {/* the flume: a wooden trough bringing water over the top of the wheel, onto its descending side */}
      <path d="M0 70 L176 86 V96 L0 82 Z" fill="url(#at-wood)" stroke="#2a180c" />
      <path d="M0 70 L176 86" stroke="#a87a4a" strokeWidth="1" opacity="0.5" />
      <path d="M176 86 V96" stroke="#2a180c" strokeWidth="2" />
      {[30, 80, 130].map((x) => (
        <path key={x} d={`M${x} ${73 + x * 0.09} V${85 + x * 0.09}`} stroke="#2a180c" strokeWidth="2" />
      ))}
      <path d="M30 73 V0 M130 82 V0" stroke="#2a1a10" strokeWidth="2" opacity="0.7" />

      {/* the water channel at the foot */}
      <rect x="34" y="296" width="232" height="8" fill="#33423f" />
      <path d="M34 296 H266" stroke="#9fc9bd" strokeWidth="0.8" opacity="0.25" />
      <rect x="40" y="300" width="220" height="40" fill={drained ? "#18221f" : "url(#at-water)"} />

      {/* the wheel: oak rim, spokes and paddles, a shadow thrown on the pit wall */}
      <circle cx="156" cy="206" r={R} fill="none" stroke="#000" strokeWidth="18" opacity="0.4" filter="url(#at-soft)" />
      <g className={drained ? undefined : "at-spin"} style={{ transformBox: "view-box", transformOrigin: "150px 200px", animationDuration: "3s" }}>
        <circle cx="150" cy="200" r={R} fill="none" stroke="#3b2414" strokeWidth="13" />
        <circle cx="150" cy="200" r={R} fill="none" stroke="url(#at-wood)" strokeWidth="10" />
        <circle cx="150" cy="200" r={R - 4} fill="none" stroke="#25292c" strokeWidth="2" />
        <circle cx="150" cy="200" r={R + 4} fill="none" stroke="#25292c" strokeWidth="1.5" />
        <circle cx="150" cy="200" r={R - 30} fill="none" stroke="#4a3220" strokeWidth="3" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const px = 150 + Math.cos(a) * (R + 3);
          const py = 200 + Math.sin(a) * (R + 3);
          return (
            <g key={i}>
              <path d={`M150 200 L${150 + Math.cos(a) * R} ${200 + Math.sin(a) * R}`} stroke="#4a3220" strokeWidth="5" />
              <path d={`M150 200 L${150 + Math.cos(a) * R} ${200 + Math.sin(a) * R}`} stroke="#7a5432" strokeWidth="1" opacity="0.5" />
              <g transform={`rotate(${i * 30} ${px} ${py})`}>
                <rect x={px - 8} y={py - 8} width="16" height="16" fill="#5b3a22" stroke="#2a180c" strokeWidth="0.8" />
                <path d={`M${px - 7} ${py - 6} H${px + 7}`} stroke="#8a5c34" strokeWidth="1" opacity="0.6" />
              </g>
            </g>
          );
        })}
      </g>
      {/* the hub */}
      <circle cx="150" cy="200" r="27" fill="#000" opacity="0.4" />
      <circle cx="150" cy="200" r="24" fill="#2a1a10" stroke={BRASS_DK} strokeWidth="3" />
      <circle cx="150" cy="200" r="20" fill="none" stroke={BRASS} strokeWidth="0.8" opacity="0.5" />
      <path d="M134 188 A20 20 0 0 1 160 182" stroke={BRASS_HI} strokeWidth="1.2" fill="none" opacity="0.5" />
      {drained ? (
        <>
          <text x="150" y="210" textAnchor="middle" fontSize="26" fill={BRASS_HI}>
            ≈
          </text>
          {/* the flume runs dry; the channel is a wet trench */}
          <Drips at={[[176, 97], [90, 90]]} fall={190} seed={82} />
          <ellipse cx="110" cy="324" rx="30" ry="4" fill="#0c1513" opacity="0.7" />
          <ellipse cx="200" cy="330" rx="24" ry="3" fill="#9fd9cc" opacity="0.08" />
          <path d="M40 300 H260" stroke="#9fd9cc" strokeWidth="1" opacity="0.15" />
        </>
      ) : (
        <>
          {/* water pouring off the flume onto the paddles, sheeting down the descending side */}
          <defs>
            <linearGradient id="at-wheel-fall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bff3ea" stopOpacity="0.6" />
              <stop offset="1" stopColor="#bff3ea" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M164 94 H178 Q192 112 204 150 Q214 190 212 250 Q200 200 190 160 Q178 120 164 94 Z" fill="url(#at-wheel-fall)" />
          <path d="M168 96 Q184 116 196 160 M174 96 Q192 120 204 170 M178 96 Q198 126 210 200" stroke="#e6fffa" strokeWidth="0.9" fill="none" opacity="0.55" className="at-shimmer" />
          <ellipse cx="190" cy="118" rx="16" ry="7" fill="#e6fffa" opacity="0.25" filter="url(#at-soft)" />
          <Drips at={[[168, 97], [174, 97], [180, 98], [204, 150]]} fall={60} seed={83} />
          <path d="M226 290 q6 -10 14 -6 M230 292 q10 -4 16 2 M196 296 q4 -8 10 -6" stroke="#e6fffa" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M60 300 q30 -20 60 0 t60 0 t60 0" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M44 304 H256" stroke="#e6fffa" strokeWidth="1" opacity="0.4" className="at-shimmer" />
          <Bubbles x={50} y={302} w={200} h={30} count={8} seed={84} />
          <Dust x={60} y={260} w={180} h={50} count={10} color="#d8fbf4" seed={85} />
          <LightPool cx={150} cy={300} r={90} color="#9ff3e4" opacity={0.12} />
        </>
      )}
      <Moss x={40} y={150} w={12} flip />
      <Moss x={262} y={210} w={12} />
      <Moss x={60} y={298} w={14} />
      {/* a spare paddle board leaning by the pit */}
      <g filter="url(#at-drop)">
        <path d="M268 340 L280 262 L292 264 L282 342 Z" fill="#5b3a22" stroke="#2a180c" />
        <path d="M274 300 L286 302" stroke="#25292c" strokeWidth="2" />
      </g>
      <FloorWater drained={drained} seed={86} />
      <Grain />
      <Vignette />
    </>
  );
}
