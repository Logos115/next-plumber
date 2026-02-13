-- Change Transaction.itemId FK from RESTRICT to CASCADE so items with transactions can be deleted
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_itemId_fkey";
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
