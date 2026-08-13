import type { NextConfig } from "next";
import path from "node:path";
import { withBotId } from "botid/next/config";

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

export default withBotId(nextConfig);
