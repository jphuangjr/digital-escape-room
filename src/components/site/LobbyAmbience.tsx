/** The lobby's moving backdrop: a searchlight beam, dust drifting through it, fog along the floor (CSS in globals.css). */

// Fixed positions, so server and client render the same motes.
const MOTES = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: `${(r(1) * 100).toFixed(1)}%`,
    size: 1.5 + r(2) * 2.5,
    dur: 16 + r(3) * 18,
    delay: -r(4) * 30,
    dx: (r(5) - 0.5) * 80,
    o: 0.2 + r(6) * 0.45,
  };
});

export function LobbyAmbience() {
  return (
    <div className="lb-ambience" aria-hidden>
      <div className="lb-beam" />
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="lb-mote"
          style={
            {
              left: m.left,
              width: m.size,
              height: m.size,
              "--dur": `${m.dur.toFixed(1)}s`,
              "--delay": `${m.delay.toFixed(1)}s`,
              "--dx": `${m.dx.toFixed(0)}px`,
              "--o": m.o.toFixed(2),
            } as React.CSSProperties
          }
        />
      ))}
      <div className="lb-fog" />
    </div>
  );
}
