"use client";

import { useState } from "react";
import type { CloseupDoc, ItemDTO, ItemId } from "@/lib/train/types";

/** Small drawings of the things you can carry. */
export function ItemIcon({ id, className = "h-10 w-10" }: { id: ItemId; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {id === "pouch" && (
        <g>
          <path d="M12 32 q-6 -14 6 -20 h4 q12 6 6 20 z" fill="#22336e" />
          <path d="M14 13 q6 -6 12 0" stroke="#c9a227" strokeWidth="2" fill="none" />
          <circle cx="27" cy="12" r="2" fill="#c9a227" />
        </g>
      )}
      {id === "washstand-key" && (
        <g>
          <circle cx="13" cy="20" r="6" fill="none" stroke="#c9a227" strokeWidth="3" />
          <path d="M19 20 H33 M28 20 V25 M32 20 V24" stroke="#c9a227" strokeWidth="3" />
          <rect x="22" y="6" width="12" height="7" rx="1" fill="#efe6d2" transform="rotate(12 28 9)" />
        </g>
      )}
      {id === "screwdriver" && (
        <g transform="rotate(-40 20 20)">
          <rect x="6" y="16" width="14" height="8" rx="3" fill="#a3302a" />
          <rect x="20" y="18.5" width="14" height="3" fill="#c8c8c8" />
          <path d="M34 18.5 l3 1.5 -3 1.5 z" fill="#c8c8c8" />
        </g>
      )}
      {(id === "telegram-left" || id === "telegram-right" || id === "telegram") && (
        <g>
          <path
            d={
              id === "telegram-left"
                ? "M6 8 H22 l-2 4 3 4 -3 4 3 4 -3 4 3 4 -1 4 H6 Z"
                : id === "telegram-right"
                  ? "M18 8 H34 V36 H19 l1 -4 -3 -4 3 -4 -3 -4 3 -4 -3 -4 3 -4 z"
                  : "M6 8 H34 V36 H6 Z"
            }
            fill="#f3e9c6"
            stroke="#b8a46a"
          />
          <path d="M10 14 H30 M10 19 H30 M10 24 H28 M10 29 H24" stroke="#6b6250" strokeWidth="1.2" />
        </g>
      )}
      {id === "cufflink" && (
        <g>
          <ellipse cx="20" cy="18" rx="10" ry="8" fill="#e3bf4a" stroke="#8a6b1a" />
          <text x="20" y="21" textAnchor="middle" fontSize="7" fontFamily="Georgia, serif" fill="#6b4f0d">
            R.C.
          </text>
          <path d="M20 26 V33 M15 33 H25" stroke="#8a6b1a" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

export function ItemReading({ item }: { item: ItemDTO }) {
  if (!item.reading) return null;
  const telegram = item.id.startsWith("telegram");
  return (
    <div
      className={`mt-3 rounded-sm p-4 shadow-inner ${telegram ? "bg-[#f3e9c6] text-[#3a3020]" : "bg-[#efe6d2] text-stone-900"}`}
      style={{ fontFamily: telegram ? "'Courier New', ui-monospace, monospace" : "Georgia, serif" }}
    >
      {telegram && <p className="mb-2 text-center text-[11px] font-bold tracking-[0.3em] text-[#8a6b1a]">RAILWAY TELEGRAPH</p>}
      {item.reading.lines.map((l, i) => (
        <p key={i} className="text-sm font-semibold uppercase leading-relaxed tracking-wide">
          {l}
        </p>
      ))}
    </div>
  );
}

/** A close-up's read-out, styled as the real object. */
export function CloseupDocView({ doc }: { doc: CloseupDoc }) {
  const [side, setSide] = useState<"front" | "back">("front");
  if (doc.kind === "newspaper") {
    return (
      <div className="rounded-sm bg-[#efe6d2] p-4 text-stone-900 shadow-inner" style={{ fontFamily: "Georgia, serif" }}>
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setSide(side === "front" ? "back" : "front")}
            className="min-h-9 rounded border border-stone-500 px-3 text-xs font-semibold text-stone-700 active:bg-stone-300"
          >
            {side === "front" ? "Turn to the back page →" : "← Front page"}
          </button>
        </div>
        {side === "front" ? (
          <>
            <p className="border-b-2 border-double border-stone-700 pb-1 text-center text-xl font-bold uppercase tracking-wide">{doc.masthead}</p>
            <p className="mt-1 text-center text-[11px] italic text-stone-600">{doc.date}</p>
            <h3 className="mt-3 text-lg font-bold leading-snug">{doc.headline}</h3>
            {doc.column.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed">
                {p}
              </p>
            ))}
          </>
        ) : (
          <>
            <p className="text-center text-sm font-bold uppercase tracking-[0.15em]">{doc.timetableTitle}</p>
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr>
                  {doc.timetable[0].map((h) => (
                    <th key={h} className="border-b border-stone-700 py-1 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doc.timetable.slice(1).map((row) => (
                  <tr key={row[0]} className="border-b border-stone-400/60">
                    {row.map((c, i) => (
                      <td key={i} className={`py-1.5 ${i > 0 ? "font-mono" : ""}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  }
  if (doc.kind === "tag") {
    return (
      <div className="mx-auto w-56 -rotate-2 rounded-md border border-[#b8ad92] bg-[#efe6d2] px-4 py-3 text-center text-stone-800 shadow" style={{ fontFamily: "'Courier New', monospace" }}>
        <div className="mx-auto mb-2 h-3 w-3 rounded-full border-2 border-[#b8ad92]" />
        {doc.lines.map((l, i) => (
          <p key={i} className={i === 0 ? "text-xs tracking-widest" : "mt-1 text-base font-bold"}>
            {l}
          </p>
        ))}
      </div>
    );
  }
  if (doc.kind === "note") {
    return (
      <div className="mx-auto w-64 rotate-1 rounded-sm bg-[#f7f2e4] px-4 py-3 text-stone-800 shadow" style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}>
        {doc.lines.map((l, i) => (
          <p key={i} className="text-base leading-relaxed">
            {l}
          </p>
        ))}
      </div>
    );
  }
  // mirror
  return (
    <div className="mx-auto flex h-44 w-32 items-center justify-center rounded-[50%] border-4 border-[#c9a227] bg-gradient-to-br from-[#c9d4da] via-[#8fa0aa] to-[#b8c4ca]">
      {doc.fogged && (
        <div className="flex h-full w-full items-center justify-center rounded-[50%] bg-white/70">
          <span className="-scale-x-100 text-2xl text-slate-500" style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}>
            {doc.letters}
          </span>
        </div>
      )}
    </div>
  );
}

/** A brass combination dial: one wheel per digit, nudged up and down. */
export function LockDial({
  length,
  label,
  busy,
  shake,
  onTry,
}: {
  length: number;
  label: string;
  busy: boolean;
  shake: boolean;
  onTry: (code: string) => void;
}) {
  const [digits, setDigits] = useState<number[]>(() => Array.from({ length }, () => 0));
  const bump = (i: number, d: number) => setDigits((ds) => ds.map((v, j) => (j === i ? (v + d + 10) % 10 : v)));
  return (
    <div className="rounded-xl border border-[#c9a227]/50 bg-[#1b120b] p-4">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#c9a227]">{label}</p>
      <div className={`mt-3 flex justify-center gap-2 ${shake ? "nx-shake" : ""}`}>
        {digits.map((v, i) => (
          <div key={i} className="flex flex-col items-center">
            <button
              type="button"
              aria-label={`Wheel ${i + 1} up`}
              onClick={() => bump(i, 1)}
              className="flex h-10 w-12 items-center justify-center rounded-t-md bg-[#3d2615] text-[#ecd27a] active:bg-[#5b3a22]"
            >
              ▲
            </button>
            <output
              aria-label={`Wheel ${i + 1}`}
              className="flex h-14 w-12 items-center justify-center border-y border-[#7a5f12] bg-gradient-to-b from-[#ecd27a] via-[#c9a227] to-[#8a6b1a] font-mono text-3xl font-bold text-[#1b120b]"
            >
              {v}
            </output>
            <button
              type="button"
              aria-label={`Wheel ${i + 1} down`}
              onClick={() => bump(i, -1)}
              className="flex h-10 w-12 items-center justify-center rounded-b-md bg-[#3d2615] text-[#ecd27a] active:bg-[#5b3a22]"
            >
              ▼
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => onTry(digits.join(""))}
        className="mt-4 min-h-11 w-full rounded-md bg-[#c9a227] font-semibold text-[#1b120b] active:bg-[#ecd27a] disabled:opacity-60"
      >
        {busy ? "Trying…" : "Try the lock"}
      </button>
    </div>
  );
}
