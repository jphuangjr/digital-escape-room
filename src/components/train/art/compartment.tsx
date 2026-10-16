/** Compartment 12B: the window, door, berths and washstand walls. Each draws itself from the room's shared flags. */
import { Dust, Grain, LightPool, Rain, Shadow, Vignette, seeded } from "@/components/atlas/art/common";
import { C, Room, Sconce } from "./common";

// ---------------------------------------------------------------- small local helpers for the night-storm pass

/** A soft shadow cast on the wall behind or below something (a blurred dark shape). */
function WallShade({ d, opacity = 0.4, soft = "at-soft" }: { d: string; opacity?: number; soft?: "at-soft" | "at-softer" }) {
  return <path d={d} fill="#000" opacity={opacity} filter={`url(#${soft})`} pointerEvents="none" />;
}

/** A thin diagonal glare across glass. */
function Glare({ x, y, w, h, opacity = 0.14 }: { x: number; y: number; w: number; h: number; opacity?: number }) {
  return (
    <path
      d={`M${x + w * 0.15} ${y} h${w * 0.18} L${x + w * 0.05} ${y + h} h-${w * 0.12} Z M${x + w * 0.42} ${y} h${w * 0.06} L${x + w * 0.24} ${y + h} h-${w * 0.05} Z`}
      fill="#fff"
      opacity={opacity}
      pointerEvents="none"
    />
  );
}

/** The last two layers on every wall: grain over everything, then the edges sinking into the dark. */
function Finish() {
  return (
    <>
      <Grain opacity={0.08} />
      <g opacity={0.55}>
        <Vignette />
      </g>
    </>
  );
}

/** A sconce's warm light washing the walnut around it. */
function SconceLight({ x }: { x: number }) {
  return (
    <>
      <LightPool cx={x} cy={116} r={58} flicker />
      <ellipse cx={x} cy={150} rx={22} ry={46} fill="#ffcf7a" opacity={0.07} filter="url(#at-soft)" pointerEvents="none" />
    </>
  );
}

export function WindowWall({ flags }: { flags: string[] }) {
  const emptied = flags.includes("teacup.emptied");
  const rnd = seeded(1207);
  const beads = Array.from({ length: 12 }, () => ({ x: 66 + rnd() * 168, y: 100 + rnd() * 112, r: 0.8 + rnd() * 1.3 }));
  return (
    <Room>
      <defs>
        <clipPath id="nx-window-glass">
          <rect x="62.5" y="52.5" width="175" height="163" rx="14" />
        </clipPath>
        <linearGradient id="nx-window-cold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9c8ea" stopOpacity="0.2" />
          <stop offset="1" stopColor="#a9c8ea" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nx-window-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe0ee" stopOpacity="0" />
          <stop offset="1" stopColor="#cfe0ee" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="nx-window-grille" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a4a" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ff8a3a" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="nx-window-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#bcd4ee" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <SconceLight x={32} />
      <SconceLight x={268} />
      <Sconce x={32} />
      <Sconce x={268} />
      {/* the window recess throws a shadow round its frame */}
      <WallShade d="M54 48 H246 V228 H54 Z" opacity={0.45} />
      {/* window */}
      <rect x="60" y="50" width="180" height="168" rx="16" fill="url(#nx-night)" stroke="url(#nx-brass)" strokeWidth="5" />
      <g clipPath="url(#nx-window-glass)">
        {/* low storm clouds lit faintly from below, the far hills behind the near ones */}
        <ellipse cx="110" cy="110" rx="70" ry="22" fill="#2a3a52" opacity="0.7" filter="url(#at-soft)" />
        <ellipse cx="200" cy="128" rx="60" ry="18" fill="#33465f" opacity="0.6" filter="url(#at-soft)" />
        <ellipse cx="160" cy="150" rx="90" ry="20" fill="#3b5068" opacity="0.35" filter="url(#at-softer)" />
        <path d="M62 190 Q96 176 128 184 T190 178 T238 182 V216 H62 Z" fill="#121b29" />
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
        <Rain x={66} y={96} w={170} h={118} count={12} seed={1213} />
        {/* beads of rain clinging to the glass, each with a pinprick of lamplight */}
        <g pointerEvents="none">
          {beads.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#9fb6d4" fillOpacity="0.3" stroke="#fff4d6" strokeWidth="0.4" strokeOpacity="0.55" />
          ))}
        </g>
        {/* a warm ghost of the compartment's lamps in the glass, and a breath of mist at the sill */}
        <ellipse cx="206" cy="150" rx="16" ry="10" fill="#ffd98a" opacity="0.1" filter="url(#at-soft)" />
        <rect x="62" y="180" width="176" height="36" fill="url(#nx-window-mist)" />
        <Glare x={70} y={96} w={160} h={120} opacity={0.05} />
      </g>
      <rect x="60" y="50" width="180" height="168" rx="16" fill="none" stroke="url(#nx-brass)" strokeWidth="5" />
      <rect x="57.5" y="47.5" width="185" height="173" rx="18" fill="none" stroke="#1b120b" strokeWidth="1" opacity="0.6" />
      <path d="M64 60 Q66 53 76 52.5 H224" stroke="#fff2c2" strokeWidth="1" fill="none" opacity="0.45" />
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
      <path d="M62 52 H238 V88 Q150 96 62 88 Z" fill="url(#nx-window-top)" />
      <path d="M64 88 Q150 98 236 88 L236 92 Q150 102 64 92 Z" fill="#000" opacity="0.25" filter="url(#at-soft)" />
      <g stroke="#d8cdb4" strokeWidth="0.8">
        {[60, 68, 76, 84].map((y) => (
          <path key={y} d={`M64 ${y} H236`} />
        ))}
      </g>
      <path d="M62 88 Q150 96 238 88" stroke={C.brass} strokeWidth="1.5" fill="none" />
      <circle cx="150" cy="96" r="3" fill="url(#nx-brass)" />
      {/* the blind's pull, swinging gently with the train */}
      <g className="at-sway" style={{ transformOrigin: "50% 0%" }}>
        <path d="M150 99 V110" stroke="#d8cdb4" strokeWidth="0.8" />
        <path d="M148 110 H152 L153 117 H147 Z" fill="url(#nx-brass)" />
      </g>
      {/* velvet curtains, tied back with tasselled cords */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? "translate(300 0) scale(-1 1)" : undefined}>
          <path d="M40 44 H66 Q68 92 64 120 Q80 170 74 230 H40 Z" fill="#000" opacity="0.4" filter="url(#at-soft)" />
          <path d="M44 40 H74 Q70 90 60 120 Q76 170 70 226 H44 Z" fill="url(#nx-velvet)" stroke={C.ink} strokeWidth="0.8" />
          <path d="M52 44 Q56 90 50 118 M62 44 Q64 84 56 118" stroke="#173328" strokeWidth="1.2" fill="none" />
          <path d="M50 124 Q58 172 52 224 M62 126 Q68 176 62 224" stroke="#173328" strokeWidth="1.2" fill="none" />
          {/* the velvet's sheen where the lamplight catches the folds */}
          <path d="M47 46 Q51 90 46 116 M57 46 Q60 88 53 117" stroke="#5f9c80" strokeWidth="1.6" fill="none" opacity="0.4" />
          <path d="M47 128 Q54 174 48 222 M57 128 Q63 176 57 222" stroke="#5f9c80" strokeWidth="1.6" fill="none" opacity="0.35" />
          <path d="M68 44 Q66 88 58 118 Q72 168 66 224" stroke="#a9c8ea" strokeWidth="0.8" fill="none" opacity="0.25" />
          <path d="M44 120 Q56 116 66 122" stroke="url(#nx-brass)" strokeWidth="2" fill="none" />
          <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDelay: side ? "-2.6s" : "0s" }}>
            <path d="M66 122 V132" stroke={C.brass} strokeWidth="1" />
            <path d="M63 132 H69 L70 140 H62 Z" fill="url(#nx-brass)" />
            <path d="M64 133 L63.5 139" stroke="#fff2c2" strokeWidth="0.6" opacity="0.6" />
          </g>
        </g>
      ))}
      <rect x="40" y="34" width="220" height="9" rx="2" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1" />
      <path d="M42 35 H258" stroke="#fff2c2" strokeWidth="0.6" opacity="0.35" />
      {/* the enamel plate */}
      <rect x="104" y="27" width="92" height="15" rx="2" fill="#1d3554" stroke="url(#nx-brass)" strokeWidth="1" />
      <path d="M106 28.6 H194" stroke="#fff" strokeWidth="0.6" opacity="0.25" />
      <text x="150" y="37.5" textAnchor="middle" fontSize="5.4" fill="#efe6d2" fontFamily="Georgia, serif" letterSpacing="0.6">
        È PERICOLOSO SPORGERSI
      </text>
      {/* the table's shadow on the panelling below it */}
      <WallShade d="M56 250 H244 L236 266 H64 Z" opacity={0.5} />
      {/* table */}
      <rect x="52" y="238" width="196" height="12" rx="3" fill={C.walnutLine} stroke={C.ink} strokeWidth="1" />
      <path d="M54 239.5 H246" stroke="#a9c8ea" strokeWidth="0.8" opacity="0.4" />
      <path d="M52 241 H248" stroke="url(#nx-brass)" strokeWidth="0.8" opacity="0.7" />
      <path d="M54 248.5 H246" stroke="#000" strokeWidth="1.5" opacity="0.3" />
      {/* the things on the table sit in their own shadows */}
      <Shadow cx={116} cy={239} rx={40} ry={3} opacity={0.45} />
      <Shadow cx={200} cy={239} rx={20} ry={2.5} opacity={0.5} />
      {/* brass ashtray, and a curl of smoke from someone's forgotten cigarette */}
      <ellipse cx="236" cy="236" rx="9" ry="3" fill="url(#nx-brass)" stroke="#7a5f12" strokeWidth="0.6" />
      <path d="M232 233 l9 -2" stroke="#efe6d2" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="241" cy="231" r="0.9" fill="#d24b2a" />
      <circle cx="241" cy="231" r="4" fill="url(#at-candle)" className="at-flicker" />
      <path d="M241 229 q-3 -4 1 -8 q4 -4 0 -9 q-2 -3 1 -6" stroke="#cfd6dc" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" className="at-breathe" />
      <path d="M70 250 L96 290 M230 250 L204 290" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M71 250 L96 289 M229 250 L204 289" stroke="#fff2c2" strokeWidth="0.7" opacity="0.4" />
      {/* newspaper */}
      <g transform="rotate(-6 115 228)">
        <rect x="80" y="216" width="72" height="22" fill={C.cream} stroke="#b8ad92" />
        <rect x="84" y="219" width="40" height="4" fill="#3a3a3a" />
        <path d="M84 227 H148 M84 231 H140 M84 235 H146" stroke="#8a8170" strokeWidth="1" />
        <rect x="80" y="216" width="72" height="22" fill="url(#nx-window-cold)" />
        <path d="M116 216.5 V237.5" stroke="#8a8170" strokeWidth="0.8" opacity="0.35" />
      </g>
      {/* teacup */}
      <ellipse cx="199" cy="236" rx="18" ry="4" fill={C.cream} stroke="#b8ad92" />
      <path d="M187 222 H211 L207 235 H191 Z" fill={C.cream} stroke="#b8ad92" />
      <path d="M211 225 q7 1 2 8" fill="none" stroke="#b8ad92" strokeWidth="2" />
      <path d="M205 223.5 L202.5 233.5" stroke="#8a8170" strokeWidth="2" opacity="0.25" />
      <path d="M190 223.5 L192.5 233" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
      <path d="M182 236.5 Q199 240.5 216 236.5" stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.5" />
      {emptied ? (
        <g>
          <ellipse cx="199" cy="222" rx="12" ry="2.5" fill="#efe6d2" stroke="#b8ad92" />
          <path d="M193 222 q6 3 12 0" stroke="#5a3b20" strokeWidth="1" fill="none" />
          <ellipse cx="199" cy="236" rx="14" ry="2.5" fill="#6b4a2a" opacity="0.85" />
        </g>
      ) : (
        <g>
          <ellipse cx="199" cy="222" rx="12" ry="2.5" fill="#6b4a2a" />
          {/* the cold tea trembles with the rails */}
          <ellipse cx="199" cy="222" rx="7" ry="1.2" fill="none" stroke="#a07a52" strokeWidth="0.6" className="at-pulse" />
        </g>
      )}
      {/* heater grille, breathing warm dusty air */}
      <WallShade d="M80 336 H220 L214 350 H86 Z" opacity={0.45} />
      <rect x="78" y="296" width="144" height="42" rx="4" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <rect x="82" y="300" width="136" height="34" rx="2" fill="url(#nx-window-grille)" className="at-breathe" />
      <g stroke={C.brass} strokeWidth="1" opacity="0.7">
        {[88, 100, 112, 124, 136, 148, 160, 172, 184, 196, 208].map((x) => (
          <path key={x} d={`M${x} 302 V332`} />
        ))}
      </g>
      <path d="M86 300 Q150 292 214 300" stroke="url(#nx-brass)" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M80 297.5 H220" stroke="#fff2c2" strokeWidth="0.6" opacity="0.4" />
      <circle cx="232" cy="317" r="6" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M232 317 l3 -4" stroke={C.ink} strokeWidth="1.2" />
      <circle cx="230" cy="315" r="1.6" fill="#fff2c2" opacity="0.6" />
      <Dust x={92} y={274} w={116} h={20} count={4} color="#ffd9a8" seed={1221} />
      {/* cold window light spilling down the wall and across the carpet */}
      <path d="M66 218 H234 L284 400 H16 Z" fill="url(#nx-window-cold)" filter="url(#at-soft)" pointerEvents="none" />
      <ellipse cx="150" cy="380" rx="130" ry="16" fill="#9fc3e8" opacity="0.16" filter="url(#at-softer)" pointerEvents="none" />
      <Dust x={70} y={210} w={160} h={130} count={5} color="#d6e6f6" seed={1229} />
      <Finish />
    </Room>
  );
}

export function DoorWall({ flags }: { flags: string[] }) {
  const open = flags.includes("door.open");
  const panel = flags.includes("panel.open");
  const suitcaseOpen = flags.includes("suitcase.open");
  const searched = flags.includes("coat.searched");
  const lining = flags.includes("suitcase.lining");
  return (
    <Room>
      <defs>
        <linearGradient id="nx-door-coat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="nx-door-slab" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="nx-door-frost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#7d8f98" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="nx-door-corridor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* the ceiling lamp's warm wash down the middle of the wall */}
      <ellipse cx="150" cy="70" rx="110" ry="80" fill="#ffd98a" opacity="0.08" filter="url(#at-softer)" pointerEvents="none" />
      {/* luggage rack, and the shadow it throws */}
      <WallShade d="M14 46 H286 V60 H14 Z" opacity={0.35} />
      <path d="M14 46 H286" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M14 45 H286" stroke="#fff2c2" strokeWidth="0.6" opacity="0.5" />
      <path d="M14 34 H286" stroke="url(#nx-brass)" strokeWidth="1.5" opacity="0.7" />
      <g stroke={C.brass} strokeWidth="0.8" opacity="0.4">
        {Array.from({ length: 27 }, (_, i) => 20 + i * 10).map((x) => (
          <path key={x} d={`M${x} 34 l5 12`} />
        ))}
      </g>
      {/* someone's bowler hat, left on the rack */}
      <g>
        <ellipse cx="118" cy="46" rx="15" ry="2.5" fill="#000" opacity="0.5" filter="url(#at-soft)" />
        <path d="M107 43 Q106 29 118 28 Q130 29 129 43 Z" fill="#1f2125" stroke="#000" strokeWidth="0.6" />
        <path d="M107.5 40 H128.5 V43 H107.5 Z" fill="#3a2a1a" />
        <ellipse cx="118" cy="43.5" rx="16" ry="2.6" fill="#24262b" stroke="#000" strokeWidth="0.6" />
        <path d="M111 38 Q111 31 117 30" stroke="#8a93a0" strokeWidth="1" fill="none" opacity="0.5" />
      </g>
      {/* hatbox, striped and ribboned */}
      <g>
        <ellipse cx="48" cy="44" rx="24" ry="3" fill="#000" opacity="0.45" filter="url(#at-soft)" />
        <path d="M24 18 V40 Q48 48 72 40 V18 Z" fill="#f3d6dc" stroke={C.ink} strokeWidth="0.8" />
        <g stroke="#d98a9a" strokeWidth="4">
          {[30, 40, 50, 60, 68].map((x) => (
            <path key={x} d={`M${x} 20 V${42 + (x > 44 && x < 56 ? 3 : 1)}`} />
          ))}
        </g>
        <path d="M24 18 V40 Q48 48 72 40 V18 Z" fill="url(#nx-door-coat)" />
        <ellipse cx="48" cy="18" rx="24" ry="6" fill="#f7e4e8" stroke={C.ink} strokeWidth="0.8" />
        <path d="M30 16 Q46 12 62 15" stroke="#fff" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M48 12 V48" stroke="#7a2d4a" strokeWidth="2" />
        <path d="M48 12 q-8 -8 -12 -2 q4 4 12 2 q8 -8 12 -2 q-4 4 -12 2" fill="#7a2d4a" />
      </g>
      {/* suitcase */}
      <ellipse cx="220" cy="46" rx="52" ry="3" fill="#000" opacity="0.5" filter="url(#at-soft)" />
      {suitcaseOpen ? (
        <g>
          <path d="M172 20 L182 -2 H262 L270 20 Z" fill="#8a5a33" stroke={C.ink} />
          <rect x="170" y="20" width="98" height="24" rx="3" fill="#7b4f2c" stroke={C.ink} />
          <rect x="178" y="22" width="40" height="10" rx="2" fill="#c98b9a" />
          <rect x="222" y="22" width="34" height="9" rx="2" fill="#5a3b20" stroke={C.brass} strokeWidth="0.8" />
          {lining && <rect x="146" y="20" width="22" height="26" rx="2" fill="#6a4426" stroke={C.ink} transform="rotate(-12 157 33)" />}
          <path d="M172 21 H266" stroke="#000" strokeWidth="1.5" opacity="0.35" />
        </g>
      ) : (
        <g>
          <rect x="170" y="10" width="98" height="34" rx="4" fill="#7b4f2c" stroke={C.ink} />
          <rect x="170" y="10" width="98" height="34" rx="4" fill="url(#nx-door-slab)" />
          <path d="M173 12.5 H265" stroke="#c98b5a" strokeWidth="0.8" opacity="0.6" />
          <path d="M170 18 H268" stroke="#5a3b20" strokeWidth="2" />
          <path d="M174 21 H264 M174 41 H264" stroke="#c9a27a" strokeWidth="0.5" strokeDasharray="1.5 1.5" opacity="0.5" />
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
      {/* coat: its shadow on the panelling stays put while the coat itself sways on the hook */}
      <WallShade d="M60 100 C76 110 86 124 88 140 L92 306 H40 Z" opacity={0.5} />
      <circle cx="52" cy="94" r="4" fill="url(#nx-brass)" />
      <circle cx="51" cy="93" r="1.2" fill="#fff2c2" opacity="0.8" />
      <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDuration: "7s" }}>
        <path
          d="M52 96 C38 100 30 112 28 130 L24 300 H82 L78 130 C76 112 66 100 52 96 Z"
          fill="#3b4440"
          stroke={C.ink}
          strokeWidth="1"
        />
        <path d="M52 96 C38 100 30 112 28 130 L24 300 H82 L78 130 C76 112 66 100 52 96 Z" fill="url(#nx-door-coat)" />
        {/* heavy wool folds */}
        <path d="M34 160 Q32 230 30 296 M70 170 Q73 236 76 296 M44 236 Q42 270 40 298" stroke="#2a312e" strokeWidth="1.4" fill="none" opacity="0.8" />
        <path d="M36 160 Q34 230 32 296" stroke="#5a6560" strokeWidth="1" fill="none" opacity="0.5" />
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
        <path d="M24 300 H82" stroke="#1b120b" strokeWidth="1.5" opacity="0.6" />
      </g>
      {/* the safety card, framed */}
      <WallShade d="M228 98 H284 V168 H228 Z" opacity={0.5} />
      <rect x="226" y="94" width="54" height="68" rx="2" fill={C.walnutDark} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <rect x="231" y="99" width="44" height="58" fill={C.cream} />
      <rect x="231" y="99" width="44" height="9" fill="#a3302a" />
      <path d="M236 103.5 H270" stroke="#efe6d2" strokeWidth="1.5" />
      <g stroke="#8a8170" strokeWidth="0.8">
        {[114, 120, 126, 132, 138, 144, 150].map((y) => (
          <path key={y} d={`M235 ${y} H${262 + (y % 4) * 2}`} />
        ))}
      </g>
      <path d="M262 99 h8 L245 157 h-5 Z" fill="#fff" opacity="0.12" pointerEvents="none" />
      {/* your umbrella, dripping */}
      <ellipse cx="248" cy="354" rx="18" ry="3" fill="#2a3b55" opacity="0.6" />
      <ellipse cx="248" cy="354" rx="9" ry="1.5" fill="none" stroke="#9fb6d4" strokeWidth="0.5" className="at-pulse" />
      <ellipse cx="248" cy="363" rx="16" ry="3" fill="#2a3b55" opacity="0.35" filter="url(#at-soft)" />
      <WallShade d="M240 268 L262 276 L266 340 Q252 350 240 342 Z" opacity={0.4} />
      <path d="M246 262 V340" stroke="#1b120b" strokeWidth="2" />
      <path d="M246 262 q-8 -6 -2 -12 q6 -2 6 4" stroke="#c9a227" strokeWidth="2.5" fill="none" />
      <path d="M241 254 q2 -3 5 -3" stroke="#fff2c2" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M238 276 L246 270 L254 276 L258 336 Q246 346 234 336 Z" fill="#1d1f24" stroke="#000" strokeWidth="0.8" />
      <path d="M246 272 L244 338 M250 274 L254 336" stroke="#33363d" strokeWidth="0.8" />
      <path d="M240 278 L237 334" stroke="#6b7480" strokeWidth="1" opacity="0.5" />
      <path d="M240 340 l0 5 M252 341 l0 6" stroke="#9fb6d4" strokeWidth="1" strokeLinecap="round" />
      <circle cx="240" cy="346" r="0.9" fill="#b9d0dc" className="at-rain" style={{ ["--fall" as string]: "8px", animationDuration: "1.8s" }} />
      <circle cx="252" cy="348" r="0.9" fill="#b9d0dc" className="at-rain" style={{ ["--fall" as string]: "6px", animationDuration: "2.3s", animationDelay: "-1s" }} />
      {/* the door's architrave and the shadow of its recess */}
      <WallShade d="M98 66 H218 V360 H98 Z" opacity={0.45} />
      <rect x="99" y="67" width="118" height="291" rx="3" fill="none" stroke={C.walnutLine} strokeWidth="2.5" />
      <path d="M100 68 H216" stroke="#fff2c2" strokeWidth="0.6" opacity="0.25" />
      {/* door */}
      {open ? (
        <g>
          <rect x="104" y="72" width="108" height="286" fill="#120c07" />
          {/* the dark corridor: a far window of rain-light and the runner leading away */}
          <rect x="138" y="150" width="40" height="80" fill="#1a1410" />
          <rect x="146" y="166" width="24" height="30" rx="3" fill="#2a3b55" opacity="0.6" />
          <path d="M104 120 L138 150 M212 120 L178 150 M104 300 L138 230 M212 300 L178 230" stroke="#2a1d12" strokeWidth="1" />
          <rect x="104" y="72" width="108" height="286" fill="url(#nx-glow)" opacity="0.5" />
          <path d="M120 358 L150 210 L166 210 L196 358 Z" fill="#3a1416" opacity="0.8" />
          <rect x="104" y="72" width="108" height="286" fill="url(#nx-door-corridor)" />
          <rect x="184" y="72" width="30" height="286" fill={C.walnutDark} stroke={C.ink} />
          <rect x="184" y="72" width="30" height="286" fill="url(#nx-door-slab)" />
        </g>
      ) : (
        <g>
          <rect x="104" y="72" width="108" height="286" rx="3" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
          <rect x="104" y="72" width="108" height="286" rx="3" fill="url(#nx-grain)" opacity="0.8" />
          <rect x="104" y="72" width="108" height="286" rx="3" fill="url(#nx-door-slab)" />
          <rect x="118" y="88" width="80" height="96" rx="8" fill="#cfd8d6" opacity="0.85" stroke="url(#nx-brass)" strokeWidth="2" />
          <rect x="120" y="90" width="76" height="92" rx="7" fill="url(#nx-door-frost)" />
          {/* etched nightingale */}
          <path
            d="M140 150 q10 -16 26 -12 q8 -8 16 -4 l-8 4 q2 10 -10 16 q-12 6 -24 -4 z M160 154 l-6 14 M166 152 l2 14"
            fill="none"
            stroke="#9fb0ae"
            strokeWidth="1.3"
          />
          <path d="M126 92 h14 L124 150 V110 Z" fill="#fff" opacity="0.18" pointerEvents="none" />
          <rect x="118" y="200" width="80" height="140" rx="4" fill="none" stroke={C.walnutLine} />
          <rect x="119" y="201" width="80" height="140" rx="4" fill="none" stroke="#000" opacity="0.35" />
          <rect x="190" y="218" width="8" height="26" rx="3" fill="url(#nx-brass)" />
          <path d="M191.5 221 V240" stroke="#fff2c2" strokeWidth="1" opacity="0.7" />
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
          <path d="M110 343.5 H206" stroke="#fff2c2" strokeWidth="0.7" opacity="0.5" />
        </g>
      )}
      {/* where the door meets the carpet */}
      <ellipse cx="158" cy="360" rx="62" ry="5" fill="#000" opacity="0.5" filter="url(#at-soft)" pointerEvents="none" />
      <Dust x={70} y={30} w={170} h={100} count={6} seed={1237} />
      <Finish />
    </Room>
  );
}

export function BerthWall({ flags, pouchHere }: { flags: string[]; pouchHere: boolean }) {
  const lampOn = flags.includes("lamp.on");
  const lifted = flags.includes("pillow.lifted");
  return (
    <Room>
      <defs>
        <linearGradient id="nx-berths-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb89a" stopOpacity="0.28" />
          <stop offset="0.4" stopColor="#7fb89a" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="nx-berths-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="nx-berths-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nx-berths-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#5a7484" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* the ceiling lamp's wash, and (when it's on) the reading lamp's warm pool */}
      <ellipse cx="140" cy="60" rx="120" ry="60" fill="#ffd98a" opacity="0.07" filter="url(#at-softer)" pointerEvents="none" />
      {lampOn && <circle cx="236" cy="190" r="70" fill="url(#nx-glow)" />}
      {lampOn && <LightPool cx={240} cy={184} r={84} opacity={0.75} flicker />}
      {/* the upper berth's shadow on the panelling below */}
      <WallShade d="M18 136 H250 V152 H18 Z" opacity={0.55} />
      {/* upper berth */}
      <rect x="18" y="84" width="232" height="54" rx="4" fill="url(#nx-velvet)" stroke={C.ink} />
      <rect x="18" y="84" width="232" height="54" rx="4" fill="url(#nx-berths-sheen)" />
      <rect x="22" y="78" width="224" height="10" rx="3" fill={C.cream} />
      <path d="M24 87.5 H244" stroke="#b8ad92" strokeWidth="1" opacity="0.7" />
      <path d="M18 106 H250" stroke="url(#nx-brass)" strokeWidth="2.5" />
      <path d="M18 105 H250" stroke="#fff2c2" strokeWidth="0.6" opacity="0.5" />
      <path d="M40 92 Q90 98 140 92 T240 94" stroke="#173328" strokeWidth="1" fill="none" opacity="0.6" />
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
      {/* curtain rail with a gathered privacy curtain, stirring with the train */}
      <path d="M18 66 H252" stroke="url(#nx-brass)" strokeWidth="2" />
      <path d="M18 65.2 H252" stroke="#fff2c2" strokeWidth="0.5" opacity="0.5" />
      <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDuration: "6.5s" }}>
        <path d="M20 66 q4 6 8 0 q4 6 8 0 q4 6 8 0 V82 H20 Z" fill="#7a2d2d" opacity="0.9" />
        <path d="M24 68 V82 M32 68 V82 M40 68 V82" stroke="#4a1616" strokeWidth="1" opacity="0.6" />
      </g>
      {/* a painting of a mountain lake */}
      <WallShade d="M58 156 H164 V214 H58 Z" opacity={0.5} />
      <rect x="54" y="150" width="104" height="56" rx="2" fill="url(#nx-brass)" stroke="#7a5f12" />
      <path d="M55.5 151.5 H156.5" stroke="#fff2c2" strokeWidth="0.8" opacity="0.6" />
      <rect x="60" y="156" width="92" height="44" fill="#e9c98e" />
      <path d="M60 182 L84 164 L98 176 L118 158 L140 178 L152 170 V186 H60 Z" fill="#6f8aa6" />
      <path d="M118 158 L112 164 L118 162 L124 166 Z" fill="#f4f1ea" />
      <rect x="60" y="186" width="92" height="14" fill="#4c7393" />
      <path d="M66 192 H96 M108 195 H140" stroke="#f4dba0" strokeWidth="0.8" opacity="0.8" />
      <circle cx="132" cy="166" r="5" fill="#f6b56b" opacity="0.8" />
      <rect x="60" y="156" width="92" height="44" fill="none" stroke="#000" strokeWidth="1.2" opacity="0.35" />
      <path d="M128 156 h8 L118 200 h-5 Z" fill="#fff" opacity="0.1" pointerEvents="none" />
      {/* the water carafe in its brass ring */}
      <WallShade d="M178 164 h12 v8 q10 6 10 22 h-24 Z M184 198 h10 v12 h-10 Z" opacity={0.4} />
      <path d="M174 192 H204" stroke="url(#nx-brass)" strokeWidth="2.5" />
      <path d="M182 160 h10 v8 q10 6 10 22 h-30 q0 -16 10 -22 z" fill="#cfe0ea" opacity="0.75" stroke="#9fb0ba" strokeWidth="0.8" />
      <path d="M174.5 180 h25 q2 4 2 10 h-29 q0 -6 2 -10 z" fill="#8fb3c8" opacity="0.4" />
      <path d="M182 160 h10 v8 q10 6 10 22 h-30 q0 -16 10 -22 z" fill="url(#nx-berths-glass)" />
      <path d="M176 172 h22 v4 h-22 z" fill="url(#nx-brass)" opacity="0.6" />
      <path d="M177 180 Q175 184 175.5 188" stroke="#fff" strokeWidth="1" fill="none" opacity="0.7" />
      <rect x="182" y="196" width="10" height="12" rx="1" fill="#cfe0ea" opacity="0.7" stroke="#9fb0ba" strokeWidth="0.6" />
      {/* the tumbler's water trembles with the rails */}
      <ellipse cx="187" cy="201" rx="4" ry="0.8" fill="none" stroke="#fff" strokeWidth="0.5" className="at-pulse" />
      <path d="M183.5 198 V206" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
      {/* ladder */}
      <g stroke="#000" strokeWidth="2.5" opacity="0.3" filter="url(#at-soft)">
        <path d="M262 74 V294 M286 74 V294" />
      </g>
      <g stroke="url(#nx-brass)" strokeWidth="2.5">
        <path d="M258 70 V290 M282 70 V290" />
        {[96, 132, 168, 204, 240, 276].map((y) => (
          <path key={y} d={`M258 ${y} H282`} />
        ))}
      </g>
      <path d="M257.3 72 V288 M281.3 72 V288" stroke="#fff2c2" strokeWidth="0.6" opacity="0.5" />
      {/* lamp */}
      <path d="M232 204 V186 L244 176" stroke="url(#nx-brass)" strokeWidth="3" fill="none" />
      {lampOn && <path d="M238 176 H250 L282 292 H176 Z" fill="url(#nx-berths-cone)" filter="url(#at-soft)" pointerEvents="none" />}
      {lampOn && <ellipse cx="244" cy="177" rx="7" ry="3" fill="#fff6d8" opacity="0.9" filter="url(#at-soft)" />}
      <path d="M232 160 Q244 154 256 160 L250 176 H238 Z" fill={lampOn ? "#5fae7a" : "#2f6b47"} stroke="url(#nx-brass)" strokeWidth="1.5" />
      <path d="M236 161 Q240 158 244 157.5" stroke="#fff" strokeWidth="1" fill="none" opacity={lampOn ? 0.7 : 0.35} />
      <rect x="226" y="202" width="14" height="6" rx="2" fill="url(#nx-brass)" />
      {/* the lamp's pull chain, swinging */}
      <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDuration: "4.5s" }}>
        <path d="M251 172 V188" stroke={C.brass} strokeWidth="0.8" strokeDasharray="1 0.8" />
        <circle cx="251" cy="190" r="1.8" fill="url(#nx-brass)" />
      </g>
      {/* lower berth */}
      <rect x="18" y="232" width="232" height="58" rx="4" fill="url(#nx-velvet)" stroke={C.ink} />
      <path d="M110 236 Q180 230 248 238 V288 H110 Z" fill="#3b6f59" opacity="0.8" />
      <rect x="18" y="232" width="232" height="58" rx="4" fill="url(#nx-berths-sheen)" />
      <path d="M112 238 Q180 232 246 240" stroke="#8fc4a8" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M150 250 Q190 246 230 254 M130 270 Q180 264 240 272" stroke="#1f4033" strokeWidth="1" fill="none" opacity="0.6" />
      {lampOn && <ellipse cx="226" cy="252" rx="40" ry="14" fill="#ffe9a8" opacity="0.18" filter="url(#at-soft)" />}
      {/* pillow */}
      <Shadow cx={68} cy={246} rx={38} ry={4} opacity={0.5} />
      <g transform={lifted ? "translate(4 -10) rotate(-8 64 232)" : undefined}>
        <rect x="28" y="222" width="76" height="24" rx="10" fill={C.cream} stroke="#b8ad92" />
        <path d="M40 232 Q66 226 92 232" stroke="#d8cdb4" fill="none" />
        <path d="M34 240 Q66 246 98 240" stroke="#b8ad92" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M36 226 Q50 223 64 224" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.6" />
      </g>
      {lifted && <rect x="44" y="238" width="22" height="7" rx="2" fill="#f7f2e4" stroke="#b8ad92" />}
      {/* under the berth: deep shadow, a velvet valance */}
      <rect x="18" y="292" width="232" height="56" fill="#0d0905" />
      <rect x="18" y="292" width="232" height="56" fill="url(#nx-berths-under)" />
      <path d="M18 292 H250" stroke="url(#nx-brass)" strokeWidth="2" />
      <path d="M18 294 Q24 300 30 294 T42 294 T54 294 T66 294 T78 294 T90 294 T102 294 T114 294 T126 294 T138 294 T150 294 T162 294 T174 294 T186 294 T198 294 T210 294 T222 294 T234 294 T246 294 L250 294 V293 H18 Z" fill="#1f4033" opacity="0.9" />
      {pouchHere && (
        <g>
          <path d="M140 330 q-6 -14 6 -18 q12 -2 14 8 q4 12 -8 14 z" fill="#22336e" />
          <path d="M146 312 q6 -6 12 2" stroke={C.brass} strokeWidth="1.5" fill="none" />
          <path d="M143 322 q2 -6 6 -8" stroke="#4a5fa0" strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      )}
      <circle cx="210" cy="338" r="2" fill="#4a3a2a" />
      <rect x="22" y="334" width="224" height="12" fill={C.carpet} opacity="0.4" filter="url(#at-soft)" />
      <Dust x={30} y={304} w={200} h={36} count={3} color="#8a7a5e" seed={1249} />
      {/* the berth's shadow on the carpet */}
      <rect x="10" y="356" width="250" height="10" fill="#000" opacity="0.4" filter="url(#at-soft)" pointerEvents="none" />
      {/* slippers on the carpet */}
      <Shadow cx={58} cy={375} rx={14} ry={2.5} opacity={0.6} />
      <Shadow cx={88} cy={381} rx={14} ry={2.5} opacity={0.6} />
      <path d="M44 372 q0 -8 12 -8 h8 q6 0 6 5 q0 5 -6 5 h-14 q-6 0 -6 -2 z" fill="#2f5d4a" stroke={C.ink} strokeWidth="0.6" />
      <path d="M74 378 q0 -8 12 -8 h8 q6 0 6 5 q0 5 -6 5 h-14 q-6 0 -6 -2 z" fill="#2f5d4a" stroke={C.ink} strokeWidth="0.6" />
      <path d="M48 368 q4 -3 10 -3 M78 374 q4 -3 10 -3" stroke="#7fb89a" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M60 366 q4 2 4 7 M90 372 q4 2 4 7" stroke={C.brass} strokeWidth="0.7" fill="none" opacity="0.6" />
      {lampOn ? <Dust x={196} y={170} w={70} h={110} count={10} color="#fff1c9" seed={1259} /> : <Dust x={60} y={40} w={160} h={90} count={6} seed={1259} />}
      <Finish />
    </Room>
  );
}

export function WashstandWall({ flags, mirrorLetters }: { flags: string[]; mirrorLetters: string | null }) {
  const open = flags.includes("washstand.open");
  const hot = flags.includes("tap.hot");
  const vent = flags.includes("vent.open");
  return (
    <Room>
      <defs>
        <clipPath id="nx-washstand-glass">
          <ellipse cx="150" cy="124" rx="46" ry="60" />
        </clipPath>
        <linearGradient id="nx-washstand-tiles" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="nx-washstand-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <radialGradient id="nx-washstand-basin" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#6a7a84" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {/* the ceiling lamp's warm wash over the mirror */}
      <ellipse cx="150" cy="90" rx="110" ry="90" fill="#ffd98a" opacity="0.08" filter="url(#at-softer)" pointerEvents="none" />
      {/* vent */}
      <WallShade d="M130 36 H170 V44 H130 Z" opacity={0.4} />
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
          <path d="M132 23.5 H168" stroke="#fff2c2" strokeWidth="0.7" opacity="0.6" />
        </g>
      )}
      {/* tiled splashback */}
      <rect x="90" y="54" width="120" height="160" rx="4" fill="#d9e2dc" opacity="0.18" />
      <rect x="90" y="54" width="120" height="160" rx="4" fill="url(#nx-washstand-tiles)" />
      <g stroke="#d9e2dc" strokeWidth="0.6" opacity="0.25">
        {[74, 94, 114, 134, 154, 174, 194].map((y) => (
          <path key={y} d={`M90 ${y} H210`} />
        ))}
        {[110, 130, 150, 170, 190].map((x) => (
          <path key={x} d={`M${x} 54 V214`} />
        ))}
      </g>
      {/* mirror, with a stepped Deco crest */}
      <WallShade d="M104 70 Q104 190 154 192 Q204 190 202 70 Q154 58 104 70 Z" opacity={0.45} />
      <path d="M130 58 L136 50 H164 L170 58 Z" fill="url(#nx-brass)" />
      <path d="M144 50 L150 44 L156 50 Z" fill="url(#nx-brass)" />
      <path d="M137 51.2 H163" stroke="#fff2c2" strokeWidth="0.7" opacity="0.6" />
      <ellipse cx="150" cy="124" rx="48" ry="62" fill="url(#nx-glass)" stroke="url(#nx-brass)" strokeWidth="5" />
      {/* what the glass holds: the dim compartment behind you, a lamp's glow, the window's cold blue */}
      <g clipPath="url(#nx-washstand-glass)">
        <rect x="96" y="152" width="108" height="40" fill="#3d2615" opacity="0.3" filter="url(#at-soft)" />
        <rect x="166" y="72" width="26" height="34" rx="6" fill="#1d2c42" opacity="0.35" filter="url(#at-soft)" />
        <ellipse cx="124" cy="96" rx="16" ry="12" fill="#ffe9a8" opacity="0.3" filter="url(#at-soft)" />
        <path d="M100 66 L200 66 L120 190 H100 Z" fill="#fff" opacity="0.06" />
      </g>
      <ellipse cx="150" cy="124" rx="45.5" ry="59.5" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
      <ellipse cx="150" cy="124" rx="50.5" ry="64.5" fill="none" stroke="#fff2c2" strokeWidth="0.6" opacity="0.4" />
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
      {/* washstand: shadow on the panelling below the cabinet */}
      <WallShade d="M96 336 H204 L198 352 H102 Z" opacity={0.5} />
      {open ? (
        <g>
          <rect x="94" y="214" width="112" height="40" rx="4" fill={C.walnutLine} stroke={C.ink} />
          <rect x="94" y="214" width="112" height="40" rx="4" fill="url(#nx-washstand-wood)" />
          <ellipse cx="150" cy="232" rx="40" ry="12" fill="#f6f2ea" stroke="#b8ad92" />
          <ellipse cx="150" cy="232" rx="40" ry="12" fill="url(#nx-washstand-basin)" />
          <ellipse cx="150" cy="234" rx="30" ry="7" fill="#d9e2e6" />
          <path d="M132 233 Q150 230 168 233" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.7" className={hot ? "at-pulse" : undefined} />
          <circle cx="120" cy="218" r="4" fill="#b8423a" stroke="url(#nx-brass)" />
          <circle cx="180" cy="218" r="4" fill="#3a6fb8" stroke="url(#nx-brass)" />
          <circle cx="119" cy="217" r="1.1" fill="#fff" opacity="0.6" />
          <circle cx="179" cy="217" r="1.1" fill="#fff" opacity="0.6" />
          <path d="M150 210 V220 q0 4 4 4" stroke="url(#nx-brass)" strokeWidth="3" fill="none" />
          {hot && (
            <g className="nx-steam" stroke="#f4f6f7" strokeWidth="2.5" fill="none" opacity="0.7">
              <path d="M140 222 q-6 -12 2 -22 q6 -10 -2 -20" />
              <path d="M158 222 q6 -12 -2 -22 q-6 -10 2 -20" />
              <path d="M154 226 V234" stroke="#cfe0ea" />
            </g>
          )}
          {hot && <ellipse cx="150" cy="200" rx="44" ry="26" fill="#f4f6f7" opacity="0.18" filter="url(#at-softer)" />}
          <rect x="94" y="254" width="112" height="84" rx="4" fill={C.walnutDark} stroke={C.ink} />
          <rect x="94" y="254" width="112" height="84" rx="4" fill="url(#nx-washstand-wood)" />
          <path d="M96 255.5 H204" stroke="#fff2c2" strokeWidth="0.6" opacity="0.3" />
        </g>
      ) : (
        <g>
          <rect x="94" y="214" width="112" height="124" rx="4" fill={C.walnutDark} stroke={C.ink} strokeWidth="1.5" />
          <rect x="94" y="214" width="112" height="124" rx="4" fill="url(#nx-grain)" opacity="0.8" />
          <rect x="94" y="214" width="112" height="124" rx="4" fill="url(#nx-washstand-wood)" />
          <path d="M96 215.5 H204" stroke="#fff2c2" strokeWidth="0.6" opacity="0.35" />
          <rect x="104" y="224" width="92" height="104" rx="3" fill="none" stroke={C.walnutLine} />
          <rect x="105" y="225" width="92" height="104" rx="3" fill="none" stroke="#000" opacity="0.35" />
          <circle cx="150" cy="248" r="5" fill="url(#nx-brass)" />
          <path d="M150 246 V252" stroke={C.ink} strokeWidth="1.5" />
          <circle cx="148.4" cy="246.4" r="1.2" fill="#fff2c2" opacity="0.7" />
        </g>
      )}
      {/* glass shelf: cologne, tooth powder, shaving brush */}
      <WallShade d="M22 170 H90 L86 180 H26 Z" opacity={0.4} />
      <WallShade d="M34 140 h16 v28 h-16 Z M56 152 h14 v16 h-14 Z" opacity={0.35} />
      <path d="M20 168 H88" stroke="#cfe0ea" strokeWidth="3" opacity="0.8" />
      <path d="M20 167 H88" stroke="#fff" strokeWidth="0.6" opacity="0.8" />
      <path d="M24 168 v10 l6 -10 M84 168 v10 l-6 -10" stroke="url(#nx-brass)" strokeWidth="1.5" fill="none" />
      <path d="M30 166 V140 q0 -6 6 -6 h6 q6 0 6 6 V166 Z" fill="#c98b3a" opacity="0.8" stroke="#7a5f12" strokeWidth="0.6" />
      <path d="M32.5 142 V163" stroke="#ffe0a8" strokeWidth="1.2" opacity="0.6" />
      <path d="M45 142 V164" stroke="#5a3a10" strokeWidth="1.5" opacity="0.35" />
      <rect x="35" y="126" width="8" height="8" rx="1" fill="url(#nx-brass)" />
      <rect x="54" y="150" width="14" height="16" rx="2" fill="#e8e0cc" stroke="#9a8f78" strokeWidth="0.6" />
      <path d="M54 156 H68" stroke="#a3302a" strokeWidth="2" />
      <path d="M56 152 V164" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
      <rect x="74" y="148" width="6" height="18" rx="1" fill="#5b3a22" />
      <path d="M72 148 q5 -12 10 0 z" fill="#efe6d2" stroke="#b8ad92" strokeWidth="0.6" />
      {/* enamel sign */}
      <WallShade d="M22 234 H86 V264 H22 Z" opacity={0.45} />
      <rect x="20" y="230" width="62" height="30" rx="3" fill="#efe6d2" stroke="#1d3554" strokeWidth="2" />
      <path d="M23 232.6 H79" stroke="#fff" strokeWidth="0.8" opacity="0.7" />
      <text x="51" y="242" textAnchor="middle" fontSize="5" fill="#1d3554" fontFamily="Georgia, serif" fontWeight="bold">
        EAU NON
      </text>
      <text x="51" y="250" textAnchor="middle" fontSize="5" fill="#1d3554" fontFamily="Georgia, serif" fontWeight="bold">
        POTABLE
      </text>
      <path d="M34 254 H68" stroke="#a3302a" strokeWidth="1" />
      <path d="M79 258 q2 -1 2 -3 v4 z" fill="#2a1d12" opacity="0.7" />
      {/* soap dish beside the basin */}
      <path d="M200 206 h14 l-2 6 h-10 z" fill="url(#nx-brass)" />
      <ellipse cx="207" cy="205" rx="5" ry="2.5" fill="#f4e9d8" />
      <ellipse cx="205.5" cy="204.2" rx="2" ry="0.8" fill="#fff" opacity="0.8" />
      {/* a leather razor strop on its hook, swaying with the train */}
      <circle cx="244" cy="116" r="2.2" fill="url(#nx-brass)" />
      <WallShade d="M242 122 h10 v74 h-10 Z" opacity={0.4} />
      <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDuration: "6.8s" }}>
        <path d="M244 118 L240 126 H248 Z" fill="none" stroke={C.brass} strokeWidth="1" />
        <rect x="239" y="126" width="10" height="66" rx="2" fill="#6b3f1f" stroke={C.ink} strokeWidth="0.6" />
        <path d="M241 128 V190" stroke="#a8703a" strokeWidth="1" opacity="0.5" />
        <rect x="239" y="186" width="10" height="6" rx="1.5" fill="url(#nx-brass)" opacity="0.8" />
      </g>
      {/* towel */}
      <path d="M222 228 H280" stroke="url(#nx-brass)" strokeWidth="3" />
      <path d="M222 227 H280" stroke="#fff2c2" strokeWidth="0.6" opacity="0.6" />
      <WallShade d="M234 232 H276 V304 H234 Z" opacity={0.45} />
      <g className="at-sway" style={{ transformOrigin: "50% 0%", animationDuration: "8s" }}>
        <path d="M230 228 H272 V300 H230 Z" fill={C.cream} stroke="#b8ad92" />
        <path d="M230 288 H272" stroke="#2f5d4a" strokeWidth="3" />
        <path d="M244 260 q6 -6 12 -2 q4 -4 8 -2 l-4 2 q0 6 -6 8 q-6 2 -10 -6 z" fill="none" stroke="#2f5d4a" strokeWidth="1" />
        {/* starched folds */}
        <path d="M238 230 Q236 262 239 298 M266 230 Q268 262 265 298" stroke="#b8ad92" strokeWidth="1.2" fill="none" opacity="0.6" />
        <path d="M232 230 V298" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
        <path d="M230 229 H272 V236 H230 Z" fill="#000" opacity="0.08" />
      </g>
      <Dust x={96} y={60} w={110} h={140} count={hot ? 4 : 8} seed={1277} />
      <Finish />
    </Room>
  );
}
