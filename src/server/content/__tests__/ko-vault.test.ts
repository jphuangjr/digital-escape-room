import { describe, expect, it } from "vitest";
import type { HintPuzzleId, RoomProgress } from "@/lib/types";
import * as content from "../index";
import { HINT_PUZZLES } from "../index";

// Korean story output for the Vault, the switch, emails and hints: translated, with every clue token intact.

const HANGUL = /[가-힣]/;

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const ko = (address: string, solved: RoomProgress["solved"] = []) => content.resolveSite(address, progress(solved), "ko")!;

describe("Korean Vault (intranet)", () => {
  it("login page is Korean and keeps the username/vault-code clues", () => {
    const login = ko("intranet.meridian-inst.net");
    expect(JSON.stringify(login.blocks)).toMatch(HANGUL);
    expect(login.source).toContain("firstname.lastname");
    expect(login.source).toContain("TRUE");
    expect(login.source).toContain("4자리");
    expect(JSON.stringify(login.blocks)).toContain("W. Okafor");
  });

  it("dashboard keeps the binary password and class link", () => {
    const dash = ko("intranet.meridian-inst.net", ["intranet-login"]);
    const json = JSON.stringify(dash.blocks);
    expect(json).toMatch(HANGUL);
    expect(json).toContain("01100 00001 01110 10100 00101 10010 01110");
    expect(json).toContain("wren.okafor");
    expect(json).not.toContain("switch.ada-voss.net");
    expect(dash.source).toContain("harbourcc.edu/cs110");
  });

  it("admin console memo keeps the redacted switch address", () => {
    const gate = ko("intranet.meridian-inst.net/admin", ["intranet-login"]);
    expect(JSON.stringify(gate)).not.toContain("switch.ada-voss.net");
    const open = ko("intranet.meridian-inst.net/admin", ["intranet-login", "admin-console"]);
    const memo = open.blocks.find((b) => b.type === "memo");
    expect(memo && memo.type === "memo" && memo.parts.some((p) => "redacted" in p && p.redacted === "switch.ada-voss.net")).toBe(true);
    expect(JSON.stringify(memo)).toMatch(HANGUL);
    expect(JSON.stringify(open.blocks)).toContain("23:58");
  });

  it("records and memos are Korean", () => {
    for (const path of ["records", "memos"]) {
      const p = ko(`intranet.meridian-inst.net/${path}`, ["intranet-login"]);
      expect(JSON.stringify(p.blocks)).toMatch(HANGUL);
      expect(JSON.stringify(p.blocks)).not.toContain("switch.ada-voss.net");
    }
    expect(JSON.stringify(ko("intranet.meridian-inst.net/records", ["intranet-login"]).blocks)).toContain("1978");
  });
});

describe("Korean switch", () => {
  it("countdown page explains the proof-of-life phrase", () => {
    const p = ko("switch.ada-voss.net", ["intranet-login", "admin-console"]);
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(HANGUL);
    expect(json).toContain("Biscuit");
    expect(json).toContain("대시");
    expect(p.blocks.some((b) => b.type === "form" && b.form === "final-phrase")).toBe(true);
  });

  it("solved page is Korean", () => {
    const p = ko("switch.ada-voss.net", ["intranet-login", "admin-console", "final-phrase"]);
    expect(JSON.stringify(p.blocks)).toMatch(HANGUL);
  });
});

describe("Korean emails", () => {
  it("Ada's last email and the sister's birthday clue", () => {
    const emails = content.baseEmails("ko");
    const ada = emails.find((e) => e.id === "email-ada-last")!;
    expect(ada.body).toMatch(HANGUL);
    expect(ada.body).toContain("meridian-inst.net");
    const sister = emails.find((e) => e.id === "email-sister-engagement")!;
    expect(sister.body).toMatch(HANGUL);
    expect(sister.body).toContain("3월 14일");
    expect(sister.body).toContain("생일");
    for (const e of emails) {
      expect(e.subject).toMatch(HANGUL);
      expect(e.date).toMatch(HANGUL);
    }
  });

  it("voicemails (ambient and hint) are Korean", () => {
    const hints = HINT_PUZZLES.map((id) => ({ puzzleId: id, tier: 1 as const, text: content.getHint(id, 1, "ko"), unlockedAt: "2026-01-01T09:30:00Z" }));
    const all = progress(["shift-key", "intranet-login", "admin-console", "final-phrase"]);
    all.visitedSites = ["thedrift.blog", "trapdoor.net"];
    const vms = content.voicemailsFor(all, hints, "ko");
    expect(vms.length).toBe(6 + hints.length);
    for (const v of vms) {
      expect(v.subject).toMatch(/^음성 메시지/);
      expect(v.body).toMatch(HANGUL);
      expect(v.date).toMatch(HANGUL);
    }
    expect(vms.find((v) => v.id === "vm-hint-bonus-pin-1")!.date).toContain("09:30");
  });
});

describe("Korean hints", () => {
  const TOKENS: Record<HintPuzzleId, string[]> = {
    "find-blog": ["meridian-inst.net/vault-2019"],
    "shift-key": ["DRIFT", "7"],
    "find-pets": ["compass_needle", "LOSTPAWS", "lostpaws.net"],
    "pet-id": ["Biscuit", "0412"],
    "intranet-login": ["wren.okafor", "1987", "19870412"],
    "final-phrase": ["wren-1987-0412"],
    "binary-lesson": ["harbourcc.edu/cs110/binary", "hello"],
    "admin-console": ["01100", "L", "LANTERN"],
    "bonus-pin": ["3월 14일", "0314"],
    "tools-folder": ["Mara"],
  };

  it("every tier is non-empty Korean", () => {
    for (const id of HINT_PUZZLES)
      for (const t of [1, 2, 3] as const) {
        const h = content.getHint(id, t, "ko");
        expect(h.length).toBeGreaterThan(20);
        expect(h).toMatch(HANGUL);
        expect(h).not.toBe(content.getHint(id, t, "en"));
      }
  });

  it("tier 3 keeps the answer tokens", () => {
    for (const id of HINT_PUZZLES) {
      const h = content.getHint(id, 3, "ko");
      for (const tok of TOKENS[id]) expect(h, `${id}: ${tok}`).toContain(tok);
    }
  });
});
