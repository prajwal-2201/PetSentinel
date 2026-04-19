import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Image optimization — whitelist Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uyorhnqptxspxglbepbo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY"                      },
          { key: "X-Content-Type-Options",  value: "nosniff"                   },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(self)" },
        ],
      },
    ];
  },

  // Optional API proxy: routes /api/backend/* → FastAPI in production
  // Set BACKEND_URL env var on Vercel to enable
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
