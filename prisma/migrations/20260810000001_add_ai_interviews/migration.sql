-- CreateTable
CREATE TABLE "ai_interviews" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "job_id" TEXT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "analysis" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '[]',
    "evaluations" JSONB NOT NULL DEFAULT '[]',
    "final_score" DOUBLE PRECISION,
    "final_eval" JSONB,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ai_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_interviews_candidate_id_idx" ON "ai_interviews"("candidate_id");

-- AddForeignKey
ALTER TABLE "ai_interviews" ADD CONSTRAINT "ai_interviews_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interviews" ADD CONSTRAINT "ai_interviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
