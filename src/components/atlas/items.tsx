import type { ItemId } from "@/lib/atlas/types";

/**
 * The Atlas of Silent Worlds' things, drawn to match the walls (viewBox 48×48): Cartographers' brass, old paper,
 * and each Age's own colour for its seal.
 */

const BRASS = "#c9a227";
const BRASS_HI = "#f0d98a";
const BRASS_DK = "#7a5f12";
const PAPER = "#efe4c6";
const PAPER_DK = "#c9b88e";
const INK = "#4a3a22";

/** The three seals: a stone disc in the Age's colour, carved with its sign. */
function Seal({ color, rim, children }: { color: string; rim: string; children: React.ReactNode }) {
  return (
    <>
      <circle cx="24" cy="25" r="18" fill={rim} />
      <circle cx="24" cy="24" r="18" fill={color} />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <g stroke="#fff" strokeOpacity="0.85" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </>
  );
}

/** A folded letter, tinted by where it was found. */
function Letter({ tint, mark }: { tint: string; mark: React.ReactNode }) {
  return (
    <>
      <rect x="7" y="12" width="34" height="26" rx="2" fill={tint} stroke={PAPER_DK} />
      <path d="M7 13 L24 27 L41 13" fill="none" stroke={PAPER_DK} strokeWidth="1.5" />
      {mark}
    </>
  );
}

const ICONS: Record<ItemId, React.ReactNode> = {
  token: (
    <>
      <circle cx="24" cy="25" r="16" fill={BRASS_DK} />
      <circle cx="24" cy="24" r="16" fill={BRASS} />
      <circle cx="24" cy="24" r="12" fill="none" stroke={BRASS_HI} strokeWidth="1.5" />
      {/* a compass rose */}
      <path d="M24 13 L26.5 24 L24 35 L21.5 24 Z" fill={BRASS_HI} />
      <path d="M13 24 L24 21.5 L35 24 L24 26.5 Z" fill={BRASS_DK} opacity="0.7" />
    </>
  ),
  gear: (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x="21" y="5" width="6" height="8" rx="1" fill={BRASS} transform={`rotate(${i * 36} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="14" fill={BRASS} stroke={BRASS_DK} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="5" fill="#14171a" />
      <path d="M17 19 Q24 14 31 19" stroke={BRASS_HI} strokeWidth="1.5" fill="none" />
      {/* still wet */}
      <path d="M33 31 q2 4 0 6 q-2 -2 0 -6" fill="#9fd3c7" />
    </>
  ),
  numerals: (
    <>
      <rect x="9" y="5" width="30" height="38" rx="2" fill={PAPER} stroke={PAPER_DK} />
      <path d="M33 8 q-5 2 -6 7 q5 -1 6 -7" fill="#57a84e" />
      {["☾", "◈", "≈", "☉"].map((g, i) => (
        <g key={g}>
          <text x="15" y={17 + i * 7} textAnchor="middle" fontSize="6.5" fill={INK}>
            {g}
          </text>
          <path d={`M20 ${15 + i * 7} H33`} stroke={INK} strokeWidth="1" opacity="0.5" />
        </g>
      ))}
    </>
  ),
  can: (
    <>
      <path d="M12 18 H32 L30 40 H14 Z" fill="#b8733a" stroke="#6b3f1c" />
      <path d="M32 22 L44 12" stroke="#b8733a" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 18 Q22 6 30 18" stroke="#6b3f1c" strokeWidth="2.5" fill="none" />
      <path d="M15 24 H29" stroke="#e0a36a" strokeWidth="1.5" opacity="0.7" />
      <circle cx="45" cy="15" r="1.5" fill="#9fd3c7" />
    </>
  ),
  "seal-leaf": (
    <Seal color="#3f9a52" rim="#245c30">
      <path d="M24 33 C14 26 16 16 24 13 C32 16 34 26 24 33 Z" />
      <path d="M24 15 V33" />
    </Seal>
  ),
  "seal-sun": (
    <Seal color="#d9a52f" rim="#8a6416">
      <circle cx="24" cy="24" r="5" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${24 + Math.cos(a) * 8} ${24 + Math.sin(a) * 8} L${24 + Math.cos(a) * 11} ${24 + Math.sin(a) * 11}`} />;
      })}
    </Seal>
  ),
  "seal-tide": (
    <Seal color="#2f86a8" rim="#1a4f66">
      <path d="M13 21 Q18.5 16 24 21 T35 21" />
      <path d="M13 28 Q18.5 23 24 28 T35 28" />
    </Seal>
  ),
  "memory-verdant": <Letter tint={PAPER} mark={<path d="M30 30 q4 -6 8 -4 q-2 6 -8 4" fill="#4f9a48" />} />,
  "memory-meridian": <Letter tint="#f3e2b0" mark={<circle cx="34" cy="31" r="3.5" fill="#e2b23a" />} />,
  "memory-pelagic": <Letter tint="#dfe6dc" mark={<path d="M28 33 q3 -3 6 0 t6 0" stroke="#2f86a8" strokeWidth="1.5" fill="none" />} />,
  "sun-lens": (
    <>
      <ellipse cx="24" cy="24" rx="15" ry="15" fill="#cfe6ea" fillOpacity="0.55" stroke="#8fb2b8" strokeWidth="3" />
      <path d="M15 19 Q19 12 27 12" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <circle cx="31" cy="31" r="3" fill="#fff6d0" />
    </>
  ),
  "hand-mirror": (
    <>
      <path d="M24 30 V44" stroke={BRASS_DK} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="24" cy="17" rx="12" ry="14" fill={BRASS} />
      <ellipse cx="24" cy="17" rx="9" ry="11" fill="#cfe3ea" />
      <path d="M19 12 Q21 8 26 8" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  "engineer-note": (
    <>
      <rect x="9" y="6" width="30" height="36" rx="2" fill={PAPER} stroke={PAPER_DK} transform="rotate(-4 24 24)" />
      {/* mirror writing: lines that run right to left */}
      <g transform="rotate(-4 24 24)" stroke={INK} strokeWidth="1.2" opacity="0.7">
        <path d="M34 14 H16 M34 19 H19 M34 24 H14 M34 29 H20" />
      </g>
      <text x="17" y="38" fontSize="9" fill={INK} transform="scale(-1 1) translate(-48 0)">
        R
      </text>
    </>
  ),
  "star-map": (
    <>
      <rect x="6" y="8" width="36" height="32" rx="2" fill={BRASS} stroke={BRASS_DK} />
      <rect x="9" y="11" width="30" height="26" fill={BRASS_HI} opacity="0.5" />
      {/* every Age joined to the Observatory, and to nothing else */}
      <circle cx="24" cy="24" r="3" fill={BRASS_DK} />
      {[
        [13, 15],
        [35, 15],
        [13, 33],
        [35, 33],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <path d={`M24 24 L${x} ${y}`} stroke={BRASS_DK} strokeWidth="1.2" />
          <circle cx={x} cy={y} r="2.2" fill={BRASS_DK} />
        </g>
      ))}
    </>
  ),
  brine: (
    <>
      <rect x="20" y="5" width="8" height="6" rx="1" fill="#6b4527" />
      <path d="M20 11 H28 V17 L36 30 V40 Q36 43 33 43 H15 Q12 43 12 40 V30 L20 17 Z" fill="#cfe6ea" fillOpacity="0.5" stroke="#8fb2b8" strokeWidth="2" />
      <path d="M13 31 H35 V40 Q35 42 33 42 H15 Q13 42 13 40 Z" fill="#2f8f8a" opacity="0.85" />
      <path d="M16 34 q2 -1.5 4 0 t4 0" stroke="#bff3ea" strokeWidth="1" fill="none" />
    </>
  ),
  "tide-chart": (
    <>
      <rect x="6" y="8" width="36" height="32" rx="3" fill="#cfe6ea" fillOpacity="0.45" stroke="#8fb2b8" strokeWidth="2" />
      {/* tides slowing to nothing */}
      <path d="M9 18 Q13 11 17 18 T25 18 T33 18 T39 18" stroke="#2f86a8" strokeWidth="1.6" fill="none" />
      <path d="M9 26 Q14 22 19 26 T29 26 T39 26" stroke="#2f86a8" strokeWidth="1.4" fill="none" opacity="0.8" />
      <path d="M9 33 Q16 31 23 33 T39 33" stroke="#2f86a8" strokeWidth="1.2" fill="none" opacity="0.6" />
    </>
  ),
  "night-bloom": (
    <>
      <circle cx="24" cy="22" r="16" fill="#fff6d0" opacity="0.25" />
      <path d="M24 30 V44" stroke="#3f8a3a" strokeWidth="2.5" />
      <path d="M24 38 q-7 -1 -9 -6 q6 0 9 6" fill="#4f9a48" />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx="24" cy="14" rx="4" ry="8" fill="#f3e9ff" stroke="#cbb8e8" strokeWidth="0.8" transform={`rotate(${i * 60} 24 22)`} />
      ))}
      <circle cx="24" cy="22" r="3" fill={BRASS_HI} />
    </>
  ),
};

/** One of the team's things, drawn. Decorative: its name is always shown or announced next to it. */
export function AtlasItemIcon({ id, className = "h-9 w-9" }: { id: ItemId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {ICONS[id]}
    </svg>
  );
}
