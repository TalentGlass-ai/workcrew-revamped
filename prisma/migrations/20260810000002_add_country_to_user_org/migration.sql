-- Add country (ISO 3166-1 alpha-2) to users and organizations for region-aware payment routing
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "country" TEXT;
