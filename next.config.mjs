// next.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";

// Re-create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build-time stable ID (string) – same on server & client for this build
const BUILD_ID = String(Date.now());

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Expose a stable build id to both server & client
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@/app": path.join(process.cwd(), "app"),
      "@/components": path.join(process.cwd(), "workcrew-ui/components"),
      "@/workcrew-ui": path.join(process.cwd(), "workcrew-ui"),
      "@/styles": path.join(process.cwd(), "workcrew-ui/styles"),
    };
    return config;
  },
};

export default nextConfig;
