/*
  Warnings:

  - A unique constraint covering the columns `[from_skill_id,to_skill_id,type]` on the table `skill_relations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "skill_relations_from_skill_id_to_skill_id_type_key" ON "skill_relations"("from_skill_id", "to_skill_id", "type");
