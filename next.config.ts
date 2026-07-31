import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  experimental: {
    viewTransition: true,
    useTypeScriptCli: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
