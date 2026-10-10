import { describe, expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import * as content from "../index";

// Japanese Vault (intranet): translated, with every clue token intact.

const KANA = /[぀-ヿ]/;
const LANTERN = /lantern|ランタン|灯籠|提灯/i;

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const ja = (address: string, solved: RoomProgress["solved"] = []) => content.resolveSite(address, progress(solved), "ja")!;

describe("Japanese Vault (intranet)", () => {
  it("login page is ja and keeps the username/vault-code clues", () => {
    const login = ja("intranet.meridian-inst.net");
    expect(JSON.stringify(login.blocks)).toMatch(KANA);
    expect(JSON.stringify(login.blocks)).toContain("金庫");
    expect(login.source).toContain("firstname.lastname");
    expect(login.source).toContain("TRUE");
    expect(login.source).toContain("4桁");
    expect(JSON.stringify(login.blocks)).toContain("W. Okafor");
  });

  it("dashboard keeps the binary password and class link", () => {
    const dash = ja("intranet.meridian-inst.net", ["intranet-login"]);
    const json = JSON.stringify(dash.blocks);
    expect(json).toMatch(KANA);
    expect(json).toContain("01100 00001 01110 10100 00101 10010 01110");
    expect(json).toContain("wren.okafor");
    expect(json).not.toContain("switch.ada-voss.net");
    expect(dash.source).toContain("harbourcc.edu/cs110");
    expect(JSON.stringify(dash)).not.toMatch(LANTERN);
  });

  it("admin console memo keeps the redacted switch address", () => {
    const gate = ja("intranet.meridian-inst.net/admin", ["intranet-login"]);
    expect(JSON.stringify(gate)).not.toContain("switch.ada-voss.net");
    expect(JSON.stringify(gate)).not.toMatch(LANTERN);
    const open = ja("intranet.meridian-inst.net/admin", ["intranet-login", "admin-console"]);
    const memo = open.blocks.find((b) => b.type === "memo");
    expect(memo && memo.type === "memo" && memo.parts.some((p) => "redacted" in p && p.redacted === "switch.ada-voss.net")).toBe(true);
    expect(JSON.stringify(memo)).toMatch(KANA);
    expect(JSON.stringify(memo)).toContain("デッドマン・スイッチ");
    expect(JSON.stringify(open.blocks)).toContain("23:58");
  });

  it("records and memos are ja", () => {
    for (const path of ["records", "memos"]) {
      const p = ja(`intranet.meridian-inst.net/${path}`, ["intranet-login"]);
      expect(JSON.stringify(p.blocks)).toMatch(KANA);
      expect(JSON.stringify(p.blocks)).not.toContain("switch.ada-voss.net");
    }
    expect(JSON.stringify(ja("intranet.meridian-inst.net/records", ["intranet-login"]).blocks)).toContain("1978");
  });
});
