-- Coding-question grading needs test cases + language/difficulty on the question.
-- Without these, lib/evaluator.ts never runs the sandbox and every coding answer scores 0.
ALTER TABLE "assessment_questions"
  ADD COLUMN "test_cases" TEXT,
  ADD COLUMN "language" TEXT,
  ADD COLUMN "difficulty" TEXT;
