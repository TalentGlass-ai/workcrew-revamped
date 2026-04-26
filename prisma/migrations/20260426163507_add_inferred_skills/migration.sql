-- CreateTable
CREATE TABLE "inferred_skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidate_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "inference_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inferred_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "inferred_skills_candidate_id_idx" ON "inferred_skills"("candidate_id");

-- CreateIndex
CREATE INDEX "inferred_skills_skill_name_idx" ON "inferred_skills"("skill_name");
