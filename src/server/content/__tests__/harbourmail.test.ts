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
    for (const a of ["harbourmail.com", "https://www.HarborMail.com/", "harbormail.com/forgot"]) {
      expect(content.resolveSite(a, progress(), "en")).not.toBeNull();
    }
    expect(forms(content.resolveSite("harbourmail.com", progress(), "en")!.blocks)).toEqual(["mara-login"]);
    expect(forms(content.resolveSite("harbourmail.com/forgot", progress(), "en")!.blocks)).toEqual(["mara-reset"]);
  });

  it("keeps the mailbox behind the sign-in", () => {
    for (const a of ["harbourmail.com", "harbourmail.com/inbox", "harbourmail.com/spam", "harbourmail.com/drafts"]) {
      expect(mails(content.resolveSite(a, progress(["mara-reset"]), "en")!.blocks)).toHaveLength(0);
    }
    expect(mails(content.resolveSite("harbourmail.com", progress(["mara-reset", "mara-login"]), "en")!.blocks).length).toBeGreaterThan(3);
    expect(mails(content.resolveSite("harbourmail.com/spam", progress(["mara-reset", "mara-login"]), "en")!.blocks).length).toBeGreaterThan(0);
  });

  it("accepts Mara's address for a reset, and the mailed password to sign in", () => {
    for (const a of ["mara.voss@harbourmail.com", " Mara.Voss@HarbourMail.com ", "mara.voss", "mara.voss@harbormail.com"]) {
      expect(content.checkAnswer("mara-reset", a)).toBe(true);
    }
    for (const a of ["ada@ada-voss.com", "mara", "tom.achebe@harbourmail.com"]) expect(content.checkAnswer("mara-reset", a)).toBe(false);
    expect(content.checkAnswer("mara-login", `mara.voss@harbourmail.com:${MARA_TEMP_PASSWORD}`)).toBe(true);
    expect(content.checkAnswer("mara-login", "mara.voss:gull 7316")).toBe(true);
    expect(content.checkAnswer("mara-login", "mara.voss@harbourmail.com:password")).toBe(false);
    expect(content.checkAnswer("mara-login", `ada@ada-voss.com:${MARA_TEMP_PASSWORD}`)).toBe(false);
  });

  it("mails the temporary password to Ada only after a reset", () => {
    for (const loc of LOCALES) {
      expect(content.bonusEmails(progress(), loc)).toEqual([]);
      const [mail] = content.bonusEmails(progress(["mara-reset"]), loc);
      expect(mail.body).toContain(MARA_TEMP_PASSWORD);
      expect(mail.body).toContain("mara.voss@harbourmail.com");
      expect(mail.body).not.toMatch(/\{\w+\}/);
      // This is the investigator's inbox: Ada, the recovery contact, forwards the reset.
      expect(mail.from).toBe("Ada Voss <ada@ada-voss.com>");
      expect(mail.body).toContain("no-reply@harbourmail.com");
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

describe("ada-voss.com", () => {
  it("is an archived dead end on every path, in every language", () => {
    for (const loc of LOCALES) {
      for (const a of ["ada-voss.com", "www.ada-voss.com/about", "https://ada-voss.com/blog/2019"]) {
        const page = content.resolveSite(a, progress(), loc)!;
        expect(page.theme).toBe("archived");
        expect(page.blocks.some((b) => b.type === "link" || b.type === "nav" || b.type === "form")).toBe(false);
      }
    }
  });

  it("leaves the switch subdomain alone", () => {
    expect(content.resolveSite("switch.ada-voss.com", progress(), "en")).toBeNull();
  });
});
