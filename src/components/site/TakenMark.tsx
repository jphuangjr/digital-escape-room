/** A diagonal stroke across an avatar color another player in the room already has. */
export function TakenMark() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-black/80" aria-hidden>
      <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
