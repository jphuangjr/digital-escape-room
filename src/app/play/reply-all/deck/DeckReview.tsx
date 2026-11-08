"use client";

import { useState } from "react";
import Link from "next/link";
import { capitalize } from "@/lib/replyall/types";

type Tab = "prompts" | "replies";

/** The whole Reply All deck, numbered by card index (the number a game stores), with a search box. */
export function DeckReview({ prompts, replies }: { prompts: string[]; replies: string[] }) {
  const [tab, setTab] = useState<Tab>("prompts");
  const [q, setQ] = useState("");
  const cards = tab === "prompts" ? prompts : replies;
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
            {prompts.length} prompts and {replies.length} replies. Numbers are the card&apos;s position in the deck: new cards go at
            the end, and changing the wording of a card is safe, but removing one shifts every number after it.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-edge flex flex-col gap-3 bg-slate-950/95 px-edge py-3 backdrop-blur">
          <div className="flex gap-2" role="tablist">
            {(["prompts", "replies"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`min-h-11 flex-1 rounded-xl border text-sm font-semibold ${tab === t ? "border-sky-300 bg-sky-300/10 text-sky-300" : "border-slate-700"}`}
              >
                {t === "prompts" ? `Prompts (${prompts.length})` : `Replies (${replies.length})`}
              </button>
            ))}
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
              {tab === "prompts" ? (
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
