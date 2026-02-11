import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/client";
import { logAction } from "@/lib/audit";

type CreateTransactionBody = {
  type: TransactionType;
  boxToken: string;
  itemId?: string; // required when box has multiple items
  jobNumber?: string;
  quantity: number;
  deviceId?: string;
};

function stockDelta(type: TransactionType, qty: number) {
  // USAGE decreases, RESTOCK/RETURN increases, ADJUSTMENT is handled separately
  if (type === "USAGE") return -qty;
  if (type === "RESTOCK" || type === "RETURN") return qty;
  return 0;
}

export async function POST(req: Request) {
  let body: CreateTransactionBody;

  try {
    body = (await req.json()) as CreateTransactionBody;
  } catch {
    return NextResponse.json("Invalid JSON body", { status: 400 });
  }

  // Validate basics
  if (!body.boxToken || typeof body.boxToken !== "string") {
    return NextResponse.json("Missing boxToken", { status: 400 });
  }
  if (!Number.isFinite(body.quantity) || body.quantity <= 0) {
    return NextResponse.json("Quantity must be a positive number", { status: 400 });
  }

  // MVP: integer quantities
  const qty = Math.floor(body.quantity);

  // USAGE requires job number
  if (body.type === "USAGE") {
    const job = (body.jobNumber || "").trim();
    if (!job) return NextResponse.json("Job number is required for USAGE", { status: 400 });
  }

  // Look up box and its linked items
  const box = await prisma.box.findUnique({
    where: { token: body.boxToken },
    select: {
      id: true,
      active: true,
      boxItems: { select: { itemId: true } },
    },
  });

  if (!box || !box.active) {
    return NextResponse.json("Box not found", { status: 404 });
  }

  const linkedItemIds = box.boxItems.map((bi) => bi.itemId);
  if (linkedItemIds.length === 0) {
    return NextResponse.json("Box has no items linked", { status: 400 });
  }

  let itemId: string;
  if (linkedItemIds.length === 1) {
    itemId = linkedItemIds[0];
    if (body.itemId && body.itemId !== itemId) {
      return NextResponse.json("Item does not belong to this box", { status: 400 });
    }
  } else {
    if (!body.itemId || typeof body.itemId !== "string") {
      return NextResponse.json("itemId required when box has multiple items", { status: 400 });
    }
    if (!linkedItemIds.includes(body.itemId)) {
      return NextResponse.json("Item does not belong to this box", { status: 400 });
    }
    itemId = body.itemId;
  }

  const delta = stockDelta(body.type, qty);

  try {
    // ✅ Atomic transaction: create txn + update stock together
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record (ledger)
      const created = await tx.transaction.create({
        data: {
          type: body.type,
          quantity: qty,
          jobNumber:
            body.type === "USAGE" ? (body.jobNumber || "").trim() : (body.jobNumber || null),
          deviceId: body.deviceId || null,
          boxId: box.id,
          itemId,
        },
        select: { id: true, createdAt: true, itemId: true },
      });

      // Update cached stock (fast reads)
      // For ADJUSTMENT we do nothing in MVP; you can later add explicit adjustment logic.
      if (delta !== 0) {
        await tx.item.update({
          where: { id: itemId },
          data: { currentStock: { increment: delta } },
        });
      }

      // Audit: log create (engineer)
      await logAction(
        {
          entityType: "Transaction",
          entityId: created.id,
          action: "CREATE",
          actor: { type: "ENGINEER", deviceId: body.deviceId ?? undefined },
          details: { type: body.type, quantity: qty, itemId, boxId: box.id },
        },
        tx
      );

      // Return new stock for UI/admin if needed
      const item = await tx.item.findUnique({
        where: { id: itemId },
        select: { currentStock: true, minStock: true, name: true },
      });

      const currentStock = item?.currentStock ?? null;
      const minStock = item?.minStock ?? null;

      const isNegative = currentStock !== null && currentStock < 0;
      const isLow =
        currentStock !== null &&
        minStock !== null &&
        currentStock <= minStock;

      return {
        created,
        currentStock,
        warning: isNegative
          ? { code: "NEGATIVE_STOCK", message: `${item?.name ?? "Item"} stock is negative (${currentStock}).` }
          : isLow
          ? { code: "LOW_STOCK", message: `${item?.name ?? "Item"} is low (${currentStock}).` }
          : null,
      };
    });

    return NextResponse.json(
      {
        ok: true,
        transaction: result.created,
        currentStock: result.currentStock,
        warning: result.warning,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json("Failed to save transaction", { status: 500 });
  }
}
