import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // smaller Docker image; use npm start for non-Docker deploys
  // Avoid chunk names with colons (e.g. node:buffer) — invalid on Windows NTFS
  turbopack: {
    resolveAlias: {
      "node:buffer": "buffer",
      "node:inspector": "inspector",
    },
  },
};

export default nextConfig;
