// next.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

// Re-create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Permissive where the app genuinely needs it:
// - script/connect jsdelivr + wasm: MediaPipe face-detection (proctoring/interview)
// - 'unsafe-inline' script/style: Next.js hydration + JSON-LD + Tailwind inline styles
// - 'unsafe-eval' + ws: dev only (HMR / react-refresh)
// - blob/data img·media·worker: resume/logo blobs, video capture, mediapipe workers
// ponytail: 'unsafe-inline' script-src is the weak spot; upgrade to nonces
// (middleware-injected) if strict XSS hardening is required.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // wss: for the realtime-interview WebSocket in production; ws: dev-only (HMR)
  `connect-src 'self' https: wss: blob:${isDev ? " ws:" : ""}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

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
  // Moved out of the deprecated top-level options (Sentry v10).
  // automaticVercelMonitors defaults to false, so it's simply omitted.
  webpack: {
    treeshake: { removeDebugLogging: true }, // was disableLogger: true
  },
});
