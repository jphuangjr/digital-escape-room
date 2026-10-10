import { describe, expect, it } from "vitest";
import type { HintPuzzleId, RoomProgress } from "@/lib/types";
import * as content from "../index";
import { HINT_PUZZLES } from "../index";

// Japanese emails, voicemails and hints: translated, with every clue token intact.

const KANA = /[\u3040-\u30ff]/;
const JA = /[\u3040-\u30ff\u4e00-\u9fff]/;

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

describe("Japanese emails", () => {
  it("Ada's last email and the sister's birthday clue", () => {
    const emails = content.baseEmails("ja");
    const ada = emails.find((e) => e.id === "email-ada-last")!;
    expect(ada.body).toMatch(KANA);
    expect(ada.body).toContain("meridian-inst.net");
    expect(ada.body).toContain("Mara");
    const sister = emails.find((e) => e.id === "email-sister-engagement")!;
    expect(sister.body).toMatch(KANA);
    expect(sister.body).toContain("3月14日");
    expect(sister.body).toContain("誕生日");
    for (const e of emails) {
      expect(e.subject).toMatch(KANA);
      expect(e.date).toMatch(JA);
    }
  });

  it("voicemails (ambient and hint) are Japanese", () => {
    const hints = HINT_PUZZLES.map((id) => ({ puzzleId: id, tier: 1 as const, text: content.getHint(id, 1, "ja"), unlockedAt: "2026-01-01T09:30:00Z" }));
    const all = progress(["shift-key", "intranet-login", "admin-console", "final-phrase"]);
    all.visitedSites = ["thedrift.blog", "trapdoor.net"];
    const vms = content.voicemailsFor(all, hints, "ja");
    expect(vms.length).toBe(6 + hints.length);
    for (const v of vms) {
      expect(v.subject).toMatch(/^留守電/);
      expect(v.body).toMatch(KANA);
      expect(v.date).toMatch(KANA);
    }
    expect(vms.find((v) => v.id === "vm-hint-bonus-pin-1")!.date).toContain("09:30");
  });
});

describe("Japanese hints", () => {
  const TOKENS: Record<HintPuzzleId, string[]> = {
    "find-blog": ["meridian-inst.net/vault-2019"],
    "shift-key": ["DRIFT", "7"],
    "find-pets": ["compass_needle", "LOSTPAWS", "lostpaws.net"],
    "pet-id": ["Biscuit", "0412"],
    "intranet-login": ["wren.okafor", "1987", "19870412"],
    "final-phrase": ["wren-1987-0412"],
    "binary-lesson": ["harbourcc.edu/cs110/binary", "hello"],
    "admin-console": ["01100", "L", "LANTERN"],
    "bonus-pin": ["3月14日", "0314"],
    "tools-folder": ["Mara", "マーラ"],
  };

  it("every tier is non-empty Japanese", () => {
    for (const id of HINT_PUZZLES)
      for (const t of [1, 2, 3] as const) {
        const h = content.getHint(id, t, "ja");
        expect(h.length).toBeGreaterThan(20);
        expect(h).toMatch(KANA);
        expect(h).not.toBe(content.getHint(id, t, "en"));
      }
  });

  it("tier 3 keeps the answer tokens", () => {
    for (const id of HINT_PUZZLES) {
      const h = content.getHint(id, 3, "ja");
      for (const tok of TOKENS[id]) expect(h, `${id}: ${tok}`).toContain(tok);
    }
  });
});
