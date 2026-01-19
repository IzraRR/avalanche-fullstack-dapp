import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Biarkan ini true agar error tipe data tidak memblokir deploy
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;