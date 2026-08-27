import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@notification-gateway/sdk"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
