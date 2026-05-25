import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Transport Fee Manager",
    short_name: "Fee Manager",
    description: "Track monthly transport fees, payment proofs, and reminders.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fb",
    theme_color: "#047857",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
