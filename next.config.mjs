// next.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";

// Re-create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
