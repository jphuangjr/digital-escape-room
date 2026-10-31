"use client";

import { useCallback, useEffect, useState } from "react";
import type { AtlasSceneDTO, HotspotId, LocationId } from "@/lib/atlas/types";
import { HOTSPOT_WALL, LOCATIONS, WALLS } from "@/lib/atlas/types";
import type { GameCtx } from "@/lib/client/game";
import { NotesApp } from "@/components/apps/NotesApp";
import { useT } from "@/i18n/client";
import { AtlasDocView } from "./parts";
import { AtlasItemIcon } from "./items";
import { isLetter, LETTERS, lettersHeld, LetterView } from "./story";

/**
 * The player's notebook for The Atlas of Silent Worlds: "Clues", which keeps everything they've read (each close-up
 * with words on it, and every thing the team holds that can be read), and "My notes", Ada's Notes app. It opens on
 * its own from the header, or docked beside a close-up so a clue can sit next to the puzzle it solves.
 */

const placeOf = (h: HotspotId): LocationId => LOCATIONS.find((p) => (WALLS[p] as string[]).includes(HOTSPOT_WALL[h]))!;

/** The close-ups this player has looked at in this room, remembered on this device (newest last). */
export function useSeenClues(code: string) {
  const key = `atlas_seen_${code}`;
  const [seen, setSeen] = useState<HotspotId[]>([]);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
      if (Array.isArray(raw)) setSeen(raw.filter((h): h is HotspotId => typeof h === "string" && h in HOTSPOT_WALL));
    } catch {}
  }, [key]);
  const mark = useCallback(
    (h: HotspotId) =>
      setSeen((s) => {
        if (s.includes(h)) return s;
        const next = [...s, h];
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      }),
    [key],
  );
  return { seen, mark };
}

/** Whether the notebook stays docked under close-ups, remembered on this device. */
export function useDockedNotes() {
  const key = "atlas_notes_docked";
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    try {
      setDocked(localStorage.getItem(key) === "1");
    } catch {}
  }, []);
  const set = useCallback((on: boolean) => {
    setDocked(on);
    try {
      localStorage.setItem(key, on ? "1" : "0");
    } catch {}
  }, []);
  return [docked, set] as const;
}

type Tab = "clues" | "mine";

export function AtlasNotebook({ ctx, scene, seen, current }: { ctx: GameCtx; scene: AtlasSceneDTO; seen: HotspotId[]; current?: HotspotId }) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("clues");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label={t("atlas.notebook.title")} className="grid shrink-0 grid-cols-2 gap-1 px-3 pt-2">
        {(["clues", "mine"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-10 rounded-md text-sm ${tab === k ? "bg-[#1f3640] text-[#f4e7b5]" : "text-stone-400 active:bg-[#0f2129]"}`}
          >
            {t(k === "clues" ? "atlas.notebook.clues" : "atlas.notebook.mine")}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">{tab === "clues" ? <Clues scene={scene} seen={seen} current={current} /> : <NotesApp ctx={ctx} tags={[]} />}</div>
    </div>
  );
}

function Clues({ scene, seen, current }: { scene: AtlasSceneDTO; seen: HotspotId[]; current?: HotspotId }) {
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);
  // Newest first within each place; the close-up being worked on isn't repeated beside itself.
  const clues = [...seen]
    .reverse()
    .filter((h) => h !== current)
    .flatMap((h) => {
      const c = scene.closeups[h];
      return c && (c.doc || c.lines.length > 0) ? [{ id: h, place: placeOf(h), c }] : [];
    });
  // The story first: the Cartographers' letters, and Corin's last page once it's been read.
  const letters = lettersHeld(scene.inventory);
  const lectern = clues.find((c) => c.id === "lectern");
  const placeClues = clues.filter((c) => c.id !== "lectern");
  const readable = scene.inventory.filter((i) => i.reading && !isLetter(i.id));
  const places = scene.places.filter((p) => placeClues.some((c) => c.place === p.id));

  if (clues.length === 0 && readable.length === 0 && letters.length === 0) return <p className="px-4 py-4 text-sm text-stone-400">{t("atlas.notebook.empty")}</p>;
  const row = (key: string, title: React.ReactNode, body: React.ReactNode) => (
    <li key={key} className="rounded-lg border border-[#1f3640] bg-[#0b161b]">
      <button
        type="button"
        aria-expanded={open === key}
        onClick={() => setOpen((o) => (o === key ? null : key))}
        className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm text-stone-100 active:bg-[#0f2129]"
      >
        <span className="min-w-0 flex-1">{title}</span>
        <span className="text-stone-500" aria-hidden>
          {open === key ? "−" : "+"}
        </span>
      </button>
      {open === key && <div className="space-y-2 px-3 pb-3">{body}</div>}
    </li>
  );
  return (
    <div className="h-full space-y-3 overflow-y-auto px-3 pb-3 pt-2">
      {(letters.length > 0 || lectern) && (
        <section>
          <h3 className="mb-1.5 font-mono text-10px uppercase tracking-[0.25em] text-[#d8b56a]">
            {t("atlas.notebook.story", { n: letters.length, total: LETTERS.length })}
          </h3>
          <ul className="space-y-1.5">
            {letters.map((l) =>
              row(
                `letter:${l.id}`,
                <span className="flex items-center gap-2">
                  <AtlasItemIcon id={l.id} className="h-6 w-6 shrink-0" />
                  {l.reading!.title}
                </span>,
                <LetterView letter={l} />,
              ),
            )}
            {lectern &&
              row(
                "lectern",
                lectern.c.title,
                <>
                  {lectern.c.lines.map((line, i) => (
                    <p key={i} className="text-14px leading-relaxed text-stone-300">
                      {line}
                    </p>
                  ))}
                  {lectern.c.doc && <AtlasDocView doc={lectern.c.doc} />}
                </>,
              )}
          </ul>
        </section>
      )}
      {readable.length > 0 && (
        <section>
          <h3 className="mb-1.5 font-mono text-10px uppercase tracking-[0.25em] text-stone-500">{t("atlas.notebook.things")}</h3>
          <ul className="space-y-1.5">
            {readable.map((i) =>
              row(
                `item:${i.id}`,
                <span className="flex items-center gap-2">
                  <AtlasItemIcon id={i.id} className="h-6 w-6 shrink-0" />
                  {i.name}
                </span>,
                <AtlasDocView doc={{ kind: "note", lines: [i.reading!.title, ...i.reading!.lines] }} />,
              ),
            )}
          </ul>
        </section>
      )}
      {places.map((p) => (
        <section key={p.id}>
          <h3 className="mb-1.5 font-mono text-10px uppercase tracking-[0.25em] text-stone-500">{p.name}</h3>
          <ul className="space-y-1.5">
            {placeClues
              .filter((c) => c.place === p.id)
              .map(({ id, c }) =>
                row(
                  id,
                  c.title,
                  <>
                    {c.lines.map((l, i) => (
                      <p key={i} className="text-14px leading-relaxed text-stone-300">
                        {l}
                      </p>
                    ))}
                    {c.doc && <AtlasDocView doc={c.doc} />}
                  </>,
                ),
              )}
          </ul>
        </section>
      ))}
    </div>
  );
}
