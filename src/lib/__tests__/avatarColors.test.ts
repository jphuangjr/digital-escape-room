import { describe, expect, it } from "vitest";
import { ADA_COLORS, AVATAR_COLORS, colorAvailable, freeColor } from "../avatarColors";

describe("colorAvailable", () => {
  it("refuses a color another player already has, any letter case", () => {
    expect(colorAvailable("#ef4444", ["#EF4444"])).toBe(false);
    expect(colorAvailable("#EF4444", ["#ef4444"])).toBe(false);
    expect(colorAvailable("#10b981", ["#ef4444"])).toBe(true);
  });
  it("allows sharing once every color in that palette is taken, so a full room can still grow", () => {
    expect(colorAvailable(AVATAR_COLORS[0], AVATAR_COLORS.slice(0, 7))).toBe(false); // one color still free: no sharing
    expect(colorAvailable(AVATAR_COLORS[0], AVATAR_COLORS)).toBe(true);
    expect(colorAvailable(ADA_COLORS[2], [...ADA_COLORS.slice(0, 7)])).toBe(false);
    expect(colorAvailable(ADA_COLORS[2], ADA_COLORS)).toBe(true);
  });
});

describe("freeColor", () => {
  it("keeps the current color when free, else moves to the first free one", () => {
    expect(freeColor(AVATAR_COLORS, [], AVATAR_COLORS[3])).toBe(AVATAR_COLORS[3]);
    expect(freeColor(AVATAR_COLORS, [AVATAR_COLORS[3], AVATAR_COLORS[0]], AVATAR_COLORS[3])).toBe(AVATAR_COLORS[1]);
  });
});
