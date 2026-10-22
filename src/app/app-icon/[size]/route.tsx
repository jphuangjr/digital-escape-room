import { ImageResponse } from "next/og";
import { CompassArt } from "../../_og/card";

// "maskable" is 512px with the compass shrunk into the safe zone Android crops icons to.
const ICONS: Record<string, { px: number; art: number }> = {
  "192": { px: 192, art: 0.84 },
  "512": { px: 512, art: 0.84 },
  maskable: { px: 512, art: 0.62 },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((size) => ({ size }));
}

/** Manifest icons: the compass on noir. */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const icon = ICONS[(await params).size];
  if (!icon) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b0d" }}>
        <CompassArt size={Math.round(icon.px * icon.art)} />
      </div>
    ),
    { width: icon.px, height: icon.px },
  );
}
