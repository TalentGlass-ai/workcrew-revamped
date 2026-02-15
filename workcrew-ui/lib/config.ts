/**
 * Centralized configuration module for environment variables and constants
 * All environment variable access should go through this module for consistency and type safety
 */

export const config = {
  /** API Configuration */
  api: {
    /** Base URL for the WorkCrew API server */
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  },

  /** Feature Flags */
  features: {
    /** Enable analytics tracking across the application */
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    /** Enable debug mode for development */
    debugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
    /** Enable beta features for testing */
    betaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === 'true',
  },

  /** Third-party Service Configuration */
  services: {
    /** Google Analytics tracking ID */
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    /** Sentry DSN for error tracking */
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    /** Stripe publishable key for payments */
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  /** Application Constants */
  app: {
    name: 'WorkCrew',
    version: '1.0.0',
  },

  /** Environment */
  env: {
    /** Current Node.js environment */
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  /** Pagination Defaults */
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;

/** Type-safe access to config values */
export type Config = typeof config;