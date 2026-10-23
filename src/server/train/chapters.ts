import "server-only";
import type { Locale } from "@/i18n/config";
import type { ChapterDTO } from "@/lib/types";
import { chapterOf, type ChapterDef } from "../chapters";
import type { TrainScene } from "./scene";
import { trainT, type TrainTextKey } from "./text";

/** The case in chapters, for the progress line: what the team has reached, from the scene's flags and finds. */
export const TRAIN_CHAPTERS: ChapterDef<TrainScene>[] = [
  { id: "compartment", reached: () => true },
  { id: "telegram", reached: (s) => s.found.includes("telegram") },
  { id: "dining", reached: (s) => s.flags.includes("door.open") },
  { id: "cashbox", reached: (s) => s.flags.includes("cashbox.open") },
  { id: "accusation", reached: (s) => s.flags.includes("bell.rung") },
];

export function trainChapter(scene: TrainScene, loc: Locale): ChapterDTO {
  const T = trainT(loc);
  return chapterOf(TRAIN_CHAPTERS, scene, (id) => T(`chapter.${id}` as TrainTextKey));
}
