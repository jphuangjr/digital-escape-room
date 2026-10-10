import { describe, expect, it } from "vitest";
import type { HintPuzzleId, RoomProgress } from "@/lib/types";
import * as content from "../index";
import { HINT_PUZZLES } from "../index";

// Spanish emails, voicemails and hints: translated, with every clue token intact.

const SPANISH = /[áéíóúñ¿¡]/i;

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

describe("Spanish emails", () => {
  it("Ada's last email and the sister's birthday clue", () => {
    const emails = content.baseEmails("es");
    const english = content.baseEmails("en");
    const ada = emails.find((e) => e.id === "email-ada-last")!;
    expect(ada.body).toMatch(SPANISH);
    expect(ada.body).toContain("meridian-inst.net");
    expect(ada.body).toContain("Mara");
    const sister = emails.find((e) => e.id === "email-sister-engagement")!;
    expect(sister.body).toMatch(SPANISH);
    expect(sister.body).toContain("14 de marzo");
    expect(sister.body).toContain("cumpleaños");
    emails.forEach((e, i) => {
      expect(e.body).not.toBe(english[i].body);
      expect(e.subject).not.toBe(english[i].subject);
      expect(e.date).not.toBe(english[i].date);
    });
  });

  it("voicemails (ambient and hint) are Spanish", () => {
    const hints = HINT_PUZZLES.map((id) => ({ puzzleId: id, tier: 1 as const, text: content.getHint(id, 1, "es"), unlockedAt: "2026-01-01T09:30:00Z" }));
    const all = progress(["shift-key", "intranet-login", "admin-console", "final-phrase"]);
    all.visitedSites = ["thedrift.blog", "trapdoor.net"];
    const vms = content.voicemailsFor(all, hints, "es");
    expect(vms.length).toBe(6 + hints.length);
    for (const v of vms) {
      expect(v.subject).toMatch(/^Mensaje de voz/);
      expect(v.body).toMatch(SPANISH);
      expect(v.date).toMatch(/^Número desconocido/);
    }
    expect(vms.find((v) => v.id === "vm-hint-bonus-pin-1")!.date).toContain("09:30");
  });
});

describe("Spanish hints", () => {
  const TOKENS: Record<HintPuzzleId, string[]> = {
    "find-blog": ["meridian-inst.net/vault-2019"],
    "shift-key": ["DRIFT", "7"],
    "find-pets": ["compass_needle", "LOSTPAWS", "lostpaws.net"],
    "pet-id": ["Biscuit", "0412"],
    "intranet-login": ["wren.okafor", "1987", "19870412"],
    "final-phrase": ["wren-1987-0412"],
    "binary-lesson": ["harbourcc.edu/cs110/binary", "hello"],
    "admin-console": ["01100", "L", "LANTERN"],
    "bonus-pin": ["14 de marzo", "0314"],
    "tools-folder": ["Mara", "clima"],
  };

  it("every tier is non-empty Spanish, different from English", () => {
    for (const id of HINT_PUZZLES)
      for (const t of [1, 2, 3] as const) {
        const h = content.getHint(id, t, "es");
        expect(h.length).toBeGreaterThan(20);
        expect(h, `${id} ${t}`).toMatch(SPANISH);
        expect(h).not.toBe(content.getHint(id, t, "en"));
      }
  });

  it("tier 3 keeps the answer tokens", () => {
    for (const id of HINT_PUZZLES) {
      const h = content.getHint(id, 3, "es");
      for (const tok of TOKENS[id]) expect(h, `${id}: ${tok}`).toContain(tok);
    }
  });
});
