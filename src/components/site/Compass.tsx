/** Broken-needle compass with 7 notches: the site's motif. */
export function Compass({ className = "" }: { className?: string }) {
  const notches = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
      {notches.map((a) => (
        <line
          key={a}
          x1="50"
          y1="8"
          x2="50"
          y2="16"
          stroke="currentColor"
          strokeWidth="2.5"
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      <path d="M50 50 L56 24 L50 30 Z" fill="currentColor" transform="rotate(18 50 50)" />
      <path d="M50 54 L46 70 L52 64 Z" fill="currentColor" opacity="0.55" transform="rotate(-24 50 50)" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

