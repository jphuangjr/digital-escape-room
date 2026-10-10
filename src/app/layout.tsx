import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute base for link-preview image URLs. Set NEXT_PUBLIC_SITE_URL to override (e.g. for local testing).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.escape-escape.com"),
  title: "Escape Escape — online escape rooms",
  description: "Multiplayer online escape rooms you play together on your phones.",
  openGraph: { siteName: "Escape Escape", type: "website" },
  twitter: { card: "summary_large_image" },
  applicationName: "Escape Escape",
  appleWebApp: { capable: true, title: "Escape Escape", statusBarStyle: "black-translucent" },
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
