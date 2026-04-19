import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PetSentinel Triage Dashboard",
    short_name: "PetSentinel",
    description: "AI-Powered Advanced Pet Triage System",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F1ED",
    theme_color: "#FEF7EC",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
