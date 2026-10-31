"use client";

import { useCallback, useEffect, useState } from "react";
import type { HotspotId, SceneDTO, WallId } from "@/lib/train/types";
import { WALLS_12B, WALLS_DINING } from "@/lib/train/types";
import type { GameCtx } from "@/lib/client/game";
import { NotesApp } from "@/components/apps/NotesApp";
import { useT } from "@/i18n/client";
import { CloseupDocView, ItemIcon, ItemReading } from "./parts";
import { HOTSPOTS } from "./walls";

/**
 * The player's notebook on the Nightingale Express: "Clues", which keeps everything they've read (each close-up with
 * words on it, by carriage, and every readable thing the team holds), and "My notes", Ada's Notes app. It opens on
 * its own from the tab bar, or docked beside a close-up so a clue can sit next to the lock it opens.
 */

const wallOf = (h: HotspotId): WallId | null => (Object.keys(HOTSPOTS) as WallId[]).find((w) => HOTSPOTS[w].some((s) => s.id === h)) ?? null;
const ROOMS = [
  { key: "12b", walls: WALLS_12B },
  { key: "dining", walls: WALLS_DINING },
] as const;

/** The close-ups this player has looked at in this room, remembered on this device (newest last). */
export function useSeenClues(code: string) {
  const key = `nx_seen_${code}`;
  const [seen, setSeen] = useState<HotspotId[]>([]);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
      if (Array.isArray(raw)) setSeen(raw.filter((h): h is HotspotId => typeof h === "string" && wallOf(h as HotspotId) !== null));
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
  const key = "nx_notes_docked";
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

export function TrainNotebook({ ctx, scene, seen, current }: { ctx: GameCtx; scene: SceneDTO; seen: HotspotId[]; current?: HotspotId }) {
  const t = useT();
  const [tab, setTab] = useState<"clues" | "mine">("clues");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label={t("train.notebook.title")} className="grid shrink-0 grid-cols-2 gap-1 px-3 pt-2">
        {(["clues", "mine"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-10 rounded-md text-sm ${tab === k ? "bg-[#3d2615] text-[#ecd27a]" : "text-stone-400 active:bg-[#24160c]"}`}
          >
            {t(k === "clues" ? "train.notebook.clues" : "train.notebook.mine")}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">{tab === "clues" ? <Clues scene={scene} seen={seen} current={current} /> : <NotesApp ctx={ctx} tags={[]} />}</div>
    </div>
  );
}

function Clues({ scene, seen, current }: { scene: SceneDTO; seen: HotspotId[]; current?: HotspotId }) {
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);
  // Newest first within each carriage; the close-up being worked on isn't repeated beside itself.
  const clues = [...seen]
    .reverse()
    .filter((h) => h !== current)
    .flatMap((h) => {
      const c = scene.closeups[h];
      const wall = wallOf(h);
      return c && wall && (c.doc || c.lines.length > 0) ? [{ id: h, wall, c }] : [];
    });
  const readable = scene.inventory.filter((i) => i.reading);
  if (clues.length === 0 && readable.length === 0) return <p className="px-4 py-4 text-sm text-stone-400">{t("train.notebook.empty")}</p>;

  const row = (key: string, title: React.ReactNode, body: React.ReactNode) => (
    <li key={key} className="rounded-lg border border-[#3d2615] bg-[#1b120b]">
      <button
        type="button"
        aria-expanded={open === key}
        onClick={() => setOpen((o) => (o === key ? null : key))}
        className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm text-stone-100 active:bg-[#24160c]"
      >
        <span className="min-w-0 flex-1">{title}</span>
        <span className="text-stone-500" aria-hidden>
          {open === key ? "−" : "+"}
        </span>
      </button>
      {open === key && <div className="space-y-2 px-3 pb-3">{body}</div>}
    </li>
  );
  const heading = "mb-1.5 font-mono text-10px uppercase tracking-[0.25em] text-stone-500";
  return (
    <div className="h-full space-y-3 overflow-y-auto px-3 pb-3 pt-2">
      {readable.length > 0 && (
        <section>
          <h3 className={heading}>{t("train.notebook.things")}</h3>
          <ul className="space-y-1.5">
            {readable.map((i) =>
              row(
                `item:${i.id}`,
                <span className="flex items-center gap-2">
                  <ItemIcon id={i.id} className="h-6 w-6 shrink-0" />
                  {i.name}
                </span>,
                <ItemReading item={i} />,
              ),
            )}
          </ul>
        </section>
      )}
      {ROOMS.map(({ key, walls }) => {
        const here = clues.filter((c) => (walls as readonly WallId[]).includes(c.wall));
        if (here.length === 0) return null;
        return (
          <section key={key}>
            <h3 className={heading}>{t(`train.room.${key}`)}</h3>
            <ul className="space-y-1.5">
              {here.map(({ id, c }) =>
                row(
                  id,
                  c.title,
                  <>
                    {c.doc && <CloseupDocView doc={c.doc} />}
                    {c.lines.map((l, i) => (
                      <p key={i} className="text-14px leading-relaxed text-stone-300">
                        {l}
                      </p>
                    ))}
                  </>,
                ),
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
