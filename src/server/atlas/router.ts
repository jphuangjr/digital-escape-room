import "server-only";
import type { GlyphId, LocationId } from "@/lib/atlas/types";

// The Threshold rule: D = (O + 2R + S) mod N. Destination = the gate's origin index, plus twice the outer
// ring, plus the inner ring, modulo the number of node slots. Pure, so it can be tested on its own.

/** A modulo that never goes negative (rings can be turned "backwards"). */
export function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/** The destination node index for an origin and ring settings. */
export function route(origin: number, outer: number, inner: number, n: number): number {
  if (!Number.isInteger(n) || n <= 0) throw new Error("the network needs at least one node");
  return mod(origin + 2 * outer + inner, n);
}

/** What each Cartographer glyph is worth on a ring. Taught in the Verdant Archive; never sent to clients. */
export const GLYPH_VALUE: Record<GlyphId, number> = { moon: 0, eye: 1, wave: 2, sun: 3, knot: 4, star: 5, peak: 6 };

/** A node slot in the network: a place, a slot that was never filled, or the place that was struck out. */
export type NodeSlot = { kind: "place"; place: LocationId } | { kind: "empty" } | { kind: "cathedral" };

/** The authoritative registry, by node index. N is its length: the seven sockets of the Observatory plate. */
export const NODES: NodeSlot[] = [
  { kind: "place", place: "observatory" },
  { kind: "place", place: "verdant" },
  { kind: "place", place: "meridian" },
  { kind: "place", place: "pelagic" },
  { kind: "empty" },
  { kind: "empty" },
  { kind: "cathedral" },
];

/** Each gate's origin index: its own node. The Ages' gates are what the Atlas Core can reroute. */
export const GATE_ORIGIN = { observatory: 0, verdant: 1, meridian: 2, pelagic: 3 } as const;

export type Crossing =
  | { kind: "unpowered" }
  | { kind: "self" }
  | { kind: "empty" }
  | { kind: "withheld" }
  | { kind: "arrive"; place: LocationId };

/**
 * Where a gate sends you. The gate must be powered and the node registered. The Null Cathedral's registration
 * was revoked; seating the three seals in the Observatory plate restores it (`cathedralRegistered`).
 */
export function traverse(opts: { origin: number; outer: GlyphId; inner: GlyphId; powered: boolean; cathedralRegistered?: boolean }): Crossing {
  if (!opts.powered) return { kind: "unpowered" };
  const d = route(opts.origin, GLYPH_VALUE[opts.outer], GLYPH_VALUE[opts.inner], NODES.length);
  const slot = NODES[d];
  if (d === opts.origin) return { kind: "self" };
  if (slot.kind === "empty") return { kind: "empty" };
  if (slot.kind === "cathedral") return opts.cathedralRegistered ? { kind: "arrive", place: "cathedral" } : { kind: "withheld" };
  return { kind: "arrive", place: slot.place };
}
