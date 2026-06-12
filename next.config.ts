import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old dashboard route -> marina-physio tenant dashboard
      {
        source: "/dashboard",
        destination: "/b/marina-physio",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
