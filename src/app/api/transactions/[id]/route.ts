import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEditWindowMinutes, isWithinEditWindow } from "@/lib/config";
import { TransactionType } from "@/generated/prisma/client";

type EditTransactionBody = {
  jobNumber?: string;
  quantity: number;
};

function stockDelta(type: TransactionType, qty: number) {
  if (type === "USAGE") return -qty;
  if (type === "RESTOCK" || type === "RETURN") return qty;
  return 0;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: EditTransactionBody;
  try {
    body = (await req.json()) as EditTransactionBody;
  } catch {
    return NextResponse.json("Invalid JSON body", { status: 400 });
  }

  if (!Number.isFinite(body.quantity) || body.quantity <= 0) {
    return NextResponse.json("Quantity must be a positive number", { status: 400 });
  }

  const qty = Math.floor(body.quantity);
  const jobNumber =
    body.jobNumber !== undefined
      ? (body.jobNumber || "").trim() || null
      : undefined;

  const txn = await prisma.transaction.findUnique({
    where: { id },
    include: {
      box: { select: { token: true } },
      item: { select: { name: true, minStock: true, currentStock: true } },
    },
  });

  if (!txn) {
    return NextResponse.json("Transaction not found", { status: 404 });
  }

  const windowMinutes = await getEditWindowMinutes();
  if (!isWithinEditWindow(txn.createdAt, windowMinutes)) {
    return NextResponse.json(
      { code: "EDIT_WINDOW_EXPIRED", message: "Edit window has expired." },
      { status: 403 }
    );
  }

  // Only allow editing USAGE for now (matches EngineerLogForm)
  if (txn.type !== "USAGE") {
    return NextResponse.json("Only USAGE transactions can be edited", {
      status: 400,
    });
  }

  if (jobNumber !== undefined && !jobNumber) {
    return NextResponse.json("Job number is required for USAGE", { status: 400 });
  }

  const newJobNumber = jobNumber !== undefined ? jobNumber : txn.jobNumber;
  const newQty = qty;

  const oldDelta = stockDelta(txn.type, txn.quantity);
  const newDelta = stockDelta(txn.type, newQty);
  const stockCorrection = newDelta - oldDelta;

  try {
    const [, , item] = await prisma.$transaction(async (tx) => {
      await tx.transactionEditAudit.create({
        data: {
          transactionId: id,
          oldType: txn.type,
          oldQuantity: txn.quantity,
          oldJobNumber: txn.jobNumber,
          oldDeviceId: txn.deviceId,
          newType: txn.type,
          newQuantity: newQty,
          newJobNumber: newJobNumber,
          newDeviceId: txn.deviceId,
          actorDeviceId: txn.deviceId,
        },
      });
      await tx.transaction.update({
        where: { id },
        data: {
          quantity: newQty,
          ...(jobNumber !== undefined && { jobNumber: newJobNumber }),
        },
      });
      const updatedItem =
        stockCorrection !== 0
          ? await tx.item.update({
              where: { id: txn.itemId },
              data: { currentStock: { increment: stockCorrection } },
              select: { currentStock: true, minStock: true, name: true },
            })
          : await tx.item.findUnique({
              where: { id: txn.itemId },
              select: { currentStock: true, minStock: true, name: true },
            });
      return [null, null, updatedItem] as const;
    });

    const currentStock = item?.currentStock ?? null;
    const minStock = item?.minStock ?? null;
    const itemName = item?.name ?? "Item";
    const isNegative = currentStock !== null && currentStock < 0;
    const isLow =
      currentStock !== null && minStock !== null && currentStock <= minStock;
    const warning = isNegative
      ? { code: "NEGATIVE_STOCK", message: `${itemName} stock is negative (${currentStock}).` }
      : isLow
        ? { code: "LOW_STOCK", message: `${itemName} is low (${currentStock}).` }
        : null;

    return NextResponse.json({
      ok: true,
      currentStock,
      warning,
    });
  } catch (err) {
    console.error("Transaction edit failed:", err);
    const message =
      err instanceof Error ? err.message : "Failed to update transaction";
    return NextResponse.json(
      { message, code: "EDIT_FAILED" },
      { status: 500 }
    );
  }
}
