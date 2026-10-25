import { error, json } from "@/server/http";
import { enabledProviders, getSessionUser } from "@/server/auth";
import { registrationOptions, relyingParty } from "@/server/passkeys";
import { getT } from "@/i18n/server";

/** POST (signed in) → options for navigator.credentials.create, to add a passkey to this account. */
export async function POST(req: Request) {
  const t = await getT();
  if (!enabledProviders.includes("passkey")) return error(404, t("api.account.passkeysOff"));
  const user = await getSessionUser();
  if (!user) return error(401, t("api.account.signIn"));
  return json(await registrationOptions(user, relyingParty(req.headers)));
}
