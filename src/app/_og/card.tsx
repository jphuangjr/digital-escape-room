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
