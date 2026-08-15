import * as Sentry from '@sentry/nextjs'

// Server + edge Sentry init (replaces sentry.server.config.ts / sentry.edge.config.ts).
// Next.js calls register() once per runtime; NEXT_RUNTIME tells us which.
export async function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      enabled: !!dsn,
      tracesSampleRate: 0.1,
    })
  }
}

// Captures errors thrown in nested React Server Components (Sentry v8+).
export const onRequestError = Sentry.captureRequestError
