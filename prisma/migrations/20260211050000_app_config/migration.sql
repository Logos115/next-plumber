-- CreateTable: AppConfig for edit window and low-stock alert settings
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "editWindowMinutes" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- Insert default row
INSERT INTO "AppConfig" ("id", "editWindowMinutes", "updatedAt")
VALUES ('default', 10, CURRENT_TIMESTAMP);
