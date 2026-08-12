-- Invited AI interviews have no code yet (candidate submits it on start)
ALTER TABLE "ai_interviews" ALTER COLUMN "code" DROP NOT NULL;
