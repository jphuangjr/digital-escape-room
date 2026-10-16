"use client";

import { useT } from "@/i18n/client";

import type { HotspotId, WallId } from "@/lib/train/types";
import { Defs } from "@/components/atlas/art/common";
import { BerthWall, DoorWall, WashstandWall, WindowWall } from "./art/compartment";
import { BarWall, KitchenWall, LoungeWall, TablesWall } from "./art/dining";
import { CorridorScene } from "./art/corridor";

/**
 * Compartment 12B, one illustrated wall per side (viewBox 300×400, portrait). Each wall draws itself
 * from the room's shared flags, and lists the tappable hotspots (in the same coordinates), drawn as
 * transparent shapes inside the wall's own drawing so they stay on what they belong to however it is scaled. Art Deco palette: walnut, green velvet, brass, cream.
 */

export interface Hotspot {
  id: HotspotId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const HOTSPOTS: Record<WallId, Hotspot[]> = {
  window: [
    { id: "window", label: "Window", x: 60, y: 50, w: 180, h: 165 },
    { id: "newspaper", label: "Newspaper", x: 70, y: 210, w: 90, h: 36 },
    { id: "teacup", label: "Cup of tea", x: 176, y: 210, w: 46, h: 32 },
    { id: "plaque", label: "Enamel plate", x: 100, y: 24, w: 100, h: 22 },
    { id: "heater", label: "Heater", x: 78, y: 294, w: 144, h: 46 },
  ],
  door: [
    { id: "suitcase", label: "Suitcase", x: 162, y: 4, w: 110, h: 44 },
    { id: "coat", label: "Coat", x: 20, y: 88, w: 70, h: 220 },
    { id: "door", label: "Door", x: 104, y: 72, w: 108, h: 286 },
    { id: "hatbox", label: "Hatbox", x: 18, y: 6, w: 60, h: 40 },
    { id: "safety-card", label: "Safety card", x: 222, y: 90, w: 62, h: 76 },
    { id: "umbrella", label: "Umbrella", x: 228, y: 252, w: 44, h: 104 },
  ],
  berths: [
    { id: "upper-berth", label: "Upper berth", x: 20, y: 74, w: 222, h: 68 },
    { id: "lamp", label: "Reading lamp", x: 210, y: 148, w: 64, h: 56 },
    { id: "pillow", label: "Pillow", x: 24, y: 216, w: 84, h: 34 },
    { id: "under-berth", label: "Under the berth", x: 20, y: 292, w: 230, h: 52 },
    { id: "painting", label: "Painting", x: 50, y: 146, w: 112, h: 64 },
    { id: "carafe", label: "Water carafe", x: 170, y: 150, w: 38, h: 62 },
  ],
  washstand: [
    { id: "vent", label: "Ceiling vent", x: 116, y: 12, w: 68, h: 36 },
    { id: "mirror", label: "Mirror", x: 98, y: 58, w: 104, h: 132 },
    { id: "washstand", label: "Washstand", x: 90, y: 208, w: 120, h: 132 },
    { id: "towel", label: "Towel", x: 222, y: 222, w: 58, h: 86 },
    { id: "toiletries", label: "Glass shelf", x: 16, y: 104, w: 74, h: 74 },
    { id: "water-sign", label: "Enamel sign", x: 16, y: 226, w: 70, h: 38 },
  ],
  bar: [
    { id: "bottles", label: "Bottles", x: 30, y: 46, w: 240, h: 110 },
    { id: "cashbox", label: "Cash box", x: 56, y: 172, w: 80, h: 52 },
    { id: "bell", label: "Service bell", x: 206, y: 186, w: 50, h: 38 },
    { id: "bar-card", label: "Scorecard", x: 232, y: 124, w: 38, h: 38 },
    { id: "shaker", label: "Cocktail shaker", x: 146, y: 182, w: 48, h: 42 },
    { id: "stools", label: "Bar stools", x: 40, y: 318, w: 220, h: 40 },
  ],
  tables: [
    { id: "dining-window", label: "Window", x: 30, y: 34, w: 240, h: 92 },
    { id: "champagne", label: "Champagne glass", x: 214, y: 156, w: 44, h: 56 },
    { id: "sugar", label: "Sugar bowl", x: 44, y: 176, w: 56, h: 44 },
    { id: "bridge", label: "Bridge game", x: 104, y: 184, w: 104, h: 62 },
    { id: "vase", label: "Rose", x: 132, y: 140, w: 36, h: 44 },
  ],
  kitchen: [
    { id: "menu", label: "Menu board", x: 26, y: 46, w: 128, h: 150 },
    { id: "dumbwaiter", label: "Dumbwaiter", x: 34, y: 212, w: 116, h: 104 },
    { id: "kitchen-door", label: "Kitchen door", x: 172, y: 64, w: 108, h: 292 },
    { id: "porthole", label: "Porthole", x: 199, y: 94, w: 52, h: 52 },
    { id: "crate", label: "Crate of oranges", x: 30, y: 318, w: 120, h: 40 },
  ],
  lounge: [
    { id: "gramophone", label: "Gramophone", x: 34, y: 126, w: 124, h: 156 },
    { id: "records", label: "Records", x: 38, y: 284, w: 116, h: 62 },
    { id: "stole", label: "Fur stole", x: 184, y: 66, w: 96, h: 186 },
    { id: "photo", label: "Photograph", x: 32, y: 32, w: 114, h: 86 },
    { id: "palm", label: "Potted palm", x: 158, y: 256, w: 48, h: 100 },
  ],
};

function TapSpots({ spots, pulse, onTap }: { spots: { id: string; label: string; x: number; y: number; w: number; h: number }[]; pulse?: boolean; onTap: (id: string) => void }) {
  return (
    <>
      {spots.map((s) => (
        <rect
          key={s.id}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx="8"
          role="button"
          tabIndex={0}
          aria-label={s.label}
          onClick={() => onTap(s.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTap(s.id);
            }
          }}
          className={`cursor-pointer outline-none [fill:transparent] [stroke-width:3] hover:[stroke:#ecd27ab3] focus-visible:[stroke:#ecd27ab3] active:[fill:#ecd27a26] ${
            pulse ? "animate-pulse [fill:#ecd27a26] [stroke:#ecd27ab3]" : ""
          }`}
        />
      ))}
    </>
  );
}

export function WallArt({
  wall,
  flags,
  mirrorLetters,
  pouchHere,
  scorecardHere,
  pulse,
  onTap,
}: {
  wall: WallId;
  flags: string[];
  mirrorLetters: string | null;
  pouchHere: boolean;
  scorecardHere: boolean;
  pulse: boolean;
  onTap: (id: HotspotId) => void;
}) {
  const t = useT();
  return (
    <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-label={t("train.wallAria", { wall: t(`train.wall.${wall}`) })}>
      {/* the shared light, texture and motion kit's gradients and filters */}
      <Defs />
      <g aria-hidden>
        {wall === "window" && <WindowWall flags={flags} />}
        {wall === "door" && <DoorWall flags={flags} />}
        {wall === "berths" && <BerthWall flags={flags} pouchHere={pouchHere} />}
        {wall === "washstand" && <WashstandWall flags={flags} mirrorLetters={mirrorLetters} />}
        {wall === "bar" && <BarWall flags={flags} />}
        {wall === "tables" && <TablesWall taken={!scorecardHere} />}
        {wall === "kitchen" && <KitchenWall flags={flags} />}
        {wall === "lounge" && <LoungeWall flags={flags} />}
      </g>
      <TapSpots
        spots={HOTSPOTS[wall].map((h) => ({ ...h, label: t(`train.spot.${h.id}`) }))}
        pulse={pulse}
        onTap={(id) => onTap(id as HotspotId)}
      />
    </svg>
  );
}

/** The corridor outside 12B, reached once the door is open; the dining car door at its end is the way in. */
export function CorridorArt({ onDining }: { onDining: () => void }) {
  const t = useT();
  return (
    <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-label={t("train.corridorAria")}>
      <Defs />
      <CorridorScene sign={t("train.sign.diningCar")} />
      <TapSpots spots={[{ id: "dining", label: t("train.corridor.dining"), x: 126, y: 158, w: 48, h: 100 }]} onTap={onDining} />
    </svg>
  );
}
