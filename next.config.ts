import type { NextConfig } from "next";
import path from "node:path";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  compress: true,
  poweredByHeader: false,
  turbopack: { root: path.resolve(__dirname) },
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Optimised client media and generated geo data never change in place
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      // www to the bare domain
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jaysnagro.com" }],
        destination: "https://jaysnagro.com/:path*",
        permanent: true,
      },
      // Dev routes never exist in production
      ...(process.env.NODE_ENV === "production"
        ? [
            { source: "/styleguide", destination: "/", permanent: false },
            { source: "/dev", destination: "/", permanent: false },
          ]
        : []),
    ];
  },
};

export default nextConfig;
