import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { RoomProgress } from "@/lib/types";
import { siteHistory, START_SITE } from "../siteHistory";

const base: RoomProgress = { unlockedApps: [], visitedSites: [], solved: [], badges: [], discoveries: [] };

describe("siteHistory", () => {
  it("starts with Ada's start page, so a new room's history isn't empty", () => {
    const h = siteHistory(base, "en");
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ host: START_SITE, foundBy: null, foundAt: null });
    expect(h[0].title).toBeTruthy();
  });

  it("lists every site the room has opened, newest first, with who found it", () => {
    const progress: RoomProgress = {
      ...base,
      visitedSites: ["meridian-inst.com", "meridian-inst.com/about", "lostpaws.com"],
      discoveries: [
        { id: "a", kind: "site", host: "meridian-inst.com", playerId: "p1", playerName: "Lee", at: "2026-10-31T10:00:00.000Z" },
        { id: "b", kind: "site", host: "lostpaws.com", playerId: "p2", playerName: "Sam", at: "2026-10-31T10:05:00.000Z" },
      ],
    };
    const h = siteHistory(progress, "en");
    expect(h.map((e) => e.host)).toEqual(["lostpaws.com", "meridian-inst.com"]);
    expect(h[0]).toMatchObject({ foundBy: "Sam", foundById: "p2", foundAt: "2026-10-31T10:05:00.000Z" });
    expect(h[1]).toMatchObject({ foundBy: "Lee", foundById: "p1" });
  });

  it("keeps a site whose discovery aged out of the capped list, just without a finder", () => {
    const h = siteHistory({ ...base, visitedSites: ["lostpaws.com"] }, "en");
    expect(h.map((e) => e.host)).toEqual(["lostpaws.com", START_SITE]);
    expect(h[0].foundBy).toBeNull();
  });

  it("titles sites in the viewer's language", () => {
    const en = siteHistory(base, "en")[0].title;
    const ko = siteHistory(base, "ko")[0].title;
    expect(ko).not.toBe(en);
  });
});
