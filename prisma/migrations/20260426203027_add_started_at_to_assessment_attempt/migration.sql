/*
  Warnings:

  - You are about to drop the column `duration_minutes` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `generated_by_ai` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `assessments` table. All the data in the column will be lost.
  - Added the required column `candidate_id` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_taken` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Made the column `difficulty` on table `assessments` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "proctoring_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessment_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    CONSTRAINT "proctoring_logs_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "score" REAL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "assessment_attempts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "assessment_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assessment_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "score" REAL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fraud_risk_score" REAL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_attempts_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assessment_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_assessment_attempts" ("assessment_id", "candidate_id", "fraud_risk_score", "id", "score", "submitted_at") SELECT "assessment_id", "candidate_id", "fraud_risk_score", "id", "score", "submitted_at" FROM "assessment_attempts";
DROP TABLE "assessment_attempts";
ALTER TABLE "new_assessment_attempts" RENAME TO "assessment_attempts";
CREATE TABLE "new_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "job_id" TEXT,
    "score" REAL,
    "difficulty" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "language" TEXT NOT NULL,
    "time_taken" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assessments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assessments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assessments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_assessments" ("created_at", "difficulty", "id", "job_id", "organization_id") SELECT "created_at", "difficulty", "id", "job_id", "organization_id" FROM "assessments";
DROP TABLE "assessments";
ALTER TABLE "new_assessments" RENAME TO "assessments";
CREATE INDEX "assessments_candidate_id_idx" ON "assessments"("candidate_id");
CREATE INDEX "assessments_job_id_idx" ON "assessments"("job_id");
CREATE INDEX "assessments_created_at_idx" ON "assessments"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
