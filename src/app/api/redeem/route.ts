import { error, json, readBody } from "@/server/http";
import { getSessionUser } from "@/server/auth";
import { redeemCode } from "@/server/purchases";
import { gameTitle } from "@/lib/games";
import { getT } from "@/i18n/server";

/** POST {code} → unlock hosting for the code's game, permanently, for the signed-in user. */
export async function POST(req: Request) {
  const t = await getT();
  const user = await getSessionUser();
  if (!user) return error(401, t("api.redeem.signIn"), { signInRequired: true });
  const body = await readBody(req);
  const res = await redeemCode(user, body?.code);
  if (!res.ok) return error(res.status, t(res.messageId));
  return json({ ok: true, gameId: res.gameId, title: gameTitle(res.gameId), alreadyOwned: res.alreadyOwned });
}
