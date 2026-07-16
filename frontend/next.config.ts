import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [],
  },
  reactStrictMode: true,
};

export default nextConfig;
