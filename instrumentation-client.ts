import * as Sentry from '@sentry/nextjs'

// Client Sentry init (replaces sentry.client.config.ts — Turbopack-compatible name).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [Sentry.replayIntegration()],
})

// Instruments client-side navigations (Sentry v9+).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
