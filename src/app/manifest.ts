import type { MetadataRoute } from "next";

/** Lets phones install the site to the home screen as a full-screen app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Escape Escape",
    short_name: "Escape Escape",
    description: "Multiplayer online escape rooms you play together on your phones.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#0b0b0d",
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
