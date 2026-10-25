import "server-only";
import { createPrivateKey, sign } from "node:crypto";

/** Apple caps a client secret's lifetime at 6 months; a server instance never lives that long. */
const SECRET_TTL_SEC = 180 * 24 * 60 * 60;

const b64url = (data: string | Buffer) => Buffer.from(data).toString("base64url");

/**
 * Sign in with Apple has no fixed client secret: it's an ES256 JWT signed with the .p8 key from the Apple developer
 * site. We mint one when the server starts, so nobody has to rotate it by hand. `privateKey` is the .p8 file's
 * contents; "\n" escapes (a key pasted as one line) are accepted.
 */
export function appleClientSecret(opts: { teamId: string; keyId: string; clientId: string; privateKey: string; now?: number }): string {
  const iat = Math.floor((opts.now ?? Date.now()) / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: opts.keyId, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ iss: opts.teamId, iat, exp: iat + SECRET_TTL_SEC, aud: "https://appleid.apple.com", sub: opts.clientId }),
  );
  const key = createPrivateKey(opts.privateKey.replace(/\\n/g, "\n").trim());
  // JWS wants the raw r||s signature, not DER.
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${b64url(signature)}`;
}

/** Addresses from Apple's "Hide My Email" relay: real and verified, but the local part is random. */
export function isAppleRelayEmail(email: string | null | undefined): boolean {
  return Boolean(email?.toLowerCase().endsWith("@privaterelay.appleid.com"));
}
