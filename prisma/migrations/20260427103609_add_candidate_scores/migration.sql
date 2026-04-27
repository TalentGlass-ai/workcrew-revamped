-- CreateTable
CREATE TABLE "candidate_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "fitScore" REAL NOT NULL,
    "recommendation" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "profile_signals" REAL NOT NULL,
    "assessment_signals" REAL NOT NULL,
    "code_intelligence" REAL NOT NULL,
    "interview_signals" REAL NOT NULL,
    "behavior_signals" REAL NOT NULL,
    "signals" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,
    "signal_completeness" REAL NOT NULL,
    "confidence_factors" JSONB NOT NULL,
    "processed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recruiter_feedback" JSONB,
    "feedback_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "candidate_scores_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "candidate_scores_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "candidate_scores_candidate_id_idx" ON "candidate_scores"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_scores_job_id_idx" ON "candidate_scores"("job_id");

-- CreateIndex
CREATE INDEX "candidate_scores_fitScore_idx" ON "candidate_scores"("fitScore");

-- CreateIndex
CREATE INDEX "candidate_scores_recommendation_idx" ON "candidate_scores"("recommendation");

-- CreateIndex
CREATE INDEX "candidate_scores_processed_at_idx" ON "candidate_scores"("processed_at");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_scores_candidate_id_job_id_key" ON "candidate_scores"("candidate_id", "job_id");
