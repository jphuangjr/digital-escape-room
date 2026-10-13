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
  "verdant-beds": [
    { id: "creeper", icon: "🌱", x: 30, y: 60, w: 110, h: 190 },
    { id: "fern", icon: "🌿", x: 160, y: 100, w: 110, h: 150 },
    { id: "seed", icon: "🌰", x: 100, y: 280, w: 100, h: 90 },
  ],
  "verdant-shelves": [
    { id: "pot-sign", icon: "🪧", x: 80, y: 40, w: 140, h: 80 },
    { id: "cabinet", icon: "🗄", x: 70, y: 150, w: 160, h: 200 },
  ],
  "verdant-roots": [
    { id: "roots", icon: "🪴", x: 40, y: 50, w: 220, h: 170 },
    { id: "root-door", icon: "🚪", x: 100, y: 250, w: 100, h: 110 },
  ],
  "meridian-arrival": [{ id: "meridian-gate", icon: "☀", x: 60, y: 100, w: 180, h: 200 }],
  "meridian-plaza": [
    { id: "mirrors", icon: "🪞", x: 30, y: 60, w: 240, h: 160 },
    { id: "sun-door", icon: "🌞", x: 160, y: 240, w: 110, h: 130 },
    { id: "vault", icon: "🕳", x: 30, y: 250, w: 100, h: 100 },
  ],
  "sanctum-mirror": [
    { id: "great-mirror", icon: "🪞", x: 70, y: 50, w: 160, h: 220 },
    { id: "tablet", icon: "🪨", x: 90, y: 290, w: 120, h: 80 },
  ],
  "sanctum-study": [
    { id: "chest", icon: "🧰", x: 40, y: 200, w: 120, h: 120 },
    { id: "altar", icon: "🛐", x: 180, y: 160, w: 90, h: 120 },
  ],
  "cathedral-nave": [{ id: "core", icon: "🌐", x: 50, y: 70, w: 200, h: 240 }],
  "cathedral-door": [
    { id: "lectern", icon: "📜", x: 30, y: 160, w: 110, h: 150 },
    { id: "cathedral-gate", icon: "⬛", x: 160, y: 90, w: 110, h: 220 },
  ],
  "pelagic-arrival": [{ id: "pelagic-gate", icon: "🌊", x: 60, y: 100, w: 180, h: 200 }],
  "pelagic-airlock": [
    { id: "tanks", icon: "🛢", x: 30, y: 80, w: 150, h: 220 },
    { id: "airlock", icon: "🚪", x: 195, y: 110, w: 85, h: 190 },
  ],
  "archive-hall": [
    { id: "statues", icon: "🗿", x: 30, y: 150, w: 100, h: 170 },
    { id: "lamps", icon: "🏮", x: 150, y: 40, w: 120, h: 80 },
    { id: "gauge", icon: "⏲", x: 30, y: 40, w: 100, h: 90 },
    { id: "glass", icon: "🪟", x: 150, y: 150, w: 120, h: 170 },
  ],
  "archive-registry": [
    { id: "book-varro", icon: "📕", x: 20, y: 60, w: 80, h: 100 },
    { id: "book-ashe", icon: "📗", x: 110, y: 60, w: 80, h: 100 },
    { id: "book-halloran", icon: "📘", x: 200, y: 60, w: 80, h: 100 },
    { id: "desk", icon: "🗃", x: 70, y: 200, w: 160, h: 140 },
  ],
};

/** One backdrop tint per place, so you can tell where you are at a glance. */
export const PLACE_TINT: Record<string, string> = {
  observatory: "from-[#13222b] to-[#0a1216]",
  waterworks: "from-[#0f2626] to-[#081414]",
  chamber: "from-[#1d1a2b] to-[#0d0b16]",
  verdant: "from-[#13261a] to-[#08140c]",
  meridian: "from-[#2b2213] to-[#16100a]",
  sanctum: "from-[#2b1d10] to-[#120a05]",
  archive: "from-[#0d2a2a] to-[#05120f]",
  cathedral: "from-[#1a1424] to-[#06040a]",
  pelagic: "from-[#0f1c2e] to-[#070d18]",
};
