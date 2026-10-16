/** The corridor outside 12B, reached once the door is open: one-point perspective toward the dining car. */
export function CorridorScene({ sign }: { sign: string }) {
  // Depth z = 0 at the screen edge; f(z) scales the cross-section towards the vanishing point (150, 205).
  const f = (z: number) => 1 / (1 + z);
  const sec = (z: number) => ({ l: 150 - 150 * f(z), r: 150 + 150 * f(z), t: 205 - 205 * f(z), b: 205 + 195 * f(z) });
  const END = 2.95;
  const e = sec(END);
  // A point on the left/right wall at depth z and height h (0 = ceiling, 1 = floor).
  const L = (z: number, h: number) => { const c = sec(z); return [c.l, c.t + (c.b - c.t) * h] as const; };
  const R = (z: number, h: number) => { const c = sec(z); return [c.r, c.t + (c.b - c.t) * h] as const; };
  const quad = (pts: (readonly [number, number])[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
  const wallBand = (side: typeof L, z1: number, z2: number, h1: number, h2: number) => quad([side(z1, h1), side(z2, h1), side(z2, h2), side(z1, h2)]);
  const windows: [number, number][] = [
    [0.12, 0.62],
    [0.9, 1.3],
    [1.55, 1.85],
    [2.1, 2.35],
  ];
  const doors: [number, number, string][] = [
    [0.18, 0.72, "12A"],
    [1.1, 1.5, "11"],
    [1.95, 2.25, "10"],
  ];
  const stations = [0.5, 1, 1.5, 2, 2.5];
  const lamps = [0.35, 1.25, 2.1];
  const long = Array.from(sign).length > 12;
  const signW = Math.max(48, Array.from(sign).length * (long ? 3.3 : 4.4) + 10);
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id="nx-corL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3d2615" />
          <stop offset="1" stopColor="#5b3a22" />
        </linearGradient>
        <linearGradient id="nx-corR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#2e1c0f" />
          <stop offset="1" stopColor="#4f321d" />
        </linearGradient>
        <linearGradient id="nx-corCeil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1d12" />
          <stop offset="1" stopColor="#6b5236" />
        </linearGradient>
        <linearGradient id="nx-corFloor" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f120a" />
          <stop offset="1" stopColor="#3d2615" />
        </linearGradient>
        <linearGradient id="nx-corRunner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#5e1b1e" />
          <stop offset="1" stopColor="#8e2a2c" />
        </linearGradient>
        <radialGradient id="nx-corEnd" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#ffcf73" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffcf73" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nx-corVignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* ceiling, floor and the two walls */}
      <path d={quad([[0, 0], [300, 0], [e.r, e.t], [e.l, e.t]])} fill="url(#nx-corCeil)" />
      <path d={quad([[0, 400], [300, 400], [e.r, e.b], [e.l, e.b]])} fill="url(#nx-corFloor)" />
      <path d={quad([[0, 0], [e.l, e.t], [e.l, e.b], [0, 400]])} fill="url(#nx-corL)" />
      <path d={quad([[300, 0], [e.r, e.t], [e.r, e.b], [300, 400]])} fill="url(#nx-corR)" />

      {/* ceiling ribs and the lamps */}
      <g stroke="#c9a227" strokeOpacity="0.35" fill="none">
        {stations.map((z) => {
          const c = sec(z);
          return <path key={z} d={`M${c.l} ${c.t + 6 * f(z)}Q150 ${c.t - 4 * f(z)} ${c.r} ${c.t + 6 * f(z)}`} strokeWidth={1.5 * f(z) + 0.4} />;
        })}
      </g>
      {lamps.map((z) => {
        const c = sec(z);
        const k = f(z);
        return (
          <g key={z}>
            <circle cx="150" cy={c.t + 14 * k} r={46 * k} fill="url(#nx-corEnd)" opacity="0.55" />
            <ellipse cx="150" cy={c.t + 10 * k} rx={22 * k} ry={6 * k} fill="#f6ead0" stroke="#c9a227" strokeWidth={0.8 * k + 0.3} />
          </g>
        );
      })}

      {/* left wall: dado, lower panels, windows with curtains, the handrail */}
      <path d={wallBand(L, 0, END, 0.68, 0.7)} fill="#c9a227" opacity="0.55" />
      {stations.map((z) => (
        <path key={`lp${z}`} d={wallBand(L, z - 0.02, z + 0.02, 0.72, 0.97)} fill="#2a180c" opacity="0.55" />
      ))}
      {windows.map(([z1, z2]) => (
        <g key={`w${z1}`}>
          <path d={wallBand(L, z1 - 0.05, z2 + 0.05, 0.18, 0.56)} fill="#7a5333" />
          <path d={wallBand(L, z1, z2, 0.21, 0.53)} fill="#0e1a2b" stroke="#c9a227" strokeWidth={1.4 * f(z1)} />
          <path d={wallBand(L, z1, z2, 0.21, 0.27)} fill="#efe6d2" opacity="0.85" />
          <g stroke="#9fb6d4" strokeOpacity="0.6" strokeWidth="0.7" className="nx-rain">
            {[0.25, 0.5, 0.75].map((u) => {
              const [x, y] = L(z1 + (z2 - z1) * u, 0.32 + u * 0.1);
              return <path key={u} d={`M${x} ${y}l${-3 * f(z1)} ${10 * f(z1)}`} />;
            })}
          </g>
          <path d={wallBand(L, z1 - 0.06, z1 + 0.03, 0.18, 0.6)} fill="#2f5d4a" />
          <path d={wallBand(L, z2 - 0.03, z2 + 0.06, 0.18, 0.6)} fill="#2f5d4a" />
        </g>
      ))}
      <path d={quad([L(0, 0.6), L(END, 0.6), L(END, 0.607), L(0, 0.614)])} fill="#c9a227" />

      {/* right wall: compartment doors with numbers, sconces between them */}
      <path d={wallBand(R, 0, END, 0.68, 0.7)} fill="#c9a227" opacity="0.4" />
      {doors.map(([z1, z2, n]) => {
        const [nx, ny] = R((z1 + z2) / 2, 0.3);
        const [hx, hy] = R(z1 + (z2 - z1) * 0.15, 0.58);
        return (
          <g key={n}>
            <path d={wallBand(R, z1 - 0.03, z2 + 0.03, 0.14, 1)} fill="#7a5333" />
            <path d={wallBand(R, z1, z2, 0.17, 1)} fill="#3d2615" stroke="#1b120b" strokeWidth="0.8" />
            <path d={wallBand(R, z1 + (z2 - z1) * 0.15, z2 - (z2 - z1) * 0.15, 0.24, 0.5)} fill="none" stroke="#7a5333" strokeWidth={f(z1)} />
            <rect x={nx - 9 * f(z1)} y={ny - 6 * f(z1)} width={18 * f(z1)} height={10 * f(z1)} rx={1.5 * f(z1)} fill="#c9a227" />
            <text x={nx} y={ny + 2 * f(z1)} textAnchor="middle" fontSize={7 * f(z1)} fill="#1b120b" fontFamily="Georgia, serif">
              {n}
            </text>
            <rect x={hx - 1.5 * f(z1)} y={hy - 7 * f(z1)} width={3 * f(z1)} height={14 * f(z1)} rx={1.5 * f(z1)} fill="#ecd27a" />
          </g>
        );
      })}
      {[0.9, 1.75, 2.55].map((z) => {
        const [x, y] = R(z, 0.25);
        const k = f(z);
        return (
          <g key={`s${z}`}>
            <circle cx={x} cy={y} r={24 * k} fill="url(#nx-corEnd)" opacity="0.6" />
            <path d={`M${x} ${y - 9 * k}l${-4 * k} ${8 * k}h${8 * k}z`} fill="#f3e3b5" stroke="#c9a227" strokeWidth={0.6 * k} />
          </g>
        );
      })}

      {/* the carpet runner, with brass stair-rod lines across it */}
      <path d={quad([[60, 400], [240, 400], [150 + 26, e.b], [150 - 26, e.b]])} fill="url(#nx-corRunner)" />
      <path d={`M60 400L${150 - 26} ${e.b}M240 400L${150 + 26} ${e.b}`} stroke="#c9a227" strokeWidth="1.2" opacity="0.7" />
      {stations.map((z) => {
        const c = sec(z);
        const k = f(z);
        return (
          <g key={`c${z}`}>
            <path d={`M${150 - 90 * k} ${c.b}H${150 + 90 * k}`} stroke="#c9a227" strokeOpacity="0.35" strokeWidth={k} />
            <path d={`M150 ${c.b - 9 * k}l${10 * k} ${9 * k}l${-10 * k} ${9 * k}l${-10 * k} ${-9 * k}z`} fill="none" stroke="#c9a227" strokeOpacity="0.5" strokeWidth={0.8 * k} />
          </g>
        );
      })}

      {/* the end wall and the glowing dining car door */}
      <rect x={e.l} y={e.t} width={e.r - e.l} height={e.b - e.t} fill="#3a2414" />
      <circle cx="150" cy="208" r="70" fill="url(#nx-corEnd)" opacity="0.55" />
      <rect x="133" y="172" width="34" height={e.b - 172} rx="1.5" fill="#4a2f1c" stroke="#c9a227" strokeWidth="1.2" />
      <rect x="138" y="178" width="24" height="30" rx="2" fill="url(#nx-corEnd)" />
      <rect x="138" y="178" width="24" height="30" rx="2" fill="none" stroke="#c9a227" strokeWidth="0.8" />
      <path d="M150 178V208M138 193H162" stroke="#c9a227" strokeWidth="0.5" opacity="0.7" />
      <circle cx="162" cy="222" r="1.4" fill="#ecd27a" />
      <rect x={150 - signW / 2} y="160" width={signW} height="9" rx="1.5" fill="#1b120b" stroke="#c9a227" strokeWidth="0.6" />
      <text x="150" y="166.4" textAnchor="middle" fontSize={long ? 4.3 : 5.2} fill="#ecd27a" fontFamily="Georgia, serif" letterSpacing={long ? 0.6 : 1.2}>
        {sign}
      </text>

      <rect width="300" height="400" fill="url(#nx-corVignette)" pointerEvents="none" />
    </g>
  );
}
