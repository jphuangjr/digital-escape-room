import type { Locale } from "@/i18n/config";
import type { RoomProgress, SiteHistoryEntry } from "@/lib/types";
import { resolveSite } from "./content";

/** Where Ada's browser starts: listed until someone opens it, so a new room isn't an empty history. */
export const START_SITE = "meridian-inst.com";

/**
 * Ada's shared browser history: every site anyone in the room has opened, newest first, with its title in the
 * viewer's language and who found it. Built from the room's progress, so it's the same for every player and
 * updates for everyone as soon as anyone opens a new site.
 */
export function siteHistory(progress: RoomProgress, loc: Locale): SiteHistoryEntry[] {
  // visitedSites holds hosts and full addresses, in the order the room first reached them.
  const hosts = progress.visitedSites.filter((s) => !s.includes("/"));
  const found = new Map<string, { by: string; byId: string; at: string }>();
  for (const d of progress.discoveries) if (d.kind === "site") found.set(d.host, { by: d.playerName, byId: d.playerId, at: d.at });
  const entries: SiteHistoryEntry[] = [];
  for (const host of [...hosts].reverse()) {
    const page = resolveSite(host, progress, loc);
    if (!page) continue;
    const f = found.get(host);
    entries.push({ host, title: page.title, foundBy: f?.by ?? null, foundById: f?.byId ?? null, foundAt: f?.at ?? null });
  }
  if (!hosts.includes(START_SITE)) {
    const start = resolveSite(START_SITE, progress, loc);
    if (start) entries.push({ host: START_SITE, title: start.title, foundBy: null, foundById: null, foundAt: null });
  }
  return entries;
}
