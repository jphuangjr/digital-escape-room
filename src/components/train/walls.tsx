"use client";

import { useT } from "@/i18n/client";

import type { HotspotId, WallId } from "@/lib/train/types";

/**
 * Compartment 12B, one illustrated wall per side (viewBox 300×400, portrait). Each wall draws itself
 * from the room's shared flags, and lists the tappable hotspots (in the same coordinates) that the
 * shell lays buttons over. Art Deco palette: walnut, green velvet, brass, cream.
 */

export interface Hotspot {
  id: HotspotId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const HOTSPOTS: Record<WallId, Hotspot[]> = {
  window: [
    { id: "window", label: "Window", x: 60, y: 50, w: 180, h: 165 },
    { id: "newspaper", label: "Newspaper", x: 70, y: 210, w: 90, h: 36 },
    { id: "teacup", label: "Cup of tea", x: 176, y: 210, w: 46, h: 32 },
    { id: "plaque", label: "Enamel plate", x: 100, y: 24, w: 100, h: 22 },
    { id: "heater", label: "Heater", x: 78, y: 294, w: 144, h: 46 },
  ],
  door: [
    { id: "suitcase", label: "Suitcase", x: 162, y: 4, w: 110, h: 44 },
    { id: "coat", label: "Coat", x: 20, y: 88, w: 70, h: 220 },
    { id: "door", label: "Door", x: 104, y: 72, w: 108, h: 286 },
    { id: "hatbox", label: "Hatbox", x: 18, y: 6, w: 60, h: 40 },
    { id: "safety-card", label: "Safety card", x: 222, y: 90, w: 62, h: 76 },
    { id: "umbrella", label: "Umbrella", x: 228, y: 252, w: 44, h: 104 },
  ],
  berths: [
    { id: "upper-berth", label: "Upper berth", x: 20, y: 74, w: 222, h: 68 },
    { id: "lamp", label: "Reading lamp", x: 210, y: 148, w: 64, h: 56 },
    { id: "pillow", label: "Pillow", x: 24, y: 216, w: 84, h: 34 },
    { id: "under-berth", label: "Under the berth", x: 20, y: 292, w: 230, h: 52 },
    { id: "painting", label: "Painting", x: 50, y: 146, w: 112, h: 64 },
    { id: "carafe", label: "Water carafe", x: 170, y: 150, w: 38, h: 62 },
  ],
  washstand: [
    { id: "vent", label: "Ceiling vent", x: 116, y: 12, w: 68, h: 36 },
    { id: "mirror", label: "Mirror", x: 98, y: 58, w: 104, h: 132 },
    { id: "washstand", label: "Washstand", x: 90, y: 208, w: 120, h: 132 },
    { id: "towel", label: "Towel", x: 222, y: 222, w: 58, h: 86 },
    { id: "toiletries", label: "Glass shelf", x: 16, y: 104, w: 74, h: 74 },
    { id: "water-sign", label: "Enamel sign", x: 16, y: 226, w: 70, h: 38 },
  ],
  bar: [
    { id: "bottles", label: "Bottles", x: 30, y: 46, w: 240, h: 110 },
    { id: "cashbox", label: "Cash box", x: 56, y: 172, w: 80, h: 52 },
    { id: "bell", label: "Service bell", x: 206, y: 186, w: 50, h: 38 },
    { id: "bar-card", label: "Scorecard", x: 232, y: 124, w: 38, h: 38 },
    { id: "shaker", label: "Cocktail shaker", x: 146, y: 182, w: 48, h: 42 },
    { id: "stools", label: "Bar stools", x: 40, y: 318, w: 220, h: 40 },
  ],
  tables: [
    { id: "dining-window", label: "Window", x: 30, y: 34, w: 240, h: 92 },
    { id: "champagne", label: "Champagne glass", x: 214, y: 156, w: 44, h: 56 },
    { id: "sugar", label: "Sugar bowl", x: 44, y: 176, w: 56, h: 44 },
    { id: "bridge", label: "Bridge game", x: 104, y: 184, w: 104, h: 62 },
    { id: "vase", label: "Rose", x: 132, y: 140, w: 36, h: 44 },
  ],
  kitchen: [
    { id: "menu", label: "Menu board", x: 26, y: 46, w: 128, h: 150 },
    { id: "dumbwaiter", label: "Dumbwaiter", x: 34, y: 212, w: 116, h: 104 },
    { id: "kitchen-door", label: "Kitchen door", x: 172, y: 64, w: 108, h: 292 },
    { id: "porthole", label: "Porthole", x: 199, y: 94, w: 52, h: 52 },
    { id: "crate", label: "Crate of oranges", x: 30, y: 318, w: 120, h: 40 },
  ],
  lounge: [
    { id: "gramophone", label: "Gramophone", x: 34, y: 126, w: 124, h: 156 },
    { id: "records", label: "Records", x: 38, y: 284, w: 116, h: 62 },
    { id: "stole", label: "Fur stole", x: 184, y: 66, w: 96, h: 186 },
    { id: "photo", label: "Photograph", x: 32, y: 32, w: 114, h: 86 },
    { id: "palm", label: "Potted palm", x: 158, y: 256, w: 48, h: 100 },
  ],
};

const C = {
  walnut: "#5b3a22",
  walnutDark: "#3d2615",
  walnutLine: "#7a5333",
  brass: "#c9a227",
  brassHi: "#ecd27a",
  velvet: "#2f5d4a",
  velvetDark: "#1f4033",
  cream: "#efe6d2",
  carpet: "#6e1f22",
  ink: "#1b120b",
};

function Room({ children }: { children: React.ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id="nx-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.walnut} />
          <stop offset="1" stopColor={C.walnutDark} />
        </linearGradient>
        <linearGradient id="nx-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.brassHi} />
          <stop offset="0.6" stopColor={C.brass} />
          <stop offset="1" stopColor="#7a5f12" />
        </linearGradient>
        <linearGradient id="nx-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1422" />
          <stop offset="1" stopColor="#1d2c42" />
        </linearGradient>
        <linearGradient id="nx-velvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.velvet} />
          <stop offset="1" stopColor={C.velvetDark} />
        </linearGradient>
        <radialGradient id="nx-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nx-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9d4da" />
          <stop offset="0.5" stopColor="#8fa0aa" />
          <stop offset="1" stopColor="#b8c4ca" />
        </linearGradient>
        {/* walnut grain: long wavy streaks */}
        <pattern id="nx-grain" width="60" height="400" patternUnits="userSpaceOnUse">
          <path d="M6 0 C10 80 2 160 8 240 S4 360 8 400" stroke="#2a180c" strokeWidth="1" fill="none" opacity="0.35" />
          <path d="M22 0 C18 90 26 170 20 260 S24 350 21 400" stroke="#7a5333" strokeWidth="0.8" fill="none" opacity="0.25" />
          <path d="M38 0 C42 70 34 150 40 230 S36 340 39 400" stroke="#2a180c" strokeWidth="0.7" fill="none" opacity="0.3" />
          <path d="M52 0 C48 100 56 190 50 280 S54 370 51 400" stroke="#7a5333" strokeWidth="0.6" fill="none" opacity="0.2" />
        </pattern>
        {/* warm light from the ceiling lamp, dark corners */}
        <radialGradient id="nx-light" cx="0.5" cy="0.08" r="0.95">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#ffd98a" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
        <linearGradient id="nx-floorShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <pattern id="nx-carpet" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={C.carpet} />
          <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#8e3a2c" strokeWidth="1" />
          <circle cx="10" cy="10" r="1.6" fill={C.brass} opacity="0.6" />
        </pattern>
      </defs>
      <rect width="300" height="400" fill="url(#nx-wall)" />
      <rect width="300" height="400" fill="url(#nx-grain)" />
      {/* panelling: raised mouldings above and below the dado, with corner fans */}
      <g stroke={C.walnutLine} strokeWidth="1" fill="none" opacity="0.7">
        <rect x="8" y="26" width="284" height="326" rx="4" />
        <path d="M8 254 H292" />
        <rect x="14" y="262" width="272" height="84" rx="3" />
      </g>
      <g stroke="#2a180c" strokeWidth="1" fill="none" opacity="0.5">
        <rect x="15" y="263" width="272" height="84" rx="3" />
      </g>
      <g fill="none" stroke={C.brass} strokeWidth="0.7" opacity="0.35">
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(300 0) scale(-1 1)" : undefined}>
            {[10, 18, 26].map((r) => (
              <path key={r} d={`M14 ${262 + r} A${r} ${r} 0 0 0 ${14 + r} 262`} />
            ))}
            {[0, 30, 60].map((a) => (
              <path key={a} d={`M14 262 l${(26 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(26 * Math.sin((a * Math.PI) / 180)).toFixed(1)}`} />
            ))}
          </g>
        ))}
      </g>
      {/* ceiling cornice with a stepped Art Deco frieze, and the floor */}
      <rect width="300" height="20" fill={C.ink} />
      <rect y="20" width="300" height="6" fill={C.walnutDark} />
      <path d="M0 20 H300" stroke="url(#nx-brass)" strokeWidth="2" />
      <g fill={C.brass} opacity="0.55">
        {Array.from({ length: 15 }, (_, i) => i * 20 + 10).map((x) => (
          <path key={x} d={`M${x - 5} 26 L${x} 21.5 L${x + 5} 26 Z`} />
        ))}
      </g>
      <path d="M0 26 H300" stroke={C.walnutLine} strokeWidth="0.8" />
      {/* the ceiling lamp: a frosted bowl on brass */}
      <ellipse cx="150" cy="20" rx="70" ry="10" fill="url(#nx-glow)" opacity="0.6" />
      <path d="M128 4 Q150 18 172 4 Z" fill="#f6ead0" stroke="url(#nx-brass)" strokeWidth="1.2" />
      <path d="M134 6 H166" stroke={C.brass} strokeWidth="0.8" opacity="0.7" />
      <rect y="356" width="300" height="44" fill="url(#nx-carpet)" />
      <path d="M0 356 H300" stroke="url(#nx-brass)" strokeWidth="2" />
      {/* inlaid brass stringing along the dado rail, with little diamonds */}
      <path d="M8 250 H292" stroke="url(#nx-brass)" strokeWidth="1" opacity="0.6" />
      <g fill={C.brass} opacity="0.55">
        {Array.from({ length: 7 }, (_, i) => 30 + i * 40).map((x) => (
          <path key={x} d={`M${x} 247 l3 3 l-3 3 l-3 -3 z`} />
        ))}
      </g>
      {/* skirting shadow on the carpet */}
      <rect y="356" width="300" height="14" fill="url(#nx-floorShade)" />
      {children}
      {/* light and shadow over everything */}
      <rect width="300" height="400" fill="url(#nx-light)" pointerEvents="none" />
    </>
  );
}

function Sconce({ x }: { x: number }) {
  return (
    <g>
      <circle cx={x} cy="118" r="18" fill="url(#nx-glow)" />
      <path d={`M${x} 140 V126`} stroke="url(#nx-brass)" strokeWidth="3" />
      <path d={`M${x - 8} 126 L${x - 5} 108 H${x + 5} L${x + 8} 126 Z`} fill="#f3e3b5" stroke="url(#nx-brass)" strokeWidth="1.5" />
    </g>
  );
}

function WindowWall({ flags }: { flags: string[] }) {
  const emptied = flags.includes("teacup.emptied");
  return (
    <Room>
      <Sconce x={32} />
      <Sconce x={268} />
      {/* window */}
      <rect x="60" y="50" width="180" height="168" rx="16" fill="url(#nx-night)" stroke="url(#nx-brass)" strokeWidth="5" />
      <g className="nx-lights">
        <circle cx="90" cy="170" r="2" fill="#ffd27a" />
        <circle cx="160" cy="182" r="1.5" fill="#ffd27a" />
        <circle cx="215" cy="176" r="2.5" fill="#ffd27a" />
      </g>
      <path d="M66 196 Q120 186 150 192 T234 188 V214 H66 Z" fill="#0a0f18" />
      <g className="nx-rain" stroke="#9fb6d4" strokeWidth="1" opacity="0.55">
        {[78, 96, 118, 134, 152, 170, 188, 206, 224].map((x, i) => (
          <path key={x} d={`M${x} ${92 + (i % 3) * 22} l-7 18`} />
        ))}
      </g>
      {/* window frame bolts */}
      {[
        [70, 60],
        [230, 60],
        [70, 208],
        [230, 208],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#7a5f12" />
      ))}
      {/* blind */}
      <path d="M62 52 H238 V88 Q150 96 62 88 Z" fill={C.cream} opacity="0.92" />
      <g stroke="#d8cdb4" strokeWidth="0.8">
        {[60, 68, 76, 84].map((y) => (
          <path key={y} d={`M64 ${y} H236`} />
        ))}
      </g>
      <path d="M62 88 Q150 96 238 88" stroke={C.brass} strokeWidth="1.5" fill="none" />
      <circle cx="150" cy="96" r="3" fill="url(#nx-brass)" />
      {/* velvet curtains, tied back with tasselled cords */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? "translate(300 0) scale(-1 1)" : undefined}>
          <path d="M44 40 H74 Q70 90 60 120 Q76 170 70 226 H44 Z" fill="url(#nx-velvet)" stroke={C.ink} strokeWidth="0.8" />
          <path d="M52 44 Q56 90 50 118 M62 44 Q64 84 56 118" stroke="#173328" strokeWidth="1.2" fill="none" />
          <path d="M50 124 Q58 172 52 224 M62 126 Q68 176 62 224" stroke="#173328" strokeWidth="1.2" fill="none" />
          <path d="M44 120 Q56 116 66 122" stroke="url(#nx-brass)" strokeWidth="2" fill="none" />
          <path d="M66 122 V132" stroke={C.brass} strokeWidth="1" />
          <path d="M63 132 H69 L70 140 H62 Z" fill="url(#nx-brass)" />
        </g>
      ))}
      <rect x="40" y="34" width="220" height="9" rx="2" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1" />
      {/* the enamel plate */}
      <rect x="104" y="27" width="92" height="15" rx="2" fill="#1d3554" stroke="url(#nx-brass)" strokeWidth="1" />
      <text x="150" y="37.5" textAnchor="middle" fontSize="5.4" fill="#efe6d2" fontFamily="Georgia, serif" letterSpacing="0.6">
        È PERICOLOSO SPORGERSI
      </text>
      {/* table */}
      <rect x="52" y="238" width="196" height="12" rx="3" fill={C.walnutLine} stroke={C.ink} strokeWidth="1" />
      <path d="M52 241 H248" stroke="url(#nx-brass)" strokeWidth="0.8" opacity="0.7" />
      {/* brass ashtray */}
      <ellipse cx="236" cy="236" rx="9" ry="3" fill="url(#nx-brass)" stroke="#7a5f12" strokeWidth="0.6" />
      <path d="M232 233 l9 -2" stroke="#efe6d2" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="241" cy="231" r="0.9" fill="#d24b2a" />
      <path d="M70 250 L96 290 M230 250 L204 290" stroke="url(#nx-brass)" strokeWidth="3" />
      {/* newspaper */}
      <g transform="rotate(-6 115 228)">
        <rect x="80" y="216" width="72" height="22" fill={C.cream} stroke="#b8ad92" />
        <rect x="84" y="219" width="40" height="4" fill="#3a3a3a" />
        <path d="M84 227 H148 M84 231 H140 M84 235 H146" stroke="#8a8170" strokeWidth="1" />
      </g>
      {/* teacup */}
      <ellipse cx="199" cy="236" rx="18" ry="4" fill={C.cream} stroke="#b8ad92" />
      <path d="M187 222 H211 L207 235 H191 Z" fill={C.cream} stroke="#b8ad92" />
      <path d="M211 225 q7 1 2 8" fill="none" stroke="#b8ad92" strokeWidth="2" />
      {emptied ? (
        <g>
          <ellipse cx="199" cy="222" rx="12" ry="2.5" fill="#efe6d2" stroke="#b8ad92" />
          <path d="M193 222 q6 3 12 0" stroke="#5a3b20" strokeWidth="1" fill="none" />
          <ellipse cx="199" cy="236" rx="14" ry="2.5" fill="#6b4a2a" opacity="0.85" />
        </g>
      ) : (
        <ellipse cx="199" cy="222" rx="12" ry="2.5" fill="#6b4a2a" />
      )}
      {/* heater grille */}
      <rect x="78" y="296" width="144" height="42" rx="4" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <g stroke={C.brass} strokeWidth="1" opacity="0.7">
        {[88, 100, 112, 124, 136, 148, 160, 172, 184, 196, 208].map((x) => (
          <path key={x} d={`M${x} 302 V332`} />
        ))}
      </g>
      <path d="M86 300 Q150 292 214 300" stroke="url(#nx-brass)" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="232" cy="317" r="6" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M232 317 l3 -4" stroke={C.ink} strokeWidth="1.2" />
    </Room>
  );
}

function DoorWall({ flags }: { flags: string[] }) {
  const open = flags.includes("door.open");
  const panel = flags.includes("panel.open");
  const suitcaseOpen = flags.includes("suitcase.open");
  const searched = flags.includes("coat.searched");
  const lining = flags.includes("suitcase.lining");
  return (
    <Room>
      {/* luggage rack */}
      <path d="M14 46 H286" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M14 34 H286" stroke="url(#nx-brass)" strokeWidth="1.5" opacity="0.7" />
      <g stroke={C.brass} strokeWidth="0.8" opacity="0.4">
        {Array.from({ length: 27 }, (_, i) => 20 + i * 10).map((x) => (
          <path key={x} d={`M${x} 34 l5 12`} />
        ))}
      </g>
      {/* hatbox, striped and ribboned */}
      <g>
        <path d="M24 18 V40 Q48 48 72 40 V18 Z" fill="#f3d6dc" stroke={C.ink} strokeWidth="0.8" />
        <g stroke="#d98a9a" strokeWidth="4">
          {[30, 40, 50, 60, 68].map((x) => (
            <path key={x} d={`M${x} 20 V${42 + (x > 44 && x < 56 ? 3 : 1)}`} />
          ))}
        </g>
        <ellipse cx="48" cy="18" rx="24" ry="6" fill="#f7e4e8" stroke={C.ink} strokeWidth="0.8" />
        <path d="M48 12 V48" stroke="#7a2d4a" strokeWidth="2" />
        <path d="M48 12 q-8 -8 -12 -2 q4 4 12 2 q8 -8 12 -2 q-4 4 -12 2" fill="#7a2d4a" />
      </g>
      {/* suitcase */}
      {suitcaseOpen ? (
        <g>
          <path d="M172 20 L182 -2 H262 L270 20 Z" fill="#8a5a33" stroke={C.ink} />
          <rect x="170" y="20" width="98" height="24" rx="3" fill="#7b4f2c" stroke={C.ink} />
          <rect x="178" y="22" width="40" height="10" rx="2" fill="#c98b9a" />
          <rect x="222" y="22" width="34" height="9" rx="2" fill="#5a3b20" stroke={C.brass} strokeWidth="0.8" />
          {lining && <rect x="146" y="20" width="22" height="26" rx="2" fill="#6a4426" stroke={C.ink} transform="rotate(-12 157 33)" />}
        </g>
      ) : (
        <g>
          <rect x="170" y="10" width="98" height="34" rx="4" fill="#7b4f2c" stroke={C.ink} />
          <path d="M170 18 H268" stroke="#5a3b20" strokeWidth="2" />
          <rect x="210" y="16" width="18" height="8" rx="1.5" fill="url(#nx-brass)" />
          {[170, 262].map((x) => (
            <rect key={x} x={x} y="10" width="6" height="6" fill="url(#nx-brass)" />
          ))}
          <path d="M240 44 l6 10 h-12 z" fill={C.cream} stroke="#b8ad92" />
          {/* hotel labels */}
          <rect x="180" y="24" width="20" height="13" rx="2" fill="#c94f3a" transform="rotate(-8 190 30)" />
          <circle cx="248" cy="30" r="7" fill="#2f4a6b" stroke="#efe6d2" strokeWidth="1" />
          <path d="M243 30 H253" stroke="#efe6d2" strokeWidth="0.8" />
        </g>
      )}
      {/* coat */}
      <circle cx="52" cy="94" r="4" fill="url(#nx-brass)" />
      <path
        d="M52 96 C38 100 30 112 28 130 L24 300 H82 L78 130 C76 112 66 100 52 96 Z"
        fill="#3b4440"
        stroke={C.ink}
        strokeWidth="1"
      />
      <path d="M52 100 L46 150 M52 100 L58 150" stroke="#2a312e" strokeWidth="2" />
      <rect x="34" y="200" width="16" height="12" rx="2" fill="#2a312e" opacity={searched ? 0.4 : 1} />
      <rect x="58" y="200" width="16" height="12" rx="2" fill="#2a312e" />
      {/* collar, buttons and a scarf */}
      <path d="M40 104 Q52 118 64 104 L60 124 Q52 128 44 124 Z" fill="#2a312e" />
      {[150, 176, 202, 228].map((y) => (
        <circle key={y} cx="54" cy={y} r="1.8" fill="#8a7a5a" />
      ))}
      <path d="M44 110 Q52 120 62 110 L66 170 L58 168 L54 120 Z" fill="#8a2c1f" opacity="0.85" />
      <path d="M58 150 H66 M58 156 H66" stroke="#c9a227" strokeWidth="0.8" />
      {/* the safety card, framed */}
      <rect x="226" y="94" width="54" height="68" rx="2" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <rect x="231" y="99" width="44" height="58" fill={C.cream} />
      <rect x="231" y="99" width="44" height="9" fill="#a3302a" />
      <path d="M236 103.5 H270" stroke="#efe6d2" strokeWidth="1.5" />
      <g stroke="#8a8170" strokeWidth="0.8">
        {[114, 120, 126, 132, 138, 144, 150].map((y) => (
          <path key={y} d={`M235 ${y} H${262 + (y % 4) * 2}`} />
        ))}
      </g>
      {/* your umbrella, dripping */}
      <ellipse cx="248" cy="354" rx="18" ry="3" fill="#2a3b55" opacity="0.6" />
      <path d="M246 262 V340" stroke="#1b120b" strokeWidth="2" />
      <path d="M246 262 q-8 -6 -2 -12 q6 -2 6 4" stroke="#c9a227" strokeWidth="2.5" fill="none" />
      <path d="M238 276 L246 270 L254 276 L258 336 Q246 346 234 336 Z" fill="#1d1f24" stroke="#000" strokeWidth="0.8" />
      <path d="M246 272 L244 338 M250 274 L254 336" stroke="#33363d" strokeWidth="0.8" />
      <path d="M240 340 l0 5 M252 341 l0 6" stroke="#9fb6d4" strokeWidth="1" strokeLinecap="round" />
      {/* door */}
      {open ? (
        <g>
          <rect x="104" y="72" width="108" height="286" fill="#120c07" />
          <rect x="104" y="72" width="108" height="286" fill="url(#nx-glow)" opacity="0.5" />
          <path d="M120 358 L150 210 L166 210 L196 358 Z" fill="#3a1416" opacity="0.8" />
          <rect x="184" y="72" width="30" height="286" fill={C.walnutDark} stroke={C.ink} />
        </g>
      ) : (
        <g>
          <rect x="104" y="72" width="108" height="286" rx="3" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
          <rect x="118" y="88" width="80" height="96" rx="8" fill="#cfd8d6" opacity="0.85" stroke="url(#nx-brass)" strokeWidth="2" />
          {/* etched nightingale */}
          <path
            d="M140 150 q10 -16 26 -12 q8 -8 16 -4 l-8 4 q2 10 -10 16 q-12 6 -24 -4 z M160 154 l-6 14 M166 152 l2 14"
            fill="none"
            stroke="#9fb0ae"
            strokeWidth="1.3"
          />
          <rect x="118" y="200" width="80" height="140" rx="4" fill="none" stroke={C.walnutLine} />
          <rect x="190" y="218" width="8" height="26" rx="3" fill="url(#nx-brass)" />
          {panel ? (
            <g>
              <rect x="178" y="250" width="24" height="30" rx="2" fill="#0d0905" />
              <circle cx="190" cy="265" r="8" fill="url(#nx-brass)" />
              <path d="M190 259 V265" stroke={C.ink} strokeWidth="1.5" />
            </g>
          ) : (
            <g>
              <rect x="178" y="250" width="24" height="30" rx="2" fill="url(#nx-brass)" stroke="#7a5f12" />
              {[
                [181, 253],
                [199, 253],
                [181, 277],
                [199, 277],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#5c4710" />
              ))}
            </g>
          )}
          <text x="158" y="80" textAnchor="middle" fontSize="7" fill={C.brass} fontFamily="Georgia, serif" letterSpacing="2">
            12B
          </text>
          {/* brass kick plate */}
          <rect x="108" y="342" width="100" height="12" rx="1.5" fill="url(#nx-brass)" opacity="0.85" />
        </g>
      )}
    </Room>
  );
}

function BerthWall({ flags, pouchHere }: { flags: string[]; pouchHere: boolean }) {
  const lampOn = flags.includes("lamp.on");
  const lifted = flags.includes("pillow.lifted");
  return (
    <Room>
      {lampOn && <circle cx="236" cy="190" r="70" fill="url(#nx-glow)" />}
      {/* upper berth */}
      <rect x="18" y="84" width="232" height="54" rx="4" fill="url(#nx-velvet)" stroke={C.ink} />
      <rect x="22" y="78" width="224" height="10" rx="3" fill={C.cream} />
      <path d="M18 106 H250" stroke="url(#nx-brass)" strokeWidth="2.5" />
      {/* button tufting, and a book left on the blanket */}
      <g fill="#173328">
        {[40, 80, 120, 160, 200, 240].map((x) => (
          <circle key={x} cx={x - 10} cy="124" r="1.6" />
        ))}
      </g>
      <g transform="rotate(-10 196 82)">
        <rect x="184" y="74" width="26" height="8" rx="1" fill="#6b2a2a" stroke={C.ink} strokeWidth="0.6" />
        <path d="M186 76 H208" stroke={C.brass} strokeWidth="0.6" />
      </g>
      {/* curtain rail with a gathered privacy curtain */}
      <path d="M18 66 H252" stroke="url(#nx-brass)" strokeWidth="2" />
      <path d="M20 66 q4 6 8 0 q4 6 8 0 q4 6 8 0 V82 H20 Z" fill="#7a2d2d" opacity="0.9" />
      {/* a painting of a mountain lake */}
      <rect x="54" y="150" width="104" height="56" rx="2" fill="url(#nx-brass)" stroke="#7a5f12" />
      <rect x="60" y="156" width="92" height="44" fill="#e9c98e" />
      <path d="M60 182 L84 164 L98 176 L118 158 L140 178 L152 170 V186 H60 Z" fill="#6f8aa6" />
      <path d="M118 158 L112 164 L118 162 L124 166 Z" fill="#f4f1ea" />
      <rect x="60" y="186" width="92" height="14" fill="#4c7393" />
      <path d="M66 192 H96 M108 195 H140" stroke="#f4dba0" strokeWidth="0.8" opacity="0.8" />
      <circle cx="132" cy="166" r="5" fill="#f6b56b" opacity="0.8" />
      {/* the water carafe in its brass ring */}
      <path d="M174 192 H204" stroke="url(#nx-brass)" strokeWidth="2.5" />
      <path d="M182 160 h10 v8 q10 6 10 22 h-30 q0 -16 10 -22 z" fill="#cfe0ea" opacity="0.75" stroke="#9fb0ba" strokeWidth="0.8" />
      <path d="M176 172 h22 v4 h-22 z" fill="url(#nx-brass)" opacity="0.6" />
      <rect x="182" y="196" width="10" height="12" rx="1" fill="#cfe0ea" opacity="0.7" stroke="#9fb0ba" strokeWidth="0.6" />
      {/* ladder */}
      <g stroke="url(#nx-brass)" strokeWidth="2.5">
        <path d="M258 70 V290 M282 70 V290" />
        {[96, 132, 168, 204, 240, 276].map((y) => (
          <path key={y} d={`M258 ${y} H282`} />
        ))}
      </g>
      {/* lamp */}
      <path d="M232 204 V186 L244 176" stroke="url(#nx-brass)" strokeWidth="3" fill="none" />
      <path d="M232 160 Q244 154 256 160 L250 176 H238 Z" fill={lampOn ? "#5fae7a" : "#2f6b47"} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <rect x="226" y="202" width="14" height="6" rx="2" fill="url(#nx-brass)" />
      {/* lower berth */}
      <rect x="18" y="232" width="232" height="58" rx="4" fill="url(#nx-velvet)" stroke={C.ink} />
      <path d="M110 236 Q180 230 248 238 V288 H110 Z" fill="#3b6f59" opacity="0.8" />
      {/* pillow */}
      <g transform={lifted ? "translate(4 -10) rotate(-8 64 232)" : undefined}>
        <rect x="28" y="222" width="76" height="24" rx="10" fill={C.cream} stroke="#b8ad92" />
        <path d="M40 232 Q66 226 92 232" stroke="#d8cdb4" fill="none" />
      </g>
      {lifted && <rect x="44" y="238" width="22" height="7" rx="2" fill="#f7f2e4" stroke="#b8ad92" />}
      {/* under the berth */}
      <rect x="18" y="292" width="232" height="56" fill="#0d0905" />
      <path d="M18 292 H250" stroke="url(#nx-brass)" strokeWidth="2" />
      {pouchHere && (
        <g>
          <path d="M140 330 q-6 -14 6 -18 q12 -2 14 8 q4 12 -8 14 z" fill="#22336e" />
          <path d="M146 312 q6 -6 12 2" stroke={C.brass} strokeWidth="1.5" fill="none" />
        </g>
      )}
      <circle cx="210" cy="338" r="2" fill="#4a3a2a" />
      {/* slippers on the carpet */}
      <path d="M44 372 q0 -8 12 -8 h8 q6 0 6 5 q0 5 -6 5 h-14 q-6 0 -6 -2 z" fill="#2f5d4a" stroke={C.ink} strokeWidth="0.6" />
      <path d="M74 378 q0 -8 12 -8 h8 q6 0 6 5 q0 5 -6 5 h-14 q-6 0 -6 -2 z" fill="#2f5d4a" stroke={C.ink} strokeWidth="0.6" />
    </Room>
  );
}

function WashstandWall({ flags, mirrorLetters }: { flags: string[]; mirrorLetters: string | null }) {
  const open = flags.includes("washstand.open");
  const hot = flags.includes("tap.hot");
  const vent = flags.includes("vent.open");
  return (
    <Room>
      {/* vent */}
      {vent ? (
        <g>
          <rect x="130" y="22" width="40" height="16" fill="#050302" />
          <g transform="rotate(28 130 38)">
            <rect x="130" y="38" width="40" height="14" rx="2" fill="url(#nx-brass)" />
          </g>
        </g>
      ) : (
        <g>
          <rect x="130" y="22" width="40" height="16" rx="2" fill="url(#nx-brass)" stroke="#7a5f12" />
          <g stroke="#7a5f12" strokeWidth="1.2">
            {[138, 146, 154, 162].map((x) => (
              <path key={x} d={`M${x} 25 V35`} />
            ))}
          </g>
          <circle cx="133" cy="30" r="1.2" fill="#5c4710" />
          <circle cx="167" cy="30" r="1.2" fill="#5c4710" />
        </g>
      )}
      {/* tiled splashback */}
      <rect x="90" y="54" width="120" height="160" rx="4" fill="#d9e2dc" opacity="0.18" />
      <g stroke="#d9e2dc" strokeWidth="0.6" opacity="0.25">
        {[74, 94, 114, 134, 154, 174, 194].map((y) => (
          <path key={y} d={`M90 ${y} H210`} />
        ))}
        {[110, 130, 150, 170, 190].map((x) => (
          <path key={x} d={`M${x} 54 V214`} />
        ))}
      </g>
      {/* mirror, with a stepped Deco crest */}
      <path d="M130 58 L136 50 H164 L170 58 Z" fill="url(#nx-brass)" />
      <path d="M144 50 L150 44 L156 50 Z" fill="url(#nx-brass)" />
      <ellipse cx="150" cy="124" rx="48" ry="62" fill="url(#nx-glass)" stroke="url(#nx-brass)" strokeWidth="5" />
      <path d="M116 96 Q122 80 136 72" stroke="#fff" strokeWidth="3" fill="none" opacity="0.35" strokeLinecap="round" />
      {hot && (
        <g>
          <ellipse cx="150" cy="124" rx="45" ry="59" fill="#f4f6f7" opacity="0.72" />
          {mirrorLetters && (
            <text
              transform="scale(-1 1)"
              x={-150}
              y={130}
              textAnchor="middle"
              fontSize="17"
              fontFamily="'Brush Script MT', 'Segoe Script', cursive"
              fill="#7c8a92"
              letterSpacing="1"
            >
              {mirrorLetters}
            </text>
          )}
        </g>
      )}
      {/* washstand */}
      {open ? (
        <g>
          <rect x="94" y="214" width="112" height="40" rx="4" fill={C.walnutLine} stroke={C.ink} />
          <ellipse cx="150" cy="232" rx="40" ry="12" fill="#f6f2ea" stroke="#b8ad92" />
          <ellipse cx="150" cy="234" rx="30" ry="7" fill="#d9e2e6" />
          <circle cx="120" cy="218" r="4" fill="#b8423a" stroke="url(#nx-brass)" />
          <circle cx="180" cy="218" r="4" fill="#3a6fb8" stroke="url(#nx-brass)" />
          <path d="M150 210 V220 q0 4 4 4" stroke="url(#nx-brass)" strokeWidth="3" fill="none" />
          {hot && (
            <g className="nx-steam" stroke="#f4f6f7" strokeWidth="2.5" fill="none" opacity="0.7">
              <path d="M140 222 q-6 -12 2 -22 q6 -10 -2 -20" />
              <path d="M158 222 q6 -12 -2 -22 q-6 -10 2 -20" />
              <path d="M154 226 V234" stroke="#cfe0ea" />
            </g>
          )}
          <rect x="94" y="254" width="112" height="84" rx="4" fill={C.walnutDark} stroke={C.ink} />
        </g>
      ) : (
        <g>
          <rect x="94" y="214" width="112" height="124" rx="4" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
          <rect x="104" y="224" width="92" height="104" rx="3" fill="none" stroke={C.walnutLine} />
          <circle cx="150" cy="248" r="5" fill="url(#nx-brass)" />
          <path d="M150 246 V252" stroke={C.ink} strokeWidth="1.5" />
        </g>
      )}
      {/* glass shelf: cologne, tooth powder, shaving brush */}
      <path d="M20 168 H88" stroke="#cfe0ea" strokeWidth="3" opacity="0.8" />
      <path d="M24 168 v10 l6 -10 M84 168 v10 l-6 -10" stroke="url(#nx-brass)" strokeWidth="1.5" fill="none" />
      <path d="M30 166 V140 q0 -6 6 -6 h6 q6 0 6 6 V166 Z" fill="#c98b3a" opacity="0.8" stroke="#7a5f12" strokeWidth="0.6" />
      <rect x="35" y="126" width="8" height="8" rx="1" fill="url(#nx-brass)" />
      <rect x="54" y="150" width="14" height="16" rx="2" fill="#e8e0cc" stroke="#9a8f78" strokeWidth="0.6" />
      <path d="M54 156 H68" stroke="#a3302a" strokeWidth="2" />
      <rect x="74" y="148" width="6" height="18" rx="1" fill="#5b3a22" />
      <path d="M72 148 q5 -12 10 0 z" fill="#efe6d2" stroke="#b8ad92" strokeWidth="0.6" />
      {/* enamel sign */}
      <rect x="20" y="230" width="62" height="30" rx="3" fill="#efe6d2" stroke="#1d3554" strokeWidth="2" />
      <text x="51" y="242" textAnchor="middle" fontSize="5" fill="#1d3554" fontFamily="Georgia, serif" fontWeight="bold">
        EAU NON
      </text>
      <text x="51" y="250" textAnchor="middle" fontSize="5" fill="#1d3554" fontFamily="Georgia, serif" fontWeight="bold">
        POTABLE
      </text>
      <path d="M34 254 H68" stroke="#a3302a" strokeWidth="1" />
      {/* soap dish beside the basin */}
      <path d="M200 206 h14 l-2 6 h-10 z" fill="url(#nx-brass)" />
      <ellipse cx="207" cy="205" rx="5" ry="2.5" fill="#f4e9d8" />
      {/* towel */}
      <path d="M222 228 H280" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M230 228 H272 V300 H230 Z" fill={C.cream} stroke="#b8ad92" />
      <path d="M230 288 H272" stroke="#2f5d4a" strokeWidth="3" />
      <path d="M244 260 q6 -6 12 -2 q4 -4 8 -2 l-4 2 q0 6 -6 8 q-6 2 -10 -6 z" fill="none" stroke="#2f5d4a" strokeWidth="1" />
    </Room>
  );
}

function BarWall({ flags }: { flags: string[] }) {
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

function TablesWall({ taken }: { taken: boolean }) {
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

function KitchenWall({ flags }: { flags: string[] }) {
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

function LoungeWall({ flags }: { flags: string[] }) {
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

export function WallArt({
  wall,
  flags,
  mirrorLetters,
  pouchHere,
  scorecardHere,
}: {
  wall: WallId;
  flags: string[];
  mirrorLetters: string | null;
  pouchHere: boolean;
  scorecardHere: boolean;
}) {
  const t = useT();
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" role="img" aria-label={t("train.wallAria", { wall: t(`train.wall.${wall}`) })}>
      {wall === "window" && <WindowWall flags={flags} />}
      {wall === "door" && <DoorWall flags={flags} />}
      {wall === "berths" && <BerthWall flags={flags} pouchHere={pouchHere} />}
      {wall === "washstand" && <WashstandWall flags={flags} mirrorLetters={mirrorLetters} />}
      {wall === "bar" && <BarWall flags={flags} />}
      {wall === "tables" && <TablesWall taken={!scorecardHere} />}
      {wall === "kitchen" && <KitchenWall flags={flags} />}
      {wall === "lounge" && <LoungeWall flags={flags} />}
    </svg>
  );
}

/** The corridor outside 12B, reached once the door is open. */
export function CorridorArt() {
  const t = useT();
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" role="img" aria-label={t("train.corridorAria")}>
      <defs>
        <linearGradient id="nx-cor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2f1c" />
          <stop offset="1" stopColor="#24160c" />
        </linearGradient>
        <radialGradient id="nx-end" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#nx-cor)" />
      {/* perspective walls */}
      <path d="M0 0 L120 150 L120 250 L0 400 Z" fill="#3a2414" />
      <path d="M300 0 L180 150 L180 250 L300 400 Z" fill="#2a190c" />
      <path d="M0 400 L120 250 H180 L300 400 Z" fill="#5e1b1e" />
      <path d="M0 0 L120 150 H180 L300 0 Z" fill="#160d06" />
      {/* windows on the left, compartment doors on the right */}
      {[
        [10, 70, 60, 140],
        [64, 118, 96, 164],
      ].map(([x1, y1, x2, y2]) => (
        <path key={x1} d={`M${x1} ${y1} L${x2} ${y2} L${x2} ${y2 + 50} L${x1} ${y1 + 90} Z`} fill="#0e1a2b" stroke="#c9a227" strokeWidth="1.5" />
      ))}
      {[
        [290, 70, 240, 130],
        [234, 136, 204, 168],
      ].map(([x1, y1, x2, y2]) => (
        <path key={x1} d={`M${x1} ${y1} L${x2} ${y2} L${x2} ${y2 + 90} L${x1} ${y1 + 170} Z`} fill="#3d2615" stroke="#7a5333" strokeWidth="1.5" />
      ))}
      {/* runner down the middle of the carpet */}
      <path d="M90 400 L138 250 H162 L210 400 Z" fill="#7a2526" />
      <path d="M100 400 L140 250 M200 400 L160 250" stroke="#c9a227" strokeWidth="1" opacity="0.6" />
      {[380, 340, 306, 280, 262].map((y, i) => (
        <path key={y} d={`M150 ${y - 8 + i} l${6 - i} ${6 - i} l-${6 - i} ${6 - i} l-${6 - i} -${6 - i} z`} fill="#c9a227" opacity="0.5" />
      ))}
      {/* brass handrail under the windows */}
      <path d="M0 250 L120 205" stroke="#c9a227" strokeWidth="2.5" />
      {/* ceiling lamps, getting smaller */}
      {[
        [150, 30, 18],
        [150, 92, 10],
        [150, 128, 6],
      ].map(([x, y, r]) => (
        <g key={y}>
          <circle cx={x} cy={y} r={r * 2.4} fill="url(#nx-end)" opacity="0.45" />
          <ellipse cx={x} cy={y} rx={r} ry={r / 3} fill="#f6ead0" stroke="#c9a227" strokeWidth="0.8" />
        </g>
      ))}
      {/* compartment numbers */}
      <text x="262" y="168" textAnchor="middle" fontSize="7" fill="#c9a227" fontFamily="Georgia, serif" transform="skewY(-25 262 168)">
        12A
      </text>
      {/* the dining car door at the end */}
      <rect x="132" y="160" width="36" height="86" rx="2" fill="#3d2615" stroke="#c9a227" strokeWidth="1.5" />
      <rect x="138" y="168" width="24" height="30" rx="3" fill="url(#nx-end)" />
      <circle cx="150" cy="190" r="40" fill="url(#nx-end)" opacity="0.5" />
      <text x="150" y="156" textAnchor="middle" fontSize="6" fill="#c9a227" fontFamily="Georgia, serif" letterSpacing="1.5">
        {t("train.sign.diningCar")}
      </text>
    </svg>
  );
}
