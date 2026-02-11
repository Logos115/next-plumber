import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEditWindowMinutes, isWithinEditWindow } from "@/lib/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const boxToken = searchParams.get("boxToken");

  if (!boxToken || typeof boxToken !== "string") {
    return NextResponse.json("Missing boxToken", { status: 400 });
  }

  const box = await prisma.box.findUnique({
    where: { token: boxToken },
    select: { id: true, active: true },
  });

  if (!box || !box.active) {
    return NextResponse.json("Box not found", { status: 404 });
  }

  const lastTxn = await prisma.transaction.findFirst({
    where: { boxId: box.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      quantity: true,
      jobNumber: true,
      createdAt: true,
      item: { select: { name: true, unit: true } },
    },
  });

  if (!lastTxn) {
    return NextResponse.json({
      ok: true,
      last: null,
      canEdit: false,
    });
  }

  const windowMinutes = await getEditWindowMinutes();
  const canEdit = isWithinEditWindow(lastTxn.createdAt, windowMinutes);

  return NextResponse.json({
    ok: true,
    last: {
      id: lastTxn.id,
      type: lastTxn.type,
      quantity: lastTxn.quantity,
      jobNumber: lastTxn.jobNumber ?? "",
      createdAt: lastTxn.createdAt.toISOString(),
      itemName: lastTxn.item.name,
      itemUnit: lastTxn.item.unit,
    },
    canEdit,
  });
}
