import type { Metadata, Viewport } from "next";
import { RoomClient } from "./RoomClient";

export const metadata: Metadata = {
  title: "Ada's Laptop — The Vanishing of Dr. Ada Voss",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0a08",
};

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <RoomClient code={decodeURIComponent(code).toUpperCase()} />;
}
