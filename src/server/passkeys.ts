import "server-only";
import type { User } from "@prisma/client";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { db } from "./db";

/** A challenge must be answered within 5 minutes, once. */
const CHALLENGE_TTL_MS = 5 * 60_000;
const RP_NAME = "Escape Escape";

/** Where the request came from: the WebAuthn relying party (domain) and origin the browser will report. */
export interface RelyingParty {
  rpID: string;
  origin: string;
}

type HeaderBag = Headers | Record<string, string | string[] | undefined>;

function header(h: HeaderBag, name: string): string | undefined {
  if (h instanceof Headers) return h.get(name) ?? undefined;
  const v = h[name] ?? h[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

/**
 * The relying party for a request: its host (Vercel sets x-forwarded-host), or AUTH_RP_ID when set. A passkey is
 * bound to the domain it was made on, so the same account's passkey only works on that domain (production's, not
 * a preview's); the browser and authenticator enforce that, and we check the origin they report.
 */
export function relyingParty(headers: HeaderBag): RelyingParty {
  const host = (header(headers, "x-forwarded-host") ?? header(headers, "host") ?? "localhost").split(",")[0].trim();
  const hostname = host.replace(/:\d+$/, "");
  const local = hostname === "localhost" || hostname === "127.0.0.1";
  const proto = header(headers, "x-forwarded-proto")?.split(",")[0].trim() ?? (local ? "http" : "https");
  return { rpID: process.env.AUTH_RP_ID || hostname, origin: `${proto}://${host}` };
}

/** Use up a pending challenge: true only for the first answer, before it expires. */
async function takeChallenge(challenge: string, kind: "register" | "login", userId: string | null, now = new Date()): Promise<boolean> {
  const res = await db.authChallenge.deleteMany({ where: { challenge, kind, userId, expiresAt: { gt: now } } });
  // Tidy up challenges nobody answered.
  await db.authChallenge.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});
  return res.count === 1;
}

async function saveChallenge(challenge: string, kind: "register" | "login", userId: string | null) {
  await db.authChallenge.create({ data: { challenge, kind, userId, expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) } });
}

/** Options for creating a passkey on this device for a signed-in user. */
export async function registrationOptions(user: User, rp: RelyingParty): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const existing = await db.passkey.findMany({ where: { userId: user.id }, select: { credentialId: true, transports: true } });
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rp.rpID,
    userName: user.email || user.name || "player",
    userDisplayName: user.name || user.email || "",
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: existing.map((p) => ({ id: p.credentialId, transports: p.transports })),
    // Discoverable, so signing in needs no email: the device offers the account's passkey.
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
  });
  await saveChallenge(options.challenge, "register", user.id);
  return options;
}

/** Check the device's answer and store the new passkey. */
export async function finishRegistration(user: User, response: RegistrationResponseJSON, rp: RelyingParty): Promise<boolean> {
  const result = await verifyRegistrationResponse({
    response,
    expectedChallenge: (c) => takeChallenge(c, "register", user.id),
    expectedOrigin: rp.origin,
    expectedRPID: rp.rpID,
    requireUserVerification: false,
  }).catch(() => null);
  if (!result?.verified) return false;
  const { credential, credentialDeviceType, credentialBackedUp } = result.registrationInfo;
  await db.passkey.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    },
  });
  return true;
}

/** Options for signing in with any passkey this device holds for the site. */
export async function loginOptions(rp: RelyingParty): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const options = await generateAuthenticationOptions({ rpID: rp.rpID, userVerification: "preferred" });
  await saveChallenge(options.challenge, "login", null);
  return options;
}

/** Check a passkey sign-in; the user it belongs to, or null. */
export async function finishLogin(response: AuthenticationResponseJSON, rp: RelyingParty): Promise<string | null> {
  if (typeof response?.id !== "string") return null;
  const passkey = await db.passkey.findUnique({ where: { credentialId: response.id } });
  if (!passkey) return null;
  const result = await verifyAuthenticationResponse({
    response,
    expectedChallenge: (c) => takeChallenge(c, "login", null),
    expectedOrigin: rp.origin,
    expectedRPID: rp.rpID,
    credential: { id: passkey.credentialId, publicKey: new Uint8Array(passkey.publicKey), counter: passkey.counter, transports: passkey.transports },
    requireUserVerification: false,
  }).catch(() => null);
  if (!result?.verified) return null;
  await db.passkey.update({
    where: { id: passkey.id },
    data: { counter: result.authenticationInfo.newCounter, backedUp: result.authenticationInfo.credentialBackedUp, lastUsedAt: new Date() },
  });
  return passkey.userId;
}
