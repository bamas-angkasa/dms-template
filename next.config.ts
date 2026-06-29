import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // CI/build verification can use a separate cache while the local preview is running.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
export default nextConfig;
