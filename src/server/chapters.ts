import "server-only";
import type { ChapterDTO } from "@/lib/types";

/** One chapter of a game: an id (for its name) and whether the team's state has reached it. The first always has. */
export interface ChapterDef<S> {
  id: string;
  reached: (state: S) => boolean;
}

/**
 * The team's chapter: the furthest one reached (so a puzzle solved out of order never moves them back), and the
 * names of that chapter and the ones before it. Later chapters stay unnamed: only their count is shared.
 */
export function chapterOf<S>(defs: ChapterDef<S>[], state: S, name: (id: string) => string): ChapterDTO {
  let index = 1;
  defs.forEach((d, i) => {
    if (i > 0 && d.reached(state)) index = i + 1;
  });
  return { index, total: defs.length, reached: defs.slice(0, index).map((d) => name(d.id)) };
}
