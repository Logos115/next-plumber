-- CreateTable: TransactionEditAudit for tracking edits to transactions
CREATE TABLE "TransactionEditAudit" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "oldType" "TransactionType" NOT NULL,
    "oldQuantity" INTEGER NOT NULL,
    "oldJobNumber" TEXT,
    "oldDeviceId" TEXT,
    "newType" "TransactionType" NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "newJobNumber" TEXT,
    "newDeviceId" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionEditAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionEditAudit" ADD CONSTRAINT "TransactionEditAudit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
