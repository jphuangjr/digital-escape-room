import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Vanishing of Dr. Ada Voss",
  description:
    "A multiplayer online escape room. Dr. Ada Voss vanished 48 hours ago. Her laptop is open. Start at the beginning.",
  applicationName: "Ada Voss",
  appleWebApp: { capable: true, title: "Ada Voss", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0d",
  colorScheme: "dark",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased bg-noir-bg text-noir-ink">{children}</body>
    </html>
  );
}
