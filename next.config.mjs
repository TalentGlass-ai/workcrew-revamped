import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Keep existing aliases, then add ours
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@/components": path.resolve(__dirname, "workcrew-ui/components"),
      "@/workcrew-ui": path.resolve(__dirname, "workcrew-ui"),
      "@/styles": path.resolve(__dirname, "workcrew-ui/styles"),
    };
    return config;
  },

  experimental: {
    turbo: {
      resolveAlias: {
        "@/app": "./app",
        "@/workcrew-ui": "./workcrew-ui",
        "@/components": "./workcrew-ui/components",
        "@/styles": "./workcrew-ui/styles"
      }
    }
  }
};

export default nextConfig;
