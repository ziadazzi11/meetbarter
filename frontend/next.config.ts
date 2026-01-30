import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Symbol Stripping: Prevent source map exposure
  poweredByHeader: false, // Remove X-Powered-By
  reactStrictMode: true,
};

export default nextConfig;
