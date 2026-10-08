import "server-only";
import type { RoomProgress, SitePage } from "@/lib/types";
import { DRIFT_HOST, resolveDrift } from "./drift";
import { INTRANET_HOST, resolveIntranet } from "./intranet";
import { LOSTPAWS_HOST, resolveLostpaws } from "./lostpaws";
import { MERIDIAN_HOST, resolveMeridian } from "./meridian";
import { RUNNERBOARD_HOST, resolveRunnerboard } from "./runnerboard";
import { SWITCH_HOST, resolveSwitch } from "./switch";
import { TRAPDOOR_HOST, resolveTrapdoor } from "./trapdoor";

type Resolver = (path: string, progress: RoomProgress) => SitePage | null;

const SITES: Record<string, Resolver> = {
  [MERIDIAN_HOST]: resolveMeridian,
  [DRIFT_HOST]: resolveDrift,
  [RUNNERBOARD_HOST]: resolveRunnerboard,
  [TRAPDOOR_HOST]: resolveTrapdoor,
  [LOSTPAWS_HOST]: resolveLostpaws,
  [INTRANET_HOST]: resolveIntranet,
  [SWITCH_HOST]: resolveSwitch,
};

export const SITE_HOSTS = Object.keys(SITES);

/** Lowercase, strip protocol, www., query/hash, trailing slashes and whitespace. Returns "host/path". */
export function normalizeAddress(address: string): string {
  let a = String(address ?? "").trim().toLowerCase();
  a = a.replace(/\s+/g, "");
  a = a.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  a = a.replace(/[?#].*$/, "");
  a = a.replace(/^www\./, "");
  a = a.replace(/\/{2,}/g, "/");
  a = a.replace(/\/+$/, "");
  a = a.replace(/\/index\.html?$/, "");
  return a;
}

export function resolveSite(address: string, progress: RoomProgress): SitePage | null {
  const a = normalizeAddress(address);
  if (!a) return null;
  const slash = a.indexOf("/");
  const host = (slash < 0 ? a : a.slice(0, slash)).replace(/:\d+$/, "");
  const path = slash < 0 ? "" : a.slice(slash);
  const resolver = SITES[host];
  if (!resolver) return null;
  return resolver(path, progress);
}

export { decodeListings } from "./lostpaws";
