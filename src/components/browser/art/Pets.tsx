import type { ReactElement, ReactNode } from "react";

/**
 * Lost Paws pet portraits: coloured-pencil / gouache style, 16:10 (320×200).
 * Pure, deterministic SVG. Keyed by registry ID (see src/server/content/sites/lostpaws.ts).
 */

const INK = "#3a2f25";

/** Shared frame: soft background, paper grain, pencil-wobble filter, hatching pattern. */
function PetFrame({ id, bgIn, bgOut, children }: { id: string; bgIn: string; bgOut: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="42%" r="70%">
          <stop offset="0" stopColor={bgIn} />
          <stop offset="1" stopColor={bgOut} />
        </radialGradient>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.23  0 0 0 0 0.18  0 0 0 0 0.12  1.5 0 0 0 -0.55" />
        </filter>
        <pattern id={`${id}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect width="320" height="200" fill={`url(#${id}-bg)`} />
      {children}
      <rect width="320" height="200" filter={`url(#${id}-grain)`} opacity="0.22" />
    </svg>
  );
}

/** A loose pencil stroke (round caps, no fill). */
function S({ d, c = INK, w = 1.4, o = 1 }: { d: string; c?: string; w?: number; o?: number }) {
  return <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
}

/* ------------------------------------------------------------------ */
/* 0219 Pepper: black Labrador, standing, facing right, orange collar  */
/* ------------------------------------------------------------------ */
function Pepper() {
  const id = "pet0219";
  const base = `url(#${id}-coat)`;
  return (
    <PetFrame id={id} bgIn="#fdf0dc" bgOut="#f3d9b8">
      <defs>
        <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a423c" />
          <stop offset="0.55" stopColor="#2c2724" />
          <stop offset="1" stopColor="#1d1a18" />
        </linearGradient>
      </defs>
      <circle cx="176" cy="104" r="82" fill="#f7d3ac" opacity="0.7" />
      <ellipse cx="170" cy="178" rx="104" ry="9" fill="#c99a6c" opacity="0.45" />
      <S d="M58 180 q4 -7 7 -1 M262 182 q3 -8 7 -2 M276 181 q2 -5 5 0" c="#b88a5c" w={1.3} />
      <g filter={`url(#${id}-rough)`}>
        {/* tail */}
        <path d="M110 92 C93 98 80 118 77 142 C76 149 84 151 87 144 C91 124 101 110 114 104 Z" fill={base} />
        {/* far legs */}
        <path d="M136 120 C128 132 132 146 134 152 L131 172 L143 172 L146 152 C146 142 150 132 152 126 Z" fill="#1a1715" />
        <path d="M194 122 L190 172 L203 172 L208 126 Z" fill="#1a1715" />
        <ellipse cx="136" cy="173" rx="9" ry="4" fill="#1a1715" />
        <ellipse cx="198" cy="173" rx="9" ry="4" fill="#1a1715" />
        {/* body */}
        <path d="M112 86 C132 78 176 78 206 81 C226 84 236 102 233 122 C231 138 218 145 204 143 C186 140 168 128 148 130 C126 132 105 126 103 108 C102 98 105 90 112 86 Z" fill={base} />
        {/* near hind leg */}
        <path d="M110 92 C96 106 98 132 112 142 C118 147 122 152 120 160 L118 171 C117 177 133 178 133 172 L134 158 C135 150 132 144 136 138 C150 126 152 106 141 96 Z" fill={base} />
        {/* near front leg */}
        <path d="M208 112 C214 128 215 150 214 168 C213 176 230 177 228 170 C226 152 228 134 229 116 Z" fill={base} />
        <ellipse cx="126" cy="174" rx="10" ry="4.5" fill="#2a2522" />
        <ellipse cx="221" cy="174" rx="10.5" ry="4.5" fill="#2a2522" />
        {/* neck */}
        <path d="M198 86 C208 70 224 58 241 56 L256 92 C244 106 228 116 214 119 Z" fill={base} />
        {/* head */}
        <path d="M231 48 C245 39 264 43 271 55 C276 62 285 64 293 69 C300 74 300 85 293 89 C285 94 272 95 262 93 C253 97 243 94 237 86 C229 76 225 58 231 48 Z" fill={base} />
        {/* ear */}
        <path d="M245 49 C236 51 231 64 233 80 C234 87 242 87 246 80 C251 69 253 57 250 51 Z" fill="#191614" />
        {/* nose, mouth */}
        <path d="M290 69 C296 68 300 72 299 77 C298 80 293 80 290 77 Z" fill="#0f0d0c" />
        <S d="M297 82 C290 87 278 88 268 86" c="#0f0d0c" w={1.3} />
        {/* collar */}
        <path d="M224 62 C230 80 237 96 244 106 L252 101 C245 90 239 75 233 59 Z" fill="#d9622b" />
        <S d="M226 64 C232 80 238 94 245 103" c="#f2a46f" w={1} o={0.8} />
        <circle cx="247" cy="110" r="4.2" fill="#e9b949" stroke="#9a6d1f" strokeWidth="0.8" />
      </g>
      {/* eye */}
      <ellipse cx="263" cy="61" rx="3.6" ry="3" fill="#6b3f1e" />
      <circle cx="263.4" cy="61" r="1.9" fill="#120f0d" />
      <circle cx="264.4" cy="60" r="0.9" fill="#fff6e6" />
      <S d="M258 56 C261 54 265 54 268 56" c="#6a5f56" w={1} />
      {/* sheen: coloured-pencil highlights on black coat */}
      <g opacity="0.75">
        <S d="M120 86 C145 80 175 79 204 82" c="#8a7d72" w={1.6} />
        <S d="M128 90 C150 86 172 85 196 87" c="#6f645b" w={1} />
        <S d="M236 49 C248 43 262 45 269 54" c="#8a7d72" w={1.5} />
        <S d="M272 60 C280 63 288 66 293 70" c="#7a6e64" w={1.1} />
        <S d="M114 100 C108 112 110 126 118 136" c="#6f645b" w={1.2} />
        <S d="M214 112 C218 128 218 148 216 166" c="#6f645b" w={1} />
        <S d="M204 84 C214 76 226 66 238 62" c="#7a6e64" w={1.1} />
        <S d="M101 97 C92 106 86 120 83 138" c="#6f645b" w={1} />
      </g>
      <rect x="103" y="112" width="128" height="30" fill={`url(#${id}-hatch)`} opacity="0.12" />
    </PetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 0412 Biscuit: brown tabby, sitting, facing viewer, four white socks */
/* ------------------------------------------------------------------ */
function Biscuit() {
  const id = "pet0412";
  const fur = "#a07c56";
  const dark = "#4f3a29";
  const sock = "#fffdf8";
  return (
    <PetFrame id={id} bgIn="#fdf1df" bgOut="#f2d2ae">
      <circle cx="160" cy="98" r="80" fill="#f8d9b6" opacity="0.75" />
      <ellipse cx="160" cy="181" rx="74" ry="8" fill="#c99a6c" opacity="0.45" />
      <g filter={`url(#${id}-rough)`}>
        {/* tail curling round to the front */}
        <path d="M196 172 C222 174 236 160 231 142 C229 134 219 136 221 145 C224 157 210 165 192 163 Z" fill={fur} />
        <S d="M222 140 l6 -2 M224 152 l7 1 M214 162 l3 6 M203 165 l1 6" c={dark} w={2.6} />
        {/* back paws peeking out (white) */}
        <ellipse cx="124" cy="176" rx="13" ry="6" fill={sock} />
        <ellipse cx="196" cy="176" rx="13" ry="6" fill={sock} />
        {/* body */}
        <path d="M160 74 C136 76 122 98 119 122 C115 148 119 166 128 177 L192 177 C201 166 205 148 201 122 C198 98 184 76 160 74 Z" fill={fur} />
        {/* haunch stripes */}
        <S d="M124 122 C130 118 134 120 138 126 M121 136 C128 132 134 134 138 141 M122 151 C128 148 133 150 136 156" c={dark} w={3.2} />
        <S d="M196 122 C190 118 186 120 182 126 M199 136 C192 132 186 134 182 141 M198 151 C192 148 187 150 184 156" c={dark} w={3.2} />
        <S d="M128 108 C132 103 136 102 140 104 M192 108 C188 103 184 102 180 104" c={dark} w={2.6} />
        {/* bib */}
        <path d="M144 88 C142 102 150 114 160 118 C170 114 178 102 176 88 C170 92 150 92 144 88 Z" fill="#f4ead8" />
        {/* front legs */}
        <path d="M140 108 C137 132 137 152 139 170 L157 170 C157 150 157 130 157 110 Z" fill={fur} />
        <path d="M163 110 C163 130 163 150 163 170 L181 170 C183 152 183 132 180 108 Z" fill={fur} />
        <S d="M140 124 h15 M139 136 h16 M165 124 h15 M165 136 h16" c={dark} w={2.6} />
        {/* white socks (clearly visible) */}
        <path d="M138.5 146 Q143 141 148 145 Q153 140 157.5 145 L157.5 171 L138.5 171 Z" fill={sock} />
        <path d="M162.5 145 Q167 140 172 145 Q177 141 181.5 146 L181.5 171 L162.5 171 Z" fill={sock} />
        <ellipse cx="148" cy="173" rx="12" ry="6.5" fill={sock} />
        <ellipse cx="172" cy="173" rx="12" ry="6.5" fill={sock} />
        <S d="M144 175 v3 M148 175.5 v3 M152 175 v3 M168 175 v3 M172 175.5 v3 M176 175 v3" c="#c9b9a2" w={1.1} />
        <S d="M138.5 146 V170 M157.5 145 V170 M162.5 145 V170 M181.5 146 V170" c="#d8c9b2" w={0.9} />
        {/* ears */}
        <path d="M130 52 L131 20 L156 38 Z" fill={fur} />
        <path d="M164 38 L189 20 L190 52 Z" fill={fur} />
        <path d="M134 46 L135 27 L150 39 Z" fill="#e2a99a" />
        <path d="M170 39 L185 27 L186 46 Z" fill="#e2a99a" />
        {/* head */}
        <path d="M125 60 C125 40 141 31 160 31 C179 31 195 40 195 60 C195 79 182 92 160 92 C138 92 125 79 125 60 Z" fill={fur} />
        {/* muzzle */}
        <path d="M146 72 C146 64 153 63 160 66 C167 63 174 64 174 72 C174 81 167 85 160 85 C153 85 146 81 146 72 Z" fill="#d9c2a2" />
        {/* forehead M and cheek stripes */}
        <S d="M147 47 L151 38 L156 46 L160 36 L164 46 L169 38 L173 47" c={dark} w={2.4} />
        <S d="M160 36 V28" c={dark} w={2.2} />
        <S d="M127 62 C132 63 137 66 140 69 M128 72 C132 72 136 74 139 77" c={dark} w={2.2} />
        <S d="M193 62 C188 63 183 66 180 69 M192 72 C188 72 184 74 181 77" c={dark} w={2.2} />
      </g>
      {/* eyes */}
      <path d="M140 60 C143 54 151 54 154 60 C151 65 143 65 140 60 Z" fill="#b5c24e" stroke={dark} strokeWidth="1.3" />
      <path d="M166 60 C169 54 177 54 180 60 C177 65 169 65 166 60 Z" fill="#b5c24e" stroke={dark} strokeWidth="1.3" />
      <ellipse cx="147" cy="60" rx="1.6" ry="4" fill="#1b1410" />
      <ellipse cx="173" cy="60" rx="1.6" ry="4" fill="#1b1410" />
      <circle cx="148.6" cy="58.2" r="1" fill="#fff" />
      <circle cx="174.6" cy="58.2" r="1" fill="#fff" />
      {/* nose & mouth */}
      <path d="M156 70 L164 70 L160 75 Z" fill="#d98a86" />
      <S d="M160 75 V78 M160 78 C158 81 155 81 153 79 M160 78 C162 81 165 81 167 79" c={dark} w={1.2} />
      {/* whiskers */}
      <S d="M150 76 C140 74 130 74 118 77 M150 79 C140 79 131 81 121 85 M170 76 C180 74 190 74 202 77 M170 79 C180 79 189 81 199 85" c="#fffaf0" w={0.8} o={0.9} />
      <rect x="119" y="100" width="82" height="70" fill={`url(#${id}-hatch)`} opacity="0.07" />
    </PetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 0733 Mr. Fennimore: grey rabbit sitting on stone steps              */
/* ------------------------------------------------------------------ */
function Fennimore() {
  const id = "pet0733";
  const fur = "#8f9095";
  const furL = "#babbbd";
  const furD = "#5f6066";
  return (
    <PetFrame id={id} bgIn="#fbf1e2" bgOut="#ecdcc4">
      {/* stone steps */}
      <path d="M0 150 H320 V200 H0 Z" fill="#dccfba" />
      <path d="M0 150 H320 V156 H0 Z" fill="#eadfcc" />
      <path d="M0 178 H320 V200 H0 Z" fill="#cfbfa7" />
      <path d="M0 178 H320 V183 H0 Z" fill="#e0d3bf" />
      <S d="M0 156 H320 M0 183 H320" c="#a99579" w={1} o={0.7} />
      <S d="M70 157 V177 M205 157 V177 M140 184 V200 M268 184 V200" c="#b3a187" w={1} o={0.7} />
      <rect x="0" y="156" width="320" height="22" fill={`url(#${id}-hatch)`} opacity="0.07" />
      <ellipse cx="168" cy="152" rx="78" ry="6" fill="#9b8a72" opacity="0.4" />
      <g filter={`url(#${id}-rough)`}>
        {/* far ear */}
        <path d="M128 78 C134 50 147 26 158 28 C167 31 157 58 142 84 Z" fill={furD} />
        {/* body */}
        <path d="M116 148 C106 118 128 90 170 88 C206 86 230 110 232 136 C234 147 226 153 212 153 L128 153 C121 153 118 151 116 148 Z" fill={fur} />
        {/* haunch */}
        <path d="M168 150 C160 126 176 106 198 106 C218 106 230 124 228 142 C226 150 218 153 206 153 Z" fill={furL} opacity="0.55" />
        <S d="M170 148 C164 126 178 108 198 107" c={furD} w={1.4} o={0.8} />
        {/* back foot */}
        <path d="M150 153 C150 146 170 144 206 146 C214 147 214 154 206 155 L156 156 C152 156 150 155 150 153 Z" fill={furL} />
        {/* belly / chest */}
        <path d="M108 120 C104 134 108 146 118 152 L132 152 C130 140 128 126 122 116 Z" fill="#dcd8cf" />
        {/* tail */}
        <circle cx="233" cy="128" r="10" fill="#f6f3ec" />
        {/* front paw */}
        <ellipse cx="117" cy="152" rx="9" ry="4.5" fill="#d7d3cb" />
        {/* near ear */}
        <path d="M114 82 C107 52 110 24 123 19 C135 16 138 44 133 84 Z" fill={fur} />
        <path d="M118 74 C114 52 117 32 123 27 C129 30 129 50 128 74 Z" fill="#dfb3ab" />
        {/* head */}
        <path d="M88 104 C88 86 102 76 118 76 C136 76 148 88 146 106 C145 121 132 130 116 130 C99 130 88 120 88 104 Z" fill={fur} />
        <path d="M86 110 C86 102 92 98 100 100 C104 108 104 118 98 124 C90 124 86 118 86 110 Z" fill="#c9c9c9" />
        <S d="M120 77 C132 78 142 86 145 98" c={furL} w={1.6} />
        <S d="M120 128 C130 127 138 122 143 114" c={furD} w={1.3} />
      </g>
      {/* eye */}
      <circle cx="109" cy="99" r="5.6" fill="#e8e3da" />
      <circle cx="109" cy="99" r="4.4" fill="#2a1d16" />
      <circle cx="107.6" cy="97.4" r="1.4" fill="#fff" />
      {/* nose & mouth */}
      <path d="M86 106 C88 104 91 105 91 107 C90 109 87 109 86 106 Z" fill="#c98a86" />
      <S d="M88 109 C88 112 90 114 93 114" c={furD} w={1} />
      {/* whiskers */}
      <S d="M93 109 C84 107 76 108 68 112 M93 112 C85 113 78 116 72 121 M95 107 C88 101 80 98 72 98" c="#f7f4ee" w={0.8} o={0.9} />
      {/* fur ticks */}
      <S d="M180 96 l3 -2 M192 100 l3 -2 M150 100 l3 -2 M140 118 l2 -2 M206 118 l3 -1 M214 130 l3 -1 M160 112 l2 -2" c={furD} w={1} o={0.7} />
      <rect x="110" y="92" width="122" height="60" fill={`url(#${id}-hatch)`} opacity="0.09" />
    </PetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 1150 Juno: sable-and-white collie mix, lying down, shy upward look  */
/* ------------------------------------------------------------------ */
function Juno() {
  const id = "pet1150";
  const sable = "#b8743c";
  const sableD = "#7d4a22";
  const white = "#fbf6ec";
  return (
    <PetFrame id={id} bgIn="#fdf2e0" bgOut="#efd7b6">
      <circle cx="166" cy="118" r="80" fill="#f6d8b2" opacity="0.7" />
      <ellipse cx="170" cy="180" rx="128" ry="8" fill="#c99a6c" opacity="0.45" />
      <g filter={`url(#${id}-rough)`}>
        {/* tail lying along the ground */}
        <path d="M244 162 C266 164 284 156 298 164 C302 168 300 176 292 178 C274 182 258 180 244 176 Z" fill={sable} />
        <path d="M284 160 C292 158 300 162 302 168 C301 175 296 178 290 178 C292 172 290 165 284 160 Z" fill={white} />
        {/* body */}
        <path d="M104 150 C112 122 158 110 208 114 C244 117 262 136 259 158 C257 172 242 178 222 178 L124 178 C108 178 100 166 104 150 Z" fill={sable} />
        {/* back haunch */}
        <path d="M196 176 C190 152 204 128 228 128 C248 128 260 144 258 160 C256 172 244 178 230 178 Z" fill="#c8864d" />
        <S d="M198 174 C192 152 206 130 228 129" c={sableD} w={1.4} o={0.8} />
        {/* hind foot */}
        <path d="M168 178 C168 171 186 170 204 172 C210 173 210 179 204 180 L174 180 C170 180 168 179 168 178 Z" fill={white} />
        {/* back saddle shading */}
        <S d="M128 128 C150 116 186 112 214 116" c={sableD} w={2.2} o={0.7} />
        <S d="M136 124 l4 4 M150 119 l4 4 M166 116 l4 4 M182 115 l4 4 M198 115 l4 4" c={sableD} w={1.3} o={0.8} />
        {/* white ruff / chest */}
        <path d="M100 122 C116 110 140 116 146 138 C150 156 142 172 128 177 C114 180 100 172 96 158 Z" fill={white} />
        <S d="M110 128 l-3 6 M120 134 l-2 7 M130 140 l-2 7 M112 148 l-3 6 M126 156 l-2 7 M138 150 l-2 6" c="#d8cbb5" w={1.2} />
        {/* front legs extended forward */}
        <path d="M66 166 C76 162 104 162 122 164 L122 176 C104 178 80 178 66 177 C60 175 60 168 66 166 Z" fill={white} />
        <path d="M58 172 C70 168 98 168 116 170 L116 181 C98 183 74 183 60 182 C53 180 53 174 58 172 Z" fill={white} />
        <S d="M60 172 v-0 M62 177 v4 M57 176 v4 M66 168 v4 M70 167 v4" c="#cfc1aa" w={1} />
        <S d="M66 177 C84 178 104 178 120 176" c="#d8cbb5" w={1} />
        {/* head resting on paws */}
        <path d="M70 154 C62 142 66 122 82 114 C98 106 118 110 126 122 C132 132 128 148 118 154 C106 160 82 162 70 154 Z" fill={sable} />
        {/* long muzzle */}
        <path d="M74 146 C62 148 48 150 43 156 C40 163 50 166 62 165 L92 160 C96 152 86 146 74 146 Z" fill={white} />
        <path d="M80 140 C66 142 52 146 44 152 C46 155 52 156 60 155 C70 153 80 150 90 148 Z" fill={sable} />
        <S d="M44 157 C54 158 64 156 74 152" c="#d8cbb5" w={1} />
        {/* blaze */}
        <path d="M100 113 C96 124 90 136 80 147 L90 150 C96 138 102 126 105 114 Z" fill={white} />
        {/* ears folded back (shy) */}
        <path d="M108 112 C116 102 128 100 138 104 C132 110 124 116 114 120 Z" fill={sableD} />
        <path d="M96 110 C102 100 112 96 122 98 C116 104 108 110 100 116 Z" fill={sable} />
        <path d="M118 100 C124 98 130 99 135 102 C131 104 126 105 121 105 Z" fill="#e7b39b" opacity="0.7" />
        {/* cheek fur */}
        <S d="M118 150 l4 4 M110 154 l3 5 M124 140 l5 2" c={sableD} w={1.3} />
        {/* nose */}
        <path d="M40 154 C42 150 49 150 50 154 C49 158 42 159 40 154 Z" fill="#231915" />
        <S d="M46 161 C56 162 66 161 76 158" c="#8f7f69" w={1} />
      </g>
      {/* eyes: small, glancing up, worried brows */}
      <path d="M79 132 C81 127 88 126 91 130 C89 134 82 135 79 132 Z" fill="#2e1c10" />
      <path d="M80 133 C83 134.5 87 134.5 90 131.5" fill="none" stroke="#f3e6d2" strokeWidth="1" />
      <circle cx="86.5" cy="129.2" r="0.9" fill="#fff" />
      <S d="M78 125 C81 121 87 121 91 124" c={sableD} w={1.5} />
      <path d="M100 128 C102 123 108 123 110 127 C108 131 102 131 100 128 Z" fill="#2e1c10" />
      <path d="M101 129 C104 130.5 107 130.5 109.5 128" fill="none" stroke="#f3e6d2" strokeWidth="1" />
      <circle cx="106.6" cy="125.6" r="0.9" fill="#fff" />
      <S d="M99 121 C103 118 108 118 112 121" c={sableD} w={1.4} />
      <rect x="104" y="112" width="156" height="40" fill={`url(#${id}-hatch)`} opacity="0.08" />
    </PetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 0868 Sardine: ginger tom, loafing on a wooden crate at the dock     */
/* ------------------------------------------------------------------ */
function Sardine() {
  const id = "pet0868";
  const fur = "#dc8a3e";
  const furD = "#a8571f";
  const furL = "#f0b878";
  return (
    <PetFrame id={id} bgIn="#fbf0e0" bgOut="#e6d6c0">
      {/* loading-dock roller door, softly */}
      <g opacity="0.55">
        {[22, 36, 50, 64, 78, 92, 106, 120].map((y) => (
          <S key={y} d={`M0 ${y} H320`} c="#c9b8a0" w={1.2} />
        ))}
      </g>
      <rect x="0" y="0" width="320" height="130" fill="#efe3d0" opacity="0.35" />
      <ellipse cx="160" cy="194" rx="120" ry="7" fill="#9b8064" opacity="0.4" />
      {/* crate */}
      <g filter={`url(#${id}-rough)`}>
        <path d="M70 134 H250 V196 H70 Z" fill="#c4935e" />
        <path d="M70 134 H250 V142 H70 Z" fill="#d9ad78" />
        <path d="M70 162 H250 V168 H70 Z" fill="#a9784a" />
        <path d="M70 134 h12 v62 h-12 Z M238 134 h12 v62 h-12 Z" fill="#a9784a" />
        <S d="M70 152 H250 M70 181 H250" c="#8e6038" w={1} o={0.7} />
        <S d="M96 145 q10 2 20 0 M150 172 q14 2 26 0 M190 150 q8 1 16 0" c="#8e6038" w={0.9} o={0.6} />
        <circle cx="76" cy="138" r="1.4" fill="#5a3b20" />
        <circle cx="244" cy="138" r="1.4" fill="#5a3b20" />
        <circle cx="76" cy="190" r="1.4" fill="#5a3b20" />
        <circle cx="244" cy="190" r="1.4" fill="#5a3b20" />
      </g>
      <ellipse cx="164" cy="136" rx="76" ry="5" fill="#7a5530" opacity="0.35" />
      <g filter={`url(#${id}-rough)`}>
        {/* loaf body */}
        <path d="M96 136 C92 106 122 86 168 86 C210 86 236 104 234 136 Z" fill={fur} />
        {/* body stripes */}
        <S d="M172 90 C170 100 172 110 178 118 M190 90 C188 102 192 114 200 122 M207 95 C206 106 210 118 218 126 M222 104 C222 114 225 124 230 130" c={furD} w={3.6} o={0.85} />
        {/* tail wrapping along crate edge */}
        <path d="M232 132 C236 140 226 144 200 143 C180 142 166 142 160 140 C164 134 186 136 204 136 C220 136 228 132 232 132 Z" fill={fur} />
        <S d="M216 136 v6 M202 137 v6 M188 137 v5 M174 137 v4" c={furD} w={2.6} />
        {/* tucked front paws */}
        <ellipse cx="116" cy="138" rx="12" ry="5.5" fill={furL} />
        <ellipse cx="140" cy="139" rx="12" ry="5.5" fill={furL} />
        {/* chest */}
        <path d="M108 112 C112 126 120 134 130 136 C140 134 148 126 150 112 Z" fill={furL} />
        {/* ears */}
        <path d="M96 64 C94 50 98 40 104 36 C112 40 118 48 120 54 Z" fill={fur} />
        <path d="M144 54 C148 46 156 40 164 38 C168 44 168 54 164 66 Z" fill={fur} />
        <path d="M100 60 C99 50 102 44 105 42 C110 46 113 50 114 54 Z" fill="#eaa898" />
        <path d="M149 54 C152 49 157 45 161 44 C163 49 162 55 160 62 Z" fill="#eaa898" />
        {/* big round tomcat head with jowls */}
        <path d="M90 78 C88 58 106 48 130 48 C154 48 172 58 170 78 C172 96 156 112 130 112 C104 112 88 96 90 78 Z" fill={fur} />
        <path d="M112 90 C112 82 120 80 130 83 C140 80 148 82 148 90 C148 100 140 104 130 104 C120 104 112 100 112 90 Z" fill="#f8dcb4" />
        {/* forehead + cheek stripes */}
        <S d="M120 54 L122 64 M130 52 V64 M140 54 L138 64" c={furD} w={2.6} />
        <S d="M92 80 C97 81 102 84 106 88 M94 90 C98 90 102 92 106 95 M168 80 C163 81 158 84 154 88 M166 90 C162 90 158 92 154 95" c={furD} w={2.3} />
        <S d="M96 66 C110 58 150 58 164 66" c={furL} w={1.6} o={0.8} />
      </g>
      {/* eyes: amber, slightly sleepy */}
      <path d="M110 76 C113 70 121 70 124 76 C121 80 113 80 110 76 Z" fill="#e6b13a" stroke="#6b3a14" strokeWidth="1.2" />
      <path d="M136 76 C139 70 147 70 150 76 C147 80 139 80 136 76 Z" fill="#e6b13a" stroke="#6b3a14" strokeWidth="1.2" />
      <path d="M109.5 75 C113 71 121 71 124.5 75 Z" fill={fur} />
      <path d="M135.5 75 C139 71 147 71 150.5 75 Z" fill={fur} />
      <S d="M109.5 75 C113 72 121 72 124.5 75 M135.5 75 C139 72 147 72 150.5 75" c="#6b3a14" w={1.4} />
      <ellipse cx="117" cy="76.6" rx="1.5" ry="2.6" fill="#1b1410" />
      <ellipse cx="143" cy="76.6" rx="1.5" ry="2.6" fill="#1b1410" />
      {/* nose & mouth */}
      <path d="M126 87 L134 87 L130 92 Z" fill="#d97e6e" />
      <S d="M130 92 V95 M130 95 C128 98 125 98 123 96 M130 95 C132 98 135 98 137 96" c="#6b3a14" w={1.2} />
      <S d="M120 93 C110 91 100 92 88 96 M120 96 C110 97 100 100 91 105 M140 93 C150 91 160 92 172 96 M140 96 C150 97 160 100 169 105" c="#fffaf0" w={0.8} o={0.9} />
      <rect x="150" y="88" width="84" height="48" fill={`url(#${id}-hatch)`} opacity="0.08" />
    </PetFrame>
  );
}

export const PETS: Record<string, () => ReactElement> = {
  "0219": Pepper,
  "0412": Biscuit,
  "0733": Fennimore,
  "1150": Juno,
  "0868": Sardine,
};
