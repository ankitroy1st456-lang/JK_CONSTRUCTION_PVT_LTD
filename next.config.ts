import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Safe-by-default browser rules for every page
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" }, // do not guess file types
          { key: "X-Frame-Options", value: "SAMEORIGIN" }, // other websites cannot put our pages in a frame
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" }, // this site needs none of these
        ],
      },
      {
        // The admin area is private: never keep a copy, never list it on Google
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
