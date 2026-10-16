/** The dining car: the bar, tables, kitchen end and lounge end. Each draws itself from the room's shared flags. */
import { C, Room, Sconce } from "./common";
import { useT } from "@/i18n/client";

export function BarWall({ flags }: { flags: string[] }) {
  const open = flags.includes("cashbox.open");
  return (
    <Room>
      {/* mirrored back bar with shelves of bottles */}
      <rect x="28" y="40" width="244" height="120" rx="6" fill="#26303a" stroke="url(#nx-brass)" strokeWidth="2" />
      {/* a brass sunburst in the middle of the back mirror */}
      <g stroke="url(#nx-brass)" strokeWidth="1" opacity="0.8">
        {Array.from({ length: 9 }, (_, i) => (i * Math.PI) / 8).map((a, i) => (
          <path key={i} d={`M150 84 L${(150 - 26 * Math.cos(a)).toFixed(1)} ${(84 - 26 * Math.sin(a)).toFixed(1)}`} />
        ))}
      </g>
      <circle cx="150" cy="84" r="6" fill="url(#nx-brass)" />
      <path d="M40 46 L60 46 L44 70 Z M260 46 L240 46 L256 70 Z" fill="#fff" opacity="0.06" />
      {[86, 128].map((y) => (
        <path key={y} d={`M32 ${y} H268`} stroke="url(#nx-brass)" strokeWidth="2.5" />
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
      ].map(([x, y, c]) => (
        <g key={`${x}-${y}`}>
          <rect x={Number(x) - 5} y={Number(y)} width="10" height={(y as number) < 86 ? 86 - Number(y) : 128 - Number(y)} rx="3" fill={c as string} opacity="0.9" />
          <rect x={Number(x) - 2} y={Number(y) - 7} width="4" height="8" fill={c as string} />
        </g>
      ))}
      <text x="150" y="152" textAnchor="middle" fontSize="8" fill={C.brass} fontFamily="Georgia, serif" letterSpacing="3">
        THE NIGHTINGALE
      </text>
      {/* Table 5's scorecard, tucked into the corner of the mirror */}
      <g transform="rotate(8 251 143)">
        <rect x="240" y="128" width="22" height="28" rx="1" fill="#fffaf0" stroke="#9a8f78" strokeWidth="0.6" />
        <path d="M243 134 H259 M243 139 H257 M243 144 H259 M243 149 H255" stroke="#9a8f78" strokeWidth="0.8" />
        <rect x="248" y="125" width="6" height="5" fill="url(#nx-brass)" />
      </g>
      {/* counter */}
      <rect x="18" y="222" width="264" height="14" rx="3" fill="#7a3a1e" stroke={C.ink} />
      <rect x="24" y="236" width="252" height="90" fill="#4a2414" stroke={C.ink} />
      <path d="M24 280 H276" stroke="url(#nx-brass)" strokeWidth="3" />
      {[60, 110, 160, 210].map((x) => (
        <rect key={x} x={x} y="246" width="34" height="26" rx="3" fill="none" stroke="#6b3a20" />
      ))}
      {/* lemons and two coupes on the counter */}
      <path d="M22 220 Q22 210 38 210 Q54 210 54 220 Z" fill="url(#nx-brass)" opacity="0.9" />
      <ellipse cx="32" cy="209" rx="6" ry="4.5" fill="#e8c93a" />
      <ellipse cx="43" cy="208" rx="6" ry="4.5" fill="#f0d54a" />
      {[262, 276].map((x) => (
        <g key={x}>
          <path d={`M${x - 6} 204 Q${x} 212 ${x + 6} 204 Z`} fill="#f2e4b0" opacity="0.55" stroke="#b8ad92" strokeWidth="0.6" />
          <path d={`M${x} 209 V220 M${x - 4} 221 H${x + 4}`} stroke="#b8ad92" strokeWidth="1" />
        </g>
      ))}
      {/* the cocktail shaker */}
      <path d="M160 220 L157 196 H175 L172 220 Z" fill="#cfd6db" stroke="#8a949b" strokeWidth="0.8" />
      <path d="M159 196 Q166 186 173 196 Z" fill="#dfe5e9" stroke="#8a949b" strokeWidth="0.8" />
      <rect x="164" y="182" width="4" height="7" rx="1" fill="#cfd6db" stroke="#8a949b" strokeWidth="0.6" />
      <path d="M161 202 V216" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
      {/* cash box */}
      <rect x="62" y="186" width="68" height="36" rx="3" fill="#5f6870" stroke="#2a2f34" strokeWidth="1.5" />
      {open ? (
        <path d="M62 186 L70 166 H138 L130 186 Z" fill="#717b84" stroke="#2a2f34" />
      ) : (
        [72, 86, 100, 114].map((x) => <rect key={x} x={x} y="196" width="10" height="16" rx="2" fill="url(#nx-brass)" stroke="#7a5f12" strokeWidth="0.6" />)
      )}
      {/* bell */}
      <path d="M216 222 Q216 200 231 198 Q246 200 246 222 Z" fill="url(#nx-brass)" stroke="#7a5f12" />
      <rect x="212" y="220" width="38" height="4" rx="2" fill="#7a5f12" />
      <circle cx="231" cy="196" r="3" fill="url(#nx-brass)" />
      {/* brass footrail */}
      <path d="M24 314 H276" stroke="url(#nx-brass)" strokeWidth="3" />
      {/* stools */}
      {[70, 150, 230].map((x) => (
        <g key={x}>
          <path d={`M${x - 8} 356 Q${x} 350 ${x + 8} 356`} stroke="url(#nx-brass)" strokeWidth="2" fill="none" />
          <path d={`M${x} 337 V354`} stroke="url(#nx-brass)" strokeWidth="3" />
          <path d={`M${x - 8} 346 H${x + 8}`} stroke="url(#nx-brass)" strokeWidth="1.5" />
          <ellipse cx={x} cy="332" rx="18" ry="5" fill="#2f5d4a" stroke={C.ink} />
          <path d={`M${x - 18} 332 Q${x} 340 ${x + 18} 332`} stroke="#173328" strokeWidth="2" fill="none" />
          {[-12, -4, 4, 12].map((dx) => (
            <circle key={dx} cx={x + dx} cy={335} r="0.9" fill={C.brass} />
          ))}
        </g>
      ))}
    </Room>
  );
}

export function TablesWall({ taken }: { taken: boolean }) {
  return (
    <Room>
      {/* window with the mountains and snow */}
      <rect x="30" y="36" width="240" height="88" rx="10" fill="url(#nx-night)" stroke="url(#nx-brass)" strokeWidth="4" />
      <path d="M34 120 L80 70 L112 100 L150 56 L196 104 L228 78 L266 120 Z" fill="#2c3a52" />
      <path d="M150 56 L138 70 L150 66 L162 72 Z M80 70 L72 80 L84 78 Z" fill="#dfe6ee" />
      <g className="nx-rain" stroke="#e8eef5" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
        {[54, 92, 130, 168, 206, 244].map((x, i) => (
          <path key={x} d={`M${x} ${48 + (i % 2) * 18} l-2 3`} />
        ))}
      </g>
      {/* swagged curtains over the window */}
      <path d="M26 30 H274 V40 Q212 58 150 42 Q88 58 26 40 Z" fill="#7a2d2d" stroke={C.ink} strokeWidth="0.6" />
      <path d="M26 40 Q88 58 150 42 Q212 58 274 40" stroke="url(#nx-brass)" strokeWidth="1.2" fill="none" />
      {[26, 150, 274].map((x) => (
        <path key={x} d={`M${x - 3} 44 h6 l1 8 h-8 z`} fill="url(#nx-brass)" />
      ))}
      <path d="M22 36 Q30 80 24 128 H34 Q40 80 32 36 Z M278 36 Q270 80 276 128 H266 Q260 80 268 36 Z" fill="#7a2d2d" opacity="0.95" />
      {/* chairs, with piping and a napkin each */}
      {[48, 252].map((x) => (
        <g key={x}>
          <rect x={x - 22} y="150" width="44" height="130" rx="8" fill="url(#nx-velvet)" stroke={C.ink} />
          <rect x={x - 16} y="158" width="32" height="56" rx="6" fill="none" stroke="url(#nx-brass)" strokeWidth="0.8" opacity="0.6" />
          <path d={`M${x - 6} 226 l6 -10 l6 10 z`} fill="#f7f2e4" stroke="#b8ad92" strokeWidth="0.6" />
        </g>
      ))}
      {/* table */}
      <path d="M40 222 H260 L270 268 H30 Z" fill="#f4efe2" stroke="#b8ad92" />
      <path d="M30 268 Q150 280 270 268 V282 Q150 294 30 282 Z" fill="#e8e0cc" />
      <rect x="140" y="282" width="20" height="74" fill={C.walnutDark} />
      {/* bridge: four hands and a scorecard */}
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
        <path key={x} d={`M${x - 9} 230 l3 -7 h12 l3 7 z`} fill="#fffaf0" stroke="#9a8f78" strokeWidth="0.6" />
      ))}
      {/* sugar bowl and spill */}
      <path d="M58 214 Q58 196 72 196 Q86 196 86 214 Z" fill="#e8eef2" stroke="#9aa6ad" />
      <ellipse cx="72" cy="196" rx="14" ry="3" fill="#cfd8dc" />
      <ellipse cx="94" cy="218" rx="6" ry="1.6" fill="#ffffff" opacity="0.9" />
      {/* a single rose in a silver bud vase */}
      <path d="M146 222 Q144 204 148 190 H152 Q156 204 154 222 Z" fill="#cfd6db" stroke="#8a949b" strokeWidth="0.8" />
      <path d="M150 190 Q148 172 150 158" stroke="#3f6b3a" strokeWidth="1.5" fill="none" />
      <path d="M150 176 q-8 -2 -10 -8 q8 0 10 6" fill="#3f6b3a" />
      <path d="M150 170 q6 -1 9 -6 q-7 -1 -9 4" fill="#3f6b3a" />
      <path d="M144 156 Q150 144 156 156 Q154 162 150 162 Q146 162 144 156 Z" fill="#b3242a" stroke="#7a1a1e" strokeWidth="0.6" />
      <path d="M147 154 Q150 150 153 154" stroke="#7a1a1e" strokeWidth="0.8" fill="none" />
      {/* champagne coupe */}
      <path d="M222 172 Q236 190 250 172 Z" fill="#f2e4b0" stroke="#b8ad92" opacity="0.9" />
      <path d="M236 182 V206 M228 208 H244" stroke="#b8ad92" strokeWidth="1.5" />
      <path d="M244 172 q2 3 -1 5" stroke="#a3302a" strokeWidth="2" fill="none" />
    </Room>
  );
}

export function KitchenWall({ flags }: { flags: string[] }) {
  const t = useT();
  const open = flags.includes("dumbwaiter.open");
  const raised = flags.includes("dumbwaiter.raised");
  return (
    <Room>
      {/* chalk menu */}
      <rect x="30" y="50" width="120" height="142" rx="4" fill="#1d2420" stroke="url(#nx-brass)" strokeWidth="3" />
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
      {/* dumbwaiter hatch */}
      <rect x="40" y="218" width="104" height="92" rx="3" fill={open ? "#090604" : C.walnutDark} stroke="url(#nx-brass)" strokeWidth="2" />
      {open ? (
        <g>
          {raised && (
            <g>
              <rect x="50" y="250" width="84" height="56" fill="#5a3a22" stroke={C.ink} />
              <path d="M50 250 H134" stroke="url(#nx-brass)" strokeWidth="2" />
              <path d="M78 246 q8 -12 20 -8 q12 2 10 10 z" fill="#efe6d2" stroke="#b8ad92" />
              <circle cx="96" cy="244" r="2.5" fill="#3a5cc9" />
            </g>
          )}
          <path d="M40 218 L24 210 V318 L40 310" fill="#3d2615" stroke={C.ink} />
        </g>
      ) : (
        <g>
          <rect x="52" y="230" width="80" height="68" rx="2" fill="none" stroke={C.walnutLine} />
          <circle cx="126" cy="264" r="4" fill="url(#nx-brass)" />
        </g>
      )}
      {/* copper pans on a rail */}
      <path d="M160 35 H288" stroke="url(#nx-brass)" strokeWidth="2" />
      {[
        [178, 7],
        [206, 8.5],
        [236, 6.5],
        [264, 7.5],
      ].map(([x, r]) => (
        <g key={x}>
          <circle cx={x} cy="37" r="1.6" fill="none" stroke="#5c4710" strokeWidth="1" />
          <path d={`M${x} 39 V${50 - r}`} stroke="#3d2615" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={x} cy={58 - r + 2} r={r + 1.2} fill="#7a3a1a" />
          <circle cx={x} cy={58 - r + 2} r={r} fill="#b8642e" />
          <path d={`M${x - r * 0.6} ${58 - r * 0.4} A${r * 0.7} ${r * 0.7} 0 0 1 ${x + r * 0.2} ${58 - r * 0.7}`} stroke="#f0b27a" strokeWidth="1.2" fill="none" opacity="0.7" />
        </g>
      ))}
      {/* fire bucket */}
      <path d="M152 290 H170 L167 316 H155 Z" fill="#a3302a" stroke="#5a1a16" strokeWidth="0.8" />
      <path d="M152 290 Q161 280 170 290" stroke={C.ink} strokeWidth="1" fill="none" />
      <text x="161" y="306" textAnchor="middle" fontSize="4" fill="#efe6d2" fontFamily="Georgia, serif">
        FEU
      </text>
      {/* a crate of oranges */}
      <rect x="34" y="324" width="112" height="32" fill="#a77a48" stroke="#5a3b20" />
      <path d="M34 334 H146 M34 345 H146" stroke="#5a3b20" strokeWidth="0.8" />
      <text x="90" y="343" textAnchor="middle" fontSize="6" fill="#3d2615" fontFamily="Georgia, serif" letterSpacing="1">
        FINEST SEVILLE
      </text>
      {[44, 56, 68, 80, 92, 104, 116, 128, 138].map((x, i) => (
        <circle key={x} cx={x} cy={322 - (i % 2) * 3} r="6" fill={i === 4 ? "#f0a040" : "#e8862a"} stroke="#b8601a" strokeWidth="0.5" />
      ))}
      <path d="M86 316 a5 5 0 0 0 8 0" fill="#f7e4c0" />
      <rect x="120" y="328" width="18" height="12" fill="#f7f2e4" transform="rotate(6 129 334)" />
      <rect x="150" y="262" width="12" height="12" rx="2" fill="#1b120b" stroke="url(#nx-brass)" />
      <rect x="153" y="265" width="6" height="6" fill="#090604" />
      {/* kitchen door */}
      <rect x="176" y="70" width="98" height="286" rx="3" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
      <circle cx="225" cy="120" r="22" fill="#2a1f14" stroke="url(#nx-brass)" strokeWidth="3" />
      {/* through the porthole: a stove's glow and the cook asleep under his hat */}
      <circle cx="225" cy="120" r="19" fill="#3a2a18" />
      <circle cx="214" cy="112" r="7" fill="#e8823a" opacity="0.35" />
      <path d="M212 134 Q225 122 240 132 L240 138 H212 Z" fill="#e8e0cc" opacity="0.8" />
      <path d="M226 124 q-4 -10 6 -12 q8 2 4 12 z" fill="#f7f2e4" />
      <path d="M216 108 q10 -6 18 0" stroke="#c97a3a" strokeWidth="2" fill="none" />
      <path d="M210 104 Q218 100 222 106" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={225 + 22 * Math.cos((a * Math.PI) / 180)} cy={120 + 22 * Math.sin((a * Math.PI) / 180)} r="1.2" fill="#7a5f12" />
      ))}
      <rect x="186" y="186" width="78" height="20" rx="2" fill={C.cream} />
      <text x="225" y="199" textAnchor="middle" fontSize="6.5" fill={C.ink} fontFamily="Georgia, serif" letterSpacing="0.5">
        {t("train.sign.kitchenClosed")}
      </text>
      <rect x="252" y="230" width="8" height="24" rx="3" fill="url(#nx-brass)" />
    </Room>
  );
}

export function LoungeWall({ flags }: { flags: string[] }) {
  const searched = flags.includes("stole.searched");
  return (
    <Room>
      {/* silk wallpaper stripes above the dado */}
      <g fill="#7a5333" opacity="0.18">
        {Array.from({ length: 14 }, (_, i) => 14 + i * 20).map((x) => (
          <rect key={x} x={x} y="28" width="8" height="220" />
        ))}
      </g>
      {/* a framed photograph of the Nightingale on her first run */}
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
      <rect x="60" y="108" width="58" height="4" fill="url(#nx-brass)" />
      {/* gramophone */}
      <rect x="44" y="214" width="104" height="70" rx="4" fill="#4a2a18" stroke={C.ink} />
      <rect x="52" y="200" width="88" height="16" rx="2" fill="#5b3a22" stroke={C.ink} />
      <ellipse cx="96" cy="200" rx="30" ry="6" fill="#111" />
      <path d="M118 198 L130 170" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M128 172 Q118 140 76 132 Q60 150 72 172 Q100 168 128 172 Z" fill="url(#nx-brass)" stroke="#7a5f12" />
      {/* records */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={52 + i * 4} y={292 - i * 2} width="80" height="52" rx="2" fill={["#c9b48a", "#8a2c1f", "#2f4a6b", "#c9a227", "#efe6d2"][i]} stroke={C.ink} strokeWidth="0.6" />
        ))}
        <circle cx="108" cy="312" r="12" fill="#111" />
        <circle cx="108" cy="312" r="3" fill="#c9a227" />
      </g>
      {/* coat stand and fur stole */}
      <path d="M232 70 V346 M210 346 H254" stroke="url(#nx-brass)" strokeWidth="4" />
      <path d="M232 80 L212 92 M232 80 L252 92" stroke="url(#nx-brass)" strokeWidth="3" />
      <path
        d="M210 92 Q232 84 254 92 Q262 150 250 220 Q236 236 222 222 Q206 160 210 92 Z"
        fill="#cfcfd4"
        stroke="#8f8f99"
      />
      <path d="M216 120 q16 8 32 0 M218 160 q14 8 28 0 M222 196 q10 6 20 0" stroke="#a9a9b2" fill="none" />
      {!searched && <ellipse cx="236" cy="206" rx="8" ry="5" fill="#a9a9b2" />}
      <Sconce x={150} />
      {/* the potted palm */}
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
      <path d="M166 318 H198 L194 354 H170 Z" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M168 330 H196" stroke="#7a5f12" strokeWidth="1" />
      {/* the rug */}
      <path d="M40 362 H260 L270 392 H30 Z" fill="#2f4a6b" opacity="0.85" />
      <path d="M50 368 H250 L256 386 H44 Z" fill="none" stroke={C.brass} strokeWidth="1" opacity="0.6" />
    </Room>
  );
}

/** Transparent tap shapes in the drawing's coordinates: they stay on their objects even when the wall is letterboxed. */
