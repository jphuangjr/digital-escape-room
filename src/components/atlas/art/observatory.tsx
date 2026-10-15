import { BRASS, BRASS_DK, BRASS_HI, Backdrop, Candle, Dust, FloorShade, GLYPH, Glint, Grain, LightPool, LightShaft, Mottle, Rain, RING_ORDER, Shadow, Vignette, seeded, type WallState } from "./common";
// ---------------------------------------------------------------- the Observatory

/** The round room's walls: dressed stone curving away at both edges, damp in the joints. */
function RoundRoom({ floorY = 330 }: { floorY?: number }) {
  return (
    <>
      <Backdrop wall={["#26343f", "#121b22"]} floor="#2a2118" pattern="at-stone" floorY={floorY} />
      <Mottle h={floorY} opacity={0.4} />
      {/* the wall curves away: darker toward both edges */}
      <rect width="46" height={floorY} fill="#000" opacity="0.35" filter="url(#at-softer)" />
      <rect x="254" width="46" height={floorY} fill="#000" opacity="0.35" filter="url(#at-softer)" />
      {/* a brass rail running round the room at waist height */}
      <path d={`M0 ${floorY - 64} Q150 ${floorY - 74} 300 ${floorY - 64}`} stroke={BRASS_DK} strokeWidth="3" fill="none" opacity="0.8" />
      <path d={`M0 ${floorY - 66} Q150 ${floorY - 76} 300 ${floorY - 66}`} stroke={BRASS_HI} strokeWidth="0.8" fill="none" opacity="0.35" />
      {/* flagstones in perspective, and the Cartographers' compass rose set in the floor */}
      <g stroke="#000" strokeOpacity="0.35" strokeWidth="1">
        {[-260, -140, -40, 50, 150, 250, 340, 460].map((x) => (
          <path key={x} d={`M${150 + (x - 150) * 0.42} ${floorY} L${x} 400`} />
        ))}
        <path d={`M0 ${floorY + 22} H300 M0 ${floorY + 48} H300`} />
      </g>
      <FloorShade floorY={floorY} />
    </>
  );
}

export function Telescope() {
  return (
    <>
      <RoundRoom />
      {/* the dome: brass ribs meeting overhead, and the slit open on a sky with no stars */}
      <g fill="none" stroke={BRASS_DK} strokeWidth="5" opacity="0.9">
        <path d="M-20 120 Q40 20 150 -6" />
        <path d="M320 120 Q260 20 150 -6" />
      </g>
      <path d="M156 0 H262 L246 66 H170 Z" fill="url(#at-night)" />
      <path d="M176 22 q20 -6 44 2 q12 4 26 0" stroke="#2c3a46" strokeWidth="6" fill="none" opacity="0.6" filter="url(#at-soft)" />
      <path d="M156 0 L170 66 M262 0 L246 66" stroke="#0a0f14" strokeWidth="4" />
      <path d="M166 66 H250" stroke={BRASS_DK} strokeWidth="4" />
      {/* cold light falling from the slit, dust turning in it */}
      <LightShaft x1={176} x2={240} spread={-50} y1={66} y2={330} opacity={0.55} dust={12} seed={11} />

      {/* the arched window: stone surround, deep sill, rain on the glass, a sea that does not move */}
      <defs>
        <clipPath id="at-tel-glass">
          <path d="M28 234 V124 Q60 80 92 124 V234 Z" />
        </clipPath>
      </defs>
      <path d="M14 248 V118 Q60 54 106 118 V248 Z" fill="#3a4651" />
      <path d="M14 248 V118 Q60 54 106 118 V248" fill="none" stroke="#1a2229" strokeWidth="2" />
      <path d="M54 62 L66 62 L68 78 L52 78 Z" fill="#4a5864" stroke="#1a2229" />
      <g clipPath="url(#at-tel-glass)">
        <rect x="20" y="70" width="80" height="170" fill="url(#at-night)" />
        {/* a grey, starless sky over a mirror-flat sea */}
        <rect x="20" y="150" width="80" height="90" fill="#33454f" />
        <path d="M20 186 H100" stroke="#8fa9b4" strokeWidth="1" opacity="0.7" />
        <rect x="20" y="187" width="80" height="50" fill="#2a3a43" />
        <path d="M30 196 H90 M36 206 H84 M42 218 H78" stroke="#8fa9b4" strokeWidth="0.6" opacity="0.25" />
        <Rain x={24} y={84} w={72} h={150} count={18} seed={21} />
        <rect x="20" y="70" width="80" height="170" fill="#cfe3ea" opacity="0.05" />
      </g>
      {/* lead and brass glazing bars */}
      <path d="M60 82 V234 M28 172 H92 M28 128 H92" stroke={BRASS_DK} strokeWidth="2.5" />
      <path d="M28 234 V124 Q60 80 92 124 V234 Z" fill="none" stroke={BRASS_DK} strokeWidth="3.5" />
      {/* the sill, with a cold puddle of window light below it */}
      <path d="M10 236 H110 L116 248 H4 Z" fill="#4c5a66" stroke="#1a2229" />
      <ellipse cx="66" cy="352" rx="58" ry="10" fill="#9fc3d0" opacity="0.08" filter="url(#at-soft)" />

      {/* the telescope: long brass tube, finder scope and eyepiece on an equatorial mount */}
      <Shadow cx={196} cy={334} rx={70} ry={10} opacity={0.6} />
      <g filter="url(#at-drop)">
        {/* the tripod: oak legs, brass shoes */}
        <path d="M196 238 L150 330 M196 238 L242 330 M196 238 L198 334" stroke="#3a2614" strokeWidth="7" strokeLinecap="round" />
        <path d="M196 238 L150 330 M196 238 L242 330" stroke="#5c3d22" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        {[
          [150, 330],
          [242, 330],
          [198, 334],
        ].map(([x, y]) => (
          <rect key={x} x={x - 5} y={y - 3} width="10" height="6" rx="1.5" fill="url(#at-brass)" />
        ))}
        {/* the spreader with its little eyepiece tray */}
        <path d="M168 296 L196 302 L226 296" stroke={BRASS_DK} strokeWidth="2.5" fill="none" />
        {/* the mount: a geared head */}
        <circle cx="196" cy="232" r="14" fill="url(#at-brass-ball)" stroke={BRASS_DK} />
        <circle cx="196" cy="232" r="9" fill="none" stroke={BRASS_DK} strokeDasharray="2 2" />
        <rect x="190" y="242" width="12" height="12" fill={BRASS_DK} />
        <g transform="rotate(-50 196 226)">
          {/* the tube, tapering toward the eyepiece */}
          <path d="M112 214 L276 208 L276 244 L112 238 Z" fill="url(#at-brass)" stroke={BRASS_DK} />
          <path d="M112 219 L276 214" stroke={BRASS_HI} strokeWidth="2" opacity="0.6" />
          {[150, 184, 232].map((x) => (
            <rect key={x} x={x} y={x === 232 ? 207 : 210} width="7" height={x === 232 ? 38 : 34} rx="1.5" fill={BRASS_DK} />
          ))}
          {/* the objective, its dew shield, and a faint gleam on the glass */}
          <rect x="266" y="202" width="24" height="48" rx="4" fill={BRASS_DK} />
          <ellipse cx="290" cy="226" rx="3" ry="22" fill="#3b5866" />
          <ellipse cx="290" cy="218" rx="1.2" ry="7" fill="#cfe3ea" opacity="0.6" />
          {/* the eyepiece */}
          <rect x="98" y="219" width="16" height="16" rx="3" fill={BRASS_DK} />
          <rect x="90" y="222" width="10" height="10" rx="2" fill="#2a2a2a" />
          {/* the finder scope riding on top */}
          <rect x="170" y="196" width="60" height="9" rx="3" fill="url(#at-brass)" stroke={BRASS_DK} strokeWidth="0.8" />
          <path d="M184 205 V210 M216 205 V210" stroke={BRASS_DK} strokeWidth="2" />
        </g>
      </g>

      {/* things left where they were dropped: books, and a chart case on the floor */}
      <g filter="url(#at-drop)">
        <rect x="236" y="318" width="44" height="9" rx="1" fill="#5a2a22" />
        <rect x="240" y="309" width="38" height="9" rx="1" fill="#2c4a3a" />
        <rect x="238" y="300" width="34" height="9" rx="1" fill="#3a3a5a" transform="rotate(-4 255 304)" />
        <path d="M240 313 H276 M242 322 H278" stroke={BRASS_HI} strokeWidth="0.6" opacity="0.6" />
      </g>
      {/* a rolled chart, half open, tied with a red ribbon */}
      <g filter="url(#at-drop)" transform="rotate(6 128 326)">
        <path d="M96 322 H150 V330 H96 Z" fill="url(#at-paper)" />
        <path d="M100 330 Q123 342 150 330 V334 Q123 346 100 334 Z" fill="#d9c9a2" />
        <ellipse cx="96" cy="326" rx="2.5" ry="4" fill="#c2b088" />
        <ellipse cx="150" cy="326" rx="2.5" ry="4" fill="#e8dcbc" />
        <path d="M118 321 V331" stroke="#9a2a22" strokeWidth="2.2" />
      </g>
      <Dust x={20} y={90} w={260} h={230} count={10} seed={12} />
      <Grain />
      <Vignette />
    </>
  );
}

/** A tall, narrow window in the round wall: stone surround, rain on the glass, the flat grey sea beyond. */
function Lancet({ id, x, y, w, h }: { id: string; x: number; y: number; w: number; h: number }) {
  const cx = x + w / 2;
  const inner = `M${x + 8} ${y + h} V${y + w * 0.55} Q${cx} ${y + 2} ${x + w - 8} ${y + w * 0.55} V${y + h} Z`;
  const sea = y + h * 0.72;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={inner} />
        </clipPath>
      </defs>
      <path d={`M${x} ${y + h + 6} V${y + w * 0.5} Q${cx} ${y - 22} ${x + w} ${y + w * 0.5} V${y + h + 6} Z`} fill="#3a4651" stroke="#1a2229" strokeWidth="2" />
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y - 20} width={w} height={h + 30} fill="url(#at-night)" />
        <rect x={x} y={sea - 26} width={w} height={26} fill="#33454f" />
        <path d={`M${x} ${sea} H${x + w}`} stroke="#8fa9b4" strokeWidth="1" opacity="0.6" />
        <rect x={x} y={sea + 1} width={w} height={h} fill="#2a3a43" />
        <Rain x={x + 6} y={y + 6} w={w - 12} h={h - 8} count={Math.round(w / 5)} seed={x + y} />
        <rect x={x} y={y - 20} width={w} height={h + 30} fill="#cfe3ea" opacity="0.05" />
      </g>
      <path d={`M${cx} ${y + 4} V${y + h} M${x + 8} ${y + h * 0.55} H${x + w - 8}`} stroke={BRASS_DK} strokeWidth="2" />
      <path d={inner} fill="none" stroke={BRASS_DK} strokeWidth="3" />
      <path d={`M${x - 4} ${y + h} H${x + w + 4} L${x + w + 8} ${y + h + 9} H${x - 8} Z`} fill="#4c5a66" stroke="#1a2229" />
    </>
  );
}

/** The dome's springing line: a brass band where the round wall turns into the vault. */
function DomeBand() {
  return (
    <>
      <rect width="300" height="40" fill="#05080d" opacity="0.35" filter="url(#at-soft)" />
      <path d="M-10 36 Q150 8 310 36" stroke={BRASS_DK} strokeWidth="5" fill="none" opacity="0.9" />
      <path d="M-10 34 Q150 6 310 34" stroke={BRASS_HI} strokeWidth="0.8" fill="none" opacity="0.35" />
    </>
  );
}

/** A soft wet streak running down stone. */
function Streak({ x, y, h, w = 5, color = "#0b1218", opacity = 0.35 }: { x: number; y: number; h: number; w?: number; color?: string; opacity?: number }) {
  return <path d={`M${x} ${y} q${w} ${h * 0.4} ${-w / 2} ${h}`} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" opacity={opacity} filter="url(#at-soft)" />;
}

/** A cobweb strung across a corner. */
function Cobweb({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  const k = flip ? -1 : 1;
  return (
    <g stroke="#c8d4dc" strokeWidth="0.5" fill="none" opacity="0.28">
      <path d={`M${x} ${y} l${k * 34} 0 M${x} ${y} l0 34 M${x} ${y} l${k * 28} 20 M${x} ${y} l${k * 16} 30`} />
      <path d={`M${x + k * 12} ${y} q${-k * 3} 6 ${-k * 1} 12 q${k * 3} -1 ${k * 9} -3 q-1 -3 ${k * 2} -9 M${x + k * 22} ${y} q${-k * 4} 10 ${-k * 4} 14 q${-k * 6} 3 ${-k * 9} 8 q${-k * 6} 0 ${-k * 9} 2 M${x + k * 30} ${y} q${-k * 5} 12 ${-k * 4} 20 q${-k * 9} 4 ${-k * 14} 10 q${-k * 9} -1 ${-k * 12} 3`} />
    </g>
  );
}

export function Desk({ s }: { s: WallState }) {
  return (
    <>
      <RoundRoom />
      <DomeBand />
      <Streak x={120} y={40} h={140} />
      <Streak x={146} y={0} h={70} w={4} />
      {/* a lancet window high on the left: cold rain light falls across the journal */}
      <Lancet id="at-desk-glass" x={22} y={46} w={62} h={148} />
      <LightShaft x1={32} x2={74} spread={56} y1={194} y2={330} opacity={0.32} dust={7} seed={34} />

      {/* the star chart: a sheet pinned to the stone, the sky drawn round like a clock */}
      <rect x="164" y="76" width="114" height="112" fill="#000" opacity="0.5" filter="url(#at-soft)" />
      <path d="M159 70 H271 V172 Q262 176 258 184 H159 Z" fill="url(#at-paper)" stroke="#8a7440" strokeWidth="1" />
      <path d="M258 184 Q262 176 271 172 Q266 182 258 184 Z" fill="#b7a67c" />
      <ellipse cx="180" cy="168" rx="16" ry="10" fill="#8a6a2a" opacity="0.12" filter="url(#at-soft)" />
      <ellipse cx="258" cy="84" rx="12" ry="8" fill="#8a6a2a" opacity="0.12" filter="url(#at-soft)" />
      <circle cx="215" cy="125" r="52" fill="#e9ddb8" stroke="#8a7440" strokeWidth="2.5" />
      <circle cx="215" cy="125" r="47" fill="none" stroke="#8a7440" strokeWidth="2" strokeDasharray="0.8 2.2" strokeOpacity="0.7" />
      <circle cx="215" cy="125" r="44" fill="none" stroke="#8a7440" strokeOpacity="0.5" />
      <circle cx="215" cy="125" r="26" fill="none" stroke="#8a7440" strokeOpacity="0.25" strokeDasharray="3 3" />
      <ellipse cx="215" cy="125" rx="44" ry="17" fill="none" stroke="#9a3a2a" strokeOpacity="0.25" transform="rotate(-24 215 125)" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 60) * Math.PI) / 180;
        return <circle key={i} cx={215 + Math.cos(a) * 38} cy={125 + Math.sin(a) * 38} r="2.2" fill="#3a2c14" />;
      })}
      <circle cx="215" cy="125" r="3.5" fill="#3a2c14" />
      <circle cx="215" cy="125" r="7" fill="none" stroke="#3a2c14" strokeOpacity="0.35" />
      {/* corner flourishes, and the brass tack holding it */}
      <path d="M164 76 q10 0 12 10 M266 76 q-10 0 -12 10 M164 178 q10 0 12 -10" stroke="#8a7440" strokeWidth="0.8" fill="none" opacity="0.6" />
      <circle cx="215" cy="66" r="3" fill="url(#at-brass-ball)" />
      <path d="M215 66 L215 72" stroke={BRASS_DK} strokeWidth="1" />

      {/* candlelight thrown up the wall */}
      <LightPool cx={248} cy={214} r={110} flicker opacity={0.7} />

      {/* the desk: oak top in perspective, a drawered apron, turned legs */}
      <Shadow cx={150} cy={340} rx={150} ry={12} opacity={0.65} />
      <g filter="url(#at-drop)">
        <path d="M24 336 V276 M276 336 V276" stroke="#2c1a0c" strokeWidth="13" />
        <path d="M24 300 v6 M276 300 v6" stroke="#4a3018" strokeWidth="15" strokeLinecap="round" />
        <path d="M20 276 V336 M272 276 V336" stroke="#5c3d22" strokeWidth="1.5" opacity="0.6" />
        <rect x="16" y="330" width="16" height="8" rx="1.5" fill="url(#at-brass)" />
        <rect x="268" y="330" width="16" height="8" rx="1.5" fill="url(#at-brass)" />
        <path d="M22 244 H278 L292 258 H8 Z" fill="#5a3a20" />
        <path d="M22 244 H278 L292 258 H8 Z" fill="url(#at-planks)" opacity="0.5" />
        <path d="M30 248 C90 246 150 251 210 248 S270 250 284 252" stroke="#2a180c" strokeWidth="0.6" fill="none" opacity="0.5" />
        <path d="M18 254 C80 252 160 256 286 255" stroke="#2a180c" strokeWidth="0.6" fill="none" opacity="0.4" />
        <rect x="8" y="258" width="284" height="18" fill="url(#at-wood)" stroke="#2a180c" />
        <path d="M8 258.5 H292" stroke="#a87a4a" strokeWidth="1" opacity="0.5" />
        <rect x="96" y="261" width="108" height="12" rx="1" fill="none" stroke="#2a180c" strokeOpacity="0.8" />
        <path d="M150 261 V273" stroke="#2a180c" strokeOpacity="0.8" />
        <rect x="118" y="265" width="12" height="3" rx="1" fill="url(#at-brass)" />
        <rect x="170" y="265" width="12" height="3" rx="1" fill="url(#at-brass)" />
      </g>

      {/* beneath it: a basket of rolled charts, and screwed-up drafts on the flags */}
      <g filter="url(#at-drop)">
        <path d="M206 296 L248 296 L244 336 H210 Z" fill="#3b2a18" />
        <path d="M207 304 H247 M208 316 H246 M209 328 H245" stroke="#24180c" strokeWidth="1.5" />
        <path d="M214 296 L210 280 M222 296 L226 278 M232 296 L234 284 M240 296 L246 282" stroke="#d8c9a2" strokeWidth="5" strokeLinecap="round" />
        <path d="M222 296 L226 278" stroke="#c9b17a" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* screwed-up drafts and a dropped sheet on the flags */}
      <g filter="url(#at-drop)">
        <path d="M88 350 l6 -6 l7 2 l3 6 l-3 6 l-8 1 l-5 -4 z" fill="#d8cba8" />
        <path d="M90 350 l5 1 l3 -4 M96 351 l2 5" stroke="#9c8a62" strokeWidth="0.7" fill="none" />
        <path d="M120 362 l5 -5 l6 1 l2 5 l-4 5 l-6 -1 z" fill="#cfc09a" />
        <path d="M122 362 l5 0 l2 -3" stroke="#9c8a62" strokeWidth="0.7" fill="none" />
        <path d="M44 372 L80 366 L86 380 L50 388 Z" fill="url(#at-paper)" opacity="0.85" />
        <path d="M52 374 L76 370 M54 379 L72 376" stroke="#5a4a2a" strokeWidth="0.6" opacity="0.5" />
      </g>

      {/* the open journal: two curved pages, close-written, a ribbon down the gutter */}
      <Shadow cx={86} cy={254} rx={52} ry={5} opacity={0.6} />
      <path d="M38 252 L42 236 Q64 226 86 236 Q108 226 130 236 L134 252 Q110 246 86 254 Q62 246 38 252 Z" fill="#8a6a42" />
      <path d="M40 248 Q40 236 42 232 Q64 222 86 232 V250 Q62 242 40 248 Z" fill="url(#at-paper)" stroke="#8a7440" strokeWidth="0.6" />
      <path d="M132 248 Q132 236 130 232 Q108 222 86 232 V250 Q110 242 132 248 Z" fill="#e8dcbc" stroke="#8a7440" strokeWidth="0.6" />
      <path d="M86 232 V250" stroke="#8a7440" strokeWidth="1" />
      <path d="M86 236 V250" stroke="#000" strokeOpacity="0.15" strokeWidth="4" filter="url(#at-soft)" />
      <g stroke="#4a3a22" strokeWidth="0.6" opacity="0.75" fill="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M48 ${235 + i * 3} q14 -${3 - i * 0.3} ${30 - (i === 4 ? 10 : 0)} -1 M92 ${234 + i * 3} q14 -2 ${32 - (i === 2 ? 12 : 0)} ${1 + i * 0.2}`} />
        ))}
      </g>
      <path d="M88 250 q2 6 -2 12 l3 -2 l1 4" stroke="#9a2a22" strokeWidth="1.6" fill="none" />

      {/* an ink pot with a quill, brass dividers left open on the wood */}
      <g filter="url(#at-drop)">
        <path d="M148 250 V242 Q148 238 152 238 H162 Q166 238 166 242 V250 Z" fill="#1b1b2a" />
        <rect x="152" y="234" width="10" height="5" rx="1" fill="#2a2a3a" />
        <path d="M150 241 Q152 239 154 241" stroke="#6a7a9a" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M157 236 Q170 214 186 196" stroke="#e9e1cc" strokeWidth="1" fill="none" />
        <path d="M186 196 Q176 202 168 214 Q172 210 166 220 Q180 210 186 196 Z" fill="#e9e1cc" opacity="0.9" />
      </g>
      <g stroke={BRASS} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M184 252 L204 242 L230 250" />
        <circle cx="204" cy="242" r="2" fill={BRASS_HI} stroke="none" />
      </g>
      {/* a stack of two books at the far end */}
      <g filter="url(#at-drop)">
        <rect x="262" y="241" width="26" height="8" rx="1" fill="#2c4a3a" />
        <rect x="260" y="233" width="24" height="8" rx="1" fill="#5a2a22" transform="rotate(-5 272 237)" />
        <path d="M264 245 H286" stroke={BRASS_HI} strokeWidth="0.5" opacity="0.6" />
      </g>
      {/* the candle in its brass dish */}
      <ellipse cx="244" cy="250" rx="11" ry="3" fill="url(#at-brass)" />
      <path d="M233 250 q11 5 22 0" stroke={BRASS_DK} strokeWidth="1" fill="none" />
      <Candle x={244} y={249} h={22} />
      <path d="M241 230 q-1 6 0 10" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <ellipse cx="200" cy="250" rx="56" ry="4" fill="#ffcf6b" opacity="0.12" filter="url(#at-soft)" />
      <Dust x={190} y={150} w={100} h={90} count={8} seed={35} />

      {s.flags.length === 0 && <Glint x={85} y={236} />}
      <Grain />
      <Vignette />
    </>
  );
}

export function Clock({ s }: { s: WallState }) {
  const open = s.flags.includes("clock.set");
  return (
    <>
      <RoundRoom />
      <DomeBand />
      <Streak x={60} y={0} h={120} />
      <Streak x={236} y={40} h={180} w={6} />
      <Cobweb x={0} y={0} />
      {/* a slit window on the right, cold light falling toward the floor */}
      <Lancet id="at-clock-glass" x={238} y={58} w={42} h={120} />
      <LightShaft x1={246} x2={272} spread={-40} y1={178} y2={330} opacity={0.28} dust={5} seed={41} />

      {/* an iron sconce on the left, its candle the only warm thing here */}
      <rect x="30" y="214" width="7" height="22" rx="1.5" fill="#25292c" />
      <path d="M36 230 Q50 230 49 214" stroke="#25292c" strokeWidth="2.5" fill="none" />
      <path d="M40 206 h18 l-6 8 h-6 z" fill="url(#at-iron)" />
      <Candle x={49} y={206} h={16} />
      <path d="M46 194 q-1 5 0 9" stroke="#e4d6b4" strokeWidth="1.4" fill="none" />
      <LightPool cx={100} cy={170} r={120} opacity={0.35} />

      {/* the clock: a hooded oak case hanging on the stone, its shadow thrown right */}
      <path d="M106 278 V100 Q158 50 210 100 V278 Z" fill="#000" opacity="0.55" filter="url(#at-soft)" />
      <path d="M150 64 V58" stroke="#111" strokeWidth="1.5" />
      <g filter="url(#at-drop)">
        <path d="M98 262 V96 Q150 46 202 96 V262 Z" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
        <path d="M98 262 V96 Q150 46 202 96 V262 Z" fill="url(#at-planks)" opacity="0.35" />
        <path d="M106 180 V258 M194 180 V258" stroke="#2a180c" strokeWidth="5" opacity="0.6" />
        <path d="M103 180 V258" stroke="#8a5c34" strokeWidth="1" opacity="0.6" />
        <path d="M100 96 Q150 50 200 96" stroke="#9a6a3c" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="150" cy="68" r="4.5" fill="url(#at-brass-ball)" />
        <rect x="96" y="176" width="108" height="8" rx="1.5" fill="#4a2e18" stroke="#2a180c" />
        <path d="M94 262 H206 L210 272 H90 Z" fill="#4a2e18" stroke="#2a180c" />
        <path d="M94 262.5 H206" stroke="#a87a4a" strokeWidth="1" opacity="0.5" />
        {/* the trunk's glass door and the pendulum behind it */}
        <rect x="118" y="188" width="64" height="70" rx="5" fill="#120c07" stroke="#2a180c" strokeWidth="2" />
        <rect x="120" y="190" width="60" height="66" rx="4" fill="none" stroke={BRASS_DK} strokeWidth="1" />
      </g>
      <g className={open ? "at-sway" : undefined} style={{ transformOrigin: "50% 0%", animationDuration: "1.8s" }}>
        <path d="M150 188 V238" stroke={BRASS} strokeWidth="2" />
        <circle cx="150" cy="246" r="10" fill="url(#at-brass-ball)" stroke={BRASS_DK} strokeWidth="0.8" />
      </g>
      <path d="M124 252 L140 194 M132 254 L146 202" stroke="#cfe3ea" strokeWidth="3" opacity="0.07" />
      <path d="M118 188 L182 188" stroke="#000" strokeOpacity="0.4" strokeWidth="2" />

      {open ? (
        <>
          {/* the face swung open on its hinge; inside, a mark cut into the case */}
          <circle cx="150" cy="126" r="46" fill="#1b120b" stroke="url(#at-brass)" strokeWidth="3" />
          <circle cx="150" cy="126" r="40" fill="#2e1d10" />
          <g fill="none" stroke={BRASS_DK} opacity="0.55">
            <circle cx="126" cy="108" r="11" strokeWidth="3" strokeDasharray="2 2" />
            <circle cx="126" cy="108" r="3" fill={BRASS_DK} />
            <circle cx="176" cy="148" r="9" strokeWidth="3" strokeDasharray="2 2" />
          </g>
          <circle cx="150" cy="126" r="26" fill="url(#at-glow)" opacity="0.4" />
          <text x="150" y="138" textAnchor="middle" fontSize="34" fill={BRASS_HI}>
            ✶
          </text>
          <ellipse cx="96" cy="126" rx="12" ry="48" fill="url(#at-paper)" stroke={BRASS_DK} strokeWidth="3" />
          <ellipse cx="94" cy="118" rx="4" ry="22" fill="#fff" opacity="0.2" />
          <rect x="102" y="118" width="5" height="16" rx="1" fill={BRASS_DK} />
          {s.takes.has("clock") && <Glint x={150} y={160} />}
        </>
      ) : (
        <>
          <circle cx="150" cy="126" r="46" fill="url(#at-paper)" stroke="url(#at-brass)" strokeWidth="5" />
          <circle cx="150" cy="126" r="43" fill="none" stroke="#5a4a2a" strokeWidth="2" strokeDasharray="0.6 3.9" opacity="0.6" />
          <circle cx="150" cy="126" r="33" fill="none" stroke="#5a4a2a" strokeOpacity="0.3" />
          <ellipse cx="164" cy="140" rx="18" ry="14" fill="#8a6a2a" opacity="0.12" filter="url(#at-soft)" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            return <circle key={i} cx={150 + Math.cos(a) * 38} cy={126 + Math.sin(a) * 38} r="2" fill="#3a2c14" />;
          })}
          {/* hands hanging loose: nowhere near the hour that matters */}
          <path d="M150 126 L150 160 M150 126 L178 112" stroke="#1b120b" strokeWidth="3" strokeLinecap="round" />
          <path d="M150 126 L150 119 M150 126 L144.6 128.7" stroke="#1b120b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="150" cy="126" r="3.5" fill="url(#at-brass-ball)" />
          {/* old glass over the face, catching the candle */}
          <path d="M116 104 Q128 86 148 82" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.18" />
        </>
      )}

      {/* the clock-winder's stool: an oil can and a rag */}
      <Shadow cx={252} cy={340} rx={34} ry={6} opacity={0.6} />
      <g filter="url(#at-drop)">
        <path d="M232 340 L238 304 M272 340 L266 304 M250 342 V306" stroke="#3a2614" strokeWidth="4" strokeLinecap="round" />
        <path d="M236 324 H268" stroke="#2c1a0c" strokeWidth="2.5" />
        <ellipse cx="252" cy="302" rx="22" ry="5" fill="#5c3d22" />
        <ellipse cx="252" cy="300" rx="22" ry="5" fill="#6b4527" />
        <path d="M244 298 V286 Q244 282 248 282 H254 Q258 282 258 286 V298 Z" fill="url(#at-iron)" />
        <path d="M251 282 L262 270" stroke="#4a5258" strokeWidth="2" />
        <path d="M258 286 q6 2 4 8" stroke="#25292c" strokeWidth="1.5" fill="none" />
        <path d="M232 300 q6 -6 12 -2 q4 4 0 8 q-8 4 -14 0 z" fill="#8a7a62" />
      </g>
      {/* a guttered stub of candle on the flags */}
      <g filter="url(#at-drop)">
        <rect x="58" y="344" width="6" height="8" rx="1" fill="#e4d6b4" />
        <ellipse cx="61" cy="352" rx="8" ry="2" fill="#d8ccb0" />
      </g>
      <Dust x={20} y={140} w={120} h={140} count={8} seed={42} />
      <Grain />
      <Vignette />
    </>
  );
}

const SEAL_COLOR: Record<string, string> = { "seal-leaf": "#3f9a52", "seal-sun": "#e2b23a", "seal-tide": "#2f86a8" };
const SEAL_SOCKET: Record<string, string> = { "seal-leaf": "eye", "seal-sun": "wave", "seal-tide": "sun" };

export function Stairs({ s }: { s: WallState }) {
  const open = s.flags.includes("stairs.open");
  const registered = s.flags.includes("cathedral.registered");
  const rnd = seeded(51);
  const rivets: [number, number][] = [];
  for (let y = 140; y <= 320; y += 9) rivets.push([166, y], [264, y]);
  return (
    <>
      <RoundRoom />
      <DomeBand />
      <Streak x={40} y={0} h={90} />
      <Streak x={140} y={20} h={200} w={4} />
      <Cobweb x={300} y={0} flip />

      {/* a candle on a stone ledge beneath the plate, lighting it from below */}
      <LightPool cx={80} cy={190} r={110} flicker opacity={0.55} />
      <path d="M36 236 H126 L130 244 H32 Z" fill="#4c5a66" stroke="#1a2229" />
      <path d="M36 236 H126" stroke="#8fa0ad" strokeWidth="0.8" opacity="0.4" />
      <Candle x={108} y={236} h={14} />
      <path d="M105 224 q-1 5 0 8 M111 222 q1 4 0 7" stroke="#e4d6b4" strokeWidth="1.2" fill="none" />
      <rect x="48" y="226" width="5" height="10" rx="1" fill="#d8ccb0" />
      <ellipse cx="50.5" cy="236" rx="5" ry="1.5" fill="#d8ccb0" />

      {/* the plate of seven sockets: an iron slab in a brass frame, bolted to the stone */}
      <rect x="32" y="102" width="104" height="104" rx="10" fill="#000" opacity="0.5" filter="url(#at-soft)" />
      <rect x="27" y="95" width="106" height="106" rx="11" fill="url(#at-brass)" />
      <rect x="31" y="99" width="98" height="98" rx="8" fill="url(#at-iron)" stroke="#111" strokeWidth="1.5" />
      <rect x="31" y="99" width="98" height="98" rx="8" fill="#000" filter="url(#at-mottle)" opacity="0.25" />
      <path d="M36 101 H124" stroke="#9aa3aa" strokeWidth="1" opacity="0.35" />
      {[
        [36, 104],
        [124, 104],
        [36, 192],
        [124, 192],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="url(#at-brass-ball)" />
      ))}
      {RING_ORDER.map((g, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = i === 6 ? 80 : 48 + col * 32;
        const y = 120 + row * 30;
        const seal = Object.keys(SEAL_SOCKET).find((k) => SEAL_SOCKET[k] === g && s.flags.includes(`seated.${k}`));
        const lit = registered && g === "peak";
        return (
          <g key={g}>
            {lit && <circle cx={x} cy={y} r="18" fill="url(#at-glow)" className="at-pulse" />}
            <circle cx={x} cy={y + 1} r="12.5" fill="#000" opacity="0.4" />
            <circle cx={x} cy={y} r="11" fill={seal ? SEAL_COLOR[seal] : "#15191c"} stroke={lit ? BRASS_HI : BRASS_DK} strokeWidth="2" />
            {seal ? (
              <>
                <circle cx={x} cy={y} r="7" fill="none" stroke="#fff" strokeOpacity="0.25" />
                <ellipse cx={x - 3.5} cy={y - 4} rx="3" ry="2" fill="#fff" opacity="0.4" />
              </>
            ) : (
              <>
                <path d={`M${x - 8} ${y - 5} A9 9 0 0 1 ${x + 6} ${y - 7}`} stroke="#000" strokeOpacity="0.5" strokeWidth="2" fill="none" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={lit ? BRASS_HI : "#a89060"}>
                  {GLYPH[g]}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* the stair door: a stone arch round an iron door */}
      <path d="M146 334 V134 Q146 108 172 104 H258 Q284 108 284 134 V334 Z" fill="#3a4651" stroke="#1a2229" strokeWidth="2" />
      <path d="M146 334 V134 Q146 108 172 104 H258 Q284 108 284 134 V334 Z" fill="url(#at-stone)" opacity="0.8" />
      <path d="M150 140 Q152 112 174 108 H256 Q280 112 280 140" stroke="#8fa0ad" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M206 104 L210 120 H220 L224 104 Z" fill="#4a5864" stroke="#1a2229" />
      <rect x="160" y="130" width="110" height="200" fill="#0b0d0f" />
      {open ? (
        <>
          {/* steps dropping into the dark, a teal glimmer of water far below */}
          <ellipse cx="220" cy="330" rx="44" ry="26" fill="#3f8f8a" opacity="0.35" filter="url(#at-softer)" />
          <path d="M176 330 L198 270 H252 L264 330 Z" fill="#141a1e" />
          {[
            [318, 2],
            [306, 6],
            [294, 10],
            [284, 13],
            [276, 16],
          ].map(([y, inset]) => (
            <g key={y}>
              <path d={`M${178 + inset * 1.6} ${y} H${262 - inset * 0.7}`} stroke="#2b343a" strokeWidth="3" />
              <path d={`M${178 + inset * 1.6} ${y + 2} H${262 - inset * 0.7}`} stroke="#5f8f8c" strokeWidth="0.6" opacity={0.5 - inset * 0.025} />
            </g>
          ))}
          <path d="M198 270 H252" stroke="#9ff3e4" strokeWidth="0.8" opacity="0.25" />
          <LightPool cx={224} cy={300} r={50} color="#9ff3e4" opacity={0.2} />
          <Dust x={180} y={180} w={80} h={130} count={8} color="#c9fff3" seed={52} />
          {/* the door, swung back into the dark */}
          <path d="M160 130 L180 142 V320 L160 330 Z" fill="url(#at-iron)" />
          <path d="M180 142 V320" stroke="#000" strokeWidth="2" opacity="0.6" />
          <path d="M163 170 L178 176 M163 280 L178 282" stroke="#1a1d20" strokeWidth="3" />
        </>
      ) : (
        <>
          <rect x="160" y="130" width="110" height="200" fill="url(#at-iron)" stroke="#111" strokeWidth="2" />
          <rect x="160" y="130" width="110" height="200" fill="#0b0d0f" opacity="0.35" />
          <rect x="160" y="130" width="110" height="200" filter="url(#at-mottle)" opacity="0.3" />
          <path d="M160 180 H270 M160 280 H270" stroke="#1a1d20" strokeWidth="4" />
          <path d="M160 182.5 H270 M160 282.5 H270" stroke="#7a838a" strokeWidth="0.8" opacity="0.5" />
          {/* hinges */}
          <path d="M160 150 H196 M160 306 H196" stroke="#1a1d20" strokeWidth="6" strokeLinecap="round" />
          <path d="M160 148 H194 M160 304 H194" stroke="#6a737a" strokeWidth="1" opacity="0.5" />
          {/* rust weeping from the bands */}
          {[176, 214, 238, 252].map((x) => (
            <Streak key={x} x={x} y={184 + rnd() * 4} h={30 + rnd() * 40} w={3} color="#7a3a14" opacity={0.45} />
          ))}
          {rivets.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#7a838a" opacity="0.6" />
          ))}
          {/* the slot the width of a coin, in a brass escutcheon */}
          <rect x="203" y="218" width="24" height="20" rx="3" fill="url(#at-brass)" stroke={BRASS_DK} />
          <rect x="208" y="226" width="14" height="4" rx="1" fill="#000" stroke={BRASS} />
          <path d="M160 328 H270" stroke="#3f8f8a" strokeWidth="2" opacity="0.4" />
        </>
      )}
      <path d="M160 130 H270" stroke="#000" strokeOpacity="0.6" strokeWidth="3" />
      {/* water seeping out under the door, and a coil of rope by the wall */}
      <ellipse cx="212" cy="344" rx="54" ry="7" fill="#9fc3d0" opacity="0.12" />
      <path d="M180 342 q30 -3 60 0" stroke="#cfe3ea" strokeWidth="0.8" fill="none" opacity="0.25" />
      <Shadow cx={74} cy={358} rx={34} ry={6} opacity={0.6} />
      <g filter="url(#at-drop)" fill="none" strokeLinecap="round">
        <ellipse cx="74" cy="352" rx="30" ry="9" stroke="#6b5a3a" strokeWidth="5" />
        <ellipse cx="74" cy="348" rx="24" ry="7" stroke="#7d6a44" strokeWidth="5" />
        <ellipse cx="74" cy="344" rx="17" ry="5" stroke="#8a7650" strokeWidth="5" />
        <path d="M98 350 q16 4 30 -2" stroke="#7d6a44" strokeWidth="4" />
      </g>
      <Grain />
      <Vignette />
    </>
  );
}
