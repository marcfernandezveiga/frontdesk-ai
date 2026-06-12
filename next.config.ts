import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tenant logos come from arbitrary external domains (extracted at onboarding),
  // so skip the domain allowlist and serve them as-is.
  images: {
    unoptimized: true,
  },
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
