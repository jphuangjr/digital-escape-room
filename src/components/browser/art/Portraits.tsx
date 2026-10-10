import type React from "react";

/*
 * Meridian Institute staff portraits: official staff photos reimagined as
 * sepia ink engravings. Every portrait shares one framing (viewBox 0 0 160 200,
 * head centred on x=80, eye line at y=88, shoulders from y~150) and one
 * palette; each person is defined by a small spec plus hand-drawn hair and
 * attire. Deterministic, hook-free, no text.
 *
 * Wren Okafor deliberately has no portrait (her missing photo is a clue).
 */

const INK = "#2e2016";
const PAPER = "#f2e9d4";
const PAPER_EDGE = "#d9c8a4";
const CX = 80;
const EYE_Y = 88;

// Sepia skin values, lightest to deepest.
const SKIN = {
  s1: "#efdcbd",
  s2: "#e3c59c",
  s3: "#cfa878",
  s4: "#a97a52",
  s5: "#7b5237",
} as const;

// Hair values in the same sepia range.
const HAIR = {
  black: "#2b1d15",
  dark: "#45301f",
  brown: "#6e4f34",
  blond: "#cdaf7f",
  grey: "#a69680",
  silver: "#d2c6b1",
  white: "#e9e0cd",
} as const;

type Ctx = { k: string; skin: string; w: number; hair: string };

type Spec = {
  skin: string;
  hair: string;
  /** half-width of the face at the cheekbones */
  w: number;
  /** half-width at the jaw corner */
  jaw: number;
  /** half-width of the chin curve */
  chin: number;
  /** chin bottom y */
  chinY?: number;
  /** neck half-width */
  neck: number;
  /** 0 = narrow shoulders, 1 = broad */
  build: number;
  age: 0 | 1 | 2 | 3;
  brow: { thick: number; arch: number; tilt: number; lift?: number; color?: string };
  eye: { size: number; lid: number; gap?: number; narrow?: number };
  nose: { w: number; len: number; bridge?: boolean };
  mouth: { w: number; smile: number; full: number; y?: number; smirk?: number };
  glasses?: "round" | "rect" | "cat" | "half" | "wire";
  hairBack?: (c: Ctx) => React.ReactNode;
  hairFront?: (c: Ctx) => React.ReactNode;
  attire: (c: Ctx) => React.ReactNode;
  facial?: (c: Ctx) => React.ReactNode;
  extras?: (c: Ctx) => React.ReactNode;
};

const L = (n: number) => Math.round(n * 10) / 10;

function facePath(s: Spec) {
  const { w, jaw, chin } = s;
  const cy = s.chinY ?? 127;
  const r = (dx: number) => L(CX + dx);
  const l = (dx: number) => L(CX - dx);
  return [
    `M${CX} 46`,
    `C${r(w * 0.92)} 46 ${r(w)} 63 ${r(w)} 84`,
    `C${r(w)} 98 ${r(jaw + 2)} 108 ${r(jaw)} 115`,
    `C${r(jaw - 4)} ${cy - 5} ${r(chin)} ${cy} ${CX} ${cy}`,
    `C${l(chin)} ${cy} ${l(jaw - 4)} ${cy - 5} ${l(jaw)} 115`,
    `C${l(jaw + 2)} 108 ${l(w)} 98 ${l(w)} 84`,
    `C${l(w)} 63 ${l(w * 0.92)} 46 ${CX} 46Z`,
  ].join(" ");
}

function bodyPath(build: number, neck: number) {
  const a = L(36 - build * 18);
  const y0 = L(186 - build * 16);
  return `M-4 204 L-4 ${y0} C4 ${L(y0 - 16)} ${a} 156 ${CX - neck - 5} 150 L${CX + neck + 5} 150 C${160 - a} 156 156 ${L(y0 - 16)} 164 ${y0} L164 204Z`;
}

function Defs({ k }: { k: string }) {
  return (
    <defs>
      <radialGradient id={`${k}-bg`} cx="50%" cy="42%" r="70%">
        <stop offset="0" stopColor={PAPER} />
        <stop offset="0.65" stopColor="#ebdfc4" />
        <stop offset="1" stopColor={PAPER_EDGE} />
      </radialGradient>
      <pattern id={`${k}-lines`} width="160" height="2.6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="1.3" x2="160" y2="1.3" stroke={INK} strokeWidth="0.45" />
      </pattern>
      <pattern id={`${k}-h`} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <line x1="0" y1="0" x2="0" y2="2.4" stroke={INK} strokeWidth="0.7" />
      </pattern>
      <pattern id={`${k}-x`} width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)">
        <line x1="0" y1="0" x2="0" y2="2.6" stroke={INK} strokeWidth="0.6" />
      </pattern>
      <radialGradient id={`${k}-vig`} cx="50%" cy="40%" r="62%">
        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </radialGradient>
      <mask id={`${k}-vm`}>
        <rect width="160" height="200" fill={`url(#${k}-vig)`} />
      </mask>
      <linearGradient id={`${k}-shade`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={INK} stopOpacity="0" />
        <stop offset="0.55" stopColor={INK} stopOpacity="0" />
        <stop offset="1" stopColor={INK} stopOpacity="0.28" />
      </linearGradient>
    </defs>
  );
}

function Eye({ x, s, flip }: { x: number; s: Spec; flip: boolean }) {
  const z = s.eye.size;
  const n = s.eye.narrow ?? 0;
  const hw = 4.6 * z;
  const up = (3.1 - n) * z;
  const dn = (2.1 - n * 0.5) * z;
  const y = EYE_Y;
  const d = flip ? -1 : 1;
  const iy = y - 0.2;
  return (
    <g>
      <path
        d={`M${L(x - hw)} ${y} Q${L(x - d * 0.6)} ${L(y - up * 1.25)} ${L(x + hw)} ${L(y - 0.3)} Q${x} ${L(y + dn * 1.3)} ${L(x - hw)} ${y}Z`}
        fill="#f7f0e0"
      />
      <circle cx={x} cy={iy} r={L(2.15 * z)} fill={INK} />
      <circle cx={L(x - 0.7)} cy={L(iy - 0.8)} r="0.55" fill="#f7f0e0" />
      <path
        d={`M${L(x - hw - 0.6)} ${L(y + 0.4)} Q${L(x - d * 0.6)} ${L(y - up * 1.3)} ${L(x + hw + 0.4)} ${L(y - 0.2)}`}
        fill="none"
        stroke={INK}
        strokeWidth={L(1.3 + s.eye.lid * 0.5)}
        strokeLinecap="round"
      />
      <path
        d={`M${L(x - hw + 1)} ${L(y + dn * 0.9)} Q${x} ${L(y + dn * 1.35)} ${L(x + hw - 0.8)} ${L(y + 0.6)}`}
        fill="none"
        stroke={INK}
        strokeWidth="0.6"
        opacity="0.7"
      />
      {/* lid crease */}
      <path
        d={`M${L(x - hw + 0.8)} ${L(y - up - 1.2)} Q${x} ${L(y - up * 1.6 - 1.4)} ${L(x + hw - 0.2)} ${L(y - up * 0.7 - 1)}`}
        fill="none"
        stroke={INK}
        strokeWidth="0.55"
        opacity="0.55"
      />
    </g>
  );
}

function Brow({ x, s, flip }: { x: number; s: Spec; flip: boolean }) {
  const d = flip ? -1 : 1;
  const b = s.brow;
  const y = EYE_Y - 7.5 - (b.lift && !flip ? b.lift : 0);
  const inner = x - d * 6;
  const outer = x + d * 6.5;
  const t = b.thick;
  return (
    <path
      d={`M${L(inner)} ${L(y + b.tilt)} Q${L(x)} ${L(y - b.arch - t)} ${L(outer)} ${L(y + 0.6 - b.tilt * 0.3)} Q${L(x)} ${L(y - b.arch + t * 0.6)} ${L(inner)} ${L(y + b.tilt + t)}Z`}
      fill={b.color ?? INK}
      stroke={b.color ?? INK}
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  );
}

function Glasses({ s }: { s: Spec }) {
  const g = s.glasses;
  if (!g) return null;
  const gap = s.eye.gap ?? 11;
  const lx = CX - gap;
  const rx = CX + gap;
  const y = EYE_Y;
  const lens = { fill: "#fff", fillOpacity: 0.12, stroke: INK };
  const arm = (
    <>
      <path d={`M${lx - 9} ${y - 2} L${CX - s.w - 1} ${y - 1}`} stroke={INK} strokeWidth="1.1" />
      <path d={`M${rx + 9} ${y - 2} L${CX + s.w + 1} ${y - 1}`} stroke={INK} strokeWidth="1.1" />
    </>
  );
  if (g === "round" || g === "wire") {
    const r = g === "round" ? 8.2 : 7.4;
    const sw = g === "round" ? 1.5 : 0.9;
    return (
      <g>
        {arm}
        <circle cx={lx} cy={y} r={r} {...lens} strokeWidth={sw} />
        <circle cx={rx} cy={y} r={r} {...lens} strokeWidth={sw} />
        <path d={`M${lx + r} ${y - 1} Q${CX} ${y - 4} ${rx - r} ${y - 1}`} fill="none" stroke={INK} strokeWidth={sw} />
      </g>
    );
  }
  if (g === "rect") {
    return (
      <g>
        {arm}
        <rect x={lx - 8.5} y={y - 5.5} width="17" height="11" rx="2.2" {...lens} strokeWidth="1.5" />
        <rect x={rx - 8.5} y={y - 5.5} width="17" height="11" rx="2.2" {...lens} strokeWidth="1.5" />
        <path d={`M${lx + 8.5} ${y - 2} Q${CX} ${y - 4} ${rx - 8.5} ${y - 2}`} fill="none" stroke={INK} strokeWidth="1.4" />
      </g>
    );
  }
  if (g === "half") {
    return (
      <g>
        <path d={`M${lx - 9} ${y + 2} L${CX - s.w - 1} ${y - 1}`} stroke={INK} strokeWidth="0.9" />
        <path d={`M${rx + 9} ${y + 2} L${CX + s.w + 1} ${y - 1}`} stroke={INK} strokeWidth="0.9" />
        <path d={`M${lx - 8.5} ${y + 2.5} L${lx + 8.5} ${y + 2.5} Q${lx + 8} ${y + 10} ${lx} ${y + 10} Q${lx - 8} ${y + 10} ${lx - 8.5} ${y + 2.5}Z`} {...lens} strokeWidth="1.2" />
        <path d={`M${rx - 8.5} ${y + 2.5} L${rx + 8.5} ${y + 2.5} Q${rx + 8} ${y + 10} ${rx} ${y + 10} Q${rx - 8} ${y + 10} ${rx - 8.5} ${y + 2.5}Z`} {...lens} strokeWidth="1.2" />
        <path d={`M${lx + 8.5} ${y + 3} Q${CX} ${y} ${rx - 8.5} ${y + 3}`} fill="none" stroke={INK} strokeWidth="1" />
      </g>
    );
  }
  // cat-eye: heavy upswept frames
  const cat = (x: number, d: number) =>
    `M${x - d * 9.5} ${y - 6.5} Q${x} ${y - 6} ${x + d * 8} ${y - 4.5} Q${x + d * 8.5} ${y + 6} ${x} ${y + 6} Q${x - d * 8} ${y + 6} ${x - d * 9.5} ${y - 6.5}Z`;
  return (
    <g>
      {arm}
      <path d={cat(lx, -1)} {...lens} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={cat(rx, 1)} {...lens} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={`M${lx + 8} ${y - 3} Q${CX} ${y - 5.5} ${rx - 8} ${y - 3}`} fill="none" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}

function AgeLines({ s }: { s: Spec }) {
  if (s.age === 0) return null;
  const gap = s.eye.gap ?? 11;
  const o = { fill: "none", stroke: INK, strokeLinecap: "round" as const };
  return (
    <g opacity={0.35 + s.age * 0.12}>
      {/* nasolabial folds */}
      <path d={`M${CX - 8} 102 Q${CX - 12} 108 ${CX - 11.5} ${114 + s.age}`} {...o} strokeWidth="0.8" />
      <path d={`M${CX + 8} 102 Q${CX + 12} 108 ${CX + 11.5} ${114 + s.age}`} {...o} strokeWidth="0.8" />
      {s.age >= 2 && (
        <>
          {/* crow's feet */}
          <path d={`M${CX - gap - 6.5} ${EYE_Y + 1} l-3 -1.5 M${CX - gap - 6.5} ${EYE_Y + 2} l-3 1`} {...o} strokeWidth="0.6" />
          <path d={`M${CX + gap + 6.5} ${EYE_Y + 1} l3 -1.5 M${CX + gap + 6.5} ${EYE_Y + 2} l3 1`} {...o} strokeWidth="0.6" />
          {/* under-eye */}
          <path d={`M${CX - gap - 3} ${EYE_Y + 5} Q${CX - gap} ${EYE_Y + 6.5} ${CX - gap + 3.5} ${EYE_Y + 5}`} {...o} strokeWidth="0.55" />
          <path d={`M${CX + gap - 3.5} ${EYE_Y + 5} Q${CX + gap} ${EYE_Y + 6.5} ${CX + gap + 3} ${EYE_Y + 5}`} {...o} strokeWidth="0.55" />
        </>
      )}
      {s.age >= 3 && (
        <>
          {/* forehead lines */}
          <path d={`M${CX - 10} 70 Q${CX} 68 ${CX + 10} 70`} {...o} strokeWidth="0.55" />
          <path d={`M${CX - 8} 74 Q${CX} 72.5 ${CX + 8} 74`} {...o} strokeWidth="0.5" />
          {/* jowl */}
          <path d={`M${CX - s.jaw + 3} 116 Q${CX - s.jaw + 6} 121 ${CX - s.chin - 2} 123`} {...o} strokeWidth="0.55" />
          <path d={`M${CX + s.jaw - 3} 116 Q${CX + s.jaw - 6} 121 ${CX + s.chin + 2} 123`} {...o} strokeWidth="0.55" />
        </>
      )}
    </g>
  );
}

function Portrait({ k, s }: { k: string; s: Spec }) {
  const c: Ctx = { k, skin: s.skin, w: s.w, hair: s.hair };
  const face = facePath(s);
  const gap = s.eye.gap ?? 11;
  const my = s.mouth.y ?? 114;
  const mw = s.mouth.w;
  const sm = s.mouth.smirk ?? 0;
  const nb = 88 + s.nose.len;
  const nw = s.nose.w;
  return (
    <svg viewBox="0 0 160 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Defs k={k} />
      <clipPath id={`${k}-face`}>
        <path d={face} />
      </clipPath>
      <clipPath id={`${k}-body`}>
        <path d={bodyPath(s.build, s.neck)} />
      </clipPath>

      {/* backdrop: engraved horizontal rule lines, lighter behind the sitter */}
      <rect width="160" height="200" fill={`url(#${k}-bg)`} />
      <rect width="160" height="200" fill={`url(#${k}-lines)`} opacity="0.32" />
      <rect width="160" height="200" fill={`url(#${k}-x)`} opacity="0.3" mask={`url(#${k}-vm)`} />

      <g transform="translate(80 91) scale(1.14) translate(-80 -88)">
      {s.hairBack?.(c)}

      <g transform="translate(0 -8)">
      {/* neck */}
      <path
        d={`M${CX - s.neck} 108 L${CX - s.neck - 1} 152 Q${CX} 160 ${CX + s.neck + 1} 152 L${CX + s.neck} 108Z`}
        fill={s.skin}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path
        d={`M${CX - s.neck} 112 L${CX + s.neck} 112 L${CX + s.neck + 1} 150 Q${CX + 4} 138 ${CX - s.neck} 128Z`}
        fill={`url(#${k}-h)`}
        opacity="0.6"
      />

      {/* shoulders & clothing */}
      <g>
        <path d={bodyPath(s.build, s.neck)} fill="#cdbb98" stroke={INK} strokeWidth="1.4" />
        {s.attire(c)}
        <g clipPath={`url(#${k}-body)`}>
          <rect x="108" y="140" width="60" height="70" fill={`url(#${k}-x)`} opacity="0.35" />
          <rect x="-4" y="185" width="168" height="20" fill={`url(#${k}-h)`} opacity="0.35" />
        </g>
        <path d={bodyPath(s.build, s.neck)} fill="none" stroke={INK} strokeWidth="1.4" />
      </g>
      </g>

      {/* ears */}
      <ellipse cx={CX - s.w + 0.5} cy="91" rx="4.2" ry="8" fill={s.skin} stroke={INK} strokeWidth="1.2" />
      <ellipse cx={CX + s.w - 0.5} cy="91" rx="4.2" ry="8" fill={s.skin} stroke={INK} strokeWidth="1.2" />
      <path d={`M${CX - s.w - 1} 87 q2 3 0.5 7`} fill="none" stroke={INK} strokeWidth="0.7" />
      <path d={`M${CX + s.w + 1} 87 q-2 3 -0.5 7`} fill="none" stroke={INK} strokeWidth="0.7" />

      {/* face */}
      <path d={face} fill={s.skin} />
      <g clipPath={`url(#${k}-face)`}>
        <rect x="0" y="40" width="160" height="100" fill={`url(#${k}-shade)`} />
        <path
          d={`M${CX + s.w * 0.55} 50 Q${CX + s.w * 0.28} 92 ${CX + s.w * 0.62} 130 L170 130 L170 50Z`}
          fill={`url(#${k}-h)`}
          opacity="0.42"
        />
        {/* soft shadow under the brow ridge and beside the nose */}
        <path d={`M${CX + 3} 86 Q${CX + nw + 3} 96 ${CX + nw + 1} ${nb}`} fill="none" stroke={INK} strokeWidth="2.4" opacity="0.08" />
      </g>
      <path d={face} fill="none" stroke={INK} strokeWidth="1.5" />

      <AgeLines s={s} />

      {/* brows & eyes */}
      <Brow x={CX - gap} s={s} flip={false} />
      <Brow x={CX + gap} s={s} flip={true} />
      <Eye x={CX - gap} s={s} flip={false} />
      <Eye x={CX + gap} s={s} flip={true} />

      {/* nose */}
      {s.nose.bridge && <path d={`M${CX - 2.5} 90 Q${CX - 3} ${nb - 6} ${CX - nw + 0.5} ${nb - 1}`} fill="none" stroke={INK} strokeWidth="0.7" opacity="0.6" />}
      <path d={`M${CX + 2.5} 89 Q${CX + 3.5} ${nb - 7} ${CX + nw - 0.5} ${nb - 1}`} fill="none" stroke={INK} strokeWidth="0.9" opacity="0.75" />
      <path
        d={`M${CX - nw} ${nb - 1.5} Q${CX - nw - 1.5} ${nb + 1.6} ${CX - nw + 2.2} ${nb + 1.6} Q${CX} ${nb + 3.6} ${CX + nw - 2.2} ${nb + 1.6} Q${CX + nw + 1.5} ${nb + 1.6} ${CX + nw} ${nb - 1.5}`}
        fill="none"
        stroke={INK}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <ellipse cx={CX - nw * 0.45} cy={nb + 1.2} rx="1.3" ry="0.7" fill={INK} opacity="0.7" />
      <ellipse cx={CX + nw * 0.45} cy={nb + 1.2} rx="1.3" ry="0.7" fill={INK} opacity="0.7" />

      {s.facial?.(c)}

      {/* mouth */}
      {s.mouth.full > 0 && (
        <path
          d={`M${CX - mw} ${my} Q${CX} ${my + 4 + s.mouth.full * 2.5 + s.mouth.smile * 0.5} ${CX + mw} ${my}Z`}
          fill={INK}
          opacity="0.18"
        />
      )}
      <path
        d={`M${CX - mw} ${my - s.mouth.smile} Q${CX - mw * 0.5} ${my - 1.2} ${CX} ${my - 0.6} Q${CX + mw * 0.5} ${my - 1.2 - sm * 0.5} ${CX + mw} ${my - s.mouth.smile - sm}`}
        fill={INK}
        fillOpacity={0.12 + s.mouth.full * 0.12}
        stroke="none"
      />
      <path
        d={`M${CX - mw} ${my - s.mouth.smile} Q${CX} ${my + 1.8 + s.mouth.smile * 1.4} ${CX + mw} ${my - s.mouth.smile - sm}`}
        fill="none"
        stroke={INK}
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d={`M${CX - mw * 0.45} ${my + 4 + s.mouth.full * 1.4} Q${CX} ${my + 5.4 + s.mouth.full * 1.6} ${CX + mw * 0.45} ${my + 4 + s.mouth.full * 1.4}`}
        fill="none"
        stroke={INK}
        strokeWidth="0.75"
        opacity="0.6"
      />
      {/* philtrum hint */}
      <path d={`M${CX - 1.6} ${nb + 4} L${CX - 1.4} ${my - 3.5} M${CX + 1.6} ${nb + 4} L${CX + 1.4} ${my - 3.5}`} stroke={INK} strokeWidth="0.45" opacity="0.4" />

      {s.hairFront?.(c)}
      <Glasses s={s} />
      {s.extras?.(c)}
      </g>
    </svg>
  );
}

/* ---------- shared drawing bits ---------- */

const ink = { stroke: INK, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Fine strands drawn over a hair mass to read as engraving. */
function Strands({ d, w = 0.6, o = 0.55, color = INK }: { d: string[]; w?: number; o?: number; color?: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={w} opacity={o} strokeLinecap="round">
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </g>
  );
}

function ShirtCollar({ fill = "#f3ebda", spread = 1, open = false }: { fill?: string; spread?: number; open?: boolean }) {
  const s = spread;
  return (
    <g {...ink} strokeWidth="1.1" fill={fill}>
      <path d={`M${CX - 13} 144 L${CX - 15 - 4 * s} 160 L${CX - (open ? 6 : 2)} ${open ? 166 : 158} L${CX - 3} 150Z`} />
      <path d={`M${CX + 13} 144 L${CX + 15 + 4 * s} 160 L${CX + (open ? 6 : 2)} ${open ? 166 : 158} L${CX + 3} 150Z`} />
    </g>
  );
}

function Tie({ fill, pattern }: { fill: string; pattern?: string }) {
  return (
    <g {...ink} strokeWidth="1">
      <path d={`M${CX - 3.6} 157 L${CX + 3.6} 157 L${CX + 2.6} 163 L${CX - 2.6} 163Z`} fill={fill} />
      <path d={`M${CX - 2.6} 163 L${CX + 2.6} 163 L${CX + 6} 200 L${CX - 6} 200Z`} fill={fill} />
      {pattern && <path d={`M${CX - 2.6} 163 L${CX + 2.6} 163 L${CX + 6} 200 L${CX - 6} 200Z`} fill={pattern} opacity="0.7" stroke="none" />}
    </g>
  );
}

/** Jacket with notched lapels opening to a V. */
function Jacket({ fill, k, v = 196, notch = true, buttons = true }: { fill: string; k: string; v?: number; notch?: boolean; buttons?: boolean }) {
  return (
    <g {...ink}>
      <path d={`M-4 204 L-4 172 C6 158 30 154 ${CX - 17} 148 L${CX} ${v} L${CX + 17} 148 C130 154 154 158 164 172 L164 204Z`} fill={fill} strokeWidth="1.3" />
      <path d={`M-4 204 L-4 172 C6 158 30 154 ${CX - 17} 148 L${CX} ${v} L${CX + 17} 148 C130 154 154 158 164 172 L164 204Z`} fill={`url(#${k}-h)`} opacity="0.5" stroke="none" />
      {/* lapels */}
      <path
        d={`M${CX - 17} 148 L${CX - 24} ${notch ? 166 : 170} ${notch ? `L${CX - 29} 164 L${CX - 26} 176` : ""} L${CX} ${v}`}
        fill="none"
        strokeWidth="1.1"
      />
      <path
        d={`M${CX + 17} 148 L${CX + 24} ${notch ? 166 : 170} ${notch ? `L${CX + 29} 164 L${CX + 26} 176` : ""} L${CX} ${v}`}
        fill="none"
        strokeWidth="1.1"
      />
      {buttons && <circle cx={CX + 1} cy={v + 1} r="1.6" fill={INK} />}
    </g>
  );
}

/* ---------- the staff ---------- */

const calloway: Spec = {
  skin: SKIN.s1,
  hair: HAIR.silver,
  w: 25,
  jaw: 19,
  chin: 8,
  neck: 10,
  build: 0.35,
  age: 3,
  brow: { thick: 1.2, arch: 2.2, tilt: 0.4, color: "#6f5a45" },
  eye: { size: 0.95, lid: 0.6, narrow: 0.2 },
  nose: { w: 5.5, len: 16, bridge: true },
  mouth: { w: 7.5, smile: 1.2, full: 0.4 },
  glasses: "half",
  hairBack: () => (
    <g {...ink} strokeWidth="1.3">
      {/* chignon at the crown */}
      <ellipse cx={CX + 3} cy="40" rx="14" ry="9" fill={HAIR.silver} />
      <Strands d={["M70 40 Q80 33 94 38", "M71 44 Q82 38 95 42"]} o={0.5} />
    </g>
  ),
  hairFront: () => (
    <g {...ink}>
      <path
        d="M52 88 C47 66 52 44 70 38 C82 34 96 36 104 44 C111 52 112 70 108 88 C106 76 103 66 96 60 C88 56 76 55 68 58 C60 62 55 72 54 88Z"
        fill={HAIR.silver}
        strokeWidth="1.3"
      />
      <Strands
        d={[
          "M56 80 C55 62 62 46 78 41",
          "M60 66 C64 52 76 45 92 44",
          "M66 58 C76 50 92 48 102 54",
          "M104 80 C105 66 102 54 94 47",
          "M72 56 C82 50 96 52 103 60",
        ]}
        o={0.5}
        w={0.55}
      />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      <path d={`M${CX - 14} 146 Q${CX} 166 ${CX + 14} 146 L${CX + 22} 200 L${CX - 22} 200Z`} fill="#f2e8d3" {...ink} strokeWidth="1" />
      <Jacket fill="#4a3a2c" k={k} v={190} notch={false} buttons={false} />
      {/* pearls */}
      <g fill="#f8f2e4" stroke={INK} strokeWidth="0.6">
        {[-11, -8, -4.5, -1.5, 1.5, 4.5, 8, 11].map((dx, i) => (
          <circle key={dx} cx={CX + dx} cy={150 + Math.cos((dx / 11) * 1.3) * 7 - (i === 0 || i === 7 ? 0.5 : 0)} r="1.7" />
        ))}
      </g>
    </g>
  ),
  extras: () => (
    <g fill="#f8f2e4" stroke={INK} strokeWidth="0.6">
      <circle cx={CX - 25.5} cy="99" r="1.8" />
      <circle cx={CX + 25.5} cy="99" r="1.8" />
    </g>
  ),
};

const voss: Spec = {
  skin: SKIN.s2,
  hair: HAIR.black,
  w: 24,
  jaw: 18,
  chin: 7,
  neck: 9.5,
  build: 0.3,
  age: 1,
  brow: { thick: 1.6, arch: 2.6, tilt: 0.8, lift: 1.2 },
  eye: { size: 1.05, lid: 1.2, narrow: 0.35 },
  nose: { w: 4.8, len: 16, bridge: true },
  mouth: { w: 7, smile: -0.3, full: 0.6 },
  hairBack: () => (
    <path
      d="M50 70 C48 46 64 34 82 34 C102 34 114 48 112 72 L114 118 L100 122 L60 122 L46 118Z"
      fill={HAIR.black}
      {...ink}
      strokeWidth="1.3"
    />
  ),
  hairFront: () => (
    <g {...ink}>
      {/* sharp asymmetric bob: deep side part, angled ends */}
      <path
        d="M66 38 C52 44 48 60 50 84 C50 98 48 110 45 120 L60 116 C56 104 55 92 56 80 C58 68 64 61 73 59 C85 57 97 61 106 70 C106 98 104 110 101 124 L116 117 C112 104 112 92 112 78 C112 52 100 36 82 35 C76 35 70 36 66 38Z"
        fill={HAIR.black}
        strokeWidth="1.3"
      />
      <Strands
        d={["M70 39 C60 46 54 62 54 84 C54 98 52 108 50 116", "M78 37 C96 38 108 52 109 76 C109 92 108 106 106 118", "M60 66 C68 56 86 52 104 64", "M64 46 C58 56 56 70 56 82", "M70 44 C82 42 96 46 106 58"]}
        color="#8d7458"
        o={0.7}
        w={0.6}
      />
      {/* a single silver streak swept off the parting */}
      <path d="M68 40 C60 48 57 58 58 68 C66 58 78 55 90 56 C80 54 70 50 68 40Z" fill="#cbbda5" stroke="none" opacity="0.9" />
      <Strands d={["M66 44 C61 52 59 60 60 66", "M70 50 C66 56 64 60 63 63"]} o={0.45} w={0.5} />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      {/* dark wool coat */}
      <path d={`M-4 204 L-4 172 C6 158 30 154 ${CX - 15} 148 L${CX} 168 L${CX + 15} 148 C130 154 154 158 164 172 L164 204Z`} fill="#3b2d22" {...ink} strokeWidth="1.3" />
      <path d={`M-4 204 L-4 172 C6 158 30 154 ${CX - 15} 148 L${CX} 168 L${CX + 15} 148 C130 154 154 158 164 172 L164 204Z`} fill={`url(#${k}-h)`} opacity="0.5" />
      {/* patterned silk scarf: wrapped at the throat, knot and tails falling left */}
      <defs>
        <pattern id={`${k}-scarf`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#b88a5a" />
          <rect width="3" height="3" fill="#7c4f2e" />
          <circle cx="4.5" cy="4.5" r="0.8" fill="#f1e2c4" />
        </pattern>
      </defs>
      <g {...ink} strokeWidth="1.2">
        <path d={`M${CX - 16} 142 C${CX - 12} 152 ${CX + 12} 152 ${CX + 16} 142 L${CX + 18} 152 C${CX + 10} 162 ${CX - 10} 162 ${CX - 18} 152Z`} fill={`url(#${k}-scarf)`} />
        <path d={`M${CX - 8} 156 L${CX - 16} 200 L${CX - 2} 200 L${CX + 0} 160Z`} fill={`url(#${k}-scarf)`} />
        <path d={`M${CX - 2} 157 L${CX + 8} 198 L${CX + 18} 194 L${CX + 6} 156Z`} fill={`url(#${k}-scarf)`} />
        <ellipse cx={CX - 1} cy="158" rx="6.5" ry="5" fill={`url(#${k}-scarf)`} />
        <path d={`M${CX - 6} 158 Q${CX - 1} 161 ${CX + 4} 156`} fill="none" strokeWidth="0.7" />
      </g>
    </g>
  ),
  extras: () => <circle cx={CX + 25} cy="99" r="1.3" fill={INK} />,
};

const kell: Spec = {
  skin: SKIN.s1,
  hair: HAIR.dark,
  w: 25,
  jaw: 22,
  chin: 10,
  chinY: 128,
  neck: 12.5,
  build: 0.65,
  age: 2,
  brow: { thick: 1.5, arch: 1.4, tilt: -1.2 },
  eye: { size: 0.95, lid: 1.4, narrow: 0.8 },
  nose: { w: 5, len: 17, bridge: true },
  mouth: { w: 8.5, smile: 0.4, full: 0, smirk: 2 },
  hairFront: () => (
    <g {...ink}>
      {/* slicked back, hard side part on the left */}
      <path
        d="M54 86 C50 66 52 46 66 38 C78 31 98 32 106 42 C112 50 110 68 107 86 C105 74 104 64 98 58 C90 54 76 52 64 54 C58 58 56 70 56 86Z"
        fill={HAIR.dark}
        strokeWidth="1.3"
      />
      <path d="M64 54 C66 46 70 41 76 38" fill="none" stroke="#c9b394" strokeWidth="0.9" />
      <Strands
        d={["M66 52 C76 46 90 46 102 54", "M68 49 C80 42 94 42 104 50", "M72 45 C84 38 96 38 104 44", "M60 60 C58 52 62 44 70 40", "M106 78 C107 66 106 56 100 50"]}
        color="#a58b6b"
        o={0.75}
        w={0.6}
      />
      {/* grey at the temples */}
      <path d="M54 86 C53 80 53 74 55 70 L57 72 C56 76 56 82 56 86Z" fill={HAIR.grey} stroke="none" />
      <path d="M107 86 C108 80 108 74 107 70 L105 72 C105 76 105 82 105 86Z" fill={HAIR.grey} stroke="none" />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      <path d={`M${CX - 16} 146 L${CX} 196 L${CX + 16} 146Z`} fill="#f6efe0" {...ink} strokeWidth="1" />
      <ShirtCollar />
      <Tie fill="#5a2f22" pattern={`url(#${k}-x)`} />
      {/* tie bar */}
      <rect x={CX - 6} y="176" width="12" height="2" fill="#d8c7a5" stroke={INK} strokeWidth="0.6" />
      <Jacket fill="#2e241c" k={k} />
      {/* pocket square */}
      <path d="M112 176 L118 170 L121 175 L124 171 L126 178Z" fill="#f6efe0" {...ink} strokeWidth="0.8" />
      <path d="M108 178 L130 178" stroke={INK} strokeWidth="1" />
      {/* lapel pin: a compass, the Institute's motif */}
      <circle cx="48" cy="172" r="2.6" fill="#d8c7a5" stroke={INK} strokeWidth="0.7" />
      <path d="M48 169.6 L48 174.4" stroke={INK} strokeWidth="0.6" />
    </g>
  ),
};

const ramanathan: Spec = {
  skin: SKIN.s4,
  hair: HAIR.black,
  w: 23.5,
  jaw: 17.5,
  chin: 7,
  neck: 9.5,
  build: 0.25,
  age: 0,
  brow: { thick: 1.6, arch: 2.4, tilt: 0.3 },
  eye: { size: 1.12, lid: 1.1 },
  nose: { w: 5.2, len: 15.5 },
  mouth: { w: 7, smile: 0.9, full: 1 },
  hairBack: () => (
    <g {...ink} strokeWidth="1.3">
      {/* low bun peeking behind the neck */}
      <ellipse cx={CX + 18} cy="114" rx="11" ry="9" fill={HAIR.black} />
      <Strands d={["M90 110 Q98 106 104 112", "M92 118 Q100 116 105 118"]} color="#7c6650" o={0.8} />
    </g>
  ),
  hairFront: () => (
    <g {...ink}>
      {/* centre part, smoothed back */}
      <path
        d="M56 92 C50 70 54 46 70 39 C80 35 88 35 96 39 C110 46 112 70 105 92 C104 78 102 66 96 58 C90 52 84 50 80 50 C76 50 70 52 64 58 C58 66 57 78 56 92Z"
        fill={HAIR.black}
        strokeWidth="1.3"
      />
      <path d="M80 50 L80 38" stroke="#8a6f55" strokeWidth="0.9" />
      <Strands
        d={["M78 50 C70 52 62 60 59 76", "M76 44 C66 46 58 56 56 72", "M82 50 C92 52 100 60 102 76", "M84 44 C94 46 102 56 104 72"]}
        color="#7c6650"
        o={0.8}
      />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      {/* blouse */}
      <path d={`M${CX - 14} 146 Q${CX} 168 ${CX + 14} 146 L${CX + 20} 200 L${CX - 20} 200Z`} fill="#7c5c42" {...ink} strokeWidth="1" />
      <path d={`M${CX - 14} 146 Q${CX} 168 ${CX + 14} 146 L${CX + 20} 200 L${CX - 20} 200Z`} fill={`url(#${k}-h)`} opacity="0.4" />
      {/* white conservator's lab coat */}
      <g {...ink} strokeWidth="1.3" fill="#f6efe0">
        <path d={`M-4 204 L-4 178 C6 162 34 156 ${CX - 13} 146 L${CX - 16} 160 L${CX - 8} 200 L-4 204Z`} />
        <path d={`M164 204 L164 178 C154 162 126 156 ${CX + 13} 146 L${CX + 16} 160 L${CX + 8} 200 L164 204Z`} />
        <path d={`M${CX - 13} 146 L${CX - 22} 156 L${CX - 16} 166 L${CX - 10} 186`} fill="none" strokeWidth="1" />
        <path d={`M${CX + 13} 146 L${CX + 22} 156 L${CX + 16} 166 L${CX + 10} 186`} fill="none" strokeWidth="1" />
      </g>
      {/* jeweller's loupe clipped to the breast pocket */}
      <path d="M104 182 L124 182" stroke={INK} strokeWidth="0.9" />
      <rect x="112" y="174" width="5" height="9" rx="2" fill="#3b2d22" stroke={INK} strokeWidth="0.7" />
    </g>
  ),
  extras: () => (
    <g fill="#d8c7a5" stroke={INK} strokeWidth="0.6">
      <circle cx={CX - 24} cy="99" r="1.5" />
      <circle cx={CX + 24} cy="99" r="1.5" />
    </g>
  ),
};

const ash: Spec = {
  skin: SKIN.s2,
  hair: HAIR.grey,
  w: 27.5,
  jaw: 25,
  chin: 12,
  chinY: 129,
  neck: 15,
  build: 1,
  age: 3,
  brow: { thick: 2.4, arch: 0.6, tilt: -0.8, color: "#4a3a2c" },
  eye: { size: 0.85, lid: 1.6, narrow: 0.9, gap: 11.5 },
  nose: { w: 6.5, len: 17, bridge: true },
  mouth: { w: 8.5, smile: -0.6, full: 0 },
  hairFront: ({ w }) => (
    <g {...ink}>
      {/* grey buzz cut: flat top, stippled */}
      <path
        d={`M${CX - w + 1} 80 C${CX - w - 1} 60 ${CX - w + 4} 46 ${CX - 12} 42 C${CX - 4} 40 ${CX + 6} 40 ${CX + 14} 42 C${CX + w - 3} 46 ${CX + w + 1} 60 ${CX + w - 1} 80 C${CX + w - 3} 68 ${CX + w - 6} 58 ${CX + 14} 54 C${CX + 4} 52 ${CX - 6} 52 ${CX - 14} 54 C${CX - w + 6} 58 ${CX - w + 3} 68 ${CX - w + 1} 80Z`}
        fill={HAIR.grey}
        strokeWidth="1.2"
      />
      <g fill={INK} opacity="0.45">
        {[
          [62, 50], [68, 46], [74, 45], [80, 44], [86, 45], [92, 46], [98, 50], [58, 58], [102, 58], [64, 52], [96, 52], [71, 49], [89, 49], [80, 48],
          [56, 66], [104, 66], [55, 74], [105, 74],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" />
        ))}
      </g>
    </g>
  ),
  facial: () => (
    <g {...ink}>
      {/* heavy moustache */}
      <path d={`M${CX - 11} 113 C${CX - 9} 106 ${CX - 3} 105 ${CX} 107 C${CX + 3} 105 ${CX + 9} 106 ${CX + 11} 113 C${CX + 6} 110 ${CX + 3} 110 ${CX} 110.5 C${CX - 3} 110 ${CX - 6} 110 ${CX - 11} 113Z`} fill="#6a5644" strokeWidth="0.9" />
      <Strands d={[`M${CX - 8} 109 l-1 2.5`, `M${CX - 5} 108 l-0.6 2.4`, `M${CX + 5} 108 l0.6 2.4`, `M${CX + 8} 109 l1 2.5`]} o={0.6} w={0.5} />
      {/* broken-nose bump */}
      <path d={`M${CX - 2} 94 q-1.5 2 0 4`} fill="none" strokeWidth="0.7" opacity="0.6" />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      <path d={`M${CX - 18} 146 L${CX} 194 L${CX + 18} 146Z`} fill="#d8ccb4" {...ink} strokeWidth="1" />
      <ShirtCollar fill="#d8ccb4" />
      <Tie fill="#2b1f18" />
      <Jacket fill="#2a2119" k={k} v={194} notch={false} />
      {/* epaulettes */}
      <g {...ink} strokeWidth="1" fill="#2a2119">
        <path d="M18 160 L50 151 L52 156 L21 166Z" />
        <path d="M142 160 L110 151 L108 156 L139 166Z" />
        <circle cx="47" cy="154.5" r="1.4" fill="#d8c7a5" />
        <circle cx="113" cy="154.5" r="1.4" fill="#d8c7a5" />
      </g>
      {/* shield badge */}
      <path d="M44 176 L52 174 L60 176 L59 184 Q52 190 45 184Z" fill="#d8c7a5" {...ink} strokeWidth="0.8" />
      <circle cx="52" cy="180" r="2" fill="none" stroke={INK} strokeWidth="0.6" />
    </g>
  ),
};

const hollis: Spec = {
  skin: SKIN.s1,
  hair: HAIR.white,
  w: 24,
  jaw: 18,
  chin: 8,
  neck: 9.5,
  build: 0.2,
  age: 3,
  brow: { thick: 1, arch: 2.8, tilt: 0.6, color: "#8d7a64" },
  eye: { size: 0.95, lid: 0.8 },
  nose: { w: 5, len: 16 },
  mouth: { w: 7, smile: 1.6, full: 0.3 },
  glasses: "cat",
  hairFront: () => (
    <g {...ink}>
      {/* short white curls */}
      <path
        d="M54 90 C46 84 46 74 50 68 C46 60 50 50 58 48 C60 40 68 36 76 38 C82 32 92 34 96 40 C104 38 110 46 108 54 C114 60 114 70 110 76 C114 82 112 90 106 92 C106 80 102 66 94 60 C86 56 74 56 66 60 C58 66 55 78 54 90Z"
        fill={HAIR.white}
        strokeWidth="1.2"
      />
      <Strands
        d={[
          "M56 62 q3 -4 7 -2", "M62 50 q4 -3 7 0", "M74 44 q4 -3 7 0", "M86 42 q4 -2 7 1", "M98 48 q4 0 5 4",
          "M102 62 q3 1 4 5", "M52 74 q2 -3 5 -2", "M106 78 q2 2 1 5", "M68 54 q4 -2 7 0", "M84 52 q4 -2 7 1",
        ]}
        o={0.6}
        w={0.7}
      />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      {/* black turtleneck, photographer's uniform */}
      <path d={bodyPath(0.2, 9.5)} fill="#2e241c" {...ink} strokeWidth="1.3" />
      <path d={bodyPath(0.2, 9.5)} fill={`url(#${k}-h)`} opacity="0.4" />
      <path d={`M${CX - 13} 128 L${CX - 14} 154 Q${CX} 160 ${CX + 14} 154 L${CX + 13} 128 Q${CX} 132 ${CX - 13} 128Z`} fill="#2e241c" {...ink} strokeWidth="1.2" />
      <Strands d={[`M${CX - 12} 136 Q${CX} 140 ${CX + 12} 136`, `M${CX - 12.5} 144 Q${CX} 148 ${CX + 12.5} 144`]} color="#8d7a64" o={0.8} />
      {/* glasses chain */}
      <path d={`M${CX - 24} 92 Q${CX - 26} 130 ${CX - 6} 168`} fill="none" stroke="#a8916f" strokeWidth="0.8" strokeDasharray="1 1.2" />
      <path d={`M${CX + 24} 92 Q${CX + 26} 130 ${CX + 6} 168`} fill="none" stroke="#a8916f" strokeWidth="0.8" strokeDasharray="1 1.2" />
      {/* loupe pendant */}
      <circle cx={CX} cy="172" r="4.5" fill="#d8c7a5" stroke={INK} strokeWidth="0.9" />
      <circle cx={CX} cy="172" r="2.5" fill="#f6efe0" stroke={INK} strokeWidth="0.5" />
    </g>
  ),
};

const oduya: Spec = {
  skin: SKIN.s5,
  hair: HAIR.black,
  w: 26,
  jaw: 21,
  chin: 10,
  neck: 13,
  build: 0.6,
  age: 2,
  brow: { thick: 1.6, arch: 1.8, tilt: 0.2 },
  eye: { size: 1, lid: 1 },
  nose: { w: 7, len: 15.5 },
  mouth: { w: 8.5, smile: 2, full: 1.2 },
  glasses: "round",
  hairFront: ({ w }) => (
    <g {...ink}>
      {/* close-cropped hair, salt and pepper */}
      <path
        d={`M${CX - w + 1} 78 C${CX - w - 1} 56 ${CX - 16} 41 ${CX} 41 C${CX + 16} 41 ${CX + w + 1} 56 ${CX + w - 1} 78 C${CX + w - 3} 66 ${CX + 16} 54 ${CX} 54 C${CX - 16} 54 ${CX - w + 3} 66 ${CX - w + 1} 78Z`}
        fill={HAIR.black}
        strokeWidth="1.2"
      />
      <g fill="#bfae95" opacity="0.8">
        {[
          [62, 49], [70, 45], [78, 44], [86, 45], [94, 48], [58, 56], [100, 54], [66, 50], [90, 50], [74, 48], [82, 48], [56, 64], [104, 64], [98, 58], [62, 58],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" />
        ))}
      </g>
    </g>
  ),
  facial: () => (
    <g {...ink}>
      {/* neat grey beard framing the mouth */}
      <path
        d={`M${CX - 24} 104 C${CX - 22} 118 ${CX - 12} 132 ${CX} 132 C${CX + 12} 132 ${CX + 22} 118 ${CX + 24} 104 C${CX + 20} 112 ${CX + 14} 122 ${CX + 10} 120 C${CX + 8} 118 ${CX + 10} 110 ${CX + 6} 108 C${CX + 2} 107 ${CX - 2} 107 ${CX - 6} 108 C${CX - 10} 110 ${CX - 8} 118 ${CX - 10} 120 C${CX - 14} 122 ${CX - 20} 112 ${CX - 24} 104Z`}
        fill="#9a8a76"
        strokeWidth="1"
      />
      <path d={`M${CX - 7} 120 Q${CX} 124 ${CX + 7} 120 L${CX + 6} 126 Q${CX} 128 ${CX - 6} 126Z`} fill="#9a8a76" stroke="none" />
      <Strands d={[`M${CX - 18} 116 l2 3`, `M${CX - 12} 124 l2 2`, `M${CX + 18} 116 l-2 3`, `M${CX + 12} 124 l-2 2`, `M${CX - 2} 128 l0 2`, `M${CX + 3} 128 l0 2`]} o={0.6} w={0.6} />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      <path d={`M${CX - 16} 146 L${CX} 192 L${CX + 16} 146Z`} fill="#efe6d2" {...ink} strokeWidth="1" />
      <ShirtCollar />
      <Tie fill="#8a6a4a" pattern={`url(#${k}-h)`} />
      {/* cable-knit cardigan */}
      <path d={`M-4 204 L-4 176 C6 160 30 154 ${CX - 15} 148 L${CX - 4} 200 L-4 204Z`} fill="#6b5440" {...ink} strokeWidth="1.3" />
      <path d={`M164 204 L164 176 C154 160 130 154 ${CX + 15} 148 L${CX + 4} 200 L164 204Z`} fill="#6b5440" {...ink} strokeWidth="1.3" />
      <path d={`M-4 204 L-4 176 C6 160 30 154 ${CX - 15} 148 L${CX - 4} 200Z M164 204 L164 176 C154 160 130 154 ${CX + 15} 148 L${CX + 4} 200Z`} fill={`url(#${k}-x)`} opacity="0.4" />
      <Strands d={["M40 166 q3 6 0 12 q-3 6 0 12", "M120 166 q-3 6 0 12 q3 6 0 12"]} color="#d8c7a5" o={0.7} w={1} />
      <g fill="#d8c7a5" stroke={INK} strokeWidth="0.6">
        <circle cx={CX - 7} cy="180" r="1.5" />
        <circle cx={CX - 6} cy="192" r="1.5" />
      </g>
    </g>
  ),
};

const barre: Spec = {
  skin: SKIN.s2,
  hair: HAIR.brown,
  w: 23.5,
  jaw: 17,
  chin: 7.5,
  neck: 9,
  build: 0.25,
  age: 0,
  brow: { thick: 1.3, arch: 3, tilt: 0.6 },
  eye: { size: 1.1, lid: 1.1 },
  nose: { w: 4.6, len: 14.5 },
  mouth: { w: 9, smile: 3.2, full: 1 },
  hairBack: () => (
    <path
      d="M50 70 C46 46 62 34 80 34 C100 34 114 46 110 70 C112 90 118 110 120 132 C112 140 100 138 96 132 L64 132 C60 138 48 140 40 132 C42 110 48 90 50 70Z"
      fill={HAIR.brown}
      {...ink}
      strokeWidth="1.3"
    />
  ),
  hairFront: () => (
    <g {...ink}>
      {/* shoulder-length waves with a full fringe */}
      <path
        d="M52 92 C46 70 52 44 70 38 C84 33 98 36 106 46 C112 56 112 74 108 92 C106 82 104 72 102 68 C96 70 88 72 80 70 C72 72 64 70 58 68 C56 74 54 82 52 92Z"
        fill={HAIR.brown}
        strokeWidth="1.3"
      />
      <path d="M58 68 Q62 62 64 70 Q68 62 72 71 Q76 62 80 70 Q84 62 88 71 Q92 62 96 70 Q100 62 102 68" fill="none" strokeWidth="1" />
      <Strands
        d={["M62 46 C58 54 56 62 58 68", "M74 40 C70 50 68 60 68 70", "M88 40 C88 50 86 60 86 70", "M100 46 C102 54 102 62 100 68", "M46 100 q4 8 0 16 q-4 8 0 14", "M114 100 q-4 8 0 16 q4 8 0 14", "M52 104 q3 8 0 14", "M108 104 q-3 8 0 14"]}
        color="#c4a983"
        o={0.75}
        w={0.65}
      />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      {/* blouse with a pussy-bow */}
      <path d={bodyPath(0.25, 9)} fill="#e8dcc2" {...ink} strokeWidth="1.3" />
      <path d={`M100 160 C130 162 154 166 164 182 L164 204 L106 204Z`} fill={`url(#${k}-h)`} opacity="0.35" />
      <g {...ink} strokeWidth="1" fill="#f7efdf">
        <path d={`M${CX - 2} 156 C${CX - 12} 150 ${CX - 16} 160 ${CX - 12} 164 C${CX - 8} 166 ${CX - 4} 162 ${CX - 2} 158Z`} />
        <path d={`M${CX + 2} 156 C${CX + 12} 150 ${CX + 16} 160 ${CX + 12} 164 C${CX + 8} 166 ${CX + 4} 162 ${CX + 2} 158Z`} />
        <path d={`M${CX - 3} 159 L${CX - 7} 184 L${CX - 2} 182Z M${CX + 3} 159 L${CX + 6} 188 L${CX + 1} 184Z`} />
        <circle cx={CX} cy="157.5" r="3" />
      </g>
      {/* polka dots on the blouse */}
      <g fill={INK} opacity="0.35">
        {[[30, 176], [44, 168], [52, 186], [38, 194], [118, 170], [128, 186], [110, 192], [140, 178], [60, 172], [100, 176]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />
        ))}
      </g>
    </g>
  ),
  extras: () => (
    <g fill="none" stroke="#a8916f" strokeWidth="1.2">
      <circle cx={CX - 24} cy="104" r="4" />
      <circle cx={CX + 24} cy="104" r="4" />
    </g>
  ),
};

const strand: Spec = {
  skin: SKIN.s1,
  hair: HAIR.blond,
  w: 24,
  jaw: 20,
  chin: 9,
  chinY: 128,
  neck: 12,
  build: 0.55,
  age: 0,
  brow: { thick: 1.1, arch: 1.4, tilt: 0, color: "#a08560" },
  eye: { size: 0.95, lid: 0.9 },
  nose: { w: 5, len: 17, bridge: true },
  mouth: { w: 7.5, smile: 0.6, full: 0.2 },
  glasses: "rect",
  hairFront: () => (
    <g {...ink}>
      {/* pale blond, short sides, swept quiff */}
      <path
        d="M56 82 C52 64 54 48 64 40 C70 34 80 30 92 33 C104 36 110 48 108 62 L106 82 C105 72 104 64 100 58 C94 58 86 56 80 52 C76 56 68 58 60 60 C58 66 57 74 56 82Z"
        fill={HAIR.blond}
        strokeWidth="1.2"
      />
      <Strands d={["M64 44 C72 38 84 36 96 38", "M66 50 C74 44 86 42 100 46", "M62 56 C70 52 78 50 82 52", "M92 52 C98 52 102 54 104 58", "M58 66 C57 72 57 76 57 80", "M106 66 C106 72 106 76 106 80"]} color="#7b5a3c" o={0.55} w={0.6} />
    </g>
  ),
  facial: () => (
    <g fill={INK} opacity="0.28">
      {/* light stubble */}
      {[[68, 118], [72, 122], [76, 124], [80, 125], [84, 124], [88, 122], [92, 118], [70, 114], [90, 114], [74, 120], [86, 120], [80, 121], [64, 112], [96, 112]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.45" />
      ))}
    </g>
  ),
  attire: ({ k }) => (
    <g>
      <path d={bodyPath(0.55, 12)} fill="#8a7a64" {...ink} strokeWidth="1.3" />
      <path d={bodyPath(0.55, 12)} fill={`url(#${k}-h)`} opacity="0.35" />
      {/* ribbed crew neck over an oxford shirt */}
      <path d={`M${CX - 19} 150 Q${CX} 168 ${CX + 19} 150 L${CX + 16} 146 Q${CX} 162 ${CX - 16} 146Z`} fill="#6b5c48" {...ink} strokeWidth="1" />
      <ShirtCollar fill="#efe6d2" spread={0.6} />
      {/* lanyard with a keycard */}
      <path d={`M${CX - 12} 156 L${CX - 4} 188 M${CX + 12} 156 L${CX + 4} 188`} stroke="#3b2d22" strokeWidth="2" />
      <rect x={CX - 7} y="186" width="14" height="14" rx="1.5" fill="#f2e9d4" stroke={INK} strokeWidth="0.9" />
      <rect x={CX - 4.5} y="189" width="5" height="6" fill="#a69680" />
    </g>
  ),
};

const lam: Spec = {
  skin: "#e6cba4",
  hair: HAIR.black,
  w: 23.5,
  jaw: 18,
  chin: 7.5,
  neck: 9.5,
  build: 0.3,
  age: 1,
  brow: { thick: 1.3, arch: 1.2, tilt: -0.3 },
  eye: { size: 0.95, lid: 1.3, narrow: 0.6 },
  nose: { w: 5.2, len: 15 },
  mouth: { w: 6.5, smile: -0.2, full: 0.6 },
  glasses: "wire",
  hairBack: () => (
    <path d="M52 70 C50 46 64 36 80 36 C96 36 110 46 108 70 L110 140 L50 140Z" fill={HAIR.black} {...ink} strokeWidth="1.3" />
  ),
  hairFront: () => (
    <g {...ink}>
      {/* straight, shoulder-length, centre part, tucked behind one ear */}
      <path
        d="M80 38 C64 38 54 48 53 66 C52 84 52 112 50 140 L62 140 C60 116 58 96 58 80 C58 64 66 54 80 50Z"
        fill={HAIR.black}
        strokeWidth="1.3"
      />
      <path
        d="M80 38 C96 38 106 48 107 66 C107 74 106 80 104 84 C102 74 100 64 96 58 C92 54 86 50 80 50Z"
        fill={HAIR.black}
        strokeWidth="1.3"
      />
      <path d="M106 96 C108 112 108 128 110 140 L100 140 C102 128 103 112 103 100Z" fill={HAIR.black} strokeWidth="1.2" />
      <Strands d={["M78 42 C66 44 58 56 57 72 C56 92 56 116 55 136", "M74 46 C66 52 61 62 60 76", "M84 44 C96 46 102 56 104 72", "M105 104 C106 116 106 128 107 136"]} color="#8a7560" o={0.8} w={0.6} />
    </g>
  ),
  attire: ({ k }) => (
    <g>
      <path d={`M${CX - 14} 146 Q${CX} 162 ${CX + 14} 146 L${CX + 20} 200 L${CX - 20} 200Z`} fill="#efe6d2" {...ink} strokeWidth="1" />
      {/* buttoned cardigan */}
      <path d={`M-4 204 L-4 176 C6 160 30 154 ${CX - 14} 147 Q${CX - 6} 172 ${CX - 1} 204Z`} fill="#5c4836" {...ink} strokeWidth="1.3" />
      <path d={`M164 204 L164 176 C154 160 130 154 ${CX + 14} 147 Q${CX + 6} 172 ${CX + 1} 204Z`} fill="#5c4836" {...ink} strokeWidth="1.3" />
      <path d={`M-4 204 L-4 176 C6 160 30 154 ${CX - 14} 147 Q${CX - 6} 172 ${CX - 1} 204Z M164 204 L164 176 C154 160 130 154 ${CX + 14} 147 Q${CX + 6} 172 ${CX + 1} 204Z`} fill={`url(#${k}-h)`} opacity="0.45" />
      <g fill="#d8c7a5" stroke={INK} strokeWidth="0.6">
        <circle cx={CX - 4} cy="178" r="1.5" />
        <circle cx={CX - 2.5} cy="190" r="1.5" />
      </g>
      {/* reading-room keys on a ring */}
      <path d={`M${CX - 16} 158 Q${CX - 26} 168 ${CX - 30} 176`} fill="none" stroke="#a8916f" strokeWidth="0.9" />
      <circle cx={CX - 30} cy="179" r="3" fill="#5c4836" stroke="#d8c7a5" strokeWidth="1" />
      <path d={`M${CX - 31} 182 l-2 7 l2 0 M${CX - 28} 182 l2 6`} stroke="#d8c7a5" strokeWidth="1.2" fill="none" />
    </g>
  ),
};

const ferrante: Spec = {
  skin: SKIN.s3,
  hair: HAIR.dark,
  w: 26.5,
  jaw: 23.5,
  chin: 11,
  chinY: 128,
  neck: 14,
  build: 0.85,
  age: 2,
  brow: { thick: 2.2, arch: 2, tilt: 0.4 },
  eye: { size: 1, lid: 1 },
  nose: { w: 7, len: 18, bridge: true },
  mouth: { w: 8.5, smile: 1.4, full: 0.3 },
  hairFront: ({ w }) => (
    <g {...ink}>
      {/* balding crown, dark hair at the sides */}
      <path d={`M${CX - w - 0.5} 88 C${CX - w - 2} 74 ${CX - w} 62 ${CX - w + 6} 56 L${CX - w + 8} 62 C${CX - w + 4} 70 ${CX - w + 3} 80 ${CX - w + 3} 88Z`} fill={HAIR.dark} strokeWidth="1.1" />
      <path d={`M${CX + w + 0.5} 88 C${CX + w + 2} 74 ${CX + w} 62 ${CX + w - 6} 56 L${CX + w - 8} 62 C${CX + w - 4} 70 ${CX + w - 3} 80 ${CX + w - 3} 88Z`} fill={HAIR.dark} strokeWidth="1.1" />
      {/* scalp shine and a few combed strands */}
      <path d={`M${CX - 10} 52 Q${CX - 4} 48 ${CX + 2} 49`} fill="none" stroke="#f6efe0" strokeWidth="1.6" opacity="0.7" />
      <Strands d={[`M${CX - 14} 58 Q${CX} 52 ${CX + 14} 58`, `M${CX - 10} 62 Q${CX} 58 ${CX + 10} 62`]} o={0.35} w={0.5} />
    </g>
  ),
  facial: () => (
    <g fill={INK} opacity="0.4">
      {/* five o'clock shadow */}
      {[
        [62, 112], [66, 117], [70, 121], [74, 124], [80, 126], [86, 124], [90, 121], [94, 117], [98, 112], [64, 106], [96, 106],
        [68, 113], [92, 113], [72, 118], [88, 118], [77, 121], [83, 121], [80, 118], [60, 104], [100, 104],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" />
      ))}
    </g>
  ),
  attire: ({ k }) => (
    <g>
      {/* canvas work jacket over an open-necked shirt */}
      <path d={`M${CX - 18} 146 L${CX} 174 L${CX + 18} 146Z`} fill="#c9b796" {...ink} strokeWidth="1" />
      <path d={`M${CX - 14} 146 L${CX} 166 L${CX + 14} 146 Q${CX} 152 ${CX - 14} 146Z`} fill={SKIN.s3} stroke="none" />
      <path d={`M${CX - 8} 150 L${CX} 166 L${CX + 8} 150`} fill="none" {...ink} strokeWidth="0.8" />
      <ShirtCollar fill="#c9b796" open spread={1.2} />
      <path d={`M-4 204 L-4 168 C6 156 26 152 ${CX - 18} 146 L${CX - 6} 172 L${CX - 2} 204Z`} fill="#7a6650" {...ink} strokeWidth="1.3" />
      <path d={`M164 204 L164 168 C154 156 134 152 ${CX + 18} 146 L${CX + 6} 172 L${CX + 2} 204Z`} fill="#7a6650" {...ink} strokeWidth="1.3" />
      <path d={`M-4 204 L-4 168 C6 156 26 152 ${CX - 18} 146 L${CX - 6} 172 L${CX - 2} 204Z M164 204 L164 168 C154 156 134 152 ${CX + 18} 146 L${CX + 6} 172 L${CX + 2} 204Z`} fill={`url(#${k}-x)`} opacity="0.45" />
      {/* corduroy collar */}
      <path d={`M${CX - 18} 146 L${CX - 30} 160 L${CX - 10} 166Z M${CX + 18} 146 L${CX + 30} 160 L${CX + 10} 166Z`} fill="#4e3f30" {...ink} strokeWidth="1" />
      {/* chest pocket with pencil and a key ring */}
      <rect x="104" y="174" width="18" height="16" fill="none" stroke={INK} strokeWidth="0.9" />
      <path d="M104 178 L122 178" stroke={INK} strokeWidth="0.7" />
      <rect x="108" y="166" width="2.4" height="12" fill="#cdaf7f" stroke={INK} strokeWidth="0.5" />
      <circle cx="42" cy="174" r="3.5" fill="none" stroke="#e3d4b4" strokeWidth="1.1" />
      <path d="M42 177.5 l0 8 l2.5 0 M39 177 l-2 6" stroke="#e3d4b4" strokeWidth="1.2" fill="none" />
    </g>
  ),
};

const SPECS: Record<string, Spec> = {
  "calloway.jpg": calloway,
  "voss.jpg": voss,
  "kell.jpg": kell,
  "ramanathan.jpg": ramanathan,
  "ash.jpg": ash,
  "hollis.jpg": hollis,
  "oduya.jpg": oduya,
  "barre.jpg": barre,
  "strand.jpg": strand,
  "lam.jpg": lam,
  "ferrante.jpg": ferrante,
};

export const PORTRAITS: Record<string, () => React.ReactElement> = Object.fromEntries(
  Object.entries(SPECS).map(([file, spec]) => {
    const k = `pt-${file.replace(/\.jpg$/, "")}`;
    const Drawn = () => <Portrait k={k} s={spec} />;
    Drawn.displayName = `Portrait(${file})`;
    return [file, Drawn];
  }),
);
