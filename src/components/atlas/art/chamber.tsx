import { BRASS, BRASS_DK, BRASS_HI, Backdrop, Candle, Dust, FloorShade, GlyphRing, Grain, LightPool, LightShaft, Mottle, Shadow, Vignette, seeded, type WallState } from "./common";
// ---------------------------------------------------------------- the Threshold Chamber

const TEAL = "#9ff3e4";
const TEAL_HI = "#d6fff6";

/** The vault under the Observatory: violet-grey dressed stone, a ribbed ceiling, flagstones running away from us. */
function Vault({ powered, floorY, id }: { powered: boolean; floorY: number; id: string }) {
  const rnd = seeded(floorY * 7 + id.length);
  return (
    <>
      <Backdrop wall={["#2c2639", "#110e18"]} floor="#1d1925" light={powered ? TEAL : "#ffd98a"} floorY={floorY} />
      <Mottle h={floorY} opacity={0.5} />
      {/* the vault curves away into the dark at both sides */}
      <rect width="50" height={floorY} fill="#000" opacity="0.45" filter="url(#at-softer)" />
      <rect x="250" width="50" height={floorY} fill="#000" opacity="0.45" filter="url(#at-softer)" />
      {/* ceiling ribs */}
      <path d="M-20 92 Q150 -40 320 92" stroke="#0c0a12" strokeWidth="16" fill="none" opacity="0.85" />
      <path d="M-20 84 Q150 -48 320 84" stroke="#5a5268" strokeWidth="1.2" fill="none" opacity="0.45" />
      {/* a few cracked, weeping joints */}
      {Array.from({ length: 5 }, (_, i) => {
        const x = 20 + rnd() * 260;
        const y = 90 + rnd() * (floorY - 140);
        return <path key={i} d={`M${x} ${y} l${3 - rnd() * 6} ${8 + rnd() * 6} l${3 - rnd() * 6} ${6 + rnd() * 8}`} stroke="#07060a" strokeWidth="0.9" fill="none" opacity="0.55" />;
      })}
      {/* a stone skirting where wall meets floor */}
      <rect y={floorY - 10} width="300" height="10" fill="#241f2e" />
      <path d={`M0 ${floorY - 10} H300`} stroke="#4c4560" strokeWidth="0.8" opacity="0.6" />
      {/* flagstones in perspective */}
      <g stroke="#000" strokeOpacity="0.4" strokeWidth="1">
        {[-300, -150, -30, 70, 150, 230, 330, 450, 600].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.38} ${floorY} L${x} 400`} />
        ))}
        <path d={`M0 ${floorY + 16} H300 M0 ${floorY + 40} H300 M0 ${floorY + 74} H300`} />
      </g>
      <path d={`M0 ${floorY + 17} H300 M0 ${floorY + 41} H300`} stroke="#6c6480" strokeOpacity="0.12" strokeWidth="0.8" />
      {/* the floor takes the room's light */}
      <ellipse cx="150" cy={floorY + 24} rx="150" ry="26" fill={powered ? TEAL : "#ffcf8a"} opacity={powered ? 0.12 : 0.05} filter="url(#at-softer)" />
      <FloorShade floorY={floorY} />
    </>
  );
}

/** An iron wall lamp: dead glass until the engine runs, then a steady teal light. */
function WallLamp({ x, y, powered }: { x: number; y: number; powered: boolean }) {
  return (
    <g>
      {powered && <LightPool cx={x} cy={y + 6} r={34} color={TEAL} opacity={0.5} flicker />}
      <path d={`M${x} ${y - 16} V${y - 8} M${x - 7} ${y + 16} H${x + 7}`} stroke="#14111a" strokeWidth="3" />
      <path d={`M${x - 6} ${y - 8} H${x + 6} L${x + 8} ${y + 14} H${x - 8} Z`} fill={powered ? "#bff8ee" : "#1e2a2c"} stroke="#0c0a10" strokeWidth="1.5" />
      <path d={`M${x} ${y - 8} V${y + 14} M${x - 7} ${y + 3} H${x + 7}`} stroke="#0c0a10" strokeWidth="1" />
      {powered && <circle cx={x} cy={y + 3} r="3.2" fill="#fff" opacity="0.9" />}
      <path d={`M${x - 8} ${y - 8} H${x + 8}`} stroke={BRASS_DK} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** Heavy armoured cable with brass couplings, along a path. */
function Cable({ d, powered, w = 6 }: { d: string; powered: boolean; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#0b090f" strokeWidth={w + 2} />
      <path d={d} stroke="#3a3446" strokeWidth={w} />
      <path d={d} stroke="#6d6680" strokeWidth={w * 0.25} opacity="0.5" transform={`translate(0 ${-w * 0.22})`} />
      <path d={d} stroke={powered ? TEAL : "#000"} strokeWidth={w * 0.3} strokeDasharray="1.5 16" opacity={powered ? 0.8 : 0.3} className={powered ? "at-pulse" : undefined} />
    </g>
  );
}

export function Gate({ s }: { s: WallState }) {
  const powered = s.flags.includes("engine.on");
  const rnd = seeded(43);
  return (
    <>
      <defs>
        <linearGradient id="at-gate-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6c6480" />
          <stop offset="0.5" stopColor="#4a4458" />
          <stop offset="1" stopColor="#25202f" />
        </linearGradient>
        <radialGradient id="at-gate-void" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={powered ? "#1a4a48" : "#08070c"} />
          <stop offset="0.7" stopColor={powered ? "#0c2224" : "#0b0912"} />
          <stop offset="1" stopColor={powered ? "#06100f" : "#16121e"} />
        </radialGradient>
      </defs>
      <Vault powered={powered} floorY={300} id="gate" />
      {/* a little daylight leaks down the stair from the Observatory far above */}
      <LightShaft x1={-10} x2={30} spread={50} y1={0} y2={300} opacity={0.35} dust={6} seed={46} />
      <WallLamp x={22} y={118} powered={powered} />
      <WallLamp x={278} y={118} powered={powered} />
      {/* the threshold's light lying on the flagstones */}
      {powered && <ellipse cx="150" cy="318" rx="120" ry="16" fill={TEAL} opacity="0.18" filter="url(#at-softer)" />}

      {/* the power comes in from the engine along the floor */}
      <Cable d="M310 330 C270 326 252 316 232 296" powered={powered} w={7} />
      <Cable d="M310 346 C262 344 236 330 214 300" powered={powered} w={5} />

      {/* the stone saddle the ring stands in */}
      <Shadow cx={150} cy={302} rx={112} ry={9} opacity={0.7} />
      <path d="M64 300 L76 282 H224 L236 300 Z" fill="#2e2939" stroke="#0e0c13" strokeWidth="1.5" />
      <path d="M76 282 H224" stroke="#6c6480" strokeWidth="1" opacity="0.5" />
      <path d="M86 284 L94 252 H206 L214 284 Z" fill="url(#at-gate-stone)" stroke="#0e0c13" strokeWidth="1.5" />
      <path d="M94 252 H206" stroke="#8a82a0" strokeWidth="0.8" opacity="0.4" />

      {/* the gate's own light, when it hums */}
      {powered && <circle cx="150" cy="160" r="138" fill="url(#at-teal-glow)" opacity="0.55" className="at-breathe" />}

      {/* the great ring: carved stone voussoirs, bound in brass */}
      <circle cx="150" cy="160" r="104" fill="url(#at-gate-void)" stroke="url(#at-gate-stone)" strokeWidth="20" />
      <g stroke="#0e0c13" strokeWidth="1.4" opacity="0.7">
        {Array.from({ length: 18 }, (_, i) => {
          const a = ((i * 20 + 10) * Math.PI) / 180;
          return <path key={i} d={`M${150 + Math.cos(a) * 94} ${160 + Math.sin(a) * 94} L${150 + Math.cos(a) * 114} ${160 + Math.sin(a) * 114}`} />;
        })}
      </g>
      {/* chips and wear in the stone */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = rnd() * Math.PI * 2;
        const r = 97 + rnd() * 14;
        return <circle key={i} cx={150 + Math.cos(a) * r} cy={160 + Math.sin(a) * r} r={0.8 + rnd() * 1.2} fill="#0e0c13" opacity="0.5" />;
      })}
      <circle cx="150" cy="160" r="114.5" fill="none" stroke={BRASS_DK} strokeWidth="2.2" />
      <path d="M71 81 A112 112 0 0 1 229 81" stroke={BRASS_HI} strokeWidth="0.8" fill="none" opacity="0.4" />
      <circle cx="150" cy="160" r="94" fill="none" stroke={BRASS_DK} strokeWidth="2.4" />
      {/* the keystone */}
      <path d="M140 44 H160 L157 66 H143 Z" fill="url(#at-gate-stone)" stroke="#0e0c13" strokeWidth="1.4" />
      <path d="M142 46 H158" stroke="#9a92b0" strokeWidth="0.8" opacity="0.5" />
      {/* teal light catching the inner face of the stone */}
      {powered && <circle cx="150" cy="160" r="96" fill="none" stroke={TEAL} strokeWidth="3" opacity="0.35" filter="url(#at-soft)" />}

      {/* the threshold itself: still dark, or turning slowly with light */}
      {powered && (
        <g className="at-spin" opacity="0.5">
          <circle cx="150" cy="160" r="92" fill="none" stroke="none" />
          <path d="M150 74 A86 86 0 0 1 236 160" stroke={TEAL} strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M150 246 A86 86 0 0 1 64 160" stroke={TEAL} strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M100 100 A70 70 0 0 1 210 120" stroke={TEAL_HI} strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M200 220 A70 70 0 0 1 90 200" stroke={TEAL_HI} strokeWidth="0.8" fill="none" opacity="0.4" />
        </g>
      )}

      {/* the outer glyph ring: a brass track */}
      <circle cx="150" cy="160" r="78" fill="none" stroke={powered ? "#0e2426" : "#15121c"} strokeWidth="19" />
      <circle cx="150" cy="160" r="88" fill="none" stroke={powered ? TEAL : BRASS_DK} strokeWidth="3" />
      <circle cx="150" cy="160" r="68.5" fill="none" stroke={powered ? TEAL : BRASS_DK} strokeWidth="1" opacity="0.7" />
      <GlyphRing cx={150} cy={160} r={78} size={14} fill={powered ? TEAL_HI : "#8a7440"} />
      {/* the inner glyph ring */}
      <circle cx="150" cy="160" r="50" fill="none" stroke={powered ? "#0e2426" : "#15121c"} strokeWidth="16" />
      <circle cx="150" cy="160" r="62" fill="none" stroke={powered ? TEAL : BRASS_DK} strokeWidth="2" />
      <circle cx="150" cy="160" r="41.5" fill="none" stroke={powered ? TEAL : BRASS_DK} strokeWidth="1" opacity="0.7" />
      <GlyphRing cx={150} cy={160} r={50} size={11} fill={powered ? TEAL_HI : "#8a7440"} opacity={0.9} />
      {/* the hub */}
      <circle cx="150" cy="160" r="34" fill={powered ? "#0f2a2c" : "#06050a"} stroke={BRASS_DK} strokeWidth="1.5" />
      {powered ? <circle cx="150" cy="160" r="26" fill="url(#at-teal-glow)" className="at-pulse" /> : <circle cx="150" cy="160" r="26" fill="none" stroke="#2a2434" strokeWidth="0.8" />}

      {/* the lever, in its iron quadrant */}
      <path d="M250 304 A22 22 0 0 1 268 286" stroke="#0e0c13" strokeWidth="7" fill="none" />
      <rect x="254" y="294" width="16" height="12" rx="2" fill="url(#at-iron)" stroke="#0b090f" />
      <path d="M262 300 L250 230" stroke="url(#at-iron)" strokeWidth="8" strokeLinecap="round" />
      <path d="M260 296 L249.5 236" stroke="#8a929a" strokeWidth="1" opacity="0.5" />
      <rect x="248" y="260" width="10" height="4" rx="1" fill="url(#at-brass)" transform="rotate(-9 253 262)" />
      <circle cx="250" cy="228" r="9" fill={powered ? "#9a2b22" : "#5a2420"} />
      <circle cx="247" cy="225" r="2.6" fill="#fff" opacity="0.3" />

      {/* the ledger on its chain, open on a stone lectern */}
      <path d="M150 268 V300" stroke="#6a6474" strokeWidth="2" strokeDasharray="3 2" />
      <Shadow cx={150} cy={384} rx={38} ry={6} opacity={0.6} />
      <path d="M128 346 H172 L164 386 H136 Z" fill="url(#at-gate-stone)" stroke="#0e0c13" strokeWidth="1.2" />
      <path d="M132 384 H168" stroke="#0e0c13" strokeWidth="3" />
      <g filter="url(#at-drop)">
        <rect x="112" y="298" width="76" height="52" rx="3" fill="#6b2a1e" stroke="#2a110c" strokeWidth="2" />
        <rect x="118" y="304" width="64" height="40" fill="url(#at-paper)" opacity="0.92" />
      </g>
      <path d="M150 304 V344" stroke="#8a7440" />
      <g stroke="#6a5a3a" strokeWidth="0.8" opacity="0.55">
        {[311, 316, 321, 326, 331, 336].map((y, i) => (
          <path key={y} d={`M${123} ${y} H${144 - (i % 3) * 3} M${156} ${y} H${177 - ((i + 1) % 3) * 4}`} />
        ))}
      </g>
      <path d="M170 300 V356 l-3 -4 l-3 4 V302" fill="#7a1e1a" />

      {/* left behind: a candle stub, a coil of spare cable, a Cartographer's satchel */}
      <Candle x={36} y={356} h={12} />
      <ellipse cx="36" cy="357" rx="9" ry="2.5" fill="#d8ccb0" opacity="0.6" />
      <g filter="url(#at-drop)" fill="none" stroke="#3a3446" strokeWidth="4">
        <ellipse cx="74" cy="374" rx="20" ry="6" />
        <ellipse cx="74" cy="370" rx="17" ry="5" />
        <path d="M92 372 C104 376 104 388 120 392" />
      </g>
      <g filter="url(#at-drop)">
        <path d="M206 336 h36 l4 30 h-44 z" fill="#5a3a22" stroke="#2a180c" />
        <path d="M204 336 h40 v8 q-20 6 -40 0 z" fill="#6b4527" stroke="#2a180c" />
        <rect x="221" y="342" width="6" height="5" rx="1" fill="url(#at-brass)" />
        <path d="M210 336 q14 -18 28 0" stroke="#3b2414" strokeWidth="2" fill="none" />
      </g>
      <Dust x={20} y={40} w={260} h={300} count={14} seed={44} color={powered ? TEAL_HI : "#fff1c9"} />
      <Grain />
      <Vignette />
    </>
  );
}

export function Engine({ s }: { s: WallState }) {
  const geared = s.flags.includes("engine.geared");
  const on = s.flags.includes("engine.on");
  return (
    <>
      <Vault powered={on} floorY={322} id="engine" />
      <WallLamp x={22} y={126} powered={on} />
      <WallLamp x={278} y={126} powered={on} />

      {/* steam pipes climbing from the engine into the vault */}
      <g>
        {[66, 234].map((x) => (
          <g key={x}>
            <rect x={x - 6} y="0" width="12" height="144" fill="url(#at-iron)" />
            <path d={`M${x - 3} 0 V144`} stroke="#8a929a" strokeWidth="1" opacity="0.4" />
            {[34, 98].map((y) => (
              <rect key={y} x={x - 8} y={y} width="16" height="6" rx="1.5" fill="url(#at-brass)" />
            ))}
          </g>
        ))}
        <rect x="0" y="16" width="300" height="9" fill="url(#at-iron)" />
        <path d="M0 18 H300" stroke="#8a929a" strokeWidth="0.8" opacity="0.35" />
      </g>

      {/* the plaque, bolted to a dark backing plate */}
      <rect x="98" y="48" width="104" height="64" rx="5" fill="#120f18" />
      <rect x="100" y="50" width="100" height="60" rx="4" fill="url(#at-brass)" stroke={BRASS_DK} strokeWidth="2" />
      <rect x="104" y="54" width="92" height="52" rx="2" fill="none" stroke={BRASS_DK} strokeWidth="0.8" opacity="0.6" />
      {[68, 80, 92].map((y) => (
        <path key={y} d={`M114 ${y} H186`} stroke="#3a2c14" strokeWidth="2" />
      ))}
      {[68, 80, 92].map((y) => (
        <path key={y} d={`M114 ${y + 1.4} H186`} stroke={BRASS_HI} strokeWidth="0.6" opacity="0.5" />
      ))}
      {[
        [106, 56],
        [194, 56],
        [106, 104],
        [194, 104],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill={BRASS_DK} />
      ))}

      {/* cables out to the gate */}
      <Cable d="M54 286 C30 292 24 320 -10 334" powered={on} w={7} />
      <Cable d="M54 300 C38 306 30 340 -10 352" powered={on} w={5} />

      {/* the engine: iron housing, brass furniture, on two heavy skids */}
      <Shadow cx={150} cy={322} rx={118} ry={10} opacity={0.75} />
      {on && <circle cx="150" cy="225" r="120" fill="url(#at-teal-glow)" opacity="0.25" className="at-breathe" />}
      <g filter="url(#at-drop)">
        <rect x="58" y="300" width="40" height="22" rx="2" fill="#1a1d20" />
        <rect x="202" y="300" width="40" height="22" rx="2" fill="#1a1d20" />
        <rect x="50" y="140" width="200" height="170" rx="12" fill="url(#at-iron)" stroke="#111" strokeWidth="3" />
      </g>
      {/* the housing is rounded: lit along its left flank, dark down its right */}
      <path d="M54 170 V296" stroke="#aab2b8" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
      <rect x="226" y="164" width="22" height="140" rx="6" fill="#000" opacity="0.25" />
      <path d="M58 228 H242 M58 304 H242" stroke="#000" strokeWidth="1" opacity="0.35" />
      {!on && <ellipse cx="62" cy="290" rx="26" ry="40" fill="#ffcf8a" opacity="0.12" filter="url(#at-softer)" />}
      {/* top cowling with a brass trim and a row of rivets */}
      <path d="M53 160 H247" stroke="#111" strokeWidth="2" />
      <path d="M53 162 H247" stroke={BRASS_DK} strokeWidth="2" />
      <path d="M62 143 H238" stroke="#9aa2a8" strokeWidth="1" opacity="0.35" />
      {Array.from({ length: 13 }, (_, i) => (
        <circle key={i} cx={62 + i * 14.7} cy="151" r="1.4" fill="#0e1012" />
      ))}
      {/* a pilot lamp and a pressure gauge riding on the cowling */}
      <circle cx="68" cy="176" r="6" fill="#111" />
      <circle cx="68" cy="176" r="4" fill={on ? TEAL : "#3a1a16"} className={on ? "at-pulse" : undefined} />
      <circle cx="66.5" cy="174.5" r="1.2" fill="#fff" opacity="0.5" />
      <circle cx="232" cy="178" r="11" fill="url(#at-brass)" />
      <circle cx="232" cy="178" r="8.5" fill="#e8e0c8" />
      <path d="M225 182 A8 8 0 0 1 228 172" stroke="#4a8a5a" strokeWidth="2" fill="none" />
      <path d="M236 172 A8 8 0 0 1 239 182" stroke="#9a2b22" strokeWidth="2" fill="none" />
      <path d={on ? "M232 178 L235 171" : "M232 178 L226 181"} stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      {/* the three glyph windows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {on && <circle cx={100 + i * 50} cy="190" r="28" fill="url(#at-teal-glow)" opacity="0.7" />}
          <circle cx={100 + i * 50} cy="190" r="24" fill="url(#at-brass)" stroke={BRASS_DK} strokeWidth="1" />
          <circle cx={100 + i * 50} cy="190" r="20" fill="#14171a" stroke={on ? TEAL : BRASS} strokeWidth="3" />
          <text x={100 + i * 50} y="196" textAnchor="middle" fontSize="16" fill={on ? TEAL_HI : BRASS_HI}>
            {on ? ["✶", "≈", "◈"][i] : "·"}
          </text>
          <path d={`M${88 + i * 50} 182 A13 13 0 0 1 ${98 + i * 50} 177`} stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.25" />
        </g>
      ))}
      {/* a brass rail between the windows and the drive */}
      <path d="M58 224 H242" stroke="#0e1012" strokeWidth="3" />
      <path d="M58 222.5 H242" stroke={BRASS} strokeWidth="1" opacity="0.6" />
      {/* two brass cylinders flank the drive */}
      {[64, 214].map((x) => (
        <g key={x}>
          <rect x={x} y="234" width="22" height="62" rx="4" fill="url(#at-brass)" stroke={BRASS_DK} />
          <rect x={x - 2} y="240" width="26" height="4" rx="1" fill={BRASS_DK} />
          <rect x={x - 2} y="284" width="26" height="4" rx="1" fill={BRASS_DK} />
          <path d={`M${x + 5} 246 V282`} stroke={BRASS_HI} strokeWidth="1.5" opacity="0.6" />
        </g>
      ))}
      {/* the gear spindle */}
      <circle cx="150" cy="262" r="34" fill="none" stroke="#0e1012" strokeWidth="3" />
      <circle cx="150" cy="262" r="30" fill="#14171a" />
      <path d="M124 248 A30 30 0 0 1 164 236" stroke="#000" strokeWidth="4" fill="none" opacity="0.5" />
      {geared ? (
        <g className={on ? "motion-safe:animate-spin" : undefined} style={{ transformOrigin: "150px 262px", animationDuration: "4s" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="146" y="230" width="8" height="12" fill="url(#at-brass)" transform={`rotate(${i * 36} 150 262)`} />
          ))}
          <circle cx="150" cy="262" r="22" fill="url(#at-brass)" />
          <circle cx="150" cy="262" r="15" fill="none" stroke={BRASS_DK} strokeWidth="1" />
          <circle cx="150" cy="262" r="6" fill="#14171a" />
        </g>
      ) : (
        <>
          <circle cx="150" cy="262" r="8" fill="#1e2226" />
          <circle cx="150" cy="262" r="5" fill="#777" />
          <circle cx="148.5" cy="260.5" r="1.5" fill="#ccc" opacity="0.6" />
        </>
      )}
      {/* oil stains streaking down the housing */}
      <path d="M180 296 q2 8 0 14 M118 300 q-1 5 0 10" fill="none" stroke="#000" strokeWidth="2.5" opacity="0.35" />

      {/* round the engine: a lantern, an oil can, a spanner and a rag */}
      <g>
        <LightPool cx={30} cy={338} r={50} flicker />
        <path d="M30 312 q-8 0 -8 8" stroke="#2a2a2a" strokeWidth="1.5" fill="none" />
        <rect x="22" y="320" width="16" height="22" rx="2" fill="#ffd27a" opacity="0.35" />
        <path d="M22 320 H38 M22 342 H38 M24 320 V342 M36 320 V342" stroke="#2a2a2a" strokeWidth="2" />
        <g className="at-flame" style={{ transformOrigin: "30px 336px" }}>
          <path d="M30 326 q3.5 5 0 9 q-3.5 -4 0 -9 z" fill="#ffcf6b" />
        </g>
        <rect x="20" y="342" width="20" height="4" rx="1" fill="#2a2a2a" />
      </g>
      <g filter="url(#at-drop)">
        <path d="M256 352 h20 l-2 -22 h-16 z" fill="#5a646a" stroke="#1a1d20" />
        <path d="M262 330 l-2 -6 h8 l-2 6" fill="#3a4246" />
        <path d="M276 336 L294 322" stroke="#3a4246" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M259 336 V348" stroke="#9aa2a8" strokeWidth="1" opacity="0.5" />
      </g>
      <g filter="url(#at-drop)">
        <path d="M168 366 L214 356" stroke="#7a8288" strokeWidth="4" strokeLinecap="round" />
        <path d="M168 366 m-6 -3 a6 6 0 1 0 6 -4" stroke="#7a8288" strokeWidth="3.5" fill="none" />
      </g>
      <path d="M100 360 q10 -6 22 -2 q8 4 18 -1 l-2 8 q-12 4 -22 0 q-8 -3 -16 2 z" fill="#8a7a64" opacity="0.8" />
      <Dust x={20} y={40} w={260} h={280} count={12} seed={45} color={on ? TEAL_HI : "#fff1c9"} />
      <Grain />
      <Vignette />
    </>
  );
}
