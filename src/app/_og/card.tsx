import { ImageResponse } from "next/og";

/** Shared look for link-preview images (Open Graph / Twitter): the broken-needle compass on noir. */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#0b0b0d";
const INK = "#ece6d6";
const DIM = "#a59e8c";
const BRASS = "#c9a227";

/** The site's compass (7 notches, broken needle) as plain SVG, sized in px. */
export function CompassArt({ size, color = BRASS, bg = "transparent" }: { size: number; color?: string; bg?: string }) {
  const notches = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ background: bg }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      {notches.map((a) => (
        <line key={a} x1="50" y1="8" x2="50" y2="17" stroke={color} strokeWidth="3" transform={`rotate(${a} 50 50)`} />
      ))}
      <path d="M50 50 L56 24 L50 30 Z" fill={color} transform="rotate(18 50 50)" />
      <path d="M50 54 L46 70 L52 64 Z" fill={color} opacity="0.55" transform="rotate(-24 50 50)" />
      <circle cx="50" cy="50" r="3.5" fill={color} />
    </svg>
  );
}

export function ogCard({ eyebrow, title, subtitle, badge }: { eyebrow: string; title: string; subtitle?: string; badge?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 88px",
          background: `radial-gradient(circle at 26% 40%, #2a2210 0%, ${BG} 58%)`,
          color: INK,
          fontFamily: "serif",
        }}
      >
        <CompassArt size={300} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
          <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: DIM }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 26 ? 64 : 80, lineHeight: 1.08, color: INK }}>{title}</div>
          {subtitle && <div style={{ fontSize: 32, lineHeight: 1.3, color: DIM, fontStyle: "italic" }}>{subtitle}</div>}
          {badge && (
            <div style={{ display: "flex", marginTop: 12 }}>
              <div
                style={{
                  fontSize: 40,
                  letterSpacing: 6,
                  color: BG,
                  background: BRASS,
                  borderRadius: 14,
                  padding: "10px 26px",
                  fontFamily: "monospace",
                }}
              >
                {badge}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

/** Each game's colours on its result card. */
const RESULT_TONES: Record<string, { bg: string; glow: string; accent: string; line: string }> = {
  "ada-voss": { bg: BG, glow: "#2a2210", accent: BRASS, line: "#3a3220" },
  "nightingale-express": { bg: "#120c07", glow: "#3d2615", accent: "#ecd27a", line: "#4a3020" },
  "atlas-silent-worlds": { bg: "#071015", glow: "#12303a", accent: "#9fd3c7", line: "#1f3640" },
};

/** A shared result: game, ending (spoiler-free), time, team size and badges. Text only, no emoji fonts. */
export function resultCard({
  gameId,
  game,
  ending,
  stats,
  badges,
}: {
  gameId: string;
  game: string;
  ending: string;
  stats: { label: string; value: string }[];
  badges: string[];
}) {
  const tone = RESULT_TONES[gameId] ?? RESULT_TONES["ada-voss"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 80px",
          background: `radial-gradient(circle at 22% 38%, ${tone.glow} 0%, ${tone.bg} 62%)`,
          color: INK,
          fontFamily: "serif",
        }}
      >
        <CompassArt size={240} color={tone.accent} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 14 }}>
          <div style={{ fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: DIM }}>Escape Escape · Case result</div>
          <div style={{ fontSize: game.length > 26 ? 54 : 66, lineHeight: 1.08, color: INK }}>{game}</div>
          <div style={{ fontSize: 38, fontStyle: "italic", color: tone.accent }}>{ending}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{ display: "flex", flexDirection: "column", padding: "10px 22px", border: `2px solid ${tone.line}`, borderRadius: 14, background: "rgba(0,0,0,0.25)" }}
              >
                <div style={{ fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: DIM }}>{s.label}</div>
                <div style={{ fontSize: 40, fontFamily: "monospace", color: INK }}>{s.value}</div>
              </div>
            ))}
          </div>
          {badges.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {badges.slice(0, 5).map((b) => (
                <div key={b} style={{ fontSize: 22, color: tone.accent, border: `2px solid ${tone.accent}`, borderRadius: 999, padding: "4px 16px" }}>
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
