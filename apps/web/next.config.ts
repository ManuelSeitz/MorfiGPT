import { PRODUCT_SOURCES } from "@repo/constants";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...PRODUCT_SOURCES.map(({ imageHost }) => ({
        hostname: imageHost,
      })),
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "i.ytimg.com" },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
