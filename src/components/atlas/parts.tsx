"use client";

import { useEffect, useState } from "react";
import type { AtlasDoc, ChartStar, GlyphId, MirrorGridDTO, ValveId } from "@/lib/atlas/types";
import { GLYPHS, glyphChar, VALVES } from "@/lib/atlas/types";
import { useT } from "@/i18n/client";

/** Seconds left until an ISO time, ticking. */
export function useSecondsUntil(iso: string | undefined | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [iso]);
  return iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000)) : 0;
}

/** Where a pattern's stars sit around its centre, in chart units. */
function starPoints(s: ChartStar): [number, number][] {
  const n = s.stars;
  switch (s.shape) {
    case "single":
      return [[0, 0]];
    case "line":
      return Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * 7, 0]);
    case "ring":
      return Array.from({ length: n }, (_, i) => [Math.cos((2 * Math.PI * i) / n) * 9, Math.sin((2 * Math.PI * i) / n) * 9]);
    case "triangle":
      return [
        [0, -7],
        [-7, 5],
        [7, 5],
      ];
    case "square":
      return [
        [-6, -6],
        [6, -6],
        [-6, 6],
        [6, 6],
      ];
    case "cross":
      return [
        [0, 0],
        [0, -8],
        [0, 8],
        [-8, 0],
        [8, 0],
      ];
  }
}

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function StarChart({ title, stars }: { title: string; stars: ChartStar[] }) {
  const t = useT();
  return (
    <figure className="rounded-xl border border-[#2c4a55] bg-[#071017] p-3">
      <figcaption className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#9fd3c7]">{title}</figcaption>
      <svg viewBox="0 0 300 300" className="mx-auto mt-2 w-full max-w-[300px]" role="img" aria-label={t("atlas.chart.aria")}>
        <circle cx="150" cy="150" r="138" fill="none" stroke="#2c4a55" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="4" fill="#f4e7b5" />
        {stars.map((s) => {
          const a = ((s.at * 30 - 90) * Math.PI) / 180;
          const cx = 150 + Math.cos(a) * 100;
          const cy = 150 + Math.sin(a) * 100;
          return (
            <g key={s.at}>
              <title>{t("atlas.chart.star", { n: s.at, stars: s.stars, shape: t(`atlas.shape.${s.shape}`) })}</title>
              {starPoints(s).map(([dx, dy], i) => (
                <circle key={i} cx={cx + dx} cy={cy + dy} r="2.6" fill="#f4e7b5" />
              ))}
              <text x={150 + Math.cos(a) * 128} y={150 + Math.sin(a) * 128 + 4} textAnchor="middle" fontSize="11" fill="#6f9aa6" fontFamily="serif">
                {NUMERALS[s.at - 1]}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function AtlasDocView({ doc }: { doc: AtlasDoc }) {
  const t = useT();
  switch (doc.kind) {
    case "note":
      return (
        <div className="space-y-2 rounded-sm bg-[#efe6cf] px-4 py-3 text-[15px] leading-relaxed text-stone-800 shadow" style={{ fontFamily: "Georgia, serif" }}>
          {doc.lines.map((l, i) => (
            <p key={i} className={i === 0 ? "italic" : undefined}>
              {l}
            </p>
          ))}
        </div>
      );
    case "plaque":
      return (
        <div className="rounded-md border-2 border-[#8a7440] bg-[#2a2416] px-4 py-3 text-center font-mono text-sm leading-relaxed tracking-wide text-[#e9d9a6]">
          {doc.lines.map((l, i) => (
            <p key={i} className={i === 0 ? "font-bold" : undefined}>
              {l}
            </p>
          ))}
        </div>
      );
    case "starchart":
      return <StarChart title={doc.title} stars={doc.stars} />;
    case "ledger":
      return (
        <div className="rounded-md border border-[#8a7440]/60 bg-[#efe6cf] px-4 py-3 text-stone-800" style={{ fontFamily: "Georgia, serif" }}>
          <p className="text-center text-xs uppercase tracking-[0.25em] text-stone-500">{doc.title}</p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500">
                <th className="py-1 font-normal">{t("atlas.ledger.place")}</th>
                <th className="py-1 text-center font-normal">{t("atlas.ledger.outer")}</th>
                <th className="py-1 text-center font-normal">{t("atlas.ledger.inner")}</th>
              </tr>
            </thead>
            <tbody>
              {doc.rows.map((r) => (
                <tr key={r.name} className="border-t border-stone-300">
                  <td className="py-1.5">{r.name}</td>
                  <td className="py-1.5 text-center text-xl">{glyphChar(r.outer)}</td>
                  <td className="py-1.5 text-center text-xl">{glyphChar(r.inner)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 border-t border-dashed border-stone-400 pt-2 text-xs italic text-stone-600">{doc.torn}</p>
        </div>
      );
    case "mirrordial":
      return <MirrorDial caption={doc.caption} hour={doc.hour} />;
    case "roots":
      return <RootLadder caption={doc.caption} pots={doc.pots} grafts={doc.grafts} rows={doc.rows} door={doc.door} />;
    case "glyph":
      return (
        <figure className="flex flex-col items-center rounded-xl border border-[#2c4a55] bg-[#071017] py-4">
          <span className="text-6xl leading-none text-[#f4e7b5]" aria-hidden>
            {glyphChar(doc.glyph)}
          </span>
          <figcaption className="mt-2 text-xs text-[#9fd3c7]">{doc.caption}</figcaption>
        </figure>
      );
  }
}

/**
 * The buried sundial as the great mirror shows it: a dial with twelve Roman hours and a shadow, the whole
 * drawing flipped left to right, numerals included (so IV reads VI, and the shadow seems to fall at VIII).
 */
function MirrorDial({ caption, hour }: { caption: string; hour: number }) {
  const t = useT();
  const at = (h: number, r: number) => {
    const a = ((h * 30 - 90) * Math.PI) / 180;
    return [150 + Math.cos(a) * r, 150 + Math.sin(a) * r];
  };
  const [sx, sy] = at(hour, 112);
  return (
    <figure className="rounded-xl border border-[#8a7440] bg-gradient-to-b from-[#3a2c14] to-[#1c140a] p-3">
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[280px]" role="img" aria-label={t("atlas.dial.aria")}>
        <g transform="translate(300 0) scale(-1 1)">
          <circle cx="150" cy="150" r="136" fill="#d9c08a" stroke="#8a7440" strokeWidth="4" />
          {NUMERALS.map((n, i) => {
            const [x, y] = at(i + 1, 116);
            return (
              <text key={n} x={x} y={y + 6} textAnchor="middle" fontSize="18" fontFamily="Georgia, serif" fill="#3a2c14">
                {n}
              </text>
            );
          })}
          <line x1="150" y1="150" x2={sx} y2={sy} stroke="#2a1f0e" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
          <circle cx="150" cy="150" r="9" fill="#8a7440" />
        </g>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-[#e9d9a6]">{caption}</figcaption>
    </figure>
  );
}

/** The Meridian plaza: tap a mirror to tilt it; the sunbeam is drawn where it goes now. */
export function MirrorGrid({ grid, busy, onTilt }: { grid: MirrorGridDTO; busy: boolean; onTilt: (i: number) => void }) {
  const t = useT();
  const cell = 52;
  const pad = 30;
  const cx = (x: number) => pad + x * cell + cell / 2;
  const cy = (y: number) => pad + y * cell + cell / 2;
  const width = pad * 2 + grid.w * cell;
  const height = pad * 2 + grid.h * cell;
  const beam = [[pad - 26, cy(0)] as [number, number], ...grid.path.map(([x, y]) => [cx(x), cy(y)] as [number, number])];
  // The beam leaves the grid one step past the last cell, or stops at a pillar.
  if (grid.path.length > 1) {
    const [lx, ly] = grid.path[grid.path.length - 1];
    const [px, py] = grid.path[grid.path.length - 2];
    const [dx, dy] = [lx - px, ly - py];
    const next: [number, number] = [lx + dx, ly + dy];
    if (!grid.pillars.some(([x, y]) => x === next[0] && y === next[1])) beam.push([cx(lx) + (dx * cell) / 1.4, cy(ly) + (dy * cell) / 1.4]);
  }
  return (
    <figure className="rounded-xl border border-[#8a7440] bg-[#1c140a] p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-[320px]" role="group" aria-label={t("atlas.mirrors.aria")}>
        <rect x={pad} y={pad} width={grid.w * cell} height={grid.h * cell} fill="#3a2c14" />
        {Array.from({ length: grid.w + 1 }, (_, i) => (
          <line key={`v${i}`} x1={pad + i * cell} y1={pad} x2={pad + i * cell} y2={pad + grid.h * cell} stroke="#4d3b1c" />
        ))}
        {Array.from({ length: grid.h + 1 }, (_, i) => (
          <line key={`h${i}`} x1={pad} y1={pad + i * cell} x2={pad + grid.w * cell} y2={pad + i * cell} stroke="#4d3b1c" />
        ))}
        {/* the slit and the sun door */}
        <rect x={0} y={cy(0) - 8} width={pad - 6} height={16} fill="#f4e7b5" opacity="0.8" />
        <rect x={cx(grid.door) - 18} y={pad + grid.h * cell + 4} width={36} height={pad - 8} rx={3} fill={grid.lit ? "#ffd75e" : "#8a7440"} stroke="#f4e7b5" />
        {grid.pillars.map(([x, y]) => (
          <circle key={`p${x}${y}`} cx={cx(x)} cy={cy(y)} r={15} fill="#6b5a3a" stroke="#2a1f0e" strokeWidth="3" />
        ))}
        <polyline points={beam.map((p) => p.join(",")).join(" ")} fill="none" stroke="#fff1a8" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
        {grid.mirrors.map((m, i) => {
          const d = 17;
          const [x1, y1, x2, y2] = m.back ? [cx(m.x) - d, cy(m.y) - d, cx(m.x) + d, cy(m.y) + d] : [cx(m.x) - d, cy(m.y) + d, cx(m.x) + d, cy(m.y) - d];
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cfe3ea" strokeWidth="6" strokeLinecap="round" />
              <rect
                x={cx(m.x) - cell / 2}
                y={cy(m.y) - cell / 2}
                width={cell}
                height={cell}
                fill="transparent"
                role="button"
                tabIndex={grid.lit ? -1 : 0}
                aria-label={t("atlas.mirrors.mirror", { n: i + 1, way: m.back ? "\\" : "/" })}
                aria-disabled={busy || grid.lit}
                className={grid.lit ? undefined : "cursor-pointer"}
                onClick={() => !busy && !grid.lit && onTilt(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !busy && !grid.lit && onTilt(i)}
              />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/** The Verdant roots as a ladder: seven roots straight down, grafts joining neighbours, the little door below one. */
function RootLadder({ caption, pots, grafts, rows, door }: { caption: string; pots: GlyphId[]; grafts: [number, number][]; rows: number; door: number }) {
  const t = useT();
  const x = (c: number) => 24 + c * 42;
  const y = (r: number) => 52 + r * 26 + 13;
  const bottom = 52 + rows * 26;
  return (
    <figure className="rounded-xl border border-[#3c5a2f] bg-[#0d150b] p-3">
      <svg viewBox={`0 0 300 ${bottom + 46}`} className="mx-auto w-full max-w-[320px]" role="img" aria-label={t("atlas.roots.aria")}>
        {pots.map((p, c) => (
          <g key={p}>
            <rect x={x(c) - 15} y={6} width={30} height={30} rx={5} fill="#6b4a2b" />
            <text x={x(c)} y={28} textAnchor="middle" fontSize="17" fill="#f4e7b5">
              {glyphChar(p)}
            </text>
            <line x1={x(c)} y1={36} x2={x(c)} y2={bottom} stroke="#a07a4c" strokeWidth="4" strokeLinecap="round" />
          </g>
        ))}
        {grafts.map(([r, l], i) => (
          <line key={i} x1={x(l)} y1={y(r)} x2={x(l + 1)} y2={y(r)} stroke="#a07a4c" strokeWidth="4" strokeLinecap="round" />
        ))}
        {pots.map((p, c) =>
          c === door ? (
            <g key={p}>
              <rect x={x(c) - 14} y={bottom + 4} width={28} height={36} rx={3} fill="#3b2a18" stroke="#d8b56a" strokeWidth="2" />
              <circle cx={x(c) + 7} cy={bottom + 23} r={2} fill="#d8b56a" />
            </g>
          ) : (
            <ellipse key={p} cx={x(c)} cy={bottom + 8} rx={10} ry={5} fill="#2a2016" />
          ),
        )}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-[#b8d4a4]">{caption}</figcaption>
    </figure>
  );
}

/** The Pelagic airlock's tanks, drawn as glass columns: capacity in outline, water filled to its level. */
export function TankPanel({ tanks }: { tanks: { caps: number[]; levels: number[]; balanced: boolean } }) {
  const t = useT();
  const names = ["atlas.tank.big", "atlas.tank.pressure", "atlas.tank.small"];
  const unit = 20;
  return (
    <div className="flex items-end justify-center gap-4 rounded-xl border border-[#2c5a55] bg-[#071a1a] p-4" role="img" aria-label={t("atlas.tanks.aria", { a: tanks.levels[0], b: tanks.levels[1], c: tanks.levels[2] })}>
      {tanks.caps.map((cap, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="font-mono text-sm text-[#d6f2ec]">
            {tanks.levels[i]}/{cap}
          </span>
          <div className={`relative w-14 rounded-b-md border-2 ${i === 1 ? "border-[#d8b56a]" : "border-[#6f9aa6]"}`} style={{ height: cap * unit }}>
            <div className="absolute inset-x-0 bottom-0 rounded-b-sm bg-[#2f8f8a]/80 transition-all" style={{ height: tanks.levels[i] * unit }} />
          </div>
          <span className={`text-[11px] uppercase tracking-wider ${i === 1 ? "text-[#f4e7b5]" : "text-stone-400"}`}>{t(names[i])}</span>
        </div>
      ))}
    </div>
  );
}

/** The three Waterworks valves: tap one to turn it open or shut. */
export function ValvePanel({ valves, busy, onTurn }: { valves: Record<ValveId, boolean>; busy: boolean; onTurn: (v: ValveId) => void }) {
  const t = useT();
  return (
    <div className="grid grid-cols-3 gap-2">
      {VALVES.map((v) => {
        const open = valves[v];
        const name = t(`atlas.valve.${v}`);
        const state = t(open ? "atlas.valve.open" : "atlas.valve.shut");
        return (
          <button
            key={v}
            type="button"
            disabled={busy}
            onClick={() => onTurn(v)}
            aria-label={t("atlas.valve.turn", { valve: name, state })}
            className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 disabled:opacity-60 ${
              open ? "border-[#9fd3c7] bg-[#12343a] text-[#d6f2ec]" : "border-[#2c4a55] bg-[#0b1a1f] text-stone-300"
            }`}
          >
            <span className={`text-3xl transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
              🛞
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">{name}</span>
            <span className="text-[11px]">{state}</span>
          </button>
        );
      })}
    </div>
  );
}

/** One gate ring: seven glyph buttons, one chosen. */
export function RingPicker({ label, value, onChange }: { label: string; value: GlyphId; onChange: (g: GlyphId) => void }) {
  const t = useT();
  return (
    <fieldset>
      <legend className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#9fd3c7]">{label}</legend>
      <div className="grid grid-cols-7 gap-1">
        {GLYPHS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={value === g.id}
            aria-label={t("atlas.gate.pick", { ring: label, glyph: g.char })}
            onClick={() => onChange(g.id)}
            className={`flex h-11 items-center justify-center rounded-md border text-xl ${
              value === g.id ? "border-[#f4e7b5] bg-[#3a3320] text-[#f4e7b5]" : "border-[#2c4a55] bg-[#0b1a1f] text-stone-300"
            }`}
          >
            {g.char}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** The Threshold's two rings and lever. Glyphs are sent by id; their values never reach the client. */
export function GatePanel({
  powered,
  jammedUntil,
  busy,
  onPull,
}: {
  powered: boolean;
  jammedUntil?: string;
  busy: boolean;
  onPull: (outer: GlyphId, inner: GlyphId) => void;
}) {
  const t = useT();
  const [outer, setOuter] = useState<GlyphId>(GLYPHS[0].id);
  const [inner, setInner] = useState<GlyphId>(GLYPHS[0].id);
  const wait = useSecondsUntil(jammedUntil);
  return (
    <div className={`space-y-3 rounded-xl border p-3 ${powered ? "border-[#9fd3c7]/60 bg-[#0d2228]" : "border-[#2c4a55] bg-[#0b1418] opacity-80"}`}>
      <RingPicker label={t("atlas.gate.outer")} value={outer} onChange={setOuter} />
      <RingPicker label={t("atlas.gate.inner")} value={inner} onChange={setInner} />
      <button
        type="button"
        disabled={busy || wait > 0}
        onClick={() => onPull(outer, inner)}
        className="min-h-12 w-full rounded-lg bg-[#d8b56a] font-semibold text-[#14110a] active:bg-[#f4e7b5] disabled:opacity-60"
      >
        {wait > 0 ? t("atlas.gate.jammed", { s: wait }) : powered ? t("atlas.gate.lever") : `${t("atlas.gate.lever")} · ${t("atlas.gate.unpowered")}`}
      </button>
    </div>
  );
}
