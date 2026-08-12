CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "messages_application_id_created_at_idx" ON "messages"("application_id", "created_at");

ALTER TABLE "messages" ADD CONSTRAINT "messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "candidate_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
