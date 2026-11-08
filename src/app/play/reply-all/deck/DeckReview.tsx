"use client";

import { useState } from "react";
import Link from "next/link";
import { capitalize } from "@/lib/replyall/types";

export interface Deck {
  key: string;
  label: string;
  kind: "prompt" | "reply";
  cards: string[];
  /** The 18+ After Hours add-on. */
  adult?: boolean;
}

/** The whole Reply All deck, one tab per list, numbered by position (what a game stores), with a search box. */
export function DeckReview({ decks }: { decks: Deck[] }) {
  const [tabKey, setTab] = useState(decks[0].key);
  const [q, setQ] = useState("");
  const deck = decks.find((d) => d.key === tabKey) ?? decks[0];
  const tab = deck.kind === "prompt" ? "prompts" : "replies";
  const cards = deck.cards;
  const needle = q.trim().toLowerCase();
  const shown = cards.map((text, i) => ({ i, text })).filter((c) => !needle || c.text.toLowerCase().includes(needle));

  return (
    <main className="min-h-dvh bg-slate-950 px-edge pt-edge pb-10 text-slate-100 pt-safe pb-safe">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <Link href="/play/reply-all" className="inline-flex min-h-11 items-center self-start text-sm text-slate-400">
          ← Reply All
        </Link>
        <header>
          <p className="font-mono text-11px uppercase tracking-[0.3em] text-amber-300">Admin · deck review</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">The Reply All deck</h1>
          <p className="mt-2 text-sm text-slate-400">
            {decks.filter((d) => !d.adult).map((d) => `${d.cards.length} ${d.label.toLowerCase()}`).join(" and ")}, plus the 18+
            After Hours add-on ({decks.filter((d) => d.adult).map((d) => `${d.cards.length} ${d.kind === "prompt" ? "prompts" : "replies"}`).join(", ")}),
            which hosts can switch on in the lobby. Numbers are the card&apos;s position in the deck: new cards go at
            the end, and changing the wording of a card is safe, but removing one shifts every number after it.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-edge flex flex-col gap-3 bg-slate-950/95 px-edge py-3 backdrop-blur">
          <div className="grid grid-cols-2 gap-2" role="tablist">
            {decks.map((d) => {
              const on = d.key === deck.key;
              const tone = d.adult ? "border-rose-400 bg-rose-400/10 text-rose-300" : "border-sky-300 bg-sky-300/10 text-sky-300";
              return (
                <button
                  key={d.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(d.key)}
                  className={`min-h-11 rounded-xl border px-2 text-sm font-semibold ${on ? tone : "border-slate-700"}`}
                >
                  {d.label} ({d.cards.length})
                </button>
              );
            })}
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${tab}`}
            className="min-h-12 rounded-xl border border-slate-700 bg-slate-900 px-3 text-base outline-none focus:border-sky-300"
          />
          {needle && <p className="text-xs text-slate-400">{shown.length} matching</p>}
        </div>

        <ol className="flex flex-col gap-2">
          {shown.map((c) => (
            <li key={c.i} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <span className="w-9 shrink-0 pt-0.5 text-right font-mono text-xs text-slate-500">{c.i + 1}</span>
              {deck.kind === "prompt" ? (
                <span className="font-semibold leading-snug">
                  {c.text.split("____").map((piece, j, all) => (
                    <span key={j}>
                      {piece}
                      {j < all.length - 1 && <span className="mx-0.5 inline-block w-12 border-b-2 border-sky-300 align-baseline" />}
                    </span>
                  ))}
                  {!c.text.includes("____") && <span className="ml-2 text-xs font-normal text-slate-500">(question)</span>}
                </span>
              ) : (
                <span className="font-semibold leading-snug">{capitalize(c.text)}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
