-- CreateTable
CREATE TABLE "job_candidate_matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "recommendation" TEXT NOT NULL,
    "score_breakdown" JSONB NOT NULL,
    "analysis" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "job_candidate_matches_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "job_candidate_matches_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "job_candidate_matches_job_id_idx" ON "job_candidate_matches"("job_id");

-- CreateIndex
CREATE INDEX "job_candidate_matches_candidate_id_idx" ON "job_candidate_matches"("candidate_id");

-- CreateIndex
CREATE INDEX "job_candidate_matches_score_idx" ON "job_candidate_matches"("score");
