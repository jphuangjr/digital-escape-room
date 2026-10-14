import { describe, expect, it } from "vitest";
import en from "../text/en";

describe("the Atlas's text", () => {
  // Lines are split on real line breaks; a "{N}" was once used instead and showed up on screen.
  it("breaks lines with \\n, never a {N} placeholder", () => {
    expect(Object.entries(en).filter(([, v]) => v.includes("{N}")).map(([k]) => k)).toEqual([]);
  });
});
