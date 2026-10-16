/** Compartment 12B: the window, door, berths and washstand walls. Each draws itself from the room's shared flags. */
import { C, Room, Sconce } from "./common";

export function WindowWall({ flags }: { flags: string[] }) {
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

export function DoorWall({ flags }: { flags: string[] }) {
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

export function BerthWall({ flags, pouchHere }: { flags: string[]; pouchHere: boolean }) {
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

export function WashstandWall({ flags, mirrorLetters }: { flags: string[]; mirrorLetters: string | null }) {
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
