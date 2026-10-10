import { describe, expect, it } from "vitest";
import type { HintPuzzleId, RoomProgress } from "@/lib/types";
import * as content from "../index";
import { HINT_PUZZLES } from "../index";

// Traditional Chinese emails, voicemails and hints: translated, with every clue token intact.

const CJK = /[一-鿿]/;

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

describe("Chinese emails", () => {
  it("Ada's last email and the sister's birthday clue", () => {
    const emails = content.baseEmails("zh-TW");
    const ada = emails.find((e) => e.id === "email-ada-last")!;
    expect(ada.body).toMatch(CJK);
    expect(ada.body).toContain("meridian-inst.net");
    expect(ada.body).toContain("Mara");
    const sister = emails.find((e) => e.id === "email-sister-engagement")!;
    expect(sister.body).toMatch(CJK);
    expect(sister.body).toContain("3月14日");
    expect(sister.body).toContain("生日");
    for (const e of emails) {
      expect(e.subject).toMatch(CJK);
      expect(e.date).toMatch(CJK);
    }
  });

  it("voicemails (ambient and hint) are Chinese", () => {
    const hints = HINT_PUZZLES.map((id) => ({ puzzleId: id, tier: 1 as const, text: content.getHint(id, 1, "zh-TW"), unlockedAt: "2026-01-01T09:30:00Z" }));
    const all = progress(["shift-key", "intranet-login", "admin-console", "final-phrase"]);
    all.visitedSites = ["thedrift.blog", "trapdoor.net"];
    const vms = content.voicemailsFor(all, hints, "zh-TW");
    expect(vms.length).toBe(6 + hints.length);
    for (const v of vms) {
      expect(v.subject).toMatch(/^語音留言/);
      expect(v.body).toMatch(CJK);
      expect(v.date).toMatch(CJK);
    }
    expect(vms.find((v) => v.id === "vm-hint-bonus-pin-1")!.date).toContain("09:30");
  });
});

describe("Chinese hints", () => {
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
    "tools-folder": ["Mara", "瑪拉"],
  };

  it("every tier is non-empty Chinese", () => {
    for (const id of HINT_PUZZLES)
      for (const t of [1, 2, 3] as const) {
        const h = content.getHint(id, t, "zh-TW");
        expect(h.length).toBeGreaterThan(20);
        expect(h).toMatch(CJK);
        expect(h).not.toBe(content.getHint(id, t, "en"));
      }
  });

  it("tier 3 keeps the answer tokens", () => {
    for (const id of HINT_PUZZLES) {
      const h = content.getHint(id, 3, "zh-TW");
      for (const tok of TOKENS[id]) expect(h, `${id}: ${tok}`).toContain(tok);
    }
  });
});
