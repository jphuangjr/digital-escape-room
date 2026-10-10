import { db } from "@/server/db";
import { error, isResponse, json } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { getT } from "@/i18n/server";

/** DELETE → turn a code off. It stops working; purchases already made with it stay (they're permanent). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const { id } = await params;
  const res = await db.purchaseCode.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (res.count === 0) return error(404, (await getT())("api.admin.noSuchCode"));
  return json({ ok: true });
}
