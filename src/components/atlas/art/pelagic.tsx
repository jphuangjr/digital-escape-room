import { BRASS, BRASS_DK, Backdrop, Glint, GlyphRing, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Pelagic Library

export function Sea() {
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

export function PelagicArrival({ s }: { s: WallState }) {
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

export function PelagicAirlock({ s }: { s: WallState }) {
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

export function ArchiveHall({ s }: { s: WallState }) {
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

export function ArchiveRegistry({ s }: { s: WallState }) {
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

