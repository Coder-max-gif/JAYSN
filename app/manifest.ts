import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JAYSN AGRO INDIA PRIVATE LIMITED",
    short_name: "JAYSN AGRO",
    start_url: "/",
    display: "browser",
    background_color: "#0c0f0b",
    theme_color: "#0c0f0b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
