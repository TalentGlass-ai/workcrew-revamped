-- CreateTable
CREATE TABLE "proctoring_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessment_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    CONSTRAINT "proctoring_events_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proctoring_events_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proctoring_flags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessment_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "flagged_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "proctoring_flags_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proctoring_flags_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "breakdown" JSONB NOT NULL,
    "feedback" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "testResults" JSONB NOT NULL,
    "behaviorSignals" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "submissions_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "skill_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "context" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "skill_assessments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_candidate_skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "category" TEXT,
    "score" REAL,
    "confidence_score" REAL,
    "source" TEXT,
    "last_verified_at" DATETIME,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "validated_at" DATETIME,
    "validation_source" TEXT,
    CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_candidate_skills" ("candidate_id", "category", "confidence_score", "id", "last_verified_at", "score", "skill_name", "source") SELECT "candidate_id", "category", "confidence_score", "id", "last_verified_at", "score", "skill_name", "source" FROM "candidate_skills";
DROP TABLE "candidate_skills";
ALTER TABLE "new_candidate_skills" RENAME TO "candidate_skills";
CREATE UNIQUE INDEX "candidate_skills_candidate_id_skill_name_key" ON "candidate_skills"("candidate_id", "skill_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "proctoring_events_assessment_id_idx" ON "proctoring_events"("assessment_id");

-- CreateIndex
CREATE INDEX "proctoring_events_candidate_id_idx" ON "proctoring_events"("candidate_id");

-- CreateIndex
CREATE INDEX "proctoring_flags_assessment_id_idx" ON "proctoring_flags"("assessment_id");

-- CreateIndex
CREATE INDEX "proctoring_flags_candidate_id_idx" ON "proctoring_flags"("candidate_id");

-- CreateIndex
CREATE INDEX "submissions_candidate_id_idx" ON "submissions"("candidate_id");

-- CreateIndex
CREATE INDEX "submissions_question_id_idx" ON "submissions"("question_id");

-- CreateIndex
CREATE INDEX "submissions_created_at_idx" ON "submissions"("created_at");

-- CreateIndex
CREATE INDEX "skill_assessments_candidate_id_idx" ON "skill_assessments"("candidate_id");

-- CreateIndex
CREATE INDEX "skill_assessments_skill_name_idx" ON "skill_assessments"("skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_assessments_candidate_id_skill_name_source_key" ON "skill_assessments"("candidate_id", "skill_name", "source");
