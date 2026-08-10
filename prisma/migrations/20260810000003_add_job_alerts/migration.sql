-- Add job_alerts table for candidate job notification preferences
CREATE TABLE IF NOT EXISTS "job_alerts" (
  "id"           TEXT NOT NULL,
  "user_id"      TEXT NOT NULL,
  "query"        TEXT,
  "location"     TEXT,
  "job_type"     TEXT,
  "skills"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "frequency"    TEXT NOT NULL DEFAULT 'daily',
  "last_sent_at" TIMESTAMP(3),
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "job_alerts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "job_alerts_user_id_idx" ON "job_alerts"("user_id");
CREATE INDEX IF NOT EXISTS "job_alerts_last_sent_at_idx" ON "job_alerts"("last_sent_at");
