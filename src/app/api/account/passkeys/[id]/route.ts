import { db } from "@/server/db";
import { error, json } from "@/server/http";
import { getSessionUser } from "@/server/auth";
import { getT } from "@/i18n/server";

/** DELETE (signed in) → remove one of your own passkeys. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const user = await getSessionUser();
  if (!user) return error(401, t("api.account.signIn"));
  const { id } = await params;
  const res = await db.passkey.deleteMany({ where: { id, userId: user.id } });
  return res.count ? json({ ok: true }) : error(404, t("api.account.noPasskey"));
}
