-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN IF NOT EXISTS "lowStockAlertsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AppConfig" ADD COLUMN IF NOT EXISTS "lowStockAlertEmail" TEXT;
