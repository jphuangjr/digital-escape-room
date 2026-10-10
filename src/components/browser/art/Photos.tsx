import type { ReactElement, ReactNode } from "react";

/**
 * Meridian Institute archival photographs: sepia / greyscale, 4:3 (360×270).
 * Pure, deterministic SVG (seeded PRNG evaluated once at module load). Keyed by the
 * image block `art` keys in src/server/content/sites/meridian.ts.
 */

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Shared photo frame: grain, vignette, warm sepia wash. */
function PhotoFrame({ id, grain, vignette, children }: { id: string; grain: number; vignette: number; children: ReactNode }) {
  return (
    <svg viewBox="0 0 360 270" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.04  1.8 0 0 0 -0.7" result="dark" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.98  0 0 0 0 0.94  0 0 0 0 0.86  -1.8 0 0 0 0.75" result="light" />
          <feMerge>
            <feMergeNode in="dark" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-vig`} cx="50%" cy="48%" r="72%">
          <stop offset="0.55" stopColor="#120c07" stopOpacity="0" />
          <stop offset="1" stopColor="#120c07" stopOpacity={vignette} />
        </radialGradient>
      </defs>
      {children}
      <rect width="360" height="270" fill="#8a5a24" opacity="0.08" style={{ mixBlendMode: "multiply" }} />
      <rect width="360" height="270" filter={`url(#${id}-grain)`} opacity={grain} />
      <rect width="360" height="270" fill={`url(#${id}-vig)`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* archive-building: first Institute offices above a shipping agent,  */
/* Harbour Street, 1987                                                */
/* ------------------------------------------------------------------ */

const COBBLES = (() => {
  const r = rng(87);
  let d = "";
  for (let row = 0; row < 9; row++) {
    const y = 232 + row * row * 0.55 + row * 3.2;
    const h = 2.4 + row * 0.7;
    const w = 7 + row * 1.6;
    let x = -r() * w;
    while (x < 360) {
      const ww = w * (0.8 + r() * 0.4);
      d += `M${r1(x + 1)} ${r1(y + h)} q${r1(ww / 2 - 1)} ${r1(-h * 1.1)} ${r1(ww - 2)} 0 `;
      x += ww;
    }
  }
  return d;
})();

const RIPPLES = (() => {
  const r = rng(5);
  let d = "";
  for (let i = 0; i < 26; i++) {
    const y = 196 + r() * 74;
    const x = r() * 74 - 6;
    const w = 6 + r() * 16 * (1 + (y - 196) / 60);
    d += `M${r1(x)} ${r1(y)} h${r1(w)} `;
  }
  return d;
})();

function Window({ x, y, w, h, lit }: { x: number; y: number; w: number; h: number; lit: number }) {
  return (
    <g>
      <rect x={x - 3} y={y - 4} width={w + 6} height={4} fill="#c9b894" />
      <rect x={x - 2} y={y + h} width={w + 4} height={3} fill="#c4b28d" />
      <rect x={x} y={y} width={w} height={h} fill="#2f261d" />
      <rect x={x} y={y} width={w} height={h * 0.5} fill="#5b4c3b" opacity={lit} />
      <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} fill="none" stroke="#d8ccb2" strokeWidth="1.3" />
      <path d={`M${x + 1.5} ${y + h / 2} h${w - 3} M${x + w / 2} ${y + 1.5} v${h - 3}`} stroke="#d8ccb2" strokeWidth="1.1" />
      <rect x={x + w - 3} y={y} width={3} height={h} fill="#1d1712" opacity="0.6" />
    </g>
  );
}

function ArchiveBuilding() {
  const id = "ph-arch";
  const cols = [112, 148, 184, 220, 256];
  const rows = [74, 116];
  return (
    <PhotoFrame id={id} grain={0.5} vignette={0.62}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfae8e" />
          <stop offset="1" stopColor="#e2d6bd" />
        </linearGradient>
        <linearGradient id={`${id}-facade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b7a382" />
          <stop offset="1" stopColor="#968262" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c7c63" />
          <stop offset="1" stopColor="#4b3f30" />
        </linearGradient>
        <linearGradient id={`${id}-street`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f7f66" />
          <stop offset="1" stopColor="#5a4b39" />
        </linearGradient>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`${id}-lens`}>
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
      </defs>
      <rect width="360" height="270" fill={`url(#${id}-sky)`} />
      {/* distant harbour: masts, far shore */}
      <g filter={`url(#${id}-soft)`}>
        <path d="M0 176 C20 172 40 174 62 170 L80 170 V196 H0 Z" fill="#9d8d72" />
        <path d="M16 70 V188 M44 92 V190 M62 110 V190" stroke="#4e4232" strokeWidth="1.6" />
        <path d="M16 78 L-4 150 M16 78 L46 160 M44 98 L22 170 M44 98 L70 168 M8 104 H26 M36 120 H54" stroke="#5e5140" strokeWidth="0.7" />
        <path d="M2 184 C14 180 34 180 50 182 L54 190 H0 Z" fill="#3e3428" />
      </g>
      <rect x="0" y="190" width="82" height="80" fill={`url(#${id}-water)`} />
      <path d={RIPPLES} stroke="#cdbf9f" strokeWidth="0.9" opacity="0.5" />
      {/* quay edge */}
      <path d="M72 190 L82 190 L82 270 L64 270 Z" fill="#6b5b45" />
      {/* right-hand neighbour, lower, in shade */}
      <g filter={`url(#${id}-lens)`}>
        <path d="M300 66 H360 V232 H300 Z" fill="#7b6a52" />
        <path d="M300 60 H360 V68 H300 Z" fill="#9b8a6c" />
        <rect x="312" y="84" width="18" height="30" fill="#2c241b" />
        <rect x="340" y="84" width="18" height="30" fill="#2c241b" />
        <rect x="312" y="132" width="18" height="30" fill="#2c241b" />
        <rect x="340" y="132" width="18" height="30" fill="#2c241b" />
        <rect x="310" y="182" width="50" height="50" fill="#3a3024" />
      </g>
      {/* main building */}
      <g filter={`url(#${id}-lens)`}>
        <path d="M92 44 H300 V232 H92 Z" fill={`url(#${id}-facade)`} />
        {/* parapet & cornice */}
        <path d="M86 30 H306 V40 H86 Z" fill="#cdbd9c" />
        <path d="M88 40 H304 V46 H88 Z" fill="#6f5f48" />
        <path d="M150 30 L196 14 L242 30 Z" fill="#c2b292" />
        <path d="M160 29 L196 17 L232 29" fill="none" stroke="#7d6c52" strokeWidth="1.2" />
        <path d="M86 30 H306" stroke="#e6dac0" strokeWidth="1.2" />
        {/* quoins */}
        {[50, 66, 82, 98, 114, 130, 146, 162].map((y, i) => (
          <g key={y}>
            <rect x="92" y={y} width={i % 2 ? 8 : 12} height="14" fill="#c7b693" />
            <rect x={i % 2 ? 292 : 288} y={y} width={i % 2 ? 8 : 12} height="14" fill="#a18e6d" />
          </g>
        ))}
        {/* string course */}
        <path d="M92 104 H300 V107 H92 Z M92 156 H300 V160 H92 Z" fill="#cbbb99" />
        {rows.map((y) => cols.map((x, i) => <Window key={`${x}-${y}`} x={x} y={y} w={22} h={26} lit={(i + y) % 3 === 0 ? 0.6 : 0.25} />))}
        {/* shipping agent shopfront */}
        <path d="M96 160 H296 V232 H96 Z" fill="#3a3025" />
        <path d="M100 163 H292 V178 H100 Z" fill="#d6c8aa" />
        <path d="M108 168 H284 M108 172.5 H284" stroke="#a2916f" strokeWidth="0.9" opacity="0.6" />
        {/* awning */}
        <path d="M98 180 H294 L304 196 H88 Z" fill="#cfc1a3" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <path key={i} d={`M${98 + i * 16.3} 180 h8.2 l${0.9 + i * 0.1} 16 h-8.6 Z`} fill="#7e6c52" />
        ))}
        <path d="M88 196 H304 L304 200 H88 Z" fill="#5b4c3a" />
        {/* shadow cast by awning */}
        <path d="M96 200 H296 V212 H96 Z" fill="#1d1711" opacity="0.6" />
        {/* shop windows & door */}
        <rect x="104" y="204" width="66" height="28" fill="#4e4233" />
        <rect x="222" y="204" width="66" height="28" fill="#4e4233" />
        <path d="M106 206 l18 24 M232 206 l18 24 M256 206 l14 20" stroke="#8d7e66" strokeWidth="2.5" opacity="0.45" />
        <rect x="182" y="202" width="28" height="30" fill="#211a13" />
        <rect x="184" y="204" width="11" height="26" fill="#2d241a" stroke="#6a5a45" strokeWidth="0.8" />
        <rect x="197" y="204" width="11" height="26" fill="#2d241a" stroke="#6a5a45" strokeWidth="0.8" />
        <rect x="137" y="204" width="2" height="28" fill="#2b231a" />
        <rect x="255" y="204" width="2" height="28" fill="#2b231a" />
      </g>
      {/* pavement and cobbled street */}
      <path d="M64 232 H360 V240 H64 Z" fill="#a6967a" />
      <path d="M64 240 H360 V243 H64 Z" fill="#4c3f30" />
      <path d="M64 243 H360 V270 H64 Z" fill={`url(#${id}-street)`} />
      <path d={COBBLES} fill="none" stroke="#3d3226" strokeWidth="0.8" opacity="0.6" />
      {/* lamp post */}
      <g>
        <rect x="84" y="118" width="3" height="120" fill="#2a2219" />
        <path d="M80 238 h11 l-2 -8 h-7 Z" fill="#2a2219" />
        <path d="M79 108 L92 108 L89 120 L82 120 Z" fill="#3a3025" />
        <path d="M81 110 L90 110 L88 118 L83 118 Z" fill="#cbbd9e" opacity="0.6" />
        <path d="M78 107 L85.5 101 L93 107 Z" fill="#2a2219" />
      </g>
      {/* passer-by, slightly motion-blurred */}
      <g filter={`url(#${id}-soft)`} opacity="0.9">
        <ellipse cx="236" cy="203" rx="4.4" ry="5" fill="#2a2219" />
        <path d="M229 210 C230 207 242 207 243 210 L245 232 L240 232 L237 248 L233 248 L232 232 L227 232 Z" fill="#2f271e" />
        <path d="M232 248 L230 254 M238 248 L241 254" stroke="#2a2219" strokeWidth="3" />
        <ellipse cx="236" cy="256" rx="10" ry="1.6" fill="#1e1812" opacity="0.5" />
      </g>
      {/* bollard on the quay */}
      <path d="M100 236 C100 228 112 228 112 236 L113 252 H99 Z" fill="#2c241b" />
      <path d="M97 236 H115 V239 H97 Z" fill="#3c3226" />
      <path d="M102 236 L103 250" stroke="#7c6c55" strokeWidth="1" />
    </PhotoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* photo-reading-room: Reading Room, late. A woman at a desk under a  */
/* lamp, seen from behind, a ledger open in front of her (A. Voss)     */
/* ------------------------------------------------------------------ */

/** Book spines for a shelf bank: [x, y, w, h, tone]. */
function spines(seed: number, x0: number, x1: number, shelves: number[], shelfH: number) {
  const r = rng(seed);
  const out: [number, number, number, number, number][] = [];
  for (const sy of shelves) {
    let x = x0;
    while (x < x1 - 2) {
      const w = 3 + r() * 5;
      const h = shelfH * (0.62 + r() * 0.32);
      out.push([r1(x), r1(sy - h), r1(Math.min(w, x1 - x) - 0.6), r1(h), r()]);
      x += w;
    }
  }
  return out;
}
const SHELF_L = spines(19, 0, 74, [52, 92, 132, 172, 212], 36);
const SHELF_R = spines(23, 296, 360, [60, 98, 136, 174], 34);
const SHELF_BACK = spines(31, 100, 186, [64, 92, 120], 25);

function ReadingRoom() {
  const id = "ph-read";
  return (
    <PhotoFrame id={id} grain={0.8} vignette={0.82}>
      <defs>
        <radialGradient id={`${id}-pool`} cx="250" cy="196" r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dfb6" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#bfa47a" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#5a4630" stopOpacity="0.15" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-desk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d553a" />
          <stop offset="1" stopColor="#1f160e" />
        </linearGradient>
        <linearGradient id={`${id}-win`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e5442" />
          <stop offset="1" stopColor="#2a241b" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#c9ad80" />
          <stop offset="0.14" stopColor="#4a3a28" />
          <stop offset="1" stopColor="#17110b" />
        </linearGradient>
        <filter id={`${id}-far`}>
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={`${id}-near`}>
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <rect width="360" height="270" fill="#1a130d" />
      {/* back wall: tall arched window with faint night light, far shelves */}
      <g filter={`url(#${id}-far)`}>
        <rect x="90" y="30" width="200" height="140" fill="#251c13" />
        <path d="M206 150 V64 A28 28 0 0 1 262 64 V150 Z" fill={`url(#${id}-win)`} />
        <path d="M234 38 V150 M206 84 H262 M206 116 H262" stroke="#1a130d" strokeWidth="2.4" />
        <path d="M212 148 L256 148" stroke="#3c3123" strokeWidth="3" />
        {SHELF_BACK.map(([x, y, w, h, t], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={t > 0.5 ? "#3a2c1e" : "#2c2117"} />
        ))}
        <path d="M98 64 H188 M98 92 H188 M98 120 H188" stroke="#4a3a28" strokeWidth="1.6" />
      </g>
      {/* left shelf bank */}
      <g filter={`url(#${id}-near)`}>
        <rect x="0" y="0" width="78" height="240" fill="#140e09" />
        {SHELF_L.map(([x, y, w, h, t], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={t > 0.66 ? "#4a3a29" : t > 0.33 ? "#382b1e" : "#2a2016"} />
        ))}
        {[52, 92, 132, 172, 212].map((y) => (
          <rect key={y} x="0" y={y} width="78" height="4" fill="#4d3c29" />
        ))}
        <rect x="74" y="0" width="5" height="240" fill="#3a2c1e" />
      </g>
      {/* right shelf bank, catching lamplight */}
      <g filter={`url(#${id}-near)`}>
        <rect x="294" y="0" width="66" height="200" fill="#1c140d" />
        {SHELF_R.map(([x, y, w, h, t], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={t > 0.66 ? "#7a6246" : t > 0.33 ? "#5b4732" : "#3f3022"} />
        ))}
        {[60, 98, 136, 174].map((y) => (
          <rect key={y} x="294" y={y} width="66" height="4" fill="#806649" />
        ))}
        <rect x="292" y="0" width="5" height="200" fill="#5e4a34" />
      </g>
      {/* lamp pool of light */}
      <rect width="360" height="270" fill={`url(#${id}-pool)`} />
      {/* desk */}
      <path d="M40 196 H360 V214 H40 Z" fill={`url(#${id}-desk)`} />
      <path d="M40 196 H360" stroke="#b89a6c" strokeWidth="1.4" opacity="0.8" />
      <path d="M40 214 H360 V270 H40 Z" fill="#120c07" />
      <path d="M70 214 V270 M330 214 V270" stroke="#2e2217" strokeWidth="6" />
      {/* open ledger under the lamp */}
      <path d="M196 196 L214 182 L262 184 L276 196 Z" fill="#e7d6b0" />
      <path d="M236 183 L236 196" stroke="#8c7553" strokeWidth="1" />
      <path d="M216 186 H232 M214 189 H233 M244 187 H262 M246 190 H266 M212 192 H232" stroke="#8c7553" strokeWidth="0.7" opacity="0.8" />
      {/* banker's lamp */}
      <path d="M262 196 h22 l-3 -4 h-16 Z" fill="#2a2016" />
      <rect x="271.5" y="160" width="3" height="32" fill="#3c2f21" />
      <path d="M252 162 C252 152 294 152 294 162 L290 166 H256 Z" fill="#3e3427" />
      <path d="M254 158 C262 153 286 153 292 158" fill="none" stroke="#9c8a6a" strokeWidth="1.2" />
      <path d="M257 166 H289 L287 168 H259 Z" fill="#fff3d2" />
      {/* the figure, seen from behind */}
      <g filter={`url(#${id}-near)`}>
        {/* shoulders & cardigan, rim-lit from the lamp on the right */}
        <path d="M114 270 C114 240 120 212 136 201 C146 195 158 192 169 192 C180 192 192 195 202 201 C216 212 222 240 222 270 Z" fill={`url(#${id}-rim)`} />
        <path d="M203 202 C215 212 220 236 221 266" fill="none" stroke="#d9c095" strokeWidth="1.4" opacity="0.6" />
        {/* forearm reaching to the ledger */}
        <path d="M204 204 C214 199 222 193 230 189 L233 193 C224 200 216 207 209 212 Z" fill="#3e3021" />
        <path d="M206 203 C215 198 223 192 230 189" fill="none" stroke="#d5b98a" strokeWidth="1" opacity="0.85" />
        {/* spine fold of the cardigan */}
        <path d="M166 196 C165 220 166 245 168 270" fill="none" stroke="#120c07" strokeWidth="1.4" opacity="0.6" />
        {/* collar */}
        <path d="M152 195 C160 201 178 201 186 195 L181 190 C173 194 164 194 157 190 Z" fill="#1d150d" />
        {/* neck & head, bent slightly toward the page */}
        <path d="M161 193 C161 182 177 182 177 193 Z" fill="#4a3826" />
        <ellipse cx="169" cy="166" rx="15" ry="17.5" fill="#1e150d" />
        {/* hair gathered into a bun */}
        <ellipse cx="169" cy="175" rx="8" ry="6.5" fill="#1a120a" />
        <path d="M162 171 C165 168.5 173 168.5 176 171" fill="none" stroke="#3a2a1b" strokeWidth="0.9" opacity="0.8" />
                <path d="M156 162 C158 152 166 148 175 150" fill="none" stroke="#33251a" strokeWidth="1" />
        <path d="M178 152 C185 158 186 172 181 181" fill="none" stroke="#d2b585" strokeWidth="1.5" opacity="0.8" />
      </g>
      {/* chair back between camera and sitter */}
      <path d="M118 270 L120 226 C140 220 196 220 216 226 L218 270 Z" fill="#120b06" opacity="0.92" />
      <path d="M121 228 C142 222 194 222 215 228" fill="none" stroke="#6a5339" strokeWidth="1.6" />
      <path d="M150 228 V270 M186 228 V270" stroke="#22170e" strokeWidth="3" />
      {/* lamp glare */}
      <ellipse cx="273" cy="168" rx="18" ry="6" fill="#fff4d8" opacity="0.35" />
    </PhotoFrame>
  );
}

/* ------------------------------------------------------------------ */
/* photo-ledger: Harbour Ledger vol. III, folio 12. A column of dates, */
/* one line scraped away. Handwriting suggested, never legible.        */
/* ------------------------------------------------------------------ */

/** A cursive-looking scribble from x to x+w on baseline y (not letters). */
function scribble(r: () => number, x: number, y: number, w: number) {
  let d = `M${r1(x)} ${r1(y - 0.6)}`;
  let cx = x;
  while (cx < x + w) {
    const step = 2.6 + r() * 1.8;
    const roll = r();
    const h = roll < 0.1 ? 5.6 : roll < 0.16 ? -3.2 : 2.3 + r() * 0.7;
    if (h > 0) {
      // a small looped letter-ish stroke
      d += ` C${r1(cx + step * 0.5)} ${r1(y - h)} ${r1(cx + step * 0.95)} ${r1(y - h)} ${r1(cx + step * 0.55)} ${r1(y - h * 0.35)}`;
      d += ` C${r1(cx + step * 0.35)} ${r1(y + 0.4)} ${r1(cx + step * 0.8)} ${r1(y + 0.4)} ${r1(cx + step)} ${r1(y - 0.6)}`;
    } else {
      // a descender
      d += ` C${r1(cx + step * 0.6)} ${r1(y - 2)} ${r1(cx + step * 0.4)} ${r1(y - h)} ${r1(cx + step * 0.3)} ${r1(y - h)}`;
      d += ` C${r1(cx + step * 0.2)} ${r1(y - h * 0.4)} ${r1(cx + step * 0.7)} ${r1(y)} ${r1(cx + step)} ${r1(y - 0.6)}`;
    }
    cx += step;
    if (r() < 0.1 && cx < x + w - 8) {
      cx += 3 + r() * 3;
      d += ` M${r1(cx)} ${r1(y - 0.6)}`;
    }
  }
  return d;
}

const LEDGER_TOP = 46;
const LEDGER_ROW = 15;
const SCRAPED_ROW = 8;
const LEDGER_ROWS = 13;

const LEDGER_INK = (() => {
  const r = rng(1912);
  let dates = "";
  let entries = "";
  let sums = "";
  for (let i = 0; i < LEDGER_ROWS; i++) {
    if (i === SCRAPED_ROW) continue;
    const y = LEDGER_TOP + (i + 1) * LEDGER_ROW - 3.5;
    // date: day · month group · year group
    dates += scribble(r, 74, y, 7 + r() * 3) + " " + scribble(r, 88, y, 9 + r() * 6) + " " + scribble(r, 108, y, 10) + " ";
    const ew = 50 + r() * 60;
    entries += scribble(r, 140, y, ew) + " ";
    const extra = 10 + r() * 20;
    if (r() < 0.5 && 146 + ew + extra < 268) entries += scribble(r, 146 + ew, y, extra) + " ";
    sums += scribble(r, 290, y, 10 + r() * 8) + " ";
  }
  // remnants at the ragged ends of the scraped line
  const ys = LEDGER_TOP + (SCRAPED_ROW + 1) * LEDGER_ROW - 3.5;
  const rem = scribble(r, 74, ys, 5) + " " + scribble(r, 268, ys, 10);
  return { dates, entries, sums, rem };
})();

const SCRATCHES = (() => {
  const r = rng(404);
  let d = "";
  const y0 = LEDGER_TOP + SCRAPED_ROW * LEDGER_ROW + 2;
  for (let i = 0; i < 34; i++) {
    const x = 74 + r() * 196;
    const y = y0 + r() * 12;
    d += `M${r1(x)} ${r1(y)} l${r1(6 + r() * 14)} ${r1(-1 + r() * 2)} `;
  }
  return d;
})();

const FOXING = (() => {
  const r = rng(77);
  const out: [number, number, number][] = [];
  for (let i = 0; i < 18; i++) out.push([r1(60 + r() * 270), r1(30 + r() * 230), r1(0.8 + r() * 2.6)]);
  return out;
})();

function Ledger() {
  const id = "ph-ledg";
  const left = 60;
  const right = 334;
  const yScr = LEDGER_TOP + SCRAPED_ROW * LEDGER_ROW;
  const rules = Array.from({ length: LEDGER_ROWS + 1 }, (_, i) => LEDGER_TOP + i * LEDGER_ROW);
  return (
    <PhotoFrame id={id} grain={0.45} vignette={0.7}>
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ede1c4" />
          <stop offset="0.6" stopColor="#ddcca7" />
          <stop offset="1" stopColor="#bfa983" />
        </linearGradient>
        <linearGradient id={`${id}-gutter`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a2c1c" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#6b5537" stopOpacity="0.35" />
          <stop offset="1" stopColor="#6b5537" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-abrade`} x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.6" numOctaves="3" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}-fiber`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5 2.2" numOctaves="2" seed="4" result="f" />
          <feColorMatrix in="f" type="matrix" values="0 0 0 0 0.99  0 0 0 0 0.97  0 0 0 0 0.92  1.6 0 0 0 -0.55" />
        </filter>
        <filter id={`${id}-ink`}>
          <feGaussianBlur stdDeviation="0.25" />
        </filter>
        <clipPath id={`${id}-scrclip`}>
          <rect x="70" y={yScr + 1} width="208" height={LEDGER_ROW - 1} />
        </clipPath>
      </defs>
      {/* table */}
      <rect width="360" height="270" fill="#2a2016" />
      <path d="M0 20 C120 24 240 14 360 22 M0 250 C120 246 240 256 360 250" stroke="#3a2c1e" strokeWidth="3" fill="none" />
      <g transform="rotate(-2.2 190 140)">
        {/* page beneath (edge of facing page) and stacked page edges */}
        <path d="M24 14 H54 V262 H24 Z" fill="#a8946f" />
        <path d={`M${right} 16 h4 V262 h-4 Z`} fill="#b39f7b" />
        <path d={`M${right + 4} 18 h3 V260 h-3 Z`} fill="#8f7c5c" />
        {/* the folio */}
        <rect x="46" y="14" width={right - 46} height="248" fill={`url(#${id}-paper)`} />
        <rect x="46" y="14" width="40" height="248" fill={`url(#${id}-gutter)`} />
        {/* ruling */}
        <g stroke="#6e5c45" strokeWidth="0.6" opacity="0.55">
          {rules.map((y) => (
            <path key={y} d={`M${left} ${y} H${right - 6}`} />
          ))}
        </g>
        <path d={`M${left} ${LEDGER_TOP - 3} H${right - 6}`} stroke="#4f3f2c" strokeWidth="1" opacity="0.7" />
        <g stroke="#5b2f22" strokeWidth="0.8" opacity="0.6">
          <path d={`M128 30 V${rules[rules.length - 1]} M131 30 V${rules[rules.length - 1]}`} />
          <path d={`M280 30 V${rules[rules.length - 1]} M283 30 V${rules[rules.length - 1]}`} />
        </g>
        <path d={`M70 30 V${rules[rules.length - 1]}`} stroke="#5b2f22" strokeWidth="0.8" opacity="0.5" />
        {/* column head marks (decorative strokes, no words) */}
        <path d="M86 38 q8 -4 16 0 M180 38 q16 -5 34 0 M296 38 q8 -4 16 0" stroke="#3a2a1b" strokeWidth="1.1" fill="none" opacity="0.75" />
        {/* handwriting */}
        <g fill="none" stroke="#2e2015" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-ink)`}>
          <path d={LEDGER_INK.dates} strokeWidth="0.95" opacity="0.88" />
          <path d={LEDGER_INK.entries} strokeWidth="0.85" opacity="0.8" />
          <path d={LEDGER_INK.sums} strokeWidth="0.95" opacity="0.85" />
          <path d={LEDGER_INK.rem} strokeWidth="0.9" opacity="0.4" />
        </g>
        {/* the scraped line: pale, abraded band */}
        <g filter={`url(#${id}-abrade)`}>
          <rect x="76" y={yScr + 2} width="196" height={LEDGER_ROW - 3} rx="3" fill="#efe4cb" />
          <rect x="84" y={yScr + 4.5} width="178" height={LEDGER_ROW - 8} rx="2" fill="#f5ecd8" />
        </g>
        <g clipPath={`url(#${id}-scrclip)`}>
          <rect x="70" y={yScr} width="208" height={LEDGER_ROW + 2} filter={`url(#${id}-fiber)`} opacity="0.55" />
          <ellipse cx="120" cy={yScr + 8} rx="26" ry="3" fill="#7a6648" opacity="0.12" />
          <ellipse cx="226" cy={yScr + 7} rx="20" ry="2.5" fill="#7a6648" opacity="0.1" />
          <path d={SCRATCHES} stroke="#a89474" strokeWidth="0.5" opacity="0.6" />
        </g>
        <path d={`M76 ${yScr + LEDGER_ROW - 0.5} C140 ${yScr + LEDGER_ROW + 1} 210 ${yScr + LEDGER_ROW - 1.5} 272 ${yScr + LEDGER_ROW}`} stroke="#8d7a5c" strokeWidth="0.6" fill="none" opacity="0.5" />
        {/* foxing and age */}
        {FOXING.map(([x, y, rr], i) => (
          <circle key={i} cx={x} cy={y} r={rr} fill="#8a6a3e" opacity="0.18" />
        ))}
        <rect x="46" y="14" width={right - 46} height="248" fill="none" stroke="#8b7655" strokeWidth="1.5" opacity="0.6" />
      </g>
      {/* soft light from top-left */}
      <rect width="360" height="270" fill="#fff6dc" opacity="0.06" />
    </PhotoFrame>
  );
}

export const PHOTOS: Record<string, () => ReactElement> = {
  "archive-building": ArchiveBuilding,
  "photo-reading-room": ReadingRoom,
  "photo-ledger": Ledger,
};
