CREATE TABLE "saved_candidates" (
  "id"           TEXT NOT NULL,
  "user_id"      TEXT NOT NULL,
  "candidate_id" TEXT NOT NULL,
  "note"         TEXT,
  "saved_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "saved_candidates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "saved_candidates_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "saved_candidates_candidate_id_fkey"
    FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "saved_candidates_user_id_candidate_id_key"
    UNIQUE ("user_id", "candidate_id")
);
