import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@cambium/config-engine",
    "@cambium/shared",
    "@cambium/db",
    "@cambium/ui",
  ],
};

export default nextConfig;
