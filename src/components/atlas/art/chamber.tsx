import { BRASS, BRASS_DK, BRASS_HI, Backdrop, GlyphRing, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Threshold Chamber

export function Gate({ s }: { s: WallState }) {
  const powered = s.flags.includes("engine.on");
  return (
    <>
      <Backdrop wall={["#2a2438", "#120f1a"]} floor="#1a1622" light={powered ? "#9ff3e4" : "#ffd98a"} />
      {powered && <circle cx="150" cy="160" r="130" fill="url(#at-teal-glow)" opacity="0.5" />}
      <circle cx="150" cy="160" r="104" fill="#0b0912" stroke="#4a4458" strokeWidth="18" />
      <circle cx="150" cy="160" r="88" fill="none" stroke={powered ? "#9ff3e4" : BRASS_DK} strokeWidth="3" />
      <GlyphRing cx={150} cy={160} r={78} size={14} fill={powered ? "#d6fff6" : "#8a7440"} />
      <circle cx="150" cy="160" r="62" fill="none" stroke={powered ? "#9ff3e4" : BRASS_DK} strokeWidth="2" />
      <GlyphRing cx={150} cy={160} r={50} size={11} fill={powered ? "#d6fff6" : "#8a7440"} opacity={0.9} />
      <circle cx="150" cy="160" r="34" fill={powered ? "#0f2a2c" : "#06050a"} />
      {/* the lever */}
      <path d="M262 300 L250 230" stroke="url(#at-iron)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="250" cy="228" r="9" fill={powered ? "#9a2b22" : "#5a2420"} />
      {/* the ledger on its chain */}
      <path d="M150 268 V300" stroke="#555" strokeWidth="2" strokeDasharray="3 2" />
      <rect x="112" y="298" width="76" height="52" rx="3" fill="#6b2a1e" stroke="#2a110c" strokeWidth="2" />
      <rect x="118" y="304" width="64" height="40" fill="url(#at-paper)" opacity="0.9" />
      <path d="M150 304 V344" stroke="#8a7440" />
      <Vignette />
    </>
  );
}

export function Engine({ s }: { s: WallState }) {
  const geared = s.flags.includes("engine.geared");
  const on = s.flags.includes("engine.on");
  return (
    <>
      <Backdrop wall={["#2a2438", "#120f1a"]} floor="#1a1622" light={on ? "#9ff3e4" : "#ffd98a"} />
      {/* the plaque */}
      <rect x="100" y="50" width="100" height="60" rx="4" fill="url(#at-brass)" stroke={BRASS_DK} strokeWidth="2" />
      {[68, 80, 92].map((y) => (
        <path key={y} d={`M114 ${y} H186`} stroke="#3a2c14" strokeWidth="2" />
      ))}
      {/* the engine block */}
      <rect x="50" y="140" width="200" height="170" rx="12" fill="url(#at-iron)" stroke="#111" strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={100 + i * 50} cy="190" r="20" fill="#14171a" stroke={on ? "#9ff3e4" : BRASS} strokeWidth="3" />
          <text x={100 + i * 50} y="196" textAnchor="middle" fontSize="16" fill={on ? "#d6fff6" : BRASS_HI}>
            {on ? ["✶", "≈", "◈"][i] : "·"}
          </text>
        </g>
      ))}
      {/* the gear spindle */}
      <circle cx="150" cy="262" r="30" fill="#14171a" />
      {geared ? (
        <g className={on ? "motion-safe:animate-spin" : undefined} style={{ transformOrigin: "150px 262px", animationDuration: "4s" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="146" y="230" width="8" height="12" fill="url(#at-brass)" transform={`rotate(${i * 36} 150 262)`} />
          ))}
          <circle cx="150" cy="262" r="22" fill="url(#at-brass)" />
          <circle cx="150" cy="262" r="6" fill="#14171a" />
        </g>
      ) : (
        <circle cx="150" cy="262" r="5" fill="#777" />
      )}
      {on && <circle cx="150" cy="225" r="120" fill="url(#at-teal-glow)" opacity="0.25" />}
      <Vignette />
    </>
  );
}

