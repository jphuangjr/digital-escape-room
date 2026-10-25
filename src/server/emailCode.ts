import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "./db";

/** A code lives 10 minutes; 5 wrong tries burn it. */
export const CODE_TTL_MS = 10 * 60_000;
export const MAX_CODE_ATTEMPTS = 5;
/** Per address: one code a minute, 5 an hour. Per requester IP: 20 an hour. */
export const RESEND_AFTER_MS = 60_000;
export const MAX_CODES_PER_EMAIL_HOUR = 5;
export const MAX_CODES_PER_IP_HOUR = 20;

const HOUR = 60 * 60_000;

/** "  Sam@Example.COM " → "sam@example.com", or null when it isn't a plausible address. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return e;
}

/** A six-digit code, leading zeros allowed. */
export function newCode(rand: (max: number) => number = randomInt): string {
  return String(rand(1_000_000)).padStart(6, "0");
}

/** Keyed hash, so a leaked table row can't be brute-forced offline without the server secret. */
export function hashCode(email: string, code: string, secret = process.env.AUTH_SECRET ?? ""): string {
  return createHash("sha256").update(`${secret}:${email}:${code}`).digest("hex");
}

export function hashIp(ip: string | null, secret = process.env.AUTH_SECRET ?? ""): string | null {
  return ip ? createHash("sha256").update(`${secret}:ip:${ip}`).digest("hex").slice(0, 32) : null;
}

function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export type IssueResult = { ok: true; code: string } | { ok: false; reason: "rate"; retryAfterSec: number };

/**
 * Issue a new code for `email` (earlier unused ones stop working). The caller emails it. Rate limits apply per
 * address and per requester IP, and say nothing about whether an account exists.
 */
export async function issueCode(email: string, ip: string | null, now = new Date()): Promise<IssueResult> {
  const ipHash = hashIp(ip);
  const hourAgo = new Date(now.getTime() - HOUR);
  const [recent, byIp] = await Promise.all([
    db.emailCode.findMany({ where: { email, createdAt: { gte: hourAgo } }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    ipHash ? db.emailCode.count({ where: { ipHash, createdAt: { gte: hourAgo } } }) : Promise.resolve(0),
  ]);
  const last = recent[0]?.createdAt.getTime();
  if (last && now.getTime() - last < RESEND_AFTER_MS) {
    return { ok: false, reason: "rate", retryAfterSec: Math.ceil((last + RESEND_AFTER_MS - now.getTime()) / 1000) };
  }
  if (recent.length >= MAX_CODES_PER_EMAIL_HOUR || byIp >= MAX_CODES_PER_IP_HOUR) {
    const oldest = recent.at(-1)?.createdAt.getTime() ?? now.getTime();
    return { ok: false, reason: "rate", retryAfterSec: Math.max(60, Math.ceil((oldest + HOUR - now.getTime()) / 1000)) };
  }
  const code = newCode();
  await db.$transaction([
    db.emailCode.updateMany({ where: { email, consumedAt: null }, data: { consumedAt: now } }),
    db.emailCode.create({ data: { email, codeHash: hashCode(email, code), ipHash, createdAt: now, expiresAt: new Date(now.getTime() + CODE_TTL_MS) } }),
  ]);
  return { ok: true, code };
}

/**
 * Check a code for `email`: only the newest unused, unexpired code counts, a wrong guess uses up one of its tries,
 * and a right one is consumed so it can't be replayed.
 */
export async function verifyCode(email: string, code: unknown, now = new Date()): Promise<boolean> {
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) return false;
  const row = await db.emailCode.findFirst({
    where: { email, consumedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.attempts >= MAX_CODE_ATTEMPTS) return false;
  if (!sameHash(row.codeHash, hashCode(email, code.trim()))) {
    await db.emailCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  // Consume it exactly once, even if two requests race with the same code.
  const used = await db.emailCode.updateMany({ where: { id: row.id, consumedAt: null }, data: { consumedAt: now } });
  return used.count === 1;
}
