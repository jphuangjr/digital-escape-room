import { BRASS, BRASS_DK, BRASS_HI, Backdrop, Glint, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Waterworks

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
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" />
      {/* the standing orders */}
      <rect x="92" y="42" width="116" height="82" rx="4" fill="#e9e1c8" stroke="#8a7440" strokeWidth="3" />
      {[58, 72, 86, 100, 112].map((y) => (
        <path key={y} d={`M104 ${y} H196`} stroke="#5a4a2a" strokeWidth="1.2" opacity="0.7" />
      ))}
      {/* the main pipe and three valves */}
      <rect x="20" y="210" width="260" height="26" fill="url(#at-iron)" />
      {valves.map((v) => (
        <g key={v.id}>
          <rect x={v.x - 6} y="180" width="12" height="32" fill="#2c3236" />
          <g transform={`rotate(${open(v.id) ? 45 : 0} ${v.x} 176)`}>
            <circle cx={v.x} cy="176" r="24" fill="none" stroke="#9a2b22" strokeWidth="6" />
            <path d={`M${v.x - 24} 176 H${v.x + 24} M${v.x} 152 V200`} stroke="#9a2b22" strokeWidth="4" />
          </g>
          <circle cx={v.x} cy="176" r="5" fill={BRASS} />
          <rect x={v.x - 22} y="244" width="44" height="14" rx="2" fill="url(#at-brass)" />
        </g>
      ))}
      {!drained && <path d="M24 236 q4 30 -4 70 M276 236 q-6 40 4 80" stroke="#7fc6bf" strokeWidth="3" fill="none" opacity="0.6" />}
      <Vignette />
    </>
  );
}

export function Tunnel({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  return (
    <>
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" />
      {/* the arch */}
      <path d="M70 330 V160 Q150 70 230 160 V330 Z" fill="#06100f" stroke="#33423f" strokeWidth="10" />
      {drained ? (
        <>
          <path d="M120 330 L140 200 H160 L180 330 Z" fill="#0f1c1a" />
          <path d="M140 200 V150 H160 V200" fill="#ffd98a" opacity="0.25" />
          <rect x="132" y="318" width="36" height="8" fill="#1e2a28" stroke="#33423f" />
          {s.takes.has("tunnel") && <Glint x={110} y={312} />}
        </>
      ) : (
        <>
          <path d="M75 330 V170 Q150 85 225 170 V330 Z" fill="url(#at-water)" />
          <path d="M80 180 Q115 172 150 180 T220 180" stroke="#bff3ea" strokeWidth="1.5" fill="none" opacity="0.6" />
          <Glint x={112} y={300} />
        </>
      )}
      <Vignette />
    </>
  );
}

export function WaterWheel({ s }: { s: WallState }) {
  const drained = s.flags.includes("water.drained");
  return (
    <>
      <Backdrop wall={["#253532", "#121c1a"]} floor="#1a2422" light="#bfe8df" />
      <rect x="40" y="300" width="220" height="40" fill={drained ? "#18221f" : "url(#at-water)"} />
      <g className={drained ? undefined : "motion-safe:animate-spin"} style={{ transformOrigin: "150px 200px", animationDuration: "3s" }}>
        <circle cx="150" cy="200" r="90" fill="none" stroke="url(#at-wood)" strokeWidth="12" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <g key={i}>
              <path d={`M150 200 L${150 + Math.cos(a) * 90} ${200 + Math.sin(a) * 90}`} stroke="#4a3220" strokeWidth="5" />
              <rect x={150 + Math.cos(a) * 92 - 8} y={200 + Math.sin(a) * 92 - 8} width="16" height="16" fill="#5b3a22" transform={`rotate(${i * 30} ${150 + Math.cos(a) * 92} ${200 + Math.sin(a) * 92})`} />
            </g>
          );
        })}
      </g>
      <circle cx="150" cy="200" r="24" fill="#2a1a10" stroke={BRASS_DK} strokeWidth="3" />
      {drained ? (
        <text x="150" y="210" textAnchor="middle" fontSize="26" fill={BRASS_HI}>
          ≈
        </text>
      ) : (
        <path d="M60 300 q30 -20 60 0 t60 0 t60 0" stroke="#bff3ea" strokeWidth="2" fill="none" opacity="0.5" />
      )}
      <Vignette />
    </>
  );
}

