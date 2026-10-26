import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add your CDN / image host here once product images come from a real backend, e.g.
  // images: { remotePatterns: [{ protocol: "https", hostname: "cdn.bazarhost.com" }] },
};

export default nextConfig;
