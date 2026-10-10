import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  CODE_RE,
  canonicalAddress,
  decideVote,
  generateRoomCode,
  hintCooldownUntil,
  isProfane,
  nextHintTier,
  normalizeRoomCode,
  rateLimitDecision,
  tally,
  validateColor,
  validateDisplayName,
} from "../logic";

describe("room codes", () => {
  it("generates ADA-XXXX from the unambiguous alphabet", () => {
    for (let i = 0; i < 500; i++) {
      const code = generateRoomCode((n) => Math.floor(Math.random() * n));
      expect(code).toMatch(CODE_RE);
    }
    for (const bad of ["0", "O", "1", "I", "L"]) expect(CODE_ALPHABET).not.toContain(bad);
  });

  it("is deterministic given the rng", () => {
    expect(generateRoomCode(() => 0)).toBe(`ADA-${CODE_ALPHABET[0].repeat(4)}`);
  });

  it("normalizes user-entered codes", () => {
    expect(normalizeRoomCode("ada-7k2q")).toBe("ADA-7K2Q");
    expect(normalizeRoomCode(" ADA7K2Q ")).toBe("ADA-7K2Q");
    expect(normalizeRoomCode("7k2q")).toBe("ADA-7K2Q");
    expect(normalizeRoomCode("ADA-0OIL")).toBeNull();
    expect(normalizeRoomCode("ADA-7K2")).toBeNull();
    expect(normalizeRoomCode(42)).toBeNull();
  });
});

describe("identity validation", () => {
  it("trims, strips control chars, enforces length", () => {
    expect(validateDisplayName("  Sam\u0000 Spade  ")).toEqual({ ok: true, value: "Sam Spade" });
    expect(validateDisplayName("   ").ok).toBe(false);
    expect(validateDisplayName("x".repeat(25)).ok).toBe(false);
    expect(validateDisplayName("x".repeat(24)).ok).toBe(true);
    expect(validateDisplayName(undefined).ok).toBe(false);
  });

  it("blocks basic profanity without Scunthorpe false positives", () => {
    expect(isProfane("sh1thead")).toBe(true);
    expect(isProfane("big dick")).toBe(true);
    expect(isProfane("Dickens")).toBe(false);
    expect(isProfane("Hitchcock")).toBe(false);
    expect(validateDisplayName("Fuck").ok).toBe(false);
  });

  it("validates hex colors", () => {
    expect(validateColor("#C9A227")).toBe("#c9a227");
    expect(validateColor("#abc")).toBe("#aabbcc");
    expect(validateColor("red")).toBeNull();
    expect(validateColor("#12345g")).toBeNull();
  });
});

describe("addresses", () => {
  it("canonicalizes", () => {
    expect(canonicalAddress("HTTPS://www.TheDrift.blog/")).toBe("thedrift.blog");
    expect(canonicalAddress("meridian-inst.net/vault-2019/?x=1")).toBe("meridian-inst.net/vault-2019");
  });
});

describe("rateLimitDecision", () => {
  const now = new Date("2026-01-01T00:01:00Z");
  const ago = (s: number) => new Date(now.getTime() - s * 1000);

  it("allows under the limit", () => {
    expect(rateLimitDecision([ago(1), ago(2), ago(3), ago(4)], now).limited).toBe(false);
  });

  it("blocks at 5 in the window and computes retry-after", () => {
    const d = rateLimitDecision([ago(50), ago(40), ago(30), ago(20), ago(10)], now);
    expect(d.limited).toBe(true);
    expect(d.retryAfterSec).toBe(10); // the 50s-old attempt expires in 10s
  });

  it("ignores attempts outside the window", () => {
    expect(rateLimitDecision([ago(61), ago(70), ago(30), ago(20), ago(10)], now).limited).toBe(false);
  });
});

describe("hints", () => {
  const now = new Date("2026-01-01T00:10:00Z");
  it("next tier", () => {
    expect(nextHintTier([])).toBe(1);
    expect(nextHintTier([1])).toBe(2);
    expect(nextHintTier([1, 2, 3])).toBeNull();
  });
  it("cooldown is 2 min after last tier", () => {
    const h = [{ puzzleId: "shift-key" as const, tier: 1, createdAt: new Date(now.getTime() - 60_000) }];
    expect(hintCooldownUntil(h, "shift-key", now)?.toISOString()).toBe("2026-01-01T00:11:00.000Z");
    expect(hintCooldownUntil(h, "find-blog", now)).toBeNull();
    const old = [{ puzzleId: "shift-key" as const, tier: 1, createdAt: new Date(now.getTime() - 180_000) }];
    expect(hintCooldownUntil(old, "shift-key", now)).toBeNull();
  });
});

describe("decideVote", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const future = new Date(now.getTime() + 60_000);
  const past = new Date(now.getTime() - 1);

  it("stays open until all online players voted", () => {
    expect(
      decideVote({ votes: [{ playerId: "a", choice: "EXPOSE" }], onlinePlayerIds: ["a", "b"], deadline: future, now }),
    ).toEqual({ action: "open" });
  });

  it("closes on majority when everyone online voted", () => {
    const d = decideVote({
      votes: [
        { playerId: "a", choice: "EXPOSE" },
        { playerId: "b", choice: "EXPOSE" },
        { playerId: "c", choice: "PROTECT" },
      ],
      onlinePlayerIds: ["a", "b", "c"],
      deadline: future,
      now,
    });
    expect(d).toEqual({ action: "close", ending: "EXPOSE", summary: { EXPOSE: 2, PROTECT: 1 } });
  });

  it("closes at the deadline even if some haven't voted", () => {
    const d = decideVote({ votes: [{ playerId: "a", choice: "PROTECT" }], onlinePlayerIds: ["a", "b"], deadline: past, now });
    expect(d.action).toBe("close");
  });

  it("reports a tie (host breaks it)", () => {
    const d = decideVote({
      votes: [
        { playerId: "a", choice: "EXPOSE" },
        { playerId: "b", choice: "PROTECT" },
      ],
      onlinePlayerIds: ["a", "b"],
      deadline: future,
      now,
    });
    expect(d.action).toBe("tie");
  });

  it("no votes at deadline is a tie", () => {
    expect(decideVote({ votes: [], onlinePlayerIds: ["a"], deadline: past, now }).action).toBe("tie");
  });

  it("does not close with nobody online and time remaining", () => {
    expect(decideVote({ votes: [], onlinePlayerIds: [], deadline: future, now }).action).toBe("open");
  });

  it("tally ignores junk", () => {
    expect(tally([{ choice: "EXPOSE" }, { choice: "nope" }, { choice: "PROTECT" }, { choice: "PROTECT" }])).toEqual({
      EXPOSE: 1,
      PROTECT: 2,
    });
  });
});

describe("case log", () => {
  it("appends discoveries with unique ids and timestamps, oldest first", async () => {
    const { withDiscovery } = await import("../logic");
    const t = new Date("2026-10-10T12:00:00Z");
    let log = withDiscovery([], { kind: "site", host: "thedrift.blog", playerId: "p1", playerName: "Lee" }, t);
    log = withDiscovery(log, { kind: "puzzle", puzzleId: "shift-key", playerId: "p2", playerName: "Sam" }, t);
    expect(log.map((d) => d.kind)).toEqual(["site", "puzzle"]);
    expect(new Set(log.map((d) => d.id)).size).toBe(2);
    expect(log[1]).toMatchObject({ puzzleId: "shift-key", playerName: "Sam", at: t.toISOString() });
  });

  it("caps the log and drops the oldest entries", async () => {
    const { withDiscovery, MAX_DISCOVERIES } = await import("../logic");
    let log: ReturnType<typeof withDiscovery> = [];
    for (let i = 0; i < MAX_DISCOVERIES + 5; i++) {
      log = withDiscovery(log, { kind: "site", host: `site${i}.net`, playerId: "p", playerName: "P" });
    }
    expect(log).toHaveLength(MAX_DISCOVERIES);
    expect(log[0]).toMatchObject({ host: "site5.net" });
  });

  it("parses old progress without a case log", async () => {
    const { parseProgress } = await import("../logic");
    expect(parseProgress({ solved: ["shift-key"] }).discoveries).toEqual([]);
  });
});

describe("chat", () => {
  it("cleans message bodies", async () => {
    const { cleanChatBody, CHAT_MAX_LEN } = await import("../logic");
    expect(cleanChatBody("  hi there  ")).toEqual({ ok: true, body: "hi there" });
    expect(cleanChatBody("a\r\n\n\n\nb")).toEqual({ ok: true, body: "a\n\nb" });
    expect(cleanChatBody("zero​width\u0007")).toEqual({ ok: true, body: "zerowidth" });
    expect(cleanChatBody("   ").ok).toBe(false);
    expect(cleanChatBody(42).ok).toBe(false);
    expect(cleanChatBody("x".repeat(CHAT_MAX_LEN)).ok).toBe(true);
    expect(cleanChatBody("x".repeat(CHAT_MAX_LEN + 1)).ok).toBe(false);
  });

  it("rate-limits to one message per second per player", async () => {
    const { chatCooldownSec } = await import("../logic");
    const now = new Date("2026-10-10T12:00:01.000Z");
    expect(chatCooldownSec(null, now)).toBe(0);
    expect(chatCooldownSec(new Date("2026-10-10T12:00:00.500Z"), now)).toBe(1);
    expect(chatCooldownSec(new Date("2026-10-10T12:00:00.000Z"), now)).toBe(0);
  });
});

describe("wrong-answer lockout", () => {
  it("counts down a minute from the last wrong key", async () => {
    const { lockoutRemainingSec, WRONG_ANSWER_LOCKOUT_MS } = await import("@/lib/rules");
    const ms = WRONG_ANSWER_LOCKOUT_MS["shift-key"]!;
    expect(ms).toBe(60_000);
    const wrong = new Date("2026-01-01T00:00:00Z");
    expect(lockoutRemainingSec(wrong, new Date("2026-01-01T00:00:00.500Z"), ms)).toBe(60);
    expect(lockoutRemainingSec(wrong, new Date("2026-01-01T00:00:59.100Z"), ms)).toBe(1);
    expect(lockoutRemainingSec(wrong, new Date("2026-01-01T00:01:00Z"), ms)).toBe(0);
    expect(lockoutRemainingSec(null, new Date(), ms)).toBe(0);
    expect(lockoutRemainingSec(wrong.toISOString(), wrong.getTime() + 30_000, ms)).toBe(30);
    expect(WRONG_ANSWER_LOCKOUT_MS["intranet-login"]).toBeUndefined();
  });
});
