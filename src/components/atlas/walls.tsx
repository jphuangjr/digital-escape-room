import type { HotspotId, WallId } from "@/lib/atlas/types";

/**
 * Where each tappable thing is drawn on its wall (viewBox 300×400, the same coordinates as ./art). The shell
 * lays an invisible button over each one; the eye button pulses them all.
 */
export interface Spot {
  id: HotspotId;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const SPOTS: Record<WallId, Spot[]> = {
  telescope: [
    { id: "telescope", x: 120, y: 70, w: 170, h: 262 },
    { id: "window", x: 18, y: 76, w: 86, h: 164 },
  ],
  desk: [
    { id: "journal", x: 36, y: 220, w: 100, h: 40 },
    { id: "starchart", x: 155, y: 65, w: 120, h: 120 },
  ],
  clock: [{ id: "clock", x: 92, y: 66, w: 116, h: 206 }],
  stairs: [
    { id: "plate", x: 26, y: 94, w: 108, h: 108 },
    { id: "stair-door", x: 158, y: 128, w: 114, h: 204 },
  ],
  valves: [
    { id: "schematic", x: 90, y: 40, w: 120, h: 86 },
    { id: "valves", x: 44, y: 146, w: 212, h: 116 },
  ],
  tunnel: [{ id: "tunnel", x: 66, y: 96, w: 168, h: 236 }],
  wheel: [{ id: "wheel", x: 56, y: 106, w: 188, h: 200 }],
  gate: [
    { id: "gate", x: 44, y: 54, w: 212, h: 212 },
    { id: "ledger", x: 108, y: 294, w: 84, h: 60 },
  ],
  engine: [
    { id: "engine-plaque", x: 98, y: 48, w: 104, h: 64 },
    { id: "engine", x: 48, y: 138, w: 204, h: 174 },
  ],
  "verdant-arrival": [{ id: "verdant-gate", x: 56, y: 96, w: 188, h: 236 }],
  "verdant-beds": [
    { id: "creeper", x: 62, y: 64, w: 72, h: 192 },
    { id: "fern", x: 150, y: 120, w: 130, h: 136 },
    { id: "seed", x: 98, y: 270, w: 104, h: 62 },
  ],
  "verdant-shelves": [
    { id: "pot-sign", x: 40, y: 40, w: 220, h: 100 },
    { id: "cabinet", x: 68, y: 148, w: 164, h: 204 },
  ],
  "verdant-roots": [
    { id: "roots", x: 26, y: 50, w: 248, h: 196 },
    { id: "root-door", x: 90, y: 250, w: 120, h: 104 },
  ],
  "meridian-arrival": [{ id: "meridian-gate", x: 60, y: 170, w: 180, h: 130 }],
  "meridian-plaza": [
    { id: "mirrors", x: 28, y: 222, w: 150, h: 100 },
    { id: "sun-door", x: 180, y: 248, w: 80, h: 114 },
    { id: "vault", x: 30, y: 332, w: 90, h: 42 },
  ],
  "sanctum-mirror": [
    { id: "great-mirror", x: 68, y: 38, w: 164, h: 244 },
    { id: "tablet", x: 94, y: 290, w: 112, h: 76 },
  ],
  "sanctum-study": [
    { id: "chest", x: 40, y: 200, w: 120, h: 124 },
    { id: "altar", x: 178, y: 170, w: 96, h: 152 },
  ],
  "pelagic-arrival": [{ id: "pelagic-gate", x: 14, y: 150, w: 270, h: 170 }],
  "pelagic-airlock": [
    { id: "tanks", x: 28, y: 100, w: 156, h: 204 },
    { id: "airlock", x: 182, y: 146, w: 108, h: 108 },
  ],
  "archive-hall": [
    { id: "gauge", x: 42, y: 48, w: 76, h: 76 },
    { id: "lamps", x: 150, y: 40, w: 120, h: 60 },
    { id: "statues", x: 26, y: 172, w: 120, h: 132 },
    { id: "glass", x: 148, y: 148, w: 124, h: 174 },
  ],
  "archive-registry": [
    { id: "book-varro", x: 26, y: 132, w: 68, h: 80 },
    { id: "book-ashe", x: 116, y: 132, w: 68, h: 80 },
    { id: "book-halloran", x: 206, y: 132, w: 68, h: 80 },
    { id: "desk", x: 66, y: 210, w: 168, h: 124 },
  ],
  "cathedral-nave": [{ id: "core", x: 40, y: 80, w: 220, h: 220 }],
  "cathedral-door": [
    { id: "lectern", x: 40, y: 196, w: 92, h: 136 },
    { id: "cathedral-gate", x: 146, y: 130, w: 138, h: 140 },
  ],
};
