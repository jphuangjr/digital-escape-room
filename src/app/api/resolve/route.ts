import type { ResolveResponse } from "@/lib/types";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { canonicalAddress, hostOf, parseProgress, withDiscovery } from "@/server/logic";
import { mutateProgress } from "@/server/progress";
import { publish } from "@/server/realtime";
import { track } from "@/server/analytics";
import { resolveSite } from "@/server/content";

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
    const before = visited.size;
    const newHost = !visited.has(host);
    visited.add(host);
    visited.add(page.address);
    if (visited.size === before) return null;
    const discoveries = newHost
      ? withDiscovery(progress.discoveries, { kind: "site", host, playerId: player.id, playerName: player.displayName })
      : progress.discoveries;
    return { progress: { ...progress, visitedSites: [...visited], discoveries } };
  });

  track(room.id, player.id, "site.visit", { address: page.address, host });
  if (res.changed) await publish(room.code, "progress.updated", { reason: "visit", host });

  return json<ResolveResponse>({ ok: true, page, progress: res.progress });
}
