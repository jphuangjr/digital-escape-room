import type { HotspotId, WallId } from "@/lib/atlas/types";

/**
 * Placeholder art for The Atlas of Silent Worlds: each wall is a plain backdrop with a labelled tile per
 * thing to tap. Positions are in a 300×400 box. The full art pass replaces this file (docs/ATLAS.md).
 */
export interface Spot {
  id: HotspotId;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const SPOTS: Record<WallId, Spot[]> = {
  telescope: [
    { id: "telescope", icon: "🔭", x: 90, y: 70, w: 120, h: 150 },
    { id: "window", icon: "🌧", x: 60, y: 250, w: 180, h: 90 },
  ],
  desk: [
    { id: "journal", icon: "📖", x: 30, y: 200, w: 110, h: 110 },
    { id: "starchart", icon: "✨", x: 160, y: 60, w: 110, h: 130 },
  ],
  clock: [{ id: "clock", icon: "🕰", x: 80, y: 80, w: 140, h: 180 }],
  stairs: [
    { id: "plate", icon: "⬡", x: 30, y: 90, w: 100, h: 110 },
    { id: "stair-door", icon: "🚪", x: 150, y: 120, w: 120, h: 220 },
  ],
  valves: [
    { id: "valves", icon: "🛞", x: 40, y: 150, w: 220, h: 130 },
    { id: "schematic", icon: "📋", x: 90, y: 40, w: 120, h: 90 },
  ],
  tunnel: [{ id: "tunnel", icon: "🕳", x: 70, y: 90, w: 160, h: 230 }],
  wheel: [{ id: "wheel", icon: "☸", x: 70, y: 100, w: 160, h: 180 }],
  gate: [
    { id: "gate", icon: "◯", x: 60, y: 50, w: 180, h: 220 },
    { id: "ledger", icon: "📒", x: 100, y: 290, w: 100, h: 80 },
  ],
  engine: [
    { id: "engine", icon: "⚙", x: 50, y: 130, w: 200, h: 170 },
    { id: "engine-plaque", icon: "🔖", x: 100, y: 50, w: 100, h: 60 },
  ],
  "verdant-arrival": [{ id: "verdant-gate", icon: "🌿", x: 60, y: 100, w: 180, h: 200 }],
  "meridian-arrival": [{ id: "meridian-gate", icon: "☀", x: 60, y: 100, w: 180, h: 200 }],
  "pelagic-arrival": [{ id: "pelagic-gate", icon: "🌊", x: 60, y: 100, w: 180, h: 200 }],
};

/** One backdrop tint per place, so you can tell where you are at a glance. */
export const PLACE_TINT: Record<string, string> = {
  observatory: "from-[#13222b] to-[#0a1216]",
  waterworks: "from-[#0f2626] to-[#081414]",
  chamber: "from-[#1d1a2b] to-[#0d0b16]",
  verdant: "from-[#13261a] to-[#08140c]",
  meridian: "from-[#2b2213] to-[#16100a]",
  pelagic: "from-[#0f1c2e] to-[#070d18]",
};
