import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { hashCode, hashIp, newCode, normalizeEmail } from "../emailCode";
import { relyingParty } from "../passkeys";

describe("email codes", () => {
  it("normalises addresses and rejects junk", () => {
    expect(normalizeEmail("  Sam@Example.COM ")).toBe("sam@example.com");
    expect(normalizeEmail("not an email")).toBeNull();
    expect(normalizeEmail("a@b")).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
    expect(normalizeEmail(`${"x".repeat(250)}@example.com`)).toBeNull();
  });

  it("makes six-digit codes, keeping leading zeros", () => {
    expect(newCode(() => 42)).toBe("000042");
    expect(newCode(() => 999_999)).toBe("999999");
    expect(newCode()).toMatch(/^\d{6}$/);
  });

  it("hashes codes per address and secret, never storing the code", () => {
    const h = hashCode("sam@example.com", "123456", "s1");
    expect(h).not.toContain("123456");
    expect(h).toBe(hashCode("sam@example.com", "123456", "s1"));
    expect(h).not.toBe(hashCode("lee@example.com", "123456", "s1"));
    expect(h).not.toBe(hashCode("sam@example.com", "123456", "s2"));
    expect(hashIp(null)).toBeNull();
    expect(hashIp("1.2.3.4", "s1")).not.toContain("1.2.3.4");
  });
});

describe("relyingParty", () => {
  it("uses the forwarded host and protocol (Vercel)", () => {
    expect(relyingParty(new Headers({ "x-forwarded-host": "www.escape-escape.com", "x-forwarded-proto": "https", host: "internal" }))).toEqual({
      rpID: "www.escape-escape.com",
      origin: "https://www.escape-escape.com",
    });
  });

  it("handles localhost with a port, and next-auth's plain header object", () => {
    expect(relyingParty({ host: "localhost:3100" })).toEqual({ rpID: "localhost", origin: "http://localhost:3100" });
  });
});

// Issuing and checking codes against a real, migrated Postgres. Opt-in, because it writes rows:
//   SIGNIN_DB_TEST=1 POSTGRES_PRISMA_URL=<scratch db> npx vitest run src/server/__tests__/signin.test.ts
describe.skipIf(!process.env.SIGNIN_DB_TEST)("email codes against Postgres", async () => {
  const { db } = await import("../db");
  const { issueCode, verifyCode, MAX_CODE_ATTEMPTS } = await import("../emailCode");
  const email = `t${Date.now()}@example.com`;
  afterAll(async () => {
    await db.emailCode.deleteMany({ where: { email: { startsWith: email.split("@")[0] } } });
    await db.$disconnect();
  });

  it("accepts the newest code once, and only once", async () => {
    const issued = await issueCode(email, "10.0.0.1");
    expect(issued.ok).toBe(true);
    if (!issued.ok) return;
    expect(await verifyCode(email, "000000" === issued.code ? "111111" : "000000")).toBe(false);
    expect(await verifyCode(email, issued.code)).toBe(true);
    expect(await verifyCode(email, issued.code)).toBe(false);
  });

  it("makes you wait a minute before another code", async () => {
    const again = await issueCode(email, "10.0.0.1");
    expect(again).toMatchObject({ ok: false, reason: "rate" });
  });

  it("burns a code after too many wrong tries", async () => {
    const other = `${email.split("@")[0]}b@example.com`;
    const issued = await issueCode(other, "10.0.0.2");
    if (!issued.ok) throw new Error("expected a code");
    const wrong = issued.code === "000000" ? "111111" : "000000";
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) expect(await verifyCode(other, wrong)).toBe(false);
    expect(await verifyCode(other, issued.code)).toBe(false);
  });

  it("only the latest code counts", async () => {
    const third = `${email.split("@")[0]}c@example.com`;
    const first = await issueCode(third, "10.0.0.3", new Date(Date.now() - 2 * 60_000));
    const second = await issueCode(third, "10.0.0.3");
    if (!first.ok || !second.ok) throw new Error("expected codes");
    if (first.code !== second.code) expect(await verifyCode(third, first.code)).toBe(false);
    expect(await verifyCode(third, second.code)).toBe(true);
  });
});
