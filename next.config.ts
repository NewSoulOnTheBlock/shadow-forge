import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick the parent dir's lockfile.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
