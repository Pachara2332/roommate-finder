import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-056297c494a5f5bbdde0751855d17fad.r2.dev',
      },
    ],
  },
};

export default nextConfig;
