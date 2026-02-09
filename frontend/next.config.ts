import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Symbol Stripping: Prevent source map exposure
  poweredByHeader: false, // Remove X-Powered-By
  reactStrictMode: true,
  compress: true, // Gzip Compression enabled
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'meetbarter.com', // Placeholder
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
