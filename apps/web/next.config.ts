import type { NextConfig } from "next";
import path from "path";

const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGhPages ? "/cambium" : "",
  assetPrefix: isGhPages ? "/cambium/" : undefined,
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@cambium/config-engine",
    "@cambium/shared",
    "@cambium/db",
    "@cambium/ui",
  ],
};

export default nextConfig;
