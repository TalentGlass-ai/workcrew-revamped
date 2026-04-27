-- AlterTable
ALTER TABLE "interview_insights" ADD COLUMN "behavioral_signals_data" JSONB;
ALTER TABLE "interview_insights" ADD COLUMN "engagement_score" REAL;
ALTER TABLE "interview_insights" ADD COLUMN "face_visible_percentage" REAL;
ALTER TABLE "interview_insights" ADD COLUMN "frame_stability" REAL;
ALTER TABLE "interview_insights" ADD COLUMN "looking_away_percentage" REAL;
ALTER TABLE "interview_insights" ADD COLUMN "multiple_faces_detected" BOOLEAN;
