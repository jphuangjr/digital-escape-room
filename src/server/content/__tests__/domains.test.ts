import { expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import { modernizeAddress } from "@/lib/domains";
import { parseProgress } from "@/server/logic";
import * as content from "../index";

const fresh: RoomProgress = { unlockedApps: ["browser"], visitedSites: [], solved: [], badges: [], discoveries: [] };

it("sites moved to .com, and old .net addresses still open them", () => {
  for (const [old, now] of [
    ["meridian-inst.net/staff", "meridian-inst.com/staff"],
    ["https://www.lostpaws.net/", "lostpaws.com"],
    ["runnerboard.net", "runnerboard.com"],
    ["harbourmail.net/forgot", "harbourmail.com/forgot"],
    ["intranet.meridian-inst.net", "intranet.meridian-inst.com"],
  ]) {
    expect(content.resolveSite(old, fresh, "en")?.address).toBe(now);
  }
  expect(modernizeAddress("example.net")).toBe("example.net");
  expect(modernizeAddress("thedrift.blog")).toBe("thedrift.blog");
});

it("rooms saved before the move keep their visited sites and case log", () => {
  const p = parseProgress({
    visitedSites: ["trapdoor.net", "thedrift.blog"],
    discoveries: [{ id: "1", kind: "site", host: "lostpaws.net", playerId: "p", playerName: "P", at: "" }],
  });
  expect(p.visitedSites).toEqual(["trapdoor.com", "thedrift.blog"]);
  expect(p.discoveries[0]).toMatchObject({ host: "lostpaws.com" });
  expect(content.checkAnswer("mara-reset", "mara.voss@harbourmail.net")).toBe(true);
});
