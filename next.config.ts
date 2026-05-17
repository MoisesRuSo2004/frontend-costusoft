import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Ancla Turbopack a este directorio para que no suba al package-lock.json
    // del monorepo raíz y resuelva tailwindcss desde el node_modules correcto.
    root: __dirname,
  },
};

export default nextConfig;
