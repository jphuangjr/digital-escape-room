import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import type { PasskeyDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, json, readBody } from "@/server/http";
import { enabledProviders, getSessionUser } from "@/server/auth";
import { finishRegistration, relyingParty } from "@/server/passkeys";
import { getT } from "@/i18n/server";

/** GET (signed in) → this account's passkeys (no key material). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return error(401, (await getT())("api.account.signIn"));
  const rows = await db.passkey.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return json<{ passkeys: PasskeyDTO[] }>({
    passkeys: rows.map((p) => ({
      id: p.id,
      createdAt: p.createdAt.toISOString(),
      lastUsedAt: p.lastUsedAt?.toISOString() ?? null,
      synced: p.deviceType === "multiDevice",
    })),
  });
}

/** POST {response} (signed in) → verify the device's answer to register-options and save the passkey. */
export async function POST(req: Request) {
  const t = await getT();
  if (!enabledProviders.includes("passkey")) return error(404, t("api.account.passkeysOff"));
  const user = await getSessionUser();
  if (!user) return error(401, t("api.account.signIn"));
  const response = (await readBody(req))?.response as RegistrationResponseJSON | undefined;
  if (!response || typeof response !== "object") return error(400, t("api.account.passkeyFailed"));
  const ok = await finishRegistration(user, response, relyingParty(req.headers));
  return ok ? json({ ok: true }, 201) : error(400, t("api.account.passkeyFailed"));
}
