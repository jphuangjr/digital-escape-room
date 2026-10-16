import { Dust, Grain, LightPool, Mottle, Rain, Shadow, seeded } from "@/components/atlas/art/common";

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
  // A point on the floor at depth z, u across (-1 = left wall, 1 = right wall).
  const F = (z: number, u: number) => { const c = sec(z); return [150 + 150 * f(z) * u, c.b] as const; };
  const n1 = (v: number) => v.toFixed(1);
  const quad = (pts: (readonly [number, number])[]) => `M${pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join("L")}Z`;
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

  // Walnut figure: seeded vertical streaks on both walls, kept in perspective (vertical lines stay vertical).
  const rnd = seeded(1207);
  const grain = Array.from({ length: 18 }, () => {
    const right = rnd() > 0.5;
    const z = rnd() * 2.8;
    const h1 = 0.05 + rnd() * 0.75;
    const h2 = Math.min(0.97, h1 + 0.08 + rnd() * 0.2);
    return { right, z, h1, h2, dark: rnd() > 0.4, o: 0.12 + rnd() * 0.18, sw: (rnd() - 0.5) * 3 };
  });
  // The far horizon behind the glass: low hills, sampled along each window.
  const hills = (z1: number, z2: number, seed: number) => {
    const r = seeded(seed);
    const pts = Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      return L(z1 + (z2 - z1) * u, 0.43 + r() * 0.05);
    });
    return quad([L(z1 - 0.02, 0.6), ...pts, L(z2 + 0.02, 0.6)]);
  };

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
        <linearGradient id="nx-cor-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060b15" />
          <stop offset="0.7" stopColor="#14233a" />
          <stop offset="1" stopColor="#1f2f45" />
        </linearGradient>
        <linearGradient id="nx-cor-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfe0f0" stopOpacity="0" />
          <stop offset="0.45" stopColor="#cfe0f0" stopOpacity="0.14" />
          <stop offset="0.55" stopColor="#cfe0f0" stopOpacity="0.02" />
          <stop offset="1" stopColor="#cfe0f0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="nx-cor-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.42" />
          <stop offset="0.5" stopColor="#ffc96a" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffc96a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nx-cor-passing" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff2c4" stopOpacity="1" />
          <stop offset="0.3" stopColor="#ffd27a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nx-cor-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffdf9a" stopOpacity="0.32" />
          <stop offset="0.4" stopColor="#ffcf73" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffcf73" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nx-cor-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="nx-cor-lowerL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.02" />
          <stop offset="0.35" stopColor="#ffe2b0" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffe2b0" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="nx-cor-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a2414" />
          <stop offset="0.5" stopColor="#5a3a22" />
          <stop offset="1" stopColor="#3a2414" />
        </linearGradient>
        <linearGradient id="nx-cor-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#e8cf98" />
        </linearGradient>
        <linearGradient id="nx-cor-leather" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a3a1c" />
          <stop offset="1" stopColor="#2a140a" />
        </linearGradient>
        {windows.map(([z1, z2], i) => (
          <clipPath key={i} id={`nx-cor-win${i}`}>
            <path d={wallBand(L, z1, z2, 0.21, 0.53)} />
          </clipPath>
        ))}
        <clipPath id="nx-cor-runner">
          <path d={quad([[60, 400], [240, 400], [150 + 26, e.b], [150 - 26, e.b]])} />
        </clipPath>
        <clipPath id="nx-cor-walls">
          <path d={quad([[0, 0], [e.l, e.t], [e.l, e.b], [0, 400]])} />
          <path d={quad([[300, 0], [e.r, e.t], [e.r, e.b], [300, 400]])} />
        </clipPath>
      </defs>

      {/* ceiling, floor and the two walls */}
      <path d={quad([[0, 0], [300, 0], [e.r, e.t], [e.l, e.t]])} fill="url(#nx-corCeil)" />
      <path d={quad([[0, 400], [300, 400], [e.r, e.b], [e.l, e.b]])} fill="url(#nx-corFloor)" />
      <path d={quad([[0, 0], [e.l, e.t], [e.l, e.b], [0, 400]])} fill="url(#nx-corL)" />
      <path d={quad([[300, 0], [e.r, e.t], [e.r, e.b], [300, 400]])} fill="url(#nx-corR)" />

      {/* walnut: mottled veneer, figure streaks and a polished sheen below the rail */}
      <g clipPath="url(#nx-cor-walls)">
        <Mottle opacity={0.25} />
      </g>
      <g fill="none" strokeLinecap="round">
        {grain.map((g, i) => {
          const P = g.right ? R : L;
          const [x1, y1] = P(g.z, g.h1);
          const [, y2] = P(g.z, g.h2);
          const k = f(g.z);
          return <path key={`g${i}`} d={`M${n1(x1)} ${n1(y1)}q${n1(g.sw * k)} ${n1((y2 - y1) / 2)} 0 ${n1(y2 - y1)}`} stroke={g.dark ? "#1f1108" : "#a2724a"} strokeWidth={0.4 + 0.8 * k} opacity={g.o} />;
        })}
      </g>
      <path d={wallBand(L, 0, END, 0.7, 0.97)} fill="url(#nx-cor-lowerL)" />
      {/* cornices and skirting where walls meet ceiling and floor */}
      <path d={wallBand(L, 0, END, 0, 0.035)} fill="#1b120b" opacity="0.55" />
      <path d={wallBand(R, 0, END, 0, 0.035)} fill="#1b120b" opacity="0.55" />
      <path d={`M0 0L${e.l} ${e.t}M300 0L${e.r} ${e.t}`} stroke="#c9a227" strokeOpacity="0.45" strokeWidth="1.2" />
      <path d={wallBand(L, 0, END, 0.965, 1)} fill="#1b120b" opacity="0.7" />
      <path d={wallBand(R, 0, END, 0.965, 1)} fill="#1b120b" opacity="0.7" />

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
            {/* light on the ceiling and the upper walls */}
            <ellipse cx="150" cy={c.t + 12 * k} rx={150 * k} ry={34 * k} fill="url(#nx-cor-pool)" opacity="0.8" />
            <circle cx="150" cy={c.t + 14 * k} r={46 * k} fill="url(#nx-corEnd)" opacity="0.55" />
            <path d={`M${150 - 24 * k} ${c.t + 6 * k}H${150 + 24 * k}`} stroke="#c9a227" strokeWidth={1.6 * k + 0.3} strokeLinecap="round" />
            <ellipse cx="150" cy={c.t + 10 * k} rx={22 * k} ry={6 * k} fill="url(#nx-cor-bowl)" stroke="#c9a227" strokeWidth={0.8 * k + 0.3} />
            <ellipse cx={150 - 7 * k} cy={c.t + 8.5 * k} rx={8 * k} ry={1.5 * k} fill="#fff" opacity="0.6" />
            <circle cx="150" cy={c.t + 16.4 * k} r={1.3 * k + 0.2} fill="#ecd27a" />
          </g>
        );
      })}

      {/* left wall: dado, lower panels, windows with curtains, the handrail */}
      <path d={wallBand(L, 0, END, 0.68, 0.7)} fill="#c9a227" opacity="0.55" />
      {stations.map((z) => (
        <path key={`lp${z}`} d={wallBand(L, z - 0.02, z + 0.02, 0.72, 0.97)} fill="#2a180c" opacity="0.55" />
      ))}
      {windows.map(([z1, z2], i) => {
        const k = f(z1);
        const [cx1] = L(z1, 0.4);
        const [cx2, cy] = L(z2, 0.47);
        const mid = (cx1 + cx2) / 2;
        const [, hy] = L((z1 + z2) / 2, 0.46);
        const [rx, ry] = L(z1, 0.21);
        const [rx2, ry2] = L(z2, 0.53);
        return (
          <g key={`w${z1}`}>
            <path d={wallBand(L, z1 - 0.05, z2 + 0.05, 0.18, 0.56)} fill="#7a5333" />
            <path d={wallBand(L, z1, z2, 0.21, 0.53)} fill="url(#nx-cor-sky)" />
            <g clipPath={`url(#nx-cor-win${i})`}>
              {/* the hills, and lights of a village going by */}
              <path d={hills(z1, z2, 40 + i)} fill="#0a121e" />
              <g className="nx-lights">
                <circle cx={mid} cy={hy} r={5 * k + 1.2} fill="url(#nx-cor-passing)" style={{ animationDelay: `${-i * 0.8}s`, animationDuration: `${5 + i * 1.3}s` }} />
                <circle cx={mid + 6 * k} cy={hy + 1.5 * k} r={3 * k + 0.8} fill="url(#nx-cor-passing)" style={{ animationDuration: `${6.5 + i}s` }} />
              </g>
              <Rain x={Math.min(rx, rx2)} y={ry - 4} w={Math.abs(rx2 - rx)} h={ry2 - ry} count={[7, 4, 3, 2][i]} seed={60 + i} />
              <g stroke="#9fb6d4" strokeOpacity="0.6" strokeWidth="0.7" className="nx-rain">
                {[0.25, 0.5, 0.75].map((u) => {
                  const [x, y] = L(z1 + (z2 - z1) * u, 0.32 + u * 0.1);
                  return <path key={u} d={`M${x} ${y}l${-3 * f(z1)} ${10 * f(z1)}`} />;
                })}
              </g>
              <path d={wallBand(L, z1, z2, 0.21, 0.53)} fill="url(#nx-cor-glass)" />
              {/* the corridor lamp caught faintly in the glass */}
              <ellipse cx={cx2 - (cx2 - cx1) * 0.3} cy={cy - 30 * k} rx={4 * k + 0.5} ry={1.4 * k + 0.3} fill="#ffe9b8" opacity="0.28" />
            </g>
            <path d={wallBand(L, z1, z2, 0.21, 0.53)} fill="none" stroke="#c9a227" strokeWidth={1.4 * k} />
            <path d={wallBand(L, z1, z2, 0.21, 0.27)} fill="#efe6d2" opacity="0.85" />
            <path d={wallBand(L, z1, z2, 0.265, 0.27)} fill="#8a6a3a" opacity="0.6" />
            {/* velvet curtains, folds catching the lamplight */}
            <path d={wallBand(L, z1 - 0.06, z1 + 0.03, 0.18, 0.6)} fill="#2f5d4a" />
            <path d={wallBand(L, z2 - 0.03, z2 + 0.06, 0.18, 0.6)} fill="#2f5d4a" />
            <path d={wallBand(L, z1 - 0.035, z1 - 0.02, 0.18, 0.6)} fill="#5f9a7e" opacity="0.4" />
            <path d={wallBand(L, z2, z2 + 0.015, 0.18, 0.6)} fill="#5f9a7e" opacity="0.35" />
            <path d={wallBand(L, z1 - 0.06, z2 + 0.06, 0.6, 0.62)} fill="#000" opacity="0.25" />
          </g>
        );
      })}
      {/* the blind cord on the nearest window, swinging with the train */}
      {(() => {
        const [x, y1] = L(0.45, 0.27);
        const [, y2] = L(0.45, 0.37);
        return (
          <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDuration: "4.5s" }}>
            <path d={`M${n1(x)} ${n1(y1)}V${n1(y2)}`} stroke="#c9a227" strokeWidth="0.9" />
            <circle cx={x} cy={y2} r="1.6" fill="#ecd27a" />
            <path d={`M${n1(x - 1.6)} ${n1(y2 + 1)}L${n1(x - 2.6)} ${n1(y2 + 9)}H${n1(x + 2.6)}L${n1(x + 1.6)} ${n1(y2 + 1)}Z`} fill="#8e2a2c" />
            <path d={`M${n1(x - 2.6)} ${n1(y2 + 9)}H${n1(x + 2.6)}`} stroke="#ecd27a" strokeWidth="0.8" />
            <path d={`M${n1(x - 0.6)} ${n1(y2 + 2)}L${n1(x - 1)} ${n1(y2 + 8)}`} stroke="#c25a52" strokeWidth="0.6" />
          </g>
        );
      })()}
      {/* the brass handrail: shadow on the wall, the tube, its highlight, and brackets */}
      <path d={quad([L(0, 0.616), L(END, 0.609), L(END, 0.615), L(0, 0.632)])} fill="#000" opacity="0.35" />
      <path d={quad([L(0, 0.6), L(END, 0.6), L(END, 0.607), L(0, 0.614)])} fill="#c9a227" />
      <path d={quad([L(0, 0.6), L(END, 0.6), L(END, 0.602), L(0, 0.604)])} fill="#fff1c0" opacity="0.75" />
      {stations.map((z) => {
        const [x, y] = L(z, 0.607);
        const k = f(z);
        return <rect key={`b${z}`} x={x - 1.2 * k} y={y} width={2.4 * k} height={6 * k} fill="#9a7a1c" />;
      })}

      {/* right wall: compartment doors with numbers, sconces between them */}
      <path d={wallBand(R, 0, END, 0.68, 0.7)} fill="#c9a227" opacity="0.4" />
      {doors.map(([z1, z2, n]) => {
        const [nx, ny] = R((z1 + z2) / 2, 0.3);
        const [hx, hy] = R(z1 + (z2 - z1) * 0.15, 0.58);
        const k = f(z1);
        return (
          <g key={n}>
            <path d={wallBand(R, z1 - 0.03, z2 + 0.03, 0.14, 1)} fill="#7a5333" />
            <path d={wallBand(R, z1, z2, 0.17, 1)} fill="#3d2615" stroke="#1b120b" strokeWidth="0.8" />
            <path d={wallBand(R, z1 + (z2 - z1) * 0.55, z2, 0.17, 1)} fill="#ffe2b0" opacity="0.05" />
            <path d={wallBand(R, z1 + (z2 - z1) * 0.15, z2 - (z2 - z1) * 0.15, 0.24, 0.5)} fill="none" stroke="#7a5333" strokeWidth={k} />
            <path d={wallBand(R, z1 + 0.01, z2 - 0.01, 0.93, 0.985)} fill="#c9a227" opacity="0.7" />
            <rect x={nx - 9 * k} y={ny - 6 * k} width={18 * k} height={10 * k} rx={1.5 * k} fill="#c9a227" />
            <rect x={nx - 8 * k} y={ny - 5.3 * k} width={16 * k} height={1.6 * k} rx={0.8 * k} fill="#fff1c0" opacity="0.45" />
            <text x={nx} y={ny + 2 * k} textAnchor="middle" fontSize={7 * k} fill="#1b120b" fontFamily="Georgia, serif">
              {n}
            </text>
            <rect x={hx - 1.5 * k} y={hy - 7 * k} width={3 * k} height={14 * k} rx={1.5 * k} fill="#ecd27a" />
            <rect x={hx - 0.7 * k} y={hy - 6 * k} width={0.9 * k} height={10 * k} rx={0.45 * k} fill="#fff" opacity="0.6" />
          </g>
        );
      })}
      {[0.9, 1.75, 2.55].map((z) => {
        const [x, y] = R(z, 0.25);
        const k = f(z);
        return (
          <g key={`s${z}`}>
            <LightPool cx={x} cy={y} r={34 * k} flicker opacity={0.9} />
            <circle cx={x} cy={y} r={24 * k} fill="url(#nx-corEnd)" opacity="0.6" />
            <path d={`M${x} ${y - 1 * k}V${y + 6 * k}`} stroke="#c9a227" strokeWidth={1.2 * k} />
            <path d={`M${x} ${y - 9 * k}l${-4 * k} ${8 * k}h${8 * k}z`} fill="#f3e3b5" stroke="#c9a227" strokeWidth={0.6 * k} />
          </g>
        );
      })}

      {/* the floor: boards either side, the carpet runner with brass rods, pools of lamplight */}
      <g stroke="#000" strokeOpacity="0.35" strokeWidth="0.6">
        {[-0.92, -0.8, -0.68, 0.68, 0.8, 0.92].map((u) => {
          const [x1, y1] = F(0, u);
          const [x2, y2] = F(END, u);
          return <path key={u} d={`M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}`} />;
        })}
      </g>
      <path d={quad([[60, 400], [240, 400], [150 + 26, e.b], [150 - 26, e.b]])} fill="url(#nx-corRunner)" />
      <g clipPath="url(#nx-cor-runner)">
        <Mottle opacity={0.3} />
        <path d={quad([[60, 400], [92, 400], [150 - 22, e.b], [150 - 26, e.b]])} fill="#000" opacity="0.22" />
        <path d={quad([[208, 400], [240, 400], [150 + 26, e.b], [150 + 22, e.b]])} fill="#000" opacity="0.22" />
      </g>
      {/* a woven border inside the runner's edges */}
      <path d={quad([[72, 400], [80, 400], [150 - 21, e.b], [150 - 23, e.b]])} fill="#c9a227" opacity="0.18" />
      <path d={quad([[220, 400], [228, 400], [150 + 23, e.b], [150 + 21, e.b]])} fill="#c9a227" opacity="0.18" />
      <path d={`M60 400L${150 - 26} ${e.b}M240 400L${150 + 26} ${e.b}`} stroke="#c9a227" strokeWidth="1.2" opacity="0.7" />
      {lamps.map((z) => {
        const c = sec(z + 0.15);
        const k = f(z + 0.15);
        return <ellipse key={`p${z}`} cx="150" cy={c.b} rx={110 * k} ry={20 * k} fill="url(#nx-cor-pool)" opacity="0.6" />;
      })}
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
      {/* warm light spilling from the dining car door down the runner */}
      <path d={quad([[133, e.b], [167, e.b], [205, 360], [95, 360]])} fill="url(#nx-cor-spill)" />
      <rect y="320" width="300" height="80" fill="url(#nx-cor-near)" />

      {/* the end wall and the glowing dining car door */}
      <rect x={e.l} y={e.t} width={e.r - e.l} height={e.b - e.t} fill="#3a2414" />
      <circle cx="150" cy="208" r="70" fill="url(#nx-corEnd)" opacity="0.55" />
      <circle cx="150" cy="200" r="34" fill="url(#nx-corEnd)" opacity="0.5" className="at-breathe" />
      <rect x="130.5" y="170" width="39" height={e.b - 170} rx="2" fill="#7a5333" stroke="#c9a227" strokeWidth="0.6" />
      <rect x="133" y="172" width="34" height={e.b - 172} rx="1.5" fill="url(#nx-cor-door)" stroke="#c9a227" strokeWidth="1.2" />
      <rect x="138" y="178" width="24" height="30" rx="2" fill="url(#nx-corEnd)" />
      <rect x="140" y="181" width="20" height="25" rx="1.5" fill="#fff0c8" opacity="0.35" className="at-breathe" />
      {/* shapes of the dining car beyond the glass: a table lamp and a figure */}
      <circle cx="145" cy="198" r="2" fill="#fff6dc" opacity="0.8" />
      <path d="M154 208v-7q0-3 2.5-3t2.5 3v7z" fill="#5a3a22" opacity="0.4" />
      <rect x="138" y="178" width="24" height="30" rx="2" fill="none" stroke="#c9a227" strokeWidth="0.8" />
      <path d="M150 178V208M138 193H162" stroke="#c9a227" strokeWidth="0.5" opacity="0.7" />
      <rect x="138" y="214" width="24" height="26" rx="1" fill="none" stroke="#2a180c" strokeWidth="0.6" opacity="0.7" />
      <rect x="134.5" y={e.b - 7} width="31" height="5.5" fill="#c9a227" opacity="0.75" />
      <circle cx="162" cy="222" r="2.4" fill="url(#nx-corEnd)" />
      <circle cx="162" cy="222" r="1.4" fill="#ecd27a" />
      <rect x={150 - signW / 2} y="160" width={signW} height="9" rx="1.5" fill="#1b120b" stroke="#c9a227" strokeWidth="0.6" />
      <text x="150" y="166.4" textAnchor="middle" fontSize={long ? 4.3 : 5.2} fill="#ecd27a" fontFamily="Georgia, serif" letterSpacing={long ? 0.6 : 1.2}>
        {sign}
      </text>

      {/* dust turning in the lamplight */}
      <g opacity="0.55">
        <Dust x={118} y={150} w={64} h={95} count={6} color="#ffe9b8" seed={21} />
        <Dust x={80} y={40} w={140} h={150} count={6} seed={22} />
      </g>

      {/* a pair of shoes put out for polishing beside 12A */}
      {(() => {
        const [sx, sy] = F(0.4, 0.8);
        const k = f(0.4) * 1.3;
        const shoe = (dx: number, dy: number, dim: number) => (
          <g transform={`translate(${n1(sx + dx * k)} ${n1(sy + dy * k)}) scale(${k.toFixed(3)})`} opacity={dim}>
            {/* sole and heel */}
            <path d="M-21 -1.5q0 2 3 2h34v-3z" fill="#120904" />
            {/* upper: toe cap, vamp, collar, heel counter */}
            <path d="M-21 -1.5q-0.5-5 5-6.5l9-2.5q3-1 5-4q2-1.5 5-1.5q6 0 10 0.5q2.5 0.5 2.5 3v11.5h-36z" fill="url(#nx-cor-leather)" />
            <path d="M-3 -12.5q6-1.2 12-0.4" stroke="#140a05" strokeWidth="1.6" fill="none" />
            <path d="M-4 -12.4l3 -1.6M-1 -11.8l3 -1.6" stroke="#e8dcc0" strokeWidth="0.6" />
            <path d="M-19 -5q3-2.5 9-3.5" stroke="#e0a874" strokeWidth="1.2" fill="none" opacity="0.65" strokeLinecap="round" />
          </g>
        );
        return (
          <g>
            <Shadow cx={sx} cy={sy + 1} rx={30 * k} ry={4.5 * k} opacity={0.65} />
            {shoe(4, -3, 0.85)}
            {shoe(-3, 3, 1)}
          </g>
        );
      })()}

      <Grain opacity={0.08} />
      <rect width="300" height="400" fill="url(#nx-corVignette)" pointerEvents="none" />
    </g>
  );
}
