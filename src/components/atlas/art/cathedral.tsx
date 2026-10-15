import { BRASS_DK, Backdrop, GlyphRing, Vignette, type WallState } from "./common";
// ---------------------------------------------------------------- the Null Cathedral

export function CathedralNave({ s }: { s: WallState }) {
  const convened = s.flags.includes("core.convened");
  const rerouted = s.flags.includes("core.rerouted");
  return (
    <>
      <Backdrop wall={["#1d1528", "#06040a"]} floor="#0e0a14" light="#c9b6ff" />
      {/* pointed arches */}
      {[40, 150, 260].map((x) => (
        <path key={x} d={`M${x - 40} 330 V110 Q${x} 20 ${x + 40} 110 V330`} stroke="#2a2238" strokeWidth="6" fill="none" />
      ))}
      {/* the Atlas Core: a sphere of turning rings */}
      <circle cx="150" cy="190" r="110" fill="url(#at-teal-glow)" opacity={convened ? 0.5 : 0.3} />
      <g className="motion-safe:animate-spin" style={{ transformOrigin: "150px 190px", animationDuration: convened ? "40s" : "18s" }}>
        <ellipse cx="150" cy="190" rx="90" ry="90" fill="none" stroke="url(#at-brass)" strokeWidth="4" />
        <ellipse cx="150" cy="190" rx="90" ry="30" fill="none" stroke="url(#at-brass)" strokeWidth="3" />
        <ellipse cx="150" cy="190" rx="30" ry="90" fill="none" stroke="url(#at-brass)" strokeWidth="3" />
        <ellipse cx="150" cy="190" rx="70" ry="70" fill="none" stroke={rerouted ? "#9ff3e4" : BRASS_DK} strokeWidth="2" transform="rotate(45 150 190)" />
      </g>
      <circle cx="150" cy="190" r="16" fill={rerouted ? "#9ff3e4" : "#f0d98a"} />
      <circle cx="150" cy="190" r="34" fill="url(#at-glow)" />
      <Vignette />
    </>
  );
}

export function CathedralDoor() {
  return (
    <>
      <Backdrop wall={["#1d1528", "#06040a"]} floor="#0e0a14" light="#c9b6ff" />
      {/* the lectern and Corin's page */}
      <path d="M86 330 V230" stroke="url(#at-wood)" strokeWidth="10" />
      <path d="M44 230 L86 206 L128 230 V240 H44 Z" fill="#3b2414" stroke="#111" />
      <rect x="56" y="214" width="58" height="20" fill="url(#at-paper)" transform="rotate(-6 86 224)" />
      <circle cx="86" cy="200" r="40" fill="url(#at-glow)" opacity="0.4" />
      {/* the black gate home */}
      <circle cx="215" cy="200" r="64" fill="#050308" stroke="#2a2238" strokeWidth="14" />
      <GlyphRing cx={215} cy={200} r={48} size={11} fill="#6a5a8a" />
      <Vignette />
    </>
  );
}
