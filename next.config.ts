import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config, { dev }) => {
    // Use in-memory cache in dev to avoid OneDrive file locking and ENOENT errors with *.pack.gz
    if (dev) {
      config.cache = {
        type: "memory",
      };
    }
    return config;
  },
};


export default nextConfig;
