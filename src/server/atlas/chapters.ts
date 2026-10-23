import "server-only";
import type { Locale } from "@/i18n/config";
import type { ChapterDTO } from "@/lib/types";
import { chapterOf, type ChapterDef } from "../chapters";
import type { AtlasScene } from "./scene";
import { atlasT, type AtlasTextKey } from "./text";

/** The expedition in chapters, for the progress line: the three Acts, split where the team crosses into somewhere new. */
export const ATLAS_CHAPTERS: ChapterDef<AtlasScene>[] = [
  { id: "observatory", reached: () => true },
  { id: "threshold", reached: (s) => s.flags.includes("water.drained") },
  { id: "ages", reached: (s) => s.flags.includes("crossed") },
  { id: "cathedral", reached: (s) => s.flags.includes("reached.cathedral") },
  { id: "choice", reached: (s) => s.flags.includes("core.convened") },
];

export function atlasChapter(scene: AtlasScene, loc: Locale): ChapterDTO {
  const T = atlasT(loc);
  return chapterOf(ATLAS_CHAPTERS, scene, (id) => T(`chapter.${id}` as AtlasTextKey));
}
