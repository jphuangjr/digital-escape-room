import { describe, expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import * as content from "../index";

// Portuguese Vault (intranet): translated, with every clue token intact.

const PORTUGUESE = /[ãõçáéíóúâêô]/i;

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const pt = (address: string, solved: RoomProgress["solved"] = []) => content.resolveSite(address, progress(solved), "pt-BR")!;
const en = (address: string, solved: RoomProgress["solved"] = []) => content.resolveSite(address, progress(solved), "en")!;

describe("Portuguese Vault (intranet)", () => {
  it("login page is pt-BR and keeps the username/vault-code clues", () => {
    const login = pt("intranet.meridian-inst.net");
    const json = JSON.stringify(login.blocks);
    expect(json).not.toBe(JSON.stringify(en("intranet.meridian-inst.net").blocks));
    expect(json).toMatch(PORTUGUESE);
    expect(json).toContain("Cofre");
    expect(login.source).toContain("firstname.lastname");
    expect(login.source).toContain("TRUE");
    expect(login.source).toContain("4 dígitos");
    expect(json).toContain("W. Okafor");
  });

  it("dashboard keeps the binary password and class link, without leaking the word", () => {
    const dash = pt("intranet.meridian-inst.net", ["intranet-login"]);
    const json = JSON.stringify(dash.blocks);
    expect(json).toMatch(PORTUGUESE);
    expect(json).toContain("01100 00001 01110 10100 00101 10010 01110");
    expect(json).toContain("wren.okafor");
    expect(json).not.toContain("switch.ada-voss.net");
    expect(dash.source).toContain("harbourcc.edu/cs110");
    const all = JSON.stringify(dash).toLowerCase();
    for (const w of ["lantern", "lanterna", "lampião", "farol"]) expect(all).not.toContain(w);
  });

  it("admin console memo keeps the redacted switch address", () => {
    const gate = pt("intranet.meridian-inst.net/admin", ["intranet-login"]);
    expect(JSON.stringify(gate)).not.toContain("switch.ada-voss.net");
    for (const w of ["lantern", "lanterna", "lampião", "farol"]) expect(JSON.stringify(gate).toLowerCase()).not.toContain(w);
    const open = pt("intranet.meridian-inst.net/admin", ["intranet-login", "admin-console"]);
    const memo = open.blocks.find((b) => b.type === "memo");
    expect(memo && memo.type === "memo" && memo.parts.some((p) => "redacted" in p && p.redacted === "switch.ada-voss.net")).toBe(true);
    expect(JSON.stringify(memo)).toMatch(PORTUGUESE);
    expect(JSON.stringify(memo)).toContain("interruptor do homem morto");
    expect(JSON.stringify(open.blocks)).toContain("23:58");
  });

  it("records and memos are pt-BR", () => {
    for (const path of ["records", "memos"]) {
      const p = pt(`intranet.meridian-inst.net/${path}`, ["intranet-login"]);
      expect(JSON.stringify(p.blocks)).toMatch(PORTUGUESE);
      expect(JSON.stringify(p.blocks)).not.toBe(JSON.stringify(en(`intranet.meridian-inst.net/${path}`, ["intranet-login"]).blocks));
      expect(JSON.stringify(p.blocks)).not.toContain("switch.ada-voss.net");
    }
    expect(JSON.stringify(pt("intranet.meridian-inst.net/records", ["intranet-login"]).blocks)).toContain("1978");
  });
});
