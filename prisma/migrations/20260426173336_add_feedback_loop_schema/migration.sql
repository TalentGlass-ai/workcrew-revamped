-- CreateTable
CREATE TABLE "candidate_actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "job_title" TEXT,
    "company_id" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "candidate_actions_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "candidate_actions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "candidate_actions_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "learning_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "skill_weights" JSONB NOT NULL,
    "ranking_weights" JSONB NOT NULL,
    "inference_multipliers" JSONB,
    "total_actions" INTEGER NOT NULL DEFAULT 0,
    "successful_hires" INTEGER NOT NULL DEFAULT 0,
    "accuracy" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "candidate_actions_candidate_id_idx" ON "candidate_actions"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_actions_job_id_idx" ON "candidate_actions"("job_id");

-- CreateIndex
CREATE INDEX "candidate_actions_recruiter_id_idx" ON "candidate_actions"("recruiter_id");

-- CreateIndex
CREATE INDEX "candidate_actions_action_type_idx" ON "candidate_actions"("action_type");

-- CreateIndex
CREATE INDEX "candidate_actions_created_at_idx" ON "candidate_actions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "learning_preferences_entity_type_entity_id_key" ON "learning_preferences"("entity_type", "entity_id");
