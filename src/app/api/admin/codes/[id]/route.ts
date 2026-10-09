import { db } from "@/server/db";
import { error, isResponse, json } from "@/server/http";
import { requireAdmin } from "@/server/admin";

/** DELETE → revoke an unused code. Redeemed codes stay: purchases are permanent. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const { id } = await params;
  const res = await db.purchaseCode.deleteMany({ where: { id, redeemedById: null } });
  if (res.count === 0) return error(409, "Only unused codes can be revoked.");
  return json({ ok: true });
}
