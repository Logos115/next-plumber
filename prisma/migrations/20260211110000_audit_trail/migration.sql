-- AlterTable: add actor fields to TransactionEditAudit
ALTER TABLE "TransactionEditAudit" ADD COLUMN IF NOT EXISTS "actorAdminId" TEXT;
ALTER TABLE "TransactionEditAudit" ADD COLUMN IF NOT EXISTS "actorEmail" TEXT;
ALTER TABLE "TransactionEditAudit" ADD COLUMN IF NOT EXISTS "actorDeviceId" TEXT;

-- CreateTable: ActionAudit for create/edit/delete logging
CREATE TABLE IF NOT EXISTS "ActionAudit" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "deviceId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ActionAudit_entityType_entityId_idx" ON "ActionAudit"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ActionAudit_createdAt_idx" ON "ActionAudit"("createdAt");
