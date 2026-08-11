CREATE TABLE "interview_proposals" (
  "id"             TEXT NOT NULL,
  "application_id" TEXT NOT NULL,
  "proposed_slots" JSONB NOT NULL,
  "confirmed_slot" TIMESTAMP(3),
  "status"         TEXT NOT NULL DEFAULT 'proposed',
  "meeting_link"   TEXT,
  "notes"          TEXT,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "interview_proposals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "interview_proposals_application_id_key" UNIQUE ("application_id"),
  CONSTRAINT "interview_proposals_application_id_fkey"
    FOREIGN KEY ("application_id") REFERENCES "candidate_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
