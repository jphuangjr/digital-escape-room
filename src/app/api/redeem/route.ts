import { error, json, readBody } from "@/server/http";
import { getSessionUser } from "@/server/auth";
import { redeemCode } from "@/server/purchases";
import { gameTitle } from "@/lib/games";

/** POST {code} → unlock hosting for the code's game, permanently, for the signed-in user. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error(401, "Sign in with Google to redeem a code.", { signInRequired: true });
  const body = await readBody(req);
  const res = await redeemCode(user, body?.code);
  if (!res.ok) return error(res.status, res.error);
  return json({ ok: true, gameId: res.gameId, title: gameTitle(res.gameId), alreadyOwned: res.alreadyOwned });
}
