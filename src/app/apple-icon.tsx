import { ImageResponse } from "next/og";
import { CompassArt } from "./_og/card";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the compass on noir (iOS rounds the corners itself). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b0d" }}>
        <CompassArt size={150} />
      </div>
    ),
    size,
  );
}
