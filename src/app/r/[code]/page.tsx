import type { Metadata, Viewport } from "next";
import { RoomClient } from "./RoomClient";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const code = decodeURIComponent((await params).code).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  const title = `Join room ${code} — The Vanishing of Dr. Ada Voss`;
  const description = "You're invited to investigate. Tap to join; sign in with Google or just enter a name.";
  return { title, description, openGraph: { title, description }, twitter: { title, description } };
}

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
