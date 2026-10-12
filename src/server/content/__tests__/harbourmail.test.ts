import { describe, expect, it } from "vitest";
import type { Block, RoomProgress } from "@/lib/types";
import { LOCALES } from "@/i18n/config";
import * as content from "../index";
import { MARA_TEMP_PASSWORD } from "../answers";
import { maraText } from "../mara";

const progress = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});
const forms = (blocks: Block[]) => blocks.flatMap((b) => (b.type === "form" ? [b.form] : []));
const mails = (blocks: Block[]) => blocks.filter((b) => b.type === "mail");

describe("HarbourMail Easter egg", () => {
  it("is reachable from the start, under both spellings", () => {
    for (const a of ["harbourmail.net", "https://www.HarborMail.net/", "harbormail.net/forgot"]) {
      expect(content.resolveSite(a, progress(), "en")).not.toBeNull();
    }
    expect(forms(content.resolveSite("harbourmail.net", progress(), "en")!.blocks)).toEqual(["mara-login"]);
    expect(forms(content.resolveSite("harbourmail.net/forgot", progress(), "en")!.blocks)).toEqual(["mara-reset"]);
  });

  it("keeps the mailbox behind the sign-in", () => {
    for (const a of ["harbourmail.net", "harbourmail.net/inbox", "harbourmail.net/spam", "harbourmail.net/drafts"]) {
      expect(mails(content.resolveSite(a, progress(["mara-reset"]), "en")!.blocks)).toHaveLength(0);
    }
    expect(mails(content.resolveSite("harbourmail.net", progress(["mara-reset", "mara-login"]), "en")!.blocks).length).toBeGreaterThan(3);
    expect(mails(content.resolveSite("harbourmail.net/spam", progress(["mara-reset", "mara-login"]), "en")!.blocks).length).toBeGreaterThan(0);
  });

  it("accepts Mara's address for a reset, and the mailed password to sign in", () => {
    for (const a of ["mara.voss@harbourmail.net", " Mara.Voss@HarbourMail.net ", "mara.voss", "mara.voss@harbormail.net"]) {
      expect(content.checkAnswer("mara-reset", a)).toBe(true);
    }
    for (const a of ["ada@ada-voss.net", "mara", "tom.achebe@harbourmail.net"]) expect(content.checkAnswer("mara-reset", a)).toBe(false);
    expect(content.checkAnswer("mara-login", `mara.voss@harbourmail.net:${MARA_TEMP_PASSWORD}`)).toBe(true);
    expect(content.checkAnswer("mara-login", "mara.voss:gull 7316")).toBe(true);
    expect(content.checkAnswer("mara-login", "mara.voss@harbourmail.net:password")).toBe(false);
    expect(content.checkAnswer("mara-login", `ada@ada-voss.net:${MARA_TEMP_PASSWORD}`)).toBe(false);
  });

  it("mails the temporary password to Ada only after a reset", () => {
    for (const loc of LOCALES) {
      expect(content.bonusEmails(progress(), loc)).toEqual([]);
      const [mail] = content.bonusEmails(progress(["mara-reset"]), loc);
      expect(mail.body).toContain(MARA_TEMP_PASSWORD);
      expect(mail.body).toContain("mara.voss@harbourmail.net");
      expect(mail.body).not.toMatch(/\{\w+\}/);
    }
  });

  it("has every message in every language, with nothing left in English by mistake", () => {
    const en = maraText("en");
    for (const loc of LOCALES) {
      const m = maraText(loc);
      expect(m.messages.map((x) => [x.id, x.folder, x.party])).toEqual(en.messages.map((x) => [x.id, x.folder, x.party]));
      expect(m.epilogue.length).toBeGreaterThan(0);
      expect(content.maraEpilogue(loc).length).toBeGreaterThan(100);
      if (loc !== "en") expect(m.messages.find((x) => x.id === "tom-seating")!.body).not.toEqual(en.messages[0].body);
    }
  });

  it("gives away no puzzle answers", () => {
    for (const loc of LOCALES) {
      const all = JSON.stringify(maraText(loc)).toLowerCase();
      for (const w of ["lantern", "wren", "biscuit", "1987", "1978", "0412", "0314", "weather"]) expect(all).not.toContain(w);
    }
  });
});
