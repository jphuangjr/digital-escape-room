import { error, json } from "@/server/http";
import { enabledProviders } from "@/server/auth";
import { loginOptions, relyingParty } from "@/server/passkeys";

/** POST → options for navigator.credentials.get; the answer goes to next-auth's "passkey" provider. */
export async function POST(req: Request) {
  if (!enabledProviders.includes("passkey")) return error(404, "Passkeys are off.");
  return json(await loginOptions(relyingParty(req.headers)));
}
