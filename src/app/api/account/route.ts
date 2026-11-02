import { error, json, readBody } from "@/server/http";
import { getSessionUser } from "@/server/auth";
import { deleteAccount } from "@/server/accountDeletion";
import { getT } from "@/i18n/server";

/**
 * DELETE {confirm: true} (signed in) → delete the account and everything tied to it (see deleteAccount).
 * The client signs out afterwards; until it does, the session cookie points at no user and counts as signed out.
 */
export async function DELETE(req: Request) {
  const t = await getT();
  const user = await getSessionUser();
  if (!user) return error(401, t("api.account.signIn"));
  if ((await readBody(req))?.confirm !== true) return error(400, t("api.account.confirmDelete"));
  await deleteAccount(user.id);
  return json({ ok: true });
}
