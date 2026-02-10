import type { MetadataRoute } from "next";

export function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "Stock & Box Logging",
    short_name: "Stock Box",
    description: "Log stock usage from boxes via QR or link. For field engineers.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon?id=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon?id=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon?id=192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon?id=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["productivity", "business"],
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=0",
    },
  });
}
