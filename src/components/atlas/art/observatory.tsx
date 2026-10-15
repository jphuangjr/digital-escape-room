import { BRASS, BRASS_DK, BRASS_HI, Backdrop, Dust, FloorShade, GLYPH, Glint, Grain, LightShaft, Mottle, Rain, RING_ORDER, Shadow, Vignette, type WallState } from "./common";
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

export function Desk({ s }: { s: WallState }) {
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" />
      {/* the star chart pinned to the wall */}
      <circle cx="215" cy="125" r="56" fill="url(#at-paper)" stroke="#8a7440" strokeWidth="3" />
      <circle cx="215" cy="125" r="44" fill="none" stroke="#8a7440" strokeOpacity="0.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 60) * Math.PI) / 180;
        return <circle key={i} cx={215 + Math.cos(a) * 38} cy={125 + Math.sin(a) * 38} r="2.2" fill="#3a2c14" />;
      })}
      <circle cx="215" cy="125" r="3.5" fill="#3a2c14" />
      {/* the desk */}
      <rect x="10" y="250" width="280" height="22" fill="url(#at-wood)" stroke="#2a180c" />
      <rect x="22" y="272" width="16" height="70" fill="#3b2414" />
      <rect x="262" y="272" width="16" height="70" fill="#3b2414" />
      {/* the open journal */}
      <path d="M40 242 Q85 228 85 246 Q85 228 130 242 V252 H40 Z" fill="url(#at-paper)" stroke="#8a7440" />
      <path d="M50 236 H78 M50 240 H76 M92 236 H120 M92 240 H116" stroke="#5a4a2a" strokeWidth="0.8" />
      <path d="M85 232 V250" stroke="#8a7440" />
      {/* an ink pot and a candle */}
      <rect x="150" y="236" width="14" height="14" rx="2" fill="#1b1b2a" />
      <rect x="240" y="216" width="8" height="34" fill="#efe6d2" />
      <path d="M244 210 q4 -6 0 -12 q-4 6 0 12" fill="#ffd27a" />
      <circle cx="244" cy="206" r="16" fill="url(#at-glow)" />
      {s.flags.length === 0 && <Glint x={85} y={236} />}
      <Vignette />
    </>
  );
}

export function Clock({ s }: { s: WallState }) {
  const open = s.flags.includes("clock.set");
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" />
      {/* the case */}
      <rect x="95" y="70" width="110" height="200" rx="10" fill="url(#at-wood)" stroke="#2a180c" strokeWidth="2" />
      <rect x="100" y="76" width="100" height="100" rx="50" fill="#1b120b" />
      {open ? (
        <>
          {/* the face swung open on its hinge; a mark cut inside */}
          <text x="150" y="138" textAnchor="middle" fontSize="34" fill={BRASS_HI}>
            ✶
          </text>
          <ellipse cx="96" cy="126" rx="12" ry="48" fill="url(#at-paper)" stroke={BRASS_DK} strokeWidth="3" />
          {s.takes.has("clock") && <Glint x={150} y={160} />}
        </>
      ) : (
        <>
          <circle cx="150" cy="126" r="46" fill="url(#at-paper)" stroke="url(#at-brass)" strokeWidth="5" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            return <circle key={i} cx={150 + Math.cos(a) * 38} cy={126 + Math.sin(a) * 38} r="2" fill="#3a2c14" />;
          })}
          {/* hands hanging loose: nowhere near the hour that matters */}
          <path d="M150 126 L150 160 M150 126 L178 112" stroke="#1b120b" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* the pendulum, still */}
      <rect x="120" y="186" width="60" height="76" rx="6" fill="#1b120b" />
      <path d="M150 186 V240" stroke={BRASS} strokeWidth="2" />
      <circle cx="150" cy="246" r="10" fill="url(#at-brass)" />
      <Vignette />
    </>
  );
}

const SEAL_COLOR: Record<string, string> = { "seal-leaf": "#3f9a52", "seal-sun": "#e2b23a", "seal-tide": "#2f86a8" };
const SEAL_SOCKET: Record<string, string> = { "seal-leaf": "eye", "seal-sun": "wave", "seal-tide": "sun" };

export function Stairs({ s }: { s: WallState }) {
  const open = s.flags.includes("stairs.open");
  const registered = s.flags.includes("cathedral.registered");
  return (
    <>
      <Backdrop wall={["#22303b", "#121b22"]} floor="#2a2118" />
      {/* the plate of seven sockets */}
      <rect x="28" y="96" width="104" height="104" rx="10" fill="url(#at-iron)" stroke="#111" strokeWidth="2" />
      {RING_ORDER.map((g, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = i === 6 ? 80 : 48 + col * 32;
        const y = 120 + row * 30;
        const seal = Object.keys(SEAL_SOCKET).find((k) => SEAL_SOCKET[k] === g && s.flags.includes(`seated.${k}`));
        const lit = registered && g === "peak";
        return (
          <g key={g}>
            {lit && <circle cx={x} cy={y} r="18" fill="url(#at-glow)" />}
            <circle cx={x} cy={y} r="11" fill={seal ? SEAL_COLOR[seal] : "#15191c"} stroke={lit ? BRASS_HI : BRASS_DK} strokeWidth="2" />
            {!seal && (
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={lit ? BRASS_HI : "#a89060"}>
                {GLYPH[g]}
              </text>
            )}
          </g>
        );
      })}
      {/* the iron door over the stairs */}
      <rect x="160" y="130" width="110" height="200" fill="#0b0d0f" />
      {open ? (
        <>
          <path d="M170 330 L200 280 H250 L262 330 Z" fill="#141a1e" />
          <path d="M184 310 H254 M192 296 H252 M200 284 H250" stroke="#2b343a" strokeWidth="3" />
          <path d="M160 130 L176 140 V322 L160 330 Z" fill="url(#at-iron)" />
        </>
      ) : (
        <>
          <rect x="160" y="130" width="110" height="200" fill="url(#at-iron)" stroke="#111" strokeWidth="2" />
          <path d="M160 180 H270 M160 280 H270" stroke="#1a1d20" strokeWidth="4" />
          <rect x="208" y="226" width="14" height="4" rx="1" fill="#000" stroke={BRASS} />
        </>
      )}
      <Vignette />
    </>
  );
}

