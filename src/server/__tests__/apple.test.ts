import { describe, expect, it, vi } from "vitest";
import { generateKeyPairSync, verify } from "node:crypto";

vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({ db: {} }));

import { appleClientSecret, isAppleRelayEmail } from "../apple";
import { callbackCookies } from "../auth";

const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const decode = (part: string) => JSON.parse(Buffer.from(part, "base64url").toString());

describe("appleClientSecret", () => {
  const now = Date.UTC(2026, 9, 25);
  const opts = { teamId: "TEAM123456", keyId: "KEY1234567", clientId: "com.escapeescape.web", privateKey: pem, now };

  it("is an ES256 JWT with Apple's claims, valid for 180 days", () => {
    const [h, p] = appleClientSecret(opts).split(".");
    expect(decode(h)).toEqual({ alg: "ES256", kid: "KEY1234567", typ: "JWT" });
    expect(decode(p)).toEqual({
      iss: "TEAM123456",
      sub: "com.escapeescape.web",
      aud: "https://appleid.apple.com",
      iat: now / 1000,
      exp: now / 1000 + 180 * 24 * 60 * 60,
    });
  });

  it("is signed by the key, as a raw 64-byte signature", () => {
    const [h, p, sig] = appleClientSecret(opts).split(".");
    const raw = Buffer.from(sig, "base64url");
    expect(raw).toHaveLength(64);
    expect(verify("sha256", Buffer.from(`${h}.${p}`), { key: publicKey, dsaEncoding: "ieee-p1363" }, raw)).toBe(true);
  });

  it("accepts a key pasted on one line with \\n escapes", () => {
    const oneLine = pem.trim().replace(/\n/g, "\\n");
    const [h, p, sig] = appleClientSecret({ ...opts, privateKey: oneLine }).split(".");
    expect(verify("sha256", Buffer.from(`${h}.${p}`), { key: publicKey, dsaEncoding: "ieee-p1363" }, Buffer.from(sig, "base64url"))).toBe(true);
  });

  it("throws on a key that isn't one", () => {
    expect(() => appleClientSecret({ ...opts, privateKey: "not a key" })).toThrow();
  });
});

describe("isAppleRelayEmail", () => {
  it("spots Hide My Email addresses", () => {
    expect(isAppleRelayEmail("x1y2z3@privaterelay.appleid.com")).toBe(true);
    expect(isAppleRelayEmail("X1@PrivateRelay.AppleID.com")).toBe(true);
    expect(isAppleRelayEmail("sam@icloud.com")).toBe(false);
    expect(isAppleRelayEmail(null)).toBe(false);
  });
});

describe("callbackCookies", () => {
  it("leaves next-auth's defaults alone without Apple, or over plain http", () => {
    expect(callbackCookies(true, false)).toBeUndefined();
    expect(callbackCookies(false, true)).toBeUndefined();
  });

  it("makes the OAuth round-trip cookies SameSite=None for Apple's cross-site POST, keeping the session cookie", () => {
    const cookies = callbackCookies(true, true)!;
    expect(Object.keys(cookies).sort()).toEqual(["callbackUrl", "nonce", "pkceCodeVerifier", "state"]);
    expect(cookies.pkceCodeVerifier).toEqual({
      name: "__Secure-next-auth.pkce.code_verifier",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true, maxAge: 900 },
    });
    expect(cookies.callbackUrl?.name).toBe("__Secure-next-auth.callback-url");
    expect(cookies.sessionToken).toBeUndefined();
  });
});
