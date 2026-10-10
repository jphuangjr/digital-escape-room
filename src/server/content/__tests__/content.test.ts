import { describe, expect, it } from "vitest";
import type { Block, RoomProgress } from "@/lib/types";
import {
  a1z26Decode,
  caesar,
  decodeTimestamp,
  LOSTPAWS_CIPHERTEXT_CHUNKS,
  LOSTPAWS_PLAINTEXT,
} from "../cipher";
import { DRIFT_POSTS } from "../sites/drift";
import { FORUM_THREADS } from "../sites/runnerboard";
import {
  baseEmails,
  bonusFiles,
  checkAnswer,
  decodeListings,
  endingText,
  getHint,
  HINT_PUZZLES,
  normalize,
  resolveSite,
  voicemailsFor,
} from "../index";

const fresh = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const listingBodies = (blocks: Block[]) =>
  blocks.filter((b): b is Extract<Block, { type: "listing" }> => b.type === "listing").map((b) => b.body);

describe("cipher", () => {
  it("caesar roundtrips", () => {
    for (const s of [1, 7, 11, 25, 26, -3, 40]) {
      expect(caesar(caesar("Hello, World! xyz", s), -s)).toBe("Hello, World! xyz");
    }
    expect(caesar("ABC xyz", 3)).toBe("DEF abc");
  });

  it("ciphertext is not plaintext and shift 7 decodes the message", () => {
    expect(LOSTPAWS_CIPHERTEXT_CHUNKS.join(" ")).not.toBe(LOSTPAWS_PLAINTEXT);
    expect(listingBodies(decodeListings(7)).join(" ")).toBe("WREN HAS THE KEY. VAULT CODE IS THE YEAR THEY LIED.");
  });

  it("shift 11 is gibberish", () => {
    const out = listingBodies(decodeListings(11)).join(" ");
    expect(out).not.toContain("WREN");
    expect(out).not.toContain("KEY");
    expect(out).not.toContain("YEAR");
  });

  it("A1Z26 timestamps: compass_needle -> LOSTPAWS, needle_compass -> TRAPDOOR", () => {
    expect(a1z26Decode([12, 15])).toBe("LO");
    const posts = FORUM_THREADS.flatMap((t) => t.posts);
    const spell = (u: string) =>
      posts.filter((p) => p.author === u).map((p) => decodeTimestamp(p.time)).join("");
    expect(spell("compass_needle")).toBe("LOSTPAWS");
    expect(spell("needle_compass")).toBe("TRAPDOOR");
  });

  it("forum mentions Biscuit", () => {
    const posts = FORUM_THREADS.flatMap((t) => t.posts);
    expect(posts.some((p) => p.author === "compass_needle" && p.body.includes("has anyone seen Biscuit?"))).toBe(true);
  });
});

describe("drift blog", () => {
  const parse = (d: string) => new Date(d).getTime();
  it("Field Notes oldest-first spell DRIFT and days sum to 7", () => {
    const real = DRIFT_POSTS.filter((p) => p.series === "Field Notes").sort((a, b) => parse(a.date) - parse(b.date));
    expect(real.map((p) => p.title[0]).join("")).toBe("DRIFT");
    const days = real.map((p) => new Date(p.date).getDate());
    expect(days).toEqual([2, 1, 1, 2, 1]);
    expect(days.reduce((a, b) => a + b, 0)).toBe(7);
    expect(new Set(real.map((p) => new Date(p.date).getMonth())).size).toBe(5);
  });

  it("display order is not already DRIFT", () => {
    const shown = DRIFT_POSTS.filter((p) => p.series === "Field Notes").map((p) => p.title[0]).join("");
    expect(shown).not.toBe("DRIFT");
  });

  it("Ada's Kitchen measurements sum to 11", () => {
    const kitchen = DRIFT_POSTS.filter((p) => p.series === "Ada's Kitchen");
    const sum = kitchen.flatMap((p) => p.body.match(/\d+/g) ?? []).reduce((a, n) => a + Number(n), 0);
    expect(sum).toBe(11);
  });
});

describe("answers", () => {
  it("normalize", () => {
    expect(normalize("  Hello   World ")).toBe("hello world");
  });
  it("shift-key", () => {
    expect(checkAnswer("shift-key", "7")).toBe(true);
    expect(checkAnswer("shift-key", " Seven ")).toBe(true);
    expect(checkAnswer("shift-key", "11")).toBe(false);
  });
  it("intranet-login", () => {
    expect(checkAnswer("intranet-login", "wren.okafor:19870412")).toBe(true);
    expect(checkAnswer("intranet-login", "  Wren.Okafor :19870412 ")).toBe(true);
    expect(checkAnswer("intranet-login", "wren.okafor:19780412")).toBe(false);
    expect(checkAnswer("intranet-login", "wren.okafor19870412")).toBe(false);
  });
  it("final-phrase variants", () => {
    for (const v of ["wren-1987-0412", "wren 1987 0412", "WREN_1987_0412", "  Wren - 1987 - 0412 "]) {
      expect(checkAnswer("final-phrase", v)).toBe(true);
    }
    expect(checkAnswer("final-phrase", "wren-1978-0412")).toBe(false);
  });
  it("bonus-pin", () => {
    expect(checkAnswer("bonus-pin", "0314")).toBe(true);
    expect(checkAnswer("bonus-pin", "03/14")).toBe(true);
    expect(checkAnswer("bonus-pin", "1403")).toBe(false);
  });
});

describe("sites & gating", () => {
  it("normalizes addresses", () => {
    for (const a of ["https://www.Meridian-Inst.net/", "meridian-inst.net", "http://meridian-inst.net/?x=1#top"]) {
      expect(resolveSite(a, fresh())?.address).toBe("meridian-inst.net");
    }
    expect(resolveSite("nowhere.example", fresh())).toBeNull();
  });

  it("meridian home source contains the vault comment and 1978 footer on all pages", () => {
    expect(resolveSite("meridian-inst.net", fresh())!.source).toContain("<!-- archive migration complete: see /vault-2019 -->");
    for (const p of ["", "/staff", "/about", "/vault-2019"]) {
      const page = resolveSite(`meridian-inst.net${p}`, fresh())!;
      expect(page.blocks.some((b) => b.type === "footer" && b.text.includes("© since 1978."))).toBe(true);
    }
  });

  it("staff has 12 people and Wren has no photo", () => {
    const staff = resolveSite("meridian-inst.net/staff", fresh())!.blocks.find((b) => b.type === "staff");
    expect(staff && staff.type === "staff" && staff.people.length).toBe(12);
    const wren = staff && staff.type === "staff" ? staff.people.find((p) => p.name === "Wren Okafor") : undefined;
    expect(wren?.photo).toBeNull();
    expect(wren?.bio).toContain("Circuit Runner '94");
  });

  it("vault image comment points to the blog", () => {
    const img = resolveSite("meridian-inst.net/vault-2019", fresh())!.blocks.find((b) => b.type === "image");
    expect(img && img.type === "image" && img.fileInfo.comment).toBe("draft uploaded to thedrift.blog");
  });

  it("switch unreachable before intranet-login", () => {
    expect(resolveSite("switch.ada-voss.net", fresh())).toBeNull();
    expect(resolveSite("switch.ada-voss.net", fresh(["shift-key"]))).toBeNull();
    expect(resolveSite("switch.ada-voss.net", fresh(["intranet-login"]))).not.toBeNull();
  });

  it("intranet gated", () => {
    const login = resolveSite("intranet.meridian-inst.net/records", fresh())!;
    expect(login.blocks.some((b) => b.type === "form" && b.form === "intranet-login")).toBe(true);
    expect(login.blocks.some((b) => b.type === "diff")).toBe(false);
    const dash = resolveSite("intranet.meridian-inst.net", fresh(["intranet-login"]))!;
    expect(dash.blocks.some((b) => b.type === "diff")).toBe(true);
    const memo = dash.blocks.find((b) => b.type === "memo");
    expect(memo && memo.type === "memo" && memo.parts.some((p) => "redacted" in p && p.redacted === "switch.ada-voss.net")).toBe(true);
  });

  it("lostpaws ciphertext until shift-key solved", () => {
    const before = resolveSite("lostpaws.net", fresh())!;
    expect(listingBodies(before.blocks).join(" ")).toBe(LOSTPAWS_CIPHERTEXT_CHUNKS.join(" "));
    expect(before.blocks.some((b) => b.type === "form" && b.form === "shift-key")).toBe(true);
    expect(before.source).not.toContain("WREN HAS");
    const after = resolveSite("lostpaws.net", fresh(["shift-key"]))!;
    expect(listingBodies(after.blocks).join(" ")).toBe(LOSTPAWS_PLAINTEXT);
    const biscuit = after.blocks.find((b) => b.type === "listing" && b.title.startsWith("Biscuit"));
    expect(biscuit && biscuit.type === "listing" && biscuit.petId).toBe("0412");
  });

  it("every site resolves with source", () => {
    for (const a of ["thedrift.blog", "runnerboard.net", "trapdoor.net", "lostpaws.net", "intranet.meridian-inst.net"]) {
      const p = resolveSite(a, fresh());
      expect(p).not.toBeNull();
      expect(p!.source.startsWith("<!DOCTYPE html>")).toBe(true);
    }
  });
});

describe("hints, emails, endings", () => {
  it("3 tiers per hint puzzle", () => {
    for (const id of HINT_PUZZLES) for (const t of [1, 2, 3] as const) expect(getHint(id, t).length).toBeGreaterThan(20);
  });
  it("sister email mentions March 14; voicemails generated", () => {
    expect(baseEmails().some((e) => e.body.includes("March 14"))).toBe(true);
    const vms = voicemailsFor(fresh(["shift-key"]), [
      { puzzleId: "find-blog", tier: 1, text: getHint("find-blog", 1), unlockedAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(vms.every((v) => v.kind === "voicemail")).toBe(true);
    expect(vms.some((v) => v.id === "vm-hint-find-blog-1")).toBe(true);
  });
  it("endings", () => {
    expect(endingText("EXPOSE").body.split("\n\n").length).toBeGreaterThan(2);
    expect(endingText("PROTECT").body).toContain("Mara");
    expect(bonusFiles().length).toBeGreaterThanOrEqual(4);
  });
});

describe("Branch B entry", () => {
  it("Wren's staff entry links to the forum by its full address", () => {
    const page = resolveSite("meridian-inst.net/staff", fresh());
    const staff = page?.blocks.find((b): b is Extract<Block, { type: "staff" }> => b.type === "staff");
    const wren = staff?.people.find((p) => p.name === "Wren Okafor");
    expect(wren?.bio).toContain("runnerboard.net");
    expect(wren?.link?.href).toBe("runnerboard.net");
    expect(resolveSite(wren!.link!.href, fresh())).not.toBeNull();
  });
});

describe("Ada's Tools security question", () => {
  it("accepts Mara in any case or spacing and rejects other names", () => {
    for (const v of ["mara", "MARA", " Mara ", "Mara."]) expect(checkAnswer("tools-folder", v)).toBe(true);
    for (const v of ["ada", "weather", "gale", ""]) expect(checkAnswer("tools-folder", v)).toBe(false);
  });

  it("the clue lives in Ada's Personal", () => {
    const note = bonusFiles().find((f) => f.name === "notes_on_mara.txt");
    expect(note?.body).toMatch(/Dad called her his weather/);
  });
});

describe("Vault entry", () => {
  it("Meridian's nav links to the staff portal, which is branded as the Vault", () => {
    const home = resolveSite("meridian-inst.net", fresh());
    const nav = home?.blocks.find((b): b is Extract<Block, { type: "nav" }> => b.type === "nav");
    const portal = nav?.links.find((l) => l.text === "Staff portal");
    expect(portal?.href).toBe("intranet.meridian-inst.net");
    const login = resolveSite(portal!.href, fresh());
    expect(login?.title).toMatch(/Vault/);
    expect(login?.blocks.some((b) => b.type === "form" && /vault code/i.test(b.prompt))).toBe(true);
  });
});
