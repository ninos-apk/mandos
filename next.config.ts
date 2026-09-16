import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  outputFileTracingIncludes: {
    "/api/assets/**/*": ["./assets/**/*"],
  },
  images: {
    remotePatterns: supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname }] : [],
  },
};

export default nextConfig;
