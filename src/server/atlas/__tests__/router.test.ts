import { describe, expect, it } from "vitest";
import { GLYPH_VALUE, mod, NODES, route, traverse } from "../router";
import { LEDGER } from "../world";

describe("the Threshold rule, D = (O + 2R + S) mod N", () => {
  it("matches the brief's worked examples", () => {
    expect(route(2, 1, 3, 7)).toBe(0);
    expect(route(2, 2, 3, 7)).toBe(2);
  });

  it("is safe with negative ring values", () => {
    expect(mod(-1, 7)).toBe(6);
    expect(route(0, -1, 0, 7)).toBe(5);
    expect(route(0, -3, -1, 7)).toBe(0);
  });

  it("refuses an empty network", () => {
    expect(() => route(0, 1, 1, 0)).toThrow();
  });

  it("gives every glyph a distinct value 0–6, one per node slot", () => {
    expect(Object.values(GLYPH_VALUE).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(NODES).toHaveLength(7);
  });
});

describe("crossing the Observatory gate", () => {
  it("takes every ledger route to its place", () => {
    for (const r of LEDGER) expect(traverse({ origin: 0, outer: r.outer, inner: r.inner, powered: true })).toEqual({ kind: "arrive", place: r.place });
  });

  it("explains every failure", () => {
    expect(traverse({ origin: 0, outer: "sun", inner: "wave", powered: false })).toEqual({ kind: "unpowered" });
    expect(traverse({ origin: 0, outer: "moon", inner: "moon", powered: true })).toEqual({ kind: "self" }); // 0
    expect(traverse({ origin: 0, outer: "moon", inner: "knot", powered: true })).toEqual({ kind: "empty" }); // 4
    expect(traverse({ origin: 0, outer: "sun", inner: "moon", powered: true })).toEqual({ kind: "withheld" }); // 6: the Null Cathedral
  });
});
