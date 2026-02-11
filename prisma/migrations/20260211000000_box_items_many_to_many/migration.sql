-- CreateTable: BoxItem join table (box <-> item many-to-many)
CREATE TABLE "BoxItem" (
    "id" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoxItem_pkey" PRIMARY KEY ("id")
);

-- Migrate existing Box.itemId into BoxItem (one row per box)
-- Uses substr(md5(...)) for IDs (no extension required; works on all PostgreSQL versions)
INSERT INTO "BoxItem" ("id", "boxId", "itemId", "createdAt")
SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 25), "id", "itemId", "createdAt"
FROM "Box"
WHERE "itemId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BoxItem_boxId_itemId_key" ON "BoxItem"("boxId", "itemId");
CREATE INDEX "BoxItem_boxId_idx" ON "BoxItem"("boxId");
CREATE INDEX "BoxItem_itemId_idx" ON "BoxItem"("itemId");

-- AddForeignKey
ALTER TABLE "BoxItem" ADD CONSTRAINT "BoxItem_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoxItem" ADD CONSTRAINT "BoxItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop Box.itemId (first drop FK, then column)
ALTER TABLE "Box" DROP CONSTRAINT "Box_itemId_fkey";
ALTER TABLE "Box" DROP COLUMN "itemId";
