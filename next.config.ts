import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Los errores de tipo no bloquean el build en producción.
    // Corregir localmente con: npx tsc --noEmit
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
