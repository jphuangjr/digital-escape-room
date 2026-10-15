import { BRASS_HI, Backdrop, GLYPH, Glint, GlyphRing, RING_ORDER, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Verdant Archive

/** Glasshouse ironwork over a green-lit library. */
export function Glasshouse() {
  return (
    <>
      <Backdrop wall={["#1f3a28", "#0d1a10"]} floor="#2b2416" light="#d8ffcf" pattern="at-glass" />
      <path d="M0 0 Q150 -40 300 0 V30 Q150 -10 0 30 Z" fill="#2b3b2b" />
      <path d="M0 30 Q150 -10 300 30" stroke="#3d553d" strokeWidth="4" fill="none" />
    </>
  );
}

export function VerdantArrival({ s }: { s: WallState }) {
  return (
    <>
      <Glasshouse />
      {/* the gate home, overgrown */}
      <circle cx="150" cy="190" r="86" fill="#08120a" stroke="#4a4458" strokeWidth="14" />
      <GlyphRing cx={150} cy={190} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      <path d="M70 120 C90 150 60 200 84 250 M226 110 C214 160 240 210 216 262" stroke="#3f7a3a" strokeWidth="5" fill="none" />
      <circle cx="80" cy="140" r="7" fill="#4f9a48" />
      <circle cx="222" cy="128" r="8" fill="#4f9a48" />
      {/* shelves on either side, and moss */}
      <rect x="0" y="120" width="40" height="210" fill="url(#at-wood)" />
      <rect x="260" y="120" width="40" height="210" fill="url(#at-wood)" />
      <path d="M0 330 Q75 312 150 330 T300 330 V340 H0 Z" fill="#355a2c" />
      {s.takes.has("verdant-gate") && <Glint x={92} y={322} />}
      <Vignette />
    </>
  );
}

export function VerdantBeds({ s }: { s: WallState }) {
  const bloomed = s.flags.includes("verdant.seed.bloomed");
  return (
    <>
      <Glasshouse />
      {/* the spiral creeper on its cane */}
      <rect x="82" y="230" width="34" height="24" fill="#6b4a2b" />
      <path d="M99 230 V70" stroke="#8a6a3a" strokeWidth="3" />
      <path d="M99 225 C80 210 118 195 99 180 C80 165 118 150 99 135 C80 120 118 105 99 90" stroke="#3f8a3a" strokeWidth="3" fill="none" />
      {[200, 172, 148, 128, 110, 96].map((y, i) => (
        <ellipse key={y} cx={i % 2 ? 112 : 86} cy={y} rx="9" ry="5" fill="#57a84e" transform={`rotate(${i % 2 ? 30 : -30} ${i % 2 ? 112 : 86} ${y})`} />
      ))}
      <rect x="70" y="150" width="20" height="26" fill="url(#at-paper)" transform="rotate(-8 80 163)" />
      {/* the doubling fern, far too big for its pot */}
      <rect x="196" y="230" width="44" height="22" fill="#8a5a3a" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M218 230 Q${170 + i * 12} ${160 - (i % 3) * 14} ${150 + i * 18} ${170 + (i % 2) * 10}`} stroke="#4f9a48" strokeWidth="3" fill="none" />
      ))}
      {/* the bed of grey sand and the dormant seed */}
      <rect x="100" y="290" width="100" height="40" rx="4" fill="#5a5a52" stroke="#3a3a32" strokeWidth="3" />
      {bloomed ? (
        <g>
          <circle cx="150" cy="292" r="22" fill="url(#at-glow)" />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx="150" cy="282" rx="5" ry="12" fill="#f3e9ff" transform={`rotate(${i * 60} 150 292)`} />
          ))}
          <circle cx="150" cy="292" r="4" fill="#f0d98a" />
          {s.takes.has("seed") && <Glint x={170} y={300} />}
        </g>
      ) : (
        <ellipse cx="150" cy="304" rx="6" ry="4" fill="#3a2a1a" />
      )}
      <Vignette />
    </>
  );
}

export function VerdantShelves({ s }: { s: WallState }) {
  const open = s.flags.includes("verdant.index.open");
  return (
    <>
      <Glasshouse />
      {/* the painted sign over seven empty pots */}
      <rect x="80" y="44" width="140" height="70" rx="4" fill="#3b2414" stroke="#6b4527" strokeWidth="3" />
      {[62, 78, 94].map((y) => (
        <path key={y} d={`M96 ${y} H204`} stroke="#e9d9a6" strokeWidth="2" opacity="0.8" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${54 + i * 30} 122 h18 l-3 14 h-12 z`} fill="#8a5a3a" />
      ))}
      {/* the index cabinet, roots growing through the stacks behind it */}
      <path d="M20 140 C40 200 10 260 30 330 M280 150 C260 210 290 270 270 330" stroke="#5a4028" strokeWidth="6" fill="none" />
      <rect x="70" y="150" width="160" height="200" rx="4" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={82 + (i % 3) * 48} y={168 + Math.floor(i / 3) * 34} width="40" height="24" rx="2" fill={open && i % 4 === 1 ? "#1b120b" : "#5b3a22"} stroke="#2a180c" />
      ))}
      <rect x="86" y="310" width="128" height="26" rx="3" fill="#1b120b" />
      {RING_ORDER.map((g, i) => (
        <text key={g} x={96 + i * 18} y="328" textAnchor="middle" fontSize="11" fill={open ? "#9ff3e4" : BRASS_HI}>
          {GLYPH[g]}
        </text>
      ))}
      {s.takes.has("cabinet") && <Glint x={150} y={190} />}
      <Vignette />
    </>
  );
}

export function VerdantRoots({ s }: { s: WallState }) {
  const open = s.flags.includes("verdant.door.open");
  return (
    <>
      <Glasshouse />
      {/* seven saplings on a ledge, roots plunging through the floor */}
      <rect x="30" y="120" width="240" height="12" fill="url(#at-wood)" />
      {RING_ORDER.map((g, i) => (
        <g key={g}>
          <path d={`M${50 + i * 33} 90 q-8 -20 0 -34 q8 14 0 34`} fill="#4f9a48" />
          <path d={`M${42 + i * 33} 100 h16 l-3 20 h-10 z`} fill="#8a5a3a" />
          <text x={50 + i * 33} y="114" textAnchor="middle" fontSize="9" fill={BRASS_HI}>
            {GLYPH[g]}
          </text>
          <path d={`M${50 + i * 33} 132 C${50 + i * 33 + ((i % 3) - 1) * 20} 180 ${150 + (i - 3) * 14} 210 ${150 + (i - 3) * 10} 250`} stroke="#5a4028" strokeWidth="3.5" fill="none" />
        </g>
      ))}
      {/* the little door the roots hold shut */}
      <rect x="110" y="254" width="80" height="96" rx="6" fill={open ? "#0b0703" : "url(#at-wood)"} stroke="#2a180c" strokeWidth="3" />
      {open ? (
        <path d="M110 254 L94 264 V340 L110 350 Z" fill="url(#at-wood)" />
      ) : (
        <path d="M100 270 C140 290 160 250 200 280 M98 320 C140 300 170 340 204 310" stroke="#5a4028" strokeWidth="9" fill="none" strokeLinecap="round" />
      )}
      {s.takes.has("root-door") && <Glint x={150} y={300} />}
      <Vignette />
    </>
  );
}

