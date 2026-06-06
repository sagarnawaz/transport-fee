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
        src: "/logo.png",
        sizes: "306x161",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "306x161",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
