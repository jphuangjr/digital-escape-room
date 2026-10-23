import type { AdminBoardEntry } from "@/lib/types";
import { error, isResponse, json } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { recentEntries, setEntryHidden } from "@/server/leaderboard";

/** GET /api/admin/leaderboard  (signed-in admins) → recent entries on every board, hidden ones included. */
export async function GET() {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  return json<{ entries: AdminBoardEntry[] }>({ entries: await recentEntries() });
}

/** PATCH {id, hidden} → hide an entry from (or bring it back to) the public leaderboards. */
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = (await req.json().catch(() => null)) as { id?: unknown; hidden?: unknown } | null;
  if (typeof body?.id !== "string" || typeof body.hidden !== "boolean") return error(400, "Expected {id, hidden}.");
  if (!(await setEntryHidden(body.id, body.hidden))) return error(404, "No such entry.");
  return json({ ok: true });
}
