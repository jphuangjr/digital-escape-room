"use client";

import { useEffect, useState } from "react";
import type { AtlasDoc, ChartStar, GlyphId, ValveId } from "@/lib/atlas/types";
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
  const ring = (label: string, value: GlyphId, set: (g: GlyphId) => void) => (
    <fieldset>
      <legend className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#9fd3c7]">{label}</legend>
      <div className="grid grid-cols-7 gap-1">
        {GLYPHS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={value === g.id}
            aria-label={t("atlas.gate.pick", { ring: label, glyph: g.char })}
            onClick={() => set(g.id)}
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
  return (
    <div className={`space-y-3 rounded-xl border p-3 ${powered ? "border-[#9fd3c7]/60 bg-[#0d2228]" : "border-[#2c4a55] bg-[#0b1418] opacity-80"}`}>
      {ring(t("atlas.gate.outer"), outer, setOuter)}
      {ring(t("atlas.gate.inner"), inner, setInner)}
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
