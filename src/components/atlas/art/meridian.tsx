import { Backdrop, Glint, GlyphRing, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Sunken Meridian

/** A stopped desert sun over dunes and buried towers. */
function Desert({ floorY = 300 }: { floorY?: number }) {
  return (
    <>
      <linearGradient id="at-desert-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0b860" />
        <stop offset="1" stopColor="#f6dfa4" />
      </linearGradient>
      <rect width="300" height="400" fill="url(#at-desert-sky)" />
      <circle cx="232" cy="64" r="26" fill="#fff4cf" />
      <circle cx="232" cy="64" r="60" fill="url(#at-glow)" />
      <rect x="20" y="150" width="24" height="120" fill="#b88a50" />
      <path d="M20 150 l12 -18 l12 18 z" fill="#a07840" />
      <rect x="250" y="170" width="20" height="100" fill="#b88a50" />
      <path d={`M0 ${floorY - 20} Q80 ${floorY - 50} 160 ${floorY - 24} T300 ${floorY - 30} V400 H0 Z`} fill="#d9b070" />
      <rect y={floorY - 20} width="300" height={420 - floorY} fill="url(#at-sand)" />
    </>
  );
}

export function MeridianArrival() {
  return (
    <>
      <Desert />
      {/* the gate home, half in the sand */}
      <path d="M64 290 A86 86 0 1 1 236 290" fill="#140f08" stroke="#6a5a3a" strokeWidth="14" />
      <GlyphRing cx={150} cy={260} r={66} size={12} fill="#9ff3e4" opacity={0.7} />
      <path d="M40 300 Q150 270 260 300 V330 H40 Z" fill="#d9b070" />
      <Vignette />
    </>
  );
}

export function MeridianPlaza({ s }: { s: WallState }) {
  const lit = s.flags.includes("meridian.lit");
  const vaultLit = s.flags.includes("meridian.vault.lit");
  return (
    <>
      <Desert floorY={250} />
      {/* the plaza floor and its mirrors */}
      <path d="M30 230 L270 230 L290 330 L10 330 Z" fill="#c49a5a" stroke="#8a6a3a" />
      {[0, 1, 2, 3].map((r) => (
        <path key={r} d={`M${30 - r * 5} ${230 + r * 25} H${270 + r * 5}`} stroke="#8a6a3a" strokeWidth="0.8" opacity="0.6" />
      ))}
      {[
        [80, 248],
        [96, 300],
        [150, 300],
        [150, 270],
        [204, 270],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 3} y={y - 4} width="6" height="12" fill="#6a5a3a" />
          <rect x={x - 12} y={y - 22} width="24" height="20" rx="3" fill="#cfe3ea" stroke="#8a7440" strokeWidth="2" transform={`rotate(${i % 2 ? 20 : -20} ${x} ${y - 12})`} />
        </g>
      ))}
      {lit && <path d="M30 236 L80 236 L96 290 L150 290 L150 262 L204 262 L210 330" stroke="#fff1a8" strokeWidth="4" fill="none" opacity="0.9" />}
      {/* the sun door */}
      <rect x="170" y="236" width="90" height="0" />
      <rect x="182" y="250" width="76" height="110" rx="4" fill={lit ? "#ffd75e" : "#a8862e"} stroke="#6a5a3a" strokeWidth="3" />
      <circle cx="220" cy="292" r="18" fill="none" stroke={lit ? "#fff6d0" : "#7a5f12"} strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M220 292 L${220 + Math.cos((i * Math.PI) / 4) * 30} ${292 + Math.sin((i * Math.PI) / 4) * 30}`} stroke={lit ? "#fff6d0" : "#7a5f12"} strokeWidth="2" />
      ))}
      {lit && <rect x="182" y="250" width="76" height="110" fill="url(#at-glow)" opacity="0.6" />}
      {/* the shaft in the sand */}
      <ellipse cx="74" cy="352" rx="42" ry="16" fill="#140f08" stroke="#8a6a3a" strokeWidth="3" />
      {vaultLit && <ellipse cx="74" cy="352" rx="10" ry="5" fill="#fff6d0" />}
      {s.takes.has("vault") && <Glint x={74} y={352} />}
      <Vignette />
    </>
  );
}

export function SanctumMirror() {
  return (
    <>
      <Backdrop wall={["#3a2a16", "#160f07"]} floor="#2a1d0e" light="#ffd98a" />
      {/* the great bronze mirror, showing a dial that isn't there */}
      <rect x="70" y="40" width="160" height="240" rx="80" fill="url(#at-brass)" />
      <rect x="80" y="50" width="140" height="220" rx="70" fill="#5a4626" />
      <g transform="translate(300 0) scale(-1 1)">
        <ellipse cx="150" cy="210" rx="52" ry="22" fill="#d9c08a" opacity="0.75" />
        <path d="M150 210 L188 222" stroke="#2a1f0e" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      </g>
      <path d="M96 70 Q120 60 128 90" stroke="#fff" strokeOpacity="0.25" strokeWidth="6" fill="none" />
      {/* the tablet */}
      <rect x="96" y="292" width="108" height="72" rx="6" fill="#8a7a5a" stroke="#4a3e28" strokeWidth="3" />
      {[310, 324, 338, 352].map((y) => (
        <path key={y} d={`M110 ${y} H190`} stroke="#3a2c14" strokeWidth="2" opacity="0.7" />
      ))}
      <Vignette />
    </>
  );
}

export function SanctumStudy({ s }: { s: WallState }) {
  const open = s.flags.includes("meridian.chest.open");
  return (
    <>
      <Backdrop wall={["#3a2a16", "#160f07"]} floor="#2a1d0e" light="#ffd98a" />
      {/* a sun carved over the keeper's room */}
      <circle cx="150" cy="80" r="30" fill="none" stroke="#8a7440" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${150 + Math.cos((i * Math.PI) / 6) * 36} ${80 + Math.sin((i * Math.PI) / 6) * 36} L${150 + Math.cos((i * Math.PI) / 6) * 48} ${80 + Math.sin((i * Math.PI) / 6) * 48}`} stroke="#8a7440" strokeWidth="3" />
      ))}
      {/* the keeper's chest */}
      <rect x="44" y="250" width="112" height="70" rx="6" fill="#7a5a2a" stroke="#3a2a12" strokeWidth="3" />
      {open ? (
        <path d="M44 250 L56 206 H168 L156 250 Z" fill="#8a6a3a" stroke="#3a2a12" strokeWidth="3" />
      ) : (
        <>
          <rect x="44" y="228" width="112" height="26" rx="8" fill="#8a6a3a" stroke="#3a2a12" strokeWidth="3" />
          <rect x="84" y="232" width="32" height="16" rx="2" fill="#1b120b" />
        </>
      )}
      {s.takes.has("chest") && <Glint x={100} y={240} />}
      {/* the altar */}
      <rect x="186" y="200" width="80" height="120" fill="#c9a24a" stroke="#6a5a3a" strokeWidth="3" />
      <rect x="180" y="192" width="92" height="12" fill="#d9b25a" />
      {s.takes.has("altar") && (
        <>
          <ellipse cx="226" cy="186" rx="12" ry="8" fill="#cfe3ea" stroke="#7a5f12" strokeWidth="2" />
          <Glint x={226} y={184} />
        </>
      )}
      <Vignette />
    </>
  );
}

