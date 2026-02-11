import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";

type Body = {
  boxId: string;
  itemId: string;
  quantity: number;
  deliveryReference?: string | null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json("Unauthorized", { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json("Invalid JSON body", { status: 400 });
  }

  if (!body.boxId || typeof body.boxId !== "string") {
    return NextResponse.json("Missing or invalid boxId", { status: 400 });
  }
  if (!body.itemId || typeof body.itemId !== "string") {
    return NextResponse.json("Missing or invalid itemId", { status: 400 });
  }
  if (!Number.isFinite(body.quantity) || body.quantity <= 0) {
    return NextResponse.json("Quantity must be a positive number", { status: 400 });
  }

  const qty = Math.floor(body.quantity);
  const deliveryRef =
    body.deliveryReference !== undefined && body.deliveryReference !== null
      ? String(body.deliveryReference).trim() || null
      : null;

  const box = await prisma.box.findUnique({
    where: { id: body.boxId },
    select: {
      id: true,
      active: true,
      boxItems: { select: { itemId: true } },
    },
  });

  if (!box || !box.active) {
    return NextResponse.json("Box not found or inactive", { status: 404 });
  }

  const linkedItemIds = box.boxItems.map((bi) => bi.itemId);
  if (!linkedItemIds.includes(body.itemId)) {
    return NextResponse.json("Item is not linked to this box", { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          type: "RESTOCK",
          quantity: qty,
          jobNumber: deliveryRef,
          deviceId: null,
          boxId: box.id,
          itemId: body.itemId,
        },
        select: { id: true, createdAt: true, quantity: true },
      });

      await tx.item.update({
        where: { id: body.itemId },
        data: { currentStock: { increment: qty } },
      });

      await logAction(
        {
          entityType: "Transaction",
          entityId: created.id,
          action: "CREATE",
          actor: {
            type: "ADMIN",
            adminId: session.user?.id,
            email: session.user?.email ?? undefined,
          },
          details: { type: "RESTOCK", quantity: qty, itemId: body.itemId },
        },
        tx
      );

      const item = await tx.item.findUnique({
        where: { id: body.itemId },
        select: { name: true, currentStock: true, unit: true },
      });

      return { created, item };
    });

    return NextResponse.json(
      {
        ok: true,
        transaction: result.created,
        itemName: result.item?.name,
        newStock: result.item?.currentStock,
        unit: result.item?.unit,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json("Failed to record stock-in", { status: 500 });
  }
}
