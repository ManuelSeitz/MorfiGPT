import { PRODUCT_SOURCES } from "@repo/constants";
import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

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
  rewrites: () => {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
