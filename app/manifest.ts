import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daniyal Transport",
    short_name: "Daniyal",
    description: "Daniyal Transport fee tracking and payment proof app.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fb",
    theme_color: "#111111",
    orientation: "portrait",
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
