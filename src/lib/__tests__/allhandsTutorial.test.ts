import { describe, expect, it } from "vitest";
import { tipFor } from "@/lib/allhands/tutorial";
import type { AllHandsView, NightKind, Phase, Role } from "@/lib/allhands/types";

const party = (phase: Phase, opts: { round?: number; role?: Role; alive?: boolean; seated?: boolean; kind?: NightKind } = {}) =>
  ({
    phase,
    round: opts.round ?? 1,
    me: { seated: opts.seated ?? true, alive: opts.alive ?? true, role: opts.role ?? "employee", title: "Tech Bro", ready: false },
    night: opts.kind ? ({ kind: opts.kind } as AllHandsView["night"]) : null,
  }) as Pick<AllHandsView, "phase" | "round" | "me" | "night">;

describe("first-game tips", () => {
  it("says nothing in the lobby, where the tour does the teaching", () => {
    expect(tipFor(party("lobby"))).toBeNull();
  });

  it("explains the badge at onboarding", () => {
    expect(tipFor(party("reveal"))?.text).toMatch(/hold your badge/);
  });

  it("gives each night role its own advice, so a tip never gives a role away to the player's own eyes only", () => {
    const ids = (["decoy", "mole", "it", "hr", "intern"] as NightKind[]).map((kind) => tipFor(party("night", { kind }))!);
    expect(new Set(ids.map((t) => t.text)).size).toBe(5);
    expect(ids[0].text).toMatch(/poll/);
  });

  it("coaches Moles to blend in at all-hands, and everyone else to look for them", () => {
    expect(tipFor(party("day", { role: "mole" }))?.text).toMatch(/blend in/);
    expect(tipFor(party("day", { role: "it" }))?.text).toMatch(/lying to you/);
  });

  it("tells a laid-off player to stay quiet", () => {
    expect(tipFor(party("vote", { alive: false }))?.id).toBe("out");
  });

  it("stops after two rounds, except for the wrap-up", () => {
    expect(tipFor(party("vote", { round: 3 }))).toBeNull();
    expect(tipFor(party("over", { round: 5 }))).not.toBeNull();
  });

  it("leaves spectators alone", () => {
    expect(tipFor(party("night", { seated: false, kind: "decoy" }))).toBeNull();
  });
});
