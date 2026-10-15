"use client";

import type { HotspotId, WallId } from "@/lib/atlas/types";
import { Defs, type WallState } from "./common";
import { Clock, Desk, Stairs, Telescope } from "./observatory";
import { Tunnel, Valves, WaterWheel } from "./waterworks";
import { Engine, Gate } from "./chamber";
import { VerdantArrival, VerdantBeds, VerdantRoots, VerdantShelves } from "./verdant";
import { MeridianArrival, MeridianPlaza, SanctumMirror, SanctumStudy } from "./meridian";
import { ArchiveHall, ArchiveRegistry, PelagicAirlock, PelagicArrival } from "./pelagic";
import { CathedralDoor, CathedralNave } from "./cathedral";

export type { WallState } from "./common";

/**
 * The Atlas of Silent Worlds, one illustrated wall at a time (viewBox 300×400, portrait). Each wall draws itself
 * from the room's shared state; its tappable things are listed in ../walls (same coordinates).
 */

const WALL_ART: Record<WallId, (props: { s: WallState }) => React.ReactNode> = {
  telescope: () => <Telescope />,
  desk: ({ s }) => <Desk s={s} />,
  clock: ({ s }) => <Clock s={s} />,
  stairs: ({ s }) => <Stairs s={s} />,
  valves: ({ s }) => <Valves s={s} />,
  tunnel: ({ s }) => <Tunnel s={s} />,
  wheel: ({ s }) => <WaterWheel s={s} />,
  gate: ({ s }) => <Gate s={s} />,
  engine: ({ s }) => <Engine s={s} />,
  "verdant-arrival": ({ s }) => <VerdantArrival s={s} />,
  "verdant-beds": ({ s }) => <VerdantBeds s={s} />,
  "verdant-shelves": ({ s }) => <VerdantShelves s={s} />,
  "verdant-roots": ({ s }) => <VerdantRoots s={s} />,
  "meridian-arrival": () => <MeridianArrival />,
  "meridian-plaza": ({ s }) => <MeridianPlaza s={s} />,
  "sanctum-mirror": () => <SanctumMirror />,
  "sanctum-study": ({ s }) => <SanctumStudy s={s} />,
  "pelagic-arrival": ({ s }) => <PelagicArrival s={s} />,
  "pelagic-airlock": ({ s }) => <PelagicAirlock s={s} />,
  "archive-hall": ({ s }) => <ArchiveHall s={s} />,
  "archive-registry": ({ s }) => <ArchiveRegistry s={s} />,
  "cathedral-nave": ({ s }) => <CathedralNave s={s} />,
  "cathedral-door": () => <CathedralDoor />,
};

export interface TapSpot {
  id: HotspotId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * One wall, drawn from the room's state, with its tappable things as transparent shapes in the drawing's own
 * coordinates, so they stay on top of what they belong to however the wall is scaled or letterboxed.
 */
export function WallArt({
  wall,
  state,
  label,
  spots,
  pulse,
  onTap,
}: {
  wall: WallId;
  state: WallState;
  label: string;
  spots: TapSpot[];
  pulse: boolean;
  onTap: (id: HotspotId) => void;
}) {
  const Art = WALL_ART[wall];
  return (
    <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-label={label}>
      <Defs />
      <g aria-hidden>
        <Art s={state} />
      </g>
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
          className={`cursor-pointer outline-none [fill:transparent] [stroke-width:3] focus-visible:[stroke:#f4e7b5] active:[fill:#f4e7b51f] ${
            pulse ? "animate-pulse [fill:#f4e7b526] [stroke:#f4e7b5b3]" : ""
          }`}
        />
      ))}
    </svg>
  );
}
