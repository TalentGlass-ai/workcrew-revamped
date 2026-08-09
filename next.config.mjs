// next.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

// Re-create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.join(process.cwd()),
      "@/app": path.join(process.cwd(), "app"),
      "@/workcrew-ui": path.join(process.cwd(), "workcrew-ui"),
      "@/components": path.join(process.cwd(), "workcrew-ui/components"),
      "@/styles": path.join(process.cwd(), "workcrew-ui/styles"),
      "@/lib": path.join(process.cwd(), "workcrew-ui/lib"),
      "@/types": path.join(process.cwd(), "workcrew-ui/types"),
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,          // no build-time noise when DSN is absent
  disableLogger: true,
  automaticVercelMonitors: false,
});
