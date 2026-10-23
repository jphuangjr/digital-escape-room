import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { initialProgress } from "../logic";
import { ADA_CHAPTERS, adaChapter } from "../content/chapters";
import { initialScene as trainStart, parseScene as trainScene } from "../train/scene";
import { TRAIN_CHAPTERS, trainChapter } from "../train/chapters";
import { initialScene as atlasStart, parseScene as atlasScene, sceneDTO as atlasDTO } from "../atlas/scene";
import { ATLAS_CHAPTERS, atlasChapter } from "../atlas/chapters";
import { trainGame } from "../train/game";
import { atlasGame } from "../atlas/game";
import type { ChapterDTO, PuzzleId } from "@/lib/types";

/** Every chapter's name in every language, for the no-leak checks. */
function allNames<S>(chapter: (s: S, loc: (typeof LOCALES)[number]) => ChapterDTO, finalState: S): string[][] {
  return LOCALES.map((loc) => chapter(finalState, loc).reached);
}

/** No name of a chapter after `index` appears anywhere in `payload`. */
function expectNoFutureNames(payload: unknown, names: string[][], index: number) {
  const json = JSON.stringify(payload);
  for (const perLocale of names) {
    const earlier = new Set(perLocale.slice(0, index));
    for (const name of perLocale.slice(index)) if (!earlier.has(name)) expect(json).not.toContain(name);
  }
}

describe("Nightingale chapters", () => {
  const at = (flags: string[], found: string[] = []) => trainChapter(trainScene({ flags, found }), "en");
  it("start in the compartment, with later chapters counted but unnamed", () => {
    expect(trainChapter(trainStart(), "en")).toEqual({ index: 1, total: TRAIN_CHAPTERS.length, reached: ["Compartment 12B"] });
  });
  it("advance with the story's flags and finds", () => {
    expect(at([], ["telegram"]).index).toBe(2);
    expect(at(["door.open"], ["telegram"])).toMatchObject({ index: 3, reached: ["Compartment 12B", "The telegram", "The dining car"] });
    expect(at(["door.open", "cashbox.open"]).index).toBe(4);
    expect(at(["door.open", "cashbox.open", "bell.rung"]).index).toBe(5);
  });
  it("never go back: the furthest chapter reached counts", () => {
    // Every earlier chapter is named once a later one is reached, whatever order things happened in.
    expect(at(["door.open"])).toMatchObject({ index: 3, reached: ["Compartment 12B", "The telegram", "The dining car"] });
  });
  it("name chapters in the player's language", () => {
    expect(trainChapter(trainStart(), "ja").reached).toEqual(["12B号室"]);
  });
  it("leak no future chapter name in an early room state", () => {
    const names = allNames(trainChapter, trainScene({ flags: ["door.open", "cashbox.open", "bell.rung"], found: ["telegram"] }));
    for (const [i, loc] of LOCALES.entries()) {
      const s = trainStart();
      expectNoFutureNames({ chapter: trainGame.chapter(s, loc) }, [names[i]], 1);
    }
  });
});

describe("Atlas chapters", () => {
  const at = (flags: string[]) => atlasChapter(atlasScene({ flags }), "en");
  it("start in the Observatory", () => {
    expect(atlasChapter(atlasStart(), "en")).toEqual({ index: 1, total: ATLAS_CHAPTERS.length, reached: ["The Observatory"] });
  });
  it("advance through the Acts", () => {
    expect(at(["stairs.open", "water.drained"]).index).toBe(2);
    expect(at(["stairs.open", "water.drained", "crossed", "reached.verdant"])).toMatchObject({
      index: 3,
      reached: ["The Observatory", "The Threshold", "The Silent Ages"],
    });
    expect(at(["water.drained", "crossed", "reached.cathedral"]).index).toBe(4);
    expect(at(["water.drained", "crossed", "reached.cathedral", "core.convened"]).index).toBe(5);
  });
  it("leak no future chapter or unreached place name in an early scene DTO", () => {
    const final = atlasScene({ flags: ["water.drained", "crossed", "reached.cathedral", "core.convened"] });
    for (const loc of LOCALES) {
      const names = atlasChapter(final, loc).reached;
      const s = atlasStart();
      const payload = { chapter: atlasGame.chapter(s, loc), scene: atlasDTO(s, { loc }) };
      // The Observatory is chapter one and a place; the Threshold Chamber's name shares a word with chapter two.
      expectNoFutureNames(payload.chapter, [names], 1);
      expect(payload.scene.places.filter((p) => !p.reachable).every((p) => p.name === "")).toBe(true);
      expect(JSON.stringify(payload.scene)).not.toContain(names[3]);
      expect(JSON.stringify(payload.scene)).not.toContain(names[2]);
    }
  });
  it("names places only once they're reachable", () => {
    const dto = atlasDTO(atlasScene({ flags: ["stairs.open"] }), { loc: "en" });
    expect(dto.places.filter((p) => p.name).map((p) => p.name)).toEqual(["The Observatory", "The Waterworks"]);
  });
});

describe("Ada chapters", () => {
  const at = (solved: PuzzleId[]) => adaChapter({ ...initialProgress(), solved }, "en");
  it("start on Ada's laptop", () => {
    expect(at([])).toEqual({ index: 1, total: ADA_CHAPTERS.length, reached: ["Ada's laptop"] });
  });
  it("advance with main-story solves; side puzzles don't count", () => {
    expect(at(["tools-folder", "bonus-pin", "mara-reset", "mara-login"]).index).toBe(1);
    expect(at(["tools-folder", "shift-key"]).index).toBe(2);
    expect(at(["shift-key", "intranet-login"])).toMatchObject({ index: 3, reached: ["Ada's laptop", "The forum trail", "Inside the Vault"] });
    expect(at(["shift-key", "intranet-login", "binary-lesson", "admin-console"]).index).toBe(4);
    expect(at(["shift-key", "intranet-login", "binary-lesson", "admin-console", "final-phrase"])).toMatchObject({ index: 5, total: 5 });
  });
  it("leak no future chapter name in an early state", () => {
    const final = { ...initialProgress(), solved: ["shift-key", "intranet-login", "admin-console", "final-phrase"] as PuzzleId[] };
    const names = allNames(adaChapter, final);
    LOCALES.forEach((loc, i) => expectNoFutureNames(adaChapter({ ...initialProgress(), solved: ["tools-folder"] }, loc), [names[i]], 1));
  });
});
