"use client";

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

export const WALL_NAMES: Record<WallId, string> = {
  window: "Window",
  door: "Door",
  berths: "Berths",
  washstand: "Washstand",
  bar: "Bar",
  tables: "Tables",
  kitchen: "Kitchen end",
  lounge: "Lounge end",
};

export const HOTSPOTS: Record<WallId, Hotspot[]> = {
  window: [
    { id: "window", label: "Window", x: 60, y: 50, w: 180, h: 165 },
    { id: "newspaper", label: "Newspaper", x: 70, y: 210, w: 90, h: 36 },
    { id: "teacup", label: "Cup of tea", x: 176, y: 210, w: 46, h: 32 },
  ],
  door: [
    { id: "suitcase", label: "Suitcase", x: 162, y: 4, w: 110, h: 44 },
    { id: "coat", label: "Coat", x: 20, y: 88, w: 70, h: 220 },
    { id: "door", label: "Door", x: 104, y: 72, w: 108, h: 286 },
  ],
  berths: [
    { id: "upper-berth", label: "Upper berth", x: 20, y: 74, w: 222, h: 68 },
    { id: "lamp", label: "Reading lamp", x: 210, y: 148, w: 64, h: 56 },
    { id: "pillow", label: "Pillow", x: 24, y: 216, w: 84, h: 34 },
    { id: "under-berth", label: "Under the berth", x: 20, y: 292, w: 260, h: 52 },
  ],
  washstand: [
    { id: "vent", label: "Ceiling vent", x: 116, y: 12, w: 68, h: 36 },
    { id: "mirror", label: "Mirror", x: 98, y: 58, w: 104, h: 132 },
    { id: "washstand", label: "Washstand", x: 90, y: 208, w: 120, h: 132 },
    { id: "towel", label: "Towel", x: 222, y: 222, w: 58, h: 86 },
  ],
  bar: [
    { id: "bottles", label: "Bottles", x: 30, y: 46, w: 240, h: 110 },
    { id: "cashbox", label: "Cash box", x: 56, y: 172, w: 80, h: 52 },
    { id: "bell", label: "Service bell", x: 206, y: 186, w: 50, h: 38 },
  ],
  tables: [
    { id: "dining-window", label: "Window", x: 30, y: 34, w: 240, h: 92 },
    { id: "champagne", label: "Champagne glass", x: 214, y: 156, w: 44, h: 56 },
    { id: "sugar", label: "Sugar bowl", x: 44, y: 176, w: 56, h: 44 },
    { id: "bridge", label: "Bridge game", x: 104, y: 184, w: 104, h: 62 },
  ],
  kitchen: [
    { id: "menu", label: "Menu board", x: 26, y: 46, w: 128, h: 150 },
    { id: "dumbwaiter", label: "Dumbwaiter", x: 34, y: 212, w: 116, h: 104 },
    { id: "kitchen-door", label: "Kitchen door", x: 172, y: 64, w: 108, h: 292 },
  ],
  lounge: [
    { id: "gramophone", label: "Gramophone", x: 34, y: 126, w: 124, h: 156 },
    { id: "records", label: "Records", x: 38, y: 284, w: 116, h: 62 },
    { id: "stole", label: "Fur stole", x: 184, y: 66, w: 96, h: 186 },
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
        <pattern id="nx-carpet" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={C.carpet} />
          <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="none" stroke="#8e3a2c" strokeWidth="1" />
          <circle cx="10" cy="10" r="1.6" fill={C.brass} opacity="0.6" />
        </pattern>
      </defs>
      <rect width="300" height="400" fill="url(#nx-wall)" />
      {/* panelling */}
      <g stroke={C.walnutLine} strokeWidth="1" fill="none" opacity="0.7">
        <rect x="8" y="26" width="284" height="326" rx="4" />
        <path d="M8 254 H292" />
      </g>
      {/* ceiling cornice and floor */}
      <rect width="300" height="20" fill={C.ink} />
      <path d="M0 20 H300" stroke="url(#nx-brass)" strokeWidth="2" />
      <rect y="356" width="300" height="44" fill="url(#nx-carpet)" />
      <path d="M0 356 H300" stroke="url(#nx-brass)" strokeWidth="2" />
      {children}
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

function WindowWall() {
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
      {/* blind */}
      <path d="M62 52 H238 V88 Q150 96 62 88 Z" fill={C.cream} opacity="0.92" />
      <path d="M62 88 Q150 96 238 88" stroke={C.brass} strokeWidth="1.5" fill="none" />
      <circle cx="150" cy="96" r="3" fill="url(#nx-brass)" />
      {/* table */}
      <rect x="52" y="238" width="196" height="12" rx="3" fill={C.walnutLine} stroke={C.ink} strokeWidth="1" />
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
      <ellipse cx="199" cy="222" rx="12" ry="2.5" fill="#6b4a2a" />
      {/* heater grille */}
      <rect x="78" y="296" width="144" height="42" rx="4" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <g stroke={C.brass} strokeWidth="1" opacity="0.7">
        {[88, 100, 112, 124, 136, 148, 160, 172, 184, 196, 208].map((x) => (
          <path key={x} d={`M${x} 302 V332`} />
        ))}
      </g>
    </Room>
  );
}

function DoorWall({ flags }: { flags: string[] }) {
  const open = flags.includes("door.open");
  const panel = flags.includes("panel.open");
  const suitcaseOpen = flags.includes("suitcase.open");
  const searched = flags.includes("coat.searched");
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
      {/* suitcase */}
      {suitcaseOpen ? (
        <g>
          <path d="M172 20 L182 -2 H262 L270 20 Z" fill="#8a5a33" stroke={C.ink} />
          <rect x="170" y="20" width="98" height="24" rx="3" fill="#7b4f2c" stroke={C.ink} />
          <rect x="178" y="22" width="40" height="10" rx="2" fill="#c98b9a" />
          <rect x="222" y="22" width="34" height="9" rx="2" fill="#5a3b20" stroke={C.brass} strokeWidth="0.8" />
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
      {/* mirror */}
      <ellipse cx="150" cy="124" rx="48" ry="62" fill="url(#nx-glass)" stroke="url(#nx-brass)" strokeWidth="5" />
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
      {/* counter */}
      <rect x="18" y="222" width="264" height="14" rx="3" fill="#7a3a1e" stroke={C.ink} />
      <rect x="24" y="236" width="252" height="90" fill="#4a2414" stroke={C.ink} />
      <path d="M24 280 H276" stroke="url(#nx-brass)" strokeWidth="3" />
      {[60, 110, 160, 210].map((x) => (
        <rect key={x} x={x} y="246" width="34" height="26" rx="3" fill="none" stroke="#6b3a20" />
      ))}
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
      {/* stools */}
      {[70, 150, 230].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="332" rx="18" ry="5" fill="#2f5d4a" stroke={C.ink} />
          <path d={`M${x} 337 V356`} stroke="url(#nx-brass)" strokeWidth="3" />
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
      {/* chairs */}
      {[48, 252].map((x) => (
        <rect key={x} x={x - 22} y="150" width="44" height="130" rx="8" fill="url(#nx-velvet)" stroke={C.ink} />
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
      {/* champagne coupe */}
      <path d="M222 172 Q236 190 250 172 Z" fill="#f2e4b0" stroke="#b8ad92" opacity="0.9" />
      <path d="M236 182 V206 M228 208 H244" stroke="#b8ad92" strokeWidth="1.5" />
      <path d="M244 172 q2 3 -1 5" stroke="#a3302a" strokeWidth="2" fill="none" />
    </Room>
  );
}

function KitchenWall({ flags }: { flags: string[] }) {
  const open = flags.includes("dumbwaiter.open");
  const raised = flags.includes("dumbwaiter.raised");
  return (
    <Room>
      {/* chalk menu */}
      <rect x="30" y="50" width="120" height="142" rx="4" fill="#1d2420" stroke="url(#nx-brass)" strokeWidth="3" />
      <text x="90" y="72" textAnchor="middle" fontSize="11" fill="#e8e4d8" fontFamily="'Segoe Script', 'Brush Script MT', cursive">
        Tonight
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
      <rect x="150" y="262" width="12" height="12" rx="2" fill="#1b120b" stroke="url(#nx-brass)" />
      <rect x="153" y="265" width="6" height="6" fill="#090604" />
      {/* kitchen door */}
      <rect x="176" y="70" width="98" height="286" rx="3" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
      <circle cx="225" cy="120" r="22" fill="#2a1f14" stroke="url(#nx-brass)" strokeWidth="3" />
      <rect x="186" y="186" width="78" height="20" rx="2" fill={C.cream} />
      <text x="225" y="199" textAnchor="middle" fontSize="6.5" fill={C.ink} fontFamily="Georgia, serif" letterSpacing="0.5">
        KITCHEN CLOSED
      </text>
      <rect x="252" y="230" width="8" height="24" rx="3" fill="url(#nx-brass)" />
    </Room>
  );
}

function LoungeWall({ flags }: { flags: string[] }) {
  const searched = flags.includes("stole.searched");
  return (
    <Room>
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
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" role="img" aria-label={`${WALL_NAMES[wall]} wall`}>
      {wall === "window" && <WindowWall />}
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
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" role="img" aria-label="The corridor outside Compartment 12B">
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
      {/* the dining car door at the end */}
      <rect x="132" y="160" width="36" height="86" rx="2" fill="#3d2615" stroke="#c9a227" strokeWidth="1.5" />
      <rect x="138" y="168" width="24" height="30" rx="3" fill="url(#nx-end)" />
      <circle cx="150" cy="190" r="40" fill="url(#nx-end)" opacity="0.5" />
      <text x="150" y="156" textAnchor="middle" fontSize="6" fill="#c9a227" fontFamily="Georgia, serif" letterSpacing="1.5">
        DINING CAR
      </text>
    </svg>
  );
}
