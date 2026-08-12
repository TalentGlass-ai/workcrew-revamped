CREATE TABLE "org_invites" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "org_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "org_invites_token_key" ON "org_invites"("token");
CREATE UNIQUE INDEX "org_invites_organization_id_email_key" ON "org_invites"("organization_id", "email");

ALTER TABLE "org_invites" ADD CONSTRAINT "org_invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
