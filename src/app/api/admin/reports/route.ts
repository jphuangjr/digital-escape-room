import type { AdminChatReport } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { getT } from "@/i18n/server";

/** GET → open chat reports (oldest first), then the 50 most recently resolved. */
export async function GET() {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const [open, resolved] = await Promise.all([
    db.chatReport.findMany({ where: { resolvedAt: null }, orderBy: { createdAt: "asc" }, take: 200 }),
    db.chatReport.findMany({ where: { resolvedAt: { not: null } }, orderBy: { resolvedAt: "desc" }, take: 50 }),
  ]);
  const rows = [...open, ...resolved];
  const key = (r: (typeof rows)[number]) => r.reportedUserId ?? r.reportedPlayerId;
  const openBy = new Map<string, number>();
  for (const r of open) openBy.set(key(r), (openBy.get(key(r)) ?? 0) + 1);
  const reports: AdminChatReport[] = rows.map((r) => ({
    id: r.id,
    gameId: r.gameId,
    body: r.body,
    reason: r.reason as AdminChatReport["reason"],
    reportedName: r.reportedName,
    reporterName: r.reporterName,
    repeat: Math.max(0, (openBy.get(key(r)) ?? 0) - (r.resolvedAt ? 0 : 1)),
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
  }));
  return json({ reports });
}

/** PATCH {id, resolved} → mark a report handled (or reopen it). */
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const t = await getT();
  const body = await readBody(req);
  if (typeof body?.id !== "string" || typeof body.resolved !== "boolean") return error(400, t("api.admin.badReport"));
  const res = await db.chatReport.updateMany({ where: { id: body.id }, data: { resolvedAt: body.resolved ? new Date() : null } });
  return res.count ? json({ ok: true }) : error(404, t("api.admin.badReport"));
}
