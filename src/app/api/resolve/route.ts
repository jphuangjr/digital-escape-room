import type { AppId, ResolveResponse } from "@/lib/types";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { canonicalAddress, hostOf, parseProgress } from "@/server/logic";
import { mutateProgress } from "@/server/progress";
import { publish } from "@/server/realtime";
import { track } from "@/server/analytics";
import { resolveSite } from "@/server/content";

const DECODER_HOST = "lostpaws.net";

export async function POST(req: Request) {
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  if (typeof body.code !== "string") return error(400, "Missing room code.");
  if (typeof body.address !== "string" || body.address.length > 300) return error(400, "Missing address.");
  const ctx = await requirePlayer(body.code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;

  const address = canonicalAddress(body.address);
  const page = address ? resolveSite(address, parseProgress(room.progress)) : null;
  if (!page) return json<ResolveResponse>({ ok: false, error: "unreachable" });

  const host = hostOf(page.address);
  const res = await mutateProgress(room.id, ({ progress }) => {
    const visited = new Set(progress.visitedSites);
    const apps = new Set<AppId>(progress.unlockedApps);
    const before = visited.size + apps.size;
    visited.add(host);
    visited.add(page.address);
    if (host === DECODER_HOST) apps.add("decoder");
    if (visited.size + apps.size === before) return null;
    return { progress: { ...progress, visitedSites: [...visited], unlockedApps: [...apps] } };
  });

  track(room.id, player.id, "site.visit", { address: page.address, host });
  if (res.changed) await publish(room.code, "progress.updated", { reason: "visit", host });

  return json<ResolveResponse>({ ok: true, page, progress: res.progress });
}
