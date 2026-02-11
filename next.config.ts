import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // smaller Docker image; use npm start for non-Docker deploys
};

export default nextConfig;
